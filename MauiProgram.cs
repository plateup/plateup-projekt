using CommunityToolkit.Maui;
using Microsoft.Extensions.Logging;
using PlateUp.Services;
using PlateUp.ViewModels;
using PlateUp.Views;
using SkiaSharp.Views.Maui.Controls.Hosting;

namespace PlateUp;

public static class MauiProgram
{
    public static MauiApp CreateMauiApp()
    {
        var builder = MauiApp.CreateBuilder();
        builder
            .UseMauiApp<App>()
            .UseMauiCommunityToolkit()
            .UseSkiaSharp()
            .ConfigureFonts(fonts =>
            {
                fonts.AddFont("OpenSans-Regular.ttf", "OpenSansRegular");
                fonts.AddFont("OpenSans-Semibold.ttf", "OpenSansSemibold");
                fonts.AddFont("fa-solid-900.ttf", "FASolid");
            })
            .ConfigureMauiHandlers(handlers =>
            {
#if ANDROID
                // Remove Android underline from Entry and Editor
                Microsoft.Maui.Handlers.EntryHandler.Mapper.AppendToMapping("NoUnderline", (handler, view) =>
                {
                    handler.PlatformView.BackgroundTintList =
                        Android.Content.Res.ColorStateList.ValueOf(Android.Graphics.Color.Transparent);
                });
                Microsoft.Maui.Handlers.EditorHandler.Mapper.AppendToMapping("NoUnderline", (handler, view) =>
                {
                    handler.PlatformView.BackgroundTintList =
                        Android.Content.Res.ColorStateList.ValueOf(Android.Graphics.Color.Transparent);
                });
                Microsoft.Maui.Handlers.SearchBarHandler.Mapper.AppendToMapping("NoUnderline", (handler, view) =>
                {
                    var linearLayout = handler.PlatformView;
                    linearLayout.SetBackgroundColor(Android.Graphics.Color.Transparent);
                });
#endif
            });

        // Services (Singletons)
        builder.Services.AddSingleton<DatabaseService>();
        builder.Services.AddSingleton<IExerciseRepository, ExerciseRepository>();
        builder.Services.AddSingleton<IWorkoutRepository, WorkoutRepository>();
        builder.Services.AddSingleton<IWorkoutExerciseRepository, WorkoutExerciseRepository>();
        builder.Services.AddSingleton<ISetRepository, SetRepository>();
        builder.Services.AddSingleton<IPersonalRecordRepository, PersonalRecordRepository>();
        builder.Services.AddSingleton<IUserRepository, UserRepository>();
        builder.Services.AddSingleton<ISettingsService, SettingsService>();

        // Domain Services
#if ANDROID
        builder.Services.AddSingleton<ITimerNotificationService, Platforms.Android.Services.TimerNotificationService>();
#elif IOS
        builder.Services.AddSingleton<ITimerNotificationService, Platforms.iOS.Services.TimerNotificationService>();
#endif
        builder.Services.AddSingleton<StarterRoutineService>();
        builder.Services.AddSingleton<ICoachService, CoachService>();
        builder.Services.AddSingleton<SupabaseService>();
        builder.Services.AddSingleton<ICloudSyncService, CloudSyncService>();
        builder.Services.AddSingleton<IChatService, ChatService>();
        builder.Services.AddSingleton<IWorkoutSessionService, WorkoutSessionService>();

        // ViewModels (Transient)
        builder.Services.AddTransient<OnboardingViewModel>();
        builder.Services.AddTransient<FeedViewModel>();
        builder.Services.AddTransient<WorkoutHubViewModel>();
        builder.Services.AddTransient<ProfileViewModel>();
        builder.Services.AddSingleton<LiveWorkoutViewModel>();
        builder.Services.AddTransient<WorkoutSummaryViewModel>();
        builder.Services.AddTransient<ExercisePickerViewModel>();
        builder.Services.AddTransient<ExerciseDetailViewModel>();
        builder.Services.AddTransient<RoutineEditorViewModel>();
        builder.Services.AddTransient<WorkoutHistoryViewModel>();
        builder.Services.AddTransient<SettingsViewModel>();
        builder.Services.AddTransient<CoachViewModel>();
        builder.Services.AddTransient<AuthViewModel>();
        builder.Services.AddTransient<GymWrappedViewModel>();
        builder.Services.AddTransient<UserProfileViewModel>();

        // Pages (Transient)
        builder.Services.AddTransient<FeedPage>();
        builder.Services.AddTransient<WorkoutHubPage>();
        builder.Services.AddTransient<ProfilePage>();
        builder.Services.AddTransient<LiveWorkoutPage>();
        builder.Services.AddTransient<WorkoutSummaryPage>();
        builder.Services.AddTransient<ExercisePickerPage>();
        builder.Services.AddTransient<ExerciseDetailPage>();
        builder.Services.AddTransient<RoutineEditorPage>();
        builder.Services.AddTransient<WorkoutHistoryPage>();
        builder.Services.AddTransient<SettingsPage>();
        builder.Services.AddTransient<OnboardingPage>();
        builder.Services.AddTransient<CoachPage>();
        builder.Services.AddTransient<AuthPage>();
        builder.Services.AddTransient<GymWrappedPage>();
        builder.Services.AddTransient<UserProfilePage>();

#if DEBUG
        builder.Logging.AddDebug();
#endif

        var app = builder.Build();

        // Initialize database and seed data on background thread
        Task.Run(async () =>
        {
            var db = app.Services.GetRequiredService<DatabaseService>();
            await db.GetConnectionAsync(); // triggers table creation

            var exerciseRepo = app.Services.GetRequiredService<IExerciseRepository>();
            await exerciseRepo.SeedDefaultExercisesAsync();
        });

        return app;
    }
}
