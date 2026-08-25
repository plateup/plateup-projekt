using PlateUp.Services;

namespace PlateUp.Controls;

public partial class MiniWorkoutBar : ContentView
{
    private IWorkoutSessionService? _session;

    public MiniWorkoutBar()
    {
        InitializeComponent();
    }

    protected override void OnHandlerChanged()
    {
        base.OnHandlerChanged();

        if (_session is not null) return;

        _session = Handler?.MauiContext?.Services.GetService<IWorkoutSessionService>();
        if (_session is null) return;

        _session.PropertyChanged += (_, e) =>
        {
            if (e.PropertyName == nameof(IWorkoutSessionService.IsActive))
            {
                BarBorder.IsVisible = _session.IsActive;
                if (_session.IsActive)
                    StartPulseAnimation();
            }
            else if (e.PropertyName == nameof(IWorkoutSessionService.ElapsedTimeText))
            {
                TimerLabel.Text = _session.ElapsedTimeText;
            }
            else if (e.PropertyName == nameof(IWorkoutSessionService.WorkoutTitle))
            {
                TitleLabel.Text = _session.WorkoutTitle;
            }
        };

        // Sync initial state
        BarBorder.IsVisible = _session.IsActive;
        if (_session.IsActive)
        {
            TitleLabel.Text = _session.WorkoutTitle;
            TimerLabel.Text = _session.ElapsedTimeText;
            StartPulseAnimation();
        }
    }

    private async void StartPulseAnimation()
    {
        while (_session?.IsActive == true)
        {
            await PulseDot.FadeToAsync(0.3, 800, Easing.CubicInOut);
            await PulseDot.FadeToAsync(1.0, 800, Easing.CubicInOut);
        }
    }

    private async void OnBarTapped(object? sender, TappedEventArgs e)
    {
        if (_session?.IsActive == true)
        {
            await Shell.Current.GoToAsync($"liveworkout?workoutId={_session.WorkoutId}");
        }
    }
}
