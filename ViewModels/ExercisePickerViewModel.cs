using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using CommunityToolkit.Mvvm.Messaging;
using PlateUp.Messages;
using PlateUp.Models;
using PlateUp.Services;
using PlateUp.ViewModels.DisplayModels;

namespace PlateUp.ViewModels;

public partial class ExercisePickerViewModel : BaseViewModel
{
    private readonly IExerciseRepository _exerciseRepo;
    private List<ExerciseDisplayModel> _allExercisesList = [];

    [ObservableProperty]
    private ObservableCollection<ExerciseDisplayModel> _filteredExercises = [];

    [ObservableProperty]
    private string _searchText = string.Empty;

    [ObservableProperty]
    private MuscleGroup? _selectedMuscleGroup;

    [ObservableProperty]
    private ObservableCollection<MuscleGroupChip> _muscleGroupChips = [];

    [ObservableProperty]
    private int _selectedCount;

    public ExercisePickerViewModel(IExerciseRepository exerciseRepo)
    {
        _exerciseRepo = exerciseRepo;
        Title = "Add Exercise";
    }

    public override async Task InitializeAsync()
    {
        await ExecuteAsync(async () =>
        {
            var exercises = await _exerciseRepo.GetAllAsync();

            _allExercisesList = exercises.Select(e => new ExerciseDisplayModel
            {
                ExerciseId = e.Id,
                Name = e.Name,
                MuscleGroup = e.MuscleGroupEnum,
                MuscleGroupName = GetMuscleGroupName(e.MuscleGroupEnum),
                ExerciseType = e.ExerciseTypeEnum,
                AvatarColor = GetMuscleGroupColor(e.MuscleGroupEnum),
                AvatarLetter = e.Name.Length > 0 ? e.Name[0].ToString().ToUpper() : "?",
            }).ToList();

            // Create chips
            var chips = new ObservableCollection<MuscleGroupChip>
            {
                new() { MuscleGroup = null, DisplayName = "All", IsActive = true }
            };

            foreach (MuscleGroup mg in Enum.GetValues<MuscleGroup>())
            {
                if (mg is MuscleGroup.FullBody or MuscleGroup.Other) continue;
                chips.Add(new MuscleGroupChip
                {
                    MuscleGroup = mg,
                    DisplayName = GetMuscleGroupName(mg)
                });
            }

            MuscleGroupChips = chips;
            ApplyFilter();
        });
    }

    partial void OnSearchTextChanged(string value) => ApplyFilter();

    [RelayCommand]
    private void SelectMuscleGroup(MuscleGroupChip chip)
    {
        foreach (var c in MuscleGroupChips)
            c.IsActive = false;
        chip.IsActive = true;
        SelectedMuscleGroup = chip.MuscleGroup;
        ApplyFilter();
    }

    [RelayCommand]
    private void ToggleExercise(ExerciseDisplayModel exercise)
    {
        exercise.IsSelected = !exercise.IsSelected;
        UpdateSelectedCount();
    }

    [RelayCommand]
    private async Task ConfirmSelection()
    {
        var selected = _allExercisesList
            .Where(e => e.IsSelected)
            .Select(e => new Exercise
            {
                Id = e.ExerciseId,
                Name = e.Name,
                TargetMuscleGroup = (int)e.MuscleGroup,
                ExerciseType = (int)e.ExerciseType
            })
            .ToList();

        if (selected.Count > 0)
            WeakReferenceMessenger.Default.Send(new ExercisesSelectedMessage(selected));

        await Shell.Current.GoToAsync("..");
    }

    [RelayCommand]
    private async Task CreateCustomExercise()
    {
        // Simple prompt-based creation for now
        var name = await Shell.Current.DisplayPromptAsync(
            "Custom Exercise", "Enter exercise name:", "Save", "Cancel");

        if (string.IsNullOrWhiteSpace(name)) return;

        var exercise = new Exercise
        {
            Name = name,
            TargetMuscleGroup = (int)(SelectedMuscleGroup ?? MuscleGroup.Other),
            ExerciseType = (int)Models.ExerciseType.Other,
            IsCustom = true
        };

        var id = await _exerciseRepo.SaveAsync(exercise);

        var displayModel = new ExerciseDisplayModel
        {
            ExerciseId = id,
            Name = name,
            MuscleGroup = exercise.MuscleGroupEnum,
            MuscleGroupName = GetMuscleGroupName(exercise.MuscleGroupEnum),
            ExerciseType = exercise.ExerciseTypeEnum,
            AvatarColor = GetMuscleGroupColor(exercise.MuscleGroupEnum),
            AvatarLetter = name.Length > 0 ? name[0].ToString().ToUpper() : "?",
            IsSelected = true
        };

        _allExercisesList.Add(displayModel);
        ApplyFilter();
        UpdateSelectedCount();
    }

    [RelayCommand]
    private async Task Cancel()
    {
        await Shell.Current.GoToAsync("..");
    }

    private void ApplyFilter()
    {
        var filtered = _allExercisesList.AsEnumerable();

        if (!string.IsNullOrWhiteSpace(SearchText))
            filtered = filtered.Where(e =>
                e.Name.Contains(SearchText, StringComparison.OrdinalIgnoreCase));

        if (SelectedMuscleGroup.HasValue)
            filtered = filtered.Where(e => e.MuscleGroup == SelectedMuscleGroup.Value);

        FilteredExercises = new ObservableCollection<ExerciseDisplayModel>(filtered);
        UpdateSelectedCount();
    }

    private void UpdateSelectedCount()
    {
        SelectedCount = _allExercisesList.Count(e => e.IsSelected);
    }

    private static string GetMuscleGroupName(MuscleGroup mg) => mg switch
    {
        MuscleGroup.Chest => "Chest",
        MuscleGroup.Back => "Back",
        MuscleGroup.Shoulders => "Shoulders",
        MuscleGroup.Biceps => "Biceps",
        MuscleGroup.Triceps => "Triceps",
        MuscleGroup.Legs => "Legs",
        MuscleGroup.Core => "Core",
        MuscleGroup.Cardio => "Cardio",
        MuscleGroup.FullBody => "Full Body",
        _ => "Other"
    };

    private static Color GetMuscleGroupColor(MuscleGroup mg)
    {
        var key = mg switch
        {
            MuscleGroup.Chest => "MuscleChest",
            MuscleGroup.Back => "MuscleBack",
            MuscleGroup.Shoulders => "MuscleShoulders",
            MuscleGroup.Biceps => "MuscleBiceps",
            MuscleGroup.Triceps => "MuscleTriceps",
            MuscleGroup.Legs => "MuscleLegs",
            MuscleGroup.Core => "MuscleCore",
            MuscleGroup.Cardio => "MuscleCardio",
            _ => "MuscleChest"
        };

        if (Application.Current?.Resources.TryGetValue(key, out var color) == true && color is Color c)
            return c;
        return Colors.Gray;
    }
}
