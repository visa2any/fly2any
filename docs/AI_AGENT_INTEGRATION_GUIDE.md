# AI Agent Integration Guide

## Overview

This guide shows you how to integrate the AI Agent conversation system into your `AITravelAssistant.tsx` component to transform it from a passive chatbot into a proactive travel agent.

## Architecture

The AI Agent system consists of 4 main modules:

1. **`agent-conversation-flow.ts`** - State machine & data structures
2. **`agent-question-bank.ts`** - Pre-defined questions & responses
3. **`agent-information-extraction.ts`** - Natural language understanding
4. **`agent-proactive-behavior.ts`** - Decision making & initiative

## Quick Start

### Step 1: Import the Agent Modules

```typescript
// In your AITravelAssistant.tsx or chat component

import {
  ConversationFlow,
  initializeConversationFlow,
  updateConversationFlow,
  canProceedToSearch,
  addToConversationHistory,
} from '@/lib/ai/agent-conversation-flow';

import {
  extractAllInformation,
  getExtractionConfidence,
} from '@/lib/ai/agent-information-extraction';

import {
  generateProactiveMessage,
  shouldProactivelyEngage,
  enhanceResponse,
} from '@/lib/ai/agent-proactive-behavior';

import {
  getTimeBasedGreeting,
} from '@/lib/ai/agent-question-bank';
```

### Step 2: Initialize Conversation State

```typescript
// In your component state
const [conversationFlow, setConversationFlow] = useState<ConversationFlow>(
  initializeConversationFlow()
);

// Initialize with a greeting when chat opens
useEffect(() => {
  if (messages.length === 0) {
    const greeting = getTimeBasedGreeting();
    // Add greeting to messages
    setMessages([{
      role: 'assistant',
      content: greeting,
      timestamp: new Date(),
    }]);
  }
}, []);
```

### Step 3: Process User Messages

```typescript
const handleUserMessage = async (userMessage: string) => {
  // 1. Extract information from user message
  const extractedInfo = extractAllInformation(userMessage);
  const confidence = getExtractionConfidence(userMessage, extractedInfo);

  console.log('Extracted:', extractedInfo, 'Confidence:', confidence);

  // 2. Update conversation flow
  const updatedFlow = updateConversationFlow(
    conversationFlow,
    userMessage,
    extractedInfo
  );

  // 3. Generate proactive agent response
  const proactiveMessage = generateProactiveMessage(updatedFlow, userMessage);

  // 4. Update state
  setConversationFlow(updatedFlow);

  // 5. Handle actions
  if (proactiveMessage.shouldExecuteSearch) {
    // Execute search
    await performSearch(updatedFlow.collectedInfo);
  }

  if (proactiveMessage.shouldPresentOptions) {
    // Present search results
    presentSearchResults();
  }

  // 6. Add agent response to chat
  const enhancedMessage = enhanceResponse(proactiveMessage.message, updatedFlow);

  addMessage({
    role: 'assistant',
    content: enhancedMessage,
    timestamp: new Date(),
  });

  // 7. Track in conversation history
  const flowWithHistory = addToConversationHistory(
    updatedFlow,
    userMessage,
    enhancedMessage
  );

  setConversationFlow(flowWithHistory);
};
```

### Step 4: Execute Search When Ready

```typescript
useEffect(() => {
  if (canProceedToSearch(conversationFlow) && !conversationFlow.context.searchAttempted) {
    // Mark as attempted
    setConversationFlow(prev => ({
      ...prev,
      context: {
        ...prev.context,
        searchAttempted: true,
      },
    }));

    // Execute search
    performFlightSearch();
  }
}, [conversationFlow]);

const performFlightSearch = async () => {
  const { collectedInfo } = conversationFlow;

  try {
    const response = await fetch('/api/flights/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        origin: collectedInfo.origin,
        destination: collectedInfo.destination,
        departureDate: collectedInfo.dates?.departure,
        returnDate: collectedInfo.dates?.return,
        passengers: {
          adults: collectedInfo.travelers?.adults || 1,
          children: collectedInfo.travelers?.children || 0,
          infants: collectedInfo.travelers?.infants || 0,
        },
        cabinClass: collectedInfo.budget === 'luxury' ? 'first' :
                   collectedInfo.budget === 'premium' ? 'business' : 'economy',
      }),
    });

    const results = await response.json();

    // Update flow with results
    setConversationFlow(prev => ({
      ...prev,
      context: {
        ...prev.context,
        optionsPresented: true,
      },
    }));

    // Present results to user
    presentResults(results);

  } catch (error) {
    console.error('Search failed:', error);
    // Handle error with agent message
  }
};
```

