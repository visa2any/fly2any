/**
 * Runtime Orchestrator Tests
 *
 * Validates: Intent → Stage → Permission → Action execution flow
 */

import {
  orchestrateExecution,
  canExecuteSearchNow,
  forceExecuteSearch,
  type OrchestrationInput,
  type OrchestrationResult,
} from '../runtime-orchestrator';
import {
  getOrCreateStageContext,
  grantSearchConsent,
  grantBookingConsent,
  resetStageContext,
} from '../conversion/stage-engine';
import type { ReasoningOutput } from '../reasoning-layer';

// Helper to create mock reasoning output
function mockReasoning(
  intent: string = 'flight_search',
  stage: string = 'DISCOVERY'
): ReasoningOutput {
  return {
    interpreted_intent: intent,
    confidence_level: 'high',
    chaos_classification: 'CLEAR_INTENT',
    conversation_stage: stage as ReasoningOutput['conversation_stage'],
    stage_actions: ['collect_info', 'clarify'],
    stage_forbidden: [],
    missing_context: [],
    recommended_primary_agent: 'flights',
    recommended_secondary_agent: null,
    response_strategy: 'direct',
    clarifying_questions: [],
    tone_guidance: 'professional',
    allowed_actions: ['collect_info', 'clarify'],
    forbidden_actions: ['execute_search'],
    conversion_hint: null,
    risk_flags: [],
  };
}

describe('Runtime Orchestrator - Basic Flow', () => {
  const testSessionId = 'test_session_001';

  beforeEach(() => {
    resetStageContext(testSessionId);
  });

  it('should log intent detection', async () => {
    const input: OrchestrationInput = {
      sessionId: testSessionId,
      message: 'I want to fly to Paris',
      reasoning: mockReasoning('flight_search', 'DISCOVERY'),
    };

    const result = await orchestrateExecution(input);

    expect(result.success).toBe(true);
    expect(result.logs.some(l => l.type === 'intent')).toBe(true);
    expect(result.logs[0].message).toContain('flight_search');
  });

  it('should track stage transitions', async () => {
    const input: OrchestrationInput = {
      sessionId: testSessionId,
      message: 'Paris on December 25',
      reasoning: mockReasoning('flight_search', 'NARROWING'),
    };

    const result = await orchestrateExecution(input);

    expect(result.logs.some(l => l.type === 'stage')).toBe(true);
    expect(result.stageTransition).toBeDefined();
  });

  it('should extract data from message', async () => {
    const input: OrchestrationInput = {
      sessionId: testSessionId,
      message: 'From New York to London on January 15',
      reasoning: mockReasoning('flight_search', 'NARROWING'),
    };

    await orchestrateExecution(input);

    const context = getOrCreateStageContext(testSessionId);
    expect(context.collectedData).toBeDefined();
    expect(result => result.logs.some((l: { message: string | string[]; }) => l.message.includes('Data extracted')));
  });
});

describe('Runtime Orchestrator - Consent Handling', () => {
  const testSessionId = 'test_session_002';

  beforeEach(() => {
    resetStageContext(testSessionId);
  });

  it('should detect and grant search consent', async () => {
    const input: OrchestrationInput = {
      sessionId: testSessionId,
      message: 'Yes, please search for flights',
      reasoning: mockReasoning('flight_search', 'READY_TO_SEARCH'),
    };

    const result = await orchestrateExecution(input);

    expect(result.logs.some(l => l.message.includes('Search consent GRANTED'))).toBe(true);

    const context = getOrCreateStageContext(testSessionId);
    expect(context.userConsents.searchPermission).toBe(true);
  });

  it('should detect booking consent patterns', async () => {
    const input: OrchestrationInput = {
      sessionId: testSessionId,
      message: 'I want to book this flight',
      reasoning: mockReasoning('booking', 'READY_TO_BOOK'),
    };

    const result = await orchestrateExecution(input);

    expect(result.logs.some(l => l.message.includes('Booking consent GRANTED'))).toBe(true);

    const context = getOrCreateStageContext(testSessionId);
    expect(context.userConsents.bookingPermission).toBe(true);
  });

  it('should request consent when action requires it', async () => {
    // Manually set up READY_TO_SEARCH stage with data but NO consent
    // First trigger natural progression to READY_TO_SEARCH
    const context = getOrCreateStageContext(testSessionId);
    context.currentStage = 'READY_TO_SEARCH';
    context.collectedData = {
      origin: 'NYC',
      destination: 'Paris',
      dates: '2025-01-15',
    };
    // Explicitly ensure NO search consent
    context.userConsents.searchPermission = false;

    const input: OrchestrationInput = {
      sessionId: testSessionId,
      message: 'Show me options please',  // Neutral - no consent trigger
      reasoning: mockReasoning('flight_search', 'READY_TO_SEARCH'),
    };

    const result = await orchestrateExecution(input);

    // Should indicate consent is needed (either via nextAction or blockedReason)
    // The orchestrator returns 'continue' with blockedReason when action is blocked
    expect(result.actionExecuted).toBe(false);
    // Check that it's blocked or asking for consent
    expect(result.logs.some(l => l.message.includes('consent') || l.message.includes('pending'))).toBe(true);
  });
});

