import React from 'react';
import { Button } from '../../components/ui';
import { Dumbbell, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Landing({ onGetStarted }) {
  return (
    <div className="min-h-screen bg-white dark:bg-black flex flex-col items-center justify-center px-6 text-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <div className="w-20 h-20 bg-black dark:bg-white rounded-[24px] flex items-center justify-center mx-auto mb-8 shadow-xl">
          <Dumbbell className="text-white dark:text-black" size={40} />
        </div>
        <h1 className="text-6xl font-black tracking-tighter mb-4 leading-none">
          PlateUp
        </h1>
        <p className="text-xl text-[#8E8E93] font-medium max-w-xs mx-auto">
          Elevate your training. Track like a pro.
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="w-full max-w-sm space-y-4"
      >
        <Button onClick={onGetStarted} variant="primary">
          Get Started <ArrowRight size={20} />
        </Button>
        <p className="text-sm text-[#8E8E93]">
          Join the community of 10,000+ athletes.
        </p>
      </motion.div>

      {/* Preview Cards Shadowy background effect */}
      <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-[#F2F2F7] dark:from-[#1C1C1E] to-transparent -z-10" />
    </div>
  );
}
