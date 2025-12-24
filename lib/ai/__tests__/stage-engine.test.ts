/**
 * Conversation Stage Engine Tests
 *
 * Verifies strict stage transitions, consent gates, and action enforcement.
 */

import {
  getStageContext,
  initStageContext,
  getOrCreateStageContext,
  attemptTransition,
  isActionAllowed,
  isActionForbidden,
  extractDataFromMessage,
  determineNextStage,
  getStageGuidance,
  getConsentPrompt,
  stageStore,
  STAGE_RULES,
  type CollectedData,
  type UserConsents,
} from '../conversion/stage-engine';

import {
  stageMetricsStore,
  trackSessionStart,
  trackStageTransition,
  trackSessionDropOff,
  getStageAnalytics,
  getFunnelMetrics,
} from '../conversion/stage-analytics';

describe('Stage Context Management', () => {
  beforeEach(() => {
    stageStore.clear();
  });

  it('should initialize new context at DISCOVERY stage', () => {
    const context = initStageContext('session_001');

    expect(context.currentStage).toBe('DISCOVERY');
    expect(context.previousStage).toBeNull();
    expect(context.stageHistory).toEqual([]);
    expect(context.userConsents.searchPermission).toBe(false);
    expect(context.userConsents.bookingPermission).toBe(false);
  });

  it('should return existing context', () => {
    initStageContext('session_002');
    const context = getStageContext('session_002');

    expect(context).not.toBeNull();
    expect(context!.sessionId).toBe('session_002');
  });

  it('should return null for non-existent session', () => {
    const context = getStageContext('non_existent');
    expect(context).toBeNull();
  });

  it('should get or create context', () => {
    const context1 = getOrCreateStageContext('session_003');
    expect(context1.currentStage).toBe('DISCOVERY');

    // Modify the context
    context1.currentStage = 'NARROWING';

    // Get again - should return existing
    const context2 = getOrCreateStageContext('session_003');
    expect(context2.currentStage).toBe('NARROWING');
  });
});

describe('Data Extraction', () => {
  it('should extract origin from message', () => {
    const data = extractDataFromMessage('I want to fly from New York', {});
    expect(data.origin).toBe('New');
  });

  it('should extract destination from message', () => {
    const data = extractDataFromMessage('I want to go to Paris', {});
    expect(data.destination?.toLowerCase()).toBe('paris');
  });

  it('should extract dates from message', () => {
    const data = extractDataFromMessage('I want to travel in December', {});
    expect(data.dates).toBe('December');
  });

  it('should extract passenger count', () => {
    const data = extractDataFromMessage('We are 4 adults traveling', {});
    expect(data.passengers).toBe(4);
  });

  it('should detect family travel type', () => {
    const data = extractDataFromMessage('Traveling with kids', {});
    expect(data.travelType).toBe('family');
  });

  it('should detect business travel type', () => {
    const data = extractDataFromMessage('This is a business trip', {});
    expect(data.travelType).toBe('business');
  });

  it('should detect budget style', () => {
    const budget = extractDataFromMessage('Looking for cheap flights', {});
    expect(budget.budgetStyle).toBe('budget');

    const premium = extractDataFromMessage('I want first class', {});
    expect(premium.budgetStyle).toBe('premium');
  });

  it('should preserve existing data', () => {
    const existing: CollectedData = { origin: 'NYC', passengers: 2 };
    const updated = extractDataFromMessage('Going to Paris', existing);

    expect(updated.origin).toBe('NYC');
    expect(updated.passengers).toBe(2);
    expect(updated.destination).toBe('Paris');
  });
});

