'use client'

import { useState } from 'react'
import { Share2, Twitter, Facebook, Linkedin, MessageCircle, Link2, Copy, Eye, TrendingUp, Users, Heart, Zap, Globe, Code, BarChart3 } from 'lucide-react'

interface ShareStats {
  platform: string
  icon: typeof Twitter
  shares: number
  clicks: number
  conversions: number
  color: string
}

interface SocialProofConfig {
  enabled: boolean
  showRecentSearches: boolean
  showRecentBookings: boolean
  showSavings: boolean
  showActiveUsers: boolean
}

const shareStats: ShareStats[] = [
  { platform: 'Twitter/X', icon: Twitter, shares: 1245, clicks: 4520, conversions: 89, color: 'bg-black' },
  { platform: 'Facebook', icon: Facebook, shares: 890, clicks: 3210, conversions: 67, color: 'bg-blue-600' },
  { platform: 'WhatsApp', icon: MessageCircle, shares: 2340, clicks: 8900, conversions: 234, color: 'bg-green-500' },
  { platform: 'LinkedIn', icon: Linkedin, shares: 456, clicks: 1230, conversions: 45, color: 'bg-blue-700' },
  { platform: 'Copy Link', icon: Link2, shares: 3450, clicks: 12000, conversions: 345, color: 'bg-gray-600' }
]

export default function ViralFeaturesAdmin() {
  const [socialProof, setSocialProof] = useState<SocialProofConfig>({
    enabled: true,
    showRecentSearches: true,
    showRecentBookings: true,
    showSavings: true,
    showActiveUsers: true
  })

  const totalShares = shareStats.reduce((sum, s) => sum + s.shares, 0)
  const totalClicks = shareStats.reduce((sum, s) => sum + s.clicks, 0)
  const totalConversions = shareStats.reduce((sum, s) => sum + s.conversions, 0)
  const conversionRate = ((totalConversions / totalClicks) * 100).toFixed(1)

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg">
              <Share2 className="h-7 w-7 text-white" />
            </div>
            Viral Features
          </h1>
          <p className="text-gray-500 mt-1">Social sharing, social proof & viral mechanics</p>
        </div>
      </div>

      {/* Stats Banner */}
      <div className="bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-2xl p-6 text-white">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: 'Total Shares', value: totalShares.toLocaleString(), icon: Share2 },
            { label: 'Link Clicks', value: totalClicks.toLocaleString(), icon: Eye },
            { label: 'Conversions', value: totalConversions.toLocaleString(), icon: Users },
            { label: 'Conv. Rate', value: `${conversionRate}%`, icon: TrendingUp }
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="text-center">
              <Icon className="h-6 w-6 mx-auto mb-2 opacity-80" />
              <p className="text-3xl font-bold">{value}</p>
              <p className="text-sm text-purple-100">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Share Stats by Platform */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-purple-600" /> Sharing Performance
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {shareStats.map(stat => (
            <div key={stat.platform} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2.5 ${stat.color} rounded-xl`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
                <span className="font-semibold text-gray-900">{stat.platform}</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Shares</span>
                  <span className="font-bold text-gray-900">{stat.shares.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Clicks</span>
                  <span className="font-bold text-blue-600">{stat.clicks.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Conversions</span>
                  <span className="font-bold text-green-600">{stat.conversions}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Social Proof Settings */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" /> Social Proof Widget
          </h2>
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-sm text-gray-600">Enabled</span>
            <input
              type="checkbox"
              checked={socialProof.enabled}
              onChange={(e) => setSocialProof({ ...socialProof, enabled: e.target.checked })}
              className="w-10 h-6 rounded-full appearance-none bg-gray-200 checked:bg-purple-600 transition-colors cursor-pointer relative before:absolute before:w-4 before:h-4 before:rounded-full before:bg-white before:top-1 before:left-1 checked:before:translate-x-4 before:transition-transform before:shadow"
            />
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: 'showRecentSearches', label: 'Recent Searches', desc: 'Show "X people searching" notifications' },
            { key: 'showRecentBookings', label: 'Recent Bookings', desc: 'Show "X just booked" notifications' },
            { key: 'showSavings', label: 'Total Savings', desc: 'Show cumulative savings counter' },
            { key: 'showActiveUsers', label: 'Active Users', desc: 'Show "X users online" indicator' }
          ].map(({ key, label, desc }) => (
            <label key={key} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
              <input
                type="checkbox"
                checked={socialProof[key as keyof SocialProofConfig] as boolean}
                onChange={(e) => setSocialProof({ ...socialProof, [key]: e.target.checked })}
                className="mt-1 w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <div>
                <p className="font-medium text-gray-900">{label}</p>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            </label>
          ))}
        </div>

        {/* Preview */}
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
          <p className="text-sm font-medium text-purple-800 mb-3">Live Preview:</p>
          <div className="space-y-2">
            {socialProof.showRecentSearches && (
              <div className="flex items-center gap-2 text-sm text-gray-700 animate-pulse">
                <Eye className="h-4 w-4 text-blue-500" />
                <span>1,247 people searching for flights right now</span>
              </div>
            )}
            {socialProof.showRecentBookings && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Heart className="h-4 w-4 text-red-500" />
                <span>Sarah from NYC just booked JFK → Paris</span>
              </div>
            )}
            {socialProof.showSavings && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span>$127,450 saved by travelers this month</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Embeddable Widgets */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Code className="h-5 w-5 text-gray-600" /> Embeddable Widgets
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: 'Deal Finder', desc: 'Search widget for partner sites', code: '<iframe src="https://fly2any.com/embed/deal-finder" ...>' },
            { name: 'Price Alert', desc: 'Price alert signup widget', code: '<iframe src="https://fly2any.com/embed/price-alert" ...>' },
            { name: 'Social Proof', desc: 'Live activity widget', code: '<iframe src="https://fly2any.com/embed/social-proof" ...>' }
          ].map(widget => (
            <div key={widget.name} className="p-4 bg-gray-50 rounded-xl">
              <h3 className="font-semibold text-gray-900 mb-1">{widget.name}</h3>
              <p className="text-sm text-gray-500 mb-3">{widget.desc}</p>
              <button className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 flex items-center justify-center gap-2">
                <Copy className="h-4 w-4" /> Copy Embed Code
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
