using SQLite;

namespace PlateUp.Models;

[Table("BodyMeasurements")]
public class BodyMeasurement
{
    [PrimaryKey, AutoIncrement]
    public int Id { get; set; }

    public DateTime Date { get; set; }

    public double WeightKg { get; set; }
}
