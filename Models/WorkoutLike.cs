using SQLite;

namespace PlateUp.Models;

[Table("WorkoutLikes")]
public class WorkoutLike
{
    [PrimaryKey, AutoIncrement]
    public int Id { get; set; }

    [Indexed]
    public int WorkoutId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.Now;
}
