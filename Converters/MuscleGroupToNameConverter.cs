using System.Globalization;
using PlateUp.Models;

namespace PlateUp.Converters;

public class MuscleGroupToNameConverter : IValueConverter
{
    public object? Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
    {
        var group = value switch
        {
            MuscleGroup mg => mg,
            int i => (MuscleGroup)i,
            _ => MuscleGroup.Chest
        };

        return group switch
        {
            MuscleGroup.Chest => "Chest",
            MuscleGroup.Back => "Back",
            MuscleGroup.Shoulders => "Shoulders",
            MuscleGroup.Biceps => "Biceps",
            MuscleGroup.Triceps => "Triceps",
            MuscleGroup.Legs => "Legs",
            MuscleGroup.Core => "Core",
            MuscleGroup.Cardio => "Cardio",
            _ => "Full Body"
        };
    }

    public object? ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
        => throw new NotSupportedException();
}
