using System.Globalization;

namespace PlateUp.Converters;

public class BoolToColorConverter : IValueConverter
{
    public Color TrueColor { get; set; } = Colors.Transparent;
    public Color FalseColor { get; set; } = Colors.Transparent;
    public bool UseThemed { get; set; }
    public string ThemedTrueColorLightKey { get; set; } = string.Empty;
    public string ThemedTrueColorDarkKey { get; set; } = string.Empty;

    public object? Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
    {
        if (value is not bool b)
            return FalseColor;

        if (!b)
            return FalseColor;

        if (UseThemed && !string.IsNullOrEmpty(ThemedTrueColorLightKey))
        {
            var key = Application.Current?.RequestedTheme == AppTheme.Dark
                ? ThemedTrueColorDarkKey
                : ThemedTrueColorLightKey;

            if (Application.Current?.Resources.TryGetValue(key, out var color) == true && color is Color c)
                return c;
        }

        return TrueColor != Colors.Transparent ? TrueColor : Colors.Green;
    }

    public object? ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
        => throw new NotSupportedException();
}
