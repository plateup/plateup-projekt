using PlateUp.Services;

namespace PlateUp;

public partial class App : Application
{
    private readonly IUserRepository _userRepo;
    private readonly ICoachService _coachService;

    public App(ISettingsService settingsService, IUserRepository userRepo, ICoachService coachService)
    {
        InitializeComponent();
        _userRepo = userRepo;
        _coachService = coachService;
        ApplyTheme(settingsService.ThemeMode);
    }

    protected override Window CreateWindow(IActivationState? activationState)
    {
        var shell = new AppShell();
        var window = new Window(shell);

        shell.Loaded += async (s, e) =>
        {
            try
            {
                var profile = await _userRepo.GetProfileAsync();
                if (!profile.HasCompletedOnboarding)
                {
                    await shell.GoToAsync("onboarding");
                }
            }
            catch
            {
                // If profile check fails, proceed to main app
            }
        };

        return window;
    }

    private static void ApplyTheme(Models.ThemeMode mode)
    {
        if (Application.Current is null) return;

        Application.Current.UserAppTheme = mode switch
        {
            Models.ThemeMode.Light => AppTheme.Light,
            Models.ThemeMode.Dark => AppTheme.Dark,
            _ => AppTheme.Unspecified
        };
    }
}
