'use client';

import { ArrowRight, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

export function PriorityMessage() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-[2rem] p-8 shadow-soft border border-neutral-100 flex flex-col h-full hover:shadow-soft-lg transition-all"
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" 
              alt="Sarah" 
              className="w-14 h-14 rounded-full object-cover shadow-sm bg-neutral-100"
            />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-yellow-400 border-4 border-white rounded-full" />
          </div>
          <div>
            <h4 className="font-extrabold text-midnight-navy text-lg">Sarah J.</h4>
            <span className="text-[10px] font-black text-primary-600 bg-primary-50 px-2 py-0.5 rounded uppercase tracking-widest">VIP Guest</span>
          </div>
        </div>
        <span className="text-xs font-bold text-neutral-300">2m ago</span>
      </div>

      <p className="text-neutral-500 font-medium leading-relaxed mb-8 italic">
        "Hi Alex, I was wondering if early check-in is available for our stay this weekend? We land at 10..."
      </p>

      <div className="mt-auto flex items-center gap-3">
        <button className="flex-1 bg-[#4F46E5] hover:bg-[#4338CA] text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98]">
          <MessageSquare className="w-4 h-4" />
          Respond
        </button>
        <button className="w-12 h-12 flex items-center justify-center rounded-2xl bg-neutral-50 text-neutral-400 hover:bg-neutral-100 hover:text-midnight-navy transition-all">
          <span className="text-xl leading-none">...</span>
        </button>
      </div>
    </motion.div>
  );
}
