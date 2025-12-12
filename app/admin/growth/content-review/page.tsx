'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText, Check, X, Eye, Clock, AlertTriangle, Filter,
  ChevronDown, Star, MessageSquare, Image as ImageIcon,
  ThumbsUp, ThumbsDown, RotateCcw, Sparkles
} from 'lucide-react'

type ContentType = 'review' | 'blog' | 'deal' | 'destination'
type ContentStatus = 'pending' | 'approved' | 'rejected' | 'flagged'

interface QueueItem {
  id: string
  type: ContentType
  title: string
  content: string
  author: string
  authorId: string
  status: ContentStatus
  createdAt: Date
  rating?: number // for reviews
  aiScore?: number // AI quality score 0-100
  flags?: string[]
  metadata?: Record<string, any>
}

// Mock data
const MOCK_QUEUE: QueueItem[] = [
  {
    id: '1',
    type: 'review',
    title: 'Amazing experience with Fly2Any!',
    content: 'Found an incredible deal to Paris. The booking process was seamless and customer support was very helpful when I had questions about my itinerary.',
    author: 'Sarah M.',
    authorId: 'user_123',
    status: 'pending',
    createdAt: new Date(Date.now() - 3600000),
    rating: 5,
    aiScore: 92
  },
  {
    id: '2',
    type: 'review',
    title: 'Good but could be better',
    content: 'The search was okay but I wish there were more filter options. Prices were competitive though.',
    author: 'John D.',
    authorId: 'user_456',
    status: 'pending',
    createdAt: new Date(Date.now() - 7200000),
    rating: 3,
    aiScore: 78
  },
  {
    id: '3',
    type: 'blog',
    title: 'Top 10 Budget Airlines in Europe',
    content: 'Discover the best budget airlines for your European adventure...',
    author: 'Content AI',
    authorId: 'ai_agent',
    status: 'pending',
    createdAt: new Date(Date.now() - 14400000),
    aiScore: 85
  },
  {
    id: '4',
    type: 'deal',
    title: 'NYC to London from $299',
    content: 'Limited time offer on British Airways flights...',
    author: 'Deal Bot',
    authorId: 'deal_agent',
    status: 'pending',
    createdAt: new Date(Date.now() - 1800000),
    aiScore: 95
  },
  {
    id: '5',
    type: 'review',
    title: 'Spam content test',
    content: 'Buy cheap watches at www.spam-site.com!!! Click here!!!',
    author: 'Unknown',
    authorId: 'user_spam',
    status: 'flagged',
    createdAt: new Date(Date.now() - 900000),
    rating: 5,
    aiScore: 12,
    flags: ['spam', 'external_links']
  }
]

const TYPE_CONFIG: Record<ContentType, { label: string; icon: any; color: string }> = {
  review: { label: 'Review', icon: Star, color: 'text-yellow-500 bg-yellow-50' },
  blog: { label: 'Blog Post', icon: FileText, color: 'text-blue-500 bg-blue-50' },
  deal: { label: 'Deal', icon: Sparkles, color: 'text-green-500 bg-green-50' },
  destination: { label: 'Destination', icon: ImageIcon, color: 'text-purple-500 bg-purple-50' }
}

const STATUS_CONFIG: Record<ContentStatus, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'text-amber-600 bg-amber-50 border-amber-200' },
  approved: { label: 'Approved', color: 'text-green-600 bg-green-50 border-green-200' },
  rejected: { label: 'Rejected', color: 'text-red-600 bg-red-50 border-red-200' },
  flagged: { label: 'Flagged', color: 'text-orange-600 bg-orange-50 border-orange-200' }
}

