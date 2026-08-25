using Supabase;

namespace PlateUp.Services;

public class SupabaseService
{
    private const string SupabaseUrl = "https://pqymbdceivxmaszcbmsg.supabase.co";
    private const string SupabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxeW1iZGNlaXZ4bWFzemNibXNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxMjE0MDIsImV4cCI6MjA4OTY5NzQwMn0.tlIbA6Q9si3fzJu07vuyibfInvA1nRH7EJxBVlDEqRU";

    private Supabase.Client? _client;
    private readonly SemaphoreSlim _semaphore = new(1, 1);

    public async Task<Supabase.Client> GetClientAsync()
    {
        if (_client is not null)
            return _client;

        await _semaphore.WaitAsync();
        try
        {
            if (_client is not null)
                return _client;

            _client = new Supabase.Client(SupabaseUrl, SupabaseAnonKey);
            await _client.InitializeAsync();
            return _client;
        }
        finally
        {
            _semaphore.Release();
        }
    }

    public bool IsLoggedIn => _client?.Auth.CurrentUser is not null;

    public string? CurrentUserId => _client?.Auth.CurrentUser?.Id;
}
