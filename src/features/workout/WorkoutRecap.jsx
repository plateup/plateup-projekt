/**
 * Plik: WorkoutRecap.jsx
 * Autorzy: Langier, Mietła, Jadwiszczok, Bogdański
 * Opis: Moduł odpowiedzialny za logikę powiązaną z workout/WorkoutRecap.jsx.
 * Technologia: React / JSX / Tailwind CSS
 */

import React, { useState, useEffect } from 'react';
import { Clock, Activity, Award, Check, Share2, Globe } from 'lucide-react';
import MuscleHeatmap from '../feed/MuscleHeatmap';
import { supabase } from '../../services/supabaseClient';
import confetti from 'canvas-confetti';
import { ModalPortal } from '../../components/ui';

export default function WorkoutRecap({ workout, onClose, isHistory = false }) {
  // Stan przechowujący zmienną: publishing
  const [publishing, setPublishing] = useState(false);
  // Stan przechowujący zmienną: published
  const [published, setPublished] = useState(false);
  // Stan przechowujący zmienną: routineSaved
  const [routineSaved, setRoutineSaved] = useState(false);
  // Stan przechowujący zmienną: localWorkoutId
  const [localWorkoutId, setLocalWorkoutId] = useState(null);

  const summary = workout || {
    name: 'Workout',
    duration: '0:00',
    volume: '0 kg',
    prs: 0,
    exercises: [],
    muscleStats: {},
    rawStats: { time: '0:00', volume: '0 kg', sets: 0, prs: 0 }
  };

  // Efekt uboczny (useEffect) uruchamiany po wyrenderowaniu komponentu lub zmianie zależności

  useEffect(() => {
    if (isHistory) return;

    // --- AUTO-SAVE LOGIC ---
    const posts = JSON.parse(localStorage.getItem('plateup_posts') || '[]');
    let username = localStorage.getItem('plateup_username') || 'Athlete';
    let avatarUrl = localStorage.getItem('plateup_avatar') || null;

    const newId = Date.now();
    setLocalWorkoutId(newId);

    const newPost = {
      id: newId,
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
        isPR: ex.isPR || false,
        setsList: ex.setsList || []
      })),
      muscleStats: summary.muscleStats || {},
      created_at: new Date().toISOString()
    };
    
    // Only auto-save once
    const alreadySaved = posts.some(p => p.title === newPost.title && Math.abs(new Date(p.created_at).getTime() - new Date(newPost.created_at).getTime()) < 5000);
    if (!alreadySaved) {
      posts.unshift(newPost);
      localStorage.setItem('plateup_posts', JSON.stringify(posts));
    }

    // Fire confetti with a slight delay and high z-index
    const timer = setTimeout(() => {
      const duration = 3000;
      const end = Date.now() + duration;

      // Funkcja pomocnicza: frame

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#ffffff', '#8E8E93', '#2C2C2E'],
          zIndex: 9999
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#ffffff', '#8E8E93', '#2C2C2E'],
          zIndex: 9999
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
      
      // Haptic feedback
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([100, 50, 100, 50, 200]);
      }
    }, 1000); // 1 second delay

    // Zwraca interfejs użytkownika (JSX) dla tego komponentu

    return () => clearTimeout(timer);
  }, [isHistory]);

  // Asynchroniczna funkcja: handlePublish - odpowiada za operacje w tle (np. fetchowanie bazy)

  const handlePublish = async () => {
    setPublishing(true);
    
    // Fetch current user from Supabase
    // Odpytanie bazy danych Supabase w poszukiwaniu odpowiednich rekordów
    const { data: { user } } = await supabase.auth.getUser();
    let username = localStorage.getItem('plateup_username') || 'Athlete';
    let avatarUrl = localStorage.getItem('plateup_avatar') || null;
    
    if (user) {
      // Odpytanie bazy danych Supabase w poszukiwaniu odpowiednich rekordów
      const { data } = await supabase.from('profiles').select('username, display_name, avatar_url').eq('id', user.id).maybeSingle();
      if (data) {
        if (data.username || data.display_name) username = data.username || data.display_name;
        if (data.avatar_url) avatarUrl = data.avatar_url;
      }
    }

    // Get the locally saved post
    const posts = JSON.parse(localStorage.getItem('plateup_posts') || '[]');
    let postToPublish = posts.find(p => p.id === localWorkoutId);

    // If for some reason it wasn't found, reconstruct it
    if (!postToPublish) {
      postToPublish = {
        id: localWorkoutId || Date.now(),
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
          isPR: ex.isPR || false,
          setsList: ex.setsList || []
        })),
        muscleStats: summary.muscleStats || {},
        created_at: new Date().toISOString()
      };
      posts.unshift(postToPublish);
      localStorage.setItem('plateup_posts', JSON.stringify(posts));
    } else {
      // Update local post with fresh Supabase profile data if it changed
      postToPublish.user = { name: username, avatar: avatarUrl };
      const index = posts.findIndex(p => p.id === localWorkoutId);
      if (index !== -1) {
        posts[index] = postToPublish;
        localStorage.setItem('plateup_posts', JSON.stringify(posts));
      }
    }

    // Attempt to save to Supabase
    if (user) {
      try {
        await supabase.from('posts').insert([{
          user_id: user.id,
          workout_data: postToPublish
        }]);
      } catch (e) {
        // Ignore if table doesn't exist yet
      }
    }

    setPublishing(false);
    setPublished(true);
  };

  // Asynchroniczna funkcja: handleSaveRoutine - odpowiada za operacje w tle (np. fetchowanie bazy)

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
    // Odpytanie bazy danych Supabase w poszukiwaniu odpowiednich rekordów
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('routines').insert([{
        user_id: user.id,
        name: newRoutine.name,
        exercises: newRoutine.exercises
      }]);
    }
    setRoutineSaved(true);
    setTimeout(() => setRoutineSaved(false), 3000);
  };

  // Zwraca interfejs użytkownika (JSX) dla tego komponentu

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[500] bg-black flex flex-col items-center p-6 animate-in slide-in-from-bottom duration-500 overflow-y-auto">
        <div className="w-full max-w-5xl flex flex-col items-center pb-24">
        
        {/* Celebration Header or History Header */}
        <div className="mt-12 mb-10 text-center">
          {!isHistory ? (
            <>
              <div className="w-24 h-24 bg-white rounded-[32px] flex items-center justify-center mb-6 mx-auto shadow-2xl shadow-white/10">
                <Check size={48} strokeWidth={4} className="text-black" />
              </div>
              <h1 className="text-4xl md:text-5xl font-black mb-2 tracking-tighter text-white">Workout Complete!</h1>
              <p className="text-[#8E8E93] font-bold">You just crushed your goals.</p>
            </>
          ) : (
            <>
              <h1 className="text-4xl md:text-5xl font-black mb-2 tracking-tighter text-white">Workout Summary</h1>
              <p className="text-[#8E8E93] font-bold">Review your past performance.</p>
            </>
          )}
        </div>

        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12 items-start">
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

            <div className="space-y-6 border-t border-white/5 pt-8 flex-1">
              {summary.exercises.length > 0 ? summary.exercises.map((ex, i) => (
                <div key={i} className="flex flex-col mb-4">
                  <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                    <h3 className="font-black text-white text-xl tracking-tight flex items-center gap-2">
                      {ex.name}
                      {ex.isPR && (
                        <span className="bg-amber-400/10 text-amber-400 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest border border-amber-400/20 flex items-center gap-1">
                          <Award size={10} /> PR
                        </span>
                      )}
                    </h3>
                  </div>
                  
                  {ex.setsList && ex.setsList.length > 0 ? (
                    <div className="w-full">
                      <div className="grid grid-cols-[40px_1fr_1fr] text-[10px] font-black text-[#8E8E93] uppercase tracking-widest mb-2 px-2">
                        <span>Set</span>
                        <span className="text-center">KG</span>
                        <span className="text-center">Reps</span>
                      </div>
                      <div className="space-y-1">
                        {ex.setsList.map((set, setIdx) => (
                          <div key={setIdx} className="grid grid-cols-[40px_1fr_1fr] items-center px-2 py-2.5 bg-black/20 rounded-xl border border-white/5">
                            {set.type !== 'normal' ? (
                              <span className="w-6 h-6 flex items-center justify-center rounded-md bg-white/10 text-[10px] font-black text-white">
                                {set.type.charAt(0).toUpperCase()}
                              </span>
                            ) : (
                              <span className="text-xs font-black text-white/50 w-6 text-center">{setIdx + 1}</span>
                            )}
                            <span className="text-sm font-black text-white text-center">{set.kg}</span>
                            <span className="text-sm font-black text-white text-center">{set.reps}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between px-4 py-3 bg-black/20 rounded-xl border border-white/5 text-sm font-bold text-[#8E8E93]">
                      <span>{ex.sets} {ex.sets === 1 ? 'Set' : 'Sets'} Completed</span>
                      <span className="text-white">Best: {ex.best}</span>
                    </div>
                  )}
                </div>
              )) : (
                <div className="text-center text-[#8E8E93] text-sm py-4 italic">No exercises logged during this session.</div>
              )}
            </div>
          </div>

          {/* Heatmap Section */}
          <div className="w-full flex flex-col gap-4 lg:sticky lg:top-8">
            {Object.keys(summary.muscleStats || {}).length > 0 ? (
               <MuscleHeatmap stats={summary.muscleStats} />
            ) : (
               <div className="w-full h-full bg-[#1C1C1E] rounded-[48px] border border-white/5 flex items-center justify-center text-[#8E8E93]">No Muscle Data</div>
            )}
            
            {/* Actions moved under Heatmap on Desktop for balance, or at bottom */}
            <div className="w-full space-y-4 mt-auto pt-4">
              {!isHistory && (
                <>
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
                        Published to Social
                      </>
                    ) : publishing ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black"></div>
                    ) : (
                      <>
                        <Globe size={24} />
                        Publish to Social
                      </>
                    )}
                  </button>
                  
                  <div className="flex gap-4">
                    <button 
                      onClick={handleSaveRoutine}
                      className="flex-1 bg-[#1C1C1E] text-white py-5 rounded-[24px] font-black flex items-center justify-center gap-3 hover:bg-white/5 active:scale-95 transition-all border border-white/5"
                    >
                      {routineSaved ? <span className="text-green-400">Saved!</span> : 'Save as Routine'}
                    </button>
                    <button className="flex-1 bg-[#1C1C1E] text-white py-5 rounded-[24px] font-black flex items-center justify-center gap-3 hover:bg-white/5 active:scale-95 transition-all border border-white/5">
                      <Share2 size={20} />
                      Share
                    </button>
                  </div>
                </>
              )}
              
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
    </ModalPortal>
  );
}
