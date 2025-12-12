/**
 * Trip Planning Boards - Fly2Any Growth OS
 * Shareable trip planning boards for viral growth
 */

export interface TripDestination {
  id: string
  name: string
  country: string
  countryCode: string
  airportCode: string
  image?: string
  notes?: string
  plannedDates?: { start: string; end: string }
  estimatedBudget?: number
  flightPrice?: number
  status: 'wishlist' | 'planning' | 'booked' | 'visited'
}

export interface TripBoard {
  id: string
  userId: string
  title: string
  description?: string
  coverImage?: string
  destinations: TripDestination[]
  isPublic: boolean
  shareCode: string
  collaborators: string[]
  createdAt: Date
  updatedAt: Date
  stats: {
    views: number
    likes: number
    copies: number
    shares: number
  }
  tags: string[]
}

export interface BoardInvite {
  boardId: string
  inviteCode: string
  role: 'viewer' | 'collaborator'
  expiresAt?: Date
}

// Popular trip templates
export const TRIP_TEMPLATES: Omit<TripBoard, 'id' | 'userId' | 'shareCode' | 'createdAt' | 'updatedAt' | 'stats' | 'collaborators'>[] = [
  {
    title: 'European Adventure',
    description: 'Classic European cities in 2 weeks',
    coverImage: '/images/templates/europe.jpg',
    isPublic: true,
    tags: ['europe', 'culture', 'cities'],
    destinations: [
      { id: '1', name: 'Paris', country: 'France', countryCode: 'FR', airportCode: 'CDG', status: 'wishlist' },
      { id: '2', name: 'Barcelona', country: 'Spain', countryCode: 'ES', airportCode: 'BCN', status: 'wishlist' },
      { id: '3', name: 'Rome', country: 'Italy', countryCode: 'IT', airportCode: 'FCO', status: 'wishlist' },
      { id: '4', name: 'Amsterdam', country: 'Netherlands', countryCode: 'NL', airportCode: 'AMS', status: 'wishlist' }
    ]
  },
  {
    title: 'Southeast Asia Explorer',
    description: 'Budget-friendly SE Asia backpacking',
    coverImage: '/images/templates/asia.jpg',
    isPublic: true,
    tags: ['asia', 'backpacking', 'budget'],
    destinations: [
      { id: '1', name: 'Bangkok', country: 'Thailand', countryCode: 'TH', airportCode: 'BKK', status: 'wishlist' },
      { id: '2', name: 'Bali', country: 'Indonesia', countryCode: 'ID', airportCode: 'DPS', status: 'wishlist' },
      { id: '3', name: 'Ho Chi Minh City', country: 'Vietnam', countryCode: 'VN', airportCode: 'SGN', status: 'wishlist' },
      { id: '4', name: 'Singapore', country: 'Singapore', countryCode: 'SG', airportCode: 'SIN', status: 'wishlist' }
    ]
  },
  {
    title: 'Beach Paradise',
    description: 'Ultimate beach vacation spots',
    coverImage: '/images/templates/beach.jpg',
    isPublic: true,
    tags: ['beach', 'relaxation', 'tropical'],
    destinations: [
      { id: '1', name: 'Cancun', country: 'Mexico', countryCode: 'MX', airportCode: 'CUN', status: 'wishlist' },
      { id: '2', name: 'Maldives', country: 'Maldives', countryCode: 'MV', airportCode: 'MLE', status: 'wishlist' },
      { id: '3', name: 'Phuket', country: 'Thailand', countryCode: 'TH', airportCode: 'HKT', status: 'wishlist' }
    ]
  }
]

export class TripBoardService {
  private baseUrl = 'https://fly2any.com'

