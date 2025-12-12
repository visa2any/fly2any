'use client'

import { useState } from 'react'
import { Mail, Send, Users, TrendingUp, Clock, CheckCircle2, Eye, MousePointer, RefreshCw, Sparkles, FileText, Bell, Gift, BarChart3 } from 'lucide-react'

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

const mockCampaigns: EmailCampaign[] = [
  { id: '1', name: 'Weekly Deals Newsletter', template: 'weekly_deals', status: 'sent', recipients: 5420, sent: 5420, opened: 2156, clicked: 432, sentAt: new Date(Date.now() - 86400000).toISOString() },
  { id: '2', name: 'Flash Sale Alert', template: 'price_alert', status: 'scheduled', recipients: 8900, sent: 0, opened: 0, clicked: 0, scheduledAt: new Date(Date.now() + 3600000).toISOString() },
  { id: '3', name: 'Welcome Series - Day 1', template: 'welcome', status: 'sending', recipients: 150, sent: 89, opened: 0, clicked: 0 }
]

const mockStats: EmailStats = { totalSent: 45230, totalOpened: 18540, totalClicked: 4521, subscribers: 12450, openRate: 41, clickRate: 10 }

export default function EmailMarketingAdmin() {
  const [campaigns] = useState<EmailCampaign[]>(mockCampaigns)
  const [stats] = useState<EmailStats>(mockStats)
  const [activeTab, setActiveTab] = useState<'campaigns' | 'templates' | 'subscribers'>('campaigns')

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
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-900">Subscriber Growth</h3>
            <span className="text-sm text-green-600 font-medium">+12.5% this month</span>
          </div>
          <div className="h-64 flex items-center justify-center text-gray-400">
            [Subscriber growth chart would go here]
          </div>
        </div>
      )}
    </div>
  )
}
