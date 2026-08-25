using PlateUp.ViewModels;

namespace PlateUp.Views;

public partial class UserProfilePage : ContentPage
{
    public UserProfilePage(UserProfileViewModel vm)
    {
        InitializeComponent();
        BindingContext = vm;
    }

    protected override async void OnAppearing()
    {
        base.OnAppearing();
        if (BindingContext is UserProfileViewModel vm)
            await vm.InitializeAsync();
    }
}
