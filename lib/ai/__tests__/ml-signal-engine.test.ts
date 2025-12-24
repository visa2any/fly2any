/**
 * ML Signal Engine Tests
 *
 * Validates: Governance, Forbidden domains, Advisory-only, Audit logging
 */

import {
  mlSignalStore,
  mlAuditLog,
  predictIntentConfidence,
  predictStageDropoff,
  predictOptimalAgent,
  runMLAnalysis,
  isMLSafeForDomain,
  getApprovedSignals,
  type MLSignal,
} from '../learning/ml-signal-engine';
import { InMemoryLearningStore, setActiveStore } from '../learning/store-abstraction';
import type { InteractionMetric } from '../learning/interaction-tracker';

// Helper to create test metrics
function createMetric(overrides: Partial<InteractionMetric> = {}): InteractionMetric {
  return {
    sessionHash: 's_test123',
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

describe('ML Signal Engine Governance', () => {
  beforeEach(() => {
    mlSignalStore.clear();
    mlAuditLog.clear();
    const store = new InMemoryLearningStore();
    setActiveStore(store);
  });

  describe('Advisory-Only Constraint', () => {
    it('should always set isAdvisoryOnly to true', async () => {
      const store = new InMemoryLearningStore();
      for (let i = 0; i < 10; i++) {
        await store.add(createMetric());
      }
      setActiveStore(store);

      const signal = await predictIntentConfidence('flight_search', 'CLEAR_INTENT');
      expect(signal.isAdvisoryOnly).toBe(true);
    });

    it('should always require approval', async () => {
      const store = new InMemoryLearningStore();
      for (let i = 0; i < 10; i++) {
        await store.add(createMetric());
      }
      setActiveStore(store);

      const signal = await predictStageDropoff('DISCOVERY');
      expect(signal.requiresApproval).toBe(true);
    });

    it('should start with pending status', async () => {
      const store = new InMemoryLearningStore();
      for (let i = 0; i < 10; i++) {
        await store.add(createMetric());
      }
      setActiveStore(store);

      const signal = await predictOptimalAgent('flight_search', null);
      expect(signal.status).toBe('pending');
    });
  });

  describe('Forbidden Domains', () => {
    it('should block payment-related signals', () => {
      const signal: MLSignal = {
        id: 'test_1',
        createdAt: Date.now(),
        modelType: 'intent_confidence',
        status: 'pending',
        prediction: 80,
        explanation: 'Optimize payment processing flow',
        features: ['payment', 'checkout'],
        isAdvisoryOnly: true,
        requiresApproval: true,
      };

      const result = mlSignalStore.add(signal);
      expect(result.status).toBe('blocked');
      expect(result.blockedReason).toContain('forbidden');
    });

    it('should block pricing-related signals', () => {
      const signal: MLSignal = {
        id: 'test_2',
        createdAt: Date.now(),
        modelType: 'agent_routing',
        status: 'pending',
        prediction: 75,
        explanation: 'Improve pricing display efficiency',
        features: ['pricing', 'display'],
        isAdvisoryOnly: true,
        requiresApproval: true,
      };

      const result = mlSignalStore.add(signal);
      expect(result.status).toBe('blocked');
    });

    it('should block legal-related signals', () => {
      const signal: MLSignal = {
        id: 'test_3',
        createdAt: Date.now(),
        modelType: 'stage_dropoff',
        status: 'pending',
        prediction: 60,
        explanation: 'Legal terms acceptance improvement',
        features: ['legal', 'terms'],
        isAdvisoryOnly: true,
        requiresApproval: true,
      };

      const result = mlSignalStore.add(signal);
      expect(result.status).toBe('blocked');
    });

    it('should block response generation attempts', () => {
      const signal: MLSignal = {
        id: 'test_4',
        createdAt: Date.now(),
        modelType: 'intent_confidence',
        status: 'pending',
        prediction: 90,
        explanation: 'Improve response_generation quality',
        features: ['response', 'generation'],
        isAdvisoryOnly: true,
        requiresApproval: true,
      };

      const result = mlSignalStore.add(signal);
      expect(result.status).toBe('blocked');
    });

    it('should allow safe domains', () => {
      const signal: MLSignal = {
        id: 'test_5',
        createdAt: Date.now(),
        modelType: 'intent_confidence',
        status: 'pending',
        prediction: 85,
        explanation: 'Improve flight search classification',
        features: ['intent', 'classification'],
        isAdvisoryOnly: true,
        requiresApproval: true,
      };

      const result = mlSignalStore.add(signal);
      expect(result.status).toBe('pending');
    });
  });

  describe('isMLSafeForDomain', () => {
    it('should return false for payment', () => {
      expect(isMLSafeForDomain('payment optimization')).toBe(false);
    });

    it('should return false for pricing', () => {
      expect(isMLSafeForDomain('pricing strategy')).toBe(false);
    });

    it('should return false for billing', () => {
      expect(isMLSafeForDomain('billing improvement')).toBe(false);
    });

    it('should return true for safe domains', () => {
      expect(isMLSafeForDomain('flight search')).toBe(true);
      expect(isMLSafeForDomain('hotel booking flow')).toBe(true);
      expect(isMLSafeForDomain('discovery stage')).toBe(true);
    });
  });
});

describe('ML Signal Approval Flow', () => {
  beforeEach(() => {
    mlSignalStore.clear();
    mlAuditLog.clear();
  });

  it('should require human approval', () => {
    const signal: MLSignal = {
      id: 'approval_test',
      createdAt: Date.now(),
      modelType: 'intent_confidence',
      status: 'pending',
      prediction: 80,
      explanation: 'Intent classification improvement',
      features: ['intent', 'chaos'],
      isAdvisoryOnly: true,
      requiresApproval: true,
    };

    mlSignalStore.add(signal);

    // Not approved yet
    expect(mlSignalStore.getApproved().length).toBe(0);
    expect(mlSignalStore.getPending().length).toBe(1);

    // Approve
    mlSignalStore.approve('approval_test', 'admin_user');

    expect(mlSignalStore.getApproved().length).toBe(1);
    expect(mlSignalStore.getPending().length).toBe(0);
  });

  it('should not approve blocked signals', () => {
    const signal: MLSignal = {
      id: 'blocked_test',
      createdAt: Date.now(),
      modelType: 'intent_confidence',
      status: 'pending',
      prediction: 80,
      explanation: 'Payment flow optimization',
      features: ['payment'],
      isAdvisoryOnly: true,
      requiresApproval: true,
    };

    mlSignalStore.add(signal);

    const result = mlSignalStore.approve('blocked_test', 'admin');
    expect(result).toBe(false);
  });

  it('should allow rejection', () => {
    const signal: MLSignal = {
      id: 'reject_test',
      createdAt: Date.now(),
      modelType: 'stage_dropoff',
      status: 'pending',
      prediction: 50,
      explanation: 'Stage optimization',
      features: ['stage'],
      isAdvisoryOnly: true,
      requiresApproval: true,
    };

    mlSignalStore.add(signal);
    mlSignalStore.reject('reject_test', 'admin');

    const pending = mlSignalStore.getPending();
    expect(pending.length).toBe(0);
  });
});

describe('Audit Logging', () => {
  beforeEach(() => {
    mlSignalStore.clear();
    mlAuditLog.clear();
  });

  it('should log signal creation', () => {
    const signal: MLSignal = {
      id: 'audit_test',
      createdAt: Date.now(),
      modelType: 'intent_confidence',
      status: 'pending',
      prediction: 80,
      explanation: 'Test signal',
      features: ['test'],
      isAdvisoryOnly: true,
      requiresApproval: true,
    };

    mlSignalStore.add(signal);

    const log = mlAuditLog.getAll();
    expect(log.length).toBeGreaterThan(0);
    expect(log.some(e => e.action === 'signal_created')).toBe(true);
  });

  it('should log approvals', () => {
    const signal: MLSignal = {
      id: 'audit_approve',
      createdAt: Date.now(),
      modelType: 'agent_routing',
      status: 'pending',
      prediction: 70,
      explanation: 'Agent routing test',
      features: ['agent'],
      isAdvisoryOnly: true,
      requiresApproval: true,
    };

    mlSignalStore.add(signal);
    mlSignalStore.approve('audit_approve', 'test_admin');

    const log = mlAuditLog.getAll();
    expect(log.some(e => e.action === 'signal_approved')).toBe(true);
    expect(log.some(e => e.actor === 'test_admin')).toBe(true);
  });

  it('should log rejections', () => {
    const signal: MLSignal = {
      id: 'audit_reject',
      createdAt: Date.now(),
      modelType: 'stage_dropoff',
      status: 'pending',
      prediction: 40,
      explanation: 'Dropoff test',
      features: ['stage'],
      isAdvisoryOnly: true,
      requiresApproval: true,
    };

    mlSignalStore.add(signal);
    mlSignalStore.reject('audit_reject', 'reviewer');

    const log = mlAuditLog.getAll();
    expect(log.some(e => e.action === 'signal_rejected')).toBe(true);
  });

  it('should filter by model type', () => {
    mlAuditLog.log('test_action', 'id1', 'intent_confidence', 'system');
    mlAuditLog.log('test_action', 'id2', 'stage_dropoff', 'system');

    const intentLogs = mlAuditLog.getByModel('intent_confidence');
    expect(intentLogs.length).toBe(1);
    expect(intentLogs[0].modelType).toBe('intent_confidence');
  });
});

describe('ML Predictions', () => {
  let store: InMemoryLearningStore;

  beforeEach(async () => {
    mlSignalStore.clear();
    mlAuditLog.clear();
    store = new InMemoryLearningStore();

    // Add test data
    for (let i = 0; i < 60; i++) {
      await store.add(createMetric({
        intentType: i < 40 ? 'flight_search' : 'hotel_search',
        outcome: i % 3 === 0 ? 'abandoned' : 'resolved',
        conversationStage: i % 2 === 0 ? 'DISCOVERY' : 'NARROWING',
        primaryAgent: i % 2 === 0 ? 'flights' : 'hotels',
      }));
    }

    setActiveStore(store);
  });

  it('should predict intent confidence', async () => {
    const signal = await predictIntentConfidence('flight_search', 'CLEAR_INTENT');

    expect(signal.modelType).toBe('intent_confidence');
    expect(signal.prediction).toBeGreaterThanOrEqual(0);
    expect(signal.prediction).toBeLessThanOrEqual(100);
    expect(signal.suggestedConfidence).toBeDefined();
    expect(signal.isAdvisoryOnly).toBe(true);
  });

  it('should predict stage dropoff', async () => {
    const signal = await predictStageDropoff('DISCOVERY');

    expect(signal.modelType).toBe('stage_dropoff');
    expect(signal.dropoffRisk).toMatch(/low|medium|high/);
    expect(signal.suggestedIntervention).toBeDefined();
  });

  it('should predict optimal agent', async () => {
    const signal = await predictOptimalAgent('flight_search', 'flights');

    expect(signal.modelType).toBe('agent_routing');
    expect(signal.suggestedAgent).toBeDefined();
    expect(typeof signal.efficiencyGain).toBe('number');
  });
});

describe('Batch Analysis', () => {
  beforeEach(() => {
    mlSignalStore.clear();
    mlAuditLog.clear();
  });

  it('should skip analysis with insufficient data', async () => {
    const store = new InMemoryLearningStore();
    setActiveStore(store);

    const report = await runMLAnalysis();
    expect(report.totalSignals).toBe(0);
  });

  it('should run full analysis with sufficient data', async () => {
    const store = new InMemoryLearningStore();
    for (let i = 0; i < 60; i++) {
      await store.add(createMetric({
        intentType: `intent_${i % 3}`,
        conversationStage: i % 2 === 0 ? 'DISCOVERY' : 'NARROWING',
      }));
    }
    setActiveStore(store);

    const report = await runMLAnalysis();

    expect(report.totalSignals).toBeGreaterThan(0);
    expect(report.auditEntries).toBeGreaterThan(0);
    expect(report.intentConfidence.length).toBeGreaterThan(0);
    expect(report.stageDropoff.length).toBeGreaterThan(0);
  });
});

describe('No PII in Signals', () => {
  it('should not include PII fields', async () => {
    const store = new InMemoryLearningStore();
    for (let i = 0; i < 10; i++) {
      await store.add(createMetric());
    }
    setActiveStore(store);

    const signal = await predictIntentConfidence('flight_search', 'CLEAR_INTENT');
    const signalStr = JSON.stringify(signal);

    expect(signalStr).not.toContain('email');
    expect(signalStr).not.toContain('name');
    expect(signalStr).not.toContain('phone');
    expect(signalStr).not.toContain('address');
    expect(signalStr).not.toContain('userId');
  });

  it('should only use safe features', async () => {
    const store = new InMemoryLearningStore();
    for (let i = 0; i < 10; i++) {
      await store.add(createMetric());
    }
    setActiveStore(store);

    const signal = await predictOptimalAgent('flight_search', null);

    // Features should be generic, not personal
    signal.features.forEach(f => {
      expect(f).not.toMatch(/email|name|phone|userId|ip/i);
    });
  });
});
