using PlateUp.Models;

namespace PlateUp.Services;

public interface IExerciseRepository
{
    Task<List<Exercise>> GetAllAsync();
    Task<Exercise?> GetByIdAsync(int id);
    Task<List<Exercise>> GetByMuscleGroupAsync(MuscleGroup group);
    Task<List<Exercise>> SearchAsync(string query);
    Task<int> SaveAsync(Exercise exercise);
    Task DeleteAsync(int id);
    Task SeedDefaultExercisesAsync();
}
