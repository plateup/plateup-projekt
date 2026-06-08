import React, { useState } from 'react';
import { Home, Dumbbell, User, BarChart2, Users, Bot } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export default function AppShell({ children, activeTab, setActiveTab }) {
  const tabs = [
    { id: 'feed', icon: Home, label: 'Feed' },
    { id: 'social', icon: Users, label: 'Social' },
    { id: 'workout', icon: Dumbbell, label: 'Workout' },
    { id: 'chat', icon: Bot, label: 'AI Coach' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white/30">
      {/* Main Content Area */}
      <main className="min-h-screen transition-all duration-300 pb-32">
        <div className="max-w-4xl mx-auto px-6 py-12 lg:py-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Unified Bottom Nav (Mobile & Desktop) */}
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[calc(100%-2.5rem)] max-w-lg h-20 bg-[#1C1C1E]/90 backdrop-blur-2xl border border-white/5 rounded-[32px] flex items-center justify-around px-4 shadow-2xl z-50">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center gap-1.5 transition-all ${
                isActive ? 'scale-110 text-white' : 'text-[#8E8E93] hover:text-white/70'
              }`}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
