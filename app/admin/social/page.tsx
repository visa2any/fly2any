'use client';

/**
 * Social Media Command Center - Fly2Any Marketing OS
 * 
 * Full-featured social media management dashboard with:
 * - Platform connection status & health
 * - Content queue & scheduling
 * - Quick compose & post
 * - Recent posts feed
 * - Distribution insights
 */

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Share2,
  Send,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  RefreshCw,
  Plus,
  Eye,
  ThumbsUp,
  MousePointerClick,
  TrendingUp,
  FileText,
  Sparkles,
  ChevronRight,
  Globe,
  Zap,
  PenTool,
  MessageSquare,
  Image as ImageIcon,
  Link2,
  Hash,
  ArrowRight,
  BarChart3,
  Layers,
  Timer,
  ExternalLink,
} from 'lucide-react';

// =============================================================================
// TYPES
// =============================================================================

interface PlatformStatus {
  platform: string;
  configured: boolean;
}

interface QueueItem {
  id: string;
  type: string;
  title: string;
  content: string;
  platforms: string[];
  status: string;
  scheduledAt: string;
  postedAt?: string;
  imageUrl?: string;
  hashtags?: string[];
  error?: string;
  posts?: {
    platform: string;
    status: string;
    impressions: number;
    engagements: number;
    clicks: number;
  }[];
}

interface QueueStats {
  pending: number;
  scheduled: number;
  posted: number;
  failed: number;
  total: number;
}

interface TestResult {
  success: boolean;
  dryRun: boolean;
  platform: string;
  message?: string;
  formattedContent?: string;
  error?: string;
}

// =============================================================================
// PLATFORM CONFIG
// =============================================================================

const PLATFORMS = [
  { 
    id: 'twitter', 
    name: 'Twitter / X', 
    icon: '𝕏', 
    gradient: 'from-gray-900 to-gray-800',
    borderColor: 'border-gray-300',
    bgLight: 'bg-gray-50',
    textColor: 'text-gray-900',
    charLimit: 280,
  },
  { 
    id: 'instagram', 
    name: 'Instagram', 
    icon: '📸', 
    gradient: 'from-purple-600 via-pink-500 to-orange-400',
    borderColor: 'border-pink-200',
    bgLight: 'bg-pink-50',
    textColor: 'text-pink-700',
    charLimit: 2200,
  },
  { 
    id: 'facebook', 
    name: 'Facebook', 
    icon: '📘', 
    gradient: 'from-blue-700 to-blue-600',
    borderColor: 'border-blue-200',
    bgLight: 'bg-blue-50',
    textColor: 'text-blue-700',
    charLimit: 63206,
  },
  { 
    id: 'tiktok', 
    name: 'TikTok', 
    icon: '🎵', 
    gradient: 'from-gray-900 via-gray-800 to-pink-600',
    borderColor: 'border-gray-300',
    bgLight: 'bg-gray-50',
    textColor: 'text-gray-900',
    charLimit: 2200,
  },
  { 
    id: 'blog', 
    name: 'Blog', 
    icon: '📝', 
    gradient: 'from-emerald-600 to-teal-600',
    borderColor: 'border-emerald-200',
    bgLight: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    charLimit: 100000,
  },
];

