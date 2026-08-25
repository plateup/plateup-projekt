/**
 * Plik: Profile.jsx
 * Autor: landzi
 * Opis: Zarządzanie profilem użytkownika. Oblicza poziom (Level) na podstawie EXP, pozwala na zmianę avatara i nazwy.
 * Technologia: React / JSX / Tailwind CSS
 */

import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../services/supabaseClient';
import { User, Mail, Settings, LogOut, Shield, Bell, ChevronRight, ChevronLeft, Award, Zap, Flame, Target, Edit3, Check, BarChart2, Ruler, Activity, Clock, Dumbbell, Camera, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import Stats from '../stats/Stats';
import { ModalPortal } from '../../components/ui';
import WorkoutPost from '../../components/WorkoutPost';
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval, parseISO } from 'date-fns';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('main');
  const [errorMsg, setErrorMsg] = useState(null);

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  
  // Data
  const [exp, setExp] = useState(0);
  const [localWorkouts, setLocalWorkouts] = useState([]);
  const [friendsCount, setFriendsCount] = useState(0);
  const [workoutsCount, setWorkoutsCount] = useState(0);
  const [selectedWorkoutRecap, setSelectedWorkoutRecap] = useState(null);

  // Chart State
  const [timeRange, setTimeRange] = useState('3M'); // '3M', '1Y', 'ALL'
  const [metric, setMetric] = useState('volume'); // 'volume', 'duration', 'workouts'
  const [showAllWorkouts, setShowAllWorkouts] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchStats();
    setExp(parseInt(localStorage.getItem('plateup_exp') || '0', 10));
  }, []);

  const getLevelInfo = (exp) => {
    if (exp < 1000) return { level: 1, rank: 'Beginner', current: exp, max: 1000, progress: (exp/1000)*100 };
    if (exp < 3000) return { level: 2, rank: 'Novice', current: exp-1000, max: 2000, progress: ((exp-1000)/2000)*100 };
    if (exp < 6000) return { level: 3, rank: 'Iron Lifter', current: exp-3000, max: 3000, progress: ((exp-3000)/3000)*100 };
    if (exp < 10000) return { level: 4, rank: 'Gym Rat', current: exp-6000, max: 4000, progress: ((exp-6000)/4000)*100 };
    return { level: 5, rank: 'Titan', current: exp-10000, max: 10000, progress: Math.min(((exp-10000)/10000)*100, 100) };
  };

  const levelInfo = getLevelInfo(exp);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
      
      const fetchedAvatar = data?.avatar_url || localStorage.getItem('plateup_avatar');
      const fetchedName = data?.username || data?.display_name || localStorage.getItem('plateup_username') || user.email.split('@')[0];
      const fetchedBio = data?.bio || localStorage.getItem('plateup_bio') || '';

      setProfile({ ...user, ...data, avatar_url: fetchedAvatar, bio: fetchedBio });
      setEditName(fetchedName);
      setEditBio(fetchedBio);
      
      const localExp = parseInt(localStorage.getItem('plateup_exp') || '0', 10);
      const dbExp = data?.exp || 0;
      const bestExp = Math.max(localExp, dbExp);
      
      setExp(bestExp);
      if (bestExp > localExp) localStorage.setItem('plateup_exp', bestExp.toString());
      
      localStorage.setItem('plateup_username', fetchedName);
      localStorage.setItem('plateup_bio', fetchedBio);
      if (fetchedAvatar) localStorage.setItem('plateup_avatar', fetchedAvatar);
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Friends
    const { data: sentReqs } = await supabase.from('friend_requests').select('receiver_id').eq('sender_id', user.id).eq('status', 'accepted');
    const { data: incReqs } = await supabase.from('friend_requests').select('sender_id').eq('receiver_id', user.id).eq('status', 'accepted');
    let fCount = (sentReqs?.length || 0) + (incReqs?.length || 0);
    setFriendsCount(fCount);

    // Workouts
    const { data: postsData } = await supabase.from('posts').select('*, profiles(username, avatar_url)').eq('user_id', user.id).order('created_at', { ascending: false });
    if (postsData) {
      setWorkoutsCount(postsData.length);
      const mappedWorkouts = postsData.map(p => {
        const workoutData = p.workout_data || {};
        if (p.profiles) {
          if(!workoutData.user) workoutData.user = {};
          workoutData.user.name = p.profiles.username;
          workoutData.user.avatar = p.profiles.avatar_url;
        }
        return {
          ...workoutData,
          id: p.id,
          db_id: p.id,
          user_id: p.user_id,
          created_at: p.created_at || (p.workout_data || {}).created_at
        };
      });
      setLocalWorkouts(mappedWorkouts);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    setProfile(prev => ({ ...prev, username: editName, bio: editBio }));
    localStorage.setItem('plateup_username', editName);
    localStorage.setItem('plateup_bio', editBio);
    window.dispatchEvent(new Event('profileUpdated'));
    setIsEditing(false);

    await supabase.from('profiles').update({ username: editName, display_name: editName, bio: editBio }).eq('id', profile.id);
    setLoading(false);
  };

  const handleAvatarUpload = async (event) => {
    try {
      setLoading(true);
      const file = event.target.files[0];
      if (!file) return;
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}-${Date.now()}.${fileExt}`;
      
      let { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', profile.id);
      
      setProfile(prev => ({ ...prev, avatar_url: publicUrl }));
      localStorage.setItem('plateup_avatar', publicUrl);
      window.dispatchEvent(new Event('profileUpdated'));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // --- CHART LOGIC ---
  const chartData = useMemo(() => {
    if (!localWorkouts.length) return [];
    
    let months = 3;
    if (timeRange === '1Y') months = 12;
    if (timeRange === 'ALL') months = 24; // Limit to 2 years for rendering

    const end = new Date();
    const start = subMonths(end, months - 1);
    const intervals = eachMonthOfInterval({ start, end });

    return intervals.map(date => {
      const monthStr = format(date, 'MMM');
      const yearStr = format(date, 'yy');
      
      const workoutsInMonth = localWorkouts.filter(w => {
        if (!w.created_at) return false;
        const d = new Date(w.created_at);
        return d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear();
      });

      let val = 0;
      if (metric === 'workouts') val = workoutsInMonth.length;
      else if (metric === 'volume') {
        val = workoutsInMonth.reduce((acc, w) => {
          const volStr = w.stats?.volume || '0';
          const num = parseInt(volStr.replace(/[^0-9]/g, ''), 10) || 0;
          return acc + num;
        }, 0);
      }
      else if (metric === 'duration') {
        val = workoutsInMonth.reduce((acc, w) => {
          const timeStr = w.stats?.time || '0:00';
          const [m, s] = timeStr.split(':').map(Number);
          return acc + ((m || 0) * 60 + (s || 0)) / 3600; // in hours
        }, 0);
      }

      return {
        name: timeRange === '3M' ? monthStr : `${monthStr} ${yearStr}`,
        value: val
      };
    });
  }, [localWorkouts, timeRange, metric]);

  const recentSummary = useMemo(() => {
    if (!chartData.length) return { val: 0, text: '' };
    const lastMonth = chartData[chartData.length - 1];
    if (metric === 'workouts') return { val: lastMonth.value, text: 'workouts this month' };
    if (metric === 'volume') return { val: `${(lastMonth.value / 1000).toFixed(1)}k`, text: 'kg volume this month' };
    if (metric === 'duration') return { val: lastMonth.value.toFixed(1), text: 'hours this month' };
  }, [chartData, metric]);

  // Views handling
  if (loading && !profile) return null;

  if (activeView === 'general') return <SettingsView title="General Settings" onBack={() => setActiveView('main')}><ToggleRow label="Weight Units" value="Kilograms (kg)" /><ToggleRow label="Theme" value="Dark Mode (Forced)" locked /><ToggleRow label="Rest Timer Sound" toggleState={true} /><ToggleRow label="Haptic Feedback" toggleState={true} /></SettingsView>;
  if (activeView === 'privacy') return <SettingsView title="Privacy & Security" onBack={() => setActiveView('main')}><ToggleRow label="Public Profile" toggleState={true} /><ToggleRow label="Show Activity on Feed" toggleState={true} /><button className="w-full mt-8 bg-white/5 text-white font-bold py-4 rounded-[20px] hover:bg-white/10 transition-colors border border-white/10">Change Password</button></SettingsView>;
  if (activeView === 'notifications') return <SettingsView title="Notifications" onBack={() => setActiveView('main')}><ToggleRow label="Workout Reminders" toggleState={true} /><ToggleRow label="Friend Requests" toggleState={true} /><ToggleRow label="Likes & Comments" toggleState={true} /></SettingsView>;
  if (activeView === 'badges') return <SettingsView title="My Badges" onBack={() => setActiveView('main')}><div className="grid grid-cols-2 gap-4"><BadgeCard icon={<Flame size={32} />} title="Consistency" desc="3 days streak" active /><BadgeCard icon={<Award size={32} />} title="Century Club" desc="100 workouts" active={false} /></div></SettingsView>;
  if (activeView === 'prs') return <SettingsView title="Main Lifts PRs" onBack={() => setActiveView('main')}><div className="text-center text-[#8E8E93] mt-20">PR Data Here</div></SettingsView>;
  if (activeView === 'stats') return <div className="animate-in fade-in duration-300"><button onClick={() => setActiveView('main')} className="mb-8 flex items-center gap-2 font-bold text-[#8E8E93]"><ChevronLeft /> Back to Profile</button><Stats /></div>;
  if (activeView === 'measures') return <SettingsView title="Measures" onBack={() => setActiveView('main')}><div className="bg-[#1C1C1E] border border-white/5 p-6 rounded-[32px] text-center"><Ruler size={32} className="mx-auto mb-4 text-[#8E8E93]" /><h3 className="font-black text-white text-xl mb-2">Body Weight</h3><p className="text-[#8E8E93] font-bold text-sm">Log your body weight here.</p></div></SettingsView>;

  return (
    <div className="animate-in fade-in duration-700 pb-32">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-black tracking-tighter text-white">Profile</h1>
        <button onClick={() => setIsEditing(true)} className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all">
          <Edit3 size={20} />
        </button>
      </header>

      {/* Profile Header (Avatar, Nick, Stats) */}
      <div className="flex items-center gap-6 mb-6">
        <div className="relative w-24 h-24 rounded-[32px] bg-black border border-white/10 flex items-center justify-center text-3xl font-black shadow-2xl overflow-hidden shrink-0">
          {profile?.avatar_url ? (
            <img src={profile?.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="text-white">{editName?.charAt(0).toUpperCase() || 'U'}</span>
          )}
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-black text-white mb-2">{editName}</h2>
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <span className="text-xl font-black text-white leading-none">{workoutsCount}</span>
              <span className="text-[10px] font-bold text-[#8E8E93] uppercase tracking-widest mt-1">Workouts</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black text-white leading-none">{friendsCount}</span>
              <span className="text-[10px] font-bold text-[#8E8E93] uppercase tracking-widest mt-1">Friends</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bio */}
      <div className="mb-10 text-sm font-medium text-white/80 leading-relaxed bg-[#1C1C1E] p-4 rounded-3xl border border-white/5">
        {profile?.bio || <span className="text-[#8E8E93] italic">No bio added yet.</span>}
      </div>

      {/* iOS Screen Time Style Chart */}
      <div className="bg-[#1C1C1E] border border-white/5 rounded-[40px] p-6 mb-10 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-[#8E8E93] mb-1">Activity</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">{recentSummary.val}</span>
              <span className="text-sm font-bold text-[#8E8E93]">{recentSummary.text}</span>
            </div>
          </div>
          <div className="bg-black/50 p-1 rounded-xl flex gap-1 border border-white/5">
            {['3M', '1Y', 'ALL'].map(r => (
              <button key={r} onClick={() => setTimeRange(r)} className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${timeRange === r ? 'bg-white text-black' : 'text-[#8E8E93] hover:text-white'}`}>{r}</button>
            ))}
          </div>
        </div>

        <div className="flex gap-2 mb-6 p-1 bg-black/50 rounded-2xl border border-white/5">
          {['workouts', 'volume', 'duration'].map(m => (
            <button key={m} onClick={() => setMetric(m)} className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${metric === m ? 'bg-white/10 text-white' : 'text-[#8E8E93] hover:text-white'}`}>
              {m}
            </button>
          ))}
        </div>

        <div className="h-48 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#8E8E93', fontSize: 10, fontWeight: 'bold' }} dy={10} />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                contentStyle={{ backgroundColor: '#1C1C1E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', fontWeight: 'bold', color: '#fff' }}
                itemStyle={{ color: '#fff' }}
              />
              <Bar dataKey="value" radius={[6, 6, 6, 6]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#ffffff' : 'rgba(255,255,255,0.2)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Workouts Section */}
      <div className="mb-10">
        <h3 className="text-xl font-black text-white mb-6">Recent Workouts</h3>
        <div className="space-y-4">
          {localWorkouts.slice(0, 3).map(workout => (
            <WorkoutPost 
              key={workout.id} 
              post={workout} 
              currentUsername={editName}
              currentUserAvatar={profile?.avatar_url}
              onCopy={() => {}}
              onDelete={() => {}}
              onViewSummary={() => setSelectedWorkoutRecap(workout)}
            />
          ))}
          {localWorkouts.length === 0 && (
            <div className="text-center text-[#8E8E93] py-10 bg-[#1C1C1E] rounded-[32px] border border-white/5 font-bold">No workouts yet.</div>
          )}
        </div>
        {localWorkouts.length > 3 && (
          <button 
            onClick={() => setShowAllWorkouts(true)}
            className="w-full mt-4 py-4 rounded-2xl bg-white/5 text-white font-black text-sm hover:bg-white/10 transition-colors border border-white/5"
          >
            See More
          </button>
        )}
      </div>

      <div className="space-y-4">
        <SectionHeader title="Achievements & Stats" />
        <div className="bg-[#1C1C1E] border border-white/5 rounded-[40px] overflow-hidden">
          <MenuLink icon={<BarChart2 size={20} />} label="Full Statistics" onClick={() => setActiveView('stats')} />
          <MenuLink icon={<Ruler size={20} />} label="Measures" border onClick={() => setActiveView('measures')} />
          <MenuLink icon={<Award size={20} />} label="My Badges" border onClick={() => setActiveView('badges')} />
          <MenuLink icon={<Target size={20} />} label="Personal Records" border onClick={() => setActiveView('prs')} />
        </div>

        <SectionHeader title="Account" />
        <div className="bg-[#1C1C1E] border border-white/5 rounded-[40px] overflow-hidden">
          <MenuLink icon={<Settings size={20} />} label="General Settings" onClick={() => setActiveView('general')} />
          <MenuLink icon={<Shield size={20} />} label="Privacy & Security" border onClick={() => setActiveView('privacy')} />
          <MenuLink icon={<Bell size={20} />} label="Notifications" border onClick={() => setActiveView('notifications')} />
        </div>

        <div className="pt-6">
          <button 
            onClick={() => supabase.auth.signOut()}
            className="w-full bg-[#1C1C1E] border border-white/10 text-white/60 py-6 rounded-[32px] font-black flex items-center justify-center gap-3 hover:bg-white/10 hover:text-white transition-all active:scale-95"
          >
            <LogOut size={20} />
            SIGN OUT
          </button>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <ModalPortal>
          <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="w-full max-w-sm bg-[#1C1C1E] rounded-[40px] p-6 shadow-2xl border border-white/10 relative">
              <button onClick={() => setIsEditing(false)} className="absolute top-6 right-6 text-[#8E8E93] hover:text-white"><X size={24} /></button>
              <h2 className="text-2xl font-black text-white mb-8">Edit Profile</h2>
              
              <div className="flex flex-col items-center mb-8">
                <div className="relative w-24 h-24 rounded-[32px] bg-black border border-white/10 flex items-center justify-center text-3xl font-black overflow-hidden group">
                  {profile?.avatar_url ? (
                    <img src={profile?.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white">{editName?.charAt(0).toUpperCase() || 'U'}</span>
                  )}
                  <label className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center cursor-pointer hover:bg-black/80 transition-colors">
                    <Camera size={20} className="text-white mb-1" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-white">Upload</span>
                    <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div>
                  <label className="text-xs font-black text-[#8E8E93] uppercase tracking-widest ml-2 mb-2 block">Nickname</label>
                  <input 
                    type="text" 
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-2xl px-4 py-4 font-bold text-white outline-none focus:border-white/40 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-[#8E8E93] uppercase tracking-widest ml-2 mb-2 block">Bio</label>
                  <textarea 
                    value={editBio}
                    onChange={e => setEditBio(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-2xl px-4 py-4 font-bold text-white outline-none focus:border-white/40 transition-colors min-h-[100px] resize-none"
                    placeholder="Write something about yourself..."
                  />
                </div>
              </div>

              <button 
                onClick={handleSaveProfile}
                disabled={loading}
                className="w-full bg-white text-black py-4 rounded-2xl font-black text-sm hover:bg-neutral-200 transition-colors"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* All Workouts View */}
      {showAllWorkouts && (
        <ModalPortal>
          <div className="fixed inset-0 z-[600] bg-[#0A0A0A] flex flex-col animate-in slide-in-from-bottom duration-300">
            <header className="sticky top-0 z-10 bg-black/80 backdrop-blur-md border-b border-white/5 p-6 flex justify-between items-center">
              <h1 className="text-xl font-black text-white">Workout History</h1>
              <button onClick={() => setShowAllWorkouts(false)} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white"><X size={20} /></button>
            </header>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20">
              {localWorkouts.map(workout => (
                <WorkoutPost key={workout.id} post={workout} currentUsername={editName} currentUserAvatar={profile?.avatar_url} onCopy={() => {}} onDelete={() => {}} onViewSummary={() => setSelectedWorkoutRecap(workout)} />
              ))}
            </div>
          </div>
        </ModalPortal>
      )}

    </div>
  );
}

function SettingsView({ title, onBack, children }) {
  return (
    <div className="animate-in slide-in-from-right-8 duration-300 pb-32">
      <header className="flex items-center gap-4 mb-10">
        <button onClick={onBack} className="w-12 h-12 bg-white/5 rounded-[20px] flex items-center justify-center text-white hover:bg-white/10 transition-colors border border-white/10">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-3xl font-black text-white">{title}</h1>
      </header>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}

function ToggleRow({ label, value, toggleState, locked }) {
  const [isOn, setIsOn] = useState(toggleState);
  return (
    <div className="flex items-center justify-between p-6 bg-[#1C1C1E] rounded-[32px] border border-white/5">
      <span className="font-bold text-white text-lg">{label}</span>
      {value ? (
        <span className={`font-black ${locked ? 'text-[#8E8E93]' : 'text-white'}`}>{value}</span>
      ) : (
        <button 
          onClick={() => !locked && setIsOn(!isOn)}
          className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 border border-white/5 ${isOn ? 'bg-white' : 'bg-[#2C2C2E]'}`}
        >
          <div className={`w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${isOn ? 'translate-x-6 bg-black' : 'translate-x-0 bg-[#8E8E93]'}`} />
        </button>
      )}
    </div>
  );
}

