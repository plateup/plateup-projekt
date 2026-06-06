import React, { useState } from 'react';
import { Button, Card } from '../../components/ui';
import { supabase } from '../../services/supabaseClient';
import { Mail, Lock, Loader2, ChevronLeft } from 'lucide-react';

export default function Auth({ onBack }) {
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = isRegister 
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (error) setError(error.message);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F2F2F7] dark:bg-black px-4 py-12 flex flex-col">
      <button onClick={onBack} className="mb-8 flex items-center gap-2 font-bold text-[#8E8E93]">
        <ChevronLeft /> Back
      </button>

      <div className="max-w-md mx-auto w-full">
        <h1 className="text-4xl font-black mb-2">{isRegister ? 'Create Account' : 'Welcome Back'}</h1>
        <p className="text-[#8E8E93] mb-8 font-medium">
          {isRegister ? 'Start your fitness journey today.' : 'Enter your details to continue.'}
        </p>

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8E8E93]" size={20} />
            <input 
              type="email" 
              placeholder="Email Address"
              className="w-full bg-white dark:bg-[#1C1C1E] h-16 rounded-[20px] pl-12 pr-4 font-bold focus:ring-2 ring-black dark:ring-white outline-none transition-all shadow-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8E8E93]" size={20} />
            <input 
              type="password" 
              placeholder="Password"
              className="w-full bg-white dark:bg-[#1C1C1E] h-16 rounded-[20px] pl-12 pr-4 font-bold focus:ring-2 ring-black dark:ring-white outline-none transition-all shadow-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm font-bold px-2">{error}</p>}

          <Button type="submit" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : (isRegister ? 'Sign Up' : 'Sign In')}
          </Button>
        </form>

        <button 
          onClick={() => setIsRegister(!isRegister)}
          className="w-full mt-6 text-center font-bold text-sm"
        >
          {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
        </button>
      </div>
    </div>
  );
}