// =============================================================================
// STATUS BADGE
// =============================================================================

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { icon: typeof CheckCircle2; class: string; label: string }> = {
    posted: { icon: CheckCircle2, class: 'bg-green-100 text-green-700 border border-green-200', label: 'Posted' },
    pending: { icon: Clock, class: 'bg-amber-100 text-amber-700 border border-amber-200', label: 'Pending' },
    scheduled: { icon: Calendar, class: 'bg-blue-100 text-blue-700 border border-blue-200', label: 'Scheduled' },
    processing: { icon: RefreshCw, class: 'bg-indigo-100 text-indigo-700 border border-indigo-200', label: 'Processing' },
    failed: { icon: XCircle, class: 'bg-red-100 text-red-700 border border-red-200', label: 'Failed' },
    partial: { icon: AlertCircle, class: 'bg-orange-100 text-orange-700 border border-orange-200', label: 'Partial' },
  };
  const cfg = config[status] || config.pending;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.class}`}>
      <Icon className="w-3 h-3" /> {cfg.label}
    </span>
  );
}

// =============================================================================
// PLATFORM CARD
// =============================================================================

function PlatformCard({ 
  platform, 
  configured, 
  onTest, 
  testing 
}: { 
  platform: typeof PLATFORMS[0]; 
  configured: boolean;
  onTest: (id: string, dryRun: boolean) => void;
  testing: string | null;
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border ${configured ? platform.borderColor : 'border-red-200'} bg-white hover:shadow-lg transition-all group`}>
      {/* Gradient Top Bar */}
      <div className={`h-1.5 bg-gradient-to-r ${platform.gradient}`} />
      
      <div className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-11 h-11 bg-gradient-to-br ${platform.gradient} rounded-xl flex items-center justify-center text-white text-lg shadow-sm`}>
            {platform.icon}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 text-sm">{platform.name}</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              {configured ? (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs font-medium text-green-600">Connected</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-red-400 rounded-full" />
                  <span className="text-xs font-medium text-red-500">Not configured</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => onTest(platform.id, true)}
            disabled={testing === platform.id}
            className="flex-1 px-3 py-2 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all disabled:opacity-50"
          >
            {testing === platform.id ? (
              <span className="flex items-center justify-center gap-1">
                <RefreshCw className="w-3 h-3 animate-spin" /> Testing...
              </span>
            ) : 'Dry Run'}
          </button>
          {configured && (
            <button
              onClick={() => {
                if (confirm(`Post a test to ${platform.name}?`)) {
                  onTest(platform.id, false);
                }
              }}
              disabled={testing === platform.id}
              className={`flex-1 px-3 py-2 text-xs font-semibold bg-gradient-to-r ${platform.gradient} text-white rounded-xl hover:opacity-90 transition-all disabled:opacity-50`}
            >
              Post Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function SocialMediaCommandCenter() {
  const [platformStatus, setPlatformStatus] = useState<Record<string, PlatformStatus>>({});
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [queueStats, setQueueStats] = useState<QueueStats>({ pending: 0, scheduled: 0, posted: 0, failed: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'queue' | 'posted' | 'failed'>('queue');

  // Compose state
  const [composeText, setComposeText] = useState('');
  const [composeTitle, setComposeTitle] = useState('');
  const [composePlatforms, setComposePlatforms] = useState<string[]>(['twitter']);
  const [composeSchedule, setComposeSchedule] = useState('');
  const [composing, setComposing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [statusRes, queueRes] = await Promise.all([
        fetch('/api/admin/social/test').catch(() => null),
        fetch('/api/admin/content-queue').catch(() => null),
      ]);

      if (statusRes?.ok) {
        const data = await statusRes.json();
        setPlatformStatus(data.platforms || {});
      }

      if (queueRes?.ok) {
        const data = await queueRes.json();
        const items: QueueItem[] = data.items || [];
        setQueueItems(items);

        // Calculate stats
        const stats: QueueStats = {
          pending: items.filter(i => i.status === 'pending').length,
          scheduled: items.filter(i => i.status === 'scheduled').length,
          posted: items.filter(i => i.status === 'posted').length,
          failed: items.filter(i => i.status === 'failed').length,
          total: items.length,
        };
        setQueueStats(data.stats || stats);
      }
    } catch (error) {
      console.error('Error fetching social data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const testPlatform = async (platformId: string, dryRun: boolean) => {
    setTesting(platformId);
    setTestResult(null);
    try {
      const res = await fetch('/api/admin/social/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: platformId, dryRun }),
      });
      const data = await res.json();
      setTestResult(data);
    } catch {
      setTestResult({ success: false, dryRun, platform: platformId, error: 'Request failed' });
    } finally {
      setTesting(null);
    }
  };

  const handleCompose = async () => {
    if (!composeText.trim() || composePlatforms.length === 0) return;
    setComposing(true);
    try {
      const res = await fetch('/api/admin/content-queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'social',
          title: composeTitle || composeText.slice(0, 60),
          content: composeText,
          platforms: composePlatforms,
          scheduledAt: composeSchedule || undefined,
        }),
      });
      if (res.ok) {
        setComposeText('');
        setComposeTitle('');
        setComposePlatforms(['twitter']);
        setComposeSchedule('');
        setComposerOpen(false);
        await fetchData();
      }
    } catch (e) {
      console.error('Compose failed:', e);
    } finally {
      setComposing(false);
    }
  };

  const deleteItem = async (id: string) => {
    try {
      await fetch(`/api/admin/content-queue?id=${id}`, { method: 'DELETE' });
      await fetchData();
    } catch (e) {
      console.error('Delete failed:', e);
    }
  };

  const filteredQueue = queueItems.filter(item => {
    if (activeTab === 'queue') return ['pending', 'scheduled', 'processing'].includes(item.status);
    if (activeTab === 'posted') return item.status === 'posted';
    if (activeTab === 'failed') return ['failed', 'partial'].includes(item.status);
    return true;
  });

  const connectedCount = Object.values(platformStatus).filter(p => p.configured).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading Social Command Center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full mx-auto">
      {/* ================ HEADER ================ */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 rounded-xl shadow-lg">
              <Share2 className="h-6 w-6 text-white" />
            </div>
            Social Media Command Center
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Manage content distribution across all platforms
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setComposerOpen(!composerOpen)}
            className="px-4 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl hover:opacity-90 transition-all flex items-center gap-2 font-semibold shadow-sm text-sm"
          >
            <Plus className="h-4 w-4" />
            New Post
          </button>
          <button
            onClick={fetchData}
            className="p-2.5 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all"
          >
            <RefreshCw className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* ================ STATS BANNER ================ */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 rounded-2xl p-6 text-white shadow-lg">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          <div className="text-center">
            <p className="text-purple-100 text-xs font-medium mb-1">Connected</p>
            <p className="text-3xl font-black">{connectedCount}<span className="text-lg font-medium text-purple-200">/{PLATFORMS.length}</span></p>
          </div>
          <div className="text-center">
            <p className="text-purple-100 text-xs font-medium mb-1">In Queue</p>
            <p className="text-3xl font-black">{queueStats.pending + queueStats.scheduled}</p>
          </div>
          <div className="text-center">
            <p className="text-purple-100 text-xs font-medium mb-1">Posted</p>
            <p className="text-3xl font-black">{queueStats.posted}</p>
          </div>
          <div className="text-center">
            <p className="text-purple-100 text-xs font-medium mb-1">Failed</p>
            <p className="text-3xl font-black">{queueStats.failed}</p>
          </div>
          <div className="text-center">
            <p className="text-purple-100 text-xs font-medium mb-1">Total</p>
            <p className="text-3xl font-black">{queueStats.total}</p>
          </div>
        </div>
      </div>

      {/* ================ COMPOSER ================ */}
      {composerOpen && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-100 px-6 py-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <PenTool className="w-4 h-4 text-purple-600" />
              Quick Compose
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <input
              type="text"
              value={composeTitle}
              onChange={e => setComposeTitle(e.target.value)}
              placeholder="Post title (optional)..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400"
            />
            <textarea
              value={composeText}
              onChange={e => setComposeText(e.target.value)}
              placeholder="What would you like to share?"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 min-h-[120px]"
            />
            
            {/* Platform Selection */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Target Platforms</p>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map(p => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setComposePlatforms(prev =>
                        prev.includes(p.id) ? prev.filter(x => x !== p.id) : [...prev, p.id]
                      );
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                      composePlatforms.includes(p.id)
                        ? `bg-gradient-to-r ${p.gradient} text-white border-transparent shadow-sm`
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span>{p.icon}</span> {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Schedule */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Schedule (optional)</label>
                <input
                  type="datetime-local"
                  value={composeSchedule}
                  onChange={e => setComposeSchedule(e.target.value)}
                  className="mt-1 w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
              </div>
              <div className="text-right text-xs text-gray-400 mt-4">
                {composeText.length} chars
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => setComposerOpen(false)}
                className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleCompose}
                disabled={!composeText.trim() || composePlatforms.length === 0 || composing}
                className="px-6 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                {composing ? 'Queuing...' : composeSchedule ? 'Schedule Post' : 'Queue Post'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================ TEST RESULT ================ */}
      {testResult && (
        <div className={`p-4 rounded-xl border ${testResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-start gap-3">
            {testResult.success ? (
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            )}
            <div className="flex-1">
              <h4 className="font-semibold text-sm">
                {testResult.dryRun ? 'Dry Run' : 'Post'} — {testResult.platform}
              </h4>
              <p className={`text-sm mt-1 ${testResult.success ? 'text-green-700' : 'text-red-700'}`}>
                {testResult.message || testResult.error}
              </p>
              {testResult.formattedContent && (
                <pre className="mt-2 p-3 bg-white rounded-lg border text-xs whitespace-pre-wrap font-mono">
                  {testResult.formattedContent}
                </pre>
              )}
            </div>
            <button onClick={() => setTestResult(null)} className="p-1 hover:bg-gray-200 rounded">
              <XCircle className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      )}

      {/* ================ MAIN GRID ================ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Platform Cards + Quick Links */}
        <div className="space-y-6">
          {/* Platform Status */}
          <div>
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Globe className="w-4 h-4 text-purple-600" />
              Platform Status
            </h2>
            <div className="space-y-3">
              {PLATFORMS.map(p => (
                <PlatformCard
                  key={p.id}
                  platform={p}
                  configured={platformStatus[p.id]?.configured || false}
                  onTest={testPlatform}
                  testing={testing}
                />
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              Quick Access
            </h3>
            <div className="space-y-2">
              {[
                { label: 'AI Content Factory', href: '/admin/growth/content', icon: Sparkles, color: 'text-purple-600 bg-purple-50' },
                { label: 'Content Queue Manager', href: '/admin/growth/content/manage', icon: Layers, color: 'text-blue-600 bg-blue-50' },
                { label: 'Content Analytics', href: '/admin/growth/content-analytics', icon: BarChart3, color: 'text-emerald-600 bg-emerald-50' },
                { label: 'Content Review', href: '/admin/growth/content-review', icon: MessageSquare, color: 'text-amber-600 bg-amber-50' },
                { label: 'Fly2Any Blog', href: '/blog', icon: FileText, color: 'text-gray-600 bg-gray-100' },
                { label: 'Growth OS', href: '/admin/growth', icon: TrendingUp, color: 'text-pink-600 bg-pink-50' },
              ].map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all group"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${link.color}`}>
                    <link.icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 flex-1">{link.label}</span>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Content Queue */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            {/* Tabs */}
            <div className="flex items-center border-b border-gray-100">
              {[
                { key: 'queue' as const, label: 'Queue', count: queueStats.pending + queueStats.scheduled, icon: Clock },
                { key: 'posted' as const, label: 'Posted', count: queueStats.posted, icon: CheckCircle2 },
                { key: 'failed' as const, label: 'Failed', count: queueStats.failed, icon: XCircle },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 px-4 py-3.5 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-all ${
                    activeTab === tab.key
                      ? 'text-purple-700 border-purple-600 bg-purple-50/50'
                      : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                      activeTab === tab.key ? 'bg-purple-200 text-purple-800' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Queue Items */}
            <div className="divide-y divide-gray-50">
              {filteredQueue.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    {activeTab === 'queue' ? (
                      <Clock className="w-8 h-8 text-gray-400" />
                    ) : activeTab === 'posted' ? (
                      <CheckCircle2 className="w-8 h-8 text-gray-400" />
                    ) : (
                      <XCircle className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-1">
                    {activeTab === 'queue' ? 'No posts in queue' : 
                     activeTab === 'posted' ? 'No posted content yet' : 
                     'No failed posts'}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {activeTab === 'queue' 
                      ? 'Create a new post or generate content with AI' 
                      : activeTab === 'posted' 
                      ? 'Posts will appear here once published' 
                      : 'Great! No failed posts'}
                  </p>
                  {activeTab === 'queue' && (
                    <div className="flex gap-3 justify-center">
                      <button
                        onClick={() => setComposerOpen(true)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 transition-all flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" /> New Post
                      </button>
                      <Link
                        href="/admin/growth/content"
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-all flex items-center gap-2"
                      >
                        <Sparkles className="w-4 h-4" /> AI Generate
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                filteredQueue.map(item => (
                  <div key={item.id} className="p-5 hover:bg-gray-50/50 transition-all">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <StatusBadge status={item.status} />
                          <span className="text-xs text-gray-400 font-mono uppercase bg-gray-100 px-1.5 py-0.5 rounded">{item.type}</span>
                        </div>
                        <h4 className="font-bold text-gray-900 text-sm mb-1 truncate">{item.title}</h4>
                        <p className="text-xs text-gray-500 line-clamp-2 mb-3">{item.content}</p>

                        {/* Platform badges */}
                        <div className="flex items-center gap-3 flex-wrap">
                          <div className="flex gap-1">
                            {item.platforms?.map(p => {
                              const pConfig = PLATFORMS.find(pl => pl.id === p);
                              return (
                                <span key={p} className="text-sm" title={pConfig?.name || p}>
                                  {pConfig?.icon || '📱'}
                                </span>
                              );
                            })}
                          </div>
                          
                          {item.scheduledAt && (
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <Timer className="w-3 h-3" />
                              {new Date(item.scheduledAt).toLocaleString()}
                            </span>
                          )}

                          {/* Engagement metrics for posted items */}
                          {item.posts && item.posts.length > 0 && (
                            <div className="flex gap-3">
                              {item.posts.reduce((acc, p) => ({
                                impressions: acc.impressions + (p.impressions || 0),
                                engagements: acc.engagements + (p.engagements || 0),
                                clicks: acc.clicks + (p.clicks || 0),
                              }), { impressions: 0, engagements: 0, clicks: 0 }).impressions > 0 && (
                                <>
                                  <span className="text-xs text-gray-400 flex items-center gap-1">
                                    <Eye className="w-3 h-3" />
                                    {item.posts.reduce((a, p) => a + (p.impressions || 0), 0).toLocaleString()}
                                  </span>
                                  <span className="text-xs text-gray-400 flex items-center gap-1">
                                    <ThumbsUp className="w-3 h-3" />
                                    {item.posts.reduce((a, p) => a + (p.engagements || 0), 0).toLocaleString()}
                                  </span>
                                  <span className="text-xs text-gray-400 flex items-center gap-1">
                                    <MousePointerClick className="w-3 h-3" />
                                    {item.posts.reduce((a, p) => a + (p.clicks || 0), 0).toLocaleString()}
                                  </span>
                                </>
                              )}
                            </div>
                          )}
                        </div>

                        {item.error && (
                          <div className="mt-2 p-2 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600">
                            {item.error}
                          </div>
                        )}
                      </div>

                      {/* Delete button for pending/scheduled items */}
                      {['pending', 'scheduled'].includes(item.status) && (
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          title="Remove from queue"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {filteredQueue.length > 0 && (
              <div className="border-t border-gray-100 px-5 py-3 bg-gray-50/50 flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  Showing {filteredQueue.length} items
                </span>
                <Link
                  href="/admin/growth/content/manage"
                  className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1"
                >
                  View All <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            )}
          </div>

          {/* Trigger Cron Section */}
          <div className="mt-4 bg-white rounded-2xl border border-gray-200 p-5">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Timer className="w-4 h-4 text-indigo-600" />
              Automation
            </h3>
            <div className="flex flex-wrap gap-3">
              <a
                href="/api/cron/social-distribute"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-xl text-sm font-semibold hover:bg-indigo-100 transition-all flex items-center gap-2"
              >
                <Zap className="w-4 h-4" /> Trigger Distribution Cron
                <ExternalLink className="w-3 h-3 opacity-50" />
              </a>
              <a
                href="/api/cron/growth"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-purple-50 border border-purple-200 text-purple-700 rounded-xl text-sm font-semibold hover:bg-purple-100 transition-all flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" /> Trigger Growth Cron
                <ExternalLink className="w-3 h-3 opacity-50" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
