import React, { useState } from 'react';
import SetRow from './SetRow';
import { MoreHorizontal, Plus, Timer, Edit3, Trash2 } from 'lucide-react';
import RestTimerModal from './RestTimerModal';

export default function ExerciseCard({ 
  exercise, 
  updateSet, 
  toggleSetComplete, 
  toggleSetType,
  addSetToExercise,
  updateExerciseRestDuration,
  isDisabled,
  activeRestSetId,
  restTime
}) {
  const [showTimerModal, setShowTimerModal] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const formatRest = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-[40px] overflow-hidden transition-all hover:border-[#3C3C3E]">
      <div className="p-6 md:p-8">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-white font-black text-lg border border-white/5">
              {exercise.name[0]}
            </div>
            <div>
              <h3 className="text-xl font-black tracking-tight text-white leading-none mb-2">{exercise.name}</h3>
              <button 
                onClick={() => setShowTimerModal(true)}
                className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#8E8E93] hover:text-white transition-colors"
              >
                <Timer size={12} />
                Rest: {formatRest(exercise.restDuration || 90)}
              </button>
            </div>
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setShowOptions(!showOptions)}
              className="p-2 text-[#8E8E93] hover:text-white transition-colors"
            >
              <MoreHorizontal size={24} />
            </button>
            
            {showOptions && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl z-[105] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <button className="w-full flex items-center gap-3 p-4 hover:bg-white/5 text-left transition-colors text-sm font-bold">
                  <Edit3 size={16} /> Edit Exercise
                </button>
                <button className="w-full flex items-center gap-3 p-4 hover:bg-white/5 text-left transition-colors text-sm font-bold text-red-500">
                  <Trash2 size={16} /> Remove
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {/* Labels */}
          <div className="grid grid-cols-[60px_1fr_1fr_1fr_60px] gap-3 text-center text-[10px] font-black text-[#8E8E93] uppercase tracking-widest px-2">
            <span>Set</span>
            <span>KG</span>
            <span>Reps</span>
            <span>RPE</span>
            <span>Done</span>
          </div>

          {/* Sets */}
          <div className="space-y-2">
            {exercise.sets.map((set, index) => (
              <SetRow
                key={set.id}
                index={index}
                exerciseId={exercise.id}
                set={set}
                updateSet={updateSet}
                toggleSetComplete={toggleSetComplete}
                toggleSetType={toggleSetType}
                isDisabled={isDisabled}
              />
            ))}
          </div>

          {/* Add Set Button */}
          <button 
            onClick={() => addSetToExercise(exercise.id)}
            className="w-full py-4 mt-2 rounded-2xl bg-black border border-[#2C2C2E] flex items-center justify-center gap-2 text-[#8E8E93] font-black text-xs hover:text-white hover:border-[#3C3C3E] transition-all"
          >
            <Plus size={16} strokeWidth={3} />
            ADD SET
          </button>
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