  /**
   * Generate unique share code
   */
  generateShareCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
    let code = ''
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }

  /**
   * Create new trip board
   */
  async createBoard(data: {
    userId: string
    title: string
    description?: string
    isPublic?: boolean
    templateId?: string
  }): Promise<TripBoard> {
    const template = data.templateId
      ? TRIP_TEMPLATES.find((_, i) => i.toString() === data.templateId)
      : null

    const board: TripBoard = {
      id: `board_${Date.now()}`,
      userId: data.userId,
      title: data.title,
      description: data.description || template?.description,
      coverImage: template?.coverImage,
      destinations: template?.destinations || [],
      isPublic: data.isPublic ?? false,
      shareCode: this.generateShareCode(),
      collaborators: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      stats: { views: 0, likes: 0, copies: 0, shares: 0 },
      tags: template?.tags || []
    }

    // In production: Save to database
    console.log('[TripBoards] Created board:', board.id)
    return board
  }

  /**
   * Add destination to board
   */
  async addDestination(boardId: string, destination: Omit<TripDestination, 'id'>): Promise<TripDestination> {
    const newDest: TripDestination = {
      ...destination,
      id: `dest_${Date.now()}`
    }

    console.log('[TripBoards] Added destination to', boardId, ':', newDest.name)
    return newDest
  }

  /**
   * Update destination status
   */
  async updateDestinationStatus(
    boardId: string,
    destinationId: string,
    status: TripDestination['status']
  ): Promise<void> {
    console.log('[TripBoards] Updated', destinationId, 'status to', status)
  }

  /**
   * Generate share URL
   */
  getShareUrl(board: TripBoard): string {
    return `${this.baseUrl}/trips/${board.shareCode}`
  }

  /**
   * Generate share links for social platforms
   */
  getShareLinks(board: TripBoard): Record<string, string> {
    const url = encodeURIComponent(this.getShareUrl(board))
    const title = encodeURIComponent(`Check out my trip plan: ${board.title}`)
    const desc = encodeURIComponent(
      board.description || `Planning ${board.destinations.length} amazing destinations!`
    )

    return {
      twitter: `https://twitter.com/intent/tweet?text=${title}&url=${url}&hashtags=travel,fly2any`,
      facebook: `https://facebook.com/sharer/sharer.php?u=${url}&quote=${title}`,
      whatsapp: `https://wa.me/?text=${title}%20${url}`,
      telegram: `https://t.me/share/url?url=${url}&text=${title}`,
      pinterest: `https://pinterest.com/pin/create/button/?url=${url}&description=${desc}`,
      email: `mailto:?subject=${title}&body=${desc}%0A%0A${url}`,
      copy: this.getShareUrl(board)
    }
  }

  /**
   * Create invite link
   */
  async createInviteLink(boardId: string, role: 'viewer' | 'collaborator'): Promise<BoardInvite> {
    const invite: BoardInvite = {
      boardId,
      inviteCode: this.generateShareCode(),
      role,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    }

    console.log('[TripBoards] Created invite:', invite.inviteCode)
    return invite
  }

  /**
   * Track board analytics
   */
  async trackView(boardId: string, viewerId?: string): Promise<void> {
    console.log('[TripBoards] View tracked for', boardId)
  }

  async trackShare(boardId: string, platform: string): Promise<void> {
    console.log('[TripBoards] Share tracked:', boardId, platform)
  }

  async trackCopy(boardId: string, userId: string): Promise<void> {
    console.log('[TripBoards] Board copied:', boardId, 'by', userId)
  }

  /**
   * Calculate total trip budget
   */
  calculateBudget(destinations: TripDestination[]): {
    flights: number
    estimated: number
    total: number
  } {
    const flights = destinations.reduce((sum, d) => sum + (d.flightPrice || 0), 0)
    const estimated = destinations.reduce((sum, d) => sum + (d.estimatedBudget || 0), 0)
    return { flights, estimated, total: flights + estimated }
  }

  /**
   * Generate OG image data for board
   */
  getOgImageData(board: TripBoard): {
    title: string
    destinations: string[]
    destinationCount: number
    coverImage?: string
  } {
    return {
      title: board.title,
      destinations: board.destinations.slice(0, 4).map(d => d.name),
      destinationCount: board.destinations.length,
      coverImage: board.coverImage
    }
  }
}

export const tripBoardService = new TripBoardService()
