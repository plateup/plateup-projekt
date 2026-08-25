using PlateUp.Models;

namespace PlateUp.Services;

public class WorkoutExerciseRepository : IWorkoutExerciseRepository
{
    private readonly DatabaseService _db;

    public WorkoutExerciseRepository(DatabaseService db)
    {
        _db = db;
    }

    public async Task<List<WorkoutExercise>> GetByWorkoutIdAsync(int workoutId)
    {
        var conn = await _db.GetConnectionAsync();
        return await conn.Table<WorkoutExercise>()
            .Where(we => we.WorkoutId == workoutId)
            .OrderBy(we => we.OrderIndex)
            .ToListAsync();
    }

    public async Task<List<WorkoutExercise>> GetByExerciseIdAsync(int exerciseId)
    {
        var conn = await _db.GetConnectionAsync();
        return await conn.Table<WorkoutExercise>()
            .Where(we => we.ExerciseId == exerciseId)
            .ToListAsync();
    }

    public async Task<int> SaveAsync(WorkoutExercise workoutExercise)
    {
        var conn = await _db.GetConnectionAsync();
        if (workoutExercise.Id != 0)
        {
            await conn.UpdateAsync(workoutExercise);
            return workoutExercise.Id;
        }
        await conn.InsertAsync(workoutExercise);
        return workoutExercise.Id;
    }

    public async Task DeleteAsync(int id)
    {
        var conn = await _db.GetConnectionAsync();
        // Cascade: delete sets first
        await conn.Table<WorkoutSet>().DeleteAsync(s => s.WorkoutExerciseId == id);
        await conn.DeleteAsync<WorkoutExercise>(id);
    }

    public async Task ReorderAsync(List<WorkoutExercise> exercises)
    {
        var conn = await _db.GetConnectionAsync();
        for (int i = 0; i < exercises.Count; i++)
        {
            exercises[i].OrderIndex = i;
            await conn.UpdateAsync(exercises[i]);
        }
    }
}
