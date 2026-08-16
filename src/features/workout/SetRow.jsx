import React, { useState } from 'react';
import { Check, Trash2, Plus } from 'lucide-react';
import { motion, useAnimation } from 'framer-motion';

export default function SetRow({ 
  exerciseId, 
  set, 
  index,
  updateSet, 
  toggleSetComplete, 
  toggleSetType,
  removeSetFromExercise,
  duplicateSetInExercise,
  isDisabled,
  isBodyweight,
  maxReps
}) {
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const controls = useAnimation();

  const types = [
    { id: 'normal', label: 'Regular', short: index || 1 },
    { id: 'warmup', label: 'Warmup', short: 'W' },
    { id: 'failure', label: 'Failure', short: 'F' },
    { id: 'drop', label: 'Drop Set', short: 'D' },
    { id: 'cluster', label: 'Cluster', short: 'C' },
  ];

  const currentType = types.find(t => t.id === set.type) || types[0];

  
  const handleTypeSelect = (typeId) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(20);
    toggleSetType(exerciseId, set.id, typeId);
    setShowTypeSelector(false);
  };

  
  const handleRemove = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(50);
    removeSetFromExercise(exerciseId, set.id);
    setShowTypeSelector(false);
  };

  
  const handleDragEnd = (event, info) => {
    const threshold = 60;
    const velocity = info.velocity.x;
    
    if (info.offset.x < -threshold || velocity < -500) {
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(50);
      removeSetFromExercise(exerciseId, set.id);
    } else if (info.offset.x > threshold || velocity > 500) {
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(30);
      if (duplicateSetInExercise) duplicateSetInExercise(exerciseId, set.id);
      controls.start({ x: 0, transition: { type: 'spring', damping: 20, stiffness: 300 } }); // snap back
    } else {
      controls.start({ x: 0, transition: { type: 'spring', damping: 20, stiffness: 300 } }); // snap back
    }
  };

  
  const handleInputClick = (field) => {
    if (isDisabled || set.isCompleted) return;
    if (!set[field]) {
      const prevFieldMap = { kg: 'prevKg', reps: 'prevReps', rpe: 'prevRpe' };
      const prevValue = set[prevFieldMap[field]];
      if (prevValue) {
        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(20);
        updateSet(exerciseId, set.id, field, prevValue);
      }
    }
  };

  
  const onCheck = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(!set.isCompleted ? 50 : 20);
    }
    toggleSetComplete(exerciseId, set.id);
  };

  const prevText = (set.prevKg && set.prevReps) ? `${set.prevKg}kg × ${set.prevReps}` : '-';

  return (
    <div className="relative overflow-hidden mb-1">
      {/* Background reveals on swipe */}
      <div className="absolute inset-0 flex items-center justify-between px-6 pointer-events-none">
        <div className="text-red-500 font-bold flex items-center gap-2">
          <Trash2 size={16} />
        </div>
        <div className="text-green-500 font-bold flex items-center gap-2">
          <Plus size={16} />
        </div>
      </div>

      <motion.div 
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        animate={controls}
        className={`relative grid grid-cols-[40px_1fr_70px_60px_40px] gap-2 items-center py-1.5 px-1 rounded-lg transition-colors z-10 ${
          set.isCompleted ? 'bg-green-500/10' : 'bg-[#1C1C1E]'
        }`}
      >
      
      {/* Set Number / Type Trigger */}
      <div className="relative flex justify-center">
        <button 
          onClick={() => setShowTypeSelector(!showTypeSelector)}
          className={`w-7 h-7 rounded-md flex items-center justify-center font-bold text-xs transition-all active:scale-[0.97] ease-out-ios ${
            set.type !== 'normal' ? 'bg-white/20 text-white' : 'text-[#8E8E93] hover:text-white'
          }`}
        >
          {currentType.short}
        </button>

        {showTypeSelector && (
          <div className="absolute left-0 top-full mt-2 w-48 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl z-[110] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            {types.map((t) => (
              <button
                key={t.id}
                onClick={() => handleTypeSelect(t.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-white/5 text-left transition-colors"
              >
                <span className="text-sm font-bold text-white">{t.label}</span>
                {set.type === t.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </button>
            ))}
            <div className="h-[1px] bg-white/5 w-full" />
            <button
              onClick={handleRemove}
              className="w-full flex items-center gap-3 p-4 hover:bg-white/5 text-left transition-colors text-white/60 hover:text-white"
            >
              <Trash2 size={16} />
              <span className="text-sm font-bold">Remove Set</span>
            </button>
          </div>
        )}
      </div>

      {/* Previous */}
      <div className="text-center text-xs font-semibold text-[#8E8E93] pl-2 whitespace-nowrap overflow-hidden text-ellipsis text-left">
        {prevText}
      </div>

      {/* Weight KG */}
      <div className="relative flex items-center justify-center">
        {isBodyweight && (
          <span className="absolute left-2 text-[#8E8E93] font-bold text-[10px] pointer-events-none">+</span>
        )}
        <input
          type="text"
          inputMode="decimal"
          placeholder="-"
          className={`w-full bg-[#2C2C2E]/50 text-white text-center font-bold py-2 rounded-lg border-none focus:bg-[#3C3C3E] outline-none transition-all placeholder:text-[#3C3C3E] text-sm ${isBodyweight ? 'pl-4' : ''}`}
          value={set.kg}
          onFocus={(e) => {
            handleInputClick('kg');
            if (!set.kg && set.prevKg) {
              updateSet(exerciseId, set.id, 'kg', set.prevKg);
              if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(10);
            }
          }}
          onChange={(e) => {
            let val = e.target.value.replace('+', '');
            updateSet(exerciseId, set.id, 'kg', val);
          }}
          disabled={isDisabled || set.isCompleted}
        />
      </div>

      {/* Reps */}
      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          placeholder="-"
          className={`w-full bg-[#2C2C2E]/50 text-white text-center font-bold py-2 rounded-lg border-none focus:bg-[#3C3C3E] outline-none transition-all placeholder:text-[#3C3C3E] text-sm`}
          value={set.reps}
          onFocus={(e) => {
            handleInputClick('reps');
            if (!set.reps && set.prevReps) {
              updateSet(exerciseId, set.id, 'reps', set.prevReps);
              if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(10);
            }
          }}
          onChange={(e) => updateSet(exerciseId, set.id, 'reps', e.target.value)}
          disabled={isDisabled || set.isCompleted}
        />
      </div>

      {/* Checkbox */}
      <div className="flex justify-center">
        <button
          onClick={onCheck}
          disabled={isDisabled}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
            set.isCompleted 
              ? 'bg-green-500 text-white shadow-md' 
              : 'bg-[#2C2C2E] text-transparent hover:bg-[#3C3C3E]'
          }`}
        >
          <Check size={16} strokeWidth={4} className={set.isCompleted ? 'scale-100' : 'scale-0'} />
        </button>
      </div>
    </motion.div>
    </div>
  );
}
