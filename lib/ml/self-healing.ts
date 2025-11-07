/**
 * Layer 3: Self-Healing System
 *
 * Automatically fixes errors detected by Layer 2
 * Implements prompt refinement, consultant switching, and clarification loops
 */

import type { DetectedError } from './error-detection';
import type { TravelIntent } from './intent-classification';
import type { ConversationTelemetry } from './conversation-telemetry';
import { classifyIntent } from './intent-classification';
import { detectLanguage } from '@/lib/ai/language-detection';

export interface HealingAction {
  type: 'prompt_refinement' | 'consultant_switch' | 'clarification_loop' | 'language_switch' | 'human_escalation';
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  implementation: {
    newPrompt?: string;
    newConsultant?: string;
    clarificationQuestion?: string;
    newLanguage?: 'en' | 'es' | 'pt';
    escalationReason?: string;
  };
  expectedImpact: {
    fixesProbability: number; // 0-1
    userSatisfactionIncrease: number; // 0-1
    timeToResolve: number; // seconds
  };
}

export interface HealingResult {
  success: boolean;
  actions: HealingAction[];
  originalError: DetectedError;
  appliedFix: HealingAction | null;
  fallbackToHuman: boolean;
  reasoning: string;
}

/**
 * Main self-healing function
 * Analyzes error and generates automatic fix
 */
export function healError(
  error: DetectedError,
  conversationContext: ConversationTelemetry
): HealingResult {
  // Check if error is auto-fixable
  if (!error.autoFixable) {
    return {
      success: false,
      actions: [],
      originalError: error,
      appliedFix: null,
      fallbackToHuman: true,
      reasoning: `Error type '${error.type}' requires human review (not auto-fixable)`,
    };
  }

  // Generate healing actions based on error type
  const actions = generateHealingActions(error, conversationContext);

  // Select best action
  const bestAction = selectBestAction(actions, error.severity);

  return {
    success: true,
    actions,
    originalError: error,
    appliedFix: bestAction,
    fallbackToHuman: false,
    reasoning: bestAction.description,
  };
}

/**
 * Generate healing actions for different error types
 */
function generateHealingActions(
  error: DetectedError,
  context: ConversationTelemetry
): HealingAction[] {
  const actions: HealingAction[] = [];

  switch (error.type) {
    case 'language-mismatch':
      actions.push(...healLanguageMismatch(error, context));
      break;

    case 'intent-misunderstanding':
      actions.push(...healIntentMisunderstanding(error, context));
      break;

    case 'parsing-failure':
      actions.push(...healParsingFailure(error, context));
      break;

    case 'low-confidence':
      actions.push(...healLowConfidence(error, context));
      break;

    case 'user-frustration':
      actions.push(...healUserFrustration(error, context));
      break;

    case 'timeout':
      actions.push(...healTimeout(error, context));
      break;

    case 'out-of-scope':
      actions.push(...healOutOfScope(error, context));
      break;

    case 'abandonment':
      actions.push(...healAbandonment(error, context));
      break;

    default:
      // Generic fallback
      actions.push(createHumanEscalationAction(error, 'No automatic fix available'));
  }

  return actions;
}

/**
 * Heal language mismatch - switch to user's language
 */
function healLanguageMismatch(
  error: DetectedError,
  context: ConversationTelemetry
): HealingAction[] {
  const userLanguage = context.userLanguage || detectLanguage(context.userMessage).language;

  const translations = {
    en: {
      greeting: "I apologize! Let me help you in English.",
      continue: "How can I assist you today?"
    },
    es: {
      greeting: "¡Disculpa! Permíteme ayudarte en español.",
      continue: "¿En qué puedo asistirte hoy?"
    },
    pt: {
      greeting: "Desculpe! Deixe-me ajudá-lo em português.",
      continue: "Como posso ajudá-lo hoje?"
    }
  };

  const translation = translations[userLanguage] || translations.en;

  return [{
    type: 'language_switch',
    priority: 'critical',
    description: `Switch to ${userLanguage.toUpperCase()} to match user's language`,
    implementation: {
      newLanguage: userLanguage,
      newPrompt: `${translation.greeting}\n\n${translation.continue}\n\nUser's original message: "${context.userMessage}"`,
    },
    expectedImpact: {
      fixesProbability: 0.95, // Very high success rate
      userSatisfactionIncrease: 0.8, // Major satisfaction boost
      timeToResolve: 2, // Instant switch
    },
  }];
}

/**
 * Heal intent misunderstanding - switch consultant
 */
