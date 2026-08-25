using PlateUp.Models;

namespace PlateUp.Services;

public class SetRepository : ISetRepository
{
    private readonly DatabaseService _db;

    public SetRepository(DatabaseService db)
    {
        _db = db;
    }

    public async Task<List<WorkoutSet>> GetByWorkoutExerciseIdAsync(int workoutExerciseId)
    {
        var conn = await _db.GetConnectionAsync();
        return await conn.Table<WorkoutSet>()
            .Where(s => s.WorkoutExerciseId == workoutExerciseId)
            .OrderBy(s => s.OrderIndex)
            .ToListAsync();
    }

    public async Task<List<WorkoutSet>> GetPreviousResultsAsync(int exerciseId)
    {
        var conn = await _db.GetConnectionAsync();

        // Find the most recent completed workout (not template) that contains this exercise
        var workoutExercises = await conn.Table<WorkoutExercise>()
            .Where(we => we.ExerciseId == exerciseId)
            .ToListAsync();

        if (workoutExercises.Count == 0)
            return [];

        var workoutIds = workoutExercises.Select(we => we.WorkoutId).Distinct().ToList();
        var workouts = await conn.Table<Workout>()
            .Where(w => !w.IsTemplate && w.EndTime != null)
            .OrderByDescending(w => w.StartTime)
            .ToListAsync();

        // Find most recent workout that has this exercise
        var latestWorkout = workouts.FirstOrDefault(w => workoutIds.Contains(w.Id));
        if (latestWorkout is null)
            return [];

        var targetWe = workoutExercises.FirstOrDefault(we => we.WorkoutId == latestWorkout.Id);
        if (targetWe is null)
            return [];

        return await conn.Table<WorkoutSet>()
            .Where(s => s.WorkoutExerciseId == targetWe.Id)
            .OrderBy(s => s.OrderIndex)
            .ToListAsync();
    }

    public async Task<int> SaveAsync(WorkoutSet workoutSet)
    {
        var conn = await _db.GetConnectionAsync();
        if (workoutSet.Id != 0)
        {
            await conn.UpdateAsync(workoutSet);
            return workoutSet.Id;
        }
        await conn.InsertAsync(workoutSet);
        return workoutSet.Id;
    }

    public async Task DeleteAsync(int id)
    {
        var conn = await _db.GetConnectionAsync();
        await conn.DeleteAsync<WorkoutSet>(id);
    }
}
