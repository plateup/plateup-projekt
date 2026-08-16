import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../services/supabaseClient';
import { Dumbbell, Plus, MoreHorizontal, User, Trash2, LogOut } from 'lucide-react';
import { format, addDays, subDays, isSameDay, startOfToday, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, getDay } from 'date-fns';
import WorkoutRecap from '../workout/WorkoutRecap';
import { ConfirmModal } from '../../components/ui';

export default function Dashboard({ setActiveTab }) {
  // Stan przechowujący zmienną: username
  const [username, setUsername] = useState(() => localStorage.getItem('plateup_username') || 'Athlete');
  // Stan przechowujący zmienną: avatarUrl
  const [avatarUrl, setAvatarUrl] = useState(() => localStorage.getItem('plateup_avatar') || null);
  // Stan przechowujący zmienną: selectedDate
  const [selectedDate, setSelectedDate] = useState(startOfToday());
  // Stan przechowujący zmienną: showProfileMenu
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  // Stan przechowujący zmienną: localWorkouts
  const [localWorkouts, setLocalWorkouts] = useState([]);
  // Stan przechowujący zmienną: selectedWorkoutRecap
  const [selectedWorkoutRecap, setSelectedWorkoutRecap] = useState(null);
  // Stan przechowujący zmienną: openMenuId
  const [openMenuId, setOpenMenuId] = useState(null);
  // Stan przechowujący zmienną: confirmModal
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null });

  // Funkcja pomocnicza: generateDates

  const generateDates = () => {
    const today = startOfToday();
    // Generate dates for current month view
    const start = startOfMonth(today);
    const end = endOfMonth(today);
    const daysInMonth = eachDayOfInterval({ start, end });
    
    // Add padding days for the first week (if month doesn't start on Monday)
    // getDay() returns 0 for Sunday, 1 for Monday in some locales, but standard JS is 0=Sun, 1=Mon...6=Sat.
    // We want Monday=0, Sunday=6
    const firstDayIndex = (getDay(start) + 6) % 7; 
    const paddedStart = Array.from({ length: firstDayIndex }).map((_, i) => subDays(start, firstDayIndex - i));
    
    // Add padding days for the last week
    const lastDayIndex = (getDay(end) + 6) % 7;
    const paddingEndLength = 6 - lastDayIndex;
    const paddedEnd = Array.from({ length: paddingEndLength }).map((_, i) => addDays(end, i + 1));
    
    return [...paddedStart, ...daysInMonth, ...paddedEnd];
  };

  const dates = generateDates();

  // Funkcja pomocnicza: loadProfileFromStorage

  const loadProfileFromStorage = () => {
    setUsername(localStorage.getItem('plateup_username') || 'Athlete');
    setAvatarUrl(localStorage.getItem('plateup_avatar') || null);
  };

  // Efekt uboczny (useEffect) uruchamiany po wyrenderowaniu komponentu lub zmianie zależności

  useEffect(() => {
    // Asynchroniczna funkcja: fetchProfileAndWorkouts - odpowiada za operacje w tle (np. fetchowanie bazy)
    const fetchProfileAndWorkouts = async () => {
      // Odpytanie bazy danych Supabase w poszukiwaniu odpowiednich rekordów
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // 1. Fetch Profile
        // Odpytanie bazy danych Supabase w poszukiwaniu odpowiednich rekordów
        const { data: profileData } = await supabase
          .from('profiles')
          .select('username, display_name, avatar_url')
          .eq('id', user.id)
          .maybeSingle();
          
        if (profileData) {
          const fetchedName = profileData.username || profileData.display_name || 'Athlete';
          setUsername(fetchedName);
          localStorage.setItem('plateup_username', fetchedName);
          
          if (profileData.avatar_url) {
             setAvatarUrl(profileData.avatar_url);
             localStorage.setItem('plateup_avatar', profileData.avatar_url);
          }
        }
        
        // 2. Fetch User's Workouts (Posts)
        // Odpytanie bazy danych Supabase w poszukiwaniu odpowiednich rekordów
        const { data: postsData } = await supabase
          .from('posts')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (postsData && postsData.length > 0) {
          const mappedWorkouts = postsData.map(p => {
            const workoutData = p.workout_data || {};
            return {
              ...workoutData,
              id: p.id,
              db_id: p.id
            };
          });
          setLocalWorkouts(mappedWorkouts);
          // Also sync to local storage for offline support
          localStorage.setItem('plateup_posts', JSON.stringify(mappedWorkouts));
        } else {
          // If no posts in DB, maybe they are only local? Load local.
          const stored = JSON.parse(localStorage.getItem('plateup_posts') || '[]');
          setLocalWorkouts(stored);
        }
      } else {
        const stored = JSON.parse(localStorage.getItem('plateup_posts') || '[]');
        setLocalWorkouts(stored);
      }
    };
    fetchProfileAndWorkouts();
  }, []);

  // Funkcja pomocnicza: getWorkoutsForDate

  const getWorkoutsForDate = (date) => {
    return localWorkouts.filter(w => {
      const wDate = new Date(w.created_at);
      return isSameDay(wDate, date);
    });
  };

  const dayWorkouts = getWorkoutsForDate(selectedDate);

  // Funkcja pomocnicza: handleDeleteClick

  const handleDeleteClick = (id, e) => {
    e.stopPropagation();
    setOpenMenuId(null);
    setConfirmModal({ isOpen: true, id });
  };

  // Asynchroniczna funkcja: executeDeleteWorkout - odpowiada za operacje w tle (np. fetchowanie bazy)

  const executeDeleteWorkout = async () => {
    if (confirmModal.id) {
      const updatedWorkouts = localWorkouts.filter(w => w.id !== confirmModal.id);
      setLocalWorkouts(updatedWorkouts);
      localStorage.setItem('plateup_posts', JSON.stringify(updatedWorkouts));
      
      // Also delete from Supabase if it exists there
      try {
        await supabase.from('posts').delete().eq('id', confirmModal.id);
      } catch (e) {
        console.error('Failed to delete from DB:', e);
      }
    }
    setConfirmModal({ isOpen: false, id: null });
  };

  // Asynchroniczna funkcja: handleLogOut - odpowiada za operacje w tle (np. fetchowanie bazy)

  const handleLogOut = async () => {
    // Archiving is now handled by App.jsx on auth state change
    await supabase.auth.signOut();
    window.location.reload(); 
  };

  // Close menus if clicked outside
  // Efekt uboczny (useEffect) uruchamiany po wyrenderowaniu komponentu lub zmianie zależności
  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    document.addEventListener('click', handleClickOutside);
    // Zwraca interfejs użytkownika (JSX) dla tego komponentu
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Zwraca interfejs użytkownika (JSX) dla tego komponentu

  return (
    <div className="animate-in fade-in duration-700">
      {/* Header */}
      <header className="flex items-center justify-between mb-12 relative">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">
            Hey, {username}
          </h1>
          <p className="text-[#8E8E93] font-medium">Ready to crush your goals today?</p>
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

      {/* Monthly Grid Calendar */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6 px-1">
          <h2 className="text-2xl font-bold text-white tracking-tight">{format(startOfToday(), 'MMMM yyyy')}</h2>
        </div>
        <div className="bg-[#1C1C1E] rounded-[32px] p-6 border border-white/5">
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
              <div key={i} className="text-center text-[10px] font-bold text-[#8E8E93] uppercase tracking-wider">{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2 gap-y-3">
            {dates.map((date, index) => {
              const isSelected = isSameDay(date, selectedDate);
              const isToday = isSameDay(date, startOfToday());
              const hasWorkout = getWorkoutsForDate(date).length > 0;
              const isCurrentMonth = isSameMonth(date, startOfToday());
              
              return (
                <button
                  key={index}
                  onClick={() => setSelectedDate(date)}
                  className={`relative flex flex-col items-center justify-center w-full aspect-square rounded-full transition-all active:scale-[0.90] ${
                    isSelected 
                      ? 'bg-white text-black shadow-lg shadow-white/20 scale-105' 
                      : isToday
                      ? 'bg-[#2C2C2E] text-white border border-white/20'
                      : isCurrentMonth
                      ? 'text-white/80 hover:bg-white/5'
                      : 'text-white/20'
                  }`}
                >
                  <span className={`text-sm font-bold ${isSelected ? 'text-black' : ''}`}>
                    {format(date, 'd')}
                  </span>
                  {hasWorkout && (
                    <div className={`absolute bottom-1.5 w-1 h-1 rounded-full ${isSelected ? 'bg-black' : 'bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.8)]'}`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Selected Day Workouts */}
      <section className="min-h-[400px]">
        <div className="flex items-center justify-between mb-6 px-1">
          <h2 className="text-2xl font-bold tracking-tight">
            {isSameDay(selectedDate, startOfToday()) ? "Today's Session" : format(selectedDate, 'MMMM d, yyyy')}
          </h2>
        </div>
        
        {dayWorkouts.length > 0 ? (
          <div className="space-y-6">
            {dayWorkouts.map((workout, idx) => (
              <div 
                key={workout.id} 
                onClick={() => setSelectedWorkoutRecap(workout)}
                className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both bg-gradient-to-br from-[#1C1C1E] to-[#121212] border border-white/10 p-6 rounded-3xl shadow-2xl active:scale-[0.98] transition-all duration-300 group w-full cursor-pointer relative overflow-hidden flex flex-col gap-4 ease-out-ios"
                style={{ animationDelay: `${idx * 60}ms` }}
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
                      <h3 className="font-bold text-xl tracking-tight text-white mb-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-white/60 transition-all">{workout.title}</h3>
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
                  // Zwraca interfejs użytkownika (JSX) dla tego komponentu
                  return (
                    <div className="bg-black/40 backdrop-blur-md rounded-[24px] border border-white/5 p-4 relative z-10 mt-2">
                      <div className={`relative ${hasHiddenContent ? 'max-h-[160px] overflow-hidden' : ''}`}>
                        <div className="space-y-4">
                          {workout.exercises && workout.exercises.length > 0 ? (
                            workout.exercises.slice(0, 3).map((ex, idx) => (
                              <div key={idx} className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-semibold text-white">{ex.name}</span>
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
          <div className="flex flex-col items-center justify-center text-center py-16 px-4">
            <p className="text-[#8E8E93] font-medium text-base mb-6">No activity recorded for this day.</p>
            {isSameDay(selectedDate, startOfToday()) && (
               <button 
                 onClick={() => setActiveTab('workout')}
                 className="flex items-center gap-2 bg-indigo-500 text-white px-8 py-3.5 rounded-full font-bold shadow-lg shadow-indigo-500/20 hover:bg-indigo-600 active:scale-95 transition-all"
               >
                 <Plus size={20} strokeWidth={3} />
                 Start an Empty Workout
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
