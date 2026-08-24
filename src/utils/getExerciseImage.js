import exercisesDb from '../constants/exercisesDb.json';

const BASE_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/';

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

export function getExerciseImage(exerciseName) {
  if (!exerciseName) return null;
  
  if (EXERCISE_IMAGE_MAP[exerciseName]) {
    return BASE_URL + EXERCISE_IMAGE_MAP[exerciseName];
  }

  const normalizedName = exerciseName.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  let match = exercisesDb.find(ex => {
    const exName = ex.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    return exName === normalizedName;
  });

  if (!match) {
    const noEq = exerciseName.replace(/\([^)]+\)/g, '').trim();
    const normNoEq = noEq.toLowerCase().replace(/[^a-z0-9]/g, '');
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
