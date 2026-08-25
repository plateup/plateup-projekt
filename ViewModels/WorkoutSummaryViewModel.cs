using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using PlateUp.Helpers;
using PlateUp.Models;
using PlateUp.Services;
using PlateUp.ViewModels.DisplayModels;


namespace PlateUp.ViewModels;

[QueryProperty(nameof(WorkoutId), "workoutId")]
[QueryProperty(nameof(IsReadOnly), "readonly")]
public partial class WorkoutSummaryViewModel : BaseViewModel
{
    private readonly IWorkoutRepository _workoutRepo;
    private readonly IWorkoutExerciseRepository _workoutExerciseRepo;
    private readonly ISetRepository _setRepo;
    private readonly IExerciseRepository _exerciseRepo;
    private readonly IPersonalRecordRepository _prRepo;
    private readonly IUserRepository _userRepo;
    private readonly ICloudSyncService _cloudSync;

    private Workout? _workout;

    [ObservableProperty] private int _workoutId;
    [ObservableProperty] private string _workoutTitle = string.Empty;
    [ObservableProperty] private string _workoutDate = string.Empty;
    [ObservableProperty] private string _duration = string.Empty;
    [ObservableProperty] private string _totalVolume = string.Empty;
    [ObservableProperty] private int _totalSets;
    [ObservableProperty] private int _prCount;
    [ObservableProperty] private ObservableCollection<SummaryExerciseDisplay> _exercises = [];
    [ObservableProperty] private ObservableCollection<MuscleGroupSplit> _muscleSplit = [];
    [ObservableProperty] private bool _isPublic = true;
    [ObservableProperty] private string _description = string.Empty;
    [ObservableProperty] private int _earnedExp;
    [ObservableProperty] private bool _isReadOnly;

    public WorkoutSummaryViewModel(
        IWorkoutRepository workoutRepo,
        IWorkoutExerciseRepository workoutExerciseRepo,
        ISetRepository setRepo,
        IExerciseRepository exerciseRepo,
        IPersonalRecordRepository prRepo,
        IUserRepository userRepo,
        ICloudSyncService cloudSync)
    {
        _workoutRepo = workoutRepo;
        _workoutExerciseRepo = workoutExerciseRepo;
        _setRepo = setRepo;
        _exerciseRepo = exerciseRepo;
        _prRepo = prRepo;
        _userRepo = userRepo;
        _cloudSync = cloudSync;
        Title = "Summary";
    }

    public override async Task InitializeAsync()
    {
        await ExecuteAsync(async () =>
        {
            _workout = await _workoutRepo.GetWorkoutByIdAsync(WorkoutId);
            if (_workout is null) return;

            WorkoutTitle = _workout.Title;
            WorkoutDate = _workout.StartTime.ToString("dddd, MMMM dd, yyyy");
            IsPublic = _workout.IsPublic;
            Description = _workout.Description ?? string.Empty;

            // Duration
            if (_workout.EndTime.HasValue)
            {
                var span = _workout.EndTime.Value - _workout.StartTime;
                Duration = span.TotalHours >= 1
                    ? $"{(int)span.TotalHours}h {span.Minutes}m"
                    : $"{(int)span.TotalMinutes}m";
            }

            // Load exercises and sets
            var workoutExercises = await _workoutExerciseRepo.GetByWorkoutIdAsync(WorkoutId);
            var exerciseDisplays = new List<SummaryExerciseDisplay>();
            var muscleSetCounts = new Dictionary<MuscleGroup, int>();
            double totalVol = 0;
            int totalCompletedSets = 0;
            int prTotal = 0;
            bool includesLegs = false;

            foreach (var we in workoutExercises)
            {
                var exercise = await _exerciseRepo.GetByIdAsync(we.ExerciseId);
                if (exercise is null) continue;

                var sets = await _setRepo.GetByWorkoutExerciseIdAsync(we.Id);
                var prs = await _prRepo.GetByExerciseIdAsync(exercise.Id);
                var workoutPrs = prs.Where(p => p.WorkoutId == WorkoutId).ToList();

                var mg = exercise.MuscleGroupEnum;
                if (mg == MuscleGroup.Legs) includesLegs = true;

                var setDisplays = new List<SummarySetDisplay>();
                double maxWeight = 0;
                int maxReps = 0;

                for (int i = 0; i < sets.Count; i++)
                {
                    var s = sets[i];
                    if (!s.IsCompleted) continue;

                    totalCompletedSets++;
                    totalVol += s.Weight * s.Reps;

                    var setType = (SetType)s.SetType;
                    var label = setType switch
                    {
                        SetType.Warmup => "W",
                        SetType.Drop => "D",
                        SetType.Failure => "F",
                        _ => $"Set {i + 1}"
                    };

                    var isPr = workoutPrs.Any(p =>
                        p.RecordType == (int)RecordType.MaxWeight && Math.Abs(p.Value - s.Weight) < 0.01);

                    setDisplays.Add(new SummarySetDisplay
                    {
                        SetLabel = label,
                        WeightReps = $"{s.Weight:0.##}kg × {s.Reps}",
                        IsPR = isPr
                    });

                    if (s.Weight > maxWeight)
                    {
                        maxWeight = s.Weight;
                        maxReps = s.Reps;
                    }

                    // Track muscle group sets
                    if (!muscleSetCounts.ContainsKey(mg))
                        muscleSetCounts[mg] = 0;
                    muscleSetCounts[mg]++;
                }

                var hasPr = workoutPrs.Count > 0;
                if (hasPr) prTotal += workoutPrs.Count;

                exerciseDisplays.Add(new SummaryExerciseDisplay
                {
                    ExerciseName = exercise.Name,
                    MuscleGroup = mg,
                    Sets = setDisplays,
                    HasPR = hasPr
                });
            }

            Exercises = new ObservableCollection<SummaryExerciseDisplay>(exerciseDisplays);
            TotalSets = totalCompletedSets;
            TotalVolume = totalVol >= 1000
                ? $"{totalVol / 1000:0.#} tons"
                : $"{totalVol:0.#} kg";
            PrCount = prTotal;

            // Muscle split
            var splits = muscleSetCounts
                .OrderByDescending(kv => kv.Value)
                .Select(kv => new MuscleGroupSplit
                {
                    MuscleGroupName = GetMuscleGroupName(kv.Key),
                    Color = GetMuscleGroupColor(kv.Key),
                    SetCount = kv.Value,
                    Percentage = totalCompletedSets > 0
                        ? Math.Round((double)kv.Value / totalCompletedSets * 100, 1)
                        : 0
                })
                .ToList();
            MuscleSplit = new ObservableCollection<MuscleGroupSplit>(splits);

            // EXP
            var durationMin = _workout.EndTime.HasValue
                ? (int)(_workout.EndTime.Value - _workout.StartTime).TotalMinutes
                : 0;
            EarnedExp = Algorithms.CalculateExp(totalVol, durationMin, prTotal, includesLegs);

        });
    }

