import React, { useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import { Dumbbell, Clock, X, ArrowUpRight } from 'lucide-react';
import { ModalPortal } from '../../components/ui';

export default function WorkoutRecap({ workout, onClose, isHistory = false }) {
  const [published, setPublished] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const summary = workout || {
    name: 'Workout',
    duration: '0:00',
    volume: '0 kg',
    prs: 0,
    exercises: [],
    muscleStats: {},
    rawStats: { time: '0:00', volume: '0 kg', sets: 0, prs: 0 }
  };

  const handlePublish = async () => {
    if (publishing || published) return;
    setPublishing(true);

    const postToPublish = { ...summary };
    const { data: { user } } = await supabase.auth.getUser();

    let username = localStorage.getItem('plateup_username') || 'Athlete';
    let avatarUrl = localStorage.getItem('plateup_avatar');

    const posts = JSON.parse(localStorage.getItem('plateup_posts') || '[]');
    const localWorkoutId = summary.id || Date.now();
    postToPublish.id = localWorkoutId;

    if (!posts.find(p => p.id === localWorkoutId)) {
      postToPublish.user = { name: username, avatar: avatarUrl };
      posts.unshift(postToPublish);
      localStorage.setItem('plateup_posts', JSON.stringify(posts));
    }

    if (user) {
      try {
        await supabase.from('posts').insert([{
          user_id: user.id,
          workout_data: postToPublish
        }]);
      } catch (e) {}
    }

    setPublishing(false);
    setPublished(true);
  };

  const handleSaveRoutine = async () => {
    const routineExercises = summary.exercises.map(ex => ({
      ...ex,
      setsList: ex.setsList ? ex.setsList.map(() => ({ kg: '', reps: '' })) : []
    }));

    const newRoutine = {
      id: `routine-${Date.now()}`,
      name: `${summary.name || 'Workout'} Routine`,
      exercises: routineExercises
    };

    const storedRoutines = JSON.parse(localStorage.getItem('plateup_routines') || '[]');
    localStorage.setItem('plateup_routines', JSON.stringify([...storedRoutines, newRoutine]));

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('routines').insert([{
        user_id: user.id,
        name: newRoutine.name,
        exercises: newRoutine.exercises
      }]);
    }
    alert('Routine saved!');
  };

  return (
    <ModalPortal>
      <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[1000] flex flex-col items-center pt-20 px-4 overflow-y-auto pb-32 animate-in fade-in zoom-in-95 duration-500">
        
        <button 
          onClick={onClose}
          className="absolute top-8 right-6 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all z-10"
        >
          <X size={24} />
        </button>

        <div className="w-full max-w-md text-center relative z-10">
          {!isHistory && (
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-500/20 text-green-400 mb-8 animate-bounce shadow-[0_0_40px_rgba(34,197,94,0.3)]">
              <CheckMark />
            </div>
          )}

          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tighter">
            {isHistory ? "Workout Summary" : "Workout Completed"}
          </h1>
          <p className="text-[#8E8E93] font-bold text-lg mb-10">
            {isHistory ? "Review your performance." : "You crushed it today."}
          </p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <StatCard icon={<Clock size={20} />} label="Duration" value={summary.duration || summary.rawStats?.time} />
            <StatCard icon={<Dumbbell size={20} />} label="Volume" value={summary.volume || summary.rawStats?.volume} />
          </div>

          <div className="bg-[#1C1C1E] border border-white/5 rounded-[32px] p-6 mb-8 text-left">
            <h3 className="text-sm font-black text-[#8E8E93] uppercase tracking-wider mb-4">Summary</h3>
            <div className="space-y-4">
              {summary.exercises.slice(0, 4).map((ex, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="font-bold text-white">{ex.name}</span>
                  <span className="text-[#8E8E93] font-black text-sm">{ex.setsList?.length || ex.sets} sets</span>
                </div>
              ))}
              {summary.exercises.length > 4 && (
                <div className="text-center pt-2 text-[#8E8E93] font-bold text-sm">
                  + {summary.exercises.length - 4} more exercises
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4 w-full">
            {!isHistory && (
              <>
                <button 
                  onClick={handlePublish}
                  disabled={published || publishing}
                  className={`w-full py-5 rounded-[24px] font-black flex items-center justify-center gap-3 transition-all ${
                    published 
                      ? 'bg-white/10 text-white cursor-default' 
                      : 'bg-white text-black hover:bg-neutral-200 active:scale-95 shadow-xl shadow-white/10'
                  }`}
                >
                  {published ? (
                    <>Saved <CheckMark size={20} className="w-5 h-5" /></>
                  ) : publishing ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black" />
                  ) : (
                    <>Save to History</>
                  )}
                </button>
                
                <button 
                  onClick={handleSaveRoutine}
                  className="w-full bg-[#1C1C1E] text-white py-5 rounded-[24px] font-black flex items-center justify-center gap-3 hover:bg-white/5 transition-all border border-white/10 active:scale-95"
                >
                  <ArrowUpRight size={20} />
                  Save as Routine
                </button>
              </>
            )}

            <button 
              onClick={onClose}
              className="w-full bg-transparent text-[#8E8E93] py-5 rounded-[24px] font-black hover:text-white transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="bg-[#1C1C1E] border border-white/5 rounded-[24px] p-5 flex flex-col items-center justify-center gap-2">
      <div className="text-[#8E8E93]">{icon}</div>
      <div className="text-2xl font-black text-white">{value}</div>
      <div className="text-[10px] font-black text-[#8E8E93] uppercase tracking-widest">{label}</div>
    </div>
  );
}

function CheckMark({ className = "" }) {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className || "w-12 h-12"}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}