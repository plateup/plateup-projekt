import React, { useState } from 'react';
import AppShell from './features/feed/AppShell';
import SocialFeed from './features/feed/SocialFeed';

function App() {
  const [activeTab, setActiveTab] = useState('feed');

  return (
    <AppShell activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'feed' && <SocialFeed />}
      {activeTab === 'workout' && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <h2 className="text-3xl font-black mb-4">Workout Hub</h2>
          <p className="text-[#8E8E93]">Sekcja Wojtowa - w przygotowaniu</p>
        </div>
      )}
      {activeTab === 'profile' && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <h2 className="text-3xl font-black mb-4">Twój Profil</h2>
          <p className="text-[#8E8E93]">Sekcja Olgierda - w przygotowaniu</p>
        </div>
      )}
    </AppShell>
  );
}

export default App;
