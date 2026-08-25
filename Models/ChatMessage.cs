using SQLite;

namespace PlateUp.Models;

[Table("ChatMessages")]
public class ChatMessage
{
    [PrimaryKey, AutoIncrement]
    public int Id { get; set; }

    public string Role { get; set; } = "user"; // "user", "assistant"

    public string Content { get; set; } = string.Empty;

    public DateTime Timestamp { get; set; } = DateTime.Now;
}
