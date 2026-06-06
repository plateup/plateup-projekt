import React from 'react';

export default function SetRow({ 
  exerciseId, 
  set, 
  index,
  updateSet, 
  toggleSetComplete, 
  toggleSetType,
  isDisabled, 
  isRestingOnThisSet, 
  restTime 
}) {
  
  return (
    <div className={`grid grid-cols-5 items-center text-center py-1.5 px-3 rounded-2xl transition-colors ${
      set.isCompleted 
        ? 'bg-emerald-950/10 border border-emerald-500/10' 
        : 'border border-transparent'
    }`}>
      
      {/* KOLUMNA 1: NUMER SERII */}
      <div className="flex flex-col items-center justify-center min-h-[36px]">
        <button
          type="button"
          disabled={isDisabled || set.isCompleted}
          onClick={() => toggleSetType(exerciseId, set.id)}
          className={`text-xs font-black px-2 py-0.5 rounded-lg transition-all ${
            set.type === 'warmup' 
              ? 'text-amber-500 scale-105' 
              : set.isCompleted ? 'text-emerald-500/70' : 'text-neutral-400 hover:text-white'
          }`}
        >
          {set.type === 'warmup' ? 'W' : index + 1}
        </button>
      </div>

      {/* KOLUMNA 2: CIĘŻAR (KG) */}
      <div className="px-1">
        <input
          type="number"
          placeholder={set.prevKg || '—'}
          value={set.kg}
          disabled={isDisabled || set.isCompleted}
          onChange={(e) => updateSet(exerciseId, set.id, 'kg', e.target.value)}
          className={`w-full bg-neutral-900 rounded-xl py-2 text-center text-sm font-bold border-transparent focus:border-transparent focus:ring-0 outline-none focus:outline-none transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
            set.isCompleted 
              ? 'text-emerald-500 bg-transparent font-medium' 
              : 'text-white placeholder-neutral-700'
          }`}
        />
      </div>

      {/* KOLUMNA 3: POWTÓRZENIA (REPS) */}
      <div className="px-1">
        <input
          type="number"
          placeholder={set.prevReps || '—'}
          value={set.reps}
          disabled={isDisabled || set.isCompleted}
          onChange={(e) => updateSet(exerciseId, set.id, 'reps', e.target.value)}
          className={`w-full bg-neutral-900 rounded-xl py-2 text-center text-sm font-bold border-transparent focus:border-transparent focus:ring-0 outline-none focus:outline-none transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
            set.isCompleted 
              ? 'text-emerald-500 bg-transparent font-medium' 
              : 'text-white placeholder-neutral-700'
          }`}
        />
      </div>

      {/* KOLUMNA 4: RPE */}
      <div className="px-1">
        <input
          type="number"
          step="0.5"
          placeholder={set.prevRpe || '—'}
          value={set.rpe}
          disabled={isDisabled || set.isCompleted}
          onChange={(e) => updateSet(exerciseId, set.id, 'rpe', e.target.value)}
          className={`w-full bg-neutral-900 rounded-xl py-2 text-center text-sm font-bold border-transparent focus:border-transparent focus:ring-0 outline-none focus:outline-none transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
            set.isCompleted 
              ? 'text-emerald-500 bg-transparent font-medium' 
              : 'text-white placeholder-neutral-700'
          }`}
        />
      </div>

      {/* KOLUMNA 5: STATUS (PTASZEK) */}
      <div className="flex items-center justify-center relative">
        <button
          onClick={() => toggleSetComplete(exerciseId, set.id)}
          disabled={isDisabled}
          className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all border ${
            set.isCompleted
              ? 'bg-emerald-500 border-emerald-400 text-black font-black scale-100'
              : 'bg-neutral-900 border-neutral-800 text-transparent hover:border-neutral-700 active:scale-90'
          }`}
        >
          ✓
        </button>

        {isRestingOnThisSet && restTime > 0 && (
          <div className="absolute left-full ml-2 text-white font-mono font-bold text-[11px] bg-neutral-950 px-2 py-1 rounded-lg border border-neutral-900 shadow-xl whitespace-nowrap z-10">
            {Math.floor(restTime / 60)}:{(restTime % 60).toString().padStart(2, '0')}
          </div>
        )}
      </div>

    </div>
  );
}