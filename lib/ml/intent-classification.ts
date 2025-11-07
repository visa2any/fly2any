/**
 * Intent Classification & User Goal Detection
 *
 * Understands what the user is trying to accomplish
 * Routes to correct consultant and validates response relevance
 */

import type { TeamType } from '../ai/consultant-profiles';

export type TravelIntent =
  | 'book_flight'
  | 'search_flight'
  | 'book_hotel'
  | 'search_hotel'
  | 'book_car'
  | 'book_package'
  | 'check_visa'
  | 'check_insurance'
  | 'modify_booking'
  | 'cancel_booking'
  | 'get_refund'
  | 'track_points'
  | 'ask_question'
  | 'report_issue'
  | 'get_help'
  | 'unknown';

export interface IntentClassificationResult {
  intent: TravelIntent;
  confidence: number; // 0-1
  recommendedConsultant: TeamType;
  extractedEntities: {
    serviceType?: 'flight' | 'hotel' | 'car' | 'package';
    action?: 'search' | 'book' | 'modify' | 'cancel';
    locations?: string[];
    dates?: string[];
    urgency?: 'low' | 'medium' | 'high';
  };
  alternateIntents: {
    intent: TravelIntent;
    confidence: number;
  }[];
}

/**
 * Intent patterns - keywords and phrases that indicate user goal
 */
