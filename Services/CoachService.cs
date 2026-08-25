using PlateUp.Helpers;
using PlateUp.Models;

namespace PlateUp.Services;

public class CoachService : ICoachService
{
    private readonly IWorkoutRepository _workoutRepo;
    private readonly IExerciseRepository _exerciseRepo;
    private readonly IWorkoutExerciseRepository _workoutExerciseRepo;
    private readonly ISetRepository _setRepo;
    private readonly IPersonalRecordRepository _prRepo;
    private readonly IUserRepository _userRepo;
    private readonly DatabaseService _db;

    private const int MaxActiveSuggestions = 5;

    public CoachService(
        IWorkoutRepository workoutRepo,
        IExerciseRepository exerciseRepo,
        IWorkoutExerciseRepository workoutExerciseRepo,
        ISetRepository setRepo,
        IPersonalRecordRepository prRepo,
        IUserRepository userRepo,
        DatabaseService db)
    {
        _workoutRepo = workoutRepo;
        _exerciseRepo = exerciseRepo;
        _workoutExerciseRepo = workoutExerciseRepo;
        _setRepo = setRepo;
        _prRepo = prRepo;
        _userRepo = userRepo;
        _db = db;
    }

    public async Task<List<CoachSuggestion>> GenerateDailySuggestionsAsync()
    {
        var conn = await _db.GetConnectionAsync();

        // Check if already generated today
        var today = DateTime.Today;
        var todaySuggestions = await conn.Table<CoachSuggestion>()
            .Where(s => s.CreatedAt >= today)
            .ToListAsync();
        if (todaySuggestions.Count > 0)
            return await GetActiveSuggestionsAsync();

        // Auto-dismiss old suggestions beyond limit
        var active = await conn.Table<CoachSuggestion>()
            .Where(s => !s.IsDismissed)
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync();
        foreach (var old in active.Skip(MaxActiveSuggestions))
        {
            old.IsDismissed = true;
            await conn.UpdateAsync(old);
        }

        var newSuggestions = new List<CoachSuggestion>();
        var allWorkouts = (await _workoutRepo.GetAllWorkoutsAsync())
            .Where(w => !w.IsTemplate && w.EndTime.HasValue)
            .OrderByDescending(w => w.StartTime)
            .ToList();

        var profile = await _userRepo.GetProfileAsync();

        // No workouts at all? Welcome suggestion
        if (allWorkouts.Count == 0)
        {
            newSuggestions.Add(new CoachSuggestion
            {
                SuggestionTypeEnum = SuggestionType.RoutineSuggestion,
                Title = "Welcome to PlateUp!",
                Message = "Let's start with your first workout! Tap to begin.",
                IconGlyph = Icons.Dumbbell,
                ActionTypeEnum = SuggestionActionType.None
            });
            await SaveSuggestions(conn, newSuggestions);
            return await GetActiveSuggestionsAsync();
        }

        // Build exercise-muscle mapping for recent workouts
        var recentWorkouts = allWorkouts.Where(w => w.StartTime >= DateTime.Now.AddDays(-30)).ToList();
        var muscleSetCounts = await CountMuscleGroupSets(recentWorkouts);

        // RULE 1: Muscle Imbalance
        var imbalance = DetectMuscleImbalance(muscleSetCounts);
        if (imbalance != null)
            newSuggestions.Add(imbalance);

        // RULE 2: Plateau Detection
        var plateaus = await DetectPlateaus(allWorkouts);
        newSuggestions.AddRange(plateaus);

        // RULE 3: PR Prediction
        var predictions = await PredictPRs(allWorkouts);
        newSuggestions.AddRange(predictions);

        // RULE 4: Recovery Warning
        var recovery = await DetectRecoveryNeeded(allWorkouts);
        if (recovery != null)
            newSuggestions.Add(recovery);

        // RULE 5: Streak & Motivation
        var motivation = DetectMotivation(allWorkouts);
        if (motivation != null)
            newSuggestions.Add(motivation);

        // RULE 6: Weekly Plan
        var weeklyPlan = GenerateWeeklyPlan(profile);
        if (weeklyPlan != null)
            newSuggestions.Add(weeklyPlan);

        // Limit to max
        newSuggestions = newSuggestions.Take(MaxActiveSuggestions).ToList();
        await SaveSuggestions(conn, newSuggestions);

        return await GetActiveSuggestionsAsync();
    }

