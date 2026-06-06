import React, { useState } from 'react';
import SetRow from './SetRow';
import RestTimerModal from './RestTimerModal';

export default function ExerciseCard({ 
  exercise, 
  updateSet, 
  toggleSetComplete, 
  toggleSetType,
  moveSet,
  updateExerciseRestDuration, 
  isDisabled,
  activeRestSetId,
  restTime
}) {
  const [showTimerModal, setShowTimerModal] = useState(false);

  return (
    <div className="bg-neutral-950 border border-neutral-900 rounded-3xl p-5 space-y-4">
      
      <div className="flex justify-between items-center px-1">
        <h3 className="text-base font-bold tracking-tight text-white">{exercise.name}</h3>
        <button
          onClick={() => setShowTimerModal(true)}
          className="flex items-center text-xs font-bold text-neutral-500 bg-neutral-900 border border-neutral-800/60 px-3 py-1 rounded-xl hover:text-white transition-colors"
        >
          <span className="font-mono">{Math.floor(exercise.restDuration / 60)}:{(exercise.restDuration % 60).toString().padStart(2, '0')}</span>
        </button>
      </div>

      <div className="space-y-1">
        {/* NAGŁÓWKI: Sparowane z identycznym paddingiem px-3 jak pola poniżej */}
        <div className="grid grid-cols-5 text-center text-[10px] font-black text-neutral-600 uppercase tracking-widest pb-1.5 px-3">
          <span>Seria</span>
          <span>KG</span>
          <span>Reps</span>
          <span>RPE</span>
          <span>Status</span>
        </div>

        <div className="space-y-1.5">
          {exercise.sets.map((set, index) => (
            <SetRow
              key={set.id}
              index={index}
              exerciseId={exercise.id}
              set={set}
              updateSet={updateSet}
              toggleSetComplete={toggleSetComplete}
              toggleSetType={toggleSetType}
              moveSet={moveSet}
              isDisabled={isDisabled}
              isRestingOnThisSet={activeRestSetId === set.id}
              restTime={restTime}
            />
          ))}
        </div>
      </div>

      {showTimerModal && (
        <RestTimerModal
          currentDuration={exercise.restDuration || 90}
          exerciseName={exercise.name}
          onClose={() => setShowTimerModal(false)}
          onSave={(newSeconds) => {
            updateExerciseRestDuration(exercise.id, newSeconds);
            setShowTimerModal(false);
          }}
        />
      )}
    </div>
  );
}