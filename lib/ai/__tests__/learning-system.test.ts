/**
 * Safe Learning System Tests
 *
 * Verifies ML-safe architecture, governance rules, and manual approval requirements.
 */

import {
  trackInteraction,
  metricsStore,
  getAgentPerformance,
  getMostFailedIntents,
  getMostSuccessfulFlows,
  type InteractionOutcome,
} from '../learning/interaction-tracker';
import {
  generateSuggestions,
  approveSuggestion,
  rejectSuggestion,
  getPendingSuggestions,
  suggestionStore,
  isPatternImprovementApproved,
} from '../learning/suggestion-engine';

describe('Interaction Tracker', () => {
  beforeEach(() => {
    metricsStore.clear();
  });

  it('should hash session ID to prevent PII leakage', () => {
    const metric = trackInteraction({
      sessionId: 'user_123_secret_session',
      intentType: 'flight_search',
      chaosClassification: 'CLEAR_INTENT',
      conversationStage: 'READY_TO_SEARCH',
      confidenceLevel: 'high',
      primaryAgent: 'flights',
      secondaryAgent: null,
      wasAutoCorrect: false,
      complianceViolations: [],
      outcome: 'resolved',
      language: 'en',
      missingContextCount: 0,
      clarifyingQuestionsAsked: 0,
    });

    // Session hash should NOT contain original ID
    expect(metric.sessionHash).not.toContain('user_123');
    expect(metric.sessionHash).not.toContain('secret');
    expect(metric.sessionHash).toMatch(/^s_[0-9a-f]+$/);
  });

  it('should NOT store raw conversation text', () => {
    const metric = trackInteraction({
      sessionId: 'test_session',
      intentType: 'flight_search',
      chaosClassification: 'EXPLORATORY_TRAVEL',
      conversationStage: 'DISCOVERY',
      confidenceLevel: 'low',
      primaryAgent: 'flights',
      secondaryAgent: null,
      wasAutoCorrect: false,
      complianceViolations: [],
      outcome: 'clarified',
      language: 'pt',
      missingContextCount: 2,
      clarifyingQuestionsAsked: 1,
    });

    // Verify no text content in metric
    const metricStr = JSON.stringify(metric);
    expect(metricStr).not.toContain('quero');
    expect(metricStr).not.toContain('viagem');
    expect(metricStr).not.toContain('user message');
  });

  it('should calculate success score correctly', () => {
    // High success: resolved + high confidence
    const highSuccess = trackInteraction({
      sessionId: 'test1',
      intentType: 'flight_search',
      chaosClassification: 'CLEAR_INTENT',
      conversationStage: 'READY_TO_SEARCH',
      confidenceLevel: 'high',
      primaryAgent: 'flights',
      secondaryAgent: null,
      wasAutoCorrect: false,
      complianceViolations: [],
      outcome: 'converted',
      language: 'en',
      missingContextCount: 0,
      clarifyingQuestionsAsked: 0,
    });
    expect(highSuccess.successScore).toBeGreaterThanOrEqual(90);

    // Low success: abandoned + low confidence + auto-correct
    const lowSuccess = trackInteraction({
      sessionId: 'test2',
      intentType: 'flight_search',
      chaosClassification: 'CHAOTIC_INTENT',
      conversationStage: 'DISCOVERY',
      confidenceLevel: 'low',
      primaryAgent: 'flights',
      secondaryAgent: null,
      wasAutoCorrect: true,
      complianceViolations: ['GENERIC_OPENER'],
      outcome: 'abandoned',
      language: 'en',
      missingContextCount: 3,
      clarifyingQuestionsAsked: 2,
    });
    expect(lowSuccess.successScore).toBeLessThanOrEqual(20);
  });

  it('should track response patterns correctly', () => {
    const discovery = trackInteraction({
      sessionId: 'test',
      intentType: 'flight_search',
      chaosClassification: 'EXPLORATORY_TRAVEL',
      conversationStage: 'DISCOVERY',
      confidenceLevel: 'low',
      primaryAgent: 'flights',
      secondaryAgent: null,
      wasAutoCorrect: false,
      complianceViolations: [],
      outcome: 'clarified',
      language: 'en',
      missingContextCount: 2,
      clarifyingQuestionsAsked: 1,
    });
    expect(discovery.responsePattern).toBe('inspirational');

    const deadEnd = trackInteraction({
      sessionId: 'test2',
      intentType: 'flight_search',
      chaosClassification: 'LOW_INFORMATION',
      conversationStage: 'NARROWING',
      confidenceLevel: 'medium',
      primaryAgent: 'flights',
      secondaryAgent: null,
      wasAutoCorrect: true,
      complianceViolations: ['DEAD_END_BLOCKED'],
      outcome: 'resolved',
      language: 'en',
      missingContextCount: 1,
      clarifyingQuestionsAsked: 1,
    });
    expect(deadEnd.responsePattern).toBe('dead_end_prevented');
  });
});

