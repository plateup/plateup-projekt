using System.ComponentModel;

namespace PlateUp.Services;

public interface IWorkoutSessionService : INotifyPropertyChanged
{
    bool IsActive { get; }
    int WorkoutId { get; }
    string WorkoutTitle { get; set; }
    string ElapsedTimeText { get; }

    void Start(int workoutId, string title, DateTime startTime);
    void Stop();
}
