/**
 * Plik: SocialFeed.jsx
 * Autorzy: Langier, Mietła, Jadwiszczok, Bogdański
 * Opis: Główny komponent społecznościowy. Odpowiada za tablicę postów, system znajomych, rankingi (leaderboard) oraz czat na żywo (WebSockets).
 * Technologia: React / JSX / Tailwind CSS
 */

import React, { useState, useEffect, useRef } from 'react';
import { MoreHorizontal, Heart, MessageCircle, Award, UserPlus, Search, Users, MessageSquare, Copy, Trash2, Send, X, Trophy } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import { ConfirmModal, ModalPortal } from '../../components/ui';
import WorkoutRecap from '../workout/WorkoutRecap';
import { format, isToday, isYesterday, parseISO } from 'date-fns';

// Funkcja pomocnicza: formatPostTime

const formatPostTime = (dateString) => {
  if (!dateString) return 'Just now';
  try {
    const date = parseISO(dateString);
    if (isToday(date)) {
      return `Today, ${format(date, 'HH:mm')}`;
    } else if (isYesterday(date)) {
      return `Yesterday, ${format(date, 'HH:mm')}`;
    } else {
      return format(date, 'MMM d, HH:mm');
    }
  } catch (e) {
    return 'Recently';
  }
};

// Funkcja pomocnicza: CommentsModal

