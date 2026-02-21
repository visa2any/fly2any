'use client';

import { Wrench, Calendar, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export function MaintenanceAlert() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white rounded-[2rem] p-8 shadow-soft border border-neutral-100 flex flex-col h-full hover:shadow-soft-lg transition-all relative overflow-hidden"
    >
      {/* Red accent blob */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-red-50 rounded-full blur-3xl opacity-50" />

      <div className="flex items-center justify-between mb-8 z-10">
        <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-500">
          <Wrench className="w-6 h-6" />
        </div>
      </div>

      <div className="z-10 mb-10">
        <h4 className="font-extrabold text-midnight-navy text-xl mb-1">HVAC Service</h4>
        <span className="text-[10px] font-black text-red-600 bg-red-50 px-2.5 py-1 rounded uppercase tracking-widest">Due Immediately</span>
      </div>

      <div className="bg-neutral-50 rounded-2xl p-4 flex items-center justify-between mb-8 z-10 group cursor-pointer hover:bg-neutral-100 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center">
            <Calendar className="w-5 h-5 text-neutral-400" />
          </div>
          <div>
            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest leading-tight">Unit 48</p>
            <p className="text-sm font-bold text-midnight-navy">Schedule Now</p>
          </div>
        </div>
        <ArrowRight className="w-5 h-5 text-neutral-200 group-hover:text-midnight-navy transition-all group-hover:translate-x-1" />
      </div>

      <div className="absolute bottom-6 right-8 opacity-5 font-black text-6xl pointer-events-none">
        48
      </div>
    </motion.div>
  );
}
