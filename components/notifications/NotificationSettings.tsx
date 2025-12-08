'use client';

/**
 * NotificationSettings Component
 *
 * Comprehensive notification preferences management with:
 * - Email notification controls
 * - Push notification controls
 * - Quiet hours configuration
 * - Digest/Summary settings
 * - Real-time preference sync
 *
 * @version 2.0.0
 */

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Bell,
  Mail,
  Smartphone,
  Moon,
  Clock,
  Calendar,
  Volume2,
  VolumeX,
  CheckCircle,
  AlertTriangle,
  TrendingDown,
  CreditCard,
  Tag,
  Shield,
  Settings,
  Loader2,
} from 'lucide-react';
import { Switch } from '@/components/ui/Switch';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface NotificationPreferences {
  // In-app notifications
  inAppEnabled: boolean;
  inAppSound: boolean;

  // Email notifications
  emailEnabled: boolean;
  emailBookingConfirmed: boolean;
  emailBookingCancelled: boolean;
  emailBookingModified: boolean;
  emailPriceAlerts: boolean;
  emailPaymentUpdates: boolean;
  emailPromotions: boolean;
  emailTripReminders: boolean;
  emailSecurityAlerts: boolean;

  // Push notifications
  pushEnabled: boolean;
  pushBookingUpdates: boolean;
  pushPriceAlerts: boolean;
  pushPromotions: boolean;
  pushTripReminders: boolean;

  // Quiet hours
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  quietHoursTimezone: string;

  // Digest settings
  digestEnabled: boolean;
  digestFrequency: 'daily' | 'weekly' | 'never';
  digestTime: string;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  inAppEnabled: true,
  inAppSound: true,
  emailEnabled: true,
  emailBookingConfirmed: true,
  emailBookingCancelled: true,
  emailBookingModified: true,
  emailPriceAlerts: true,
  emailPaymentUpdates: true,
  emailPromotions: false,
  emailTripReminders: true,
  emailSecurityAlerts: true,
  pushEnabled: false,
  pushBookingUpdates: false,
  pushPriceAlerts: false,
  pushPromotions: false,
  pushTripReminders: false,
  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',
  quietHoursTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  digestEnabled: false,
  digestFrequency: 'never',
  digestTime: '09:00',
};

const TIMEZONE_OPTIONS = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HST)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
  { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)' },
  { value: 'UTC', label: 'UTC' },
];

