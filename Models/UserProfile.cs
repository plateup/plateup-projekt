using SQLite;

namespace PlateUp.Models;

[Table("UserProfiles")]
public class UserProfile
{
    [PrimaryKey, AutoIncrement]
    public int Id { get; set; }

    public string Nickname { get; set; } = "Athlete";

    public string AvatarColor { get; set; } = "#448AFF";

    public string? Bio { get; set; }

    public int TotalExp { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.Now;

    // Onboarding fields
    public int Gender { get; set; }

    public int FitnessGoal { get; set; }

    public int ExperienceLevel { get; set; }

    public int TrainingDaysPerWeek { get; set; } = 3;

    public double? BodyWeightKg { get; set; }

    public int? HeightCm { get; set; }

    public DateTime? DateOfBirth { get; set; }

    public bool HasCompletedOnboarding { get; set; }

    public int PreferredUnits { get; set; }

    public string? AvatarImagePath { get; set; }
}
