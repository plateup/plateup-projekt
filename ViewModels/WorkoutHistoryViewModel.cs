using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using PlateUp.Services;
using PlateUp.ViewModels.DisplayModels;

namespace PlateUp.ViewModels;

public partial class WorkoutHistoryViewModel : BaseViewModel
{
    private readonly IWorkoutRepository _workoutRepo;
    private readonly IWorkoutExerciseRepository _workoutExerciseRepo;
    private readonly ISetRepository _setRepo;
    private readonly IExerciseRepository _exerciseRepo;

    [ObservableProperty]
    private ObservableCollection<WorkoutHistoryGroup> _groupedWorkouts = [];

    public WorkoutHistoryViewModel(
        IWorkoutRepository workoutRepo,
        IWorkoutExerciseRepository workoutExerciseRepo,
        ISetRepository setRepo,
        IExerciseRepository exerciseRepo)
    {
        _workoutRepo = workoutRepo;
        _workoutExerciseRepo = workoutExerciseRepo;
        _setRepo = setRepo;
        _exerciseRepo = exerciseRepo;
        Title = "History";
    }

    public override async Task InitializeAsync()
    {
        await ExecuteAsync(async () =>
        {
            var allWorkouts = await _workoutRepo.GetAllWorkoutsAsync();
            var items = allWorkouts.Select(w =>
            {
                var duration = w.EndTime.HasValue
                    ? (w.EndTime.Value - w.StartTime)
                    : TimeSpan.Zero;

                return new WorkoutHistoryItem
                {
                    WorkoutId = w.Id,
                    Title = w.Title,
                    Date = w.StartTime,
                    DurationFormatted = duration.TotalMinutes >= 60
                        ? $"{(int)duration.TotalHours}h {duration.Minutes}m"
                        : $"{(int)duration.TotalMinutes}m",
                    VolumeFormatted = w.TotalVolume >= 1000
                        ? $"{w.TotalVolume / 1000:0.#}t"
                        : $"{w.TotalVolume:0.#} kg",
                    SetCount = w.TotalSets
                };
            }).ToList();

            var grouped = items
                .OrderByDescending(i => i.Date)
                .GroupBy(i => i.Date.ToString("MMMM yyyy"))
                .Select(g => new WorkoutHistoryGroup(g.Key, g.ToList()))
                .ToList();

            GroupedWorkouts = new ObservableCollection<WorkoutHistoryGroup>(grouped);
        });

        IsRefreshing = false;
    }

    [RelayCommand]
    private async Task ViewWorkout(WorkoutHistoryItem item)
    {
        await Shell.Current.GoToAsync($"workoutsummary?workoutId={item.WorkoutId}&readonly=true");
    }

    [RelayCommand]
    private async Task DeleteWorkout(WorkoutHistoryItem item)
    {
        var confirmed = await Shell.Current.DisplayAlertAsync(
            "Delete Workout",
            $"Are you sure you want to delete \"{item.Title}\"?",
            "Delete", "Cancel");

        if (!confirmed) return;

        await ExecuteAsync(async () =>
        {
            await _workoutRepo.DeleteWorkoutAsync(item.WorkoutId);
            await InitializeAsync();
        });
    }

    [RelayCommand]
    private async Task GoBack()
    {
        await Shell.Current.GoToAsync("..");
    }
}
