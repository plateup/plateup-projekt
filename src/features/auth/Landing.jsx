/**
 * Plik: Landing.jsx
 * Autorzy: Langier, Mietła, Jadwiszczok, Bogdański
 * Opis: Moduł odpowiedzialny za logikę powiązaną z auth/Landing.jsx.
 * Technologia: React / JSX / Tailwind CSS
 */

import React from 'react';
import { Dumbbell, ArrowRight, Activity, Users } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Landing({ onGetStarted }) {
  return (
    <div className="bg-black text-white selection:bg-white/30 h-[100dvh] overflow-y-auto snap-y snap-proximity scroll-smooth no-scrollbar relative">
      
      {/* Navbar - Fixed */}
      <nav className="fixed top-0 w-full p-6 flex justify-between items-center z-50 mix-blend-difference pointer-events-none">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <Dumbbell className="text-black" size={16} strokeWidth={3} />
          </div>
          <span className="font-black tracking-tight text-xl text-white">PlateUp</span>
        </div>
        <button onClick={onGetStarted} className="pointer-events-auto text-sm font-bold text-white hover:opacity-70 transition-opacity">
          Sign In
        </button>
      </nav>

      {/* Hero Section */}
      <div className="snap-start snap-always w-full h-[100dvh] flex flex-col items-center justify-center relative overflow-hidden shrink-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] bg-white/[0.03] rounded-full blur-[100px] -z-10 pointer-events-none" />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: false, amount: 0.5 }}
          className="text-center px-4"
        >
          <h1 className="text-6xl md:text-8xl lg:text-[10rem] font-black tracking-tighter leading-[0.9] mb-6">
            Pro. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20">
              Without compromise.
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-white/50 font-bold max-w-lg mx-auto mb-10">
            Scroll down to discover the future of workout tracking.
          </p>
        </motion.div>
      </div>

      {/* Feature 1 Section */}
      <div className="snap-start snap-always w-full h-[100dvh] flex items-center justify-center relative shrink-0">
        <motion.div 
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: false, amount: 0.5 }}
          className="w-full max-w-6xl px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
        >
          <div>
            <div className="w-16 h-16 rounded-[24px] bg-white/10 flex items-center justify-center mb-8 shadow-2xl">
              <Activity size={32} className="text-white" />
            </div>
            <h2 className="text-5xl md:text-7xl font-black tracking-tight mb-6">Log with<br/>precision.</h2>
            <p className="text-xl text-white/50 font-bold">
              Instant auto-fill. Smart rest timers. RPE tracking. Everything you need to focus purely on the lift, not the app.
            </p>
          </div>
          <motion.div 
            initial={{ scale: 0.8 }}
            whileInView={{ scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: false, amount: 0.5 }}
            className="relative h-[600px] w-full max-w-sm mx-auto bg-[#1C1C1E] border-[8px] border-black rounded-[50px] shadow-[0_0_100px_rgba(255,255,255,0.1)] overflow-hidden"
          >
            {/* Fake App UI */}
            <div className="absolute top-12 left-6 right-6 space-y-4">
              <div className="h-10 w-3/4 bg-white/10 rounded-xl" />
              <div className="space-y-2 pt-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-16 w-full bg-white/5 rounded-2xl flex items-center px-4 gap-4">
                    <div className="w-8 h-8 rounded-full bg-white/10" />
                    <div className="h-4 w-1/3 bg-white/10 rounded" />
                    <div className="h-8 w-8 rounded-lg bg-white text-black ml-auto flex items-center justify-center text-xs font-black">✓</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-1/3 h-1.5 bg-white/20 rounded-full" />
          </motion.div>
        </motion.div>
      </div>

      {/* Feature 2 Section */}
      <div className="snap-start snap-always w-full h-[100dvh] flex items-center justify-center relative shrink-0">
        <motion.div 
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: false, amount: 0.5 }}
          className="w-full max-w-6xl px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
        >
          <motion.div 
            initial={{ rotate: 10, scale: 0.9 }}
            whileInView={{ rotate: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: false, amount: 0.5 }}
            className="order-2 md:order-1 relative h-[600px] w-full max-w-sm mx-auto bg-white border-[8px] border-[#2C2C2E] rounded-[50px] shadow-[0_0_100px_rgba(255,255,255,0.2)] overflow-hidden text-black"
          >
            {/* Fake App UI - Social */}
            <div className="absolute top-12 left-6 right-6 space-y-6">
              <div className="h-8 w-1/2 bg-black/10 rounded-lg mb-8" />
              {[1, 2].map(i => (
                <div key={i} className="p-4 rounded-[24px] bg-black/5">
                  <div className="flex gap-3 items-center mb-4">
                    <div className="w-10 h-10 rounded-full bg-black/10" />
                    <div className="space-y-1">
                      <div className="h-3 w-20 bg-black/20 rounded" />
                      <div className="h-2 w-12 bg-black/10 rounded" />
                    </div>
                  </div>
                  <div className="h-6 w-3/4 bg-black/20 rounded mb-4" />
                  <div className="flex gap-2">
                    <div className="h-10 flex-1 bg-black/10 rounded-xl" />
                    <div className="h-10 flex-1 bg-black/10 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
          <div className="order-1 md:order-2">
            <div className="w-16 h-16 rounded-[24px] bg-white text-black flex items-center justify-center mb-8 shadow-2xl">
              <Users size={32} />
            </div>
            <h2 className="text-5xl md:text-7xl font-black tracking-tight mb-6">Train together.</h2>
            <p className="text-xl text-white/50 font-bold">
              Follow your friends, copy their routines with one tap, and celebrate every PR as a team.
            </p>
          </div>
        </motion.div>
      </div>

      {/* CTA Section */}
      <div className="snap-start snap-always w-full h-[100dvh] flex items-center justify-center relative shrink-0">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: false, amount: 0.5 }}
          className="text-center px-4"
        >
          <div className="w-24 h-24 mx-auto bg-white rounded-[32px] flex items-center justify-center mb-8 shadow-[0_0_80px_rgba(255,255,255,0.4)]">
            <Dumbbell className="text-black" size={48} strokeWidth={3} />
          </div>
          <h2 className="text-6xl md:text-8xl font-black tracking-tighter mb-8">
            Ready to lift?
          </h2>
          <button 
            onClick={onGetStarted}
            className="bg-white text-black px-10 py-5 rounded-[24px] font-black text-xl flex items-center justify-center gap-3 mx-auto hover:scale-105 active:scale-95 transition-transform shadow-2xl"
          >
            Start for free <ArrowRight size={24} strokeWidth={3} />
          </button>
        </motion.div>
      </div>

    </div>
  );
}
