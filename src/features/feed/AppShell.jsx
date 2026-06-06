import React, { useState } from 'react';
import { Home, Dumbbell, User } from 'lucide-react';

export default function AppShell({ children, activeTab, setActiveTab }) {
  const tabs = [
    { id: 'feed', icon: Home, label: 'Feed' },
    { id: 'workout', icon: Dumbbell, label: 'Workout' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="min-h-screen bg-[#F2F2F7] dark:bg-[#000000] text-black dark:text-white pb-24 transition-colors duration-500">
      <main className="w-full max-w-md md:max-w-2xl lg:max-w-4xl mx-auto px-4 md:px-8 pt-8 md:pt-12">
        {children}
      </main>

      {/* Apple Style Bottom Nav - Responsive Width */}
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md md:max-w-lg lg:max-w-xl h-20 bg-white/80 dark:bg-black/80 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-[40px] flex items-center justify-around px-8 shadow-2xl z-50">
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
