/**
 * Integration Examples - How to Use Consultant Personalities
 *
 * Shows developers how to integrate the personality system
 * into their chatbot, API endpoints, and UI components.
 */

import type { TeamType } from './consultant-profiles';
import {
  generateCompleteResponse,
  generateDialogueResponse,
  createConversationContext,
  detectIntent,
  detectUserEmotion,
} from './response-generator';
import { getConsultantPersonality } from './consultant-personalities';
import { getDialogue } from './dialogue-templates';

/**
 * EXAMPLE 1: Basic chatbot response
 *
 * When user sends a message to a consultant
 */
export function basicChatbotExample() {
  const team: TeamType = 'customer-service'; // Lisa Thompson
  const userMessage = "Hi! How are you?";
  const isFirstMessage = true;

  const context = createConversationContext(isFirstMessage, 0);
  const response = generateCompleteResponse(team, userMessage, context);

  console.log('User:', userMessage);
  console.log('Lisa:', response);
  // Output: "Hi there, sweetie! 😊 I'm doing wonderful, thank you so much for asking! 💕 How about you, hon?"
}

/**
 * EXAMPLE 2: Multi-turn conversation
 *
 * Maintaining context across multiple messages
 */
export function multiTurnConversationExample() {
  const team: TeamType = 'flight-operations'; // Sarah Chen
  let conversationLength = 0;

  // Turn 1
  const message1 = "Hi Sarah!";
  let context = createConversationContext(true, conversationLength++);
  let response = generateCompleteResponse(team, message1, context);
  console.log('User:', message1);
  console.log('Sarah:', response);

  // Turn 2
  const message2 = "I need a flight to Paris";
  context = createConversationContext(false, conversationLength++);
  response = generateCompleteResponse(team, message2, context);
  console.log('User:', message2);
  console.log('Sarah:', response);

  // Turn 3
  const message3 = "What about baggage?";
  context = createConversationContext(false, conversationLength++);
  response = generateCompleteResponse(team, message3, context);
  console.log('User:', message3);
  console.log('Sarah:', response);
}

/**
 * EXAMPLE 3: Handling different emotions
 *
 * Response adapts based on detected user emotion
 */
export function emotionAwareExample() {
  const team: TeamType = 'customer-service'; // Lisa Thompson

  // Frustrated user
  const frustratedMessage = "This is ridiculous! My booking still isn't working!";
  const emotion = detectUserEmotion(frustratedMessage);
  console.log('Detected emotion:', emotion); // "frustrated"

  const context = createConversationContext(false, 3);
  const response = generateCompleteResponse(team, frustratedMessage, context);

  console.log('User (frustrated):', frustratedMessage);
  console.log('Lisa (empathetic):', response);
  // Lisa will add extra empathy and reassurance
}

/**
 * EXAMPLE 4: Specific dialogue intents
 *
 * Generate response for specific situations
 */
export function specificDialogueExample() {
  const team: TeamType = 'crisis-management'; // Captain Mike

  const context = createConversationContext(false, 1);

  // Generate searching message
  const searchingResponse = generateDialogueResponse(team, 'searching', context);
  console.log('Captain Mike (searching):', searchingResponse);
  // Output: "Finding immediate solutions..."

  // Generate reassurance
  const reassuranceResponse = generateDialogueResponse(team, 'reassurance', context);
  console.log('Captain Mike (reassurance):', reassuranceResponse);
  // Output: "You're going to be fine. I've got this under control."
}

/**
 * EXAMPLE 5: API endpoint integration
 *
 * How to use in a Next.js API route
 */
export async function apiEndpointExample(
  request: {
    message: string;
    consultantTeam: TeamType;
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
  }
) {
  const { message, consultantTeam, conversationHistory } = request;

  // Create context from conversation history
  const isFirstMessage = conversationHistory.length === 0;
  const conversationLength = conversationHistory.length;
  const context = createConversationContext(isFirstMessage, conversationLength);

  // Generate personalized response
  const response = generateCompleteResponse(consultantTeam, message, context);

  return {
    response,
    consultant: consultantTeam,
    emotion: detectUserEmotion(message),
  };
}

