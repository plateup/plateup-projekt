import exercisesDb from '../constants/exercisesDb.json';
import opengymDb from '../constants/opengym.json';

const BASE_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/';
const OPENGYM_IMG_BASE = 'https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@7455efae41b330c265e7cd4b78dfa848e7ce5ebd/images/';
const OPENGYM_GIF_BASE = 'https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@7455efae41b330c265e7cd4b78dfa848e7ce5ebd/videos/';

const OPENGYM_EXACT_MAP = {
  "Dips": "chest dip",
  "Push-up": "push-up",
  "Muscle-up": "muscle up",
  "Chin-up": "chin-up",
  "Bulgarian Split Squat (Bodyweight)": "split squats",
  "Pistol Squat": "kettlebell pistol squat",
  "Romanian Deadlift (Barbell)": "barbell romanian deadlift",
  "Front Squat (Barbell)": "barbell front squat",
  "Hip Thrust (Barbell)": "barbell glute bridge",
  "Pendlay Row (Barbell)": "barbell pendlay row",
  "Close Grip Bench Press (Barbell)": "barbell close-grip bench press",
  "Good Morning (Barbell)": "barbell good morning",
  "Romanian Deadlift (Dumbbell)": "dumbbell romanian deadlift",
  "Incline Dumbbell Curl": "dumbbell incline curl",
  "Arnold Press (Dumbbell)": "dumbbell arnold press",
  "Bulgarian Split Squat (Dumbbell)": "dumbbell single leg split squat",
  "Shrugs (Dumbbell)": "dumbbell shrug",
  "Face Pull (Cable)": "cable standing rear delt row (with rope)",
  "Lateral Raise (Cable)": "cable lateral raise",
  "Cable Crossover": "cable standing fly",
  "Seated Cable Row": "cable seated row",
  "Triceps Rope Pushdown": "cable pushdown (with rope attachment)",
  "Hack Squat (Machine)": "sled hack squat",
  "Seated Calf Raise (Machine)": "lever seated calf raise",
  "Pec Deck Fly (Machine)": "lever seated fly",
  "Smith Machine Squat": "smith squat",
  "Deadlift": "barbell deadlift",
  "Lat Pulldown": "cable pulldown",
  "Bench Press": "barbell bench press",
  "Bench Press (Barbell)": "barbell bench press",
  "Pull-Up": "pull-up",
  "Pull Up": "pull-up",
  "Squat (Barbell)": "barbell full squat",
  "Squat": "barbell full squat",

  // Nowe ćwiczenia z prośby
  "Crunches": "band bicycle crunch",
  "Plank": "front plank with twist",
  "Bicep Curl (Dumbbell)": "dumbbell alternate biceps curl",
  "Hammer Curl (Dumbbell)": "dumbbell hammer curl",
  "Skull Crusher": "barbell lying triceps extension",
  "Triceps Pushdown": "cable pushdown",
  "Bent Over Row (Barbell)": "barbell bent over row",
  "Deadlift (Barbell)": "barbell deadlift",
  "Chest Fly (Dumbbell)": "dumbbell fly",
  "Incline Bench Press (Barbell)": "barbell incline bench press",
  "Leg Curl": "lever seated leg curl",
  "Leg Extension": "lever leg extension",
  "Leg Press": "sled 45в° leg press",
  "Lateral Raise (Dumbbell)": "dumbbell lateral raise",
  "Overhead Press (Barbell)": "barbell seated overhead press",

  // Z Planu Treningowego (Push, Pull, Legs, Upper, Lower)
  "Incline Dumbbell Bench Press": "dumbbell incline bench press",
  "Weighted Dips": "weighted tricep dips",
  "EZ-Bar Skullcrusher": "barbell lying triceps extension",
  "Weighted Pull-Up": "weighted pull-up",
  "T-Bar Row": "lever reverse t-bar row",
  "EZ Bar Bicep Curl": "barbell curl",
  "Leg Curl (Machine)": "lever seated leg curl",
  "Calf Raise": "lever standing calf raise",
  "Hanging Leg Raise": "hanging leg raise",
  "Cable Crunch": "cable kneeling crunch",
  "Dumbbell Lateral Raise": "dumbbell lateral raise",
  "Cable Lateral Raise": "cable lateral raise",
  "Reverse Pec Deck Fly": "lever seated reverse fly",
  "Spider Curl": "dumbbell prone incline curl",
  "Weighted Plank": "weighted front plank"
};

