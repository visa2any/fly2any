/**
 * Consultant Handoff System — Fly2Any AI Ecosystem
 *
 * Components:
 * 1. Consultant Handoff Protocol - Seamless agent transfers
 * 2. Emotion-Aware Tone Adapter - Dynamic tone adjustment
 * 3. QA & Hallucination Guardrail - Response validation
 */

import type { EmotionalState, UrgencyLevel, PrimaryIntent } from './smart-router';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════
export type TeamType =
  | 'customer-service'
  | 'flight-operations'
  | 'hotel-accommodations'
  | 'payment-billing'
  | 'legal-compliance'
  | 'travel-insurance'
  | 'visa-documentation'
  | 'car-rental'
  | 'loyalty-rewards'
  | 'technical-support'
  | 'accessibility-services'
  | 'special-services'
  | 'emergency-response'
  | 'crisis-management';

export interface ConsultantInfo {
  team: TeamType;
  name: string;
  title: string;
  emoji: string;
}

export interface HandoffMessage {
  fromConsultant: string;
  toConsultant: string;
  transferAnnouncement: string; // What the previous consultant says
  introduction: string; // What the new consultant says
  context?: string; // What the new consultant understood from the request
}

/**
 * Get consultant information by team
 */
export function getConsultantInfo(team: TeamType): ConsultantInfo {
  const consultants: Record<TeamType, ConsultantInfo> = {
    'customer-service': {
      team: 'customer-service',
      name: 'Lisa Thompson',
      title: 'Customer Experience Manager',
      emoji: '🎧'
    },
    'flight-operations': {
      team: 'flight-operations',
      name: 'Sarah Chen',
      title: 'Senior Flight Operations Specialist',
      emoji: '✈️'
    },
    'hotel-accommodations': {
      team: 'hotel-accommodations',
      name: 'Marcus Rodriguez',
      title: 'Hotel & Accommodations Advisor',
      emoji: '🏨'
    },
    'payment-billing': {
      team: 'payment-billing',
      name: 'David Park',
      title: 'Payment & Billing Specialist',
      emoji: '💳'
    },
    'legal-compliance': {
      team: 'legal-compliance',
      name: 'Dr. Emily Watson',
      title: 'Travel Law & Compliance Consultant',
      emoji: '⚖️'
    },
    'travel-insurance': {
      team: 'travel-insurance',
      name: 'Robert Martinez',
      title: 'Travel Insurance Advisor',
      emoji: '🛡️'
    },
    'visa-documentation': {
      team: 'visa-documentation',
      name: 'Sophia Nguyen',
      title: 'Immigration & Documentation Consultant',
      emoji: '📄'
    },
    'car-rental': {
      team: 'car-rental',
      name: 'James Anderson',
      title: 'Ground Transportation Specialist',
      emoji: '🚗'
    },
    'loyalty-rewards': {
      team: 'loyalty-rewards',
      name: 'Amanda Foster',
      title: 'Loyalty & Rewards Manager',
      emoji: '🎁'
    },
    'technical-support': {
      team: 'technical-support',
      name: 'Alex Kumar',
      title: 'Platform Technical Specialist',
      emoji: '💻'
    },
    'accessibility-services': {
      team: 'accessibility-services',
      name: 'Nina Davis',
      title: 'Accessibility & Special Needs Coordinator',
      emoji: '♿'
    },
    'special-services': {
      team: 'special-services',
      name: 'Nina Davis',
      title: 'Accessibility & Special Services Specialist',
      emoji: '♿'
    },
    'emergency-response': {
      team: 'emergency-response',
      name: 'Captain Mike Johnson',
      title: 'Emergency Response Coordinator',
      emoji: '🚨'
    },
    'crisis-management': {
      team: 'crisis-management',
      name: 'Captain Mike Johnson',
      title: 'Crisis & Emergency Manager',
      emoji: '🚨'
    }
  };

  return consultants[team] || consultants['customer-service'];
}

/**
 * Generate handoff messages for consultant transfer
 * Makes the transition feel natural and professional
 */
