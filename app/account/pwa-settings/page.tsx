'use client';

import { useState, useEffect } from 'react';
import {
  Smartphone,
  Bell,
  Database,
  Trash2,
  CheckCircle2,
  XCircle,
  Download,
  RefreshCw,
  Wifi,
  HardDrive,
  AlertCircle
} from 'lucide-react';
import {
  setupPushNotifications,
  unsubscribeFromPushNotifications,
  getNotificationSettings,
  showTestNotification,
} from '@/lib/notifications/push-subscription';
import {
  getSyncStatus,
  getSyncStats,
  clearQueue,
  retryFailedSyncs,
  type SyncStatus,
} from '@/lib/sync/background-sync';
import toast from 'react-hot-toast';

export default function PWASettingsPage() {
  const [isInstalled, setIsInstalled] = useState(false);
  const [notificationState, setNotificationState] = useState<{
    supported: boolean;
    permission: NotificationPermission;
    subscribed: boolean;
    endpoint?: string | undefined;
  }>({
    supported: false,
    permission: 'default' as NotificationPermission,
    subscribed: false,
    endpoint: undefined,
  });
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    pending: 0,
    syncing: false,
    errors: [],
  });
  const [syncStats, setSyncStats] = useState<any>(null);
  const [cacheSize, setCacheSize] = useState(0);
  const [storageQuota, setStorageQuota] = useState({ usage: 0, quota: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);

    try {
      // Check if installed
      const installed =
        window.matchMedia('(display-mode: standalone)').matches ||
        (navigator as any).standalone === true;
      setIsInstalled(installed);

      // Get notification settings
      const notifSettings = await getNotificationSettings();
      setNotificationState(notifSettings);

      // Get sync status
      const status = await getSyncStatus();
      setSyncStatus(status);

      // Get sync stats
      const stats = await getSyncStats();
      setSyncStats(stats);

      // Get cache size
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        let totalSize = 0;

        for (const cacheName of cacheNames) {
          const cache = await caches.open(cacheName);
          const keys = await cache.keys();
          totalSize += keys.length * 5000; // Rough estimate
        }

        setCacheSize(totalSize);
      }

      // Get storage quota
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        setStorageQuota({
          usage: estimate.usage || 0,
          quota: estimate.quota || 0,
        });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      toast.error('Failed to load PWA settings');
    } finally {
      setLoading(false);
    }
  };

  const handleEnableNotifications = async () => {
    try {
      const result = await setupPushNotifications();

      if (result.success) {
        toast.success('Push notifications enabled!');
        await loadSettings();
      } else {
        toast.error(result.error || 'Failed to enable notifications');
      }
    } catch (error) {
      console.error('Failed to enable notifications:', error);
      toast.error('Failed to enable notifications');
    }
  };

  const handleDisableNotifications = async () => {
    try {
      await unsubscribeFromPushNotifications();
      toast.success('Push notifications disabled');
      await loadSettings();
    } catch (error) {
      console.error('Failed to disable notifications:', error);
      toast.error('Failed to disable notifications');
    }
  };

  const handleTestNotification = async () => {
    try {
      await showTestNotification();
      toast.success('Test notification sent!');
    } catch (error) {
      console.error('Failed to send test notification:', error);
      toast.error('Failed to send test notification');
    }
  };

  const handleClearCache = async () => {
    if (!confirm('Are you sure you want to clear the cache? This may affect offline functionality.')) {
      return;
    }

    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
        toast.success('Cache cleared successfully');
        await loadSettings();
      }
    } catch (error) {
      console.error('Failed to clear cache:', error);
      toast.error('Failed to clear cache');
    }
  };

  const handleClearSyncQueue = async () => {
    if (!confirm('Are you sure you want to clear the sync queue? Pending actions will be lost.')) {
      return;
    }

    try {
      await clearQueue();
      toast.success('Sync queue cleared');
      await loadSettings();
    } catch (error) {
      console.error('Failed to clear sync queue:', error);
      toast.error('Failed to clear sync queue');
    }
  };

  const handleRetrySync = async () => {
    try {
      await retryFailedSyncs();
      toast.success('Retrying failed syncs...');
      await loadSettings();
    } catch (error) {
      console.error('Failed to retry syncs:', error);
      toast.error('Failed to retry syncs');
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (timestamp?: number): string => {
    if (!timestamp) return 'Never';
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading PWA settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            PWA Settings
          </h1>
          <p className="text-gray-600">
            Manage your Progressive Web App features and settings
          </p>
        </div>

        {/* Installation Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Smartphone className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Installation Status</h2>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {isInstalled ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-gray-400" />
                )}
                <span className="font-semibold text-gray-900">
                  {isInstalled ? 'Installed' : 'Not Installed'}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                {isInstalled
                  ? 'App is installed on your device'
                  : 'Install the app for a better experience'}
              </p>
            </div>

            {!isInstalled && (
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2">
                <Download className="w-4 h-4" />
                Install
              </button>
            )}
          </div>
        </div>

        {/* Push Notifications */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Push Notifications</h2>
          </div>

          {!notificationState.supported ? (
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-amber-800">
                Push notifications are not supported on this device/browser
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-900 mb-1">
                    Status: {notificationState.subscribed ? 'Enabled' : 'Disabled'}
                  </div>
                  <p className="text-sm text-gray-600">
                    Permission: {notificationState.permission}
                  </p>
                </div>

                <button
                  onClick={
                    notificationState.subscribed
                      ? handleDisableNotifications
                      : handleEnableNotifications
                  }
                  className={`px-4 py-2 font-semibold rounded-lg transition-colors ${
                    notificationState.subscribed
                      ? 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {notificationState.subscribed ? 'Disable' : 'Enable'}
                </button>
              </div>

              {notificationState.subscribed && (
                <button
                  onClick={handleTestNotification}
                  className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Send Test Notification
                </button>
              )}
            </div>
          )}
        </div>

        {/* Background Sync */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Wifi className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Background Sync</h2>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Pending Actions</div>
                <div className="text-2xl font-bold text-gray-900">{syncStatus.pending}</div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Failed Syncs</div>
                <div className="text-2xl font-bold text-gray-900">
                  {syncStats?.failedCount || 0}
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Last Sync</div>
              <div className="font-semibold text-gray-900">{formatDate(syncStatus.lastSync)}</div>
            </div>

            {syncStats?.byType && Object.keys(syncStats.byType).length > 0 && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-2">Pending by Type</div>
                {Object.entries(syncStats.byType).map(([type, count]) => (
                  <div key={type} className="flex justify-between text-sm mb-1">
                    <span className="capitalize">{type}:</span>
                    <span className="font-semibold">{count as number}</span>
                  </div>
                ))}
              </div>
            )}

            {syncStats?.failedCount > 0 && (
              <button
                onClick={handleRetrySync}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Retry Failed Syncs
              </button>
            )}

            {syncStatus.pending > 0 && (
              <button
                onClick={handleClearSyncQueue}
                className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Clear Sync Queue
              </button>
            )}
          </div>
        </div>

        {/* Storage & Cache */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <HardDrive className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Storage & Cache</h2>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">Cache Size</span>
                <span className="font-semibold text-gray-900">{formatBytes(cacheSize)}</span>
              </div>

              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">Storage Used</span>
                <span className="font-semibold text-gray-900">
                  {formatBytes(storageQuota.usage)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Storage Quota</span>
                <span className="font-semibold text-gray-900">
                  {formatBytes(storageQuota.quota)}
                </span>
              </div>

              {storageQuota.quota > 0 && (
                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${(storageQuota.usage / storageQuota.quota) * 100}%`,
                      }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1 text-center">
                    {((storageQuota.usage / storageQuota.quota) * 100).toFixed(1)}% used
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleClearCache}
              className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear Cache
            </button>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-800">
                  Clearing cache will remove offline content. The cache will be rebuilt as you use
                  the app.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
