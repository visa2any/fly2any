# Emotion Detection System - Quick Start Guide

## What is it?

The Emotion Detection System makes your AI Travel Assistant **empathetic and responsive** to user emotions. It automatically detects when users are frustrated, confused, excited, or worried, and adapts responses accordingly.

## Key Features

- **8 Emotional States**: Urgent, Frustrated, Worried, Confused, Excited, Satisfied, Casual, Neutral
- **Adaptive Responses**: Different tone and pacing for each emotion
- **Smart Routing**: Escalates frustrated/urgent users to crisis management team
- **Visual Indicators**: Color-coded badges showing detected emotion
- **Multilingual**: Full support for English, Portuguese, and Spanish
- **Analytics Ready**: Track emotional trends and satisfaction

## Quick Integration (3 Steps)

### Step 1: Import the Helper

```typescript
import {
  processEmotionalMessage,
  analyzeUserEmotion
} from '@/lib/ai/emotion-aware-assistant';
```

### Step 2: Detect Emotion on User Message

```typescript
const handleSendMessage = async () => {
  const userMessageText = inputMessage;

  // Detect emotion
  const emotionAnalysis = analyzeUserEmotion(userMessageText);

  // Generate response with emotion awareness
  const result = processEmotionalMessage({
    userMessage: userMessageText,
    baseConsultantTeam: 'customer-service',
    language: 'en',
    mainContent: "I'll help you with that right away."
  });

  // Use result.content for the response
  // Use result.typingDelay for realistic timing
  // Use result.consultant for the right team member
};
```

### Step 3: Show Visual Indicator (Optional)

```tsx
import { EmotionalIndicator } from '@/components/ai/EmotionalIndicator';

<EmotionalIndicator
  emotion={emotionAnalysis.emotion}
  confidence={emotionAnalysis.confidence}
  urgency={emotionAnalysis.urgency}
/>
```

## Examples

### Example 1: Handling Frustrated User

**User says**: "This is unacceptable! My flight was cancelled!"

**System detects**:
- Emotion: `frustrated`
- Confidence: 0.85
- Urgency: `high`
- Routes to: Crisis Management (Captain Mike)

**Response includes**:
- Opening: "I'm really sorry you're experiencing this frustration."
- Faster typing speed (1.3x)
- Empathetic tone
- Closing: "I'm committed to making this right for you."

### Example 2: Handling Confused User

**User says**: "I don't understand the baggage policy"

**System detects**:
- Emotion: `confused`
- Confidence: 0.75
- Urgency: `medium`
- Routes to: Original consultant

**Response includes**:
- Opening: "No worries, let me explain this clearly step by step."
- Slower typing speed (0.9x for clarity)
- Bullet points enabled
- Detailed explanation mode
- Closing: "Does this make sense? Feel free to ask if you need more clarification!"

### Example 3: Handling Excited User

**User says**: "I'm so excited! This is my dream vacation!"

**System detects**:
- Emotion: `excited`
- Confidence: 0.8
- Urgency: `low`
- Routes to: Original consultant

**Response includes**:
- Opening: "That's wonderful! I'm excited to help you with this!"
- Faster typing speed (1.1x)
- Enthusiastic tone with exclamation points
- Closing: "This is going to be fantastic!"

## Testing Your Integration

Run the test suite to verify everything works:

```typescript
import { runAllTests } from '@/lib/ai/emotion-detection.test';

// In your test file or console
runAllTests();
```

Or test individual messages:

```typescript
import { detectEmotion } from '@/lib/ai/emotion-detection';

const result = detectEmotion("Help! My flight was cancelled!");
console.log(result);
// {
//   emotion: 'urgent',
//   confidence: 0.9,
//   urgency: 'high',
//   keywords: ['help', 'cancelled'],
//   responseStrategy: 'professional',
//   typingSpeedMultiplier: 1.5,
//   priority: 'high'
// }
```

## Visual Indicators

Each emotion has a distinct visual style:

| Emotion | Color | Icon | Pulse |
|---------|-------|------|-------|
| Urgent | Red | 🚨 | Yes |
| Frustrated | Orange | 😤 | No |
| Worried | Yellow | 😰 | No |
| Confused | Blue | ❓ | No |
| Excited | Green | 🎉 | No |
| Satisfied | Teal | ✅ | No |
| Casual | Gray | 💬 | No |
| Neutral | Gray | 😐 | No |

## Response Speed Adjustments

| Emotion | Typing Speed | Why |
|---------|--------------|-----|
| Urgent | 1.5x faster | Immediate response needed |
| Frustrated | 1.3x faster | Quick resolution shows care |
| Excited | 1.1x faster | Match enthusiasm |
| Confused | 0.9x slower | More time for clarity |
| Others | Normal | Standard pace |

