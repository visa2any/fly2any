'use client';

/**
 * Email Marketing Dashboard — Admin
 *
 * Full-featured email campaign management with REAL Mailgun data:
 * - View all campaigns with real stats from Mailgun API
 * - Create new campaigns
 * - Upload CSV email lists
 * - Send campaigns to subscribers
 * - Real-time analytics
 *
 * Level 6 — Ultra-Premium Apple-Class Design
 */

import { useState, useEffect, useCallback } from 'react';
import {
  MailPlus, Send, Eye, MousePointer, Plus, Upload, Trash2,
  Play, X, AlertCircle, Loader2, Users, FileText, RefreshCw,
  TrendingUp, Activity, CheckCircle, XCircle, Clock
} from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
  type: string;
  status: string;
  subject: string;
  preheader?: string;
  body: string;
  targetAudience: string;
  totalRecipients: number;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  scheduledAt?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}

interface Stats {
  totalCampaigns: number;
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  avgOpenRate: string;
  avgClickRate: string;
}

interface MailgunStats {
  totals: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    complained: number;
  };
  rates: {
    openRate: string;
    clickRate: string;
    bounceRate: string;
  };
}

interface RecentEvent {
  event: string;
  recipient: string;
  timestamp: number;
  subject?: string;
}

interface SubscriberStats {
  total: number;
  active: number;
}

