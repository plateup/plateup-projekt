const fs = require('fs');
const db = JSON.parse(fs.readFileSync('./plateup-projekt/src/constants/exercisesDb.json'));

const names = [
  "Dips", "Push-up", "Muscle-up", "Chin-up", "Bulgarian Split Squat (Bodyweight)",
  "Pistol Squat", "Romanian Deadlift (Barbell)", "Front Squat (Barbell)",
  "Pendlay Row (Barbell)", "Close Grip Bench Press (Barbell)", "Good Morning (Barbell)",
  "Arnold Press (Dumbbell)", "Incline Dumbbell Curl", "Cable Crossover",
  "Triceps Rope Pushdown", "Seated Calf Raise (Machine)", "Smith Machine Squat"
];

function normalize(str) {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

names.forEach(name => {
  const norm = normalize(name);
  let match = db.find(ex => normalize(ex.name) === norm);
  
  if (!match) {
    // Try to remove equipment like (Barbell)
    const noEq = name.replace(/\([^)]+\)/g, '').trim();
    const normNoEq = normalize(noEq);
    match = db.find(ex => normalize(ex.name) === normNoEq);
  }
  if (!match) {
    const noEq = name.replace(/\([^)]+\)/g, '').trim();
    match = db.find(ex => normalize(ex.name).includes(normalize(noEq)));
  }
  
  console.log(name, "->", match ? match.name : "NOT FOUND");
});
