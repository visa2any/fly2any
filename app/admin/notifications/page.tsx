'use client';

/**
 * Admin Notification Center
 *
 * Test and monitor Email (Mailgun) and Telegram notifications
 * with real-time visual feedback
 */

import { useState, useEffect } from 'react';
import {
  Mail,
  Send,
  CheckCircle2,
  XCircle,
  Loader2,
  Bell,
  MessageSquare,
  Settings,
  RefreshCw,
  Zap,
  Clock,
  AlertTriangle,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';

// Email types available for testing
const EMAIL_TYPES = [
  { type: 'flight_booking', label: 'Flight Booking Confirmation', icon: '✈️' },
  { type: 'hotel_booking', label: 'Hotel Booking Confirmation', icon: '🏨' },
  { type: 'price_alert', label: 'Price Drop Alert', icon: '💰' },
  { type: 'welcome', label: 'Welcome Email', icon: '👋' },
  { type: 'password_reset', label: 'Password Reset', icon: '🔑' },
  { type: 'newsletter', label: 'Newsletter Confirmation', icon: '📰' },
  { type: 'credits', label: 'Credits Earned', icon: '🎁' },
  { type: 'trip_booking', label: 'Trip Booking', icon: '🌍' },
];

interface TestResult {
  type: 'email' | 'telegram';
  status: 'success' | 'error';
  message: string;
  timestamp: Date;
  details?: any;
}

export default function NotificationsPage() {
  const [emailConfig, setEmailConfig] = useState<any>(null);
  const [telegramConfig, setTelegramConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [sendingEmail, setSendingEmail] = useState<string | null>(null);
  const [sendingTelegram, setSendingTelegram] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [copied, setCopied] = useState(false);

  // Fetch configuration status
  useEffect(() => {
    fetchConfigurations();
  }, []);

  const fetchConfigurations = async () => {
    setLoading(true);
    try {
      // Fetch Telegram config
      const telegramRes = await fetch('/api/admin/test-telegram');
      const telegramData = await telegramRes.json();
      setTelegramConfig(telegramData);

      // Fetch Email types (confirms API is working)
      const emailRes = await fetch('/api/admin/test-email');
      const emailData = await emailRes.json();
      setEmailConfig(emailData);
    } catch (error) {
      console.error('Failed to fetch configurations:', error);
    } finally {
      setLoading(false);
    }
  };

  const addResult = (result: TestResult) => {
    setTestResults(prev => [result, ...prev].slice(0, 20));
  };

  const sendTestEmail = async (emailType: string) => {
    setSendingEmail(emailType);
    try {
      const res = await fetch('/api/admin/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: emailType,
          email: testEmail || undefined
        }),
      });
      const data = await res.json();

      addResult({
        type: 'email',
        status: data.success ? 'success' : 'error',
        message: data.message || data.error || 'Email sent',
        timestamp: new Date(),
        details: data,
      });
    } catch (error: any) {
      addResult({
        type: 'email',
        status: 'error',
        message: error.message || 'Failed to send email',
        timestamp: new Date(),
      });
    } finally {
      setSendingEmail(null);
    }
  };

  const sendTestTelegram = async () => {
    setSendingTelegram(true);
    try {
      const res = await fetch('/api/admin/test-telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();

      addResult({
        type: 'telegram',
        status: data.success ? 'success' : 'error',
        message: data.message || data.error || 'Telegram sent',
        timestamp: new Date(),
        details: data,
      });
    } catch (error: any) {
      addResult({
        type: 'telegram',
        status: 'error',
        message: error.message || 'Failed to send Telegram',
        timestamp: new Date(),
      });
    } finally {
      setSendingTelegram(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg">
              <Bell className="w-6 h-6 text-white" />
            </div>
            Notification Center
          </h1>
          <p className="text-gray-600 mt-1">Test and monitor email & Telegram notifications</p>
        </div>
        <button
          onClick={fetchConfigurations}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Mailgun Status */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Mailgun Email</h3>
                <p className="text-sm text-gray-500">Customer notifications</p>
              </div>
            </div>
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
              emailConfig ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {emailConfig ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Configured
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4" />
                  Not Configured
                </>
              )}
            </div>
          </div>

          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-2">Available email types:</p>
            <div className="flex flex-wrap gap-1.5">
              {EMAIL_TYPES.map(e => (
                <span key={e.type} className="px-2 py-0.5 bg-white border border-gray-200 rounded text-xs">
                  {e.icon} {e.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Telegram Status */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Telegram Bot</h3>
                <p className="text-sm text-gray-500">Admin instant alerts</p>
              </div>
            </div>
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
              telegramConfig?.status === 'configured' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
            }`}>
              {telegramConfig?.status === 'configured' ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Configured
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4" />
                  Setup Required
                </>
              )}
            </div>
          </div>

          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-500">Bot Token</p>
                <p className={`font-medium ${telegramConfig?.config?.hasBotToken ? 'text-green-600' : 'text-red-600'}`}>
                  {telegramConfig?.config?.hasBotToken ? '✓ Configured' : '✗ Missing'}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Chat IDs</p>
                <p className={`font-medium ${telegramConfig?.config?.adminChatIds > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {telegramConfig?.config?.adminChatIds || 0} configured
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Test Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Email Testing */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-gradient-to-r from-orange-500 to-red-500">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Test Email Notifications
            </h3>
          </div>

          <div className="p-4 space-y-4">
            {/* Custom email input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Test Email Address (optional)
              </label>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="Leave empty to use your admin email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Email type buttons */}
            <div className="grid grid-cols-2 gap-2">
              {EMAIL_TYPES.map((emailType) => (
                <button
                  key={emailType.type}
                  onClick={() => sendTestEmail(emailType.type)}
                  disabled={sendingEmail !== null}
                  className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    sendingEmail === emailType.type
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-gray-50 hover:bg-orange-50 text-gray-700 hover:text-orange-700 border border-gray-200'
                  }`}
                >
                  {sendingEmail === emailType.type ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>{emailType.icon}</span>
                  )}
                  <span className="truncate">{emailType.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Telegram Testing */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-gradient-to-r from-blue-400 to-blue-600">
            <h3 className="font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Test Telegram Notification
            </h3>
          </div>

          <div className="p-4 space-y-4">
            {telegramConfig?.status === 'configured' ? (
              <>
                <p className="text-sm text-gray-600">
                  Send a test notification to all configured admin chat IDs.
                </p>
                <button
                  onClick={sendTestTelegram}
                  disabled={sendingTelegram}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {sendingTelegram ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send Test Notification
                    </>
                  )}
                </button>
              </>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800 font-medium mb-2">
                    Telegram Setup Required
                  </p>
                  <p className="text-xs text-yellow-700">
                    Follow the setup guide to configure Telegram notifications.
                  </p>
                </div>

                {/* Setup Steps */}
                <div className="space-y-3 text-sm">
                  {telegramConfig?.setupGuide && Object.entries(telegramConfig.setupGuide).map(([key, step]: [string, any]) => (
                    <div key={key} className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium text-gray-900 mb-1">{step.title}</p>
                      <ul className="text-xs text-gray-600 space-y-0.5">
                        {step.instructions.map((instruction: string, i: number) => (
                          <li key={i}>{instruction}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Test Results Log */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            Test Results Log
          </h3>
          {testResults.length > 0 && (
            <button
              onClick={() => setTestResults([])}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear All
            </button>
          )}
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {testResults.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No tests run yet</p>
              <p className="text-sm">Send a test notification to see results here</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 flex items-start gap-3 ${
                    result.status === 'success' ? 'bg-green-50/50' : 'bg-red-50/50'
                  }`}
                >
                  <div className={`p-2 rounded-full ${
                    result.status === 'success' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {result.status === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        result.type === 'email'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {result.type === 'email' ? 'EMAIL' : 'TELEGRAM'}
                      </span>
                      <span className="text-xs text-gray-400">
                        {result.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <p className={`mt-1 text-sm ${
                      result.status === 'success' ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {result.message}
                    </p>
                    {result.details?.email && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        Sent to: {result.details.email}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Info Panel */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200 p-6">
        <h3 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Notification Architecture
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="bg-white/70 rounded-lg p-4">
            <p className="font-medium text-orange-700 mb-2">📧 Mailgun (Customer Emails)</p>
            <ul className="text-gray-600 space-y-1 text-xs">
              <li>• Booking confirmations (flights, hotels, trips)</li>
              <li>• Welcome emails for new users</li>
              <li>• Price alerts and notifications</li>
              <li>• Password reset and security emails</li>
              <li>• Credits earned and rewards updates</li>
            </ul>
          </div>
          <div className="bg-white/70 rounded-lg p-4">
            <p className="font-medium text-blue-700 mb-2">📱 Telegram (Admin Alerts)</p>
            <ul className="text-gray-600 space-y-1 text-xs">
              <li>• Instant booking notifications (&lt;1 sec)</li>
              <li>• Payment confirmations</li>
              <li>• System alerts and errors</li>
              <li>• Schedule changes</li>
              <li>• Critical business updates</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
