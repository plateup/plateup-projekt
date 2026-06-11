/**
 * Plik: App.jsx
 * Autorzy: Langier, Mietła, Jadwiszczok, Bogdański
 * Opis: Główny plik wejściowy (Router). Definiuje ścieżki i renderuje odpowiednie widoki na podstawie stanu autoryzacji.
 * Technologia: React / JSX / Tailwind CSS
 */

import React, { useState, useEffect } from 'react';
import { supabase } from './services/supabaseClient';
import AppShell from './features/feed/AppShell';
import Dashboard from './features/feed/Dashboard';
import SocialFeed from './features/feed/SocialFeed';
import Stats from './features/stats/Stats';
import Profile from './features/profile/Profile';
import Landing from './features/auth/Landing';
import Auth from './features/auth/Auth';
import UsernameSetup from './features/auth/UsernameSetup';
import LiveWorkout from './features/workout/LiveWorkout';
import AIChat from './features/ai/AIChat';

function App() {
  const [session, setSession] = useState(null);
  const [view, setView] = useState('landing'); // landing, auth, onboarding, app
  const [activeTab, setActiveTab] = useState('feed');
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSessionData(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSessionData(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSessionData = async (session) => {
    const savedUserId = localStorage.getItem('plateup_last_user_id');

    const archiveCurrentData = (userIdToArchive) => {
      if (!userIdToArchive) return;
      const oldUserData = {};
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('plateup_') && !key.startsWith('plateup_archive_') && key !== 'plateup_last_user_id') {
          oldUserData[key] = localStorage.getItem(key);
          keysToRemove.push(key);
        }
      }
      if (Object.keys(oldUserData).length > 0) {
        localStorage.setItem(`plateup_archive_${userIdToArchive}`, JSON.stringify(oldUserData));
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
    };

    if (session && session.user) {
      const currentUserId = session.user.id;

      if (savedUserId && savedUserId !== currentUserId) {
        // Different user logged in - archive old user's data and clear active slots
        archiveCurrentData(savedUserId);
      }

      // If switching to a new user (or just loaded), restore their archived data if any
      if (savedUserId !== currentUserId) {
        const archivedData = localStorage.getItem(`plateup_archive_${currentUserId}`);
        if (archivedData) {
          try {
            const parsed = JSON.parse(archivedData);
            Object.keys(parsed).forEach(k => {
              localStorage.setItem(k, parsed[k]);
            });
          } catch(e) { console.error("Error restoring archive:", e); }
        }
      }

      localStorage.setItem('plateup_last_user_id', currentUserId);
      setSession(session);

      // Check if username is setup (for Google OAuth flow)
      const { data: profile } = await supabase.from('profiles').select('username').eq('id', currentUserId).maybeSingle();
      
      if (!profile || !profile.username) {
        setView('onboarding');
      } else {
        localStorage.setItem('plateup_username', profile.username);
        setView('app');
      }
      setIsInitializing(false);

    } else {
      // Logging out
      if (savedUserId) {
        archiveCurrentData(savedUserId);
        localStorage.removeItem('plateup_last_user_id');
      }
      setSession(null);
      setView('landing');
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    let title = 'PlateUp';
    if (view === 'landing') title = 'PlateUp - Start';
    else if (view === 'auth') title = 'PlateUp - Login';
    else if (view === 'app') {
      const tabNames = {
        feed: 'Dashboard',
        social: 'Social',
        workout: 'Workout',
        chat: 'AI Coach',
        profile: 'Profile'
      };
      title = `PlateUp - ${tabNames[activeTab] || 'App'}`;
    }
    document.title = title;
  }, [activeTab, view]);

  if (isInitializing) return <div className="min-h-screen bg-black flex items-center justify-center"><div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" /></div>;
  if (view === 'landing') return <Landing onGetStarted={() => setView('auth')} />;
  if (view === 'auth' && !session) return <Auth onBack={() => setView('landing')} />;
  if (view === 'onboarding') return <UsernameSetup onComplete={() => setView('app')} />;

  return (
    <AppShell 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
      persistentComponent={<LiveWorkout isVisible={activeTab === 'workout'} onRestore={() => setActiveTab('workout')} />}
    >
      {activeTab === 'feed' && <Dashboard setActiveTab={setActiveTab} />}
      {activeTab === 'social' && <SocialFeed />}
      {activeTab === 'chat' && <AIChat onStartRoutine={() => setActiveTab('workout')} />}
      {activeTab === 'profile' && <Profile />}
    </AppShell>
  );
}

export default App;
