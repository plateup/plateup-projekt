using PlateUp.Views;

namespace PlateUp;

public partial class AppShell : Shell
{
    public AppShell()
    {
        InitializeComponent();

        Routing.RegisterRoute("liveworkout", typeof(LiveWorkoutPage));
        Routing.RegisterRoute("workoutsummary", typeof(WorkoutSummaryPage));
        Routing.RegisterRoute("exercisepicker", typeof(ExercisePickerPage));
        Routing.RegisterRoute("exercisedetail", typeof(ExerciseDetailPage));
        Routing.RegisterRoute("routineeditor", typeof(RoutineEditorPage));
        Routing.RegisterRoute("workouthistory", typeof(WorkoutHistoryPage));
        Routing.RegisterRoute("settings", typeof(SettingsPage));
        Routing.RegisterRoute("onboarding", typeof(OnboardingPage));
        Routing.RegisterRoute("auth", typeof(AuthPage));
        Routing.RegisterRoute("gymwrapped", typeof(GymWrappedPage));
        Routing.RegisterRoute("userprofile", typeof(UserProfilePage));
    }
}
