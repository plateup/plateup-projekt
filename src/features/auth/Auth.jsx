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

  const [isEmailSent, setIsEmailSent] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

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
        
        setIsEmailSent(true);
      } else {
        // Handle Login
        let loginEmail = email;

        // If 'email' doesn't look like an email, assume it's a username
        if (!email.includes('@')) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('email')
            .eq('username', email)
            .single();
          
          if (profileError || !profile || !profile.email) {
            throw new Error('Username not found or no email associated.');
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

  if (isEmailSent) {
    return (
      <div className="min-h-screen bg-[#F2F2F7] dark:bg-black px-4 py-12 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
          <Mail className="text-green-600 dark:text-green-400" size={32} />
        </div>
        <h1 className="text-3xl font-black mb-4">Check your email</h1>
        <p className="text-[#8E8E93] max-w-xs mb-8 font-medium">
          We've sent a verification link to <span className="text-black dark:text-white font-bold">{email}</span>. Please click it to activate your account.
        </p>
        <Button onClick={onBack} variant="secondary">Back to Landing</Button>
      </div>
    );
  }

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
