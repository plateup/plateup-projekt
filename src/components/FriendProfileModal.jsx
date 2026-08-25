import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { X, MessageSquare, Copy } from 'lucide-react';
import { ModalPortal } from './ui';
import WorkoutPost from './WorkoutPost';

export default function FriendProfileModal({ userId, currentUsername, currentUserAvatar, onClose, onMessageClick }) {
  const [profile, setProfile] = useState(null);
  const [routines, setRoutines] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    
    const fetchData = async () => {
      setLoading(true);
      
      // 1. Fetch Profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (profileData) {
        let e = profileData.exp || 0;
        profileData.level = Math.floor(Math.sqrt(e / 100)) + 1;
        setProfile(profileData);
      }

      // 2. Fetch Routines
      const { data: routinesData } = await supabase
        .from('routines')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (routinesData) setRoutines(routinesData);

      // 3. Fetch Recent Public Posts
      const { data: postsData } = await supabase
        .from('posts')
        .select('*, profiles(username, avatar_url)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);
        
      if (postsData) {
        const mappedWorkouts = postsData.map(p => {
          const workoutData = p.workout_data || {};
          if (p.profiles) {
            if (!workoutData.user) workoutData.user = {};
            workoutData.user.name = p.profiles.username;
            workoutData.user.avatar = p.profiles.avatar_url;
          }
          return {
            ...workoutData,
            user_id: p.user_id,
            id: p.id,
            db_id: p.id,
          };
        }).filter(p => p.visibility !== 'private'); // Only show public on profile!
        setRecentPosts(mappedWorkouts);
      }
      
      setLoading(false);
    };
    
    fetchData();
  }, [userId]);

  const handleCopyRoutine = async (routine) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const newRoutine = {
      name: `${routine.name} (Copied)`,
      exercises: routine.exercises
    };
    
    await supabase.from('routines').insert([{
      user_id: user.id,
      name: newRoutine.name,
      exercises: newRoutine.exercises
    }]);
    
    alert('Routine copied successfully!');
  };

  if (!profile && loading) {
    return (
      <ModalPortal>
        <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      </ModalPortal>
    );
  }

  if (!profile) return null;

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[600] flex items-end sm:items-center justify-center sm:p-6 animate-in fade-in duration-300">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <div className="relative w-full sm:max-w-md h-[90vh] sm:h-[700px] bg-[#1C1C1E] sm:rounded-[36px] rounded-t-[36px] shadow-2xl border border-white/10 overflow-hidden flex flex-col animate-in slide-in-from-bottom-8 duration-300">
          
          <div className="flex items-center justify-between p-6 pb-4 border-b border-white/5 relative z-10 bg-[#1C1C1E]">
            <h3 className="font-black text-xl text-white">Profile</h3>
            <button onClick={onClose} className="text-[#8E8E93] hover:text-white transition-colors bg-white/5 p-2 rounded-full">
              <X size={20} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
            <div className="p-8 flex flex-col items-center text-center border-b border-white/5 bg-[#1C1C1E]">
              <div className="flex items-center gap-6 w-full max-w-sm mb-6">
                <div className="w-24 h-24 rounded-[32px] bg-black border border-white/10 flex items-center justify-center font-black text-4xl overflow-hidden shadow-2xl relative shrink-0">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white">{(profile.username || profile.display_name || 'U')[0].toUpperCase()}</span>
                  )}
                </div>
                <div className="flex-1 text-left">
                  <h2 className="text-2xl font-black text-white mb-2">{profile.username || profile.display_name}</h2>
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                      <span className="text-xl font-black text-white leading-none">{recentPosts.length}</span>
                      <span className="text-[10px] font-bold text-[#8E8E93] uppercase tracking-widest mt-1">Workouts</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xl font-black text-white leading-none text-amber-400">{profile.level}</span>
                      <span className="text-[10px] font-bold text-[#8E8E93] uppercase tracking-widest mt-1">Level</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6 w-full text-sm font-medium text-white/80 leading-relaxed bg-black/40 p-4 rounded-3xl border border-white/5 text-left">
                {profile.bio || <span className="text-[#8E8E93] italic">No bio added.</span>}
              </div>
              
              {profile.username !== currentUsername && onMessageClick && (
                <div className="flex gap-2 w-full">
                  <button onClick={() => onMessageClick(profile)} className="w-full bg-white text-black py-4 rounded-2xl font-black text-sm hover:bg-neutral-200 transition-all flex items-center justify-center gap-2">
                    <MessageSquare size={16} /> Message
                  </button>
                </div>
              )}
            </div>

            {routines.length > 0 && (
              <div className="p-4 mt-2 border-b border-white/5 pb-8">
                <h3 className="text-sm font-black text-[#8E8E93] uppercase tracking-widest mb-4 ml-2">Routines</h3>
                <div className="flex overflow-x-auto gap-4 pb-2 no-scrollbar px-2">
                  {routines.map(routine => (
                    <div key={routine.id} className="min-w-[200px] bg-black/40 border border-white/5 p-4 rounded-[24px] cursor-pointer hover:border-white/10 transition-colors">
                      <h4 className="font-black text-white mb-2 truncate">{routine.name}</h4>
                      <p className="text-xs text-[#8E8E93] mb-4">{routine.exercises?.length || 0} exercises</p>
                      <button 
                        onClick={() => handleCopyRoutine(routine)}
                        className="text-[10px] bg-white text-black px-3 py-1.5 rounded-lg font-black uppercase tracking-widest hover:bg-neutral-200 transition-all w-full flex justify-center items-center gap-1"
                      >
                        <Copy size={12} /> Copy
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="p-4 mt-2">
              <h3 className="text-sm font-black text-[#8E8E93] uppercase tracking-widest mb-4 ml-2">Recent Workouts</h3>
              <div className="space-y-4">
                {recentPosts.length > 0 ? (
                  recentPosts.map(post => (
                    <WorkoutPost 
                      key={post.id} 
                      post={post} 
                      currentUsername={currentUsername} 
                      currentUserAvatar={currentUserAvatar} 
                      onCopy={() => {}} 
                      onDelete={() => {}} 
                      onViewSummary={() => {}} 
                    />
                  ))
                ) : (
                  <div className="text-center py-10 text-[#8E8E93] font-bold text-sm">No recent workouts</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
