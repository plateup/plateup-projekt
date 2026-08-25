using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using PlateUp.Helpers;
using PlateUp.Models;
using PlateUp.Services;
using PlateUp.ViewModels.DisplayModels;

namespace PlateUp.ViewModels;

public partial class ProfileViewModel : BaseViewModel
{
    private readonly IUserRepository _userRepo;
    private readonly IWorkoutRepository _workoutRepo;
    private readonly IPersonalRecordRepository _prRepo;
    private readonly ISettingsService _settings;
    private readonly ICloudSyncService _cloudSync;

    private DateTime _currentMonth;

    [ObservableProperty] private string _nickname = "Athlete";
    [ObservableProperty] private string _avatarColor = "#448AFF";
    [ObservableProperty] private string _avatarLetter = "A";
    [ObservableProperty] private string _bio = string.Empty;
    [ObservableProperty] private int _level = 1;
    [ObservableProperty] private string _rankName = "Newbie";
    [ObservableProperty] private double _expProgress;
    [ObservableProperty] private string _expText = "0 / 500 XP";
    [ObservableProperty] private int _totalWorkouts;
    [ObservableProperty] private int _currentStreak;
    [ObservableProperty] private int _bestStreak;
    [ObservableProperty] private string _totalVolumeFormatted = "0 kg";
    [ObservableProperty] private ObservableCollection<CalendarDay> _calendarDays = [];
    [ObservableProperty] private string _calendarMonth = string.Empty;
    [ObservableProperty] private ObservableCollection<BodyMeasurement> _measurements = [];
    [ObservableProperty] private bool _isLoggedIn;
    [ObservableProperty] private ImageSource? _avatarImageSource;
    [ObservableProperty] private bool _hasAvatarImage;
    private string? _avatarImagePath;

    private CancellationTokenSource? _saveCts;