const CommentsModal = ({ onClose, comments, onAddComment, currentUsername }) => {
  // Stan przechowujący zmienną: text
  const [text, setText] = useState('');
  // Stan przechowujący zmienną: replyTo
  const [replyTo, setReplyTo] = useState(null);
  
  // Local state to track likes just for UI mock
  // Stan przechowujący zmienną: likedComments
  const [likedComments, setLikedComments] = useState({});

  // Funkcja pomocnicza: handleSend

  const handleSend = () => {
    if (!text.trim()) return;
    onAddComment(text, replyTo);
    setText('');
    setReplyTo(null);
  };

  // Funkcja pomocnicza: toggleLike

  const toggleLike = (idx) => {
    setLikedComments(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  // Zwraca interfejs użytkownika (JSX) dla tego komponentu

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

// Funkcja pomocnicza: WorkoutPost

const WorkoutPost = ({ post, onCopy, onDelete, currentUsername, currentUserAvatar, onViewSummary }) => {
  // Stan przechowujący zmienną: showOptions
  const [showOptions, setShowOptions] = useState(false);
  // Stan przechowujący zmienną: liked
  const [liked, setLiked] = useState(false);
  // Stan przechowujący zmienną: likesCount
  const [likesCount, setLikesCount] = useState(post.likes || 0);
  // Stan przechowujący zmienną: showComments
  const [showComments, setShowComments] = useState(false);
  // Stan przechowujący zmienną: commentText
  const [commentText, setCommentText] = useState('');
  // Stan przechowujący zmienną: commentsList
  const [commentsList, setCommentsList] = useState([]); // Simulated comments

  const isOwner = post.user.name === currentUsername;

  // Funkcja pomocnicza: handleLike

  const handleLike = () => {
    setLiked(!liked);
    setLikesCount(prev => liked ? prev - 1 : prev + 1);
  };

  // Funkcja pomocnicza: handleAddComment

  const handleAddComment = (text, replyTarget) => {
    setCommentsList([...commentsList, { 
      user: currentUsername, 
      avatar: currentUserAvatar,
      text: text,
      replyTarget: replyTarget,
      isReply: !!replyTarget,
      time: 'Just now'
    }]);
  };

  // Zwraca interfejs użytkownika (JSX) dla tego komponentu

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
        // Zwraca interfejs użytkownika (JSX) dla tego komponentu
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
                <div className="absolute bottom-0 left-0 right-0 h-24 backdrop-blur-md bg-gradient-to-t from-black/90 via-black/50 to-transparent [mask-image:radial-gradient(ellipse_at_bottom,black_10%,transparent_80%)] pointer-events-none flex items-end justify-center pb-3">
                  <span className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-widest mb-1">
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
  // Stan przechowujący zmienną: activeSubTab
  const [activeSubTab, setActiveSubTab] = useState('feed');
  // Stan przechowujący zmienną: posts
  const [posts, setPosts] = useState([]);
  // Stan przechowujący zmienną: currentUsername
  const [currentUsername, setCurrentUsername] = useState('Athlete');
  // Stan przechowujący zmienną: currentUserAvatar
  const [currentUserAvatar, setCurrentUserAvatar] = useState(null);
  // Stan przechowujący zmienną: activeChatUser
  const [activeChatUser, setActiveChatUser] = useState(null);
  // Stan przechowujący zmienną: chatMessages
  const [chatMessages, setChatMessages] = useState([]);
  // Stan przechowujący zmienną: allMessages
  const [allMessages, setAllMessages] = useState([]);
  // Stan przechowujący zmienną: chatInput
  const [chatInput, setChatInput] = useState('');
  // Stan przechowujący zmienną: sentRequests
  const [sentRequests, setSentRequests] = useState({});
  // Stan przechowujący zmienną: incomingRequests
  const [incomingRequests, setIncomingRequests] = useState([]);
  // Stan przechowujący zmienną: currentUserId
  const [currentUserId, setCurrentUserId] = useState(null);

  // Funkcja pomocnicza: getChatLocalKey

  const getChatLocalKey = (id1, id2) => {
    const sorted = [id1, id2].sort();
    return `chat_${sorted[0]}_${sorted[1]}`;
  };

  // Asynchroniczna funkcja: loadChatMessages - odpowiada za operacje w tle (np. fetchowanie bazy)

  const loadChatMessages = async (friendId) => {
    if (!currentUserId || !friendId) return;
    
    // Quick load from local cache (allMessages) to make it instant
    const cachedMsgs = allMessages.filter(m => 
      (m.sender_id === currentUserId && m.receiver_id === friendId) || 
      (m.sender_id === friendId && m.receiver_id === currentUserId)
    ).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    
    if (cachedMsgs.length > 0) {
      setChatMessages(cachedMsgs);
    }
    
    const localKey = getChatLocalKey(currentUserId, friendId);
    
    // Use .in() which is much more reliable than nested .or() strings in Supabase JS
    // Odpytanie bazy danych Supabase w poszukiwaniu odpowiednich rekordów
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .in('sender_id', [currentUserId, friendId])
      .in('receiver_id', [currentUserId, friendId])
      .order('created_at', { ascending: true });
      
    if (!error && data) {
      // Filter out any self-messages just in case
      const validData = data.filter(m => m.sender_id !== m.receiver_id);
      setChatMessages(validData);
    } else if (error) {
      console.error("Error loading messages from Supabase (maybe table doesn't exist?):", error);
      // Fallback to local storage if messages table doesn't exist
      const localMsgs = JSON.parse(localStorage.getItem(localKey) || '[]');
      setChatMessages(localMsgs);
    }
  };

  // Efekt uboczny (useEffect) uruchamiany po wyrenderowaniu komponentu lub zmianie zależności

  useEffect(() => {
    let subscription;
    if (currentUserId) {
      // Global subscription for all chats for this user to update the list preview
      subscription = supabase.channel('global_chat_messages')
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages' 
        }, payload => {
          const newMsg = payload.new;
          
          if (newMsg.sender_id === currentUserId || newMsg.receiver_id === currentUserId) {
            setAllMessages(prev => {
              // Prevent duplicates (including optimistic updates with temp IDs)
              const isDuplicate = prev.find(m => 
                m.id === newMsg.id || 
                (m.sender_id === newMsg.sender_id && m.receiver_id === newMsg.receiver_id && m.text === newMsg.text && Math.abs(new Date(newMsg.created_at).getTime() - new Date(m.created_at).getTime()) < 5000)
              );
              if (isDuplicate) {
                // If it's a duplicate and the existing one was a temp, we should really replace it, but we handle replacement in handleSendMessage.
                return prev;
              }
              return [newMsg, ...prev];
            });
            
            // Also update the active chat if it belongs there
            if (activeChatUser) {
              const isRelevant = 
                (newMsg.sender_id === currentUserId && newMsg.receiver_id === activeChatUser.id) ||
                (newMsg.sender_id === activeChatUser.id && newMsg.receiver_id === currentUserId);
                
              if (isRelevant) {
                setChatMessages(prev => {
                  if (prev.find(m => m.id === newMsg.id || (m.sender_id === newMsg.sender_id && m.text === newMsg.text && Math.abs(new Date(newMsg.created_at).getTime() - new Date(m.created_at).getTime()) < 5000))) {
                    return prev;
                  }
                  return [...prev, newMsg];
                });
              }
            }
          }
        })
        .subscribe();
    }
    
    // Zwraca interfejs użytkownika (JSX) dla tego komponentu
    
    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [currentUserId, activeChatUser]);

  // Efekt uboczny (useEffect) uruchamiany po wyrenderowaniu komponentu lub zmianie zależności

  useEffect(() => {
    if (activeChatUser) {
      loadChatMessages(activeChatUser.id);
    }
  }, [activeChatUser]);

  // Asynchroniczna funkcja: handleSendMessage - odpowiada za operacje w tle (np. fetchowanie bazy)

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !activeChatUser || !currentUserId) return;
    
    const tempId = `temp-${Date.now()}`;
    const newMsg = {
      id: tempId,
      sender_id: currentUserId,
      receiver_id: activeChatUser.id,
      text: chatInput.trim(),
      created_at: new Date().toISOString()
    };
    
    setChatInput('');
    setChatMessages(prev => [...prev, newMsg]); // Optimistic update
    setAllMessages(prev => [newMsg, ...prev]);
    
    // Odpytanie bazy danych Supabase w poszukiwaniu odpowiednich rekordów
    
    const { data, error } = await supabase.from('messages').insert([{
      sender_id: newMsg.sender_id,
      receiver_id: newMsg.receiver_id,
      text: newMsg.text
    }]).select().single();
    
    if (error) {
      console.error("Error sending message to Supabase:", error);
      // Fallback to local storage
      const localKey = getChatLocalKey(currentUserId, activeChatUser.id);
      const localMsgs = JSON.parse(localStorage.getItem(localKey) || '[]');
      localMsgs.push(newMsg);
      localStorage.setItem(localKey, JSON.stringify(localMsgs));
    } else if (data) {
      // Replace optimistic temp message with real DB message (to get proper ID)
      setChatMessages(prev => prev.map(m => m.id === tempId ? data : m));
      setAllMessages(prev => prev.map(m => m.id === tempId ? data : m));
    }
  };

  // Stan przechowujący zmienną: confirmModal

  const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null });
  // Stan przechowujący zmienną: copyNotice
  const [copyNotice, setCopyNotice] = useState(false);
  // Stan przechowujący zmienną: selectedWorkoutRecap
  const [selectedWorkoutRecap, setSelectedWorkoutRecap] = useState(null);

  // Search States
  // Stan przechowujący zmienną: searchQuery
  const [searchQuery, setSearchQuery] = useState('');
  // Stan przechowujący zmienną: searchResults
  const [searchResults, setSearchResults] = useState([]);
  // Stan przechowujący zmienną: isSearching
  const [isSearching, setIsSearching] = useState(false);

  // Stan przechowujący zmienną: leaderboardData

  const [leaderboardData, setLeaderboardData] = useState([]);
  // Stan przechowujący zmienną: selectedProfile
  const [selectedProfile, setSelectedProfile] = useState(null);

  const messagesEndRef = useRef(null);

  // Funkcja pomocnicza: scrollToBottom

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Efekt uboczny (useEffect) uruchamiany po wyrenderowaniu komponentu lub zmianie zależności

  useEffect(() => {
    if (activeSubTab === 'chats' && activeChatUser) {
      scrollToBottom();
    }
  }, [chatMessages, activeSubTab, activeChatUser]);

  // Asynchroniczna funkcja: handleAddFriend - odpowiada za operacje w tle (np. fetchowanie bazy)

  const handleAddFriend = async (receiverId) => {
    // Odpytanie bazy danych Supabase w poszukiwaniu odpowiednich rekordów
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Check if there is already an incoming request from this user
    const existingInc = incomingRequests.find(r => r.sender_id === receiverId);
    if (existingInc) {
      return handleAcceptRequest(existingInc.id, receiverId);
    }

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

  // Asynchroniczna funkcja: handleAcceptRequest - odpowiada za operacje w tle (np. fetchowanie bazy)

  const handleAcceptRequest = async (requestId, senderId) => {
    setIncomingRequests(prev => prev.filter(req => req.id !== requestId));
    setSentRequests(prev => ({ ...prev, [senderId]: 'accepted' }));
    
    const { error } = await supabase
      .from('friend_requests')
      .update({ status: 'accepted' })
      .eq('id', requestId);
      
    if (error) {
      console.error("Error accepting request:", error);
    }
    
    // Always re-fetch to ensure sync with DB, even if update failed (so it reappears if it failed)
    await fetchUserAndPosts();
  };

  // Asynchroniczna funkcja: handleRejectRequest - odpowiada za operacje w tle (np. fetchowanie bazy)

  const handleRejectRequest = async (requestId) => {
    setIncomingRequests(prev => prev.filter(req => req.id !== requestId));
    
    const { error } = await supabase
      .from('friend_requests')
      .delete()
      .eq('id', requestId);
      
    if (error) {
      console.error("Error rejecting request:", error);
    }
  };

  // Asynchroniczna funkcja: handleSearch - odpowiada za operacje w tle (np. fetchowanie bazy)

  const handleSearch = async (e) => {
    if (e.key === 'Enter') {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      // Odpytanie bazy danych Supabase w poszukiwaniu odpowiednich rekordów
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, display_name')
        .ilike('username', `%${searchQuery}%`)
        .limit(10);
      
      setIsSearching(false);
      if (data) setSearchResults(data);
    }
  };



  // Asynchroniczna funkcja: fetchUserAndPosts - odpowiada za operacje w tle (np. fetchowanie bazy)



  const fetchUserAndPosts = async () => {
    // Odpytanie bazy danych Supabase w poszukiwaniu odpowiednich rekordów
    const { data: { user } } = await supabase.auth.getUser();
    const localName = localStorage.getItem('plateup_username');
    setCurrentUsername(localName || user?.email?.split('@')[0] || 'Athlete');

    let friendIds = [];
    
    if (user) {
      setCurrentUserId(user.id);
      friendIds.push(user.id);
      const relationships = {};
      const incoming = [];

      // Fetch current user profile to get avatar
      // Odpytanie bazy danych Supabase w poszukiwaniu odpowiednich rekordów
      const { data: profileData } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', user.id)
        .single();

      if (profileData) {
        if (profileData.username) setCurrentUsername(profileData.username);
        if (profileData.avatar_url) setCurrentUserAvatar(profileData.avatar_url);
      }

      // 1. Fetch where user is sender
      // Odpytanie bazy danych Supabase w poszukiwaniu odpowiednich rekordów
      const { data: sentData } = await supabase
        .from('friend_requests')
        .select('receiver_id, status')
        .eq('sender_id', user.id);
      
      if (sentData) {
        sentData.forEach(req => { 
          if (req.status === 'accepted') {
            relationships[req.receiver_id] = 'accepted';
            if (!friendIds.includes(req.receiver_id)) friendIds.push(req.receiver_id);
          } else if (req.status === 'pending') {
            relationships[req.receiver_id] = 'pending';
          }
        });
      }

      // 2. Fetch where user is receiver
      // Odpytanie bazy danych Supabase w poszukiwaniu odpowiednich rekordów
      const { data: incData, error: incError } = await supabase
        .from('friend_requests')
        .select(`
          id, 
          sender_id, 
          status, 
          created_at, 
          profiles!sender_id(username, avatar_url)
        `)
        .eq('receiver_id', user.id);
        
      if (incError) {
        console.error("Error fetching incoming requests:", incError);
        // Fallback query if the foreign key syntax fails
        // Odpytanie bazy danych Supabase w poszukiwaniu odpowiednich rekordów
        const { data: incDataFallback } = await supabase
          .from('friend_requests')
          .select('*')
          .eq('receiver_id', user.id);
          
        if (incDataFallback && incDataFallback.length > 0) {
          // Manually fetch profiles
          const senderIds = incDataFallback.map(r => r.sender_id);
          // Odpytanie bazy danych Supabase w poszukiwaniu odpowiednich rekordów
          const { data: profilesData } = await supabase.from('profiles').select('id, username, avatar_url').in('id', senderIds);
          
          const enrichedData = incDataFallback.map(req => ({
            ...req,
            profiles: profilesData?.find(p => p.id === req.sender_id) || null
          }));
          
          enrichedData.forEach(req => {
            if (req.status === 'accepted') {
              relationships[req.sender_id] = 'accepted';
              if (!friendIds.includes(req.sender_id)) friendIds.push(req.sender_id);
            } else if (req.status === 'pending') {
              if (relationships[req.sender_id] !== 'accepted') {
                relationships[req.sender_id] = 'pending_received';
                incoming.push(req);
              }
            }
          });
          setIncomingRequests(incoming);
        }
      } else if (incData) {
        incData.forEach(req => {
          if (req.status === 'accepted') {
            relationships[req.sender_id] = 'accepted';
            if (!friendIds.includes(req.sender_id)) friendIds.push(req.sender_id);
          } else if (req.status === 'pending') {
            if (relationships[req.sender_id] !== 'accepted') {
              relationships[req.sender_id] = 'pending_received';
              incoming.push(req);
            }
          }
        });
      }
      
      setSentRequests(relationships);
      setIncomingRequests(incoming);

      if (friendIds.length > 0) {
        // Odpytanie bazy danych Supabase w poszukiwaniu odpowiednich rekordów
        const { data: friendsProfiles, error: friendsError } = await supabase
          .from('profiles')
          .select('id, username, display_name, avatar_url, exp')
          .in('id', friendIds);
          
        if (friendsError) {
          console.error("Error fetching friends profiles:", friendsError);
          // Try fetching without display_name and exp if they don't exist in DB
          // Odpytanie bazy danych Supabase w poszukiwaniu odpowiednich rekordów
          const { data: fallbackProfiles } = await supabase
            .from('profiles')
            .select('id, username, avatar_url')
            .in('id', friendIds);
            
          if (fallbackProfiles) {
             const lb = fallbackProfiles.map(p => {
              let e = 0;
              if (p.id === user.id) {
                e = parseInt(localStorage.getItem('plateup_exp') || '0', 10);
              }
              return { ...p, exp: e, level: Math.floor(Math.sqrt(e / 100)) + 1 };
            });
            lb.sort((a, b) => b.exp - a.exp);
            setLeaderboardData(lb);
          }
        } else if (friendsProfiles) {
          const lb = friendsProfiles.map(p => {
            let e = p.exp || 0;
            if (p.id === user.id) {
              const localExp = parseInt(localStorage.getItem('plateup_exp') || '0', 10);
              e = Math.max(e, localExp);
            }
            return { ...p, exp: e, level: Math.floor(Math.sqrt(e / 100)) + 1 };
          });
          lb.sort((a, b) => b.exp - a.exp);
          setLeaderboardData(lb);
        }
      }
    }

    // Fetch global posts from Supabase
    let query = supabase.from('posts').select('*').order('created_at', { ascending: false }).limit(20);
    
    if (user && friendIds.length > 0) {
      query = query.in('user_id', friendIds);
      
      // Also fetch all messages for current user to show latest in chats list
      // Odpytanie bazy danych Supabase w poszukiwaniu odpowiednich rekordów
      const { data: msgsData } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });
        
      if (msgsData) {
        setAllMessages(msgsData);
      } else {
        // Fallback: collect all messages from local storage
        let allLocal = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('chat_') && key.includes(user.id)) {
            try {
              const msgs = JSON.parse(localStorage.getItem(key) || '[]');
              allLocal = [...allLocal, ...msgs];
            } catch(e) {}
          }
        }
        allLocal.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setAllMessages(allLocal);
      }
    }

    const { data, error } = await query;

    if (data && data.length > 0) {
      const globalPosts = data.map(p => {
        const workoutData = p.workout_data || {};
        return {
          ...workoutData,
          id: p.id,
          db_id: p.id,
          timeAgo: formatPostTime(p.created_at || workoutData.created_at)
        };
      });
      setPosts(globalPosts);
    } else {
      const localPosts = JSON.parse(localStorage.getItem('plateup_posts') || '[]');
      const updatedLocal = localPosts.map(p => ({
        ...p,
        timeAgo: formatPostTime(p.created_at)
      }));
      setPosts(updatedLocal);
    }
  };

  // Efekt uboczny (useEffect) uruchamiany po wyrenderowaniu komponentu lub zmianie zależności

  useEffect(() => {
    fetchUserAndPosts();
  }, []);

  // Asynchroniczna funkcja: handleCopyRoutine - odpowiada za operacje w tle (np. fetchowanie bazy)

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

    // Odpytanie bazy danych Supabase w poszukiwaniu odpowiednich rekordów

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

  // Funkcja pomocnicza: handleDeletePost

  const handleDeletePost = (id) => {
    setConfirmModal({ isOpen: true, id });
  };

  // Asynchroniczna funkcja: executeDeletePost - odpowiada za operacje w tle (np. fetchowanie bazy)

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

  // Zwraca interfejs użytkownika (JSX) dla tego komponentu

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
            onClick={() => setActiveSubTab('leaderboard')}
            className={`flex-1 py-3 text-sm font-black rounded-xl transition-all flex items-center justify-center gap-2 ${activeSubTab === 'leaderboard' ? 'bg-white text-black shadow-lg shadow-white/10' : 'text-[#8E8E93] hover:text-white'}`}
          >
            <Trophy size={16} /> Ranks
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
              currentUserAvatar={currentUserAvatar}
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
                  // Zwraca interfejs użytkownika (JSX) dla tego komponentu
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
                        <button onClick={() => handleRejectRequest(req.id)} className="bg-white/10 text-white px-4 py-2 rounded-xl font-black text-sm hover:bg-white/20 transition-all">
                          Decline
                        </button>
                        <button onClick={() => handleAcceptRequest(req.id, req.sender_id)} className="bg-white text-black px-4 py-2 rounded-xl font-black text-sm hover:scale-105 active:scale-95 transition-all shadow-lg">
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
                  {(() => {
                    const status = sentRequests[user.id];
                    if (status === 'accepted') {
                      // Zwraca interfejs użytkownika (JSX) dla tego komponentu
                      return (
                        <button disabled className="bg-white/10 text-white px-4 py-2 rounded-xl font-black text-sm flex items-center gap-2">
                          Friends
                        </button>
                      );
                    }
                    if (status === 'pending') {
                      // Zwraca interfejs użytkownika (JSX) dla tego komponentu
                      return (
                        <button disabled className="bg-white/10 text-[#8E8E93] px-4 py-2 rounded-xl font-black text-sm flex items-center gap-2">
                          Pending
                        </button>
                      );
                    }
                    if (status === 'pending_received') {
                      const incReq = incomingRequests.find(r => r.sender_id === user.id);
                      return incReq ? (
                        <button onClick={() => handleAcceptRequest(incReq.id, user.id)} className="bg-white text-black px-4 py-2 rounded-xl font-black text-sm hover:scale-105 active:scale-95 transition-all shadow-lg">
                          Accept
                        </button>
                      ) : null;
                    }
                    // Zwraca interfejs użytkownika (JSX) dla tego komponentu
                    return (
                      <button onClick={() => handleAddFriend(user.id)} className="bg-white text-black px-4 py-2 rounded-xl font-black text-sm hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center gap-2">
                        <UserPlus size={16} /> Add
                      </button>
                    );
                  })()}
                </div>
              ))}
            </div>
          ) : (
            <>
              {leaderboardData.filter(u => u.id !== currentUserId).length > 0 ? (
                <div className="mt-8">
                  <h3 className="text-sm font-black text-[#8E8E93] uppercase tracking-widest mb-4 ml-2">My Friends</h3>
                  <div className="space-y-4">
                    {leaderboardData.filter(u => u.id !== currentUserId).map(friend => (
                      <div key={friend.id} className="flex items-center justify-between bg-[#1C1C1E] p-4 rounded-[24px] border border-white/5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-[16px] bg-white/10 flex items-center justify-center font-black text-lg overflow-hidden border border-white/5">
                            {friend.avatar_url ? (
                              <img src={friend.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                              (friend.username || friend.display_name || 'U')[0].toUpperCase()
                            )}
                          </div>
                          <div>
                            <h4 className="font-black text-white">{friend.username || friend.display_name}</h4>
                            <p className="text-[11px] font-bold text-[#8E8E93]">Level {friend.level}</p>
                          </div>
                        </div>
                        <button onClick={() => { setActiveSubTab('chats'); setActiveChatUser(friend); }} className="bg-white/10 text-white px-4 py-2 rounded-xl font-black text-sm flex items-center gap-2 hover:bg-white/20 transition-all">
                          <MessageSquare size={16} /> Chat
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center border-t border-white/5 mt-8">
                  <div className="w-16 h-16 bg-white/5 rounded-[20px] flex items-center justify-center mb-4">
                    <Users size={32} className="text-[#8E8E93]" />
                  </div>
                  <h3 className="font-black text-xl text-white mb-2">Build Your Crew</h3>
                  <p className="text-sm text-[#8E8E93] max-w-xs">Search for your friends' usernames above (Press Enter) to add them and see their workouts here.</p>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {activeSubTab === 'leaderboard' && (
        <div className="animate-in fade-in duration-300">
          <div className="flex flex-col items-center justify-center py-6 text-center border-b border-white/5 mb-6">
            <div className="w-16 h-16 bg-white/5 rounded-[20px] flex items-center justify-center mb-4 border border-white/10 shadow-[0_0_30px_rgba(251,191,36,0.1)]">
               <Trophy size={32} className="text-amber-400" />
            </div>
            <h3 className="font-black text-xl text-white mb-2">Global Rankings</h3>
            <p className="text-sm text-[#8E8E93] max-w-xs">Compete with your friends. Level up by completing workouts and hitting PRs.</p>
          </div>
          
          <div className="space-y-3">
            {leaderboardData.map((user, index) => {
              let medalClass = "text-[#8E8E93]";
              let borderClass = "border-white/5";
              let bgClass = "bg-[#1C1C1E]";
              
              if (index === 0) {
                medalClass = "text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]";
                borderClass = "border-yellow-400/30";
                bgClass = "bg-gradient-to-r from-yellow-400/10 to-[#1C1C1E]";
              } else if (index === 1) {
                medalClass = "text-slate-300 drop-shadow-[0_0_10px_rgba(203,213,225,0.5)]";
                borderClass = "border-slate-300/30";
                bgClass = "bg-gradient-to-r from-slate-300/10 to-[#1C1C1E]";
              } else if (index === 2) {
                medalClass = "text-amber-700 drop-shadow-[0_0_10px_rgba(180,83,9,0.5)]";
                borderClass = "border-amber-700/30";
                bgClass = "bg-gradient-to-r from-amber-700/10 to-[#1C1C1E]";
              }

              const isCurrentUser = user.username === currentUsername;

              // Zwraca interfejs użytkownika (JSX) dla tego komponentu

              return (
                <div 
                  key={user.id} 
                  onClick={() => setSelectedProfile(user)}
                  className={`flex items-center justify-between p-4 rounded-[24px] border ${borderClass} ${bgClass} cursor-pointer hover:scale-[1.02] transition-all`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-8 font-black text-lg text-center ${medalClass}`}>
                      #{index + 1}
                    </div>
                    <div className="w-12 h-12 rounded-[16px] bg-black/50 flex items-center justify-center font-black text-lg overflow-hidden border border-white/5 shadow-inner relative">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        (user.username || user.display_name || 'U')[0].toUpperCase()
                      )}
                    </div>
                    <div>
                      <h4 className="font-black text-white flex items-center gap-2">
                        {user.username || user.display_name}
                        {isCurrentUser && <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-lg text-white/90">You</span>}
                      </h4>
                      <p className="text-[11px] font-bold text-[#8E8E93]">Level {user.level}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-white">{user.exp.toLocaleString()}</div>
                    <div className="text-[10px] font-bold text-[#8E8E93] uppercase tracking-widest">EXP</div>
                  </div>
                </div>
              );
            })}
            
            {leaderboardData.length === 0 && (
              <div className="text-center py-10 text-[#8E8E93] font-bold">
                Add friends to see them on the leaderboard!
              </div>
            )}
          </div>
        </div>
      )}

      {activeSubTab === 'chats' && (
        <div className="animate-in fade-in duration-300">
          {!activeChatUser ? (
            <>
              {leaderboardData.filter(u => u.id !== currentUserId).length > 0 ? (
                <div className="space-y-3">
                  {leaderboardData.filter(u => u.id !== currentUserId).map(friend => {
                    const friendMessages = allMessages.filter(m => m.sender_id === friend.id || m.receiver_id === friend.id);
                    const lastMsg = friendMessages.length > 0 ? friendMessages[0] : null; // Already sorted desc

                    // Zwraca interfejs użytkownika (JSX) dla tego komponentu

                    return (
                      <div key={friend.id} onClick={() => setActiveChatUser(friend)} className="flex items-center gap-4 bg-[#1C1C1E] p-4 rounded-[24px] border border-white/5 cursor-pointer hover:border-white/20 transition-all">
                        <div className="w-14 h-14 rounded-[18px] bg-white/10 flex items-center justify-center font-black text-xl overflow-hidden border border-white/5 shrink-0">
                          {friend.avatar_url ? (
                            <img src={friend.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            (friend.username || friend.display_name || 'U')[0].toUpperCase()
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-black text-white text-lg truncate">{friend.username || friend.display_name}</h4>
                          {lastMsg ? (
                            <p className="text-sm font-medium text-[#8E8E93] truncate">
                              {lastMsg.sender_id === currentUserId ? 'You: ' : ''}{lastMsg.text}
                            </p>
                          ) : (
                            <p className="text-sm font-bold text-[#8E8E93]">Tap to start chatting</p>
                          )}
                        </div>
                        <div className="shrink-0 flex flex-col items-end">
                           {lastMsg ? (
                             <>
                               <span className="text-[10px] font-bold text-[#8E8E93] mb-1">
                                 {format(new Date(lastMsg.created_at), 'HH:mm')}
                               </span>
                               {lastMsg.sender_id !== currentUserId && (
                                 <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-full">Reply</span>
                               )}
                             </>
                           ) : (
                             <MessageSquare className="text-[#8E8E93]" size={20} />
                           )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-16 h-16 bg-white/5 rounded-[20px] flex items-center justify-center mb-4">
                     <MessageSquare size={32} className="text-[#8E8E93]" />
                  </div>
                  <h3 className="font-black text-xl text-white mb-2">No Friends Yet</h3>
                  <p className="text-sm text-[#8E8E93] max-w-xs">Connect with friends to start chatting about your progress and routines.</p>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col h-[60vh] bg-[#1C1C1E] border border-white/5 rounded-[36px] overflow-hidden">
              {/* Chat Header */}
              <div className="flex items-center gap-4 p-4 border-b border-white/5 bg-black/20">
                <button onClick={() => setActiveChatUser(null)} className="p-2 text-[#8E8E93] hover:text-white transition-colors bg-white/5 rounded-full">
                  <X size={20} />
                </button>
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-black overflow-hidden">
                  {activeChatUser.avatar_url ? (
                    <img src={activeChatUser.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    (activeChatUser.username || activeChatUser.display_name || 'U')[0].toUpperCase()
                  )}
                </div>
                <h3 className="font-black text-lg text-white">{activeChatUser.username || activeChatUser.display_name}</h3>
              </div>
              
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-[#8E8E93]">
                    <p className="text-sm font-bold">No messages yet. Say hi!</p>
                  </div>
                ) : (
                  chatMessages.map((msg, idx) => {
                    const isMe = msg.sender_id === currentUserId;
                    // Zwraca interfejs użytkownika (JSX) dla tego komponentu
                    return (
                      <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] px-4 py-3 rounded-2xl ${isMe ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-[#2C2C2E] text-white rounded-bl-sm'} shadow-md`}>
                          <p className="text-sm font-medium break-words">{msg.text}</p>
                          <span className="text-[10px] font-bold opacity-60 mt-1 block text-right">
                            {format(new Date(msg.created_at), 'HH:mm')}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
              
              {/* Input Area */}
              <div className="p-4 bg-black/40 border-t border-white/5">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Message..."
                    className="w-full bg-black border border-white/10 rounded-full h-12 pl-4 pr-12 text-sm font-medium text-white outline-none focus:border-white/30 transition-colors"
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                  />
                  <button 
                    onClick={handleSendMessage}
                    disabled={!chatInput.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white disabled:opacity-30 disabled:bg-white/10 transition-colors"
                  >
                    <Send size={14} className="-ml-0.5" />
                  </button>
                </div>
              </div>
            </div>
          )}
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

      {selectedProfile && (
        <ModalPortal>
          <div className="fixed inset-0 z-[600] flex items-end sm:items-center justify-center sm:p-6 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedProfile(null)} />
            <div className="relative w-full sm:max-w-md h-[90vh] sm:h-[700px] bg-[#1C1C1E] sm:rounded-[36px] rounded-t-[36px] shadow-2xl border border-white/10 overflow-hidden flex flex-col animate-in slide-in-from-bottom-8 duration-300">
              <div className="flex items-center justify-between p-6 pb-4 border-b border-white/5 relative z-10 bg-[#1C1C1E]">
                <h3 className="font-black text-xl text-white">Profile</h3>
                <button onClick={() => setSelectedProfile(null)} className="text-[#8E8E93] hover:text-white transition-colors bg-white/5 p-2 rounded-full">
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
                <div className="p-8 flex flex-col items-center text-center border-b border-white/5 bg-black/20">
                  <div className="w-24 h-24 rounded-[32px] bg-white/10 flex items-center justify-center font-black text-4xl overflow-hidden border border-white/5 shadow-2xl mb-4 relative">
                    {selectedProfile.avatar_url ? (
                      <img src={selectedProfile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      (selectedProfile.username || selectedProfile.display_name || 'U')[0].toUpperCase()
                    )}
                  </div>
                  <h2 className="text-2xl font-black text-white">{selectedProfile.username || selectedProfile.display_name}</h2>
                  <div className="flex items-center gap-2 mt-1 mb-6">
                    <span className="text-[11px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-xl font-black tracking-widest uppercase">Level {selectedProfile.level}</span>
                    <span className="text-[#8E8E93] font-bold text-sm">{selectedProfile.exp.toLocaleString()} EXP</span>
                  </div>
                  
                  {selectedProfile.username !== currentUsername && (
                    <div className="flex gap-2">
                      <button className="bg-white text-black px-6 py-2.5 rounded-xl font-black text-sm hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center gap-2">
                        <MessageSquare size={16} /> Message
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="p-4 mt-2">
                  <h3 className="text-sm font-black text-[#8E8E93] uppercase tracking-widest mb-4 ml-2">Recent Activity</h3>
                  <div className="space-y-4">
                    {posts.filter(p => p.user.name === selectedProfile.username).length > 0 ? (
                      posts.filter(p => p.user.name === selectedProfile.username).map(post => (
                        <div key={post.id} className="bg-black/40 border border-white/5 p-4 rounded-[24px] cursor-pointer hover:border-white/10 transition-colors" onClick={() => setSelectedWorkoutRecap(post)}>
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-black text-white">{post.title}</h4>
                            <span className="text-[10px] text-[#8E8E93] font-bold">{post.timeAgo}</span>
                          </div>
                          <div className="flex gap-2">
                            <span className="text-xs bg-white/5 px-2 py-1 rounded-lg text-[#8E8E93] font-bold">{post.stats?.volume || '0 kg'}</span>
                            <span className="text-xs bg-white/5 px-2 py-1 rounded-lg text-[#8E8E93] font-bold">{post.stats?.time || '0m'}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-10 text-[#8E8E93] font-bold text-sm">No recent workouts</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
}
