import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../services/supabaseClient';
import { Dumbbell, Plus, MoreHorizontal } from 'lucide-react';
import { format, addDays, subDays, isSameDay, startOfToday } from 'date-fns';

export default function Dashboard() {
  const [username, setUsername] = useState('Athlete');
  const [selectedDate, setSelectedDate] = useState(startOfToday());
  const scrollRef = useRef(null);

  // Generate an array of dates (e.g., 14 days before today and 7 days after)
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

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .single();
        
        if (data && data.username) {
          setUsername(data.username);
        }
      }
    };
    fetchProfile();
  }, []);

  // Center the scroll to today on mount
  useEffect(() => {
    if (scrollRef.current) {
      const todayElement = scrollRef.current.querySelector('[data-istoday="true"]');
      if (todayElement) {
        todayElement.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, []);

  // Mock data for workouts based on dates
  const getWorkoutsForDate = (date) => {
    // For demonstration, let's just return a mock workout if the day is even
    if (date.getDate() % 2 === 0 && date <= startOfToday()) {
      return [
        {
          id: 1,
          title: 'Upper Body Power',
          time: '1h 15m',
          volume: '8,400 kg',
          exercises: 6
        }
      ];
    }
    return [];
  };

  const dayWorkouts = getWorkoutsForDate(selectedDate);

  return (
    <div className="animate-in fade-in duration-700">
      {/* Header */}
      <header className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-2">
            Hey, {username}
          </h1>
          <p className="text-[#8E8E93] font-bold">Ready to crush your goals today?</p>
        </div>
        <div className="w-14 h-14 rounded-2xl bg-[#1C1C1E] flex items-center justify-center border border-[#2C2C2E] shadow-xl">
           <span className="text-white font-black text-xl">{username.charAt(0).toUpperCase()}</span>
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
                <span className={`text-[10px] font-black uppercase tracking-widest mb-2 ${isSelected ? 'text-black/40' : 'text-[#8E8E93]'}`}>
                  {format(date, 'EEE')}
                </span>
                <span className="text-2xl font-black tabular-nums">
                  {format(date, 'd')}
                </span>
                {hasWorkout && (
                  <div className={`absolute bottom-3 w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-black' : 'bg-white'}`} />
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Selected Day Workouts */}
      <section>
        <div className="flex items-center justify-between mb-8 px-1">
          <h2 className="text-2xl font-black tracking-tight">
            {isSameDay(selectedDate, startOfToday()) ? 'Today\'s Session' : format(selectedDate, 'MMMM d, yyyy')}
          </h2>
        </div>
        
        {dayWorkouts.length > 0 ? (
          <div className="space-y-6">
            {dayWorkouts.map((workout) => (
              <div key={workout.id} className="bg-[#1C1C1E] border border-[#2C2C2E] p-8 rounded-[48px] shadow-sm hover:border-[#3C3C3E] transition-all group w-full">
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-[24px] bg-white/5 flex items-center justify-center text-white border border-white/5">
                      <Dumbbell size={32} />
                    </div>
                    <div>
                      <h3 className="font-black text-2xl tracking-tight mb-1">{workout.title}</h3>
                      <p className="text-sm text-[#8E8E93] font-bold">{workout.exercises} Exercises • {workout.time}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button className="p-3 bg-black rounded-2xl text-[#8E8E93] hover:text-white transition-colors border border-white/5">
                      <Plus size={20} className="rotate-45" /> {/* Delete Icon Mockup */}
                    </button>
                    <button className="p-3 bg-black rounded-2xl text-[#8E8E93] hover:text-white transition-colors border border-white/5">
                      <MoreHorizontal size={20} />
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/60 p-6 rounded-[32px] border border-white/5">
                    <span className="text-[10px] text-[#8E8E93] font-black uppercase tracking-widest mb-2 block">Total Volume</span>
                    <span className="font-black text-2xl tabular-nums">{workout.volume}</span>
                  </div>
                  <div className="bg-black/60 p-6 rounded-[32px] border border-white/5">
                    <span className="text-[10px] text-[#8E8E93] font-black uppercase tracking-widest mb-2 block">Duration</span>
                    <span className="font-black text-2xl tabular-nums">{workout.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#1C1C1E] border border-[#2C2C2E] border-dashed border-2 p-16 rounded-[40px] flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-black rounded-3xl flex items-center justify-center mb-6 shadow-2xl">
              <Dumbbell className="text-[#3C3C3E]" size={32} />
            </div>
            <p className="text-[#8E8E93] font-bold text-lg mb-8">No activity recorded for this day.</p>
            {isSameDay(selectedDate, startOfToday()) && (
               <button className="flex items-center gap-3 bg-white text-black px-10 py-5 rounded-[24px] font-black shadow-xl hover:scale-105 active:scale-95 transition-all">
                 <Plus size={24} strokeWidth={3} />
                 Start Training
               </button>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
