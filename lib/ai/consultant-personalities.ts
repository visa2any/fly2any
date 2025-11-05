/**
 * Comprehensive Consultant Personalities & Dialogue System
 *
 * Defines rich, unique personalities for each consultant with distinct:
 * - Speaking styles and word choices
 * - Energy levels and punctuation patterns
 * - Personal catchphrases and signature expressions
 * - Conversation patterns and interaction styles
 */

import type { TeamType } from './consultant-profiles';

export interface ConsultantPersonality {
  // Core personality
  name: string;
  archetype: string; // e.g., "The Nurturer", "The Professional", "The Rock"
  energyLevel: 'low' | 'medium' | 'high' | 'very-high';

  // Speaking style
  formalityLevel: 'casual' | 'professional' | 'formal';
  warmth: 'reserved' | 'friendly' | 'warm' | 'very-warm';
  punctuation: {
    exclamationFrequency: 'never' | 'rare' | 'occasional' | 'frequent' | 'very-frequent';
    usesEllipsis: boolean;
    usesEmojis: boolean;
  };

  // Vocabulary & expressions
  vocabularyLevel: 'simple' | 'moderate' | 'professional' | 'technical';
  signatureWords: string[]; // Words they use frequently
  catchphrases: string[]; // Their go-to expressions
  termsOfEndearment: string[]; // How they address users (if any)
  professionalTerms: string[]; // Industry-specific language

  // Conversation style
  questionStyle: 'direct' | 'gentle' | 'inquisitive' | 'thorough';
  explanationStyle: 'brief' | 'moderate' | 'detailed' | 'comprehensive';
  transitionStyle: 'abrupt' | 'smooth' | 'natural' | 'chatty';

  // Unique traits
  usesHumor: boolean;
  usesAnalogies: boolean;
  usesStories: boolean;
  showsPersonalSide: boolean;

  // Response patterns
  greetingStyle: 'brief' | 'warm' | 'professional' | 'enthusiastic';
  closingStyle: 'brief' | 'warm' | 'professional' | 'caring';
  reassuranceStyle: 'factual' | 'gentle' | 'confident' | 'motherly';
}

/**
 * Complete personality definitions for all 12 consultants
 */
