'use client'

/**
 * Content Review Queue - Fly2Any Growth OS
 * 
 * Review and moderate content before publishing.
 * Fetches real data from /api/admin/content-queue API.
 */

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  FileText, Check, X, Eye, Clock, AlertTriangle, Filter,
  Star, MessageSquare, Sparkles, RefreshCw, CheckCircle2,
  Calendar, Zap, Globe, PenTool, ChevronRight, Share2,
  XCircle, Send, ArrowRight, ThumbsUp, ThumbsDown, Trash2,
} from 'lucide-react'

// =============================================================================
// TYPES
// =============================================================================

interface QueueItem {
  id: string
  type: string
  title: string
  content: string
  platforms: string[]
  status: string
  scheduledAt: string
  postedAt?: string
  imageUrl?: string
  hashtags?: string[]
  error?: string
  createdBy?: string
  priority?: number
}

// =============================================================================
// CONFIG
// =============================================================================

const TYPE_CONFIG: Record<string, { label: string; icon: typeof FileText; color: string }> = {
  blog: { label: 'Blog Post', icon: FileText, color: 'text-blue-600 bg-blue-50' },
  deal: { label: 'Deal', icon: Zap, color: 'text-green-600 bg-green-50' },
  guide: { label: 'Guide', icon: Globe, color: 'text-purple-600 bg-purple-50' },
  social: { label: 'Social', icon: MessageSquare, color: 'text-pink-600 bg-pink-50' },
  twitter: { label: 'Twitter', icon: Share2, color: 'text-gray-700 bg-gray-100' },
  instagram: { label: 'Instagram', icon: Star, color: 'text-rose-600 bg-rose-50' },
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'text-amber-700 bg-amber-50 border-amber-200' },
  scheduled: { label: 'Scheduled', color: 'text-blue-700 bg-blue-50 border-blue-200' },
  posted: { label: 'Posted', color: 'text-green-700 bg-green-50 border-green-200' },
  failed: { label: 'Failed', color: 'text-red-700 bg-red-50 border-red-200' },
  processing: { label: 'Processing', color: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
  partial: { label: 'Partial', color: 'text-orange-700 bg-orange-50 border-orange-200' },
}

// =============================================================================
// CONTENT CARD
// =============================================================================

