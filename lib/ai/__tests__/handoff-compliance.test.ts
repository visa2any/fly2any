/**
 * Handoff Compliance Regression Tests
 *
 * Validates: Language lock, forbidden openers, stage persistence, emotional context
 */

import {
  createHandoffPackage,
  validateHandoffMessage,
  generateCompliantHandoffIntro,
  getConsultantInfo,
  type HandoffContextPackage,
} from '../consultant-handoff';

describe('Handoff Compliance - Language Lock Persistence', () => {
  it('should preserve PT-BR language lock through handoff', () => {
    const package1 = createHandoffPackage('customer-service', 'flight-operations', {
      languageLocked: 'pt',
      conversationStage: 'NARROWING',
    });

    expect(package1.languageLocked).toBe('pt');

    // Simulate second handoff
    const package2 = createHandoffPackage('flight-operations', 'hotel-accommodations', {
      languageLocked: package1.languageLocked,
      conversationStage: package1.conversationStage,
    });

    expect(package2.languageLocked).toBe('pt');
  });

  it('should preserve ES language lock through handoff', () => {
    const handoff = createHandoffPackage('customer-service', 'payment-billing', {
      languageLocked: 'es',
    });

    expect(handoff.languageLocked).toBe('es');
  });

  it('should default to EN if no language specified', () => {
    const handoff = createHandoffPackage('customer-service', 'flight-operations', {});
    expect(handoff.languageLocked).toBe('en');
  });
});

describe('Handoff Compliance - Forbidden Openers Blocked', () => {
  it('should detect and correct "how can i help" in handoff intro', () => {
    const result = validateHandoffMessage(
      'Hello! How can I help you today?',
      'en'
    );

    expect(result.valid).toBe(false);
    expect(result.corrected).not.toContain('how can i help');
    expect(result.corrected).toContain("I'm here to assist");
  });

  it('should correct forbidden opener in PT-BR', () => {
    const result = validateHandoffMessage(
      'Olá! How may I assist you today?',
      'pt'
    );

    expect(result.valid).toBe(false);
    expect(result.corrected).toContain('Estou aqui para ajudar');
  });

  it('should allow compliant messages through', () => {
    const result = validateHandoffMessage(
      "Hello! I'm Sarah Chen, your Flight Operations Specialist.",
      'en'
    );

    expect(result.valid).toBe(true);
  });
});

describe('Handoff Compliance - Stage Persistence', () => {
  it('should NOT reset stage during handoff', () => {
    const handoff = createHandoffPackage('customer-service', 'flight-operations', {
      conversationStage: 'READY_TO_SEARCH',
      stageCollectedData: {
        origin: 'NYC',
        destination: 'Paris',
        dates: '2025-03-15',
      },
    });

    expect(handoff.conversationStage).toBe('READY_TO_SEARCH');
    expect(handoff.stageCollectedData.origin).toBe('NYC');
    expect(handoff.stageCollectedData.destination).toBe('Paris');
  });

  it('should preserve user consents through handoff', () => {
    const handoff = createHandoffPackage('flight-operations', 'payment-billing', {
      userConsents: { searchPermission: true, bookingPermission: false },
    });

    expect(handoff.userConsents.searchPermission).toBe(true);
    expect(handoff.userConsents.bookingPermission).toBe(false);
  });

  it('should default consents to false if not provided', () => {
    const handoff = createHandoffPackage('customer-service', 'flight-operations', {});

    expect(handoff.userConsents.searchPermission).toBe(false);
    expect(handoff.userConsents.bookingPermission).toBe(false);
  });
});

describe('Handoff Compliance - Emotional Context Carryover', () => {
  it('should use empathetic intro for frustrated user', () => {
    const handoff = createHandoffPackage('customer-service', 'payment-billing', {
      emotional_state: 'FRUSTRATED',
      languageLocked: 'en',
    });

    const consultant = getConsultantInfo('payment-billing');
    const intro = generateCompliantHandoffIntro(consultant, handoff);

    expect(intro).toContain('frustrating');
    expect(intro).toContain('resolve');
  });

  it('should use urgent intro for URGENT emotional state', () => {
    const handoff = createHandoffPackage('customer-service', 'crisis-management', {
      emotional_state: 'URGENT',
      languageLocked: 'en',
    });

    const consultant = getConsultantInfo('crisis-management');
    const intro = generateCompliantHandoffIntro(consultant, handoff);

    expect(intro).toContain('right away');
  });

  it('should use calming intro for PANICKED user', () => {
    const handoff = createHandoffPackage('flight-operations', 'crisis-management', {
      emotional_state: 'PANICKED',
      languageLocked: 'en',
    });

    const consultant = getConsultantInfo('crisis-management');
    const intro = generateCompliantHandoffIntro(consultant, handoff);

    expect(intro).toContain('Stay calm');
    expect(intro).toContain('immediately');
  });
});

