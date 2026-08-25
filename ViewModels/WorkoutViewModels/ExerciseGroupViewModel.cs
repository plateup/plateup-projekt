using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using PlateUp.Models;

namespace PlateUp.ViewModels.WorkoutViewModels;

public partial class ExerciseGroupViewModel : ObservableObject
{
    public int DatabaseWorkoutExerciseId { get; set; }
    public int RestTimerSeconds { get; set; } = 90;

    [ObservableProperty]
    private string _exerciseName = string.Empty;

    [ObservableProperty]
    private int _exerciseId;

    [ObservableProperty]
    private MuscleGroup _muscleGroup;

    [ObservableProperty]
    private ObservableCollection<SetRowViewModel> _sets = [];

    [ObservableProperty]
    private string _notes = string.Empty;

    [ObservableProperty]
    private bool _showNotes;

    [ObservableProperty]
    private int? _supersetGroupId;

    [ObservableProperty]
    private bool _isInSuperset;

    [RelayCommand]
    private void AddSet()
    {
        var nextNumber = Sets.Count + 1;
        Sets.Add(new SetRowViewModel { SetNumber = nextNumber });
    }

    [RelayCommand]
    private void AddDropSet()
    {
        var lastSet = Sets.LastOrDefault();
        var newSet = new SetRowViewModel
        {
            SetNumber = Sets.Count + 1,
            SetType = SetType.Drop,
            WeightText = lastSet?.WeightText ?? string.Empty,
            RepsText = lastSet?.RepsText ?? string.Empty
        };
        Sets.Add(newSet);
    }

    [RelayCommand]
    private void RemoveSet(SetRowViewModel set)
    {
        Sets.Remove(set);
        // Renumber
        for (int i = 0; i < Sets.Count; i++)
            Sets[i].SetNumber = i + 1;
    }

    [RelayCommand]
    private void DuplicateSet(SetRowViewModel set)
    {
        var newSet = new SetRowViewModel
        {
            SetNumber = Sets.Count + 1,
            WeightText = set.WeightText,
            RepsText = set.RepsText,
            SetType = set.SetType
        };
        Sets.Add(newSet);
    }

    [RelayCommand]
    private void ToggleNotes()
    {
        ShowNotes = !ShowNotes;
    }
}
