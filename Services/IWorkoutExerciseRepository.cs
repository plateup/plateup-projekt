using PlateUp.Models;

namespace PlateUp.Services;

public interface IWorkoutExerciseRepository
{
    Task<List<WorkoutExercise>> GetByWorkoutIdAsync(int workoutId);
    Task<List<WorkoutExercise>> GetByExerciseIdAsync(int exerciseId);
    Task<int> SaveAsync(WorkoutExercise workoutExercise);
    Task DeleteAsync(int id);
    Task ReorderAsync(List<WorkoutExercise> exercises);
}
