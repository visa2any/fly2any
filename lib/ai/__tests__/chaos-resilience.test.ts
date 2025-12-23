/**
 * Chaos-Resilient Conversational Handling Tests
 *
 * Tests that AI properly handles vague, incomplete, emotional,
 * contradictory, and chaotic user inputs.
 */

import { processUserIntent, type ChaosClassification } from '../reasoning-layer';
import { preventDeadEnd, finalComplianceCheck } from '../agent-compliance';

describe('Chaos Intent Classification', () => {
  // Test 1: Pure vague input
  it('should classify "quero algo barato" as BUDGET_SENSITIVE', () => {
    const result = processUserIntent({
      message: 'quero algo barato',
      language: 'pt',
    });
    expect(result.chaos_classification).toBe('BUDGET_SENSITIVE');
    expect(result.suggested_destinations).toBeUndefined(); // No destinations for budget
  });

  // Test 2: Contradictory timing
  it('should classify "talvez amanhã ou mês que vem" as CHAOTIC_INTENT', () => {
    const result = processUserIntent({
      message: 'quero viajar talvez amanhã ou mês que vem',
      language: 'pt',
    });
    expect(result.chaos_classification).toBe('CHAOTIC_INTENT');
    expect(result.clarifying_questions.length).toBeLessThanOrEqual(2);
  });

  // Test 3: Just want to travel - no specifics
  it('should classify "não sei, só quero viajar" as EXPLORATORY_TRAVEL', () => {
    const result = processUserIntent({
      message: 'não sei, só quero viajar',
      language: 'pt',
    });
    expect(result.chaos_classification).toBe('EXPLORATORY_TRAVEL');
    expect(result.suggested_destinations).toBeDefined();
    expect(result.suggested_destinations!.length).toBeGreaterThan(0);
  });

  // Test 4: Family travel detection
  it('should classify "viagem com crianças para praia" as FAMILY_TRAVEL', () => {
    const result = processUserIntent({
      message: 'viagem com crianças para praia',
      language: 'pt',
    });
    expect(result.chaos_classification).toBe('FAMILY_TRAVEL');
    expect(result.suggested_destinations).toContain('Orlando');
  });

  // Test 5: Low information (minimal input)
  it('should classify "paris" (single word) as LOW_INFORMATION', () => {
    const result = processUserIntent({
      message: 'paris',
      language: 'en',
    });
    expect(result.chaos_classification).toBe('LOW_INFORMATION');
    expect(result.clarifying_questions.length).toBe(2);
  });

  // Test 6: Mixed language chaos
  it('should handle mixed language "I want to quero ir somewhere"', () => {
    const result = processUserIntent({
      message: 'I want to quero ir somewhere barato',
      language: 'en',
    });
    // Should detect as budget or chaotic due to mixed signals
    expect(['BUDGET_SENSITIVE', 'CHAOTIC_INTENT']).toContain(result.chaos_classification);
  });

  // Test 7: Spanish exploratory
  it('should classify "quiero viajar pero no sé a dónde" as EXPLORATORY_TRAVEL', () => {
    const result = processUserIntent({
      message: 'quiero viajar pero no sé a dónde',
      language: 'es',
    });
    expect(result.chaos_classification).toBe('EXPLORATORY_TRAVEL');
    expect(result.clarifying_questions.length).toBeGreaterThan(0);
  });

  // Test 8: Clear intent (control case)
  it('should classify clear request as CLEAR_INTENT', () => {
    const result = processUserIntent({
      message: 'I want to fly from New York to Los Angeles on January 15th for 2 adults',
      language: 'en',
    });
    expect(result.chaos_classification).toBe('CLEAR_INTENT');
  });

  // Test 9: Budget without numbers
  it('should detect budget-sensitive without price numbers', () => {
    const result = processUserIntent({
      message: 'looking for cheap flights to europe',
      language: 'en',
    });
    expect(result.chaos_classification).toBe('BUDGET_SENSITIVE');
  });

  // Test 10: Exploratory with region hint
  it('should provide Europe suggestions for "dreaming of europe"', () => {
    const result = processUserIntent({
      message: 'dreaming of visiting europe someday',
      language: 'en',
    });
    expect(result.chaos_classification).toBe('EXPLORATORY_TRAVEL');
    expect(result.suggested_destinations).toContain('Paris');
    expect(result.suggested_destinations).toContain('Barcelona');
  });
});

