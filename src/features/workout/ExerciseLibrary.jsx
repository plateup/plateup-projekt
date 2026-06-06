import React, { useState } from 'react';
import { useExercises } from '../../hooks/useExercises';
import { Search, Plus, X } from 'lucide-react';

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

  const handleAddCustom = () => {
    if (newExName.trim()) {
      addCustomExercise({ name: newExName, muscle_group: newExMuscle });
      setNewExName('');
      setShowAddCustom(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col animate-in slide-in-from-bottom duration-300">
      <header className="p-6 flex items-center justify-between border-b border-[#1C1C1E]">
        <h2 className="text-2xl font-black">Exercises</h2>
        <button onClick={onClose} className="p-2 bg-[#1C1C1E] rounded-full">
          <X size={24} />
        </button>
      </header>

      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8E8E93]" size={20} />
          <input 
            type="text"
            placeholder="Search exercises..."
            className="w-full bg-[#1C1C1E] h-14 rounded-2xl pl-12 pr-4 font-bold outline-none focus:ring-2 ring-blue-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-24">
        <button 
          onClick={() => setShowAddCustom(true)}
          className="w-full flex items-center gap-4 p-4 bg-blue-500/10 text-blue-500 rounded-2xl mb-4 font-bold border border-blue-500/20"
        >
          <Plus size={24} />
          Create Custom Exercise
        </button>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredExercises.map((ex) => (
              <button
                key={ex.id}
                onClick={() => onSelect(ex)}
                className="w-full flex items-center justify-between p-5 bg-[#1C1C1E] rounded-2xl hover:bg-[#2C2C2E] transition-all text-left"
              >
                <div>
                  <h4 className="font-black text-lg">{ex.name}</h4>
                  <p className="text-sm text-[#8E8E93] font-bold uppercase tracking-wider">{ex.muscle_group}</p>
                </div>
                {ex.isCustom && (
                  <span className="text-[10px] bg-blue-500/20 text-blue-500 px-2 py-1 rounded-md font-black">CUSTOM</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {showAddCustom && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 z-[110]">
          <div className="bg-[#1C1C1E] w-full max-w-md rounded-[32px] p-8 border border-[#2C2C2E]">
            <h3 className="text-2xl font-black mb-6">Custom Exercise</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-black text-[#8E8E93] uppercase mb-2 block ml-1">Name</label>
                <input 
                  type="text"
                  placeholder="e.g. My Special Lift"
                  className="w-full bg-black h-14 rounded-2xl px-4 font-bold outline-none"
                  value={newExName}
                  onChange={(e) => setNewExName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-black text-[#8E8E93] uppercase mb-2 block ml-1">Muscle Group</label>
                <select 
                  className="w-full bg-black h-14 rounded-2xl px-4 font-bold outline-none appearance-none"
                  value={newExMuscle}
                  onChange={(e) => setNewExMuscle(e.target.value)}
                >
                  {['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Abs', 'Full Body'].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setShowAddCustom(false)}
                  className="flex-1 bg-black text-[#8E8E93] py-4 rounded-2xl font-black"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddCustom}
                  className="flex-1 bg-blue-500 text-white py-4 rounded-2xl font-black"
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
