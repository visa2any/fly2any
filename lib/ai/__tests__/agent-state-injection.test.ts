/**
 * Agent State Injection Tests
 *
 * Validates:
 * - Mandatory state validation (hard-fail on missing fields)
 * - Slot-aware guardrails (no re-asking for known data)
 * - Response guardrail validation
 * - Handoff contract creation and restoration
 * - Language lock enforcement
 */

import {
  validateAgentState,
  buildSlotGuardrails,
  validateResponseGuardrails,
  injectAgentState,
  createHandoffContract,
  stateFromHandoffContract,
  MissingAgentStateError,
  type AgentState,
} from '../agent-state-injector';

describe('Agent State Validation - Hard Fail', () => {
  it('should throw MissingAgentStateError when intent is missing', () => {
    const invalidState = {
      stage: 'GATHERING_DETAILS' as const,
      language: 'en' as const,
      slots: {},
    };

    expect(() => validateAgentState(invalidState)).toThrow(MissingAgentStateError);
    expect(() => validateAgentState(invalidState)).toThrow(/intent/);
  });

  it('should throw MissingAgentStateError when stage is missing', () => {
    const invalidState = {
      intent: 'FLIGHT_SEARCH',
      language: 'en' as const,
      slots: {},
    };

    expect(() => validateAgentState(invalidState)).toThrow(MissingAgentStateError);
    expect(() => validateAgentState(invalidState)).toThrow(/stage/);
  });

  it('should throw MissingAgentStateError when language is missing', () => {
    const invalidState = {
      intent: 'FLIGHT_SEARCH',
      stage: 'GATHERING_DETAILS' as const,
      slots: {},
    };

    expect(() => validateAgentState(invalidState)).toThrow(MissingAgentStateError);
    expect(() => validateAgentState(invalidState)).toThrow(/language/);
  });

  it('should throw MissingAgentStateError when slots is missing', () => {
    const invalidState = {
      intent: 'FLIGHT_SEARCH',
      stage: 'GATHERING_DETAILS' as const,
      language: 'en' as const,
    };

    expect(() => validateAgentState(invalidState)).toThrow(MissingAgentStateError);
    expect(() => validateAgentState(invalidState)).toThrow(/slots/);
  });

  it('should throw with all missing fields listed', () => {
    const invalidState = {};

    try {
      validateAgentState(invalidState);
      fail('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(MissingAgentStateError);
      const err = error as MissingAgentStateError;
      expect(err.missingFields).toContain('intent');
      expect(err.missingFields).toContain('stage');
      expect(err.missingFields).toContain('language');
      expect(err.missingFields).toContain('slots');
    }
  });

  it('should pass validation when all mandatory fields are present', () => {
    const validState: AgentState = {
      intent: 'FLIGHT_SEARCH',
      stage: 'GATHERING_DETAILS',
      language: 'en',
      slots: {},
    };

    expect(() => validateAgentState(validState)).not.toThrow();
  });
});

describe('Slot-Aware Guardrails', () => {
  it('should create guardrails for known destination', () => {
    const state: AgentState = {
      intent: 'FLIGHT_SEARCH',
      stage: 'GATHERING_DETAILS',
      language: 'en',
      slots: {
        destination: { value: 'Paris', confidence: 0.8 },
      },
    };

    const guardrails = buildSlotGuardrails(state);

    expect(guardrails).toContain('[SLOT LOCKED: destination = "Paris" (confidence: 0.80)]');
    expect(guardrails).toContain('[FORBIDDEN: Do NOT ask for destination. It is already known.]');
  });

  it('should create guardrails for known origin and date', () => {
    const state: AgentState = {
      intent: 'FLIGHT_SEARCH',
      stage: 'GATHERING_DETAILS',
      language: 'en',
      slots: {
        origin: { value: 'New York', confidence: 0.9 },
        departureDate: { value: '2025-03-15', confidence: 0.85 },
      },
    };

    const guardrails = buildSlotGuardrails(state);

    expect(guardrails.some(g => g.includes('origin = "New York"'))).toBe(true);
    expect(guardrails.some(g => g.includes('departureDate = "2025-03-15"'))).toBe(true);
    expect(guardrails.some(g => g.includes('KNOWN DATA'))).toBe(true);
  });

  it('should NOT create guardrails for low confidence slots', () => {
    const state: AgentState = {
      intent: 'FLIGHT_SEARCH',
      stage: 'GATHERING_DETAILS',
      language: 'en',
      slots: {
        destination: { value: 'Maybe Paris', confidence: 0.3 }, // Below 0.4 threshold
      },
    };

    const guardrails = buildSlotGuardrails(state);

    expect(guardrails.some(g => g.includes('SLOT LOCKED: destination'))).toBe(false);
  });

  it('should include language lock', () => {
    const state: AgentState = {
      intent: 'FLIGHT_SEARCH',
      stage: 'GATHERING_DETAILS',
      language: 'pt',
      slots: {},
    };

    const guardrails = buildSlotGuardrails(state);

    expect(guardrails).toContain('[LANGUAGE LOCK: PT. ALL responses MUST be in PT only.]');
  });

  it('should include all known slots in KNOWN DATA summary', () => {
    const state: AgentState = {
      intent: 'FLIGHT_SEARCH',
      stage: 'READY_TO_SEARCH',
      language: 'en',
      slots: {
        origin: { value: 'NYC', confidence: 0.95 },
        destination: { value: 'Paris', confidence: 0.9 },
        departureDate: { value: '2025-03-15', confidence: 0.85 },
        passengers: { value: 2, confidence: 0.8 },
      },
    };

    const guardrails = buildSlotGuardrails(state);
    const knownDataGuardrail = guardrails.find(g => g.includes('KNOWN DATA'));

    expect(knownDataGuardrail).toBeDefined();
    expect(knownDataGuardrail).toContain('origin="NYC"');
    expect(knownDataGuardrail).toContain('destination="Paris"');
    expect(knownDataGuardrail).toContain('departureDate="2025-03-15"');
    expect(knownDataGuardrail).toContain('passengers="2"');
  });
});

describe('Response Guardrail Validation', () => {
  it('should detect violation when asking for known destination (EN)', () => {
    const state: AgentState = {
      intent: 'FLIGHT_SEARCH',
      stage: 'GATHERING_DETAILS',
      language: 'en',
      slots: {
        destination: { value: 'Paris', confidence: 0.8 },
      },
    };

    const response = "Where would you like to go?";
    const result = validateResponseGuardrails(response, state);

    expect(result.valid).toBe(false);
    expect(result.violations.length).toBeGreaterThan(0);
    expect(result.violations[0]).toContain('destination');
  });

  it('should detect violation when asking for known destination (PT)', () => {
    const state: AgentState = {
      intent: 'FLIGHT_SEARCH',
      stage: 'GATHERING_DETAILS',
      language: 'pt',
      slots: {
        destination: { value: 'Paris', confidence: 0.7 },
      },
    };

    const response = "Para onde você gostaria de ir?";
    const result = validateResponseGuardrails(response, state);

    expect(result.valid).toBe(false);
  });

  it('should detect violation when asking for known origin', () => {
    const state: AgentState = {
      intent: 'FLIGHT_SEARCH',
      stage: 'GATHERING_DETAILS',
      language: 'en',
      slots: {
        origin: { value: 'New York', confidence: 0.9 },
      },
    };

    const response = "Where are you departing from?";
    const result = validateResponseGuardrails(response, state);

    expect(result.valid).toBe(false);
  });

  it('should pass when asking for missing data', () => {
    const state: AgentState = {
      intent: 'FLIGHT_SEARCH',
      stage: 'GATHERING_DETAILS',
      language: 'en',
      slots: {
        destination: { value: 'Paris', confidence: 0.8 },
        // No date
      },
    };

    const response = "When would you like to depart?";
    const result = validateResponseGuardrails(response, state);

    expect(result.valid).toBe(true);
  });

  it('should pass for confirmation responses', () => {
    const state: AgentState = {
      intent: 'FLIGHT_SEARCH',
      stage: 'GATHERING_DETAILS',
      language: 'en',
      slots: {
        destination: { value: 'Paris', confidence: 0.8 },
      },
    };

    const response = "Great! I'll search for flights to Paris for you.";
    const result = validateResponseGuardrails(response, state);

    expect(result.valid).toBe(true);
  });

  it('should allow questions for low-confidence slots', () => {
    const state: AgentState = {
      intent: 'FLIGHT_SEARCH',
      stage: 'GATHERING_DETAILS',
      language: 'en',
      slots: {
        destination: { value: 'Paris', confidence: 0.35 }, // Below 0.4
      },
    };

    const response = "Where would you like to go?";
    const result = validateResponseGuardrails(response, state);

    expect(result.valid).toBe(true);
  });
});

describe('State Injection', () => {
  it('should generate system prompt with state block', () => {
    const state: AgentState = {
      intent: 'FLIGHT_SEARCH',
      stage: 'GATHERING_DETAILS',
      language: 'en',
      slots: {
        destination: { value: 'Paris', confidence: 0.8 },
      },
    };

    const result = injectAgentState(state, 'Lisa Thompson');

    expect(result.systemPrompt).toContain('INJECTED STATE');
    expect(result.systemPrompt).toContain('INTENT: FLIGHT_SEARCH');
    expect(result.systemPrompt).toContain('STAGE: GATHERING_DETAILS');
    expect(result.systemPrompt).toContain('LANGUAGE: EN');
    expect(result.systemPrompt).toContain('destination: "Paris"');
  });

  it('should include guardrails in prompt', () => {
    const state: AgentState = {
      intent: 'FLIGHT_SEARCH',
      stage: 'READY_TO_SEARCH',
      language: 'pt',
      slots: {
        origin: { value: 'São Paulo', confidence: 0.95 },
        destination: { value: 'Paris', confidence: 0.9 },
      },
    };

    const result = injectAgentState(state, 'Sarah Chen');

    expect(result.guardrails.length).toBeGreaterThan(0);
    expect(result.guardrails.some(g => g.includes('SLOT LOCKED'))).toBe(true);
    expect(result.guardrails.some(g => g.includes('LANGUAGE LOCK: PT'))).toBe(true);
  });

  it('should include debug log with correct data', () => {
    const state: AgentState = {
      intent: 'HOTEL_SEARCH',
      stage: 'GATHERING_DETAILS',
      language: 'es',
      slots: {
        destination: { value: 'Barcelona', confidence: 0.85 },
      },
    };

    const result = injectAgentState(state, 'Marcus Rodriguez');

    expect(result.debugLog.agentName).toBe('Marcus Rodriguez');
    expect(result.debugLog.intent).toBe('HOTEL_SEARCH');
    expect(result.debugLog.stage).toBe('GATHERING_DETAILS');
    expect(result.debugLog.language).toBe('es');
    expect(result.debugLog.slotsInjected.destination.value).toBe('Barcelona');
    expect(result.debugLog.slotsInjected.destination.confidence).toBe(0.85);
  });

  it('should throw on invalid state', () => {
    const invalidState = {
      intent: 'FLIGHT_SEARCH',
      // Missing stage, language, slots
    };

    expect(() => injectAgentState(invalidState as any, 'Lisa')).toThrow(MissingAgentStateError);
  });

  it('should include handoff note when handoffFrom is set', () => {
    const state: AgentState = {
      intent: 'FLIGHT_SEARCH',
      stage: 'READY_TO_SEARCH',
      language: 'en',
      slots: {
        destination: { value: 'Paris', confidence: 0.9 },
      },
      handoffFrom: 'Lisa Thompson',
    };

    const result = injectAgentState(state, 'Sarah Chen');

    expect(result.systemPrompt).toContain('HANDOFF');
    expect(result.systemPrompt).toContain('Lisa Thompson');
  });
});

describe('Handoff Contract', () => {
  it('should create handoff contract with all state', () => {
    const state: AgentState = {
      intent: 'FLIGHT_SEARCH',
      stage: 'READY_TO_SEARCH',
      language: 'pt',
      slots: {
        origin: { value: 'São Paulo', confidence: 0.95 },
        destination: { value: 'Paris', confidence: 0.9 },
        departureDate: { value: '2025-03-15', confidence: 0.85 },
      },
    };

    const contract = createHandoffContract(state, 'Lisa Thompson', 'Sarah Chen');

    expect(contract.intent).toBe('FLIGHT_SEARCH');
    expect(contract.stage).toBe('READY_TO_SEARCH');
    expect(contract.conversationLanguage).toBe('pt');
    expect(contract.fromAgent).toBe('Lisa Thompson');
    expect(contract.toAgent).toBe('Sarah Chen');
    expect(contract.slots.origin?.value).toBe('São Paulo');
    expect(contract.confidence.origin).toBe(0.95);
    expect(contract.timestamp).toBeDefined();
  });

  it('should restore state from handoff contract', () => {
    const state: AgentState = {
      intent: 'FLIGHT_SEARCH',
      stage: 'READY_TO_SEARCH',
      language: 'en',
      slots: {
        destination: { value: 'Paris', confidence: 0.9 },
      },
    };

    const contract = createHandoffContract(state, 'Lisa Thompson', 'Sarah Chen');
    const restoredState = stateFromHandoffContract(contract);

    expect(restoredState.intent).toBe('FLIGHT_SEARCH');
    expect(restoredState.stage).toBe('READY_TO_SEARCH');
    expect(restoredState.language).toBe('en');
    expect(restoredState.slots.destination?.value).toBe('Paris');
    expect(restoredState.handoffFrom).toBe('Lisa Thompson');
  });

  it('should throw on invalid state when creating contract', () => {
    const invalidState = {
      intent: 'FLIGHT_SEARCH',
      // Missing required fields
    };

    expect(() => createHandoffContract(invalidState as any, 'Lisa', 'Sarah')).toThrow(MissingAgentStateError);
  });
});

describe('Multi-Language Guardrails', () => {
  it('should use English patterns for EN language', () => {
    const state: AgentState = {
      intent: 'FLIGHT_SEARCH',
      stage: 'GATHERING_DETAILS',
      language: 'en',
      slots: {
        destination: { value: 'Paris', confidence: 0.8 },
      },
    };

    // EN pattern should match
    const response1 = "Where would you like to go?";
    expect(validateResponseGuardrails(response1, state).valid).toBe(false);

    // PT pattern should NOT match for EN state
    const response2 = "Para onde você gostaria de ir?";
    expect(validateResponseGuardrails(response2, state).valid).toBe(true);
  });

  it('should use Portuguese patterns for PT language', () => {
    const state: AgentState = {
      intent: 'FLIGHT_SEARCH',
      stage: 'GATHERING_DETAILS',
      language: 'pt',
      slots: {
        destination: { value: 'Paris', confidence: 0.8 },
      },
    };

    // PT pattern should match
    const response1 = "Para onde você gostaria de ir?";
    expect(validateResponseGuardrails(response1, state).valid).toBe(false);

    // EN pattern should NOT match for PT state
    const response2 = "Where would you like to go?";
    expect(validateResponseGuardrails(response2, state).valid).toBe(true);
  });

  it('should use Spanish patterns for ES language', () => {
    const state: AgentState = {
      intent: 'FLIGHT_SEARCH',
      stage: 'GATHERING_DETAILS',
      language: 'es',
      slots: {
        destination: { value: 'Paris', confidence: 0.8 },
      },
    };

    // ES pattern should match
    const response1 = "¿Adónde le gustaría ir?";
    expect(validateResponseGuardrails(response1, state).valid).toBe(false);
  });
});

describe('Complete Flow Scenarios', () => {
  it('should handle complete flight search flow', () => {
    // Step 1: Initial state - no slots
    const initialState: AgentState = {
      intent: 'FLIGHT_SEARCH',
      stage: 'GATHERING_DETAILS',
      language: 'pt',
      slots: {},
    };

    const initialResult = injectAgentState(initialState, 'Lisa Thompson');
    expect(initialResult.guardrails.some(g => g.includes('SLOT LOCKED'))).toBe(false);

    // Step 2: After extracting destination
    const withDestination: AgentState = {
      ...initialState,
      slots: {
        destination: { value: 'Paris', confidence: 0.9 },
      },
    };

    const destResult = injectAgentState(withDestination, 'Lisa Thompson');
    expect(destResult.guardrails.some(g => g.includes('destination'))).toBe(true);

    // Step 3: Ready to search - handoff to Sarah
    const readyToSearch: AgentState = {
      intent: 'FLIGHT_SEARCH',
      stage: 'READY_TO_SEARCH',
      language: 'pt',
      slots: {
        origin: { value: 'São Paulo', confidence: 0.95 },
        destination: { value: 'Paris', confidence: 0.9 },
        departureDate: { value: '2025-03-15', confidence: 0.85 },
      },
    };

    const contract = createHandoffContract(readyToSearch, 'Lisa Thompson', 'Sarah Chen');
    const sarahState = stateFromHandoffContract(contract);

    expect(sarahState.handoffFrom).toBe('Lisa Thompson');
    expect(sarahState.slots.origin?.value).toBe('São Paulo');

    // Step 4: Sarah should not ask for destination
    const sarahPrompt = injectAgentState(sarahState, 'Sarah Chen');
    expect(sarahPrompt.systemPrompt).toContain('HANDOFF');
    expect(sarahPrompt.guardrails.some(g => g.includes('FORBIDDEN'))).toBe(true);

    // Validation should fail if Sarah asks for destination
    const badResponse = "Para onde você gostaria de ir?";
    expect(validateResponseGuardrails(badResponse, sarahState).valid).toBe(false);

    // Validation should pass for search confirmation
    const goodResponse = "Estou buscando voos de São Paulo para Paris no dia 15 de março.";
    expect(validateResponseGuardrails(goodResponse, sarahState).valid).toBe(true);
  });
});
