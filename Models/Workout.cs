using SQLite;

namespace PlateUp.Models;

[Table("Workouts")]
public class Workout
{
    [PrimaryKey, AutoIncrement]
    public int Id { get; set; }

    [NotNull]
    public string Title { get; set; } = "Workout";

    public DateTime StartTime { get; set; }

    public DateTime? EndTime { get; set; }

    public double TotalVolume { get; set; }

    public int TotalSets { get; set; }

    [Indexed]
    public bool IsTemplate { get; set; }

    public bool IsPublic { get; set; } = true;

    public string? Description { get; set; }

    public int? SourceTemplateId { get; set; }
}