describe('Chaos Response Rules', () => {
  const mockChaosReasoning = {
    interpreted_intent: 'flight_search',
    confidence_level: 'low' as const,
    chaos_classification: 'CHAOTIC_INTENT' as ChaosClassification,
    missing_context: ['origin_city', 'travel_dates'],
    recommended_primary_agent: 'flights' as const,
    recommended_secondary_agent: null,
    response_strategy: 'CHAOS HANDLING: Ask max 2 questions.',
    clarifying_questions: ['Qual região você gostaria de conhecer?', 'Suas datas são flexíveis?'],
    tone_guidance: 'Extra patient and encouraging.',
    allowed_actions: ['clarify_intent', 'suggest_destinations'],
    forbidden_actions: ['say_cannot_help', 'expose_prices_in_suggestions'],
    conversion_hint: null,
    risk_flags: [],
    suggested_destinations: ['Paris', 'Barcelona', 'Rome'],
  };

  // Rule 1: Never say "I can't help" - English
  it('should prevent "I cannot help" responses in English', () => {
    const result = preventDeadEnd(
      'I cannot help with that request.',
      mockChaosReasoning,
      'en'
    );
    expect(result).not.toContain('cannot help');
    expect(result).toContain('?'); // Should have a question
  });

  // Rule 2: Never say dead-end in Portuguese
  it('should prevent "não consigo" responses in Portuguese', () => {
    const result = preventDeadEnd(
      'Desculpe, não consigo fazer isso.',
      mockChaosReasoning,
      'pt'
    );
    expect(result).not.toContain('não consigo');
    expect(result.length).toBeGreaterThan(0);
  });

  // Rule 3: Never say dead-end in Spanish
  it('should prevent "no puedo ayudar" responses in Spanish', () => {
    const result = preventDeadEnd(
      'Lo siento, no puedo ayudar.',
      mockChaosReasoning,
      'es'
    );
    expect(result).not.toContain('no puedo ayudar');
  });

  // Rule 4: Max 2 questions at a time
  it('should limit clarifying questions to 2', () => {
    const result = processUserIntent({
      message: 'quero algo barato talvez europa não sei quando',
      language: 'pt',
    });
    expect(result.clarifying_questions.length).toBeLessThanOrEqual(2);
  });

  // Rule 5: Suggestions WITHOUT prices
  it('should not include prices in chaos recovery response', () => {
    const exploratoryReasoning = {
      ...mockChaosReasoning,
      chaos_classification: 'EXPLORATORY_TRAVEL' as ChaosClassification,
    };

    // Simulate AI response with prices (forbidden)
    const badResponse = 'Paris from $299, Barcelona from $350, Rome from $275';

    const result = preventDeadEnd(badResponse, exploratoryReasoning, 'en');
    // Should be rewritten without prices
    expect(result).not.toMatch(/\$\d+/);
  });

  // Rule 6: Always guide forward
  it('should always include forward guidance', () => {
    const result = preventDeadEnd(
      "I don't know what you want.",
      mockChaosReasoning,
      'en'
    );
    expect(result).toContain('?'); // Forward = question or suggestion
  });

  // Rule 7: Generic openers blocked
  it('should block and rewrite generic openers', () => {
    const { response, wasModified } = finalComplianceCheck(
      'How can I help you today?',
      mockChaosReasoning,
      'pt'
    );
    expect(wasModified).toBe(true);
    expect(response).not.toContain('How can I help');
  });

  // Rule 8: Dead-end auto-rewritten
  it('should auto-rewrite dead-end responses', () => {
    const { response, wasModified } = finalComplianceCheck(
      "Sorry, I can't do that.",
      mockChaosReasoning,
      'en'
    );
    expect(wasModified).toBe(true);
    expect(response).not.toContain("can't do");
  });

  // Rule 9: Include destination suggestions for exploratory
  it('should include destinations in exploratory recovery', () => {
    const exploratoryReasoning = {
      ...mockChaosReasoning,
      chaos_classification: 'EXPLORATORY_TRAVEL' as ChaosClassification,
      suggested_destinations: ['Paris', 'Barcelona', 'Rome'],
    };

    const result = preventDeadEnd(
      "I'm not able to search without dates.",
      exploratoryReasoning,
      'en'
    );
    expect(result).toMatch(/Paris|Barcelona|Rome/);
  });

  // Rule 10: Family travel gets family-friendly suggestions
  it('should provide family-appropriate suggestions', () => {
    const result = processUserIntent({
      message: 'trip with kids to beach',
      language: 'en',
    });
    expect(result.chaos_classification).toBe('FAMILY_TRAVEL');
    expect(result.suggested_destinations).toContain('Orlando');
    expect(result.suggested_destinations).toContain('Cancun');
  });
});

describe('Full Chaos Pipeline Integration', () => {
  it('should handle complete chaos flow: vague PT input → compliant response', () => {
    // Step 1: Process chaotic input
    const reasoning = processUserIntent({
      message: 'sei lá, quero viajar pra algum lugar legal com a família',
      language: 'pt',
    });

    // Family travel takes priority over exploratory
    expect(reasoning.chaos_classification).toBe('FAMILY_TRAVEL');
    expect(reasoning.clarifying_questions.length).toBeLessThanOrEqual(2);

    // Step 2: Simulate bad AI response
    const badResponse = 'I cannot help without specific dates and destination.';

    // Step 3: Compliance should fix it - use preventDeadEnd directly
    const fixedResponse = preventDeadEnd(badResponse, reasoning, 'pt');

    expect(fixedResponse).not.toContain('cannot help');
    // Should be forward-moving
    expect(fixedResponse.length).toBeGreaterThan(20);
  });

  it('should handle budget-sensitive chaos without exposing prices', () => {
    const reasoning = processUserIntent({
      message: 'preciso de algo barato pra qualquer lugar',
      language: 'pt',
    });

    expect(reasoning.chaos_classification).toBe('BUDGET_SENSITIVE');

    // Budget sensitive goes to NARROWING stage - prices forbidden there
    expect(reasoning.conversation_stage).toBe('NARROWING');
    expect(reasoning.stage_forbidden).toContain('show_prices');
    expect(reasoning.forbidden_actions).toContain('say_cannot_help');
  });
});
