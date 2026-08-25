using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using LiveChartsCore;
using LiveChartsCore.Defaults;
using LiveChartsCore.SkiaSharpView;
using LiveChartsCore.SkiaSharpView.Painting;
using PlateUp.Helpers;
using PlateUp.Models;
using PlateUp.Services;
using PlateUp.ViewModels.DisplayModels;
using SkiaSharp;

namespace PlateUp.ViewModels;

[QueryProperty(nameof(ExerciseId), "exerciseId")]
public partial class ExerciseDetailViewModel : BaseViewModel
{
    private readonly IExerciseRepository _exerciseRepo;
    private readonly ISetRepository _setRepo;
    private readonly IWorkoutExerciseRepository _workoutExerciseRepo;
    private readonly IWorkoutRepository _workoutRepo;
    private readonly IPersonalRecordRepository _prRepo;

    private bool _initialized;
    private List<DateTimePoint> _allDataPoints = [];

    [ObservableProperty] private int _exerciseId;
    [ObservableProperty] private string _exerciseName = string.Empty;
    [ObservableProperty] private string _muscleGroupName = string.Empty;
    [ObservableProperty] private string _best1RM = "—";
    [ObservableProperty] private string _bestWeight = "—";
    [ObservableProperty] private string _bestVolume = "—";
    [ObservableProperty] private ObservableCollection<ExerciseHistoryEntry> _history = [];
    [ObservableProperty] private ISeries[] _chartSeries = [];
    [ObservableProperty] private Axis[] _xAxes = [];
    [ObservableProperty] private Axis[] _yAxes = [];
    [ObservableProperty] private string _selectedPeriod = "All";

    public ExerciseDetailViewModel(
        IExerciseRepository exerciseRepo,
        ISetRepository setRepo,
        IWorkoutExerciseRepository workoutExerciseRepo,
        IWorkoutRepository workoutRepo,
        IPersonalRecordRepository prRepo)
    {
        _exerciseRepo = exerciseRepo;
        _setRepo = setRepo;
        _workoutExerciseRepo = workoutExerciseRepo;
        _workoutRepo = workoutRepo;
        _prRepo = prRepo;
        Title = "Exercise Detail";
    }

    public override async Task InitializeAsync()
    {
        if (_initialized) return;
        _initialized = true;

        await ExecuteAsync(async () =>
        {
            var exercise = await _exerciseRepo.GetByIdAsync(ExerciseId);
            if (exercise is null) return;

            ExerciseName = exercise.Name;
            MuscleGroupName = exercise.MuscleGroupEnum.ToString().Replace("_", " ");

            // Get only workout exercises for this exercise (avoids loading all workouts)
            var workoutExercises = await _workoutExerciseRepo.GetByExerciseIdAsync(ExerciseId);
            var workoutIds = workoutExercises.Select(we => we.WorkoutId).Distinct().ToList();

            var sessionData = new List<(DateTime Date, List<WorkoutSet> Sets)>();

            foreach (var we in workoutExercises)
            {
                var workout = await _workoutRepo.GetWorkoutByIdAsync(we.WorkoutId);
                if (workout is null || workout.IsTemplate || !workout.EndTime.HasValue) continue;

                var sets = await _setRepo.GetByWorkoutExerciseIdAsync(we.Id);
                var completedSets = sets.Where(s => s.IsCompleted).ToList();
                if (completedSets.Count > 0)
                    sessionData.Add((workout.StartTime, completedSets));
            }

            sessionData = sessionData.OrderByDescending(s => s.Date).ToList();

            // Calculate records
            double maxEstimated1RM = 0;
            double maxWeight = 0;
            double maxSessionVolume = 0;

            var historyEntries = new List<ExerciseHistoryEntry>();
            _allDataPoints = [];

            foreach (var session in sessionData)
            {
                double sessionBest1RM = 0;
                double sessionBestWeight = 0;
                double sessionVolume = 0;
                var setDescriptions = new List<string>();

                foreach (var set in session.Sets)
                {
                    var estimated1RM = Algorithms.Calculate1RM(set.Weight, set.Reps);
                    if (estimated1RM > sessionBest1RM)
                        sessionBest1RM = estimated1RM;
                    if (set.Weight > sessionBestWeight)
                        sessionBestWeight = set.Weight;
                    sessionVolume += set.Weight * set.Reps;
                    setDescriptions.Add($"{set.Weight:0.##}kg×{set.Reps}");
                }

                if (sessionBest1RM > maxEstimated1RM)
                    maxEstimated1RM = sessionBest1RM;
                if (sessionBestWeight > maxWeight)
                    maxWeight = sessionBestWeight;
                if (sessionVolume > maxSessionVolume)
                    maxSessionVolume = sessionVolume;

                _allDataPoints.Add(new DateTimePoint(session.Date, sessionBest1RM));

                historyEntries.Add(new ExerciseHistoryEntry
                {
                    Date = session.Date,
                    SetsDescription = string.Join(", ", setDescriptions),
                    Estimated1RM = sessionBest1RM
                });
            }

            Best1RM = maxEstimated1RM > 0 ? $"{maxEstimated1RM:0.#} kg" : "—";
            BestWeight = maxWeight > 0 ? $"{maxWeight:0.#} kg" : "—";
            BestVolume = maxSessionVolume > 0 ? $"{maxSessionVolume:0.#} kg" : "—";

            History = new ObservableCollection<ExerciseHistoryEntry>(historyEntries);

            // Reverse for chart (oldest first)
            _allDataPoints.Reverse();
            BuildChart(_allDataPoints);
        });
    }

    private void BuildChart(List<DateTimePoint> dataPoints)
    {
        var accentColor = new SKColor(0x44, 0x8A, 0xFF);

        ChartSeries =
        [
            new LineSeries<DateTimePoint>
            {
                Values = dataPoints,
                GeometrySize = 6,
                GeometryFill = new SolidColorPaint(accentColor),
                GeometryStroke = new SolidColorPaint(accentColor) { StrokeThickness = 2 },
                Stroke = new SolidColorPaint(accentColor) { StrokeThickness = 2 },
                Fill = new SolidColorPaint(accentColor.WithAlpha(40)),
                LineSmoothness = 0.3
            }
        ];

        XAxes =
        [
            new DateTimeAxis(TimeSpan.FromDays(30), date => date.ToString("MMM dd"))
            {
                LabelsRotation = 0,
                TextSize = 10,
                LabelsPaint = new SolidColorPaint(new SKColor(0x99, 0x99, 0x99))
            }
        ];

        YAxes =
        [
            new Axis
            {
                Name = "Est. 1RM (kg)",
                NameTextSize = 10,
                TextSize = 10,
                LabelsPaint = new SolidColorPaint(new SKColor(0x99, 0x99, 0x99)),
                NamePaint = new SolidColorPaint(new SKColor(0x99, 0x99, 0x99))
            }
        ];
    }

    [RelayCommand]
    private void ChangePeriod(string period)
    {
        SelectedPeriod = period;

        var cutoff = period switch
        {
            "1M" => DateTime.Now.AddDays(-30),
            "3M" => DateTime.Now.AddDays(-90),
            "6M" => DateTime.Now.AddDays(-180),
            "1Y" => DateTime.Now.AddDays(-365),
            _ => DateTime.MinValue
        };

        var filtered = _allDataPoints.Where(p => p.DateTime >= cutoff).ToList();
        BuildChart(filtered);
    }

    [RelayCommand]
    private async Task GoBack()
    {
        await Shell.Current.GoToAsync("..");
    }
}
