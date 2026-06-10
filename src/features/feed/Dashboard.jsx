import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../services/supabaseClient';
import { Dumbbell, Plus, MoreHorizontal, User, Trash2, LogOut } from 'lucide-react';
import { format, addDays, subDays, isSameDay, startOfToday } from 'date-fns';
import WorkoutRecap from '../workout/WorkoutRecap';
import { ConfirmModal } from '../../components/ui';

export default function Dashboard({ setActiveTab }) {
  const [username, setUsername] = useState(() => localStorage.getItem('plateup_username') || 'Athlete');
  const [avatarUrl, setAvatarUrl] = useState(() => localStorage.getItem('plateup_avatar') || null);
  const [selectedDate, setSelectedDate] = useState(startOfToday());
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [localWorkouts, setLocalWorkouts] = useState([]);
  const [selectedWorkoutRecap, setSelectedWorkoutRecap] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null });
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
          .maybeSingle();
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

  const handleDeleteClick = (id, e) => {
    e.stopPropagation();
    setOpenMenuId(null);
    setConfirmModal({ isOpen: true, id });
  };

  const executeDeleteWorkout = () => {
    if (confirmModal.id) {
      const updatedWorkouts = localWorkouts.filter(w => w.id !== confirmModal.id);
      setLocalWorkouts(updatedWorkouts);
      localStorage.setItem('plateup_posts', JSON.stringify(updatedWorkouts));
    }
    setConfirmModal({ isOpen: false, id: null });
  };

  const handleLogOut = async () => {
    // Archiving is now handled by App.jsx on auth state change
    await supabase.auth.signOut();
    window.location.reload(); 
  };

  // Close menus if clicked outside
  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

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
                className="w-full flex items-center justify-between p-4 hover:bg-white/5 text-left transition-colors border-b border-white/5"
              >
                <span className="text-sm font-bold text-white">My Profile</span>
              </button>
              <button 
                onClick={handleLogOut}
                className="w-full flex items-center gap-2 p-4 hover:bg-white/5 text-left transition-colors text-red-500"
              >
                <LogOut size={16} />
                <span className="text-sm font-bold">Log Out</span>
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
                className="bg-gradient-to-br from-[#1C1C1E] to-[#121212] border border-white/10 p-6 rounded-[36px] shadow-2xl hover:scale-[1.02] hover:border-white/20 transition-all duration-300 group w-full cursor-pointer relative overflow-hidden flex flex-col gap-4"
              >
                {/* Decorative background glow */}
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors pointer-events-none" />

                {/* Header Section */}
                <div className="flex items-start justify-between relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-[18px] bg-white text-black flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform shrink-0">
                      <Dumbbell size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h3 className="font-black text-xl tracking-tight text-white mb-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-white/60 transition-all">{workout.title}</h3>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#8E8E93] font-bold">
                        <span className="bg-white/10 px-2 py-1 rounded-lg text-white/90">{workout.stats?.volume || '0 kg'}</span>
                        <span className="bg-white/10 px-2 py-1 rounded-lg text-white/90">{workout.stats?.time || workout.timeAgo}</span>
                        <span>•</span>
                        <span>{workout.stats?.sets || workout.exercises?.length || 0} Sets</span>
                      </div>
                    </div>
                  </div>
                  <div className="relative">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === workout.id ? null : workout.id);
                      }}
                      className="p-2 -mr-2 -mt-2 text-white/20 hover:text-white hover:bg-white/10 rounded-full transition-all shrink-0 relative z-20"
                    >
                      <MoreHorizontal size={24} />
                    </button>

                    {openMenuId === workout.id && (
                      <div 
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-0 top-full mt-1 w-40 bg-[#0A0A0A] border border-[#2C2C2E] rounded-2xl shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
                      >
                        <button 
                          onClick={(e) => handleDeleteClick(workout.id, e)}
                          className="w-full flex items-center gap-3 p-3 hover:bg-white/5 text-left transition-colors text-sm font-bold text-red-500"
                        >
                          <Trash2 size={16} /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Exercise List Preview Section */}
                {(() => {
                  const hasHiddenContent = workout.exercises?.length > 3 || workout.exercises?.slice(0, 3).some(ex => ex.setsList?.length > 3);
                  return (
                    <div className="bg-black/40 backdrop-blur-md rounded-[24px] border border-white/5 p-4 relative z-10 mt-2">
                      <div className={`relative ${hasHiddenContent ? 'max-h-[160px] overflow-hidden' : ''}`}>
                        <div className="space-y-4">
                          {workout.exercises && workout.exercises.length > 0 ? (
                            workout.exercises.slice(0, 3).map((ex, idx) => (
                              <div key={idx} className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-black text-white">{ex.name}</span>
                                </div>
                                <div className="pl-2 border-l-2 border-white/10 ml-1 space-y-1">
                                  {ex.setsList && ex.setsList.length > 0 ? (
                                    ex.setsList.slice(0, 3).map((set, sIdx) => (
                                      <div key={sIdx} className="flex items-center gap-3 text-xs font-bold text-[#8E8E93]">
                                        <span className="w-4 text-center">S{sIdx + 1}</span>
                                        <div className="flex gap-1 text-white/90">
                                          <span>{set.kg} kg</span>
                                          <span>×</span>
                                          <span>{set.reps}</span>
                                        </div>
                                      </div>
                                    ))
                                  ) : (
                                    <div className="text-xs font-bold text-[#8E8E93]">
                                      {ex.sets} {ex.sets === 1 ? 'Set' : 'Sets'} completed
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-sm font-bold text-[#8E8E93] italic py-2 text-center">No exercises logged.</div>
                          )}
                        </div>
                        
                        {/* Fade overlay for long lists */}
                        {hasHiddenContent && (
                          <div className="absolute bottom-0 left-0 right-0 h-24 backdrop-blur-md bg-gradient-to-t from-[#121212]/90 via-[#121212]/50 to-transparent [mask-image:radial-gradient(ellipse_at_bottom,black_10%,transparent_80%)] pointer-events-none flex items-end justify-center pb-3">
                            <span className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-widest mb-1">
                              Click to see more
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
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
          isHistory={true}
          onClose={() => setSelectedWorkoutRecap(null)} 
        />
      )}

      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        title="Delete Session?"
        message="Are you sure you want to delete this workout session? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDanger={true}
        onConfirm={executeDeleteWorkout}
        onCancel={() => setConfirmModal({ isOpen: false, id: null })}
      />
    </div>
  );
}
