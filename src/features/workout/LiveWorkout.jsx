import React, { useState } from 'react';
import { useWorkoutSession } from './useWorkoutSession';
import ExerciseCard from './ExerciseCard';
import Navigation from './Navigation';
import WorkoutStart from './WorkoutStart';
import ExerciseLibrary from './ExerciseLibrary';
import RestTimerOverlay from './RestTimerOverlay';
import WorkoutRecap from './WorkoutRecap';
import { Plus } from 'lucide-react';

export default function LiveWorkout() {
  const [activeTab, setActiveTab] = useState('workout');
  const [showLibrary, setShowLibrary] = useState(false);
  const [showRecap, setShowRecap] = useState(false);
  const {
    exercises,
    sessionStatus,
    workoutTimeFormatted,
    restTime,
    isResting,
    activeRestSetId,
    startWorkout,
    executeReset,
    completeAndSaveWorkout,
    updateSet,
    toggleSetComplete,
    toggleSetType,
    moveSet,
    addExerciseToSession,
    addSetToExercise,
    updateExerciseRestDuration,
    setRestTime
  } = useWorkoutSession();

  const [showResetModal, setShowResetModal] = useState(false);
  const [isTimerMinimized, setIsTimerMinimized] = useState(false);

  const isIdle = sessionStatus === 'idle';
  const isActive = sessionStatus === 'active';

  const handleComplete = () => {
    completeAndSaveWorkout();
    setShowRecap(true);
  };

  const handleAddExercise = (exercise) => {
    addExerciseToSession(exercise);
    setShowLibrary(false);
  };

  const skipRest = () => {
    setRestTime(0);
    setIsTimerMinimized(false);
  };

  if (isIdle) {
    return (
      <div className="min-h-screen bg-black text-white antialiased flex flex-col items-center w-full px-4 pt-10">
        <div className="w-full max-w-2xl">
          <WorkoutStart 
            onStartBlank={() => startWorkout()} 
            onStartRoutine={(routine) => startWorkout(routine)} 
          />
        </div>
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-700">
      
      {/* Rest Timer Overlay / Mini Bar */}
      {isResting && restTime > 0 && (
        !isTimerMinimized ? (
          <RestTimerOverlay 
            duration={90} 
            timeLeft={restTime} 
            onClose={skipRest}
            onMinimize={() => setIsTimerMinimized(true)}
          />
        ) : (
          <div 
            onClick={() => setIsTimerMinimized(false)}
            className="fixed top-8 left-1/2 -translate-x-1/2 z-[210] bg-white text-black px-6 py-3 rounded-full flex items-center gap-3 font-black shadow-2xl animate-in slide-in-from-top duration-300 cursor-pointer active:scale-95"
          >
            <div className="w-2 h-2 rounded-full bg-black animate-pulse" />
            <span>Rest: {Math.floor(restTime / 60)}:{(restTime % 60).toString().padStart(2, '0')}</span>
          </div>
        )
      )}

      {/* Main Container */}
      <div className="max-w-4xl mx-auto">
        
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-2">Training</h2>
            <p className="text-[#8E8E93] font-bold">Session in progress</p>
          </div>
          <div className="bg-[#1C1C1E] border border-[#2C2C2E] text-white px-8 py-4 rounded-[24px] font-mono text-3xl font-black shadow-xl">
            {workoutTimeFormatted}
          </div>
        </header>

        {/* Status Bar */}
        <div className="mb-12">
          <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-[32px] p-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
              <span className="text-sm font-black uppercase tracking-widest text-white">
                Live Workout
              </span>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowResetModal(true)} className="bg-white/5 border border-white/10 text-white/40 font-black text-xs px-6 py-3 rounded-xl hover:text-red-500 hover:bg-red-500/10 transition-all">
                RESET
              </button>
            </div>
          </div>
        </div>

        {/* Exercises List */}
        <main className="space-y-8">
          <div className="grid grid-cols-1 gap-8">
            {exercises.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                updateSet={updateSet}
                toggleSetComplete={toggleSetComplete}
                toggleSetType={toggleSetType}
                addSetToExercise={addSetToExercise}
                updateExerciseRestDuration={updateExerciseRestDuration}
                isDisabled={!isActive}
                activeRestSetId={activeRestSetId}
                restTime={restTime}
              />
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-12">
            <button 
              onClick={() => setShowLibrary(true)}
              className="py-6 rounded-[32px] border-2 border-dashed border-[#2C2C2E] flex items-center justify-center gap-3 text-[#8E8E93] font-black hover:border-blue-500/50 hover:text-blue-500 transition-all"
            >
              <Plus size={24} strokeWidth={3} />
              ADD EXERCISE
            </button>

            <button 
              onClick={handleComplete}
              className="bg-white text-black py-6 rounded-[32px] font-black text-lg tracking-tight hover:bg-neutral-200 active:scale-[0.98] transition-all shadow-2xl shadow-white/5"
            >
              FINISH WORKOUT
            </button>
          </div>
        </main>
      </div>

      {showRecap && (
        <WorkoutRecap onClose={() => setShowRecap(false)} />
      )}

      {showLibrary && (
        <ExerciseLibrary 
          onSelect={handleAddExercise}
          onClose={() => setShowLibrary(false)}
        />
      )}

      {showResetModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1C1C1E] border border-[#2C2C2E] w-full max-w-sm rounded-[40px] p-8 text-center space-y-6">
            <h3 className="text-xl font-black text-white tracking-tight">Reset training?</h3>
            <p className="text-[#8E8E93] font-bold">This action cannot be undone.</p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setShowResetModal(false)} className="bg-black text-[#8E8E93] font-black py-4 rounded-2xl text-xs hover:bg-white/5 transition-all">
                CANCEL
              </button>
              <button onClick={() => { executeReset(); setShowResetModal(false); }} className="bg-red-500 text-white font-black py-4 rounded-2xl text-xs hover:bg-red-600 transition-all">
                RESET
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
