/**
 * Fly2Any AI Email Decision Engine
 * Ultra-Premium Level 6 — Apple-Class Email Intelligence
 *
 * Autonomous system: IF/WHEN/WHICH email, subject, CTA
 * Core: Helpful, elegant, timely. NEVER spam.
 * @version 2.0.0
 */

import prisma from '@/lib/prisma';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export type EmailTemplate = 'TRANSACTIONAL' | 'ABANDONED_SEARCH' | 'PRICE_DROP' | 'ABANDONED_BOOKING' | 'WELCOME' | 'REENGAGEMENT';
export type AllowedCTA = 'View my booking' | 'Continue booking' | 'Book now' | 'Complete your booking' | 'Start your trip' | 'Explore deals';

export interface UserContext {
  userId?: string;
  email: string;
  isRegistered: boolean;
  isLoggedIn: boolean;
  timezone?: string;
  device?: 'mobile' | 'desktop';
  lastEmailSent?: Date;
  lastEmailOpened?: Date;
  totalEmailsSent: number;
  totalEmailsOpened: number;
  consecutiveUnopened: number;
  hasBookedBefore: boolean;
  lastBookingDate?: Date;
  lifetimeValue: number;
  bookingCount: number;
  preferredOrigin?: string;
  preferredDestination?: string;
  priceSensitivity: 'low' | 'medium' | 'high';
  engagementScore: number;
  recentSearches: Array<{ origin: string; destination: string; date: Date }>;
  hasPriceAlert: boolean;
  daysInactive: number;
}

export interface EmailIntent {
  event: string;
  template: EmailTemplate;
  priority: 'critical' | 'high' | 'medium' | 'low';
  data: Record<string, any>;
}

export interface AIDecisionResult {
  send: boolean;
  template: EmailTemplate;
  subject: string;
  cta: AllowedCTA;
  sendTime: string;
  reason: string;
  confidenceScore: number;
  delayMinutes?: number;
}

// ═══════════════════════════════════════════════════════════════
// TRUST PROTECTION — Non-negotiable rules
// ═══════════════════════════════════════════════════════════════

const TRUST = {
  maxPer24h: 1,           // Max 1 email per day
  maxPer7d: 3,            // Max 3 per week
  pauseAfterUnopened: 3,  // Pause if 3 ignored
  pauseDays: 30,          // Pause duration
  quietStart: 22,         // 10 PM
  quietEnd: 7,            // 7 AM
  morningStart: 9,        // Optimal morning
  morningEnd: 11,
  eveningStart: 18,       // Optimal evening
  eveningEnd: 20,
  reengageMin: 21,        // Re-engagement window
  reengageMax: 45,
  searchMin: 30,          // Abandoned search (minutes)
  searchMax: 180,
  bookingMin: 2,          // Abandoned booking (hours)
  bookingMax: 24,
};

// Subject lines — Max 45 chars, calm, NO emojis, NO hype
const SUBJECTS: Record<EmailTemplate, string[]> = {
  TRANSACTIONAL: ['Your booking is confirmed', 'Trip confirmed — you\'re all set'],
  ABANDONED_SEARCH: ['Your fare is still available', 'Still planning your trip?'],
  PRICE_DROP: ['Your flight price just dropped', 'Good news — fare reduced'],
  ABANDONED_BOOKING: ['Complete your booking', 'Your trip is almost ready'],
  WELCOME: ['Welcome to Fly2Any', 'Your journey starts here'],
  REENGAGEMENT: ['We found deals for you', 'Your next adventure awaits'],
};

// CTAs — Verb-driven, calm, confidence-based
const CTA: Record<EmailTemplate, AllowedCTA> = {
  TRANSACTIONAL: 'View my booking',
  ABANDONED_SEARCH: 'Continue booking',
  PRICE_DROP: 'Book now',
  ABANDONED_BOOKING: 'Complete your booking',
  WELCOME: 'Start your trip',
  REENGAGEMENT: 'Explore deals',
};

// ═══════════════════════════════════════════════════════════════
// AI DECISION ENGINE
// ═══════════════════════════════════════════════════════════════