describe('Regression: PT-BR Conversation with Handoff', () => {
  it('should maintain PT-BR throughout full handoff flow', () => {
    // User starts in PT-BR with Lisa
    const handoff1 = createHandoffPackage('customer-service', 'flight-operations', {
      languageLocked: 'pt',
      emotional_state: 'CALM',
      conversationStage: 'DISCOVERY',
      stageCollectedData: { destination: 'Paris' },
    });

    // Validate language persists
    expect(handoff1.languageLocked).toBe('pt');

    // Generate PT-BR intro
    const sarah = getConsultantInfo('flight-operations');
    const intro1 = generateCompliantHandoffIntro(sarah, handoff1);

    expect(intro1).toContain('Sou Sarah Chen');
    expect(intro1).toContain('Paris');

    // Second handoff to hotels
    const handoff2 = createHandoffPackage('flight-operations', 'hotel-accommodations', {
      languageLocked: handoff1.languageLocked,
      conversationStage: 'NARROWING',
      stageCollectedData: handoff1.stageCollectedData,
    });

    expect(handoff2.languageLocked).toBe('pt');

    const marcus = getConsultantInfo('hotel-accommodations');
    const intro2 = generateCompliantHandoffIntro(marcus, handoff2);

    expect(intro2).toContain('Sou Marcus Rodriguez');
  });
});

describe('Regression: Dead-End Prevention Across Agents', () => {
  it('should carry forward open questions to new agent', () => {
    const handoff = createHandoffPackage('customer-service', 'flight-operations', {
      open_questions: ['What are your preferred travel dates?'],
      stageCollectedData: { destination: 'Tokyo' },
    });

    expect(handoff.open_questions).toContain('What are your preferred travel dates?');
    expect(handoff.stageCollectedData.destination).toBe('Tokyo');
  });

  it('should preserve risk flags for high-churn user', () => {
    const handoff = createHandoffPackage('flight-operations', 'payment-billing', {
      risk_flags: ['HIGH_CHURN_RISK', 'PRICE_SENSITIVE'],
      emotional_state: 'FRUSTRATED',
    });

    expect(handoff.risk_flags).toContain('HIGH_CHURN_RISK');
    expect(handoff.risk_flags).toContain('PRICE_SENSITIVE');
    expect(handoff.recommended_tone).toContain('Empathetic');
  });

  it('should limit handoffs to prevent loops', () => {
    // Reset first
    const { resetHandoffSession } = require('../consultant-handoff');
    resetHandoffSession();

    // First handoff
    const h1 = createHandoffPackage('customer-service', 'flight-operations', {});
    expect(h1.handoff_count).toBe(1);

    // Second handoff
    const h2 = createHandoffPackage('flight-operations', 'hotel-accommodations', {});
    expect(h2.handoff_count).toBe(2);

    // Third handoff should route to Lisa
    const h3 = createHandoffPackage('hotel-accommodations', 'payment-billing', {});
    expect(h3.handoff_count).toBe(3);
    expect(h3.to_agent).toBe('customer-service'); // Forced to Lisa
  });
});

describe('Handoff Package Completeness', () => {
  it('should include all compliance fields', () => {
    const handoff = createHandoffPackage('customer-service', 'flight-operations', {
      primary_intent: 'FLIGHT_SEARCH',
      emotional_state: 'CALM',
      languageLocked: 'pt',
      conversationStage: 'NARROWING',
      stageCollectedData: { origin: 'GRU', destination: 'CDG' },
      userConsents: { searchPermission: true, bookingPermission: false },
    });

    // All required fields present
    expect(handoff).toHaveProperty('from_agent');
    expect(handoff).toHaveProperty('to_agent');
    expect(handoff).toHaveProperty('languageLocked');
    expect(handoff).toHaveProperty('conversationStage');
    expect(handoff).toHaveProperty('stageCollectedData');
    expect(handoff).toHaveProperty('userConsents');
    expect(handoff).toHaveProperty('emotional_state');
    expect(handoff).toHaveProperty('recommended_tone');
  });
});
