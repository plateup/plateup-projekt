import React from 'react';

export default function MuscleHeatmap({ stats }) {
  // Stats could be an object like { Chest: 80, Back: 40, Legs: 20 }
  
  const muscles = [
    { name: 'Chest', x: '50%', y: '25%', size: 'w-12 h-8' },
    { name: 'Back', x: '50%', y: '25%', size: 'w-12 h-16', isBack: true },
    { name: 'Shoulders', x: '50%', y: '22%', size: 'w-20 h-6' },
    { name: 'Abs', x: '50%', y: '35%', size: 'w-8 h-12' },
    { name: 'Quads', x: '50%', y: '60%', size: 'w-14 h-20' },
    { name: 'Arms', x: '50%', y: '30%', size: 'w-24 h-10' },
  ];

  const getColor = (intensity) => {
    if (!intensity || intensity === 0) return 'bg-neutral-800';
    if (intensity < 30) return 'bg-blue-900/40';
    if (intensity < 60) return 'bg-blue-600/60';
    return 'bg-blue-500';
  };

  return (
    <div className="bg-[#1C1C1E] rounded-[32px] p-8 border border-[#2C2C2E]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-black">Muscle Recovery</h3>
          <p className="text-sm text-[#8E8E93] font-bold">Based on your last 7 days</p>
        </div>
        <div className="flex gap-2">
          <div className="px-3 py-1 bg-black rounded-full text-[10px] font-black text-blue-500 border border-blue-500/20">FRONT</div>
        </div>
      </div>

      <div className="flex justify-center items-center gap-12">
        {/* Simple Human Silhouette Representation */}
        <div className="relative w-40 h-64 bg-neutral-900/50 rounded-full flex items-center justify-center border border-white/5">
          {/* Head */}
          <div className="absolute top-4 w-8 h-8 rounded-full bg-neutral-800" />
          
          {/* Torso & Muscles */}
          <div className={`absolute top-14 w-12 h-20 rounded-xl ${getColor(stats?.Chest)}`} />
          <div className={`absolute top-36 w-8 h-12 rounded-lg ${getColor(stats?.Abs)}`} />
          
          {/* Arms */}
          <div className={`absolute top-16 -left-4 w-6 h-20 rounded-full rotate-12 ${getColor(stats?.Arms)}`} />
          <div className={`absolute top-16 -right-4 w-6 h-20 rounded-full -rotate-12 ${getColor(stats?.Arms)}`} />
          
          {/* Legs */}
          <div className={`absolute top-48 left-4 w-7 h-24 rounded-full ${getColor(stats?.Quads)}`} />
          <div className={`absolute top-48 right-4 w-7 h-24 rounded-full ${getColor(stats?.Quads)}`} />
        </div>

        {/* Legend / Stats List */}
        <div className="flex-1 space-y-3">
          {Object.entries(stats || {}).map(([muscle, value]) => (
            <div key={muscle} className="flex flex-col gap-1">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-wider">
                <span>{muscle}</span>
                <span className={value > 70 ? 'text-blue-500' : 'text-[#8E8E93]'}>{value}%</span>
              </div>
              <div className="h-1.5 w-full bg-black rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all duration-1000" 
                  style={{ width: `${value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
