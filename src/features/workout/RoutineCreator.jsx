import React, { useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import { Plus, X, Save, Trash2 } from 'lucide-react';
import ExerciseLibrary from './ExerciseLibrary';

export default function RoutineCreator({ onClose, onSave }) {
  const [name, setName] = useState('');
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [showLibrary, setShowLibrary] = useState(false);
  const [saving, setSaving] = useState(false);

  const addExercise = (ex) => {
    setSelectedExercises([...selectedExercises, { ...ex, tempId: Date.now() }]);
    setShowLibrary(false);
  };

  const removeExercise = (tempId) => {
    setSelectedExercises(selectedExercises.filter(ex => ex.tempId !== tempId));
  };

  const handleSave = async () => {
    if (!name.trim() || selectedExercises.length === 0) return;
    setSaving(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('routines')
      .insert([{
        user_id: user.id,
        name,
        exercises: selectedExercises.map(ex => ({ id: ex.id, name: ex.name, muscle_group: ex.muscle_group }))
      }]);

    if (!error) {
      onSave();
      onClose();
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col animate-in slide-in-from-bottom duration-300">
      <header className="p-6 flex items-center justify-between border-b border-[#1C1C1E]">
        <button onClick={onClose} className="text-[#8E8E93] font-bold">Cancel</button>
        <h2 className="text-xl font-black">New Routine</h2>
        <button 
          onClick={handleSave} 
          disabled={saving || !name.trim() || selectedExercises.length === 0}
          className="text-blue-500 font-bold disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        <input 
          type="text"
          placeholder="Routine Name (e.g. Upper Body)"
          className="w-full bg-transparent text-3xl font-black outline-none mb-10 placeholder:text-[#2C2C2E]"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />

        <div className="space-y-4">
          {selectedExercises.map((ex) => (
            <div key={ex.tempId} className="flex items-center justify-between p-5 bg-[#1C1C1E] rounded-3xl border border-[#2C2C2E]">
              <div>
                <h4 className="font-black text-lg">{ex.name}</h4>
                <p className="text-sm text-[#8E8E93] font-bold uppercase">{ex.muscle_group}</p>
              </div>
              <button onClick={() => removeExercise(ex.tempId)} className="text-red-500/50 hover:text-red-500 p-2">
                <Trash2 size={20} />
              </button>
            </div>
          ))}

          <button 
            onClick={() => setShowLibrary(true)}
            className="w-full py-6 rounded-3xl border-2 border-dashed border-[#2C2C2E] flex items-center justify-center gap-2 text-[#8E8E93] font-black hover:border-blue-500/50 hover:text-blue-500 transition-all"
          >
            <Plus size={24} />
            Add Exercise
          </button>
        </div>
      </div>

      {showLibrary && (
        <ExerciseLibrary 
          onSelect={addExercise}
          onClose={() => setShowLibrary(false)}
        />
      )}
    </div>
  );
}
