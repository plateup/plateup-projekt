using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using PlateUp.Models;
using PlateUp.Services;
using PlateUp.ViewModels.DisplayModels;

namespace PlateUp.ViewModels;

public partial class FeedViewModel : BaseViewModel
{
    private readonly IWorkoutRepository _workoutRepo;
    private readonly IWorkoutExerciseRepository _workoutExerciseRepo;
    private readonly ISetRepository _setRepo;
    private readonly IExerciseRepository _exerciseRepo;
    private readonly IPersonalRecordRepository _prRepo;
    private readonly IUserRepository _userRepo;
    private readonly ICloudSyncService _cloudSync;

    private const int PageSize = 20;
    private List<Workout> _allFeedWorkouts = [];
    private int _loadedCount;
    private Dictionary<int, Exercise>? _exerciseCache;

    [ObservableProperty] private ObservableCollection<WorkoutPostDisplay> _posts = [];
    [ObservableProperty] private bool _isEmpty;
    [ObservableProperty] private bool _hasMore;
    [ObservableProperty] private bool _isLoggedIn;
    [ObservableProperty] private bool _isOffline;

    public FeedViewModel(
        IWorkoutRepository workoutRepo,
        IWorkoutExerciseRepository workoutExerciseRepo,
        ISetRepository setRepo,
        IExerciseRepository exerciseRepo,
        IPersonalRecordRepository prRepo,
        IUserRepository userRepo,
        ICloudSyncService cloudSync)
    {
        _workoutRepo = workoutRepo;
        _workoutExerciseRepo = workoutExerciseRepo;
        _setRepo = setRepo;
        _exerciseRepo = exerciseRepo;
        _prRepo = prRepo;
        _userRepo = userRepo;
        _cloudSync = cloudSync;
        Title = "Feed";
    }

    public override async Task InitializeAsync()
    {
        IsLoggedIn = _cloudSync.IsLoggedIn;
        await LoadFeed();
        IsRefreshing = false;
    }

    [RelayCommand]
    private async Task RefreshFeed()
    {
        IsLoggedIn = _cloudSync.IsLoggedIn;
        await LoadFeed();
        IsRefreshing = false;
    }

    [RelayCommand]
    private async Task LoadMore()
    {
        if (_cloudSync.IsLoggedIn)
        {
            _loadedCount += PageSize;
            await LoadCloudBatch();
        }
        else
        {
            await LoadBatch();
        }
    }

    [RelayCommand]
    private async Task GoToAuth()
    {
        await Shell.Current.GoToAsync("auth");
    }

    private async Task LoadFeed()
    {
        await ExecuteAsync(async () =>
        {
            _loadedCount = 0;
            _exerciseCache = null;
            Posts = [];
            IsOffline = !_cloudSync.IsOnline;

            if (_cloudSync.IsLoggedIn && _cloudSync.IsOnline)
            {
                await LoadCloudBatch();
            }
            else
            {
                // Offline or not logged in: show local public workouts
                _allFeedWorkouts = (await _workoutRepo.GetPublicWorkoutsAsync())
                    .Where(w => w.EndTime.HasValue)
                    .OrderByDescending(w => w.StartTime)
                    .ToList();
                await LoadBatch();
            }

            IsEmpty = Posts.Count == 0;
        });
    }

    private async Task LoadCloudBatch()
    {
        try
        {
            var cloudPosts = await _cloudSync.GetFeedAsync(PageSize, _loadedCount);
            foreach (var cp in cloudPosts)
            {
                var volume = cp.TotalVolume >= 1000
                    ? $"{cp.TotalVolume / 1000:0.#}t"
                    : $"{cp.TotalVolume:0.#}kg";

                Posts.Add(new WorkoutPostDisplay
                {
                    WorkoutId = (int)cp.Id,
                    CloudWorkoutId = cp.Id,
                    UserNickname = cp.UserNickname,
                    UserAvatarColor = cp.UserAvatarColor,
                    UserAvatarLetter = cp.UserNickname.Length > 0 ? cp.UserNickname[0].ToString().ToUpper() : "A",
                    Title = cp.Title,
                    StartTime = cp.CreatedAt,
                    Duration = cp.DurationMinutes >= 60
                        ? $"{cp.DurationMinutes / 60}h {cp.DurationMinutes % 60}m"
                        : $"{cp.DurationMinutes}m",
                    Volume = volume,
                    SetCount = cp.TotalSets,
                    PrCount = cp.PrCount,
                    LikeCount = cp.LikeCount,
                    IsLiked = cp.IsLikedByMe,
                    IsCloudPost = true,
                    CloudUserId = cp.UserId
                });
            }
            HasMore = cloudPosts.Count >= PageSize;
        }
        catch
        {
            // Fallback to local
            _allFeedWorkouts = (await _workoutRepo.GetPublicWorkoutsAsync())
                .Where(w => w.EndTime.HasValue)
                .OrderByDescending(w => w.StartTime)
                .ToList();
            await LoadBatch();
        }
    }

