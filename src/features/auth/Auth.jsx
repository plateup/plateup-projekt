/**
 * Plik: Auth.jsx
 * Autorzy: Langier, Mietła, Jadwiszczok, Bogdański
 * Opis: Odpowiada za logowanie, autoryzację i zarządzanie sesją użytkownika.
 * Technologia: React / JSX / Tailwind CSS
 */

import React, { useState } from 'react';
import { Button, Card } from '../../components/ui';
import { supabase } from '../../services/supabaseClient';
import { Mail, Lock, Loader2, ChevronLeft, User } from 'lucide-react';

export default function Auth({ onBack }) {
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      try {
        if (Notification.permission === 'default') {
          await Notification.requestPermission();
        }
      } catch (error) {
        console.error("Failed to request notification permission:", error);
      }
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Ask for permission for rest timers/workout alerts
    await requestNotificationPermission();

    try {
      if (isRegister) {
        // 1. Sign up user
        const { data, error: signUpError } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: { username },
            emailRedirectTo: window.location.origin
          }
        });
        
        if (signUpError) throw signUpError;

        // 2. Create profile entry
        if (data.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([{ id: data.user.id, username, email, display_name: username }]);
          
          if (profileError) {
             console.error("Profile creation error:", profileError);
          }
        }
      } else {
        // Handle Login
        let loginEmail = email;

        // If 'email' doesn't look like an email, assume it's a username
        if (!email.includes('@')) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('email')
            .eq('username', email)
            .maybeSingle();
          
          if (profileError || !profile || !profile.email) {
            throw new Error('Username not found.');
          }
          loginEmail = profile.email;
        }

        const { error: signInError } = await supabase.auth.signInWithPassword({ email: loginEmail, password });
        if (signInError) throw signInError;
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F2F7] dark:bg-black px-4 py-12 flex flex-col">
      <button onClick={onBack} className="mb-8 flex items-center gap-2 font-bold text-[#8E8E93] w-fit">
        <ChevronLeft /> Back
      </button>

      <div className="max-w-md mx-auto w-full">
        <h1 className="text-4xl font-black mb-2">{isRegister ? 'Create Account' : 'Welcome Back'}</h1>
        <p className="text-[#8E8E93] mb-8 font-medium">
          {isRegister ? 'Start your fitness journey today.' : 'Enter your details to continue.'}
        </p>

        <form onSubmit={handleAuth} className="space-y-4">
          {isRegister && (
            <div className="relative animate-in fade-in slide-in-from-top-2 duration-300">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8E8E93]" size={20} />
              <input 
                type="text" 
                placeholder="Username"
                className="w-full bg-white dark:bg-[#1C1C1E] h-16 rounded-[20px] pl-12 pr-4 font-bold focus:ring-2 ring-black dark:ring-white outline-none transition-all shadow-sm"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8E8E93]" size={20} />
            <input 
              type={isRegister ? "email" : "text"} 
              placeholder={isRegister ? "Email Address" : "Email or Username"}
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

          {error && <p className="text-white/60 bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold">{error}</p>}

          <button type="submit" disabled={loading} className="w-full h-16 rounded-[20px] font-black text-lg bg-white text-black hover:bg-neutral-200 transition-all active:scale-95 shadow-lg flex items-center justify-center">
            {loading ? <Loader2 className="animate-spin" /> : (isRegister ? 'Sign Up' : 'Sign In')}
          </button>
        </form>

        <div className="my-8 flex items-center gap-4">
          <div className="h-px bg-white/10 flex-1" />
          <span className="text-[#8E8E93] text-sm font-bold uppercase tracking-widest">OR</span>
          <div className="h-px bg-white/10 flex-1" />
        </div>

        <button 
          onClick={async () => {
            await requestNotificationPermission();
            
            const redirectUrl = window.location.origin.includes('localhost') 
              ? 'http://localhost:5173' 
              : window.location.origin;

            await supabase.auth.signInWithOAuth({
              provider: 'google',
              options: { 
                redirectTo: redirectUrl,
                queryParams: {
                  access_type: 'offline',
                  prompt: 'consent',
                }
              }
            });
          }}
          className="w-full h-16 rounded-[20px] font-black text-lg bg-white/5 text-white hover:bg-white/10 border border-white/10 flex items-center justify-center gap-3 transition-all active:scale-95 shadow-md"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
             <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
             <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.86C4.04 20.64 7.73 23 12 23z" fill="#34A853"/>
             <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.05H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.95l3.66-2.86z" fill="#FBBC05"/>
             <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.73 1 4.04 3.36 2.18 7.05l3.66 2.86c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <button 
          onClick={() => setIsRegister(!isRegister)}
          className="w-full mt-8 text-center font-bold text-sm text-[#8E8E93] hover:text-white transition-colors"
        >
          {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
        </button>
      </div>
    </div>
  );
}
