/**
 * Plik: WorkoutStart.jsx
 * Autorzy: Langier, Mietła, Jadwiszczok, Bogdański
 * Opis: Moduł odpowiedzialny za logikę powiązaną z workout/WorkoutStart.jsx.
 * Technologia: React / JSX / Tailwind CSS
 */

import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { Plus, Play, MoreVertical, Dumbbell, Copy, Edit3, Trash2, X, Loader2 } from 'lucide-react';
import RoutineCreator from './RoutineCreator';
import { ConfirmModal, ModalPortal } from '../../components/ui';

export default function WorkoutStart({ onStartBlank, onStartRoutine }) {
  // Stan przechowujący zmienną: routines
  const [routines, setRoutines] = useState([]);
  // Stan przechowujący zmienną: loading
  const [loading, setLoading] = useState(true);
  // Stan przechowujący zmienną: showRoutineCreator
  const [showRoutineCreator, setShowRoutineCreator] = useState(false);
  // Stan przechowujący zmienną: editingRoutine
  const [editingRoutine, setEditingRoutine] = useState(null);
  // Stan przechowujący zmienną: selectedRoutine
  const [selectedRoutine, setSelectedRoutine] = useState(null);
  // Stan przechowujący zmienną: activeMenuId
  const [activeMenuId, setActiveMenuId] = useState(null);
  
  // Confirm Modal state
  // Stan przechowujący zmienną: confirmModal
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null });

  // Asynchroniczna funkcja: fetchRoutines - odpowiada za operacje w tle (np. fetchowanie bazy)

  const fetchRoutines = async () => {
    setLoading(true);
    // Odpytanie bazy danych Supabase w poszukiwaniu odpowiednich rekordów
    const { data, error } = await supabase
      .from('routines')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error) setRoutines(data);
    setLoading(false);
  };

  // Funkcja pomocnicza: confirmDeleteRoutine

  const confirmDeleteRoutine = (id, e) => {
    e.stopPropagation();
    setActiveMenuId(null);
    setConfirmModal({ isOpen: true, id });
  };

  // Asynchroniczna funkcja: executeDeleteRoutine - odpowiada za operacje w tle (np. fetchowanie bazy)

  const executeDeleteRoutine = async () => {
    if (confirmModal.id) {
      await supabase.from('routines').delete().eq('id', confirmModal.id);
      fetchRoutines();
    }
    setConfirmModal({ isOpen: false, id: null });
  };

  // Efekt uboczny (useEffect) uruchamiany po wyrenderowaniu komponentu lub zmianie zależności

  useEffect(() => {
    fetchRoutines();
  }, []);

  // Zwraca interfejs użytkownika (JSX) dla tego komponentu

  return (
    <div className="pb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="mb-10">
        <h1 className="text-4xl font-black tracking-tight mb-2">Workout</h1>
        <p className="text-[#8E8E93] font-medium">Choose a routine or start fresh</p>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {/* Quick Start Card */}
        <button 
          onClick={onStartBlank}
          className="w-full bg-white text-black p-6 rounded-[32px] flex items-center justify-between group active:scale-95 transition-all shadow-lg shadow-white/10"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-black flex items-center justify-center text-white shadow-lg">
              <Plus size={32} strokeWidth={3} />
            </div>
            <div className="text-left">
              <h3 className="text-xl font-black">Empty Workout</h3>
              <p className="text-black/60 font-bold text-sm">Start from scratch</p>
            </div>
          </div>
        </button>

        <div className="mt-8 mb-4 flex items-center justify-between px-2">
          <h2 className="text-2xl font-black text-white">My Routines</h2>
          <button 
            onClick={() => setShowRoutineCreator(true)}
            className="text-white font-bold text-sm flex items-center gap-1 hover:text-[#8E8E93] transition-colors"
          >
            <Plus size={16} /> New Routine
          </button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-[#1C1C1E] p-6 rounded-[32px] border border-white/5 animate-pulse flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <div className="h-6 bg-white/10 rounded w-1/3"></div>
                  <div className="h-6 w-6 bg-white/10 rounded-full"></div>
                </div>
                <div className="h-4 bg-white/10 rounded w-2/3 mb-2"></div>
                <div className="h-14 bg-white/5 rounded-2xl w-full"></div>
              </div>
            ))}
          </div>
        ) : routines.length > 0 ? (
          routines.map((routine) => (
            <div 
              key={routine.id}
              onClick={() => setSelectedRoutine(routine)}
              className="bg-[#1C1C1E] p-6 rounded-[32px] border border-white/5 shadow-sm hover:border-white/20 transition-all cursor-pointer group relative"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-black text-white group-hover:text-white transition-colors">{routine.name}</h3>
                <div className="relative" onClick={e => e.stopPropagation()}>
                  <button 
                    onClick={() => setActiveMenuId(activeMenuId === routine.id ? null : routine.id)}
                    className="p-2 text-[#8E8E93] hover:text-white transition-colors"
                  >
                    <MoreVertical size={20} />
                  </button>
                  {activeMenuId === routine.id && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-[#0A0A0A] border border-[#2C2C2E] rounded-2xl shadow-2xl z-[105] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(null);
                          setEditingRoutine(routine);
                          setShowRoutineCreator(true);
                        }}
                        className="w-full flex items-center gap-3 p-4 hover:bg-white/5 text-left transition-colors text-sm font-bold text-white"
                      >
                        <Edit3 size={16} /> Edit Routine
                      </button>
                      <button 
                        onClick={(e) => confirmDeleteRoutine(routine.id, e)}
                        className="w-full flex items-center gap-3 p-4 hover:bg-white/5 text-left transition-colors text-sm font-bold text-red-500"
                      >
                        <Trash2 size={16} /> Delete Routine
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <p className="text-[#8E8E93] text-sm font-bold mb-6 line-clamp-2">
                {routine.exercises.map(ex => ex.name).join(', ')}
              </p>
              <button 
                onClick={(e) => { e.stopPropagation(); onStartRoutine(routine); }}
                className="w-full bg-white/5 py-4 rounded-2xl flex items-center justify-center gap-2 font-black text-white hover:bg-white hover:text-black transition-all"
              >
                <Play size={18} fill="currentColor" />
                Start Routine
              </button>
            </div>
          ))
        ) : (
          <div className="py-12 bg-[#1C1C1E] rounded-[32px] border-2 border-dashed border-white/5 flex flex-col items-center text-center px-6">
             <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                <Dumbbell className="text-[#8E8E93]" size={28} />
             </div>
             <p className="text-[#8E8E93] font-bold mb-4">No routines found.</p>
             <button 
                onClick={() => setShowRoutineCreator(true)}
                className="bg-white text-black px-8 py-4 rounded-2xl font-black shadow-lg shadow-white/10 active:scale-95 transition-transform"
             >
               Create First Routine
             </button>
          </div>
        )}
      </div>

      {showRoutineCreator && (
        <RoutineCreator 
          onClose={() => {
            setShowRoutineCreator(false);
            setEditingRoutine(null);
          }} 
          onSave={fetchRoutines}
          initialRoutine={editingRoutine}
        />
      )}

      {/* Routine Detail Modal */}
      {selectedRoutine && (
        <ModalPortal>
          <div className="fixed inset-0 z-[500] bg-black/90 backdrop-blur-md flex flex-col justify-end animate-in fade-in duration-200">
            <div className="w-full max-w-lg mx-auto bg-[#1C1C1E] h-[85vh] rounded-t-[40px] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
            <header className="p-6 pb-0 flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-white truncate pr-4">{selectedRoutine.name}</h2>
              <button onClick={() => setSelectedRoutine(null)} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all shrink-0 text-white">
                <X size={20} strokeWidth={3} />
              </button>
            </header>
            
            <div className="flex-1 overflow-y-auto px-6 pb-24 space-y-4">
              {selectedRoutine.exercises.map((ex, i) => (
                <div key={i} className="bg-black rounded-2xl p-4 border border-[#2C2C2E] flex items-center gap-4">
                   <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center font-black text-white">
                     {ex.name[0]}
                   </div>
                   <div>
                     <h4 className="text-white font-bold">{ex.name}</h4>
                     <p className="text-[#8E8E93] text-xs font-bold uppercase tracking-wider">{ex.muscle_group || 'Full Body'}</p>
                   </div>
                </div>
              ))}
            </div>

            <div className="p-6 bg-[#0A0A0A] border-t border-white/5 flex gap-3">
              <button 
                onClick={() => {
                  onStartRoutine(selectedRoutine);
                  setSelectedRoutine(null);
                }}
                className="flex-1 bg-white text-black py-4 rounded-2xl font-black shadow-lg shadow-white/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <Play size={20} fill="currentColor" /> Start Workout
              </button>
              <button 
                onClick={(e) => {
                  const btn = e.currentTarget;
                  const originalHtml = btn.innerHTML;
                  btn.innerHTML = '<span class="text-xs">Copied!</span>';
                  setTimeout(() => { btn.innerHTML = originalHtml; setSelectedRoutine(null); }, 1000);
                }}
                className="w-16 bg-neutral-800 text-white py-4 rounded-2xl font-black shadow-lg shadow-black/50 active:scale-[0.98] transition-all flex items-center justify-center border border-neutral-700"
              >
                <Copy size={20} />
              </button>
            </div>
          </div>
        </div>
        </ModalPortal>
      )}

      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        title="Delete Routine?"
        message="This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDanger={true}
        onConfirm={executeDeleteRoutine}
        onCancel={() => setConfirmModal({ isOpen: false, id: null })}
      />
    </div>
  );
}
