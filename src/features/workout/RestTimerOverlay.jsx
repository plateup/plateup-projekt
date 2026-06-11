/**
 * Plik: RestTimerOverlay.jsx
 * Autorzy: Langier, Mietła, Jadwiszczok, Bogdański
 * Opis: Moduł odpowiedzialny za logikę powiązaną z workout/RestTimerOverlay.jsx.
 * Technologia: React / JSX / Tailwind CSS
 */

import React, { useEffect, useState } from 'react';
import { FastForward, ChevronUp } from 'lucide-react';
import { ModalPortal } from '../../components/ui';

export default function RestTimerOverlay({ duration, timeLeft, onClose, onMinimize }) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const baseDuration = duration || 90;
    setProgress((timeLeft / baseDuration) * 100);
  }, [timeLeft, duration]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <ModalPortal>
      <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[500] w-[calc(100%-2rem)] max-w-sm pointer-events-none animate-in slide-in-from-top-8 duration-500">
        <div className="bg-black/60 backdrop-blur-3xl rounded-[40px] p-6 border border-white/20 shadow-[0_30px_60px_rgba(0,0,0,0.8)] pointer-events-auto flex flex-col items-center">
        
        <div className="w-full flex justify-between items-center mb-6 px-2">
          <span className="text-white font-black text-xs uppercase tracking-widest">Rest Timer</span>
          <button 
            onClick={onMinimize}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all active:scale-95"
          >
            <ChevronUp size={20} strokeWidth={3} />
          </button>
        </div>

        {/* Timer Circle */}
        <div className="relative w-48 h-48 flex items-center justify-center mb-8">
          <svg className="w-full h-full -rotate-90">
            <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
            <circle
              cx="96"
              cy="96"
              r="88"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={553}
              strokeDashoffset={553 - (553 * progress) / 100}
              strokeLinecap="round"
              className="text-white transition-all duration-1000 ease-linear shadow-white"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-6xl font-black tabular-nums tracking-tighter text-white">{formatTime(timeLeft)}</span>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="w-full bg-white text-black h-16 rounded-[24px] font-black text-sm active:scale-95 transition-all flex items-center justify-center gap-2 shadow-xl hover:bg-neutral-200"
        >
          <FastForward size={20} className="fill-current" />
          SKIP REST
        </button>

      </div>
    </div>
    </ModalPortal>
  );
}
