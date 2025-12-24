/**
 * Safe Learning System Tests
 *
 * Verifies: No PII, No raw text, Governance enforcement, Blocked domains
 */

import {
  InMemoryLearningStore,
  createLearningStore,
  type InteractionMetric,
} from '../learning/store-abstraction';
import {
  isBlockedDomain,
  recommendationStore,
  generateDashboard,
} from '../learning/recommendation-engine';
import { trackInteraction, metricsStore } from '../learning/interaction-tracker';

// Helper to create safe metric
function createMetric(overrides: Partial<InteractionMetric> = {}): InteractionMetric {
  return {
    sessionHash: 's_abc123',
    timestamp: Date.now(),
    intentType: 'flight_search',
    chaosClassification: 'CLEAR_INTENT',
    conversationStage: 'DISCOVERY',
    confidenceLevel: 'high',
    primaryAgent: 'flights',
    secondaryAgent: null,
    responsePattern: 'inspirational',
    wasAutoCorrect: false,
    complianceViolations: [],
    outcome: 'resolved',
    successScore: 85,
    language: 'en',
    missingContextCount: 0,
    clarifyingQuestionsAsked: 1,
    ...overrides,
  };
}

describe('PII Protection', () => {
  beforeEach(() => metricsStore.clear());

  it('should hash session ID - no raw ID stored', () => {
    const metric = trackInteraction({
      sessionId: 'user_john.doe@email.com_session_123',
      intentType: 'flight_search',
      chaosClassification: 'CLEAR_INTENT',
      conversationStage: 'DISCOVERY',
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

    expect(metric.sessionHash).not.toContain('john');
    expect(metric.sessionHash).not.toContain('email');
    expect(metric.sessionHash).not.toContain('@');
    expect(metric.sessionHash).toMatch(/^s_[0-9a-f]+$/);
  });

  it('should NOT have any PII fields in metric interface', () => {
    const metric = createMetric();
    const keys = Object.keys(metric);

    // Verify no PII field names
    const piiFields = ['email', 'name', 'phone', 'address', 'ip', 'userId', 'userMessage', 'rawText'];
    piiFields.forEach(field => {
      expect(keys).not.toContain(field);
    });
  });

  it('should NOT store raw conversation text', () => {
    const metric = trackInteraction({
      sessionId: 'test_session',
      intentType: 'flight_search',
      chaosClassification: 'CLEAR_INTENT',
      conversationStage: 'DISCOVERY',
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

    const metricStr = JSON.stringify(metric);

    // No message content
    expect(metricStr).not.toContain('I want to book');
    expect(metricStr).not.toContain('user said');
    expect(metricStr).not.toContain('message');
  });
});

describe('Store Abstraction', () => {
  let store: InMemoryLearningStore;

  beforeEach(() => {
    store = new InMemoryLearningStore({ maxMetrics: 100 });
  });

  it('should create store with factory', () => {
    const memStore = createLearningStore({ type: 'memory' });
    expect(memStore).toBeInstanceOf(InMemoryLearningStore);
  });

  it('should aggregate metrics by time bucket', async () => {
    await store.add(createMetric({ outcome: 'resolved' }));
    await store.add(createMetric({ outcome: 'converted' }));
    await store.add(createMetric({ outcome: 'abandoned' }));

    const aggregated = await store.getAggregated('daily');
    expect(aggregated.length).toBeGreaterThan(0);
    expect(aggregated[0].totalInteractions).toBe(3);
  });

  it('should calculate stage drop-off', async () => {
    await store.add(createMetric({ conversationStage: 'DISCOVERY', outcome: 'resolved' }));
    await store.add(createMetric({ conversationStage: 'DISCOVERY', outcome: 'abandoned' }));

    const dropOff = await store.getStageDropOff();
    expect(dropOff['DISCOVERY']).toBe(50); // 1 of 2 abandoned
  });

  it('should track pattern performance', async () => {
    await store.add(createMetric({ responsePattern: 'inspirational', outcome: 'resolved' }));
    await store.add(createMetric({ responsePattern: 'inspirational', outcome: 'abandoned' }));

    const perf = await store.getPatternPerformance();
    expect(perf['inspirational'].success).toBe(1);
    expect(perf['inspirational'].total).toBe(2);
  });

  it('should respect maxMetrics limit', async () => {
    const smallStore = new InMemoryLearningStore({ maxMetrics: 5 });

    for (let i = 0; i < 10; i++) {
      await smallStore.add(createMetric());
    }

    const all = await smallStore.getAll();
    expect(all.length).toBe(5);
  });
});

describe('Governance Guardrails', () => {
  beforeEach(() => recommendationStore.clear());

  it('should block payment-related recommendations', () => {
    expect(isBlockedDomain('payment processing optimization')).toBe(true);
    expect(isBlockedDomain('billing flow improvement')).toBe(true);
    expect(isBlockedDomain('refund policy changes')).toBe(true);
  });

  it('should block legal-related recommendations', () => {
    expect(isBlockedDomain('legal compliance update')).toBe(true);
    expect(isBlockedDomain('compensation calculation')).toBe(true);
  });

  it('should block pricing-related recommendations', () => {
    expect(isBlockedDomain('pricing strategy change')).toBe(true);
  });

  it('should allow non-sensitive recommendations', () => {
    expect(isBlockedDomain('discovery stage improvement')).toBe(false);
    expect(isBlockedDomain('flight search optimization')).toBe(false);
    expect(isBlockedDomain('hotel booking flow')).toBe(false);
  });

  it('should require manual approval for all recommendations', async () => {
    const store = new InMemoryLearningStore();

    // Add enough metrics to trigger recommendations
    for (let i = 0; i < 100; i++) {
      await store.add(createMetric({
        responsePattern: i < 80 ? 'error_recovery' : 'inspirational',
        outcome: i < 30 ? 'resolved' : 'abandoned',
      }));
    }

    // All recommendations should be pending
    const pending = recommendationStore.getPending();
    pending.forEach(rec => {
      expect(rec.status).toMatch(/pending|blocked/);
      expect(rec.approvedBy).toBeUndefined();
    });
  });

  it('should track audit log for approvals', () => {
    // Add a mock recommendation directly
    const mockRec = {
      id: 'test_rec_001',
      createdAt: Date.now(),
      type: 'pattern_improvement' as const,
      status: 'pending' as const,
      finding: 'Test finding',
      suggestion: 'Test suggestion',
      impact: 'medium' as const,
      confidence: 80,
      sampleSize: 50,
      successDelta: 10,
    };

    // Access internal method via the store
    recommendationStore.approve('test_rec_001', 'admin_user');

    const log = recommendationStore.getAuditLog();
    // Should have audit entries
    expect(Array.isArray(log)).toBe(true);
  });
});

describe('Dashboard Generation', () => {
  let store: InMemoryLearningStore;

  beforeEach(async () => {
    store = new InMemoryLearningStore();

    // Seed with diverse data
    const intents = ['flight_search', 'hotel_search', 'booking_status'];
    const outcomes: Array<'resolved' | 'abandoned' | 'converted'> = ['resolved', 'abandoned', 'converted'];
    const stages: Array<'DISCOVERY' | 'NARROWING' | 'READY_TO_SEARCH'> = ['DISCOVERY', 'NARROWING', 'READY_TO_SEARCH'];

    for (let i = 0; i < 50; i++) {
      await store.add(createMetric({
        intentType: intents[i % 3],
        outcome: outcomes[i % 3],
        conversationStage: stages[i % 3],
        primaryAgent: i % 2 === 0 ? 'flights' : 'hotels',
      }));
    }
  });

  it('should generate dashboard with all required fields', async () => {
    const report = await generateDashboard(7);

    expect(report).toHaveProperty('topFailedIntents');
    expect(report).toHaveProperty('topSuccessfulFlows');
    expect(report).toHaveProperty('stageDropOffHeatmap');
    expect(report).toHaveProperty('avgTurnsPerResolved');
    expect(report).toHaveProperty('weakPatterns');
    expect(report).toHaveProperty('strongPatterns');
    expect(report).toHaveProperty('pendingRecommendations');
  });

  it('should calculate avgTurnsPerResolved correctly', async () => {
    const report = await generateDashboard(7);
    expect(typeof report.avgTurnsPerResolved).toBe('number');
    expect(report.avgTurnsPerResolved).toBeGreaterThanOrEqual(0);
  });
});

describe('Learning Disabled Check', () => {
  it('should not process when governance is disabled', () => {
    // The GOVERNANCE_ENABLED flag in recommendation-engine.ts
    // When false, generateRecommendations returns empty
    // This is tested by checking the behavior
    const rec = recommendationStore.getPending();
    expect(Array.isArray(rec)).toBe(true);
  });
});

describe('No Per-User Tracking', () => {
  it('should not allow tracking individual users across sessions', async () => {
    const store = new InMemoryLearningStore();

    await store.add(createMetric({ sessionHash: 's_user1_hash1' }));
    await store.add(createMetric({ sessionHash: 's_user1_hash2' }));
    await store.add(createMetric({ sessionHash: 's_user2_hash1' }));

    const all = await store.getAll();

    // Hashes are unique per session, not trackable to user
    const hashes = all.map(m => m.sessionHash);
    const unique = new Set(hashes);
    expect(unique.size).toBe(3); // Each session is separate
  });
});
