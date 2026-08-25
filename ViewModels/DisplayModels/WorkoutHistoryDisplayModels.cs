namespace PlateUp.ViewModels.DisplayModels;

public class WorkoutHistoryItem
{
    public int WorkoutId { get; set; }
    public string Title { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public string DurationFormatted { get; set; } = string.Empty;
    public string VolumeFormatted { get; set; } = string.Empty;
    public int SetCount { get; set; }
}

public class WorkoutHistoryGroup : List<WorkoutHistoryItem>
{
    public string MonthYear { get; set; } = string.Empty;

    public WorkoutHistoryGroup(string monthYear, List<WorkoutHistoryItem> items) : base(items)
    {
        MonthYear = monthYear;
    }
}
