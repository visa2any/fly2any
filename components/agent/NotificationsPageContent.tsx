'use client';

// components/agent/NotificationsPageContent.tsx
// Level 6 Ultra-Premium Notifications Page
import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  Bell, FileText, CreditCard, Users, CheckCircle,
  Clock, MessageSquare, Check, Trash2
} from 'lucide-react';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  link?: string | null;
}

export default function NotificationsPageContent({ notifications: initial }: { notifications: Notification[] }) {
  const [notifications, setNotifications] = useState(initial);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filtered = filter === 'unread' ? notifications.filter(n => !n.read) : notifications;

  const markAllAsRead = async () => {
    try {
      await fetch('/api/agents/notifications', { method: 'POST' });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success('All marked as read');
    } catch (err) {
      toast.error('Failed to mark as read');
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'QUOTE_ACCEPTED': return { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50' };
      case 'QUOTE_VIEWED': return { icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50' };
      case 'PAYMENT_RECEIVED': return { icon: CreditCard, color: 'text-purple-500', bg: 'bg-purple-50' };
      case 'NEW_CLIENT': return { icon: Users, color: 'text-amber-500', bg: 'bg-amber-50' };
      case 'MESSAGE': return { icon: MessageSquare, color: 'text-indigo-500', bg: 'bg-indigo-50' };
      default: return { icon: Bell, color: 'text-gray-500', bg: 'bg-gray-50' };
    }
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-1">{notifications.filter(n => !n.read).length} unread</p>
        </div>
        <button
          onClick={markAllAsRead}
          className="flex items-center gap-2 px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-xl font-medium transition-colors"
        >
          <Check className="w-4 h-4" />
          Mark All Read
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {(['all', 'unread'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              filter === f
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {f === 'all' ? 'All' : 'Unread'}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_4px_12px_rgba(0,0,0,0.03)] overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500">No notifications</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((notif, idx) => {
              const { icon: Icon, color, bg } = getIcon(notif.type);
              return (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className={`px-5 py-4 hover:bg-gray-50 transition-colors ${
                    !notif.read ? 'bg-indigo-50/30' : ''
                  }`}
                >
                  <div className="flex gap-4">
                    <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-5 h-5 ${color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-medium text-gray-900">{notif.title}</p>
                          <p className="text-sm text-gray-600 mt-0.5">{notif.message}</p>
                        </div>
                        {!notif.read && (
                          <div className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0 mt-2" />
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(notif.createdAt).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