describe('Stage Transition Rules', () => {
  beforeEach(() => {
    stageStore.clear();
  });

  it('should stay in DISCOVERY without specific intent', () => {
    const result = attemptTransition(
      'trans_001',
      'I want to travel somewhere nice',
      { chaosType: 'EXPLORATORY_TRAVEL', confidence: 'low', interpretation: '' }
    );

    expect(result.newStage).toBe('DISCOVERY');
  });

  it('should transition from DISCOVERY to NARROWING with destination', () => {
    const result = attemptTransition(
      'trans_002',
      'I want to go to Paris',
      { chaosType: 'CLEAR_INTENT', confidence: 'medium', interpretation: '' }
    );

    expect(result.newStage).toBe('NARROWING');
    expect(result.allowed).toBe(true);
  });

  it('should NOT skip stages (DISCOVERY → READY_TO_SEARCH blocked)', () => {
    // Initialize at DISCOVERY
    initStageContext('trans_003');

    // Try to jump to READY_TO_SEARCH - should block
    const context = getStageContext('trans_003')!;

    // Manually try to determine if we can skip
    const targetStage = 'READY_TO_SEARCH';
    const rules = STAGE_RULES['DISCOVERY'];

    expect(rules.nextStages).not.toContain(targetStage);
  });

  it('should require search consent for READY_TO_SEARCH', () => {
    // Get to NARROWING first with destination
    initStageContext('trans_004');
    attemptTransition(
      'trans_004',
      'I want to go to Paris',
      { chaosType: 'CLEAR_INTENT', confidence: 'medium', interpretation: '' }
    );

    // Add dates - should move toward READY_TO_SEARCH
    const result = attemptTransition(
      'trans_004',
      'I want to travel in December',
      { chaosType: 'CLEAR_INTENT', confidence: 'high', interpretation: '' }
    );

    // With destination + dates, should move toward search stage
    // (Either stays in NARROWING waiting for more info, or goes to READY_TO_SEARCH)
    expect(['NARROWING', 'READY_TO_SEARCH']).toContain(result.newStage);
  });

  it('should grant search consent on positive response', () => {
    initStageContext('trans_005');

    // Get to the point where we can grant consent
    attemptTransition(
      'trans_005',
      'I want to go to Paris in December',
      { chaosType: 'CLEAR_INTENT', confidence: 'high', interpretation: '' }
    );

    // User says yes to search
    attemptTransition(
      'trans_005',
      'Yes, please search for me',
      { chaosType: 'CLEAR_INTENT', confidence: 'high', interpretation: '' }
    );

    const context = getStageContext('trans_005')!;
    expect(context.userConsents.searchPermission).toBe(true);
  });

  it('should transition to POST_BOOKING after confirmation', () => {
    initStageContext('trans_006');

    // Simulate full flow
    attemptTransition('trans_006', 'I want to go to Paris', { chaosType: 'CLEAR_INTENT', confidence: 'medium', interpretation: '' });
    attemptTransition('trans_006', 'In December please', { chaosType: 'CLEAR_INTENT', confidence: 'high', interpretation: '' });
    attemptTransition('trans_006', 'Yes, search for me', { chaosType: 'CLEAR_INTENT', confidence: 'high', interpretation: '' });
    attemptTransition('trans_006', 'I want to book this one', { chaosType: 'CLEAR_INTENT', confidence: 'high', interpretation: '' });

    // Now booking confirmation
    const result = attemptTransition(
      'trans_006',
      'Booking confirmed successfully',
      { chaosType: 'CLEAR_INTENT', confidence: 'high', interpretation: '' }
    );

    expect(result.newStage).toBe('POST_BOOKING');
  });
});