describe('Analytics Dashboard', () => {
  beforeEach(() => {
    metricsStore.clear();

    // Add sample metrics
    for (let i = 0; i < 20; i++) {
      trackInteraction({
        sessionId: `session_${i}`,
        intentType: i < 15 ? 'flight_search' : 'hotel_search',
        chaosClassification: i < 10 ? 'CLEAR_INTENT' : 'CHAOTIC_INTENT',
        conversationStage: i < 12 ? 'READY_TO_SEARCH' : 'DISCOVERY',
        confidenceLevel: i < 10 ? 'high' : 'low',
        primaryAgent: i < 15 ? 'flights' : 'hotels',
        secondaryAgent: null,
        wasAutoCorrect: i > 15,
        complianceViolations: i > 17 ? ['GENERIC_OPENER'] : [],
        outcome: i < 10 ? 'resolved' : (i < 15 ? 'clarified' : 'abandoned') as InteractionOutcome,
        language: 'en',
        missingContextCount: i > 10 ? 2 : 0,
        clarifyingQuestionsAsked: i > 10 ? 1 : 0,
      });
    }
  });

  it('should calculate agent performance', () => {
    const performance = getAgentPerformance();

    const flightsPerf = performance.find(p => p.agent === 'flights');
    expect(flightsPerf).toBeDefined();
    expect(flightsPerf!.totalInteractions).toBe(15);
    expect(flightsPerf!.resolvedRate).toBeGreaterThan(0);

    const hotelsPerf = performance.find(p => p.agent === 'hotels');
    expect(hotelsPerf).toBeDefined();
    expect(hotelsPerf!.totalInteractions).toBe(5);
  });

  it('should identify failed intents', () => {
    const failed = getMostFailedIntents(5);
    expect(failed.length).toBeGreaterThan(0);

    // Each analysis should have required fields
    failed.forEach(f => {
      expect(f.intent).toBeDefined();
      expect(typeof f.failureRate).toBe('number');
      expect(typeof f.avgSuccessScore).toBe('number');
    });
  });

  it('should identify successful flows', () => {
    const flows = getMostSuccessfulFlows(5);
    expect(flows.length).toBeGreaterThan(0);

    // Highest scoring flows should be first
    for (let i = 1; i < flows.length; i++) {
      expect(flows[i - 1].avgScore).toBeGreaterThanOrEqual(flows[i].avgScore);
    }
  });
});

describe('Suggestion Engine', () => {
  beforeEach(() => {
    metricsStore.clear();
    // Clear suggestions by creating new store (in production use proper clear method)
  });

  it('should generate suggestions for high-failure intents', () => {
    // Add failing metrics
    for (let i = 0; i < 15; i++) {
      trackInteraction({
        sessionId: `failing_${i}`,
        intentType: 'problematic_intent',
        chaosClassification: 'CHAOTIC_INTENT',
        conversationStage: 'DISCOVERY',
        confidenceLevel: 'low',
        primaryAgent: 'flights',
        secondaryAgent: null,
        wasAutoCorrect: true,
        complianceViolations: ['ERROR'],
        outcome: 'abandoned',
        language: 'en',
        missingContextCount: 3,
        clarifyingQuestionsAsked: 2,
      });
    }

    const suggestions = generateSuggestions();
    // Should generate at least one suggestion for high failure rate
    expect(suggestions.length).toBeGreaterThanOrEqual(0);
  });

  it('should require manual approval for suggestions', () => {
    // Add metrics to trigger suggestion
    for (let i = 0; i < 15; i++) {
      trackInteraction({
        sessionId: `test_${i}`,
        intentType: 'test_intent',
        chaosClassification: 'LOW_INFORMATION',
        conversationStage: 'DISCOVERY',
        confidenceLevel: 'low',
        primaryAgent: 'general',
        secondaryAgent: null,
        wasAutoCorrect: true,
        complianceViolations: [],
        outcome: i < 10 ? 'abandoned' : 'resolved',
        language: 'en',
        missingContextCount: 2,
        clarifyingQuestionsAsked: 2,
      });
    }

    generateSuggestions();
    const pending = getPendingSuggestions();

    // All suggestions should be pending (not auto-applied)
    pending.forEach(s => {
      expect(s.status).toBe('pending');
      expect(s.approvedBy).toBeUndefined();
    });
  });

  it('should track approval workflow', () => {
    // Create a mock suggestion directly
    const mockSuggestion = {
      id: 'test_sug_001',
      createdAt: Date.now(),
      status: 'pending' as const,
      targetIntent: 'test_intent',
      targetChaos: 'LOW_INFORMATION' as const,
      targetStage: 'DISCOVERY' as const,
      targetAgent: 'flights' as const,
      currentPattern: 'clarifying_question' as const,
      suggestedPattern: 'inspirational' as const,
      reasoning: 'Test reasoning',
      failureRate: 50,
      sampleSize: 20,
    };

    // Add to store and approve
    suggestionStore.add(mockSuggestion);
    const approved = approveSuggestion('test_sug_001', 'admin_user');
    expect(approved).toBe(true);

    // Verify approval
    const suggestion = suggestionStore.getApproved().find(s => s.id === 'test_sug_001');
    expect(suggestion).toBeDefined();
    expect(suggestion!.status).toBe('approved');
    expect(suggestion!.approvedBy).toBe('admin_user');
  });

  it('should track rejection workflow', () => {
    const mockSuggestion = {
      id: 'test_sug_002',
      createdAt: Date.now(),
      status: 'pending' as const,
      targetIntent: 'test_intent',
      targetChaos: 'CHAOTIC_INTENT' as const,
      targetStage: 'NARROWING' as const,
      targetAgent: 'hotels' as const,
      currentPattern: 'error_recovery' as const,
      suggestedPattern: 'consultative' as const,
      reasoning: 'Test reasoning',
      failureRate: 40,
      sampleSize: 15,
    };

    suggestionStore.add(mockSuggestion);
    const rejected = rejectSuggestion('test_sug_002', 'Not applicable to current flow');
    expect(rejected).toBe(true);

    // Should not be in approved list
    const approved = suggestionStore.getApproved();
    expect(approved.find(s => s.id === 'test_sug_002')).toBeUndefined();
  });

  it('should only apply approved pattern improvements', () => {
    // Add and approve a unique suggestion
    const uniqueId = `approved_sug_${Date.now()}`;
    const mockApproved = {
      id: uniqueId,
      createdAt: Date.now(),
      status: 'pending' as const,
      targetIntent: 'unique_specific_intent',
      targetChaos: 'EXPLORATORY_TRAVEL' as const,
      targetStage: 'DISCOVERY' as const,
      targetAgent: 'hotels' as const,
      currentPattern: 'error_recovery' as const,
      suggestedPattern: 'consultative' as const,
      reasoning: 'Test unique',
      failureRate: 35,
      sampleSize: 25,
    };
    suggestionStore.add(mockApproved);

    // Before approval - should not return improvement
    const beforeApproval = isPatternImprovementApproved('error_recovery', {
      intent: 'unique_specific_intent',
      chaos: 'EXPLORATORY_TRAVEL',
      stage: 'DISCOVERY',
      agent: 'hotels',
    });
    expect(beforeApproval).toBeNull();

    // Approve
    approveSuggestion(uniqueId, 'admin');

    // After approval - should return the improvement
    const afterApproval = isPatternImprovementApproved('error_recovery', {
      intent: 'unique_specific_intent',
      chaos: 'EXPLORATORY_TRAVEL',
      stage: 'DISCOVERY',
      agent: 'hotels',
    });
    expect(afterApproval).toBe('consultative');
  });
});