function healIntentMisunderstanding(
  error: DetectedError,
  context: ConversationTelemetry
): HealingAction[] {
  // Re-classify intent
  const intentResult = classifyIntent(context.userMessage);
  const correctConsultant = intentResult.recommendedConsultant;

  const consultantIntros = {
    'flight-operations': 'Flight Operations specialist',
    'hotel-accommodations': 'Hotel Accommodations specialist',
    'car-rentals': 'Car Rental specialist',
    'package-deals': 'Package Deals specialist',
    'visa-immigration': 'Visa & Immigration specialist',
    'travel-insurance': 'Travel Insurance specialist',
    'customer-support': 'Customer Support specialist',
    'cancellations-refunds': 'Cancellations & Refunds specialist',
  };

  const intro = consultantIntros[correctConsultant as keyof typeof consultantIntros] || 'specialist';

  return [{
    type: 'consultant_switch',
    priority: 'high',
    description: `Switch from ${context.agentConsultant} to ${correctConsultant}`,
    implementation: {
      newConsultant: correctConsultant,
      newPrompt: `I apologize for the confusion. Let me connect you with our ${intro} who can better assist you.\n\n[Transferring to ${correctConsultant}...]\n\nHello! I'm your ${intro}. I understand you need help with: "${context.userMessage}"\n\nLet me assist you right away.`,
    },
    expectedImpact: {
      fixesProbability: 0.85,
      userSatisfactionIncrease: 0.6,
      timeToResolve: 3,
    },
  }];
}

/**
 * Heal parsing failure - ask clarification question
 */
function healParsingFailure(
  error: DetectedError,
  context: ConversationTelemetry
): HealingAction[] {
  // Determine what failed to parse
  const clarifications = generateClarificationQuestion(error, context);

  return [{
    type: 'clarification_loop',
    priority: 'high',
    description: 'Ask clarifying question to gather missing information',
    implementation: {
      clarificationQuestion: clarifications.question,
      newPrompt: clarifications.fullPrompt,
    },
    expectedImpact: {
      fixesProbability: 0.75,
      userSatisfactionIncrease: 0.4,
      timeToResolve: 15, // User needs to respond
    },
  }];
}

/**
 * Generate clarification question based on parsing failure
 */
function generateClarificationQuestion(
  error: DetectedError,
  context: ConversationTelemetry
): { question: string; fullPrompt: string } {
  const message = context.userMessage.toLowerCase();

  // Detect what's missing
  const missingDate = !message.match(/\d{1,2}\/\d{1,2}|\d{4}-\d{2}-\d{2}|january|february|march|april|may|june|july|august|september|october|november|december|monday|tuesday|wednesday|thursday|friday|saturday|sunday|tomorrow|next week|next month/i);
  const missingLocation = !message.match(/to |from |in |at |flight to|hotel in|visit/i);
  const missingPassengers = !message.match(/\d+\s*(person|people|adult|child|passenger|traveler)/i);

  let question = "I'd like to help you with your travel plans. ";
  const language = context.userLanguage || 'en';

  if (language === 'es') {
    if (missingDate && missingLocation) {
      question = "Me gustaría ayudarte con tus planes de viaje. ¿Podrías decirme:\n\n1. ¿A dónde quieres viajar?\n2. ¿Qué fechas tienes en mente?";
    } else if (missingDate) {
      question = "Perfecto, entiendo que quieres viajar. ¿Qué fechas tienes en mente? (Por ejemplo: 'del 15 al 20 de diciembre' o 'próximo martes')";
    } else if (missingLocation) {
      question = "Entiendo las fechas. ¿A dónde te gustaría viajar?";
    } else if (missingPassengers) {
      question = "¿Para cuántas personas estás buscando? (adultos, niños)";
    } else {
      question = "¿Podrías darme más detalles sobre tu viaje?";
    }
  } else if (language === 'pt') {
    if (missingDate && missingLocation) {
      question = "Gostaria de ajudá-lo com seus planos de viagem. Você poderia me dizer:\n\n1. Para onde você quer viajar?\n2. Que datas você tem em mente?";
    } else if (missingDate) {
      question = "Perfeito, entendo que você quer viajar. Que datas você tem em mente? (Por exemplo: '15 a 20 de dezembro' ou 'próxima terça-feira')";
    } else if (missingLocation) {
      question = "Entendo as datas. Para onde você gostaria de viajar?";
    } else if (missingPassengers) {
      question = "Para quantas pessoas você está procurando? (adultos, crianças)";
    } else {
      question = "Você poderia me dar mais detalhes sobre sua viagem?";
    }
  } else {
    // English
    if (missingDate && missingLocation) {
      question += "Could you tell me:\n\n1. Where would you like to travel?\n2. What dates do you have in mind?";
    } else if (missingDate) {
      question = "I understand you'd like to travel. What dates do you have in mind? (For example: 'December 15-20' or 'next Tuesday')";
    } else if (missingLocation) {
      question = "I understand the dates. Where would you like to travel to?";
    } else if (missingPassengers) {
      question = "How many people are you booking for? (adults, children)";
    } else {
      question = "Could you provide a bit more detail about your travel plans?";
    }
  }

  const fullPrompt = `I want to make sure I have all the details correct to find you the best options.\n\n${question}`;

  return { question, fullPrompt };
}

