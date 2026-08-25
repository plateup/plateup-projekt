using CommunityToolkit.Mvvm.ComponentModel;

namespace PlateUp.ViewModels.DisplayModels;

public partial class WorkoutPostDisplay : ObservableObject
{
    public int WorkoutId { get; set; }
    public string UserNickname { get; set; } = "Athlete";
    public string UserAvatarColor { get; set; } = "#448AFF";
    public string UserAvatarLetter { get; set; } = "A";
    public string Title { get; set; } = string.Empty;
    public DateTime StartTime { get; set; }
    public string Duration { get; set; } = string.Empty;
    public string Volume { get; set; } = string.Empty;
    public int SetCount { get; set; }
    public int PrCount { get; set; }
    public bool HasPRs => PrCount > 0;
    public List<FeedExerciseDisplay> Exercises { get; set; } = [];
    public int MoreExercisesCount { get; set; }

    // Cloud sync fields
    public bool IsCloudPost { get; set; }
    public long CloudWorkoutId { get; set; }
    public string? CloudUserId { get; set; }

    [ObservableProperty]
    private bool _isLiked;

    [ObservableProperty]
    private int _likeCount;
}

public class FeedExerciseDisplay
{
    public string ExerciseName { get; set; } = string.Empty;
    public int SetsCount { get; set; }
    public string BestSet { get; set; } = string.Empty;
    public bool HasPR { get; set; }
    public Color AvatarColor { get; set; } = Colors.Gray;
    public string AvatarLetter { get; set; } = string.Empty;
}
