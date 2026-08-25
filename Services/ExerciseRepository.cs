using PlateUp.Models;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.IO;

namespace PlateUp.Services;

public class OpenGymExerciseDto
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("n")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("bp")]
    public string BodyPart { get; set; } = string.Empty;

    [JsonPropertyName("eq")]
    public string Equipment { get; set; } = string.Empty;

    [JsonPropertyName("tg")]
    public string Target { get; set; } = string.Empty;

    [JsonPropertyName("mg")]
    public string MainMuscle { get; set; } = string.Empty;

    [JsonPropertyName("sm")]
    public List<string> SecondaryMuscles { get; set; } = new();

    [JsonPropertyName("st")]
    public List<string> Steps { get; set; } = new();

    [JsonPropertyName("img")]
    public string Image { get; set; } = string.Empty;

    [JsonPropertyName("gif")]
    public string Gif { get; set; } = string.Empty;
}

public class ExerciseRepository : IExerciseRepository
{
    private readonly DatabaseService _db;

    public ExerciseRepository(DatabaseService db)
    {
        _db = db;
    }

    public async Task<List<Exercise>> GetAllAsync()
    {
        var conn = await _db.GetConnectionAsync();
        return await conn.Table<Exercise>().OrderBy(e => e.Name).ToListAsync();
    }

    public async Task<Exercise?> GetByIdAsync(int id)
    {
        var conn = await _db.GetConnectionAsync();
        return await conn.Table<Exercise>().FirstOrDefaultAsync(e => e.Id == id);
    }

    public async Task<List<Exercise>> GetByMuscleGroupAsync(MuscleGroup group)
    {
        var conn = await _db.GetConnectionAsync();
        var groupInt = (int)group;
        return await conn.Table<Exercise>()
            .Where(e => e.TargetMuscleGroup == groupInt)
            .OrderBy(e => e.Name)
            .ToListAsync();
    }

    public async Task<List<Exercise>> SearchAsync(string query)
    {
        if (string.IsNullOrWhiteSpace(query))
            return await GetAllAsync();

        var conn = await _db.GetConnectionAsync();
        var lowerQuery = query.ToLowerInvariant();
        var all = await conn.Table<Exercise>().ToListAsync();
        return all.Where(e => e.Name.Contains(query, StringComparison.OrdinalIgnoreCase))
                  .OrderBy(e => e.Name)
                  .ToList();
    }

    public async Task<int> SaveAsync(Exercise exercise)
    {
        var conn = await _db.GetConnectionAsync();
        if (exercise.Id != 0)
        {
            await conn.UpdateAsync(exercise);
            return exercise.Id;
        }
        await conn.InsertAsync(exercise);
        return exercise.Id;
    }

    public async Task DeleteAsync(int id)
    {
        var conn = await _db.GetConnectionAsync();
        await conn.DeleteAsync<Exercise>(id);
    }

    public async Task SeedDefaultExercisesAsync()
    {
        var conn = await _db.GetConnectionAsync();
        var count = await conn.Table<Exercise>().CountAsync();
        if (count > 0) return;

        var exercises = new List<Exercise>();
        
        try
        {
            using var stream = await FileSystem.OpenAppPackageFileAsync("exercises.json");
            using var reader = new StreamReader(stream);
            var json = await reader.ReadToEndAsync();
            var openGymData = JsonSerializer.Deserialize<List<OpenGymExerciseDto>>(json);

            if (openGymData != null)
            {
                foreach (var item in openGymData)
                {
                    var targetMuscleGroup = MapTargetMuscleGroup(item.Target);
                    var exerciseType = MapExerciseType(item.Equipment);

                    exercises.Add(new Exercise
                    {
                        ExternalId = item.Id,
                        Name = char.ToUpper(item.Name[0]) + item.Name.Substring(1),
                        TargetMuscleGroup = (int)targetMuscleGroup,
                        ExerciseType = (int)exerciseType,
                        IsCustom = false,
                        ImageUrl = string.IsNullOrEmpty(item.Image) ? string.Empty : $"https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@7455efae41b330c265e7cd4b78dfa848e7ce5ebd/images/{item.Image}",
                        VideoUrl = string.IsNullOrEmpty(item.Gif) ? string.Empty : $"https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@7455efae41b330c265e7cd4b78dfa848e7ce5ebd/videos/{item.Gif}",
                        Instructions = string.Join("\n", item.Steps),
                        SecondaryMuscles = string.Join(", ", item.SecondaryMuscles)
                    });
                }
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Error seeding exercises: {ex.Message}");
        }

        if (exercises.Count == 0)
        {
            // Fallback
            exercises = new List<Exercise>
            {
                new() { Name = "Bench Press (Barbell)", TargetMuscleGroup = (int)MuscleGroup.Chest, ExerciseType = (int)Models.ExerciseType.Barbell },
                new() { Name = "Deadlift", TargetMuscleGroup = (int)MuscleGroup.Back, ExerciseType = (int)Models.ExerciseType.Barbell }
            };
        }

        await conn.InsertAllAsync(exercises);
    }

    private MuscleGroup MapTargetMuscleGroup(string target)
    {
        return target.ToLowerInvariant() switch
        {
            "abs" => MuscleGroup.Core,
            "quads" or "glutes" or "hamstrings" or "calves" => MuscleGroup.Legs,
            "chest" => MuscleGroup.Chest,
            "lats" or "upper back" or "spine" => MuscleGroup.Back,
            "delts" => MuscleGroup.Shoulders,
            "biceps" => MuscleGroup.Biceps,
            "triceps" => MuscleGroup.Triceps,
            "cardio" => MuscleGroup.Cardio,
            "forearms" => MuscleGroup.Other,
            _ => MuscleGroup.Other
        };
    }

    private Models.ExerciseType MapExerciseType(string equipment)
    {
        return equipment.ToLowerInvariant() switch
        {
            "body weight" or "assisted" => Models.ExerciseType.Bodyweight,
            "barbell" => Models.ExerciseType.Barbell,
            "dumbbell" => Models.ExerciseType.Dumbbell,
            "cable" or "band" => Models.ExerciseType.Cable,
            "leverage machine" or "smith machine" or "elliptical machine" or "stepmill machine" => Models.ExerciseType.Machine,
            _ => Models.ExerciseType.Other
        };
    }
}
