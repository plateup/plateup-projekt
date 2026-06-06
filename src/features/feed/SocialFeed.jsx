import React from 'react';
import { Card, Avatar } from '../../components/ui';
import { MoreHorizontal, Heart, MessageCircle, Share2, Award } from 'lucide-react';

const WorkoutPost = ({ post }) => {
  return (
    <Card className="mb-6 border border-[#E5E5EA] dark:border-[#2C2C2E]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Avatar name={post.user.name} src={post.user.avatar} />
          <div>
            <h3 className="font-bold text-lg">{post.user.name}</h3>
            <p className="text-sm text-[#8E8E93]">{post.timeAgo}</p>
          </div>
        </div>
        <button className="text-[#8E8E93]"><MoreHorizontal /></button>
      </div>

      <div className="mb-4">
        <h2 className="text-2xl font-black mb-2 leading-tight">{post.title}</h2>
        <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
          <StatBox label="Time" value={post.stats.time} icon="🕒" />
          <StatBox label="Volume" value={post.stats.volume} icon="⚖️" />
          <StatBox label="Sets" value={post.stats.sets} icon="🔢" />
          {post.stats.prs > 0 && (
            <StatBox label="PRs" value={post.stats.prs} icon="🏆" highlight />
          )}
        </div>
      </div>

      <div className="space-y-3 mb-6">
        {post.exercises.map((ex, i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b border-[#F2F2F7] dark:border-[#2C2C2E] last:border-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#F2F2F7] dark:bg-[#2C2C2E] flex items-center justify-center font-bold text-blue-500">
                {ex.name[0]}
              </div>
              <div>
                <p className="font-bold">{ex.name}</p>
                <p className="text-xs text-[#8E8E93]">{ex.sets} Sets • Best: {ex.best}</p>
              </div>
            </div>
            {ex.isPR && <Award size={18} className="text-yellow-500 fill-yellow-500" />}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-[#F2F2F7] dark:border-[#2C2C2E]">
        <div className="flex gap-6">
          <button className="flex items-center gap-2 font-bold"><Heart size={22} /> {post.likes}</button>
          <button className="flex items-center gap-2 font-bold text-[#8E8E93]"><MessageCircle size={22} /> {post.comments}</button>
        </div>
        <button className="bg-[#F2F2F7] dark:bg-[#2C2C2E] px-4 py-2 rounded-full text-sm font-bold">Copy Routine</button>
      </div>
    </Card>
  );
};

const StatBox = ({ label, value, icon, highlight }) => (
  <div className={`flex flex-col items-start min-w-[80px] p-3 rounded-2xl ${highlight ? 'bg-yellow-100 dark:bg-yellow-900/30' : 'bg-[#F2F2F7] dark:bg-[#2C2C2E]'}`}>
    <span className="text-xs text-[#8E8E93] mb-1">{label}</span>
    <span className={`font-black text-sm flex items-center gap-1 ${highlight ? 'text-yellow-600 dark:text-yellow-400' : ''}`}>
       {value}
    </span>
  </div>
);

export default function SocialFeed() {
  const mockPosts = [
    {
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
        { name: 'Triceps Pushdown', sets: 3, best: '40kg x 12', isPR: true },
      ]
    }
  ];

  return (
    <div className="pb-8">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-black tracking-tight">Feed</h1>
        <div className="w-10 h-10 rounded-full bg-black dark:bg-white overflow-hidden" />
      </header>
      
      {mockPosts.map(post => (
        <WorkoutPost key={post.id} post={post} />
      ))}
    </div>
  );
}
