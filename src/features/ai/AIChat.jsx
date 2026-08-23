/**
 * Plik: AIChat.jsx
 * Autorzy: Langier, Mietła, Jadwiszczok, Bogdański
 * Opis: Moduł odpowiedzialny za logikę powiązaną z ai/AIChat.jsx.
 * Technologia: React / JSX / Tailwind CSS
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User as UserIcon, ArrowRight, Save, Check } from 'lucide-react';
import { generateWorkoutRoutine } from '../../services/aiWorkoutService';
import { supabase } from '../../services/supabaseClient';

export default function AIChat({ onStartRoutine }) {
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('plateup_ai_chat');
    return saved ? JSON.parse(saved) : [{ role: 'assistant', text: 'Hey! I am your AI Coach. How can I help you train today?' }];
  });
  // Stan przechowujący zmienną: input
  const [input, setInput] = useState('');
  // Stan przechowujący zmienną: isLoading
  const [isLoading, setIsLoading] = useState(false);
  // Stan przechowujący zmienną: userAvatar
  const [userAvatar, setUserAvatar] = useState(() => localStorage.getItem('plateup_avatar') || null);
  const messagesEndRef = useRef(null);

  // Efekt uboczny (useEffect) uruchamiany po wyrenderowaniu komponentu lub zmianie zależności

  useEffect(() => {
    localStorage.setItem('plateup_ai_chat', JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Asynchroniczna funkcja: handleSend - odpowiada za operacje w tle (np. fetchowanie bazy)

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userInput = input.trim();
    
    if (userInput.toLowerCase() === '/clear') {
      setMessages([{ role: 'assistant', text: 'Chat history cleared. How can I help you train today?' }]);
      setInput('');
      return;
    }

    const userMessage = { role: 'user', text: userInput };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Send chat history
      const history = messages.map(m => ({ role: m.role, content: m.text })).concat({ role: 'user', content: input.trim() });
      
      const response = await generateWorkoutRoutine(history);
      
      const assistantMessage = { role: 'assistant', text: response.text };
      if (response.routine) {
        assistantMessage.routine = response.routine;
      }

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', text: "Sorry, I'm having trouble connecting to my brain. Please check your internet or API key." }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Stan przechowujący zmienną: savedRoutines

  const [savedRoutines, setSavedRoutines] = useState({});

  // Asynchroniczna funkcja: handleSaveRoutine - odpowiada za operacje w tle (np. fetchowanie bazy)

  const handleSaveRoutine = async (routineData, index) => {
    const exercisesList = Array.isArray(routineData.exercises) ? routineData.exercises : [];
    
    const newRoutine = {
      name: routineData.name || "AI Generated Workout",
      exercises: exercisesList.map((ex, i) => ({
        id: `ai-ex-${Date.now()}-${i}`,
        name: ex.name || 'Unknown Exercise',
        muscle_group: ex.muscle_group || 'Full Body',
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
    setSavedRoutines(prev => ({ ...prev, [index]: true }));
  };

  // Funkcja pomocnicza: handleStartRoutine

  const handleStartRoutine = (routineData) => {
    const exercisesList = Array.isArray(routineData.exercises) ? routineData.exercises : [];
    
    const newRoutine = {
      name: routineData.name || "AI Generated Workout",
      exercises: exercisesList.map((ex, i) => ({
        id: `ai-ex-${Date.now()}-${i}`,
        name: ex.name || 'Unknown Exercise',
        muscle_group: ex.muscle_group || 'Full Body',
        sets: Array.from({ length: ex.sets || 3 }).map((_, j) => ({
          id: `ai-s-${Date.now()}-${i}-${j}`,
          type: 'normal',
          kg: '',
          reps: '',
          rpe: '',
          isCompleted: false,
          prevKg: '',
          prevReps: '',
          prevRpe: ''
        }))
      }))
    };
    localStorage.setItem('plateup_pending_routine', JSON.stringify(newRoutine));
    onStartRoutine();
  };

  // Funkcja pomocnicza: handleKeyDown

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  // Zwraca interfejs użytkownika (JSX) dla tego komponentu

  return (
    <div className="flex flex-col h-[calc(100dvh-230px)] lg:h-[calc(100dvh-260px)] animate-in fade-in duration-500">
      <header className="mb-4 shrink-0">
        <h1 className="text-4xl font-black tracking-tight mb-2 flex items-center gap-3 text-white">
          <Bot size={36} className="text-white" /> AI Coach
        </h1>
        <p className="text-[#8E8E93] font-medium">Your specialized fitness assistant</p>
      </header>

      <div className="flex-1 overflow-y-auto mb-4 space-y-6 pr-2 no-scrollbar">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg border border-white/10 overflow-hidden ${msg.role === 'user' ? 'bg-white text-black' : 'bg-[#1C1C1E] text-white'}`}>
              {msg.role === 'user' ? (
                userAvatar ? <img src={userAvatar} alt="User" className="w-full h-full object-cover" /> : <UserIcon size={20} />
              ) : (
                <Bot size={20} />
              )}
            </div>
            <div className={`flex flex-col gap-2 max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`p-4 rounded-[24px] text-sm font-medium leading-relaxed whitespace-pre-wrap ${msg.role === 'user' ? 'bg-white text-black rounded-tr-sm shadow-sm' : 'bg-[#1C1C1E] border border-white/5 text-white rounded-tl-sm shadow-sm'}`}>
                {msg.text}
              </div>
              
              {msg.routine && (
                <div className="bg-[#1C1C1E] border border-white/10 rounded-[24px] p-5 w-full mt-2 shadow-xl">
                  <h4 className="text-lg font-black text-white mb-4">{msg.routine.name || "Workout Routine"}</h4>
                  <div className="space-y-3 mb-6">
                    {Array.isArray(msg.routine.exercises) ? msg.routine.exercises.map((ex, i) => (
                      <div key={i} className="flex justify-between items-center bg-black/40 p-3 rounded-xl border border-white/5">
                        <span className="font-bold text-sm text-white">{ex.name}</span>
                        <span className="text-xs text-[#8E8E93] font-bold">{ex.sets || 3} Sets</span>
                      </div>
                    )) : (
                      <div className="text-[#8E8E93] text-sm">Failed to parse exercises.</div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleStartRoutine(msg.routine)}
                      disabled={!Array.isArray(msg.routine.exercises)}
                      className="flex-1 bg-white text-black py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-neutral-200 active:scale-95 transition-all shadow-lg"
                    >
                      Start <ArrowRight size={16} strokeWidth={3} />
                    </button>
                    <button 
                      onClick={() => handleSaveRoutine(msg.routine, idx)}
                      disabled={!Array.isArray(msg.routine.exercises) || savedRoutines[idx]}
                      className="flex-1 bg-[#1C1C1E] text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-white/5 active:scale-95 transition-all border border-white/10"
                    >
                      {savedRoutines[idx] ? <Check size={16} className="text-green-500" /> : <Save size={16} />}
                      {savedRoutines[idx] ? 'Saved' : 'Save Routine'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-2xl bg-[#1C1C1E] border border-white/10 flex items-center justify-center shrink-0 text-white shadow-lg">
              <Bot size={20} />
            </div>
            <div className="p-4 rounded-[24px] bg-[#1C1C1E] border border-white/5 rounded-tl-sm flex items-center gap-2 shadow-sm">
              <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" />
              <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
              <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="mt-auto shrink-0 pb-2">
        <div className="relative">
          <input 
            type="text" 
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything about fitness..."
            className="w-full h-16 bg-[#1C1C1E] border border-white/10 rounded-[24px] pl-6 pr-16 text-white font-medium outline-none focus:border-white/40 transition-colors shadow-lg placeholder:text-[#8E8E93]"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-[20px] bg-white text-black flex items-center justify-center disabled:opacity-50 hover:scale-105 active:scale-95 transition-all shadow-md"
          >
            <Send size={20} className="-ml-[2px] mt-[2px]" />
          </button>
        </div>
      </div>
    </div>
  );
}