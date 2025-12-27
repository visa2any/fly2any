'use client';

/**
 * Admin Social Media Dashboard - Fly2Any Marketing OS
 * Test and manage social media posting
 */

import { useState, useEffect } from 'react';

interface PlatformStatus {
  platform: string;
  configured: boolean;
}

interface TestResult {
  success: boolean;
  dryRun: boolean;
  platform: string;
  message?: string;
  result?: any;
  formattedContent?: string;
  error?: string;
}

export default function AdminSocialPage() {
  const [status, setStatus] = useState<Record<string, PlatformStatus>>({});
  const [envVars, setEnvVars] = useState<Record<string, Record<string, boolean>>>({});
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [customText, setCustomText] = useState('');

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/admin/social/test');
      const data = await res.json();
      if (data.success) {
        setStatus(data.platforms);
        setEnvVars(data.envVars);
      }
    } catch (error) {
      console.error('Failed to fetch status:', error);
    } finally {
      setLoading(false);
    }
  };

  const testPlatform = async (platform: string, dryRun: boolean = true) => {
    setTesting(platform);
    setTestResult(null);

    try {
      const res = await fetch('/api/admin/social/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          text: customText || undefined,
          dryRun,
        }),
      });
      const data = await res.json();
      setTestResult(data);
    } catch (error) {
      setTestResult({
        success: false,
        dryRun,
        platform,
        error: 'Request failed',
      });
    } finally {
      setTesting(null);
    }
  };

  const platforms = [
    { id: 'twitter', name: 'Twitter/X', icon: '𝕏', color: 'bg-black' },
    { id: 'instagram', name: 'Instagram', icon: '📸', color: 'bg-gradient-to-r from-purple-500 to-pink-500' },
    { id: 'facebook', name: 'Facebook', icon: '📘', color: 'bg-blue-600' },
    { id: 'tiktok', name: 'TikTok', icon: '🎵', color: 'bg-black' },
    { id: 'blog', name: 'Blog', icon: '📝', color: 'bg-green-600' },
  ];

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">Loading social status...</div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Social Media Dashboard</h1>

      {/* Platform Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {platforms.map(platform => {
          const platformStatus = status[platform.id];
          const isConfigured = platformStatus?.configured;

          return (
            <div
              key={platform.id}
              className={`rounded-xl p-4 border ${
                isConfigured ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 ${platform.color} rounded-lg flex items-center justify-center text-white text-lg`}>
                  {platform.icon}
                </div>
                <div>
                  <h3 className="font-semibold">{platform.name}</h3>
                  <span className={`text-xs ${isConfigured ? 'text-green-600' : 'text-red-600'}`}>
                    {isConfigured ? '● Connected' : '○ Not configured'}
                  </span>
                </div>
              </div>

              {/* Env var status for Twitter */}
              {platform.id === 'twitter' && envVars.twitter && (
                <div className="text-xs space-y-1 mb-3 font-mono">
                  {Object.entries(envVars.twitter).map(([key, value]) => (
                    <div key={key} className={value ? 'text-green-600' : 'text-red-500'}>
                      {value ? '✓' : '✗'} {key}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => testPlatform(platform.id, true)}
                  disabled={testing === platform.id}
                  className="flex-1 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-50"
                >
                  {testing === platform.id ? 'Testing...' : 'Dry Run'}
                </button>
                {isConfigured && (
                  <button
                    onClick={() => {
                      if (confirm('This will post a real tweet. Continue?')) {
                        testPlatform(platform.id, false);
                      }
                    }}
                    disabled={testing === platform.id}
                    className="flex-1 px-3 py-1.5 text-sm bg-blue-500 text-white hover:bg-blue-600 rounded-lg disabled:opacity-50"
                  >
                    Post Now
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Custom Text Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Custom Test Message (optional)</label>
        <textarea
          value={customText}
          onChange={e => setCustomText(e.target.value)}
          placeholder="Leave empty for default test message..."
          className="w-full p-3 border rounded-lg text-sm font-mono resize-none"
          rows={3}
          maxLength={280}
        />
        <div className="text-xs text-gray-500 mt-1">{customText.length}/280</div>
      </div>

      {/* Test Result */}
      {testResult && (
        <div className={`p-4 rounded-xl ${testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <h3 className="font-semibold mb-2">
            {testResult.dryRun ? 'Dry Run' : 'Post'} Result - {testResult.platform}
          </h3>
          <p className={testResult.success ? 'text-green-700' : 'text-red-700'}>
            {testResult.message || testResult.error}
          </p>
          {testResult.formattedContent && (
            <div className="mt-3 p-3 bg-white rounded-lg border">
              <div className="text-xs text-gray-500 mb-1">Formatted content:</div>
              <pre className="text-sm whitespace-pre-wrap">{testResult.formattedContent}</pre>
            </div>
          )}
          {testResult.result?.url && (
            <a
              href={testResult.result.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 text-blue-600 hover:underline"
            >
              View Post →
            </a>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-8 p-4 bg-gray-50 rounded-xl">
        <h3 className="font-semibold mb-3">Quick Actions</h3>
        <div className="flex flex-wrap gap-2">
          <a
            href="/api/cron/social-distribute"
            target="_blank"
            className="px-4 py-2 bg-white border rounded-lg text-sm hover:bg-gray-50"
          >
            Trigger Cron Job
          </a>
          <a
            href="/admin/marketing"
            className="px-4 py-2 bg-white border rounded-lg text-sm hover:bg-gray-50"
          >
            Marketing Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
