using PlateUp.Models;

namespace PlateUp.Services;

public interface ISettingsService
{
    ThemeMode ThemeMode { get; set; }
    int DefaultRestTimerSeconds { get; set; }
    bool UseKg { get; set; }
    bool AutoStartRestTimer { get; set; }
}
