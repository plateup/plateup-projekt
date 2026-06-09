import React, { useState, useEffect } from 'react';
import { MoreHorizontal, Heart, MessageCircle, Award, UserPlus, Search, Users, MessageSquare, Copy, Trash2, Send, X } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import { ConfirmModal, ModalPortal } from '../../components/ui';
import WorkoutRecap from '../workout/WorkoutRecap';

const CommentsModal = ({ onClose, comments, onAddComment, currentUsername }) => {
  const [text, setText] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  
  // Local state to track likes just for UI mock
  const [likedComments, setLikedComments] = useState({});

  const handleSend = () => {
    if (!text.trim()) return;
    onAddComment(text, replyTo);
    setText('');
    setReplyTo(null);
  };

  const toggleLike = (idx) => {
    setLikedComments(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[600] flex items-end sm:items-center justify-center sm:p-6">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
        
        <div className="relative w-full sm:max-w-md h-[85vh] sm:h-[600px] bg-[#1C1C1E] sm:rounded-[36px] rounded-t-[36px] shadow-2xl border border-white/10 flex flex-col animate-in slide-in-from-bottom duration-300">
          
          <div className="flex items-center justify-center p-6 border-b border-white/5 relative">
            <h3 className="font-black text-lg text-white">Comments</h3>
            <button onClick={onClose} className="absolute right-6 text-[#8E8E93] hover:text-white transition-colors bg-white/5 p-2 rounded-full">
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            {comments.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-[#8E8E93]">
                <MessageSquare size={32} className="mb-3 opacity-50" />
                <p className="text-sm font-bold">No comments yet. Be the first!</p>
              </div>
            ) : (
              comments.map((c, idx) => (
                <div key={idx} className={`flex gap-3 ${c.isReply ? 'ml-10' : ''}`}>
                  <div className="w-8 h-8 rounded-full bg-white/10 shrink-0 flex items-center justify-center text-[10px] font-black overflow-hidden border border-white/5">
                    {c.avatar ? <img src={c.avatar} alt="Avatar" className="w-full h-full object-cover" /> : c.user[0].toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="bg-black/30 px-4 py-3 rounded-2xl border border-white/5 rounded-tl-none">
                      <span className="font-black text-white text-xs mr-2">{c.user}</span>
                      <span className="text-[#8E8E93] text-sm font-medium break-words">
                        {c.replyTarget && <span className="text-blue-400 mr-1">@{c.replyTarget}</span>}
                        {c.text}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1.5 ml-2">
                      <span className="text-[10px] font-bold text-[#8E8E93]">{c.time || 'Just now'}</span>
                      <button 
                        onClick={() => setReplyTo(c.user)}
                        className="text-[10px] font-bold text-[#8E8E93] hover:text-white transition-colors"
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                  <button 
                    onClick={() => toggleLike(idx)} 
                    className={`mt-3 shrink-0 ${likedComments[idx] ? 'text-red-500' : 'text-[#8E8E93] hover:text-white'} transition-colors`}
                  >
                    <Heart size={14} fill={likedComments[idx] ? "currentColor" : "none"} />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="p-4 bg-black/40 border-t border-white/5">
            {replyTo && (
              <div className="flex items-center justify-between bg-white/5 px-3 py-1.5 rounded-lg mb-2">
                <span className="text-xs font-bold text-[#8E8E93]">Replying to <span className="text-white">@{replyTo}</span></span>
                <button onClick={() => setReplyTo(null)} className="text-[#8E8E93] hover:text-white"><X size={12} /></button>
              </div>
            )}
            <div className="relative">
              <input 
                type="text" 
                placeholder="Add a comment..."
                className="w-full bg-black border border-white/10 rounded-2xl h-12 pl-4 pr-12 text-sm font-medium text-white outline-none focus:border-white/30 transition-colors"
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
              />
              <button 
                onClick={handleSend}
                disabled={!text.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-white disabled:opacity-30 disabled:hover:text-white hover:text-blue-400 transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
          </div>

        </div>
      </div>
    </ModalPortal>
  );
};

const WorkoutPost = ({ post, onCopy, onDelete, currentUsername, onViewSummary }) => {
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

  const handleAddComment = (text, replyTarget) => {
    setCommentsList([...commentsList, { 
      user: currentUsername, 
      text: text,
      replyTarget: replyTarget,
      isReply: !!replyTarget,
      time: 'Just now'
    }]);
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

      <div className="mb-6 cursor-pointer group" onClick={() => onViewSummary(post)}>
        <h2 className="text-2xl font-black mb-4 text-white leading-tight tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-white/60 transition-all">{post.title}</h2>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
          <StatBox label="Time" value={post.stats.time} />
          <StatBox label="Volume" value={post.stats.volume} />
          <StatBox label="Sets" value={post.stats.sets} />
          {post.stats.prs > 0 && <StatBox label="PRs" value={post.stats.prs} highlight />}
        </div>
      </div>

      {(() => {
        const hasHiddenContent = post.exercises?.length > 3 || post.exercises?.slice(0, 3).some(ex => ex.setsList?.length > 3);
        return (
          <div className="bg-black/40 p-4 rounded-[24px] border border-white/5 mb-6 cursor-pointer hover:border-white/20 transition-all" onClick={() => onViewSummary(post)}>
            <div className={`relative ${hasHiddenContent ? 'max-h-[160px] overflow-hidden' : ''}`}>
              <div className="space-y-4">
                {post.exercises.slice(0, 3).map((ex, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black text-white flex items-center gap-2">
                        {ex.name}
                        {ex.isPR && <Award size={14} className="text-amber-400" />}
                      </span>
                    </div>
                    <div className="pl-2 border-l-2 border-white/10 ml-1 space-y-1">
                      {ex.setsList && ex.setsList.length > 0 ? (
                        ex.setsList.slice(0, 3).map((set, sIdx) => (
                          <div key={sIdx} className="flex items-center gap-3 text-xs font-bold text-[#8E8E93]">
                            <span className="w-4 text-center">S{sIdx + 1}</span>
                            <div className="flex gap-1 text-white/90">
                              <span>{set.kg} kg</span>
                              <span>×</span>
                              <span>{set.reps}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-xs font-bold text-[#8E8E93]">
                          {ex.sets} {ex.sets === 1 ? 'Set' : 'Sets'} completed • Best: {ex.best}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {hasHiddenContent && (
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#0A0A0A] to-transparent pointer-events-none flex items-end justify-center pb-2">
                  <span className="text-[10px] font-black text-white bg-black/80 px-4 py-1.5 rounded-full backdrop-blur-md border border-white/10 uppercase tracking-widest">
                    Click to see more
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-4">
        <div className="flex gap-6 pt-2">
          <button 
            onClick={handleLike}
            className={`flex items-center gap-2 font-black transition-colors ${liked ? 'text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'text-[#8E8E93] hover:text-white'}`}
          >
            <Heart size={22} fill={liked ? "currentColor" : "none"} /> {likesCount}
          </button>
          <button 
            onClick={() => setShowComments(true)}
            className="flex items-center gap-2 font-black transition-colors text-[#8E8E93] hover:text-white"
          >
            <MessageCircle size={22} /> {post.comments + commentsList.length}
          </button>
        </div>
      </div>

      {showComments && (
        <CommentsModal 
          comments={commentsList} 
          onAddComment={handleAddComment} 
          currentUsername={currentUsername} 
          onClose={() => setShowComments(false)} 
        />
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
  const [selectedWorkoutRecap, setSelectedWorkoutRecap] = useState(null);

  // Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleAddFriend = async (receiverId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setSentRequests(prev => ({ ...prev, [receiverId]: 'pending' }));

    const { error } = await supabase.from('friend_requests').insert([{
      sender_id: user.id,
      receiver_id: receiverId,
      status: 'pending'
    }]);

    if (error) {
      console.error("Error sending friend request:", error);
      // Revert on error
      setSentRequests(prev => {
        const newReqs = { ...prev };
        delete newReqs[receiverId];
        return newReqs;
      });
    }
  };

  const handleSearch = async (e) => {
    if (e.key === 'Enter') {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, display_name')
        .ilike('username', `%${searchQuery}%`)
        .limit(10);
      
      setIsSearching(false);
      if (data) setSearchResults(data);
    }
  };

  const [sentRequests, setSentRequests] = useState({}); // { receiver_id: status }
  const [incomingRequests, setIncomingRequests] = useState([]);

  useEffect(() => {
    const fetchUserAndPosts = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const localName = localStorage.getItem('plateup_username');
      setCurrentUsername(localName || user?.email?.split('@')[0] || 'Athlete');

      if (user) {
        // Fetch sent requests
        const { data: sentData } = await supabase
          .from('friend_requests')
          .select('receiver_id, status')
          .eq('sender_id', user.id);
        
        if (sentData) {
          const sentMap = {};
          sentData.forEach(req => { sentMap[req.receiver_id] = req.status; });
          setSentRequests(sentMap);
        }

        // Fetch valid incoming requests (pending and < 24h old)
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { data: incData } = await supabase
          .from('friend_requests')
          .select(`
            id, 
            sender_id, 
            status, 
            created_at, 
            profiles!friend_requests_sender_id_fkey(username, avatar_url)
          `)
          .eq('receiver_id', user.id)
          .eq('status', 'pending')
          .gte('created_at', yesterday);
        
        if (incData) setIncomingRequests(incData);
      }

      // Fetch global posts from Supabase
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (data && data.length > 0) {
        // Map backend data to post format
        const globalPosts = data.map(p => ({
          ...p.workout_data,
          id: p.id,
          db_id: p.id // to differentiate if needed
        }));
        setPosts(globalPosts);
      } else {
        // Fallback to local
        const localPosts = JSON.parse(localStorage.getItem('plateup_posts') || '[]');
        setPosts(localPosts);
      }
    };
    
    fetchUserAndPosts();
  }, []);

  const handleCopyRoutine = async (post) => {
    const newRoutine = {
      name: `${post.title} (Copied from ${post.user.name})`,
      exercises: post.exercises.map((ex, idx) => ({ 
        id: `ex-${Date.now()}-${idx}`,
        name: ex.name, 
        muscle_group: 'Copied',
        sets: ex.sets || 3,
        restDuration: 90
      }))
    };

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('routines').insert([{
        user_id: user.id,
        name: newRoutine.name,
        exercises: newRoutine.exercises
      }]);
    }
    
    setCopyNotice(true);
    setTimeout(() => setCopyNotice(false), 2000);
  };

  const handleDeletePost = (id) => {
    setConfirmModal({ isOpen: true, id });
  };

  const executeDeletePost = async () => {
    if (confirmModal.id) {
      // Optimistic UI update
      const updatedPosts = posts.filter(p => p.id !== confirmModal.id);
      setPosts(updatedPosts);
      
      // Also clean up local storage just in case it was a local post
      const localPosts = JSON.parse(localStorage.getItem('plateup_posts') || '[]');
      const updatedLocal = localPosts.filter(p => p.id !== confirmModal.id);
      localStorage.setItem('plateup_posts', JSON.stringify(updatedLocal));

      // Delete from Supabase
      await supabase.from('posts').delete().eq('id', confirmModal.id);
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
              onViewSummary={setSelectedWorkoutRecap}
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              placeholder="Find friends by username (Press Enter)..."
              className="w-full bg-[#1C1C1E] text-white h-14 rounded-[20px] pl-12 pr-4 font-bold outline-none border border-white/5 focus:border-white/20 transition-all placeholder:text-[#8E8E93]"
            />
          </div>

          {incomingRequests.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-black text-[#8E8E93] uppercase tracking-widest mb-4 ml-2">Friend Requests</h3>
              <div className="space-y-3">
                {incomingRequests.map(req => {
                  const sender = req.profiles || {};
                  return (
                    <div key={req.id} className="flex items-center justify-between bg-[#1C1C1E] p-4 rounded-[24px] border border-white/5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-[16px] bg-white/10 flex items-center justify-center font-black text-lg overflow-hidden border border-white/5">
                          {sender.avatar_url ? (
                            <img src={sender.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            (sender.username || 'U')[0].toUpperCase()
                          )}
                        </div>
                        <div>
                          <h4 className="font-black text-white">{sender.username || 'Unknown'}</h4>
                          <p className="text-[10px] font-bold text-[#8E8E93]">Wants to be friends</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="bg-white text-black px-4 py-2 rounded-xl font-black text-sm hover:scale-105 active:scale-95 transition-all shadow-lg">
                          Accept
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {isSearching ? (
            <div className="text-center py-10 text-[#8E8E93]">Searching...</div>
          ) : searchResults.length > 0 ? (
            <div className="space-y-4">
              {searchResults.map(user => (
                <div key={user.id} className="flex items-center justify-between bg-[#1C1C1E] p-4 rounded-[24px] border border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-[16px] bg-white/10 flex items-center justify-center font-black text-lg overflow-hidden border border-white/5">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        (user.username || user.display_name || 'U')[0].toUpperCase()
                      )}
                    </div>
                    <div>
                      <h4 className="font-black text-white">{user.username || user.display_name}</h4>
                    </div>
                  </div>
                  {sentRequests[user.id] === 'pending' ? (
                    <button disabled className="bg-white/10 text-[#8E8E93] px-4 py-2 rounded-xl font-black text-sm flex items-center gap-2">
                      Pending
                    </button>
                  ) : sentRequests[user.id] === 'accepted' ? (
                    <button disabled className="bg-white/10 text-white px-4 py-2 rounded-xl font-black text-sm flex items-center gap-2">
                      Friends
                    </button>
                  ) : (
                    <button onClick={() => handleAddFriend(user.id)} className="bg-white text-black px-4 py-2 rounded-xl font-black text-sm hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center gap-2">
                      <UserPlus size={16} /> Add
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center border-t border-white/5 mt-8">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                 <Users size={32} className="text-[#8E8E93]" />
              </div>
              <h3 className="font-black text-xl text-white mb-2">Build Your Crew</h3>
              <p className="text-sm text-[#8E8E93] max-w-xs">Search for your friends' usernames above (Press Enter) to add them and see their workouts here.</p>
            </div>
          )}
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

      {selectedWorkoutRecap && (
        <WorkoutRecap 
          workout={{
            name: selectedWorkoutRecap.title,
            duration: selectedWorkoutRecap.stats?.time || '0m',
            volume: selectedWorkoutRecap.stats?.volume || '0 kg',
            prs: selectedWorkoutRecap.stats?.prs || 0,
            exercises: selectedWorkoutRecap.exercises || [],
            muscleStats: selectedWorkoutRecap.muscleStats || {}
          }} 
          isHistory={true}
          onClose={() => setSelectedWorkoutRecap(null)} 
        />
      )}
    </div>
  );
}
