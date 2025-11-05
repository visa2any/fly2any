/**
 * Integration Examples for Travel Knowledge Base
 *
 * This file demonstrates how to integrate the knowledge base
 * with AI consultants, chat interfaces, and API routes.
 */

import { queryKnowledge, QueryResult } from './query';
import { getBaggagePolicy, getCompensationAmount } from './index';

// ============================================================================
// EXAMPLE 1: Basic Chat Integration
// ============================================================================

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  sources?: string[];
  relatedTopics?: string[];
}

/**
 * Enhanced chat handler that checks knowledge base before AI generation
 */
export async function handleChatMessage(
  userMessage: string,
  conversationContext?: string[]
): Promise<Message> {
  // Step 1: Query knowledge base
  const knowledgeResult = queryKnowledge('general', userMessage);

  // Step 2: If high confidence result, use it directly
  if (knowledgeResult && knowledgeResult.confidence === 'high') {
    return {
      role: 'assistant',
      content: knowledgeResult.answer,
      sources: knowledgeResult.sources,
      relatedTopics: knowledgeResult.relatedTopics
    };
  }

  // Step 3: If medium confidence, use as context for AI
  if (knowledgeResult && knowledgeResult.confidence === 'medium') {
    const contextualPrompt = `
      User question: ${userMessage}

      Background information from knowledge base:
      ${knowledgeResult.answer}

      Please provide a helpful response using this information as a foundation.
      If the user's question isn't fully answered, supplement with additional helpful details.
    `;

    const aiResponse = await generateAIResponse(contextualPrompt);
    return {
      role: 'assistant',
      content: aiResponse,
      sources: knowledgeResult.sources
    };
  }

  // Step 4: No knowledge base match, use pure AI
  const aiResponse = await generateAIResponse(userMessage);
  return {
    role: 'assistant',
    content: aiResponse
  };
}

// Mock AI generation (replace with actual AI service)
async function generateAIResponse(prompt: string): Promise<string> {
  // This would call OpenAI, Claude, or your AI service
  return "AI generated response here";
}

// ============================================================================
// EXAMPLE 2: Smart Consultant Component
// ============================================================================

interface ConsultantProps {
  question: string;
  context?: {
    airline?: string;
    destination?: string;
    flightNumber?: string;
    bookingClass?: string;
  };
}

/**
 * Smart consultant that intelligently routes queries
 */
