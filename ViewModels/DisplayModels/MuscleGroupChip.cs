using CommunityToolkit.Mvvm.ComponentModel;
using PlateUp.Models;

namespace PlateUp.ViewModels.DisplayModels;

public partial class MuscleGroupChip : ObservableObject
{
    public MuscleGroup? MuscleGroup { get; set; }
    public string DisplayName { get; set; } = string.Empty;

    [ObservableProperty]
    private bool _isActive;
}
