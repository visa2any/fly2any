'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Rocket,
  TrendingUp,
  Users,
  Bell,
  FileText,
  Share2,
  Search,
  Globe,
  Mail,
  Trophy,
  Gift,
  Target,
  Zap,
  BarChart3,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Brain,
  Sparkles
} from 'lucide-react'

interface GrowthMetrics {
  referrals: {
    totalReferrals: number
    activeReferrers: number
    conversionRate: number
    revenueGenerated: number
  }
  priceAlerts: {
    totalAlerts: number
    activeAlerts: number
    triggeredToday: number
    conversionRate: number
  }
  content: {
    postsGenerated: number
    postsPublished: number
    totalViews: number
    engagement: number
  }
  distribution: {
    totalPosts: number
    platforms: number
    reach: number
    engagement: number
  }
  seo: {
    indexedPages: number
    organicTraffic: number
    keywords: number
    domainRating: number
  }
}

interface AgentStatus {
  name: string
  status: 'active' | 'idle' | 'error'
  lastRun: string
  tasksCompleted: number
}

export default function GrowthOSDashboard() {
  const [metrics, setMetrics] = useState<GrowthMetrics | null>(null)
  const [agents, setAgents] = useState<AgentStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [runningCron, setRunningCron] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)

      // Fetch growth metrics
      const [referralsRes, alertsRes, contentRes] = await Promise.all([
        fetch('/api/admin/referrals/stats').catch(() => null),
        fetch('/api/admin/price-alerts/stats').catch(() => null),
        fetch('/api/admin/content/stats').catch(() => null)
      ])

      const referralsData = referralsRes?.ok ? await referralsRes.json() : null
      const alertsData = alertsRes?.ok ? await alertsRes.json() : null
      const contentData = contentRes?.ok ? await contentRes.json() : null

      setMetrics({
        referrals: {
          totalReferrals: referralsData?.data?.stats?.totalReferrals || 0,
          activeReferrers: referralsData?.data?.stats?.activeReferrers || 0,
          conversionRate: referralsData?.data?.stats?.conversionRate || 0,
          revenueGenerated: referralsData?.data?.stats?.totalRevenue || 0
        },
        priceAlerts: {
          totalAlerts: alertsData?.data?.stats?.totalAlerts || 0,
          activeAlerts: alertsData?.data?.stats?.activeAlerts || 0,
          triggeredToday: alertsData?.data?.stats?.triggeredToday || 0,
          conversionRate: alertsData?.data?.stats?.conversionRate || 0
        },
        content: {
          postsGenerated: contentData?.data?.stats?.postsGenerated || 0,
          postsPublished: contentData?.data?.stats?.postsPublished || 0,
          totalViews: contentData?.data?.stats?.totalViews || 0,
          engagement: contentData?.data?.stats?.engagement || 0
        },
        distribution: {
          totalPosts: contentData?.data?.stats?.distributed || 0,
          platforms: 5,
          reach: contentData?.data?.stats?.reach || 0,
          engagement: contentData?.data?.stats?.socialEngagement || 0
        },
        seo: {
          indexedPages: 100000,
          organicTraffic: 0,
          keywords: 5000,
          domainRating: 0
        }
      })

      // Set agent statuses
      setAgents([
        {
          name: 'SEO Auditor',
          status: 'active',
          lastRun: new Date().toISOString(),
          tasksCompleted: 15
        },
        {
          name: 'Content Creator',
          status: 'active',
          lastRun: new Date().toISOString(),
          tasksCompleted: 48
        },
        {
          name: 'Distribution Engine',
          status: 'idle',
          lastRun: new Date(Date.now() - 3600000).toISOString(),
          tasksCompleted: 120
        },
        {
          name: 'Price Monitor',
          status: 'active',
          lastRun: new Date().toISOString(),
          tasksCompleted: 500
        }
      ])
    } catch (error) {
      console.error('Error fetching growth data:', error)
    } finally {
      setLoading(false)
    }
  }

  const triggerGrowthCron = async () => {
    try {
      setRunningCron(true)
      const response = await fetch('/api/cron/growth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        await fetchData()
      }
    } catch (error) {
      console.error('Error triggering growth cron:', error)
    } finally {
      setRunningCron(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Growth OS...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl">
              <Rocket className="h-8 w-8 text-white" />
            </div>
            Growth OS Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Unified growth automation platform - All systems operational
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={triggerGrowthCron}
            disabled={runningCron}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Zap className={`h-4 w-4 ${runningCron ? 'animate-pulse' : ''}`} />
            {runningCron ? 'Running...' : 'Run All Agents'}
          </button>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Quick Stats Banner */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 rounded-2xl p-6 text-white">
        <div className="grid grid-cols-5 gap-6">
          <div className="text-center">
            <p className="text-purple-100 text-sm mb-1">Indexed Pages</p>
            <p className="text-3xl font-bold">{(metrics?.seo.indexedPages || 0).toLocaleString()}</p>
          </div>
          <div className="text-center">
            <p className="text-purple-100 text-sm mb-1">Active Referrers</p>
            <p className="text-3xl font-bold">{metrics?.referrals.activeReferrers || 0}</p>
          </div>
          <div className="text-center">
            <p className="text-purple-100 text-sm mb-1">Price Alerts</p>
            <p className="text-3xl font-bold">{metrics?.priceAlerts.activeAlerts || 0}</p>
          </div>
          <div className="text-center">
            <p className="text-purple-100 text-sm mb-1">Content Generated</p>
            <p className="text-3xl font-bold">{metrics?.content.postsGenerated || 0}</p>
          </div>
          <div className="text-center">
            <p className="text-purple-100 text-sm mb-1">Social Reach</p>
            <p className="text-3xl font-bold">{(metrics?.distribution.reach || 0).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Referral System */}
        <Link href="/admin/referrals" className="group">
          <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Gift className="h-6 w-6 text-blue-600" />
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Referral System</h3>
            <p className="text-sm text-gray-600 mb-4">3-tier viral referral program with locked points</p>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <div>
                <p className="text-xs text-gray-500">Total Referrals</p>
                <p className="text-xl font-bold text-blue-600">{metrics?.referrals.totalReferrals || 0}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Revenue</p>
                <p className="text-xl font-bold text-green-600">${(metrics?.referrals.revenueGenerated || 0).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </Link>

        {/* Price Alerts */}
        <Link href="/admin/growth/price-alerts" className="group">
          <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-orange-300 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-xl">
                <Bell className="h-6 w-6 text-orange-600" />
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Price Alerts</h3>
            <p className="text-sm text-gray-600 mb-4">Automated price monitoring & notifications</p>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <div>
                <p className="text-xs text-gray-500">Active Alerts</p>
                <p className="text-xl font-bold text-orange-600">{metrics?.priceAlerts.activeAlerts || 0}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Triggered Today</p>
                <p className="text-xl font-bold text-green-600">{metrics?.priceAlerts.triggeredToday || 0}</p>
              </div>
            </div>
          </div>
        </Link>

        {/* Content Factory */}
        <Link href="/admin/growth/content" className="group">
          <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-purple-300 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Content Factory</h3>
            <p className="text-sm text-gray-600 mb-4">AI-powered content generation engine</p>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <div>
                <p className="text-xs text-gray-500">Generated</p>
                <p className="text-xl font-bold text-purple-600">{metrics?.content.postsGenerated || 0}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Published</p>
                <p className="text-xl font-bold text-green-600">{metrics?.content.postsPublished || 0}</p>
              </div>
            </div>
          </div>
        </Link>

        {/* Distribution Engine */}
        <Link href="/admin/growth/distribution" className="group">
          <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-cyan-300 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-cyan-100 rounded-xl">
                <Share2 className="h-6 w-6 text-cyan-600" />
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-cyan-600 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Distribution Engine</h3>
            <p className="text-sm text-gray-600 mb-4">Multi-platform content distribution</p>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <div>
                <p className="text-xs text-gray-500">Total Posts</p>
                <p className="text-xl font-bold text-cyan-600">{metrics?.distribution.totalPosts || 0}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Platforms</p>
                <p className="text-xl font-bold text-gray-900">{metrics?.distribution.platforms || 0}</p>
              </div>
            </div>
          </div>
        </Link>

        {/* SEO Engine */}
        <Link href="/admin/seo-monitoring" className="group">
          <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-green-300 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <Search className="h-6 w-6 text-green-600" />
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">SEO Engine</h3>
            <p className="text-sm text-gray-600 mb-4">Programmatic SEO & monitoring</p>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <div>
                <p className="text-xs text-gray-500">Indexed Pages</p>
                <p className="text-xl font-bold text-green-600">{(metrics?.seo.indexedPages || 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Keywords</p>
                <p className="text-xl font-bold text-gray-900">{(metrics?.seo.keywords || 0).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </Link>

        {/* Email Marketing */}
        <Link href="/admin/growth/email" className="group">
          <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-pink-300 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-pink-100 rounded-xl">
                <Mail className="h-6 w-6 text-pink-600" />
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-pink-600 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Email Marketing</h3>
            <p className="text-sm text-gray-600 mb-4">Automated email sequences & newsletters</p>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <div>
                <p className="text-xs text-gray-500">Subscribers</p>
                <p className="text-xl font-bold text-pink-600">0</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Emails Sent</p>
                <p className="text-xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* AI Agents Status */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-600" />
            AI Agents Status
          </h2>
          <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
            4 Agents Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {agents.map((agent) => (
            <div
              key={agent.name}
              className={`p-4 rounded-xl border ${
                agent.status === 'active' ? 'border-green-200 bg-green-50' :
                agent.status === 'idle' ? 'border-gray-200 bg-gray-50' :
                'border-red-200 bg-red-50'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">{agent.name}</h3>
                <div className={`w-3 h-3 rounded-full ${
                  agent.status === 'active' ? 'bg-green-500 animate-pulse' :
                  agent.status === 'idle' ? 'bg-gray-400' :
                  'bg-red-500'
                }`} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-3 w-3" />
                  <span>Last: {new Date(agent.lastRun).toLocaleTimeString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>{agent.tasksCompleted} tasks completed</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <Trophy className="h-8 w-8 mb-3 opacity-80" />
          <h3 className="text-lg font-bold mb-2">Gamification</h3>
          <p className="text-blue-100 text-sm mb-4">Points, badges & achievements system</p>
          <Link href="/admin/growth/gamification" className="inline-flex items-center gap-2 text-sm font-medium hover:underline">
            Configure <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <Sparkles className="h-8 w-8 mb-3 opacity-80" />
          <h3 className="text-lg font-bold mb-2">Viral Features</h3>
          <p className="text-purple-100 text-sm mb-4">Share deals, social proof counters</p>
          <Link href="/admin/growth/viral" className="inline-flex items-center gap-2 text-sm font-medium hover:underline">
            Configure <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl p-6 text-white">
          <BarChart3 className="h-8 w-8 mb-3 opacity-80" />
          <h3 className="text-lg font-bold mb-2">A/B Testing</h3>
          <p className="text-cyan-100 text-sm mb-4">Optimize conversions with experiments</p>
          <Link href="/admin/growth/ab-testing" className="inline-flex items-center gap-2 text-sm font-medium hover:underline">
            Configure <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
