namespace PlateUp.Helpers;

public static class AnimationExtensions
{
    public static async Task AnimateTap(this VisualElement element)
    {
        await element.ScaleToAsync(0.95, 80, Easing.CubicIn);
        await element.ScaleToAsync(1.0, 80, Easing.CubicOut);
    }

    public static async Task FadeInFromBottom(this VisualElement element, uint duration = 250)
    {
        element.Opacity = 0;
        element.TranslationY = 20;
        await Task.WhenAll(
            element.FadeToAsync(1, duration, Easing.CubicOut),
            element.TranslateToAsync(0, 0, duration, Easing.CubicOut));
    }

    public static async Task PopIn(this VisualElement element, uint duration = 200)
    {
        element.Scale = 0;
        element.Opacity = 1;
        await element.ScaleToAsync(1.1, (uint)(duration * 0.6), Easing.CubicOut);
        await element.ScaleToAsync(1.0, (uint)(duration * 0.4), Easing.CubicIn);
    }

    public static async Task FadeInPage(this VisualElement content, uint duration = 200)
    {
        content.Opacity = 0;
        await content.FadeToAsync(1, duration, Easing.CubicOut);
    }
}