export function SmartConsultant({ question, context }: ConsultantProps) {
  const getResponse = (): QueryResult | null => {
    // Try specific lookups first if we have context
    if (context?.airline && question.toLowerCase().includes('baggage')) {
      const policy = getBaggagePolicy(context.airline);
      if (policy) {
        return {
          answer: formatBaggageResponse(policy),
          sources: ['Flight Knowledge Base'],
          confidence: 'high'
        };
      }
    }

    // Fall back to general query
    return queryKnowledge('general', question, context);
  };

  const result = getResponse();

  if (!result) {
    return <div>Let me help you with that...</div>;
  }

  return (
    <div className="consultant-response">
      <div className="answer" dangerouslySetInnerHTML={{ __html: markdownToHtml(result.answer) }} />

      {result.sources && result.sources.length > 0 && (
        <div className="sources">
          <strong>Sources:</strong> {result.sources.join(', ')}
        </div>
      )}

      {result.confidence === 'high' && (
        <div className="confidence-badge">✓ High Confidence Answer</div>
      )}

      {result.relatedTopics && result.relatedTopics.length > 0 && (
        <div className="related-topics">
          <strong>Related Topics:</strong>
          {result.relatedTopics.map(topic => (
            <span key={topic} className="topic-tag">{topic}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function formatBaggageResponse(policy: any): string {
  return `**${policy.airline} Baggage Policy:**\n\n${JSON.stringify(policy, null, 2)}`;
}

function markdownToHtml(markdown: string): string {
  // Simple markdown converter (use a proper library in production)
  return markdown
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br />');
}

// ============================================================================
// EXAMPLE 3: API Route Integration
// ============================================================================

/**
 * API route handler for consultant queries
 */
export async function consultantApiHandler(req: Request) {
  const body = await req.json();
  const { question, context } = body;

  // Query knowledge base
  const knowledgeResult = queryKnowledge('general', question, context);

  // Return different response types based on confidence
  if (knowledgeResult && knowledgeResult.confidence === 'high') {
    return Response.json({
      type: 'knowledge-based',
      answer: knowledgeResult.answer,
      sources: knowledgeResult.sources,
      relatedTopics: knowledgeResult.relatedTopics,
      confidence: 'high'
    });
  }

  if (knowledgeResult && knowledgeResult.confidence === 'medium') {
    // Enhance with AI
    const enhancedAnswer = await generateAIResponse(
      `Based on this knowledge: ${knowledgeResult.answer}\n\nAnswer: ${question}`
    );

    return Response.json({
      type: 'ai-enhanced',
      answer: enhancedAnswer,
      sources: knowledgeResult.sources,
      confidence: 'medium'
    });
  }

  // Pure AI response
  const aiAnswer = await generateAIResponse(question);
  return Response.json({
    type: 'ai-generated',
    answer: aiAnswer,
    confidence: 'low'
  });
}

// ============================================================================
// EXAMPLE 4: Context-Aware Query
// ============================================================================

interface FlightContext {
  airline?: string;
  origin?: string;
  destination?: string;
  departureDate?: string;
  bookingClass?: string;
}

/**
 * Enhanced query with flight context
 */
export function queryWithFlightContext(
  question: string,
  flightContext: FlightContext
): QueryResult | null {
  // Enrich question with context
  let enrichedQuestion = question;

  if (flightContext.airline) {
    enrichedQuestion += ` for ${flightContext.airline}`;
  }

  if (flightContext.origin && flightContext.destination) {
    enrichedQuestion += ` from ${flightContext.origin} to ${flightContext.destination}`;
  }

  // Query with enriched context
  const result = queryKnowledge('flights', enrichedQuestion, flightContext);

  // If high confidence, check if we can add more specific info
  if (result && result.confidence === 'high') {
    // Add compensation calculation if applicable
    if (question.toLowerCase().includes('compensation') &&
        flightContext.origin &&
        flightContext.destination) {

      const distance = calculateDistance(flightContext.origin, flightContext.destination);
      const amount = getCompensationAmount('EU261', distance, 4);

      result.answer += `\n\n**For your specific route (${flightContext.origin} to ${flightContext.destination}):**\n`;
      result.answer += `Estimated compensation if eligible: ${amount}`;
    }
  }

  return result;
}

function calculateDistance(origin: string, dest: string): number {
  // Simplified - would use actual distance calculation
  return 2000;
}

// ============================================================================
// EXAMPLE 5: Multi-language Support
// ============================================================================

/**
 * Query with language translation
 */
export async function queryMultiLanguage(
  question: string,
  language: 'en' | 'pt' | 'es' = 'en'
): Promise<QueryResult | null> {
  // Translate question to English if needed
  const englishQuestion = language === 'en'
    ? question
    : await translateToEnglish(question, language);

  // Query knowledge base in English
  const result = queryKnowledge('general', englishQuestion);

  if (!result) return null;

  // Translate answer back if needed
  if (language !== 'en') {
    result.answer = await translateFromEnglish(result.answer, language);
  }

  return result;
}

async function translateToEnglish(text: string, fromLang: string): Promise<string> {
  // Implement translation (Google Translate API, DeepL, etc.)
  return text;
}

async function translateFromEnglish(text: string, toLang: string): Promise<string> {
  // Implement translation
  return text;
}

// ============================================================================
// EXAMPLE 6: Proactive Suggestions
// ============================================================================

/**
 * Get proactive suggestions based on user context
 */
export function getProactiveSuggestions(userContext: {
  upcomingTrip?: {
    destination: string;
    departure: string;
    airline?: string;
  };
  userProfile?: {
    frequentDestinations?: string[];
    preferences?: string[];
  };
}): string[] {
  const suggestions: string[] = [];

  if (userContext.upcomingTrip) {
    const { destination, departure, airline } = userContext.upcomingTrip;

    // Check visa requirements
    const visaResult = queryKnowledge('visa', `visa requirements for ${destination}`);
    if (visaResult) {
      suggestions.push(`📋 Visa Info: ${destination} - ${getFirstSentence(visaResult.answer)}`);
    }

    // Check baggage policy
    if (airline) {
      const baggageResult = queryKnowledge('flights', `${airline} baggage policy`);
      if (baggageResult) {
        suggestions.push(`💼 Baggage: ${getFirstSentence(baggageResult.answer)}`);
      }
    }

    // Travel tips
    const tipsResult = queryKnowledge('tips', `travel tips for ${destination}`);
    if (tipsResult) {
      suggestions.push(`💡 Tip: ${getFirstSentence(tipsResult.answer)}`);
    }

    // Booking timing
    const daysUntilTrip = calculateDaysUntil(departure);
    if (daysUntilTrip > 14) {
      suggestions.push(`⏰ Consider booking hotels now for best rates (1-4 weeks before is optimal)`);
    }
  }

  return suggestions;
}

function getFirstSentence(text: string): string {
  const match = text.match(/^[^.!?]+[.!?]/);
  return match ? match[0] : text.substring(0, 100) + '...';
}

function calculateDaysUntil(dateString: string): number {
  const target = new Date(dateString);
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// ============================================================================
// EXAMPLE 7: Confidence-Based UI
// ============================================================================

export function ConsultantResponseWithConfidence({ result }: { result: QueryResult }) {
  const confidenceStyles = {
    high: 'bg-green-50 border-green-200',
    medium: 'bg-yellow-50 border-yellow-200',
    low: 'bg-gray-50 border-gray-200'
  };

  const confidenceIcons = {
    high: '✓',
    medium: '○',
    low: '?'
  };

  return (
    <div className={`rounded-lg border p-4 ${confidenceStyles[result.confidence]}`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl">{confidenceIcons[result.confidence]}</span>
        <div className="flex-1">
          <div className="prose" dangerouslySetInnerHTML={{ __html: markdownToHtml(result.answer) }} />

          {result.sources && (
            <div className="mt-3 text-sm text-gray-600">
              <strong>Sources:</strong> {result.sources.join(', ')}
            </div>
          )}

          {result.confidence === 'high' && (
            <div className="mt-2 text-sm text-green-700">
              This information comes from our verified knowledge base.
            </div>
          )}

          {result.confidence === 'medium' && (
            <div className="mt-2 text-sm text-yellow-700">
              This information may need verification. Please check official sources.
            </div>
          )}

          {result.confidence === 'low' && (
            <div className="mt-2 text-sm text-gray-600">
              This is a general answer. Please verify with official sources for your specific situation.
            </div>
          )}

          {result.relatedTopics && result.relatedTopics.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {result.relatedTopics.map(topic => (
                <button
                  key={topic}
                  className="px-2 py-1 text-xs rounded bg-white border hover:bg-gray-50"
                >
                  {topic}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// EXAMPLE 8: Batch Query for Trip Planning
// ============================================================================

export async function planTrip(tripDetails: {
  destination: string;
  origin: string;
  airline?: string;
  dates: { departure: string; return: string };
}) {
  const questions = [
    `visa requirements for ${tripDetails.destination}`,
    `best time to book flights to ${tripDetails.destination}`,
    `${tripDetails.airline} baggage policy`,
    `travel tips for ${tripDetails.destination}`,
    `travel insurance recommendations`
  ];

  const results = questions.map(q => queryKnowledge('general', q));

  return {
    visa: results[0],
    booking: results[1],
    baggage: results[2],
    tips: results[3],
    insurance: results[4]
  };
}

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/*

// Example 1: Simple chat
const response = await handleChatMessage("What is EU261 compensation?");
console.log(response.content);

// Example 2: With flight context
const contextualResponse = queryWithFlightContext(
  "Can I get compensation?",
  {
    airline: "United Airlines",
    origin: "Paris",
    destination: "New York",
    bookingClass: "Y"
  }
);

// Example 3: Multi-language
const portugueseResponse = await queryMultiLanguage(
  "Quais são os requisitos de visto para o Brasil?",
  'pt'
);

// Example 4: Proactive suggestions
const suggestions = getProactiveSuggestions({
  upcomingTrip: {
    destination: "Thailand",
    departure: "2024-06-15",
    airline: "United Airlines"
  }
});

// Example 5: Trip planning
const tripPlan = await planTrip({
  destination: "Tokyo",
  origin: "New York",
  airline: "ANA",
  dates: {
    departure: "2024-07-01",
    return: "2024-07-15"
  }
});

*/
