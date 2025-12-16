'use client';

import { useState } from 'react';
import {
  Settings,
  Globe,
  Mail,
  CreditCard,
  Key,
  Bell,
  Shield,
  Database,
  Save,
  RefreshCw,
} from 'lucide-react';

interface SystemSettings {
  general: {
    siteName: string;
    siteDescription: string;
    contactEmail: string;
    supportPhone: string;
    maintenanceMode: boolean;
  };
  api: {
    rateLimit: number;
    cacheEnabled: boolean;
    cacheTTL: number;
  };
  email: {
    fromEmail: string;
    fromName: string;
    smtpConfigured: boolean;
  };
  payment: {
    currency: string;
    testMode: boolean;
    paymentMethods: string[];
  };
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>({
    general: {
      siteName: 'Fly2Any',
      siteDescription: 'Book flights, hotels, and travel packages',
      contactEmail: 'support@fly2any.com',
      supportPhone: '1-332-220-0838',
      maintenanceMode: false,
    },
    api: {
      rateLimit: 1000,
      cacheEnabled: true,
      cacheTTL: 3600,
    },
    email: {
      fromEmail: 'support@fly2any.com',
      fromName: 'Fly2Any',
      smtpConfigured: true,
    },
    payment: {
      currency: 'USD',
      testMode: false,
      paymentMethods: ['stripe', 'paypal'],
    },
  });

  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'api' | 'email' | 'payment'>('general');

  const handleSave = async () => {
    setSaving(true);
    try {
      // In production, save to API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'general', name: 'General', icon: Globe },
    { id: 'api', name: 'API', icon: Database },
    { id: 'email', name: 'Email', icon: Mail },
    { id: 'payment', name: 'Payment', icon: CreditCard },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
            <p className="text-sm text-gray-600 mt-1">
              Configure system-wide settings and preferences
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Tabs */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-2">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 font-semibold'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {tab.name}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-bold text-gray-900">General Settings</h2>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Site Name
                    </label>
                    <input
                      type="text"
                      value={settings.general.siteName}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          general: { ...settings.general, siteName: e.target.value },
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Site Description
                    </label>
                    <textarea
                      value={settings.general.siteDescription}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          general: { ...settings.general, siteDescription: e.target.value },
                        })
                      }
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      value={settings.general.contactEmail}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          general: { ...settings.general, contactEmail: e.target.value },
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Support Phone
                    </label>
                    <input
                      type="tel"
                      value={settings.general.supportPhone}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          general: { ...settings.general, supportPhone: e.target.value },
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div>
                      <p className="font-semibold text-gray-900">Maintenance Mode</p>
                      <p className="text-sm text-gray-600">
                        Display maintenance page to all users
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.general.maintenanceMode}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            general: { ...settings.general, maintenanceMode: e.target.checked },
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              )}

              {activeTab === 'api' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-bold text-gray-900">API Settings</h2>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Rate Limit (requests/hour)
                    </label>
                    <input
                      type="number"
                      value={settings.api.rateLimit}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          api: { ...settings.api, rateLimit: parseInt(e.target.value) },
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <p className="font-semibold text-gray-900">Cache Enabled</p>
                      <p className="text-sm text-gray-600">Enable Redis caching for API responses</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.api.cacheEnabled}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            api: { ...settings.api, cacheEnabled: e.target.checked },
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Cache TTL (seconds)
                    </label>
                    <input
                      type="number"
                      value={settings.api.cacheTTL}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          api: { ...settings.api, cacheTTL: parseInt(e.target.value) },
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start gap-3">
                      <Key className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-semibold text-gray-900">API Keys</p>
                        <p className="text-sm text-gray-600 mt-1">
                          Manage API keys in environment variables for security
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'email' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-bold text-gray-900">Email Settings</h2>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      From Email
                    </label>
                    <input
                      type="email"
                      value={settings.email.fromEmail}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          email: { ...settings.email, fromEmail: e.target.value },
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      From Name
                    </label>
                    <input
                      type="text"
                      value={settings.email.fromName}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          email: { ...settings.email, fromName: e.target.value },
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-green-600 mt-0.5" />
                        <div>
                          <p className="font-semibold text-gray-900">SMTP Configuration</p>
                          <p className="text-sm text-gray-600 mt-1">
                            Status: {settings.email.smtpConfigured ? 'Configured' : 'Not Configured'}
                          </p>
                        </div>
                      </div>
                      {settings.email.smtpConfigured && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                          Active
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'payment' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-bold text-gray-900">Payment Settings</h2>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Default Currency
                    </label>
                    <select
                      value={settings.payment.currency}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          payment: { ...settings.payment, currency: e.target.value },
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="CAD">CAD - Canadian Dollar</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div>
                      <p className="font-semibold text-gray-900">Test Mode</p>
                      <p className="text-sm text-gray-600">
                        Use test payment credentials (no real charges)
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.payment.testMode}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            payment: { ...settings.payment, testMode: e.target.checked },
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Enabled Payment Methods
                    </label>
                    <div className="space-y-2">
                      {['stripe', 'paypal', 'apple_pay', 'google_pay'].map((method) => (
                        <label key={method} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100">
                          <input
                            type="checkbox"
                            checked={settings.payment.paymentMethods.includes(method)}
                            onChange={(e) => {
                              const methods = e.target.checked
                                ? [...settings.payment.paymentMethods, method]
                                : settings.payment.paymentMethods.filter((m) => m !== method);
                              setSettings({
                                ...settings,
                                payment: { ...settings.payment, paymentMethods: methods },
                              });
                            }}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm font-semibold text-gray-900 capitalize">
                            {method.replace('_', ' ')}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
  );
}