export class AIEmailDecisionEngine {
  async decide(user: UserContext, intent: EmailIntent): Promise<AIDecisionResult> {
    const now = new Date();

    // Critical transactional → immediate
    if (intent.template === 'TRANSACTIONAL' && intent.priority === 'critical') {
      return {
        send: true,
        template: 'TRANSACTIONAL',
        subject: this.pickSubject('TRANSACTIONAL', user, intent.data),
        cta: 'View my booking',
        sendTime: now.toISOString(),
        reason: 'Critical transactional — immediate',
        confidenceScore: 100,
      };
    }

    // Fatigue protection
    if (user.consecutiveUnopened >= TRUST.pauseAfterUnopened) {
      return this.skip(intent.template, `Ignored ${user.consecutiveUnopened} emails — paused ${TRUST.pauseDays}d`);
    }

    // Frequency limits
    const freq = await this.checkFreq(user);
    if (!freq.ok) return this.skip(intent.template, freq.reason);

    // Template-specific validation
    const valid = this.validate(user, intent);
    if (!valid.ok) return this.skip(intent.template, valid.reason);

    // Timing optimization
    const timing = this.timing(user, intent);

    return {
      send: true,
      template: intent.template,
      subject: this.pickSubject(intent.template, user, intent.data),
      cta: CTA[intent.template],
      sendTime: timing.time,
      reason: timing.reason,
      confidenceScore: this.confidence(user, intent),
      delayMinutes: timing.delay,
    };
  }

  private skip(t: EmailTemplate, reason: string): AIDecisionResult {
    return { send: false, template: t, subject: '', cta: CTA[t], sendTime: new Date().toISOString(), reason, confidenceScore: 0 };
  }

  private async checkFreq(u: UserContext): Promise<{ ok: boolean; reason: string }> {
    if (!prisma) return { ok: true, reason: 'DB unavailable' };
    try {
      const now = Date.now();
      const [d1, d7] = await Promise.all([
        prisma.emailLog.count({ where: { recipientEmail: u.email, sentAt: { gte: new Date(now - 86400000) } } }),
        prisma.emailLog.count({ where: { recipientEmail: u.email, sentAt: { gte: new Date(now - 604800000) } } }),
      ]);
      if (d1 >= TRUST.maxPer24h) return { ok: false, reason: `Daily limit (${d1}/${TRUST.maxPer24h})` };
      if (d7 >= TRUST.maxPer7d) return { ok: false, reason: `Weekly limit (${d7}/${TRUST.maxPer7d})` };
      return { ok: true, reason: 'OK' };
    } catch { return { ok: true, reason: 'Check failed' }; }
  }

  private validate(u: UserContext, i: EmailIntent): { ok: boolean; reason: string } {
    const d = i.data;
    switch (i.template) {
      case 'ABANDONED_SEARCH': {
        if (!d.searchTime) return { ok: true, reason: 'OK' };
        const m = (Date.now() - new Date(d.searchTime).getTime()) / 60000;
        if (m < TRUST.searchMin) return { ok: false, reason: 'Too soon since search (< 30 min)' };
        if (m > TRUST.searchMax) return { ok: false, reason: 'Too late since search (> 3 hours)' };
        return { ok: true, reason: 'OK' };
      }
      case 'ABANDONED_BOOKING': {
        if (!d.abandonedAt) return { ok: true, reason: 'OK' };
        const h = (Date.now() - new Date(d.abandonedAt).getTime()) / 3600000;
        if (h < TRUST.bookingMin) return { ok: false, reason: 'Too soon since abandonment (< 2h)' };
        if (h > TRUST.bookingMax) return { ok: false, reason: 'Too late since abandonment (> 24h)' };
        return { ok: true, reason: 'OK' };
      }
      case 'REENGAGEMENT':
        if (u.daysInactive < TRUST.reengageMin) return { ok: false, reason: `Not inactive enough (${u.daysInactive}d < ${TRUST.reengageMin}d)` };
        if (u.daysInactive > TRUST.reengageMax) return { ok: false, reason: `Too inactive (${u.daysInactive}d > ${TRUST.reengageMax}d)` };
        return { ok: true, reason: 'OK' };
      case 'WELCOME':
        return u.totalEmailsSent > 0 ? { ok: false, reason: 'Welcome already sent' } : { ok: true, reason: 'OK' };
      default:
        return { ok: true, reason: 'OK' };
    }
  }

  private timing(u: UserContext, i: EmailIntent): { time: string; delay: number; reason: string } {
    const now = new Date();
    const h = this.hour(u.timezone);

    // Transactional → immediate
    if (i.template === 'TRANSACTIONAL') {
      return { time: now.toISOString(), delay: 0, reason: 'Transactional — immediate' };
    }

    // Price drop → immediate if not quiet hours
    if (i.template === 'PRICE_DROP' && h >= TRUST.quietEnd && h < TRUST.quietStart) {
      return { time: now.toISOString(), delay: 0, reason: 'Price drop — high priority' };
    }

    // Check optimal windows
    const inMorning = h >= TRUST.morningStart && h <= TRUST.morningEnd;
    const inEvening = h >= TRUST.eveningStart && h <= TRUST.eveningEnd;

    if (inMorning || inEvening) {
      return { time: now.toISOString(), delay: 0, reason: 'Optimal send hour' };
    }

    // Calculate delay to next optimal window
    let target = h < TRUST.morningStart ? TRUST.morningStart :
                 h < TRUST.eveningStart ? TRUST.eveningStart :
                 TRUST.morningStart + 24;

    const delay = Math.max(0, Math.round((target - h) * 60));
    return {
      time: new Date(now.getTime() + delay * 60000).toISOString(),
      delay,
      reason: `Delay to ${target % 24}:00 local`,
    };
  }

