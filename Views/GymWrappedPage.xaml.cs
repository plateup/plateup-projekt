using PlateUp.ViewModels;

namespace PlateUp.Views;

public partial class GymWrappedPage : ContentPage
{
    public GymWrappedPage(GymWrappedViewModel vm)
    {
        InitializeComponent();
        BindingContext = vm;
    }

    protected override async void OnAppearing()
    {
        base.OnAppearing();
        if (BindingContext is GymWrappedViewModel vm)
            await vm.InitializeAsync();
    }
}