    [RelayCommand]
    private async Task SaveWorkout()
    {
        if (_workout is null) return;

        await ExecuteAsync(async () =>
        {
            _workout.Title = WorkoutTitle;
            _workout.IsPublic = IsPublic;
            _workout.Description = string.IsNullOrWhiteSpace(Description) ? null : Description;
            await _workoutRepo.SaveWorkoutAsync(_workout);

            // Publish to cloud if public and logged in
            if (IsPublic && _cloudSync.IsLoggedIn && _cloudSync.IsOnline)
            {
                try
                {
                    var exerciseSummary = string.Join(" · ", Exercises.Take(4).Select(e => e.ExerciseName));
                    var durationMin = _workout.EndTime.HasValue
                        ? (int)(_workout.EndTime.Value - _workout.StartTime).TotalMinutes
                        : 0;
                    await _cloudSync.PublishWorkoutAsync(
                        _workout.Title, _workout.Description, durationMin,
                        _workout.TotalVolume, TotalSets, exerciseSummary, PrCount);
                }
                catch { /* cloud publish failure is non-critical */ }
            }

            HapticHelper.Success();
            await Shell.Current.GoToAsync("//workout");
        });
    }

    [RelayCommand]
    private async Task GoBack()
    {
        await Shell.Current.GoToAsync("..");
    }

    [RelayCommand]
    private async Task ShareWorkout()
    {
        var lines = new List<string>
        {
            $"🏋️ {WorkoutTitle}",
            $"⏱ {Duration} · 💪 {TotalVolume} · ✅ {TotalSets} sets"
        };

        if (PrCount > 0)
            lines.Add($"🏆 {PrCount} Personal Records!");

        lines.Add("");
        foreach (var ex in Exercises)
        {
            var prTag = ex.HasPR ? " 🏆" : "";
            lines.Add($"• {ex.ExerciseName}{prTag}");
        }

        lines.Add("");
        lines.Add("Shared from PlateUp");

        await Share.Default.RequestAsync(new ShareTextRequest
        {
            Text = string.Join("\n", lines),
            Title = "Share Workout"
        });
    }

    private static string GetMuscleGroupName(MuscleGroup mg) => mg switch
    {
        MuscleGroup.Chest => "Chest",
        MuscleGroup.Back => "Back",
        MuscleGroup.Shoulders => "Shoulders",
        MuscleGroup.Biceps => "Biceps",
        MuscleGroup.Triceps => "Triceps",
        MuscleGroup.Legs => "Legs",
        MuscleGroup.Core => "Core",
        MuscleGroup.Cardio => "Cardio",
        _ => "Other"
    };

    private static Color GetMuscleGroupColor(MuscleGroup mg)
    {
        var key = mg switch
        {
            MuscleGroup.Chest => "MuscleChest",
            MuscleGroup.Back => "MuscleBack",
            MuscleGroup.Shoulders => "MuscleShoulders",
            MuscleGroup.Biceps => "MuscleBiceps",
            MuscleGroup.Triceps => "MuscleTriceps",
            MuscleGroup.Legs => "MuscleLegs",
            MuscleGroup.Core => "MuscleCore",
            MuscleGroup.Cardio => "MuscleCardio",
            _ => "MuscleChest"
        };

        if (Application.Current?.Resources.TryGetValue(key, out var color) == true && color is Color c)
            return c;
        return Colors.Gray;
    }
}
