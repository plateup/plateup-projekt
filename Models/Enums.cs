namespace PlateUp.Models;

public enum MuscleGroup
{
    Chest = 0,
    Back = 1,
    Shoulders = 2,
    Biceps = 3,
    Triceps = 4,
    Legs = 5,
    Core = 6,
    Cardio = 7,
    FullBody = 8,
    Other = 9
}

public enum ExerciseType
{
    Barbell = 0,
    Dumbbell = 1,
    Machine = 2,
    Cable = 3,
    Bodyweight = 4,
    Duration = 5,
    Other = 6
}

public enum SetType
{
    Normal = 0,
    Warmup = 1,
    Drop = 2,
    Failure = 3
}

public enum RecordType
{
    MaxWeight = 0,
    Max1RM = 1,
    MaxVolume = 2
}

public enum ThemeMode
{
    System = 0,
    Light = 1,
    Dark = 2
}

public enum Gender
{
    Male = 0,
    Female = 1,
    Other = 2,
    PreferNotToSay = 3
}

public enum FitnessGoal
{
    BuildMuscle = 0,
    LoseWeight = 1,
    GainStrength = 2,
    StayFit = 3,
    Recomp = 4
}

public enum ExperienceLevel
{
    Beginner = 0,
    Intermediate = 1,
    Advanced = 2,
    Athlete = 3
}

public enum PreferredUnits
{
    Metric = 0,
    Imperial = 1
}
