import React, { useState } from 'react';
import { useWorkoutSession } from './useWorkoutSession';
import ExerciseCard from './ExerciseCard';
import Navigation from './Navigation';

export default function LiveWorkout() {
  const [activeTab, setActiveTab] = useState('workout');
  const {
    exercises,
    sessionStatus,
    workoutTimeFormatted,
    restTime,
    activeRestSetId,
    startWorkout,
    pauseWorkout,
    executeReset,
    completeAndSaveWorkout,
    updateSet,
    toggleSetComplete,
    toggleSetType,
    moveSet,
  } = useWorkoutSession();

  const [showResetModal, setShowResetModal] = useState(false);

  const isIdle = sessionStatus === 'idle';
  const isActive = sessionStatus === 'active';
  const isPaused = sessionStatus === 'paused';

  return (
    <div className="min-h-screen bg-black text-white antialiased flex flex-col justify-start items-center w-full">
      
      {/* Dolna nawigacja */}
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* GŁÓWNY KONTENER: Zmieniony na max-w-2xl dla idealnego dopasowania do wielkości Feedu */}
      <div className="w-full max-w-2xl pb-32 pt-4 transition-all duration-300 px-4">
        
        {/* NAGŁÓWEK (Identyczna wielkość i styl co ekran Feed) */}
        <header className="bg-black py-5 flex justify-between items-center border-b border-neutral-900/60 mb-6">
          <h2 className="text-3xl font-bold tracking-tight text-white">Trening</h2>
          <div className="bg-neutral-950 border border-neutral-900 text-white px-4 py-1.5 rounded-2xl font-mono text-base font-bold">
            {workoutTimeFormatted}
          </div>
        </header>

        {/* STATUS TRENINGU */}
        <div className="mb-6">
          <div className="bg-neutral-950 border border-neutral-900 rounded-3xl p-4 flex items-center justify-between gap-3">
            <div className="text-xs text-neutral-500 font-bold tracking-wide">
              {isIdle && "Trening nie został rozpoczęty."}
              {isActive && "Trening jest rejestrowany..."}
              {isPaused && "Trening jest wstrzymany."}
            </div>
            <div className="flex gap-2">
              {isIdle && (
                <button onClick={startWorkout} className="bg-white text-black font-extrabold text-xs px-4 py-2.5 rounded-xl active:scale-95 transition-all">
                  Rozpocznij
                </button>
              )}
              {isActive && (
                <button onClick={pauseWorkout} className="bg-neutral-900 border border-neutral-800 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl active:scale-95 transition-all hover:bg-neutral-800">
                  Wstrzymaj
                </button>
              )}
              {isPaused && (
                <button onClick={startWorkout} className="bg-white text-black font-extrabold text-xs px-4 py-2.5 rounded-xl active:scale-95 transition-all">
                  Wznów
                </button>
              )}
              {!isIdle && (
                <button onClick={() => setShowResetModal(true)} className="bg-neutral-900 text-neutral-400 font-bold text-xs px-3 py-2.5 rounded-xl active:scale-95 transition-all border border-neutral-800 hover:bg-neutral-800">
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>

        {/* LISTA ĆWICZEŃ */}
        <main className="space-y-5">
          <div className={`space-y-5 transition-all duration-300 ${isIdle ? 'opacity-25 pointer-events-none scale-[0.99]' : 'opacity-100'}`}>
            {exercises.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                updateSet={updateSet}
                toggleSetComplete={toggleSetComplete}
                toggleSetType={toggleSetType}
                moveSet={moveSet}
                isDisabled={!isActive}
                activeRestSetId={activeRestSetId}
                restTime={restTime}
              />
            ))}
          </div>

          {!isIdle && (
            <button 
              onClick={completeAndSaveWorkout}
              className="w-full bg-white text-black py-4 rounded-3xl font-black text-sm tracking-tight hover:bg-neutral-200 active:scale-[0.98] transition-all mt-6 shadow-xl"
            >
              Zakończ i Zapisz Trening
            </button>
          )}
        </main>

        {/* MODAL RESETU */}
        {showResetModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-neutral-950 border border-neutral-900 w-full max-w-sm rounded-3xl p-6 text-center space-y-6">
              <h3 className="text-base font-bold text-white tracking-tight">Czy na pewno chcesz zresetować ten trening?</h3>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setShowResetModal(false)} className="bg-neutral-900 border border-neutral-800 text-white font-bold py-3 rounded-xl text-xs hover:bg-neutral-800">
                  Anuluj
                </button>
                <button onClick={() => { executeReset(); setShowResetModal(false); }} className="bg-white text-black font-bold py-3 rounded-xl text-xs hover:bg-neutral-200">
                  Zresetuj
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}