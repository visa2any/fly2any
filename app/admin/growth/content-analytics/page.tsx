/**
 * Content Performance Analytics - Fly2Any Growth OS
 *
 * Track content effectiveness across all channels
 * Fetches real data from /api/admin/content and /api/admin/content-queue
 */
'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import {
  FileText,
  Eye,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  Share2,
  Clock,
  Star,
  Globe,
  Sparkles,
  RefreshCw,
  BarChart3,
  PenTool,
  MessageSquare,
  Layers,
  CheckCircle2,
  Calendar,
  MousePointerClick,
  ThumbsUp,
  ArrowRight,
  Zap,
} from 'lucide-react'

// =============================================================================
// TYPES
// =============================================================================

interface ContentItem {
  id: string
  title: string
  type: string
  content: string
  platforms: string[]
  status: string
  scheduledAt: string
  postedAt?: string
  posts?: {
    platform: string
    status: string
    impressions: number
    engagements: number
    clicks: number
  }[]
}

interface ChannelStats {
  channel: string
  totalPosts: number
  totalViews: number
  avgEngagement: number
  topPerformer: string
  trend: number
}

interface ContentSummary {
  totalContent: number
  posted: number
  pending: number
  failed: number
  totalImpressions: number
  totalEngagements: number
  totalClicks: number
}

// =============================================================================
// HELPER
// =============================================================================

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