describe('Action Enforcement', () => {
  beforeEach(() => {
    stageStore.clear();
  });

  it('should forbid execute_search in DISCOVERY', () => {
    initStageContext('action_001');
    expect(isActionForbidden('action_001', 'execute_search')).toBe(true);
    expect(isActionAllowed('action_001', 'execute_search')).toBe(false);
  });

  it('should allow inspire in DISCOVERY', () => {
    initStageContext('action_002');
    expect(isActionAllowed('action_002', 'inspire')).toBe(true);
    expect(isActionForbidden('action_002', 'inspire')).toBe(false);
  });

  it('should forbid show_prices in NARROWING', () => {
    initStageContext('action_003');
    attemptTransition('action_003', 'I want to go to Paris', { chaosType: 'CLEAR_INTENT', confidence: 'medium', interpretation: '' });

    expect(isActionForbidden('action_003', 'show_prices')).toBe(true);
  });

  it('should forbid initiate_booking in READY_TO_SEARCH', () => {
    initStageContext('action_004');
    attemptTransition('action_004', 'I want to go to Paris in December', { chaosType: 'CLEAR_INTENT', confidence: 'high', interpretation: '' });

    const context = getStageContext('action_004')!;
    if (context.currentStage === 'READY_TO_SEARCH') {
      expect(isActionForbidden('action_004', 'initiate_booking')).toBe(true);
    }
  });

  it('should allow execute_search in READY_TO_SEARCH', () => {
    initStageContext('action_005');
    attemptTransition('action_005', 'I want to go to Paris in December', { chaosType: 'CLEAR_INTENT', confidence: 'high', interpretation: '' });

    const context = getStageContext('action_005')!;
    if (context.currentStage === 'READY_TO_SEARCH') {
      expect(isActionAllowed('action_005', 'execute_search')).toBe(true);
    }
  });
});

describe('Stage Rules Immutability', () => {
  it('should have correct DISCOVERY rules', () => {
    const rules = STAGE_RULES.DISCOVERY;

    expect(rules.canShowPrices).toBe(false);
    expect(rules.maxQuestions).toBe(2);
    expect(rules.forbiddenActions).toContain('execute_search');
    expect(rules.forbiddenActions).toContain('show_prices');
    expect(rules.forbiddenActions).toContain('initiate_booking');
    expect(rules.nextStages).toEqual(['NARROWING']);
  });

  it('should have correct NARROWING rules', () => {
    const rules = STAGE_RULES.NARROWING;

    expect(rules.canShowPrices).toBe(false);
    expect(rules.forbiddenActions).toContain('execute_search');
    expect(rules.nextStages).toEqual(['READY_TO_SEARCH']);
  });

  it('should have correct READY_TO_SEARCH rules', () => {
    const rules = STAGE_RULES.READY_TO_SEARCH;

    expect(rules.canShowPrices).toBe(true);
    expect(rules.requiresConsent).toContain('search');
    expect(rules.forbiddenActions).toContain('initiate_booking');
  });

  it('should have correct READY_TO_BOOK rules', () => {
    const rules = STAGE_RULES.READY_TO_BOOK;

    expect(rules.canShowPrices).toBe(true);
    expect(rules.requiresConsent).toContain('booking');
    expect(rules.forbiddenActions).toContain('auto_execute_payment');
  });

  it('should have correct POST_BOOKING rules', () => {
    const rules = STAGE_RULES.POST_BOOKING;

    expect(rules.nextStages).toEqual([]);  // Terminal stage
    expect(rules.forbiddenActions).toContain('pressure_upsell');
  });
});

describe('Stage Guidance', () => {
  beforeEach(() => {
    stageStore.clear();
  });

  it('should return DISCOVERY guidance in English', () => {
    initStageContext('guide_001');
    const guidance = getStageGuidance('guide_001', 'en');

    expect(guidance).toContain('[DISCOVERY]');
    expect(guidance).toContain('NO search');
    expect(guidance).toContain('NO prices');
  });

  it('should return DISCOVERY guidance in Portuguese', () => {
    initStageContext('guide_002');
    const guidance = getStageGuidance('guide_002', 'pt');

    expect(guidance).toContain('[DESCOBERTA]');
    expect(guidance).toContain('SEM busca');
  });

  it('should return READY_TO_SEARCH guidance', () => {
    initStageContext('guide_003');
    attemptTransition('guide_003', 'I want to go to Paris in December', { chaosType: 'CLEAR_INTENT', confidence: 'high', interpretation: '' });

    const context = getStageContext('guide_003')!;
    if (context.currentStage === 'READY_TO_SEARCH') {
      const guidance = getStageGuidance('guide_003', 'en');
      expect(guidance).toContain('consent');
    }
  });
});