    private async Task LoadBatch()
    {
        var batch = _allFeedWorkouts.Skip(_loadedCount).Take(PageSize).ToList();
        var postList = new List<WorkoutPostDisplay>();

        // Cache all exercises once to avoid N+1 queries
        _exerciseCache ??= (await _exerciseRepo.GetAllAsync()).ToDictionary(e => e.Id);

        foreach (var w in batch)
        {
            var span = w.EndTime!.Value - w.StartTime;
            var duration = span.TotalHours >= 1
                ? $"{(int)span.TotalHours}h {span.Minutes}m"
                : $"{(int)span.TotalMinutes}m";

            var volume = w.TotalVolume >= 1000
                ? $"{w.TotalVolume / 1000:0.#}t"
                : $"{w.TotalVolume:0.#}kg";

            var exercises = await _workoutExerciseRepo.GetByWorkoutIdAsync(w.Id);
            var feedExercises = new List<FeedExerciseDisplay>();
            int prCount = 0;

            foreach (var we in exercises.Take(4))
            {
                if (!_exerciseCache.TryGetValue(we.ExerciseId, out var exercise)) continue;

                var sets = await _setRepo.GetByWorkoutExerciseIdAsync(we.Id);
                var completedSets = sets.Where(s => s.IsCompleted).ToList();

                var bestWeight = completedSets.Count > 0
                    ? completedSets.Max(s => s.Weight)
                    : 0;
                var bestSet = completedSets.FirstOrDefault(s => Math.Abs(s.Weight - bestWeight) < 0.01);
                var bestSetStr = bestSet is not null
                    ? $"{bestSet.Weight:0.##}kg × {bestSet.Reps}"
                    : "";

                var prs = await _prRepo.GetByExerciseIdAsync(exercise.Id);
                var hasPr = prs.Any(p => p.WorkoutId == w.Id);
                if (hasPr) prCount++;

                var mgColor = GetMuscleColor(exercise.MuscleGroupEnum);

                feedExercises.Add(new FeedExerciseDisplay
                {
                    ExerciseName = exercise.Name,
                    SetsCount = completedSets.Count,
                    BestSet = bestSetStr,
                    HasPR = hasPr,
                    AvatarColor = mgColor,
                    AvatarLetter = exercise.Name.Length > 0 ? exercise.Name[0].ToString().ToUpper() : "?"
                });
            }

            postList.Add(new WorkoutPostDisplay
            {
                WorkoutId = w.Id,
                Title = w.Title,
                StartTime = w.StartTime,
                Duration = duration,
                Volume = volume,
                SetCount = w.TotalSets,
                PrCount = prCount,
                Exercises = feedExercises,
                MoreExercisesCount = Math.Max(0, exercises.Count - 4)
            });
        }

        foreach (var p in postList)
            Posts.Add(p);
        _loadedCount += batch.Count;
        HasMore = _loadedCount < _allFeedWorkouts.Count;
    }

    [RelayCommand]
    private async Task ToggleLike(WorkoutPostDisplay post)
    {
        post.IsLiked = !post.IsLiked;
        post.LikeCount += post.IsLiked ? 1 : -1;

        if (post.IsCloudPost && _cloudSync.IsLoggedIn)
        {
            try
            {
                if (post.IsLiked)
                    await _cloudSync.LikeWorkoutAsync(post.CloudWorkoutId);
                else
                    await _cloudSync.UnlikeWorkoutAsync(post.CloudWorkoutId);
            }
            catch { }
        }
    }

    [RelayCommand]
    private async Task ViewUserProfile(WorkoutPostDisplay post)
    {
        if (!string.IsNullOrEmpty(post.CloudUserId))
            await Shell.Current.GoToAsync($"userprofile?userId={post.CloudUserId}");
    }

    [RelayCommand]
    private async Task SearchUsers()
    {
        var result = await Shell.Current.DisplayPromptAsync(
            "Find Friends", "Search by nickname", "Search", "Cancel",
            placeholder: "Enter nickname...");

        if (string.IsNullOrWhiteSpace(result)) return;

        var users = await _cloudSync.SearchUsersAsync(result.Trim());
        if (users.Count == 0)
        {
            await Shell.Current.DisplayAlertAsync("No results", "No users found with that name.", "OK");
            return;
        }

        // Navigate to first result for now (simplest approach)
        await Shell.Current.GoToAsync($"userprofile?userId={users[0].Id}");
    }

    [RelayCommand]
    private async Task SaveAsRoutine(WorkoutPostDisplay post)
    {
        await ExecuteAsync(async () =>
        {
            await _workoutRepo.DuplicateAsTemplateAsync(post.WorkoutId);
            await Shell.Current.DisplayAlertAsync("Saved", "Routine saved to your workouts!", "OK");
        });
    }

    [RelayCommand]
    private async Task ViewWorkoutDetail(WorkoutPostDisplay post)
    {
        await Shell.Current.GoToAsync($"workoutsummary?workoutId={post.WorkoutId}&readonly=true");
    }

    private static Color GetMuscleColor(MuscleGroup mg)
    {
        var key = mg switch
        {
            MuscleGroup.Chest => "MuscleChest",
            MuscleGroup.Back => "MuscleBack",
            MuscleGroup.Shoulders => "MuscleShoulders",
            MuscleGroup.Biceps => "MuscleBiceps",
            MuscleGroup.Triceps => "MuscleTriceps",
            MuscleGroup.Legs => "MuscleLegs",
            MuscleGroup.Core => "MuscleCore",
            MuscleGroup.Cardio => "MuscleCardio",
            _ => "MuscleChest"
        };
        if (Application.Current?.Resources.TryGetValue(key, out var c) == true && c is Color color)
            return color;
        return Colors.Gray;
    }
}
