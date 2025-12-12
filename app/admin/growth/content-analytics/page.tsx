/**
 * Content Performance Analytics - Fly2Any Growth OS
 *
 * Track content effectiveness across all channels
 */
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  DocumentTextIcon,
  ChartBarIcon,
  EyeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChevronRightIcon,
  ShareIcon,
  CursorArrowRaysIcon,
  ClockIcon,
  StarIcon,
  GlobeAltIcon,
  NewspaperIcon
} from '@heroicons/react/24/outline'

interface ContentMetrics {
  id: string
  title: string
  type: 'blog' | 'guide' | 'deal' | 'social'
  channel: string
  publishedAt: string
  views: number
  clicks: number
  shares: number
  timeOnPage: number
  bounceRate: number
  conversions: number
  revenue: number
  trend: number
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
  totalViews: number
  avgTimeOnPage: number
  avgBounceRate: number
  totalConversions: number
  totalRevenue: number
  contentThisWeek: number
  viewsThisWeek: number
}

const mockSummary: ContentSummary = {
  totalContent: 847,
  totalViews: 125000,
  avgTimeOnPage: 3.2,
  avgBounceRate: 42,
  totalConversions: 3250,
  totalRevenue: 485000,
  contentThisWeek: 23,
  viewsThisWeek: 18500
}

const mockChannelStats: ChannelStats[] = [
  { channel: 'Blog', totalPosts: 156, totalViews: 45000, avgEngagement: 8.5, topPerformer: 'Ultimate Guide to Cheap Flights in 2025', trend: 12.3 },
  { channel: 'Destination Guides', totalPosts: 89, totalViews: 32000, avgEngagement: 12.2, topPerformer: 'Tokyo Travel Guide', trend: 18.7 },
  { channel: 'Deal Posts', totalPosts: 425, totalViews: 38000, avgEngagement: 6.8, topPerformer: 'NYC to London $299', trend: 5.2 },
  { channel: 'Social Media', totalPosts: 177, totalViews: 10000, avgEngagement: 4.2, topPerformer: 'Travel tip: Packing hacks', trend: -2.1 }
]

const mockTopContent: ContentMetrics[] = [
  {
    id: '1',
    title: 'How to Find Cheap Flights: Ultimate 2025 Guide',
    type: 'blog',
    channel: 'Blog',
    publishedAt: '2025-12-05',
    views: 12500,
    clicks: 3200,
    shares: 450,
    timeOnPage: 4.8,
    bounceRate: 32,
    conversions: 180,
    revenue: 28500,
    trend: 24.5
  },
  {
    id: '2',
    title: 'Tokyo Travel Guide: Everything You Need to Know',
    type: 'guide',
    channel: 'Guides',
    publishedAt: '2025-12-03',
    views: 8900,
    clicks: 2100,
    shares: 380,
    timeOnPage: 6.2,
    bounceRate: 28,
    conversions: 95,
    revenue: 18200,
    trend: 18.2
  },
  {
    id: '3',
    title: 'JFK → LHR from $299 - Limited Time!',
    type: 'deal',
    channel: 'Deals',
    publishedAt: '2025-12-10',
    views: 6200,
    clicks: 1800,
    shares: 220,
    timeOnPage: 2.1,
    bounceRate: 45,
    conversions: 125,
    revenue: 45000,
    trend: 42.1
  },
  {
    id: '4',
    title: 'Barcelona: Best Time to Visit in 2025',
    type: 'guide',
    channel: 'Guides',
    publishedAt: '2025-12-01',
    views: 5600,
    clicks: 1400,
    shares: 195,
    timeOnPage: 5.4,
    bounceRate: 35,
    conversions: 68,
    revenue: 12800,
    trend: 8.7
  },
  {
    id: '5',
    title: '5 Airport Hacks That Save Hours',
    type: 'social',
    channel: 'Social',
    publishedAt: '2025-12-08',
    views: 4200,
    clicks: 980,
    shares: 850,
    timeOnPage: 1.8,
    bounceRate: 55,
    conversions: 32,
    revenue: 4500,
    trend: 65.3
  }
]

