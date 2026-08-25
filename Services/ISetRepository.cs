using PlateUp.Models;

namespace PlateUp.Services;

public interface ISetRepository
{
    Task<List<WorkoutSet>> GetByWorkoutExerciseIdAsync(int workoutExerciseId);
    Task<List<WorkoutSet>> GetPreviousResultsAsync(int exerciseId);
    Task<int> SaveAsync(WorkoutSet workoutSet);
    Task DeleteAsync(int id);
}
