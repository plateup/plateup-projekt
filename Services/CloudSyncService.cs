using System.Text.Json;
using System.Text.Json.Serialization;
using Supabase.Postgrest;
using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace PlateUp.Services;

// ─── Supabase table models ───

[Table("profiles")]
public class SupabaseProfile : BaseModel
{
    [PrimaryKey("id", false)]
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [Column("nickname")]
    [JsonPropertyName("nickname")]
    public string Nickname { get; set; } = "Athlete";

    [Column("avatar_color")]
    [JsonPropertyName("avatar_color")]
    public string AvatarColor { get; set; } = "#448AFF";

    [Column("bio")]
    [JsonPropertyName("bio")]
    public string? Bio { get; set; }

    [Column("level")]
    [JsonPropertyName("level")]
    public int Level { get; set; } = 1;

    [Column("created_at")]
    [JsonPropertyName("created_at")]
    public DateTimeOffset CreatedAt { get; set; }
}

[Table("workouts")]
public class SupabaseWorkout : BaseModel
{
    [PrimaryKey("id", false)]
    [Column("id")]
    [JsonPropertyName("id")]
    public long Id { get; set; }

    [Column("user_id")]
    [JsonPropertyName("user_id")]
    public string UserId { get; set; } = string.Empty;

    [Column("title")]
    [JsonPropertyName("title")]
    public string Title { get; set; } = string.Empty;

    [Column("description")]
    [JsonPropertyName("description")]
    public string? Description { get; set; }

    [Column("duration_minutes")]
    [JsonPropertyName("duration_minutes")]
    public int DurationMinutes { get; set; }

    [Column("total_volume")]
    [JsonPropertyName("total_volume")]
    public double TotalVolume { get; set; }

    [Column("total_sets")]
    [JsonPropertyName("total_sets")]
    public int TotalSets { get; set; }

    [Column("exercise_summary")]
    [JsonPropertyName("exercise_summary")]
    public string ExerciseSummary { get; set; } = string.Empty;

    [Column("pr_count")]
    [JsonPropertyName("pr_count")]
    public int PrCount { get; set; }

    [Column("created_at")]
    [JsonPropertyName("created_at")]
    public DateTimeOffset CreatedAt { get; set; }
}

[Table("follows")]
public class SupabaseFollow : BaseModel
{
    [PrimaryKey("follower_id", false)]
    [Column("follower_id")]
    [JsonPropertyName("follower_id")]
    public string FollowerId { get; set; } = string.Empty;

    [Column("following_id")]
    [JsonPropertyName("following_id")]
    public string FollowingId { get; set; } = string.Empty;

    [Column("created_at")]
    [JsonPropertyName("created_at")]
    public DateTimeOffset CreatedAt { get; set; }
}

[Table("workout_likes")]
public class SupabaseWorkoutLike : BaseModel
{
    [PrimaryKey("user_id", false)]
    [Column("user_id")]
    [JsonPropertyName("user_id")]
    public string UserId { get; set; } = string.Empty;

    [Column("workout_id")]
    [JsonPropertyName("workout_id")]
    public long WorkoutId { get; set; }

    [Column("created_at")]
    [JsonPropertyName("created_at")]
    public DateTimeOffset CreatedAt { get; set; }
}

// ─── Service implementation ───

public class CloudSyncService : ICloudSyncService
{
    private readonly SupabaseService _supabase;

    public CloudSyncService(SupabaseService supabase)
    {
        _supabase = supabase;
    }

    public bool IsLoggedIn => _supabase.IsLoggedIn;
    public bool IsOnline => Connectivity.Current.NetworkAccess == NetworkAccess.Internet;
    public string? CurrentUserId => _supabase.CurrentUserId;

    // ─── Auth ───