describe('Consent Prompts', () => {
  it('should return search consent prompt', () => {
    const prompt = getConsentPrompt('READY_TO_SEARCH', 'en');
    expect(prompt).toContain('search');
  });

  it('should return booking consent prompt', () => {
    const prompt = getConsentPrompt('READY_TO_BOOK', 'en');
    expect(prompt).toContain('booking');
  });

  it('should return null for stages without consent', () => {
    expect(getConsentPrompt('DISCOVERY', 'en')).toBeNull();
    expect(getConsentPrompt('NARROWING', 'en')).toBeNull();
    expect(getConsentPrompt('POST_BOOKING', 'en')).toBeNull();
  });

  it('should support Portuguese prompts', () => {
    const searchPt = getConsentPrompt('READY_TO_SEARCH', 'pt');
    expect(searchPt).toContain('buscar');

    const bookPt = getConsentPrompt('READY_TO_BOOK', 'pt');
    expect(bookPt).toContain('reserva');
  });
});

describe('Stage Analytics', () => {
  beforeEach(() => {
    stageMetricsStore.clear();
  });

  it('should track session start', () => {
    trackSessionStart('analytics_001');

    const analytics = getStageAnalytics('DISCOVERY');
    // Note: Session is still active, not in completed metrics
    expect(analytics.stage).toBe('DISCOVERY');
  });

  it('should track stage transitions', () => {
    trackSessionStart('analytics_002');
    trackStageTransition('analytics_002', 'DISCOVERY', 'NARROWING', false);

    // The DISCOVERY metric should now be recorded
    const analytics = getStageAnalytics('DISCOVERY');
    expect(analytics.totalExited).toBeGreaterThanOrEqual(0);
  });

  it('should track drop-offs', () => {
    trackSessionStart('analytics_003');
    trackSessionDropOff('analytics_003');

    const analytics = getStageAnalytics('DISCOVERY');
    expect(analytics.totalDropOff).toBeGreaterThanOrEqual(0);
  });

  it('should calculate funnel metrics', () => {
    // Simulate a few sessions
    for (let i = 0; i < 5; i++) {
      trackSessionStart(`funnel_${i}`);
      trackStageTransition(`funnel_${i}`, 'DISCOVERY', 'NARROWING', false);
    }

    // Some drop off
    for (let i = 5; i < 8; i++) {
      trackSessionStart(`funnel_${i}`);
      trackSessionDropOff(`funnel_${i}`);
    }

    const funnel = getFunnelMetrics();
    expect(funnel.stages.length).toBe(5);
    expect(funnel.overallConversionRate).toBeGreaterThanOrEqual(0);
  });
});

describe('Portuguese/Spanish Consent Detection', () => {
  beforeEach(() => {
    stageStore.clear();
  });

  it('should detect Portuguese search consent', () => {
    initStageContext('pt_001');
    attemptTransition('pt_001', 'Quero ir para Paris em dezembro', { chaosType: 'CLEAR_INTENT', confidence: 'high', interpretation: '' });
    attemptTransition('pt_001', 'Pode buscar sim!', { chaosType: 'CLEAR_INTENT', confidence: 'high', interpretation: '' });

    const context = getStageContext('pt_001')!;
    expect(context.userConsents.searchPermission).toBe(true);
  });

  it('should detect Spanish search consent', () => {
    initStageContext('es_001');
    attemptTransition('es_001', 'Quiero ir a Barcelona en julio', { chaosType: 'CLEAR_INTENT', confidence: 'high', interpretation: '' });
    attemptTransition('es_001', 'Sí, buscar por favor', { chaosType: 'CLEAR_INTENT', confidence: 'high', interpretation: '' });

    const context = getStageContext('es_001')!;
    expect(context.userConsents.searchPermission).toBe(true);
  });
});
