/**
 * Anti-Scraping Agent - Bot Protection System
 * Fly2Any Growth OS
 *
 * Detects and mitigates scraping attempts, protects pricing data
 */

import { createHash, randomBytes } from 'crypto'

export interface RequestFingerprint {
  ip: string
  userAgent: string
  acceptLanguage: string
  acceptEncoding: string
  screenResolution?: string
  timezone?: string
  webglHash?: string
  canvasHash?: string
}

export interface SuspiciousActivity {
  id: string
  ip: string
  type: 'rate_limit' | 'pattern' | 'fingerprint' | 'behavior' | 'known_bot'
  score: number // 0-100, higher = more suspicious
  details: string
  timestamp: Date
  blocked: boolean
}

export interface BotDetectionResult {
  isBot: boolean
  botType?: 'scraper' | 'crawler' | 'automation' | 'known_service'
  confidence: number // 0-100
  reasons: string[]
  fingerprint: string
  action: 'allow' | 'challenge' | 'block'
}

// Known bot user agents (partial matches)
const KNOWN_BOTS = [
  'Googlebot', 'Bingbot', 'Slurp', 'DuckDuckBot', 'Baiduspider',
  'YandexBot', 'Sogou', 'Exabot', 'facebookexternalhit', 'Twitterbot',
  'LinkedInBot', 'WhatsApp', 'TelegramBot', 'Slackbot', 'Discordbot'
]

// Suspicious patterns indicating scrapers
const SCRAPER_PATTERNS = [
  'python-requests', 'python-urllib', 'curl/', 'wget/', 'libwww-perl',
  'Scrapy', 'httpclient', 'node-fetch', 'axios/', 'got/',
  'PhantomJS', 'Selenium', 'Puppeteer', 'Playwright', 'HeadlessChrome'
]

// Rate limiting config
const RATE_LIMITS = {
  search: { window: 60000, max: 30 }, // 30 searches per minute
  api: { window: 60000, max: 60 }, // 60 API calls per minute
  page: { window: 60000, max: 100 }, // 100 page views per minute
}

export class AntiScrapingAgent {
  private requestCounts: Map<string, Map<string, number[]>> = new Map()
  private blocklist: Set<string> = new Set()
  private challenges: Map<string, { token: string; expires: Date }> = new Map()
  private fingerprintCache: Map<string, BotDetectionResult> = new Map()
  private suspiciousIPs: Map<string, number> = new Map() // IP -> score

  /**
   * Analyze incoming request
   */
  async analyzeRequest(
    fingerprint: RequestFingerprint,
    requestType: 'search' | 'api' | 'page' = 'page'
  ): Promise<BotDetectionResult> {
    const fpHash = this.hashFingerprint(fingerprint)

    // Check cache first
    const cached = this.fingerprintCache.get(fpHash)
    if (cached && Date.now() - cached.confidence < 300000) { // 5 min cache
      return cached
    }

    const reasons: string[] = []
    let score = 0

    // 1. Check blocklist
    if (this.blocklist.has(fingerprint.ip)) {
      return this.createResult(true, 'scraper', 100, ['IP is blocklisted'], fpHash, 'block')
    }

    // 2. Check for known bots
    const knownBot = this.detectKnownBot(fingerprint.userAgent)
    if (knownBot) {
      return this.createResult(true, 'known_service', 90, [`Known bot: ${knownBot}`], fpHash, 'allow')
    }

    // 3. Check for scraper patterns
    const scraperMatch = this.detectScraperPattern(fingerprint.userAgent)
    if (scraperMatch) {
      score += 60
      reasons.push(`Scraper pattern detected: ${scraperMatch}`)
    }

    // 4. Rate limiting check
    const rateLimitViolation = this.checkRateLimit(fingerprint.ip, requestType)
    if (rateLimitViolation) {
      score += 30
      reasons.push(`Rate limit exceeded: ${rateLimitViolation}`)
    }

    // 5. Fingerprint anomalies
    const anomalies = this.detectFingerprintAnomalies(fingerprint)
    score += anomalies.score
    reasons.push(...anomalies.reasons)

    // 6. Behavior analysis
    const behaviorScore = this.analyzeBehavior(fingerprint.ip)
    score += behaviorScore.score
    reasons.push(...behaviorScore.reasons)

    // 7. Check suspicious IP score
    const ipScore = this.suspiciousIPs.get(fingerprint.ip) || 0
    if (ipScore > 50) {
      score += 20
      reasons.push(`Previously suspicious activity (score: ${ipScore})`)
    }

    // Determine action
    let action: 'allow' | 'challenge' | 'block' = 'allow'
    let isBot = false
    let botType: BotDetectionResult['botType'] = undefined

    if (score >= 80) {
      action = 'block'
      isBot = true
      botType = 'scraper'
      this.recordSuspiciousActivity(fingerprint.ip, 'pattern', score, reasons.join('; '))
    } else if (score >= 50) {
      action = 'challenge'
      isBot = true
      botType = 'automation'
    } else if (score >= 30) {
      // Soft flag - monitor but allow
      this.incrementSuspicion(fingerprint.ip, 10)
    }

    const result = this.createResult(isBot, botType, score, reasons, fpHash, action)
    this.fingerprintCache.set(fpHash, result)

    return result
  }

