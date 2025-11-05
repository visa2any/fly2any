# Emotion Detection System

## Overview

The Emotion Detection System makes the AI Travel Assistant more empathetic and responsive to user emotions. It analyzes user messages, detects emotional states, and adapts the assistant's behavior accordingly.

## Architecture

### Core Components

1. **Emotion Detection Engine** (`lib/ai/emotion-detection.ts`)
   - Detects 8 emotional states: frustrated, confused, excited, worried, satisfied, urgent, casual, neutral
   - Provides confidence scores (0-1) and urgency levels (low/medium/high)
   - Returns response strategies and typing speed multipliers

2. **Response Templates** (`lib/ai/response-templates.ts`)
   - Adaptive response templates for each emotional state
   - Multi-language support (English, Portuguese, Spanish)
   - Opening/closing phrases that acknowledge emotions
   - Tone adjustments (formal, casual, empathetic, urgent, enthusiastic)

3. **Emotional Indicator** (`components/ai/EmotionalIndicator.tsx`)
   - Visual feedback component showing detected emotion
   - Color-coded indicators with pulsing animations for urgent states
   - Subtle UI that doesn't distract from conversation

4. **Typing Simulation Integration** (`lib/utils/typing-simulation.ts`)
   - Adjusts typing speed based on emotion
   - Faster responses for urgent/frustrated users
   - Slower, more detailed explanations for confused users

## Emotional States

### 1. Urgent (🚨)
- **Triggers**: "emergency", "asap", "help", "lost", "cancelled"
- **Confidence**: 0.9
- **Urgency**: High
- **Response Strategy**: Professional, action-oriented
- **Typing Speed**: 1.5x faster
- **Visual**: Red with pulsing animation
- **Consultant**: Routes to Captain Mike (Crisis Management)

```typescript
// Example detection
const msg = "I need help urgently! My flight was cancelled!";
// Result: emotion='urgent', confidence=0.9, urgency='high'
```

### 2. Frustrated (😤)
- **Triggers**: "frustrated", "angry", "terrible", "unacceptable"
- **Confidence**: 0.85
- **Urgency**: High
- **Response Strategy**: Empathetic, apologetic
- **Typing Speed**: 1.3x faster
- **Visual**: Orange background
- **Consultant**: Routes to Crisis Management or Customer Service

```typescript
// Example response
Opening: "I'm really sorry you're experiencing this frustration."
Closing: "I'm committed to making this right for you."
```

### 3. Worried (😰)
- **Triggers**: "worried", "concerned", "anxious", "what if"
- **Confidence**: 0.75
- **Urgency**: Medium
- **Response Strategy**: Reassuring
- **Typing Speed**: Normal
- **Visual**: Yellow background
- **Focus**: Provide guarantees and reassurance

```typescript
// Example response
Opening: "I understand your concerns. Let me help ease your worries."
Closing: "Everything will be taken care of. You're in good hands."
```

### 4. Confused (❓)
- **Triggers**: "confused", "don't understand", "what does", "how to"
- **Confidence**: 0.75
- **Urgency**: Medium
- **Response Strategy**: Reassuring, educational
- **Typing Speed**: 0.9x (slightly slower for clarity)
- **Visual**: Blue background
- **Focus**: Step-by-step explanations with bullet points

```typescript
// Example response
Opening: "No worries, let me explain this clearly step by step."
Closing: "Does this make sense? Feel free to ask if you need more clarification!"
```

### 5. Excited (🎉)
- **Triggers**: "excited", "amazing", "perfect", "can't wait"
- **Confidence**: 0.8
- **Urgency**: Low
- **Response Strategy**: Enthusiastic
- **Typing Speed**: 1.1x faster
- **Visual**: Green background
- **Focus**: Match enthusiasm with exclamation points

```typescript
// Example response
Opening: "That's wonderful! I'm excited to help you with this!"
Closing: "This is going to be fantastic!"
```

### 6. Satisfied (✅)
- **Triggers**: "thank you", "perfect", "great service"
- **Confidence**: 0.7
- **Urgency**: Low
- **Response Strategy**: Professional, friendly
- **Typing Speed**: Normal
- **Visual**: Teal background

