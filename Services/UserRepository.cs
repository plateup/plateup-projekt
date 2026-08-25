using PlateUp.Models;

namespace PlateUp.Services;

public class UserRepository : IUserRepository
{
    private readonly DatabaseService _db;

    public UserRepository(DatabaseService db)
    {
        _db = db;
    }

    public async Task<UserProfile> GetProfileAsync()
    {
        var conn = await _db.GetConnectionAsync();
        var profile = await conn.Table<UserProfile>().FirstOrDefaultAsync();
        if (profile is not null) return profile;

        profile = new UserProfile
        {
            Nickname = "Athlete",
            AvatarColor = "#448AFF",
            CreatedAt = DateTime.Now
        };
        await conn.InsertAsync(profile);
        return profile;
    }

    public async Task SaveProfileAsync(UserProfile profile)
    {
        var conn = await _db.GetConnectionAsync();
        await conn.UpdateAsync(profile);
    }

    public async Task AddExpAsync(int amount)
    {
        var profile = await GetProfileAsync();
        profile.TotalExp += amount;
        await SaveProfileAsync(profile);
    }

    public async Task<List<BodyMeasurement>> GetMeasurementsAsync()
    {
        var conn = await _db.GetConnectionAsync();
        return await conn.Table<BodyMeasurement>()
            .OrderByDescending(m => m.Date)
            .ToListAsync();
    }

    public async Task SaveMeasurementAsync(BodyMeasurement measurement)
    {
        var conn = await _db.GetConnectionAsync();
        if (measurement.Id != 0)
            await conn.UpdateAsync(measurement);
        else
            await conn.InsertAsync(measurement);
    }
}