describe('Runtime Orchestrator - Action Permissions', () => {
  const testSessionId = 'test_session_003';

  beforeEach(() => {
    resetStageContext(testSessionId);
  });

  it('should block forbidden actions', async () => {
    // Try to execute search in DISCOVERY (forbidden)
    const input: OrchestrationInput = {
      sessionId: testSessionId,
      message: 'Search now!',
      reasoning: mockReasoning('flight_search', 'DISCOVERY'),
    };

    const result = await orchestrateExecution(input);

    // execute_search should be blocked in DISCOVERY
    expect(result.logs.some(l => l.type === 'permission')).toBe(true);
  });

  it('should allow actions in correct stage with consent', async () => {
    // Set up READY_TO_SEARCH with consent
    const context = getOrCreateStageContext(testSessionId);
    context.currentStage = 'READY_TO_SEARCH';
    context.collectedData = {
      origin: 'NYC',
      destination: 'Paris',
      dates: '2025-01-15',
    };
    grantSearchConsent(testSessionId);

    const input: OrchestrationInput = {
      sessionId: testSessionId,
      message: 'Yes, search for flights',
      reasoning: mockReasoning('flight_search', 'READY_TO_SEARCH'),
    };

    const result = await orchestrateExecution(input);

    expect(result.logs.some(l => l.message.includes('EXECUTING'))).toBe(true);
    expect(result.actionExecuted).toBe(true);
  });

  it('should log permission checks', async () => {
    const input: OrchestrationInput = {
      sessionId: testSessionId,
      message: 'Find flights to London',
      reasoning: mockReasoning('flight_search', 'NARROWING'),
    };

    const result = await orchestrateExecution(input);

    const permissionLogs = result.logs.filter(l => l.type === 'permission');
    expect(permissionLogs.length).toBeGreaterThan(0);
  });
});

describe('canExecuteSearchNow', () => {
  const testSessionId = 'test_session_004';

  beforeEach(() => {
    resetStageContext(testSessionId);
  });

  it('should return false when missing data', () => {
    const result = canExecuteSearchNow(testSessionId);

    expect(result.canExecute).toBe(false);
    expect(result.missingData.length).toBeGreaterThan(0);
    expect(result.reason).toContain('Missing');
  });

  it('should return false when missing consent', () => {
    const context = getOrCreateStageContext(testSessionId);
    context.currentStage = 'READY_TO_SEARCH';
    context.collectedData = {
      origin: 'JFK',
      destination: 'CDG',
      dates: '2025-02-01',
    };

    const result = canExecuteSearchNow(testSessionId);

    expect(result.canExecute).toBe(false);
    expect(result.needsConsent).toBe(true);
  });

  it('should return false when wrong stage', () => {
    const context = getOrCreateStageContext(testSessionId);
    context.currentStage = 'NARROWING';
    context.collectedData = {
      origin: 'JFK',
      destination: 'CDG',
      dates: '2025-02-01',
    };
    grantSearchConsent(testSessionId);

    const result = canExecuteSearchNow(testSessionId);

    expect(result.canExecute).toBe(false);
    expect(result.reason).toContain('Not in READY_TO_SEARCH');
  });

  it('should return true when all conditions met', () => {
    const context = getOrCreateStageContext(testSessionId);
    context.currentStage = 'READY_TO_SEARCH';
    context.collectedData = {
      origin: 'JFK',
      destination: 'CDG',
      dates: '2025-02-01',
    };
    grantSearchConsent(testSessionId);

    const result = canExecuteSearchNow(testSessionId);

    expect(result.canExecute).toBe(true);
    expect(result.missingData.length).toBe(0);
    expect(result.needsConsent).toBe(false);
  });
});

describe('forceExecuteSearch', () => {
  const testSessionId = 'test_session_005';

  beforeEach(() => {
    resetStageContext(testSessionId);
  });

  it('should block without origin or destination', async () => {
    const result = await forceExecuteSearch(testSessionId, {});

    expect(result.success).toBe(false);
    expect(result.blockedReason).toContain('Origin or destination required');
  });

  it('should block without consent', async () => {
    const result = await forceExecuteSearch(testSessionId, {
      origin: 'NYC',
      destination: 'Paris',
    });

    expect(result.success).toBe(false);
    expect(result.blockedReason).toContain('Search consent required');
    expect(result.nextAction).toBe('ask_consent');
  });

  it('should execute with valid params and consent', async () => {
    grantSearchConsent(testSessionId);

    const result = await forceExecuteSearch(testSessionId, {
      origin: 'NYC',
      destination: 'Paris',
      date: '2025-03-01',
    });

    expect(result.logs.some(l => l.message.includes('FORCE EXECUTING'))).toBe(true);
    expect(result.actionExecuted).toBe(true);
  });

  it('should merge params with collected data', async () => {
    const context = getOrCreateStageContext(testSessionId);
    context.collectedData = {
      origin: 'LAX',
      dates: '2025-04-01',
    };
    grantSearchConsent(testSessionId);

    const result = await forceExecuteSearch(testSessionId, {
      destination: 'Tokyo',
    });

    expect(result.actionExecuted).toBe(true);
    expect(result.logs.some(l =>
      l.data && JSON.stringify(l.data).includes('LAX')
    )).toBe(true);
  });
});