    public async Task<(bool Success, string? Error)> RegisterAsync(string email, string password, string nickname)
    {
        try
        {
            var client = await _supabase.GetClientAsync();
            var session = await client.Auth.SignUp(email, password);

            if (session?.User == null)
                return (false, "Registration failed. Please try again.");

            // Supabase returns a fake user with empty identities for duplicate emails
            // (security measure to avoid leaking email existence)
            var identities = session.User.Identities;
            if (identities == null || identities.Count == 0)
                return (false, "This email is already registered. Try logging in instead.");

            // If email confirmation is required, user needs to verify first
            if (session.User.ConfirmedAt == null)
            {
                return (true, "CONFIRM_EMAIL");
            }

            // Update profile with nickname
            try
            {
                await client.From<SupabaseProfile>()
                    .Where(p => p.Id == session.User.Id!)
                    .Set(p => p.Nickname!, nickname)
                    .Update();
            }
            catch { /* Profile update is not critical */ }

            return (true, null);
        }
        catch (Exception ex)
        {
            var message = ex.Message.ToLowerInvariant();
            if (message.Contains("already") || message.Contains("exists") || message.Contains("duplicate"))
                return (false, "This email is already registered. Try logging in instead.");
            if (message.Contains("password") && message.Contains("short"))
                return (false, "Password must be at least 6 characters.");
            if (message.Contains("invalid") && message.Contains("email"))
                return (false, "Please enter a valid email address.");
            return (false, $"Registration failed: {ex.Message}");
        }
    }

    public async Task<(bool Success, string? Error)> LoginAsync(string email, string password)
    {
        try
        {
            var client = await _supabase.GetClientAsync();
            var session = await client.Auth.SignIn(email, password);
            return session?.User != null
                ? (true, null)
                : (false, "Invalid email or password.");
        }
        catch (Exception ex)
        {
            var message = ex.Message.ToLowerInvariant();
            if (message.Contains("invalid") || message.Contains("credentials"))
                return (false, "Invalid email or password.");
            if (message.Contains("confirm"))
                return (false, "Please confirm your email before logging in.");
            return (false, $"Login failed: {ex.Message}");
        }
    }

    public async Task<bool> SignInWithGoogleAsync()
    {
        try
        {
            var client = await _supabase.GetClientAsync();
            var providerAuth = await client.Auth.SignIn(
                Supabase.Gotrue.Constants.Provider.Google,
                new Supabase.Gotrue.SignInOptions
                {
                    RedirectTo = "com.companyname.plateup://auth/callback"
                });

            if (providerAuth?.Uri is null) return false;

            var authResult = await WebAuthenticator.Default.AuthenticateAsync(
                new Uri(providerAuth.Uri.ToString()),
                new Uri("com.companyname.plateup://auth/callback"));

            var accessToken = authResult?.AccessToken;
            var refreshToken = authResult?.Properties.GetValueOrDefault("refresh_token") ?? "";

            if (string.IsNullOrEmpty(accessToken)) return false;

            await client.Auth.SetSession(accessToken, refreshToken);
            return client.Auth.CurrentUser is not null;
        }
        catch
        {
            return false;
        }
    }

    public async Task LogoutAsync()
    {
        try
        {
            var client = await _supabase.GetClientAsync();
            await client.Auth.SignOut();
        }
        catch { }
    }

    // ─── Profile ───

    public async Task UpdateProfileAsync(string nickname, string avatarColor, string? bio, int level)
    {
        if (!IsLoggedIn) return;
        try
        {
            var client = await _supabase.GetClientAsync();
            var userId = CurrentUserId!;
            await client.From<SupabaseProfile>()
                .Where(p => p.Id == userId)
                .Set(p => p.Nickname!, nickname)
                .Set(p => p.AvatarColor!, avatarColor)
                .Set(p => p.Bio!, bio ?? "")
                .Set(p => p.Level, level)
                .Update();
        }
        catch { }
    }

