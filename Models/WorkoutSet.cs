using SQLite;

namespace PlateUp.Models;

[Table("WorkoutSets")]
public class WorkoutSet
{
    [PrimaryKey, AutoIncrement]
    public int Id { get; set; }

    [Indexed]
    public int WorkoutExerciseId { get; set; }

    public int OrderIndex { get; set; }

    public int SetType { get; set; }

    public double Weight { get; set; }

    public int Reps { get; set; }

    public double? RPE { get; set; }

    public bool IsCompleted { get; set; }

    [Ignore]
    public SetType SetTypeEnum
    {
        get => (SetType)SetType;
        set => SetType = (int)value;
    }
}
