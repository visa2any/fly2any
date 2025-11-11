/**
 * Performance Monitoring Service
 * Tracks Web Vitals and sends performance metrics to backend
 */

import { onCLS, onFID, onLCP, onFCP, onTTFB, onINP, Metric } from 'web-vitals'

interface PerformanceMetricData {
  metricName: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  url: string
  deviceType: string
  browser: string
  browserVersion: string
  os: string
  connectionType?: string
}

class PerformanceMonitor {
  private sessionId: string
  private metrics: PerformanceMetricData[] = []

  constructor() {
    this.sessionId = this.getSessionId()
    this.initWebVitals()
  }

  private getSessionId(): string {
    if (typeof window === 'undefined') return 'server-session'
    return sessionStorage.getItem('analytics_session_id') || 'unknown'
  }

  private getRating(metric: Metric): 'good' | 'needs-improvement' | 'poor' {
    const { name, value, rating } = metric

    // Use the rating from web-vitals if available
    if (rating) return rating as 'good' | 'needs-improvement' | 'poor'

    // Fallback to manual thresholds
    const thresholds: Record<string, [number, number]> = {
      'LCP': [2500, 4000],
      'FID': [100, 300],
      'CLS': [0.1, 0.25],
      'FCP': [1800, 3000],
      'TTFB': [800, 1800],
      'INP': [200, 500]
    }

    const [good, needsImprovement] = thresholds[name] || [0, 0]

    if (value <= good) return 'good'
    if (value <= needsImprovement) return 'needs-improvement'
    return 'poor'
  }

  private getDeviceType(): string {
    if (typeof window === 'undefined') return 'unknown'

    const width = window.innerWidth
    if (width < 768) return 'mobile'
    if (width < 1024) return 'tablet'
    return 'desktop'
  }

  private getBrowserInfo(): { browser: string, browserVersion: string, os: string } {
    if (typeof window === 'undefined' || !navigator) {
      return { browser: 'unknown', browserVersion: 'unknown', os: 'unknown' }
    }

    const ua = navigator.userAgent

    // Detect browser
    let browser = 'unknown'
    let browserVersion = 'unknown'

    if (ua.includes('Firefox/')) {
      browser = 'Firefox'
      browserVersion = ua.match(/Firefox\/(\d+\.\d+)/)?.[1] || 'unknown'
    } else if (ua.includes('Edg/')) {
      browser = 'Edge'
      browserVersion = ua.match(/Edg\/(\d+\.\d+)/)?.[1] || 'unknown'
    } else if (ua.includes('Chrome/')) {
      browser = 'Chrome'
      browserVersion = ua.match(/Chrome\/(\d+\.\d+)/)?.[1] || 'unknown'
    } else if (ua.includes('Safari/') && !ua.includes('Chrome')) {
      browser = 'Safari'
      browserVersion = ua.match(/Version\/(\d+\.\d+)/)?.[1] || 'unknown'
    }

    // Detect OS
    let os = 'unknown'
    if (ua.includes('Windows')) os = 'Windows'
    else if (ua.includes('Mac OS')) os = 'macOS'
    else if (ua.includes('Linux')) os = 'Linux'
    else if (ua.includes('Android')) os = 'Android'
    else if (ua.includes('iOS')) os = 'iOS'

    return { browser, browserVersion, os }
  }

  private getConnectionType(): string | undefined {
    if (typeof navigator === 'undefined' || !('connection' in navigator)) {
      return undefined
    }

    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
    return connection?.effectiveType
  }

  private handleMetric(metric: Metric) {
    const { browser, browserVersion, os } = this.getBrowserInfo()

    const metricData: PerformanceMetricData = {
      metricName: metric.name,
      value: metric.value,
      rating: this.getRating(metric),
      url: window.location.href,
      deviceType: this.getDeviceType(),
      browser,
      browserVersion,
      os,
      connectionType: this.getConnectionType()
    }

    this.metrics.push(metricData)
    this.sendMetric(metricData)
  }

  private async sendMetric(metric: PerformanceMetricData) {
    try {
      await fetch('/api/analytics/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId: this.sessionId,
          ...metric
        })
      })
    } catch (error) {
      console.error('Failed to send performance metric:', error)
    }
  }

  private initWebVitals() {
    if (typeof window === 'undefined') return

    onCLS((metric) => this.handleMetric(metric))
    onFID((metric) => this.handleMetric(metric))
    onLCP((metric) => this.handleMetric(metric))
    onFCP((metric) => this.handleMetric(metric))
    onTTFB((metric) => this.handleMetric(metric))
    onINP((metric) => this.handleMetric(metric))
  }

  getMetrics(): PerformanceMetricData[] {
    return this.metrics
  }
}

// Singleton instance
let monitorInstance: PerformanceMonitor | null = null

export function getPerformanceMonitor(): PerformanceMonitor {
  if (!monitorInstance && typeof window !== 'undefined') {
    monitorInstance = new PerformanceMonitor()
  }
  return monitorInstance!
}

// Auto-initialize on client
if (typeof window !== 'undefined') {
  getPerformanceMonitor()
}
