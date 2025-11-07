/**
 * Sentiment Analysis & User Frustration Detection
 *
 * Detects user emotions in real-time to prevent abandonment
 * Uses pattern matching + ML-ready structure for future Hugging Face integration
 */

import type { UserSentiment } from './conversation-telemetry';

export interface SentimentAnalysisResult {
  sentiment: UserSentiment;
  confidence: number; // 0-1
  indicators: string[]; // What words/patterns triggered this
  frustrationLevel: number; // 0-1 (0 = calm, 1 = very frustrated)
  escalationNeeded: boolean; // Should we offer human help?
}

/**
 * Frustration indicators - words/phrases that signal user is upset
 */
const FRUSTRATION_PATTERNS = {
  high: [
    /\b(not working|doesn'?t work|broken|terrible|awful|worst|horrible|useless|waste of time)\b/i,
    /\b(give up|giving up|forget it|never mind)\b/i,
    /\b(stupid|dumb|ridiculous|absurd)\b/i,
    /\b(angry|frustrated|annoyed|mad)\b/i,
    /[!]{2,}/, // Multiple exclamation marks
    /[A-Z]{4,}/, // ALL CAPS WORDS
  ],
  medium: [
    /\b(confus(ed|ing)|unclear|don'?t understand|makes no sense)\b/i,
    /\b(still|again|yet another|one more time)\b/i,
    /\b(why|how come|what the)\b/i,
    /\b(problem|issue|error|wrong)\b/i,
  ],
  low: [
    /\?\?+/, // Multiple question marks
    /\b(help|stuck|lost)\b/i,
  ],
};

/**
 * Positive indicators - words/phrases that signal satisfaction
 */
const POSITIVE_PATTERNS = [
  /\b(great|excellent|perfect|wonderful|amazing|awesome|fantastic|love|thank you|thanks)\b/i,
  /\b(help(ful|ed)|appreciate|appreciate it)\b/i,
  /👍|😊|😀|🙂|❤️|💯|✅/,
];

/**
 * Negative indicators - words/phrases that signal dissatisfaction
 */
const NEGATIVE_PATTERNS = [
  /\b(bad|poor|disappointing|disappointed|unhappy|unsatisfied)\b/i,
  /\b(can'?t|won'?t|don'?t)\b/i,
  /😞|😔|😢|😠|😡|👎/,
];

/**
 * Analyze sentiment of user message
 */
export function analyzeSentiment(message: string): SentimentAnalysisResult {
  const indicators: string[] = [];
  let frustrationScore = 0;
  let positiveScore = 0;
  let negativeScore = 0;

  // Check frustration patterns (weighted by severity)
  FRUSTRATION_PATTERNS.high.forEach(pattern => {
    if (pattern.test(message)) {
      frustrationScore += 3;
      const match = message.match(pattern);
      if (match) indicators.push(`high-frustration: "${match[0]}"`);
    }
  });

  FRUSTRATION_PATTERNS.medium.forEach(pattern => {
    if (pattern.test(message)) {
      frustrationScore += 2;
      const match = message.match(pattern);
      if (match) indicators.push(`medium-frustration: "${match[0]}"`);
    }
  });

  FRUSTRATION_PATTERNS.low.forEach(pattern => {
    if (pattern.test(message)) {
      frustrationScore += 1;
      const match = message.match(pattern);
      if (match) indicators.push(`low-frustration: "${match[0]}"`);
    }
  });

  // Check positive patterns
  POSITIVE_PATTERNS.forEach(pattern => {
    if (pattern.test(message)) {
      positiveScore += 2;
      const match = message.match(pattern);
      if (match) indicators.push(`positive: "${match[0]}"`);
    }
  });

  // Check negative patterns
  NEGATIVE_PATTERNS.forEach(pattern => {
    if (pattern.test(message)) {
      negativeScore += 1;
      const match = message.match(pattern);
      if (match) indicators.push(`negative: "${match[0]}"`);
    }
  });

  // Determine overall sentiment
  let sentiment: UserSentiment;
  let confidence: number;

  if (frustrationScore >= 3) {
    sentiment = 'frustrated';
    confidence = Math.min(frustrationScore / 10, 1.0);
  } else if (positiveScore > negativeScore && positiveScore > 0) {
    sentiment = 'positive';
    confidence = Math.min(positiveScore / 5, 1.0);
  } else if (negativeScore > positiveScore && negativeScore > 0) {
    sentiment = 'negative';
    confidence = Math.min(negativeScore / 5, 1.0);
  } else {
    sentiment = 'neutral';
    confidence = 0.5;
  }

  // Calculate frustration level (0-1)
  const frustrationLevel = Math.min(frustrationScore / 10, 1.0);

  // Escalation needed if high frustration
  const escalationNeeded = frustrationScore >= 5;

  return {
    sentiment,
    confidence,
    indicators,
    frustrationLevel,
    escalationNeeded,
  };
}

/**
 * Predict if user will abandon based on sentiment trajectory
 */
export function predictAbandonment(
  recentMessages: string[],
  currentSentiment: SentimentAnalysisResult
): number {
  // If currently frustrated, high abandonment risk
  if (currentSentiment.sentiment === 'frustrated') {
    return Math.min(0.7 + currentSentiment.frustrationLevel * 0.3, 1.0);
  }

  // Check sentiment trajectory (is it getting worse?)
  if (recentMessages.length >= 3) {
    const sentiments = recentMessages.map(msg => analyzeSentiment(msg));
    const frustrationTrend = sentiments.map(s => s.frustrationLevel);

    // If frustration is increasing
    const isIncreasing = frustrationTrend.every((val, idx) =>
      idx === 0 || val >= frustrationTrend[idx - 1]
    );

    if (isIncreasing) {
      return Math.min(0.5 + frustrationTrend[frustrationTrend.length - 1] * 0.5, 1.0);
    }
  }

  // Low risk if positive or neutral
  if (currentSentiment.sentiment === 'positive') {
    return 0.1;
  }

  return 0.3; // Default moderate risk
}

/**
 * Get empathetic response based on sentiment
 */
export function getEmpathticResponse(sentiment: SentimentAnalysisResult): string {
  if (sentiment.sentiment === 'frustrated') {
    return "I can see this is frustrating. Let me make this easier for you.";
  }

  if (sentiment.sentiment === 'negative') {
    return "I understand this isn't ideal. Let me find better options for you.";
  }

  if (sentiment.sentiment === 'positive') {
    return "I'm so glad I could help!";
  }

  return ""; // Neutral - no special response needed
}

/**
 * ML-Ready: Prepare data for Hugging Face Transformers
 * In production, this would call a real sentiment model
 */
export async function analyzeSentimentML(message: string): Promise<SentimentAnalysisResult> {
  // For now, use pattern matching
  // TODO: Replace with Hugging Face model call
  //
  // Example future implementation:
  // const response = await fetch('https://api-inference.huggingface.co/models/distilbert-base-uncased-finetuned-sst-2-english', {
  //   headers: { Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}` },
  //   method: 'POST',
  //   body: JSON.stringify({ inputs: message }),
  // });
  // const result = await response.json();
  // return { sentiment: result[0].label, confidence: result[0].score, ... };

  return analyzeSentiment(message);
}
