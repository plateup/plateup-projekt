/**
 * Plik: SetRow.jsx
 * Autor: landzi
 * Opis: Moduł odpowiedzialny za logikę powiązaną z workout/SetRow.jsx.
 * Technologia: React / JSX / Tailwind CSS
 */

import React, { useState } from 'react';
import { Check, Trash2 } from 'lucide-react';
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
  isBodyweight
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
    if (info.offset.x < -threshold) {
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(50);
      removeSetFromExercise(exerciseId, set.id);
    } else if (info.offset.x > threshold) {
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(30);
      if (duplicateSetInExercise) duplicateSetInExercise(exerciseId, set.id);
      controls.start({ x: 0 });
    } else {
      controls.start({ x: 0 });
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

  // Mock previous string if available
  const prevString = (set.prevKg || set.prevReps) ? `${set.prevKg || '0'}kg x ${set.prevReps || '0'}` : '-';

  return (
    <motion.div 
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.4}
      onDragEnd={handleDragEnd}
      animate={controls}
      className={`relative grid grid-cols-[30px_64px_1fr_1fr_40px_30px] sm:grid-cols-[40px_80px_1fr_1fr_50px_40px] gap-2 items-center p-1 rounded-xl transition-all ${
        set.isCompleted ? 'bg-emerald-500/10' : ''
      }`}
    >
      
      {/* Set Number / Type */}
      <div className="relative flex justify-center">
        <button 
          onClick={() => setShowTypeSelector(!showTypeSelector)}
          className={`w-6 h-6 sm:w-7 sm:h-7 rounded-md flex items-center justify-center font-black text-xs sm:text-sm transition-all ${
            set.type !== 'normal' ? 'bg-amber-500 text-black' : 'bg-white/10 text-white'
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

      {/* Previous Data */}
      <div className="text-left text-[10px] sm:text-xs font-semibold text-[#8E8E93] truncate pl-1">
        {prevString}
      </div>

      {/* Weight KG */}
      <div className="relative flex items-center justify-center">
        <input
          type="text"
          inputMode="decimal"
          placeholder="-"
          className={`w-full bg-white/10 text-white text-center font-bold py-1.5 sm:py-2 rounded-lg border-none outline-none transition-all placeholder:text-[#8E8E93] text-sm sm:text-base ${
            set.isCompleted ? 'bg-transparent text-white/80' : 'focus:bg-white/20'
          }`}
          value={set.kg || ''}
          onClick={() => handleInputClick('kg')}
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
          className={`w-full bg-white/10 text-white text-center font-bold py-1.5 sm:py-2 rounded-lg border-none outline-none transition-all placeholder:text-[#8E8E93] text-sm sm:text-base ${
            set.isCompleted ? 'bg-transparent text-white/80' : 'focus:bg-white/20'
          }`}
          value={set.reps || ''}
          onClick={() => handleInputClick('reps')}
          onChange={(e) => updateSet(exerciseId, set.id, 'reps', e.target.value)}
          disabled={isDisabled || set.isCompleted}
        />
      </div>

      {/* RPE */}
      <div className="relative">
        <input
          type="text"
          inputMode="decimal"
          placeholder="-"
          className={`w-full bg-white/10 text-white text-center font-bold py-1.5 sm:py-2 rounded-lg border-none outline-none transition-all placeholder:text-[#8E8E93] text-sm sm:text-base ${
            set.isCompleted ? 'bg-transparent text-white/80' : 'focus:bg-white/20'
          }`}
          value={set.rpe || ''}
          onClick={() => handleInputClick('rpe')}
          onChange={(e) => updateSet(exerciseId, set.id, 'rpe', e.target.value)}
          disabled={isDisabled || set.isCompleted}
        />
      </div>

      {/* Checkbox */}
      <div className="flex justify-center">
        <button
          onClick={onCheck}
          disabled={isDisabled}
          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-all ${
            set.isCompleted 
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
              : 'bg-white/10 text-transparent hover:bg-white/20'
          }`}
        >
          <Check size={14} strokeWidth={4} className={set.isCompleted ? 'scale-100' : 'scale-0'} />
        </button>
      </div>
    </motion.div>
  );
}
