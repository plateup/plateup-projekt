import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../services/supabaseClient';
import { Dumbbell, Plus, MoreHorizontal, User } from 'lucide-react';
import { format, addDays, subDays, isSameDay, startOfToday } from 'date-fns';
import WorkoutRecap from '../workout/WorkoutRecap';

export default function Dashboard({ setActiveTab }) {
  const [username, setUsername] = useState(() => localStorage.getItem('plateup_username') || 'Athlete');
  const [avatarUrl, setAvatarUrl] = useState(() => localStorage.getItem('plateup_avatar') || null);
  const [selectedDate, setSelectedDate] = useState(startOfToday());
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [localWorkouts, setLocalWorkouts] = useState([]);
  const [selectedWorkoutRecap, setSelectedWorkoutRecap] = useState(null);
  const scrollRef = useRef(null);

  const generateDates = () => {
    const dates = [];
    const today = startOfToday();
    for (let i = 14; i > 0; i--) {
      dates.push(subDays(today, i));
    }
    dates.push(today);
    for (let i = 1; i <= 7; i++) {
      dates.push(addDays(today, i));
    }
    return dates;
  };

  const dates = generateDates();

  const loadProfileFromStorage = () => {
    setUsername(localStorage.getItem('plateup_username') || 'Athlete');
    setAvatarUrl(localStorage.getItem('plateup_avatar') || null);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('username, display_name, avatar_url')
          .eq('id', user.id)
          .single();
        if (data) {
          const fetchedName = data.username || data.display_name || 'Athlete';
          setUsername(fetchedName);
          localStorage.setItem('plateup_username', fetchedName);
          
          if (data.avatar_url) {
             setAvatarUrl(data.avatar_url);
             localStorage.setItem('plateup_avatar', data.avatar_url);
          }
        }
      }
    };
    fetchProfile();

    const history = JSON.parse(localStorage.getItem('plateup_posts') || '[]');
    setLocalWorkouts(history);

    window.addEventListener('profileUpdated', loadProfileFromStorage);
    return () => window.removeEventListener('profileUpdated', loadProfileFromStorage);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      const todayElement = scrollRef.current.querySelector('[data-istoday="true"]');
      if (todayElement) {
        todayElement.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, []);

  const getWorkoutsForDate = (date) => {
    return localWorkouts.filter(w => {
      const wDate = new Date(w.created_at);
      return isSameDay(wDate, date);
    });
  };

  const dayWorkouts = getWorkoutsForDate(selectedDate);

  return (
    <div className="animate-in fade-in duration-700">
      {/* Header */}
      <header className="flex items-center justify-between mb-12 relative">
        <div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-2">
            Hey, {username}
          </h1>
          <p className="text-[#8E8E93] font-bold">Ready to crush your goals today?</p>
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="w-14 h-14 rounded-[20px] bg-white/5 hover:bg-white/10 flex items-center justify-center border border-white/10 shadow-xl transition-all overflow-hidden"
          >
            {avatarUrl ? (
               <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
               <User className="text-white" size={24} />
            )}
          </button>
          
          {showProfileMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-[#1C1C1E] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <button 
                onClick={() => { setShowProfileMenu(false); setActiveTab('profile'); }}
                className="w-full flex items-center justify-between p-4 hover:bg-white/5 text-left transition-colors"
              >
                <span className="text-sm font-bold text-white">My Profile</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Horizontal Calendar */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6 px-1">
          <h2 className="text-xl font-black">Calendar</h2>
        </div>
        <div 
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto no-scrollbar py-4 -mx-6 px-6 md:mx-0 md:px-0 snap-x scroll-smooth"
        >
          {dates.map((date, index) => {
            const isSelected = isSameDay(date, selectedDate);
            const isToday = isSameDay(date, startOfToday());
            const hasWorkout = getWorkoutsForDate(date).length > 0;
            
            return (
              <button
                key={index}
                data-istoday={isToday}
                onClick={() => setSelectedDate(date)}
                className={`snap-center flex flex-col items-center justify-center min-w-[72px] h-[100px] rounded-[32px] transition-all relative shrink-0 ${
                  isSelected 
                    ? 'bg-white text-black scale-105 shadow-[0_20px_40px_rgba(255,255,255,0.15)]' 
                    : 'bg-[#1C1C1E] text-[#8E8E93] border border-[#2C2C2E] hover:border-white/20'
                }`}
              >
                <span className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isSelected ? 'text-black/60' : 'text-[#8E8E93]'}`}>
                  {format(date, 'EEE')}
                </span>
                <span className="text-2xl font-black tabular-nums">
                  {format(date, 'd')}
                </span>
                {hasWorkout && (
                  <div className={`absolute bottom-2 w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-black' : 'bg-white'}`} />
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Selected Day Workouts */}
      <section className="min-h-[400px]">
        <div className="flex items-center justify-between mb-8 px-1">
          <h2 className="text-2xl font-black tracking-tight">
            {isSameDay(selectedDate, startOfToday()) ? "Today's Session" : format(selectedDate, 'MMMM d, yyyy')}
          </h2>
        </div>
        
        {dayWorkouts.length > 0 ? (
          <div className="space-y-6">
            {dayWorkouts.map((workout) => (
              <div 
                key={workout.id} 
                onClick={() => setSelectedWorkoutRecap(workout)}
                className="bg-[#1C1C1E] border border-white/5 p-8 rounded-[48px] shadow-sm hover:border-white/10 transition-all group w-full cursor-pointer"
              >
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-[24px] bg-white/5 flex items-center justify-center text-white border border-white/5">
                      <Dumbbell size={32} />
                    </div>
                    <div>
                      <h3 className="font-black text-2xl tracking-tight mb-1">{workout.title}</h3>
                      <p className="text-sm text-[#8E8E93] font-bold">{workout.stats?.sets || workout.exercises?.length || 0} Sets • {workout.stats?.time || workout.timeAgo}</p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/60 p-6 rounded-[32px] border border-white/5">
                    <span className="text-[10px] text-[#8E8E93] font-black uppercase tracking-widest mb-2 block">Total Volume</span>
                    <span className="font-black text-2xl tabular-nums">{workout.stats?.volume || '0 kg'}</span>
                  </div>
                  <div className="bg-black/60 p-6 rounded-[32px] border border-white/5">
                    <span className="text-[10px] text-[#8E8E93] font-black uppercase tracking-widest mb-2 block">Duration</span>
                    <span className="font-black text-2xl tabular-nums">{workout.stats?.time || '0m'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#1C1C1E] border border-[#2C2C2E] border-dashed border-2 p-16 rounded-[40px] flex flex-col items-center justify-center text-center h-[300px]">
            <div className="w-20 h-20 bg-black rounded-3xl flex items-center justify-center mb-6 shadow-2xl border border-white/5">
              <Dumbbell className="text-white/20" size={32} />
            </div>
            <p className="text-[#8E8E93] font-bold text-lg mb-8">No activity recorded for this day.</p>
            {isSameDay(selectedDate, startOfToday()) && (
               <button 
                 onClick={() => setActiveTab('workout')}
                 className="flex items-center gap-3 bg-white text-black px-10 py-5 rounded-[24px] font-black shadow-xl hover:scale-105 active:scale-95 transition-all"
               >
                 <Plus size={24} strokeWidth={3} />
                 Start Training
               </button>
            )}
          </div>
        )}
      </section>

      {selectedWorkoutRecap && (
        <WorkoutRecap 
          workout={{
            name: selectedWorkoutRecap.title,
            duration: selectedWorkoutRecap.stats?.time || '0m',
            volume: selectedWorkoutRecap.stats?.volume || '0 kg',
            prs: selectedWorkoutRecap.stats?.prs || 0,
            exercises: selectedWorkoutRecap.exercises || [],
            muscleStats: selectedWorkoutRecap.muscleStats || {}
          }} 
          onClose={() => setSelectedWorkoutRecap(null)} 
        />
      )}
    </div>
  );
}
