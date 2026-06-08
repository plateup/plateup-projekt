import React, { useState, useEffect } from 'react';
import { ModalPortal } from '../../components/ui';

export default function PlateCalculator({ initialWeight, onClose }) {
  const [targetWeight, setTargetWeight] = useState(initialWeight || '');
  const barbellWeight = 20;
  
  const calculatePlates = () => {
    const weightPerSide = (parseFloat(targetWeight || 0) - barbellWeight) / 2;
    if (isNaN(weightPerSide) || weightPerSide <= 0) return [];
    
    const availablePlates = [25, 20, 15, 10, 5, 2.5, 1.25];
    let remaining = weightPerSide;
    const platesUsed = [];

    availablePlates.forEach((plate) => {
      while (remaining >= plate) {
        platesUsed.push(plate);
        remaining -= plate;
        // fix floating point errors
        remaining = Math.round(remaining * 100) / 100;
      }
    });
    return platesUsed;
  };

  const plates = calculatePlates();

  return (
    <ModalPortal>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[500] p-4 animate-in fade-in duration-200">
        <div className="bg-[#1C1C1E] border border-white/10 w-full max-w-sm rounded-[32px] p-6 shadow-2xl text-white space-y-6 text-center animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center text-left">
          <div className="space-y-0.5">
            <h4 className="text-xl font-black tracking-tight text-white">Plate Calculator</h4>
            <p className="text-xs font-bold text-[#8E8E93] uppercase tracking-wider">Standard Barbell (20kg)</p>
          </div>
          <button 
            onClick={onClose} 
            className="w-10 h-10 rounded-full bg-black border border-white/10 flex items-center justify-center text-sm font-bold text-[#8E8E93] hover:text-white hover:bg-white/5 transition-all active:scale-95"
          >
            ✕
          </button>
        </div>
        
        {/* Weight Input */}
        <div className="bg-black rounded-3xl p-6 flex flex-col items-center justify-center border border-[#2C2C2E]">
          <span className="text-[10px] text-[#8E8E93] font-black uppercase tracking-widest mb-2">Target Weight</span>
          <div className="flex items-baseline gap-2">
            <input 
              type="number" 
              value={targetWeight}
              onChange={(e) => setTargetWeight(e.target.value)}
              placeholder="0"
              className="w-24 bg-transparent text-center text-5xl font-black focus:outline-none placeholder:text-white/20 text-white"
              autoFocus
            />
            <span className="text-xl font-black text-[#8E8E93]">kg</span>
          </div>
        </div>

        {/* Plates Result */}
        <div className="space-y-3 pt-2">
          {plates.length > 0 ? (
            <>
              <span className="text-[10px] font-black text-[#8E8E93] uppercase tracking-widest block ml-2 text-left">Plates Per Side</span>
              <div className="flex flex-wrap gap-2 justify-center py-2 bg-white/5 rounded-2xl p-4 border border-white/5">
                {plates.map((plate, index) => (
                  <div 
                    key={index} 
                    className={`flex items-center justify-center w-14 h-14 rounded-full font-black text-sm shadow-xl ${
                      plate >= 20 ? 'bg-red-500 text-white shadow-red-500/20' : 
                      plate >= 10 ? 'bg-blue-500 text-white shadow-blue-500/20' : 
                      'bg-white text-black shadow-white/10'
                    }`}
                  >
                    {plate}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="py-8 text-center text-sm font-bold text-[#8E8E93] bg-white/5 rounded-2xl border border-white/5">
              {parseFloat(targetWeight || 0) <= 20 ? "Target weight must be greater than barbell." : "Enter weight to calculate plates."}
            </div>
          )}
        </div>
      </div>
    </div>
    </ModalPortal>
  );
}