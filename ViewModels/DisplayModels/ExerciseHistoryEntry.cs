namespace PlateUp.ViewModels.DisplayModels;

public class ExerciseHistoryEntry
{
    public DateTime Date { get; set; }
    public string SetsDescription { get; set; } = string.Empty;
    public double Estimated1RM { get; set; }
}
