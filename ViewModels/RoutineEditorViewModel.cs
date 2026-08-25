using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using CommunityToolkit.Mvvm.Messaging;
using PlateUp.Messages;
using PlateUp.Models;
using PlateUp.Services;
using PlateUp.ViewModels.DisplayModels;

namespace PlateUp.ViewModels;

[QueryProperty(nameof(WorkoutId), "workoutId")]
public partial class RoutineEditorViewModel : BaseViewModel,
    IRecipient<ExercisesSelectedMessage>
{
    private readonly IWorkoutRepository _workoutRepo;
    private readonly IWorkoutExerciseRepository _workoutExerciseRepo;
    private readonly ISetRepository _setRepo;
    private readonly IExerciseRepository _exerciseRepo;

    private bool _initialized;

    [ObservableProperty] private int _workoutId;
    [ObservableProperty] private string _routineName = string.Empty;
    [ObservableProperty] private ObservableCollection<RoutineExerciseDisplay> _exercises = [];

    public bool IsEditing => WorkoutId > 0;
    public string PageTitle => IsEditing ? "Edit Routine" : "New Routine";

    public RoutineEditorViewModel(
        IWorkoutRepository workoutRepo,
        IWorkoutExerciseRepository workoutExerciseRepo,
        ISetRepository setRepo,
        IExerciseRepository exerciseRepo)
    {
        _workoutRepo = workoutRepo;
        _workoutExerciseRepo = workoutExerciseRepo;
        _setRepo = setRepo;
        _exerciseRepo = exerciseRepo;
        Title = "Routine Editor";
    }

    public override async Task InitializeAsync()
    {
        if (_initialized) return;
        _initialized = true;

        WeakReferenceMessenger.Default.Register<ExercisesSelectedMessage>(this);

        if (WorkoutId > 0)
        {
            await ExecuteAsync(async () =>
            {
                var workout = await _workoutRepo.GetWorkoutByIdAsync(WorkoutId);
                if (workout is null) return;

                RoutineName = workout.Title;
                var wes = await _workoutExerciseRepo.GetByWorkoutIdAsync(WorkoutId);
                var list = new List<RoutineExerciseDisplay>();

                foreach (var we in wes)
                {
                    var exercise = await _exerciseRepo.GetByIdAsync(we.ExerciseId);
                    if (exercise is null) continue;

                    var sets = await _setRepo.GetByWorkoutExerciseIdAsync(we.Id);
                    var setDisplays = new ObservableCollection<RoutineSetDisplay>(
                        sets.Select((s, i) => new RoutineSetDisplay
                        {
                            OrderIndex = i + 1,
                            WeightText = s.Weight > 0 ? s.Weight.ToString("0.##") : string.Empty,
                            RepsText = s.Reps > 0 ? s.Reps.ToString() : string.Empty
                        }));

                    list.Add(new RoutineExerciseDisplay
                    {
                        WorkoutExerciseId = we.Id,
                        ExerciseId = exercise.Id,
                        ExerciseName = exercise.Name,
                        MuscleGroup = exercise.MuscleGroupEnum,
                        RestTimerSeconds = we.RestTimerSeconds,
                        Sets = setDisplays.Count > 0 ? setDisplays : CreateDefaultSets()
                    });
                }

                Exercises = new ObservableCollection<RoutineExerciseDisplay>(list);
            });
        }

        OnPropertyChanged(nameof(IsEditing));
        OnPropertyChanged(nameof(PageTitle));
    }

    public void Receive(ExercisesSelectedMessage message)
    {
        foreach (var ex in message.Value)
        {
            Exercises.Add(new RoutineExerciseDisplay
            {
                ExerciseId = ex.Id,
                ExerciseName = ex.Name,
                MuscleGroup = ex.MuscleGroupEnum,
                Sets = CreateDefaultSets()
            });
        }
    }

    private static ObservableCollection<RoutineSetDisplay> CreateDefaultSets()
    {
        return
        [
            new() { OrderIndex = 1 },
            new() { OrderIndex = 2 },
            new() { OrderIndex = 3 }
        ];
    }

    [RelayCommand]
    private async Task AddExercises()
    {
        await Shell.Current.GoToAsync("exercisepicker");
    }

    [RelayCommand]
    private void RemoveExercise(RoutineExerciseDisplay ex)
    {
        Exercises.Remove(ex);
    }

    [RelayCommand]
    private void AddSet(RoutineExerciseDisplay ex)
    {
        ex.Sets.Add(new RoutineSetDisplay { OrderIndex = ex.Sets.Count + 1 });
    }

    [RelayCommand]
    private void RemoveSet(RoutineSetDisplay set)
    {
        foreach (var ex in Exercises)
        {
            if (ex.Sets.Remove(set))
            {
                for (int i = 0; i < ex.Sets.Count; i++)
                    ex.Sets[i].OrderIndex = i + 1;
                break;
            }
        }
    }

    [RelayCommand]
    private void MoveExerciseUp(RoutineExerciseDisplay ex)
    {
        var idx = Exercises.IndexOf(ex);
        if (idx <= 0) return;
        Exercises.Move(idx, idx - 1);
    }

    [RelayCommand]
    private void MoveExerciseDown(RoutineExerciseDisplay ex)
    {
        var idx = Exercises.IndexOf(ex);
        if (idx < 0 || idx >= Exercises.Count - 1) return;
        Exercises.Move(idx, idx + 1);
    }

    [RelayCommand]
    private async Task SaveRoutine()
    {
        if (string.IsNullOrWhiteSpace(RoutineName))
        {
            await Shell.Current.DisplayAlertAsync("Validation", "Please enter a routine name.", "OK");
            return;
        }

        if (Exercises.Count == 0)
        {
            await Shell.Current.DisplayAlertAsync("Validation", "Add at least one exercise.", "OK");
            return;
        }

        await ExecuteAsync(async () =>
        {
            Workout workout;
            if (WorkoutId > 0)
            {
                workout = (await _workoutRepo.GetWorkoutByIdAsync(WorkoutId))!;
                workout.Title = RoutineName;
                await _workoutRepo.SaveWorkoutAsync(workout);

                // Delete existing exercises (cascade deletes sets)
                var existing = await _workoutExerciseRepo.GetByWorkoutIdAsync(WorkoutId);
                foreach (var e in existing)
                    await _workoutExerciseRepo.DeleteAsync(e.Id);
            }
            else
            {
                workout = new Workout
                {
                    Title = RoutineName,
                    IsTemplate = true,
                    IsPublic = false,
                    StartTime = DateTime.Now
                };
                WorkoutId = await _workoutRepo.SaveWorkoutAsync(workout);
            }

            // Save exercises and sets
            for (int i = 0; i < Exercises.Count; i++)
            {
                var ex = Exercises[i];
                var we = new WorkoutExercise
                {
                    WorkoutId = WorkoutId,
                    ExerciseId = ex.ExerciseId,
                    OrderIndex = i,
                    RestTimerSeconds = ex.RestTimerSeconds
                };
                var weId = await _workoutExerciseRepo.SaveAsync(we);

                for (int j = 0; j < ex.Sets.Count; j++)
                {
                    var s = ex.Sets[j];
                    double.TryParse(s.WeightText, System.Globalization.NumberStyles.Any,
                        System.Globalization.CultureInfo.InvariantCulture, out var weight);
                    int.TryParse(s.RepsText, out var reps);

                    await _setRepo.SaveAsync(new WorkoutSet
                    {
                        WorkoutExerciseId = weId,
                        OrderIndex = j,
                        Weight = weight,
                        Reps = reps
                    });
                }
            }

            WeakReferenceMessenger.Default.Send(new RoutineSavedMessage(WorkoutId));
            await Shell.Current.GoToAsync("..");
        });
    }

    [RelayCommand]
    private async Task Cancel()
    {
        if (Exercises.Count > 0 || !string.IsNullOrWhiteSpace(RoutineName))
        {
            var discard = await Shell.Current.DisplayAlertAsync(
                "Discard Changes", "Discard unsaved changes?", "Discard", "Cancel");
            if (!discard) return;
        }

        await Shell.Current.GoToAsync("..");
    }

    public override void OnDisappearing()
    {
        WeakReferenceMessenger.Default.Unregister<ExercisesSelectedMessage>(this);
    }
}
