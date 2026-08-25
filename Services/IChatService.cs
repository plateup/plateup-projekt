using PlateUp.Models;

namespace PlateUp.Services;

public interface IChatService
{
    Task<List<ChatMessage>> GetChatHistoryAsync(int limit = 50);
    Task<ChatMessage> SaveMessageAsync(ChatMessage message);
    Task<string> SendMessageAsync(string userMessage, List<ChatMessage> history);
    Task ClearHistoryAsync();
}
