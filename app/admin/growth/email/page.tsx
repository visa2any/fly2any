'use client'

import { useState, useEffect } from 'react'
import { Mail, Send, Users, TrendingUp, Clock, CheckCircle2, Eye, MousePointer, RefreshCw, Sparkles, FileText, Bell, Gift, BarChart3, Trash2, Download, Filter, Search } from 'lucide-react'

interface EmailCampaign {
  id: string
  name: string
  template: string
  status: 'draft' | 'scheduled' | 'sent' | 'sending'
  recipients: number
  sent: number
  opened: number
  clicked: number
  scheduledAt?: string
  sentAt?: string
}

interface EmailStats {
  totalSent: number
  totalOpened: number
  totalClicked: number
  subscribers: number
  openRate: number
  clickRate: number
}

interface Subscriber {
  id: string
  email: string
  firstName?: string
  source: string
  status: string
  subscribedAt: string
  emailsSent: number
  emailsOpened: number
  emailsClicked: number
}

interface SubscriberStats {
  total: number
  active: number
  unsubscribed: number
  exitIntent: number
  mobileScroll: number
  footer: number
  website: number
}

const mockCampaigns: EmailCampaign[] = [
  { id: '1', name: 'Weekly Deals Newsletter', template: 'weekly_deals', status: 'sent', recipients: 5420, sent: 5420, opened: 2156, clicked: 432, sentAt: new Date(Date.now() - 86400000).toISOString() },
  { id: '2', name: 'Flash Sale Alert', template: 'price_alert', status: 'scheduled', recipients: 8900, sent: 0, opened: 0, clicked: 0, scheduledAt: new Date(Date.now() + 3600000).toISOString() },
  { id: '3', name: 'Welcome Series - Day 1', template: 'welcome', status: 'sending', recipients: 150, sent: 89, opened: 0, clicked: 0 }
]

const mockStats: EmailStats = { totalSent: 45230, totalOpened: 18540, totalClicked: 4521, subscribers: 12450, openRate: 41, clickRate: 10 }