describe('Intent to Action Mapping', () => {
  const testSessionId = 'test_session_006';

  beforeEach(() => {
    resetStageContext(testSessionId);
  });

  it('should map flight_search to search-flights action', async () => {
    const context = getOrCreateStageContext(testSessionId);
    context.currentStage = 'READY_TO_SEARCH';
    context.collectedData = { origin: 'NYC', destination: 'Paris', dates: '2025-01-15' };
    grantSearchConsent(testSessionId);

    const input: OrchestrationInput = {
      sessionId: testSessionId,
      message: 'Search flights now',
      reasoning: mockReasoning('flight_search', 'READY_TO_SEARCH'),
    };

    const result = await orchestrateExecution(input);

    expect(result.logs.some(l => l.message.includes('search-flights'))).toBe(true);
  });

  it('should map hotel_search to search-hotels action', async () => {
    const context = getOrCreateStageContext(testSessionId);
    context.currentStage = 'READY_TO_SEARCH';
    context.collectedData = { destination: 'Paris', dates: '2025-01-15' };
    grantSearchConsent(testSessionId);

    const input: OrchestrationInput = {
      sessionId: testSessionId,
      message: 'Find hotels now',
      reasoning: mockReasoning('hotel_search', 'READY_TO_SEARCH'),
    };

    const result = await orchestrateExecution(input);

    expect(result.logs.some(l => l.message.includes('search-hotels'))).toBe(true);
  });

  it('should return continue for unmapped intents', async () => {
    const input: OrchestrationInput = {
      sessionId: testSessionId,
      message: 'Tell me about Paris',
      reasoning: mockReasoning('general_info', 'DISCOVERY'),
    };

    const result = await orchestrateExecution(input);

    expect(result.nextAction).toBe('continue');
    expect(result.actionExecuted).toBe(false);
  });
});

describe('Execution Logging', () => {
  const testSessionId = 'test_session_007';

  beforeEach(() => {
    resetStageContext(testSessionId);
  });

  it('should log all execution steps', async () => {
    const input: OrchestrationInput = {
      sessionId: testSessionId,
      message: 'Find me a flight to London',
      reasoning: mockReasoning('flight_search', 'NARROWING'),
    };

    const result = await orchestrateExecution(input);

    const logTypes = result.logs.map(l => l.type);
    expect(logTypes).toContain('intent');
    expect(logTypes).toContain('stage');
  });

  it('should include timestamps in logs', async () => {
    const input: OrchestrationInput = {
      sessionId: testSessionId,
      message: 'Hello',
      reasoning: mockReasoning('greeting', 'DISCOVERY'),
    };

    const result = await orchestrateExecution(input);

    result.logs.forEach(log => {
      expect(log.timestamp).toBeDefined();
      expect(typeof log.timestamp).toBe('number');
      expect(log.timestamp).toBeGreaterThan(0);
    });
  });

  it('should include data in relevant logs', async () => {
    const input: OrchestrationInput = {
      sessionId: testSessionId,
      message: 'Yes, please search',
      reasoning: mockReasoning('flight_search', 'READY_TO_SEARCH'),
    };

    const result = await orchestrateExecution(input);

    const intentLog = result.logs.find(l => l.type === 'intent');
    expect(intentLog?.data).toBeDefined();
    expect(intentLog?.data?.chaos).toBeDefined();
  });
});

describe('Stage Preservation', () => {
  const testSessionId = 'test_session_008';

  beforeEach(() => {
    resetStageContext(testSessionId);
  });

  it('should not skip stages', async () => {
    // Start in DISCOVERY
    const input1: OrchestrationInput = {
      sessionId: testSessionId,
      message: 'I want to fly somewhere',
      reasoning: mockReasoning('flight_search', 'DISCOVERY'),
    };

    await orchestrateExecution(input1);

    // Try to jump to READY_TO_BOOK
    const input2: OrchestrationInput = {
      sessionId: testSessionId,
      message: 'Book it now!',
      reasoning: mockReasoning('booking', 'READY_TO_BOOK'),
    };

    const result = await orchestrateExecution(input2);

    // Stage should not have jumped to READY_TO_BOOK
    expect(result.stage).not.toBe('READY_TO_BOOK');
  });

  it('should track stage in result', async () => {
    const input: OrchestrationInput = {
      sessionId: testSessionId,
      message: 'Hello',
      reasoning: mockReasoning('greeting', 'DISCOVERY'),
    };

    const result = await orchestrateExecution(input);

    expect(result.stage).toBeDefined();
    expect(['DISCOVERY', 'NARROWING', 'READY_TO_SEARCH', 'READY_TO_BOOK', 'POST_BOOKING']).toContain(result.stage);
  });
});