function BadgeCard({ icon, title, desc, active }) {
  return (
    <div className={`p-6 rounded-[32px] border ${active ? 'bg-[#1C1C1E] border-white/20' : 'bg-transparent border-white/5 opacity-40'} flex flex-col items-center text-center gap-3`}>
      <div className={`w-16 h-16 rounded-[20px] flex items-center justify-center ${active ? 'bg-white text-black' : 'bg-[#2C2C2E] text-[#8E8E93]'}`}>
        {icon}
      </div>
      <div>
        <h4 className="font-black text-white">{title}</h4>
        <p className="text-[10px] text-[#8E8E93] font-bold uppercase tracking-widest mt-1">{desc}</p>
      </div>
    </div>
  );
}

function SectionHeader({ title }) {
  return <h3 className="text-xs font-black text-[#8E8E93] uppercase tracking-[0.2em] ml-4 mt-8 mb-4">{title}</h3>;
}

function MenuLink({ icon, label, border, onClick }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center justify-between p-6 hover:bg-white/5 transition-all group ${border ? 'border-t border-white/5' : ''}`}>
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-[20px] bg-black border border-white/5 flex items-center justify-center text-[#8E8E93] group-hover:text-white transition-colors">
          {icon}
        </div>
        <span className="font-bold text-white text-lg">{label}</span>
      </div>
      <ChevronRight className="text-[#3C3C3E] group-hover:text-white transition-colors" size={20} />
    </button>
  );
}
