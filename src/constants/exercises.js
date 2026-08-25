/**
 * Plik: exercises.js
 * Autor: landzi
 * Opis: Moduł odpowiedzialny za logikę powiązaną z constants/exercises.js.
 * Technologia: React / JSX / Tailwind CSS
 */

export const EXTENDED_EXERCISES = [
  // Cwiczenia z bazy wlasnej uzytkownika i opengym
  { id: "ext-1", name: "Dips", muscle_group: "Chest", equipment: "Bodyweight", mechanic: "compound" },
  { id: "ext-2", name: "Push-up", muscle_group: "Chest", equipment: "Bodyweight", mechanic: "compound" },
  { id: "ext-3", name: "Muscle-up", muscle_group: "Back", equipment: "Bodyweight", mechanic: "compound" },
  { id: "ext-4", name: "Chin-up", muscle_group: "Back", equipment: "Bodyweight", mechanic: "compound" },
  { id: "ext-5", name: "Bulgarian Split Squat (Bodyweight)", muscle_group: "Legs", equipment: "Bodyweight", mechanic: "compound" },
  { id: "ext-6", name: "Pistol Squat", muscle_group: "Legs", equipment: "Bodyweight", mechanic: "compound" },
  
  { id: "ext-7", name: "Romanian Deadlift (Barbell)", muscle_group: "Legs", equipment: "Barbell", mechanic: "compound" },
  { id: "ext-8", name: "Front Squat (Barbell)", muscle_group: "Legs", equipment: "Barbell", mechanic: "compound" },
  { id: "ext-9", name: "Hip Thrust (Barbell)", muscle_group: "Legs", equipment: "Barbell", mechanic: "compound" },
  { id: "ext-10", name: "Pendlay Row (Barbell)", muscle_group: "Back", equipment: "Barbell", mechanic: "compound" },
  { id: "ext-11", name: "Close Grip Bench Press (Barbell)", muscle_group: "Chest", equipment: "Barbell", mechanic: "compound" },
  { id: "ext-12", name: "Good Morning (Barbell)", muscle_group: "Legs", equipment: "Barbell", mechanic: "compound" },
  
  { id: "ext-13", name: "Romanian Deadlift (Dumbbell)", muscle_group: "Legs", equipment: "Dumbbell", mechanic: "compound" },
  { id: "ext-14", name: "Incline Dumbbell Curl", muscle_group: "Arms", equipment: "Dumbbell", mechanic: "isolation" },
  { id: "ext-15", name: "Arnold Press (Dumbbell)", muscle_group: "Shoulders", equipment: "Dumbbell", mechanic: "compound" },
  { id: "ext-16", name: "Bulgarian Split Squat (Dumbbell)", muscle_group: "Legs", equipment: "Dumbbell", mechanic: "compound" },
  { id: "ext-17", name: "Shrugs (Dumbbell)", muscle_group: "Shoulders", equipment: "Dumbbell", mechanic: "isolation" },
  
  { id: "ext-18", name: "Face Pull (Cable)", muscle_group: "Shoulders", equipment: "Cable", mechanic: "isolation" },
  { id: "ext-19", name: "Lateral Raise (Cable)", muscle_group: "Shoulders", equipment: "Cable", mechanic: "isolation" },
  { id: "ext-20", name: "Cable Crossover", muscle_group: "Chest", equipment: "Cable", mechanic: "isolation" },
  { id: "ext-21", name: "Seated Cable Row", muscle_group: "Back", equipment: "Cable", mechanic: "compound" },
  { id: "ext-22", name: "Triceps Rope Pushdown", muscle_group: "Arms", equipment: "Cable", mechanic: "isolation" },
  
  { id: "ext-23", name: "Hack Squat (Machine)", muscle_group: "Legs", equipment: "Machine", mechanic: "compound" },
  { id: "ext-24", name: "Seated Calf Raise (Machine)", muscle_group: "Legs", equipment: "Machine", mechanic: "isolation" },
  { id: "ext-25", name: "Pec Deck Fly (Machine)", muscle_group: "Chest", equipment: "Machine", mechanic: "isolation" },
  { id: "ext-26", name: "Smith Machine Squat", muscle_group: "Legs", equipment: "Machine", mechanic: "compound" },

  // Dodatkowe z bazy ogolnej z prosby
  { id: "ext-27", name: "Crunches", muscle_group: "Core", equipment: "Bodyweight", mechanic: "isolation" },
  { id: "ext-28", name: "Plank", muscle_group: "Core", equipment: "Bodyweight", mechanic: "isolation" },
  { id: "ext-29", name: "Bicep Curl (Dumbbell)", muscle_group: "Arms", equipment: "Dumbbell", mechanic: "isolation" },
  { id: "ext-30", name: "Hammer Curl (Dumbbell)", muscle_group: "Arms", equipment: "Dumbbell", mechanic: "isolation" },
  { id: "ext-31", name: "Skull Crusher", muscle_group: "Arms", equipment: "Barbell", mechanic: "isolation" },
  { id: "ext-32", name: "Triceps Pushdown", muscle_group: "Arms", equipment: "Cable", mechanic: "isolation" },
  { id: "ext-33", name: "Bent Over Row (Barbell)", muscle_group: "Back", equipment: "Barbell", mechanic: "compound" },
  { id: "ext-34", name: "Deadlift (Barbell)", muscle_group: "Legs", equipment: "Barbell", mechanic: "compound" },
  { id: "ext-35", name: "Chest Fly (Dumbbell)", muscle_group: "Chest", equipment: "Dumbbell", mechanic: "isolation" },
  { id: "ext-36", name: "Incline Bench Press (Barbell)", muscle_group: "Chest", equipment: "Barbell", mechanic: "compound" },
  { id: "ext-37", name: "Leg Curl", muscle_group: "Legs", equipment: "Machine", mechanic: "isolation" },
  { id: "ext-38", name: "Leg Extension", muscle_group: "Legs", equipment: "Machine", mechanic: "isolation" },
  { id: "ext-39", name: "Leg Press", muscle_group: "Legs", equipment: "Machine", mechanic: "compound" },
  { id: "ext-40", name: "Lateral Raise (Dumbbell)", muscle_group: "Shoulders", equipment: "Dumbbell", mechanic: "isolation" },
  { id: "ext-41", name: "Overhead Press (Barbell)", muscle_group: "Shoulders", equipment: "Barbell", mechanic: "compound" },

  // Plan Treningowy (Progresja) przetlumaczony na angielski
  // Push
  { id: "ext-42", name: "Incline Dumbbell Bench Press", muscle_group: "Chest", equipment: "Dumbbell", mechanic: "compound" },
  { id: "ext-43", name: "Weighted Dips", muscle_group: "Chest", equipment: "Bodyweight", mechanic: "compound" },
  { id: "ext-44", name: "EZ-Bar Skullcrusher", muscle_group: "Arms", equipment: "Barbell", mechanic: "isolation" },
  // Pull
  { id: "ext-45", name: "Weighted Pull-Up", muscle_group: "Back", equipment: "Bodyweight", mechanic: "compound" },
  { id: "ext-46", name: "T-Bar Row", muscle_group: "Back", equipment: "Machine", mechanic: "compound" },
  { id: "ext-47", name: "Lat Pulldown", muscle_group: "Back", equipment: "Cable", mechanic: "isolation" },
  { id: "ext-48", name: "EZ Bar Bicep Curl", muscle_group: "Arms", equipment: "Barbell", mechanic: "isolation" },
  // Legs
  { id: "ext-49", name: "Calf Raise", muscle_group: "Legs", equipment: "Machine", mechanic: "isolation" },
  { id: "ext-50", name: "Hanging Leg Raise", muscle_group: "Core", equipment: "Bodyweight", mechanic: "isolation" },
  { id: "ext-51", name: "Cable Crunch", muscle_group: "Core", equipment: "Cable", mechanic: "isolation" },
  // Upper
  { id: "ext-52", name: "Bench Press (Barbell)", muscle_group: "Chest", equipment: "Barbell", mechanic: "compound" },
  { id: "ext-53", name: "Cable Lateral Raise", muscle_group: "Shoulders", equipment: "Cable", mechanic: "isolation" },
  { id: "ext-54", name: "Reverse Pec Deck Fly", muscle_group: "Shoulders", equipment: "Machine", mechanic: "isolation" },
  { id: "ext-55", name: "Spider Curl", muscle_group: "Arms", equipment: "Dumbbell", mechanic: "isolation" },
  // Lower
  { id: "ext-56", name: "Weighted Plank", muscle_group: "Core", equipment: "Bodyweight", mechanic: "isolation" }
];
