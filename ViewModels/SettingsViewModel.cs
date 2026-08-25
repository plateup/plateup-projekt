using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using PlateUp.Models;
using PlateUp.Services;

namespace PlateUp.ViewModels;

public partial class SettingsViewModel : BaseViewModel
{
    private readonly ISettingsService _settings;
    private readonly IUserRepository _userRepo;
    private readonly ICloudSyncService _cloudSync;

    [ObservableProperty] private string _nickname = "Athlete";
    [ObservableProperty] private string _bio = string.Empty;
    [ObservableProperty] private string _avatarColor = "#448AFF";
    [ObservableProperty] private int _selectedThemeIndex;
    [ObservableProperty] private int _restTimerSeconds = 90;
    [ObservableProperty] private bool _useKg = true;
    [ObservableProperty] private bool _autoStartRestTimer = true;

    public string AvatarLetter => string.IsNullOrEmpty(Nickname) ? "A" : Nickname[..1].ToUpper();
    public string CloudStatusText => _cloudSync.IsLoggedIn ? "Connected" : "Not signed in";
    public List<string> ThemeOptions { get; } = ["System", "Light", "Dark"];

    public SettingsViewModel(ISettingsService settings, IUserRepository userRepo, ICloudSyncService cloudSync)
    {
        _settings = settings;
        _userRepo = userRepo;
        _cloudSync = cloudSync;
        Title = "Settings";
    }

    partial void OnNicknameChanged(string value)
    {
        OnPropertyChanged(nameof(AvatarLetter));
    }

    public override async Task InitializeAsync()
    {
        await ExecuteAsync(async () =>
        {
            var profile = await _userRepo.GetProfileAsync();
            Nickname = profile.Nickname;
            Bio = profile.Bio ?? string.Empty;
            AvatarColor = profile.AvatarColor;

            SelectedThemeIndex = (int)_settings.ThemeMode;
            RestTimerSeconds = _settings.DefaultRestTimerSeconds;
            UseKg = _settings.UseKg;
            AutoStartRestTimer = _settings.AutoStartRestTimer;

            OnPropertyChanged(nameof(CloudStatusText));
        });
    }

    partial void OnSelectedThemeIndexChanged(int value)
    {
        var mode = (ThemeMode)value;
        _settings.ThemeMode = mode;

        if (Application.Current is null) return;
        Application.Current.UserAppTheme = mode switch
        {
            ThemeMode.Light => AppTheme.Light,
            ThemeMode.Dark => AppTheme.Dark,
            _ => AppTheme.Unspecified
        };
    }

    [RelayCommand]
    private async Task Save()
    {
        _settings.DefaultRestTimerSeconds = RestTimerSeconds;
        _settings.UseKg = UseKg;
        _settings.AutoStartRestTimer = AutoStartRestTimer;

        // Save nickname and bio to profile
        var profile = await _userRepo.GetProfileAsync();
        profile.Nickname = Nickname;
        profile.Bio = Bio;
        await _userRepo.SaveProfileAsync(profile);

        await Shell.Current.GoToAsync("..");
    }

    [RelayCommand]
    private async Task RedoOnboarding()
    {
        var profile = await _userRepo.GetProfileAsync();
        profile.HasCompletedOnboarding = false;
        await _userRepo.SaveProfileAsync(profile);
        await Shell.Current.GoToAsync("onboarding");
    }

    [RelayCommand]
    private async Task GoToAuth()
    {
        await Shell.Current.GoToAsync("auth");
    }
}
