namespace PlateUp.Services;

public interface ITimerNotificationService
{
    void ScheduleRestTimerNotification(int secondsFromNow);
    void CancelRestTimerNotification();
}
