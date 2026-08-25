using Foundation;
using PlateUp.Services;
using UserNotifications;

namespace PlateUp.Platforms.iOS.Services;

public class TimerNotificationService : ITimerNotificationService
{
    private const string NotificationId = "rest_timer";

    public TimerNotificationService()
    {
        UNUserNotificationCenter.Current.RequestAuthorization(
            UNAuthorizationOptions.Alert | UNAuthorizationOptions.Sound | UNAuthorizationOptions.Badge,
            (granted, _) => { });
    }

    public void ScheduleRestTimerNotification(int secondsFromNow)
    {
        CancelRestTimerNotification();

        var content = new UNMutableNotificationContent
        {
            Title = "Rest Complete",
            Body = "Time to lift!",
            Sound = UNNotificationSound.Default
        };

        var trigger = UNTimeIntervalNotificationTrigger.CreateTrigger(secondsFromNow, false);
        var request = UNNotificationRequest.FromIdentifier(NotificationId, content, trigger);

        UNUserNotificationCenter.Current.AddNotificationRequest(request, null);
    }

    public void CancelRestTimerNotification()
    {
        UNUserNotificationCenter.Current.RemovePendingNotificationRequests([NotificationId]);
        UNUserNotificationCenter.Current.RemoveDeliveredNotifications([NotificationId]);
    }
}
