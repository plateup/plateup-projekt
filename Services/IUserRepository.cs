using PlateUp.Models;

namespace PlateUp.Services;

public interface IUserRepository
{
    Task<UserProfile> GetProfileAsync();
    Task SaveProfileAsync(UserProfile profile);
    Task AddExpAsync(int amount);
    Task<List<BodyMeasurement>> GetMeasurementsAsync();
    Task SaveMeasurementAsync(BodyMeasurement measurement);
}
