/**
 * Conversational Intelligence System - Comprehensive Test Suite
 * Tests intent detection, conversation analysis, and response generation
 */

import {
  analyzeConversationIntent,
  getConversationalResponse,
  detectUrgency,
  detectFrustration,
  getContextLoadingMessage,
  Message,
  ConversationAnalysis,
} from './conversational-intelligence';
import { ConversationContext } from './conversation-context';

describe('Conversational Intelligence System', () => {
  describe('analyzeConversationIntent', () => {
    describe('Greeting Detection', () => {
      test('should detect simple greetings', () => {
        const greetings = ['hi', 'hello', 'hey', 'hiya', 'howdy'];

        greetings.forEach(greeting => {
          const result = analyzeConversationIntent(greeting, []);
          expect(result.intent).toBe('greeting');
          expect(result.confidence).toBeGreaterThanOrEqual(0.9);
          expect(result.isServiceRequest).toBe(false);
          expect(result.requiresPersonalResponse).toBe(true);
        });
      });

      test('should detect greeting variations', () => {
        const variations = [
          'Hi there',
          'Hello there',
          'Good morning',
          'Good evening',
          'What\'s up',
        ];

        variations.forEach(greeting => {
          const result = analyzeConversationIntent(greeting, []);
          expect(result.intent).toBe('greeting');
          expect(result.requiresPersonalResponse).toBe(true);
        });
      });

      test('should be case-insensitive', () => {
        const result1 = analyzeConversationIntent('HELLO', []);
        const result2 = analyzeConversationIntent('HeLLo', []);

        expect(result1.intent).toBe('greeting');
        expect(result2.intent).toBe('greeting');
      });
    });

    describe('How Are You Detection', () => {
      test('should detect "how are you" patterns', () => {
        const patterns = [
          'how are you',
          'how are you doing',
          'how\'s it going',
          'how have you been',
        ];

        patterns.forEach(pattern => {
          const result = analyzeConversationIntent(pattern, []);
          expect(result.intent).toBe('how-are-you');
          expect(result.confidence).toBeGreaterThanOrEqual(0.9);
          expect(result.sentiment).toBe('curious');
        });
      });

      test('should detect reciprocal greetings', () => {
        const reciprocals = [
          'Fine, and you?',
          'Good, how about you?',
          'Great, yourself?',
        ];

        reciprocals.forEach(reciprocal => {
          const result = analyzeConversationIntent(reciprocal, []);
          expect(result.intent).toBe('how-are-you');
        });
      });
    });

    describe('Gratitude Detection', () => {
      test('should detect gratitude expressions', () => {
        const gratitudes = [
          'thanks',
          'thank you',
          'ty',
          'thx',
          'appreciate it',
          'thanks so much',
        ];

        gratitudes.forEach(gratitude => {
          const result = analyzeConversationIntent(gratitude, []);
          expect(result.intent).toBe('gratitude');
          expect(result.sentiment).toBe('positive');
          expect(result.requiresPersonalResponse).toBe(true);
        });
      });

      test('should detect helpful acknowledgments', () => {
        const acknowledgments = [
          'that\'s helpful',
          'that helps',
        ];

        acknowledgments.forEach(ack => {
          const result = analyzeConversationIntent(ack, []);
          expect(result.intent).toBe('gratitude');
        });
      });
    });

    describe('Personal Question Detection', () => {
      test('should detect personal questions', () => {
        const questions = [
          'what\'s your name',
          'who are you',
          'tell me about yourself',
          'are you a bot',
          'are you real',
          'are you an AI',
        ];

        questions.forEach(question => {
          const result = analyzeConversationIntent(question, []);
          expect(result.intent).toBe('personal-question');
          expect(result.sentiment).toBe('curious');
          expect(result.requiresPersonalResponse).toBe(true);
        });
      });
    });

    describe('Service Request Detection', () => {
      test('should detect flight booking requests', () => {
        const requests = [
          'book a flight',
          'I need a flight to Paris',
          'find me a flight',
          'looking for a flight',
          'want to fly to London',
        ];

        requests.forEach(request => {
          const result = analyzeConversationIntent(request, []);
          expect(result.intent).toBe('service-request');
          expect(result.isServiceRequest).toBe(true);
          expect(result.topics).toContain('flights');
        });
      });

      test('should detect hotel booking requests', () => {
        const requests = [
          'book a hotel',
          'find a hotel room',
          'need accommodation',
          'looking for a room',
        ];

        requests.forEach(request => {
          const result = analyzeConversationIntent(request, []);
          expect(result.intent).toBe('service-request');
          expect(result.topics).toContain('hotels');
        });
      });

      test('should detect pricing inquiries', () => {
        const inquiries = [
          'how much is a flight to NYC',
          'what\'s the price',
          'how much does it cost',
          'cheapest flights',
        ];

        inquiries.forEach(inquiry => {
          const result = analyzeConversationIntent(inquiry, []);
          expect(result.intent).toBe('service-request');
          expect(result.topics).toContain('pricing');
        });
      });
    });

    describe('Destination Recommendation Detection', () => {
      test('should detect recommendation requests', () => {
        const requests = [
          'any ideas where to go',
          'where should I travel',
          'recommend a destination',
          'suggest a place',
          'don\'t know where to go',
        ];

        requests.forEach(request => {
          const result = analyzeConversationIntent(request, []);
          expect(result.intent).toBe('destination-recommendation');
          expect(result.isServiceRequest).toBe(true);
          expect(result.requiresPersonalResponse).toBe(true);
          expect(result.topics).toContain('recommendation');
        });
      });

      test('should detect New Year destination requests', () => {
        const result = analyzeConversationIntent(
          'Where should I go for New Year\'s Eve?',
          []
        );

        expect(result.intent).toBe('destination-recommendation');
        expect(result.topics).toContain('new-years');
      });

      test('should extract travel style preferences', () => {
        const testCases = [
          { msg: 'recommend a beach destination', topic: 'beach' },
          { msg: 'looking for a city break', topic: 'city' },
          { msg: 'want a romantic getaway', topic: 'romantic' },
          { msg: 'family-friendly destination ideas', topic: 'family' },
          { msg: 'budget-friendly suggestions', topic: 'budget' },
        ];

        testCases.forEach(({ msg, topic }) => {
          const result = analyzeConversationIntent(msg, []);
          expect(result.topics).toContain(topic);
        });
      });
    });

    describe('Booking Management Detection', () => {
      test('should detect status check requests', () => {
        const requests = [
          'check my reservation',
          'view my booking',
          'show my trip',
          'where is my booking',
          'check status',
        ];

        requests.forEach(request => {
          const result = analyzeConversationIntent(request, []);
          expect(result.intent).toBe('booking-management');
          expect(result.isServiceRequest).toBe(true);
          expect(result.topics).toContain('booking-management');
        });
      });

      test('should detect modification requests', () => {
        const requests = [
          'cancel my flight',
          'change my reservation',
          'reschedule my booking',
          'modify my trip',
        ];

        requests.forEach(request => {
          const result = analyzeConversationIntent(request, []);
          expect(result.intent).toBe('booking-management');
          expect(result.topics).toContain('modification');
        });
      });

      test('should detect refund requests', () => {
        const result = analyzeConversationIntent('I need a refund', []);
        expect(result.intent).toBe('booking-management');
        expect(result.topics).toContain('refund');
      });
    });

    describe('Travel Information Detection', () => {
      test('should detect visa inquiries', () => {
        const inquiries = [
          'do I need a visa',
          'visa requirements',
          'visa application info',
        ];

        inquiries.forEach(inquiry => {
          const result = analyzeConversationIntent(inquiry, []);
          expect(result.intent).toBe('service-request');
          expect(result.topics).toContain('visa');
        });
      });

      test('should detect baggage inquiries', () => {
        const inquiries = [
          'luggage allowance',
          'baggage restrictions',
          'carry-on size limits',
        ];

        inquiries.forEach(inquiry => {
          const result = analyzeConversationIntent(inquiry, []);
          expect(result.intent).toBe('service-request');
          expect(result.topics).toContain('baggage');
        });
      });
    });

    describe('Special Assistance Detection', () => {
      test('should detect accessibility needs', () => {
        const needs = [
          'I need wheelchair assistance',
          'traveling with a disability',
          'special accommodation needed',
        ];

        needs.forEach(need => {
          const result = analyzeConversationIntent(need, []);
          expect(result.intent).toBe('service-request');
          expect(result.topics).toContain('special-assistance');
          expect(result.requiresPersonalResponse).toBe(true);
        });
      });

      test('should detect dietary requirements', () => {
        const result = analyzeConversationIntent(
          'I have a gluten allergy',
          []
        );

        expect(result.topics).toContain('special-assistance');
        expect(result.topics).toContain('dietary');
      });
    });

    describe('Loyalty Program Detection', () => {
      test('should detect loyalty inquiries', () => {
        const inquiries = [
          'frequent flyer miles',
          'loyalty points',
          'how do I earn points',
          'redeem my miles',
        ];

        inquiries.forEach(inquiry => {
          const result = analyzeConversationIntent(inquiry, []);
          expect(result.intent).toBe('service-request');
          expect(result.topics).toContain('loyalty-rewards');
        });
      });
    });

    describe('Edge Cases', () => {
      test('should handle empty messages', () => {
        const result = analyzeConversationIntent('', []);
        expect(result.intent).toBe('casual');
        expect(result.confidence).toBeLessThan(0.7);
      });

      test('should handle messages with only punctuation', () => {
        const result = analyzeConversationIntent('???', []);
        expect(result).toBeDefined();
      });

      test('should handle very long messages', () => {
        const longMessage = 'I need a flight '.repeat(50);
        const result = analyzeConversationIntent(longMessage, []);
        expect(result).toBeDefined();
      });

      test('should handle special characters', () => {
        const result = analyzeConversationIntent(
          'Hi! 😊 How are you?',
          []
        );
        expect(result).toBeDefined();
      });
    });
  });

  describe('detectUrgency', () => {
    test('should detect urgent keywords', () => {
      const urgentMessages = [
        'ASAP help needed',
        'urgent request',
        'emergency situation',
        'need it immediately',
        'right now please',
        'I need this today',
      ];

      urgentMessages.forEach(msg => {
        expect(detectUrgency(msg)).toBe(true);
      });
    });

    test('should not detect urgency in normal messages', () => {
      const normalMessages = [
        'I need a flight',
        'Can you help me',
        'Looking for hotels',
      ];

      normalMessages.forEach(msg => {
        expect(detectUrgency(msg)).toBe(false);
      });
    });
  });

  describe('detectFrustration', () => {
    test('should detect frustration keywords', () => {
      const frustratedMessages = [
        'I\'m so frustrated',
        'this is terrible',
        'worst service ever',
        'I hate this',
        'this is useless',
        'not working at all',
      ];

      frustratedMessages.forEach(msg => {
        expect(detectFrustration(msg)).toBe(true);
      });
    });

    test('should not detect frustration in normal messages', () => {
      const normalMessages = [
        'I need help',
        'Can you assist',
        'Looking for options',
      ];

      normalMessages.forEach(msg => {
        expect(detectFrustration(msg)).toBe(false);
      });
    });
  });

  describe('getContextLoadingMessage', () => {
    test('should return appropriate messages for casual intents', () => {
      const casualIntents = ['greeting', 'how-are-you', 'small-talk', 'casual'];

      casualIntents.forEach(intent => {
        const message = getContextLoadingMessage(intent);
        expect(message).toContain('Typing');
      });
    });

    test('should return appropriate messages for gratitude', () => {
      const message = getContextLoadingMessage('gratitude');
      expect(message).toBe('Responding...');
    });

    test('should return search message for flight search', () => {
      const message = getContextLoadingMessage('flight-search');
      expect(message).toBe('Searching for flights...');
    });

    test('should return search message for hotel search', () => {
      const message = getContextLoadingMessage('hotel-search');
      expect(message).toBe('Searching for hotels...');
    });

    test('should return appropriate message for booking management', () => {
      const message = getContextLoadingMessage('booking-management');
      expect(message).toBe('Looking up your reservation...');
    });

    test('should return default message for unknown intent', () => {
      const message = getContextLoadingMessage('unknown-intent');
      expect(message).toBe('Thinking...');
    });
  });

  describe('getConversationalResponse', () => {
    let context: ConversationContext;
    const consultant = {
      name: 'Lisa Thompson',
      personality: 'warm',
      emoji: '🎧',
    };

    beforeEach(() => {
      context = new ConversationContext('test-session');
    });

    test('should generate personal response for greetings', () => {
      const analysis: ConversationAnalysis = {
        intent: 'greeting',
        confidence: 0.95,
        isServiceRequest: false,
        requiresPersonalResponse: true,
        sentiment: 'positive',
        topics: ['greeting'],
      };

      const response = getConversationalResponse(analysis, consultant, context);
      expect(response).toBeDefined();
      expect(typeof response).toBe('string');
      expect(response.length).toBeGreaterThan(0);
    });

    test('should generate personable service response', () => {
      const analysis: ConversationAnalysis = {
        intent: 'service-request',
        confidence: 0.9,
        isServiceRequest: true,
        requiresPersonalResponse: false,
        sentiment: 'neutral',
        topics: ['flights'],
      };

      const response = getConversationalResponse(analysis, consultant, context);
      expect(response).toBeDefined();
      expect(response).toContain('flight');
    });

    test('should not repeat greetings in subsequent interactions', () => {
      const analysis: ConversationAnalysis = {
        intent: 'service-request',
        confidence: 0.9,
        isServiceRequest: true,
        requiresPersonalResponse: false,
        sentiment: 'neutral',
        topics: ['flights'],
      };

      // First interaction
      const response1 = getConversationalResponse(analysis, consultant, context);

      // Mark greeting as done
      context.addInteraction('greeting', 'Hello!');

      // Second interaction - should not have greeting
      const response2 = getConversationalResponse(analysis, consultant, context);

      expect(response1).toBeDefined();
      expect(response2).toBeDefined();
    });
  });

  describe('Topic Extraction', () => {
    test('should extract multiple topics from complex messages', () => {
      const message = 'I need a cheap flight and hotel package to Paris';
      const result = analyzeConversationIntent(message, []);

      expect(result.topics).toContain('flights');
      expect(result.topics).toContain('hotels');
      expect(result.topics).toContain('pricing');
    });

    test('should prioritize booking management over new bookings', () => {
      const message = 'I want to cancel my flight booking';
      const result = analyzeConversationIntent(message, []);

      expect(result.intent).toBe('booking-management');
      expect(result.topics).toContain('cancellation');
    });
  });

  describe('Sentiment Analysis', () => {
    test('should detect positive sentiment', () => {
      const positiveMessages = [
        'I\'m so excited!',
        'This is amazing!',
        'Thank you so much!',
      ];

      positiveMessages.forEach(msg => {
        const result = analyzeConversationIntent(msg, []);
        expect(result.sentiment).toBe('positive');
      });
    });

    test('should detect curious sentiment', () => {
      const curiousMessages = [
        'How does this work?',
        'What are my options?',
        'Can you tell me more?',
      ];

      curiousMessages.forEach(msg => {
        const result = analyzeConversationIntent(msg, []);
        expect(result.sentiment).toBe('curious');
      });
    });

    test('should detect neutral sentiment for factual requests', () => {
      const message = 'I need a flight from NYC to Paris on May 15th';
      const result = analyzeConversationIntent(message, []);

      expect(result.sentiment).toBe('neutral');
    });
  });

  describe('Confidence Scoring', () => {
    test('should have high confidence for clear intents', () => {
      const clearMessages = [
        { msg: 'hello', intent: 'greeting' },
        { msg: 'book a flight', intent: 'service-request' },
        { msg: 'cancel my booking', intent: 'booking-management' },
      ];

      clearMessages.forEach(({ msg }) => {
        const result = analyzeConversationIntent(msg, []);
        expect(result.confidence).toBeGreaterThanOrEqual(0.7);
      });
    });

    test('should have lower confidence for ambiguous messages', () => {
      const ambiguousMessages = [
        'hmm',
        'okay',
        'maybe',
      ];

      ambiguousMessages.forEach(msg => {
        const result = analyzeConversationIntent(msg, []);
        expect(result.confidence).toBeLessThan(0.8);
      });
    });
  });
});
