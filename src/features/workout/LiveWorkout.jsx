import React, { useState, useEffect } from 'react';
import { useWorkoutSession } from './useWorkoutSession';
import ExerciseCard from './ExerciseCard';
import Navigation from './Navigation';
import WorkoutStart from './WorkoutStart';
import ExerciseLibrary from './ExerciseLibrary';
import RestTimerOverlay from './RestTimerOverlay';
import WorkoutRecap from './WorkoutRecap';
import { Plus, ChevronUp } from 'lucide-react';
import { useDragControls, Reorder } from 'framer-motion';
import { ModalPortal } from '../../components/ui';
import { supabase } from '../../services/supabaseClient';

function DraggableExerciseCard({ exercise, ...props }) {
  const controls = useDragControls();

  return (
    <Reorder.Item 
      value={exercise} 
      dragListener={false} 
      dragControls={controls}
      className="relative"
    >
      <div 
        className="absolute -right-2 -top-2 p-4 cursor-grab active:cursor-grabbing z-20 opacity-30 hover:opacity-100"
        onPointerDown={(e) => controls.start(e)}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="8" y1="6" x2="21" y2="6"></line>
          <line x1="8" y1="12" x2="21" y2="12"></line>
          <line x1="8" y1="18" x2="21" y2="18"></line>
          <line x1="3" y1="6" x2="3.01" y2="6"></line>
          <line x1="3" y1="12" x2="3.01" y2="12"></line>
          <line x1="3" y1="18" x2="3.01" y2="18"></line>
        </svg>
      </div>
      <ExerciseCard exercise={exercise} {...props} />
    </Reorder.Item>
  );
}

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
    updateExerciseNote,
    replaceExerciseInSession,
    reorderExercises,
    setRestTime
  } = useWorkoutSession();

  const [showResetModal, setShowResetModal] = useState(false);
  const [isTimerMinimized, setIsTimerMinimized] = useState(false);
  const [replacingExerciseId, setReplacingExerciseId] = useState(null);

  
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

    const summary = {
      name: workoutTitle,
      duration: workoutTimeFormatted,
      volume: totalVolume > 0 ? `${totalVolume.toLocaleString()} kg` : '0 kg',
      prs: newPrs,
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
    const isRestingNow = isResting && restTime > 0;
    
    return (
      <ModalPortal>
        <div 
          onClick={onRestore}
          className={`fixed left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-lg p-4 rounded-[20px] z-[90] flex items-center justify-between shadow-2xl cursor-pointer active:scale-[0.98] transition-all duration-300 ${
            isRestingNow ? 'bg-indigo-500 text-white' : 'bg-green-500 text-black'
          }`}
          style={{ bottom: 'calc(4.5rem + var(--safe-bottom))' }}
        >
          <div className="flex flex-col">
            <span className="font-black text-sm tracking-tight">
              {isRestingNow ? 'Rest Timer' : 'Workout in Progress'}
            </span>
            <span className={`text-xs font-bold ${isRestingNow ? 'text-indigo-200' : 'text-black/70'}`}>
              {isRestingNow ? `${Math.floor(restTime / 60)}:${(restTime % 60).toString().padStart(2, '0')}` : workoutTimeFormatted}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {isRestingNow && (
              <button 
                onClick={(e) => { e.stopPropagation(); stopRest(); }}
                className="bg-black/20 hover:bg-black/30 text-white px-3 py-1.5 rounded-full text-xs font-black transition-colors"
              >
                Skip
              </button>
            )}
            <ChevronUp size={24} strokeWidth={3} className={isRestingNow ? 'text-white/50' : 'text-black/50'} />
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
              className="fixed top-6 left-1/2 -translate-x-1/2 z-[500] bg-[#1C1C1E]/80 backdrop-blur-2xl border border-white/10 text-white px-6 py-3 rounded-full flex items-center gap-3 font-bold shadow-2xl animate-in slide-in-from-top duration-300 cursor-pointer active:scale-[0.97] transition-all ease-out-ios"
            >
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              <span>{Math.floor(restTime / 60)}:{(restTime % 60).toString().padStart(2, '0')}</span>
            </div>
          </ModalPortal>
        )
      )}

      {/* Main Container */}
      <div className="max-w-4xl mx-auto px-2 sm:px-0">
        
        {/* iOS-like Sticky Header */}
        <header className="sticky top-0 z-[100] bg-black/60 backdrop-blur-2xl pt-4 pb-4 border-b border-white/5 mb-6 flex items-center justify-between px-2 -mx-2 sm:mx-0 sm:px-4 sm:rounded-b-3xl transition-all">
          <button 
            onClick={() => setShowResetModal(true)} 
            className="text-white/60 font-medium px-4 py-2.5 bg-white/5 rounded-xl text-sm active:scale-[0.97] hover:text-white hover:bg-white/10 transition-all ease-out-ios duration-200"
          >
            Discard
          </button>
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold text-[#8E8E93] uppercase tracking-wider mb-0.5">Live</span>
            <div className="font-mono text-xl font-bold tabular-nums text-white tracking-tight">{workoutTimeFormatted}</div>
          </div>
          <button 
            onClick={handleComplete} 
            className="text-black font-semibold px-5 py-2.5 bg-white rounded-xl text-sm active:scale-[0.97] hover:bg-neutral-200 transition-all ease-out-ios duration-200"
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
            className="w-full bg-transparent text-3xl md:text-4xl font-bold tracking-tight outline-none placeholder:text-white/20 focus:text-white transition-colors"
          />
        </div>

        {/* Exercises List */}
        <main className="space-y-6 pb-32 min-h-[60vh]">
          <Reorder.Group axis="y" values={exercises} onReorder={reorderExercises} className="grid grid-cols-1 gap-8">
            {exercises.map((exercise) => (
              <DraggableExerciseCard
                key={exercise.id}
                exercise={exercise}
                updateSet={updateSet}
                toggleSetComplete={toggleSetComplete}
                toggleSetType={toggleSetType}
                addSetToExercise={addSetToExercise}
                removeSetFromExercise={removeSetFromExercise}
                duplicateSetInExercise={duplicateSetInExercise}
                updateExerciseRestDuration={updateExerciseRestDuration}
                updateExerciseNote={updateExerciseNote}
                onRequestReplace={() => setReplacingExerciseId(exercise.id)}
                isDisabled={!isActive}
                activeRestSetId={activeRestSetId}
                restTime={restTime}
              />
            ))}
          </Reorder.Group>

          <div className="flex flex-col gap-4 mt-8">
            <button 
              onClick={() => setShowLibrary(true)}
              className="w-full py-4 rounded-xl bg-indigo-500/10 text-indigo-400 font-bold text-base flex items-center justify-center gap-2 hover:bg-indigo-500/20 active:scale-[0.98] transition-all"
            >
              <Plus size={20} strokeWidth={3} />
              Add Exercise
            </button>
          </div>
        </main>
      </div>

      {showRecap && (
        <WorkoutRecap workout={completedWorkoutSummary} onClose={() => setShowRecap(false)} />
      )}

      {(showLibrary || replacingExerciseId) && (
        <ExerciseLibrary 
          onSelect={(ex) => {
            if (replacingExerciseId) {
              const selectedEx = Array.isArray(ex) ? ex[0] : ex;
              replaceExerciseInSession(replacingExerciseId, selectedEx);
              setReplacingExerciseId(null);
            } else {
              handleAddExercise(ex);
            }
          }}
          onClose={() => {
            setShowLibrary(false);
            setReplacingExerciseId(null);
          }}
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
