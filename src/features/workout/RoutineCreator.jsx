import React, { useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import { Plus, X, Save, Trash2 } from 'lucide-react';
import ExerciseLibrary from './ExerciseLibrary';
import { ModalPortal } from '../../components/ui';

export default function RoutineCreator({ onClose, onSave, initialRoutine = null }) {
  const [name, setName] = useState(initialRoutine ? initialRoutine.name : '');
  const [selectedExercises, setSelectedExercises] = useState(
    initialRoutine ? initialRoutine.exercises.map(ex => ({ ...ex, tempId: Date.now() + Math.random() })) : []
  );
  const [showLibrary, setShowLibrary] = useState(false);
  const [saving, setSaving] = useState(false);

  const addExercise = (exercisesToAdd) => {
    if (Array.isArray(exercisesToAdd)) {
      const newExs = exercisesToAdd.map(ex => ({ ...ex, tempId: Date.now() + Math.random(), targetSets: 3, restDuration: 90 }));
      setSelectedExercises([...selectedExercises, ...newExs]);
    } else {
      setSelectedExercises([...selectedExercises, { ...exercisesToAdd, tempId: Date.now() + Math.random(), targetSets: 3, restDuration: 90 }]);
    }
    setShowLibrary(false);
  };

  const removeExercise = (tempId) => {
    setSelectedExercises(selectedExercises.filter(ex => ex.tempId !== tempId));
  };

  const updateExerciseSets = (tempId, sets) => {
    setSelectedExercises(selectedExercises.map(ex => 
      ex.tempId === tempId ? { ...ex, targetSets: parseInt(sets, 10) || 1 } : ex
    ));
  };

  const updateExerciseRest = (tempId, duration) => {
    setSelectedExercises(selectedExercises.map(ex => 
      ex.tempId === tempId ? { ...ex, restDuration: Math.max(30, duration) } : ex
    ));
  };

  const formatRest = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleSave = async () => {
    if (!name.trim() || selectedExercises.length === 0) return;
    setSaving(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (initialRoutine) {
      const { error } = await supabase
        .from('routines')
        .update({
          name,
          exercises: selectedExercises.map(ex => ({ 
            id: ex.id, 
            name: ex.name, 
            muscle_group: ex.muscle_group,
            sets: ex.targetSets || 3,
            restDuration: ex.restDuration || 90
          }))
        })
        .eq('id', initialRoutine.id);
        
      if (!error) {
        onSave();
        onClose();
      }
    } else {
      const { error } = await supabase
        .from('routines')
        .insert([{
          user_id: user.id,
          name,
          exercises: selectedExercises.map(ex => ({ 
            id: ex.id, 
            name: ex.name, 
            muscle_group: ex.muscle_group,
            sets: ex.targetSets || 3,
            restDuration: ex.restDuration || 90
          }))
        }]);

      if (!error) {
        onSave();
        onClose();
      }
    }
    setSaving(false);
  };

  return (
    <ModalPortal>
      <div className="fixed inset-0 bg-black z-[500] flex flex-col animate-in slide-in-from-bottom duration-300">
        <header className="p-6 flex items-center justify-between border-b border-[#1C1C1E]">
        <button onClick={onClose} className="text-[#8E8E93] font-bold hover:text-white transition-colors">Cancel</button>
        <h2 className="text-xl font-black text-white">New Routine</h2>
        <button 
          onClick={handleSave} 
          disabled={saving || !name.trim() || selectedExercises.length === 0}
          className="text-white font-bold disabled:opacity-50 hover:text-[#8E8E93] transition-colors"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        <input 
          type="text"
          placeholder="Routine Name (e.g. Upper Body)"
          className="w-full bg-transparent text-white text-3xl font-black outline-none mb-10 placeholder:text-[#2C2C2E]"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />

        <div className="space-y-4">
          {selectedExercises.map((ex) => (
            <div key={ex.tempId} className="flex flex-col p-5 bg-[#1C1C1E] rounded-3xl border border-[#2C2C2E] gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-black text-white text-lg leading-tight">{ex.name}</h4>
                  <p className="text-xs text-[#8E8E93] font-bold uppercase mt-1">{ex.muscle_group}</p>
                </div>
                <button onClick={() => removeExercise(ex.tempId)} className="text-[#8E8E93] hover:text-red-500 transition-colors p-2 -mr-2 bg-white/5 rounded-full">
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="flex items-center gap-6 pt-4 border-t border-white/5 flex-wrap">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-[#8E8E93]">Sets:</span>
                  <div className="flex items-center gap-2 bg-black border border-white/10 rounded-xl overflow-hidden p-1">
                    <button 
                      onClick={() => updateExerciseSets(ex.tempId, Math.max(1, (ex.targetSets || 3) - 1))}
                      className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-white/10 text-white rounded-lg font-black transition-colors"
                    >-</button>
                    <span className="w-8 text-center font-black text-white">{ex.targetSets || 3}</span>
                    <button 
                      onClick={() => updateExerciseSets(ex.tempId, (ex.targetSets || 3) + 1)}
                      className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-white/10 text-white rounded-lg font-black transition-colors"
                    >+</button>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-[#8E8E93]">Rest:</span>
                  <div className="flex items-center gap-2 bg-black border border-white/10 rounded-xl overflow-hidden p-1">
                    <button 
                      onClick={() => updateExerciseRest(ex.tempId, (ex.restDuration || 90) - 30)}
                      className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-white/10 text-white rounded-lg font-black transition-colors"
                    >-</button>
                    <span className="w-12 text-center font-black text-white">{formatRest(ex.restDuration || 90)}</span>
                    <button 
                      onClick={() => updateExerciseRest(ex.tempId, (ex.restDuration || 90) + 30)}
                      className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-white/10 text-white rounded-lg font-black transition-colors"
                    >+</button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <button 
            onClick={() => setShowLibrary(true)}
            className="w-full py-6 rounded-3xl bg-white/5 flex items-center justify-center gap-2 text-white font-black hover:bg-white/10 active:scale-[0.98] transition-all border border-white/10 shadow-sm"
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
    </ModalPortal>
  );
}
