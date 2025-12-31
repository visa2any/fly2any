'use client';

// components/agency/AgencyDashboardContent.tsx
// Level 6 Ultra-Premium Agency Dashboard
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Users, FileText, TrendingUp, DollarSign, ArrowUpRight,
  Plus, BarChart3, UserPlus, Percent, ChevronRight
} from 'lucide-react';

interface DashboardData {
  teamCount: number;
  totalQuotes: number;
  totalBookings: number;
  totalRevenue: number;
  recentActivity: Array<{
    id: string;
    confirmationNumber: string;
    tripName: string;
    total: number;
    createdAt: Date;
    agent: { firstName: string | null; lastName: string | null };
    client: { firstName: string; lastName: string };
  }>;
}

export default function AgencyDashboardContent({ data }: { data: DashboardData }) {
  const stats = [
    {
      name: 'Team Members',
      value: data.teamCount,
      icon: Users,
      gradient: 'from-blue-500 to-indigo-600',
      href: '/agency/team',
    },
    {
      name: 'Total Quotes',
      value: data.totalQuotes,
      icon: FileText,
      gradient: 'from-violet-500 to-purple-600',
      href: '/agency/analytics',
    },
    {
      name: 'Bookings',
      value: data.totalBookings,
      icon: TrendingUp,
      gradient: 'from-emerald-500 to-teal-600',
      href: '/agency/analytics',
    },
    {
      name: 'Revenue',
      value: `$${data.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      gradient: 'from-amber-500 to-orange-600',
      href: '/agency/payouts',
    },
  ];

  const quickActions = [
    { name: 'Invite Agent', icon: UserPlus, href: '/agency/team/invite', gradient: 'from-blue-500 to-cyan-500' },
    { name: 'Markup Rules', icon: Percent, href: '/agency/markup-rules', gradient: 'from-violet-500 to-purple-500' },
    { name: 'View Analytics', icon: BarChart3, href: '/agency/analytics', gradient: 'from-emerald-500 to-teal-500' },
  ];

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-gray-900">Agency Dashboard</h1>
        <p className="text-gray-600 mt-1">Manage your team and track performance</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Link href={stat.href}>
                <motion.div
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="relative overflow-hidden bg-white rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_4px_12px_rgba(0,0,0,0.03)] border border-gray-100 group"
                >
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-3 shadow-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-sm text-gray-500 mb-1">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <ArrowUpRight className="absolute top-4 right-4 w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                </motion.div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-3 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.name} href={action.href}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative overflow-hidden bg-gradient-to-br ${action.gradient} rounded-2xl p-4 text-white shadow-lg`}
                >
                  <Icon className="w-6 h-6 mb-2" />
                  <p className="font-semibold text-sm">{action.name}</p>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.05),0_4px_12px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Recent Team Activity</h2>
          <Link href="/agency/analytics" className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="divide-y divide-gray-50">
          {data.recentActivity.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <FileText className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No recent activity yet</p>
            </div>
          ) : (
            data.recentActivity.map((item) => (
              <div key={item.id} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.tripName}</p>
                  <p className="text-xs text-gray-500">
                    {item.agent.firstName} {item.agent.lastName} • {item.client.firstName} {item.client.lastName}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">${item.total.toLocaleString()}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
