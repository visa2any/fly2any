'use client';

// components/agent/RecentActivity.tsx
// Level 6 Ultra-Premium Apple-Class Recent Activity
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { FileText, CheckCircle, Clock, ArrowRight, XCircle, Eye, Inbox } from 'lucide-react';

interface RecentActivityProps {
  quotes: Array<{
    id: string;
    quoteNumber: string;
    tripName: string;
    destination: string;
    total: number;
    status: string;
    createdAt: Date;
    client: { firstName: string; lastName: string };
  }>;
  bookings: Array<{
    id: string;
    confirmationNumber: string;
    tripName: string;
    total: number;
    status: string;
    createdAt: Date;
    client: { firstName: string; lastName: string };
  }>;
}

export default function RecentActivity({ quotes, bookings }: RecentActivityProps) {
  const activities = [
    ...quotes.map((q) => ({ ...q, type: 'quote' as const, identifier: q.quoteNumber, link: `/agent/quotes/${q.id}` })),
    ...bookings.map((b) => ({ ...b, type: 'booking' as const, identifier: b.confirmationNumber, link: `/agent/bookings/${b.id}` })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  const getStatusConfig = (status: string, type: string) => {
    if (type === 'quote') {
      switch (status) {
        case 'ACCEPTED': return { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' };
        case 'SENT': return { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' };
        case 'VIEWED': return { icon: Eye, color: 'text-violet-600', bg: 'bg-violet-50' };
        case 'DECLINED': return { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' };
        default: return { icon: FileText, color: 'text-gray-600', bg: 'bg-gray-50' };
      }
    }
    switch (status) {
      case 'CONFIRMED': return { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' };
      case 'PENDING': return { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' };
      case 'COMPLETED': return { icon: CheckCircle, color: 'text-blue-600', bg: 'bg-blue-50' };
      case 'CANCELLED': return { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' };
      default: return { icon: FileText, color: 'text-gray-600', bg: 'bg-gray-50' };
    }
  };

  const getRelativeTime = (date: Date) => {
    const diffMs = Date.now() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.05),0_4px_12px_rgba(0,0,0,0.03)] border border-gray-100/80 overflow-hidden h-full"
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="font-semibold text-gray-900">Recent Activity</h2>
        <Link href="/agent/activity" className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium group">
          View All
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Activity List */}
      <div className="divide-y divide-gray-50">
        <AnimatePresence mode="popLayout">
          {activities.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Inbox className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-gray-600 text-sm">No recent activity</p>
              <Link href="/agent/quotes/create" className="inline-block mt-2 text-sm text-primary-600 hover:underline">
                Create your first quote →
              </Link>
            </motion.div>
          ) : (
            activities.map((activity, idx) => {
              const config = getStatusConfig(activity.status, activity.type);
              const Icon = config.icon;
              return (
                <motion.div
                  key={`${activity.type}-${activity.id}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * idx }}
                  layout
                >
                  <Link href={activity.link} className="block px-5 py-3 hover:bg-gray-50/50 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 ${config.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-4 h-4 ${config.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-900 truncate">{activity.tripName}</p>
                          <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${config.bg} ${config.color}`}>
                            {activity.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">
                          {activity.client.firstName} {activity.client.lastName} • {activity.identifier}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-semibold text-gray-900">${activity.total.toLocaleString()}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{getRelativeTime(activity.createdAt)}</p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
