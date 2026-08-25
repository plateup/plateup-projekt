using PlateUp.Helpers;
using PlateUp.Models;

namespace PlateUp.Services;

public class PersonalRecordRepository : IPersonalRecordRepository
{
    private readonly DatabaseService _db;

    public PersonalRecordRepository(DatabaseService db)
    {
        _db = db;
    }

    public async Task<List<PersonalRecord>> GetByExerciseIdAsync(int exerciseId)
    {
        var conn = await _db.GetConnectionAsync();
        return await conn.Table<PersonalRecord>()
            .Where(pr => pr.ExerciseId == exerciseId)
            .OrderByDescending(pr => pr.Date)
            .ToListAsync();
    }

    public async Task<List<PersonalRecord>> GetRecentAsync(int count)
    {
        var conn = await _db.GetConnectionAsync();
        return await conn.Table<PersonalRecord>()
            .OrderByDescending(pr => pr.Date)
            .Take(count)
            .ToListAsync();
    }

    public async Task<bool> CheckAndSaveAsync(int exerciseId, int workoutId, double weight, int reps)
    {
        if (weight <= 0 || reps <= 0) return false;

        var conn = await _db.GetConnectionAsync();
        var now = DateTime.Now;
        var newPr = false;

        // Check Max Weight
        var existingMaxWeight = await conn.Table<PersonalRecord>()
            .Where(pr => pr.ExerciseId == exerciseId && pr.RecordType == (int)RecordType.MaxWeight)
            .OrderByDescending(pr => pr.Value)
            .FirstOrDefaultAsync();

        if (existingMaxWeight is null || weight > existingMaxWeight.Value)
        {
            await conn.InsertAsync(new PersonalRecord
            {
                ExerciseId = exerciseId,
                WorkoutId = workoutId,
                RecordType = (int)RecordType.MaxWeight,
                Value = weight,
                Date = now
            });
            newPr = true;
        }

        // Check Max 1RM (Epley)
        var estimated1RM = Algorithms.Calculate1RM(weight, reps);
        if (estimated1RM > 0)
        {
            var existingMax1RM = await conn.Table<PersonalRecord>()
                .Where(pr => pr.ExerciseId == exerciseId && pr.RecordType == (int)RecordType.Max1RM)
                .OrderByDescending(pr => pr.Value)
                .FirstOrDefaultAsync();

            if (existingMax1RM is null || estimated1RM > existingMax1RM.Value)
            {
                await conn.InsertAsync(new PersonalRecord
                {
                    ExerciseId = exerciseId,
                    WorkoutId = workoutId,
                    RecordType = (int)RecordType.Max1RM,
                    Value = estimated1RM,
                    Date = now
                });
                newPr = true;
            }
        }

        // Check Max Volume (weight * reps)
        var volume = weight * reps;
        var existingMaxVolume = await conn.Table<PersonalRecord>()
            .Where(pr => pr.ExerciseId == exerciseId && pr.RecordType == (int)RecordType.MaxVolume)
            .OrderByDescending(pr => pr.Value)
            .FirstOrDefaultAsync();

        if (existingMaxVolume is null || volume > existingMaxVolume.Value)
        {
            await conn.InsertAsync(new PersonalRecord
            {
                ExerciseId = exerciseId,
                WorkoutId = workoutId,
                RecordType = (int)RecordType.MaxVolume,
                Value = volume,
                Date = now
            });
            newPr = true;
        }

        return newPr;
    }
}
