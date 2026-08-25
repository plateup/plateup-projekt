using CommunityToolkit.Mvvm.Messaging.Messages;

namespace PlateUp.Messages;

public class RoutineSavedMessage : ValueChangedMessage<int>
{
    public RoutineSavedMessage(int workoutId) : base(workoutId) { }
}
