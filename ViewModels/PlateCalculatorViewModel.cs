using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using PlateUp.Helpers;
using PlateUp.ViewModels.DisplayModels;

namespace PlateUp.ViewModels;

public partial class PlateCalculatorViewModel : ObservableObject
{
    [ObservableProperty] private string _totalWeightText = string.Empty;
    [ObservableProperty] private double _barWeight = Constants.DefaultBarWeight;
    [ObservableProperty] private ObservableCollection<PlateDisplay> _plates = [];
    [ObservableProperty] private string _resultText = string.Empty;
    [ObservableProperty] private bool _isValid;

    partial void OnTotalWeightTextChanged(string value) => Calculate();
    partial void OnBarWeightChanged(double value) => Calculate();

    [RelayCommand]
    private void SetBarWeight(string weightStr)
    {
        if (double.TryParse(weightStr, System.Globalization.NumberStyles.Any,
                System.Globalization.CultureInfo.InvariantCulture, out var weight))
        {
            BarWeight = weight;
        }
    }

    private void Calculate()
    {
        if (!double.TryParse(TotalWeightText, System.Globalization.NumberStyles.Any,
                System.Globalization.CultureInfo.InvariantCulture, out var totalWeight)
            || totalWeight < BarWeight)
        {
            IsValid = false;
            Plates = [];
            ResultText = totalWeight > 0 && totalWeight < BarWeight
                ? $"Weight must be ≥ bar ({BarWeight:0.##} kg)"
                : string.Empty;
            return;
        }

        var calculated = Algorithms.CalculatePlates(totalWeight, BarWeight);
        var plateDisplays = new ObservableCollection<PlateDisplay>();
        var descriptions = new List<string>();

        foreach (var (plateWeight, count) in calculated)
        {
            plateDisplays.Add(new PlateDisplay
            {
                Weight = plateWeight,
                Color = PlateDisplay.GetPlateColor(plateWeight),
                Count = count,
                WidthFactor = PlateDisplay.GetWidthFactor(plateWeight)
            });
            descriptions.Add($"{count}×{plateWeight:0.##}kg");
        }

        Plates = plateDisplays;
        IsValid = true;

        ResultText = descriptions.Count > 0
            ? $"Per side: {string.Join(", ", descriptions)}"
            : "No plates needed";
    }
}
