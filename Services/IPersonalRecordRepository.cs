using PlateUp.Models;

namespace PlateUp.Services;

public interface IPersonalRecordRepository
{
    Task<List<PersonalRecord>> GetByExerciseIdAsync(int exerciseId);
    Task<List<PersonalRecord>> GetRecentAsync(int count);
    Task<bool> CheckAndSaveAsync(int exerciseId, int workoutId, double weight, int reps);
}
