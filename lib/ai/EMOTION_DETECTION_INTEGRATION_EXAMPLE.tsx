/**
 * EMOTION DETECTION INTEGRATION EXAMPLE
 *
 * This file demonstrates how to integrate the emotion detection system
 * into the AITravelAssistant component.
 *
 * USAGE:
 * Copy the relevant sections into your AITravelAssistant.tsx file
 * and adapt them to your existing code structure.
 */

// ============================================================================
// STEP 1: ADD IMPORTS
// ============================================================================

import { useState } from 'react';
import {
  detectEmotion,
  type EmotionAnalysis
} from '@/lib/ai/emotion-detection';

import {
  processEmotionalMessage,
  analyzeUserEmotion,
  shouldEscalateToCrisis,
  getEmotionalTypingText,
  extractEmotionMetrics,
  type EmotionalResponse
} from '@/lib/ai/emotion-aware-assistant';

import { type TeamType } from '@/lib/ai/consultant-profiles';
import { EmotionalIndicator } from '@/components/ai/EmotionalIndicator';

// ============================================================================
// STEP 2: ADD STATE FOR EMOTION TRACKING
// ============================================================================

export function AITravelAssistant() {
  // ... existing state ...

  // Add emotion-related state
  const [currentEmotion, setCurrentEmotion] = useState<EmotionAnalysis | null>(null);
  const [showEmotionIndicator, setShowEmotionIndicator] = useState(false);

  // Example message state (you should already have this in your component)
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSearchingFlights, setIsSearchingFlights] = useState(false);
  const [language] = useState<'en' | 'pt'>('en');

  // Helper functions (placeholders - replace with your actual implementations)
  const determineConsultantTeam = (message: string): TeamType => 'flight-operations';
  const detectFlightSearchIntent = (message: string): boolean => false;
  const generateAIResponse = (message: string, lang: string): string => 'AI response';

  // ============================================================================
  // STEP 3: UPDATE MESSAGE INTERFACE TO INCLUDE EMOTION DATA
  // ============================================================================

  interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    consultant?: {
      name: string;
      title: string;
      avatar: string;
      team: string;
    };
    emotionDetected?: EmotionAnalysis; // ADD THIS
    flightResults?: any[];
    isSearching?: boolean;
  }

  // ============================================================================
  // STEP 4: MODIFY handleSendMessage TO INCLUDE EMOTION DETECTION
  // ============================================================================

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessageText = inputMessage;

    // Add user message to chat
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessageText,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    // 🎯 EMOTION DETECTION STARTS HERE 🎯

    // 1. Analyze user's emotional state
    const emotionAnalysis = analyzeUserEmotion(userMessageText);
    setCurrentEmotion(emotionAnalysis);

    // 2. Show emotion indicator if confidence is high enough
    if (emotionAnalysis.confidence >= 0.6 && emotionAnalysis.emotion !== 'neutral') {
      setShowEmotionIndicator(true);
    }

    // 3. Track emotion in analytics
    analytics.trackEvent('emotion_detected', extractEmotionMetrics(emotionAnalysis));

    // 4. Check if we should escalate to crisis management
    if (shouldEscalateToCrisis(emotionAnalysis)) {
      analytics.trackEvent('emotion_escalation', {
        emotion: emotionAnalysis.emotion,
        confidence: emotionAnalysis.confidence
      });
    }

    // 5. Determine consultant team
    const baseTeam = determineConsultantTeam(userMessageText);

    // 6. Check if this is a flight search query
    const isFlightQuery = detectFlightSearchIntent(userMessageText);

    if (isFlightQuery) {
      // Handle flight search (existing code)
      handleFlightSearch(userMessageText, emotionAnalysis, baseTeam);
    } else {
      // Handle regular AI response with emotion awareness
      handleEmotionalResponse(userMessageText, emotionAnalysis, baseTeam);
    }
  };

  // ============================================================================
  // STEP 5: CREATE EMOTION-AWARE RESPONSE HANDLER
  // ============================================================================

  const handleEmotionalResponse = async (
    userMessageText: string,
    emotionAnalysis: EmotionAnalysis,
    baseTeam: TeamType
  ) => {
    // Show typing indicator
    setIsTyping(true);

    // Generate main content (your existing AI response logic)
    const mainContent = generateAIResponse(userMessageText, language);

    // Process with emotion awareness
    const emotionalResponse = processEmotionalMessage({
      userMessage: userMessageText,
      baseConsultantTeam: baseTeam,
      language: language,
      mainContent: mainContent,
      includeOpening: true,
      includeClosing: true
    });

    // Update typing indicator with emotion-aware text
    const typingText = getEmotionalTypingText(
      emotionalResponse.consultant.name,
      emotionAnalysis.emotion,
      language
    );

    // Wait for thinking delay (emotion-adjusted)
    await new Promise(resolve => setTimeout(resolve, emotionalResponse.thinkingDelay));

    // Wait for typing delay (emotion-adjusted)
    await new Promise(resolve => setTimeout(resolve, emotionalResponse.typingDelay));

    // Create AI response message
    const aiResponse: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: emotionalResponse.content,
      timestamp: new Date(),
      consultant: emotionalResponse.consultant,
      emotionDetected: emotionAnalysis // Store emotion analysis
    };

    setMessages(prev => [...prev, aiResponse]);
    setIsTyping(false);

    // Track assistant response
    analytics.trackMessage('assistant', {
      team: emotionalResponse.consultant.team,
      name: emotionalResponse.consultant.name,
      emotion: emotionAnalysis.emotion,
      confidence: emotionAnalysis.confidence
    });
  };

  // ============================================================================
  // STEP 6: MODIFY FLIGHT SEARCH TO BE EMOTION-AWARE
  // ============================================================================

  const handleFlightSearch = async (
    userMessageText: string,
    emotionAnalysis: EmotionAnalysis,
    baseTeam: TeamType
  ) => {
    // Get emotional response handler
    const emotionalResponse = processEmotionalMessage({
      userMessage: userMessageText,
      baseConsultantTeam: 'flight-operations',
      language: language,
      mainContent: language === 'en'
        ? "I'll search for flights for you right away..."
        : language === 'pt'
        ? "Vou pesquisar voos para você agora mesmo..."
        : "Buscaré vuelos para ti de inmediato...",
      includeOpening: true,
      includeClosing: false
    });

    // Add searching message with emotion awareness
    const searchingMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: emotionalResponse.content,
      timestamp: new Date(),
      consultant: emotionalResponse.consultant,
      isSearching: true,
      emotionDetected: emotionAnalysis
    };

    setMessages(prev => [...prev, searchingMessage]);
    setIsSearchingFlights(true);

    // Proceed with flight search...
    try {
      // Define language variable (use default or from component state)
      const language = 'en'; // Default language, should be from component state

      const response = await fetch('/api/ai/search-flights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: userMessageText,
          language,
          emotion: emotionAnalysis.emotion, // Send emotion to backend
          urgency: emotionAnalysis.urgency
        })
      });

      const data = await response.json();

      // Remove searching message
      setMessages(prev => prev.filter(m => !m.isSearching));
      setIsSearchingFlights(false);

      if (data.success && data.flights && data.flights.length > 0) {
        // Format results message with emotion awareness
        const resultsContent = processEmotionalMessage({
          userMessage: userMessageText,
          baseConsultantTeam: 'flight-operations',
          language: language,
          mainContent: data.message || (language === 'en'
            ? "I found these great options for you:"
            : language === 'pt'
            ? "Encontrei estas ótimas opções para você:"
            : "¡Encontré estas excelentes opciones para ti!"),
          includeOpening: false,
          includeClosing: true
        });

        const resultsMessage: Message = {
          id: (Date.now() + 2).toString(),
          role: 'assistant',
          content: resultsContent.content,
          timestamp: new Date(),
          consultant: resultsContent.consultant,
          flightResults: data.flights.slice(0, 3),
          emotionDetected: emotionAnalysis
        };

        setMessages(prev => [...prev, resultsMessage]);
      }
    } catch (error) {
      console.error('Flight search error:', error);
      setIsSearchingFlights(false);
      setMessages(prev => prev.filter(m => !m.isSearching));

      // Error message with empathy
      const errorContent = processEmotionalMessage({
        userMessage: userMessageText,
        baseConsultantTeam: 'flight-operations',
        language: language,
        mainContent: language === 'en'
          ? "I encountered an error searching for flights. Please try again or contact support if the issue persists."
          : language === 'pt'
          ? "Encontrei um erro ao pesquisar voos. Tente novamente ou entre em contato com o suporte se o problema persistir."
          : "Encontré un error al buscar vuelos. Por favor, inténtalo de nuevo o contacta con soporte si el problema persiste.",
        includeOpening: true,
        includeClosing: true
      });

      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: errorContent.content,
        timestamp: new Date(),
        consultant: errorContent.consultant,
        emotionDetected: emotionAnalysis
      };

      setMessages(prev => [...prev, errorMessage]);
    }
  };

  // ============================================================================
  // STEP 7: UPDATE MESSAGE RENDERING TO SHOW EMOTION INDICATOR
  // ============================================================================

  return (
    <div className="chat-container">
      {/* Messages Area */}
      <div className="messages-area">
        {messages.map((message) => (
          <div key={message.id} className="message-wrapper">
            {/* Existing message bubble */}
            <div className="message-bubble">
              {/* Consultant Name & Title */}
              {message.role === 'assistant' && message.consultant && (
                <div className="consultant-header">
                  <p className="consultant-name">{message.consultant.name}</p>
                  <p className="consultant-title">{message.consultant.title}</p>

                  {/* 🎯 ADD EMOTION INDICATOR HERE 🎯 */}
                  {message.emotionDetected && (
                    <EmotionalIndicator
                      emotion={message.emotionDetected.emotion}
                      confidence={message.emotionDetected.confidence}
                      urgency={message.emotionDetected.urgency}
                      compact={true}
                    />
                  )}
                </div>
              )}

              {/* Message content */}
              <p className="message-content">{message.content}</p>
            </div>
          </div>
        ))}

        {/* Typing Indicator with Emotion */}
        {isTyping && currentEmotion && (
          <div className="typing-indicator">
            <EmotionalIndicator
              emotion={currentEmotion.emotion}
              confidence={currentEmotion.confidence}
              urgency={currentEmotion.urgency}
              compact={true}
            />
            <p className="typing-text">
              {getEmotionalTypingText('Assistant', currentEmotion.emotion, language)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// STEP 8: ADD EMOTION-AWARE ANALYTICS TRACKING
// ============================================================================

// Extend your analytics hook to track emotions
const analytics = {
  // ... existing analytics methods ...

  trackEvent: (eventName: string, data: any) => {
    // General event tracking
    console.log(`Event: ${eventName}`, data);

    // Send to analytics service
    fetch('/api/analytics/track', {
      method: 'POST',
      body: JSON.stringify({
        event: eventName,
        data
      })
    });
  },

  trackMessage: (role: string, data: any) => {
    // Track message
    console.log(`Message (${role}):`, data);

    // Send to analytics service
    fetch('/api/analytics/track', {
      method: 'POST',
      body: JSON.stringify({
        event: 'message_sent',
        role,
        data
      })
    });
  },

  trackEmotion: (emotionData: {
    emotion: string;
    confidence: number;
    urgency: string;
    keywords: string[];
  }) => {
    // Track emotion detection
    console.log('Emotion detected:', emotionData);

    // Send to analytics service
    fetch('/api/analytics/track', {
      method: 'POST',
      body: JSON.stringify({
        event: 'emotion_detected',
        data: emotionData
      })
    });
  },

  trackEmotionEscalation: (data: {
    emotion: string;
    confidence: number;
    fromTeam: string;
    toTeam: string;
  }) => {
    console.log('Emotion escalation:', data);

    fetch('/api/analytics/track', {
      method: 'POST',
      body: JSON.stringify({
        event: 'emotion_escalation',
        data
      })
    });
  }
};

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/**
 * Example 1: Simple emotion detection
 */
function example1() {
  const userMessage = "I'm so frustrated! My flight was cancelled!";
  const emotion = detectEmotion(userMessage);
  console.log(emotion);
  // Output: {
  //   emotion: 'frustrated',
  //   confidence: 0.85,
  //   urgency: 'high',
  //   keywords: ['frustrated', 'cancelled'],
  //   responseStrategy: 'empathetic',
  //   typingSpeedMultiplier: 1.3,
  //   priority: 'high'
  // }
}

/**
 * Example 2: Complete emotional response
 */
function example2() {
  const result = processEmotionalMessage({
    userMessage: "I'm confused about the baggage policy",
    baseConsultantTeam: 'flight-operations',
    language: 'en',
    mainContent: "Our baggage policy allows 1 checked bag up to 50lbs and 1 carry-on."
  });

  console.log(result.content);
  // Output: "No worries, let me explain this clearly step by step.
  //
  // Our baggage policy allows 1 checked bag up to 50lbs and 1 carry-on.
  //
  // Does this make sense? Feel free to ask if you need more clarification!"

  console.log(result.emotionAnalysis.emotion); // 'confused'
  console.log(result.typingDelay); // ~2000ms (slightly slower for clarity)
}

/**
 * Example 3: Check if should escalate
 */
function example3() {
  const userMessage = "URGENT! I need help immediately!";
  const emotion = analyzeUserEmotion(userMessage);

  if (shouldEscalateToCrisis(emotion)) {
    // Route to Captain Mike (Crisis Management)
    console.log('Escalating to crisis management...');
  }
}

/**
 * Example 4: Show emotion indicator in UI
 */
function example4() {
  const emotion = analyzeUserEmotion("I'm so excited about my trip!");

  return (
    <div>
      <EmotionalIndicator
        emotion={emotion.emotion}
        confidence={emotion.confidence}
        urgency={emotion.urgency}
        compact={false}
      />
      {/* Shows: "🎉 Enthusiasm Match" badge */}
    </div>
  );
}
