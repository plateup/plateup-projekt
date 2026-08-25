using PlateUp.Helpers;
using PlateUp.ViewModels;

namespace PlateUp.Views;

public partial class OnboardingPage : ContentPage
{
    private readonly VerticalStackLayout[] _steps;
    private readonly Border[] _dots;
    private int _previousStep = -1;
    private bool _isAnimating;

    public OnboardingPage(OnboardingViewModel vm)
    {
        InitializeComponent();
        BindingContext = vm;

        _steps = [Step0, Step1, Step2, Step3, Step4, Step5, Step6, Step7, Step8, Step9, Step10];
        _dots = [Dot0, Dot1, Dot2, Dot3, Dot4, Dot5, Dot6, Dot7, Dot8, Dot9, Dot10];

        // Pre-hide all children opacity so nothing flickers
        foreach (var step in _steps)
        {
            step.IsVisible = false;
            step.Opacity = 0;
            foreach (var child in step.Children)
            {
                if (child is VisualElement ve)
                {
                    ve.Opacity = 0;
                    ve.TranslationX = 0;
                    ve.Scale = 1.0;
                }
            }
        }

        ShowStep(0, animated: false);

        vm.PropertyChanged += (s, e) =>
        {
            if (e.PropertyName == nameof(OnboardingViewModel.CurrentStep))
                ShowStep(vm.CurrentStep, animated: true);
        };
    }

    private async void ShowStep(int step, bool animated)
    {
        if (step < 0 || step >= _steps.Length) return;
        if (_isAnimating) return;
        _isAnimating = true;

        try
        {
            bool forward = step > _previousStep;

            // Hide previous step
            if (_previousStep >= 0 && _previousStep < _steps.Length)
            {
                var prev = _steps[_previousStep];
                if (animated)
                {
                    // Fade out entire container at once - no per-child flicker
                    await prev.FadeTo(0, 180, Easing.CubicIn);
                }
                prev.IsVisible = false;
                prev.Opacity = 0;

                // Reset children positions
                foreach (var child in prev.Children)
                {
                    if (child is VisualElement ve)
                    {
                        ve.TranslationX = 0;
                        ve.Opacity = 1;
                        ve.Scale = 1.0;
                    }
                }
            }

            // Update dots
            for (int i = 0; i < _dots.Length; i++)
            {
                var isActive = i == step;
                var dot = _dots[i];

                if (animated)
                    _ = dot.ScaleTo(isActive ? 1.2 : 1.0, 200, Easing.CubicOut);

                dot.BackgroundColor = isActive
                    ? (Application.Current?.RequestedTheme == AppTheme.Light
                        ? Color.FromArgb("#1C1C1E")
                        : Colors.White)
                    : (Application.Current?.RequestedTheme == AppTheme.Light
                        ? Color.FromArgb("#D1D1D6")
                        : Color.FromArgb("#48484A"));

                dot.WidthRequest = isActive ? 24 : 8;
            }

            // Show current step
            var current = _steps[step];

            if (animated)
            {
                var slideIn = forward ? 40 : -40;

                // Set all children to initial state BEFORE making visible
                foreach (var child in current.Children)
                {
                    if (child is VisualElement ve)
                    {
                        ve.Opacity = 0;
                        ve.TranslationX = slideIn;
                        ve.Scale = 1.0;
                    }
                }

                // Make container visible but at opacity 0 first
                current.Opacity = 1;
                current.IsVisible = true;

                // Staggered fade-in per child
                for (int i = 0; i < current.Children.Count; i++)
                {
                    if (current.Children[i] is VisualElement ve)
                    {
                        // Fire and forget each child animation with stagger
                        var delay = i * 50;
                        _ = AnimateChildIn(ve, delay);
                    }
                }

                // Wait for all animations to roughly complete
                await Task.Delay(current.Children.Count * 50 + 300);

                HapticHelper.Tick();
            }
            else
            {
                // No animation - just show immediately
                foreach (var child in current.Children)
                {
                    if (child is VisualElement ve)
                    {
                        ve.Opacity = 1;
                        ve.TranslationX = 0;
                        ve.Scale = 1.0;
                    }
                }
                current.Opacity = 1;
                current.IsVisible = true;
            }

            // Navigation buttons
            BackButton.IsVisible = step > 0;

            bool isWelcome = step == 0;
            bool isLast = step == _steps.Length - 1;

            GetStartedButton.IsVisible = isWelcome;
            NextButton.IsVisible = !isWelcome && !isLast;

            _previousStep = step;
        }
        finally
        {
            _isAnimating = false;
        }
    }

    private static async Task AnimateChildIn(VisualElement ve, int delayMs)
    {
        if (delayMs > 0)
            await Task.Delay(delayMs);

        await Task.WhenAll(
            ve.FadeTo(1, 300, Easing.CubicOut),
            ve.TranslateTo(0, 0, 300, Easing.CubicOut)
        );
    }

    protected override bool OnBackButtonPressed()
    {
        if (BindingContext is OnboardingViewModel vm && vm.CurrentStep > 0)
        {
            vm.PreviousStepCommand.Execute(null);
            return true;
        }
        return true; // Block back on first step
    }
}