  /**
   * Generate challenge for suspicious requests
   */
  generateChallenge(ip: string): { token: string; challenge: string } {
    const token = randomBytes(32).toString('hex')
    const challenge = randomBytes(16).toString('hex')

    this.challenges.set(ip, {
      token,
      expires: new Date(Date.now() + 300000), // 5 minutes
    })

    return { token, challenge }
  }

  /**
   * Verify challenge response
   */
  verifyChallenge(ip: string, token: string): boolean {
    const stored = this.challenges.get(ip)
    if (!stored) return false

    if (stored.expires < new Date()) {
      this.challenges.delete(ip)
      return false
    }

    const valid = stored.token === token
    if (valid) {
      this.challenges.delete(ip)
      // Reduce suspicion on successful challenge
      const currentScore = this.suspiciousIPs.get(ip) || 0
      this.suspiciousIPs.set(ip, Math.max(0, currentScore - 30))
    }

    return valid
  }

  /**
   * Add IP to blocklist
   */
  blockIP(ip: string, reason: string): void {
    this.blocklist.add(ip)
    this.recordSuspiciousActivity(ip, 'known_bot', 100, `Blocked: ${reason}`)
    console.log(`[Anti-Scraping] Blocked IP: ${ip} - ${reason}`)
  }

  /**
   * Remove IP from blocklist
   */
  unblockIP(ip: string): void {
    this.blocklist.delete(ip)
    this.suspiciousIPs.delete(ip)
    console.log(`[Anti-Scraping] Unblocked IP: ${ip}`)
  }

  /**
   * Get protection stats
   */
  getStats(): {
    blockedIPs: number
    suspiciousIPs: number
    challengesPending: number
    recentBlocks: number
  } {
    return {
      blockedIPs: this.blocklist.size,
      suspiciousIPs: Array.from(this.suspiciousIPs.values()).filter(s => s > 50).length,
      challengesPending: this.challenges.size,
      recentBlocks: 0, // Would track from database
    }
  }

  /**
   * Generate secure pricing token
   * Prevents direct API access to pricing data
   */
  generatePricingToken(
    origin: string,
    destination: string,
    date: string,
    sessionId: string
  ): string {
    const data = `${origin}|${destination}|${date}|${sessionId}|${Date.now()}`
    const secret = process.env.PRICING_SECRET || 'fly2any-pricing-secret'
    return createHash('sha256').update(data + secret).digest('hex').slice(0, 32)
  }

  /**
   * Verify pricing token
   */
  verifyPricingToken(token: string, origin: string, destination: string, date: string, sessionId: string): boolean {
    // Allow 5 minute window for token validity
    for (let i = 0; i < 300; i += 30) {
      const timestamp = Date.now() - i * 1000
      const data = `${origin}|${destination}|${date}|${sessionId}|${timestamp}`
      const secret = process.env.PRICING_SECRET || 'fly2any-pricing-secret'
      const expected = createHash('sha256').update(data + secret).digest('hex').slice(0, 32)
      if (expected === token) return true
    }
    return false
  }

  // Private methods

  private detectKnownBot(userAgent: string): string | null {
    for (const bot of KNOWN_BOTS) {
      if (userAgent.includes(bot)) return bot
    }
    return null
  }

  private detectScraperPattern(userAgent: string): string | null {
    const ua = userAgent.toLowerCase()
    for (const pattern of SCRAPER_PATTERNS) {
      if (ua.includes(pattern.toLowerCase())) return pattern
    }
    return null
  }