    public async Task<NextWorkoutSuggestion> SuggestNextWorkoutAsync()
    {
        var allWorkouts = (await _workoutRepo.GetAllWorkoutsAsync())
            .Where(w => !w.IsTemplate && w.EndTime.HasValue)
            .OrderByDescending(w => w.StartTime)
            .ToList();

        if (allWorkouts.Count == 0)
        {
            return new NextWorkoutSuggestion
            {
                Title = "Start Your First Workout",
                Reason = "Begin your fitness journey today!"
            };
        }

        // Find which muscle group rested the longest
        var muscleLastTrained = new Dictionary<MuscleGroup, DateTime>();
        foreach (var workout in allWorkouts.Take(20))
        {
            var exercises = await _workoutExerciseRepo.GetByWorkoutIdAsync(workout.Id);
            foreach (var we in exercises)
            {
                var exercise = await _exerciseRepo.GetByIdAsync(we.ExerciseId);
                if (exercise == null) continue;
                var mg = exercise.MuscleGroupEnum;
                if (!muscleLastTrained.ContainsKey(mg))
                    muscleLastTrained[mg] = workout.StartTime;
            }
        }

        var mostRested = muscleLastTrained
            .OrderBy(kv => kv.Value)
            .FirstOrDefault();

        var daysSinceTraining = mostRested.Key != default
            ? (int)(DateTime.Now - mostRested.Value).TotalDays
            : 0;

        // Check if user has a routine that matches
        var templates = await _workoutRepo.GetAllTemplatesAsync();
        int? matchingRoutineId = null;
        string routineTitle = mostRested.Key.ToString();

        foreach (var template in templates)
        {
            var exercises = await _workoutExerciseRepo.GetByWorkoutIdAsync(template.Id);
            foreach (var we in exercises)
            {
                var ex = await _exerciseRepo.GetByIdAsync(we.ExerciseId);
                if (ex?.MuscleGroupEnum == mostRested.Key)
                {
                    matchingRoutineId = template.Id;
                    routineTitle = template.Title;
                    break;
                }
            }
            if (matchingRoutineId.HasValue) break;
        }

        return new NextWorkoutSuggestion
        {
            Title = routineTitle,
            Reason = daysSinceTraining > 0
                ? $"You haven't trained {mostRested.Key} in {daysSinceTraining} days"
                : "Time for a workout!",
            RoutineId = matchingRoutineId,
            SuggestedMuscleGroup = mostRested.Key
        };
    }

    public async Task<string> GetExerciseTipAsync(int exerciseId)
    {
        var exercise = await _exerciseRepo.GetByIdAsync(exerciseId);
        if (exercise == null) return "Start with a comfortable weight and focus on form.";

        var allWorkouts = (await _workoutRepo.GetAllWorkoutsAsync())
            .Where(w => !w.IsTemplate && w.EndTime.HasValue)
            .OrderByDescending(w => w.StartTime)
            .ToList();

        var sessionData = await GetExerciseSessionData(exerciseId, allWorkouts);

        if (sessionData.Count == 0)
            return $"First time doing {exercise.Name}? Start with a comfortable weight and focus on form.";

        if (sessionData.Count < 3)
            return "Keep building consistency. Track your weights to see progress over time.";

        var recentRMs = sessionData.Take(4).Select(s => s.Best1RM).ToList();
        if (recentRMs.Count >= 4)
        {
            var change = recentRMs.Count > 0 && recentRMs.Last() > 0
                ? (recentRMs.First() - recentRMs.Last()) / recentRMs.Last() * 100
                : 0;

            if (Math.Abs(change) < 2)
                return "You seem to be plateauing. Try changing rep range, adding a pause rep, or tempo sets.";

            if (change > 0)
                return $"Great progress! Consider increasing weight by 2.5kg next session.";
        }

        return "Stay consistent and keep pushing. Progressive overload is key!";
    }

