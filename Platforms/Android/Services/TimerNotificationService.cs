using Android.App;
using Android.Content;
using Android.OS;
using AndroidX.Core.App;
using PlateUp.Services;

namespace PlateUp.Platforms.Android.Services;

public class TimerNotificationService : ITimerNotificationService
{
    private const string ChannelId = "rest_timer";
    private const int NotificationId = 1001;

    public TimerNotificationService()
    {
        CreateNotificationChannel();
    }

    public void ScheduleRestTimerNotification(int secondsFromNow)
    {
        CancelRestTimerNotification();

        var context = global::Android.App.Application.Context;
        var alarmManager = context.GetSystemService(Context.AlarmService) as AlarmManager;
        if (alarmManager is null) return;

        var intent = new Intent(context, typeof(RestTimerReceiver));
        var pendingIntent = PendingIntent.GetBroadcast(
            context, NotificationId, intent,
            PendingIntentFlags.UpdateCurrent | PendingIntentFlags.Immutable);

        var triggerTime = Java.Lang.JavaSystem.CurrentTimeMillis() + secondsFromNow * 1000L;

        if (Build.VERSION.SdkInt >= BuildVersionCodes.S)
        {
            if (alarmManager.CanScheduleExactAlarms())
                alarmManager.SetExactAndAllowWhileIdle(AlarmType.RtcWakeup, triggerTime, pendingIntent);
            else
                alarmManager.Set(AlarmType.RtcWakeup, triggerTime, pendingIntent);
        }
        else
        {
            alarmManager.SetExactAndAllowWhileIdle(AlarmType.RtcWakeup, triggerTime, pendingIntent);
        }
    }

    public void CancelRestTimerNotification()
    {
        var context = global::Android.App.Application.Context;
        var alarmManager = context.GetSystemService(Context.AlarmService) as AlarmManager;
        var intent = new Intent(context, typeof(RestTimerReceiver));
        var pendingIntent = PendingIntent.GetBroadcast(
            context, NotificationId, intent,
            PendingIntentFlags.UpdateCurrent | PendingIntentFlags.Immutable);

        alarmManager?.Cancel(pendingIntent);

        // Also dismiss any shown notification
        var notificationManager = NotificationManagerCompat.From(context);
        notificationManager.Cancel(NotificationId);
    }

    private static void CreateNotificationChannel()
    {
        if (Build.VERSION.SdkInt < BuildVersionCodes.O) return;

        var channel = new NotificationChannel(ChannelId, "Rest Timer", NotificationImportance.High)
        {
            Description = "Notifies when rest timer is complete"
        };
        channel.EnableVibration(true);
        channel.SetVibrationPattern([0, 300, 200, 300]);

        var manager = (NotificationManager?)global::Android.App.Application.Context
            .GetSystemService(Context.NotificationService);
        manager?.CreateNotificationChannel(channel);
    }
}

[BroadcastReceiver(Enabled = true, Exported = false)]
public class RestTimerReceiver : BroadcastReceiver
{
    public override void OnReceive(Context? context, Intent? intent)
    {
        if (context is null) return;

        var tapIntent = context.PackageManager?.GetLaunchIntentForPackage(context.PackageName ?? "");
        var pendingTap = PendingIntent.GetActivity(
            context, 0, tapIntent,
            PendingIntentFlags.UpdateCurrent | PendingIntentFlags.Immutable);

        var notification = new NotificationCompat.Builder(context, "rest_timer")
            .SetSmallIcon(global::Android.Resource.Drawable.IcDialogInfo)
            .SetContentTitle("Rest Complete")
            .SetContentText("Time to lift! 💪")
            .SetPriority(NotificationCompat.PriorityHigh)
            .SetAutoCancel(true)
            .SetContentIntent(pendingTap)
            .SetVibrate([0, 300, 200, 300])
            .Build();

        NotificationManagerCompat.From(context).Notify(1001, notification);
    }
}
