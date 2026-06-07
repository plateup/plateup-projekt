import React, { useState, useEffect } from 'react';
import { MoreHorizontal, Heart, MessageCircle, Award, UserPlus, Search, Users, MessageSquare } from 'lucide-react';

const WorkoutPost = ({ post }) => {
  return (
    <div className="bg-[#1C1C1E] border border-white/5 rounded-[40px] p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-[16px] bg-white/10 flex items-center justify-center font-black text-lg overflow-hidden border border-white/5">
            {post.user.avatar ? (
              <img src={post.user.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              post.user.name[0]
            )}
          </div>
          <div>
            <h3 className="font-bold text-white leading-tight">{post.user.name}</h3>
            <p className="text-xs text-[#8E8E93]">{post.timeAgo}</p>
          </div>
        </div>
        <button className="text-[#8E8E93] hover:text-white"><MoreHorizontal /></button>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-black mb-4 text-white leading-tight">{post.title}</h2>
        <div className="flex gap-3 overflow-x-auto no-scrollbar">
          <StatBox label="Time" value={post.stats.time} />
          <StatBox label="Volume" value={post.stats.volume} />
          <StatBox label="Sets" value={post.stats.sets} />
          {post.stats.prs > 0 && <StatBox label="PRs" value={post.stats.prs} highlight />}
        </div>
      </div>

      <div className="space-y-3 mb-6 bg-black/40 p-4 rounded-[24px]">
        {post.exercises.map((ex, i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center font-bold text-white text-xs">
                {ex.name[0]}
              </div>
              <div>
                <p className="font-bold text-sm text-white">{ex.name}</p>
                <p className="text-[10px] text-[#8E8E93] uppercase tracking-wider">{ex.sets} Sets • Best: {ex.best}</p>
              </div>
            </div>
            {ex.isPR && <Award size={16} className="text-white fill-white" />}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-2">
        <div className="flex gap-6">
          <button className="flex items-center gap-2 font-bold text-white/80 hover:text-white"><Heart size={20} /> {post.likes}</button>
          <button className="flex items-center gap-2 font-bold text-[#8E8E93] hover:text-white"><MessageCircle size={20} /> {post.comments}</button>
        </div>
        <button className="bg-white/10 text-white px-4 py-2 rounded-xl text-xs font-black hover:bg-white/20 transition-colors">Copy</button>
      </div>
    </div>
  );
};

const StatBox = ({ label, value, highlight }) => (
  <div className={`flex flex-col min-w-[70px] p-3 rounded-2xl ${highlight ? 'bg-white text-black' : 'bg-white/5 text-white'}`}>
    <span className={`text-[10px] font-black uppercase tracking-widest mb-1 ${highlight ? 'text-black/60' : 'text-[#8E8E93]'}`}>{label}</span>
    <span className="font-black text-sm">{value}</span>
  </div>
);

export default function SocialFeed() {
  const [activeSubTab, setActiveSubTab] = useState('feed');
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    // Load posts from local storage (including newly published ones)
    const localPosts = JSON.parse(localStorage.getItem('plateup_posts') || '[]');
    
    // Default mock post if empty
    if (localPosts.length === 0) {
      localPosts.push({
        id: 1,
        user: { name: 'Kuba Landzi', avatar: null },
        title: 'Chest & Triceps Destruction',
        timeAgo: '2h ago',
        likes: 24,
        comments: 5,
        stats: { time: '1h 20m', volume: '12,450 kg', sets: 24, prs: 3 },
        exercises: [
          { name: 'Bench Press (Barbell)', sets: 4, best: '100kg x 5', isPR: true },
          { name: 'Incline Dumbbell Press', sets: 4, best: '35kg x 8', isPR: false },
        ]
      });
    }
    setPosts(localPosts);
  }, []);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="mb-8">
        <h1 className="text-4xl font-black tracking-tight mb-6">Social</h1>
        
        {/* Top Sub-Navigation */}
        <div className="flex gap-2 p-1 bg-[#1C1C1E] rounded-2xl border border-white/5">
          <button 
            onClick={() => setActiveSubTab('feed')}
            className={`flex-1 py-3 text-sm font-black rounded-xl transition-all ${activeSubTab === 'feed' ? 'bg-white text-black shadow-lg shadow-white/10' : 'text-[#8E8E93] hover:text-white'}`}
          >
            Feed
          </button>
          <button 
            onClick={() => setActiveSubTab('friends')}
            className={`flex-1 py-3 text-sm font-black rounded-xl transition-all flex items-center justify-center gap-2 ${activeSubTab === 'friends' ? 'bg-white text-black shadow-lg shadow-white/10' : 'text-[#8E8E93] hover:text-white'}`}
          >
            <Users size={16} /> Friends
          </button>
          <button 
            onClick={() => setActiveSubTab('chats')}
            className={`flex-1 py-3 text-sm font-black rounded-xl transition-all flex items-center justify-center gap-2 ${activeSubTab === 'chats' ? 'bg-white text-black shadow-lg shadow-white/10' : 'text-[#8E8E93] hover:text-white'}`}
          >
            <MessageSquare size={16} /> Chats
          </button>
        </div>
      </header>
      
      {activeSubTab === 'feed' && (
        <div className="grid grid-cols-1 gap-4">
          {posts.map(post => (
            <WorkoutPost key={post.id} post={post} />
          ))}
          {posts.length === 0 && (
            <div className="text-center py-20 text-[#8E8E93]">No posts yet. Follow friends to see their activity.</div>
          )}
        </div>
      )}

      {activeSubTab === 'friends' && (
        <div className="animate-in fade-in duration-300">
          <div className="relative mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8E8E93]" size={20} />
            <input 
              type="text"
              placeholder="Find friends by username..."
              className="w-full bg-[#1C1C1E] text-white h-14 rounded-[20px] pl-12 pr-4 font-bold outline-none border border-white/5 focus:border-white/20 transition-all placeholder:text-[#8E8E93]"
            />
          </div>

          <div className="flex flex-col items-center justify-center py-16 text-center border-t border-white/5 mt-8">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
               <Users size={32} className="text-[#8E8E93]" />
            </div>
            <h3 className="font-black text-xl text-white mb-2">Build Your Crew</h3>
            <p className="text-sm text-[#8E8E93] max-w-xs">Search for your friends' usernames above to add them and see their workouts here.</p>
          </div>
        </div>
      )}

      {activeSubTab === 'chats' && (
        <div className="animate-in fade-in duration-300 flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
             <MessageSquare size={32} className="text-[#8E8E93]" />
          </div>
          <h3 className="font-black text-xl text-white mb-2">No Messages Yet</h3>
          <p className="text-sm text-[#8E8E93] max-w-xs">Connect with friends to start chatting about your progress and routines.</p>
        </div>
      )}
    </div>
  );
}
