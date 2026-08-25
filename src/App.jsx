/**
 * Plik: App.jsx
 * Autor: landzi
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

function App() {
  // Stan przechowujący zmienną: session
  const [session, setSession] = useState(null);
  // Stan przechowujący zmienną: view
  const [view, setView] = useState('landing'); // landing, auth, onboarding, app
  // Stan przechowujący zmienną: activeTab
  const [activeTab, setActiveTab] = useState('feed');
  // Stan przechowujący zmienną: isInitializing
  const [isInitializing, setIsInitializing] = useState(true);

  // Efekt uboczny (useEffect) uruchamiany po wyrenderowaniu komponentu lub zmianie zależności

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSessionData(session);
      if (session) {
        syncOfflineQueue(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSessionData(session);
      if (session) {
        syncOfflineQueue(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function syncOfflineQueue(userId) {
    const offlineQueue = JSON.parse(localStorage.getItem('plateup_offline_posts') || '[]');
    if (offlineQueue.length === 0) return;
    
    console.log("Syncing offline posts...", offlineQueue.length);
    const remainingQueue = [];
    
    for (const post of offlineQueue) {
      post.user_id = userId;
      const { error } = await supabase.from('posts').insert([post]);
      if (error) {
        console.warn("Failed to sync post, keeping in queue", error);
        remainingQueue.push(post);
      }
    }
    
    localStorage.setItem('plateup_offline_posts', JSON.stringify(remainingQueue));
  }

  // Asynchroniczna funkcja: handleSessionData - odpowiada za operacje w tle (np. fetchowanie bazy)

  const handleSessionData = async (session) => {
    const savedUserId = localStorage.getItem('plateup_last_user_id');

    // Funkcja pomocnicza: archiveCurrentData

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
      // Odpytanie bazy danych Supabase w poszukiwaniu odpowiednich rekordów
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

  // Efekt uboczny (useEffect) uruchamiany po wyrenderowaniu komponentu lub zmianie zależności

  useEffect(() => {
    let title = 'PlateUp';
    if (view === 'landing') title = 'PlateUp - Start';
    else if (view === 'auth') title = 'PlateUp - Login';
    else if (view === 'app') {
      const tabNames = {
        feed: 'Dashboard',
        social: 'Social',
        workout: 'Workout',
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

  // Zwraca interfejs użytkownika (JSX) dla tego komponentu

  return (
    <AppShell 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
      persistentComponent={<LiveWorkout isVisible={activeTab === 'workout'} onRestore={() => setActiveTab('workout')} onFinish={() => setActiveTab('feed')} />}
    >
      {activeTab === 'feed' && <Dashboard setActiveTab={setActiveTab} />}
      {activeTab === 'social' && <SocialFeed />}
      {activeTab === 'profile' && <Profile />}
    </AppShell>
  );
}

export default App;
