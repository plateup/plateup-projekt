using PlateUp.Models;

namespace PlateUp.ViewModels.DisplayModels;

public class SummaryExerciseDisplay
{
    public string ExerciseName { get; set; } = string.Empty;
    public MuscleGroup MuscleGroup { get; set; }
    public List<SummarySetDisplay> Sets { get; set; } = [];
    public bool HasPR { get; set; }
}

public class SummarySetDisplay
{
    public string SetLabel { get; set; } = string.Empty;
    public string WeightReps { get; set; } = string.Empty;
    public bool IsPR { get; set; }
}

public class MuscleGroupSplit
{
    public string MuscleGroupName { get; set; } = string.Empty;
    public Color Color { get; set; } = Colors.Gray;
    public double Percentage { get; set; }
    public int SetCount { get; set; }
}