  private checkRateLimit(ip: string, type: 'search' | 'api' | 'page'): string | null {
    const limits = RATE_LIMITS[type]
    const now = Date.now()

    // Initialize tracking
    if (!this.requestCounts.has(ip)) {
      this.requestCounts.set(ip, new Map())
    }
    const ipCounts = this.requestCounts.get(ip)!

    if (!ipCounts.has(type)) {
      ipCounts.set(type, [])
    }

    const timestamps = ipCounts.get(type)!

    // Clean old timestamps
    const windowStart = now - limits.window
    const recentTimestamps = timestamps.filter(t => t > windowStart)
    ipCounts.set(type, [...recentTimestamps, now])

    if (recentTimestamps.length >= limits.max) {
      return `${recentTimestamps.length}/${limits.max} ${type} requests in ${limits.window / 1000}s`
    }

    return null
  }

  private detectFingerprintAnomalies(fp: RequestFingerprint): { score: number; reasons: string[] } {
    let score = 0
    const reasons: string[] = []

    // Missing user agent
    if (!fp.userAgent || fp.userAgent.length < 10) {
      score += 30
      reasons.push('Missing or invalid user agent')
    }

    // Missing accept headers (bots often skip these)
    if (!fp.acceptLanguage) {
      score += 10
      reasons.push('Missing accept-language header')
    }

    // Inconsistent browser fingerprint
    if (fp.userAgent?.includes('Chrome') && !fp.webglHash) {
      score += 15
      reasons.push('Browser fingerprint inconsistent with user agent')
    }

    // No timezone (headless browsers)
    if (!fp.timezone) {
      score += 5
      reasons.push('Missing timezone information')
    }

    // Suspicious screen resolution
    if (fp.screenResolution === '0x0' || fp.screenResolution === 'undefined') {
      score += 20
      reasons.push('Invalid screen resolution')
    }

    return { score, reasons }
  }

  private analyzeBehavior(ip: string): { score: number; reasons: string[] } {
    let score = 0
    const reasons: string[] = []

    // Get all request types for this IP
    const ipCounts = this.requestCounts.get(ip)
    if (!ipCounts) return { score: 0, reasons: [] }

    // Calculate total requests across all types
    let totalRequests = 0
    ipCounts.forEach(timestamps => {
      totalRequests += timestamps.length
    })

    // Very high request volume is suspicious
    if (totalRequests > 200) {
      score += 25
      reasons.push(`High request volume: ${totalRequests} requests`)
    }

    // Only search requests (no page views) is suspicious
    const searches = ipCounts.get('search')?.length || 0
    const pages = ipCounts.get('page')?.length || 0
    if (searches > 10 && pages === 0) {
      score += 20
      reasons.push('API-only access pattern')
    }

    return { score, reasons }
  }

  private incrementSuspicion(ip: string, amount: number): void {
    const current = this.suspiciousIPs.get(ip) || 0
    this.suspiciousIPs.set(ip, Math.min(100, current + amount))
  }

  private recordSuspiciousActivity(ip: string, type: SuspiciousActivity['type'], score: number, details: string): void {
    const activity: SuspiciousActivity = {
      id: `activity_${Date.now()}`,
      ip,
      type,
      score,
      details,
      timestamp: new Date(),
      blocked: score >= 80,
    }
    console.log(`[Anti-Scraping] ${type}: ${ip} (score: ${score}) - ${details}`)
    // In production: save to database
  }

  private hashFingerprint(fp: RequestFingerprint): string {
    const data = `${fp.ip}|${fp.userAgent}|${fp.acceptLanguage}|${fp.webglHash || ''}`
    return createHash('md5').update(data).digest('hex')
  }

  private createResult(
    isBot: boolean,
    botType: BotDetectionResult['botType'],
    confidence: number,
    reasons: string[],
    fingerprint: string,
    action: BotDetectionResult['action']
  ): BotDetectionResult {
    return { isBot, botType, confidence, reasons, fingerprint, action }
  }

  /**
   * Middleware helper for Next.js
   */
  async middleware(request: Request): Promise<BotDetectionResult> {
    const headers = request.headers

    const fingerprint: RequestFingerprint = {
      ip: headers.get('x-forwarded-for')?.split(',')[0] || headers.get('x-real-ip') || 'unknown',
      userAgent: headers.get('user-agent') || '',
      acceptLanguage: headers.get('accept-language') || '',
      acceptEncoding: headers.get('accept-encoding') || '',
    }

    // Determine request type from URL
    const url = new URL(request.url)
    let requestType: 'search' | 'api' | 'page' = 'page'
    if (url.pathname.startsWith('/api/')) requestType = 'api'
    if (url.pathname.includes('/search') || url.searchParams.has('q')) requestType = 'search'

    return this.analyzeRequest(fingerprint, requestType)
  }
}

export const antiScrapingAgent = new AntiScrapingAgent()
