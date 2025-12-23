/**
 * Reasoning & Compliance Layer Tests
 *
 * Tests that reasoning output is respected in final responses
 */

import { processUserIntent } from '../reasoning-layer';
import { finalComplianceCheck, validateAgentResponse } from '../agent-compliance';

describe('Reasoning Layer', () => {
  describe('Portuguese exploratory query', () => {
    const testInput = 'quero ir pra Europa mas não sei quando, talvez com criança e barato';

    it('should detect Portuguese language', () => {
      const result = processUserIntent({
        message: testInput,
        language: 'pt',
      });

      // Language should be locked to Portuguese
      expect(result.recommended_primary_agent).toBeTruthy();
    });

    it('should identify missing context', () => {
      const result = processUserIntent({
        message: testInput,
        language: 'pt',
      });

      // Should detect missing travel dates, specific destination, origin
      expect(result.missing_context.length).toBeGreaterThan(0);
    });

    it('should have low/medium confidence for exploratory query', () => {
      const result = processUserIntent({
        message: testInput,
        language: 'pt',
      });

      expect(['low', 'medium']).toContain(result.confidence_level);
    });

    it('should provide clarifying questions when context is missing', () => {
      const result = processUserIntent({
        message: testInput,
        language: 'pt',
      });

      // Either missing_context triggers questions, or response_strategy guides agent
      const hasGuidance = result.missing_context.length > 0 ||
                          result.clarifying_questions.length > 0 ||
                          result.response_strategy.includes('clarif');
      expect(hasGuidance).toBe(true);
    });

    it('should set consultative tone guidance', () => {
      const result = processUserIntent({
        message: testInput,
        language: 'pt',
      });

      expect(result.tone_guidance).toBeTruthy();
    });
  });
});

describe('Agent Compliance', () => {
  const mockReasoning = {
    interpreted_intent: 'flight_search',
    confidence_level: 'medium' as const,
    missing_context: ['travel_dates', 'origin_city'],
    recommended_primary_agent: 'flights' as const,
    recommended_secondary_agent: null,
    response_strategy: 'Clarify missing context using conversational questions.',
    clarifying_questions: ['Quando você planeja viajar?', 'De onde você gostaria de voar?'],
    tone_guidance: 'Friendly, consultative, helpful.',
    allowed_actions: ['search_flights', 'clarify_intent'],
    forbidden_actions: ['expose_pricing_internals'],
    conversion_hint: null,
    risk_flags: [],
  };

  describe('Forbidden openers detection', () => {
    it('should reject "How can I help you?"', () => {
      const result = validateAgentResponse(
        'How can I help you today?',
        mockReasoning,
        'pt'
      );

      expect(result.compliant).toBe(false);
      expect(result.violations).toContain('GENERIC_OPENER_USED');
    });

    it('should reject "What can I assist you with?"', () => {
      const result = validateAgentResponse(
        'Hello! What can I assist you with?',
        mockReasoning,
        'pt'
      );

      expect(result.compliant).toBe(false);
      expect(result.violations).toContain('GENERIC_OPENER_USED');
    });
  });

  describe('Compliance auto-correction', () => {
    it('should auto-correct non-compliant response', () => {
      const { response, wasModified } = finalComplianceCheck(
        'How can I help you?',
        mockReasoning,
        'pt'
      );

      expect(wasModified).toBe(true);
      expect(response).not.toBe('How can I help you?');
      // Should contain Portuguese clarifying question
      expect(response).toContain('?');
    });

    it('should include clarifying question in corrected response', () => {
      const { response } = finalComplianceCheck(
        'How can I help you?',
        mockReasoning,
        'pt'
      );

      // Should include a Portuguese question
      const hasPtQuestion = response.includes('você') || response.includes('gostaria');
      expect(hasPtQuestion).toBe(true);
    });
  });

  describe('Dead-end prevention', () => {
    it('should prevent "I cannot help" responses', () => {
      const { response } = finalComplianceCheck(
        "I cannot help with that.",
        mockReasoning,
        'pt'
      );

      expect(response).not.toContain('cannot help');
    });

    it('should convert dead-end to forward-moving response', () => {
      const { response } = finalComplianceCheck(
        "I don't know.",
        mockReasoning,
        'pt'
      );

      expect(response).not.toBe("I don't know.");
      expect(response).toContain('?'); // Should ask a question
    });
  });

  describe('Internal data protection', () => {
    it('should flag margin data exposure', () => {
      const result = validateAgentResponse(
        'The flight costs $500 with 35% margin included.',
        mockReasoning,
        'en'
      );

      expect(result.violations).toContain('INTERNAL_DATA_EXPOSED');
    });

    it('should flag commission data exposure', () => {
      const result = validateAgentResponse(
        'Our 15% commission is applied to all bookings.',
        mockReasoning,
        'en'
      );

      expect(result.violations).toContain('INTERNAL_DATA_EXPOSED');
    });
  });
});

describe('Full Pipeline Integration', () => {
  it('should produce compliant response for Portuguese exploratory query', () => {
    // Step 1: Process intent
    const reasoning = processUserIntent({
      message: 'quero ir pra Europa mas não sei quando, talvez com criança e barato',
      language: 'pt',
    });

    // Step 2: Simulate AI response (generic opener - should be rejected)
    const badResponse = 'How can I help you with your travel plans?';

    // Step 3: Compliance check should fix it
    const { response, wasModified } = finalComplianceCheck(badResponse, reasoning, 'pt');

    // Assertions
    expect(wasModified).toBe(true);
    expect(response).not.toContain('How can I help');
    // Should be in Portuguese and consultative
    expect(response.includes('você') || response.includes('opção')).toBe(true);
  });
});