### 7. Casual (💬)
- **Triggers**: "hey", "just wondering", "lol", "btw"
- **Confidence**: 0.6
- **Urgency**: Low
- **Response Strategy**: Professional but friendly
- **Typing Speed**: Normal
- **Visual**: Gray background

### 8. Neutral (😐)
- **Default**: When no clear emotion is detected
- **Confidence**: 0.5
- **Urgency**: Low
- **Response Strategy**: Professional
- **Typing Speed**: Normal

## Integration with AITravelAssistant

### Step 1: Detect Emotion on User Message

```typescript
import { detectEmotion } from '@/lib/ai/emotion-detection';

const userMessage = "I'm frustrated! My flight was cancelled!";
const emotionAnalysis = detectEmotion(userMessage);
// {
//   emotion: 'frustrated',
//   confidence: 0.85,
//   urgency: 'high',
//   keywords: ['frustrated', 'cancelled'],
//   responseStrategy: 'empathetic',
//   typingSpeedMultiplier: 1.3,
//   priority: 'high'
// }
```

### Step 2: Select Appropriate Consultant

```typescript
import { getConsultantForEmotion } from '@/lib/ai/emotion-detection';

// Determine consultant team based on message content
const baseTeam = determineConsultantTeam(userMessage); // e.g., 'flight-operations'

// Adjust based on emotion (urgent/frustrated -> crisis-management)
const consultantTeam = getConsultantForEmotion(
  emotionAnalysis.emotion,
  baseTeam
);

const consultant = getConsultant(consultantTeam);
```

### Step 3: Add Empathy Marker to Response

```typescript
import { getEmpathyMarker } from '@/lib/ai/emotion-detection';
import { formatEmotionalResponse } from '@/lib/ai/response-templates';

// Get empathy acknowledgment
const empathy = getEmpathyMarker(emotionAnalysis.emotion, language);
// "I understand how frustrating this must be."

// Format complete response
const response = formatEmotionalResponse(
  emotionAnalysis.emotion,
  language,
  "Let me help you rebook immediately. Here are your options...",
  true, // include opening
  true  // include closing
);
```

### Step 4: Adjust Typing Speed

```typescript
import { calculateEmotionalTypingDelay } from '@/lib/utils/typing-simulation';

const typingDelay = calculateEmotionalTypingDelay(
  responseMessage,
  emotionAnalysis
);
// For urgent: ~60% of normal delay (1.5x faster)
// For confused: ~110% of normal delay (slightly slower)

setTimeout(() => {
  setMessages(prev => [...prev, aiResponse]);
  setIsTyping(false);
}, typingDelay);
```

### Step 5: Show Visual Indicator

```tsx
import { EmotionalIndicator } from '@/components/ai/EmotionalIndicator';

<EmotionalIndicator
  emotion={emotionAnalysis.emotion}
  confidence={emotionAnalysis.confidence}
  urgency={emotionAnalysis.urgency}
  compact={false}
/>
```

## Complete Integration Example

```typescript
const handleSendMessage = async () => {
  const userMessage = inputMessage;

  // 1. Detect emotion
  const emotionAnalysis = detectEmotion(userMessage);

  // 2. Track emotion in analytics
  analytics.trackEmotion({
    emotion: emotionAnalysis.emotion,
    confidence: emotionAnalysis.confidence,
    urgency: emotionAnalysis.urgency
  });

  // 3. Select consultant
  const baseTeam = determineConsultantTeam(userMessage);
  const consultantTeam = getConsultantForEmotion(
    emotionAnalysis.emotion,
    baseTeam
  );
  const consultant = getConsultant(consultantTeam);

  // 4. Calculate delays
  const thinkingDelay = calculateEmotionalThinkingDelay(
    userMessage,
    emotionAnalysis
  );

  // 5. Show thinking indicator
  setIsTyping(true);
  setTypingState({
    phase: 'thinking',
    consultantName: consultant.name,
    emotion: emotionAnalysis.emotion
  });

  // 6. After thinking delay, generate response
  setTimeout(() => {
    setTypingState({
      phase: 'typing',
      consultantName: consultant.name,
      emotion: emotionAnalysis.emotion
    });

    // Generate response with emotional awareness
    const mainContent = generateAIResponse(userMessage, language, consultant);
    const responseContent = formatEmotionalResponse(
      emotionAnalysis.emotion,
      language,
      mainContent,
      true,
      true
    );

    const typingDelay = calculateEmotionalTypingDelay(
      responseContent,
      emotionAnalysis
    );

    // 7. After typing delay, show message
    setTimeout(() => {
      const aiResponse = {
        id: Date.now().toString(),
        role: 'assistant',
        content: responseContent,
        timestamp: new Date(),
        consultant: {
          name: consultant.name,
          title: consultant.title,
          avatar: consultant.avatar,
          team: consultant.team
        },
        emotionDetected: emotionAnalysis
      };

      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
      setTypingState(null);
    }, typingDelay);
  }, thinkingDelay);
};
```

