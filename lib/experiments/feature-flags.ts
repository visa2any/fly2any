/**
 * Feature Flags & A/B Testing System
 * Client-side SDK for feature flag evaluation and experiment participation
 */

export interface FeatureFlagVariant {
  id: string
  name: string
  weight: number
  config?: Record<string, any>
}

export interface FeatureFlag {
  id: string
  key: string
  enabled: boolean
  rolloutPercentage: number
  variants: FeatureFlagVariant[]
  isExperiment: boolean
}

class FeatureFlagsClient {
  private flags: Map<string, FeatureFlag> = new Map()
  private sessionId: string
  private userId?: string
  private assignments: Map<string, string> = new Map() // flagKey -> variantId
  private initialized: boolean = false

  constructor() {
    this.sessionId = this.getSessionId()
    this.loadAssignments()
  }

  private getSessionId(): string {
    if (typeof window === 'undefined') return 'server-session'

    let sessionId = sessionStorage.getItem('analytics_session_id')
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      sessionStorage.setItem('analytics_session_id', sessionId)
    }
    return sessionId
  }

  private loadAssignments() {
    if (typeof window === 'undefined') return

    const saved = localStorage.getItem('feature_flag_assignments')
    if (saved) {
      try {
        const assignments = JSON.parse(saved)
        this.assignments = new Map(Object.entries(assignments))
      } catch (e) {
        console.error('Failed to load feature flag assignments:', e)
      }
    }
  }

  private saveAssignments() {
    if (typeof window === 'undefined') return

    const assignments = Object.fromEntries(this.assignments.entries())
    localStorage.setItem('feature_flag_assignments', JSON.stringify(assignments))
  }

  async initialize(userId?: string) {
    if (this.initialized) return

    this.userId = userId
    await this.fetchFlags()
    this.initialized = true
  }

  private async fetchFlags() {
    try {
      const response = await fetch('/api/experiments/flags')
      if (response.ok) {
        const { flags } = await response.json()
        flags.forEach((flag: FeatureFlag) => {
          this.flags.set(flag.key, flag)
        })
      }
    } catch (error) {
      console.error('Failed to fetch feature flags:', error)
    }
  }

  /**
   * Check if a feature is enabled
   */
  isEnabled(flagKey: string): boolean {
    const flag = this.flags.get(flagKey)
    if (!flag || !flag.enabled) return false

    // Check rollout percentage
    if (flag.rolloutPercentage < 100) {
      const hash = this.hashString(this.userId || this.sessionId)
      const bucket = hash % 100
      if (bucket >= flag.rolloutPercentage) return false
    }

    return true
  }

  /**
   * Get variant for an experiment
   */
  getVariant(flagKey: string): string | null {
    const flag = this.flags.get(flagKey)
    if (!flag || !flag.enabled || !flag.isExperiment) return null

    // Check if already assigned
    if (this.assignments.has(flagKey)) {
      return this.assignments.get(flagKey)!
    }

    // Assign variant based on weights
    const variant = this.assignVariant(flag)
    if (variant) {
      this.assignments.set(flagKey, variant.id)
      this.saveAssignments()

      // Track participation
      this.trackParticipation(flag, variant)
    }

    return variant?.id || null
  }

  /**
   * Get variant configuration
   */
  getVariantConfig(flagKey: string): Record<string, any> | null {
    const variantId = this.getVariant(flagKey)
    if (!variantId) return null

    const flag = this.flags.get(flagKey)
    const variant = flag?.variants.find(v => v.id === variantId)
    return variant?.config || null
  }

  private assignVariant(flag: FeatureFlag): FeatureFlagVariant | null {
    if (!flag.variants || flag.variants.length === 0) return null

    // Use consistent hashing for same user/session
    const hash = this.hashString(this.userId || this.sessionId)
    const totalWeight = flag.variants.reduce((sum, v) => sum + v.weight, 0)
    const bucket = hash % totalWeight

    let currentWeight = 0
    for (const variant of flag.variants) {
      currentWeight += variant.weight
      if (bucket < currentWeight) {
        return variant
      }
    }

    return flag.variants[0]
  }

  private async trackParticipation(flag: FeatureFlag, variant: FeatureFlagVariant) {
    try {
      await fetch('/api/experiments/participate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          flagId: flag.id,
          flagKey: flag.key,
          variantId: variant.id,
          sessionId: this.sessionId,
          userId: this.userId
        })
      })
    } catch (error) {
      console.error('Failed to track experiment participation:', error)
    }
  }

  /**
   * Track conversion for experiments
   */
  async trackConversion(flagKey: string, value?: number) {
    const variantId = this.assignments.get(flagKey)
    if (!variantId) return

    try {
      await fetch('/api/experiments/convert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          flagKey,
          variantId,
          sessionId: this.sessionId,
          userId: this.userId,
          value
        })
      })
    } catch (error) {
      console.error('Failed to track conversion:', error)
    }
  }

  /**
   * Simple hash function for consistent bucketing
   */
  private hashString(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32bit integer
    }
    return Math.abs(hash)
  }

  /**
   * Reset all assignments (for testing)
   */
  resetAssignments() {
    this.assignments.clear()
    if (typeof window !== 'undefined') {
      localStorage.removeItem('feature_flag_assignments')
    }
  }
}

// Singleton instance
let clientInstance: FeatureFlagsClient | null = null

export function getFeatureFlagsClient(): FeatureFlagsClient {
  if (!clientInstance) {
    clientInstance = new FeatureFlagsClient()
  }
  return clientInstance
}

// React hook for feature flags
export function useFeatureFlag(flagKey: string): boolean {
  const client = getFeatureFlagsClient()
  return client.isEnabled(flagKey)
}

// React hook for experiments
export function useExperiment(flagKey: string): {
  variant: string | null
  config: Record<string, any> | null
  trackConversion: (value?: number) => Promise<void>
} {
  const client = getFeatureFlagsClient()

  return {
    variant: client.getVariant(flagKey),
    config: client.getVariantConfig(flagKey),
    trackConversion: (value?: number) => client.trackConversion(flagKey, value)
  }
}
