/**
 * Event Tracking Service
 * Captures and sends analytics events to the backend
 */

export interface AnalyticsEvent {
  eventType: string
  eventData?: Record<string, any>
  timestamp?: number
}

export interface PageViewEvent extends AnalyticsEvent {
  eventType: 'page_view'
  eventData: {
    url: string
    title: string
    referrer?: string
  }
}

export interface SearchEvent extends AnalyticsEvent {
  eventType: 'search'
  eventData: {
    origin: string
    destination: string
    departDate: string
    returnDate?: string
    passengers: number
    cabinClass: string
  }
}

export interface ClickEvent extends AnalyticsEvent {
  eventType: 'click'
  eventData: {
    element: string
    location: string
    metadata?: Record<string, any>
  }
}

export interface ConversionEvent extends AnalyticsEvent {
  eventType: 'conversion'
  eventData: {
    type: string // booking, signup, newsletter, etc.
    value?: number
    metadata?: Record<string, any>
  }
}

class EventTracker {
  private sessionId: string
  private queue: AnalyticsEvent[] = []
  private flushInterval: number = 5000 // 5 seconds
  private maxQueueSize: number = 10
  private isFlushing: boolean = false
  private timerId?: NodeJS.Timeout

  constructor() {
    this.sessionId = this.getOrCreateSessionId()
    this.startAutoFlush()

    // Flush on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => this.flush())
      window.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.flush()
        }
      })
    }
  }

  private getOrCreateSessionId(): string {
    if (typeof window === 'undefined') return 'server-session'

    let sessionId = sessionStorage.getItem('analytics_session_id')
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      sessionStorage.setItem('analytics_session_id', sessionId)
    }
    return sessionId
  }

  private startAutoFlush() {
    this.timerId = setInterval(() => {
      if (this.queue.length > 0) {
        this.flush()
      }
    }, this.flushInterval)
  }

  /**
   * Track a custom event
   */
  track(event: AnalyticsEvent) {
    this.queue.push({
      ...event,
      timestamp: event.timestamp || Date.now()
    })

    // Flush immediately if queue is full
    if (this.queue.length >= this.maxQueueSize) {
      this.flush()
    }
  }

  /**
   * Track page view
   */
  trackPageView(url?: string, title?: string) {
    if (typeof window === 'undefined') return

    this.track({
      eventType: 'page_view',
      eventData: {
        url: url || window.location.href,
        title: title || document.title,
        referrer: document.referrer
      }
    })
  }

  /**
   * Track search
   */
  trackSearch(params: SearchEvent['eventData']) {
    this.track({
      eventType: 'search',
      eventData: params
    })
  }

  /**
   * Track click
   */
  trackClick(element: string, location: string, metadata?: Record<string, any>) {
    this.track({
      eventType: 'click',
      eventData: { element, location, metadata }
    })
  }

  /**
   * Track conversion
   */
  trackConversion(type: string, value?: number, metadata?: Record<string, any>) {
    this.track({
      eventType: 'conversion',
      eventData: { type, value, metadata }
    })
  }

  /**
   * Track funnel stage
   */
  trackFunnel(stage: string, action: 'entered' | 'completed' | 'abandoned', metadata?: Record<string, any>) {
    this.track({
      eventType: 'funnel',
      eventData: { stage, action, metadata }
    })
  }

  /**
   * Flush events to server
   */
  async flush() {
    if (this.queue.length === 0 || this.isFlushing) return

    this.isFlushing = true
    const eventsToSend = [...this.queue]
    this.queue = []

    try {
      const response = await fetch('/api/analytics/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId: this.sessionId,
          events: eventsToSend
        })
      })

      if (!response.ok) {
        // Re-queue events if failed
        this.queue.unshift(...eventsToSend)
      }
    } catch (error) {
      console.error('Failed to send analytics events:', error)
      // Re-queue events if failed
      this.queue.unshift(...eventsToSend)
    } finally {
      this.isFlushing = false
    }
  }

  /**
   * Clean up
   */
  destroy() {
    if (this.timerId) {
      clearInterval(this.timerId)
    }
    this.flush()
  }
}

// Singleton instance
let trackerInstance: EventTracker | null = null

export function getEventTracker(): EventTracker {
  if (!trackerInstance) {
    trackerInstance = new EventTracker()
  }
  return trackerInstance
}

// Convenience functions
export const trackPageView = (url?: string, title?: string) => getEventTracker().trackPageView(url, title)
export const trackSearch = (params: SearchEvent['eventData']) => getEventTracker().trackSearch(params)
export const trackClick = (element: string, location: string, metadata?: Record<string, any>) =>
  getEventTracker().trackClick(element, location, metadata)
export const trackConversion = (type: string, value?: number, metadata?: Record<string, any>) =>
  getEventTracker().trackConversion(type, value, metadata)
export const trackFunnel = (stage: string, action: 'entered' | 'completed' | 'abandoned', metadata?: Record<string, any>) =>
  getEventTracker().trackFunnel(stage, action, metadata)
