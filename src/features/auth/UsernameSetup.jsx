/**
 * Plik: UsernameSetup.jsx
 * Autorzy: Langier, Mietła, Jadwiszczok, Bogdański
 * Opis: Moduł odpowiedzialny za logikę powiązaną z auth/UsernameSetup.jsx.
 * Technologia: React / JSX / Tailwind CSS
 */

import React, { useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import { User, Loader2, ArrowRight } from 'lucide-react';

export default function UsernameSetup({ onComplete }) {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Check if username is taken
      const { data: existing } = await supabase.from('profiles').select('id').eq('username', username.trim()).maybeSingle();
      if (existing && existing.id !== user.id) {
        throw new Error("Username is already taken.");
      }

      // Upsert profile
      const { error: updateError } = await supabase.from('profiles').upsert({ 
        id: user.id, 
        username: username.trim(), 
        display_name: username.trim(),
        email: user.email,
        avatar_url: user.user_metadata?.avatar_url
      });
      if (updateError) throw updateError;

      localStorage.setItem('plateup_username', username.trim());
      onComplete();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black px-4 py-12 flex flex-col items-center justify-center text-white selection:bg-white/30">
      <div className="max-w-md mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="w-20 h-20 bg-white rounded-[24px] flex items-center justify-center mb-8 shadow-[0_0_80px_rgba(255,255,255,0.2)] mx-auto">
          <User className="text-black" size={40} strokeWidth={2.5} />
        </div>
        <h1 className="text-4xl font-black mb-3 text-center tracking-tight">Pick a username</h1>
        <p className="text-[#8E8E93] mb-10 font-bold text-center">This is how your friends will find you on PlateUp.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8E8E93]" size={20} />
            <input 
              type="text" 
              placeholder="Username"
              className="w-full bg-[#1C1C1E] h-16 rounded-[20px] pl-12 pr-4 font-bold text-white focus:ring-2 ring-white outline-none transition-all shadow-sm border border-white/5"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              required
              maxLength={20}
            />
          </div>

          {error && <p className="text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl py-3 px-4 text-sm font-bold text-center">{error}</p>}

          <button type="submit" disabled={loading || !username.trim()} className="w-full h-16 rounded-[20px] font-black text-lg bg-white text-black hover:bg-neutral-200 transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2 disabled:opacity-50">
            {loading ? <Loader2 className="animate-spin" /> : <>Complete Setup <ArrowRight size={20} strokeWidth={3} /></>}
          </button>
        </form>
      </div>
    </div>
  );
}