export default function EmailMarketingPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [mailgunStats, setMailgunStats] = useState<MailgunStats | null>(null);
  const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([]);
  const [subscriberStats, setSubscriberStats] = useState<SubscriberStats>({ total: 0, active: 0 });
  const [loading, setLoading] = useState(true);
  const [mailgunLoading, setMailgunLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [statsDuration, setStatsDuration] = useState<string>('7d');

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    preheader: '',
    body: '',
    type: 'promotional',
    targetAudience: 'all',
  });
  const [formLoading, setFormLoading] = useState(false);

  // CSV upload states
  const [uploadedEmails, setUploadedEmails] = useState<string[]>([]);
  const [uploadStats, setUploadStats] = useState<any>(null);

  // Fetch campaigns from database
  const fetchCampaigns = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter !== 'all') params.set('status', filter);

      const res = await fetch(`/api/admin/campaigns?${params}`);
      const data = await res.json();

      if (data.success) {
        setCampaigns(data.campaigns || []);
        setStats(data.stats);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to fetch campaigns');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  // Fetch REAL Mailgun stats
  const fetchMailgunStats = useCallback(async () => {
    try {
      setMailgunLoading(true);
      const res = await fetch(`/api/admin/mailgun-stats?duration=${statsDuration}`);
      const data = await res.json();

      if (data.success) {
        setMailgunStats(data.stats);
        setRecentEvents(data.recentEvents || []);
      }
    } catch (err) {
      console.error('Failed to fetch Mailgun stats:', err);
    } finally {
      setMailgunLoading(false);
    }
  }, [statsDuration]);

  // Fetch subscriber stats
  const fetchSubscribers = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/subscribers?limit=1');
      const data = await res.json();
      if (data.stats) {
        setSubscriberStats({
          total: data.stats.total || 0,
          active: data.stats.active || 0,
        });
      }
    } catch (err) {
      console.error('Failed to fetch subscribers:', err);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
    fetchSubscribers();
    fetchMailgunStats();
  }, [fetchCampaigns, fetchSubscribers, fetchMailgunStats]);

  // Create campaign
  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const res = await fetch('/api/admin/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        setShowCreateModal(false);
        setFormData({
          name: '',
          subject: '',
          preheader: '',
          body: '',
          type: 'promotional',
          targetAudience: 'all',
        });
        fetchCampaigns();
      } else {
        alert(data.error || 'Failed to create campaign');
      }
    } catch (err) {
      alert('Failed to create campaign');
    } finally {
      setFormLoading(false);
    }
  };

  // Send campaign
  const handleSendCampaign = async (campaign: Campaign, testMode = false, testEmail?: string) => {
    if (!testMode && !confirm(`Send "${campaign.name}" to ${campaign.targetAudience === 'custom' ? uploadedEmails.length : subscriberStats.active} subscribers?`)) {
      return;
    }

    try {
      const body: any = { testMode };
      if (testMode && testEmail) body.testEmail = testEmail;
      if (uploadedEmails.length > 0) body.emails = uploadedEmails;

      const res = await fetch(`/api/admin/campaigns/${campaign.id}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.success) {
        alert(testMode
          ? `Test email sent to ${testEmail}`
          : `Campaign sent! ${data.stats.sent} emails delivered.`
        );
        fetchCampaigns();
        setTimeout(fetchMailgunStats, 5000); // Refresh Mailgun stats after 5s
      } else {
        alert(data.error || 'Failed to send campaign');
      }
    } catch (err) {
      alert('Failed to send campaign');
    }
  };

  // Delete campaign
  const handleDeleteCampaign = async (campaign: Campaign) => {
    if (!confirm(`Delete "${campaign.name}"? This cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/admin/campaigns?id=${campaign.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) fetchCampaigns();
      else alert(data.error || 'Failed to delete campaign');
    } catch (err) {
      alert('Failed to delete campaign');
    }
  };

  // Handle CSV upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/campaigns/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        setUploadedEmails(data.emails);
        setUploadStats(data.stats);
      } else {
        alert(data.error || 'Failed to process CSV');
      }
    } catch (err) {
      alert('Failed to upload file');
    }
  };

  // Handle text paste upload
  const handleTextUpload = async (text: string) => {
    try {
      const res = await fetch('/api/admin/campaigns/upload', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailText: text }),
      });
      const data = await res.json();
      if (data.success) {
        setUploadedEmails(data.emails);
        setUploadStats(data.stats);
      } else {
        alert(data.error || 'Failed to parse emails');
      }
    } catch (err) {
      alert('Failed to parse emails');
    }
  };

  // Use Mailgun stats if available, otherwise fallback to DB stats
  const displayStats = mailgunStats?.totals || {
    sent: stats?.totalSent || 0,
    delivered: stats?.totalDelivered || 0,
    opened: stats?.totalOpened || 0,
    clicked: stats?.totalClicked || 0,
    bounced: 0,
    complained: 0,
  };

  const displayRates = mailgunStats?.rates || {
    openRate: stats?.avgOpenRate || '0.0',
    clickRate: stats?.avgClickRate || '0.0',
    bounceRate: '0.0',
  };

  const statCards = [
    {
      label: 'Total Subscribers',
      value: subscriberStats.total.toLocaleString(),
      subtext: `${subscriberStats.active.toLocaleString()} active`,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Emails Sent',
      value: displayStats.sent.toLocaleString(),
      subtext: `${displayStats.delivered.toLocaleString()} delivered`,
      icon: Send,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: 'Open Rate',
      value: `${displayRates.openRate}%`,
      subtext: `${displayStats.opened.toLocaleString()} opens`,
      icon: Eye,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      label: 'Click Rate',
      value: `${displayRates.clickRate}%`,
      subtext: `${displayStats.clicked.toLocaleString()} clicks`,
      icon: MousePointer,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
  ];

  const eventIcon = (event: string) => {
    switch (event) {
      case 'delivered': return <CheckCircle className="w-3.5 h-3.5 text-green-500" />;
      case 'opened': return <Eye className="w-3.5 h-3.5 text-purple-500" />;
      case 'clicked': return <MousePointer className="w-3.5 h-3.5 text-orange-500" />;
      case 'bounced': return <XCircle className="w-3.5 h-3.5 text-red-500" />;
      case 'complained': return <AlertCircle className="w-3.5 h-3.5 text-red-600" />;
      default: return <Activity className="w-3.5 h-3.5 text-gray-400" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Marketing</h1>
          <p className="text-sm text-gray-500">Campaign management with real-time Mailgun analytics</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Upload List
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Campaign
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        {statCards.map((s, i) => (
          <div key={i} className="bg-white rounded-xl p-5 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg ${s.bg}`}>
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
              {mailgunLoading && i > 0 && (
                <Loader2 className="w-4 h-4 animate-spin text-gray-300" />
              )}
            </div>
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            <div className="text-xs text-gray-400 mt-0.5">{s.subtext}</div>
          </div>
        ))}
      </div>

      {/* Mailgun Stats Period Selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">Period:</span>
        {['1d', '7d', '30d'].map(d => (
          <button
            key={d}
            onClick={() => setStatsDuration(d)}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
              statsDuration === d ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {d === '1d' ? '24h' : d === '7d' ? '7 days' : '30 days'}
          </button>
        ))}
        <button
          onClick={() => { fetchMailgunStats(); fetchCampaigns(); }}
          className="ml-2 p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          title="Refresh stats"
        >
          <RefreshCw className={`w-4 h-4 text-gray-500 ${mailgunLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Recent Events Activity Feed */}
      {recentEvents.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-gray-600" />
            <h3 className="text-sm font-semibold text-gray-900">Recent Activity</h3>
            <span className="text-xs text-gray-400">Live from Mailgun</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {recentEvents.slice(0, 10).map((event, i) => (
              <div key={i} className="flex-shrink-0 flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                {eventIcon(event.event)}
                <span className="text-xs text-gray-600">{event.recipient.split('@')[0]}@...</span>
                <span className="text-xs text-gray-400">
                  {new Date(event.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Uploaded Emails Banner */}
      {uploadedEmails.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-900">
                {uploadedEmails.length.toLocaleString()} emails ready to send
              </p>
              <p className="text-xs text-blue-700">
                From uploaded list. Select a campaign and click Send.
              </p>
            </div>
          </div>
          <button
            onClick={() => { setUploadedEmails([]); setUploadStats(null); }}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Clear
          </button>
        </div>
      )}

      {/* Campaigns Table */}
      <div className="bg-white rounded-xl border border-gray-100">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Campaigns</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchCampaigns()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
            </button>
            {['all', 'draft', 'scheduled', 'sending', 'sent'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  filter === f ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto" />
            <p className="text-sm text-gray-500 mt-2">Loading campaigns...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
            <p className="text-sm text-red-600 mt-2">{error}</p>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="p-12 text-center">
            <MailPlus className="w-12 h-12 text-gray-300 mx-auto" />
            <p className="text-gray-500 mt-3">No campaigns yet</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800"
            >
              Create your first campaign
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">Campaign</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">Target</th>
                <th className="px-5 py-3 text-right text-xs font-medium text-gray-500">Sent</th>
                <th className="px-5 py-3 text-right text-xs font-medium text-gray-500">Open Rate</th>
                <th className="px-5 py-3 text-right text-xs font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {campaigns.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4">
                    <div className="text-sm font-medium text-gray-900">{c.name}</div>
                    <div className="text-xs text-gray-500 truncate max-w-xs">{c.subject}</div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      c.status === 'sent' ? 'bg-green-100 text-green-700' :
                      c.status === 'sending' ? 'bg-yellow-100 text-yellow-700' :
                      c.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600 capitalize">{c.targetAudience}</td>
                  <td className="px-5 py-4 text-sm text-gray-600 text-right">
                    {c.sent > 0 ? c.sent.toLocaleString() : '-'}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600 text-right">
                    {c.delivered > 0
                      ? `${((c.opened / c.delivered) * 100).toFixed(1)}%`
                      : '-'
                    }
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      {c.status === 'draft' && (
                        <>
                          <button
                            onClick={() => handleSendCampaign(c)}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Send Campaign"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              const testEmail = prompt('Enter test email address:');
                              if (testEmail) handleSendCampaign(c, true, testEmail);
                            }}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Send Test"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {c.status !== 'sending' && (
                        <button
                          onClick={() => handleDeleteCampaign(c)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Create Campaign</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder="e.g., Holiday Travel Deals"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject Line</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder="e.g., Exclusive Holiday Deals Just for You"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preheader (optional)</label>
                <input
                  type="text"
                  value={formData.preheader}
                  onChange={(e) => setFormData({ ...formData, preheader: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder="Preview text shown in inbox"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  >
                    <option value="promotional">Promotional</option>
                    <option value="newsletter">Newsletter</option>
                    <option value="announcement">Announcement</option>
                    <option value="transactional">Transactional</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                  <select
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  >
                    <option value="all">All Subscribers ({subscriberStats.active.toLocaleString()})</option>
                    <option value="active">Active Subscribers</option>
                    <option value="new">New (Last 30 days)</option>
                    <option value="engaged">Engaged (Opened/Clicked)</option>
                    {uploadedEmails.length > 0 && (
                      <option value="custom">Uploaded List ({uploadedEmails.length})</option>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Content (HTML)</label>
                <textarea
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent font-mono text-sm"
                  rows={10}
                  placeholder={`<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h1>Hello {{firstName}}!</h1>
  <p>Your amazing content here...</p>
  <a href="https://www.fly2any.com" style="display: inline-block; padding: 12px 24px; background: #E74035; color: white; text-decoration: none; border-radius: 8px;">Book Now</a>
</div>`}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Available variables: {'{{firstName}}'}, {'{{email}}'}, {'{{unsubscribe_url}}'}
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-700 text-sm font-medium hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2 transition-colors"
                >
                  {formLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Create Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Upload Email List</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload CSV File</label>
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-gray-300 transition-colors relative">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Drag & drop or click to upload</p>
                  <input
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              {/* Or Text Paste */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-2 bg-white text-sm text-gray-500">or paste emails</span>
                </div>
              </div>

              <div>
                <textarea
                  placeholder="Paste emails here, one per line or comma-separated..."
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                  rows={4}
                  onBlur={(e) => {
                    if (e.target.value.trim()) handleTextUpload(e.target.value);
                  }}
                />
              </div>

              {/* Upload Stats */}
              {uploadStats && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-lg font-semibold text-gray-900">{uploadStats.valid}</div>
                      <div className="text-xs text-gray-500">Valid</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-red-600">{uploadStats.invalid}</div>
                      <div className="text-xs text-gray-500">Invalid</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-yellow-600">{uploadStats.duplicates}</div>
                      <div className="text-xs text-gray-500">Duplicates</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-gray-600">{uploadStats.suppressed}</div>
                      <div className="text-xs text-gray-500">Suppressed</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-gray-700 text-sm font-medium hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {uploadedEmails.length > 0 ? 'Done' : 'Cancel'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
