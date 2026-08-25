using CommunityToolkit.Mvvm.Messaging.Messages;
using PlateUp.ViewModels.WorkoutViewModels;

namespace PlateUp.Messages;

public class SetCompletedMessage : ValueChangedMessage<SetRowViewModel>
{
    public SetCompletedMessage(SetRowViewModel value) : base(value) { }
}
