const fs = require('fs');
const db = require('./plateup-projekt/src/constants/exercisesDb.json');

const searchTerms = {
  "Dips": "Dips_-_Chest_Version",
  "Push-up": "Pushups", 
  "Muscle-up": "Muscle_Up",
  "Chin-up": "Chin-Up",
  "Bulgarian Split Squat (Bodyweight)": "Split_Squat_with_Dumbbells",
  "Pistol Squat": "Kettlebell_Pistol_Squat",
  "Romanian Deadlift (Barbell)": "Romanian_Deadlift_From_Deficit", // or just Romanian_Deadlift
  "Front Squat (Barbell)": "Front_Squat_Clean_Grip",
  "Hip Thrust (Barbell)": "Barbell_Glute_Bridge",
  "Pendlay Row (Barbell)": "Bent_Over_Barbell_Row",
  "Close Grip Bench Press (Barbell)": "Close-Grip_Barbell_Bench_Press",
  "Good Morning (Barbell)": "Good_Morning",
  "Romanian Deadlift (Dumbbell)": "Romanian_Deadlift",
  "Incline Dumbbell Curl": "Alternate_Incline_Dumbbell_Curl",
  "Arnold Press (Dumbbell)": "Arnold_Dumbbell_Press",
  "Bulgarian Split Squat (Dumbbell)": "Split_Squat_with_Dumbbells",
  "Shrugs (Dumbbell)": "Dumbbell_Shrug",
  "Face Pull (Cable)": "Face_Pull",
  "Lateral Raise (Cable)": "Side_Lateral_Raise", // Let's check if this exists
  "Cable Crossover": "Cable_Crossover",
  "Seated Cable Row": "Seated_Cable_Rows",
  "Triceps Rope Pushdown": "Triceps_Pushdown_-_Rope_Attachment",
  "Hack Squat (Machine)": "Hack_Squat",
  "Seated Calf Raise (Machine)": "Seated_Calf_Raise",
  "Pec Deck Fly (Machine)": "Butterfly",
  "Smith Machine Squat": "Smith_Machine_Squat"
}

let mapStr = "export const EXERCISE_IMAGE_MAP = {\n";
Object.entries(searchTerms).forEach(([name, expectedId]) => {
  let found = db.find(e => e.id === expectedId);
  if (!found) found = db.find(e => e.name.toLowerCase() === name.toLowerCase());
  if (!found) found = db.find(e => e.name.toLowerCase().includes(expectedId.replace(/_/g, ' ').toLowerCase()));
  
  if (found) {
    mapStr += `  "${name}": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${found.images[0]}",\n`;
  } else {
    mapStr += `  "${name}": null,\n`;
  }
});
mapStr += "};";
console.log(mapStr);
