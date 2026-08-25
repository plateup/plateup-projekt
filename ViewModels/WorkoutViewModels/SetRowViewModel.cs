using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using CommunityToolkit.Mvvm.Messaging;
using PlateUp.Messages;
using PlateUp.Models;

namespace PlateUp.ViewModels.WorkoutViewModels;

public partial class SetRowViewModel : ObservableObject
{
    public int DatabaseId { get; set; }

    [ObservableProperty]
    private int _setNumber;

    [ObservableProperty]
    private SetType _setType = SetType.Normal;

    [ObservableProperty]
    private string _previousResult = string.Empty;

    [ObservableProperty]
    private double? _previousWeight;

    [ObservableProperty]
    private int? _previousReps;

    [ObservableProperty]
    private string _weightText = string.Empty;

    [ObservableProperty]
    private string _repsText = string.Empty;

    [ObservableProperty]
    private bool _isCompleted;

    public string SetLabel => SetType switch
    {
        SetType.Warmup => "W",
        SetType.Drop => "D",
        SetType.Failure => "F",
        _ => SetNumber.ToString()
    };

    partial void OnSetTypeChanged(SetType value)
    {
        OnPropertyChanged(nameof(SetLabel));
    }

    partial void OnSetNumberChanged(int value)
    {
        OnPropertyChanged(nameof(SetLabel));
    }

    partial void OnIsCompletedChanged(bool value)
    {
        WeakReferenceMessenger.Default.Send(new SetCompletedMessage(this));
    }

    [RelayCommand]
    private void CycleSetType()
    {
        SetType = SetType switch
        {
            SetType.Normal => SetType.Warmup,
            SetType.Warmup => SetType.Drop,
            SetType.Drop => SetType.Failure,
            SetType.Failure => SetType.Normal,
            _ => SetType.Normal
        };
    }

    [RelayCommand]
    private void CopyPrevious()
    {
        if (PreviousWeight.HasValue)
            WeightText = PreviousWeight.Value.ToString("0.##");
        if (PreviousReps.HasValue)
            RepsText = PreviousReps.Value.ToString();
    }
}