## Benefits

### 1. Improved User Experience
- Users feel heard and understood
- Faster responses for urgent situations
- More detailed explanations when confused
- Matching enthusiasm for excited users

### 2. Better Crisis Management
- Automatic escalation to crisis team for urgent/frustrated users
- Reduced response times for emergencies
- Empathetic acknowledgment of frustration

### 3. Personalized Interactions
- Tone adapts to user's emotional state
- Appropriate use of exclamation points and enthusiasm
- Professional vs. casual language based on context

### 4. Analytics Insights
- Track which emotions are most common
- Identify pain points causing frustration
- Measure satisfaction trends

## Testing Emotion Detection

### Test Cases

```typescript
// Urgent
detectEmotion("Help! My flight is in 2 hours and I lost my passport!");
// Expected: emotion='urgent', confidence>0.8, urgency='high'

// Frustrated
detectEmotion("This is unacceptable! I've been waiting for 2 hours!");
// Expected: emotion='frustrated', confidence>0.8, urgency='high'

// Worried
detectEmotion("I'm concerned about the cancellation policy. What if I need to cancel?");
// Expected: emotion='worried', confidence>0.7, urgency='medium'

// Confused
detectEmotion("I don't understand how the baggage fees work. Can you explain?");
// Expected: emotion='confused', confidence>0.7, urgency='medium'

// Excited
detectEmotion("I'm so excited! This is going to be my dream vacation!");
// Expected: emotion='excited', confidence>0.8, urgency='low'

// Neutral
detectEmotion("I need a flight from NYC to Paris on May 15th.");
// Expected: emotion='neutral', confidence=0.5, urgency='low'
```

## Future Enhancements

1. **ML-Based Detection**: Replace regex patterns with machine learning model
2. **Emotion History**: Track user's emotional journey across conversation
3. **Sentiment Trending**: Detect if user is getting more/less frustrated
4. **Multilingual Support**: Expand emotion patterns for more languages
5. **Voice Tone Analysis**: Integrate with voice input for better detection
6. **Emoji Analysis**: Parse emojis for additional emotional context
7. **Context Awareness**: Consider previous messages for better accuracy

## Configuration

### Adjusting Sensitivity

```typescript
// In emotion-detection.ts
const EMOTION_PATTERNS = [
  {
    keywords: [...],
    emotion: 'frustrated',
    confidence: 0.85, // Lower = more sensitive, higher = more conservative
    // ...
  }
];
```

### Customizing Response Templates

```typescript
// In response-templates.ts
export const RESPONSE_TEMPLATES = {
  frustrated: {
    en: {
      opening: [
        "Your custom opening phrase here...",
        // Add more variations
      ],
      // ...
    }
  }
};
```

### Disabling Emotion Detection

```typescript
// In AITravelAssistant.tsx
const ENABLE_EMOTION_DETECTION = process.env.NEXT_PUBLIC_ENABLE_EMOTION_DETECTION !== 'false';

if (ENABLE_EMOTION_DETECTION) {
  const emotionAnalysis = detectEmotion(userMessage);
  // ...
} else {
  // Use default behavior
}
```

## Conclusion

The Emotion Detection System transforms the AI Travel Assistant from a simple Q&A bot into an empathetic, responsive companion that truly understands and adapts to user needs. By detecting and responding to emotions, we create more human-like interactions that build trust and improve satisfaction.