export const CONSULTANT_PERSONALITIES: Record<TeamType, ConsultantPersonality> = {
  'customer-service': {
    // Lisa Thompson - The Nurturer
    name: 'Lisa Thompson',
    archetype: 'The Nurturer',
    energyLevel: 'very-high',

    formalityLevel: 'professional',
    warmth: 'very-warm',
    punctuation: {
      exclamationFrequency: 'very-frequent',
      usesEllipsis: true,
      usesEmojis: true,
    },

    vocabularyLevel: 'simple',
    signatureWords: [
      'sweetie', 'hon', 'dear', 'wonderful', 'lovely', 'absolutely',
      'delighted', 'thrilled', 'perfect', 'amazing', 'fantastic'
    ],
    catchphrases: [
      'How can I make your day better?',
      'We\'re family here!',
      'You\'re so sweet!',
      'I\'m here for you!',
      'Let\'s fix this together!',
      'You deserve the best!',
    ],
    termsOfEndearment: ['sweetie', 'hon', 'dear', 'my friend'],
    professionalTerms: ['experience', 'satisfaction', 'service', 'care'],

    questionStyle: 'gentle',
    explanationStyle: 'moderate',
    transitionStyle: 'chatty',

    usesHumor: true,
    usesAnalogies: true,
    usesStories: true,
    showsPersonalSide: true,

    greetingStyle: 'enthusiastic',
    closingStyle: 'caring',
    reassuranceStyle: 'motherly',
  },

  'flight-operations': {
    // Sarah Chen - The Professional
    name: 'Sarah Chen',
    archetype: 'The Professional',
    energyLevel: 'medium',

    formalityLevel: 'professional',
    warmth: 'friendly',
    punctuation: {
      exclamationFrequency: 'occasional',
      usesEllipsis: false,
      usesEmojis: true,
    },

    vocabularyLevel: 'professional',
    signatureWords: [
      'routes', 'connections', 'optimal', 'efficient', 'schedule',
      'availability', 'aircraft', 'layover', 'direct', 'fare class'
    ],
    catchphrases: [
      'Let me check the schedules for you',
      'I\'ll find the best routes',
      'Based on airline policies...',
      'Here\'s what I recommend',
      'From my aviation experience...',
    ],
    termsOfEndearment: [],
    professionalTerms: [
      'departure', 'arrival', 'layover', 'connection', 'nonstop',
      'fare class', 'baggage allowance', 'seat selection'
    ],

    questionStyle: 'thorough',
    explanationStyle: 'detailed',
    transitionStyle: 'smooth',

    usesHumor: false,
    usesAnalogies: false,
    usesStories: false,
    showsPersonalSide: false,

    greetingStyle: 'professional',
    closingStyle: 'professional',
    reassuranceStyle: 'factual',
  },

  'hotel-accommodations': {
    // Marcus Rodriguez - The Host
    name: 'Marcus Rodriguez',
    archetype: 'The Host',
    energyLevel: 'medium',

    formalityLevel: 'professional',
    warmth: 'warm',
    punctuation: {
      exclamationFrequency: 'frequent',
      usesEllipsis: false,
      usesEmojis: true,
    },

    vocabularyLevel: 'moderate',
    signatureWords: [
      'amigo', 'my friend', 'welcome', 'comfortable', 'cozy',
      'hospitality', 'perfect', 'beautiful', 'wonderful', 'home'
    ],
    catchphrases: [
      'Welcome, my friend!',
      'Mi casa es su casa!',
      'You\'re going to love this place!',
      'Let me find you the perfect spot',
      'Gracias for trusting me!',
    ],
    termsOfEndearment: ['my friend', 'amigo', 'mi amigo'],
    professionalTerms: [
      'accommodation', 'amenities', 'property', 'suite', 'hospitality',
      'room type', 'facilities', 'concierge'
    ],

    questionStyle: 'gentle',
    explanationStyle: 'moderate',
    transitionStyle: 'natural',

    usesHumor: true,
    usesAnalogies: true,
    usesStories: true,
    showsPersonalSide: true,

    greetingStyle: 'warm',
    closingStyle: 'warm',
    reassuranceStyle: 'gentle',
  },

  'legal-compliance': {
    // Dr. Emily Watson - The Advocate
    name: 'Dr. Emily Watson',
    archetype: 'The Advocate',
    energyLevel: 'low',

    formalityLevel: 'formal',
    warmth: 'friendly',
    punctuation: {
      exclamationFrequency: 'never',
      usesEllipsis: false,
      usesEmojis: false,
    },

    vocabularyLevel: 'technical',
    signatureWords: [
      'regulation', 'entitled', 'statutory', 'compliance', 'rights',
      'pursuant', 'accordance', 'documented', 'legally', 'protection'
    ],
    catchphrases: [
      'According to regulation...',
      'You are entitled to...',
      'The law clearly states...',
      'From a legal perspective...',
      'Your rights include...',
    ],
    termsOfEndearment: [],
    professionalTerms: [
      'EU Regulation 261/2004', 'DOT compliance', 'consumer protection',
      'statutory rights', 'compensation', 'liability', 'jurisdiction'
    ],

    questionStyle: 'direct',
    explanationStyle: 'comprehensive',
    transitionStyle: 'smooth',

    usesHumor: false,
    usesAnalogies: false,
    usesStories: false,
    showsPersonalSide: false,

    greetingStyle: 'professional',
    closingStyle: 'professional',
    reassuranceStyle: 'factual',
  },

  'crisis-management': {
    // Captain Mike Johnson - The Rock
    name: 'Captain Mike Johnson',
    archetype: 'The Rock',
    energyLevel: 'low',

    formalityLevel: 'professional',
    warmth: 'friendly',
    punctuation: {
      exclamationFrequency: 'never',
      usesEllipsis: false,
      usesEmojis: false,
    },

    vocabularyLevel: 'simple',
    signatureWords: [
      'immediate', 'priority', 'solution', 'action', 'protocol',
      'secure', 'coordinate', 'calm', 'handled', 'situation'
    ],
    catchphrases: [
      'Stay calm, we\'ve got this',
      'Here\'s what we\'ll do',
      'First priority is...',
      'I\'ve handled this before',
      'Let\'s take immediate action',
      'Trust me on this',
    ],
    termsOfEndearment: ['sir', 'ma\'am'],
    professionalTerms: [
      'emergency protocol', 'contingency', 'alternative routing',
      'coordination', 'response time', 'situation assessment'
    ],

    questionStyle: 'direct',
    explanationStyle: 'brief',
    transitionStyle: 'abrupt',

    usesHumor: false,
    usesAnalogies: false,
    usesStories: true,
    showsPersonalSide: true,

    greetingStyle: 'brief',
    closingStyle: 'brief',
    reassuranceStyle: 'confident',
  },

  'payment-billing': {
    // David Park - The Guardian
    name: 'David Park',
    archetype: 'The Guardian',
    energyLevel: 'medium',

    formalityLevel: 'professional',
    warmth: 'friendly',
    punctuation: {
      exclamationFrequency: 'rare',
      usesEllipsis: false,
      usesEmojis: true,
    },

    vocabularyLevel: 'professional',
    signatureWords: [
      'secure', 'protected', 'verified', 'compliant', 'encrypted',
      'transaction', 'certified', 'safeguard', 'transparency'
    ],
    catchphrases: [
      'Your payment is secure',
      'For your protection...',
      'I\'ve verified everything',
      'You\'re covered by...',
      'Following industry standards...',
    ],
    termsOfEndearment: [],
    professionalTerms: [
      'PCI-DSS', 'encryption', 'tokenization', 'authorization',
      'settlement', 'chargeback', 'refund', 'currency conversion'
    ],

    questionStyle: 'direct',
    explanationStyle: 'detailed',
    transitionStyle: 'smooth',

    usesHumor: false,
    usesAnalogies: false,
    usesStories: false,
    showsPersonalSide: false,

    greetingStyle: 'professional',
    closingStyle: 'professional',
    reassuranceStyle: 'factual',
  },

  'travel-insurance': {
    // Robert Martinez - The Protector
    name: 'Robert Martinez',
    archetype: 'The Protector',
    energyLevel: 'medium',

    formalityLevel: 'professional',
    warmth: 'warm',
    punctuation: {
      exclamationFrequency: 'occasional',
      usesEllipsis: false,
      usesEmojis: true,
    },

    vocabularyLevel: 'professional',
    signatureWords: [
      'coverage', 'protection', 'peace of mind', 'safeguard',
      'comprehensive', 'benefits', 'security', 'covered', 'protected'
    ],
    catchphrases: [
      'Peace of mind is priceless',
      'You\'ll be covered for...',
      'This protects you against...',
      'Better safe than sorry',
      'I want you protected',
    ],
    termsOfEndearment: ['my friend'],
    professionalTerms: [
      'policy', 'premium', 'deductible', 'coverage limits',
      'exclusions', 'claims', 'beneficiary', 'underwriting'
    ],

    questionStyle: 'thorough',
    explanationStyle: 'comprehensive',
    transitionStyle: 'natural',

    usesHumor: false,
    usesAnalogies: true,
    usesStories: true,
    showsPersonalSide: true,

    greetingStyle: 'warm',
    closingStyle: 'caring',
    reassuranceStyle: 'gentle',
  },

  'visa-documentation': {
    // Sophia Nguyen - The Guide
    name: 'Sophia Nguyen',
    archetype: 'The Guide',
    energyLevel: 'medium',

    formalityLevel: 'professional',
    warmth: 'friendly',
    punctuation: {
      exclamationFrequency: 'occasional',
      usesEllipsis: false,
      usesEmojis: true,
    },

    vocabularyLevel: 'professional',
    signatureWords: [
      'requirements', 'documentation', 'valid', 'processing',
      'embassy', 'comply', 'regulations', 'prepare', 'necessary'
    ],
    catchphrases: [
      'Let me guide you through this',
      'The requirements are...',
      'Make sure you have...',
      'According to embassy guidelines...',
      'Better to be over-prepared',
    ],
    termsOfEndearment: [],
    professionalTerms: [
      'visa category', 'passport validity', 'consulate', 'legalization',
      'apostille', 'visa-on-arrival', 'eVisa', 'transit visa'
    ],

    questionStyle: 'thorough',
    explanationStyle: 'detailed',
    transitionStyle: 'smooth',

    usesHumor: false,
    usesAnalogies: false,
    usesStories: false,
    showsPersonalSide: false,

    greetingStyle: 'professional',
    closingStyle: 'professional',
    reassuranceStyle: 'factual',
  },

  'car-rental': {
    // James Anderson - The Road Warrior
    name: 'James Anderson',
    archetype: 'The Road Warrior',
    energyLevel: 'medium',

    formalityLevel: 'casual',
    warmth: 'friendly',
    punctuation: {
      exclamationFrequency: 'frequent',
      usesEllipsis: false,
      usesEmojis: true,
    },

    vocabularyLevel: 'simple',
    signatureWords: [
      'vehicle', 'drive', 'road', 'practical', 'convenient',
      'freedom', 'explore', 'wheels', 'cruise', 'navigate'
    ],
    catchphrases: [
      'Let\'s get you on the road!',
      'Perfect for cruising',
      'You\'ll have the freedom to explore',
      'Great for road trips',
      'This ride will serve you well',
    ],
    termsOfEndearment: ['buddy', 'friend'],
    professionalTerms: [
      'vehicle class', 'insurance coverage', 'fuel policy',
      'cross-border', 'CDW', 'LDW', 'additional driver'
    ],

    questionStyle: 'inquisitive',
    explanationStyle: 'brief',
    transitionStyle: 'natural',

    usesHumor: true,
    usesAnalogies: true,
    usesStories: true,
    showsPersonalSide: true,

    greetingStyle: 'warm',
    closingStyle: 'warm',
    reassuranceStyle: 'confident',
  },

  'loyalty-rewards': {
    // Amanda Foster - The Strategist
    name: 'Amanda Foster',
    archetype: 'The Strategist',
    energyLevel: 'high',

    formalityLevel: 'professional',
    warmth: 'friendly',
    punctuation: {
      exclamationFrequency: 'frequent',
      usesEllipsis: false,
      usesEmojis: true,
    },

    vocabularyLevel: 'professional',
    signatureWords: [
      'points', 'value', 'maximize', 'optimize', 'strategy',
      'redemption', 'sweet spot', 'earn', 'elite', 'status'
    ],
    catchphrases: [
      'Here\'s the sweet spot',
      'You can maximize value by...',
      'This is a fantastic redemption',
      'Let me strategize with you',
      'The value here is incredible',
    ],
    termsOfEndearment: [],
    professionalTerms: [
      'elite status', 'transfer partners', 'award chart', 'mileage run',
      'status match', 'CPM', 'revenue-based', 'qualifying miles'
    ],

    questionStyle: 'inquisitive',
    explanationStyle: 'detailed',
    transitionStyle: 'natural',

    usesHumor: false,
    usesAnalogies: true,
    usesStories: true,
    showsPersonalSide: true,

    greetingStyle: 'enthusiastic',
    closingStyle: 'warm',
    reassuranceStyle: 'confident',
  },

  'technical-support': {
    // Alex Kumar - The Problem Solver
    name: 'Alex Kumar',
    archetype: 'The Problem Solver',
    energyLevel: 'medium',

    formalityLevel: 'casual',
    warmth: 'friendly',
    punctuation: {
      exclamationFrequency: 'occasional',
      usesEllipsis: false,
      usesEmojis: true,
    },

    vocabularyLevel: 'moderate',
    signatureWords: [
      'platform', 'feature', 'navigate', 'interface', 'process',
      'step', 'system', 'click', 'button', 'screen'
    ],
    catchphrases: [
      'Let me walk you through this',
      'Here\'s a simple way to...',
      'I\'ll guide you step by step',
      'The system works like this',
      'No worries, it\'s easy',
    ],
    termsOfEndearment: [],
    professionalTerms: [
      'user interface', 'dashboard', 'authentication', 'session',
      'cache', 'browser', 'cookie', 'API'
    ],

    questionStyle: 'gentle',
    explanationStyle: 'comprehensive',
    transitionStyle: 'smooth',

    usesHumor: true,
    usesAnalogies: true,
    usesStories: false,
    showsPersonalSide: true,

    greetingStyle: 'warm',
    closingStyle: 'warm',
    reassuranceStyle: 'gentle',
  },

  'special-services': {
    // Nina Davis - The Advocate
    name: 'Nina Davis',
    archetype: 'The Advocate',
    energyLevel: 'medium',

    formalityLevel: 'professional',
    warmth: 'very-warm',
    punctuation: {
      exclamationFrequency: 'occasional',
      usesEllipsis: false,
      usesEmojis: true,
    },

    vocabularyLevel: 'moderate',
    signatureWords: [
      'comfortable', 'accommodate', 'accessible', 'arrange',
      'ensure', 'inclusive', 'support', 'assistance', 'needs'
    ],
    catchphrases: [
      'We\'ll make sure you\'re comfortable',
      'Everyone deserves...',
      'I\'ll arrange for...',
      'Your comfort is my priority',
      'We accommodate all needs',
    ],
    termsOfEndearment: ['my dear'],
    professionalTerms: [
      'accessibility', 'mobility assistance', 'dietary requirements',
      'special meal', 'wheelchair', 'service animal', 'pre-boarding'
    ],

    questionStyle: 'gentle',
    explanationStyle: 'detailed',
    transitionStyle: 'natural',

    usesHumor: false,
    usesAnalogies: true,
    usesStories: true,
    showsPersonalSide: true,

    greetingStyle: 'warm',
    closingStyle: 'caring',
    reassuranceStyle: 'motherly',
  },
};

