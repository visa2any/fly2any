'use client';

import { TrendingUp, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export function SmartPricingBento() {
  const bars = [40, 60, 45, 55, 30, 80, 50, 65, 40, 55];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white rounded-[2rem] p-8 shadow-soft border border-neutral-100 flex flex-col h-full hover:shadow-soft-lg transition-all"
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <TrendingUp className="w-5 h-5" />
          </div>
          <h4 className="font-extrabold text-midnight-navy text-lg">Smart Pricing</h4>
        </div>
        <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">+12%</span>
      </div>

      {/* Mini Bar Chart */}
      <div className="flex items-end justify-between h-20 gap-1.5 mb-8 px-2">
        {bars.map((height, i) => (
          <div 
            key={i} 
            className={`w-full rounded-full transition-all duration-1000 ${i === 5 ? 'bg-[#4F46E5]' : 'bg-indigo-100'}`}
            style={{ height: `${height}%` }}
          />
        ))}
      </div>

      <div className="text-center mb-8">
        <h5 className="text-3xl font-black text-midnight-navy tracking-tight">+$40</h5>
        <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mt-1">Suggested adjustment for Oct 12-14</p>
      </div>

      <button className="w-full bg-[#0B1221] hover:bg-black text-white py-4 rounded-2xl font-black text-sm transition-all active:scale-[0.98]">
        Apply Adjustment
      </button>
    </motion.div>
  );
}
