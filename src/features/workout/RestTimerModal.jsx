import React, { useState } from 'react';
import { ModalPortal } from '../../components/ui';

export default function RestTimerModal({ currentDuration, exerciseName, onSave, onClose }) {
  const [customSeconds, setCustomSeconds] = useState(currentDuration);

  const quickTimes = [
    { label: '1:00', value: 60 },
    { label: '1:30', value: 90 },
    { label: '2:00', value: 120 },
    { label: '3:00', value: 180 },
    { label: '5:00', value: 300 },
  ];

  const handleMinutesChange = (mins) => {
    const currentSecs = customSeconds % 60;
    const newTotal = (parseInt(mins || 0, 10) * 60) + currentSecs;
    setCustomSeconds(newTotal);
  };

  const handleSecondsChange = (secs) => {
    const currentMins = Math.floor(customSeconds / 60);
    const newTotal = (currentMins * 60) + parseInt(secs || 0, 10);
    setCustomSeconds(newTotal);
  };

  return (
    <ModalPortal>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[500] p-4 animate-in fade-in duration-200">
        <div className="bg-[#1C1C1E] border border-white/10 w-full max-w-sm rounded-[32px] p-6 shadow-2xl text-white space-y-6 text-center">
        
        {/* Header */}
        <div className="flex justify-between items-center text-left">
          <div className="space-y-0.5">
            <h4 className="text-xl font-black tracking-tight text-white">Rest Time</h4>
            <p className="text-xs font-bold text-[#8E8E93] truncate max-w-[240px] uppercase tracking-wider">{exerciseName}</p>
          </div>
          <button 
            onClick={onClose} 
            className="w-10 h-10 rounded-full bg-black border border-white/10 flex items-center justify-center text-sm font-bold text-[#8E8E93] hover:text-white hover:bg-white/5 transition-all active:scale-95"
          >
            ✕
          </button>
        </div>

        {/* Manual Input */}
        <div className="bg-black rounded-3xl p-6 flex items-center justify-center space-x-4 border border-[#2C2C2E]">
          <div className="flex flex-col items-center">
            <input 
              type="number" 
              min="0"
              max="60"
              value={Math.floor(customSeconds / 60)}
              onChange={(e) => handleMinutesChange(e.target.value)}
              className="w-20 bg-transparent text-center text-5xl font-black focus:outline-none placeholder:text-white/20"
            />
            <span className="text-[10px] text-[#8E8E93] font-black uppercase tracking-widest mt-2">Min</span>
          </div>
          <span className="text-4xl font-black text-[#2C2C2E] mb-6">:</span>
          <div className="flex flex-col items-center">
            <input 
              type="number" 
              min="0"
              max="59"
              value={customSeconds % 60}
              onChange={(e) => handleSecondsChange(e.target.value)}
              className="w-20 bg-transparent text-center text-5xl font-black focus:outline-none placeholder:text-white/20"
            />
            <span className="text-[10px] text-[#8E8E93] font-black uppercase tracking-widest mt-2">Sec</span>
          </div>
        </div>

        {/* Quick Select */}
        <div className="space-y-3 text-left">
          <span className="text-[10px] font-black text-[#8E8E93] uppercase tracking-widest block ml-2">Quick Select</span>
          <div className="flex flex-wrap gap-2">
            {quickTimes.map((t) => (
              <button
                key={t.value}
                onClick={() => setCustomSeconds(t.value)}
                className={`flex-1 py-3 px-2 rounded-2xl text-xs font-black transition-all active:scale-95 border ${
                  customSeconds === t.value 
                    ? 'bg-white text-black border-white shadow-lg shadow-white/10' 
                    : 'bg-black text-[#8E8E93] border-[#2C2C2E] hover:border-white/20 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Save */}
        <button 
          onClick={() => onSave(customSeconds)}
          className="w-full bg-white text-black font-black py-5 rounded-[24px] text-sm transition-all hover:bg-neutral-200 active:scale-95 shadow-xl shadow-white/10"
        >
          Save & Set
        </button>
      </div>
    </div>
    </ModalPortal>
  );
}