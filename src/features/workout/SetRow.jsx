import React, { useState } from 'react';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';

export default function SetRow({ 
  exerciseId, 
  set, 
  index,
  updateSet, 
  toggleSetComplete, 
  toggleSetType,
  isDisabled 
}) {
  const [showTypeSelector, setShowTypeSelector] = useState(false);

  const types = [
    { id: 'normal', label: 'Regular', short: index + 1 },
    { id: 'warmup', label: 'Warmup', short: 'W' },
    { id: 'failure', label: 'Failure', short: 'F' },
    { id: 'drop', label: 'Drop Set', short: 'D' },
    { id: 'cluster', label: 'Cluster', short: 'C' },
  ];

  const currentType = types.find(t => t.id === set.type) || types[0];

  const handleTypeSelect = (typeId) => {
    toggleSetType(exerciseId, set.id, typeId);
    setShowTypeSelector(false);
  };

  return (
    <div className={`relative grid grid-cols-[60px_1fr_1fr_1fr_60px] gap-3 items-center p-2 rounded-2xl transition-all ${
      set.isCompleted ? 'bg-white/5' : ''
    }`}>
      
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
                <span className="text-sm font-bold">{t.label}</span>
                {set.type === t.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Weight KG */}
      <div className="relative">
        <input
          type="text"
          inputMode="decimal"
          placeholder={set.prevKg || "0"}
          className="w-full bg-black text-white text-center font-black py-4 rounded-xl border border-[#2C2C2E] focus:border-white/40 outline-none transition-all placeholder:text-[#3C3C3E]"
          value={set.kg}
          onChange={(e) => updateSet(exerciseId, set.id, 'kg', e.target.value)}
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
          onChange={(e) => updateSet(exerciseId, set.id, 'rpe', e.target.value)}
          disabled={isDisabled || set.isCompleted}
        />
      </div>

      {/* Checkbox */}
      <div className="flex justify-center">
        <button
          onClick={() => toggleSetComplete(exerciseId, set.id)}
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
    </div>
  );
}