/**
 * Heal low confidence - offer human help
 */
function healLowConfidence(
  error: DetectedError,
  context: ConversationTelemetry
): HealingAction[] {
  return [{
    type: 'human_escalation',
    priority: 'medium',
    description: 'Offer connection to human agent due to low confidence',
    implementation: {
      escalationReason: 'AI low confidence',
      newPrompt: `I want to make sure you get the best assistance possible. Your request is important to us, and I'd like to connect you with one of our travel specialists who can provide personalized help.\n\nWould you like me to:\n1. Connect you with a human agent now\n2. Continue with me and I'll do my best to help\n\nWhat would you prefer?`,
    },
    expectedImpact: {
      fixesProbability: 0.9, // Human will solve it
      userSatisfactionIncrease: 0.7, // Users appreciate the option
      timeToResolve: 60, // 1 minute for human connection
    },
  }];
}

/**
 * Heal user frustration - empathetic response
 */
function healUserFrustration(
  error: DetectedError,
  context: ConversationTelemetry
): HealingAction[] {
  const language = context.userLanguage || 'en';

  const responses = {
    en: "I sincerely apologize for any frustration. Your travel plans are important, and I want to make this right. Let me personally ensure we get you exactly what you need.\n\nWould you like me to:\n1. Start fresh with your request\n2. Connect you with a specialist\n3. Continue from where we left off\n\nI'm here to help.",
    es: "Pido sinceras disculpas por cualquier frustración. Tus planes de viaje son importantes, y quiero resolver esto correctamente. Déjame asegurarme personalmente de que obtengas exactamente lo que necesitas.\n\n¿Te gustaría que:\n1. Comience de nuevo con tu solicitud\n2. Te conecte con un especialista\n3. Continuemos desde donde lo dejamos\n\nEstoy aquí para ayudarte.",
    pt: "Peço sinceras desculpas por qualquer frustração. Seus planos de viagem são importantes e quero resolver isso corretamente. Deixe-me garantir pessoalmente que você obtenha exatamente o que precisa.\n\nVocê gostaria que eu:\n1. Comece novamente com seu pedido\n2. Conecte você com um especialista\n3. Continuemos de onde paramos\n\nEstou aqui para ajudá-lo."
  };

  return [{
    type: 'prompt_refinement',
    priority: 'high',
    description: 'Inject empathetic response to address user frustration',
    implementation: {
      newPrompt: responses[language],
    },
    expectedImpact: {
      fixesProbability: 0.7,
      userSatisfactionIncrease: 0.6,
      timeToResolve: 5,
    },
  }];
}

/**
 * Heal timeout - acknowledge delay
 */
function healTimeout(
  error: DetectedError,
  context: ConversationTelemetry
): HealingAction[] {
  return [{
    type: 'prompt_refinement',
    priority: 'medium',
    description: 'Acknowledge delay and provide interim response',
    implementation: {
      newPrompt: "I apologize for the delay. I'm searching through thousands of travel options to find you the best deals. This is taking a bit longer than expected, but I'm still working on it.\n\nI'll have results for you in just a moment. Thank you for your patience!",
    },
    expectedImpact: {
      fixesProbability: 0.6,
      userSatisfactionIncrease: 0.3,
      timeToResolve: 2,
    },
  }];
}

/**
 * Heal out-of-scope request
 */
function healOutOfScope(
  error: DetectedError,
  context: ConversationTelemetry
): HealingAction[] {
  return [{
    type: 'prompt_refinement',
    priority: 'medium',
    description: 'Politely explain scope and redirect',
    implementation: {
      newPrompt: `I appreciate your question! While I specialize in helping with flights, hotels, car rentals, and travel packages, that particular request is outside my area of expertise.\n\nHowever, I'm excellent at helping with:\n✈️ Flight bookings\n🏨 Hotel reservations\n🚗 Car rentals\n📦 Complete travel packages\n🛂 Visa information\n🛡️ Travel insurance\n\nIs there anything travel-related I can help you with today?`,
    },
    expectedImpact: {
      fixesProbability: 0.5,
      userSatisfactionIncrease: 0.2,
      timeToResolve: 3,
    },
  }];
}