function ContentCard({ 
  item, 
  onApprove,
  onDelete,
  expanded,
  onToggle,
}: {
  item: QueueItem
  onApprove: (id: string) => void
  onDelete: (id: string) => void
  expanded: boolean
  onToggle: () => void
}) {
  const typeConfig = TYPE_CONFIG[item.type] || { label: item.type, icon: FileText, color: 'text-gray-600 bg-gray-50' }
  const statusConfig = STATUS_CONFIG[item.status] || { label: item.status, color: 'text-gray-600 bg-gray-50 border-gray-200' }
  const TypeIcon = typeConfig.icon

  const platformIcons: Record<string, string> = {
    twitter: '𝕏', instagram: '📸', facebook: '📘',
    tiktok: '🎵', blog: '📝', telegram: '📨',
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-all">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${typeConfig.color}`}>
            <TypeIcon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${statusConfig.color}`}>
                {statusConfig.label}
              </span>
              {item.priority && item.priority > 5 && (
                <span className="px-1.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                  High Priority
                </span>
              )}
            </div>
            <h4 className="font-bold text-gray-900 text-sm truncate">{item.title}</h4>
            <p className="text-xs text-gray-400 mt-0.5">
              {item.createdBy || 'System'} · {new Date(item.scheduledAt).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Content Preview */}
        <div
          className={`text-sm text-gray-600 cursor-pointer rounded-lg p-3 bg-gray-50 ${expanded ? '' : 'line-clamp-3'}`}
          onClick={onToggle}
        >
          {item.content}
        </div>
        {!expanded && item.content.length > 200 && (
          <button onClick={onToggle} className="text-xs text-indigo-600 font-medium mt-1 hover:underline">
            Show more...
          </button>
        )}

        {/* Platforms */}
        <div className="mt-3 flex items-center gap-3 flex-wrap">
          <div className="flex gap-1">
            {item.platforms?.map(p => (
              <span key={p} className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center text-sm" title={p}>
                {platformIcons[p] || '📱'}
              </span>
            ))}
          </div>
          {item.hashtags && item.hashtags.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {item.hashtags.slice(0, 3).map(h => (
                <span key={h} className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-xs rounded font-medium">#{h}</span>
              ))}
              {item.hashtags.length > 3 && (
                <span className="text-xs text-gray-400">+{item.hashtags.length - 3} more</span>
              )}
            </div>
          )}
        </div>

        {item.error && (
          <div className="mt-3 p-2.5 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            {item.error}
          </div>
        )}

        {/* Actions */}
        {['pending', 'scheduled'].includes(item.status) && (
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => onApprove(item.id)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-green-500 text-white rounded-xl text-sm font-semibold hover:bg-green-600 transition-all shadow-sm"
            >
              <Check className="w-4 h-4" /> Approve & Send
            </button>
            <button
              onClick={() => {
                if (confirm('Remove this item from the queue?')) onDelete(item.id)
              }}
              className="px-4 py-2.5 bg-red-50 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-100 transition-all flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" /> Remove
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function ContentReviewPage() {
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('pending')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/content-queue')
      if (res.ok) {
        const data = await res.json()
        setQueue(data.items || [])
      }
    } catch (error) {
      console.error('Error fetching review queue:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleApprove = async (id: string) => {
    // For now, this triggers the processing of the item
    // In a full implementation, this would call a dedicated API endpoint
    try {
      // Optimistic UI update
      setQueue(prev => prev.map(item => 
        item.id === id ? { ...item, status: 'processing' } : item
      ))
    } catch (e) {
      console.error('Approve failed:', e)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/content-queue?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        setQueue(prev => prev.filter(item => item.id !== id))
      }
    } catch (e) {
      console.error('Delete failed:', e)
    }
  }

  const filteredQueue = queue.filter(item => {
    if (statusFilter !== 'all' && item.status !== statusFilter) return false
    if (typeFilter !== 'all' && item.type !== typeFilter) return false
    return true
  })

  const stats = {
    pending: queue.filter(i => i.status === 'pending').length,
    scheduled: queue.filter(i => i.status === 'scheduled').length,
    posted: queue.filter(i => i.status === 'posted').length,
    failed: queue.filter(i => i.status === 'failed').length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading Review Queue...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 w-full mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-400 font-medium mb-2">
            <Link href="/admin" className="hover:text-blue-600">Admin</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/admin/growth" className="hover:text-blue-600">Growth</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-600">Content Review</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg">
              <Eye className="h-6 w-6 text-white" />
            </div>
            Content Review Queue
          </h1>
          <p className="text-sm text-gray-500 mt-1">Review and moderate content before publishing</p>
        </div>
        <button
          onClick={fetchData}
          className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all flex items-center gap-2 text-sm font-semibold"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Pending', value: stats.pending, color: 'text-amber-700 bg-amber-50 border-amber-100', icon: Clock },
          { label: 'Scheduled', value: stats.scheduled, color: 'text-blue-700 bg-blue-50 border-blue-100', icon: Calendar },
          { label: 'Posted', value: stats.posted, color: 'text-green-700 bg-green-50 border-green-100', icon: CheckCircle2 },
          { label: 'Failed', value: stats.failed, color: 'text-red-700 bg-red-50 border-red-100', icon: XCircle },
        ].map(stat => {
          const Icon = stat.icon
          return (
            <button
              key={stat.label}
              onClick={() => setStatusFilter(stat.label.toLowerCase())}
              className={`rounded-xl p-4 border text-left transition-all hover:shadow-sm ${stat.color} ${
                statusFilter === stat.label.toLowerCase() ? 'ring-2 ring-offset-1 ring-gray-400' : ''
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase">{stat.label}</span>
              </div>
              <p className="text-2xl font-black">{stat.value}</p>
            </button>
          )
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <Filter className="w-4 h-4 text-gray-400" />

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-200"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="scheduled">Scheduled</option>
            <option value="posted">Posted</option>
            <option value="failed">Failed</option>
          </select>

          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-200"
          >
            <option value="all">All Types</option>
            <option value="blog">Blog Posts</option>
            <option value="deal">Deals</option>
            <option value="guide">Guides</option>
            <option value="social">Social</option>
            <option value="twitter">Twitter</option>
          </select>

          <span className="text-xs text-gray-400 ml-auto font-medium">
            {filteredQueue.length} item{filteredQueue.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Queue List */}
      <div className="space-y-4">
        {filteredQueue.length > 0 ? (
          filteredQueue.map(item => (
            <ContentCard
              key={item.id}
              item={item}
              onApprove={handleApprove}
              onDelete={handleDelete}
              expanded={expandedId === item.id}
              onToggle={() => setExpandedId(expandedId === item.id ? null : item.id)}
            />
          ))
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 py-16 text-center">
            <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">
              {statusFilter === 'pending' ? 'All caught up!' : 'No content matching filters'}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {statusFilter === 'pending' 
                ? 'No content pending review right now'
                : 'Try adjusting your filters'}
            </p>
            <div className="flex gap-3 justify-center">
              <Link
                href="/admin/growth/content"
                className="px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 transition-all flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" /> Generate Content
              </Link>
              <Link
                href="/admin/social"
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-all flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" /> Social Media
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
