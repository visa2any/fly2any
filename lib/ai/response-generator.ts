/**
 * Intelligent Response Generator
 *
 * Combines personality traits, dialogue templates, and natural language
 * processing to generate unique, consultant-specific responses.
 */

import type { TeamType } from './consultant-profiles';
import {
  getConsultantPersonality,
  consultantUsesEmojis,
  getExclamationFrequency,
  getCatchphrase,
  getTermOfEndearment,
  shouldUseTermOfEndearment,
  type ConsultantPersonality,
} from './consultant-personalities';
import { getDialogue, getDialogueTemplates, type DialogueSet } from './dialogue-templates';
import { makeNatural } from './natural-language';

export interface ConversationIntent {
  type:
    | 'greeting'
    | 'personal-question'
    | 'small-talk'
    | 'service-request'
    | 'clarification'
    | 'problem'
    | 'gratitude'
    | 'closing';
  subtype?: string;
}

export interface ConversationContext {
  isFirstMessage: boolean;
  previousIntent?: ConversationIntent;
  userEmotion?: 'neutral' | 'frustrated' | 'excited' | 'confused' | 'urgent';
  conversationLength: number;
}

/**
 * Main response generation function
 */
export function generatePersonalizedResponse(
  team: TeamType,
  intent: ConversationIntent,
  userMessage: string,
  context: ConversationContext,
  baseResponse?: string
): string {
  const personality = getConsultantPersonality(team);
  const dialogue = getDialogueTemplates(team);

  // Step 1: Get base response from dialogue templates
  let response = baseResponse || generateBaseResponse(team, intent, userMessage, dialogue);

  // Step 2: Apply personality enhancements
  response = applyPersonalityTraits(response, personality, team);

  // Step 3: Add contextual elements
  response = addContextualElements(response, personality, team, context);

  // Step 4: Apply punctuation style
  response = applyPunctuationStyle(response, personality);

  // Step 5: Make it natural
  response = makeNatural(response, {
    useContractions: personality.formalityLevel !== 'formal',
    addFillers: personality.energyLevel === 'very-high',
    conversationalTone: personality.formalityLevel === 'casual',
  });

  return response.trim();
}

/**
 * Generate base response from dialogue templates
 */
