'use client'

import { useState, useEffect } from 'react'
import { FileText, Sparkles, Eye, ThumbsUp, Clock, Play, Pause, Trash2, RefreshCw, Filter, Calendar, Globe, Twitter, Instagram, MessageCircle, TrendingUp, Zap, CheckCircle2, AlertCircle, Edit3 } from 'lucide-react'

interface ContentItem {
  id: string
  type: 'blog' | 'deal' | 'guide' | 'social'
  title: string
  excerpt: string
  status: 'draft' | 'published' | 'scheduled' | 'failed'
  platform: string[]
  views: number
  engagement: number
  createdAt: string
  publishedAt?: string
  scheduledAt?: string
}

interface ContentStats {
  total: number
  published: number
  scheduled: number
  drafts: number
  totalViews: number
  avgEngagement: number
}

export default function ContentFactoryAdmin() {
  const [content, setContent] = useState<ContentItem[]>([])
  const [stats, setStats] = useState<ContentStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'blog' | 'deal' | 'guide' | 'social'>('all')
  const [generating, setGenerating] = useState(false)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/content')
      if (res.ok) {
        const data = await res.json()
        setContent(data.content || [])
        setStats(data.stats || null)
      }
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const generateContent = async (type: string) => {
    setGenerating(true)
    try {
      await fetch('/api/admin/content/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      })
      await fetchData()
    } catch (e) { console.error(e) }
    setGenerating(false)
  }

  const filteredContent = content.filter(c => filter === 'all' || c.type === filter)

  const statusColors = {
    draft: 'bg-gray-100 text-gray-700',
    published: 'bg-green-100 text-green-700',
    scheduled: 'bg-blue-100 text-blue-700',
    failed: 'bg-red-100 text-red-700'
  }

  const typeIcons = {
    blog: FileText,
    deal: Zap,
    guide: Globe,
    social: MessageCircle
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
    </div>
  )

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
              <Sparkles className="h-7 w-7 text-white" />
            </div>
            AI Content Factory
          </h1>
          <p className="text-gray-500 mt-1">Generate and manage AI-powered content</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <button
              onClick={() => generateContent('auto')}
              disabled={generating}
              className="px-4 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all flex items-center gap-2 font-medium shadow-sm disabled:opacity-50"
            >
              <Sparkles className={`h-4 w-4 ${generating ? 'animate-spin' : ''}`} />
              {generating ? 'Generating...' : 'Generate Content'}
            </button>
          </div>
          <button onClick={fetchData} className="p-2.5 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all">
            <RefreshCw className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: 'Total Content', value: stats.total, icon: FileText, gradient: 'from-purple-500 to-pink-500' },
            { label: 'Published', value: stats.published, icon: CheckCircle2, gradient: 'from-green-500 to-emerald-500' },
            { label: 'Scheduled', value: stats.scheduled, icon: Calendar, gradient: 'from-blue-500 to-cyan-500' },
            { label: 'Drafts', value: stats.drafts, icon: Edit3, gradient: 'from-gray-500 to-gray-600' },
            { label: 'Total Views', value: stats.totalViews.toLocaleString(), icon: Eye, gradient: 'from-orange-500 to-red-500' },
            { label: 'Avg Engagement', value: `${stats.avgEngagement}%`, icon: TrendingUp, gradient: 'from-cyan-500 to-blue-500' }
          ].map(({ label, value, icon: Icon, gradient }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all">
              <div className={`w-10 h-10 bg-gradient-to-br ${gradient} rounded-lg flex items-center justify-center mb-3`}>
                <Icon className="h-5 w-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Quick Generate Buttons */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Quick Generate</h3>
        <div className="flex flex-wrap gap-3">
          {[
            { type: 'deal', label: 'Deal Post', icon: Zap },
            { type: 'guide', label: 'Destination Guide', icon: Globe },
            { type: 'blog', label: 'Blog Article', icon: FileText },
            { type: 'twitter', label: 'Twitter Thread', icon: Twitter },
            { type: 'instagram', label: 'Instagram Post', icon: Instagram }
          ].map(({ type, label, icon: Icon }) => (
            <button
              key={type}
              onClick={() => generateContent(type)}
              disabled={generating}
              className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:border-purple-300 hover:shadow-sm transition-all flex items-center gap-2 text-sm font-medium disabled:opacity-50"
            >
              <Icon className="h-4 w-4 text-purple-600" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(['all', 'blog', 'deal', 'guide', 'social'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${filter === f ? 'bg-purple-600 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:border-purple-300'}`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredContent.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            No content found. Generate some content to get started!
          </div>
        ) : filteredContent.map(item => {
          const TypeIcon = typeIcons[item.type] || FileText
          return (
            <div key={item.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all group">
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <TypeIcon className="h-4 w-4 text-purple-600" />
                    </div>
                    <span className="text-xs font-medium text-gray-500 uppercase">{item.type}</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[item.status]}`}>
                    {item.status}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{item.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-2 mb-4">{item.excerpt}</p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><Eye className="h-4 w-4" /> {item.views}</span>
                    <span className="flex items-center gap-1"><ThumbsUp className="h-4 w-4" /> {item.engagement}%</span>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 hover:bg-gray-100 rounded-lg"><Edit3 className="h-4 w-4 text-gray-600" /></button>
                    <button className="p-1.5 hover:bg-red-50 rounded-lg"><Trash2 className="h-4 w-4 text-red-500" /></button>
                  </div>
                </div>
              </div>
              {item.platform.length > 0 && (
                <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center gap-2">
                  <span className="text-xs text-gray-500">Platforms:</span>
                  {item.platform.map(p => (
                    <span key={p} className="px-2 py-0.5 bg-white rounded text-xs font-medium text-gray-700 border border-gray-200">{p}</span>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
