using SQLite;

namespace PlateUp.Models;

public enum SuggestionType
{
    RoutineSuggestion = 0,
    ProgressTip = 1,
    RecoveryWarning = 2,
    PRPrediction = 3,
    WeeklyPlan = 4
}

public enum SuggestionActionType
{
    None = 0,
    NavigateToRoutine = 1,
    NavigateToExercise = 2,
    CreateRoutine = 3
}

[Table("CoachSuggestions")]
public class CoachSuggestion
{
    [PrimaryKey, AutoIncrement]
    public int Id { get; set; }

    public int Type { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Message { get; set; } = string.Empty;

    public string IconGlyph { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.Now;

    public bool IsRead { get; set; }

    public bool IsDismissed { get; set; }

    public int ActionType { get; set; }

    public string? ActionData { get; set; }

    [Ignore]
    public SuggestionType SuggestionTypeEnum
    {
        get => (SuggestionType)Type;
        set => Type = (int)value;
    }

    [Ignore]
    public SuggestionActionType ActionTypeEnum
    {
        get => (SuggestionActionType)ActionType;
        set => ActionType = (int)value;
    }
}