/**
 * EXAMPLE 6: React component integration
 *
 * How to use in a chat component
 */
export const ChatbotIntegrationExample = `
import { generateCompleteResponse, createConversationContext } from '@/lib/ai/response-generator';
import { useState } from 'react';

export function ConsultantChatbot({ consultantTeam }: { consultantTeam: TeamType }) {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    // Add user message
    const userMessage = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMessage]);

    // Generate consultant response
    const context = createConversationContext(
      messages.length === 0,
      messages.length
    );
    const response = generateCompleteResponse(consultantTeam, input, context);

    // Add assistant message
    const assistantMessage = { role: 'assistant' as const, content: response };
    setMessages(prev => [...prev, assistantMessage]);

    setInput('');
  };

  return (
    <div className="chatbot">
      <div className="messages">
        {messages.map((msg, i) => (
          <div key={i} className={msg.role}>
            {msg.content}
          </div>
        ))}
      </div>
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyPress={e => e.key === 'Enter' && handleSend()}
      />
      <button onClick={handleSend}>Send</button>
    </div>
  );
}
`;

/**
 * EXAMPLE 7: Testing different consultants
 *
 * Compare how different consultants respond to the same message
 */
export function compareConsultantsExample() {
  const userMessage = "I need help with my booking.";
  const context = createConversationContext(false, 1);

  const teams: TeamType[] = [
    'customer-service',
    'flight-operations',
    'legal-compliance',
    'crisis-management',
  ];

  console.log('\nUser:', userMessage);
  console.log('\nResponses from different consultants:\n');

  teams.forEach(team => {
    const personality = getConsultantPersonality(team);
    const response = generateCompleteResponse(team, userMessage, context);
    console.log(`${personality.name} (${team}):`);
    console.log(response);
    console.log('---');
  });
}

/**
 * EXAMPLE 8: Custom response with personality overlay
 *
 * Start with custom content, add personality
 */
export function customResponseExample() {
  const team: TeamType = 'hotel-accommodations'; // Marcus
  const context = createConversationContext(false, 2);

  // Your custom technical response
  const baseResponse = `I found 5 hotels in Barcelona.
  The Hotel Arts costs $250/night with ocean views.
  The W Barcelona costs $280/night with rooftop pool.`;

  // Add Marcus's personality
  const personalizedResponse = generateCompleteResponse(
    team,
    "Show me hotels in Barcelona",
    context,
    baseResponse
  );

  console.log('Base response:', baseResponse);
  console.log('\nWith Marcus personality:', personalizedResponse);
  // Marcus will add his warmth, enthusiasm, and hospitality language
}

/**
 * EXAMPLE 9: Dynamic consultant switching
 *
 * Switch consultants based on query type
 */
export function dynamicConsultantExample(userQuery: string) {
  let consultantTeam: TeamType;

  // Route to appropriate consultant based on query
  if (userQuery.match(/flight|plane|airline|departure|arrival/i)) {
    consultantTeam = 'flight-operations';
  } else if (userQuery.match(/hotel|room|accommodation|stay/i)) {
    consultantTeam = 'hotel-accommodations';
  } else if (userQuery.match(/rights|compensation|legal|refund/i)) {
    consultantTeam = 'legal-compliance';
  } else if (userQuery.match(/emergency|urgent|help|stranded|cancelled/i)) {
    consultantTeam = 'crisis-management';
  } else if (userQuery.match(/payment|charge|billing|refund|card/i)) {
    consultantTeam = 'payment-billing';
  } else {
    consultantTeam = 'customer-service'; // Default to Lisa
  }

  const context = createConversationContext(true, 0);
  const response = generateCompleteResponse(consultantTeam, userQuery, context);

  const personality = getConsultantPersonality(consultantTeam);
  console.log(`Routed to: ${personality.name}`);
  console.log('Response:', response);

  return { consultantTeam, response };
}

/**
 * EXAMPLE 10: Conversation flow states
 *
 * Handle different conversation states with appropriate dialogue
 */