## Analytics Tracking

Track emotional trends:

```typescript
import { extractEmotionMetrics } from '@/lib/ai/emotion-aware-assistant';

const metrics = extractEmotionMetrics(emotionAnalysis);

analytics.trackEvent('emotion_detected', metrics);
// {
//   emotion: 'frustrated',
//   confidence: 0.85,
//   urgency: 'high',
//   priority: 'high',
//   responseStrategy: 'empathetic',
//   keywords: 'frustrated, terrible',
//   shouldEscalate: true
// }
```

## Consultant Routing

The system automatically routes to the right consultant:

- **Urgent/Frustrated** → Captain Mike (Crisis Management)
- **Worried** → Lisa (Customer Service)
- **Others** → Based on query content

```typescript
import { getConsultantForEmotion } from '@/lib/ai/emotion-detection';

const consultantTeam = getConsultantForEmotion(
  emotionAnalysis.emotion,
  'flight-operations' // base team
);
// Returns: 'crisis-management' for urgent/frustrated
```

## Configuration

### Enable/Disable

```typescript
// In your .env.local
NEXT_PUBLIC_ENABLE_EMOTION_DETECTION=true
```

### Adjust Confidence Thresholds

Edit `lib/ai/emotion-detection.ts`:

```typescript
{
  keywords: [...],
  emotion: 'frustrated',
  confidence: 0.85, // Lower = more sensitive
  // ...
}
```

### Customize Response Templates

Edit `lib/ai/response-templates.ts`:

```typescript
frustrated: {
  en: {
    opening: [
      "Your custom phrase here",
      // Add more variations
    ],
    // ...
  }
}
```

## Common Patterns

### Pattern 1: Basic Integration

```typescript
const handleMessage = (userMessage: string) => {
  const result = processEmotionalMessage({
    userMessage,
    baseConsultantTeam: 'customer-service',
    language: 'en',
    mainContent: generateAIResponse(userMessage)
  });

  displayMessage(result.content, result.consultant);
};
```

### Pattern 2: With Typing Simulation

```typescript
const handleMessage = async (userMessage: string) => {
  const result = processEmotionalMessage({
    userMessage,
    baseConsultantTeam: 'customer-service',
    language: 'en',
    mainContent: generateAIResponse(userMessage)
  });

  // Show thinking
  setIsTyping(true);
  await delay(result.thinkingDelay);

  // Show typing
  await delay(result.typingDelay);

  // Show message
  displayMessage(result.content, result.consultant);
  setIsTyping(false);
};
```

### Pattern 3: With Escalation Check

```typescript
import { shouldEscalateToCrisis } from '@/lib/ai/emotion-aware-assistant';

const handleMessage = (userMessage: string) => {
  const emotion = analyzeUserEmotion(userMessage);

  if (shouldEscalateToCrisis(emotion)) {
    notifySupport('High priority customer needs assistance');
  }

  const result = processEmotionalMessage({
    userMessage,
    baseConsultantTeam: 'customer-service',
    language: 'en',
    mainContent: generateAIResponse(userMessage)
  });

  displayMessage(result.content, result.consultant);
};
```

## Troubleshooting

### Emotion not detected correctly

1. Check if keywords match your use case
2. Adjust confidence thresholds
3. Add more keyword patterns in `emotion-detection.ts`

### Response seems wrong

1. Verify the `mainContent` you're passing
2. Check language setting matches user
3. Review response templates for that emotion

### Visual indicator not showing

1. Ensure confidence >= 0.6
2. Check emotion is not 'neutral'
3. Verify EmotionalIndicator component is imported

## Next Steps

1. **Integrate into AITravelAssistant**: See `EMOTION_DETECTION_INTEGRATION_EXAMPLE.tsx`
2. **Customize Response Templates**: Edit `lib/ai/response-templates.ts`
3. **Add More Emotions**: Extend `lib/ai/emotion-detection.ts`
4. **Track Analytics**: Use `extractEmotionMetrics()` with your analytics service

## Full Documentation

- **Complete Guide**: `docs/EMOTION_DETECTION_SYSTEM.md`
- **Integration Example**: `lib/ai/EMOTION_DETECTION_INTEGRATION_EXAMPLE.tsx`
- **Test Suite**: `lib/ai/emotion-detection.test.ts`

## Support

Need help? Check:
1. Test cases in `emotion-detection.test.ts`
2. Integration examples
3. Full documentation

---

**Built with empathy for better user experiences** 💙