export default function EmailMarketingAdmin() {
  const [campaigns] = useState<EmailCampaign[]>(mockCampaigns)
  const [stats, setStats] = useState<EmailStats>(mockStats)
  const [activeTab, setActiveTab] = useState<'campaigns' | 'templates' | 'subscribers'>('campaigns')

  // Real subscriber data
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [subscriberStats, setSubscriberStats] = useState<SubscriberStats | null>(null)
  const [loadingSubscribers, setLoadingSubscribers] = useState(false)
  const [sourceFilter, setSourceFilter] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch subscribers when tab changes to subscribers
  useEffect(() => {
    if (activeTab === 'subscribers') {
      fetchSubscribers()
    }
  }, [activeTab, sourceFilter])

  const fetchSubscribers = async () => {
    setLoadingSubscribers(true)
    try {
      const params = new URLSearchParams()
      if (sourceFilter) params.set('source', sourceFilter)

      const res = await fetch(`/api/admin/subscribers?${params}`)
      if (res.ok) {
        const data = await res.json()
        setSubscribers(data.subscribers || [])
        setSubscriberStats(data.stats || null)
        // Update main stats with real subscriber count
        if (data.stats?.total) {
          setStats(prev => ({ ...prev, subscribers: data.stats.total }))
        }
      }
    } catch (e) {
      console.error('Failed to fetch subscribers:', e)
    } finally {
      setLoadingSubscribers(false)
    }
  }

  const handleDeleteSubscriber = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subscriber?')) return
    try {
      const res = await fetch(`/api/admin/subscribers?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        setSubscribers(prev => prev.filter(s => s.id !== id))
        fetchSubscribers() // Refresh stats
      }
    } catch (e) {
      console.error('Failed to delete subscriber:', e)
    }
  }

  const filteredSubscribers = subscribers.filter(s =>
    !searchQuery || s.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getSourceLabel = (source: string) => {
    if (source.includes('exit_intent')) return 'Exit Intent'
    if (source.includes('mobile_scroll')) return 'Mobile Scroll'
    if (source.includes('footer')) return 'Footer'
    if (source.includes('world')) return 'World Cup'
    return source.charAt(0).toUpperCase() + source.slice(1)
  }

  const getSourceColor = (source: string) => {
    if (source.includes('exit_intent')) return 'bg-purple-100 text-purple-700'
    if (source.includes('mobile_scroll')) return 'bg-blue-100 text-blue-700'
    if (source.includes('footer')) return 'bg-gray-100 text-gray-700'
    if (source.includes('world')) return 'bg-yellow-100 text-yellow-700'
    return 'bg-green-100 text-green-700'
  }

  const statusColors = {
    draft: 'bg-gray-100 text-gray-700',
    scheduled: 'bg-blue-100 text-blue-700',
    sending: 'bg-yellow-100 text-yellow-700',
    sent: 'bg-green-100 text-green-700'
  }

  const templateIcons: Record<string, typeof Mail> = {
    welcome: Gift,
    price_alert: Bell,
    weekly_deals: FileText,
    booking_confirmation: CheckCircle2
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl shadow-lg">
              <Mail className="h-7 w-7 text-white" />
            </div>
            Email Marketing
          </h1>
          <p className="text-gray-500 mt-1">Automated email campaigns & newsletters</p>
        </div>
        <button className="px-4 py-2.5 bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition-all flex items-center gap-2 font-medium shadow-sm">
          <Sparkles className="h-4 w-4" /> Create Campaign
        </button>
      </div>

      {/* Stats Banner */}
      <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 rounded-2xl p-6 text-white">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {[
            { label: 'Subscribers', value: stats.subscribers.toLocaleString(), icon: Users },
            { label: 'Emails Sent', value: stats.totalSent.toLocaleString(), icon: Send },
            { label: 'Opened', value: stats.totalOpened.toLocaleString(), icon: Eye },
            { label: 'Clicked', value: stats.totalClicked.toLocaleString(), icon: MousePointer },
            { label: 'Open Rate', value: `${stats.openRate}%`, icon: TrendingUp },
            { label: 'Click Rate', value: `${stats.clickRate}%`, icon: BarChart3 }
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="text-center">
              <Icon className="h-5 w-5 mx-auto mb-2 opacity-80" />
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs text-pink-100">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-2">
        {(['campaigns', 'templates', 'subscribers'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${activeTab === tab ? 'bg-pink-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Campaigns Tab */}
      {activeTab === 'campaigns' && (
        <div className="space-y-4">
          {campaigns.map(campaign => {
            const Icon = templateIcons[campaign.template] || Mail
            const openRate = campaign.sent > 0 ? ((campaign.opened / campaign.sent) * 100).toFixed(1) : '0'
            const clickRate = campaign.opened > 0 ? ((campaign.clicked / campaign.opened) * 100).toFixed(1) : '0'

            return (
              <div key={campaign.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-pink-100 rounded-xl">
                      <Icon className="h-6 w-6 text-pink-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{campaign.name}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[campaign.status]}`}>
                          {campaign.status}
                        </span>
                        <span className="text-sm text-gray-500">{campaign.recipients.toLocaleString()} recipients</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900">{campaign.sent.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">Sent</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-green-600">{openRate}%</p>
                      <p className="text-xs text-gray-500">Open Rate</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-blue-600">{clickRate}%</p>
                      <p className="text-xs text-gray-500">Click Rate</p>
                    </div>
                    {campaign.scheduledAt && (
                      <div className="text-center">
                        <Clock className="h-4 w-4 text-gray-400 mx-auto mb-1" />
                        <p className="text-xs text-gray-500">{new Date(campaign.scheduledAt).toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: 'Welcome Email', template: 'welcome', description: 'Onboarding sequence for new users', icon: Gift },
            { name: 'Price Alert', template: 'price_alert', description: 'Notify users of price drops', icon: Bell },
            { name: 'Weekly Deals', template: 'weekly_deals', description: 'Weekly newsletter with top deals', icon: FileText },
            { name: 'Booking Confirmation', template: 'booking_confirmation', description: 'Transactional booking email', icon: CheckCircle2 },
            { name: 'Abandoned Search', template: 'abandoned_search', description: 'Re-engage users who left', icon: RefreshCw },
            { name: 'Referral Invite', template: 'referral_invite', description: 'Invite friends to join', icon: Users }
          ].map(({ name, template, description, icon: Icon }) => (
            <div key={template} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:border-pink-300 transition-all cursor-pointer">
              <div className="p-3 bg-pink-100 rounded-xl w-fit mb-4">
                <Icon className="h-6 w-6 text-pink-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{name}</h3>
              <p className="text-sm text-gray-500">{description}</p>
            </div>
          ))}
        </div>
      )}

      {/* Subscribers Tab */}
      {activeTab === 'subscribers' && (
        <div className="space-y-4">
          {/* Stats Cards */}
          {subscriberStats && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {[
                { label: 'Total', value: subscriberStats.total, color: 'text-gray-900' },
                { label: 'Active', value: subscriberStats.active, color: 'text-green-600' },
                { label: 'Unsubscribed', value: subscriberStats.unsubscribed, color: 'text-red-600' },
                { label: 'Exit Intent', value: subscriberStats.exitIntent, color: 'text-purple-600' },
                { label: 'Mobile Scroll', value: subscriberStats.mobileScroll, color: 'text-blue-600' },
                { label: 'Footer', value: subscriberStats.footer, color: 'text-gray-600' },
                { label: 'Website', value: subscriberStats.website, color: 'text-green-600' },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                  <p className={`text-2xl font-bold ${color}`}>{value.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">{label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Filters & Search */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="">All Sources</option>
                <option value="exit_intent">Exit Intent</option>
                <option value="mobile_scroll">Mobile Scroll</option>
                <option value="footer">Footer</option>
                <option value="website">Website</option>
              </select>
              <button
                onClick={fetchSubscribers}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2 text-sm"
              >
                <RefreshCw className={`h-4 w-4 ${loadingSubscribers ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* Subscribers Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {loadingSubscribers ? (
              <div className="p-8 text-center">
                <RefreshCw className="h-8 w-8 animate-spin text-pink-500 mx-auto mb-3" />
                <p className="text-gray-500">Loading subscribers...</p>
              </div>
            ) : filteredSubscribers.length === 0 ? (
              <div className="p-8 text-center">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No subscribers found</p>
                <p className="text-sm text-gray-400 mt-1">Subscribers will appear here when users sign up</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Source</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Subscribed</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Engagement</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredSubscribers.map((sub) => (
                      <tr key={sub.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 text-sm font-medium">
                              {sub.email.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{sub.email}</p>
                              {sub.firstName && <p className="text-xs text-gray-500">{sub.firstName}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSourceColor(sub.source)}`}>
                            {getSourceLabel(sub.source)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            sub.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {sub.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {new Date(sub.subscribedAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span title="Emails Sent"><Send className="h-3 w-3 inline mr-1" />{sub.emailsSent}</span>
                            <span title="Opened"><Eye className="h-3 w-3 inline mr-1" />{sub.emailsOpened}</span>
                            <span title="Clicked"><MousePointer className="h-3 w-3 inline mr-1" />{sub.emailsClicked}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleDeleteSubscriber(sub.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete subscriber"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
