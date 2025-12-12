'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from 'next-auth/react'
import {
  Plus, Map, Globe, Calendar, Users, Share2, Heart, Eye, Copy,
  Plane, ChevronRight, Sparkles, MapPin, X, Check, Link2,
  Twitter, Facebook, Send, MessageCircle, Mail, Trash2, Edit3
} from 'lucide-react'
import {
  TripBoard, TripDestination, TRIP_TEMPLATES, tripBoardService
} from '@/lib/growth/trip-boards'

const STATUS_COLORS: Record<TripDestination['status'], { bg: string; text: string; dot: string }> = {
  wishlist: { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-400' },
  planning: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400' },
  booked: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-400' },
  visited: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-400' }
}

const COUNTRY_FLAGS: Record<string, string> = {
  FR: '🇫🇷', ES: '🇪🇸', IT: '🇮🇹', NL: '🇳🇱', TH: '🇹🇭', ID: '🇮🇩',
  VN: '🇻🇳', SG: '🇸🇬', MX: '🇲🇽', MV: '🇲🇻', US: '🇺🇸', GB: '🇬🇧',
  JP: '🇯🇵', DE: '🇩🇪', PT: '🇵🇹', GR: '🇬🇷', AU: '🇦🇺', BR: '🇧🇷'
}

function DestinationCard({ destination, onStatusChange, onDelete }: {
  destination: TripDestination
  onStatusChange: (id: string, status: TripDestination['status']) => void
  onDelete: (id: string) => void
}) {
  const colors = STATUS_COLORS[destination.status]
  const [showMenu, setShowMenu] = useState(false)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="group relative bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all"
    >
      {/* Cover Image */}
      <div className="relative h-32 bg-gradient-to-br from-primary-500 to-primary-600 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-20">
          {COUNTRY_FLAGS[destination.countryCode] || '🌍'}
        </div>
        <div className="absolute top-3 left-3">
          <span className={`
            inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
            ${colors.bg} ${colors.text} backdrop-blur-sm
          `}>
            <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
            {destination.status.charAt(0).toUpperCase() + destination.status.slice(1)}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="w-8 h-8 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <Edit3 className="w-4 h-4 text-white" />
          </button>
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-10"
            >
              {(['wishlist', 'planning', 'booked', 'visited'] as const).map(status => (
                <button
                  key={status}
                  onClick={() => { onStatusChange(destination.id, status); setShowMenu(false) }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 ${
                    destination.status === status ? 'text-primary-600 font-medium' : 'text-gray-700'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${STATUS_COLORS[status].dot}`} />
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                  {destination.status === status && <Check className="w-4 h-4 ml-auto" />}
                </button>
              ))}
              <div className="border-t border-gray-100 mt-2 pt-2">
                <button
                  onClick={() => { onDelete(destination.id); setShowMenu(false) }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" /> Remove
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h4 className="font-semibold text-gray-900">{destination.name}</h4>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <span>{COUNTRY_FLAGS[destination.countryCode] || '🌍'}</span>
              {destination.country}
            </p>
          </div>
          <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-600">
            {destination.airportCode}
          </span>
        </div>

        {destination.plannedDates && (
          <div className="flex items-center gap-2 text-sm text-gray-500 mt-3">
            <Calendar className="w-4 h-4" />
            <span>{destination.plannedDates.start} - {destination.plannedDates.end}</span>
          </div>
        )}

        {destination.estimatedBudget && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Budget</span>
              <span className="font-semibold text-gray-900">${destination.estimatedBudget}</span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

function ShareModal({ board, onClose }: { board: TripBoard; onClose: () => void }) {
  const [copied, setCopied] = useState(false)
  const shareLinks = tripBoardService.getShareLinks(board)
  const shareUrl = tripBoardService.getShareUrl(board)

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const socials = [
    { name: 'Twitter', icon: Twitter, url: shareLinks.twitter, color: 'bg-sky-500' },
    { name: 'Facebook', icon: Facebook, url: shareLinks.facebook, color: 'bg-blue-600' },
    { name: 'WhatsApp', icon: MessageCircle, url: shareLinks.whatsapp, color: 'bg-green-500' },
    { name: 'Telegram', icon: Send, url: shareLinks.telegram, color: 'bg-sky-400' },
    { name: 'Email', icon: Mail, url: shareLinks.email, color: 'bg-gray-600' }
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Share Trip Board</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Share URL */}
        <div className="mb-6">
          <label className="text-sm font-medium text-gray-700 mb-2 block">Share Link</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
            />
            <button
              onClick={handleCopy}
              className={`px-4 py-2.5 rounded-xl font-medium transition-all ${
                copied
                  ? 'bg-green-500 text-white'
                  : 'bg-primary-500 text-white hover:bg-primary-600'
              }`}
            >
              {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Social Share */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-3 block">Share on Social</label>
          <div className="grid grid-cols-5 gap-3">
            {socials.map(social => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`
                  ${social.color} text-white p-3 rounded-xl
                  flex items-center justify-center hover:opacity-90 transition-opacity
                `}
              >
                <social.icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>

        {/* Board Stats */}
        <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-900">{board.stats.views}</p>
            <p className="text-xs text-gray-500">Views</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{board.stats.likes}</p>
            <p className="text-xs text-gray-500">Likes</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{board.stats.copies}</p>
            <p className="text-xs text-gray-500">Copies</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

function CreateBoardModal({ onClose, onCreate }: {
  onClose: () => void
  onCreate: (data: { title: string; templateId?: string }) => void
}) {
  const [title, setTitle] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Create Trip Board</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Board Name */}
        <div className="mb-6">
          <label className="text-sm font-medium text-gray-700 mb-2 block">Board Name</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="My Dream Trip 2025"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Templates */}
        <div className="mb-6">
          <label className="text-sm font-medium text-gray-700 mb-3 block">
            Start with a Template (Optional)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {TRIP_TEMPLATES.map((template, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedTemplate(selectedTemplate === idx.toString() ? null : idx.toString())}
                className={`
                  p-4 rounded-xl border-2 text-left transition-all
                  ${selectedTemplate === idx.toString()
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-100 hover:border-gray-200'
                  }
                `}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="w-5 h-5 text-primary-500" />
                  <h4 className="font-semibold text-gray-900">{template.title}</h4>
                </div>
                <p className="text-sm text-gray-500 mb-2">{template.description}</p>
                <p className="text-xs text-gray-400">
                  {template.destinations.length} destinations
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Create Button */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onCreate({ title, templateId: selectedTemplate || undefined })}
            disabled={!title.trim()}
            className="flex-1 px-6 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            Create Board
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function TripBoardsPage() {
  const { data: session } = useSession()
  const [boards, setBoards] = useState<TripBoard[]>([])
  const [selectedBoard, setSelectedBoard] = useState<TripBoard | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)

  // Initialize with sample data
  useEffect(() => {
    const sampleBoard: TripBoard = {
      id: 'board_1',
      userId: session?.user?.id || 'guest',
      title: 'Summer Europe 2025',
      description: 'My dream European adventure',
      isPublic: true,
      shareCode: 'abc123xy',
      collaborators: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      stats: { views: 47, likes: 12, copies: 3, shares: 8 },
      tags: ['europe', 'summer'],
      destinations: [
        { id: '1', name: 'Paris', country: 'France', countryCode: 'FR', airportCode: 'CDG', status: 'booked', estimatedBudget: 1500 },
        { id: '2', name: 'Barcelona', country: 'Spain', countryCode: 'ES', airportCode: 'BCN', status: 'planning', estimatedBudget: 1200 },
        { id: '3', name: 'Rome', country: 'Italy', countryCode: 'IT', airportCode: 'FCO', status: 'wishlist', estimatedBudget: 1300 }
      ]
    }
    setBoards([sampleBoard])
    setSelectedBoard(sampleBoard)
  }, [session])

  const handleCreateBoard = async (data: { title: string; templateId?: string }) => {
    const newBoard = await tripBoardService.createBoard({
      userId: session?.user?.id || 'guest',
      title: data.title,
      templateId: data.templateId
    })
    setBoards([newBoard, ...boards])
    setSelectedBoard(newBoard)
    setShowCreateModal(false)
  }

  const handleStatusChange = (destId: string, status: TripDestination['status']) => {
    if (!selectedBoard) return
    const updatedDests = selectedBoard.destinations.map(d =>
      d.id === destId ? { ...d, status } : d
    )
    const updatedBoard = { ...selectedBoard, destinations: updatedDests }
    setSelectedBoard(updatedBoard)
    setBoards(boards.map(b => b.id === updatedBoard.id ? updatedBoard : b))
  }

  const handleDeleteDestination = (destId: string) => {
    if (!selectedBoard) return
    const updatedDests = selectedBoard.destinations.filter(d => d.id !== destId)
    const updatedBoard = { ...selectedBoard, destinations: updatedDests }
    setSelectedBoard(updatedBoard)
    setBoards(boards.map(b => b.id === updatedBoard.id ? updatedBoard : b))
  }

  const budget = selectedBoard ? tripBoardService.calculateBudget(selectedBoard.destinations) : { flights: 0, estimated: 0, total: 0 }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                <Map className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Trip Boards</h1>
                <p className="text-sm text-gray-500">Plan and share your dream trips</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              New Board
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Board List Sidebar */}
          <div className="col-span-12 md:col-span-3">
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Your Boards ({boards.length})
              </h3>
              <div className="space-y-2">
                {boards.map(board => (
                  <button
                    key={board.id}
                    onClick={() => setSelectedBoard(board)}
                    className={`
                      w-full p-3 rounded-xl text-left transition-all
                      ${selectedBoard?.id === board.id
                        ? 'bg-primary-50 border-2 border-primary-200'
                        : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                      }
                    `}
                  >
                    <h4 className="font-medium text-gray-900 truncate">{board.title}</h4>
                    <p className="text-sm text-gray-500">
                      {board.destinations.length} destinations
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Board View */}
          <div className="col-span-12 md:col-span-9">
            {selectedBoard ? (
              <div className="space-y-6">
                {/* Board Header */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedBoard.title}</h2>
                      {selectedBoard.description && (
                        <p className="text-gray-500 mt-1">{selectedBoard.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowShareModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-600 rounded-xl font-medium hover:bg-primary-100 transition-colors"
                      >
                        <Share2 className="w-4 h-4" />
                        Share
                      </button>
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-4 gap-4">
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <p className="text-2xl font-bold text-gray-900">{selectedBoard.destinations.length}</p>
                      <p className="text-xs text-gray-500">Destinations</p>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-3 text-center">
                      <p className="text-2xl font-bold text-blue-600">{selectedBoard.destinations.filter(d => d.status === 'booked').length}</p>
                      <p className="text-xs text-gray-500">Booked</p>
                    </div>
                    <div className="bg-green-50 rounded-xl p-3 text-center">
                      <p className="text-2xl font-bold text-green-600">${budget.total.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">Est. Budget</p>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-3 text-center">
                      <p className="text-2xl font-bold text-purple-600">{selectedBoard.stats.views}</p>
                      <p className="text-xs text-gray-500">Views</p>
                    </div>
                  </div>
                </div>

                {/* Destinations Grid */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Destinations</h3>
                    <button className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                      <Plus className="w-4 h-4" />
                      Add Destination
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <AnimatePresence>
                      {selectedBoard.destinations.map(destination => (
                        <DestinationCard
                          key={destination.id}
                          destination={destination}
                          onStatusChange={handleStatusChange}
                          onDelete={handleDeleteDestination}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Map className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Board Selected</h3>
                <p className="text-gray-500 mb-4">Select a board or create a new one to get started</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600"
                >
                  <Plus className="w-5 h-5" />
                  Create Your First Board
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateBoardModal
            onClose={() => setShowCreateModal(false)}
            onCreate={handleCreateBoard}
          />
        )}
        {showShareModal && selectedBoard && (
          <ShareModal
            board={selectedBoard}
            onClose={() => setShowShareModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