export function conversationFlowExample() {
  const team: TeamType = 'flight-operations';
  const context = createConversationContext(false, 2);

  // State: Searching
  const searchingMsg = generateDialogueResponse(team, 'searching', context);
  console.log('State: Searching');
  console.log(searchingMsg);

  // State: Found results
  const foundMsg = generateDialogueResponse(team, 'foundSomething', context);
  console.log('\nState: Found Results');
  console.log(foundMsg);

  // State: Needs more info
  const needsInfoMsg = generateDialogueResponse(team, 'needsMoreInfo', context);
  console.log('\nState: Needs More Info');
  console.log(needsInfoMsg);

  // State: Closing
  const closingMsg = generateDialogueResponse(team, 'closingOffers', context);
  console.log('\nState: Closing');
  console.log(closingMsg);
}

/**
 * EXAMPLE 11: A/B Testing personality impact
 *
 * Test with and without personality
 */
export function abTestingExample() {
  const team: TeamType = 'customer-service';
  const userMessage = "Thanks for your help!";
  const context = createConversationContext(false, 3);

  // Version A: With full personality
  const personalityResponse = generateCompleteResponse(team, userMessage, context);

  // Version B: Generic response
  const genericResponse = "You're welcome. Let me know if you need anything else.";

  console.log('A/B Test Results:');
  console.log('\nVersion A (With Personality):');
  console.log(personalityResponse);
  console.log('\nVersion B (Generic):');
  console.log(genericResponse);

  // Measure: engagement rate, satisfaction score, conversation length
}

/**
 * EXAMPLE 12: Personality trait queries
 *
 * Query specific personality traits for UI customization
 */
export function personalityTraitExample() {
  const team: TeamType = 'legal-compliance'; // Dr. Emily Watson
  const personality = getConsultantPersonality(team);

  console.log('Consultant:', personality.name);
  console.log('Archetype:', personality.archetype);
  console.log('Uses emojis?', personality.punctuation.usesEmojis);
  console.log('Formality level:', personality.formalityLevel);
  console.log('Energy level:', personality.energyLevel);
  console.log('Signature words:', personality.signatureWords.slice(0, 5));

  // Use these traits to customize UI
  const chatBubbleColor = personality.energyLevel === 'very-high' ? 'bg-pink-100' : 'bg-gray-100';
  const avatarBorder = personality.warmth === 'very-warm' ? 'border-red-400' : 'border-gray-400';

  console.log('\nUI Customization:');
  console.log('Chat bubble:', chatBubbleColor);
  console.log('Avatar border:', avatarBorder);
}

/**
 * EXAMPLE 13: Batch processing messages
 *
 * Process multiple messages efficiently
 */
export function batchProcessingExample() {
  const team: TeamType = 'customer-service';
  const messages = [
    "Hi!",
    "I need help with my booking",
    "My confirmation number is ABC123",
    "Thanks!",
  ];

  let conversationLength = 0;
  const responses = messages.map((msg, index) => {
    const context = createConversationContext(index === 0, conversationLength++);
    return generateCompleteResponse(team, msg, context);
  });

  messages.forEach((msg, i) => {
    console.log(`User: ${msg}`);
    console.log(`Lisa: ${responses[i]}\n`);
  });
}

/**
 * Run all examples
 */
export function runAllExamples() {
  console.log('\n=== EXAMPLE 1: Basic Chatbot ===');
  basicChatbotExample();

  console.log('\n=== EXAMPLE 2: Multi-turn Conversation ===');
  multiTurnConversationExample();

  console.log('\n=== EXAMPLE 3: Emotion Aware ===');
  emotionAwareExample();

  console.log('\n=== EXAMPLE 4: Specific Dialogue ===');
  specificDialogueExample();

  console.log('\n=== EXAMPLE 7: Compare Consultants ===');
  compareConsultantsExample();

  console.log('\n=== EXAMPLE 8: Custom Response ===');
  customResponseExample();

  console.log('\n=== EXAMPLE 9: Dynamic Routing ===');
  dynamicConsultantExample("My flight was cancelled!");

  console.log('\n=== EXAMPLE 10: Conversation Flow ===');
  conversationFlowExample();

  console.log('\n=== EXAMPLE 12: Personality Traits ===');
  personalityTraitExample();

  console.log('\n=== EXAMPLE 13: Batch Processing ===');
  batchProcessingExample();
}
