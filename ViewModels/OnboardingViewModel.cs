using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using PlateUp.Helpers;
using PlateUp.Models;
using PlateUp.Services;

namespace PlateUp.ViewModels;

public partial class OnboardingViewModel : BaseViewModel
{
    private readonly IUserRepository _userRepo;
    private readonly ISettingsService _settings;
    private readonly StarterRoutineService _starterRoutineService;

    private const int TotalSteps = 11;

    [ObservableProperty] private int _currentStep;
    [ObservableProperty] private double _progress;
    [ObservableProperty] private bool _canProceed = true;
    [ObservableProperty] private bool _isGeneratingRoutines;

    // Step 1 — Experience
    [ObservableProperty] private int _selectedExperience = -1;
    public bool IsExp0 => SelectedExperience == 0;
    public bool IsExp1 => SelectedExperience == 1;
    public bool IsExp2 => SelectedExperience == 2;
    public bool IsExp3 => SelectedExperience == 3;

    // Step 2 — Goal
    [ObservableProperty] private int _selectedGoal = -1;
    public bool IsGoal0 => SelectedGoal == 0;
    public bool IsGoal1 => SelectedGoal == 1;
    public bool IsGoal2 => SelectedGoal == 2;
    public bool IsGoal3 => SelectedGoal == 3;
    public bool IsGoal4 => SelectedGoal == 4;

    // Step 3 — Gender
    [ObservableProperty] private int _selectedGender = -1;
    public bool IsGender0 => SelectedGender == 0;
    public bool IsGender1 => SelectedGender == 1;
    public bool IsGender2 => SelectedGender == 2;

    // Step 4 — Age
    [ObservableProperty] private int _age = 25;

    // Step 5 — Body Weight
    [ObservableProperty] private string _weightText = string.Empty;
    [ObservableProperty] private bool _useMetric = true;
    public string WeightUnit => UseMetric ? "kg" : "lbs";

    // Step 6 — Training Days
    [ObservableProperty] private int _trainingDays = 4;
    public string TrainingDaysDesc => TrainingDays switch
    {
        <= 2 => "Recovery-focused",
        <= 4 => "Balanced approach",
        <= 5 => "Serious training",
        _ => "High frequency"
    };

    // Step 7 — Sleep (option selection)
    [ObservableProperty] private int _selectedSleep = -1;
    public bool IsSleep0 => SelectedSleep == 0;
    public bool IsSleep1 => SelectedSleep == 1;
    public bool IsSleep2 => SelectedSleep == 2;
    public bool IsSleep3 => SelectedSleep == 3;

    public int SleepHours => SelectedSleep switch
    {
        0 => 5,
        1 => 6,
        2 => 7,
        3 => 9,
        _ => 7
    };

    public string SleepDesc => SelectedSleep switch
    {
        0 => "Try to aim for more rest",
        1 => "A bit below optimal",
        2 => "Great for recovery",
        3 => "Excellent recovery window",
        _ => ""
    };

    // Step 8 — Volume Calculation (computed from inputs)
    public int WeeklyVolume => ComputeWeeklyVolume();
    public int SetsPerMuscle => WeeklyVolume > 0 ? WeeklyVolume / 6 : 10;
    public string VolumeVerdict => WeeklyVolume switch
    {
        < 40 => "Light volume — great for beginners",
        < 70 => "Moderate volume — balanced hypertrophy",
        < 100 => "High volume — serious gains",
        _ => "Very high volume — advanced territory"
    };

    // Step 9 — Get My Program
    [ObservableProperty] private ObservableCollection<StarterRoutineOption> _starterRoutines = [];

    // Step 10 — Profile (name + avatar photo)
    [ObservableProperty] private string _nickname = "Athlete";
    [ObservableProperty] private string _selectedAvatarColor = "#1C1C1E";
    [ObservableProperty] private string _avatarLetter = "A";
    [ObservableProperty] private ImageSource? _avatarImageSource;
    [ObservableProperty] private bool _hasAvatarImage;
    private string? _avatarImagePath;

    public OnboardingViewModel(
        IUserRepository userRepo,
        ISettingsService settings,
        StarterRoutineService starterRoutineService)
    {
        _userRepo = userRepo;
        _settings = settings;
        _starterRoutineService = starterRoutineService;
        Title = "Onboarding";
    }

    // ── Property change handlers ──

    partial void OnCurrentStepChanged(int value)
    {
        Progress = (double)value / (TotalSteps - 1);
        UpdateCanProceed();
    }

    private void UpdateCanProceed()
    {
        CanProceed = CurrentStep switch
        {
            1 => SelectedExperience >= 0,
            2 => SelectedGoal >= 0,
            3 => SelectedGender >= 0,
            7 => SelectedSleep >= 0,
            _ => true
        };
    }

