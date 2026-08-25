using CommunityToolkit.Mvvm.Messaging.Messages;
using PlateUp.Models;

namespace PlateUp.Messages;

public class ExercisesSelectedMessage : ValueChangedMessage<List<Exercise>>
{
    public ExercisesSelectedMessage(List<Exercise> value) : base(value) { }
}
