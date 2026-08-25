using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using CommunityToolkit.Mvvm.Messaging;
using PlateUp.Messages;
using PlateUp.Models;
using PlateUp.Services;
using PlateUp.ViewModels.DisplayModels;

namespace PlateUp.ViewModels;

public partial class WorkoutHubViewModel : BaseViewModel,
    IRecipient<RoutineSavedMessage>
{
    private readonly IWorkoutRepository _workoutRepo;
    private readonly IWorkoutExerciseRepository _workoutExerciseRepo;
    private readonly IExerciseRepository _exerciseRepo;
    private readonly ISetRepository _setRepo;

    [ObservableProperty]
    private ObservableCollection<WorkoutTemplateDisplayModel> _routines = [];

    [ObservableProperty]
    private string? _lastWorkoutTitle;

    [ObservableProperty]
    private bool _hasLastWorkout;

    private int _lastWorkoutId;
    private bool _isInitialized;

    public WorkoutHubViewModel(
        IWorkoutRepository workoutRepo,
        IWorkoutExerciseRepository workoutExerciseRepo,
        IExerciseRepository exerciseRepo,
        ISetRepository setRepo)
    {
        Title = "Workout";
        _workoutRepo = workoutRepo;
        _workoutExerciseRepo = workoutExerciseRepo;
        _exerciseRepo = exerciseRepo;
        _setRepo = setRepo;

        WeakReferenceMessenger.Default.Register<RoutineSavedMessage>(this);
    }

    public override async Task InitializeAsync()
    {
        if (_isInitialized && !IsRefreshing) return;

        await ExecuteAsync(async () =>
        {
            var templates = await _workoutRepo.GetAllTemplatesAsync();
            var allExercises = (await _exerciseRepo.GetAllAsync()).ToDictionary(e => e.Id);
            var displayModels = new List<WorkoutTemplateDisplayModel>();

            foreach (var template in templates)
            {
                var exercises = await _workoutExerciseRepo.GetByWorkoutIdAsync(template.Id);
                var exerciseNames = new List<string>();

                foreach (var we in exercises)
                {
                    if (allExercises.TryGetValue(we.ExerciseId, out var exercise))
                        exerciseNames.Add(exercise.Name);
                }

                displayModels.Add(new WorkoutTemplateDisplayModel
                {
                    WorkoutId = template.Id,
                    Title = template.Title,
                    ExerciseNames = exerciseNames,
                    ExerciseCount = exercises.Count,
                    LastUsed = template.StartTime
                });
            }

            Routines = new ObservableCollection<WorkoutTemplateDisplayModel>(displayModels);

            // Find last completed workout for "Repeat" feature
            var allWorkouts = await _workoutRepo.GetAllWorkoutsAsync();
            var lastCompleted = allWorkouts
                .Where(w => w.EndTime.HasValue && !w.IsTemplate)
                .OrderByDescending(w => w.StartTime)
                .FirstOrDefault();

            if (lastCompleted is not null)
            {
                _lastWorkoutId = lastCompleted.Id;
                LastWorkoutTitle = lastCompleted.Title;
                HasLastWorkout = true;
            }

            _isInitialized = true;
        });

        IsRefreshing = false;
    }

    public void Receive(RoutineSavedMessage message)
    {
        _isInitialized = false;
        MainThread.BeginInvokeOnMainThread(async () => await InitializeAsync());
    }

    public override void OnDisappearing()
    {
        WeakReferenceMessenger.Default.Unregister<RoutineSavedMessage>(this);
    }

    [RelayCommand]
    private async Task RepeatLastWorkout()
    {
        if (!HasLastWorkout) return;
        await ExecuteAsync(async () =>
        {
            var newId = await _workoutRepo.DuplicateAsWorkoutAsync(_lastWorkoutId);
            if (newId > 0)
                await Shell.Current.GoToAsync($"liveworkout?workoutId={newId}");
        });
    }

    [RelayCommand]
    private async Task StartEmptyWorkout()
    {
        await ExecuteAsync(async () =>
        {
            var workout = new Workout
            {
                Title = "Workout",
                IsTemplate = false,
                StartTime = DateTime.Now
            };

            var id = await _workoutRepo.SaveWorkoutAsync(workout);
            await Shell.Current.GoToAsync($"liveworkout?workoutId={id}");
        });
    }

    [RelayCommand]
    private async Task StartRoutine(WorkoutTemplateDisplayModel routine)
    {
        await ExecuteAsync(async () =>
        {
            var workout = new Workout
            {
                Title = routine.Title,
                IsTemplate = false,
                StartTime = DateTime.Now,
                SourceTemplateId = routine.WorkoutId
            };

            var workoutId = await _workoutRepo.SaveWorkoutAsync(workout);

            // Copy exercises and sets from template
            var templateExercises = await _workoutExerciseRepo.GetByWorkoutIdAsync(routine.WorkoutId);
            foreach (var te in templateExercises)
            {
                var newExercise = new WorkoutExercise
                {
                    WorkoutId = workoutId,
                    ExerciseId = te.ExerciseId,
                    OrderIndex = te.OrderIndex,
                    SupersetGroupId = te.SupersetGroupId,
                    Notes = te.Notes,
                    RestTimerSeconds = te.RestTimerSeconds
                };
                var newExerciseId = await _workoutExerciseRepo.SaveAsync(newExercise);

                var templateSets = await _setRepo.GetByWorkoutExerciseIdAsync(te.Id);
                foreach (var ts in templateSets)
                {
                    var newSet = new WorkoutSet
                    {
                        WorkoutExerciseId = newExerciseId,
                        OrderIndex = ts.OrderIndex,
                        SetType = ts.SetType,
                        Weight = ts.Weight,
                        Reps = ts.Reps,
                        RPE = ts.RPE
                    };
                    await _setRepo.SaveAsync(newSet);
                }
            }

            await Shell.Current.GoToAsync($"liveworkout?workoutId={workoutId}");
        });
    }

    [RelayCommand]
    private async Task CreateRoutine()
    {
        await Shell.Current.GoToAsync("routineeditor");
    }

    [RelayCommand]
    private async Task EditRoutine(WorkoutTemplateDisplayModel routine)
    {
        await Shell.Current.GoToAsync($"routineeditor?workoutId={routine.WorkoutId}");
    }

    [RelayCommand]
    private async Task DeleteRoutine(WorkoutTemplateDisplayModel routine)
    {
        var confirmed = await Shell.Current.DisplayAlertAsync(
            "Delete Routine",
            $"Are you sure you want to delete \"{routine.Title}\"?",
            "Delete",
            "Cancel");

        if (!confirmed) return;

        await ExecuteAsync(async () =>
        {
            await _workoutRepo.DeleteWorkoutAsync(routine.WorkoutId);
            Routines.Remove(routine);
        });
    }

    [RelayCommand]
    private async Task DuplicateRoutine(WorkoutTemplateDisplayModel routine)
    {
        await ExecuteAsync(async () =>
        {
            var newId = await _workoutRepo.DuplicateAsTemplateAsync(routine.WorkoutId);
            if (newId == 0) return;

            var newWorkout = await _workoutRepo.GetWorkoutByIdAsync(newId);
            if (newWorkout is null) return;

            var exercises = await _workoutExerciseRepo.GetByWorkoutIdAsync(newId);
            var exerciseNames = new List<string>();
            foreach (var we in exercises)
            {
                var exercise = await _exerciseRepo.GetByIdAsync(we.ExerciseId);
                if (exercise is not null)
                    exerciseNames.Add(exercise.Name);
            }

            Routines.Add(new WorkoutTemplateDisplayModel
            {
                WorkoutId = newId,
                Title = newWorkout.Title,
                ExerciseNames = exerciseNames,
                ExerciseCount = exercises.Count,
                LastUsed = newWorkout.StartTime
            });
        });
    }

    [RelayCommand]
    private async Task ShowRoutineOptions(WorkoutTemplateDisplayModel routine)
    {
        var action = await Helpers.StyledActionSheet.ShowAsync(
            Shell.Current.CurrentPage, routine.Title, "Edit", "Duplicate", "Share", "Delete");

        switch (action)
        {
            case "Edit":
                await EditRoutine(routine);
                break;
            case "Duplicate":
                await DuplicateRoutine(routine);
                break;
            case "Share":
                await ShareRoutine(routine);
                break;
            case "Delete":
                await DeleteRoutine(routine);
                break;
        }
    }

    [RelayCommand]
    private async Task ShareRoutine(WorkoutTemplateDisplayModel routine)
    {
        await ExecuteAsync(async () =>
        {
            var workout = await _workoutRepo.GetWorkoutByIdAsync(routine.WorkoutId);
            if (workout is null) return;

            var exercises = await _workoutExerciseRepo.GetByWorkoutIdAsync(routine.WorkoutId);
            var lines = new List<string>
            {
                $"🏋️ {routine.Title}",
                $"{routine.ExerciseCount} exercises",
                ""
            };

            foreach (var we in exercises)
            {
                var exercise = await _exerciseRepo.GetByIdAsync(we.ExerciseId);
                if (exercise is null) continue;

                var sets = await _setRepo.GetByWorkoutExerciseIdAsync(we.Id);
                var setsSummary = sets.Count > 0
                    ? $"{sets.Count} sets"
                    : "";
                lines.Add($"• {exercise.Name} — {setsSummary}");
            }

            lines.Add("");
            lines.Add("Shared from PlateUp");

            var text = string.Join("\n", lines);
            await Share.Default.RequestAsync(new ShareTextRequest
            {
                Text = text,
                Title = $"Share: {routine.Title}"
            });
        });
    }
}
