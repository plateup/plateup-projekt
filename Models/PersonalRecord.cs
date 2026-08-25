using SQLite;

namespace PlateUp.Models;

[Table("PersonalRecords")]
public class PersonalRecord
{
    [PrimaryKey, AutoIncrement]
    public int Id { get; set; }

    [Indexed]
    public int ExerciseId { get; set; }

    public int WorkoutId { get; set; }

    public int RecordType { get; set; }

    public double Value { get; set; }

    public DateTime Date { get; set; }

    [Ignore]
    public RecordType RecordTypeEnum
    {
        get => (RecordType)RecordType;
        set => RecordType = (int)value;
    }
}
