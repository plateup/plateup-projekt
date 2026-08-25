using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using PlateUp.Helpers;
using PlateUp.Models;
using PlateUp.Services;

namespace PlateUp.ViewModels;

[QueryProperty(nameof(PeriodType), "period")]
public partial class GymWrappedViewModel : BaseViewModel
{
    private readonly IWorkoutRepository _workoutRepo;
    private readonly IWorkoutExerciseRepository _workoutExerciseRepo;
    private readonly ISetRepository _setRepo;
    private readonly IExerciseRepository _exerciseRepo;
    private readonly IPersonalRecordRepository _prRepo;

    [ObservableProperty] private string _periodType = "month"; // "month" or "year"
    [ObservableProperty] private string _periodLabel = string.Empty;

    // Card 1: Overview
    [ObservableProperty] private int _totalWorkouts;
    [ObservableProperty] private string _totalHours = "0";
    [ObservableProperty] private int _totalExercisesDone;

    // Card 2: Top exercises
    [ObservableProperty] private ObservableCollection<TopExerciseItem> _topExercises = [];

    // Card 3: Muscle split
    [ObservableProperty] private ObservableCollection<MuscleSplitItem> _muscleSplit = [];

    // Card 4: PRs
    [ObservableProperty] private int _totalPRs;
    [ObservableProperty] private ObservableCollection<PRHighlightItem> _prHighlights = [];

    // Card 5: Streaks
    [ObservableProperty] private int _longestStreak;
    [ObservableProperty] private double _consistencyPercent;
    [ObservableProperty] private int _activeDays;

    // Card 6: Volume comparison
    [ObservableProperty] private string _currentVolume = "0";
    [ObservableProperty] private string _previousVolume = "0";
    [ObservableProperty] private string _volumeChange = "0%";
    [ObservableProperty] private bool _volumeIncreased;

    public GymWrappedViewModel(
        IWorkoutRepository workoutRepo,
        IWorkoutExerciseRepository workoutExerciseRepo,
        ISetRepository setRepo,
        IExerciseRepository exerciseRepo,
        IPersonalRecordRepository prRepo)
    {
        _workoutRepo = workoutRepo;
        _workoutExerciseRepo = workoutExerciseRepo;
        _setRepo = setRepo;
        _exerciseRepo = exerciseRepo;
        _prRepo = prRepo;
        Title = "Gym Wrapped";
    }

