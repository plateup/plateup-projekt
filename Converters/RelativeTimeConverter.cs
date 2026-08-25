using System.Globalization;

namespace PlateUp.Converters;

public class RelativeTimeConverter : IValueConverter
{
    public object? Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
    {
        if (value is not DateTime dateTime)
            return string.Empty;

        var now = DateTime.Now;
        var diff = now - dateTime;

        if (diff.TotalMinutes < 1)
            return "Just now";
        if (diff.TotalMinutes < 60)
            return $"{(int)diff.TotalMinutes}m ago";
        if (diff.TotalHours < 24)
            return $"{(int)diff.TotalHours}h ago";
        if (diff.TotalDays < 2)
            return "Yesterday";
        if (diff.TotalDays < 7)
            return $"{(int)diff.TotalDays}d ago";

        return dateTime.ToString("MMM dd", CultureInfo.InvariantCulture);
    }

    public object? ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
        => throw new NotSupportedException();
}
