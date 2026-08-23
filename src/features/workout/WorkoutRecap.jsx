/**
 * Plik: WorkoutRecap.jsx
 * Autor: landzi
 * Opis: Ekran podsumowujący/zapisujący trening po jego zakończeniu.
 * Technologia: React / JSX / Tailwind CSS
 */

import React, { useState, useEffect } from 'react';
import { Clock, Activity, Award, Check, Share2, Globe, MapPin, Camera, Lock, Trash2 } from 'lucide-react';
import MuscleHeatmap from '../feed/MuscleHeatmap';
import { supabase } from '../../services/supabaseClient';
import confetti from 'canvas-confetti';
import { ModalPortal } from '../../components/ui';
import { format } from 'date-fns';

export default function WorkoutRecap({ workout, onClose, onSave, onDiscard, isHistory = false }) {
  const summary = workout || {
    name: 'Workout',
    duration: '0:00',
    volume: '0 kg',
    prs: 0,
    exercises: [],
    muscleStats: {},
    rawStats: { time: '0:00', volume: '0 kg', sets: 0, prs: 0 }
  };

  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  
  // Form state
  const [title, setTitle] = useState(summary.name);
  const [gym, setGym] = useState('');
  const [visibility, setVisibility] = useState('public'); // 'public' | 'private'
  const [date] = useState(new Date());

  useEffect(() => {
    if (isHistory) return;
    // Fire confetti on load for celebration
    const timer = setTimeout(() => {
      const duration = 2000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#ffffff', '#8E8E93', '#2C2C2E'], zIndex: 9999 });
        confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#ffffff', '#8E8E93', '#2C2C2E'], zIndex: 9999 });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([100, 50, 100]);
    }, 500);

    return () => clearTimeout(timer);
  }, [isHistory]);

  const handleSave = async () => {
    setPublishing(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    let username = localStorage.getItem('plateup_username') || 'Athlete';
    let avatarUrl = localStorage.getItem('plateup_avatar') || null;
    
    if (user) {
      const { data } = await supabase.from('profiles').select('username, display_name, avatar_url').eq('id', user.id).maybeSingle();
      if (data) {
        if (data.username || data.display_name) username = data.username || data.display_name;
        if (data.avatar_url) avatarUrl = data.avatar_url;
      }
    }

    const posts = JSON.parse(localStorage.getItem('plateup_posts') || '[]');
    const newId = Date.now();

    const postToSave = {
      id: newId,
      user: { name: username, avatar: avatarUrl },
      title: title,
      gym: gym,
      visibility: visibility,
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
      created_at: date.toISOString()
    };

    // Save locally
    posts.unshift(postToSave);
    localStorage.setItem('plateup_posts', JSON.stringify(posts));

    // Save to Supabase
    if (user) {
      try {
        await supabase.from('posts').insert([{
          user_id: user.id,
          workout_data: postToSave
        }]);
      } catch (e) {
        console.error('Save to DB failed', e);
      }
    }

    setPublishing(false);
    setPublished(true);
    setTimeout(() => {
      if (onSave) onSave(title);
      else onClose();
    }, 1000);
  };

  const handleDiscard = () => {
    if(window.confirm("Are you sure you want to discard this workout? It won't be saved.")) {
      if (onDiscard) onDiscard();
      else onClose();
    }
  };

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[500] bg-black flex flex-col items-center p-0 md:p-6 animate-in slide-in-from-bottom duration-500 overflow-y-auto">
        <div className="w-full h-full max-w-2xl bg-[#0A0A0A] md:rounded-[48px] border-x border-t border-white/5 flex flex-col relative pb-24 md:pb-8 shadow-2xl">
          
          {/* Header */}
          <header className="sticky top-0 z-10 bg-black/80 backdrop-blur-md border-b border-white/5 p-6 flex justify-between items-center">
            <h1 className="text-xl font-black text-white">{isHistory ? 'Workout Details' : 'Save Workout'}</h1>
            {!isHistory && (
              <button 
                onClick={handleSave}
                disabled={publishing || published}
                className="bg-white text-black px-6 py-2 rounded-full font-black text-sm active:scale-95 transition-all shadow-lg hover:bg-neutral-200"
              >
                {publishing ? 'Saving...' : published ? 'Saved!' : 'Save'}
              </button>
            )}
            {isHistory && (
              <button onClick={onClose} className="text-[#8E8E93] hover:text-white font-bold">Close</button>
            )}
          </header>

          <div className="p-6 space-y-8 flex-1 overflow-y-auto">
            
            {/* Title & Stats block */}
            <div className="space-y-6">
              {!isHistory ? (
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-transparent text-3xl font-black text-white placeholder-white/30 border-none outline-none focus:ring-0 p-0"
                  placeholder="Workout Name"
                />
              ) : (
                <h2 className="text-3xl font-black text-white">{title}</h2>
              )}

              <div className="flex flex-wrap gap-4 text-sm font-bold text-white/90">
                <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                  <Clock size={16} className="text-[#8E8E93]" /> {summary.duration}
                </div>
                <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                  <Activity size={16} className="text-[#8E8E93]" /> {summary.volume}
                </div>
                <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                  <span className="text-[#8E8E93] uppercase tracking-widest text-[10px]">Sets</span> {summary.rawStats?.sets || summary.exercises.length}
                </div>
                {summary.prs > 0 && (
                  <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-500 px-3 py-1.5 rounded-lg border border-amber-500/20">
                    <Award size={16} /> {summary.prs} PRs
                  </div>
                )}
              </div>
            </div>

            {/* Inputs Section */}
            {!isHistory && (
              <div className="bg-[#1C1C1E] rounded-3xl p-2 border border-white/5 space-y-1">
                
                {/* Photo */}
                <button className="w-full flex items-center gap-4 p-4 hover:bg-white/5 rounded-2xl transition-colors text-left group">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white group-hover:bg-white/20 transition-colors">
                    <Camera size={18} />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-white">Add Photo</div>
                    <div className="text-xs text-[#8E8E93]">Attach an image to your post</div>
                  </div>
                </button>

                {/* Date */}
                <div className="w-full flex items-center gap-4 p-4 text-left">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#8E8E93]">
                    <Clock size={18} />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-white">Date</div>
                    <div className="text-xs text-[#8E8E93]">{format(date, 'MMM d, yyyy - h:mm a')}</div>
                  </div>
                </div>

                {/* Gym */}
                <div className="w-full flex items-center gap-4 p-4 text-left relative">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#8E8E93]">
                    <MapPin size={18} />
                  </div>
                  <div className="flex-1">
                    <input 
                      type="text" 
                      value={gym}
                      onChange={e => setGym(e.target.value)}
                      placeholder="Add gym location"
                      className="bg-transparent text-sm font-bold text-white placeholder-[#8E8E93] w-full outline-none"
                    />
                  </div>
                </div>

                {/* Visibility */}
                <button 
                  onClick={() => setVisibility(prev => prev === 'public' ? 'private' : 'public')}
                  className="w-full flex items-center justify-between p-4 hover:bg-white/5 rounded-2xl transition-colors text-left group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${visibility === 'private' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/10 text-white'}`}>
                      {visibility === 'private' ? <Lock size={18} /> : <Globe size={18} />}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">Visibility</div>
                      <div className="text-xs text-[#8E8E93]">
                        {visibility === 'public' ? 'Everyone (Feed)' : 'Only Me'}
                      </div>
                    </div>
                  </div>
                  <div className={`w-10 h-6 rounded-full border-2 border-transparent transition-colors relative ${visibility === 'public' ? 'bg-white' : 'bg-white/20'}`}>
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-black transition-all ${visibility === 'public' ? 'right-1' : 'left-1'}`} />
                  </div>
                </button>

              </div>
            )}

            {/* Muscle Heatmap */}
            <div className="w-full">
              <h3 className="text-sm font-black text-[#8E8E93] uppercase tracking-widest mb-4 pl-2">Muscle Engagement</h3>
              <div className="bg-[#1C1C1E] rounded-3xl p-6 border border-white/5">
                {Object.keys(summary.muscleStats || {}).length > 0 ? (
                   <MuscleHeatmap stats={summary.muscleStats} />
                ) : (
                   <div className="w-full h-48 flex items-center justify-center text-[#8E8E93]">No Muscle Data</div>
                )}
              </div>
            </div>

            {/* Discard Button (Only on Save Screen) */}
            {!isHistory && (
              <button 
                onClick={handleDiscard}
                className="w-full py-5 rounded-2xl font-black text-red-500 flex items-center justify-center gap-2 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 size={20} />
                Discard Workout
              </button>
            )}

          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