    public async Task<List<Exercise>> SuggestExerciseReplacementsAsync(int exerciseId)
    {
        var exercise = await _exerciseRepo.GetByIdAsync(exerciseId);
        if (exercise == null) return [];

        var sameMuscle = await _exerciseRepo.GetByMuscleGroupAsync(exercise.MuscleGroupEnum);
        return sameMuscle
            .Where(e => e.Id != exerciseId && e.ExerciseType != exercise.ExerciseType)
            .Take(3)
            .ToList();
    }

    public async Task<List<CoachSuggestion>> GetActiveSuggestionsAsync()
    {
        var conn = await _db.GetConnectionAsync();
        return await conn.Table<CoachSuggestion>()
            .Where(s => !s.IsDismissed)
            .OrderByDescending(s => s.CreatedAt)
            .Take(MaxActiveSuggestions)
            .ToListAsync();
    }

    public async Task DismissSuggestionAsync(int suggestionId)
    {
        var conn = await _db.GetConnectionAsync();
        var suggestion = await conn.GetAsync<CoachSuggestion>(suggestionId);
        suggestion.IsDismissed = true;
        await conn.UpdateAsync(suggestion);
    }

    public async Task MarkAsReadAsync(int suggestionId)
    {
        var conn = await _db.GetConnectionAsync();
        var suggestion = await conn.GetAsync<CoachSuggestion>(suggestionId);
        suggestion.IsRead = true;
        await conn.UpdateAsync(suggestion);
    }

    public async Task<int> GetUnreadCountAsync()
    {
        var conn = await _db.GetConnectionAsync();
        return await conn.Table<CoachSuggestion>()
            .Where(s => !s.IsDismissed && !s.IsRead)
            .CountAsync();
    }

    // ─── Private helpers ───

    private async Task<Dictionary<MuscleGroup, int>> CountMuscleGroupSets(List<Workout> workouts)
    {
        var counts = new Dictionary<MuscleGroup, int>();
        foreach (var workout in workouts)
        {
            var exercises = await _workoutExerciseRepo.GetByWorkoutIdAsync(workout.Id);
            foreach (var we in exercises)
            {
                var exercise = await _exerciseRepo.GetByIdAsync(we.ExerciseId);
                if (exercise == null) continue;

                var sets = await _setRepo.GetByWorkoutExerciseIdAsync(we.Id);
                var completedSets = sets.Count(s => s.IsCompleted);
                var mg = exercise.MuscleGroupEnum;

                if (!counts.ContainsKey(mg))
                    counts[mg] = 0;
                counts[mg] += completedSets;
            }
        }
        return counts;
    }

    private static CoachSuggestion? DetectMuscleImbalance(Dictionary<MuscleGroup, int> muscleSetCounts)
    {
        if (muscleSetCounts.Count < 3) return null;

        var totalSets = muscleSetCounts.Values.Sum();
        if (totalSets == 0) return null;

        var neglected = muscleSetCounts
            .Where(kv => (double)kv.Value / totalSets < 0.10)
            .Select(kv => kv.Key)
            .ToList();

        var dominant = muscleSetCounts
            .Where(kv => (double)kv.Value / totalSets > 0.25)
            .Select(kv => kv.Key)
            .ToList();

        if (neglected.Count > 0 && dominant.Count >= 2)
        {
            var muscle = neglected.First();
            return new CoachSuggestion
            {
                SuggestionTypeEnum = SuggestionType.ProgressTip,
                Title = "Muscle Imbalance Detected",
                Message = $"You haven't trained {muscle} much lately. Consider adding {muscle} exercises to stay balanced.",
                IconGlyph = Icons.Weight,
                ActionTypeEnum = SuggestionActionType.None
            };
        }

        // Also check for completely missing groups
        var trainedGroups = muscleSetCounts.Keys.ToHashSet();
        var mainGroups = new[] { MuscleGroup.Chest, MuscleGroup.Back, MuscleGroup.Shoulders, MuscleGroup.Legs };
        var missing = mainGroups.Where(g => !trainedGroups.Contains(g)).ToList();

        if (missing.Count > 0)
        {
            return new CoachSuggestion
            {
                SuggestionTypeEnum = SuggestionType.ProgressTip,
                Title = "Missing Muscle Group",
                Message = $"You haven't trained {missing.First()} in the last 30 days. Don't skip it!",
                IconGlyph = Icons.Weight,
                ActionTypeEnum = SuggestionActionType.None
            };
        }

        return null;
    }

