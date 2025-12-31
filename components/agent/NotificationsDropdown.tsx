'use client';

// components/agent/NotificationsDropdown.tsx
// Level 6 Ultra-Premium Notifications Dropdown
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Bell, FileText, CreditCard, Users, CheckCircle,
  Clock, MessageSquare, X, ChevronRight
} from 'lucide-react';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  link?: string;
}

export default function NotificationsDropdown() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (open) fetchNotifications();
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/agents/notifications?limit=5');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/agents/notifications/${id}/read`, { method: 'POST' });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error('Failed to mark as read');
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
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.12)] border border-gray-100 overflow-hidden z-50"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              <button onClick={() => setOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No notifications yet</p>
                </div>
              ) : (
                notifications.map((notif) => {
                  const { icon: Icon, color, bg } = getIcon(notif.type);
                  return (
                    <div
                      key={notif.id}
                      onClick={() => markAsRead(notif.id)}
                      className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0 ${
                        !notif.read ? 'bg-indigo-50/50' : ''
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                          <Icon className={`w-4 h-4 ${color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{notif.title}</p>
                          <p className="text-xs text-gray-500 truncate">{notif.message}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(notif.createdAt).toLocaleDateString('en-US', {
                              month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                            })}
                          </p>
                        </div>
                        {!notif.read && (
                          <div className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0 mt-2" />
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <Link
              href="/agent/notifications"
              className="block px-4 py-3 bg-gray-50 text-center text-sm font-medium text-indigo-600 hover:text-indigo-700 border-t border-gray-100"
            >
              View All Notifications
              <ChevronRight className="w-4 h-4 inline ml-1" />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
