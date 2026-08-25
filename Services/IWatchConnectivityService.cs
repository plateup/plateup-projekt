namespace PlateUp.Services;

/// <summary>
/// Interface for communicating with a companion watch app (Apple Watch / Wear OS).
/// Platform implementations will be added in future versions.
/// </summary>
public interface IWatchConnectivityService
{
    bool IsWatchConnected { get; }
    Task SendWorkoutStateAsync(WatchWorkoutState state);
    Task SendTimerStateAsync(WatchTimerState timerState);
    Task RequestSyncAsync();
}

/// <summary>
/// Represents the current workout state to display on the watch.
/// </summary>
public class WatchWorkoutState
{
    public bool IsActive { get; set; }
    public string WorkoutTitle { get; set; } = string.Empty;
    public string CurrentExerciseName { get; set; } = string.Empty;
    public int CurrentSetIndex { get; set; }
    public int TotalSets { get; set; }
    public double CurrentWeight { get; set; }
    public int CurrentReps { get; set; }
    public TimeSpan ElapsedTime { get; set; }
}

/// <summary>
/// Represents the rest timer state to display on the watch.
/// </summary>
public class WatchTimerState
{
    public bool IsRunning { get; set; }
    public int RemainingSeconds { get; set; }
    public int TotalSeconds { get; set; }
}
