using PlateUp.ViewModels;

namespace PlateUp.Popups;

public partial class PlateCalculatorPopup : ContentView
{
    private TaskCompletionSource<string?>? _tcs;

    public PlateCalculatorPopup(string? initialWeight = null)
    {
        InitializeComponent();

        var vm = new PlateCalculatorViewModel();
        if (!string.IsNullOrWhiteSpace(initialWeight))
            vm.TotalWeightText = initialWeight;

        BindingContext = vm;
    }

    public Task<string?> GetResultAsync()
    {
        _tcs = new TaskCompletionSource<string?>();
        return _tcs.Task;
    }

    private void OnDoneClicked(object? sender, EventArgs e)
    {
        var vm = (PlateCalculatorViewModel)BindingContext;
        _tcs?.TrySetResult(vm.TotalWeightText);
    }
}