### Step 5: Add Proactive Engagement

```typescript
// Proactively engage if user is silent/stuck
useEffect(() => {
  const lastMessage = messages[messages.length - 1];
  if (!lastMessage || lastMessage.role !== 'user') return;

  const timerId = setTimeout(() => {
    const timeSinceLastMessage = Date.now() - lastMessage.timestamp.getTime();

    if (shouldProactivelyEngage(conversationFlow, timeSinceLastMessage)) {
      const engagementMessage = generateProactiveEngagement(conversationFlow);

      addMessage({
        role: 'assistant',
        content: engagementMessage,
        timestamp: new Date(),
      });
    }
  }, 30000); // Check after 30 seconds

  return () => clearTimeout(timerId);
}, [messages, conversationFlow]);
```

### Step 6: Display Collected Information

```typescript
// Show progress to user
import { getProgressPercentage, generateCollectedInfoSummary } from '@/lib/ai/agent-conversation-flow';

const TripSummary = () => {
  const summary = generateCollectedInfoSummary(conversationFlow.collectedInfo);
  const progress = getProgressPercentage(conversationFlow);

  return (
    <div className="bg-blue-50 p-4 rounded-lg mb-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">Trip Details</h3>
        <span className="text-sm text-gray-600">{progress}% Complete</span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {summary && (
        <p className="text-sm text-gray-700">{summary}</p>
      )}
    </div>
  );
};
```

## Complete Example Integration

Here's a complete example showing how to integrate everything:

```typescript
'use client';

import { useState, useEffect, useRef } from 'react';
import {
  ConversationFlow,
  initializeConversationFlow,
  updateConversationFlow,
  canProceedToSearch,
  addToConversationHistory,
  getProgressPercentage,
} from '@/lib/ai/agent-conversation-flow';

import {
  extractAllInformation,
} from '@/lib/ai/agent-information-extraction';

import {
  generateProactiveMessage,
  enhanceResponse,
} from '@/lib/ai/agent-proactive-behavior';

import {
  getTimeBasedGreeting,
} from '@/lib/ai/agent-question-bank';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AITravelAssistantAgent() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationFlow, setConversationFlow] = useState<ConversationFlow>(
    initializeConversationFlow()
  );

  // Initialize with greeting
  useEffect(() => {
    if (messages.length === 0) {
      const greeting = getTimeBasedGreeting();
      setMessages([{
        role: 'assistant',
        content: greeting,
        timestamp: new Date(),
      }]);
    }
  }, []);

  // Auto-search when ready
  useEffect(() => {
    if (canProceedToSearch(conversationFlow) && !conversationFlow.context.searchAttempted) {
      handleAutoSearch();
    }
  }, [conversationFlow]);

  const handleAutoSearch = async () => {
    // Mark as attempted to prevent re-triggering
    setConversationFlow(prev => ({
      ...prev,
      context: {
        ...prev.context,
        searchAttempted: true,
      },
    }));

    // Show searching message
    addAssistantMessage("🔍 Perfect! Let me search for the best options for you...");

    // Simulate search (replace with real API call)
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Present results
    addAssistantMessage(
      "Great news! I found several excellent options. Here are the top 3 flights I recommend..."
    );

    setConversationFlow(prev => ({
      ...prev,
      context: {
        ...prev.context,
        optionsPresented: true,
      },
    }));
  };

  const addAssistantMessage = (content: string) => {
    setMessages(prev => [...prev, {
      role: 'assistant',
      content,
      timestamp: new Date(),
    }]);
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    // Add user message
    setMessages(prev => [...prev, {
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    }]);

    // Extract information
    const extractedInfo = extractAllInformation(userMessage);

    // Update conversation flow
    const updatedFlow = updateConversationFlow(
      conversationFlow,
      userMessage,
      extractedInfo
    );

    // Generate proactive response
    const proactiveMessage = generateProactiveMessage(updatedFlow, userMessage);

    // Enhance response with personality
    const enhancedMessage = enhanceResponse(proactiveMessage.message, updatedFlow);

    // Add to conversation history
    const flowWithHistory = addToConversationHistory(
      updatedFlow,
      userMessage,
      enhancedMessage
    );

    setConversationFlow(flowWithHistory);

    // Simulate thinking delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Add assistant response
    addAssistantMessage(enhancedMessage);

    setIsLoading(false);
  };

  const progress = getProgressPercentage(conversationFlow);

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="p-4 bg-white border-b">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-lg">Trip Planning Progress</h3>
          <span className="text-sm text-gray-600">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-900'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg">
              <span className="inline-block animate-pulse">Thinking...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !input.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
```

