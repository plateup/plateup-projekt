/**
 * Plik: LiveWorkout.jsx
 * Autorzy: Langier, Mietła, Jadwiszczok, Bogdański
 * Opis: Silnik treningowy. Rejestruje wykonywane ćwiczenia, serie, powtórzenia, czas przerw oraz przydziela EXP po zakończeniu.
 * Technologia: React / JSX / Tailwind CSS
 */

import React, { useState, useEffect } from 'react';
import { useWorkoutSession } from './useWorkoutSession';
import ExerciseCard from './ExerciseCard';
import Navigation from './Navigation';
import WorkoutStart from './WorkoutStart';
import ExerciseLibrary from './ExerciseLibrary';
import RestTimerOverlay from './RestTimerOverlay';
import WorkoutRecap from './WorkoutRecap';
import { Plus, ChevronUp } from 'lucide-react';
import { ModalPortal } from '../../components/ui';

export default function LiveWorkout({ isVisible = true, onRestore }) {
  const [activeTab, setActiveTab] = useState('workout');
  const [showLibrary, setShowLibrary] = useState(false);
  const [showRecap, setShowRecap] = useState(false);
  const [completedWorkoutSummary, setCompletedWorkoutSummary] = useState(null);
  const {
    exercises,
    sessionStatus,
    workoutTime,
    workoutTimeFormatted,
    workoutTitle,
    setWorkoutTitle,
    restTime,
    initialRestTime,
    isResting,
    activeRestSetId,
    startWorkout,
    stopRest,
    executeReset,
    completeAndSaveWorkout,
    updateSet,
    toggleSetComplete,
    toggleSetType,
    moveSet,
    addExerciseToSession,
    addSetToExercise,
    removeSetFromExercise,
    duplicateSetInExercise,
    updateExerciseRestDuration,
    setRestTime
  } = useWorkoutSession();

  const [showResetModal, setShowResetModal] = useState(false);
  const [isTimerMinimized, setIsTimerMinimized] = useState(false);

  useEffect(() => {
    const pendingRoutine = localStorage.getItem('plateup_pending_routine');
    if (pendingRoutine && isVisible) {
      try {
        const routineData = JSON.parse(pendingRoutine);
        startWorkout(routineData);
      } catch (e) {
        console.error(e);
      }
      localStorage.removeItem('plateup_pending_routine');
    }
  }, [isVisible]);

  const isIdle = sessionStatus === 'idle';
  const isActive = sessionStatus === 'active';

  const handleComplete = () => {
    let totalVolume = 0;
    const completedExercises = [];
    const muscleStats = {};
    let newPrs = 0;
    
    exercises.forEach(ex => {
      let exVolume = 0;
      let validSets = 0;
      let bestSet = null;
      let maxKg = 0;
      let isPr = false;
      
      const pastBest = ex.pastSets && ex.pastSets.length > 0 
        ? Math.max(...ex.pastSets.map(s => parseFloat(s.kg) || 0)) 
        : 0;

      ex.sets.forEach(set => {
        if (set.isCompleted && set.kg && set.reps) {
          const weight = parseFloat(set.kg);
          const reps = parseInt(set.reps, 10);
          exVolume += weight * reps;
          validSets++;
          if (weight > maxKg) {
            maxKg = weight;
            bestSet = `${weight}kg x ${reps}`;
          }
        }
      });
      
      if (maxKg > pastBest && pastBest > 0) {
        isPr = true;
        newPrs++;
      }

      if (validSets > 0) {
        totalVolume += exVolume;
        completedExercises.push({
          name: ex.name,
          sets: validSets,
          best: bestSet || '-',
          isPR: isPr,
          setsList: ex.sets.filter(s => s.isCompleted).map(s => ({
            type: s.type,
            kg: s.kg,
            reps: s.reps,
            isPR: (parseFloat(s.kg) > pastBest) && (pastBest > 0)
          }))
        });
        
        // Aggregate volume per muscle group
        const muscle = ex.muscle_group || 'Full Body';
        if (!muscleStats[muscle]) muscleStats[muscle] = 0;
        muscleStats[muscle] += exVolume;
      }
    });

    // Normalize muscle stats for Heatmap (0-100 scale based on highest volume)
    const maxMuscleVolume = Math.max(...Object.values(muscleStats), 1);
    const normalizedMuscleStats = {};
    Object.keys(muscleStats).forEach(muscle => {
      normalizedMuscleStats[muscle] = Math.round((muscleStats[muscle] / maxMuscleVolume) * 100);
    });

    // EXP Calculation
    const durationMinutes = workoutTime / 60;
    let baseExp = (totalVolume * 0.01) + (durationMinutes * 2) + (newPrs * 50); // 50 EXP per PR
    const hasLegs = Object.keys(muscleStats).some(m => m.toLowerCase().includes('leg'));
    if (hasLegs) baseExp *= 1.2;
    
    const totalExpEarned = Math.round(baseExp);

    // Save EXP globally
    const currentExp = parseInt(localStorage.getItem('plateup_exp') || '0', 10);
    const newExp = currentExp + totalExpEarned;
    localStorage.setItem('plateup_exp', newExp.toString());

    // Sync EXP to Supabase profiles (fire and forget)
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase.from('profiles').update({ exp: newExp }).eq('id', user.id).then();
      }
    });

    const summary = {
      name: workoutTitle,
      duration: workoutTimeFormatted,
      volume: totalVolume > 0 ? `${totalVolume.toLocaleString()} kg` : '0 kg',
      prs: newPrs,
      expEarned: totalExpEarned,
      exercises: completedExercises,
      muscleStats: normalizedMuscleStats,
      rawStats: { time: workoutTimeFormatted, volume: `${totalVolume.toLocaleString()} kg`, sets: completedExercises.reduce((acc, ex) => acc + ex.sets, 0), prs: newPrs }
    };

    setCompletedWorkoutSummary(summary);
    completeAndSaveWorkout();
    setShowRecap(true);
  };

  const handleAddExercise = (exercisesToAdd) => {
    if (Array.isArray(exercisesToAdd)) {
      exercisesToAdd.forEach(ex => addExerciseToSession(ex));
    } else {
      addExerciseToSession(exercisesToAdd);
    }
    setShowLibrary(false);
  };

  const handleSkipRest = () => {
    stopRest();
    setIsTimerMinimized(false);
  };

  if (isIdle) {
    if (!isVisible) return null;
    return (
      <div className="min-h-screen bg-black text-white antialiased flex flex-col items-center w-full px-4 pt-10 relative">
        <div className="w-full max-w-2xl">
          <WorkoutStart 
            onStartBlank={() => startWorkout()} 
            onStartRoutine={(routine) => startWorkout(routine)} 
          />
        </div>
        {showRecap && (
          <WorkoutRecap workout={completedWorkoutSummary} onClose={() => setShowRecap(false)} />
        )}
      </div>
    );
  }

  // Active workout minimized view
  if (!isVisible && isActive) {
    return (
      <ModalPortal>
        <div 
          onClick={onRestore}
          className="fixed bottom-[120px] left-1/2 -translate-x-1/2 w-[calc(100%-2.5rem)] max-w-lg bg-white text-black p-4 rounded-[24px] z-[500] flex items-center justify-between shadow-2xl cursor-pointer hover:bg-neutral-200 active:scale-95 transition-all animate-in slide-in-from-bottom-8 duration-300"
        >
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-black animate-pulse" />
            <span className="font-black text-sm uppercase tracking-widest">Active Workout</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono font-black">{workoutTimeFormatted}</span>
            <ChevronUp size={20} />
          </div>
        </div>
      </ModalPortal>
    );
  }

  if (!isVisible) return null;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Rest Timer Overlay / Mini Bar */}
      {isResting && restTime > 0 && (
        !isTimerMinimized ? (
          <RestTimerOverlay 
            duration={initialRestTime} 
            timeLeft={restTime} 
            onClose={handleSkipRest}
            onMinimize={() => setIsTimerMinimized(true)}
          />
        ) : (
          <ModalPortal>
            <div 
              onClick={() => setIsTimerMinimized(false)}
              className="fixed top-6 left-1/2 -translate-x-1/2 z-[500] bg-black border border-white/20 text-white px-6 py-3 rounded-full flex items-center gap-3 font-black shadow-[0_10px_40px_rgba(0,0,0,0.5)] animate-in slide-in-from-top duration-300 cursor-pointer active:scale-95 backdrop-blur-3xl"
            >
              <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span>{Math.floor(restTime / 60)}:{(restTime % 60).toString().padStart(2, '0')}</span>
            </div>
          </ModalPortal>
        )
      )}

      {/* Main Container */}
      <div className="max-w-4xl mx-auto px-2 sm:px-0">
        
        {/* iOS-like Sticky Header */}
        <header className="sticky top-0 z-[100] bg-black/90 backdrop-blur-md pt-4 pb-4 border-b border-white/5 mb-6 flex items-center justify-between px-2 -mx-2 sm:mx-0 sm:px-4 sm:rounded-b-3xl">
          <button 
            onClick={() => setShowResetModal(true)} 
            className="text-white/60 font-bold px-4 py-2.5 bg-white/5 rounded-2xl text-sm active:scale-95 hover:text-white hover:bg-white/10 transition-all"
          >
            Discard
          </button>
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-black text-[#8E8E93] uppercase tracking-widest mb-0.5">Live</span>
            <div className="font-mono text-xl font-black tabular-nums text-white">{workoutTimeFormatted}</div>
          </div>
          <button 
            onClick={handleComplete} 
            className="text-black font-black px-5 py-2.5 bg-white rounded-2xl text-sm active:scale-95 hover:bg-neutral-200 transition-all"
          >
            Finish
          </button>
        </header>

        {/* Editable Workout Title */}
        <div className="px-2 mb-8">
          <input 
            type="text"
            value={workoutTitle}
            onChange={(e) => setWorkoutTitle(e.target.value)}
            placeholder="Workout Title"
            className="w-full bg-transparent text-4xl md:text-5xl font-black tracking-tighter outline-none placeholder:text-white/20 focus:text-white transition-colors"
          />
        </div>

        {/* Exercises List */}
        <main className="space-y-6 pb-32 min-h-[60vh]">
          <div className="grid grid-cols-1 gap-8">
            {exercises.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                updateSet={updateSet}
                toggleSetComplete={toggleSetComplete}
                toggleSetType={toggleSetType}
                addSetToExercise={addSetToExercise}
                removeSetFromExercise={removeSetFromExercise}
                duplicateSetInExercise={duplicateSetInExercise}
                updateExerciseRestDuration={updateExerciseRestDuration}
                isDisabled={!isActive}
                activeRestSetId={activeRestSetId}
                restTime={restTime}
              />
            ))}
          </div>

          <div className="flex flex-col gap-4 mt-8">
            <button 
              onClick={() => setShowLibrary(true)}
              className="w-full py-5 rounded-2xl bg-white/5 text-white font-bold text-lg flex items-center justify-center gap-2 hover:bg-white/10 active:scale-[0.98] transition-all border border-white/10 shadow-sm"
            >
              <Plus size={24} strokeWidth={3} />
              Add Exercise
            </button>
          </div>
        </main>
      </div>

      {showRecap && (
        <WorkoutRecap workout={completedWorkoutSummary} onClose={() => setShowRecap(false)} />
      )}

      {showLibrary && (
        <ExerciseLibrary 
          onSelect={handleAddExercise}
          onClose={() => setShowLibrary(false)}
        />
      )}

      {showResetModal && (
        <ModalPortal>
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[500] p-4">
            <div className="bg-[#1C1C1E] border border-[#2C2C2E] w-full max-w-sm rounded-[40px] p-8 text-center space-y-6 animate-in zoom-in-95 duration-200">
              <h3 className="text-xl font-black text-white tracking-tight">Reset training?</h3>
              <p className="text-[#8E8E93] font-bold">This action cannot be undone.</p>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setShowResetModal(false)} className="bg-black text-[#8E8E93] font-black py-4 rounded-2xl text-xs hover:bg-white/5 transition-all">
                  CANCEL
                </button>
                <button onClick={() => { executeReset(); setShowResetModal(false); }} className="bg-white text-black font-black py-4 rounded-2xl text-xs hover:bg-neutral-200 transition-all">
                  RESET
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
}
