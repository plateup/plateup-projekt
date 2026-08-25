namespace PlateUp.Helpers;

public static class StyledActionSheet
{
    public static async Task<string?> ShowAsync(Page page, string title, params string[] options)
    {
        var tcs = new TaskCompletionSource<string?>();

        var overlay = new Grid
        {
            BackgroundColor = Color.FromArgb("#80000000"),
            ZIndex = 999
        };

        var isDark = Application.Current?.RequestedTheme == AppTheme.Dark;

        var cardBg = isDark ? Color.FromArgb("#1C1C1E") : Colors.White;
        var textPrimary = isDark ? Colors.White : Color.FromArgb("#000000");
        var textSecondary = isDark ? Color.FromArgb("#86868B") : Color.FromArgb("#86868B");
        var separator = isDark ? Color.FromArgb("#38383A") : Color.FromArgb("#E5E5EA");
        var dangerColor = Color.FromArgb("#FF3B30");

        var card = new Border
        {
            StrokeShape = new Microsoft.Maui.Controls.Shapes.RoundRectangle { CornerRadius = 20 },
            StrokeThickness = 0,
            BackgroundColor = cardBg,
            WidthRequest = 300,
            HorizontalOptions = LayoutOptions.Center,
            VerticalOptions = LayoutOptions.Center,
            Padding = 0,
            Shadow = new Shadow
            {
                Brush = new SolidColorBrush(Colors.Black),
                Offset = new Point(0, 8),
                Radius = 40,
                Opacity = 0.2f
            }
        };

        var stack = new VerticalStackLayout { Spacing = 0 };

        // Title
        stack.Children.Add(new Label
        {
            Text = title.ToUpperInvariant(),
            FontSize = 12,
            FontAttributes = FontAttributes.Bold,
            HorizontalTextAlignment = TextAlignment.Center,
            Padding = new Thickness(20, 16, 20, 12),
            TextColor = textSecondary,
            CharacterSpacing = 0.8
        });

        stack.Children.Add(new BoxView { HeightRequest = 0.5, Color = separator });

        // Options
        for (int i = 0; i < options.Length; i++)
        {
            var option = options[i];
            var isDestructive = option.Equals("Delete", StringComparison.OrdinalIgnoreCase);

            var label = new Label
            {
                Text = option,
                FontSize = 17,
                HorizontalTextAlignment = TextAlignment.Center,
                Padding = new Thickness(20, 14),
                TextColor = isDestructive ? dangerColor : textPrimary
            };

            label.GestureRecognizers.Add(new TapGestureRecognizer
            {
                Command = new Command(() =>
                {
                    if (page is ContentPage cp && cp.Content is Grid rootGrid)
                        rootGrid.Children.Remove(overlay);
                    tcs.TrySetResult(option);
                })
            });

            stack.Children.Add(label);

            if (i < options.Length - 1)
                stack.Children.Add(new BoxView { HeightRequest = 0.5, Color = separator });
        }

        // Cancel separator
        stack.Children.Add(new BoxView { HeightRequest = 0.5, Color = separator });

        var cancelLabel = new Label
        {
            Text = "Cancel",
            FontSize = 17,
            HorizontalTextAlignment = TextAlignment.Center,
            Padding = new Thickness(20, 14),
            TextColor = textSecondary
        };
        cancelLabel.GestureRecognizers.Add(new TapGestureRecognizer
        {
            Command = new Command(() =>
            {
                if (page is ContentPage cp && cp.Content is Grid rootGrid)
                    rootGrid.Children.Remove(overlay);
                tcs.TrySetResult(null);
            })
        });
        stack.Children.Add(cancelLabel);

        card.Content = stack;
        overlay.Children.Add(card);

        // Tap outside to dismiss
        overlay.GestureRecognizers.Add(new TapGestureRecognizer
        {
            Command = new Command(() =>
            {
                if (page is ContentPage cp && cp.Content is Grid rootGrid)
                    rootGrid.Children.Remove(overlay);
                tcs.TrySetResult(null);
            })
        });

        // Add overlay to page
        if (page is ContentPage contentPage && contentPage.Content is Grid grid)
        {
            Grid.SetRowSpan(overlay, 10);
            Grid.SetColumnSpan(overlay, 10);
            grid.Children.Add(overlay);
        }
        else
        {
            // Fallback to native
            var result = await page.DisplayActionSheet(title, "Cancel", null, options);
            return result == "Cancel" ? null : result;
        }

        return await tcs.Task;
    }
}
