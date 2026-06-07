import React, { useState } from 'react';
import { Award, Clock, Activity, Share2, Check, Globe } from 'lucide-react';
import MuscleHeatmap from '../feed/MuscleHeatmap';
import { supabase } from '../../services/supabaseClient';

export default function WorkoutRecap({ workout, onClose }) {
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);

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
    setPublishing(true);
    
    // Save to local storage for now
    const posts = JSON.parse(localStorage.getItem('plateup_posts') || '[]');
    
    // Fetch current user from Supabase
    const { data: { user } } = await supabase.auth.getUser();
    let username = localStorage.getItem('plateup_username') || 'Athlete';
    let avatarUrl = localStorage.getItem('plateup_avatar') || null;
    
    if (user) {
      const { data } = await supabase.from('profiles').select('username, display_name, avatar_url').eq('id', user.id).single();
      if (data) {
        if (data.username || data.display_name) username = data.username || data.display_name;
        if (data.avatar_url) avatarUrl = data.avatar_url;
      }
    }

    const newPost = {
      id: Date.now(),
      user: { name: username, avatar: avatarUrl },
      title: summary.name,
      timeAgo: 'Just now',
      likes: 0,
      comments: 0,
      stats: summary.rawStats || { time: summary.duration, volume: summary.volume, sets: summary.exercises.length, prs: summary.prs },
      exercises: summary.exercises.map(ex => ({
        name: ex.name,
        sets: ex.sets,
        best: ex.best,
        isPR: false
      })),
      created_at: new Date().toISOString()
    };
    
    posts.unshift(newPost);
    localStorage.setItem('plateup_posts', JSON.stringify(posts));

    // Also attempt to save to Supabase if the table exists (ignore error if not)
    if (user) {
      try {
        await supabase.from('posts').insert([{
          user_id: user.id,
          workout_data: newPost
        }]);
      } catch (e) {
        // Ignore if table doesn't exist yet
      }
    }

    setPublishing(false);
    setPublished(true);
  };

  const handleSaveRoutine = async () => {
    // Collect exercises into a routine structure
    const routineExercises = summary.exercises.map(ex => ({
      id: `ex-${Date.now()}-${Math.random()}`,
      name: ex.name,
      muscle_group: 'Full Body' // Simplification
    }));

    const newRoutine = {
      name: summary.name + ' Routine',
      exercises: routineExercises
    };

    // Try DB first
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('routines').insert([{
        user_id: user.id,
        name: newRoutine.name,
        exercises: newRoutine.exercises
      }]);
    }
    alert('Routine saved successfully!');
  };

  return (
    <div className="fixed inset-0 z-[300] bg-black flex flex-col items-center p-6 animate-in slide-in-from-bottom duration-500 overflow-y-auto">
      <div className="w-full max-w-5xl flex flex-col items-center pb-24">
        
        {/* Celebration Header */}
        <div className="mt-12 mb-10 text-center">
          <div className="w-24 h-24 bg-white rounded-[32px] flex items-center justify-center mb-6 mx-auto shadow-2xl shadow-white/10">
            <Check size={48} strokeWidth={4} className="text-black" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-2 tracking-tighter text-white">Workout Complete!</h1>
          <p className="text-[#8E8E93] font-bold">You just crushed your goals.</p>
        </div>

        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Recap Card */}
          <div className="w-full bg-[#1C1C1E] rounded-[48px] p-8 md:p-10 border border-white/5 shadow-2xl flex flex-col">
            <h2 className="text-2xl font-black mb-8 text-white">{summary.name}</h2>
            
            <div className="grid grid-cols-3 gap-4 mb-10">
              <div className="flex flex-col items-center">
                <Clock className="text-white mb-3" size={28} />
                <span className="text-[10px] text-[#8E8E93] font-black uppercase tracking-widest mb-1">Time</span>
                <span className="font-black text-xl text-white">{summary.duration}</span>
              </div>
              <div className="flex flex-col items-center">
                <Activity className="text-white mb-3" size={28} />
                <span className="text-[10px] text-[#8E8E93] font-black uppercase tracking-widest mb-1">Volume</span>
                <span className="font-black text-xl text-white">{summary.volume}</span>
              </div>
              <div className="flex flex-col items-center">
                <Award className="text-white mb-3" size={28} />
                <span className="text-[10px] text-[#8E8E93] font-black uppercase tracking-widest mb-1">PRs</span>
                <span className="font-black text-xl text-white">{summary.prs}</span>
              </div>
            </div>

            <div className="space-y-5 border-t border-white/5 pt-8 flex-1">
              {summary.exercises.length > 0 ? summary.exercises.map((ex, i) => (
                <div key={i} className="flex justify-between items-center group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center font-bold text-white text-[15px]">
                      {ex.name.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="font-bold text-white text-lg">{ex.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-black text-[#8E8E93] mb-1">{ex.sets} {ex.sets === 1 ? 'Set' : 'Sets'}</div>
                    <div className="text-[11px] font-bold text-white/50">{ex.best}</div>
                  </div>
                </div>
              )) : (
                <div className="text-center text-[#8E8E93] text-sm py-4">No exercises completed.</div>
              )}
            </div>
          </div>

          {/* Heatmap Section */}
          <div className="w-full flex flex-col gap-4">
            {Object.keys(summary.muscleStats || {}).length > 0 ? (
               <MuscleHeatmap stats={summary.muscleStats} />
            ) : (
               <div className="w-full h-full bg-[#1C1C1E] rounded-[48px] border border-white/5 flex items-center justify-center text-[#8E8E93]">No Muscle Data</div>
            )}
            
            {/* Actions moved under Heatmap on Desktop for balance, or at bottom */}
            <div className="w-full space-y-4 mt-auto pt-4">
              <button 
                onClick={handlePublish}
                disabled={published || publishing}
                className={`w-full py-5 rounded-[24px] font-black flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all text-lg ${
                  published 
                    ? 'bg-white/10 text-white/60 cursor-not-allowed border border-white/5' 
                    : 'bg-white text-black shadow-white/10 hover:bg-neutral-200'
                }`}
              >
                {published ? (
                  <>
                    <Check size={24} />
                    Published to Feed
                  </>
                ) : publishing ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black"></div>
                ) : (
                  <>
                    <Globe size={24} />
                    Publish to Feed
                  </>
                )}
              </button>
              
              <div className="flex gap-4">
                <button 
                  onClick={handleSaveRoutine}
                  className="flex-1 bg-[#1C1C1E] text-white py-5 rounded-[24px] font-black flex items-center justify-center gap-3 hover:bg-white/5 active:scale-95 transition-all border border-white/5"
                >
                  Save as Routine
                </button>
                <button className="flex-1 bg-[#1C1C1E] text-white py-5 rounded-[24px] font-black flex items-center justify-center gap-3 hover:bg-white/5 active:scale-95 transition-all border border-white/5">
                  <Share2 size={20} />
                  Share
                </button>
              </div>
              
              <button 
                onClick={onClose}
                className="w-full bg-transparent text-[#8E8E93] py-5 rounded-[24px] font-black hover:text-white active:scale-95 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
