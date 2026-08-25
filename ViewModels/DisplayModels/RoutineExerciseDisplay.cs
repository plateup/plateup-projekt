using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using PlateUp.Models;

namespace PlateUp.ViewModels.DisplayModels;

public partial class RoutineExerciseDisplay : ObservableObject
{
    public int WorkoutExerciseId { get; set; }
    public int ExerciseId { get; set; }
    public string ExerciseName { get; set; } = string.Empty;
    public MuscleGroup MuscleGroup { get; set; }
    public int RestTimerSeconds { get; set; } = 90;

    [ObservableProperty]
    private ObservableCollection<RoutineSetDisplay> _sets = [];
}

public partial class RoutineSetDisplay : ObservableObject
{
    [ObservableProperty] private int _orderIndex;
    [ObservableProperty] private string _weightText = string.Empty;
    [ObservableProperty] private string _repsText = string.Empty;
}
