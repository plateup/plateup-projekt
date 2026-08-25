using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using PlateUp.Models;
using PlateUp.Services;

namespace PlateUp.ViewModels;

public partial class CoachViewModel : BaseViewModel
{
    private readonly IChatService _chatService;

    [ObservableProperty]
    private ObservableCollection<ChatMessage> _messages = [];

    [ObservableProperty]
    private string _inputText = string.Empty;

    [ObservableProperty]
    private bool _isTyping;

    public CoachViewModel(IChatService chatService)
    {
        _chatService = chatService;
        Title = "Coach";
    }

    public override async Task InitializeAsync()
    {
        if (Messages.Count > 0) return;

        await ExecuteAsync(async () =>
        {
            var history = await _chatService.GetChatHistoryAsync();
            Messages = new ObservableCollection<ChatMessage>(history);

            if (Messages.Count == 0)
            {
                // Welcome message
                var welcome = new ChatMessage
                {
                    Role = "assistant",
                    Content = "Hey! I'm your PlateUp Coach. Ask me anything about workouts, exercises, form, programming, or nutrition. I have access to your workout history so I can give personalized advice. 💪",
                    Timestamp = DateTime.Now
                };
                await _chatService.SaveMessageAsync(welcome);
                Messages.Add(welcome);
            }
        });
    }

    [RelayCommand]
    private async Task SendMessage()
    {
        var text = InputText?.Trim();
        if (string.IsNullOrEmpty(text)) return;

        InputText = string.Empty;

        // Add user message
        var userMsg = new ChatMessage
        {
            Role = "user",
            Content = text,
            Timestamp = DateTime.Now
        };
        await _chatService.SaveMessageAsync(userMsg);
        Messages.Add(userMsg);

        // Show typing indicator
        IsTyping = true;

        try
        {
            var response = await _chatService.SendMessageAsync(text, Messages.ToList());

            var assistantMsg = new ChatMessage
            {
                Role = "assistant",
                Content = response,
                Timestamp = DateTime.Now
            };
            await _chatService.SaveMessageAsync(assistantMsg);
            Messages.Add(assistantMsg);
        }
        catch
        {
            var errorMsg = new ChatMessage
            {
                Role = "assistant",
                Content = "Sorry, I couldn't connect. Please check your internet and try again.",
                Timestamp = DateTime.Now
            };
            await _chatService.SaveMessageAsync(errorMsg);
            Messages.Add(errorMsg);
        }
        finally
        {
            IsTyping = false;
        }
    }

    [RelayCommand]
    private async Task SendSuggestion(string suggestion)
    {
        InputText = suggestion;
        await SendMessage();
    }

    [RelayCommand]
    private async Task ClearChat()
    {
        var confirmed = await Shell.Current.DisplayAlertAsync(
            "Clear Chat", "Clear all chat history?", "Clear", "Cancel");
        if (!confirmed) return;

        await _chatService.ClearHistoryAsync();
        Messages.Clear();

        var welcome = new ChatMessage
        {
            Role = "assistant",
            Content = "Chat cleared! How can I help you?",
            Timestamp = DateTime.Now
        };
        await _chatService.SaveMessageAsync(welcome);
        Messages.Add(welcome);
    }
}