    private async Task<List<CoachSuggestion>> DetectPlateaus(List<Workout> allWorkouts)
    {
        var suggestions = new List<CoachSuggestion>();

        // Find top 5 most frequent exercises
        var exerciseCounts = new Dictionary<int, int>();
        foreach (var workout in allWorkouts.Take(30))
        {
            var exercises = await _workoutExerciseRepo.GetByWorkoutIdAsync(workout.Id);
            foreach (var we in exercises)
            {
                if (!exerciseCounts.ContainsKey(we.ExerciseId))
                    exerciseCounts[we.ExerciseId] = 0;
                exerciseCounts[we.ExerciseId]++;
            }
        }

        var topExercises = exerciseCounts
            .OrderByDescending(kv => kv.Value)
            .Take(5)
            .Select(kv => kv.Key)
            .ToList();

        foreach (var exerciseId in topExercises)
        {
            var sessionData = await GetExerciseSessionData(exerciseId, allWorkouts);
            if (sessionData.Count < 4) continue;

            var lastFour = sessionData.Take(4).Select(s => s.Best1RM).ToList();
            if (lastFour.Any(v => v <= 0)) continue;

            var min = lastFour.Min();
            var max = lastFour.Max();
            var change = min > 0 ? (max - min) / min * 100 : 0;

            if (change < 2)
            {
                var exercise = await _exerciseRepo.GetByIdAsync(exerciseId);
                if (exercise == null) continue;

                suggestions.Add(new CoachSuggestion
                {
                    SuggestionTypeEnum = SuggestionType.ProgressTip,
                    Title = $"{exercise.Name} Plateau",
                    Message = $"Your {exercise.Name} hasn't changed in 4 sessions. Try changing rep range or adding variation.",
                    IconGlyph = Icons.ChartLine,
                    ActionTypeEnum = SuggestionActionType.NavigateToExercise,
                    ActionData = exerciseId.ToString()
                });

                if (suggestions.Count >= 2) break; // Max 2 plateau warnings
            }
        }

        return suggestions;
    }

    private async Task<List<CoachSuggestion>> PredictPRs(List<Workout> allWorkouts)
    {
        var suggestions = new List<CoachSuggestion>();

        var exerciseIds = new HashSet<int>();
        foreach (var workout in allWorkouts.Take(15))
        {
            var exercises = await _workoutExerciseRepo.GetByWorkoutIdAsync(workout.Id);
            foreach (var we in exercises)
                exerciseIds.Add(we.ExerciseId);
        }

        foreach (var exerciseId in exerciseIds)
        {
            var sessionData = await GetExerciseSessionData(exerciseId, allWorkouts);
            if (sessionData.Count < 3) continue;

            var lastThree = sessionData.Take(3).Reverse().ToList();
            var rms = lastThree.Select(s => s.Best1RM).ToList();

            // Check if trending up
            if (rms[0] > 0 && rms[1] > rms[0] && rms[2] > rms[1])
            {
                // Simple linear regression: y = ax + b
                var n = rms.Count;
                var xs = Enumerable.Range(0, n).Select(i => (double)i).ToList();
                var xMean = xs.Average();
                var yMean = rms.Average();
                var num = xs.Zip(rms, (x, y) => (x - xMean) * (y - yMean)).Sum();
                var den = xs.Select(x => (x - xMean) * (x - xMean)).Sum();
                if (den > 0)
                {
                    var slope = num / den;
                    var predicted = yMean + slope * (n); // predict next session
                    var exercise = await _exerciseRepo.GetByIdAsync(exerciseId);
                    if (exercise == null) continue;

                    suggestions.Add(new CoachSuggestion
                    {
                        SuggestionTypeEnum = SuggestionType.PRPrediction,
                        Title = $"{exercise.Name} PR Incoming!",
                        Message = $"You're on track to hit a new PR! Estimated 1RM: {predicted:0.#}kg",
                        IconGlyph = Icons.Trophy,
                        ActionTypeEnum = SuggestionActionType.NavigateToExercise,
                        ActionData = exerciseId.ToString()
                    });

                    if (suggestions.Count >= 2) break;
                }
            }
        }

        return suggestions;
    }