const DIGEST_FREQUENCY_OPTIONS = [
  { value: 'never', label: 'Never' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
];

const TIME_OPTIONS = Array.from({ length: 24 }, (_, i) => ({
  value: `${i.toString().padStart(2, '0')}:00`,
  label: `${i === 0 ? 12 : i > 12 ? i - 12 : i}:00 ${i < 12 ? 'AM' : 'PM'}`,
}));

interface NotificationSettingsProps {
  className?: string;
  showTitle?: boolean;
  onSave?: () => void;
}

export function NotificationSettings({
  className,
  showTitle = true,
  onSave,
}: NotificationSettingsProps) {
  const { data: session } = useSession();
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pushSupported, setPushSupported] = useState(false);
  const [pushPermission, setPushPermission] = useState<NotificationPermission>('default');

  // Check push notification support
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator) {
      setPushSupported(true);
      setPushPermission(Notification.permission);
    }
  }, []);

  // Load preferences
  useEffect(() => {
    loadPreferences();
  }, [session]);

  const loadPreferences = async () => {
    if (!session?.user) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/account/notification-preferences');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.preferences) {
          setPreferences({ ...DEFAULT_PREFERENCES, ...data.preferences });
        }
      }
    } catch (error) {
      console.error('Failed to load notification preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/account/notification-preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      });

      if (!response.ok) {
        throw new Error('Failed to save preferences');
      }

      toast.success('Notification preferences saved!');
      onSave?.();
    } catch (error) {
      toast.error('Failed to save notification preferences');
    } finally {
      setSaving(false);
    }
  };

  const requestPushPermission = async () => {
    if (!pushSupported) {
      toast.error('Push notifications are not supported in this browser');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setPushPermission(permission);

      if (permission === 'granted') {
        setPreferences(prev => ({ ...prev, pushEnabled: true }));
        toast.success('Push notifications enabled!');
      } else if (permission === 'denied') {
        toast.error('Push notifications were blocked. Please enable in browser settings.');
      }
    } catch (error) {
      toast.error('Failed to request push notification permission');
    }
  };

  const updatePreference = <K extends keyof NotificationPreferences>(
    key: K,
    value: NotificationPreferences[K]
  ) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className={cn('flex items-center justify-center py-12', className)}>
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className={cn('space-y-8', className)}>
      {showTitle && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary-600" />
            Notification Settings
          </h2>
          <p className="text-gray-600 mt-1">
            Customize how and when you receive notifications
          </p>
        </div>
      )}

      {/* In-App Notifications */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary-50 rounded-lg">
            <Bell className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">In-App Notifications</h3>
            <p className="text-sm text-gray-600">Notifications shown within the app</p>
          </div>
        </div>

        <div className="space-y-4">
          <Switch
            checked={preferences.inAppEnabled}
            onCheckedChange={(checked) => updatePreference('inAppEnabled', checked)}
            label="Enable In-App Notifications"
            description="Show notification badge and dropdown"
            id="inAppEnabled"
          />

          <Switch
            checked={preferences.inAppSound}
            onCheckedChange={(checked) => updatePreference('inAppSound', checked)}
            label="Notification Sound"
            description="Play a sound when new notifications arrive"
            id="inAppSound"
            disabled={!preferences.inAppEnabled}
          />
        </div>
      </div>

      {/* Email Notifications */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-info-50 rounded-lg">
            <Mail className="h-5 w-5 text-primary-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Email Notifications</h3>
            <p className="text-sm text-gray-600">Choose which emails you want to receive</p>
          </div>
        </div>

        <div className="space-y-4">
          <Switch
            checked={preferences.emailEnabled}
            onCheckedChange={(checked) => updatePreference('emailEnabled', checked)}
            label="Enable Email Notifications"
            description="Receive important updates via email"
            id="emailEnabled"
          />

          <div className={cn(
            'pl-4 border-l-2 border-gray-200 space-y-3 transition-opacity',
            !preferences.emailEnabled && 'opacity-50 pointer-events-none'
          )}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <Switch
                    checked={preferences.emailBookingConfirmed}
                    onCheckedChange={(checked) => updatePreference('emailBookingConfirmed', checked)}
                    label="Booking Confirmations"
                    id="emailBookingConfirmed"
                    compact
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <Switch
                    checked={preferences.emailBookingModified}
                    onCheckedChange={(checked) => updatePreference('emailBookingModified', checked)}
                    label="Schedule Changes"
                    id="emailBookingModified"
                    compact
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <TrendingDown className="h-5 w-5 text-green-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <Switch
                    checked={preferences.emailPriceAlerts}
                    onCheckedChange={(checked) => updatePreference('emailPriceAlerts', checked)}
                    label="Price Drop Alerts"
                    id="emailPriceAlerts"
                    compact
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <CreditCard className="h-5 w-5 text-primary-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <Switch
                    checked={preferences.emailPaymentUpdates}
                    onCheckedChange={(checked) => updatePreference('emailPaymentUpdates', checked)}
                    label="Payment Updates"
                    id="emailPaymentUpdates"
                    compact
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Calendar className="h-5 w-5 text-purple-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <Switch
                    checked={preferences.emailTripReminders}
                    onCheckedChange={(checked) => updatePreference('emailTripReminders', checked)}
                    label="Trip Reminders"
                    id="emailTripReminders"
                    compact
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Shield className="h-5 w-5 text-red-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <Switch
                    checked={preferences.emailSecurityAlerts}
                    onCheckedChange={(checked) => updatePreference('emailSecurityAlerts', checked)}
                    label="Security Alerts"
                    id="emailSecurityAlerts"
                    compact
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Tag className="h-5 w-5 text-pink-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <Switch
                    checked={preferences.emailPromotions}
                    onCheckedChange={(checked) => updatePreference('emailPromotions', checked)}
                    label="Promotions & Deals"
                    id="emailPromotions"
                    compact
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Push Notifications */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-50 rounded-lg">
            <Smartphone className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Push Notifications</h3>
            <p className="text-sm text-gray-600">Receive instant updates on your device</p>
          </div>
        </div>

        {!pushSupported ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              Push notifications are not supported in your browser. Try using Chrome, Firefox, or Edge.
            </p>
          </div>
        ) : pushPermission === 'denied' ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">
              Push notifications are blocked. Please enable them in your browser settings.
            </p>
          </div>
        ) : pushPermission === 'default' ? (
          <div className="bg-info-50 border border-info-200 rounded-lg p-4 flex items-center justify-between">
            <p className="text-sm text-neutral-700">
              Enable push notifications to receive instant updates.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={requestPushPermission}
            >
              Enable
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Switch
              checked={preferences.pushEnabled}
              onCheckedChange={(checked) => updatePreference('pushEnabled', checked)}
              label="Enable Push Notifications"
              description="Receive notifications even when the browser is closed"
              id="pushEnabled"
            />

            <div className={cn(
              'pl-4 border-l-2 border-gray-200 space-y-3 transition-opacity',
              !preferences.pushEnabled && 'opacity-50 pointer-events-none'
            )}>
              <Switch
                checked={preferences.pushBookingUpdates}
                onCheckedChange={(checked) => updatePreference('pushBookingUpdates', checked)}
                label="Booking Updates"
                description="Confirmations, changes, and cancellations"
                id="pushBookingUpdates"
              />

              <Switch
                checked={preferences.pushPriceAlerts}
                onCheckedChange={(checked) => updatePreference('pushPriceAlerts', checked)}
                label="Price Alerts"
                description="When prices drop for your tracked flights"
                id="pushPriceAlerts"
              />

              <Switch
                checked={preferences.pushTripReminders}
                onCheckedChange={(checked) => updatePreference('pushTripReminders', checked)}
                label="Trip Reminders"
                description="Upcoming trip notifications"
                id="pushTripReminders"
              />

              <Switch
                checked={preferences.pushPromotions}
                onCheckedChange={(checked) => updatePreference('pushPromotions', checked)}
                label="Promotions"
                description="Special deals and limited-time offers"
                id="pushPromotions"
              />
            </div>
          </div>
        )}
      </div>

      {/* Quiet Hours */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-50 rounded-lg">
            <Moon className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Quiet Hours</h3>
            <p className="text-sm text-gray-600">Pause non-urgent notifications during specific hours</p>
          </div>
        </div>

        <div className="space-y-4">
          <Switch
            checked={preferences.quietHoursEnabled}
            onCheckedChange={(checked) => updatePreference('quietHoursEnabled', checked)}
            label="Enable Quiet Hours"
            description="Suppress notifications during your quiet time"
            id="quietHoursEnabled"
          />

          <div className={cn(
            'grid grid-cols-1 md:grid-cols-3 gap-4 transition-opacity',
            !preferences.quietHoursEnabled && 'opacity-50 pointer-events-none'
          )}>
            <Select
              label="Start Time"
              options={TIME_OPTIONS}
              value={preferences.quietHoursStart}
              onChange={(value) => updatePreference('quietHoursStart', value)}
              fullWidth
            />

            <Select
              label="End Time"
              options={TIME_OPTIONS}
              value={preferences.quietHoursEnd}
              onChange={(value) => updatePreference('quietHoursEnd', value)}
              fullWidth
            />

            <Select
              label="Timezone"
              options={TIMEZONE_OPTIONS}
              value={preferences.quietHoursTimezone}
              onChange={(value) => updatePreference('quietHoursTimezone', value)}
              fullWidth
            />
          </div>

          <p className="text-xs text-gray-500">
            Note: Urgent security alerts will still be delivered during quiet hours.
          </p>
        </div>
      </div>

      {/* Email Digest */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-orange-50 rounded-lg">
            <Clock className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Email Digest</h3>
            <p className="text-sm text-gray-600">Get a summary of your notifications</p>
          </div>
        </div>

        <div className="space-y-4">
          <Switch
            checked={preferences.digestEnabled}
            onCheckedChange={(checked) => updatePreference('digestEnabled', checked)}
            label="Enable Email Digest"
            description="Receive a summary instead of individual emails"
            id="digestEnabled"
          />

          <div className={cn(
            'grid grid-cols-1 md:grid-cols-2 gap-4 transition-opacity',
            !preferences.digestEnabled && 'opacity-50 pointer-events-none'
          )}>
            <Select
              label="Frequency"
              options={DIGEST_FREQUENCY_OPTIONS}
              value={preferences.digestFrequency}
              onChange={(value) => updatePreference('digestFrequency', value as 'daily' | 'weekly' | 'never')}
              fullWidth
            />

            <Select
              label="Delivery Time"
              options={TIME_OPTIONS}
              value={preferences.digestTime}
              onChange={(value) => updatePreference('digestTime', value)}
              fullWidth
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-4 pt-4">
        <Button
          variant="outline"
          onClick={loadPreferences}
          disabled={saving}
        >
          Reset
        </Button>
        <Button
          variant="primary"
          onClick={savePreferences}
          loading={saving}
          disabled={saving}
        >
          Save Preferences
        </Button>
      </div>
    </div>
  );
}

export default NotificationSettings;