function QualityBadge({ score }: { score: number }) {
  const getColor = () => {
    if (score >= 80) return 'text-green-600 bg-green-50'
    if (score >= 60) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getColor()}`}>
      AI: {score}%
    </span>
  )
}

function ContentCard({ item, onAction }: {
  item: QueueItem
  onAction: (id: string, action: 'approve' | 'reject' | 'flag' | 'review') => void
}) {
  const [expanded, setExpanded] = useState(false)
  const typeConfig = TYPE_CONFIG[item.type]
  const statusConfig = STATUS_CONFIG[item.status]
  const TypeIcon = typeConfig.icon

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="w-full bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden"
    >
      <div className="p-4 md:p-5">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${typeConfig.color}`}>
            <TypeIcon className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${statusConfig.color}`}>
                {statusConfig.label}
              </span>
              {item.aiScore !== undefined && <QualityBadge score={item.aiScore} />}
              {item.rating && (
                <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  {item.rating}/5
                </span>
              )}
            </div>
            <h4 className="font-semibold text-gray-900 truncate">{item.title}</h4>
            <p className="text-sm text-gray-500">
              by {item.author} • {new Date(item.createdAt).toLocaleTimeString()}
            </p>
          </div>
        </div>

        {/* Content Preview */}
        <div
          className={`text-sm text-gray-600 ${expanded ? '' : 'line-clamp-2'} cursor-pointer`}
          onClick={() => setExpanded(!expanded)}
        >
          {item.content}
        </div>

        {/* Flags */}
        {item.flags && item.flags.length > 0 && (
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            {item.flags.map(flag => (
              <span key={flag} className="px-2 py-0.5 bg-orange-50 text-orange-700 text-xs rounded-full">
                {flag}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 flex gap-2 flex-wrap">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onAction(item.id, 'approve')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-500 text-white rounded-xl text-sm font-medium hover:bg-green-600 shadow-sm"
          >
            <Check className="w-4 h-4" /> Approve
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onAction(item.id, 'reject')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 shadow-sm"
          >
            <X className="w-4 h-4" /> Reject
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onAction(item.id, 'flag')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-100 text-orange-700 rounded-xl text-sm font-medium hover:bg-orange-200"
          >
            <AlertTriangle className="w-4 h-4" /> Flag
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onAction(item.id, 'review')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200"
          >
            <Eye className="w-4 h-4" /> Full Review
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

export default function ContentReviewPage() {
  const [queue, setQueue] = useState<QueueItem[]>(MOCK_QUEUE)
  const [filter, setFilter] = useState<ContentStatus | 'all'>('pending')
  const [typeFilter, setTypeFilter] = useState<ContentType | 'all'>('all')

  const filteredQueue = queue.filter(item => {
    if (filter !== 'all' && item.status !== filter) return false
    if (typeFilter !== 'all' && item.type !== typeFilter) return false
    return true
  })

  const handleAction = (id: string, action: 'approve' | 'reject' | 'flag' | 'review') => {
    if (action === 'review') {
      // Open full review modal
      return
    }

    const statusMap: Record<string, ContentStatus> = {
      approve: 'approved',
      reject: 'rejected',
      flag: 'flagged'
    }

    setQueue(queue.map(item =>
      item.id === id ? { ...item, status: statusMap[action] } : item
    ))
  }

  const stats = {
    pending: queue.filter(i => i.status === 'pending').length,
    flagged: queue.filter(i => i.status === 'flagged').length,
    approved: queue.filter(i => i.status === 'approved').length,
    rejected: queue.filter(i => i.status === 'rejected').length
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Content Review Queue</h1>
            <p className="text-gray-500">Moderate user-generated and AI content</p>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600"
            >
              <RotateCcw className="w-4 h-4" /> Refresh
            </motion.button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Pending', value: stats.pending, color: 'text-amber-600 bg-amber-50' },
            { label: 'Flagged', value: stats.flagged, color: 'text-orange-600 bg-orange-50' },
            { label: 'Approved', value: stats.approved, color: 'text-green-600 bg-green-50' },
            { label: 'Rejected', value: stats.rejected, color: 'text-red-600 bg-red-50' }
          ].map(stat => (
            <div key={stat.label} className={`rounded-xl p-4 ${stat.color}`}>
              <p className="text-3xl font-bold">{stat.value}</p>
              <p className="text-sm opacity-80">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <Filter className="w-5 h-5 text-gray-400" />

            {/* Status Filter */}
            <select
              value={filter}
              onChange={e => setFilter(e.target.value as any)}
              className="px-4 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="flagged">Flagged</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value as any)}
              className="px-4 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium"
            >
              <option value="all">All Types</option>
              <option value="review">Reviews</option>
              <option value="blog">Blog Posts</option>
              <option value="deal">Deals</option>
              <option value="destination">Destinations</option>
            </select>

            <span className="text-sm text-gray-500 ml-auto">
              Showing {filteredQueue.length} items
            </span>
          </div>
        </div>

        {/* Queue List */}
        <div className="space-y-4">
          <AnimatePresence>
            {filteredQueue.length > 0 ? (
              filteredQueue.map(item => (
                <ContentCard
                  key={item.id}
                  item={item}
                  onAction={handleAction}
                />
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-2xl p-12 text-center"
              >
                <Check className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">All caught up!</h3>
                <p className="text-gray-500">No content matching your filters</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