    public ProfileViewModel(
        IUserRepository userRepo,
        IWorkoutRepository workoutRepo,
        IPersonalRecordRepository prRepo,
        ISettingsService settings,
        ICloudSyncService cloudSync)
    {
        _userRepo = userRepo;
        _workoutRepo = workoutRepo;
        _prRepo = prRepo;
        _settings = settings;
        _cloudSync = cloudSync;
        _currentMonth = new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1);
        Title = "Profile";
    }

    partial void OnNicknameChanged(string value)
    {
        AvatarLetter = !string.IsNullOrEmpty(value) ? value[0].ToString().ToUpper() : "A";
        DebounceSaveProfile();
    }

    partial void OnBioChanged(string value)
    {
        DebounceSaveProfile();
    }

    private async void DebounceSaveProfile()
    {
        _saveCts?.Cancel();
        _saveCts?.Dispose();
        _saveCts = new CancellationTokenSource();
        var token = _saveCts.Token;

        try
        {
            await Task.Delay(800, token);
            if (token.IsCancellationRequested) return;

            var profile = await _userRepo.GetProfileAsync();
            profile.Nickname = Nickname;
            profile.Bio = Bio;
            await _userRepo.SaveProfileAsync(profile);
        }
        catch (TaskCanceledException) { }
    }

    public override async Task InitializeAsync()
    {
        IsLoggedIn = _cloudSync.IsLoggedIn;
        await ExecuteAsync(async () =>
        {
            var profile = await _userRepo.GetProfileAsync();

            Nickname = profile.Nickname;
            Bio = profile.Bio ?? string.Empty;
            AvatarLetter = Nickname.Length > 0 ? Nickname[0].ToString().ToUpper() : "A";

            // Load avatar image
            if (!string.IsNullOrEmpty(profile.AvatarImagePath) && File.Exists(profile.AvatarImagePath))
            {
                _avatarImagePath = profile.AvatarImagePath;
                AvatarImageSource = ImageSource.FromFile(profile.AvatarImagePath);
                HasAvatarImage = true;
            }

            Level = Algorithms.CalculateLevel(profile.TotalExp);
            RankName = Algorithms.GetRankName(Level);

            var currentLevelExp = (Level - 1) * 500;
            var nextLevelExp = Level * 500;
            var progressExp = profile.TotalExp - currentLevelExp;
            ExpProgress = (double)progressExp / 500;
            ExpText = $"{profile.TotalExp:N0} / {nextLevelExp:N0} XP";

            // Stats
            var allWorkouts = await _workoutRepo.GetAllWorkoutsAsync();
            TotalWorkouts = allWorkouts.Count;

            double totalVol = allWorkouts.Sum(w => w.TotalVolume);
            TotalVolumeFormatted = totalVol >= 1000
                ? $"{totalVol / 1000:0.#} tons"
                : $"{totalVol:0.#} kg";

            // Streaks
            CalculateStreaks(allWorkouts);

            // Calendar
            await LoadCalendar();

            // Body measurements
            var measurements = await _userRepo.GetMeasurementsAsync();
            Measurements = new ObservableCollection<BodyMeasurement>(
                measurements.OrderByDescending(m => m.Date).Take(10));
        });

        IsRefreshing = false;
    }

    private void CalculateStreaks(List<Workout> workouts)
    {
        var uniqueDates = workouts
            .Where(w => w.EndTime.HasValue)
            .Select(w => w.StartTime.Date)
            .Distinct()
            .OrderByDescending(d => d)
            .ToList();

        if (uniqueDates.Count == 0)
        {
            CurrentStreak = 0;
            BestStreak = 0;
            return;
        }

        // Current streak
        int current = 0;
        var checkDate = DateTime.Today;
        foreach (var date in uniqueDates)
        {
            if (date == checkDate)
            {
                current++;
                checkDate = checkDate.AddDays(-1);
            }
            else if (date == checkDate.AddDays(-1) && current == 0)
            {
                // Allow yesterday as start if no workout today
                checkDate = date;
                current++;
                checkDate = checkDate.AddDays(-1);
            }
            else if (date < checkDate)
            {
                break;
            }
        }
        CurrentStreak = current;

        // Best streak
        int best = 0;
        int streak = 1;
        var sorted = uniqueDates.OrderBy(d => d).ToList();
        for (int i = 1; i < sorted.Count; i++)
        {
            if ((sorted[i] - sorted[i - 1]).Days == 1)
                streak++;
            else
                streak = 1;
            if (streak > best)
                best = streak;
        }
        BestStreak = Math.Max(best, streak);
    }

    private async Task LoadCalendar()
    {
        CalendarMonth = _currentMonth.ToString("MMMM yyyy");

        var allWorkouts = await _workoutRepo.GetAllWorkoutsAsync();
        var monthWorkoutDates = allWorkouts
            .Where(w => w.StartTime.Year == _currentMonth.Year && w.StartTime.Month == _currentMonth.Month)
            .Select(w => w.StartTime.Day)
            .Distinct()
            .ToHashSet();

        var days = new List<CalendarDay>();

        // Day of week offset (Monday = 0)
        var firstDay = _currentMonth;
        int offset = ((int)firstDay.DayOfWeek + 6) % 7; // Monday-based

        // Previous month filler
        var prevMonth = _currentMonth.AddMonths(-1);
        var prevMonthDays = DateTime.DaysInMonth(prevMonth.Year, prevMonth.Month);
        for (int i = offset - 1; i >= 0; i--)
        {
            days.Add(new CalendarDay
            {
                DayNumber = prevMonthDays - i,
                IsCurrentMonth = false
            });
        }

        // Current month
        var daysInMonth = DateTime.DaysInMonth(_currentMonth.Year, _currentMonth.Month);
        for (int d = 1; d <= daysInMonth; d++)
        {
            days.Add(new CalendarDay
            {
                DayNumber = d,
                IsCurrentMonth = true,
                HasWorkout = monthWorkoutDates.Contains(d),
                IsToday = _currentMonth.Year == DateTime.Today.Year
                          && _currentMonth.Month == DateTime.Today.Month
                          && d == DateTime.Today.Day
            });
        }

        // Next month filler (fill to 42)
        int remaining = 42 - days.Count;
        for (int d = 1; d <= remaining; d++)
        {
            days.Add(new CalendarDay
            {
                DayNumber = d,
                IsCurrentMonth = false
            });
        }

        CalendarDays = new ObservableCollection<CalendarDay>(days);
    }

    [RelayCommand]
    private async Task PreviousMonth()
    {
        _currentMonth = _currentMonth.AddMonths(-1);
        await LoadCalendar();
    }

    [RelayCommand]
    private async Task NextMonth()
    {
        _currentMonth = _currentMonth.AddMonths(1);
        await LoadCalendar();
    }

    [RelayCommand]
    private async Task GoToSettings()
    {
        await Shell.Current.GoToAsync("settings");
    }

    [RelayCommand]
    private async Task GoToHistory()
    {
        await Shell.Current.GoToAsync("workouthistory");
    }

    [RelayCommand]
    private async Task GoToMonthlyWrap()
    {
        await Shell.Current.GoToAsync("gymwrapped?period=month");
    }

    [RelayCommand]
    private async Task GoToYearlyWrap()
    {
        await Shell.Current.GoToAsync("gymwrapped?period=year");
    }

    [RelayCommand]
    private async Task GoToAuth()
    {
        await Shell.Current.GoToAsync("auth");
    }

    [RelayCommand]
    private async Task Logout()
    {
        var confirmed = await Shell.Current.DisplayAlertAsync("Log Out", "Are you sure?", "Log Out", "Cancel");
        if (!confirmed) return;

        await _cloudSync.LogoutAsync();
        IsLoggedIn = false;
    }

    [RelayCommand]
    private async Task PickAvatarPhoto()
    {
        try
        {
            var result = await MediaPicker.PickPhotoAsync(new MediaPickerOptions
            {
                Title = "Choose avatar"
            });
            if (result is null) return;

            _avatarImagePath = result.FullPath;
            AvatarImageSource = ImageSource.FromFile(result.FullPath);
            HasAvatarImage = true;

            // Save path to profile
            var profile = await _userRepo.GetProfileAsync();
            profile.AvatarImagePath = _avatarImagePath;
            await _userRepo.SaveProfileAsync(profile);

            HapticHelper.Tick();
        }
        catch { }
    }

    [RelayCommand]
    private async Task AddMeasurement()
    {
        var result = await Shell.Current.DisplayPromptAsync(
            "Body Weight", "Enter your weight (kg):", "Save", "Cancel",
            keyboard: Keyboard.Numeric);

        if (string.IsNullOrWhiteSpace(result)) return;
        if (!double.TryParse(result, System.Globalization.NumberStyles.Any,
                System.Globalization.CultureInfo.InvariantCulture, out var weight)) return;

        var measurement = new BodyMeasurement
        {
            Date = DateTime.Now,
            WeightKg = weight
        };
        await _userRepo.SaveMeasurementAsync(measurement);
        Measurements.Insert(0, measurement);
    }
}
