import React from 'react';
import { Dumbbell } from 'lucide-react';
import ExerciseLibrary from './ExerciseLibrary';

export default function ExercisesScreen() {
  return (
    <div className="pt-8 pb-32">
      <div className="px-6 mb-8">
        <h1 className="text-3xl font-bold text-white">Exercises</h1>
        <p className="text-[#8E8E93] mt-2 font-medium">Browse and manage your exercise database.</p>
      </div>
      
      {/* We reuse ExerciseLibrary but without the modal backdrop if possible. 
          Actually, since ExerciseLibrary is built as a Modal, we might need a non-modal version, 
          but for now we can just mount it and trick it to look like a screen, 
          or just build a simple list. Let's create a custom non-modal version directly here. */}
      <ExerciseLibraryScreen />
    </div>
  );
}

import { useState } from 'react';
import { useExercises } from '../../hooks/useExercises';
import { Search, Plus, CheckSquare, Square } from 'lucide-react';

function ExerciseLibraryScreen() {
  const { exercises, loading, addCustomExercise } = useExercises();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [newExName, setNewExName] = useState('');
  const [newExMuscle, setNewExMuscle] = useState('Chest');

  const filteredExercises = exercises.filter(ex => 
    ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ex.muscle_group.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedExercises = filteredExercises.reduce((acc, ex) => {
    if (!acc[ex.muscle_group]) acc[ex.muscle_group] = [];
    acc[ex.muscle_group].push(ex);
    return acc;
  }, {});

  const handleAddCustom = () => {
    if (newExName.trim()) {
      addCustomExercise({ name: newExName, muscle_group: newExMuscle });
      setNewExName('');
      setShowAddCustom(false);
    }
  };

  return (
    <div className="w-full bg-black flex flex-col relative min-h-[70vh]">
      <div className="px-6 pb-4">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8E8E93] group-focus-within:text-white transition-colors" size={20} />
          <input 
            type="text"
            placeholder="Search exercises..."
            className="w-full bg-[#1C1C1E] text-white h-12 rounded-xl pl-12 pr-4 font-semibold outline-none focus:ring-2 focus:ring-white/50 transition-all placeholder:text-[#8E8E93]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-24">
        <button 
          onClick={() => setShowAddCustom(true)}
          className="w-full flex items-center justify-center gap-2 py-4 bg-white text-black rounded-xl mb-6 font-bold shadow-lg shadow-white/10 active:scale-[0.97] ease-out-ios transition-all"
        >
          <Plus size={20} strokeWidth={3} />
          New Custom Exercise
        </button>

        {loading ?
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        : (
          <div className="space-y-6">
            {Object.keys(groupedExercises).sort().map(muscle => (
              <div key={muscle}>
                <h3 className="text-sm font-bold text-[#8E8E93] uppercase tracking-wider mb-3 ml-1">{muscle}</h3>
                <div className="bg-[#1C1C1E] rounded-2xl overflow-hidden divide-y divide-white/5 border border-white/5">
                  {groupedExercises[muscle].map((ex) => (
                    <div key={ex.id} className="w-full flex items-center p-4 text-left border-b border-white/5 last:border-0">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mr-4 bg-white/5 text-[#8E8E93]`}>
                        <Dumbbell size={24} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white text-[16px]">{ex.name}</h4>
                          {ex.isCustom && (
                            <span className="text-[9px] bg-blue-500 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">Custom</span>
                          )}
                        </div>
                        <span className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-wider mt-1 block">{ex.muscle_group}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddCustom && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-6 z-[700] animate-in fade-in duration-200">
          <div className="bg-[#1C1C1E] w-full max-w-md rounded-3xl p-6 border border-white/10 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-6">Create Exercise</h3>
            <div className="space-y-5">
              <div>
                <label className="text-xs font-bold text-[#8E8E93] uppercase mb-2 block ml-1">Name</label>
                <input 
                  type="text"
                  placeholder="e.g. Incline Dumbbell Press"
                  className="w-full bg-black text-white h-12 rounded-xl px-4 font-semibold outline-none focus:ring-2 focus:ring-white/50 transition-all"
                  value={newExName}
                  onChange={(e) => setNewExName(e.target.value)}
                  autoFocus
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#8E8E93] uppercase mb-2 block ml-1">Muscle Group</label>
                <select 
                  className="w-full bg-black text-white h-12 rounded-xl px-4 font-semibold outline-none focus:ring-2 focus:ring-white/50 transition-all appearance-none"
                  value={newExMuscle}
                  onChange={(e) => setNewExMuscle(e.target.value)}
                >
                  {['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio', 'Full Body'].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setShowAddCustom(false)}
                  className="flex-1 bg-white/10 text-white py-3.5 rounded-xl font-bold hover:bg-white/20 active:scale-[0.97] ease-out-ios transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddCustom}
                  disabled={!newExName.trim()}
                  className="flex-1 bg-white disabled:opacity-50 text-black py-3.5 rounded-xl font-bold shadow-lg shadow-white/10 active:scale-[0.97] ease-out-ios transition-all"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
