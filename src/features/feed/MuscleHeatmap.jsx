/**
 * Plik: MuscleHeatmap.jsx
 * Autorzy: Langier, Mietła, Jadwiszczok, Bogdański
 * Opis: Moduł odpowiedzialny za logikę powiązaną z feed/MuscleHeatmap.jsx.
 * Technologia: React / JSX / Tailwind CSS
 */

import React from 'react';

export default function MuscleHeatmap({ stats }) {
  const getColor = (intensity) => {
    if (!intensity || intensity === 0) return 'bg-white/5 text-white/40 border-white/5';
    if (intensity < 30) return 'bg-white/20 text-white/80 border-white/10';
    if (intensity < 60) return 'bg-white/50 text-black border-white/20';
    return 'bg-white text-black border-white';
  };

  const getVal = (muscle) => stats?.[muscle] || 0;

  return (
    <div className="bg-[#1C1C1E] rounded-[48px] p-8 border border-white/5 h-full flex flex-col justify-between">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-black text-white">Anatomy</h3>
          <p className="text-sm text-[#8E8E93] font-bold mt-1">Muscle engagement analysis</p>
        </div>
      </div>

      <div className="flex-1 flex justify-center items-center py-6 relative">
        {/* Abstract High-End Geometric Body Map */}
        <div className="relative w-full max-w-[240px] aspect-[1/1.5] flex flex-col items-center">
          
          {/* Head & Neck */}
          <div className="w-12 h-12 rounded-[20px] border-2 border-white/10 mb-2 opacity-50 bg-[#1C1C1E] shadow-xl" />
          
          {/* Shoulders & Chest & Arms row */}
          <div className="flex items-start justify-center gap-2 w-full relative z-10">
            {/* Left Arm */}
            <div className={`w-12 h-28 rounded-[20px] flex items-center justify-center border font-black text-[11px] transition-colors duration-500 shadow-xl ${getColor(getVal('Arms'))}`}>
               {getVal('Arms') > 0 ? getVal('Arms') + '%' : 'Arms'}
            </div>
            
            {/* Core Box (Chest + Abs) */}
            <div className="flex flex-col gap-2">
              <div className={`w-28 h-16 rounded-[20px] flex items-center justify-center border font-black text-xs transition-colors duration-500 shadow-xl ${getColor(getVal('Chest'))}`}>
                 {getVal('Chest') > 0 ? getVal('Chest') + '%' : 'Chest'}
              </div>
              <div className={`w-28 h-16 rounded-[20px] flex items-center justify-center border font-black text-xs transition-colors duration-500 shadow-xl ${getColor(getVal('Abs') || getVal('Core'))}`}>
                 {getVal('Abs') || getVal('Core') > 0 ? (getVal('Abs') || getVal('Core')) + '%' : 'Core'}
              </div>
            </div>

            {/* Right Arm */}
            <div className={`w-12 h-28 rounded-[20px] flex items-center justify-center border font-black text-[11px] transition-colors duration-500 shadow-xl ${getColor(getVal('Arms'))}`}>
               {getVal('Arms') > 0 ? getVal('Arms') + '%' : 'Arms'}
            </div>
          </div>

          {/* Legs row */}
          <div className="flex items-start justify-center gap-4 mt-2 w-full relative z-0">
             <div className={`w-16 h-32 rounded-[20px] flex items-end justify-center pb-4 border font-black text-xs transition-colors duration-500 shadow-xl ${getColor(getVal('Legs'))}`}>
                {getVal('Legs') > 0 ? getVal('Legs') + '%' : 'Legs'}
             </div>
             <div className={`w-16 h-32 rounded-[20px] flex items-end justify-center pb-4 border font-black text-xs transition-colors duration-500 shadow-xl ${getColor(getVal('Legs'))}`}>
                {getVal('Legs') > 0 ? getVal('Legs') + '%' : 'Legs'}
             </div>
          </div>
          
          {/* Background Connectors */}
          <div className="absolute inset-0 flex justify-center -z-10 opacity-20 pointer-events-none">
            <div className="w-1 h-full bg-white/20" />
            <div className="absolute top-20 w-3/4 h-1 bg-white/20" />
          </div>

        </div>
      </div>

      <div className="mt-8 space-y-3">
        {Object.entries(stats || {}).filter(([_, v]) => v > 0).slice(0, 4).map(([muscle, value]) => (
          <div key={muscle} className="flex flex-col gap-1.5">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
              <span className="text-[#8E8E93]">{muscle}</span>
              <span className="text-white">{value}%</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-1000 rounded-full" 
                style={{ width: `${value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
