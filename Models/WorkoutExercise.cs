using SQLite;

namespace PlateUp.Models;

[Table("WorkoutExercises")]
public class WorkoutExercise
{
    [PrimaryKey, AutoIncrement]
    public int Id { get; set; }

    [Indexed]
    public int WorkoutId { get; set; }

    [Indexed]
    public int ExerciseId { get; set; }

    public int OrderIndex { get; set; }

    public int? SupersetGroupId { get; set; }

    public string? Notes { get; set; }

    public int RestTimerSeconds { get; set; } = 90;
}