    partial void OnSelectedExperienceChanged(int value)
    {
        OnPropertyChanged(nameof(IsExp0));
        OnPropertyChanged(nameof(IsExp1));
        OnPropertyChanged(nameof(IsExp2));
        OnPropertyChanged(nameof(IsExp3));
        HapticHelper.Tick();
        UpdateCanProceed();
    }

    partial void OnSelectedGoalChanged(int value)
    {
        OnPropertyChanged(nameof(IsGoal0));
        OnPropertyChanged(nameof(IsGoal1));
        OnPropertyChanged(nameof(IsGoal2));
        OnPropertyChanged(nameof(IsGoal3));
        OnPropertyChanged(nameof(IsGoal4));
        HapticHelper.Tick();
        UpdateCanProceed();
    }

    partial void OnSelectedGenderChanged(int value)
    {
        OnPropertyChanged(nameof(IsGender0));
        OnPropertyChanged(nameof(IsGender1));
        OnPropertyChanged(nameof(IsGender2));
        HapticHelper.Tick();
        UpdateCanProceed();
    }

    partial void OnTrainingDaysChanged(int value)
    {
        OnPropertyChanged(nameof(TrainingDaysDesc));
        OnPropertyChanged(nameof(WeeklyVolume));
        OnPropertyChanged(nameof(SetsPerMuscle));
        OnPropertyChanged(nameof(VolumeVerdict));
    }

    partial void OnSelectedSleepChanged(int value)
    {
        OnPropertyChanged(nameof(IsSleep0));
        OnPropertyChanged(nameof(IsSleep1));
        OnPropertyChanged(nameof(IsSleep2));
        OnPropertyChanged(nameof(IsSleep3));
        OnPropertyChanged(nameof(SleepHours));
        OnPropertyChanged(nameof(SleepDesc));
        HapticHelper.Tick();
        UpdateCanProceed();
    }

    partial void OnUseMetricChanged(bool value)
    {
        OnPropertyChanged(nameof(WeightUnit));
    }

    partial void OnNicknameChanged(string value)
    {
        AvatarLetter = !string.IsNullOrEmpty(value) ? value[0].ToString().ToUpper() : "A";
    }

    // ── Commands ──

    [RelayCommand]
    private void SelectExperience(string levelStr)
    {
        if (int.TryParse(levelStr, out var level))
            SelectedExperience = level;
    }

    [RelayCommand]
    private void SelectGoal(string goalStr)
    {
        if (int.TryParse(goalStr, out var goal))
            SelectedGoal = goal;
    }

