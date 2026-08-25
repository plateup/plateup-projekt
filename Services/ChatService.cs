using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using PlateUp.Models;

namespace PlateUp.Services;

public class ChatService : IChatService
{
    private readonly DatabaseService _db;
    private readonly IWorkoutRepository _workoutRepo;
    private readonly IUserRepository _userRepo;
    private readonly IPersonalRecordRepository _prRepo;

    private const string GroqApiKey = "INSERT_GROQ_API_KEY_HERE";
    private const string GroqApiUrl = "https://api.groq.com/openai/v1/chat/completions";
    private const string Model = "llama-3.3-70b-versatile";

    private static readonly HttpClient _httpClient = new();

    public ChatService(
        DatabaseService db,
        IWorkoutRepository workoutRepo,
        IUserRepository userRepo,
        IPersonalRecordRepository prRepo)
    {
        _db = db;
        _workoutRepo = workoutRepo;
        _userRepo = userRepo;
        _prRepo = prRepo;
    }

    public async Task<List<ChatMessage>> GetChatHistoryAsync(int limit = 50)
    {
        var conn = await _db.GetConnectionAsync();
        return await conn.Table<ChatMessage>()
            .OrderByDescending(m => m.Timestamp)
            .Take(limit)
            .ToListAsync()
            .ContinueWith(t => t.Result.OrderBy(m => m.Timestamp).ToList());
    }

    public async Task<ChatMessage> SaveMessageAsync(ChatMessage message)
    {
        var conn = await _db.GetConnectionAsync();
        await conn.InsertAsync(message);
        return message;
    }

    public async Task<string> SendMessageAsync(string userMessage, List<ChatMessage> history)
    {
        var systemPrompt = await BuildSystemPromptAsync();

        var messages = new List<object>
        {
            new { role = "system", content = systemPrompt }
        };

        // Add recent history (last 20 messages for context)
        foreach (var msg in history.TakeLast(20))
        {
            messages.Add(new { role = msg.Role, content = msg.Content });
        }

        messages.Add(new { role = "user", content = userMessage });

        var requestBody = new
        {
            model = Model,
            messages,
            temperature = 0.7,
            max_tokens = 1024
        };

        var json = JsonSerializer.Serialize(requestBody);
        var request = new HttpRequestMessage(HttpMethod.Post, GroqApiUrl)
        {
            Content = new StringContent(json, Encoding.UTF8, "application/json")
        };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", GroqApiKey);

        var response = await _httpClient.SendAsync(request);
        var responseJson = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
        {
            return "Sorry, I'm having trouble connecting right now. Please try again.";
        }

        using var doc = JsonDocument.Parse(responseJson);
        var content = doc.RootElement
            .GetProperty("choices")[0]
            .GetProperty("message")
            .GetProperty("content")
            .GetString();

        return content ?? "I couldn't generate a response. Please try again.";
    }

    public async Task ClearHistoryAsync()
    {
        var conn = await _db.GetConnectionAsync();
        await conn.DeleteAllAsync<ChatMessage>();
    }

    private async Task<string> BuildSystemPromptAsync()
    {
        var profile = await _userRepo.GetProfileAsync();
        var workouts = await _workoutRepo.GetAllWorkoutsAsync();
        var recentPRs = await _prRepo.GetRecentAsync(5);

        var completedWorkouts = workouts.Where(w => w.EndTime.HasValue).ToList();
        var recentWorkouts = completedWorkouts
            .OrderByDescending(w => w.StartTime)
            .Take(5)
            .ToList();

        var level = Helpers.Algorithms.CalculateLevel(profile.TotalExp);

        var sb = new StringBuilder();
        sb.AppendLine("You are PlateUp Coach — a friendly, knowledgeable fitness AI assistant built into the PlateUp workout tracker app.");
        sb.AppendLine("You help users with workout advice, exercise form, programming, nutrition basics, and motivation.");
        sb.AppendLine("Keep responses concise and actionable. Use a friendly, encouraging tone.");
        sb.AppendLine("Never give medical advice. Recommend seeing a doctor for injuries or health concerns.");
        sb.AppendLine();
        sb.AppendLine("USER CONTEXT:");
        sb.AppendLine($"- Name: {profile.Nickname}");
        sb.AppendLine($"- Level: {level} ({Helpers.Algorithms.GetRankName(level)})");
        sb.AppendLine($"- Experience: {(ExperienceLevel)profile.ExperienceLevel}");
        sb.AppendLine($"- Total completed workouts: {completedWorkouts.Count}");

        if (recentWorkouts.Count > 0)
        {
            sb.AppendLine();
            sb.AppendLine("RECENT WORKOUTS:");
            foreach (var w in recentWorkouts)
            {
                var duration = w.EndTime.HasValue
                    ? (w.EndTime.Value - w.StartTime).TotalMinutes
                    : 0;
                sb.AppendLine($"- {w.Title} ({w.StartTime:MMM dd}): {duration:0}min, {w.TotalVolume:0}kg volume, {w.TotalSets} sets");
            }
        }

        if (recentPRs.Count > 0)
        {
            sb.AppendLine();
            sb.AppendLine("RECENT PRs:");
            foreach (var pr in recentPRs)
            {
                var typeName = ((RecordType)pr.RecordType) switch
                {
                    RecordType.MaxWeight => "Max Weight",
                    RecordType.Max1RM => "Est. 1RM",
                    RecordType.MaxVolume => "Max Volume",
                    _ => "PR"
                };
                sb.AppendLine($"- Exercise #{pr.ExerciseId}: {typeName} = {pr.Value:0.#} ({pr.Date:MMM dd})");
            }
        }

        return sb.ToString();
    }
}