    private async Task<CoachSuggestion?> DetectRecoveryNeeded(List<Workout> allWorkouts)
    {
        if (allWorkouts.Count < 2) return null;

        var today = DateTime.Today;
        var yesterday = today.AddDays(-1);

        var todayWorkouts = allWorkouts.Where(w => w.StartTime.Date == today).ToList();
        var yesterdayWorkouts = allWorkouts.Where(w => w.StartTime.Date == yesterday).ToList();

        if (todayWorkouts.Count == 0 || yesterdayWorkouts.Count == 0)
            return null;

        // Find overlapping muscle groups
        var todayMuscles = await GetWorkoutMuscleGroups(todayWorkouts);
        var yesterdayMuscles = await GetWorkoutMuscleGroups(yesterdayWorkouts);

        var overlap = todayMuscles.Intersect(yesterdayMuscles).ToList();
        if (overlap.Count > 0)
        {
            return new CoachSuggestion
            {
                SuggestionTypeEnum = SuggestionType.RecoveryWarning,
                Title = "Recovery Warning",
                Message = $"You trained {overlap.First()} yesterday. Consider letting it recover for 48h.",
                IconGlyph = Icons.Heart,
                ActionTypeEnum = SuggestionActionType.None
            };
        }

        return null;
    }

    private static CoachSuggestion? DetectMotivation(List<Workout> allWorkouts)
    {
        if (allWorkouts.Count == 0) return null;

        var lastWorkout = allWorkouts.First();
        var daysSince = (int)(DateTime.Now - lastWorkout.StartTime).TotalDays;

        // Calculate average gap between workouts
        if (allWorkouts.Count >= 5)
        {
            var gaps = new List<double>();
            for (int i = 0; i < Math.Min(allWorkouts.Count - 1, 10); i++)
                gaps.Add((allWorkouts[i].StartTime - allWorkouts[i + 1].StartTime).TotalDays);

            var avgGap = gaps.Average();

            if (daysSince >= 3 && daysSince > avgGap * 2)
            {
                return new CoachSuggestion
                {
                    SuggestionTypeEnum = SuggestionType.ProgressTip,
                    Title = "Time to Train!",
                    Message = $"It's been {daysSince} days since your last workout. Time to get back!",
                    IconGlyph = Icons.Bolt,
                    ActionTypeEnum = SuggestionActionType.None
                };
            }
        }

        // Streak detection
        var uniqueDates = allWorkouts
            .Select(w => w.StartTime.Date)
            .Distinct()
            .OrderByDescending(d => d)
            .ToList();

        int streak = 0;
        var checkDate = DateTime.Today;
        foreach (var date in uniqueDates)
        {
            if (date == checkDate)
            {
                streak++;
                checkDate = checkDate.AddDays(-1);
            }
            else if (date == checkDate.AddDays(-1) && streak == 0)
            {
                checkDate = date;
                streak++;
                checkDate = checkDate.AddDays(-1);
            }
            else break;
        }

        if (streak >= 7)
        {
            return new CoachSuggestion
            {
                SuggestionTypeEnum = SuggestionType.ProgressTip,
                Title = $"{streak}-Day Streak!",
                Message = $"Amazing {streak}-day workout streak! Keep it up!",
                IconGlyph = Icons.Fire,
                ActionTypeEnum = SuggestionActionType.None
            };
        }

        return null;
    }