export function generateHandoffMessage(
  fromTeam: TeamType,
  toTeam: TeamType,
  userRequest: string,
  parsedContext?: any
): HandoffMessage {
  const from = getConsultantInfo(fromTeam);
  const to = getConsultantInfo(toTeam);

  // Generate transfer announcement from previous consultant
  const transferAnnouncement = generateTransferAnnouncement(from, to, toTeam);

  // Generate introduction from new consultant
  const introduction = generateConsultantIntroduction(to, userRequest, parsedContext);

  // Generate context confirmation (what the agent understood)
  const context = generateContextConfirmation(to, userRequest, parsedContext);

  return {
    fromConsultant: from.name,
    toConsultant: to.name,
    transferAnnouncement,
    introduction,
    context
  };
}

/**
 * Previous consultant announces the transfer
 * Warm, professional, sets expectations
 */
function generateTransferAnnouncement(
  from: ConsultantInfo,
  to: ConsultantInfo,
  toTeam: TeamType
): string {
  // Lisa's warm handoffs
  if (from.name === 'Lisa Thompson') {
    const warmHandoffs: Record<string, string[]> = {
      'hotel-accommodations': [
        `Perfect! Let me connect you with ${to.name}, our ${to.title}. He's absolutely wonderful at finding the perfect accommodations! ${to.emoji}`,
        `Oh wonderful! I'm going to transfer you to ${to.name} - he's our hotel specialist and he'll find you something amazing! ${to.emoji}`,
        `Great! Let me get you over to ${to.name}, our ${to.title}. He's the best at this! ${to.emoji}`
      ],
      'flight-operations': [
        `Excellent! Let me connect you with ${to.name}, our ${to.title}. She's brilliant at finding the best flights! ${to.emoji}`,
        `Perfect! I'm transferring you to ${to.name} - she's our flight specialist and knows all the best routes! ${to.emoji}`
      ],
      'payment-billing': [
        `I'll connect you with ${to.name}, our ${to.title}, who will help you with that right away! ${to.emoji}`,
        `Let me get ${to.name} for you - he handles all payment matters securely! ${to.emoji}`
      ],
      'default': [
        `Let me connect you with ${to.name}, our ${to.title}. They're the perfect specialist for this! ${to.emoji}`,
        `I'm transferring you to ${to.name} - they're our expert in this area! ${to.emoji}`
      ]
    };

    const messages = warmHandoffs[toTeam] || warmHandoffs['default'];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  // Sarah's professional handoffs
  if (from.name === 'Sarah Chen') {
    return `I'll connect you with ${to.name}, our ${to.title}, who can assist you with that. ${to.emoji}`;
  }

  // Marcus's hospitable handoffs
  if (from.name === 'Marcus Rodriguez') {
    return `Let me get you over to ${to.name}, our ${to.title} - you're in great hands! ${to.emoji}`;
  }

  // Default professional handoff
  return `I'm transferring you to ${to.name}, our ${to.title}, who specializes in this area. ${to.emoji}`;
}

/**
 * New consultant introduces themselves
 * Professional, acknowledges the user's request
 */
function generateConsultantIntroduction(
  consultant: ConsultantInfo,
  userRequest: string,
  parsedContext?: any
): string {
  // Marcus Rodriguez - The Host
  if (consultant.name === 'Marcus Rodriguez') {
    if (parsedContext?.city) {
      return `¡Hola! I'm ${consultant.name}, your ${consultant.title}. ${consultant.emoji}\n\nI understand you need accommodation in ${parsedContext.city}${parsedContext.checkIn ? ` from ${formatDate(parsedContext.checkIn)} to ${formatDate(parsedContext.checkOut)}` : ''}${parsedContext.guests ? ` for ${parsedContext.guests} guest${parsedContext.guests > 1 ? 's' : ''}` : ''}. Let me find you the perfect place to stay!`;
    }
    return `Hello! I'm ${consultant.name}, your ${consultant.title}. ${consultant.emoji}\n\nHow can I help you find the perfect accommodation today?`;
  }

  // Sarah Chen - The Professional
  if (consultant.name === 'Sarah Chen') {
    if (parsedContext?.origin && parsedContext?.destination) {
      return `Hi! I'm ${consultant.name}, your ${consultant.title}. ${consultant.emoji}\n\nI see you're looking for flights from ${parsedContext.origin} to ${parsedContext.destination}${parsedContext.departureDate ? ` on ${formatDate(parsedContext.departureDate)}` : ''}. I'll find you the best options!`;
    }
    return `Hi! I'm ${consultant.name}, your ${consultant.title}. ${consultant.emoji}\n\nI'll help you find and book the perfect flight.`;
  }

  // Lisa Thompson - The Nurturer
  if (consultant.name === 'Lisa Thompson') {
    return `Welcome back, sweetie! ${consultant.emoji} I'm ${consultant.name}, your ${consultant.title}. How can I make your day better?`;
  }

  // Default professional introduction
  return `Hello! I'm ${consultant.name}, your ${consultant.title}. ${consultant.emoji}\n\nHow can I assist you today?`;
}

/**
 * Generate context confirmation
 * Agent confirms what they understood from the request
 */
function generateContextConfirmation(
  consultant: ConsultantInfo,
  userRequest: string,
  parsedContext?: any
): string | undefined {
  if (!parsedContext) return undefined;

  // Hotel context
  if (parsedContext.city && parsedContext.checkIn) {
    const nights = parsedContext.checkOut && parsedContext.checkIn
      ? Math.ceil(
          (new Date(parsedContext.checkOut).getTime() - new Date(parsedContext.checkIn).getTime()) /
          (1000 * 60 * 60 * 24)
        )
      : null;

    return `Just to confirm - you need:\n` +
           `📍 City: ${parsedContext.city}\n` +
           `📅 Check-in: ${formatDate(parsedContext.checkIn)}\n` +
           `📅 Check-out: ${formatDate(parsedContext.checkOut)}${nights ? ` (${nights} night${nights > 1 ? 's' : ''})` : ''}\n` +
           `👥 Guests: ${parsedContext.guests || 1}\n` +
           `🛏️ Rooms: ${parsedContext.rooms || 1}`;
  }

  // Flight context
  if (parsedContext.origin && parsedContext.destination) {
    return `Just to confirm - you need:\n` +
           `📍 From: ${parsedContext.origin}\n` +
           `📍 To: ${parsedContext.destination}\n` +
           `📅 Departure: ${formatDate(parsedContext.departureDate)}\n` +
           `${parsedContext.returnDate ? `📅 Return: ${formatDate(parsedContext.returnDate)}\n` : ''}` +
           `👥 Passengers: ${parsedContext.passengers || 1}\n` +
           `💺 Class: ${parsedContext.cabinClass || 'Economy'}`;
  }

  return undefined;
}

/**
 * Format date for display with graceful fallback
 */
function formatDate(dateString: string | undefined | null): string {
  if (!dateString) return 'TBD';

  try {
    const date = new Date(dateString);
    // Check if date is valid
    if (isNaN(date.getTime())) {
      // Try to extract date from common patterns before giving up
      const dateFromString = parseNaturalDate(dateString);
      if (dateFromString) {
        return dateFromString.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
      }
      return 'TBD';
    }
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return 'TBD';
  }
}

/**
 * Parse natural language date string as fallback
 */
function parseNaturalDate(dateString: string): Date | null {
  const months: Record<string, number> = {
    january: 0, jan: 0, february: 1, feb: 1, march: 2, mar: 2,
    april: 3, apr: 3, may: 4, june: 5, jun: 5, july: 6, jul: 6,
    august: 7, aug: 7, september: 8, sep: 8, sept: 8,
    october: 9, oct: 9, november: 10, nov: 10, december: 11, dec: 11
  };

  const lower = dateString.toLowerCase();

  // Pattern: "dec 20", "december 20th", etc.
  const monthDayPattern = /\b(january|jan|february|feb|march|mar|april|apr|may|june|jun|july|jul|august|aug|september|sep|sept|october|oct|november|nov|december|dec)\s+(\d{1,2})(?:st|nd|rd|th)?\b/i;
  const match = lower.match(monthDayPattern);

  if (match) {
    const month = months[match[1].toLowerCase()];
    const day = parseInt(match[2]);
    const now = new Date();
    let year = now.getFullYear();

    // If date is in the past, assume next year
    const testDate = new Date(year, month, day);
    if (testDate < now) {
      year++;
    }

    return new Date(year, month, day);
  }

  return null;
}

/**
 * Check if handoff is needed
 * Returns true if consultant changed from previous message
 */
export function needsHandoff(
  previousTeam: TeamType | null,
  currentTeam: TeamType
): boolean {
  // No handoff if no previous team (first message)
  if (!previousTeam) return false;

  // No handoff if same team
  if (previousTeam === currentTeam) return false;

  // Handoff needed when team changes
  return true;
}

/**
 * Get the previous consultant team from message history
 */
export function getPreviousConsultantTeam(
  messages: Array<{ consultant?: { team?: string } }>
): TeamType | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    const team = messages[i].consultant?.team;
    if (team) return team as TeamType;
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════════════════
// HANDOFF CONTEXT PACKAGE (Enhanced with Compliance Persistence)
// ═══════════════════════════════════════════════════════════════════════════
// Structured slot with confidence for handoff
export interface HandoffSlot<T = string> {
  value: T;
  confidence: number;
}

export interface HandoffContextPackage {
  from_agent: TeamType;
  to_agent: TeamType;
  primary_intent: string;
  secondary_intents: string[];
  emotional_state: string;
  urgency_level: string;
  user_summary: string;
  known_data: string[];
  open_questions: string[];
  risk_flags: string[];
  recommended_tone: string;
  handoff_count: number;
  // COMPLIANCE PERSISTENCE (IMMUTABLE during handoff)
  languageLocked: string;          // MUST persist: en, pt, es
  conversationStage: string;       // MUST persist: DISCOVERY, NARROWING, etc.
  stageCollectedData: Record<string, unknown>; // Trip data collected so far
  userConsents: {                  // Consent status
    searchPermission: boolean;
    bookingPermission: boolean;
  };
  // NEW: Structured slots with confidence scores
  structuredSlots?: {
    origin?: HandoffSlot;
    destination?: HandoffSlot;
    departureDate?: HandoffSlot;
    returnDate?: HandoffSlot;
    passengers?: HandoffSlot<number>;
    cabinClass?: HandoffSlot;
    tripType?: HandoffSlot;
  };
}

let sessionHandoffCount = 0;
const MAX_HANDOFFS = 2;

/**
 * Create handoff context package for agent transfer
 * CRITICAL: Preserves compliance state across handoffs
 */
export function createHandoffPackage(
  fromTeam: TeamType,
  toTeam: TeamType,
  context: {
    primary_intent?: string;
    secondary_intents?: string[];
    emotional_state?: string;
    urgency_level?: string;
    user_summary?: string;
    known_data?: string[];
    open_questions?: string[];
    risk_flags?: string[];
    // COMPLIANCE FIELDS (MUST be passed through)
    languageLocked?: string;
    conversationStage?: string;
    stageCollectedData?: Record<string, unknown>;
    userConsents?: { searchPermission: boolean; bookingPermission: boolean };
    // NEW: Structured slots with confidence
    structuredSlots?: HandoffContextPackage['structuredSlots'];
  }
): HandoffContextPackage {
  sessionHandoffCount++;

  // Force route to Lisa if too many handoffs
  const finalTarget = sessionHandoffCount > MAX_HANDOFFS ? 'customer-service' : toTeam;

  // Log handoff with slot preservation
  if (context.structuredSlots) {
    console.log(`[HANDOFF] ${fromTeam} → ${finalTarget} with slots:`, {
      origin: context.structuredSlots.origin?.value,
      destination: context.structuredSlots.destination?.value,
      date: context.structuredSlots.departureDate?.value,
    });
  }

  return {
    from_agent: fromTeam,
    to_agent: finalTarget as TeamType,
    primary_intent: context.primary_intent || 'GENERAL_TRAVEL_INFO',
    secondary_intents: context.secondary_intents || [],
    emotional_state: context.emotional_state || 'CALM',
    urgency_level: context.urgency_level || 'MEDIUM',
    user_summary: context.user_summary || '',
    known_data: context.known_data || [],
    open_questions: context.open_questions || [],
    risk_flags: context.risk_flags || [],
    recommended_tone: getToneRecommendation(
      context.emotional_state as EmotionalState || 'CALM',
      context.urgency_level as UrgencyLevel || 'MEDIUM'
    ).recommended_tone,
    handoff_count: sessionHandoffCount,
    // COMPLIANCE PERSISTENCE (NEVER LOST)
    languageLocked: context.languageLocked || 'en',
    conversationStage: context.conversationStage || 'DISCOVERY',
    stageCollectedData: context.stageCollectedData || {},
    userConsents: context.userConsents || { searchPermission: false, bookingPermission: false },
    // NEW: Structured slots (MUST persist)
    structuredSlots: context.structuredSlots,
  };
}

/**
 * Reset handoff count for new session
 */
export function resetHandoffSession(): void {
  sessionHandoffCount = 0;
}

/**
 * Check if handoff should be triggered
 */
export function shouldTriggerHandoff(
  currentTeam: TeamType,
  newIntent: string,
  emotional_state: string,
  urgency_level: string
): { trigger: boolean; target: TeamType; reason: string } {
  // CRITICAL urgency always goes to Crisis Manager
  if (urgency_level === 'CRITICAL') {
    return { trigger: true, target: 'crisis-management', reason: 'CRITICAL_URGENCY' };
  }

  // Payment/Legal domains need specialist
  if (newIntent.includes('PAYMENT') || newIntent.includes('REFUND')) {
    if (currentTeam !== 'payment-billing') {
      return { trigger: true, target: 'payment-billing', reason: 'PAYMENT_DOMAIN' };
    }
  }

  if (newIntent.includes('LEGAL')) {
    if (currentTeam !== 'legal-compliance') {
      return { trigger: true, target: 'legal-compliance', reason: 'LEGAL_DOMAIN' };
    }
  }

  // Emotional escalation - may need different agent
  if (emotional_state === 'PANICKED' && currentTeam !== 'crisis-management') {
    return { trigger: true, target: 'crisis-management', reason: 'EMOTIONAL_ESCALATION' };
  }

  return { trigger: false, target: currentTeam, reason: 'NO_HANDOFF_NEEDED' };
}

// ═══════════════════════════════════════════════════════════════════════════
// EMOTION-AWARE TONE ADAPTER
// ═══════════════════════════════════════════════════════════════════════════
export interface ToneRecommendation {
  recommended_tone: string;
  verbosity_level: 'low' | 'medium' | 'high';
  pacing: 'slow' | 'normal' | 'fast';
  language_style: string;
  do_not_use: string[];
}

/**
 * Get tone recommendation based on emotional state and urgency
 */
export function getToneRecommendation(
  emotional_state: EmotionalState,
  urgency_level: UrgencyLevel
): ToneRecommendation {
  const recommendations: Record<EmotionalState, ToneRecommendation> = {
    CALM: {
      recommended_tone: 'Professional, warm, helpful',
      verbosity_level: 'medium',
      pacing: 'normal',
      language_style: 'Neutral, confident, standard verbosity',
      do_not_use: ['urgent', 'immediately', 'critical'],
    },
    CONFUSED: {
      recommended_tone: 'Clear, step-by-step, educational',
      verbosity_level: 'high',
      pacing: 'slow',
      language_style: 'Structured, bullet points, reassuring clarity',
      do_not_use: ['technical jargon', 'abbreviations', 'complex terms'],
    },
    FRUSTRATED: {
      recommended_tone: 'Empathetic, solution-focused, acknowledging',
      verbosity_level: 'low',
      pacing: 'normal',
      language_style: 'Direct, acknowledge frustration, avoid technical language',
      do_not_use: ['unfortunately', 'policy', 'cannot', 'impossible'],
    },
    ANXIOUS: {
      recommended_tone: 'Reassuring, patient, thorough',
      verbosity_level: 'medium',
      pacing: 'slow',
      language_style: 'Emphasize control and next steps, calming',
      do_not_use: ['worry', 'concern', 'problem', 'issue', 'urgent'],
    },
    URGENT: {
      recommended_tone: 'Efficient, direct, prioritized',
      verbosity_level: 'low',
      pacing: 'fast',
      language_style: 'Action-oriented, no filler language, concise',
      do_not_use: ['maybe', 'perhaps', 'might', 'could potentially'],
    },
    PANICKED: {
      recommended_tone: 'Calm, decisive, action-oriented',
      verbosity_level: 'low',
      pacing: 'fast',
      language_style: 'Short sentences, immediate reassurance, one step at a time',
      do_not_use: ['panic', 'emergency', 'disaster', 'worst case'],
    },
  };

  const base = recommendations[emotional_state];

  // Override for CRITICAL urgency
  if (urgency_level === 'CRITICAL') {
    return {
      ...base,
      recommended_tone: 'Calm, decisive, immediate action',
      verbosity_level: 'low',
      pacing: 'fast',
    };
  }

  return base;
}

// ═══════════════════════════════════════════════════════════════════════════
// QA & HALLUCINATION GUARDRAIL
// ═══════════════════════════════════════════════════════════════════════════
export interface ValidationResult {
  valid: boolean;
  confidence: 'high' | 'medium' | 'low';
  risk_level: 'none' | 'low' | 'medium' | 'high';
  warnings: string[];
  blocked: boolean;
  safe_fallback?: string;
}

// High-risk domains requiring extra validation
const HIGH_RISK_DOMAINS = [
  'price', 'pricing', 'cost', 'fee', 'charge',
  'refund', 'cancel', 'policy',
  'visa', 'passport', 'entry',
  'legal', 'rights', 'compensation',
  'insurance', 'coverage', 'claim',
];

// Patterns that suggest hallucination risk
const HALLUCINATION_PATTERNS = [
  /\$\d+(?:\.\d{2})?/, // Specific prices
  /\d+%\s*(?:discount|off|refund)/, // Specific percentages
  /guaranteed|definitely|certainly|always|never/, // Absolutes
  /policy states|according to policy/, // Policy claims
];

/**
 * Validate response before sending to user
 */
export function validateResponse(
  response: string,
  domain: string,
  hasVerifiedData: boolean = false
): ValidationResult {
  const warnings: string[] = [];
  let riskLevel: ValidationResult['risk_level'] = 'none';
  let confidence: ValidationResult['confidence'] = 'high';

  // Check for high-risk domain keywords
  const isHighRiskDomain = HIGH_RISK_DOMAINS.some(keyword =>
    domain.toLowerCase().includes(keyword) ||
    response.toLowerCase().includes(keyword)
  );

  if (isHighRiskDomain && !hasVerifiedData) {
    riskLevel = 'medium';
    confidence = 'medium';
    warnings.push('High-risk domain detected without verified data');
  }

  // Check for hallucination patterns
  for (const pattern of HALLUCINATION_PATTERNS) {
    if (pattern.test(response) && !hasVerifiedData) {
      riskLevel = 'high';
      confidence = 'low';
      warnings.push(`Potential hallucination: ${pattern.source}`);
    }
  }

  // Check for absolute statements
  if (/\b(guaranteed|definitely|certainly|always|never)\b/i.test(response)) {
    if (!hasVerifiedData) {
      warnings.push('Absolute statement without verification');
      confidence = 'low';
    }
  }

  // Determine if blocked
  const blocked = riskLevel === 'high' && !hasVerifiedData;

  return {
    valid: !blocked,
    confidence,
    risk_level: riskLevel,
    warnings,
    blocked,
    safe_fallback: blocked
      ? "I want to double-check this information before confirming. Let me verify the most accurate details for you."
      : undefined,
  };
}

/**
 * Get safe fallback response for uncertain information
 */
export function getSafeFallback(domain: string): string {
  const fallbacks: Record<string, string> = {
    pricing: "Pricing varies and I want to give you accurate figures. Let me check the current rates.",
    refund: "Refund policies can vary. Let me verify the specific terms for your booking.",
    visa: "Visa requirements depend on your nationality and destination. Let me confirm the exact requirements.",
    legal: "This involves specific regulations. Let me connect you with our legal specialist for accurate guidance.",
    insurance: "Coverage details vary by policy. Let me verify what's included in your plan.",
    default: "I want to make sure I give you accurate information. Let me verify this for you.",
  };

  for (const [key, fallback] of Object.entries(fallbacks)) {
    if (domain.toLowerCase().includes(key)) {
      return fallback;
    }
  }

  return fallbacks.default;
}

/**
 * Log QA incident (for monitoring)
 */
export function logQAIncident(
  type: 'hallucination_prevented' | 'confidence_downgraded' | 'clarification_requested' | 'escalation_triggered',
  details: {
    domain: string;
    original_response?: string;
    fallback_used?: string;
    escalated_to?: TeamType;
  }
): void {
  // In production, this would log to monitoring system
  console.log(`[QA Guardrail] ${type}:`, details.domain);
}

// ═══════════════════════════════════════════════════════════════════════════
// HANDOFF COMPLIANCE VALIDATION
// ═══════════════════════════════════════════════════════════════════════════

const FORBIDDEN_HANDOFF_PATTERNS = [
  /how can i help/i,
  /what can i assist/i,
  /how may i assist/i,
];

/**
 * Validate handoff message against compliance rules
 * CRITICAL: Ensures forbidden openers don't bypass during handoff
 */
export function validateHandoffMessage(
  message: string,
  languageLocked: string
): { valid: boolean; corrected: string } {
  let corrected = message;
  let valid = true;

  // Check forbidden openers
  for (const pattern of FORBIDDEN_HANDOFF_PATTERNS) {
    if (pattern.test(message)) {
      valid = false;
      // Replace with context-aware greeting based on language
      const contextOpeners: Record<string, string> = {
        en: "I'm here to assist with your travel plans.",
        pt: 'Estou aqui para ajudar com seus planos de viagem.',
        es: 'Estoy aquí para ayudar con sus planes de viaje.',
      };
      corrected = message.replace(pattern, contextOpeners[languageLocked] || contextOpeners.en);
      break;
    }
  }

  return { valid, corrected };
}

// ═══════════════════════════════════════════════════════════════════════════
// HANDOFF COMPLIANCE MIDDLEWARE - MUST RUN AFTER EVERY HANDOFF
// ═══════════════════════════════════════════════════════════════════════════

export interface HandoffComplianceState {
  languageLocked: string;
  conversationStage: string;
  stageCollectedData: Record<string, unknown>;
  emotionalState: string;
  userConsents: { searchPermission: boolean; bookingPermission: boolean };
}

// Session store for compliance state persistence
const complianceStateStore = new Map<string, HandoffComplianceState>();

/**
 * CRITICAL: Re-apply compliance after handoff
 * Call this AFTER every agent transfer to ensure state persists
 */
export function reapplyComplianceAfterHandoff(
  sessionId: string,
  handoffPackage: HandoffContextPackage
): HandoffComplianceState {
  const state: HandoffComplianceState = {
    languageLocked: handoffPackage.languageLocked,
    conversationStage: handoffPackage.conversationStage,
    stageCollectedData: handoffPackage.stageCollectedData,
    emotionalState: handoffPackage.emotional_state,
    userConsents: handoffPackage.userConsents,
  };

  // Store for this session
  complianceStateStore.set(sessionId, state);

  console.log(`[HANDOFF-COMPLIANCE] Re-applied for session ${sessionId}:`, {
    language: state.languageLocked,
    stage: state.conversationStage,
    emotion: state.emotionalState,
  });

  return state;
}

/**
 * Get persisted compliance state for session
 */
export function getComplianceState(sessionId: string): HandoffComplianceState | null {
  return complianceStateStore.get(sessionId) || null;
}

/**
 * Validate agent response doesn't violate compliance
 * BLOCKS: Language changes, stage resets, generic greetings
 */
export function validateAgentComplianceAfterHandoff(
  sessionId: string,
  agentResponse: string,
  targetLanguage: string
): { valid: boolean; violations: string[]; correctedResponse: string } {
  const violations: string[] = [];
  let correctedResponse = agentResponse;
  const state = getComplianceState(sessionId);

  // Rule 1: Language lock - detect if agent switched language
  if (state && state.languageLocked !== targetLanguage) {
    violations.push(`LANGUAGE_SWITCH_BLOCKED: Tried to switch from ${state.languageLocked} to ${targetLanguage}`);
    // Force language back
    targetLanguage = state.languageLocked;
  }

  // Rule 2: Check for generic greetings after handoff
  const GENERIC_GREETING_PATTERNS = [
    /^(hi|hello|hey)[!,.]?\s*(how can i|what can i|how may i)/i,
    /^(olá|oi)[!,.]?\s*(como posso|em que posso)/i,
    /^(hola)[!,.]?\s*(cómo puedo|en qué puedo)/i,
    /welcome back.*how can/i,
    /good (morning|afternoon|evening).*how can/i,
  ];

  for (const pattern of GENERIC_GREETING_PATTERNS) {
    if (pattern.test(agentResponse)) {
      violations.push('GENERIC_GREETING_AFTER_HANDOFF');
      // Don't just flag - actually replace
      correctedResponse = correctedResponse.replace(pattern, '');
      break;
    }
  }

  // Rule 3: Prevent stage reset language
  const STAGE_RESET_PATTERNS = [
    /let'?s start from the beginning/i,
    /to get started/i,
    /first,?\s*let me ask/i,
    /vamos começar do início/i,
    /primero,?\s*déjame preguntar/i,
  ];

  if (state && state.conversationStage !== 'DISCOVERY') {
    for (const pattern of STAGE_RESET_PATTERNS) {
      if (pattern.test(agentResponse)) {
        violations.push(`STAGE_RESET_BLOCKED: Agent tried to reset from ${state.conversationStage}`);
        correctedResponse = correctedResponse.replace(pattern, '');
        break;
      }
    }
  }

  return {
    valid: violations.length === 0,
    violations,
    correctedResponse: correctedResponse.trim(),
  };
}

/**
 * Enforce language lock on response
 * If response is in wrong language, flag it
 */
export function enforceLanguageLock(
  sessionId: string,
  response: string
): { enforced: boolean; language: string } {
  const state = getComplianceState(sessionId);
  if (!state) {
    return { enforced: false, language: 'en' };
  }

  // Simple language detection heuristics
  const isPT = /\b(você|para|não|está|agora|obrigado|ajudar|viagem)\b/i.test(response);
  const isES = /\b(usted|para|está|ahora|gracias|ayudar|viaje)\b/i.test(response);
  const isEN = /\b(you|for|not|is|now|thank|help|travel|the|and)\b/i.test(response);

  let detectedLang = 'en';
  if (isPT && !isEN) detectedLang = 'pt';
  else if (isES && !isEN) detectedLang = 'es';

  const enforced = detectedLang !== state.languageLocked;

  if (enforced) {
    console.warn(`[HANDOFF-COMPLIANCE] Language mismatch! Expected: ${state.languageLocked}, Detected: ${detectedLang}`);
  }

  return { enforced, language: state.languageLocked };
}

/**
 * Clear compliance state for session (for testing)
 */
export function clearComplianceState(sessionId: string): void {
  complianceStateStore.delete(sessionId);
}

/**
 * Generate compliant handoff introduction with language enforcement
 */
export function generateCompliantHandoffIntro(
  consultant: ConsultantInfo,
  handoffPackage: HandoffContextPackage
): string {
  const lang = handoffPackage.languageLocked || 'en';
  const emotion = handoffPackage.emotional_state;

  // Emotion-aware greetings
  const greetings: Record<string, Record<string, string>> = {
    CALM: {
      en: `Hello! I'm ${consultant.name}, your ${consultant.title}. ${consultant.emoji}`,
      pt: `Olá! Sou ${consultant.name}, seu ${consultant.title}. ${consultant.emoji}`,
      es: `¡Hola! Soy ${consultant.name}, su ${consultant.title}. ${consultant.emoji}`,
    },
    FRUSTRATED: {
      en: `I understand this has been frustrating. I'm ${consultant.name}, and I'm here to help resolve this for you. ${consultant.emoji}`,
      pt: `Entendo que isso tem sido frustrante. Sou ${consultant.name}, e estou aqui para ajudar a resolver isso. ${consultant.emoji}`,
      es: `Entiendo que esto ha sido frustrante. Soy ${consultant.name}, y estoy aquí para ayudar a resolverlo. ${consultant.emoji}`,
    },
    URGENT: {
      en: `I'm ${consultant.name}, let me help you right away. ${consultant.emoji}`,
      pt: `Sou ${consultant.name}, deixe-me ajudá-lo imediatamente. ${consultant.emoji}`,
      es: `Soy ${consultant.name}, permítame ayudarle de inmediato. ${consultant.emoji}`,
    },
    PANICKED: {
      en: `Stay calm, I'm ${consultant.name}. I'm taking over and will help you immediately. ${consultant.emoji}`,
      pt: `Fique calmo, sou ${consultant.name}. Estou assumindo e vou ajudá-lo imediatamente. ${consultant.emoji}`,
      es: `Mantenga la calma, soy ${consultant.name}. Estoy tomando el control y le ayudaré de inmediato. ${consultant.emoji}`,
    },
  };

  const greeting = greetings[emotion]?.[lang] || greetings.CALM[lang] || greetings.CALM.en;

  // Context acknowledgment (using persisted data)
  const data = handoffPackage.stageCollectedData;
  let contextAck = '';

  if (data.destination) {
    const ackTemplates: Record<string, string> = {
      en: `I see you're interested in ${data.destination}.`,
      pt: `Vejo que você está interessado em ${data.destination}.`,
      es: `Veo que está interesado en ${data.destination}.`,
    };
    contextAck = ' ' + (ackTemplates[lang] || ackTemplates.en);
  }

  return greeting + contextAck;
}
