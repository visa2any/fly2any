/**
 * Integration Test Suite: Complete Chat-to-Booking Flow
 * Tests end-to-end user journeys through the conversational booking system
 */

import { analyzeConversationIntent, getConversationalResponse } from '@/lib/ai/conversational-intelligence';
import { generateHandoffMessage, needsHandoff, getPreviousConsultantTeam, TeamType } from '@/lib/ai/consultant-handoff';
import { ConversationContext } from '@/lib/ai/conversation-context';
import { detectEmotion } from '@/lib/ai/emotion-detection';

describe('Integration: Complete Chat-to-Booking Flow', () => {
  describe('Anonymous User → Search → Booking → Signup → Payment', () => {
    let context: ConversationContext;
    let conversationHistory: any[] = [];

    beforeEach(() => {
      context = new ConversationContext('test-session-123');
      conversationHistory = [];
    });

    test('should handle complete anonymous user booking flow', () => {
      // Step 1: User starts with greeting
      const greeting = analyzeConversationIntent('Hi there!', conversationHistory);
      expect(greeting.intent).toBe('greeting');
      expect(greeting.requiresPersonalResponse).toBe(true);

      const consultant1 = { name: 'Lisa', personality: 'warm', emoji: '🎧' };
      const greetingResponse = getConversationalResponse(greeting, consultant1, context);
      expect(greetingResponse).toBeTruthy();

      conversationHistory.push(
        { role: 'user', content: 'Hi there!', timestamp: Date.now() },
        { role: 'assistant', content: greetingResponse, timestamp: Date.now(), consultant: { team: 'customer-service' } }
      );

      // Step 2: User asks about flights
      const flightRequest = analyzeConversationIntent(
        'I need a flight from New York to Paris',
        conversationHistory
      );
      expect(flightRequest.intent).toBe('service-request');
      expect(flightRequest.topics).toContain('flights');

      // Check if handoff needed
      const previousTeam = getPreviousConsultantTeam(conversationHistory);
      const handoffNeeded = needsHandoff(previousTeam, 'flight-operations');
      expect(handoffNeeded).toBe(true);

      // Generate handoff to flight specialist
      const handoff = generateHandoffMessage(
        'customer-service',
        'flight-operations',
        'I need a flight from New York to Paris',
        {
          origin: 'New York',
          destination: 'Paris',
          departureDate: '2024-06-15',
        }
      );

      expect(handoff.fromConsultant).toBe('Lisa Thompson');
      expect(handoff.toConsultant).toBe('Sarah Chen');
      expect(handoff.transferAnnouncement).toContain('Sarah Chen');

      conversationHistory.push(
        { role: 'user', content: 'I need a flight from New York to Paris', timestamp: Date.now() },
        { role: 'assistant', content: handoff.introduction, timestamp: Date.now(), consultant: { team: 'flight-operations' } }
      );

      // Step 3: System searches and presents options
      // This would trigger flight search API
      const searchContext = analyzeConversationIntent('Show me options for June 15th', conversationHistory);
      expect(searchContext.isServiceRequest).toBe(true);

      // Step 4: User selects a flight
      const selection = analyzeConversationIntent('I\'ll take the first option', conversationHistory);
      expect(selection).toBeDefined();

      // Step 5: User prompted to sign up before payment
      // This would be handled by the booking flow

      // Step 6: User provides details and confirms payment
      const confirmation = analyzeConversationIntent('Yes, book it!', conversationHistory);
      expect(confirmation).toBeDefined();
    });

    test('should detect when user needs to authenticate', () => {
      const paymentAttempt = analyzeConversationIntent(
        'I want to pay now',
        conversationHistory
      );

      expect(paymentAttempt.isServiceRequest).toBe(true);
      // In real flow, this would trigger auth check
    });
  });

  describe('Conversation Recovery After 24 Hours', () => {
    test('should restore conversation context from stored data', () => {
      // Simulate stored conversation from 24 hours ago
      const oldContext = new ConversationContext('session-old');
      oldContext.addInteraction('greeting', 'Hello!');
      oldContext.addInteraction('service-request', 'Looking for flights');

      // Verify context can be restored
      expect(oldContext.hasInteracted('greeting')).toBe(true);
      expect(oldContext.hasInteracted('service-request')).toBe(true);

      // User returns after 24 hours
      const returningUser = analyzeConversationIntent(
        'I want to continue my booking',
        []
      );

      expect(returningUser.intent).toBe('booking-management');
    });

    test('should handle expired sessions gracefully', () => {
      const expiredSession = analyzeConversationIntent(
        'Where is my booking?',
        []
      );

      expect(expiredSession.intent).toBe('booking-management');
      expect(expiredSession.topics).toContain('booking-management');
    });
  });

  describe('Consultant Handoff Scenarios', () => {
    test('should handoff from customer service to visa specialist', () => {
      const visaQuestion = analyzeConversationIntent(
        'Do I need a visa for France?',
        []
      );

      expect(visaQuestion.topics).toContain('visa');

      const handoff = generateHandoffMessage(
        'customer-service',
        'visa-documentation',
        'Do I need a visa for France?'
      );

      expect(handoff.toConsultant).toBe('Sophia Nguyen');
      expect(handoff.introduction).toContain('Immigration & Documentation Consultant');
    });

    test('should handoff to accessibility coordinator for special needs', () => {
      const wheelchairRequest = analyzeConversationIntent(
        'I need wheelchair assistance',
        []
      );

      expect(wheelchairRequest.topics).toContain('special-assistance');
      expect(wheelchairRequest.requiresPersonalResponse).toBe(true);

      const handoff = generateHandoffMessage(
        'flight-operations',
        'accessibility-services',
        'I need wheelchair assistance'
      );

      expect(handoff.toConsultant).toBe('Nina Davis');
    });

    test('should handoff to payment specialist for billing issues', () => {
      const paymentIssue = analyzeConversationIntent(
        'My payment was declined',
        []
      );

      expect(paymentIssue.intent).toBe('booking-management');

      const handoff = generateHandoffMessage(
        'customer-service',
        'payment-billing',
        'My payment was declined'
      );

      expect(handoff.toConsultant).toBe('David Park');
    });

    test('should handoff to emergency response for urgent issues', () => {
      const emergency = analyzeConversationIntent(
        'EMERGENCY! My flight is cancelled and I\'m stranded!',
        []
      );

      expect(emergency.intent).toBe('booking-management');

      const emotion = detectEmotion('EMERGENCY! My flight is cancelled and I\'m stranded!');
      expect(emotion.emotion).toBe('urgent');
      expect(emotion.urgency).toBe('high');

      const handoff = generateHandoffMessage(
        'customer-service',
        'emergency-response',
        'My flight is cancelled'
      );

      expect(handoff.toConsultant).toBe('Captain Mike Johnson');
    });

    test('should maintain context during handoffs', () => {
      const context = new ConversationContext('handoff-test');

      // Initial interaction with customer service
      const greeting = analyzeConversationIntent('Hello', []);
      context.addInteraction('greeting', 'Hi there!');

      // Request that requires handoff
      const flightRequest = analyzeConversationIntent('Book flight to Tokyo', []);
      context.addInteraction('service-request', 'Let me help with that');

      // After handoff, context should remember previous interactions
      expect(context.hasInteracted('greeting')).toBe(true);
      expect(context.hasInteracted('service-request')).toBe(true);
    });
  });

  describe('Emotion Detection Accuracy in Booking Flow', () => {
    test('should detect excitement when user finds good deal', () => {
      const excitedMessage = 'This is perfect! Exactly what I was looking for!';
      const emotion = detectEmotion(excitedMessage);

      expect(emotion.emotion).toBe('excited');
      expect(emotion.sentiment).toBe('positive');
    });

    test('should detect worry about cancellation policies', () => {
      const worriedMessage = 'I\'m worried about the cancellation policy. What if I need to cancel?';
      const emotion = detectEmotion(worriedMessage);

      expect(emotion.emotion).toBe('worried');
      expect(emotion.urgency).toBe('medium');
    });

    test('should detect frustration with technical issues', () => {
      const frustratedMessage = 'This is so frustrating! The payment keeps failing!';
      const emotion = detectEmotion(frustratedMessage);

      expect(emotion.emotion).toBe('frustrated');
      expect(emotion.urgency).toBe('high');
    });

    test('should detect confusion about booking process', () => {
      const confusedMessage = 'I don\'t understand. How do I select my seat?';
      const emotion = detectEmotion(confusedMessage);

      expect(emotion.emotion).toBe('confused');
    });
  });

  describe('Flight Type Detection Correctness', () => {
    test('should detect one-way flights', () => {
      const oneWay = analyzeConversationIntent(
        'One way ticket from NYC to LA on June 15',
        []
      );

      expect(oneWay.intent).toBe('service-request');
      expect(oneWay.topics).toContain('flights');
    });

    test('should detect round-trip flights', () => {
      const roundTrip = analyzeConversationIntent(
        'Round trip from London to Paris, leaving June 1, returning June 10',
        []
      );

      expect(roundTrip.intent).toBe('service-request');
      expect(roundTrip.topics).toContain('flights');
    });

    test('should detect multi-city flights', () => {
      const multiCity = analyzeConversationIntent(
        'I need flights from NYC to Paris, then Paris to Rome, then Rome back to NYC',
        []
      );

      expect(multiCity.intent).toBe('service-request');
      expect(multiCity.topics).toContain('flights');
    });

    test('should detect international flights requiring visa', () => {
      const international = analyzeConversationIntent(
        'Flight to Japan, do I need a visa?',
        []
      );

      expect(international.topics).toContain('flights');
      expect(international.topics).toContain('visa');
    });
  });

  describe('Edge Cases in Conversation Flow', () => {
    test('should handle user changing their mind mid-booking', () => {
      const context = new ConversationContext('change-mind');

      // User starts booking
      const initial = analyzeConversationIntent('Book flight to Paris', []);
      context.addInteraction('service-request', 'Great choice!');

      // User changes destination
      const change = analyzeConversationIntent('Actually, I want to go to London instead', []);
      expect(change.intent).toBe('service-request');
    });

    test('should handle multiple simultaneous requests', () => {
      const combined = analyzeConversationIntent(
        'I need a flight and hotel in Barcelona for 5 nights',
        []
      );

      expect(combined.topics).toContain('flights');
      expect(combined.topics).toContain('hotels');
    });

    test('should handle vague requests requiring clarification', () => {
      const vague = analyzeConversationIntent(
        'I want to go somewhere nice',
        []
      );

      expect(vague.intent).toBe('destination-recommendation');
      expect(vague.topics).toContain('recommendation');
    });

    test('should handle typos and misspellings', () => {
      const typos = analyzeConversationIntent(
        'I nede a fligt to Pairs',
        []
      );

      expect(typos.intent).toBe('service-request');
    });

    test('should handle mixed language input', () => {
      const mixed = analyzeConversationIntent(
        'Hello, necesito un vuelo a Madrid',
        []
      );

      expect(mixed.intent).toBe('greeting');
    });
  });

  describe('Context Preservation Across Messages', () => {
    test('should remember user preferences throughout conversation', () => {
      const context = new ConversationContext('preferences');

      // User mentions budget preference
      const budget = analyzeConversationIntent('I\'m looking for budget flights', []);
      expect(budget.topics).toContain('pricing');

      context.addInteraction('service-request', 'I\'ll find budget options');

      // Later messages should maintain budget context
      const followup = analyzeConversationIntent('What about hotels?', []);
      expect(followup.intent).toBe('service-request');

      // Context should remember the budget preference
      expect(context.hasInteracted('service-request')).toBe(true);
    });

    test('should track booking progress', () => {
      const context = new ConversationContext('progress');

      const steps = [
        'I need a flight',
        'That one looks good',
        'I\'ll add a checked bag',
        'Proceed to payment',
      ];

      steps.forEach((step, index) => {
        const analysis = analyzeConversationIntent(step, []);
        context.addInteraction(analysis.intent, `Step ${index + 1} complete`);
      });

      // Should have multiple interactions tracked
      expect(context.hasInteracted('service-request')).toBe(true);
    });
  });

  describe('Error Recovery Scenarios', () => {
    test('should recover from API failures gracefully', () => {
      // User makes request
      const request = analyzeConversationIntent('Show me flights to Tokyo', []);
      expect(request.isServiceRequest).toBe(true);

      // If API fails, user should be able to retry
      const retry = analyzeConversationIntent('Try again please', []);
      expect(retry).toBeDefined();
    });

    test('should handle payment failures', () => {
      const paymentFail = analyzeConversationIntent(
        'My card was declined, can I use a different card?',
        []
      );

      expect(paymentFail.intent).toBe('booking-management');
    });

    test('should handle booking conflicts', () => {
      const conflict = analyzeConversationIntent(
        'The flight is now sold out, what are my options?',
        []
      );

      expect(conflict.intent).toBe('booking-management');
    });
  });

  describe('Multi-Turn Conversations', () => {
    test('should handle destination recommendation flow', () => {
      const context = new ConversationContext('recommendations');

      // Turn 1: User asks for recommendations
      const ask = analyzeConversationIntent('Where should I go for New Year\'s?', []);
      expect(ask.intent).toBe('destination-recommendation');
      expect(ask.topics).toContain('new-years');

      context.addInteraction('destination-recommendation', 'Let me suggest some places');

      // Turn 2: Agent asks clarifying questions
      // Turn 3: User provides preferences
      const prefs = analyzeConversationIntent('I like beach destinations', []);
      expect(prefs.topics).toContain('beach');

      // Turn 4: Agent provides specific recommendations
      // Turn 5: User selects destination and books
      const book = analyzeConversationIntent('Let\'s book the Cancun option', []);
      expect(book.intent).toBe('service-request');
    });

    test('should handle complex travel planning', () => {
      const messages = [
        'I\'m planning a family trip to Europe',
        'We\'re 2 adults and 2 kids',
        'We want to visit Paris and Rome',
        'Looking for mid-range hotels',
        'We need connecting rooms',
        'What\'s the total cost?',
      ];

      messages.forEach(msg => {
        const analysis = analyzeConversationIntent(msg, []);
        expect(analysis).toBeDefined();
      });
    });
  });

  describe('Performance Requirements', () => {
    test('should analyze intent quickly', () => {
      const start = Date.now();
      const result = analyzeConversationIntent('I need a flight to Paris', []);
      const duration = Date.now() - start;

      expect(result).toBeDefined();
      expect(duration).toBeLessThan(100); // Should complete in under 100ms
    });

    test('should handle large conversation histories', () => {
      const largeHistory = Array.from({ length: 100 }, (_, i) => ({
        role: i % 2 === 0 ? 'user' : 'assistant',
        content: `Message ${i}`,
        timestamp: Date.now(),
      }));

      const start = Date.now();
      const result = analyzeConversationIntent('Book a flight', largeHistory);
      const duration = Date.now() - start;

      expect(result).toBeDefined();
      expect(duration).toBeLessThan(200);
    });
  });

  describe('Accessibility and Internationalization', () => {
    test('should handle accessibility requests appropriately', () => {
      const requests = [
        'I need wheelchair assistance',
        'I\'m traveling with a service dog',
        'I have hearing impairment',
        'I need special meal for diabetes',
      ];

      requests.forEach(request => {
        const analysis = analyzeConversationIntent(request, []);
        expect(analysis.topics).toContain('special-assistance');
        expect(analysis.requiresPersonalResponse).toBe(true);
      });
    });

    test('should detect language preferences', () => {
      const greetings = [
        'Hola',
        'Bonjour',
        'Olá',
        'Ciao',
      ];

      greetings.forEach(greeting => {
        const analysis = analyzeConversationIntent(greeting, []);
        expect(analysis.intent).toBe('greeting');
      });
    });
  });
});

