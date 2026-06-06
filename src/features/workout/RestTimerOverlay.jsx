import React, { useEffect, useState } from 'react';
import { X, Bell } from 'lucide-react';

export default function RestTimerOverlay({ duration, timeLeft, onClose, onMinimize }) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    setProgress((timeLeft / duration) * 100);
  }, [timeLeft, duration]);

  // Format time MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
      
      <div className="relative bg-[#1C1C1E] w-full max-w-sm rounded-[48px] p-10 border border-[#2C2C2E] shadow-2xl flex flex-col items-center">
        <div className="absolute top-8 left-10 flex gap-4">
           <button 
             onClick={onMinimize}
             className="text-[#8E8E93] font-black text-[10px] uppercase tracking-widest hover:text-white"
           >
             Minimize
           </button>
        </div>
        
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-3 bg-black/50 rounded-full text-[#8E8E93] hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <h3 className="text-[#8E8E93] font-black uppercase tracking-widest text-[10px] mb-12">Resting</h3>

        {/* Circular Progress */}
        <div className="relative w-64 h-64 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="128"
              cy="128"
              r="115"
              stroke="currentColor"
              strokeWidth="10"
              fill="transparent"
              className="text-white/5"
            />
            <circle
              cx="128"
              cy="128"
              r="115"
              stroke="currentColor"
              strokeWidth="10"
              fill="transparent"
              strokeDasharray={722}
              strokeDashoffset={722 - (722 * progress) / 100}
              strokeLinecap="round"
              className="text-white transition-all duration-1000 ease-linear shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-7xl font-black tabular-nums tracking-tighter">{formatTime(timeLeft)}</span>
          </div>
        </div>

        <div className="mt-14 flex gap-4 w-full">
          <button 
            onClick={onClose}
            className="flex-1 bg-white text-black h-16 rounded-2xl font-black text-sm active:scale-95 transition-all shadow-xl shadow-white/5"
          >
            SKIP REST
          </button>
        </div>
      </div>
    </div>
  );
}
