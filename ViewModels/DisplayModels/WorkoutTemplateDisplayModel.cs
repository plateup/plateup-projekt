namespace PlateUp.ViewModels.DisplayModels;

public class WorkoutTemplateDisplayModel
{
    public int WorkoutId { get; set; }
    public string Title { get; set; } = string.Empty;
    public List<string> ExerciseNames { get; set; } = [];
    public int ExerciseCount { get; set; }
    public DateTime? LastUsed { get; set; }

    public string ExerciseSummary
    {
        get
        {
            if (ExerciseNames.Count == 0)
                return "No exercises";

            var displayed = ExerciseNames.Take(3).ToList();
            var summary = string.Join(" · ", displayed);

            if (ExerciseNames.Count > 3)
                summary += $" and {ExerciseNames.Count - 3} more";

            return summary;
        }
    }
}
