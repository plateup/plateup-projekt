import React, { useState, useEffect } from 'react';
import { supabase } from './services/supabaseClient';
import AppShell from './features/feed/AppShell';
import Dashboard from './features/feed/Dashboard';
import SocialFeed from './features/feed/SocialFeed';
import Stats from './features/stats/Stats';
import Profile from './features/profile/Profile';
import Landing from './features/auth/Landing';
import Auth from './features/auth/Auth';
import LiveWorkout from './features/workout/LiveWorkout';
import AIChat from './features/ai/AIChat';

function App() {
  const [session, setSession] = useState(null);
  const [view, setView] = useState('landing'); // landing, auth, app
  const [activeTab, setActiveTab] = useState('feed');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) setView('app');
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) setView('app');
      else setView('landing');
    });

    return () => subscription.unsubscribe();
  }, []);

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

  if (view === 'landing') return <Landing onGetStarted={() => setView('auth')} />;
  if (view === 'auth' && !session) return <Auth onBack={() => setView('landing')} />;

  return (
    <AppShell activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'feed' && <Dashboard setActiveTab={setActiveTab} />}
      {activeTab === 'social' && <SocialFeed />}
      <LiveWorkout isVisible={activeTab === 'workout'} onRestore={() => setActiveTab('workout')} />
      {activeTab === 'chat' && <AIChat onStartRoutine={() => setActiveTab('workout')} />}
      {activeTab === 'profile' && <Profile />}
    </AppShell>
  );
}

export default App;
