using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using PlateUp.Helpers;
using PlateUp.Services;

namespace PlateUp.ViewModels;

[QueryProperty(nameof(Mode), "mode")]
public partial class AuthViewModel : BaseViewModel
{
    private readonly ICloudSyncService _cloudSync;
    private readonly IUserRepository _userRepo;

    [ObservableProperty] private string _email = string.Empty;
    [ObservableProperty] private string _password = string.Empty;
    [ObservableProperty] private string _nickname = string.Empty;
    [ObservableProperty] private bool _isLoginMode = true;
    [ObservableProperty] private string _errorMessage = string.Empty;
    [ObservableProperty] private bool _hasError;
    [ObservableProperty] private string _successMessage = string.Empty;
    [ObservableProperty] private bool _hasSuccess;
    [ObservableProperty] private string _mode = string.Empty;

    public string ActionButtonText => IsLoginMode ? "Log In" : "Sign Up";
    public string SwitchModeText => IsLoginMode ? "Don't have an account? Sign Up" : "Already have an account? Log In";

    public AuthViewModel(ICloudSyncService cloudSync, IUserRepository userRepo)
    {
        _cloudSync = cloudSync;
        _userRepo = userRepo;
        Title = "Account";
    }

    partial void OnModeChanged(string value)
    {
        if (value == "register")
            IsLoginMode = false;
    }

    partial void OnIsLoginModeChanged(bool value)
    {
        OnPropertyChanged(nameof(ActionButtonText));
        OnPropertyChanged(nameof(SwitchModeText));
        HasError = false;
        HasSuccess = false;
    }

    [RelayCommand]
    private void ToggleMode()
    {
        IsLoginMode = !IsLoginMode;
    }

    [RelayCommand]
    private async Task Submit()
    {
        HasError = false;
        HasSuccess = false;

        if (string.IsNullOrWhiteSpace(Email) || string.IsNullOrWhiteSpace(Password))
        {
            ErrorMessage = "Please enter email and password.";
            HasError = true;
            return;
        }

        if (!IsLoginMode && string.IsNullOrWhiteSpace(Nickname))
        {
            ErrorMessage = "Please enter a nickname.";
            HasError = true;
            return;
        }

        await ExecuteAsync(async () =>
        {
            if (IsLoginMode)
            {
                var (success, error) = await _cloudSync.LoginAsync(Email.Trim(), Password);
                if (success)
                {
                    HapticHelper.Success();
                    await SyncProfileAndNavigate();
                }
                else
                {
                    ErrorMessage = error ?? "Login failed.";
                    HasError = true;
                }
            }
            else
            {
                var nick = string.IsNullOrWhiteSpace(Nickname) ? "Athlete" : Nickname.Trim();
                var (success, error) = await _cloudSync.RegisterAsync(Email.Trim(), Password, nick);

                if (success && error == "CONFIRM_EMAIL")
                {
                    SuccessMessage = "Account created! Check your inbox (and spam folder) for a confirmation link, then log in.";
                    HasSuccess = true;
                    IsLoginMode = true;
                    Password = string.Empty;
                }
                else if (success)
                {
                    HapticHelper.Success();
                    await SyncProfileAndNavigate();
                }
                else
                {
                    ErrorMessage = error ?? "Registration failed.";
                    HasError = true;
                }
            }
        });
    }

    private async Task SyncProfileAndNavigate()
    {
        if (_cloudSync.IsLoggedIn)
        {
            var profile = await _userRepo.GetProfileAsync();
            await _cloudSync.UpdateProfileAsync(
                profile.Nickname, profile.AvatarColor,
                profile.Bio, Algorithms.CalculateLevel(profile.TotalExp));
        }

        await Shell.Current.GoToAsync("//workout");
    }

    [RelayCommand]
    private async Task SignInWithGoogle()
    {
        HasError = false;
        HasSuccess = false;

        await ExecuteAsync(async () =>
        {
            var success = await _cloudSync.SignInWithGoogleAsync();

            if (success)
            {
                HapticHelper.Success();
                await SyncProfileAndNavigate();
            }
            else
            {
                ErrorMessage = "Google sign-in failed. Please try again.";
                HasError = true;
            }
        });
    }

    [RelayCommand]
    private async Task SkipAuth()
    {
        await Shell.Current.GoToAsync("//workout");
    }

    [RelayCommand]
    private async Task GoBack()
    {
        await Shell.Current.GoToAsync("..");
    }
}