    public async Task<CloudProfile?> GetProfileAsync(string userId)
    {
        try
        {
            var client = await _supabase.GetClientAsync();
            var result = await client.From<SupabaseProfile>()
                .Where(p => p.Id == userId)
                .Single();

            if (result == null) return null;

            // Get follower/following counts
            var followers = await client.From<SupabaseFollow>()
                .Where(f => f.FollowingId == userId)
                .Get();
            var following = await client.From<SupabaseFollow>()
                .Where(f => f.FollowerId == userId)
                .Get();

            var isFollowed = false;
            if (IsLoggedIn && CurrentUserId != userId)
            {
                var myId = CurrentUserId!;
                var check = await client.From<SupabaseFollow>()
                    .Where(f => f.FollowerId == myId)
                    .Where(f => f.FollowingId == userId)
                    .Get();
                isFollowed = check.Models.Count > 0;
            }

            return new CloudProfile
            {
                Id = result.Id,
                Nickname = result.Nickname,
                AvatarColor = result.AvatarColor,
                Bio = result.Bio,
                Level = result.Level,
                FollowerCount = followers.Models.Count,
                FollowingCount = following.Models.Count,
                IsFollowedByMe = isFollowed
            };
        }
        catch
        {
            return null;
        }
    }

    // ─── Workouts ───

    public async Task PublishWorkoutAsync(string title, string? description,
        int durationMinutes, double totalVolume, int totalSets,
        string exerciseSummary, int prCount)
    {
        if (!IsLoggedIn) return;
        try
        {
            var client = await _supabase.GetClientAsync();
            await client.From<SupabaseWorkout>().Insert(new SupabaseWorkout
            {
                UserId = CurrentUserId!,
                Title = title,
                Description = description,
                DurationMinutes = durationMinutes,
                TotalVolume = totalVolume,
                TotalSets = totalSets,
                ExerciseSummary = exerciseSummary,
                PrCount = prCount
            });
        }
        catch { }
    }

    public async Task<List<CloudWorkoutPost>> GetFeedAsync(int limit = 20, int offset = 0)
    {
        try
        {
            var client = await _supabase.GetClientAsync();

            List<string> followingIds = [];
            if (IsLoggedIn)
            {
                var myId = CurrentUserId!;
                var follows = await client.From<SupabaseFollow>()
                    .Where(f => f.FollowerId == myId)
                    .Get();
                followingIds = follows.Models.Select(f => f.FollowingId).ToList();

                // Include own posts in feed
                followingIds.Add(myId);
            }

            // Get workouts - if logged in, get followed + own; otherwise get recent public
            var query = client.From<SupabaseWorkout>()
                .Order("created_at", Constants.Ordering.Descending)
                .Range(offset, offset + limit - 1);

            if (followingIds.Count > 0)
            {
                query = query.Filter("user_id", Constants.Operator.In, followingIds);
            }

            var workouts = await query.Get();
            return await EnrichWorkouts(client, workouts.Models);
        }
        catch
        {
            return [];
        }
    }

    public async Task<List<CloudWorkoutPost>> GetUserWorkoutsAsync(string userId, int limit = 20)
    {
        try
        {
            var client = await _supabase.GetClientAsync();
            var workouts = await client.From<SupabaseWorkout>()
                .Where(w => w.UserId == userId)
                .Order("created_at", Constants.Ordering.Descending)
                .Limit(limit)
                .Get();
            return await EnrichWorkouts(client, workouts.Models);
        }
        catch
        {
            return [];
        }
    }

    public async Task DeleteWorkoutAsync(long cloudWorkoutId)
    {
        if (!IsLoggedIn) return;
        try
        {
            var client = await _supabase.GetClientAsync();
            await client.From<SupabaseWorkout>()
                .Where(w => w.Id == cloudWorkoutId)
                .Delete();
        }
        catch { }
    }

    // ─── Social ───

    public async Task FollowAsync(string userId)
    {
        if (!IsLoggedIn || CurrentUserId == userId) return;
        try
        {
            var client = await _supabase.GetClientAsync();
            await client.From<SupabaseFollow>().Insert(new SupabaseFollow
            {
                FollowerId = CurrentUserId!,
                FollowingId = userId
            });
        }
        catch { }
    }

    public async Task UnfollowAsync(string userId)
    {
        if (!IsLoggedIn) return;
        try
        {
            var client = await _supabase.GetClientAsync();
            var myId = CurrentUserId!;
            await client.From<SupabaseFollow>()
                .Where(f => f.FollowerId == myId)
                .Where(f => f.FollowingId == userId)
                .Delete();
        }
        catch { }
    }

