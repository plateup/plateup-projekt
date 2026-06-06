import React from 'react';
import { Award, Clock, Activity, Share2, Check } from 'lucide-react';

export default function WorkoutRecap({ workout, onClose }) {
  // Mock summary data if not provided
  const summary = workout || {
    name: 'Chest & Triceps Destruction',
    duration: '1h 15m',
    volume: '12,450 kg',
    prs: 3,
    exercises: [
      { name: 'Bench Press', sets: 4, best: '100kg x 5' },
      { name: 'Triceps Pushdown', sets: 3, best: '40kg x 12' }
    ]
  };

  return (
    <div className="fixed inset-0 z-[300] bg-black flex flex-col items-center p-6 animate-in slide-in-from-bottom duration-500 overflow-y-auto">
      <div className="w-full max-w-md flex flex-col items-center">
        
        {/* Celebration Header */}
        <div className="mt-12 mb-10 text-center">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 mx-auto shadow-2xl shadow-white/10">
            <Check size={48} strokeWidth={4} className="text-black" />
          </div>
          <h1 className="text-4xl font-black mb-2 tracking-tighter">Workout Complete!</h1>
          <p className="text-[#8E8E93] font-bold">You just crushed your goals.</p>
        </div>

        {/* Recap Card */}
        <div className="w-full bg-[#1C1C1E] rounded-[40px] p-8 border border-[#2C2C2E] mb-8">
          <h2 className="text-2xl font-black mb-6">{summary.name}</h2>
          
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="flex flex-col items-center">
              <Clock className="text-white/60 mb-2" size={24} />
              <span className="text-xs text-[#8E8E93] font-black uppercase tracking-widest">Time</span>
              <span className="font-black text-lg">{summary.duration}</span>
            </div>
            <div className="flex flex-col items-center">
              <Activity className="text-white/60 mb-2" size={24} />
              <span className="text-xs text-[#8E8E93] font-black uppercase tracking-widest">Volume</span>
              <span className="font-black text-lg">{summary.volume}</span>
            </div>
            <div className="flex flex-col items-center">
              <Award className="text-white/60 mb-2" size={24} />
              <span className="text-xs text-[#8E8E93] font-black uppercase tracking-widest">PRs</span>
              <span className="font-black text-lg">{summary.prs}</span>
            </div>
          </div>

          <div className="space-y-4 border-t border-white/5 pt-6">
            {summary.exercises.map((ex, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center font-bold text-white text-xs">
                    {ex.name[0]}
                  </div>
                  <span className="font-bold">{ex.name}</span>
                </div>
                <span className="text-xs font-black text-[#8E8E93]">{ex.sets} Sets • {ex.best}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="w-full space-y-4">
          <button className="w-full bg-white text-black py-5 rounded-3xl font-black flex items-center justify-center gap-3 shadow-xl hover:bg-neutral-200 active:scale-95 transition-all">
            <Share2 size={24} />
            Share Workout Card
          </button>
          <button 
            onClick={onClose}
            className="w-full bg-[#1C1C1E] text-white py-5 rounded-3xl font-black active:scale-95 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
