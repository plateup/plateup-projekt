using PlateUp.Models;

namespace PlateUp.Services;

public class NextWorkoutSuggestion
{
    public string Title { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
    public int? RoutineId { get; set; }
    public MuscleGroup SuggestedMuscleGroup { get; set; }
}

public interface ICoachService
{
    Task<List<CoachSuggestion>> GenerateDailySuggestionsAsync();
    Task<NextWorkoutSuggestion> SuggestNextWorkoutAsync();
    Task<string> GetExerciseTipAsync(int exerciseId);
    Task<List<Exercise>> SuggestExerciseReplacementsAsync(int exerciseId);
    Task<List<CoachSuggestion>> GetActiveSuggestionsAsync();
    Task DismissSuggestionAsync(int suggestionId);
    Task MarkAsReadAsync(int suggestionId);
    Task<int> GetUnreadCountAsync();
}
