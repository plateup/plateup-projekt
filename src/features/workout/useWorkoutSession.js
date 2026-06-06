import { useState, useEffect } from 'react';

const INITIAL_EXERCISES = [
  {
    id: 'ex-1',
    name: 'Bench Press (Barbell)',
    restDuration: 180,
    sets: [
      { id: 's1', type: 'warmup', kg: '', reps: '', rpe: '', isCompleted: false, prevKg: '60', prevReps: '10', prevRpe: '6' },
      { id: 's2', type: 'normal', kg: '', reps: '', rpe: '', isCompleted: false, prevKg: '100', prevReps: '11', prevRpe: '9' },
      { id: 's3', type: 'normal', kg: '', reps: '', rpe: '', isCompleted: false, prevKg: '100', prevReps: '11', prevRpe: '9' },
    ]
  },
  {
    id: 'ex-2',
    name: 'Incline Dumbbell Press',
    restDuration: 90,
    sets: [
      { id: 's4', type: 'normal', kg: '', reps: '', rpe: '', isCompleted: false, prevKg: '35', prevReps: '8', prevRpe: '8' },
      { id: 's5', type: 'normal', kg: '', reps: '', rpe: '', isCompleted: false, prevKg: '35', prevReps: '8', prevRpe: '9' },
    ]
  }
];

export function useWorkoutSession() {
  const [sessionStatus, setSessionStatus] = useState(() => localStorage.getItem('plateup_status') || 'idle');
  const [workoutTime, setWorkoutTime] = useState(() => parseInt(localStorage.getItem('plateup_time') || '0', 10));
  const [exercises, setExercises] = useState(() => {
    const saved = localStorage.getItem('plateup_exercises');
    return saved ? JSON.parse(saved) : INITIAL_EXERCISES;
  });
  const [restTime, setRestTime] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [activeRestSetId, setActiveRestSetId] = useState(null);

  useEffect(() => { localStorage.setItem('plateup_status', sessionStatus); }, [sessionStatus]);
  useEffect(() => { localStorage.setItem('plateup_time', workoutTime.toString()); }, [workoutTime]);
  useEffect(() => { localStorage.setItem('plateup_exercises', JSON.stringify(exercises)); }, [exercises]);

  useEffect(() => {
    let interval = null;
    if (sessionStatus === 'active') {
      interval = setInterval(() => setWorkoutTime((prev) => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [sessionStatus]);

  useEffect(() => {
    let interval = null;
    if (isResting && restTime > 0) {
      interval = setInterval(() => setRestTime((prev) => prev - 1), 1000);
    } else if (restTime === 0) {
      setIsResting(false);
      setActiveRestSetId(null);
    }
    return () => clearInterval(interval);
  }, [isResting, restTime]);

  const startWorkout = () => setSessionStatus('active');
  const pauseWorkout = () => setSessionStatus('paused');
  
  const executeReset = () => {
    setSessionStatus('idle');
    setWorkoutTime(0);
    setExercises(prev => prev.map(ex => ({
      ...ex,
      sets: ex.sets.map(s => ({ ...s, kg: '', reps: '', rpe: '', isCompleted: false }))
    })));
    setIsResting(false);
    setActiveRestSetId(null);
  };

  // ZAPIS TRENINGU (Zachowuje strukturę i typy serii rozgrzewkowych na kolejną sesję)
  const completeAndSaveWorkout = () => {
    const preparedForNextWorkout = exercises.map((ex) => ({
      ...ex,
      sets: ex.sets.map((s) => ({
        ...s,
        prevKg: s.kg || s.prevKg,
        prevReps: s.reps || s.prevReps,
        prevRpe: s.rpe || s.prevRpe,
        kg: '',
        reps: '',
        rpe: '',
        isCompleted: false,
        type: s.type // To zapewnia trwałość ustawień Warmup w telefonie/bazie!
      })),
    }));

    setExercises(preparedForNextWorkout);
    setWorkoutTime(0);
    setSessionStatus('idle');
    setIsResting(false);
    setActiveRestSetId(null);
  };

  const cleanNumberInput = (value) => {
    if (value === '') return '';
    let clean = value.replace(/[^0-9.]/g, '');
    clean = clean.replace(/^0+(?=\d)/, '');
    return clean;
  };

  const updateSet = (exerciseId, setId, field, value) => {
    const cleanedValue = cleanNumberInput(value);
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

  const toggleSetType = (exerciseId, setId) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        return {
          ...ex,
          sets: ex.sets.map((s) => 
            s.id === setId ? { ...s, type: s.type === 'warmup' ? 'normal' : 'warmup' } : s
          ),
        };
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
                setRestTime(ex.restDuration || 90);
                setIsResting(true);
                if (currentSetIndex >= 0 && currentSetIndex < ex.sets.length - 1) {
                  setActiveRestSetId(ex.sets[currentSetIndex + 1].id);
                } else {
                  setActiveRestSetId(null);
                }
              } else {
                setIsResting(false);
                setRestTime(0);
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

  return {
    exercises, sessionStatus, workoutTimeFormatted: Math.floor(workoutTime / 60).toString().padStart(2, '0') + ":" + (workoutTime % 60).toString().padStart(2, '0'),
    restTime, isResting, activeRestSetId, startWorkout, pauseWorkout, executeReset, completeAndSaveWorkout, updateSet, toggleSetComplete, toggleSetType, moveSet
  };
}