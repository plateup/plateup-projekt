import React, { useState } from 'react';

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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-neutral-900 border border-neutral-800 w-full max-w-sm rounded-3xl p-6 shadow-2xl text-white space-y-5 text-center">
        
        {/* Header */}
        <div className="flex justify-between items-center text-left">
          <div className="space-y-0.5">
            <h4 className="text-lg font-bold tracking-tight">Czas odpoczynku</h4>
            <p className="text-xs text-neutral-400 truncate max-w-[240px]">{exerciseName}</p>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-sm font-bold text-neutral-400 hover:text-white transition-all active:scale-95"
          >
            ✕
          </button>
        </div>

        {/* Ręczny wpis (Minuty : Sekundy) */}
        <div className="bg-neutral-950 rounded-2xl p-4 flex items-center justify-center space-x-3 border border-neutral-800/60">
          <div className="flex flex-col items-center">
            <input 
              type="number" 
              min="0"
              max="60"
              value={Math.floor(customSeconds / 60)}
              onChange={(e) => handleMinutesChange(e.target.value)}
              className="w-16 bg-neutral-800 rounded-xl text-center py-2 text-xl font-bold font-mono focus:outline-none focus:ring-1 focus:ring-neutral-600"
            />
            <span className="text-[10px] text-neutral-500 font-bold uppercase mt-1">Min</span>
          </div>
          <span className="text-xl font-bold text-neutral-600">:</span>
          <div className="flex flex-col items-center">
            <input 
              type="number" 
              min="0"
              max="59"
              value={customSeconds % 60}
              onChange={(e) => handleSecondsChange(e.target.value)}
              className="w-16 bg-neutral-800 rounded-xl text-center py-2 text-xl font-bold font-mono focus:outline-none focus:ring-1 focus:ring-neutral-600"
            />
            <span className="text-[10px] text-neutral-500 font-bold uppercase mt-1">Sec</span>
          </div>
        </div>

        {/* Szybki wybór (5 najpopularniejszych czasów) */}
        <div className="space-y-2 text-left">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block px-1">Szybki wybór:</span>
          <div className="flex flex-wrap gap-2 justify-start">
            {quickTimes.map((t) => (
              <button
                key={t.value}
                onClick={() => setCustomSeconds(t.value)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border active:scale-95 ${
                  customSeconds === t.value 
                    ? 'bg-white text-black border-white' 
                    : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:border-neutral-500'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Zapisz */}
        <button 
          onClick={() => onSave(customSeconds)}
          className="w-full bg-white text-black font-bold py-3 rounded-2xl text-sm transition-all active:scale-95 shadow-lg"
        >
          Zapisz i ustaw
        </button>
      </div>
    </div>
  );
}