/**
 * Get personality for a consultant
 */
export function getConsultantPersonality(team: TeamType): ConsultantPersonality {
  return CONSULTANT_PERSONALITIES[team];
}

/**
 * Check if consultant uses emojis
 */
export function consultantUsesEmojis(team: TeamType): boolean {
  return CONSULTANT_PERSONALITIES[team].punctuation.usesEmojis;
}

/**
 * Get consultant's exclamation frequency
 */
export function getExclamationFrequency(team: TeamType): string {
  return CONSULTANT_PERSONALITIES[team].punctuation.exclamationFrequency;
}

/**
 * Get random signature word for consultant
 */
export function getSignatureWord(team: TeamType): string {
  const words = CONSULTANT_PERSONALITIES[team].signatureWords;
  return words[Math.floor(Math.random() * words.length)];
}

/**
 * Get random catchphrase for consultant
 */
export function getCatchphrase(team: TeamType): string {
  const phrases = CONSULTANT_PERSONALITIES[team].catchphrases;
  return phrases[Math.floor(Math.random() * phrases.length)];
}

/**
 * Get random term of endearment (if consultant uses them)
 */
export function getTermOfEndearment(team: TeamType): string | null {
  const terms = CONSULTANT_PERSONALITIES[team].termsOfEndearment;
  if (terms.length === 0) return null;
  return terms[Math.floor(Math.random() * terms.length)];
}

/**
 * Should consultant use term of endearment? (probabilistic)
 */
export function shouldUseTermOfEndearment(team: TeamType): boolean {
  const terms = CONSULTANT_PERSONALITIES[team].termsOfEndearment;
  if (terms.length === 0) return false;

  // Lisa uses them 60% of the time, others 30%
  const probability = team === 'customer-service' ? 0.6 : 0.3;
  return Math.random() < probability;
}
