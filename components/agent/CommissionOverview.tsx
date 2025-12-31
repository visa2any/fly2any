'use client';

// components/agent/CommissionOverview.tsx
// Level 6 Ultra-Premium Apple-Class Commission Overview
import { motion } from 'framer-motion';
import Link from 'next/link';
import { CheckCircle, Clock, Wallet, ArrowRight, TrendingUp } from 'lucide-react';

interface CommissionOverviewProps {
  data: {
    available: number;
    pending: number;
    paid: number;
    total: number;
  };
}

export default function CommissionOverview({ data }: CommissionOverviewProps) {
  const breakdown = [
    {
      label: 'Available',
      amount: data.available,
      icon: CheckCircle,
      gradient: 'from-emerald-500 to-teal-500',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700',
      description: 'Ready to withdraw',
    },
    {
      label: 'Pending',
      amount: data.pending,
      icon: Clock,
      gradient: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-700',
      description: 'In hold period',
    },
    {
      label: 'Paid Out',
      amount: data.paid,
      icon: Wallet,
      gradient: 'from-blue-500 to-indigo-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      description: 'Lifetime payouts',
    },
  ];

  const availablePercentage = data.total > 0 ? (data.available / data.total) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.05),0_4px_12px_rgba(0,0,0,0.03)] border border-gray-100/80 overflow-hidden"
    >
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Commissions</h2>
            <p className="text-sm text-gray-500">
              Lifetime: <span className="font-medium text-gray-900">${data.total.toLocaleString()}</span>
            </p>
          </div>
        </div>
        <Link
          href="/agent/commissions"
          className="flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors group"
        >
          View All
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="p-6">
        <div className="grid grid-cols-3 gap-4 mb-6">
          {breakdown.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + idx * 0.1 }}
                className={`${item.bgColor} rounded-xl p-4 relative overflow-hidden`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`w-4 h-4 ${item.textColor}`} />
                  <span className="text-xs font-medium text-gray-600">{item.label}</span>
                </div>
                <p className={`text-xl md:text-2xl font-bold ${item.textColor}`}>
                  ${item.amount.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">{item.description}</p>

                {/* Subtle gradient decoration */}
                <div className={`absolute -bottom-2 -right-2 w-16 h-16 rounded-full bg-gradient-to-br ${item.gradient} opacity-10 blur-xl`} />
              </motion.div>
            );
          })}
        </div>

        {/* Progress Bar */}
        {data.total > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600">Availability</span>
              <span className="font-medium text-gray-900">{availablePercentage.toFixed(0)}%</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${availablePercentage}%` }}
                transition={{ delay: 0.6, duration: 0.8, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
              />
            </div>
          </motion.div>
        )}

        {/* Payout Button */}
        {data.available > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-6"
          >
            <Link href="/agent/payouts/request">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all"
              >
                <Wallet className="w-5 h-5" />
                Request Payout (${data.available.toLocaleString()})
              </motion.button>
            </Link>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
