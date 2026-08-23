import React, { useState } from 'react';
import { MoreHorizontal, Heart, MessageCircle, Share2, Copy, Edit3, Trash2, Bookmark, Dumbbell, Award, Lock, MapPin, X, Send } from 'lucide-react';
import { format } from 'date-fns';

export const CommentsModal = ({ onClose, comments, onAddComment, currentUsername }) => {
  const [text, setText] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  
  return (
    <div className="fixed inset-0 z-[600] flex flex-col justify-end animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full h-[85vh] bg-[#0A0A0A] rounded-t-[32px] shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-300 border-t border-white/10">
        <div className="w-full flex justify-center pt-3 pb-1">
          <div className="w-12 h-1.5 bg-white/20 rounded-full" />
        </div>
        <header className="px-6 py-4 flex items-center justify-between border-b border-white/5">
          <h2 className="text-xl font-black text-white">Comments</h2>
          <button onClick={onClose} className="p-2 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors">
            <X size={20} strokeWidth={3} />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {comments.length === 0 ? (
            <div className="text-center text-[#8E8E93] mt-10">
              <MessageCircle size={48} className="mx-auto mb-4 opacity-20" />
              <p className="font-bold">No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            comments.map((comment, idx) => (
              <div key={idx} className={`flex gap-4 ${comment.isReply ? 'ml-12' : ''}`}>
                <div className="w-10 h-10 rounded-[12px] bg-white/10 flex items-center justify-center font-black text-sm overflow-hidden border border-white/5 shrink-0">
                  {comment.avatar ? <img src={comment.avatar} alt="Avatar" className="w-full h-full object-cover" /> : comment.user[0]}
                </div>
                <div className="flex-1">
                  <div className="bg-[#1C1C1E] p-3 rounded-2xl border border-white/5 rounded-tl-sm">
                    <h4 className="font-black text-white text-sm mb-1">{comment.user}</h4>
                    {comment.isReply && <p className="text-[10px] text-blue-400 font-bold mb-1">Replying to {comment.replyTarget}</p>}
                    <p className="text-sm text-white/90 leading-snug">{comment.text}</p>
                  </div>
                  <div className="flex items-center gap-4 mt-2 px-2">
                    <span className="text-[10px] font-bold text-[#8E8E93]">{comment.time}</span>
                    <button onClick={() => setReplyTo(comment.user)} className="text-[10px] font-black text-[#8E8E93] uppercase tracking-widest hover:text-white transition-colors">Reply</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="p-4 bg-black/80 backdrop-blur-md border-t border-white/5">
          {replyTo && (
            <div className="flex items-center justify-between mb-2 px-2">
              <span className="text-[10px] font-bold text-blue-400">Replying to {replyTo}</span>
              <button onClick={() => setReplyTo(null)} className="text-[10px] text-[#8E8E93] hover:text-white"><X size={12} /></button>
            </div>
          )}
          <div className="flex items-center gap-3 relative">
            <input type="text" placeholder="Add a comment..." className="w-full bg-[#1C1C1E] border border-white/10 rounded-full h-12 pl-4 pr-12 text-sm font-medium text-white outline-none focus:border-white/30 transition-colors" value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if(e.key==='Enter' && text.trim()){ onAddComment(text, replyTo); setText(''); setReplyTo(null); } }} />
            <button disabled={!text.trim()} onClick={() => { onAddComment(text, replyTo); setText(''); setReplyTo(null); }} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white disabled:opacity-30 transition-colors"><Send size={14} className="-ml-0.5" /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const StatBox = ({ label, value, highlight }) => (
  <div className={`flex flex-col min-w-[76px] p-3.5 rounded-2xl border ${highlight ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'bg-transparent border-white/10 text-white'}`}>
    <span className={`text-[9px] font-black uppercase tracking-widest mb-1 ${highlight ? 'text-black/60' : 'text-[#8E8E93]'}`}>{label}</span>
    <span className="font-black text-[15px]">{value}</span>
  </div>
);

export default function WorkoutPost({ post, onCopy, onDelete, currentUsername, currentUserAvatar, onViewSummary, onUserClick }) {
  const [showOptions, setShowOptions] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes || 0);
  const [showComments, setShowComments] = useState(false);
  const [commentsList, setCommentsList] = useState([]);

  const isOwner = post.user.name === currentUsername;

  const handleLike = () => {
    setLiked(!liked);
    setLikesCount(prev => liked ? prev - 1 : prev + 1);
  };

  const handleAddComment = (text, replyTarget) => {
    setCommentsList([...commentsList, { user: currentUsername, avatar: currentUserAvatar, text, replyTarget, isReply: !!replyTarget, time: 'Just now' }]);
  };

  return (
    <div className="bg-[#1C1C1E] border border-white/5 rounded-[40px] p-6 mb-6 shadow-xl relative w-full">
      <div className="flex items-center justify-between mb-6">
        <div 
          className={`flex items-center gap-4 ${onUserClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
          onClick={(e) => {
            if (onUserClick && post.user_id) {
              e.stopPropagation();
              onUserClick(post.user_id);
            }
          }}
        >
          <div className="w-12 h-12 rounded-[16px] bg-white/10 flex items-center justify-center font-black text-lg overflow-hidden border border-white/5 shadow-inner">
            {post.user.avatar ? (
              <img src={post.user.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              post.user.name[0]
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-white text-[17px] leading-tight">{post.user.name}</h3>
              {post.visibility === 'private' && <Lock size={12} className="text-[#8E8E93]" />}
            </div>
            <p className="text-[11px] font-bold text-[#8E8E93] mt-0.5">
              {post.timeAgo}
              {post.gym && <span className="ml-2 flex items-center inline-flex gap-1"><MapPin size={10} /> {post.gym}</span>}
            </p>
          </div>
        </div>
        
        {isOwner && (
          <div className="relative">
            <button 
              onClick={(e) => { e.stopPropagation(); setShowOptions(!showOptions); }}
              className="p-2 text-[#8E8E93] hover:text-white transition-colors rounded-full hover:bg-white/5"
            >
              <MoreHorizontal size={24} />
            </button>
            
            {showOptions && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-[#0A0A0A] border border-[#2C2C2E] rounded-2xl shadow-2xl z-[105] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <button 
                  onClick={(e) => { e.stopPropagation(); setShowOptions(false); }}
                  className="w-full flex items-center gap-3 p-4 hover:bg-white/5 text-left transition-colors text-sm font-bold text-white border-b border-white/5"
                >
                  <Share2 size={16} /> Share Workout
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); setShowOptions(false); }}
                  className="w-full flex items-center gap-3 p-4 hover:bg-white/5 text-left transition-colors text-sm font-bold text-white border-b border-white/5"
                >
                  <Bookmark size={16} /> Save as Routine
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onCopy(post); setShowOptions(false); }}
                  className="w-full flex items-center gap-3 p-4 hover:bg-white/5 text-left transition-colors text-sm font-bold text-white border-b border-white/5"
                >
                  <Copy size={16} /> Copy Workout
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); setShowOptions(false); }}
                  className="w-full flex items-center gap-3 p-4 hover:bg-white/5 text-left transition-colors text-sm font-bold text-white border-b border-white/5"
                >
                  <Edit3 size={16} /> Edit Workout
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onDelete(post.id); setShowOptions(false); }}
                  className="w-full flex items-center gap-3 p-4 hover:bg-white/5 text-left transition-colors text-sm font-bold text-red-500"
                >
                  <Trash2 size={16} /> Delete Workout
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mb-6 cursor-pointer group" onClick={() => onViewSummary(post)}>
        <h2 className="text-2xl font-black mb-4 text-white leading-tight tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-white/60 transition-all">{post.title}</h2>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 pointer-events-none">
          <StatBox label="Time" value={post.stats.time} />
          <StatBox label="Volume" value={post.stats.volume} />
          <StatBox label="Sets" value={post.stats.sets} />
          {post.stats.prs > 0 && <StatBox label="PRs" value={post.stats.prs} highlight />}
        </div>
      </div>

      {(() => {
        const remainingCount = (post.exercises?.length || 0) - 3;
        return (
          <div className="bg-[#121212] p-4 rounded-[24px] border border-white/5 mb-6 cursor-pointer hover:border-white/10 transition-all" onClick={() => onViewSummary(post)}>
            <div className="space-y-3">
              {(post.exercises || []).slice(0, 3).map((ex, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[#8E8E93]">
                    <Dumbbell size={16} />
                  </div>
                  <span className="text-sm font-bold text-white flex-1">{ex.name}</span>
                </div>
              ))}
            </div>
            
            {remainingCount > 0 && (
              <div className="mt-4 pt-3 border-t border-white/5 text-center">
                <span className="text-xs font-bold text-[#8E8E93] hover:text-white transition-colors">
                  See {remainingCount} more {remainingCount === 1 ? 'exercise' : 'exercises'}
                </span>
              </div>
            )}
          </div>
        );
      })()}

      <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-4">
        <div className="flex gap-6 pt-2">
          <button 
            onClick={handleLike}
            className={`flex items-center gap-2 font-black transition-colors ${liked ? 'text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'text-[#8E8E93] hover:text-white'}`}
          >
            <Heart size={20} fill={liked ? "currentColor" : "none"} /> {likesCount}
          </button>
          <button 
            onClick={() => setShowComments(true)}
            className="flex items-center gap-2 font-black transition-colors text-[#8E8E93] hover:text-white"
          >
            <MessageCircle size={20} /> {post.comments + commentsList.length}
          </button>
          <button 
            className="flex items-center gap-2 font-black transition-colors text-[#8E8E93] hover:text-white"
          >
            <Share2 size={20} />
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
}
