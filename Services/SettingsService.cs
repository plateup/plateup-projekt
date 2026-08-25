using PlateUp.Models;

namespace PlateUp.Services;

public class SettingsService : ISettingsService
{
    private const string ThemeModeKey = "theme_mode";
    private const string RestTimerKey = "default_rest_timer";
    private const string UseKgKey = "use_kg";
    private const string AutoStartRestTimerKey = "auto_start_rest_timer";

    public ThemeMode ThemeMode
    {
        get => (ThemeMode)Preferences.Default.Get(ThemeModeKey, (int)ThemeMode.Dark);
        set => Preferences.Default.Set(ThemeModeKey, (int)value);
    }

    public int DefaultRestTimerSeconds
    {
        get => Preferences.Default.Get(RestTimerKey, 90);
        set => Preferences.Default.Set(RestTimerKey, value);
    }

    public bool UseKg
    {
        get => Preferences.Default.Get(UseKgKey, true);
        set => Preferences.Default.Set(UseKgKey, value);
    }

    public bool AutoStartRestTimer
    {
        get => Preferences.Default.Get(AutoStartRestTimerKey, true);
        set => Preferences.Default.Set(AutoStartRestTimerKey, value);
    }
}
