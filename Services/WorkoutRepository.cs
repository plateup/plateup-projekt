using PlateUp.Models;

namespace PlateUp.Services;

public class WorkoutRepository : IWorkoutRepository
{
    private readonly DatabaseService _db;

    public WorkoutRepository(DatabaseService db)
    {
        _db = db;
    }

    public async Task<List<Workout>> GetAllWorkoutsAsync()
    {
        var conn = await _db.GetConnectionAsync();
        return await conn.Table<Workout>()
            .Where(w => !w.IsTemplate)
            .OrderByDescending(w => w.StartTime)
            .ToListAsync();
    }

    public async Task<List<Workout>> GetAllTemplatesAsync()
    {
        var conn = await _db.GetConnectionAsync();
        return await conn.Table<Workout>()
            .Where(w => w.IsTemplate)
            .ToListAsync();
    }

    public async Task<Workout?> GetWorkoutByIdAsync(int id)
    {
        var conn = await _db.GetConnectionAsync();
        return await conn.Table<Workout>().FirstOrDefaultAsync(w => w.Id == id);
    }

    public async Task<List<Workout>> GetPublicWorkoutsAsync()
    {
        var conn = await _db.GetConnectionAsync();
        return await conn.Table<Workout>()
            .Where(w => w.IsPublic && !w.IsTemplate)
            .OrderByDescending(w => w.StartTime)
            .ToListAsync();
    }

    public async Task<int> SaveWorkoutAsync(Workout workout)
    {
        var conn = await _db.GetConnectionAsync();
        if (workout.Id != 0)
        {
            await conn.UpdateAsync(workout);
            return workout.Id;
        }
        await conn.InsertAsync(workout);
        return workout.Id;
    }

    public async Task DeleteWorkoutAsync(int id)
    {
        var conn = await _db.GetConnectionAsync();

        // Cascade: get exercises, then delete sets for each, then exercises, then workout
        var exercises = await conn.Table<WorkoutExercise>()
            .Where(we => we.WorkoutId == id)
            .ToListAsync();

        foreach (var exercise in exercises)
        {
            await conn.Table<WorkoutSet>()
                .DeleteAsync(s => s.WorkoutExerciseId == exercise.Id);
        }

        await conn.Table<WorkoutExercise>().DeleteAsync(we => we.WorkoutId == id);
        await conn.Table<WorkoutLike>().DeleteAsync(l => l.WorkoutId == id);
        await conn.DeleteAsync<Workout>(id);
    }

    public async Task<int> DuplicateAsTemplateAsync(int workoutId)
    {
        var conn = await _db.GetConnectionAsync();
        var source = await GetWorkoutByIdAsync(workoutId);
        if (source is null) return 0;

        var newWorkout = new Workout
        {
            Title = source.Title,
            IsTemplate = true,
            IsPublic = false,
            StartTime = DateTime.Now,
            SourceTemplateId = workoutId
        };
        await conn.InsertAsync(newWorkout);

        var exercises = await conn.Table<WorkoutExercise>()
            .Where(we => we.WorkoutId == workoutId)
            .OrderBy(we => we.OrderIndex)
            .ToListAsync();

        foreach (var exercise in exercises)
        {
            var newExercise = new WorkoutExercise
            {
                WorkoutId = newWorkout.Id,
                ExerciseId = exercise.ExerciseId,
                OrderIndex = exercise.OrderIndex,
                SupersetGroupId = exercise.SupersetGroupId,
                Notes = exercise.Notes,
                RestTimerSeconds = exercise.RestTimerSeconds
            };
            await conn.InsertAsync(newExercise);

            var sets = await conn.Table<WorkoutSet>()
                .Where(s => s.WorkoutExerciseId == exercise.Id)
                .OrderBy(s => s.OrderIndex)
                .ToListAsync();

            foreach (var set in sets)
            {
                var newSet = new WorkoutSet
                {
                    WorkoutExerciseId = newExercise.Id,
                    OrderIndex = set.OrderIndex,
                    SetType = set.SetType,
                    Weight = set.Weight,
                    Reps = set.Reps,
                    RPE = set.RPE
                };
                await conn.InsertAsync(newSet);
            }
        }

        return newWorkout.Id;
    }

    public async Task<int> DuplicateAsWorkoutAsync(int workoutId)
    {
        var conn = await _db.GetConnectionAsync();
        var source = await GetWorkoutByIdAsync(workoutId);
        if (source is null) return 0;

        var newWorkout = new Workout
        {
            Title = source.Title,
            IsTemplate = false,
            IsPublic = false,
            StartTime = DateTime.Now,
            SourceTemplateId = source.SourceTemplateId
        };
        await conn.InsertAsync(newWorkout);

        var exercises = await conn.Table<WorkoutExercise>()
            .Where(we => we.WorkoutId == workoutId)
            .OrderBy(we => we.OrderIndex)
            .ToListAsync();

        foreach (var exercise in exercises)
        {
            var newExercise = new WorkoutExercise
            {
                WorkoutId = newWorkout.Id,
                ExerciseId = exercise.ExerciseId,
                OrderIndex = exercise.OrderIndex,
                SupersetGroupId = exercise.SupersetGroupId,
                Notes = exercise.Notes,
                RestTimerSeconds = exercise.RestTimerSeconds
            };
            await conn.InsertAsync(newExercise);

            var sets = await conn.Table<WorkoutSet>()
                .Where(s => s.WorkoutExerciseId == exercise.Id)
                .OrderBy(s => s.OrderIndex)
                .ToListAsync();

            foreach (var set in sets)
            {
                var newSet = new WorkoutSet
                {
                    WorkoutExerciseId = newExercise.Id,
                    OrderIndex = set.OrderIndex,
                    SetType = set.SetType,
                    Weight = set.Weight,
                    Reps = set.Reps,
                    RPE = set.RPE
                };
                await conn.InsertAsync(newSet);
            }
        }

        return newWorkout.Id;
    }
}
