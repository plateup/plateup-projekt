namespace PlateUp.Helpers;

public static class HapticHelper
{
    public static void Tick()
    {
        try { HapticFeedback.Default.Perform(HapticFeedbackType.Click); }
        catch { /* Not supported on all devices */ }
    }

    public static void Success()
    {
        try
        {
            HapticFeedback.Default.Perform(HapticFeedbackType.Click);
            Task.Delay(100).ContinueWith(_ =>
            {
                try { HapticFeedback.Default.Perform(HapticFeedbackType.Click); }
                catch { }
            });
        }
        catch { }
    }

    public static void Heavy()
    {
        try { Vibration.Default.Vibrate(TimeSpan.FromMilliseconds(100)); }
        catch { }
    }
}
