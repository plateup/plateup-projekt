using System.Globalization;
using PlateUp.Models;

namespace PlateUp.Converters;

public class MuscleGroupToColorConverter : IValueConverter
{
    public object? Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
    {
        var group = value switch
        {
            MuscleGroup mg => mg,
            int i => (MuscleGroup)i,
            _ => MuscleGroup.Chest
        };

        var key = group switch
        {
            MuscleGroup.Chest => "MuscleChest",
            MuscleGroup.Back => "MuscleBack",
            MuscleGroup.Shoulders => "MuscleShoulders",
            MuscleGroup.Biceps => "MuscleBiceps",
            MuscleGroup.Triceps => "MuscleTriceps",
            MuscleGroup.Legs => "MuscleLegs",
            MuscleGroup.Core => "MuscleCore",
            MuscleGroup.Cardio => "MuscleCardio",
            _ => "MuscleChest"
        };

        if (Application.Current?.Resources.TryGetValue(key, out var color) == true && color is Color c)
            return c;
        return Colors.Gray;
    }

    public object? ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
        => throw new NotSupportedException();
}
