import React, { useState, useEffect } from 'react';
import { supabase } from './services/supabaseClient';
import AppShell from './features/feed/AppShell';
import SocialFeed from './features/feed/SocialFeed';
import Landing from './features/auth/Landing';
import Auth from './features/auth/Auth';

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

  if (view === 'landing') return <Landing onGetStarted={() => setView('auth')} />;
  if (view === 'auth' && !session) return <Auth onBack={() => setView('landing')} />;

  return (
    <AppShell activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'feed' && <SocialFeed />}
      {activeTab === 'workout' && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <h2 className="text-3xl font-black mb-4 tracking-tight">Workout Hub</h2>
          <p className="text-[#8E8E93] font-medium">Coming soon in your next training.</p>
        </div>
      )}
      {activeTab === 'profile' && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-24 h-24 rounded-full bg-black dark:bg-white mb-6" />
          <h2 className="text-3xl font-black mb-2 tracking-tight">Your Profile</h2>
          <p className="text-[#8E8E93] font-medium mb-8">{session?.user?.email}</p>
          <button 
            onClick={() => supabase.auth.signOut()}
            className="text-red-500 font-bold"
          >
            Sign Out
          </button>
        </div>
      )}
    </AppShell>
  );
}

export default App;
