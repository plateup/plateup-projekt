using CommunityToolkit.Mvvm.ComponentModel;
using PlateUp.Models;

namespace PlateUp.ViewModels.DisplayModels;

public partial class ExerciseDisplayModel : ObservableObject
{
    public int ExerciseId { get; set; }
    public string Name { get; set; } = string.Empty;
    public MuscleGroup MuscleGroup { get; set; }
    public string MuscleGroupName { get; set; } = string.Empty;
    public ExerciseType ExerciseType { get; set; }
    public Color AvatarColor { get; set; } = Colors.Gray;
    public string AvatarLetter { get; set; } = string.Empty;

    [ObservableProperty]
    private bool _isSelected;
}