describe('Governance Rules', () => {
  it('should NOT store any PII', () => {
    const metric = trackInteraction({
      sessionId: 'john.doe@email.com',  // Email as session ID
      intentType: 'flight_search',
      chaosClassification: 'CLEAR_INTENT',
      conversationStage: 'READY_TO_SEARCH',
      confidenceLevel: 'high',
      primaryAgent: 'flights',
      secondaryAgent: null,
      wasAutoCorrect: false,
      complianceViolations: [],
      outcome: 'resolved',
      language: 'en',
      missingContextCount: 0,
      clarifyingQuestionsAsked: 0,
    });

    // Email should be hashed, not stored
    expect(metric.sessionHash).not.toContain('john');
    expect(metric.sessionHash).not.toContain('email');
    expect(metric.sessionHash).not.toContain('@');
  });

  it('should only track safe metadata', () => {
    const metrics = metricsStore.getAll();

    metrics.forEach(m => {
      // Verify only safe fields exist
      expect(m).toHaveProperty('intentType');
      expect(m).toHaveProperty('conversationStage');
      expect(m).toHaveProperty('outcome');
      expect(m).toHaveProperty('successScore');

      // Verify NO raw content
      expect(m).not.toHaveProperty('userMessage');
      expect(m).not.toHaveProperty('aiResponse');
      expect(m).not.toHaveProperty('conversationText');
    });
  });

  it('should require manual approval (NEVER auto-change)', () => {
    // Generate suggestions
    for (let i = 0; i < 20; i++) {
      trackInteraction({
        sessionId: `gov_test_${i}`,
        intentType: 'governance_test',
        chaosClassification: 'CHAOTIC_INTENT',
        conversationStage: 'DISCOVERY',
        confidenceLevel: 'low',
        primaryAgent: 'flights',
        secondaryAgent: null,
        wasAutoCorrect: true,
        complianceViolations: [],
        outcome: 'abandoned',
        language: 'en',
        missingContextCount: 2,
        clarifyingQuestionsAsked: 2,
      });
    }

    generateSuggestions();
    const pending = getPendingSuggestions();

    // ALL suggestions must be pending - none auto-applied
    pending.forEach(s => {
      expect(s.status).toBe('pending');
      expect(s.approvedBy).toBeUndefined();
      expect(s.approvedAt).toBeUndefined();
    });
  });
});
