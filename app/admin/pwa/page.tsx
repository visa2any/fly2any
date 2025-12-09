'use client';

import { useState, useEffect } from 'react';
import {
  Smartphone, Bell, Send, Users, TrendingUp,
  Chrome, Globe, RefreshCw, CheckCircle, XCircle,
  Loader2, BarChart3, Zap, MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

interface PWAStats {
  totalSubscriptions: number;
  recentSubscriptions: number;
  browserBreakdown: Record<string, number>;
}

export default function PWAAdminPage() {
  const [stats, setStats] = useState<PWAStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [notification, setNotification] = useState({
    title: '',
    body: '',
    url: '/',
  });
  const [channels, setChannels] = useState<{ push: boolean; telegram: boolean }>({
    push: true,
    telegram: true,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/pwa');
      const data = await res.json();
      if (data.success) setStats(data.stats);
    } catch (error) {
      toast.error('Failed to load PWA stats');
    } finally {
      setLoading(false);
    }
  };

  const sendNotification = async () => {
    if (!notification.title || !notification.body) {
      toast.error('Title and body are required');
      return;
    }

    if (!channels.push && !channels.telegram) {
      toast.error('Select at least one channel');
      return;
    }

    setSending(true);
    try {
      const activeChannels: ('push' | 'telegram')[] = [];
      if (channels.push) activeChannels.push('push');
      if (channels.telegram) activeChannels.push('telegram');

      const res = await fetch('/api/admin/pwa/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...notification, channels: activeChannels }),
      });
      const data = await res.json();

      if (data.success) {
        const messages: string[] = [];
        if (data.telegramSent) messages.push('Telegram sent');
        if (data.sentCount > 0) messages.push(`${data.sentCount} push notifications sent`);
        if (messages.length === 0) messages.push('Notification sent (no recipients)');
        toast.success(messages.join(', '));
        setNotification({ title: '', body: '', url: '/' });
      } else if (data.setup) {
        toast.error('VAPID keys not configured');
      } else {
        toast.error(data.error || 'Failed to send');
      }
    } catch (error) {
      toast.error('Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  const browserIcons: Record<string, any> = {
    Chrome: Chrome,
    Safari: Globe,
    Firefox: Globe,
    Edge: Globe,
    Other: Globe,
  };

  const browserColors: Record<string, string> = {
    Chrome: 'bg-green-500',
    Safari: 'bg-blue-500',
    Firefox: 'bg-orange-500',
    Edge: 'bg-cyan-500',
    Other: 'bg-gray-500',
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Smartphone className="w-7 h-7 text-primary-500" />
              PWA Management
            </h1>
            <p className="text-gray-600 mt-1">Push notifications & analytics</p>
          </div>
          <Button variant="outline" onClick={fetchStats} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Subscribers</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats?.totalSubscriptions || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-primary-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">New This Week</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  +{stats?.recentSubscriptions || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Push Ready</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">
                  {stats?.totalSubscriptions || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <Bell className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Send Notification */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <Send className="w-5 h-5 text-primary-500" />
              Send Push Notification
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={notification.title}
                  onChange={(e) => setNotification(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Flash Sale!"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message *
                </label>
                <textarea
                  value={notification.body}
                  onChange={(e) => setNotification(prev => ({ ...prev, body: e.target.value }))}
                  placeholder="50% off all flights to Europe!"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link URL
                </label>
                <input
                  type="text"
                  value={notification.url}
                  onChange={(e) => setNotification(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="/deals"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Channel Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notification Channels
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={channels.push}
                      onChange={(e) => setChannels(prev => ({ ...prev, push: e.target.checked }))}
                      className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <Bell className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-gray-700">Web Push ({stats?.totalSubscriptions || 0})</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={channels.telegram}
                      onChange={(e) => setChannels(prev => ({ ...prev, telegram: e.target.checked }))}
                      className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <MessageCircle className="w-4 h-4 text-cyan-500" />
                    <span className="text-sm text-gray-700">Telegram Admins</span>
                  </label>
                </div>
              </div>

              <Button
                variant="primary"
                onClick={sendNotification}
                disabled={sending || (!channels.telegram && !stats?.totalSubscriptions) || (!channels.push && !channels.telegram)}
                className="w-full gap-2"
              >
                {sending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Send Notification
              </Button>

              {!stats?.totalSubscriptions && !channels.telegram && (
                <p className="text-sm text-amber-600 text-center">
                  No push subscribers yet. Enable Telegram to send anyway.
                </p>
              )}
            </div>
          </div>

          {/* Browser Breakdown */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-primary-500" />
              Browser Breakdown
            </h2>

            {stats?.browserBreakdown && Object.keys(stats.browserBreakdown).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(stats.browserBreakdown).map(([browser, count]) => {
                  const Icon = browserIcons[browser] || Globe;
                  const percentage = stats.totalSubscriptions
                    ? Math.round((count / stats.totalSubscriptions) * 100)
                    : 0;

                  return (
                    <div key={browser}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700">{browser}</span>
                        </div>
                        <span className="text-sm text-gray-500">{count} ({percentage}%)</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${browserColors[browser] || 'bg-gray-500'}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Globe className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No browser data yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-amber-500" />
            Quick Notification Templates
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: 'Flash Sale!', body: 'Limited time: 30% off all flights!', url: '/deals' },
              { title: 'Price Drop Alert', body: 'Prices dropped on your watched flights!', url: '/account/alerts' },
              { title: 'New Feature', body: 'Check out our new hotel booking feature!', url: '/hotels' },
            ].map((template, i) => (
              <button
                key={i}
                onClick={() => setNotification(template)}
                className="text-left p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
              >
                <p className="font-medium text-gray-900">{template.title}</p>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{template.body}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Setup Guide */}
        <div className="bg-gradient-to-r from-primary-500 to-blue-600 rounded-xl p-6 text-white">
          <h2 className="text-lg font-semibold mb-2">Setup VAPID Keys for Push Notifications</h2>
          <p className="text-white/80 text-sm mb-4">
            To send push notifications, you need to configure VAPID keys in your environment.
          </p>
          <div className="bg-white/10 rounded-lg p-4 font-mono text-sm">
            <p># Generate keys:</p>
            <p className="text-amber-300">npx web-push generate-vapid-keys</p>
            <p className="mt-2"># Add to Vercel:</p>
            <p className="text-amber-300">VAPID_PUBLIC_KEY=...</p>
            <p className="text-amber-300">VAPID_PRIVATE_KEY=...</p>
            <p className="text-amber-300">NEXT_PUBLIC_VAPID_PUBLIC_KEY=...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
