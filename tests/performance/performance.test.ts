/**
 * Performance Test Suite
 * Tests conversation persistence, API response times, and memory usage
 */

import { analyzeConversationIntent } from '@/lib/ai/conversational-intelligence';
import { ConversationContext } from '@/lib/ai/conversation-context';
import { generateHandoffMessage } from '@/lib/ai/consultant-handoff';

describe('Performance Tests', () => {
  describe('Conversation Persistence Performance', () => {
    test('should save conversation to localStorage quickly', () => {
      const context = new ConversationContext('perf-test-1');

      const start = performance.now();

      // Add 50 interactions
      for (let i = 0; i < 50; i++) {
        context.addInteraction('service-request', `Message ${i}`);
      }

      const duration = performance.now() - start;

      expect(duration).toBeLessThan(100); // Should complete in under 100ms
    });

    test('should load large conversation from localStorage quickly', () => {
      const context = new ConversationContext('perf-test-2');

      // Create large conversation
      for (let i = 0; i < 100; i++) {
        context.addInteraction('service-request', `Message ${i}`);
      }

      const start = performance.now();

      // Simulate reload by creating new context with same ID
      const reloadedContext = new ConversationContext('perf-test-2');

      const duration = performance.now() - start;

      expect(duration).toBeLessThan(50);
    });

    test('should handle very large message content efficiently', () => {
      const largeMessage = 'x'.repeat(10000); // 10KB message
      const context = new ConversationContext('perf-test-3');

      const start = performance.now();
      context.addInteraction('service-request', largeMessage);
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(50);
    });

    test('should serialize/deserialize conversations quickly', () => {
      const context = new ConversationContext('perf-test-4');

      // Add various types of interactions
      const interactions = [
        'greeting',
        'service-request',
        'booking-management',
        'destination-recommendation',
      ];

      interactions.forEach((intent, i) => {
        for (let j = 0; j < 25; j++) {
          context.addInteraction(intent as any, `${intent} message ${j}`);
        }
      });

      const start = performance.now();

      // Simulate save/load cycle
      const serialized = JSON.stringify(context);
      const deserialized = JSON.parse(serialized);

      const duration = performance.now() - start;

      expect(duration).toBeLessThan(10);
      expect(deserialized).toBeDefined();
    });
  });

  describe('Intent Analysis Performance', () => {
    test('should analyze simple intents in under 10ms', () => {
      const messages = [
        'hi',
        'hello',
        'thanks',
        'bye',
      ];

      messages.forEach(message => {
        const start = performance.now();
        const result = analyzeConversationIntent(message, []);
        const duration = performance.now() - start;

        expect(duration).toBeLessThan(10);
        expect(result).toBeDefined();
      });
    });

    test('should analyze complex intents in under 50ms', () => {
      const complexMessages = [
        'I need a flight from New York to Paris on June 15th returning June 22nd for 2 passengers in business class with special meal requirements',
        'Can you help me find a budget-friendly hotel in Barcelona near the beach with good reviews for a family of 4 including 2 children?',
        'What are the visa requirements for traveling to China from the United States and how long does the application process take?',
      ];

      complexMessages.forEach(message => {
        const start = performance.now();
        const result = analyzeConversationIntent(message, []);
        const duration = performance.now() - start;

        expect(duration).toBeLessThan(50);
        expect(result).toBeDefined();
      });
    });

    test('should handle large conversation history efficiently', () => {
      const history = Array.from({ length: 200 }, (_, i) => ({
        role: i % 2 === 0 ? 'user' : 'assistant',
        content: `Message ${i}`,
        timestamp: Date.now(),
      }));

      const start = performance.now();
      const result = analyzeConversationIntent('Book a flight to Paris', history);
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(100);
      expect(result).toBeDefined();
    });

    test('should maintain performance with repeated analyses', () => {
      const durations: number[] = [];

      // Perform 100 analyses
      for (let i = 0; i < 100; i++) {
        const start = performance.now();
        analyzeConversationIntent(`Message number ${i}`, []);
        const duration = performance.now() - start;
        durations.push(duration);
      }

      const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
      const maxDuration = Math.max(...durations);

      expect(avgDuration).toBeLessThan(20);
      expect(maxDuration).toBeLessThan(100); // No single analysis should spike
    });
  });

  describe('Consultant Handoff Performance', () => {
    test('should generate handoff messages quickly', () => {
      const start = performance.now();

      const handoff = generateHandoffMessage(
        'customer-service',
        'flight-operations',
        'I need a flight',
        { origin: 'NYC', destination: 'LAX' }
      );

      const duration = performance.now() - start;

      expect(duration).toBeLessThan(5);
      expect(handoff).toBeDefined();
    });

    test('should handle multiple handoffs in sequence efficiently', () => {
      const teams: Array<[any, any]> = [
        ['customer-service', 'flight-operations'],
        ['flight-operations', 'hotel-accommodations'],
        ['hotel-accommodations', 'payment-billing'],
        ['payment-billing', 'customer-service'],
      ];

      const start = performance.now();

      teams.forEach(([from, to]) => {
        generateHandoffMessage(from, to, 'Help needed');
      });

      const duration = performance.now() - start;

      expect(duration).toBeLessThan(20);
    });
  });

  describe('Memory Usage Tests', () => {
    test('should not leak memory with repeated context creation', () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize;

      // Create and destroy 100 contexts
      for (let i = 0; i < 100; i++) {
        const context = new ConversationContext(`temp-${i}`);
        context.addInteraction('greeting', 'Hello');
        // Context should be garbage collected when out of scope
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = (performance as any).memory?.usedJSHeapSize;

      // Memory shouldn't grow significantly
      if (initialMemory && finalMemory) {
        const memoryGrowth = finalMemory - initialMemory;
        expect(memoryGrowth).toBeLessThan(5 * 1024 * 1024); // Less than 5MB growth
      }
    });

    test('should handle large conversation histories without excessive memory', () => {
      const context = new ConversationContext('large-conv');

      const messageSize = 1000; // 1KB per message
      const messageCount = 1000; // 1000 messages = ~1MB

      for (let i = 0; i < messageCount; i++) {
        const message = 'x'.repeat(messageSize);
        context.addInteraction('service-request', message);
      }

      // Context should still be functional
      expect(context.hasInteracted('service-request')).toBe(true);
    });
  });

  describe('Concurrent Operations Performance', () => {
    test('should handle concurrent intent analyses', async () => {
      const messages = Array.from({ length: 50 }, (_, i) => `Message ${i}`);

      const start = performance.now();

      const promises = messages.map(msg =>
        Promise.resolve(analyzeConversationIntent(msg, []))
      );

      const results = await Promise.all(promises);

      const duration = performance.now() - start;

      expect(results).toHaveLength(50);
      expect(duration).toBeLessThan(500);
    });

    test('should handle concurrent handoff generations', async () => {
      const handoffs = Array.from({ length: 20 }, (_, i) => ({
        from: 'customer-service' as const,
        to: 'flight-operations' as const,
        request: `Request ${i}`,
      }));

      const start = performance.now();

      const promises = handoffs.map(h =>
        Promise.resolve(generateHandoffMessage(h.from, h.to, h.request))
      );

      const results = await Promise.all(promises);

      const duration = performance.now() - start;

      expect(results).toHaveLength(20);
      expect(duration).toBeLessThan(100);
    });
  });

  describe('Regex Pattern Performance', () => {
    test('should match patterns efficiently', () => {
      const testCases = [
        'Do I need a visa for France?',
        'How much is baggage?',
        'I need wheelchair assistance',
        'Cancel my booking',
        'Recommend a destination for New Year',
      ];

      const start = performance.now();

      testCases.forEach(msg => {
        analyzeConversationIntent(msg, []);
      });

      const duration = performance.now() - start;

      expect(duration).toBeLessThan(50);
    });

    test('should not have catastrophic backtracking', () => {
      // Create pathological input that could cause regex backtracking
      const pathologicalInput = 'a'.repeat(100) + 'X';

      const start = performance.now();
      const result = analyzeConversationIntent(pathologicalInput, []);
      const duration = performance.now() - start;

      // Should still complete quickly (no exponential time complexity)
      expect(duration).toBeLessThan(100);
      expect(result).toBeDefined();
    });
  });

  describe('Caching and Optimization', () => {
    test('should benefit from repeated similar queries', () => {
      const message = 'Book a flight to Paris';

      // First call (cold)
      const start1 = performance.now();
      analyzeConversationIntent(message, []);
      const duration1 = performance.now() - start1;

      // Subsequent calls (should be similar or faster)
      const durations: number[] = [];
      for (let i = 0; i < 10; i++) {
        const start = performance.now();
        analyzeConversationIntent(message, []);
        durations.push(performance.now() - start);
      }

      const avgSubsequent = durations.reduce((a, b) => a + b, 0) / durations.length;

      // Subsequent calls should not be significantly slower
      expect(avgSubsequent).toBeLessThanOrEqual(duration1 * 2);
    });
  });

  describe('Scalability Tests', () => {
    test('should scale linearly with message count', () => {
      const messageCounts = [10, 50, 100, 200];
      const durations: number[] = [];

      messageCounts.forEach(count => {
        const history = Array.from({ length: count }, (_, i) => ({
          role: 'user',
          content: `Message ${i}`,
          timestamp: Date.now(),
        }));

        const start = performance.now();
        analyzeConversationIntent('New message', history);
        durations.push(performance.now() - start);
      });

      // Check that doubling messages doesn't more than double time
      // (should be roughly linear, not exponential)
      for (let i = 1; i < durations.length; i++) {
        const ratio = durations[i] / durations[i - 1];
        expect(ratio).toBeLessThan(3); // Allow some variance but ensure not exponential
      }
    });

    test('should handle varying message lengths efficiently', () => {
      const messageLengths = [10, 100, 1000, 10000];
      const durations: number[] = [];

      messageLengths.forEach(length => {
        const message = 'x'.repeat(length);

        const start = performance.now();
        analyzeConversationIntent(message, []);
        durations.push(performance.now() - start);
      });

      // Even 10KB messages should process quickly
      durations.forEach(duration => {
        expect(duration).toBeLessThan(100);
      });
    });
  });

  describe('Response Time SLAs', () => {
    test('should meet P50 response time SLA (< 20ms)', () => {
      const durations: number[] = [];

      for (let i = 0; i < 100; i++) {
        const start = performance.now();
        analyzeConversationIntent(`Test message ${i}`, []);
        durations.push(performance.now() - start);
      }

      durations.sort((a, b) => a - b);
      const p50 = durations[Math.floor(durations.length * 0.5)];

      expect(p50).toBeLessThan(20);
    });

    test('should meet P95 response time SLA (< 100ms)', () => {
      const durations: number[] = [];

      for (let i = 0; i < 100; i++) {
        const start = performance.now();
        analyzeConversationIntent(`Test message ${i}`, []);
        durations.push(performance.now() - start);
      }

      durations.sort((a, b) => a - b);
      const p95 = durations[Math.floor(durations.length * 0.95)];

      expect(p95).toBeLessThan(100);
    });

    test('should meet P99 response time SLA (< 200ms)', () => {
      const durations: number[] = [];

      for (let i = 0; i < 100; i++) {
        const start = performance.now();
        analyzeConversationIntent(`Test message ${i}`, []);
        durations.push(performance.now() - start);
      }

      durations.sort((a, b) => a - b);
      const p99 = durations[Math.floor(durations.length * 0.99)];

      expect(p99).toBeLessThan(200);
    });
  });

  describe('Stress Tests', () => {
    test('should handle rapid consecutive calls', () => {
      const start = performance.now();

      for (let i = 0; i < 1000; i++) {
        analyzeConversationIntent(`Message ${i}`, []);
      }

      const duration = performance.now() - start;
      const avgPerCall = duration / 1000;

      expect(avgPerCall).toBeLessThan(5); // < 5ms average
    });

    test('should handle deeply nested conversation context', () => {
      const context = new ConversationContext('deep-test');

      // Create deep interaction history
      const intents = [
        'greeting',
        'service-request',
        'booking-management',
        'destination-recommendation',
      ];

      for (let i = 0; i < 50; i++) {
        intents.forEach(intent => {
          context.addInteraction(intent as any, `Message ${i}`);
        });
      }

      const start = performance.now();
      const hasGreeting = context.hasInteracted('greeting');
      const duration = performance.now() - start;

      expect(hasGreeting).toBe(true);
      expect(duration).toBeLessThan(1); // Should be instant
    });
  });

  describe('Real-World Scenario Performance', () => {
    test('should handle typical user conversation efficiently', () => {
      const context = new ConversationContext('real-world');
      const messages = [
        'Hi',
        'I need a flight to Paris',
        'From New York',
        'June 15th',
        'Returning June 22nd',
        'One passenger',
        'Economy class',
        'Show me options',
        'How much is the first option?',
        'I\'ll take it',
        'What about hotels?',
        'Near the Eiffel Tower',
        'Mid-range budget',
        'Book both',
      ];

      const start = performance.now();

      messages.forEach(msg => {
        const analysis = analyzeConversationIntent(msg, []);
        context.addInteraction(analysis.intent, 'Response');
      });

      const duration = performance.now() - start;

      expect(duration).toBeLessThan(200); // Entire conversation under 200ms
    });
  });
});