  private pickSubject(t: EmailTemplate, u: UserContext, d: Record<string, any>): string {
    const v = SUBJECTS[t];
    let s = u.lifetimeValue > 1000 && v.length > 1 ? v[1] : v[0];
    return s
      .replace('{{destination}}', d.destination || 'your destination')
      .replace('{{origin}}', d.origin || u.preferredOrigin || 'your city')
      .replace('{{route}}', d.route || `${d.origin || ''} → ${d.destination || ''}`);
  }

  private confidence(u: UserContext, i: EmailIntent): number {
    let s = 70;
    if (u.engagementScore > 70) s += 15;
    if (i.priority === 'critical') s += 20;
    if (i.priority === 'high') s += 10;
    if (u.totalEmailsSent > 5 && u.totalEmailsOpened / u.totalEmailsSent < 0.1) s -= 20;
    return Math.min(100, Math.max(0, s));
  }

  private hour(tz?: string): number {
    try {
      return parseInt(new Date().toLocaleString('en-US', { timeZone: tz || 'America/New_York', hour: 'numeric', hour12: false }));
    } catch { return new Date().getHours(); }
  }

  async buildUserContext(email: string, userId?: string): Promise<UserContext> {
    const base: UserContext = {
      email, userId, isRegistered: !!userId, isLoggedIn: !!userId,
      totalEmailsSent: 0, totalEmailsOpened: 0, consecutiveUnopened: 0,
      hasBookedBefore: false, lifetimeValue: 0, bookingCount: 0,
      priceSensitivity: 'medium', engagementScore: 50, recentSearches: [],
      hasPriceAlert: false, daysInactive: 0,
    };
    if (!prisma) return base;
    try {
      const [stats, bookings, alerts] = await Promise.all([
        prisma.emailLog.aggregate({ where: { recipientEmail: email }, _count: { id: true }, _max: { sentAt: true, openedAt: true } }).catch(() => null),
        userId ? prisma.booking.findMany({ where: { userId }, select: { totalAmount: true, createdAt: true }, orderBy: { createdAt: 'desc' }, take: 10 }).catch(() => []) : [],
        userId ? prisma.priceAlert?.count({ where: { userId } }).catch(() => 0) : 0,
      ]);
      let unopened = 0;
      if (stats?._count?.id) {
        const recent = await prisma.emailLog.findMany({ where: { recipientEmail: email }, orderBy: { sentAt: 'desc' }, take: 5, select: { openedAt: true } }).catch(() => []);
        for (const e of recent) { if (!e.openedAt) unopened++; else break; }
      }
      const ltv = bookings.reduce((s, b) => s + (b.totalAmount || 0), 0);
      const last = stats?._max?.openedAt || stats?._max?.sentAt;
      const inactive = last ? Math.floor((Date.now() - new Date(last).getTime()) / 86400000) : 0;
      return {
        ...base,
        totalEmailsSent: stats?._count?.id || 0,
        lastEmailSent: stats?._max?.sentAt || undefined,
        lastEmailOpened: stats?._max?.openedAt || undefined,
        consecutiveUnopened: unopened,
        hasBookedBefore: bookings.length > 0,
        lastBookingDate: bookings[0]?.createdAt,
        lifetimeValue: ltv,
        bookingCount: bookings.length,
        priceSensitivity: (alerts || 0) > 3 ? 'high' : (alerts || 0) > 0 ? 'medium' : 'low',
        engagementScore: Math.min(100, 50 + bookings.length * 10),
        hasPriceAlert: (alerts || 0) > 0,
        daysInactive: inactive,
      };
    } catch { return base; }
  }
}

export const aiEmailEngine = new AIEmailDecisionEngine();

// Quick helper function
export async function shouldSendEmail(email: string, template: EmailTemplate, data: Record<string, any>, userId?: string): Promise<AIDecisionResult> {
  const ctx = await aiEmailEngine.buildUserContext(email, userId);
  return aiEmailEngine.decide(ctx, {
    event: template.toLowerCase(),
    template,
    priority: template === 'TRANSACTIONAL' ? 'critical' : template === 'PRICE_DROP' ? 'high' : 'medium',
    data,
  });
}