function generateBaseResponse(
  team: TeamType,
  intent: ConversationIntent,
  userMessage: string,
  dialogue: DialogueSet
): string {
  const lowerMessage = userMessage.toLowerCase();

  // Greeting
  if (intent.type === 'greeting') {
    return getDialogue(team, 'greetings');
  }

  // Personal questions
  if (intent.type === 'personal-question') {
    if (lowerMessage.match(/how are you|how're you|you doing|you good/i)) {
      return getDialogue(team, 'howAreYou');
    }
    if (lowerMessage.match(/weather/i)) {
      return getDialogue(team, 'weatherSmallTalk');
    }
  }

  // Gratitude
  if (intent.type === 'gratitude' || lowerMessage.match(/thank you|thanks|appreciate/i)) {
    return getDialogue(team, 'gratitudeResponse');
  }

  // Problem/concern
  if (intent.type === 'problem') {
    return getDialogue(team, 'problemAcknowledgement');
  }

  // Service request
  if (intent.type === 'service-request') {
    return getDialogue(team, 'transitionToService');
  }

  // Closing
  if (intent.type === 'closing') {
    return getDialogue(team, 'closingOffers');
  }

  // Default to understanding acknowledgment
  return getDialogue(team, 'understanding');
}

/**
 * Apply personality traits to response
 */
function applyPersonalityTraits(
  response: string,
  personality: ConsultantPersonality,
  team: TeamType
): string {
  let enhanced = response;

  // Add term of endearment (probabilistic)
  if (shouldUseTermOfEndearment(team)) {
    const term = getTermOfEndearment(team);
    if (term) {
      enhanced = addTermOfEndearment(enhanced, term);
    }
  }

  // Occasionally inject catchphrase (10% chance)
  if (Math.random() < 0.1) {
    const catchphrase = getCatchphrase(team);
    if (catchphrase && !enhanced.includes(catchphrase)) {
      enhanced = `${catchphrase} ${enhanced}`;
    }
  }

  // Adjust formality
  enhanced = adjustFormality(enhanced, personality.formalityLevel);

  // Add warmth markers
  enhanced = addWarmthMarkers(enhanced, personality.warmth);

  return enhanced;
}

/**
 * Add contextual elements based on conversation context
 */
function addContextualElements(
  response: string,
  personality: ConsultantPersonality,
  team: TeamType,
  context: ConversationContext
): string {
  let enhanced = response;

  // First message - might want to introduce self
  if (context.isFirstMessage && Math.random() < 0.3) {
    enhanced = addSelfIntroduction(enhanced, personality.name);
  }

  // React to user emotion
  if (context.userEmotion) {
    enhanced = addEmotionalResponse(enhanced, context.userEmotion, team);
  }

  // Long conversation - add variety
  if (context.conversationLength > 5) {
    enhanced = addConversationVariety(enhanced, personality);
  }

  return enhanced;
}

/**
 * Add term of endearment naturally
 */
function addTermOfEndearment(response: string, term: string): string {
  // Add at the beginning or end
  if (Math.random() < 0.5) {
    // Beginning
    if (!response.match(/^(Hi|Hello|Hey|Welcome)/i)) {
      return response;
    }
    return response.replace(/^(Hi|Hello|Hey|Welcome)/i, `$1, ${term}`);
  } else {
    // End
    if (response.endsWith('!') || response.endsWith('.')) {
      return response.slice(0, -1) + `, ${term}${response.slice(-1)}`;
    }
    return response + `, ${term}`;
  }
}

/**
 * Adjust formality level
 */
function adjustFormality(response: string, level: 'casual' | 'professional' | 'formal'): string {
  if (level === 'formal') {
    // Remove casual language
    return response
      .replace(/\byeah\b/gi, 'yes')
      .replace(/\bnope\b/gi, 'no')
      .replace(/\bgonna\b/gi, 'going to')
      .replace(/\bwanna\b/gi, 'want to')
      .replace(/\bkinda\b/gi, 'kind of');
  }

  if (level === 'casual') {
    // Make more conversational (but don't overdo it)
    if (Math.random() < 0.3) {
      response = response
        .replace(/\bgoing to\b/gi, 'gonna')
        .replace(/\bwant to\b/gi, 'wanna');
    }
  }

  return response;
}

/**
 * Add warmth markers
 */
function addWarmthMarkers(response: string, warmth: 'reserved' | 'friendly' | 'warm' | 'very-warm'): string {
  if (warmth === 'reserved') {
    // Remove overly warm language
    return response
      .replace(/!+/g, '.')
      .replace(/💕|💖|💗|💝/g, '')
      .replace(/\bsweetie\b|\bhon\b|\bdear\b/gi, '');
  }

  // Warmth is already in the dialogue templates
  return response;
}

/**
 * Apply punctuation style
 */
function applyPunctuationStyle(response: string, personality: ConsultantPersonality): string {
  let styled = response;
  const exclamationFreq = personality.punctuation.exclamationFrequency;

  // Handle exclamation points
  if (exclamationFreq === 'never') {
    styled = styled.replace(/!/g, '.');
  } else if (exclamationFreq === 'rare' && Math.random() < 0.7) {
    // Convert some ! to .
    styled = styled.replace(/!(?=.*!)/g, '.');
  } else if (exclamationFreq === 'very-frequent') {
    // Sometimes double up
    if (Math.random() < 0.2) {
      styled = styled.replace(/!(\s|$)/g, '!!$1');
    }
  }

  // Remove emojis if consultant doesn't use them
  if (!personality.punctuation.usesEmojis) {
    styled = styled.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim();
  }

  // Handle ellipsis
  if (!personality.punctuation.usesEllipsis) {
    styled = styled.replace(/\.\.\./g, '.');
  }

  return styled;
}

/**
 * Add self-introduction
 */
function addSelfIntroduction(response: string, name: string): string {
  if (response.includes(name)) {
    return response; // Already mentioned
  }

  const intros = [
    `I'm ${name}, by the way. `,
    `Oh, I'm ${name}! `,
    `${name} here. `,
  ];

  const intro = intros[Math.floor(Math.random() * intros.length)];
  return intro + response;
}

/**
 * Add emotional response based on user emotion
 */
function addEmotionalResponse(
  response: string,
  emotion: 'neutral' | 'frustrated' | 'excited' | 'confused' | 'urgent',
  team: TeamType
): string {
  if (emotion === 'neutral') {
    return response;
  }

  const dialogue = getDialogueTemplates(team);

  if (emotion === 'frustrated') {
    const empathy = getDialogue(team, 'empathy');
    return `${empathy} ${response}`;
  }

  if (emotion === 'excited') {
    const celebration = getDialogue(team, 'celebration');
    return `${celebration} ${response}`;
  }

  if (emotion === 'confused') {
    const reassurance = getDialogue(team, 'reassurance');
    return `${response} ${reassurance}`;
  }

  if (emotion === 'urgent') {
    // Make response more direct and action-oriented
    return response.replace(/^(Let me|I'll|I can)/, "I'm");
  }

  return response;
}

/**
 * Add variety in long conversations
 */
function addConversationVariety(response: string, personality: ConsultantPersonality): string {
  // Occasionally use analogies if consultant uses them
  if (personality.usesAnalogies && Math.random() < 0.15) {
    const transitions = [
      "Think of it this way: ",
      "It's like ",
      "You know how ",
      "Similar to ",
    ];
    const transition = transitions[Math.floor(Math.random() * transitions.length)];
    // This is a placeholder - real implementation would need analogy generation
  }

  // Add variety words
  if (Math.random() < 0.3) {
    const signatureWord = personality.signatureWords[
      Math.floor(Math.random() * personality.signatureWords.length)
    ];
    // Subtly inject signature word if it fits context
    // This is simplified - real implementation would use NLP
  }

  return response;
}

/**
 * Detect conversation intent from user message
 */
export function detectIntent(message: string, context: ConversationContext): ConversationIntent {
  const lower = message.toLowerCase();

  // Greeting patterns
  if (lower.match(/^(hi|hello|hey|good morning|good afternoon|good evening)/i)) {
    return { type: 'greeting' };
  }

  // Personal questions
  if (lower.match(/how are you|how're you|you doing|you good|how's it going/i)) {
    return { type: 'personal-question', subtype: 'how-are-you' };
  }

  // Weather small talk
  if (lower.match(/weather|sunny|rainy|cold|hot/i) && lower.length < 50) {
    return { type: 'small-talk', subtype: 'weather' };
  }

  // Gratitude
  if (lower.match(/thank you|thanks|appreciate|grateful/i)) {
    return { type: 'gratitude' };
  }

  // Problem/concern indicators
  if (
    lower.match(/problem|issue|wrong|error|broken|doesn't work|not working|help|urgent|emergency/i)
  ) {
    return { type: 'problem' };
  }

  // Questions/clarification
  if (lower.match(/what|where|when|who|why|how|can you|could you|would you|\?/)) {
    return { type: 'clarification' };
  }

  // Closing patterns
  if (lower.match(/that's all|that's it|no more|i'm good|all set|bye|goodbye|thanks bye/i)) {
    return { type: 'closing' };
  }

  // Default to service request
  return { type: 'service-request' };
}

/**
 * Detect user emotion from message
 */
export function detectUserEmotion(
  message: string
): 'neutral' | 'frustrated' | 'excited' | 'confused' | 'urgent' {
  const lower = message.toLowerCase();

  // Frustrated
  if (
    lower.match(
      /frustrated|annoyed|upset|angry|ridiculous|terrible|awful|worst|hate|stupid|useless/i
    )
  ) {
    return 'frustrated';
  }

  // Excited
  if (lower.match(/excited|amazing|awesome|fantastic|love|great|wonderful|perfect|yay|yes!/i)) {
    return 'excited';
  }

  // Confused
  if (
    lower.match(/confused|don't understand|what does|what's|unclear|not sure|how do|explain/i)
  ) {
    return 'confused';
  }

  // Urgent
  if (
    lower.match(
      /urgent|emergency|asap|right now|immediately|help!|quick|hurry|stuck|stranded|need now/i
    )
  ) {
    return 'urgent';
  }

  return 'neutral';
}

/**
 * Generate complete response with all enhancements
 */
export function generateCompleteResponse(
  team: TeamType,
  userMessage: string,
  context: ConversationContext,
  baseResponse?: string
): string {
  // Detect intent and emotion
  const intent = detectIntent(userMessage, context);
  const emotion = detectUserEmotion(userMessage);

  // Update context with emotion
  const enhancedContext = {
    ...context,
    userEmotion: emotion,
  };

  // Generate personalized response
  return generatePersonalizedResponse(team, intent, userMessage, enhancedContext, baseResponse);
}

/**
 * Generate response for specific dialogue intent
 */
export function generateDialogueResponse(
  team: TeamType,
  dialogueIntent: keyof DialogueSet,
  context: ConversationContext
): string {
  const personality = getConsultantPersonality(team);
  let response = getDialogue(team, dialogueIntent);

  // Apply personality traits
  response = applyPersonalityTraits(response, personality, team);

  // Apply punctuation
  response = applyPunctuationStyle(response, personality);

  // Make natural
  response = makeNatural(response, {
    useContractions: personality.formalityLevel !== 'formal',
    conversationalTone: personality.formalityLevel === 'casual',
  });

  return response.trim();
}

/**
 * Create conversation context helper
 */
export function createConversationContext(
  isFirstMessage: boolean = false,
  conversationLength: number = 0
): ConversationContext {
  return {
    isFirstMessage,
    conversationLength,
  };
}
