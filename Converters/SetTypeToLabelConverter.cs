using System.Globalization;
using PlateUp.Models;

namespace PlateUp.Converters;

public class SetTypeToLabelConverter : IValueConverter
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
            SetType.Warmup => "W",
            SetType.Drop => "D",
            SetType.Failure => "F",
            _ => parameter?.ToString() ?? "1"
        };
    }

    public object? ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
        => throw new NotSupportedException();
}
