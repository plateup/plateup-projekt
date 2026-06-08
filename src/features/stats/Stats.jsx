import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, Calendar, Zap, Award } from 'lucide-react';
import { format, subDays, parseISO } from 'date-fns';

export default function Stats() {
  const [statsData, setStatsData] = useState({
    workouts: 0,
    volume: 0,
    streak: 0,
    prs: 0,
    volumeData: [],
    prData: []
  });

  useEffect(() => {
    const posts = JSON.parse(localStorage.getItem('plateup_posts') || '[]');
    
    // Calculate total workouts
    const workoutsCount = posts.length;
    
    // Calculate volume
    let totalVolume = 0;
    let totalPrs = 0;
    
    posts.forEach(p => {
      if (p.stats && p.stats.volume) {
        totalVolume += parseFloat(p.stats.volume.replace(/[^0-9.]/g, '')) || 0;
      }
      if (p.stats && p.stats.prs) {
        totalPrs += parseInt(p.stats.prs, 10);
      }
    });

    // Volume Chart Data (Last 7 Days)
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = subDays(new Date(), 6 - i);
      return { name: format(d, 'EEE'), dateStr: format(d, 'yyyy-MM-dd'), volume: 0 };
    });

    posts.forEach(p => {
      if (p.created_at) {
        const pDate = format(parseISO(p.created_at), 'yyyy-MM-dd');
        const day = last7Days.find(d => d.dateStr === pDate);
        if (day && p.stats && p.stats.volume) {
          day.volume += parseFloat(p.stats.volume.replace(/[^0-9.]/g, '')) || 0;
        }
      }
    });

    // Dummy PR data or calculate from actual exercise history if needed
    // For now we'll use a placeholder body weight chart since user requested weight chart
    const bodyWeightData = JSON.parse(localStorage.getItem('plateup_body_weight') || '[{"date": "1 May", "weight": 80}, {"date": "15 May", "weight": 79.5}]');

    setStatsData({
      workouts: workoutsCount,
      volume: totalVolume,
      streak: workoutsCount > 0 ? 1 : 0, // Simplified streak
      prs: totalPrs,
      volumeData: last7Days,
      weightData: bodyWeightData
    });

  }, []);

  const addWeight = () => {
    const w = prompt("Enter new weight (kg):");
    if (w) {
      const data = [...statsData.weightData, { date: format(new Date(), 'd MMM'), weight: parseFloat(w) }];
      localStorage.setItem('plateup_body_weight', JSON.stringify(data));
      setStatsData(prev => ({ ...prev, weightData: data }));
    }
  };

  return (
    <div className="animate-in fade-in duration-700">
      <header className="mb-12">
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-2">Statistics</h1>
        <p className="text-[#8E8E93] font-bold">Your long-term performance data</p>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard 
          icon={<TrendingUp className="text-white" size={24} />}
          label="Workouts"
          value={statsData.workouts}
          subValue="Lifetime"
          subColor="text-white/60"
        />
        <StatCard 
          icon={<Zap className="text-white" size={24} />}
          label="Total Volume"
          value={`${Math.round(statsData.volume / 1000)}t`}
          subValue={`${statsData.volume} kg`}
          subColor="text-white/60"
        />
        <StatCard 
          icon={<Calendar className="text-white" size={24} />}
          label="Current Streak"
          value={`${statsData.streak} days`}
          subValue="Keep going!"
          subColor="text-[#8E8E93]"
        />
        <StatCard 
          icon={<Award className="text-white" size={24} />}
          label="Records"
          value={statsData.prs}
          subValue="All time PRs"
          subColor="text-white/40"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Volume Chart */}
        <div className="bg-[#1C1C1E] p-8 rounded-[40px] border border-[#2C2C2E]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-black text-xl">Weekly Volume</h3>
            <span className="text-[10px] text-[#8E8E93] font-black uppercase tracking-widest bg-black px-3 py-1 rounded-full">KILOGRAMS</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statsData.volumeData}>
                <Bar dataKey="volume" fill="white" radius={[6, 6, 6, 6]} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#8E8E93', fontSize: 10, fontWeight: 'bold'}} 
                  dy={10} 
                />
                <Tooltip 
                  cursor={{fill: 'white', opacity: 0.05}}
                  contentStyle={{backgroundColor: '#000', border: '1px solid #2C2C2E', borderRadius: '16px', fontWeight: 'bold'}}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Body Weight Progression */}
        <div className="bg-[#1C1C1E] p-8 rounded-[40px] border border-[#2C2C2E]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-black text-xl">Body Weight</h3>
            <button 
              onClick={addWeight}
              className="text-[10px] text-black font-black uppercase tracking-widest bg-white hover:bg-neutral-200 px-3 py-1 rounded-full active:scale-95 transition-all"
            >
              + ADD LOG
            </button>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={statsData.weightData}>
                <Line 
                  type="monotone" 
                  dataKey="weight" 
                  stroke="white" 
                  strokeWidth={5} 
                  dot={{r: 5, fill: 'white', strokeWidth: 0}} 
                  activeDot={{r: 8, strokeWidth: 0}} 
                />
                <XAxis dataKey="date" hide />
                <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
                <Tooltip 
                  contentStyle={{backgroundColor: '#000', border: '1px solid #2C2C2E', borderRadius: '16px', fontWeight: 'bold'}}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, subValue, subColor }) {
  return (
    <div className="bg-[#1C1C1E] p-8 rounded-[40px] border border-[#2C2C2E] shadow-sm hover:border-[#3C3C3E] transition-all">
      <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center mb-6">
        {icon}
      </div>
      <span className="text-[10px] text-[#8E8E93] font-black uppercase tracking-widest mb-1 block">{label}</span>
      <h4 className="text-3xl font-black mb-1">{value}</h4>
      <p className={`text-[10px] font-bold ${subColor}`}>{subValue}</p>
    </div>
  );
}
