import React from 'react';

export default function PlateCalculator({ targetWeight, onClose }) {
  const barbellWeight = 20;
  const weightPerSide = (parseFloat(targetWeight) - barbellWeight) / 2;
  const availablePlates = [25, 20, 15, 10, 5, 2.5, 1.25];
  
  const calculatePlates = () => {
    if (isNaN(weightPerSide) || weightPerSide <= 0) return [];
    let remaining = weightPerSide;
    const platesUsed = [];

    availablePlates.forEach((plate) => {
      while (remaining >= plate) {
        platesUsed.push(plate);
        remaining -= plate;
      }
    });
    return platesUsed;
  };

  const plates = calculatePlates();

  return (
    // PUNKT 2: items-center (środek) i bg-black/40 (delikatne przyciemnienie)
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-neutral-900 border border-neutral-800 w-full max-w-sm rounded-3xl p-6 shadow-2xl text-white space-y-5 text-center">
        <div className="flex justify-between items-center text-left">
          <h4 className="text-lg font-bold tracking-tight">Plate Calculator</h4>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-sm font-bold text-neutral-400 hover:text-white transition-all active:scale-95"
          >
            ✕
          </button>
        </div>
        
        <p className="text-sm text-neutral-400 text-left">
          Waga docelowa: <span className="font-bold text-white">{targetWeight || 0} kg</span> (Gryf: 20kg)
        </p>

        {plates.length > 0 ? (
          <div className="space-y-3 text-left">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Na jedną stronę:</span>
            <div className="flex flex-wrap gap-2 justify-center py-2">
              {plates.map((plate, index) => (
                <div 
                  key={index} 
                  className={`px-4 py-2 rounded-2xl font-bold text-sm shadow-sm ${
                    plate >= 20 ? 'bg-white text-black' : 'bg-neutral-800 text-neutral-200 border border-neutral-700'
                  }`}
                >
                  {plate} kg
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="py-6 text-center text-sm text-neutral-500">
            {parseFloat(targetWeight) <= 20 ? "Waga mniejsza bądź równa wadze gryfu." : "Wpisz ciężar, aby zobaczyć talerze."}
          </div>
        )}
      </div>
    </div>
  );
}