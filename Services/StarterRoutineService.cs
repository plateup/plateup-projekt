using PlateUp.Models;

namespace PlateUp.Services;

public class StarterRoutineService
{
    private readonly IExerciseRepository _exerciseRepo;
    private readonly IWorkoutRepository _workoutRepo;
    private readonly IWorkoutExerciseRepository _workoutExerciseRepo;
    private readonly ISetRepository _setRepo;

    public StarterRoutineService(
        IExerciseRepository exerciseRepo,
        IWorkoutRepository workoutRepo,
        IWorkoutExerciseRepository workoutExerciseRepo,
        ISetRepository setRepo)
    {
        _exerciseRepo = exerciseRepo;
        _workoutRepo = workoutRepo;
        _workoutExerciseRepo = workoutExerciseRepo;
        _setRepo = setRepo;
    }

    public List<(string Name, List<string> ExerciseNames)> GetRoutineTemplates(
        FitnessGoal goal, ExperienceLevel level, int daysPerWeek)
    {
        return (level, daysPerWeek) switch
        {
            (ExperienceLevel.Beginner, <= 3) =>
            [
                ("Full Body A", ["Bench Press (Barbell)", "Squat (Barbell)", "Barbell Row", "Overhead Press (Barbell)", "Barbell Curl", "Plank"]),
                ("Full Body B", ["Incline Bench Press", "Leg Press", "Lat Pulldown", "Lateral Raise", "Tricep Pushdown", "Cable Crunch"]),
                ("Full Body C", ["Dumbbell Fly", "Romanian Deadlift", "Seated Cable Row", "Arnold Press", "Hammer Curl", "Hanging Leg Raise"]),
            ],
            (ExperienceLevel.Intermediate, <= 4) =>
            [
                ("Upper Body", ["Bench Press (Barbell)", "Barbell Row", "Overhead Press (Barbell)", "Lat Pulldown", "Barbell Curl", "Tricep Pushdown"]),
                ("Lower Body", ["Squat (Barbell)", "Romanian Deadlift", "Leg Press", "Leg Curl", "Calf Raise", "Cable Crunch"]),
                ("Push", ["Incline Bench Press", "Overhead Press (Barbell)", "Dumbbell Fly", "Lateral Raise", "Tricep Pushdown", "Skull Crusher"]),
                ("Pull", ["Deadlift", "Barbell Row", "Lat Pulldown", "Face Pull", "Barbell Curl", "Hammer Curl"]),
            ],
            _ =>
            [
                ("Push", ["Bench Press (Barbell)", "Incline Bench Press", "Overhead Press (Barbell)", "Lateral Raise", "Tricep Pushdown", "Skull Crusher"]),
                ("Pull", ["Deadlift", "Barbell Row", "Lat Pulldown", "Face Pull", "Barbell Curl", "Hammer Curl"]),
                ("Legs", ["Squat (Barbell)", "Romanian Deadlift", "Leg Press", "Leg Extension", "Leg Curl", "Calf Raise"]),
            ]
        };
    }

    public async Task CreateRoutinesAsync(
        FitnessGoal goal, ExperienceLevel level, int daysPerWeek,
        List<int> selectedIndices)
    {
        var templates = GetRoutineTemplates(goal, level, daysPerWeek);
        var allExercises = await _exerciseRepo.GetAllAsync();
        var exerciseMap = allExercises.ToDictionary(e => e.Name, e => e);

        var (sets, reps) = goal switch
        {
            FitnessGoal.GainStrength => (5, 5),
            FitnessGoal.LoseWeight => (3, 15),
            FitnessGoal.BuildMuscle => (4, 10),
            _ => (3, 10)
        };

        var restTimer = level switch
        {
            ExperienceLevel.Beginner => 120,
            ExperienceLevel.Intermediate => 90,
            _ => 60
        };

        foreach (var idx in selectedIndices)
        {
            if (idx < 0 || idx >= templates.Count) continue;
            var (name, exerciseNames) = templates[idx];

            var workout = new Workout
            {
                Title = name,
                IsTemplate = true,
                IsPublic = false,
                StartTime = DateTime.Now
            };
            var workoutId = await _workoutRepo.SaveWorkoutAsync(workout);

            for (int i = 0; i < exerciseNames.Count; i++)
            {
                if (!exerciseMap.TryGetValue(exerciseNames[i], out var exercise)) continue;

                var we = new WorkoutExercise
                {
                    WorkoutId = workoutId,
                    ExerciseId = exercise.Id,
                    OrderIndex = i,
                    RestTimerSeconds = restTimer
                };
                var weId = await _workoutExerciseRepo.SaveAsync(we);

                for (int j = 0; j < sets; j++)
                {
                    await _setRepo.SaveAsync(new WorkoutSet
                    {
                        WorkoutExerciseId = weId,
                        OrderIndex = j,
                        Weight = 0,
                        Reps = reps
                    });
                }
            }
        }
    }
}