export const EXERCISE_IMAGE_MAP = {
  "Dips": "Dips_-_Chest_Version/0.jpg",
  "Push-up": "Pushups/0.jpg",
  "Muscle-up": "Muscle_Up/0.jpg",
  "Chin-up": "Chin-Up/0.jpg",
  "Bulgarian Split Squat (Bodyweight)": "Split_Squat_with_Dumbbells/0.jpg",
  "Pistol Squat": "Kettlebell_Pistol_Squat/0.jpg",
  "Romanian Deadlift (Barbell)": "Romanian_Deadlift_from_Deficit/0.jpg",
  "Front Squat (Barbell)": "Front_Squat_Clean_Grip/0.jpg",
  "Hip Thrust (Barbell)": "Barbell_Glute_Bridge/0.jpg",
  "Pendlay Row (Barbell)": "Bent_Over_Barbell_Row/0.jpg",
  "Close Grip Bench Press (Barbell)": "Close-Grip_Barbell_Bench_Press/0.jpg",
  "Good Morning (Barbell)": "Good_Morning/0.jpg",
  "Romanian Deadlift (Dumbbell)": "Romanian_Deadlift/0.jpg",
  "Incline Dumbbell Curl": "Alternate_Incline_Dumbbell_Curl/0.jpg",
  "Arnold Press (Dumbbell)": "Arnold_Dumbbell_Press/0.jpg",
  "Bulgarian Split Squat (Dumbbell)": "Split_Squat_with_Dumbbells/0.jpg",
  "Shrugs (Dumbbell)": "Dumbbell_Shrug/0.jpg",
  "Face Pull (Cable)": "Face_Pull/0.jpg",
  "Lateral Raise (Cable)": "Side_Lateral_Raise/0.jpg",
  "Cable Crossover": "Cable_Crossover/0.jpg",
  "Seated Cable Row": "Seated_Cable_Rows/0.jpg",
  "Triceps Rope Pushdown": "Triceps_Pushdown_-_Rope_Attachment/0.jpg",
  "Hack Squat (Machine)": "Hack_Squat/0.jpg",
  "Seated Calf Raise (Machine)": "Seated_Calf_Raise/0.jpg",
  "Pec Deck Fly (Machine)": "Butterfly/0.jpg",
  "Smith Machine Squat": "Smith_Machine_Squat/0.jpg"
};

function getOpenGymMatch(exerciseName) {
  if (!exerciseName) return null;
  
  // 1. Check manual exact map first
  const exactMapName = OPENGYM_EXACT_MAP[exerciseName];
  if (exactMapName) {
    const match = opengymDb.find(ex => ex.n === exactMapName);
    if (match) return match;
  }
  
  // 2. Fuzzy matching
  const normalizedName = exerciseName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const noEq = exerciseName.replace(/\([^)]+\)/g, '').trim();
  const normNoEq = noEq.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  let ogMatch = opengymDb.find(ex => ex.n.toLowerCase().replace(/[^a-z0-9]/g, '') === normalizedName);
  if (!ogMatch) {
    ogMatch = opengymDb.find(ex => ex.n.toLowerCase().replace(/[^a-z0-9]/g, '') === normNoEq);
  }
  return ogMatch;
}

export function getExerciseImage(exerciseName) {
  if (!exerciseName) return null;
  
  const ogMatch = getOpenGymMatch(exerciseName);
  if (ogMatch && ogMatch.img) {
    return OPENGYM_IMG_BASE + ogMatch.img;
  }
  
  // Fallback to existing manual map
  if (EXERCISE_IMAGE_MAP[exerciseName]) {
    return BASE_URL + EXERCISE_IMAGE_MAP[exerciseName];
  }

  // Fallback to existing free-exercise-db
  const normalizedName = exerciseName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const noEq = exerciseName.replace(/\([^)]+\)/g, '').trim();
  const normNoEq = noEq.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  let match = exercisesDb.find(ex => {
    const exName = ex.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    return exName === normalizedName;
  });

  if (!match) {
    match = exercisesDb.find(ex => {
      const exName = ex.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      return exName === normNoEq || exName.includes(normNoEq) || (normNoEq.length > 3 && normNoEq.includes(exName));
    });
  }

  if (match && match.images && match.images.length > 0) {
    return BASE_URL + match.images[0];
  }
  
  return null;
}

export function getExerciseGif(exerciseName) {
  if (!exerciseName) return null;
  const ogMatch = getOpenGymMatch(exerciseName);
  if (ogMatch && ogMatch.gif) {
    return OPENGYM_GIF_BASE + ogMatch.gif;
  }
  return null;
}

export function getExerciseInstructions(exerciseName) {
  if (!exerciseName) return null;
  const ogMatch = getOpenGymMatch(exerciseName);
  if (ogMatch && ogMatch.st) {
    return ogMatch.st;
  }
  return null;
}
