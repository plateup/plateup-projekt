using System.Globalization;
using PlateUp.Helpers;

namespace PlateUp.Converters;

public class DoubleToKgLbsConverter : IValueConverter
{
    public bool UseKg { get; set; } = true;

    public object? Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
    {
        var weight = value switch
        {
            double d => d,
            float f => (double)f,
            int i => (double)i,
            _ => 0.0
        };

        if (UseKg)
            return $"{weight:0.##} kg";

        var lbs = weight * Constants.KgToLbsFactor;
        return $"{lbs:0.##} lbs";
    }

    public object? ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
        => throw new NotSupportedException();
}
