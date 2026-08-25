using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using PlateUp.Helpers;
using PlateUp.Services;

namespace PlateUp.ViewModels;

[QueryProperty(nameof(UserId), "userId")]
public partial class UserProfileViewModel : BaseViewModel
{
    private readonly ICloudSyncService _cloudSync;

    [ObservableProperty] private string _userId = string.Empty;
    [ObservableProperty] private string _nickname = "Athlete";
    [ObservableProperty] private string _bio = string.Empty;
    [ObservableProperty] private string _avatarColor = "#1C1C1E";
    [ObservableProperty] private string _avatarLetter = "A";
    [ObservableProperty] private int _level = 1;
    [ObservableProperty] private int _followerCount;
    [ObservableProperty] private int _followingCount;
    [ObservableProperty] private bool _isFollowing;
    [ObservableProperty] private bool _isLoaded;
    [ObservableProperty] private ObservableCollection<CloudWorkoutPost> _workouts = [];

    public string FollowButtonText => IsFollowing ? "Following" : "Follow";

    public UserProfileViewModel(ICloudSyncService cloudSync)
    {
        _cloudSync = cloudSync;
        Title = "Profile";
    }

    partial void OnIsFollowingChanged(bool value)
    {
        OnPropertyChanged(nameof(FollowButtonText));
    }

    public override async Task InitializeAsync()
    {
        if (string.IsNullOrEmpty(UserId) || IsLoaded) return;

        await ExecuteAsync(async () =>
        {
            var profile = await _cloudSync.GetProfileAsync(UserId);
            if (profile is null) return;

            Nickname = profile.Nickname;
            Bio = profile.Bio ?? string.Empty;
            AvatarColor = profile.AvatarColor;
            AvatarLetter = !string.IsNullOrEmpty(profile.Nickname)
                ? profile.Nickname[0].ToString().ToUpper() : "A";
            Level = profile.Level;
            FollowerCount = profile.FollowerCount;
            FollowingCount = profile.FollowingCount;
            IsFollowing = profile.IsFollowedByMe;

            var workouts = await _cloudSync.GetUserWorkoutsAsync(UserId);
            Workouts = new ObservableCollection<CloudWorkoutPost>(workouts);

            IsLoaded = true;
        });
    }

    [RelayCommand]
    private async Task ToggleFollow()
    {
        if (!_cloudSync.IsLoggedIn)
        {
            await Shell.Current.GoToAsync("auth?mode=register");
            return;
        }

        await ExecuteAsync(async () =>
        {
            if (IsFollowing)
            {
                await _cloudSync.UnfollowAsync(UserId);
                IsFollowing = false;
                FollowerCount = Math.Max(0, FollowerCount - 1);
            }
            else
            {
                await _cloudSync.FollowAsync(UserId);
                IsFollowing = true;
                FollowerCount++;
                HapticHelper.Tick();
            }
        });
    }

    [RelayCommand]
    private async Task GoBack()
    {
        await Shell.Current.GoToAsync("..");
    }
}
