import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { User, Settings, LogOut, Shield, ChevronRight, ChevronLeft, Target, Edit3 } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, XAxis, Tooltip } from 'recharts';
import { format, subDays, startOfToday } from 'date-fns';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [activeView, setActiveView] = useState('main');
  const [errorMsg, setErrorMsg] = useState(null);
  
  const [stats, setStats] = useState({ workoutsCount: 0, totalVolume: 0, chartData: [] });

  useEffect(() => {
    fetchProfile();
    calculateStats();
  }, []);

  const calculateStats = () => {
    const posts = JSON.parse(localStorage.getItem('plateup_posts') || '[]');
    let volume = 0;
    
    // Calculate total volume
    posts.forEach(post => {
      if (post.stats?.volume) {
        volume += parseFloat(post.stats.volume.replace(' kg', '').replace(',', '')) || 0;
      }
    });

    // Calculate daily volume for the last 7 days for the chart
    const today = startOfToday();
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i);
      const dateStr = format(date, 'MMM dd');
      const dailyPosts = posts.filter(p => new Date(p.created_at).toDateString() === date.toDateString());
      let dailyVol = 0;
      dailyPosts.forEach(post => {
        if (post.stats?.volume) dailyVol += parseFloat(post.stats.volume.replace(' kg', '').replace(',', '')) || 0;
      });
      chartData.push({ name: dateStr, volume: dailyVol });
    }

    setStats({ workoutsCount: posts.length, totalVolume: volume, chartData });
  };

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      
      const fetchedAvatar = data?.avatar_url || localStorage.getItem('plateup_avatar');
      const fetchedName = data?.username || data?.display_name || localStorage.getItem('plateup_username') || user.email.split('@')[0];
      
      setProfile({ ...user, ...data, avatar_url: fetchedAvatar });
      setEditName(fetchedName);
      
      localStorage.setItem('plateup_username', fetchedName);
      if (fetchedAvatar) localStorage.setItem('plateup_avatar', fetchedAvatar);
      window.dispatchEvent(new Event('profileUpdated'));
    }
    setLoading(false);
  };

  const handleSaveProfile = async () => {
    if (!profile) return;
    setProfile({ ...profile, username: editName });
    localStorage.setItem('plateup_username', editName);
    window.dispatchEvent(new Event('profileUpdated'));
    setIsEditing(false);

    const { error } = await supabase
      .from('profiles')
      .update({ username: editName, display_name: editName })
      .eq('id', profile.id);
    
    if (error) setErrorMsg("Failed to save to database. Make sure 'profiles' table exists.");
  };

  const handleAvatarUpload = async (event) => {
    try {
      setLoading(true);
      setErrorMsg(null);
      if (!event.target.files || event.target.files.length === 0) return;
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      let { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', profile.id);
      
      setProfile(prev => ({ ...prev, avatar_url: publicUrl }));
      localStorage.setItem('plateup_avatar', publicUrl);
      window.dispatchEvent(new Event('profileUpdated'));
    } catch (error) {
      setErrorMsg('Error uploading avatar! Check if avatars bucket is public.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile) return null;

  if (activeView === 'general') {
    const initialTipsState = localStorage.getItem('plateup_show_assistant_tips') === 'true';
    return <SettingsView title="General Settings" onBack={() => setActiveView('main')}>
      <ToggleRow label="Weight Units" value="Kilograms (kg)" />
      <ToggleRow label="Theme" value="Dark Mode (Forced)" locked />
      <ToggleRow label="Rest Timer Sound" toggleState={true} />
      <ToggleRow 
        label="Progression Tips (I / W)" 
        toggleState={initialTipsState} 
        onToggle={(state) => localStorage.setItem('plateup_show_assistant_tips', state.toString())} 
      />
    </SettingsView>;
  }

  if (activeView === 'privacy') {
    return <SettingsView title="Privacy & Security" onBack={() => setActiveView('main')}>
      <ToggleRow label="Public Profile" toggleState={false} />
      <button className="w-full mt-8 bg-white/5 text-white font-bold py-4 rounded-[20px] hover:bg-white/10 transition-colors border border-white/10">
        Change Password
      </button>
    </SettingsView>;
  }

  return (
    <div className="animate-in fade-in duration-700 pt-8 pb-32">
      <header className="mb-12 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter mb-2 text-white">Profile</h1>
          <p className="text-[#8E8E93] font-bold mt-2">Manage your account</p>
        </div>
      </header>

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl font-bold text-sm text-center">
          {errorMsg}
        </div>
      )}

      <div className="bg-[#1C1C1E] border border-white/5 rounded-[40px] p-8 mb-10 flex flex-col items-center gap-8 shadow-xl relative overflow-hidden group">
        <div className="flex flex-col md:flex-row items-center gap-8 w-full z-10">
          <div className="relative w-24 h-24 rounded-[20px] bg-black border border-white/10 flex items-center justify-center text-3xl font-bold shadow-2xl overflow-hidden group-hover:border-white/20 transition-all shrink-0">
            {profile?.avatar_url ? (
               <img src={profile?.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
               <span className="text-white">{editName?.charAt(0).toUpperCase() || 'U'}</span>
            )}
            <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
              <span className="text-[10px] font-bold uppercase tracking-widest text-white">Upload</span>
              <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            </label>
          </div>
          <div className="flex-1 text-center md:text-left">
            {isEditing ? (
               <div className="flex flex-col md:flex-row items-center md:items-start gap-4 mb-2">
                  <input 
                    type="text" 
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="bg-black border border-white/10 rounded-xl px-4 py-2 font-bold text-xl text-white outline-none focus:border-white/40 w-full md:w-auto text-center md:text-left"
                  />
                  <button onClick={handleSaveProfile} className="bg-white text-black px-6 py-2 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-neutral-200">
                    Save
                  </button>
               </div>
            ) : (
              <h2 className="text-3xl font-bold mb-1 text-white flex items-center justify-center md:justify-start gap-3">
                 {editName}
                 <button onClick={() => setIsEditing(true)} className="text-[#8E8E93] hover:text-white transition-colors">
                    <Edit3 size={18} />
                 </button>
              </h2>
            )}
            <p className="text-[#8E8E93] font-bold mt-2">{profile?.email}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-[#1C1C1E] rounded-3xl p-6 border border-white/5 flex flex-col items-center justify-center text-center">
          <div className="text-3xl font-bold text-white">{stats.workoutsCount}</div>
          <div className="text-[10px] text-[#8E8E93] font-bold uppercase tracking-widest mt-1">Workouts</div>
        </div>
        <div className="bg-[#1C1C1E] rounded-3xl p-6 border border-white/5 flex flex-col items-center justify-center text-center">
          <div className="text-3xl font-bold text-white">{stats.totalVolume > 0 ? (stats.totalVolume / 1000).toFixed(1) + 't' : '0'}</div>
          <div className="text-[10px] text-[#8E8E93] font-bold uppercase tracking-widest mt-1">Volume</div>
        </div>
      </div>

      {stats.chartData && stats.chartData.length > 0 && (
        <div className="bg-[#1C1C1E] rounded-[32px] p-6 mb-10 border border-white/5 shadow-xl">
          <h3 className="text-xs font-bold text-[#8E8E93] uppercase tracking-widest mb-6 ml-2">Volume (Last 7 Days)</h3>
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', fontWeight: 900 }}
                  itemStyle={{ color: '#fff' }}
                  cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2, strokeDasharray: '4 4' }}
                />
                <Area type="monotone" dataKey="volume" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorVolume)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <SectionHeader title="Settings" />
        <div className="bg-[#1C1C1E] border border-white/5 rounded-[40px] overflow-hidden">
          <MenuLink icon={<Settings size={20} />} label="General Settings" onClick={() => setActiveView('general')} />
          <MenuLink icon={<Shield size={20} />} label="Privacy & Security" border onClick={() => setActiveView('privacy')} />
        </div>

        <div className="pt-6">
          <button 
            onClick={() => supabase.auth.signOut()}
            className="w-full bg-[#1C1C1E] border border-white/10 text-white/60 py-6 rounded-[32px] font-bold flex items-center justify-center gap-3 hover:bg-white/10 hover:text-white transition-all active:scale-[0.97] ease-out-ios"
          >
            <LogOut size={20} />
            SIGN OUT
          </button>
        </div>
        
        <div className="text-center mt-12 mb-6 text-[#8E8E93] text-xs font-bold uppercase tracking-widest opacity-50">
          made by landzi
        </div>
      </div>
    </div>
  );
}

function SettingsView({ title, onBack, children }) {
  return (
    <div className="animate-in slide-in-from-right-8 duration-300 pt-8 pb-32">
      <header className="flex items-center gap-4 mb-10">
        <button onClick={onBack} className="w-12 h-12 bg-white/5 rounded-[20px] flex items-center justify-center text-white hover:bg-white/10 transition-colors border border-white/10">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-3xl font-bold text-white">{title}</h1>
      </header>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}

function ToggleRow({ label, value, toggleState, locked, onToggle }) {
  const [isOn, setIsOn] = useState(toggleState);
  return (
    <div className="flex items-center justify-between p-6 bg-[#1C1C1E] rounded-[32px] border border-white/5">
      <span className="font-bold text-white text-lg">{label}</span>
      {value ? (
        <span className={`font-bold ${locked ? 'text-[#8E8E93]' : 'text-white'}`}>{value}</span>
      ) : (
        <button 
          onClick={() => {
            if (locked) return;
            const newState = !isOn;
            setIsOn(newState);
            if (onToggle) onToggle(newState);
          }}
          className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 border border-white/5 ${isOn ? 'bg-indigo-500' : 'bg-[#2C2C2E]'}`}
        >
          <div className={`w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${isOn ? 'translate-x-6 bg-white' : 'translate-x-0 bg-[#8E8E93]'}`} />
        </button>
      )}
    </div>
  );
}

function SectionHeader({ title }) {
  return <h3 className="text-xs font-bold text-[#8E8E93] uppercase tracking-[0.2em] ml-4 mt-8 mb-4">{title}</h3>;
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