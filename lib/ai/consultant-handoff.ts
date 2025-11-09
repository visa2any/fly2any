/**
 * Consultant Handoff System
 * Manages professional transfers between travel agents
 */

import { formatDateSafe } from '@/lib/utils/date-parsing';

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
  | 'emergency-response';

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
    'emergency-response': {
      team: 'emergency-response',
      name: 'Captain Mike Johnson',
      title: 'Emergency Response Coordinator',
      emoji: '🚨'
    }
  };

  return consultants[team];
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
 * Format date for display
 */
function formatDate(dateString: string): string {
  return formatDateSafe(dateString);
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
