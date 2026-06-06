import React, { useState } from 'react';
import { Home, Dumbbell, User } from 'lucide-react';

export default function AppShell({ children, activeTab, setActiveTab }) {
  const tabs = [
    { id: 'feed', icon: Home, label: 'Feed' },
    { id: 'workout', icon: Dumbbell, label: 'Workout' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="min-h-screen bg-[#F2F2F7] dark:bg-[#000000] text-black dark:text-white pb-24">
      <main className="max-w-md mx-auto px-4 pt-8">
        {children}
      </main>

      {/* Apple Style Bottom Nav */}
      <nav className="fixed bottom-6 left-4 right-4 max-w-md mx-auto h-20 bg-white/80 dark:bg-black/80 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-[32px] flex items-center justify-around px-6 shadow-2xl">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center gap-1 transition-all ${
                isActive ? 'scale-110 text-black dark:text-white' : 'text-[#8E8E93] opacity-50'
              }`}
            >
              <Icon size={28} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
