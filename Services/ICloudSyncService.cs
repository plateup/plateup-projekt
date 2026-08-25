namespace PlateUp.Services;

public class CloudWorkoutPost
{
    public long Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int DurationMinutes { get; set; }
    public double TotalVolume { get; set; }
    public int TotalSets { get; set; }
    public string ExerciseSummary { get; set; } = string.Empty;
    public int PrCount { get; set; }
    public DateTime CreatedAt { get; set; }

    // Joined from profiles
    public string UserNickname { get; set; } = "Athlete";
    public string UserAvatarColor { get; set; } = "#448AFF";

    // Computed
    public int LikeCount { get; set; }
    public bool IsLikedByMe { get; set; }
}

public class CloudProfile
{
    public string Id { get; set; } = string.Empty;
    public string Nickname { get; set; } = "Athlete";
    public string AvatarColor { get; set; } = "#448AFF";
    public string? Bio { get; set; }
    public int Level { get; set; } = 1;
    public int FollowerCount { get; set; }
    public int FollowingCount { get; set; }
    public bool IsFollowedByMe { get; set; }
}

public interface ICloudSyncService
{
    // Auth
    Task<(bool Success, string? Error)> RegisterAsync(string email, string password, string nickname);
    Task<(bool Success, string? Error)> LoginAsync(string email, string password);
    Task<bool> SignInWithGoogleAsync();
    Task LogoutAsync();
    bool IsLoggedIn { get; }
    bool IsOnline { get; }
    string? CurrentUserId { get; }

    // Profile
    Task UpdateProfileAsync(string nickname, string avatarColor, string? bio, int level);
    Task<CloudProfile?> GetProfileAsync(string userId);

    // Workouts
    Task PublishWorkoutAsync(string title, string? description, int durationMinutes,
        double totalVolume, int totalSets, string exerciseSummary, int prCount);
    Task<List<CloudWorkoutPost>> GetFeedAsync(int limit = 20, int offset = 0);
    Task<List<CloudWorkoutPost>> GetUserWorkoutsAsync(string userId, int limit = 20);
    Task DeleteWorkoutAsync(long cloudWorkoutId);

    // Social
    Task FollowAsync(string userId);
    Task UnfollowAsync(string userId);
    Task<List<CloudProfile>> GetFollowersAsync(string userId);
    Task<List<CloudProfile>> GetFollowingAsync(string userId);
    Task<List<CloudProfile>> SearchUsersAsync(string query);

    // Likes
    Task LikeWorkoutAsync(long cloudWorkoutId);
    Task UnlikeWorkoutAsync(long cloudWorkoutId);
}
