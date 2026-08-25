namespace PlateUp.Helpers;

public static class Algorithms
{
    /// <summary>
    /// Epley formula: 1RM = Weight × (1 + Reps/30)
    /// </summary>
    public static double Calculate1RM(double weight, int reps)
    {
        if (reps <= 0 || weight <= 0) return 0;
        if (reps == 1) return weight;
        return Math.Round(weight * (1 + reps / 30.0), 1);
    }

    /// <summary>
    /// Calculate EXP earned from a workout.
    /// </summary>
    public static int CalculateExp(double totalVolume, int durationMinutes, int prCount, bool includesLegs)
    {
        var exp = (totalVolume * 0.01) + (durationMinutes * 2) + (prCount * 50);
        if (includesLegs)
            exp *= 1.2;
        return (int)exp;
    }

    /// <summary>
    /// Level = totalExp / 500 + 1 (minimum 1)
    /// </summary>
    public static int CalculateLevel(int totalExp)
    {
        return Math.Max(1, totalExp / 500 + 1);
    }

    /// <summary>
    /// Get rank name based on level.
    /// </summary>
    public static string GetRankName(int level) => level switch
    {
        <= 5 => "Newbie",
        <= 15 => "Gym Rat",
        <= 30 => "Iron Lifter",
        <= 50 => "Beast Mode",
        _ => "Legend"
    };

    /// <summary>
    /// Calculate plate configuration per side of the barbell.
    /// Greedy algorithm from largest to smallest plate.
    /// </summary>
    public static List<(double PlateWeight, int Count)> CalculatePlates(double totalWeight, double barWeight)
    {
        var result = new List<(double PlateWeight, int Count)>();

        if (totalWeight <= barWeight)
            return result;

        var perSide = (totalWeight - barWeight) / 2.0;

        foreach (var plate in Constants.AvailablePlateWeights)
        {
            var count = (int)(perSide / plate);
            if (count > 0)
            {
                result.Add((plate, count));
                perSide -= count * plate;
            }
        }

        return result;
    }
}
