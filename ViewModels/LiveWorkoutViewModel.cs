using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using CommunityToolkit.Mvvm.Messaging;
using PlateUp.Helpers;
using PlateUp.Messages;
using PlateUp.Models;
using PlateUp.Services;
using PlateUp.ViewModels.WorkoutViewModels;

namespace PlateUp.ViewModels;

[QueryProperty(nameof(WorkoutId), "workoutId")]
public partial class LiveWorkoutViewModel : BaseViewModel,
    IRecipient<SetCompletedMessage>,
    IRecipient<ExercisesSelectedMessage>
{
    private readonly IWorkoutRepository _workoutRepo;
    private readonly IWorkoutExerciseRepository _workoutExerciseRepo;
    private readonly ISetRepository _setRepo;
    private readonly IExerciseRepository _exerciseRepo;
    private readonly IPersonalRecordRepository _prRepo;
    private readonly IUserRepository _userRepo;
    private readonly ISettingsService _settings;
    private readonly IWorkoutSessionService _session;
    private readonly ITimerNotificationService? _timerNotification;

    private IDispatcherTimer? _workoutTimer;
    private IDispatcherTimer? _restTimer;
    private DateTime _workoutStartTime;
    private DateTime _restTimerEndTime;
    private int _restTimerTotalSeconds;
    private Workout? _currentWorkout;
    private bool _initialized;

    [ObservableProperty]
    private int _workoutId;

    [ObservableProperty]
    private string _workoutTitle = "Workout";

    [ObservableProperty]
    private string _elapsedTimeText = "00:00:00";

    [ObservableProperty]
    private ObservableCollection<ExerciseGroupViewModel> _exercises = [];

    [ObservableProperty]
    private bool _isRestTimerVisible;

    [ObservableProperty]
    private bool _isRestTimerRunning;

    [ObservableProperty]
    private int _restTimerSecondsRemaining;

    [ObservableProperty]
    private string _restTimerText = "0:00";

    [ObservableProperty]
    private double _restTimerProgress = 1.0;

    public LiveWorkoutViewModel(
        IWorkoutRepository workoutRepo,
        IWorkoutExerciseRepository workoutExerciseRepo,
        ISetRepository setRepo,
        IExerciseRepository exerciseRepo,
        IPersonalRecordRepository prRepo,
        IUserRepository userRepo,
        ISettingsService settings,
        IWorkoutSessionService session,
        ITimerNotificationService? timerNotification = null)
    {
        _workoutRepo = workoutRepo;
        _workoutExerciseRepo = workoutExerciseRepo;
        _setRepo = setRepo;
        _exerciseRepo = exerciseRepo;
        _prRepo = prRepo;
        _userRepo = userRepo;
        _settings = settings;
        _session = session;
        _timerNotification = timerNotification;
        Title = "Workout";
    }

    public override async Task InitializeAsync()
    {
        // If returning to same workout (e.g. from minimized), skip re-init
        if (_initialized && _currentWorkout?.Id == WorkoutId) return;

        // If starting a different workout, clean up previous
        if (_initialized)
            Cleanup();

        _initialized = true;

        WeakReferenceMessenger.Default.Register<SetCompletedMessage>(this);
        WeakReferenceMessenger.Default.Register<ExercisesSelectedMessage>(this);

        await ExecuteAsync(async () =>
        {
            _currentWorkout = await _workoutRepo.GetWorkoutByIdAsync(WorkoutId);
            if (_currentWorkout is null) return;

            WorkoutTitle = _currentWorkout.Title;
            _workoutStartTime = _currentWorkout.StartTime;

            var workoutExercises = await _workoutExerciseRepo.GetByWorkoutIdAsync(WorkoutId);
            var groups = new ObservableCollection<ExerciseGroupViewModel>();

            foreach (var we in workoutExercises)
            {
                var group = await BuildExerciseGroup(we);
                if (group is not null)
                    groups.Add(group);
            }

            Exercises = groups;
            StartWorkoutTimer();

            // Start session tracking for mini bar
            _session.Start(WorkoutId, WorkoutTitle, _workoutStartTime);
        });
    }

    private async Task<ExerciseGroupViewModel?> BuildExerciseGroup(WorkoutExercise we)
    {
        var exercise = await _exerciseRepo.GetByIdAsync(we.ExerciseId);
        if (exercise is null) return null;

        var sets = await _setRepo.GetByWorkoutExerciseIdAsync(we.Id);
        var ghostValues = await _setRepo.GetPreviousResultsAsync(we.ExerciseId);

        var group = new ExerciseGroupViewModel
        {
            DatabaseWorkoutExerciseId = we.Id,
            ExerciseName = exercise.Name,
            ExerciseId = exercise.Id,
            MuscleGroup = exercise.MuscleGroupEnum,
            Notes = we.Notes ?? string.Empty,
            RestTimerSeconds = we.RestTimerSeconds > 0 ? we.RestTimerSeconds : _settings.DefaultRestTimerSeconds
        };

        var setVms = new ObservableCollection<SetRowViewModel>();

        if (sets.Count > 0)
        {
            for (int i = 0; i < sets.Count; i++)
            {
                var ghost = i < ghostValues.Count ? ghostValues[i] : null;
                setVms.Add(CreateSetRow(i + 1, sets[i], ghost));
            }
        }
        else
        {
            // New exercise with no sets — add 3 default sets
            for (int i = 0; i < 3; i++)
            {
                var ghost = i < ghostValues.Count ? ghostValues[i] : null;
                setVms.Add(CreateSetRow(i + 1, null, ghost));
            }
        }

        group.Sets = setVms;
        return group;
    }

    private static SetRowViewModel CreateSetRow(int number, WorkoutSet? existingSet, WorkoutSet? ghost)
    {
        var row = new SetRowViewModel
        {
            SetNumber = number,
            DatabaseId = existingSet?.Id ?? 0,
        };

        if (existingSet is not null)
        {
            row.SetType = (SetType)existingSet.SetType;
            if (existingSet.Weight > 0)
                row.WeightText = existingSet.Weight.ToString("0.##");
            if (existingSet.Reps > 0)
                row.RepsText = existingSet.Reps.ToString();
            row.IsCompleted = existingSet.IsCompleted;
        }

        if (ghost is not null)
        {
            row.PreviousWeight = ghost.Weight;
            row.PreviousReps = ghost.Reps;
            row.PreviousResult = $"{ghost.Weight:0.##}kg × {ghost.Reps}";
        }

        return row;
    }

    // ── Timers ──

    private void StartWorkoutTimer()
    {
        _workoutTimer = Application.Current?.Dispatcher.CreateTimer();
        if (_workoutTimer is null) return;

        _workoutTimer.Interval = TimeSpan.FromSeconds(1);
        _workoutTimer.Tick += (_, _) =>
        {
            ElapsedTimeText = (DateTime.Now - _workoutStartTime).ToString(@"hh\:mm\:ss");
        };
        _workoutTimer.Start();
    }

    private void StartRestTimer(int seconds)
    {
        StopRestTimer();

        _restTimerTotalSeconds = seconds;
        _restTimerEndTime = DateTime.Now.AddSeconds(seconds);
        RestTimerSecondsRemaining = seconds;
        UpdateRestTimerDisplay();
        IsRestTimerVisible = true;
        IsRestTimerRunning = true;

        // Schedule background notification
        _timerNotification?.ScheduleRestTimerNotification(seconds);

        _restTimer = Application.Current?.Dispatcher.CreateTimer();
        if (_restTimer is null) return;

        _restTimer.Interval = TimeSpan.FromSeconds(1);
        _restTimer.Tick += (_, _) =>
        {
            // 8b. Recalibrate from DateTime (handles app background)
            var remaining = (int)(_restTimerEndTime - DateTime.Now).TotalSeconds;
            RestTimerSecondsRemaining = Math.Max(0, remaining);
            UpdateRestTimerDisplay();

            if (RestTimerSecondsRemaining <= 0)
            {
                StopRestTimer();
                IsRestTimerVisible = false;
                IsRestTimerRunning = false;
                HapticHelper.Heavy();
            }
        };
        _restTimer.Start();
    }

    private void StopRestTimer()
    {
        _restTimer?.Stop();
        _restTimer = null;
        _timerNotification?.CancelRestTimerNotification();
    }

    private void UpdateRestTimerDisplay()
    {
        var mins = RestTimerSecondsRemaining / 60;
        var secs = RestTimerSecondsRemaining % 60;
        RestTimerText = $"{mins}:{secs:D2}";
        RestTimerProgress = _restTimerTotalSeconds > 0
            ? (double)RestTimerSecondsRemaining / _restTimerTotalSeconds
            : 0;
    }

    // ── Messages ──

    public void Receive(SetCompletedMessage message)
    {
        var setVm = message.Value;

        HapticHelper.Tick();

        if (setVm.IsCompleted && _settings.AutoStartRestTimer)
        {
            // Find which exercise group this set belongs to
            var group = Exercises.FirstOrDefault(g => g.Sets.Contains(setVm));
            var seconds = group?.RestTimerSeconds ?? _settings.DefaultRestTimerSeconds;
            StartRestTimer(seconds);
        }
    }

    public void Receive(ExercisesSelectedMessage message)
    {
        var selected = message.Value;
        _ = AddSelectedExercises(selected);
    }

    private async Task AddSelectedExercises(List<Exercise> selected)
    {
        foreach (var exercise in selected)
        {
            var we = new WorkoutExercise
            {
                WorkoutId = WorkoutId,
                ExerciseId = exercise.Id,
                OrderIndex = Exercises.Count,
                RestTimerSeconds = _settings.DefaultRestTimerSeconds
            };
            var weId = await _workoutExerciseRepo.SaveAsync(we);
            we.Id = weId;

            var group = await BuildExerciseGroup(we);
            if (group is not null)
                Exercises.Add(group);
        }
    }

    // ── Commands ──

    [RelayCommand]
    private async Task ViewExerciseDetail(ExerciseGroupViewModel group)
    {
        await Shell.Current.GoToAsync($"exercisedetail?exerciseId={group.ExerciseId}");
    }

    [RelayCommand]
    private async Task AddExercise()
    {
        await Shell.Current.GoToAsync("exercisepicker");
    }

    [RelayCommand]
    private async Task RemoveExercise(ExerciseGroupViewModel group)
    {
        var confirmed = await Shell.Current.DisplayAlertAsync(
            "Remove Exercise",
            $"Remove {group.ExerciseName}?",
            "Remove", "Cancel");

        if (!confirmed) return;

        await _workoutExerciseRepo.DeleteAsync(group.DatabaseWorkoutExerciseId);
        Exercises.Remove(group);
    }

    [RelayCommand]
    private async Task ShowExerciseOptions(ExerciseGroupViewModel group)
    {
        var action = await Helpers.StyledActionSheet.ShowAsync(
            Shell.Current.CurrentPage, group.ExerciseName, "Add Note", "Replace Exercise", "Remove Exercise");

        switch (action)
        {
            case "Add Note":
                group.ShowNotes = true;
                break;
            case "Replace Exercise":
                await ReplaceExercise(group);
                break;
            case "Remove Exercise":
                await RemoveExercise(group);
                break;
        }
    }

    private async Task ReplaceExercise(ExerciseGroupViewModel group)
    {
        // Navigate to picker — when exercise is selected, it will replace
        await Shell.Current.GoToAsync("exercisepicker");
    }

    [RelayCommand]
    private void SkipRestTimer()
    {
        StopRestTimer();
        IsRestTimerVisible = false;
        IsRestTimerRunning = false;
    }

    [RelayCommand]
    private void HideRestTimerOverlay()
    {
        // Hide overlay but keep timer running — mini-timer stays visible
        IsRestTimerVisible = false;
    }

    [RelayCommand]
    private void ShowRestTimerOverlay()
    {
        if (IsRestTimerRunning)
            IsRestTimerVisible = true;
    }

    [RelayCommand]
    private void SetRestTimerPreset(string secondsStr)
    {
        if (!int.TryParse(secondsStr, out var seconds)) return;
        StartRestTimer(seconds);
    }

    [RelayCommand]
    private void AdjustRestTimer(string secondsStr)
    {
        if (!int.TryParse(secondsStr, out var seconds)) return;

        RestTimerSecondsRemaining = Math.Max(0, RestTimerSecondsRemaining + seconds);
        _restTimerTotalSeconds = Math.Max(_restTimerTotalSeconds, RestTimerSecondsRemaining);
        UpdateRestTimerDisplay();
    }

    [RelayCommand]
    private async Task FinishWorkout()
    {
        var confirmed = await Shell.Current.DisplayAlertAsync(
            "Finish Workout",
            "Finish this workout?",
            "Finish", "Cancel");

        if (!confirmed) return;

        await ExecuteAsync(async () =>
        {
            double totalVolume = 0;
            int totalSets = 0;
            int prCount = 0;
            bool includesLegs = false;

            foreach (var group in Exercises)
            {
                // Save notes
                if (!string.IsNullOrWhiteSpace(group.Notes))
                {
                    // Update the workout exercise notes in DB
                    var we = new WorkoutExercise
                    {
                        Id = group.DatabaseWorkoutExerciseId,
                        WorkoutId = WorkoutId,
                        ExerciseId = group.ExerciseId,
                        Notes = group.Notes,
                        RestTimerSeconds = group.RestTimerSeconds,
                        OrderIndex = Exercises.IndexOf(group)
                    };
                    await _workoutExerciseRepo.SaveAsync(we);
                }

                double exerciseMaxWeight = 0;
                int exerciseMaxReps = 0;

                foreach (var set in group.Sets)
                {
                    double.TryParse(set.WeightText, System.Globalization.NumberStyles.Any,
                        System.Globalization.CultureInfo.InvariantCulture, out var weight);
                    int.TryParse(set.RepsText, out var reps);

                    var dbSet = new WorkoutSet
                    {
                        Id = set.DatabaseId,
                        WorkoutExerciseId = group.DatabaseWorkoutExerciseId,
                        OrderIndex = set.SetNumber - 1,
                        SetType = (int)set.SetType,
                        Weight = weight,
                        Reps = reps,
                        IsCompleted = set.IsCompleted
                    };
                    var savedId = await _setRepo.SaveAsync(dbSet);
                    set.DatabaseId = savedId;

                    if (set.IsCompleted)
                    {
                        totalVolume += weight * reps;
                        totalSets++;

                        if (weight > exerciseMaxWeight)
                        {
                            exerciseMaxWeight = weight;
                            exerciseMaxReps = reps;
                        }
                    }
                }

                // Check PRs for this exercise
                if (exerciseMaxWeight > 0)
                {
                    var isPr = await _prRepo.CheckAndSaveAsync(
                        group.ExerciseId, WorkoutId, exerciseMaxWeight, exerciseMaxReps);
                    if (isPr)
                    {
                        prCount++;
                        HapticHelper.Heavy();
                    }
                }

                if (group.MuscleGroup == MuscleGroup.Legs)
                    includesLegs = true;
            }

            // Update workout
            if (_currentWorkout is not null)
            {
                _currentWorkout.EndTime = DateTime.Now;
                _currentWorkout.TotalVolume = totalVolume;
                _currentWorkout.TotalSets = totalSets;
                _currentWorkout.Title = WorkoutTitle;
                await _workoutRepo.SaveWorkoutAsync(_currentWorkout);
            }

            // Calculate and add EXP
            var durationMinutes = _currentWorkout is not null
                ? (int)(DateTime.Now - _currentWorkout.StartTime).TotalMinutes
                : 0;
            var exp = Algorithms.CalculateExp(totalVolume, durationMinutes, prCount, includesLegs);
            await _userRepo.AddExpAsync(exp);

            Cleanup();

            HapticHelper.Success();
            await Shell.Current.GoToAsync($"workoutsummary?workoutId={WorkoutId}");
        });
    }

    [RelayCommand]
    private async Task CancelWorkout()
    {
        var confirmed = await Shell.Current.DisplayAlertAsync(
            "Discard Workout",
            "Discard this workout? All data will be lost.",
            "Discard", "Cancel");

        if (!confirmed) return;

        Cleanup();

        await _workoutRepo.DeleteWorkoutAsync(WorkoutId);
        await Shell.Current.GoToAsync("..");
    }

    public override void OnDisappearing()
    {
        // Don't unregister messages here — ExercisePicker modal triggers OnDisappearing
        // and we need to keep listening for ExercisesSelectedMessage.
        // Cleanup happens in Cleanup() called from FinishWorkout/CancelWorkout.
    }

    [RelayCommand]
    private async Task MinimizeWorkout()
    {
        await Shell.Current.GoToAsync("..");
    }

    partial void OnWorkoutTitleChanged(string value)
    {
        if (_session.IsActive)
            _session.WorkoutTitle = value;
    }

    private void Cleanup()
    {
        WeakReferenceMessenger.Default.UnregisterAll(this);
        _workoutTimer?.Stop();
        StopRestTimer();
        _session.Stop();
        _initialized = false;
    }
}
