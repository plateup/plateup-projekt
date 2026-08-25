using System.Windows.Input;

namespace PlateUp.Controls;

public partial class EmptyStateView : ContentView
{
    public static readonly BindableProperty IconGlyphProperty =
        BindableProperty.Create(nameof(IconGlyph), typeof(string), typeof(EmptyStateView), string.Empty,
            propertyChanged: (b, _, n) => ((EmptyStateView)b).IconLabel.Text = (string)n);

    public static readonly BindableProperty TitleProperty =
        BindableProperty.Create(nameof(Title), typeof(string), typeof(EmptyStateView), string.Empty,
            propertyChanged: (b, _, n) => ((EmptyStateView)b).TitleLabel.Text = (string)n);

    public static readonly BindableProperty SubtitleProperty =
        BindableProperty.Create(nameof(Subtitle), typeof(string), typeof(EmptyStateView), string.Empty,
            propertyChanged: (b, _, n) => ((EmptyStateView)b).SubtitleLabel.Text = (string)n);

    public static readonly BindableProperty ActionTextProperty =
        BindableProperty.Create(nameof(ActionText), typeof(string), typeof(EmptyStateView), string.Empty,
            propertyChanged: (b, _, n) =>
            {
                var view = (EmptyStateView)b;
                var text = (string)n;
                view.ActionButton.Text = text;
                view.ActionButton.IsVisible = !string.IsNullOrEmpty(text);
            });

    public static readonly BindableProperty ActionCommandProperty =
        BindableProperty.Create(nameof(ActionCommand), typeof(ICommand), typeof(EmptyStateView), null,
            propertyChanged: (b, _, n) => ((EmptyStateView)b).ActionButton.Command = (ICommand?)n);

    public string IconGlyph { get => (string)GetValue(IconGlyphProperty); set => SetValue(IconGlyphProperty, value); }
    public string Title { get => (string)GetValue(TitleProperty); set => SetValue(TitleProperty, value); }
    public string Subtitle { get => (string)GetValue(SubtitleProperty); set => SetValue(SubtitleProperty, value); }
    public string ActionText { get => (string)GetValue(ActionTextProperty); set => SetValue(ActionTextProperty, value); }
    public ICommand? ActionCommand { get => (ICommand?)GetValue(ActionCommandProperty); set => SetValue(ActionCommandProperty, value); }

    public EmptyStateView()
    {
        InitializeComponent();
    }
}
