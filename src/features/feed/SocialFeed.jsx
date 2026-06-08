import React, { useState, useEffect } from 'react';
import { MoreHorizontal, Heart, MessageCircle, Award, UserPlus, Search, Users, MessageSquare, Copy, Trash2, Send } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import { ConfirmModal, ModalPortal } from '../../components/ui';

const WorkoutPost = ({ post, onCopy, onDelete, currentUsername }) => {
  const [showOptions, setShowOptions] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes || 0);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentsList, setCommentsList] = useState([]); // Simulated comments

  const isOwner = post.user.name === currentUsername;

  const handleLike = () => {
    setLiked(!liked);
    setLikesCount(prev => liked ? prev - 1 : prev + 1);
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    setCommentsList([...commentsList, { user: currentUsername, text: commentText }]);
    setCommentText('');
  };

  return (
    <div className="bg-[#1C1C1E] border border-white/5 rounded-[40px] p-6 mb-6 shadow-xl relative">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-[16px] bg-white/10 flex items-center justify-center font-black text-lg overflow-hidden border border-white/5 shadow-inner">
            {post.user.avatar ? (
              <img src={post.user.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              post.user.name[0]
            )}
          </div>
          <div>
            <h3 className="font-black text-white text-[17px] leading-tight">{post.user.name}</h3>
            <p className="text-[11px] font-bold text-[#8E8E93] mt-0.5">{post.timeAgo}</p>
          </div>
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setShowOptions(!showOptions)}
            className="p-2 text-[#8E8E93] hover:text-white transition-colors rounded-full hover:bg-white/5"
          >
            <MoreHorizontal size={24} />
          </button>
          
          {showOptions && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-[#0A0A0A] border border-[#2C2C2E] rounded-2xl shadow-2xl z-[105] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <button 
                onClick={() => { onCopy(post); setShowOptions(false); }}
                className="w-full flex items-center gap-3 p-4 hover:bg-white/5 text-left transition-colors text-sm font-bold text-white"
              >
                <Copy size={16} /> Copy Routine
              </button>
              {isOwner && (
                <button 
                  onClick={() => { onDelete(post.id); setShowOptions(false); }}
                  className="w-full flex items-center gap-3 p-4 hover:bg-white/5 text-left transition-colors text-sm font-bold text-red-500"
                >
                  <Trash2 size={16} /> Delete Post
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-black mb-4 text-white leading-tight tracking-tight">{post.title}</h2>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
          <StatBox label="Time" value={post.stats.time} />
          <StatBox label="Volume" value={post.stats.volume} />
          <StatBox label="Sets" value={post.stats.sets} />
          {post.stats.prs > 0 && <StatBox label="PRs" value={post.stats.prs} highlight />}
        </div>
      </div>

      <div className="space-y-3 mb-6 bg-black/40 p-4 rounded-[24px] border border-white/5">
        {post.exercises.map((ex, i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[12px] bg-white/5 flex items-center justify-center font-black text-white text-sm shadow-sm">
                {ex.name[0]}
              </div>
              <div>
                <p className="font-bold text-[15px] text-white tracking-tight">{ex.name}</p>
                <p className="text-[10px] text-[#8E8E93] font-bold uppercase tracking-wider mt-0.5">{ex.sets} Sets • Best: {ex.best}</p>
              </div>
            </div>
            {ex.isPR && <Award size={20} className="text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-4">
        <div className="flex gap-6 pt-2">
          <button 
            onClick={handleLike}
            className={`flex items-center gap-2 font-black transition-colors ${liked ? 'text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'text-[#8E8E93] hover:text-white'}`}
          >
            <Heart size={22} fill={liked ? "currentColor" : "none"} /> {likesCount}
          </button>
          <button 
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-2 font-black transition-colors ${showComments ? 'text-white' : 'text-[#8E8E93] hover:text-white'}`}
          >
            <MessageCircle size={22} /> {post.comments + commentsList.length}
          </button>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-6 pt-4 border-t border-white/5 animate-in fade-in duration-300">
          <div className="space-y-4 mb-4 max-h-40 overflow-y-auto pr-2">
            {commentsList.length === 0 ? (
              <p className="text-xs font-bold text-[#8E8E93] text-center italic">No comments yet. Be the first!</p>
            ) : (
              commentsList.map((c, idx) => (
                <div key={idx} className="flex gap-3">
                  <span className="font-black text-white text-sm">{c.user}:</span>
                  <span className="text-[#8E8E93] text-sm font-medium">{c.text}</span>
                </div>
              ))
            )}
          </div>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Add a comment..."
              className="w-full bg-black border border-white/10 rounded-2xl h-12 pl-4 pr-12 text-sm font-medium text-white outline-none focus:border-white/30 transition-colors"
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddComment()}
            />
            <button 
              onClick={handleAddComment}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-white hover:text-blue-400 transition-colors"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const StatBox = ({ label, value, highlight }) => (
  <div className={`flex flex-col min-w-[76px] p-3.5 rounded-2xl border ${highlight ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'bg-transparent border-white/10 text-white'}`}>
    <span className={`text-[9px] font-black uppercase tracking-widest mb-1 ${highlight ? 'text-black/60' : 'text-[#8E8E93]'}`}>{label}</span>
    <span className="font-black text-[15px]">{value}</span>
  </div>
);

export default function SocialFeed() {
  const [activeSubTab, setActiveSubTab] = useState('feed');
  const [posts, setPosts] = useState([]);
  const [currentUsername, setCurrentUsername] = useState('Athlete');

  const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null });

  const [copyNotice, setCopyNotice] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const localName = localStorage.getItem('plateup_username');
      setCurrentUsername(localName || user?.email?.split('@')[0] || 'Athlete');
    };
    fetchUser();

    const localPosts = JSON.parse(localStorage.getItem('plateup_posts') || '[]');
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

  const handleCopyRoutine = (post) => {
    // Simulate copying to routines
    const newRoutine = {
      id: Date.now(),
      name: `${post.title} (Copied from ${post.user.name})`,
      exercises: post.exercises.map(ex => ({ name: ex.name, muscle_group: 'Copied' }))
    };
    const savedRoutines = JSON.parse(localStorage.getItem('plateup_routines') || '[]'); // Ideally save to Supabase here
    setCopyNotice(true);
    setTimeout(() => setCopyNotice(false), 2000);
  };

  const handleDeletePost = (id) => {
    setConfirmModal({ isOpen: true, id });
  };

  const executeDeletePost = () => {
    if (confirmModal.id) {
      const updatedPosts = posts.filter(p => p.id !== confirmModal.id);
      setPosts(updatedPosts);
      localStorage.setItem('plateup_posts', JSON.stringify(updatedPosts));
    }
    setConfirmModal({ isOpen: false, id: null });
  };

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
            <WorkoutPost 
              key={post.id} 
              post={post} 
              currentUsername={currentUsername}
              onCopy={handleCopyRoutine}
              onDelete={handleDeletePost}
            />
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

      {copyNotice && (
        <ModalPortal>
          <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-white text-black px-6 py-3 rounded-full font-black shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-[9999] animate-in slide-in-from-top duration-300">
            Routine copied successfully!
          </div>
        </ModalPortal>
      )}

      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        title="Delete Post?"
        message="This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDanger={true}
        onConfirm={executeDeletePost}
        onCancel={() => setConfirmModal({ isOpen: false, id: null })}
      />
    </div>
  );
}