    public async Task<List<CloudProfile>> GetFollowersAsync(string userId)
    {
        try
        {
            var client = await _supabase.GetClientAsync();
            var follows = await client.From<SupabaseFollow>()
                .Where(f => f.FollowingId == userId)
                .Get();

            var profiles = new List<CloudProfile>();
            foreach (var f in follows.Models)
            {
                var p = await GetProfileAsync(f.FollowerId);
                if (p != null) profiles.Add(p);
            }
            return profiles;
        }
        catch
        {
            return [];
        }
    }

    public async Task<List<CloudProfile>> GetFollowingAsync(string userId)
    {
        try
        {
            var client = await _supabase.GetClientAsync();
            var follows = await client.From<SupabaseFollow>()
                .Where(f => f.FollowerId == userId)
                .Get();

            var profiles = new List<CloudProfile>();
            foreach (var f in follows.Models)
            {
                var p = await GetProfileAsync(f.FollowingId);
                if (p != null) profiles.Add(p);
            }
            return profiles;
        }
        catch
        {
            return [];
        }
    }

    public async Task<List<CloudProfile>> SearchUsersAsync(string query)
    {
        if (string.IsNullOrWhiteSpace(query)) return [];
        try
        {
            var client = await _supabase.GetClientAsync();
            var result = await client.From<SupabaseProfile>()
                .Filter("nickname", Constants.Operator.ILike, $"%{query}%")
                .Limit(20)
                .Get();

            return result.Models.Select(p => new CloudProfile
            {
                Id = p.Id,
                Nickname = p.Nickname,
                AvatarColor = p.AvatarColor,
                Bio = p.Bio,
                Level = p.Level
            }).ToList();
        }
        catch
        {
            return [];
        }
    }

    // ─── Likes ───

    public async Task LikeWorkoutAsync(long cloudWorkoutId)
    {
        if (!IsLoggedIn) return;
        try
        {
            var client = await _supabase.GetClientAsync();
            await client.From<SupabaseWorkoutLike>().Insert(new SupabaseWorkoutLike
            {
                UserId = CurrentUserId!,
                WorkoutId = cloudWorkoutId
            });
        }
        catch { }
    }

    public async Task UnlikeWorkoutAsync(long cloudWorkoutId)
    {
        if (!IsLoggedIn) return;
        try
        {
            var client = await _supabase.GetClientAsync();
            var myId = CurrentUserId!;
            await client.From<SupabaseWorkoutLike>()
                .Where(l => l.UserId == myId)
                .Where(l => l.WorkoutId == cloudWorkoutId)
                .Delete();
        }
        catch { }
    }

    // ─── Helpers ───

    private async Task<List<CloudWorkoutPost>> EnrichWorkouts(
        Supabase.Client client, List<SupabaseWorkout> workouts)
    {
        var posts = new List<CloudWorkoutPost>();
        var profileCache = new Dictionary<string, SupabaseProfile>();

        foreach (var w in workouts)
        {
            if (!profileCache.TryGetValue(w.UserId, out var profile))
            {
                profile = await client.From<SupabaseProfile>()
                    .Where(p => p.Id == w.UserId)
                    .Single();
                if (profile != null)
                    profileCache[w.UserId] = profile;
            }

            var likes = await client.From<SupabaseWorkoutLike>()
                .Where(l => l.WorkoutId == w.Id)
                .Get();

            var isLiked = false;
            if (IsLoggedIn)
            {
                var myId = CurrentUserId!;
                isLiked = likes.Models.Any(l => l.UserId == myId);
            }

            posts.Add(new CloudWorkoutPost
            {
                Id = w.Id,
                UserId = w.UserId,
                Title = w.Title,
                Description = w.Description,
                DurationMinutes = w.DurationMinutes,
                TotalVolume = w.TotalVolume,
                TotalSets = w.TotalSets,
                ExerciseSummary = w.ExerciseSummary,
                PrCount = w.PrCount,
                CreatedAt = w.CreatedAt.LocalDateTime,
                UserNickname = profile?.Nickname ?? "Athlete",
                UserAvatarColor = profile?.AvatarColor ?? "#448AFF",
                LikeCount = likes.Models.Count,
                IsLikedByMe = isLiked
            });
        }

        return posts;
    }
}
