namespace PlateUp.ViewModels.DisplayModels;

public class CalendarDay
{
    public int DayNumber { get; set; }
    public bool HasWorkout { get; set; }
    public bool IsCurrentMonth { get; set; }
    public bool IsToday { get; set; }
}
