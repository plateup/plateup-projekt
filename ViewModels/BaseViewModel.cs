using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;

namespace PlateUp.ViewModels;

public partial class BaseViewModel : ObservableObject
{
    [ObservableProperty]
    private bool _isBusy;

    [ObservableProperty]
    private bool _isRefreshing;

    [ObservableProperty]
    private string _title = string.Empty;

    public bool IsNotBusy => !IsBusy;

    public IAsyncRelayCommand InitializeAsyncCommand { get; }

    public BaseViewModel()
    {
        InitializeAsyncCommand = new AsyncRelayCommand(InitializeAsync);
    }

    partial void OnIsBusyChanged(bool value)
    {
        OnPropertyChanged(nameof(IsNotBusy));
    }

    public virtual Task InitializeAsync() => Task.CompletedTask;

    public virtual void OnDisappearing() { }

    protected async Task ExecuteAsync(Func<Task> operation, string? errorMessage = null)
    {
        if (IsBusy) return;

        IsBusy = true;
        try
        {
            await operation();
        }
        catch (Exception ex)
        {
            await Shell.Current.DisplayAlertAsync("Error", errorMessage ?? ex.Message, "OK");
        }
        finally
        {
            IsBusy = false;
        }
    }
}
