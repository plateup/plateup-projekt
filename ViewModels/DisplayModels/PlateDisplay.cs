namespace PlateUp.ViewModels.DisplayModels;

public class PlateDisplay
{
    public double Weight { get; set; }
    public string Color { get; set; } = "#9E9E9E";
    public int Count { get; set; }
    public double WidthFactor { get; set; }

    public double DisplayWidth => 8 + WidthFactor * 16;
    public double DisplayHeight => 40 + WidthFactor * 40;

    public static string GetPlateColor(double weight) => weight switch
    {
        25 => "#E53935",
        20 => "#1E88E5",
        15 => "#FDD835",
        10 => "#43A047",
        5 => "#FFFFFF",
        2.5 => "#212121",
        1.25 => "#9E9E9E",
        _ => "#9E9E9E"
    };

    public static double GetWidthFactor(double weight) => weight switch
    {
        25 => 1.0,
        20 => 0.9,
        15 => 0.8,
        10 => 0.7,
        5 => 0.55,
        2.5 => 0.4,
        1.25 => 0.3,
        _ => 0.3
    };
}
