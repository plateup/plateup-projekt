namespace PlateUp.Controls;

public class CircularTimerDrawable : IDrawable
{
    public double Progress { get; set; } = 1.0;
    public string TimeText { get; set; } = "0:00";
    public Color TrackColor { get; set; } = Colors.Grey;
    public Color ProgressColor { get; set; } = Color.FromArgb("#448AFF");
    public Color TextColor { get; set; } = Colors.White;

    public void Draw(ICanvas canvas, RectF dirtyRect)
    {
        var size = Math.Min(dirtyRect.Width, dirtyRect.Height);
        var centerX = dirtyRect.Width / 2;
        var centerY = dirtyRect.Height / 2;
        var radius = size / 2 - 8;
        var strokeWidth = 8f;

        // Track circle
        canvas.StrokeColor = TrackColor;
        canvas.StrokeSize = strokeWidth;
        canvas.StrokeLineCap = LineCap.Round;
        canvas.DrawCircle(centerX, centerY, radius);

        // Progress arc
        if (Progress > 0)
        {
            canvas.StrokeColor = ProgressColor;
            canvas.StrokeSize = strokeWidth;
            canvas.StrokeLineCap = LineCap.Round;

            var sweepAngle = (float)(360 * Progress);
            var startAngle = -90f;

            var arcRect = new RectF(
                centerX - radius,
                centerY - radius,
                radius * 2,
                radius * 2);

            canvas.DrawArc(arcRect.X, arcRect.Y, arcRect.Width, arcRect.Height,
                startAngle, startAngle + sweepAngle, false, false);
        }

        // Time text
        canvas.FontColor = TextColor;
        canvas.FontSize = size * 0.2f;
        canvas.Font = Microsoft.Maui.Graphics.Font.Default;
        canvas.DrawString(TimeText, dirtyRect, HorizontalAlignment.Center, VerticalAlignment.Center);
    }
}
