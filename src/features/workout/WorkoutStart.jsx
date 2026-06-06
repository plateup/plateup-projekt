import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { Plus, Play, MoreVertical, Dumbbell } from 'lucide-react';
import RoutineCreator from './RoutineCreator';

export default function WorkoutStart({ onStartBlank, onStartRoutine }) {
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRoutineCreator, setShowRoutineCreator] = useState(false);

  const fetchRoutines = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('routines')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error) setRoutines(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchRoutines();
  }, []);

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
          className="w-full bg-white dark:bg-[#1C1C1E] p-6 rounded-[32px] flex items-center justify-between group active:scale-95 transition-all shadow-sm border border-[#F2F2F7] dark:border-[#2C2C2E]"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Plus size={32} strokeWidth={3} />
            </div>
            <div className="text-left">
              <h3 className="text-xl font-black">Empty Workout</h3>
              <p className="text-[#8E8E93] font-bold text-sm">Start from scratch</p>
            </div>
          </div>
        </button>

        <div className="mt-8 mb-4 flex items-center justify-between px-2">
          <h2 className="text-2xl font-black">My Routines</h2>
          <button 
            onClick={() => setShowRoutineCreator(true)}
            className="text-blue-500 font-bold text-sm flex items-center gap-1"
          >
            <Plus size={16} /> New Routine
          </button>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : routines.length > 0 ? (
          routines.map((routine) => (
            <div 
              key={routine.id}
              className="bg-white dark:bg-[#1C1C1E] p-6 rounded-[32px] border border-[#F2F2F7] dark:border-[#2C2C2E] shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-black">{routine.name}</h3>
                <button className="text-[#8E8E93]"><MoreVertical size={20} /></button>
              </div>
              <p className="text-[#8E8E93] text-sm font-bold mb-6">
                {routine.exercises.map(ex => ex.name).join(', ')}
              </p>
              <button 
                onClick={() => onStartRoutine(routine)}
                className="w-full bg-[#F2F2F7] dark:bg-[#2C2C2E] py-4 rounded-2xl flex items-center justify-center gap-2 font-black text-blue-500 hover:bg-blue-500 hover:text-white transition-all group"
              >
                <Play size={18} fill="currentColor" />
                Start Routine
              </button>
            </div>
          ))
        ) : (
          <div className="py-12 bg-white dark:bg-[#1C1C1E] rounded-[32px] border-2 border-dashed border-[#F2F2F7] dark:border-[#2C2C2E] flex flex-col items-center text-center px-6">
             <div className="w-16 h-16 bg-[#F2F2F7] dark:bg-[#2C2C2E] rounded-full flex items-center justify-center mb-4">
                <Dumbbell className="text-[#8E8E93]" size={28} />
             </div>
             <p className="text-[#8E8E93] font-bold mb-4">No routines found.</p>
             <button 
                onClick={() => setShowRoutineCreator(true)}
                className="bg-blue-500 text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-blue-500/20"
             >
               Create First Routine
             </button>
          </div>
        )}
      </div>

      {showRoutineCreator && (
        <RoutineCreator 
          onClose={() => setShowRoutineCreator(false)} 
          onSave={fetchRoutines}
        />
      )}
    </div>
  );
}
