import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, Calendar, Zap, Award } from 'lucide-react';

const volumeData = [
  { name: 'Mon', volume: 4500 },
  { name: 'Tue', volume: 5200 },
  { name: 'Wed', volume: 0 },
  { name: 'Thu', volume: 6100 },
  { name: 'Fri', volume: 4800 },
  { name: 'Sat', volume: 7200 },
  { name: 'Sun', volume: 0 },
];

const prData = [
  { date: '1 May', weight: 80 },
  { date: '10 May', weight: 85 },
  { date: '15 May', weight: 85 },
  { date: '22 May', weight: 92.5 },
  { date: '1 Jun', weight: 95 },
  { date: '5 Jun', weight: 100 },
];

export default function Stats() {
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
          value="24"
          subValue="+12% this month"
          subColor="text-white/60"
        />
        <StatCard 
          icon={<Zap className="text-white" size={24} />}
          label="Total Volume"
          value="142t"
          subValue="+8% this month"
          subColor="text-white/60"
        />
        <StatCard 
          icon={<Calendar className="text-white" size={24} />}
          label="Current Streak"
          value="5 days"
          subValue="Personal Best: 12"
          subColor="text-[#8E8E93]"
        />
        <StatCard 
          icon={<Award className="text-white" size={24} />}
          label="Records"
          value="14"
          subValue="3 in last 7 days"
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
              <BarChart data={volumeData}>
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

        {/* PR Progression */}
        <div className="bg-[#1C1C1E] p-8 rounded-[40px] border border-[#2C2C2E]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-black text-xl">Strength Progress</h3>
            <span className="text-[10px] text-white font-black uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full">BENCH PRESS</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={prData}>
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
          <div className="mt-6 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-[#8E8E93]">
            <span>May 1, 2026</span>
            <span>Today</span>
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