    private static CoachSuggestion? GenerateWeeklyPlan(UserProfile profile)
    {
        var goal = (FitnessGoal)profile.FitnessGoal;
        var level = (ExperienceLevel)profile.ExperienceLevel;
        var days = profile.TrainingDaysPerWeek;

        if (days <= 0) return null;

        var plan = (level, days) switch
        {
            (ExperienceLevel.Beginner, <= 3) =>
                "This week: Full Body A, Full Body B, Full Body C. Focus on learning proper form.",
            (ExperienceLevel.Beginner, _) =>
                "This week: Upper, Lower, Upper, Lower. Keep weights moderate and focus on technique.",
            (ExperienceLevel.Intermediate, <= 4) =>
                "This week: Upper, Lower, Push, Pull. Focus on progressive overload.",
            (ExperienceLevel.Intermediate, _) =>
                "This week: Push, Pull, Legs, Upper, Lower. Prioritize compound lifts.",
            (_, <= 3) =>
                "This week: Push, Pull, Legs. Focus on intensity and progressive overload.",
            (_, <= 5) =>
                "This week: Push, Pull, Legs, Upper, Lower. Consider auto-regulation by RPE.",
            _ =>
                "This week: Push, Pull, Legs × 2. Monitor recovery and adjust volume as needed."
        };

        var focusTip = goal switch
        {
            FitnessGoal.GainStrength => " Prioritize heavy compounds (3-5 reps).",
            FitnessGoal.BuildMuscle => " Keep reps in the 8-12 range for hypertrophy.",
            FitnessGoal.LoseWeight => " Add supersets to keep heart rate up.",
            FitnessGoal.Recomp => " Balance strength work with moderate volume.",
            _ => " Stay consistent!"
        };

        return new CoachSuggestion
        {
            SuggestionTypeEnum = SuggestionType.WeeklyPlan,
            Title = "Weekly Plan",
            Message = plan + focusTip,
            IconGlyph = Icons.Calendar,
            ActionTypeEnum = SuggestionActionType.None
        };
    }

    private async Task<HashSet<MuscleGroup>> GetWorkoutMuscleGroups(List<Workout> workouts)
    {
        var muscles = new HashSet<MuscleGroup>();
        foreach (var workout in workouts)
        {
            var exercises = await _workoutExerciseRepo.GetByWorkoutIdAsync(workout.Id);
            foreach (var we in exercises)
            {
                var ex = await _exerciseRepo.GetByIdAsync(we.ExerciseId);
                if (ex != null)
                    muscles.Add(ex.MuscleGroupEnum);
            }
        }
        return muscles;
    }

    private async Task<List<ExerciseSessionInfo>> GetExerciseSessionData(int exerciseId, List<Workout> workouts)
    {
        var sessions = new List<ExerciseSessionInfo>();

        foreach (var workout in workouts)
        {
            var exercises = await _workoutExerciseRepo.GetByWorkoutIdAsync(workout.Id);
            var we = exercises.FirstOrDefault(e => e.ExerciseId == exerciseId);
            if (we == null) continue;

            var sets = await _setRepo.GetByWorkoutExerciseIdAsync(we.Id);
            var completedSets = sets.Where(s => s.IsCompleted && s.Weight > 0 && s.Reps > 0).ToList();
            if (completedSets.Count == 0) continue;

            var best1RM = completedSets.Max(s => Algorithms.Calculate1RM(s.Weight, s.Reps));

            sessions.Add(new ExerciseSessionInfo
            {
                Date = workout.StartTime,
                Best1RM = best1RM,
                MaxWeight = completedSets.Max(s => s.Weight),
                TotalVolume = completedSets.Sum(s => s.Weight * s.Reps)
            });
        }

        return sessions;
    }

    private static async Task SaveSuggestions(SQLite.SQLiteAsyncConnection conn, List<CoachSuggestion> suggestions)
    {
        foreach (var s in suggestions)
        {
            s.CreatedAt = DateTime.Now;
            await conn.InsertAsync(s);
        }
    }

    private class ExerciseSessionInfo
    {
        public DateTime Date { get; init; }
        public double Best1RM { get; init; }
        public double MaxWeight { get; init; }
        public double TotalVolume { get; init; }
    }
}