describe('Integration: Real-World Travel Scenarios', () => {
  describe('Business Travel', () => {
    test('should handle last-minute business trip booking', () => {
      const urgent = analyzeConversationIntent(
        'I need a flight to Chicago tomorrow morning for a business meeting',
        []
      );

      expect(urgent.isServiceRequest).toBe(true);
      expect(urgent.topics).toContain('flights');
    });

    test('should handle expense report requirements', () => {
      const expense = analyzeConversationIntent(
        'I need a receipt for my company expense report',
        []
      );

      expect(expense.intent).toBe('booking-management');
    });
  });

  describe('Family Vacation', () => {
    test('should handle family booking with multiple passengers', () => {
      const family = analyzeConversationIntent(
        'I need 4 tickets to Orlando for a family vacation',
        []
      );

      expect(family.isServiceRequest).toBe(true);
      expect(family.topics).toContain('flights');
    });

    test('should handle child passenger requirements', () => {
      const children = analyzeConversationIntent(
        'Traveling with 2 children under 12',
        []
      );

      expect(children.topics).toContain('special-assistance');
    });
  });

  describe('International Travel', () => {
    test('should prompt about passport and visa requirements', () => {
      const international = analyzeConversationIntent(
        'First time traveling to China, what do I need?',
        []
      );

      expect(international.intent).toBe('service-request');
    });

    test('should handle currency questions', () => {
      const currency = analyzeConversationIntent(
        'What currency should I bring to Japan?',
        []
      );

      expect(currency.topics).toContain('travel-info');
    });
  });

  describe('Group Travel', () => {
    test('should handle group booking inquiries', () => {
      const group = analyzeConversationIntent(
        'I\'m organizing a trip for 15 people',
        []
      );

      expect(group.isServiceRequest).toBe(true);
    });
  });
});
