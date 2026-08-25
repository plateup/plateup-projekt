using CommunityToolkit.Maui.Extensions;
using PlateUp.Controls;
using PlateUp.Helpers;
using PlateUp.Popups;
using PlateUp.ViewModels;
using PlateUp.ViewModels.WorkoutViewModels;

namespace PlateUp.Views;

public partial class LiveWorkoutPage : ContentPage
{
    private CircularTimerDrawable? _timerDrawable;

    public LiveWorkoutPage(LiveWorkoutViewModel viewModel)
    {
        InitializeComponent();
        BindingContext = viewModel;
    }

    protected override async void OnAppearing()
    {
        base.OnAppearing();

        SetupCircularTimer();

        if (BindingContext is BaseViewModel vm)
            await vm.InitializeAsync();
    }

    protected override void OnDisappearing()
    {
        base.OnDisappearing();
        if (BindingContext is BaseViewModel vm)
            vm.OnDisappearing();
    }

    // 8a. Back button during LiveWorkout
    protected override bool OnBackButtonPressed()
    {
        Dispatcher.Dispatch(async () =>
        {
            var discard = await DisplayAlertAsync(
                "Workout in Progress",
                "Discard this workout?",
                "Discard", "Cancel");
            if (discard && BindingContext is LiveWorkoutViewModel vm)
                await vm.CancelWorkoutCommand.ExecuteAsync(null);
        });
        return true; // prevent default back
    }

    private void SetupCircularTimer()
    {
        if (_timerDrawable is not null) return;

        _timerDrawable = new CircularTimerDrawable();
        TimerGraphicsView.Drawable = _timerDrawable;

        if (BindingContext is LiveWorkoutViewModel vm)
        {
            vm.PropertyChanged += (s, e) =>
            {
                if (_timerDrawable is null) return;

                if (e.PropertyName is nameof(vm.RestTimerProgress) or nameof(vm.RestTimerText))
                {
                    _timerDrawable.Progress = vm.RestTimerProgress;
                    _timerDrawable.TimeText = vm.RestTimerText;

                    var isDark = Application.Current?.RequestedTheme == AppTheme.Dark;
                    _timerDrawable.TrackColor = isDark ? Color.FromArgb("#333333") : Color.FromArgb("#E0E0E0");
                    _timerDrawable.TextColor = isDark ? Colors.White : Color.FromArgb("#1A1A1A");

                    TimerGraphicsView.Invalidate();
                }
            };
        }
    }

    private void OnCheckTapped(object? sender, TappedEventArgs e)
    {
        if (sender is not Border border || border.BindingContext is not SetRowViewModel setVm)
            return;

        if (!setVm.IsCompleted)
        {
            var hasWeight = double.TryParse(setVm.WeightText,
                System.Globalization.NumberStyles.Any,
                System.Globalization.CultureInfo.InvariantCulture, out var w) && w > 0;
            var hasReps = int.TryParse(setVm.RepsText, out var r) && r > 0;

            // Auto-fill from previous results if fields are empty
            if (!hasWeight && setVm.PreviousWeight.HasValue)
            {
                setVm.WeightText = setVm.PreviousWeight.Value.ToString("0.##");
                hasWeight = true;
            }
            if (!hasReps && setVm.PreviousReps.HasValue)
            {
                setVm.RepsText = setVm.PreviousReps.Value.ToString();
                hasReps = true;
            }

            // Still nothing after auto-fill attempt — flash error
            if (!hasWeight && !hasReps)
            {
                _ = FlashBorder(border);
                return;
            }
        }

        setVm.IsCompleted = !setVm.IsCompleted;
    }

    private static async Task FlashBorder(Border border)
    {
        var original = border.Stroke;
        border.Stroke = Color.FromArgb("#F44336");
        await Task.Delay(500);
        border.Stroke = original;
    }

    // 4. Keyboard: Weight Entry Completed -> focus Reps
    private void OnWeightCompleted(object? sender, EventArgs e)
    {
        if (sender is not Entry weightEntry) return;

        // Find the parent Grid, then find the Reps entry (column 3)
        if (weightEntry.Parent is Grid parentGrid)
        {
            // The Reps entry is the next Entry sibling after the Weight Grid
            if (parentGrid.Parent is Grid setRowGrid)
            {
                foreach (var child in setRowGrid.Children)
                {
                    if (child is Entry entry && Grid.GetColumn((BindableObject)child) == 3)
                    {
                        entry.Focus();
                        return;
                    }
                }
            }
        }
    }

    private void OnRepsCompleted(object? sender, EventArgs e)
    {
        if (sender is Entry entry)
            entry.Unfocus();
    }

    private async void OnCalculatorTapped(object? sender, TappedEventArgs e)
    {
        if (sender is not Label label) return;

        string? currentWeight = null;
        if (label.BindingContext is SetRowViewModel setVm && !string.IsNullOrWhiteSpace(setVm.WeightText))
            currentWeight = setVm.WeightText;

        var popup = new PlateCalculatorPopup(currentWeight);
        var resultTask = popup.GetResultAsync();

        this.ShowPopup(popup);

        var result = await resultTask;

        if (!string.IsNullOrWhiteSpace(result)
            && label.BindingContext is SetRowViewModel targetSet)
        {
            targetSet.WeightText = result;
        }
    }
}
