/**
 * Plik: Navigation.jsx
 * Autorzy: Langier, Mietła, Jadwiszczok, Bogdański
 * Opis: Moduł odpowiedzialny za logikę powiązaną z workout/Navigation.jsx.
 * Technologia: React / JSX / Tailwind CSS
 */

import React from 'react';

export default function Navigation({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'feed', label: 'Feed' },
    { id: 'workout', label: 'Workout' },
    { id: 'profile', label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-neutral-950 border border-neutral-900 rounded-full py-3 px-6 flex justify-around items-center z-50 shadow-2xl">
      {navItems.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className="flex flex-col items-center justify-center py-1 px-4 transition-all"
          >
            <span className={`text-xs font-bold tracking-wide transition-colors ${
              isActive ? 'text-white font-black' : 'text-neutral-600 hover:text-neutral-400'
            }`}>
              {item.label}
            </span>
            {isActive && (
              <span className="absolute bottom-1 w-1 h-1 bg-white rounded-full" />
            )}
          </button>
        );
      })}
    </div>
  );
}