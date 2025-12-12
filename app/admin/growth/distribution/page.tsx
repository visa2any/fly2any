'use client'

import { useState, useEffect } from 'react'
import { Share2, Twitter, Instagram, Linkedin, MessageCircle, Globe, Rss, RefreshCw, Zap, CheckCircle2, Clock, AlertTriangle, TrendingUp, Users, Eye, Heart, Settings, Play, Pause, Calendar } from 'lucide-react'

interface Platform {
  id: string
  name: string
  icon: string
  status: 'connected' | 'disconnected' | 'error'
  postsToday: number
  totalPosts: number
  reach: number
  engagement: number
  lastPost?: string
}

interface ScheduledPost {
  id: string
  content: string
  platforms: string[]
  scheduledAt: string
  status: 'pending' | 'posted' | 'failed'
}

interface DistributionStats {
  totalPosts: number
  totalReach: number
  avgEngagement: number
  platformsConnected: number
  postsToday: number
  postsThisWeek: number
}

export default function DistributionEngineAdmin() {
  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [scheduled, setScheduled] = useState<ScheduledPost[]>([])
  const [stats, setStats] = useState<DistributionStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    setLoading(true)
    // Mock data - replace with actual API
    setPlatforms([
      { id: '1', name: 'Twitter/X', icon: 'twitter', status: 'connected', postsToday: 5, totalPosts: 234, reach: 45000, engagement: 4.2, lastPost: new Date().toISOString() },
      { id: '2', name: 'Instagram', icon: 'instagram', status: 'disconnected', postsToday: 0, totalPosts: 89, reach: 23000, engagement: 6.8, lastPost: new Date(Date.now() - 86400000).toISOString() },
      { id: '3', name: 'LinkedIn', icon: 'linkedin', status: 'connected', postsToday: 2, totalPosts: 67, reach: 12000, engagement: 3.1, lastPost: new Date().toISOString() },
      { id: '4', name: 'Telegram', icon: 'telegram', status: 'connected', postsToday: 8, totalPosts: 456, reach: 8900, engagement: 12.5, lastPost: new Date().toISOString() },
      { id: '5', name: 'Reddit', icon: 'reddit', status: 'connected', postsToday: 1, totalPosts: 45, reach: 67000, engagement: 2.3, lastPost: new Date().toISOString() },
      { id: '6', name: 'Blog/RSS', icon: 'rss', status: 'connected', postsToday: 3, totalPosts: 123, reach: 15000, engagement: 8.9, lastPost: new Date().toISOString() }
    ])
    setScheduled([
      { id: '1', content: 'Flash Sale: NYC to London from $299! Limited seats...', platforms: ['twitter', 'telegram'], scheduledAt: new Date(Date.now() + 3600000).toISOString(), status: 'pending' },
      { id: '2', content: 'Discover the hidden gems of Bali...', platforms: ['instagram', 'linkedin'], scheduledAt: new Date(Date.now() + 7200000).toISOString(), status: 'pending' }
    ])
    setStats({ totalPosts: 1014, totalReach: 170900, avgEngagement: 6.3, platformsConnected: 5, postsToday: 19, postsThisWeek: 127 })
    setLoading(false)
  }

  const triggerDistribution = async () => {
    await fetch('/api/cron/distribute', { method: 'POST' })
    fetchData()
  }

  const platformIcons: Record<string, typeof Twitter> = {
    twitter: Twitter, instagram: Instagram, linkedin: Linkedin,
    telegram: MessageCircle, reddit: Globe, rss: Rss
  }

  const statusColors = {
    connected: 'bg-green-100 text-green-700 border-green-200',
    disconnected: 'bg-gray-100 text-gray-600 border-gray-200',
    error: 'bg-red-100 text-red-700 border-red-200'
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600" />
    </div>
  )

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl shadow-lg">
              <Share2 className="h-7 w-7 text-white" />
            </div>
            Distribution Engine
          </h1>
          <p className="text-gray-500 mt-1">Multi-platform content distribution & scheduling</p>
        </div>
        <div className="flex gap-3">
          <button onClick={triggerDistribution} className="px-4 py-2.5 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition-all flex items-center gap-2 font-medium shadow-sm">
            <Zap className="h-4 w-4" /> Distribute Now
          </button>
          <button onClick={fetchData} className="p-2.5 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all">
            <RefreshCw className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Stats Banner */}
      {stats && (
        <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 rounded-2xl p-6 text-white">
          <div className="grid grid-cols-3 md:grid-cols-6 gap-6">
            {[
              { label: 'Total Posts', value: stats.totalPosts.toLocaleString() },
              { label: 'Total Reach', value: `${(stats.totalReach / 1000).toFixed(0)}K` },
              { label: 'Avg Engagement', value: `${stats.avgEngagement}%` },
              { label: 'Platforms', value: stats.platformsConnected },
              { label: 'Today', value: stats.postsToday },
              { label: 'This Week', value: stats.postsThisWeek }
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <p className="text-cyan-100 text-xs mb-1">{label}</p>
                <p className="text-2xl font-bold">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Platforms Grid */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Globe className="h-5 w-5 text-cyan-600" /> Connected Platforms
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {platforms.map(platform => {
            const Icon = platformIcons[platform.icon] || Globe
            return (
              <div key={platform.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gray-100 rounded-xl">
                      <Icon className="h-6 w-6 text-gray-700" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{platform.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColors[platform.status]}`}>
                        {platform.status}
                      </span>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Settings className="h-4 w-4 text-gray-500" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500 flex items-center gap-1"><Eye className="h-3 w-3" /> Reach</p>
                    <p className="text-lg font-bold text-gray-900">{(platform.reach / 1000).toFixed(1)}K</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 flex items-center gap-1"><Heart className="h-3 w-3" /> Engagement</p>
                    <p className="text-lg font-bold text-cyan-600">{platform.engagement}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Today</p>
                    <p className="text-lg font-bold text-gray-900">{platform.postsToday} posts</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Total</p>
                    <p className="text-lg font-bold text-gray-900">{platform.totalPosts} posts</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Scheduled Posts */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-600" /> Scheduled Posts
        </h2>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {scheduled.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No scheduled posts</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {scheduled.map(post => (
                <div key={post.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center gap-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 font-medium line-clamp-1">{post.content}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">{new Date(post.scheduledAt).toLocaleString()}</span>
                      <span className="text-gray-300">•</span>
                      <div className="flex gap-1">
                        {post.platforms.map(p => {
                          const PIcon = platformIcons[p] || Globe
                          return <PIcon key={p} className="h-3 w-3 text-gray-400" />
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-gray-100 rounded-lg"><Play className="h-4 w-4 text-green-600" /></button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg"><Pause className="h-4 w-4 text-gray-600" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Optimal Posting Times */}
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" /> Optimal Posting Times
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
            <div key={day} className="bg-white rounded-lg p-3 border border-gray-200">
              <p className="text-xs font-medium text-gray-600 mb-2">{day}</p>
              <div className="space-y-1">
                {['9AM', '12PM', '6PM'].map(time => (
                  <div key={time} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded font-medium">{time}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
