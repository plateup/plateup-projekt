using SQLite;

namespace PlateUp.Models;

[Table("Exercises")]
public class Exercise
{
    [PrimaryKey, AutoIncrement]
    public int Id { get; set; }

    [Indexed]
    public string ExternalId { get; set; } = string.Empty;

    [NotNull]
    public string Name { get; set; } = string.Empty;

    [Indexed]
    public int TargetMuscleGroup { get; set; }

    public int ExerciseType { get; set; }

    public bool IsCustom { get; set; }

    public string ImageUrl { get; set; } = string.Empty;
    
    public string VideoUrl { get; set; } = string.Empty;
    
    public string Instructions { get; set; } = string.Empty;
    
    public string SecondaryMuscles { get; set; } = string.Empty;

    [Ignore]
    public MuscleGroup MuscleGroupEnum
    {
        get => (MuscleGroup)TargetMuscleGroup;
        set => TargetMuscleGroup = (int)value;
    }

    [Ignore]
    public ExerciseType ExerciseTypeEnum
    {
        get => (ExerciseType)ExerciseType;
        set => ExerciseType = (int)value;
    }
}
