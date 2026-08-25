using PlateUp.Helpers;
using PlateUp.ViewModels;

namespace PlateUp.Views;

public partial class WorkoutSummaryPage : ContentPage
{
    public WorkoutSummaryPage(WorkoutSummaryViewModel viewModel)
    {
        InitializeComponent();
        BindingContext = viewModel;
    }

    protected override async void OnAppearing()
    {
        base.OnAppearing();
        _ = Content.FadeInPage(250);
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
