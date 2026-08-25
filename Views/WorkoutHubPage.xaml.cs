using PlateUp.ViewModels;

namespace PlateUp.Views;

public partial class WorkoutHubPage : ContentPage
{
    public WorkoutHubPage(WorkoutHubViewModel viewModel)
    {
        InitializeComponent();
        BindingContext = viewModel;
    }

    protected override async void OnAppearing()
    {
        base.OnAppearing();
        if (BindingContext is BaseViewModel vm)
            await vm.InitializeAsync();
    }

    protected override void OnDisappearing()
    {
        base.OnDisappearing();
        if (BindingContext is BaseViewModel vm)
            vm.OnDisappearing();
    }
}
