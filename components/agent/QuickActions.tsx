'use client';

// components/agent/QuickActions.tsx
// Level 6 Ultra-Premium Apple-Class Quick Actions
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Plus, UserPlus, Calendar, Wallet, Search, FileText, ChevronRight } from 'lucide-react';

export default function QuickActions() {
  const actions = [
    {
      name: 'New Quote',
      description: 'Build a multi-product quote',
      href: '/agent/quotes/workspace',
      icon: Plus,
      gradient: 'from-primary-500 to-rose-500',
      shadowColor: 'shadow-primary-500/25',
    },
    {
      name: 'Add Client',
      description: 'Add to your CRM',
      href: '/agent/clients/create',
      icon: UserPlus,
      gradient: 'from-blue-500 to-cyan-500',
      shadowColor: 'shadow-blue-500/25',
    },
    {
      name: 'Search Flights',
      description: 'Find best fares',
      href: '/agent/quotes/workspace?step=search',
      icon: Search,
      gradient: 'from-violet-500 to-purple-500',
      shadowColor: 'shadow-violet-500/25',
    },
    {
      name: 'View Bookings',
      description: 'Manage active trips',
      href: '/agent/bookings',
      icon: Calendar,
      gradient: 'from-emerald-500 to-teal-500',
      shadowColor: 'shadow-emerald-500/25',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 150, damping: 20 },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"
    >
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <motion.div key={action.name} variants={itemVariants}>
            <Link href={action.href} className="block group">
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${action.gradient} p-4 md:p-5 text-white shadow-lg ${action.shadowColor} hover:shadow-xl transition-shadow duration-300`}
              >
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <svg className="w-full h-full" viewBox="0 0 80 80">
                    <pattern id={`grid-${action.name}`} width="20" height="20" patternUnits="userSpaceOnUse">
                      <circle cx="10" cy="10" r="1" fill="currentColor" />
                    </pattern>
                    <rect width="100%" height="100%" fill={`url(#grid-${action.name})`} />
                  </svg>
                </div>

                {/* Content */}
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 md:w-11 md:h-11 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
                      <Icon className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2} />
                    </div>
                    <motion.div
                      initial={{ x: 0, opacity: 0.6 }}
                      whileHover={{ x: 3, opacity: 1 }}
                      className="hidden md:block"
                    >
                      <ChevronRight className="w-5 h-5 opacity-60 group-hover:opacity-100 transition-opacity" />
                    </motion.div>
                  </div>

                  <h3 className="font-semibold text-sm md:text-base">{action.name}</h3>
                  <p className="text-xs md:text-sm text-white/80 mt-0.5">{action.description}</p>
                </div>

                {/* Decorative Element */}
                <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-white/5 rounded-full blur-xl" />
              </motion.div>
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
