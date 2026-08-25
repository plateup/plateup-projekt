using PlateUp.Models;

namespace PlateUp.Services;

public interface IWorkoutRepository
{
    Task<List<Workout>> GetAllWorkoutsAsync();
    Task<List<Workout>> GetAllTemplatesAsync();
    Task<Workout?> GetWorkoutByIdAsync(int id);
    Task<List<Workout>> GetPublicWorkoutsAsync();
    Task<int> SaveWorkoutAsync(Workout workout);
    Task DeleteWorkoutAsync(int id);
    Task<int> DuplicateAsTemplateAsync(int workoutId);
    Task<int> DuplicateAsWorkoutAsync(int workoutId);
}