const INTENT_PATTERNS: Record<TravelIntent, RegExp[]> = {
  book_flight: [
    /\b(book|reserve|purchase|buy|get)\s+.*?\b(flight|ticket|plane)\b/i,
    /\b(need|want)\s+.*?\b(fly|flying|flight)\b/i,
    /\bbook.*?to\b/i,
  ],
  search_flight: [
    /\b(find|search|look(ing)? for|show me)\s+.*?\b(flight|flights)\b/i,
    /\b(how much|price|cost)\s+.*?\b(flight|fly)\b/i,
    /\b(cheap|cheapest|best)\s+.*?\b(flight|flights)\b/i,
  ],
  book_hotel: [
    /\b(book|reserve|get)\s+.*?\b(hotel|room|accommodation)\b/i,
    /\b(need|want)\s+.*?\b(stay|place to stay|hotel)\b/i,
  ],
  search_hotel: [
    /\b(find|search|look(ing)? for|show me)\s+.*?\b(hotel|hotels|accommodation)\b/i,
    /\b(where to stay|place to stay)\b/i,
  ],
  book_car: [
    /\b(book|rent|get)\s+.*?\b(car|vehicle)\b/i,
    /\b(need|want)\s+.*?\b(rental|car rental)\b/i,
  ],
  book_package: [
    /\b(package|vacation package|trip package)\b/i,
    /\b(all-inclusive|everything)\b/i,
  ],
  check_visa: [
    /\b(visa|passport|entry requirements|travel documents?)\b/i,
    /\b(need|require)\s+.*?\b(visa|passport)\b/i,
  ],
  check_insurance: [
    /\b(insurance|travel insurance|coverage|protection)\b/i,
    /\b(cancel(l)?ation insurance)\b/i,
  ],
  modify_booking: [
    /\b(change|modify|update|reschedule)\s+.*?\b(booking|reservation|flight|hotel)\b/i,
    /\b(different date|another date)\b/i,
  ],
  cancel_booking: [
    /\b(cancel|cancel(l)?ation)\s+.*?\b(booking|reservation|flight|hotel)\b/i,
    /\b(don'?t want|no longer need)\b/i,
  ],
  get_refund: [
    /\b(refund|money back|reimburs(e|ement))\b/i,
    /\b(get my money|return|pay back)\b/i,
  ],
  track_points: [
    /\b(points|miles|rewards|loyalty)\b/i,
    /\b(how many points|check points)\b/i,
  ],
  ask_question: [
    /\b(question|wondering|curious|tell me about)\b/i,
    /\b(what|how|why|when|where)\s+(is|are|can|do|does)\b/i,
  ],
  report_issue: [
    /\b(problem|issue|error|wrong|broken|not working)\b/i,
    /\b(complaint|complain|unhappy)\b/i,
  ],
  get_help: [
    /\b(help|assist|support|confused|lost|stuck)\b/i,
    /\b(don'?t know|don'?t understand)\b/i,
  ],
  unknown: [],
};

/**
 * Map intents to recommended consultants
 */
const INTENT_TO_CONSULTANT: Record<TravelIntent, TeamType> = {
  book_flight: 'flight-operations',
  search_flight: 'flight-operations',
  book_hotel: 'hotel-accommodations',
  search_hotel: 'hotel-accommodations',
  book_car: 'car-rental',
  book_package: 'customer-service',
  check_visa: 'visa-documentation',
  check_insurance: 'travel-insurance',
  modify_booking: 'customer-service',
  cancel_booking: 'legal-compliance',
  get_refund: 'payment-billing',
  track_points: 'loyalty-rewards',
  ask_question: 'customer-service',
  report_issue: 'crisis-management',
  get_help: 'customer-service',
  unknown: 'customer-service',
};

/**
 * Classify user intent from message
 */
export function classifyIntent(message: string): IntentClassificationResult {
  const lowerMessage = message.toLowerCase();
  const scores = new Map<TravelIntent, number>();

  // Score each intent
  Object.entries(INTENT_PATTERNS).forEach(([intent, patterns]) => {
    let score = 0;
    patterns.forEach(pattern => {
      if (pattern.test(message)) {
        score += 1;
      }
    });
    if (score > 0) {
      scores.set(intent as TravelIntent, score);
    }
  });

  // Sort by score
  const sortedIntents = Array.from(scores.entries())
    .sort((a, b) => b[1] - a[1]);

  // Primary intent (highest score)
  const primaryIntent = sortedIntents.length > 0 ? sortedIntents[0][0] : 'unknown';
  const maxScore = sortedIntents.length > 0 ? sortedIntents[0][1] : 0;

  // Confidence (normalize to 0-1)
  const confidence = Math.min(maxScore / 3, 1.0); // 3+ matches = 100% confidence

  // Alternate intents
  const alternateIntents = sortedIntents.slice(1, 4).map(([intent, score]) => ({
    intent,
    confidence: Math.min(score / 3, 1.0),
  }));

  // Extract entities
  const extractedEntities = extractEntities(message);

  return {
    intent: primaryIntent,
    confidence,
    recommendedConsultant: INTENT_TO_CONSULTANT[primaryIntent],
    extractedEntities,
    alternateIntents,
  };
}

/**
 * Extract entities from message
 */
function extractEntities(message: string): IntentClassificationResult['extractedEntities'] {
  const entities: IntentClassificationResult['extractedEntities'] = {};

  // Detect service type
  if (/\b(flight|fly|plane)\b/i.test(message)) {
    entities.serviceType = 'flight';
  } else if (/\b(hotel|room|stay)\b/i.test(message)) {
    entities.serviceType = 'hotel';
  } else if (/\b(car|rental)\b/i.test(message)) {
    entities.serviceType = 'car';
  } else if (/\b(package|vacation)\b/i.test(message)) {
    entities.serviceType = 'package';
  }

  // Detect action
  if (/\b(book|reserve|purchase|buy)\b/i.test(message)) {
    entities.action = 'book';
  } else if (/\b(find|search|look)\b/i.test(message)) {
    entities.action = 'search';
  } else if (/\b(change|modify|update)\b/i.test(message)) {
    entities.action = 'modify';
  } else if (/\b(cancel)\b/i.test(message)) {
    entities.action = 'cancel';
  }

  // Detect urgency
  if (/\b(urgent|asap|emergency|now|today|tonight)\b/i.test(message)) {
    entities.urgency = 'high';
  } else if (/\b(soon|next (week|month)|within)\b/i.test(message)) {
    entities.urgency = 'medium';
  } else {
    entities.urgency = 'low';
  }

  return entities;
}

/**
 * Validate if agent response matches user intent
 */
export function validateResponseRelevance(
  userIntent: TravelIntent,
  agentResponse: string
): {
  relevant: boolean;
  confidence: number;
  issues?: string[];
} {
  const issues: string[] = [];
  let relevanceScore = 0;

  // Check if response addresses the intent
  switch (userIntent) {
    case 'book_flight':
    case 'search_flight':
      if (/\b(flight|airline|departure|arrival)\b/i.test(agentResponse)) {
        relevanceScore += 2;
      } else {
        issues.push('Response does not mention flights');
      }
      break;

    case 'book_hotel':
    case 'search_hotel':
      if (/\b(hotel|room|accommodation)\b/i.test(agentResponse)) {
        relevanceScore += 2;
      } else {
        issues.push('Response does not mention hotels');
      }
      break;

    case 'check_visa':
      if (/\b(visa|passport|entry)\b/i.test(agentResponse)) {
        relevanceScore += 2;
      } else {
        issues.push('Response does not mention visa requirements');
      }
      break;

    case 'cancel_booking':
      if (/\b(cancel|refund|policy)\b/i.test(agentResponse)) {
        relevanceScore += 2;
      } else {
        issues.push('Response does not address cancellation');
      }
      break;

    default:
      relevanceScore += 1; // Give benefit of doubt for other intents
  }

  // Check for generic/unhelpful responses
  if (/\b(I (can'?t|don'?t)|sorry|unable)\b/i.test(agentResponse)) {
    relevanceScore -= 1;
    issues.push('Response seems unhelpful or unable to assist');
  }

  // Check response length (too short = not helpful)
  if (agentResponse.length < 50) {
    relevanceScore -= 1;
    issues.push('Response seems too brief');
  }

  const relevant = relevanceScore > 0;
  const confidence = Math.min(Math.max(relevanceScore / 2, 0), 1.0);

  return {
    relevant,
    confidence,
    issues: issues.length > 0 ? issues : undefined,
  };
}

/**
 * ML-Ready: Prepare for Hugging Face fine-tuned model
 * In production, replace with actual BERT/GPT model
 */
export async function classifyIntentML(message: string): Promise<IntentClassificationResult> {
  // For now, use pattern matching
  // TODO: Replace with fine-tuned BERT model
  //
  // Example future implementation:
  // const response = await fetch('https://api-inference.huggingface.co/models/fly2any/intent-classifier', {
  //   headers: { Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}` },
  //   method: 'POST',
  //   body: JSON.stringify({ inputs: message }),
  // });
  // const result = await response.json();
  // return parseMLResult(result);

  return classifyIntent(message);
}
