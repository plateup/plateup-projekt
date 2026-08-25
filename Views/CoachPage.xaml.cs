using PlateUp.ViewModels;

namespace PlateUp.Views;

public partial class CoachPage : ContentPage
{
    public CoachPage(CoachViewModel vm)
    {
        InitializeComponent();
        BindingContext = vm;
    }

    protected override async void OnAppearing()
    {
        base.OnAppearing();
        if (BindingContext is CoachViewModel vm)
            await vm.InitializeAsync();
    }
}
