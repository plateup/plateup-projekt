import { useState, useEffect } from 'react';

export function useWorkoutSession() {
  const [sessionStatus, setSessionStatus] = useState(() => localStorage.getItem('plateup_status') || 'idle');
  const [workoutTitle, setWorkoutTitle] = useState(() => localStorage.getItem('plateup_workout_title') || 'Workout Session');
  const [workoutTime, setWorkoutTime] = useState(() => parseInt(localStorage.getItem('plateup_time') || '0', 10));
  const [exercises, setExercises] = useState(() => {
    const saved = localStorage.getItem('plateup_exercises');
    return saved ? JSON.parse(saved) : [];
  });
  const [restTime, setRestTime] = useState(0);
  const [initialRestTime, setInitialRestTime] = useState(90);
  const [isResting, setIsResting] = useState(false);
  const [activeRestSetId, setActiveRestSetId] = useState(null);
  const [restEndTime, setRestEndTime] = useState(null);

  useEffect(() => { localStorage.setItem('plateup_status', sessionStatus); }, [sessionStatus]);
  useEffect(() => { localStorage.setItem('plateup_workout_title', workoutTitle); }, [workoutTitle]);
  useEffect(() => { localStorage.setItem('plateup_time', workoutTime.toString()); }, [workoutTime]);
  useEffect(() => { localStorage.setItem('plateup_exercises', JSON.stringify(exercises)); }, [exercises]);

  // Timer logic for workout duration
  useEffect(() => {
    let interval = null;
    if (sessionStatus === 'active') {
      interval = setInterval(() => setWorkoutTime((prev) => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [sessionStatus]);

  // Rest Timer logic with background persistence
  useEffect(() => {
    let interval = null;
    if (isResting && restEndTime) {
      interval = setInterval(() => {
        const now = Date.now();
        const remaining = Math.max(0, Math.round((restEndTime - now) / 1000));
        setRestTime(remaining);
        
        if (remaining === 0) {
          setIsResting(false);
          setActiveRestSetId(null);
          setRestEndTime(null);
          playTimerSound();
          clearInterval(interval);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isResting, restEndTime]);

  const playTimerSound = () => {
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.play().catch(e => console.log("Audio play failed:", e));
    } catch (err) {
      console.error("Audio error:", err);
    }
  };

  const stopRest = () => {
    setIsResting(false);
    setActiveRestSetId(null);
    setRestEndTime(null);
    setRestTime(0);
  };

  const startWorkout = (routine = null) => {
    if (routine) {
      setWorkoutTitle(routine.name || 'Workout Session');
      const routineExercises = routine.exercises.map((ex, idx) => ({
        id: `ex-${Date.now()}-${idx}`,
        name: ex.name,
        muscle_group: ex.muscle_group || 'Full Body',
        restDuration: 90,
        sets: [
          { id: `s-${Date.now()}-1`, type: 'normal', kg: '', reps: '', rpe: '', isCompleted: false, prevKg: '', prevReps: '', prevRpe: '' },
          { id: `s-${Date.now()}-2`, type: 'normal', kg: '', reps: '', rpe: '', isCompleted: false, prevKg: '', prevReps: '', prevRpe: '' },
          { id: `s-${Date.now()}-3`, type: 'normal', kg: '', reps: '', rpe: '', isCompleted: false, prevKg: '', prevReps: '', prevRpe: '' },
        ]
      }));
      setExercises(routineExercises);
    } else {
      setExercises([]); 
    }
    setWorkoutTime(0);
    setSessionStatus('active');
  };

  const addSetToExercise = (exerciseId) => {
    setExercises(prev => prev.map(ex => {
      if (ex.id !== exerciseId) return ex;
      const history = JSON.parse(localStorage.getItem('plateup_exercise_history') || '{}');
      const pastSets = history[ex.name] || [];
      const newIndex = ex.sets.length;
      const lastSet = ex.sets[ex.sets.length - 1];
      
      const newSet = {
        id: `s-${Date.now()}`,
        type: 'normal',
        kg: lastSet?.kg || '',
        reps: lastSet?.reps || '',
        rpe: lastSet?.rpe || '',
        isCompleted: false,
        prevKg: pastSets[newIndex]?.kg || lastSet?.kg || '',
        prevReps: pastSets[newIndex]?.reps || lastSet?.reps || '',
      };
      return { ...ex, sets: [...ex.sets, newSet] };
    }));
  };

  const updateExerciseRestDuration = (exerciseId, newDuration) => {
    setExercises(prev => prev.map(ex => 
      ex.id === exerciseId ? { ...ex, restDuration: newDuration } : ex
    ));
  };

  const pauseWorkout = () => setSessionStatus('paused');
  
  const executeReset = () => {
    setSessionStatus('idle');
    setWorkoutTime(0);
    setExercises([]);
    setIsResting(false);
    setActiveRestSetId(null);
    setRestEndTime(null);
  };

  const completeAndSaveWorkout = () => {
    const history = JSON.parse(localStorage.getItem('plateup_exercise_history') || '{}');
    exercises.forEach(ex => {
      const completedSets = ex.sets.filter(s => s.isCompleted);
      if (completedSets.length > 0) {
        history[ex.name] = completedSets.map(s => ({
          kg: s.kg || s.prevKg,
          reps: s.reps || s.prevReps,
          rpe: s.rpe || s.prevRpe
        }));
      }
    });
    localStorage.setItem('plateup_exercise_history', JSON.stringify(history));

    setWorkoutTime(0);
    setSessionStatus('idle');
    setIsResting(false);
    setActiveRestSetId(null);
    setRestEndTime(null);
  };

  const cleanNumberInput = (value) => {
    if (value === '') return '';
    let clean = value.replace(/[^0-9.]/g, '');
    clean = clean.replace(/^0+(?=\d)/, '');
    return clean;
  };

  const updateSet = (exerciseId, setId, field, value) => {
    const cleanedValue = field === 'kg' || field === 'reps' || field === 'rpe' ? cleanNumberInput(value) : value;
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        return {
          ...ex,
          sets: ex.sets.map((s) => (s.id === setId ? { ...s, [field]: cleanedValue } : s)),
        };
      })
    );
  };

  const toggleSetType = (exerciseId, setId, type) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        
        let newSets = ex.sets.map((s) => 
          s.id === setId ? { ...s, type: type || (s.type === 'warmup' ? 'normal' : 'warmup') } : s
        );

        // Sort: warmup sets always go first
        newSets.sort((a, b) => {
          if (a.type === 'warmup' && b.type !== 'warmup') return -1;
          if (b.type === 'warmup' && a.type !== 'warmup') return 1;
          return 0; // maintain relative order otherwise
        });

        return { ...ex, sets: newSets };
      })
    );
  };

  const removeSetFromExercise = (exerciseId, setId) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        return { ...ex, sets: ex.sets.filter((s) => s.id !== setId) };
      })
    );
  };

  const moveSet = (exerciseId, setId, direction) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        const index = ex.sets.findIndex((s) => s.id === setId);
        if (index === -1) return ex;
        
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= ex.sets.length) return ex;

        const updatedSets = [...ex.sets];
        const [movedSet] = updatedSets.splice(index, 1);
        updatedSets.splice(newIndex, 0, movedSet);

        return { ...ex, sets: updatedSets };
      })
    );
  };

  const toggleSetComplete = (exerciseId, setId) => {
    if (sessionStatus !== 'active') return;
    setExercises((prevExercises) =>
      prevExercises.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        const currentSetIndex = ex.sets.findIndex((s) => s.id === setId);
        return {
          ...ex,
          sets: ex.sets.map((s, index) => {
            if (s.id === setId) {
              const nextCompleted = !s.isCompleted;
              let updatedKg = s.kg || s.prevKg;
              let updatedReps = s.reps || s.prevReps;
              let updatedRpe = s.rpe || s.prevRpe;

              if (nextCompleted) {
                const duration = ex.restDuration || 90;
                setInitialRestTime(duration);
                setRestTime(duration);
                setRestEndTime(Date.now() + duration * 1000);
                setIsResting(true);
                if (currentSetIndex >= 0 && currentSetIndex < ex.sets.length - 1) {
                  setActiveRestSetId(ex.sets[currentSetIndex + 1].id);
                } else {
                  setActiveRestSetId(null);
                }
              } else {
                setIsResting(false);
                setRestTime(0);
                setRestEndTime(null);
                setActiveRestSetId(null);
              }

              return { ...s, isCompleted: nextCompleted, kg: updatedKg, reps: updatedReps, rpe: updatedRpe };
            }
            return s;
          }),
        };
      })
    );
  };

  const addExerciseToSession = (exercise) => {
    const history = JSON.parse(localStorage.getItem('plateup_exercise_history') || '{}');
    const pastSets = history[exercise.name] || [];

    const newExercise = {
      id: `ex-${Date.now()}`,
      name: exercise.name,
      muscle_group: exercise.muscle_group || 'Full Body',
      restDuration: 90,
      sets: [
        { 
          id: `s-${Date.now()}-1`, 
          type: 'normal', 
          kg: '', 
          reps: '', 
          rpe: '', 
          isCompleted: false, 
          prevKg: pastSets[0]?.kg || '', 
          prevReps: pastSets[0]?.reps || '', 
          prevRpe: pastSets[0]?.rpe || '' 
        },
      ]
    };
    setExercises(prev => [...prev, newExercise]);
  };

  return {
    exercises, sessionStatus, workoutTimeFormatted: Math.floor(workoutTime / 60).toString().padStart(2, '0') + ":" + (workoutTime % 60).toString().padStart(2, '0'),
    workoutTitle, setWorkoutTitle, restTime, initialRestTime, setRestTime, isResting, activeRestSetId, startWorkout, stopRest, pauseWorkout, executeReset, completeAndSaveWorkout, updateSet, toggleSetComplete, toggleSetType, moveSet,
    addExerciseToSession, addSetToExercise, removeSetFromExercise, updateExerciseRestDuration
  };
}
