using CommunityToolkit.Mvvm.ComponentModel;

namespace PlateUp.Services;

public partial class WorkoutSessionService : ObservableObject, IWorkoutSessionService
{
    private IDispatcherTimer? _timer;
    private DateTime _startTime;

    [ObservableProperty] private bool _isActive;
    [ObservableProperty] private int _workoutId;
    [ObservableProperty] private string _workoutTitle = string.Empty;
    [ObservableProperty] private string _elapsedTimeText = "00:00";

    public void Start(int workoutId, string title, DateTime startTime)
    {
        WorkoutId = workoutId;
        WorkoutTitle = title;
        _startTime = startTime;
        IsActive = true;

        _timer?.Stop();
        _timer = Application.Current?.Dispatcher.CreateTimer();
        if (_timer is null) return;

        _timer.Interval = TimeSpan.FromSeconds(1);
        _timer.Tick += (_, _) =>
        {
            ElapsedTimeText = (DateTime.Now - _startTime).ToString(@"mm\:ss");
        };
        _timer.Start();
        ElapsedTimeText = (DateTime.Now - _startTime).ToString(@"mm\:ss");
    }

    public void Stop()
    {
        _timer?.Stop();
        _timer = null;
        IsActive = false;
        WorkoutId = 0;
        WorkoutTitle = string.Empty;
        ElapsedTimeText = "00:00";
    }
}
