import React, { useState } from 'react';
import { useExercises } from '../../hooks/useExercises';
import { Search, Plus, X, ChevronRight, Dumbbell } from 'lucide-react';

export default function ExerciseLibrary({ onSelect, onClose }) {
  const { exercises, loading, addCustomExercise } = useExercises();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [newExName, setNewExName] = useState('');
  const [newExMuscle, setNewExMuscle] = useState('Chest');

  const filteredExercises = exercises.filter(ex => 
    ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ex.muscle_group.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group by muscle
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
    <div className="fixed inset-0 z-[200] flex flex-col justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Sheet Content */}
      <div className="relative w-full h-[90vh] bg-[#0A0A0A] rounded-t-[32px] shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-300 border-t border-white/10">
        
        {/* Handle for drag indicator (visual only) */}
        <div className="w-full flex justify-center pt-3 pb-1">
          <div className="w-12 h-1.5 bg-white/20 rounded-full" />
        </div>

        <header className="px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-black text-white">Exercises</h2>
          <button onClick={onClose} className="p-2 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors">
            <X size={20} strokeWidth={3} />
          </button>
        </header>

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

        <div className="flex-1 overflow-y-auto px-6 pb-12">
          <button 
            onClick={() => setShowAddCustom(true)}
            className="w-full flex items-center justify-center gap-2 py-4 bg-white text-black rounded-xl mb-6 font-bold shadow-lg shadow-white/10 active:scale-[0.98] transition-all"
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
                  <h3 className="text-sm font-black text-[#8E8E93] uppercase tracking-wider mb-3 ml-1">{muscle}</h3>
                  <div className="bg-[#1C1C1E] rounded-2xl overflow-hidden divide-y divide-white/5 border border-white/5">
                    {groupedExercises[muscle].map((ex) => (
                      <button
                        key={ex.id}
                        onClick={() => onSelect(ex)}
                        className="w-full flex items-center p-4 hover:bg-white/5 active:bg-white/10 transition-colors text-left group"
                      >
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mr-4 group-hover:bg-white/10 group-hover:text-white transition-colors">
                          <Dumbbell size={20} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-white text-[15px]">{ex.name}</h4>
                          {ex.isCustom && (
                            <span className="text-[10px] bg-white/10 text-white/70 px-1.5 py-0.5 rounded font-black mt-1 inline-block">CUSTOM</span>
                          )}
                        </div>
                        <ChevronRight size={20} className="text-[#8E8E93] group-hover:text-white transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              {filteredExercises.length === 0 && (
                <div className="text-center py-10 text-[#8E8E93]">
                  <Dumbbell size={48} className="mx-auto mb-4 opacity-20" />
                  <p className="font-bold">No exercises found</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showAddCustom && (
        <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-6 z-[210] animate-in fade-in duration-200">
          <div className="bg-[#1C1C1E] w-full max-w-md rounded-3xl p-6 border border-white/10 shadow-2xl">
            <h3 className="text-xl font-black text-white mb-6">Create Exercise</h3>
            <div className="space-y-5">
              <div>
                <label className="text-xs font-black text-[#8E8E93] uppercase mb-2 block ml-1">Name</label>
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
                <label className="text-xs font-black text-[#8E8E93] uppercase mb-2 block ml-1">Muscle Group</label>
                <div className="relative">
                  <select 
                    className="w-full bg-black text-white h-12 rounded-xl px-4 font-semibold outline-none focus:ring-2 focus:ring-white/50 transition-all appearance-none"
                    value={newExMuscle}
                    onChange={(e) => setNewExMuscle(e.target.value)}
                  >
                    {['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio', 'Full Body'].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  <ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-[#8E8E93] pointer-events-none" />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setShowAddCustom(false)}
                  className="flex-1 bg-white/10 text-white py-3.5 rounded-xl font-bold hover:bg-white/20 active:scale-[0.98] transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddCustom}
                  disabled={!newExName.trim()}
                  className="flex-1 bg-white disabled:opacity-50 text-black py-3.5 rounded-xl font-black shadow-lg shadow-white/10 active:scale-[0.98] transition-all"
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
