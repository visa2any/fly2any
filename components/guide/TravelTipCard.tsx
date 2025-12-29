'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, Globe, Wallet, Cloud, Shield, Heart, Train } from 'lucide-react';

interface TravelTip {
  id: string;
  destination: string;
  category: 'visa' | 'currency' | 'weather' | 'safety' | 'culture' | 'transport';
  title: string;
  description: string;
  icon: string;
  details?: string[];
  urgency?: 'low' | 'medium' | 'high';
}

interface TravelTipCardProps {
  tip: TravelTip;
  expanded?: boolean;
}

const categoryConfig = {
  visa: {
    gradient: 'from-blue-500 to-indigo-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    icon: Globe,
    label: 'Visa & Entry'
  },
  currency: {
    gradient: 'from-emerald-500 to-green-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    icon: Wallet,
    label: 'Currency'
  },
  weather: {
    gradient: 'from-amber-400 to-orange-500',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    icon: Cloud,
    label: 'Weather'
  },
  safety: {
    gradient: 'from-red-500 to-rose-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-700',
    icon: Shield,
    label: 'Safety'
  },
  culture: {
    gradient: 'from-purple-500 to-violet-600',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-700',
    icon: Heart,
    label: 'Culture'
  },
  transport: {
    gradient: 'from-indigo-500 to-blue-600',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    text: 'text-indigo-700',
    icon: Train,
    label: 'Transport'
  },
};

const urgencyConfig = {
  low: {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    label: 'Good to Know',
    dot: 'bg-gray-400'
  },
  medium: {
    bg: 'bg-amber-100',
    text: 'text-amber-800',
    label: 'Important',
    dot: 'bg-amber-500'
  },
  high: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    label: 'Essential',
    dot: 'bg-red-500'
  },
};

export default function TravelTipCard({ tip, expanded = false }: TravelTipCardProps) {
  const [isExpanded, setIsExpanded] = useState(expanded);
  const config = categoryConfig[tip.category];
  const urgency = tip.urgency ? urgencyConfig[tip.urgency] : null;
  const CategoryIcon = config.icon;

  return (
    <motion.div
      className={`group relative bg-white rounded-2xl border ${config.border} overflow-hidden transition-all duration-300 hover:shadow-xl`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      layout
    >
      {/* Gradient accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${config.gradient}`} />

      {/* Urgency indicator */}
      {urgency && tip.urgency === 'high' && (
        <div className={`absolute top-3 right-3 w-2 h-2 ${urgency.dot} rounded-full animate-pulse`} />
      )}

      <div className="p-5 md:p-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={`flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-lg`}>
            <span className="text-2xl md:text-3xl">{tip.icon}</span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Tags */}
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${config.bg} ${config.text}`}>
                <CategoryIcon className="w-3 h-3" />
                {config.label}
              </span>
              {urgency && (
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${urgency.bg} ${urgency.text}`}>
                  {urgency.label}
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 leading-tight">
              {tip.title}
            </h3>

            {/* Description */}
            <p className="text-sm md:text-base text-gray-600 leading-relaxed">
              {tip.description}
            </p>
          </div>
        </div>

        {/* Expandable Details */}
        {tip.details && tip.details.length > 0 && (
          <>
            <motion.button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                isExpanded
                  ? `${config.bg} ${config.text}`
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
              whileTap={{ scale: 0.98 }}
            >
              {isExpanded ? 'Hide Details' : 'View Details'}
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown className="w-4 h-4" />
              </motion.div>
            </motion.button>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="overflow-hidden"
                >
                  <div className={`mt-4 pt-4 border-t ${config.border}`}>
                    <ul className="space-y-3">
                      {tip.details.map((detail, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-start gap-3"
                        >
                          <div className={`flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br ${config.gradient} flex items-center justify-center mt-0.5`}>
                            <Check className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-sm text-gray-700 leading-relaxed">{detail}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </motion.div>
  );
}
