using SQLite;
using PlateUp.Models;

namespace PlateUp.Services;

public class DatabaseService
{
    private SQLiteAsyncConnection? _connection;
    private readonly SemaphoreSlim _semaphore = new(1, 1);
    private bool _initialized;

    public async Task<SQLiteAsyncConnection> GetConnectionAsync()
    {
        if (_initialized && _connection is not null)
            return _connection;

        await _semaphore.WaitAsync();
        try
        {
            if (_initialized && _connection is not null)
                return _connection;

            var dbPath = Path.Combine(FileSystem.AppDataDirectory, "plateup.db3");
            _connection = new SQLiteAsyncConnection(dbPath,
                SQLiteOpenFlags.ReadWrite | SQLiteOpenFlags.Create | SQLiteOpenFlags.SharedCache);

            await InitializeAsync();
            _initialized = true;

            return _connection;
        }
        finally
        {
            _semaphore.Release();
        }
    }

    private async Task InitializeAsync()
    {
        if (_connection is null) return;

        await _connection.CreateTableAsync<Exercise>();
        await _connection.CreateTableAsync<Workout>();
        await _connection.CreateTableAsync<WorkoutExercise>();
        await _connection.CreateTableAsync<WorkoutSet>();
        await _connection.CreateTableAsync<PersonalRecord>();
        await _connection.CreateTableAsync<UserProfile>();
        await _connection.CreateTableAsync<BodyMeasurement>();
        await _connection.CreateTableAsync<WorkoutLike>();
        await _connection.CreateTableAsync<CoachSuggestion>();
        await _connection.CreateTableAsync<ChatMessage>();
    }
}