    public override async Task InitializeAsync()
    {
        await ExecuteAsync(async () =>
        {
            var isYearly = PeriodType == "year";
            var now = DateTime.Now;

            DateTime periodStart, periodEnd, prevStart, prevEnd;
            if (isYearly)
            {
                periodStart = new DateTime(now.Year, 1, 1);
                periodEnd = periodStart.AddYears(1);
                prevStart = periodStart.AddYears(-1);
                prevEnd = periodStart;
                PeriodLabel = $"{now.Year} Wrapped";
            }
            else
            {
                periodStart = new DateTime(now.Year, now.Month, 1);
                periodEnd = periodStart.AddMonths(1);
                prevStart = periodStart.AddMonths(-1);
                prevEnd = periodStart;
                PeriodLabel = $"{periodStart:MMMM yyyy} Wrapped";
            }

            var allWorkouts = (await _workoutRepo.GetAllWorkoutsAsync())
                .Where(w => !w.IsTemplate && w.EndTime.HasValue)
                .ToList();

            var periodWorkouts = allWorkouts
                .Where(w => w.StartTime >= periodStart && w.StartTime < periodEnd)
                .OrderByDescending(w => w.StartTime)
                .ToList();

            var prevWorkouts = allWorkouts
                .Where(w => w.StartTime >= prevStart && w.StartTime < prevEnd)
                .ToList();

            // Card 1: Overview
            TotalWorkouts = periodWorkouts.Count;
            var totalMinutes = periodWorkouts.Sum(w =>
                w.EndTime.HasValue ? (w.EndTime.Value - w.StartTime).TotalMinutes : 0);
            TotalHours = $"{totalMinutes / 60:0.#}";

            int exerciseCount = 0;
            var exerciseVolumes = new Dictionary<int, double>();
            var muscleSetCounts = new Dictionary<MuscleGroup, int>();

            foreach (var workout in periodWorkouts)
            {
                var exercises = await _workoutExerciseRepo.GetByWorkoutIdAsync(workout.Id);
                exerciseCount += exercises.Count;

                foreach (var we in exercises)
                {
                    var exercise = await _exerciseRepo.GetByIdAsync(we.ExerciseId);
                    if (exercise == null) continue;

                    var sets = await _setRepo.GetByWorkoutExerciseIdAsync(we.Id);
                    var completed = sets.Where(s => s.IsCompleted).ToList();
                    var vol = completed.Sum(s => s.Weight * s.Reps);

                    if (!exerciseVolumes.ContainsKey(we.ExerciseId))
                        exerciseVolumes[we.ExerciseId] = 0;
                    exerciseVolumes[we.ExerciseId] += vol;

                    var mg = exercise.MuscleGroupEnum;
                    if (!muscleSetCounts.ContainsKey(mg))
                        muscleSetCounts[mg] = 0;
                    muscleSetCounts[mg] += completed.Count;
                }
            }
            TotalExercisesDone = exerciseCount;

            // Card 2: Top exercises
            var topExList = new List<TopExerciseItem>();
            foreach (var kv in exerciseVolumes.OrderByDescending(kv => kv.Value).Take(3))
            {
                var ex = await _exerciseRepo.GetByIdAsync(kv.Key);
                if (ex == null) continue;
                topExList.Add(new TopExerciseItem
                {
                    Name = ex.Name,
                    Volume = kv.Value >= 1000 ? $"{kv.Value / 1000:0.#}t" : $"{kv.Value:0.#}kg"
                });
            }
            TopExercises = new ObservableCollection<TopExerciseItem>(topExList);

            // Card 3: Muscle split
            var totalSets = muscleSetCounts.Values.Sum();
            var splitItems = muscleSetCounts
                .OrderByDescending(kv => kv.Value)
                .Select(kv => new MuscleSplitItem
                {
                    MuscleGroup = kv.Key.ToString(),
                    SetCount = kv.Value,
                    Percentage = totalSets > 0 ? Math.Round((double)kv.Value / totalSets * 100, 1) : 0,
                    Color = GetMuscleColor(kv.Key)
                })
                .ToList();
            MuscleSplit = new ObservableCollection<MuscleSplitItem>(splitItems);

            // Card 4: PRs
            var recentPRs = await _prRepo.GetRecentAsync(100);
            var periodPRs = recentPRs
                .Where(p => p.Date >= periodStart && p.Date < periodEnd)
                .ToList();
            TotalPRs = periodPRs.Count;

            var prItems = new List<PRHighlightItem>();
            foreach (var pr in periodPRs.Take(5))
            {
                var ex = await _exerciseRepo.GetByIdAsync(pr.ExerciseId);
                if (ex == null) continue;
                prItems.Add(new PRHighlightItem
                {
                    ExerciseName = ex.Name,
                    Value = $"{pr.Value:0.#}kg",
                    Type = ((RecordType)pr.RecordType).ToString()
                });
            }
            PrHighlights = new ObservableCollection<PRHighlightItem>(prItems);

            // Card 5: Streaks
            var uniqueDates = periodWorkouts
                .Select(w => w.StartTime.Date)
                .Distinct()
                .OrderBy(d => d)
                .ToList();
            ActiveDays = uniqueDates.Count;

            var totalDaysInPeriod = (periodEnd - periodStart).Days;
            ConsistencyPercent = totalDaysInPeriod > 0
                ? Math.Round((double)ActiveDays / totalDaysInPeriod * 100, 1)
                : 0;

            // Longest streak
            int maxStreak = 0, currentStreak = 1;
            for (int i = 1; i < uniqueDates.Count; i++)
            {
                if ((uniqueDates[i] - uniqueDates[i - 1]).Days == 1)
                    currentStreak++;
                else
                    currentStreak = 1;
                if (currentStreak > maxStreak)
                    maxStreak = currentStreak;
            }
            LongestStreak = Math.Max(maxStreak, uniqueDates.Count > 0 ? Math.Max(1, currentStreak) : 0);

            // Card 6: Volume comparison
            var curVol = periodWorkouts.Sum(w => w.TotalVolume);
            var prevVol = prevWorkouts.Sum(w => w.TotalVolume);
            CurrentVolume = curVol >= 1000 ? $"{curVol / 1000:0.#}t" : $"{curVol:0.#}kg";
            PreviousVolume = prevVol >= 1000 ? $"{prevVol / 1000:0.#}t" : $"{prevVol:0.#}kg";

            if (prevVol > 0)
            {
                var change = (curVol - prevVol) / prevVol * 100;
                VolumeChange = change >= 0 ? $"+{change:0.#}%" : $"{change:0.#}%";
                VolumeIncreased = change >= 0;
            }
            else
            {
                VolumeChange = curVol > 0 ? "+100%" : "0%";
                VolumeIncreased = curVol > 0;
            }
        });
    }

    [RelayCommand]
    private async Task GoBack()
    {
        await Shell.Current.GoToAsync("..");
    }

    [RelayCommand]
    private async Task ShareWrapped()
    {
        var lines = new List<string>
        {
            $"🏋️ My {PeriodLabel}",
            "",
            $"💪 {TotalWorkouts} workouts",
            $"⏱ {TotalHours} hours",
            $"🏆 {TotalPRs} PRs"
        };

        if (TopExercises.Count > 0)
        {
            lines.Add("");
            lines.Add("Top exercises:");
            foreach (var ex in TopExercises.Take(3))
                lines.Add($"  • {ex.Name} — {ex.Volume}");
        }

        lines.Add("");
        lines.Add("Shared from PlateUp");

        await Share.Default.RequestAsync(new ShareTextRequest
        {
            Text = string.Join("\n", lines),
            Title = PeriodLabel
        });
    }

    private static Color GetMuscleColor(MuscleGroup mg)
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
        if (Application.Current?.Resources.TryGetValue(key, out var c) == true && c is Color color)
            return color;
        return Colors.Gray;
    }
}

public class TopExerciseItem
{
    public string Name { get; set; } = string.Empty;
    public string Volume { get; set; } = string.Empty;
}

public class MuscleSplitItem
{
    public string MuscleGroup { get; set; } = string.Empty;
    public int SetCount { get; set; }
    public double Percentage { get; set; }
    public Color Color { get; set; } = Colors.Gray;
}

public class PRHighlightItem
{
    public string ExerciseName { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
}
