import React from 'react';
import { Button } from '../../components/ui';
import { Dumbbell, ArrowRight, Activity, Users, BarChart2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Landing({ onGetStarted }) {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col selection:bg-white/30 overflow-hidden relative">
      
      {/* Background visual element */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-white/[0.02] rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Navbar */}
      <nav className="w-full p-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <Dumbbell className="text-black" size={16} strokeWidth={3} />
          </div>
          <span className="font-black tracking-tight text-xl">PlateUp</span>
        </div>
        <button onClick={onGetStarted} className="text-sm font-bold text-white/60 hover:text-white transition-colors">
          Sign In
        </button>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center z-10 mt-12 md:mt-0">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 max-w-3xl mx-auto"
        >
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-6 leading-[1.1]">
            Track workouts. <br className="hidden md:block" />
            <span className="text-white/40">Defy limits.</span>
          </h1>
          <p className="text-lg md:text-xl text-white/60 font-medium max-w-lg mx-auto mb-10">
            The minimalist, distraction-free tracker for serious athletes. Log sets, see muscle heatmaps, and dominate your PRs.
          </p>

          <div className="w-full max-w-sm mx-auto space-y-4">
            <button 
              onClick={onGetStarted}
              className="w-full bg-white text-black py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:bg-neutral-200 active:scale-95 transition-all shadow-xl shadow-white/10"
            >
              Start Training <ArrowRight size={20} strokeWidth={3} />
            </button>
            <p className="text-xs font-bold text-white/40 uppercase tracking-widest">
              Free forever. No ads.
            </p>
          </div>
        </motion.div>

        {/* Feature Highlights */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mx-auto mt-16 md:mt-24 mb-16 text-left"
        >
          <div className="bg-[#0A0A0A] p-8 rounded-[32px] border border-white/5">
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-6">
              <Activity className="text-white" size={24} />
            </div>
            <h3 className="text-xl font-black mb-2">Live Tracking</h3>
            <p className="text-white/50 text-sm font-medium leading-relaxed">Focus on the lift. Automatic rest timers, warm-up sets, and previous data autofill.</p>
          </div>
          
          <div className="bg-[#0A0A0A] p-8 rounded-[32px] border border-white/5">
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-6">
              <BarChart2 className="text-white" size={24} />
            </div>
            <h3 className="text-xl font-black mb-2">Muscle Analytics</h3>
            <p className="text-white/50 text-sm font-medium leading-relaxed">See exactly what you've worked with our interactive anatomical heatmap.</p>
          </div>

          <div className="bg-[#0A0A0A] p-8 rounded-[32px] border border-white/5">
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-6">
              <Users className="text-white" size={24} />
            </div>
            <h3 className="text-xl font-black mb-2">Social Feed</h3>
            <p className="text-white/50 text-sm font-medium leading-relaxed">Share routines, copy friends' workouts, and get inspired by the community.</p>
          </div>
        </motion.div>
      </main>

    </div>
  );
}
