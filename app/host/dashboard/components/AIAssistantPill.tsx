'use client';

import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export function AIAssistantPill() {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-8 right-8 bg-[#4F46E5] hover:bg-[#4338CA] text-white px-8 py-4 rounded-full shadow-[0_20px_40px_rgba(79,70,229,0.3)] flex items-center gap-3 z-maximum group border border-white/10"
    >
      <div className="relative">
        <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
        <div className="absolute inset-0 blur-lg bg-yellow-400/50 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <span className="font-black text-sm tracking-tight">Ask AI Assistant</span>
      
      {/* Decorative pulse ring */}
      <div className="absolute inset-0 rounded-full animate-ping bg-indigo-400/20 pointer-events-none" />
    </motion.button>
  );
}