    [RelayCommand]
    private void SelectGender(string genderStr)
    {
        if (int.TryParse(genderStr, out var gender))
            SelectedGender = gender;
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
            HapticHelper.Tick();
        }
        catch
        {
            // User cancelled or no permission
        }
    }

    [RelayCommand]
    private void ToggleUnit(string unit)
    {
        UseMetric = unit == "metric";
    }

    [RelayCommand]
    private void SelectSleep(string sleepStr)
    {
        if (int.TryParse(sleepStr, out var sleep))
            SelectedSleep = sleep;
    }

    [RelayCommand]
    private void SelectAvatarColor(string color)
    {
        SelectedAvatarColor = color;
    }

    [RelayCommand]
    private void SetTrainingDays(string daysStr)
    {
        if (int.TryParse(daysStr, out var days))
            TrainingDays = days;
    }

    [RelayCommand]
    private void AgeUp()
    {
        if (Age < 80) Age++;
        HapticHelper.Tick();
    }

    [RelayCommand]
    private void AgeDown()
    {
        if (Age > 14) Age--;
        HapticHelper.Tick();
    }

    [RelayCommand]
    private async Task NextStep()
    {
        if (!CanProceed) return;

        if (CurrentStep == 7)
        {
            // Recalculate volume before showing
            OnPropertyChanged(nameof(WeeklyVolume));
            OnPropertyChanged(nameof(SetsPerMuscle));
            OnPropertyChanged(nameof(VolumeVerdict));
        }

        if (CurrentStep == 8)
        {
            // Show loading state, then generate routines
            IsGeneratingRoutines = true;
            CurrentStep++;
            await Task.Delay(1800);
            GenerateStarterRoutines();
            IsGeneratingRoutines = false;
            return;
        }

        if (CurrentStep < TotalSteps - 1)
            CurrentStep++;
    }

    [RelayCommand]
    private void PreviousStep()
    {
        if (CurrentStep > 0)
            CurrentStep--;
    }

    [RelayCommand]
    private void SkipToAuth()
    {
        // Skip routines, go straight to profile/auth
        CurrentStep = 10;
    }

    [RelayCommand]
    private void ToggleRoutine(StarterRoutineOption routine)
    {
        routine.IsSelected = !routine.IsSelected;
    }

    [RelayCommand]
    private async Task FinishOnboarding()
    {
        await ExecuteAsync(async () =>
        {
            var profile = await _userRepo.GetProfileAsync();
            profile.Nickname = Nickname;
            profile.AvatarColor = SelectedAvatarColor;
            profile.Gender = Math.Max(0, SelectedGender);
            profile.FitnessGoal = Math.Max(0, SelectedGoal);
            profile.ExperienceLevel = Math.Max(0, SelectedExperience);
            profile.TrainingDaysPerWeek = TrainingDays;
            profile.PreferredUnits = UseMetric ? 0 : 1;
            profile.HasCompletedOnboarding = true;

            if (double.TryParse(WeightText, System.Globalization.NumberStyles.Any,
                    System.Globalization.CultureInfo.InvariantCulture, out var weight) && weight > 0)
                profile.BodyWeightKg = UseMetric ? weight : weight / 2.205;

            // Approximate birth year from age
            if (Age is > 10 and < 100)
                profile.DateOfBirth = DateTime.Now.AddYears(-Age);

            await _userRepo.SaveProfileAsync(profile);

            _settings.UseKg = UseMetric;
            _settings.DefaultRestTimerSeconds = (ExperienceLevel)profile.ExperienceLevel switch
            {
                ExperienceLevel.Beginner => 120,
                ExperienceLevel.Intermediate => 90,
                _ => 60
            };

            // Create selected starter routines
            var selectedIndices = StarterRoutines
                .Where(r => r.IsSelected)
                .Select(r => r.Index)
                .ToList();

            if (selectedIndices.Count > 0)
            {
                var goal = (FitnessGoal)profile.FitnessGoal;
                var level = (ExperienceLevel)profile.ExperienceLevel;
                await _starterRoutineService.CreateRoutinesAsync(goal, level, TrainingDays, selectedIndices);
            }

            HapticHelper.Success();

            // Go to auth page in register mode
            await Shell.Current.GoToAsync("auth?mode=register");
        });
    }

    [RelayCommand]
    private async Task SkipAuth()
    {
        // Save profile without auth and proceed
        await ExecuteAsync(async () =>
        {
            var profile = await _userRepo.GetProfileAsync();
            profile.Nickname = Nickname;
            profile.AvatarColor = SelectedAvatarColor;
            profile.Gender = Math.Max(0, SelectedGender);
            profile.FitnessGoal = Math.Max(0, SelectedGoal);
            profile.ExperienceLevel = Math.Max(0, SelectedExperience);
            profile.TrainingDaysPerWeek = TrainingDays;
            profile.PreferredUnits = UseMetric ? 0 : 1;
            profile.HasCompletedOnboarding = true;

            if (double.TryParse(WeightText, System.Globalization.NumberStyles.Any,
                    System.Globalization.CultureInfo.InvariantCulture, out var weight) && weight > 0)
                profile.BodyWeightKg = UseMetric ? weight : weight / 2.205;

            if (Age is > 10 and < 100)
                profile.DateOfBirth = DateTime.Now.AddYears(-Age);

            await _userRepo.SaveProfileAsync(profile);

            _settings.UseKg = UseMetric;

            HapticHelper.Success();
            await Shell.Current.GoToAsync("//workout");
        });
    }

    // ── Helpers ──

    private int ComputeWeeklyVolume()
    {
        var baseSets = SelectedExperience switch
        {
            0 => 8,
            1 => 12,
            2 => 16,
            _ => 20
        };
        return baseSets * TrainingDays;
    }

    private void GenerateStarterRoutines()
    {
        var goal = (FitnessGoal)Math.Max(0, SelectedGoal);
        var level = (ExperienceLevel)Math.Max(0, SelectedExperience);
        var templates = _starterRoutineService.GetRoutineTemplates(goal, level, TrainingDays);

        var options = new ObservableCollection<StarterRoutineOption>();
        for (int i = 0; i < templates.Count; i++)
        {
            options.Add(new StarterRoutineOption
            {
                Index = i,
                Name = templates[i].Name,
                ExerciseSummary = string.Join(" · ", templates[i].ExerciseNames.Take(4)),
                ExerciseCount = templates[i].ExerciseNames.Count,
                IsSelected = false
            });
        }
        StarterRoutines = options;
    }
}

public partial class StarterRoutineOption : ObservableObject
{
    public int Index { get; set; }
    public string Name { get; set; } = string.Empty;
    public string ExerciseSummary { get; set; } = string.Empty;
    public int ExerciseCount { get; set; }
    [ObservableProperty] private bool _isSelected;
}
