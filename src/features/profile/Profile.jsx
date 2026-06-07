import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { User, Mail, Settings, LogOut, Shield, Bell, ChevronRight, ChevronLeft, Award, Zap, Flame, Target, Edit3, Check } from 'lucide-react';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [activeView, setActiveView] = useState('main');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      const fetchedAvatar = data?.avatar_url || localStorage.getItem('plateup_avatar');
      const fetchedName = data?.username || data?.display_name || localStorage.getItem('plateup_username') || user.email?.split('@')[0] || 'User';
      
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
    
    if (error) alert("Failed to save to database. Make sure 'profiles' table exists.");
  };

  const handleAvatarUpload = async (event) => {
    try {
      setLoading(true);
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
      alert('Error uploading avatar! Check if avatars bucket is public.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile) return null;

  if (activeView === 'general') {
    return <SettingsView title="General Settings" onBack={() => setActiveView('main')}>
      <ToggleRow label="Weight Units" value="Kilograms (kg)" />
      <ToggleRow label="Theme" value="Dark Mode (Forced)" locked />
      <ToggleRow label="Rest Timer Sound" toggleState={true} />
      <ToggleRow label="Haptic Feedback" toggleState={true} />
    </SettingsView>;
  }

  if (activeView === 'privacy') {
    return <SettingsView title="Privacy & Security" onBack={() => setActiveView('main')}>
      <ToggleRow label="Public Profile" toggleState={true} />
      <ToggleRow label="Show Activity on Feed" toggleState={true} />
      <ToggleRow label="Hide Weights from Friends" toggleState={false} />
      <button className="w-full mt-8 bg-white/5 text-white font-bold py-4 rounded-[20px] hover:bg-white/10 transition-colors border border-white/10">
        Change Password
      </button>
    </SettingsView>;
  }

  if (activeView === 'notifications') {
    return <SettingsView title="Notifications" onBack={() => setActiveView('main')}>
      <ToggleRow label="Workout Reminders" toggleState={true} />
      <ToggleRow label="Friend Requests" toggleState={true} />
      <ToggleRow label="Likes & Comments" toggleState={true} />
      <ToggleRow label="Weekly Summary Email" toggleState={false} />
    </SettingsView>;
  }

  if (activeView === 'badges') {
    return <SettingsView title="My Badges" onBack={() => setActiveView('main')}>
      <div className="grid grid-cols-2 gap-4">
        <BadgeCard icon={<Flame size={32} />} title="Consistency" desc="3 days streak" active />
        <BadgeCard icon={<Zap size={32} />} title="Early Bird" desc="Workout before 6AM" active />
        <BadgeCard icon={<Target size={32} />} title="Sniper" desc="Hit all reps perfectly" active={false} />
        <BadgeCard icon={<Award size={32} />} title="Century Club" desc="100 workouts" active={false} />
      </div>
    </SettingsView>;
  }

  if (activeView === 'prs') {
    return <SettingsView title="Personal Records" onBack={() => setActiveView('main')}>
      <div className="space-y-4">
        <PRRow exercise="Bench Press" weight="100 kg" reps="5" date="Oct 12, 2023" />
        <PRRow exercise="Squat" weight="140 kg" reps="3" date="Nov 05, 2023" />
        <PRRow exercise="Deadlift" weight="160 kg" reps="1" date="Dec 01, 2023" />
        <PRRow exercise="Overhead Press" weight="65 kg" reps="5" date="Dec 15, 2023" />
      </div>
    </SettingsView>;
  }

  return (
    <div className="animate-in fade-in duration-700 pb-32">
      <header className="mb-12 flex items-center justify-between">
        <div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-2 text-white">Profile</h1>
          <p className="text-[#8E8E93] font-bold">Manage your account</p>
        </div>
      </header>

      <div className="bg-[#1C1C1E] border border-white/5 rounded-[40px] p-8 mb-10 flex flex-col md:flex-row items-center gap-8 shadow-xl relative overflow-hidden group">
        <div className="relative w-24 h-24 rounded-[20px] bg-black border border-white/10 flex items-center justify-center text-3xl font-black shadow-2xl z-10 overflow-hidden group-hover:border-white/20 transition-all">
          {profile?.avatar_url ? (
             <img src={profile?.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
             <span className="text-white">{editName?.charAt(0).toUpperCase() || 'U'}</span>
          )}
          <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
            <span className="text-[10px] font-black uppercase tracking-widest text-white">Upload</span>
            <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
          </label>
        </div>
        <div className="flex-1 text-center md:text-left relative z-10">
          {isEditing ? (
             <div className="flex flex-col md:flex-row items-center md:items-start gap-4 mb-2">
                <input 
                  type="text" 
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="bg-black border border-white/10 rounded-xl px-4 py-2 font-black text-xl text-white outline-none focus:border-white/40 w-full md:w-auto text-center md:text-left"
                />
                <button onClick={handleSaveProfile} className="bg-white text-black px-6 py-2 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-neutral-200">
                  Save
                </button>
             </div>
          ) : (
            <h2 className="text-3xl font-black mb-1 text-white flex items-center justify-center md:justify-start gap-3">
               {editName}
               <button onClick={() => setIsEditing(true)} className="text-[#8E8E93] hover:text-white transition-colors">
                  <Edit3 size={18} />
               </button>
            </h2>
          )}
          <p className="text-[#8E8E93] font-bold mt-2">{profile?.email}</p>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />
      </div>

      <div className="space-y-4">
        <SectionHeader title="Account" />
        <div className="bg-[#1C1C1E] border border-white/5 rounded-[40px] overflow-hidden">
          <MenuLink icon={<Settings size={20} />} label="General Settings" onClick={() => setActiveView('general')} />
          <MenuLink icon={<Shield size={20} />} label="Privacy & Security" border onClick={() => setActiveView('privacy')} />
          <MenuLink icon={<Bell size={20} />} label="Notifications" border onClick={() => setActiveView('notifications')} />
        </div>

        <SectionHeader title="Achievements" />
        <div className="bg-[#1C1C1E] border border-white/5 rounded-[40px] overflow-hidden">
          <MenuLink icon={<Award size={20} />} label="My Badges" onClick={() => setActiveView('badges')} />
          <MenuLink icon={<Target size={20} />} label="Personal Records" border onClick={() => setActiveView('prs')} />
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

function PRRow({ exercise, weight, reps, date }) {
  return (
    <div className="flex items-center justify-between p-6 bg-[#1C1C1E] rounded-[32px] border border-white/5">
      <div>
        <h4 className="font-black text-white text-lg">{exercise}</h4>
        <p className="text-xs font-bold text-[#8E8E93] mt-1">{date}</p>
      </div>
      <div className="text-right">
        <span className="font-black text-2xl text-white">{weight}</span>
        <span className="text-xs font-bold text-[#8E8E93] ml-2">x {reps}</span>
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