/**
 * Heal abandonment - last-ditch effort
 */
function healAbandonment(
  error: DetectedError,
  context: ConversationTelemetry
): HealingAction[] {
  return [{
    type: 'prompt_refinement',
    priority: 'critical',
    description: 'Last chance retention offer',
    implementation: {
      newPrompt: "Before you go, I'd love to make this right! 🌟\n\nI can offer you:\n• A quick connection to a human specialist (30 seconds)\n• A direct callback at your convenience\n• A special discount code for your next booking\n\nYour satisfaction is important to us. What would help you most?",
    },
    expectedImpact: {
      fixesProbability: 0.4, // Lower success rate
      userSatisfactionIncrease: 0.5, // But significant if it works
      timeToResolve: 5,
    },
  }];
}

/**
 * Create human escalation action
 */
function createHumanEscalationAction(
  error: DetectedError,
  reason: string
): HealingAction {
  return {
    type: 'human_escalation',
    priority: error.severity === 'critical' ? 'critical' : 'high',
    description: `Escalate to human agent: ${reason}`,
    implementation: {
      escalationReason: reason,
      newPrompt: "I want to ensure you receive the best possible service. Let me connect you with one of our travel specialists who can provide personalized assistance.\n\nConnecting you now...",
    },
    expectedImpact: {
      fixesProbability: 0.95,
      userSatisfactionIncrease: 0.8,
      timeToResolve: 30,
    },
  };
}

/**
 * Select best healing action based on priority and expected impact
 */
function selectBestAction(
  actions: HealingAction[],
  errorSeverity: 'low' | 'medium' | 'high' | 'critical'
): HealingAction {
  if (actions.length === 0) {
    throw new Error('No healing actions available');
  }

  // Sort by priority and expected success
  const sorted = actions.sort((a, b) => {
    const priorityWeight = { critical: 4, high: 3, medium: 2, low: 1 };
    const aPriority = priorityWeight[a.priority];
    const bPriority = priorityWeight[b.priority];

    if (aPriority !== bPriority) {
      return bPriority - aPriority; // Higher priority first
    }

    // If same priority, sort by success probability
    return b.expectedImpact.fixesProbability - a.expectedImpact.fixesProbability;
  });

  return sorted[0];
}

/**
 * Batch heal multiple errors
 */
export function healMultipleErrors(
  errors: DetectedError[],
  context: ConversationTelemetry
): HealingResult[] {
  return errors.map(error => healError(error, context));
}

/**
 * Get healing statistics
 */
export interface HealingStatistics {
  totalHealed: number;
  successRate: number;
  byType: Record<string, { attempts: number; successes: number }>;
  averageTimeToResolve: number;
  humanEscalations: number;
}

export class SelfHealingService {
  private healingHistory: HealingResult[] = [];
  private maxHistory = 1000;

  recordHealing(result: HealingResult): void {
    this.healingHistory.push(result);

    // Trim history
    if (this.healingHistory.length > this.maxHistory) {
      this.healingHistory.shift();
    }
  }

  getStatistics(): HealingStatistics {
    const stats: HealingStatistics = {
      totalHealed: this.healingHistory.length,
      successRate: 0,
      byType: {},
      averageTimeToResolve: 0,
      humanEscalations: 0,
    };

    if (this.healingHistory.length === 0) {
      return stats;
    }

    // Calculate success rate
    const successes = this.healingHistory.filter(h => h.success).length;
    stats.successRate = successes / this.healingHistory.length;

    // Calculate by type
    this.healingHistory.forEach(result => {
      const type = result.originalError.type;
      if (!stats.byType[type]) {
        stats.byType[type] = { attempts: 0, successes: 0 };
      }
      stats.byType[type].attempts++;
      if (result.success) {
        stats.byType[type].successes++;
      }
    });

    // Calculate average time to resolve
    const totalTime = this.healingHistory.reduce((sum, h) => {
      return sum + (h.appliedFix?.expectedImpact.timeToResolve || 0);
    }, 0);
    stats.averageTimeToResolve = totalTime / this.healingHistory.length;

    // Count human escalations
    stats.humanEscalations = this.healingHistory.filter(
      h => h.fallbackToHuman || h.appliedFix?.type === 'human_escalation'
    ).length;

    return stats;
  }

  clearHistory(): void {
    this.healingHistory = [];
  }
}

// Singleton instance
let selfHealingService: SelfHealingService;

export function getSelfHealingService(): SelfHealingService {
  if (!selfHealingService) {
    selfHealingService = new SelfHealingService();
  }
  return selfHealingService;
}