## Advanced Features

### Context Persistence

Save conversation flow to localStorage:

```typescript
useEffect(() => {
  localStorage.setItem('conversationFlow', JSON.stringify(conversationFlow));
}, [conversationFlow]);

// Load on mount
useEffect(() => {
  const saved = localStorage.getItem('conversationFlow');
  if (saved) {
    setConversationFlow(JSON.parse(saved));
  }
}, []);
```

### Multiple Intents

Handle users who want to book both flights and hotels:

```typescript
if (extractedInfo.serviceType === 'package') {
  // Handle both flight and hotel search
  await Promise.all([
    searchFlights(collectedInfo),
    searchHotels(collectedInfo),
  ]);
}
```

### Smart Suggestions

When destination is vague, suggest popular options:

```typescript
if (conversationFlow.context.userSeemsUnsure && !conversationFlow.collectedInfo.destination) {
  showDestinationSuggestions([
    { name: 'Paris', emoji: '🗼', tagline: 'City of Lights' },
    { name: 'Bali', emoji: '🏝️', tagline: 'Tropical Paradise' },
    { name: 'Tokyo', emoji: '🗾', tagline: 'Modern Meets Traditional' },
  ]);
}
```

### Voice Integration

Add voice input for natural conversation:

```typescript
const startVoiceInput = () => {
  const recognition = new (window as any).webkitSpeechRecognition();
  recognition.onresult = (event: any) => {
    const transcript = event.results[0][0].transcript;
    setInput(transcript);
  };
  recognition.start();
};
```

## Testing

### Test Scenarios

1. **Complete Happy Path**
   ```
   User: "Hi"
   Agent: "Hello! Are you looking for flights, hotels, or both?"
   User: "Flight"
   Agent: "Perfect! Where would you like to go?"
   User: "Paris"
   Agent: "Paris is amazing! Where will you be flying from?"
   User: "New York"
   Agent: "Great! When would you like to depart?"
   User: "November 15"
   Agent: "Perfect! How many people?"
   User: "2"
   Agent: "Got it! Searching now..."
   ```

2. **Vague User**
   ```
   User: "I want to travel"
   Agent: "Wonderful! Are you thinking vacation or business?"
   User: "vacation"
   Agent: "Exciting! Where would you like to go?"
   User: "somewhere warm"
   Agent: "Great choice! Caribbean, Mediterranean, or Southeast Asia?"
   ```

3. **All-at-Once User**
   ```
   User: "I need a flight from NYC to LA on Nov 15 for 2 people"
   Agent: "Perfect! I have everything. Searching for flights now..."
   ```

## Troubleshooting

### Issue: Agent Repeats Questions

**Solution**: Check that `updateConversationFlow` is properly updating `collectedInfo`

### Issue: Search Triggers Too Early

**Solution**: Verify `canProceedToSearch` conditions and ensure all required fields are collected

### Issue: Extraction Not Working

**Solution**: Check `extractAllInformation` patterns and add more keywords for your specific use case

## Best Practices

1. **Always provide feedback** - Show users their info is being collected
2. **Be conversational** - Use natural language, not form-like questions
3. **Guide, don't interrogate** - Mix questions with affirmations and suggestions
4. **Handle errors gracefully** - If search fails, offer alternatives
5. **Show progress** - Visual indicators help users feel progress
6. **Remember context** - Reference previously collected information

## Next Steps

1. Integrate with your existing search APIs
2. Add result presentation components
3. Implement booking flow
4. Add analytics to track conversation success
5. A/B test different question styles
6. Add multilingual support
7. Implement voice input/output

---

For questions or issues, refer to the individual module files for detailed implementation notes.
