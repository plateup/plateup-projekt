import React from 'react';
import { ModalPortal } from '../../components/ui';
import { X, Link2 } from 'lucide-react';

export default function SupersetModal({ exercises, targetExerciseId, onClose, onSelect }) {
  const targetExercise = exercises.find(e => e.id === targetExerciseId);
  const otherExercises = exercises.filter(e => e.id !== targetExerciseId);

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[600] flex flex-col justify-end animate-in fade-in duration-300">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <div className="relative w-full h-[60vh] bg-[#0A0A0A] rounded-t-[32px] shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-300 border-t border-white/10">
          <div className="w-full flex justify-center pt-3 pb-1">
            <div className="w-12 h-1.5 bg-white/20 rounded-full" />
          </div>
          
          <header className="px-6 py-4 flex items-center justify-between border-b border-white/5">
            <h2 className="text-xl font-black text-white">Create Superset</h2>
            <button onClick={onClose} className="p-2 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors">
              <X size={20} strokeWidth={3} />
            </button>
          </header>

          <div className="p-6">
            <p className="text-sm font-bold text-[#8E8E93] mb-4">
              Select an exercise to pair with <span className="text-white">{targetExercise?.name}</span>:
            </p>
            
            <div className="space-y-2">
              {otherExercises.length === 0 ? (
                <div className="text-center py-10 text-[#8E8E93] font-bold">
                  No other exercises in this workout.
                </div>
              ) : (
                otherExercises.map(ex => {
                  const isAlreadyLinked = ex.supersetId && ex.supersetId === targetExercise?.supersetId;
                  
                  return (
                    <button
                      key={ex.id}
                      onClick={() => onSelect(ex.id)}
                      className={`w-full p-4 rounded-2xl flex items-center justify-between transition-colors border ${
                        isAlreadyLinked 
                          ? 'bg-indigo-500/10 border-indigo-500/30' 
                          : 'bg-[#1C1C1E] border-white/5 hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${isAlreadyLinked ? 'bg-indigo-500 text-white' : 'bg-white/10 text-white'}`}>
                          {isAlreadyLinked ? <Link2 size={18} /> : ex.name[0]}
                        </div>
                        <h4 className={`font-black ${isAlreadyLinked ? 'text-indigo-400' : 'text-white'}`}>{ex.name}</h4>
                      </div>
                      {isAlreadyLinked && <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Linked</span>}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
