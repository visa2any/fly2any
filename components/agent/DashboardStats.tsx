'use client';

// components/agent/DashboardStats.tsx
// Level 6 Ultra-Premium Apple-Class Dashboard Stats
import { motion } from 'framer-motion';
import { DollarSign, FileText, Users, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface DashboardStatsProps {
  data: {
    totalQuotes: number;
    totalBookings: number;
    totalClients: number;
    totalRevenue: number;
    thisMonth: {
      quotes: number;
      bookings: number;
      revenue: number;
    };
  };
}

const formatCurrency = (value: number) => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  }
  return `$${value.toLocaleString()}`;
};

export default function DashboardStats({ data }: DashboardStatsProps) {
  const stats = [
    {
      name: 'Total Revenue',
      value: formatCurrency(data.totalRevenue),
      subValue: data.thisMonth.revenue > 0
        ? `+${formatCurrency(data.thisMonth.revenue)} this month`
        : 'No revenue this month',
      trend: data.thisMonth.revenue > 0 ? 'up' : 'neutral',
      icon: DollarSign,
      gradient: 'from-emerald-500 to-teal-600',
      bgGlow: 'bg-emerald-500/10',
    },
    {
      name: 'Active Bookings',
      value: data.totalBookings.toLocaleString(),
      subValue: `${data.thisMonth.bookings} this month`,
      trend: data.thisMonth.bookings > 0 ? 'up' : 'neutral',
      icon: TrendingUp,
      gradient: 'from-blue-500 to-indigo-600',
      bgGlow: 'bg-blue-500/10',
    },
    {
      name: 'Open Quotes',
      value: data.totalQuotes.toLocaleString(),
      subValue: `${data.thisMonth.quotes} created this month`,
      trend: data.thisMonth.quotes > 0 ? 'up' : 'neutral',
      icon: FileText,
      gradient: 'from-violet-500 to-purple-600',
      bgGlow: 'bg-violet-500/10',
    },
    {
      name: 'Total Clients',
      value: data.totalClients.toLocaleString(),
      subValue: 'Active relationships',
      trend: 'neutral',
      icon: Users,
      gradient: 'from-orange-500 to-red-500',
      bgGlow: 'bg-orange-500/10',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
    >
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.name}
            variants={cardVariants}
            whileHover={{
              y: -4,
              transition: { type: 'spring', stiffness: 400, damping: 25 }
            }}
            className="group relative"
          >
            {/* Background Glow Effect */}
            <div className={`absolute inset-0 ${stat.bgGlow} rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

            {/* Card */}
            <div className="relative bg-white rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_4px_12px_rgba(0,0,0,0.03)] border border-gray-100/80 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:border-gray-200/80 transition-all duration-300">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" strokeWidth={2} />
                </div>

                {stat.trend !== 'neutral' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      stat.trend === 'up'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-red-50 text-red-700'
                    }`}
                  >
                    {stat.trend === 'up' ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3" />
                    )}
                    <span>Active</span>
                  </motion.div>
                )}
              </div>

              {/* Value */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
              >
                <p className="text-sm font-medium text-gray-500 mb-1">{stat.name}</p>
                <p className="text-3xl font-bold text-gray-900 tracking-tight">
                  {stat.value}
                </p>
              </motion.div>

              {/* Sub Value */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className={`mt-3 text-sm ${
                  stat.trend === 'up'
                    ? 'text-emerald-600'
                    : 'text-gray-500'
                }`}
              >
                {stat.subValue}
              </motion.p>

              {/* Progress Bar (subtle) */}
              <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: stat.trend === 'up' ? '75%' : '40%' }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.8, ease: 'easeOut' }}
                  className={`h-full rounded-full bg-gradient-to-r ${stat.gradient}`}
                />
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