export default function ContentAnalyticsDashboard() {
  const [summary, setSummary] = useState<ContentSummary>(mockSummary)
  const [channelStats, setChannelStats] = useState<ChannelStats[]>(mockChannelStats)
  const [topContent, setTopContent] = useState<ContentMetrics[]>(mockTopContent)
  const [timeRange, setTimeRange] = useState('30d')
  const [contentType, setContentType] = useState('all')
  const [loading, setLoading] = useState(false)

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'blog': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
      case 'guide': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
      case 'deal': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
      case 'social': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  const getTrendIcon = (trend: number) => {
    if (trend > 0) {
      return <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />
    }
    return <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <Link href="/admin" className="hover:text-blue-600">Admin</Link>
              <ChevronRightIcon className="w-4 h-4" />
              <Link href="/admin/growth" className="hover:text-blue-600">Growth</Link>
              <ChevronRightIcon className="w-4 h-4" />
              <span>Content Analytics</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <DocumentTextIcon className="w-8 h-8 text-indigo-600" />
              Content Performance
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Track content effectiveness across all channels
            </p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="all">All Content</option>
              <option value="blog">Blog Posts</option>
              <option value="guide">Guides</option>
              <option value="deal">Deals</option>
              <option value="social">Social</option>
            </select>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                <NewspaperIcon className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Content</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {summary.totalContent.toLocaleString()}
                </p>
                <p className="text-xs text-green-600">+{summary.contentThisWeek} this week</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <EyeIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Views</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(summary.totalViews)}
                </p>
                <p className="text-xs text-green-600">+{formatNumber(summary.viewsThisWeek)} this week</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <ClockIcon className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Avg. Time on Page</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {summary.avgTimeOnPage}m
                </p>
                <p className="text-xs text-gray-500">{summary.avgBounceRate}% bounce rate</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <CursorArrowRaysIcon className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Conversions</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {summary.totalConversions.toLocaleString()}
                </p>
                <p className="text-xs text-green-600">${formatNumber(summary.totalRevenue)} revenue</p>
              </div>
            </div>
          </div>
        </div>

        {/* Channel Performance */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <GlobeAltIcon className="w-5 h-5" />
            Channel Performance
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {channelStats.map(channel => (
              <div
                key={channel.channel}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{channel.channel}</h3>
                  <div className="flex items-center gap-1 text-sm">
                    {getTrendIcon(channel.trend)}
                    <span className={channel.trend > 0 ? 'text-green-600' : 'text-red-600'}>
                      {channel.trend > 0 ? '+' : ''}{channel.trend}%
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Posts</span>
                    <span className="font-medium text-gray-900 dark:text-white">{channel.totalPosts}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Views</span>
                    <span className="font-medium text-gray-900 dark:text-white">{formatNumber(channel.totalViews)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Engagement</span>
                    <span className="font-medium text-gray-900 dark:text-white">{channel.avgEngagement}%</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                  <p className="text-xs text-gray-500">Top Performer:</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {channel.topPerformer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performing Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <StarIcon className="w-5 h-5 text-yellow-500" />
              Top Performing Content
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Content
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Views
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Clicks
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Shares
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Conversions
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Trend
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {topContent.map(content => (
                  <tr key={content.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(content.type)}`}>
                          {content.type}
                        </span>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white line-clamp-1">
                            {content.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(content.publishedAt).toLocaleDateString()} · {content.channel}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <EyeIcon className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatNumber(content.views)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-gray-900 dark:text-white">
                      {formatNumber(content.clicks)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <ShareIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900 dark:text-white">{content.shares}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-gray-900 dark:text-white">
                      {content.timeOnPage}m
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-green-600">
                      {content.conversions}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-gray-900 dark:text-white">
                      ${formatNumber(content.revenue)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {getTrendIcon(content.trend)}
                        <span className={content.trend > 0 ? 'text-green-600' : 'text-red-600'}>
                          {content.trend > 0 ? '+' : ''}{content.trend}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/growth/content"
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Create Content</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Generate new blog posts and guides with AI
            </p>
          </Link>

          <Link
            href="/admin/growth/distribution"
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Distribution</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage content distribution across channels
            </p>
          </Link>

          <Link
            href="/admin/growth/content-review"
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Review Queue</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Approve pending content before publishing
            </p>
          </Link>
        </div>
      </div>
    </div>
  )
}
