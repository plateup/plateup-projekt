using System.Globalization;
using PlateUp.Models;

namespace PlateUp.Helpers;

public class SuggestionTypeToColorConverter : IValueConverter
{
    public object? Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
    {
        if (value is not int typeInt) return Colors.Gray;

        return (SuggestionType)typeInt switch
        {
            SuggestionType.RoutineSuggestion => Color.FromArgb("#636366"),
            SuggestionType.ProgressTip => Color.FromArgb("#8E8E93"),
            SuggestionType.RecoveryWarning => Color.FromArgb("#FF3B30"),
            SuggestionType.PRPrediction => Color.FromArgb("#34C759"),
            SuggestionType.WeeklyPlan => Color.FromArgb("#48484A"),
            _ => Colors.Gray
        };
    }

    public object? ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
        => throw new NotSupportedException();
}