function TrendBadge({ value }: { value: number }) {
  if (value === 0) return null
  const isUp = value > 0
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${isUp ? 'text-green-600' : 'text-red-500'}`}>
      {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {isUp ? '+' : ''}{value.toFixed(1)}%
    </span>
  )
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function ContentAnalyticsDashboard() {
  const [items, setItems] = useState<ContentItem[]>([])
  const [summary, setSummary] = useState<ContentSummary | null>(null)
  const [channelStats, setChannelStats] = useState<ChannelStats[]>([])
  const [timeRange, setTimeRange] = useState('30d')
  const [contentType, setContentType] = useState('all')
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const [contentRes, queueRes] = await Promise.all([
        fetch('/api/admin/content').catch(() => null),
        fetch('/api/admin/content-queue').catch(() => null),
      ])

      let allItems: ContentItem[] = []

      if (contentRes?.ok) {
        const data = await contentRes.json()
        allItems = [...allItems, ...(data.content || [])]
      }
      if (queueRes?.ok) {
        const data = await queueRes.json()
        allItems = [...allItems, ...(data.items || [])]
      }

      // Deduplicate by id
      const seen = new Set<string>()
      allItems = allItems.filter(item => {
        if (seen.has(item.id)) return false
        seen.add(item.id)
        return true
      })

      setItems(allItems)

      // Compute summary
      const posted = allItems.filter(i => i.status === 'posted')
      const totalImpressions = allItems.reduce((sum, i) =>
        sum + (i.posts?.reduce((a, p) => a + (p.impressions || 0), 0) || 0), 0)
      const totalEngagements = allItems.reduce((sum, i) =>
        sum + (i.posts?.reduce((a, p) => a + (p.engagements || 0), 0) || 0), 0)
      const totalClicks = allItems.reduce((sum, i) =>
        sum + (i.posts?.reduce((a, p) => a + (p.clicks || 0), 0) || 0), 0)

      setSummary({
        totalContent: allItems.length,
        posted: posted.length,
        pending: allItems.filter(i => ['pending', 'scheduled'].includes(i.status)).length,
        failed: allItems.filter(i => i.status === 'failed').length,
        totalImpressions,
        totalEngagements,
        totalClicks,
      })

      // Compute channel stats
      const channelMap: Record<string, { posts: ContentItem[] }> = {}
      allItems.forEach(item => {
        const platforms = item.platforms || []
        platforms.forEach(p => {
          if (!channelMap[p]) channelMap[p] = { posts: [] }
          channelMap[p].posts.push(item)
        })
      })

      const channels: ChannelStats[] = Object.entries(channelMap).map(([channel, data]) => {
        const views = data.posts.reduce((sum, i) =>
          sum + (i.posts?.filter(p => p.platform === channel).reduce((a, p) => a + (p.impressions || 0), 0) || 0), 0)
        const engagement = data.posts.reduce((sum, i) =>
          sum + (i.posts?.filter(p => p.platform === channel).reduce((a, p) => a + (p.engagements || 0), 0) || 0), 0)

        const topPost = data.posts.sort((a, b) => {
          const aViews = a.posts?.reduce((s, p) => s + (p.impressions || 0), 0) || 0
          const bViews = b.posts?.reduce((s, p) => s + (p.impressions || 0), 0) || 0
          return bViews - aViews
        })[0]

        return {
          channel: channel.charAt(0).toUpperCase() + channel.slice(1),
          totalPosts: data.posts.length,
          totalViews: views,
          avgEngagement: data.posts.length > 0 ? (engagement / data.posts.length) : 0,
          topPerformer: topPost?.title || 'N/A',
          trend: 0,
        }
      })

      setChannelStats(channels)
    } catch (error) {
      console.error('Error fetching content analytics:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const filteredItems = items
    .filter(i => contentType === 'all' || i.type === contentType)
    .sort((a, b) => {
      const aViews = a.posts?.reduce((s, p) => s + (p.impressions || 0), 0) || 0
      const bViews = b.posts?.reduce((s, p) => s + (p.impressions || 0), 0) || 0
      return bViews - aViews
    })
    .slice(0, 10)

  const typeColors: Record<string, string> = {
    blog: 'bg-blue-100 text-blue-700',
    guide: 'bg-green-100 text-green-700',
    deal: 'bg-orange-100 text-orange-700',
    social: 'bg-purple-100 text-purple-700',
  }

  const channelIcons: Record<string, string> = {
    Twitter: '𝕏',
    Instagram: '📸',
    Facebook: '📘',
    Tiktok: '🎵',
    Blog: '📝',
    Telegram: '📨',
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading Content Analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-400 font-medium mb-2">
            <Link href="/admin" className="hover:text-blue-600">Admin</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/admin/growth" className="hover:text-blue-600">Growth</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-600">Content Analytics</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            Content Performance
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Track content effectiveness across all channels
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={contentType}
            onChange={(e) => setContentType(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            <option value="all">All Content</option>
            <option value="blog">Blog Posts</option>
            <option value="guide">Guides</option>
            <option value="deal">Deals</option>
            <option value="social">Social</option>
          </select>
          <button
            onClick={fetchData}
            className="p-2.5 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all"
          >
            <RefreshCw className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {[
            { label: 'Total Content', value: summary.totalContent, icon: FileText, gradient: 'from-indigo-500 to-purple-500' },
            { label: 'Posted', value: summary.posted, icon: CheckCircle2, gradient: 'from-green-500 to-emerald-500' },
            { label: 'Pending', value: summary.pending, icon: Clock, gradient: 'from-amber-500 to-orange-500' },
            { label: 'Failed', value: summary.failed, icon: TrendingDown, gradient: 'from-red-500 to-rose-500' },
            { label: 'Impressions', value: formatNumber(summary.totalImpressions), icon: Eye, gradient: 'from-blue-500 to-cyan-500' },
            { label: 'Engagements', value: formatNumber(summary.totalEngagements), icon: ThumbsUp, gradient: 'from-pink-500 to-rose-500' },
            { label: 'Clicks', value: formatNumber(summary.totalClicks), icon: MousePointerClick, gradient: 'from-orange-500 to-red-500' },
          ].map(({ label, value, icon: Icon, gradient }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all">
              <div className={`w-9 h-9 bg-gradient-to-br ${gradient} rounded-lg flex items-center justify-center mb-3`}>
                <Icon className="h-4 w-4 text-white" />
              </div>
              <p className="text-xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500 font-medium">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Channel Performance */}
      {channelStats.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-indigo-600" />
            Channel Performance
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {channelStats.map(channel => (
              <div
                key={channel.channel}
                className="border border-gray-200 rounded-xl p-4 hover:shadow-md hover:border-indigo-200 transition-all"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">{channelIcons[channel.channel] || '📱'}</span>
                  <h3 className="font-bold text-gray-900 text-sm">{channel.channel}</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Posts</span>
                    <span className="font-semibold text-gray-900">{channel.totalPosts}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Impressions</span>
                    <span className="font-semibold text-gray-900">{formatNumber(channel.totalViews)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Avg Engagement</span>
                    <span className="font-semibold text-gray-900">{channel.avgEngagement.toFixed(1)}</span>
                  </div>
                </div>
                {channel.topPerformer !== 'N/A' && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-[10px] text-gray-400 uppercase font-semibold">Top Performer</p>
                    <p className="text-xs font-medium text-gray-700 truncate mt-0.5">{channel.topPerformer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Content Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500" />
            Top Performing Content
          </h2>
          <span className="text-xs text-gray-400">{filteredItems.length} items</span>
        </div>

        {filteredItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="w-7 h-7 text-gray-400" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">No content yet</h3>
            <p className="text-sm text-gray-500 mb-4">Generate content to see analytics here</p>
            <Link
              href="/admin/growth/content"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all"
            >
              <Sparkles className="w-4 h-4" /> Generate Content
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Content</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Impressions</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Engagements</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Clicks</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Platforms</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredItems.map(item => {
                  const impressions = item.posts?.reduce((a, p) => a + (p.impressions || 0), 0) || 0
                  const engagements = item.posts?.reduce((a, p) => a + (p.engagements || 0), 0) || 0
                  const clicks = item.posts?.reduce((a, p) => a + (p.clicks || 0), 0) || 0

                  return (
                    <tr key={item.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${typeColors[item.type] || 'bg-gray-100 text-gray-600'}`}>
                            {item.type}
                          </span>
                          <div className="min-w-0">
                            <p className="font-semibold text-sm text-gray-900 truncate max-w-[300px]">{item.title}</p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {item.postedAt ? new Date(item.postedAt).toLocaleDateString() :
                               item.scheduledAt ? `Scheduled: ${new Date(item.scheduledAt).toLocaleDateString()}` : ''}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="text-sm font-semibold text-gray-900">{formatNumber(impressions)}</span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="text-sm font-semibold text-gray-900">{formatNumber(engagements)}</span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="text-sm font-semibold text-gray-900">{formatNumber(clicks)}</span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex gap-1 justify-end">
                          {item.platforms?.map(p => (
                            <span key={p} className="text-sm" title={p}>
                              {channelIcons[p.charAt(0).toUpperCase() + p.slice(1)] || '📱'}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                          item.status === 'posted' ? 'bg-green-100 text-green-700' :
                          item.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          item.status === 'failed' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/admin/growth/content"
          className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-purple-200 transition-all group"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-purple-600" />
            </div>
            <h3 className="font-bold text-gray-900 text-sm">Create Content</h3>
            <ArrowRight className="w-4 h-4 text-gray-300 ml-auto group-hover:text-purple-500 group-hover:translate-x-0.5 transition-all" />
          </div>
          <p className="text-xs text-gray-500">Generate new blog posts and guides with AI</p>
        </Link>

        <Link
          href="/admin/social"
          className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-pink-200 transition-all group"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 bg-pink-100 rounded-lg flex items-center justify-center">
              <Share2 className="w-4 h-4 text-pink-600" />
            </div>
            <h3 className="font-bold text-gray-900 text-sm">Social Media</h3>
            <ArrowRight className="w-4 h-4 text-gray-300 ml-auto group-hover:text-pink-500 group-hover:translate-x-0.5 transition-all" />
          </div>
          <p className="text-xs text-gray-500">Manage distribution across platforms</p>
        </Link>

        <Link
          href="/admin/growth/content-review"
          className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-amber-200 transition-all group"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-amber-600" />
            </div>
            <h3 className="font-bold text-gray-900 text-sm">Review Queue</h3>
            <ArrowRight className="w-4 h-4 text-gray-300 ml-auto group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all" />
          </div>
          <p className="text-xs text-gray-500">Approve pending content before publishing</p>
        </Link>
      </div>
    </div>
  )
}
