using System.Globalization;
using PlateUp.Models;

namespace PlateUp.Converters;

public class SetTypeToColorConverter : IValueConverter
{
    public object? Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
    {
        var setType = value switch
        {
            SetType st => st,
            int i => (SetType)i,
            _ => SetType.Normal
        };

        return setType switch
        {
            SetType.Warmup => GetColor("WarmupColor"),
            SetType.Drop => GetColor("DropSetColor"),
            SetType.Failure => GetColor("DangerRed"),
            _ => GetThemedColor("TextPrimaryLight", "TextPrimaryDark")
        };
    }

    public object? ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
        => throw new NotSupportedException();

    private static Color GetColor(string key)
    {
        if (Application.Current?.Resources.TryGetValue(key, out var color) == true && color is Color c)
            return c;
        return Colors.White;
    }

    private static Color GetThemedColor(string lightKey, string darkKey)
    {
        var key = Application.Current?.RequestedTheme == AppTheme.Dark ? darkKey : lightKey;
        return GetColor(key);
    }
}
