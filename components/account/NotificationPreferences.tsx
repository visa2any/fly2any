'use client';

/**
 * NotificationPreferences Component
 * Team 2 - Notification & Communication
 *
 * Manage notification preferences including email, push, and quiet hours
 */

import React, { useState, useEffect } from 'react';
import { Bell, Mail, Smartphone, Moon, Save, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface NotificationPreferencesState {
  // In-app
  inAppEnabled: boolean;

  // Email
  emailEnabled: boolean;
  emailBookingConfirmed: boolean;
  emailBookingCancelled: boolean;
  emailPriceAlerts: boolean;
  emailPaymentUpdates: boolean;
  emailPromotions: boolean;
  emailSystemUpdates: boolean;

  // Push
  pushEnabled: boolean;
  pushBookingUpdates: boolean;
  pushPriceAlerts: boolean;
  pushPromotions: boolean;

  // Quiet hours
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;

  // Digest
  digestEnabled: boolean;
  digestFrequency: 'daily' | 'weekly' | 'never';
}

const DEFAULT_PREFERENCES: NotificationPreferencesState = {
  inAppEnabled: true,
  emailEnabled: true,
  emailBookingConfirmed: true,
  emailBookingCancelled: true,
  emailPriceAlerts: true,
  emailPaymentUpdates: true,
  emailPromotions: false,
  emailSystemUpdates: true,
  pushEnabled: false,
  pushBookingUpdates: false,
  pushPriceAlerts: false,
  pushPromotions: false,
  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',
  digestEnabled: false,
  digestFrequency: 'never',
};

export function NotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPreferencesState>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Load preferences (mock - in production, fetch from API)
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        // In production, fetch from /api/user/preferences
        // const response = await fetch('/api/user/preferences');
        // const data = await response.json();
        // setPreferences(data);

        // For now, use defaults
        setPreferences(DEFAULT_PREFERENCES);
      } catch (err) {
        console.error('Error loading preferences:', err);
        toast.error('Failed to load preferences');
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, []);

  // Handle preference change
  const handleChange = (key: keyof NotificationPreferencesState, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  // Save preferences
  const handleSave = async () => {
    try {
      setSaving(true);

      // In production, save to /api/user/preferences
      // const response = await fetch('/api/user/preferences', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(preferences),
      // });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success('Preferences saved successfully');
      setHasChanges(false);
    } catch (err) {
      console.error('Error saving preferences:', err);
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  // Request push notification permission
  const handleEnablePush = async () => {
    if (!('Notification' in window)) {
      toast.error('Push notifications are not supported in your browser');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        handleChange('pushEnabled', true);
        toast.success('Push notifications enabled');
      } else {
        toast.error('Push notification permission denied');
      }
    } catch (err) {
      console.error('Error requesting push permission:', err);
      toast.error('Failed to enable push notifications');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="space-y-3 mt-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-2">
          <Bell className="h-6 w-6 text-primary-600" />
          <h2 className="text-2xl font-bold text-gray-900">
            Notification Preferences
          </h2>
        </div>
        <p className="text-gray-600">
          Customize how and when you receive notifications
        </p>
      </div>

      {/* In-App Notifications */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Bell className="h-5 w-5 text-gray-700" />
          <h3 className="text-lg font-semibold text-gray-900">
            In-App Notifications
          </h3>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">
              Enable in-app notifications
            </p>
            <p className="text-sm text-gray-600">
              Show notifications within the application
            </p>
          </div>
          <Switch
            checked={preferences.inAppEnabled}
            onCheckedChange={(checked) => handleChange('inAppEnabled', checked)}
          />
        </div>
      </div>

      {/* Email Notifications */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Mail className="h-5 w-5 text-gray-700" />
          <h3 className="text-lg font-semibold text-gray-900">
            Email Notifications
          </h3>
        </div>

        <div className="space-y-4">
          {/* Master toggle */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-200">
            <div>
              <p className="text-sm font-medium text-gray-900">
                Enable email notifications
              </p>
              <p className="text-sm text-gray-600">
                Receive notifications via email
              </p>
            </div>
            <Switch
              checked={preferences.emailEnabled}
              onCheckedChange={(checked) => handleChange('emailEnabled', checked)}
            />
          </div>

          {/* Individual settings */}
          {preferences.emailEnabled && (
            <div className="space-y-3 pl-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Booking confirmations
                  </p>
                  <p className="text-xs text-gray-600">
                    Flight and hotel booking confirmations
                  </p>
                </div>
                <Switch
                  checked={preferences.emailBookingConfirmed}
                  onCheckedChange={(checked) => handleChange('emailBookingConfirmed', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Booking cancellations
                  </p>
                  <p className="text-xs text-gray-600">
                    When a booking is cancelled
                  </p>
                </div>
                <Switch
                  checked={preferences.emailBookingCancelled}
                  onCheckedChange={(checked) => handleChange('emailBookingCancelled', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Price alerts</p>
                  <p className="text-xs text-gray-600">
                    When tracked prices drop
                  </p>
                </div>
                <Switch
                  checked={preferences.emailPriceAlerts}
                  onCheckedChange={(checked) => handleChange('emailPriceAlerts', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Payment updates
                  </p>
                  <p className="text-xs text-gray-600">
                    Payment confirmations and receipts
                  </p>
                </div>
                <Switch
                  checked={preferences.emailPaymentUpdates}
                  onCheckedChange={(checked) => handleChange('emailPaymentUpdates', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Promotions</p>
                  <p className="text-xs text-gray-600">Deals and special offers</p>
                </div>
                <Switch
                  checked={preferences.emailPromotions}
                  onCheckedChange={(checked) => handleChange('emailPromotions', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    System updates
                  </p>
                  <p className="text-xs text-gray-600">
                    Important service announcements
                  </p>
                </div>
                <Switch
                  checked={preferences.emailSystemUpdates}
                  onCheckedChange={(checked) => handleChange('emailSystemUpdates', checked)}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Push Notifications */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Smartphone className="h-5 w-5 text-gray-700" />
          <h3 className="text-lg font-semibold text-gray-900">
            Push Notifications
          </h3>
        </div>

        <div className="space-y-4">
          {/* Master toggle */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-200">
            <div>
              <p className="text-sm font-medium text-gray-900">
                Enable push notifications
              </p>
              <p className="text-sm text-gray-600">
                Receive browser push notifications
              </p>
            </div>
            {preferences.pushEnabled ? (
              <Switch
                checked={preferences.pushEnabled}
                onCheckedChange={(checked) => handleChange('pushEnabled', checked)}
              />
            ) : (
              <Button variant="outline" size="sm" onClick={handleEnablePush}>
                Enable
              </Button>
            )}
          </div>

          {/* Individual settings */}
          {preferences.pushEnabled && (
            <div className="space-y-3 pl-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Booking updates
                  </p>
                  <p className="text-xs text-gray-600">
                    Changes to your bookings
                  </p>
                </div>
                <Switch
                  checked={preferences.pushBookingUpdates}
                  onCheckedChange={(checked) => handleChange('pushBookingUpdates', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Price alerts</p>
                  <p className="text-xs text-gray-600">
                    Instant price drop notifications
                  </p>
                </div>
                <Switch
                  checked={preferences.pushPriceAlerts}
                  onCheckedChange={(checked) => handleChange('pushPriceAlerts', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Promotions</p>
                  <p className="text-xs text-gray-600">Flash sales and deals</p>
                </div>
                <Switch
                  checked={preferences.pushPromotions}
                  onCheckedChange={(checked) => handleChange('pushPromotions', checked)}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quiet Hours */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Moon className="h-5 w-5 text-gray-700" />
          <h3 className="text-lg font-semibold text-gray-900">Quiet Hours</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">
                Enable quiet hours
              </p>
              <p className="text-sm text-gray-600">
                Pause non-urgent notifications during specified hours
              </p>
            </div>
            <Switch
              checked={preferences.quietHoursEnabled}
              onCheckedChange={(checked) => handleChange('quietHoursEnabled', checked)}
            />
          </div>

          {preferences.quietHoursEnabled && (
            <div className="grid grid-cols-2 gap-4 pl-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Start time
                </label>
                <input
                  type="time"
                  value={preferences.quietHoursStart}
                  onChange={(e) => handleChange('quietHoursStart', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  End time
                </label>
                <input
                  type="time"
                  value={preferences.quietHoursEnd}
                  onChange={(e) => handleChange('quietHoursEnd', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Email Digest */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Clock className="h-5 w-5 text-gray-700" />
          <h3 className="text-lg font-semibold text-gray-900">Email Digest</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">
                Enable email digest
              </p>
              <p className="text-sm text-gray-600">
                Receive a summary of notifications via email
              </p>
            </div>
            <Switch
              checked={preferences.digestEnabled}
              onCheckedChange={(checked) => handleChange('digestEnabled', checked)}
            />
          </div>

          {preferences.digestEnabled && (
            <div className="pl-4">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Frequency
              </label>
              <select
                value={preferences.digestFrequency}
                onChange={(e) =>
                  handleChange('digestFrequency', e.target.value as any)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="never">Never</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      {hasChanges && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              You have unsaved changes
            </p>
            <Button
              variant="primary"
              size="md"
              onClick={handleSave}
              loading={saving}
              icon={<Save className="h-4 w-4" />}
            >
              Save Preferences
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
