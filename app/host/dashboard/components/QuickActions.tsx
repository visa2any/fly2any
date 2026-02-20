'use client';

import Link from 'next/link';
import { Plus, Rocket, DollarSign, Shield, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRef } from 'react';

const ACTIONS = [
  {
    title: 'Create Listing',
    description: 'Add a new property to your portfolio',
    href: '/list-your-property/create',
    icon: Plus,
    gradient: 'from-blue-500 to-blue-600',
  },
  {
    title: 'Fast Track AI',
    description: 'Auto-generate listing with AI',
    href: '/list-your-property/create?fast=true',
    icon: Rocket,
    gradient: 'from-violet-500 to-fuchsia-600',
  },
  {
    title: 'Smart Pricing',
    description: 'Optimize yields automatically',
    href: '/host/properties',
    icon: Sparkles,
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    title: 'AI Co-Host',
    description: 'Set up inbox automation rules',
    href: '/host/properties',
    icon: Shield,
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    title: 'Revenue',
    description: 'View earnings and payouts',
    href: '/host/properties',
    icon: DollarSign,
    gradient: 'from-primary-500 to-primary-600',
  },
];

export function QuickActions() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, scale: 0.95, y: 10 },
    show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="w-full relative mt-4">
       <div className="flex items-center justify-between mb-4 px-1">
          <h3 className="text-xl font-bold text-gray-900 tracking-tight">Recommended Actions</h3>
       </div>
       
       <motion.div 
         ref={scrollRef}
         variants={container}
         initial="hidden"
         animate="show"
         className="flex gap-4 overflow-x-auto pb-6 -mx-4 px-4 sm:mx-0 sm:px-1 snap-x snap-mandatory no-scrollbar"
       >
          {ACTIONS.map((action) => (
             <motion.div key={action.title} variants={item} className="snap-start shrink-0">
                <Link 
                   href={action.href}
                   className="block w-64 p-6 rounded-3xl bg-white border border-neutral-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden h-full"
                >
                   {/* Background Gradient Blob */}
                   <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full bg-gradient-to-br ${action.gradient} opacity-[0.08] blur-2xl group-hover:scale-150 transition-transform duration-700`} />
                   
                   <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-5 shadow-inner text-white group-hover:scale-110 transition-transform duration-300`}>
                      <action.icon className="w-6 h-6" />
                   </div>
                   <h4 className="font-bold text-gray-900 mb-1.5 text-lg leading-tight transition-colors">
                      {action.title}
                   </h4>
                   <p className="text-sm text-gray-500 font-medium leading-snug">
                      {action.description}
                   </p>
                </Link>
             </motion.div>
          ))}
       </motion.div>
    </div>
  );
}
