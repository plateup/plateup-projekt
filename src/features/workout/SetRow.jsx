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
      controls.start({ x: 0 }); // snap back
    } else {
      controls.start({ x: 0 }); // snap back
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

  return (
    <motion.div 
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.4}
      onDragEnd={handleDragEnd}
      animate={controls}
      className={`relative grid grid-cols-[60px_1fr_1fr_1fr_60px] gap-3 items-center p-2 rounded-2xl transition-all ${
        set.isCompleted ? 'bg-white/5' : ''
      }`}
    >
      
      {/* Set Number / Type Trigger */}
      <div className="relative">
        <button 
          onClick={() => setShowTypeSelector(!showTypeSelector)}
          className={`w-full aspect-square rounded-xl flex items-center justify-center font-black transition-all ${
            set.type !== 'normal' ? 'bg-white/10 text-white' : 'text-[#8E8E93] hover:text-white'
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

      {/* Weight KG */}
      <div className="relative flex items-center justify-center">
        {isBodyweight && (
          <span className="absolute left-3 text-[#8E8E93] font-black text-sm pointer-events-none">+</span>
        )}
        <input
          type="text"
          inputMode="decimal"
          placeholder={set.prevKg || "0"}
          className={`w-full bg-black text-white text-center font-black py-4 rounded-xl border border-[#2C2C2E] focus:border-white/40 outline-none transition-all placeholder:text-[#3C3C3E] ${isBodyweight ? 'pl-6 pr-2' : ''}`}
          value={set.kg}
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
          placeholder={set.prevReps || "0"}
          className="w-full bg-black text-white text-center font-black py-4 rounded-xl border border-[#2C2C2E] focus:border-white/40 outline-none transition-all placeholder:text-[#3C3C3E]"
          value={set.reps}
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
          placeholder={set.prevRpe || "-"}
          className="w-full bg-black text-white text-center font-black py-4 rounded-xl border border-[#2C2C2E] focus:border-white/40 outline-none transition-all placeholder:text-[#3C3C3E]"
          value={set.rpe}
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
          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
            set.isCompleted 
              ? 'bg-white text-black shadow-lg shadow-white/10' 
              : 'bg-black border border-[#2C2C2E] text-transparent hover:border-white/20'
          }`}
        >
          <Check size={24} strokeWidth={4} className={set.isCompleted ? 'scale-100' : 'scale-0'} />
        </button>
      </div>
    </motion.div>
  );
}
