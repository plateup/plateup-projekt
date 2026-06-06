import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { User, Mail, Settings, LogOut, Shield, Bell, ChevronRight, Award } from 'lucide-react';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setProfile({ ...user, ...data });
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  if (loading) return null;

  return (
    <div className="animate-in fade-in duration-700">
      <header className="mb-12 flex items-center justify-between">
        <div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-2">Profile</h1>
          <p className="text-[#8E8E93] font-bold">Manage your account and settings</p>
        </div>
      </header>

      {/* Profile Card */}
      <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-[40px] p-8 mb-10 flex flex-col md:flex-row items-center gap-8 shadow-xl">
        <div className="w-24 h-24 rounded-[32px] bg-black border border-white/5 flex items-center justify-center text-3xl font-black shadow-2xl">
          {profile?.username?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-3xl font-black mb-1">{profile?.username || 'User'}</h2>
          <p className="text-[#8E8E93] font-bold mb-4">{profile?.email}</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-2">
            <span className="bg-white/5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-[#8E8E93] border border-white/5">PRO MEMBER</span>
            <span className="bg-white/5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-[#8E8E93] border border-white/5">ATHLETE</span>
          </div>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="space-y-4">
        <SectionHeader title="Account" />
        <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-[40px] overflow-hidden">
          <MenuLink icon={<Settings size={20} />} label="General Settings" />
          <MenuLink icon={<Shield size={20} />} label="Privacy & Security" border />
          <MenuLink icon={<Bell size={20} />} label="Notifications" border />
        </div>

        <SectionHeader title="Achievements" />
        <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-[40px] overflow-hidden">
          <MenuLink icon={<Award size={20} />} label="My Badges" />
          <MenuLink icon={<Award size={20} />} label="Personal Records" border />
        </div>

        <div className="pt-6">
          <button 
            onClick={() => supabase.auth.signOut()}
            className="w-full bg-[#1C1C1E] border border-red-500/20 text-red-500 py-6 rounded-[32px] font-black flex items-center justify-center gap-3 hover:bg-red-500 hover:text-white transition-all active:scale-95"
          >
            <LogOut size={20} />
            SIGN OUT
          </button>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ title }) {
  return <h3 className="text-xs font-black text-[#8E8E93] uppercase tracking-[0.2em] ml-4 mt-8 mb-4">{title}</h3>;
}

function MenuLink({ icon, label, border }) {
  return (
    <button className={`w-full flex items-center justify-between p-6 hover:bg-white/5 transition-all group ${border ? 'border-t border-white/5' : ''}`}>
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-[#8E8E93] group-hover:text-white transition-colors">
          {icon}
        </div>
        <span className="font-bold text-lg">{label}</span>
      </div>
      <ChevronRight className="text-[#3C3C3E]" size={20} />
    </button>
  );
}
