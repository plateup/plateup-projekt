/**
 * Plik: Dashboard.jsx
 * Autor: landzi
 * Opis: Panel główny użytkownika. Wyświetla historię treningów pobraną z bazy Supabase oraz kalendarz aktywności.
 * Technologia: React / JSX / Tailwind CSS
 */

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../services/supabaseClient';
import { Dumbbell, Plus, MoreHorizontal, User, Trash2, LogOut, Lock } from 'lucide-react';
import { format, addDays, subDays, isSameDay, startOfToday } from 'date-fns';
import WorkoutRecap from '../workout/WorkoutRecap';
import WorkoutPost from '../../components/WorkoutPost';
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
  const scrollRef = useRef(null);

  // Funkcja pomocnicza: generateDates

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

  // Funkcja pomocnicza: loadProfileFromStorage

  const loadProfileFromStorage = () => {
    setUsername(localStorage.getItem('plateup_username') || 'Athlete');
    setAvatarUrl(localStorage.getItem('plateup_avatar') || null);
  };

  useEffect(() => {
    const handleProfileUpdate = () => {
      loadProfileFromStorage();
    };
    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, []);

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
        
        // 2. Fetch User's & Friends' Workouts (Posts)
        let friendIds = [user.id];
        
        // Fetch accepted friends
        const { data: sentReqs } = await supabase.from('friend_requests').select('receiver_id').eq('sender_id', user.id).eq('status', 'accepted');
        const { data: incReqs } = await supabase.from('friend_requests').select('sender_id').eq('receiver_id', user.id).eq('status', 'accepted');
        
        if (sentReqs) sentReqs.forEach(r => friendIds.push(r.receiver_id));
        if (incReqs) incReqs.forEach(r => friendIds.push(r.sender_id));

        const { data: postsData } = await supabase
          .from('posts')
          .select('*, profiles!user_id(username, avatar_url)')
          .in('user_id', friendIds)
          .order('created_at', { ascending: false });
          
        if (postsData && postsData.length > 0) {
          const mappedWorkouts = postsData.map(p => {
            const workoutData = p.workout_data || {};
            // Sync dynamic profile data!
            if (p.profiles) {
              if(!workoutData.user) workoutData.user = {};
              workoutData.user.name = p.profiles.username;
              workoutData.user.avatar = p.profiles.avatar_url;
            }
            return {
              ...workoutData,
              id: p.id,
              db_id: p.id,
              user_id: p.user_id
            };
          }).filter(p => p.visibility !== 'private' || p.user_id === user.id);
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

  // Efekt uboczny (useEffect) uruchamiany po wyrenderowaniu komponentu lub zmianie zależności

  useEffect(() => {
    if (scrollRef.current) {
      const todayElement = scrollRef.current.querySelector('[data-istoday="true"]');
      if (todayElement) {
        todayElement.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
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
        const { error } = await supabase.from('posts').delete().eq('id', confirmModal.id);
        if (error) console.error('Failed to delete from DB:', error);
      } catch (e) {
        console.error('Exception during delete:', e);
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
            
            // Zwraca interfejs użytkownika (JSX) dla tego komponentu
            
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
              <WorkoutPost 
                key={workout.id} 
                post={workout} 
                currentUsername={username}
                currentUserAvatar={avatarUrl}
                onCopy={(post) => {
                  // TODO: Implement copy routine in Dashboard or pass down
                }}
                onDelete={(id) => {
                  setConfirmModal({ isOpen: true, id });
                }}
                onViewSummary={(post) => setSelectedWorkoutRecap(post)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-[#1C1C1E] border border-[#2C2C2E] border-dashed border-2 p-16 rounded-[40px] flex flex-col items-center justify-center text-center h-[300px]">
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
