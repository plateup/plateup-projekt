import React, { useState } from 'react';
import { Home, Dumbbell, User, List, Clock, PlusCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export default function AppShell({ children, activeTab, setActiveTab, persistentComponent }) {
  const tabs = [
    { id: 'history', icon: Clock, label: 'History' },
    { id: 'workout', icon: PlusCircle, label: 'Workout' },
    { id: 'exercises', icon: List, label: 'Exercises' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  
  return (
    <div className="min-h-screen bg-black text-white selection:bg-white/30">
      {/* Main Content Area */}
      <main className="min-h-screen transition-all duration-300 pb-40" style={{ paddingTop: 'var(--safe-top)' }}>
        <div className="max-w-4xl mx-auto px-6 py-6 relative">
          {persistentComponent}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
              transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Unified Bottom Nav (Mobile & Desktop) */}
      <nav 
        className="fixed bottom-0 left-0 w-full bg-[#121212]/70 backdrop-blur-3xl saturate-150 border-t border-white/5 flex items-center justify-around px-2 shadow-2xl z-[100]"
        style={{ paddingBottom: 'calc(1rem + var(--safe-bottom))', paddingTop: '0.75rem' }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(10);
                setActiveTab(tab.id);
              }}
              className="flex flex-col items-center justify-center gap-1 w-full h-full relative transition-transform active:scale-95 ease-out-ios"
            >
              <div className={`transition-colors duration-200 ${isActive ? 'text-white' : 'text-[#8E8E93] hover:text-white/70'}`}>
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] font-medium tracking-wide transition-colors duration-200 ${isActive ? 'text-white' : 'text-[#8E8E93]'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
