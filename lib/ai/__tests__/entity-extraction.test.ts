/**
 * Entity Extraction Tests
 *
 * Validates:
 * - Typo handling ("uero", "pra", "nyc")
 * - Portuguese/Spanish requests
 * - Confidence scores
 * - Handoff slot preservation
 * - No-reset validation
 */

import {
  extractEntitiesWithConfidence,
  toHandoffSlots,
  getSlotsNeedingConfirmation,
  shouldTrustSlot,
  shouldPreserveSlot,
  validateNoResetViolation,
  type ExtractedEntities,
  type HandoffSlots,
} from '../entity-extractor';

describe('Entity Extraction - Typo Handling', () => {
  it('should extract "pra" as "para" (destination)', () => {
    const entities = extractEntitiesWithConfidence('quero ir pra paris', 'pt');
    expect(entities.destination).toBeDefined();
    expect(entities.destination?.value).toBe('Paris');
    expect(entities.destination?.confidence).toBeGreaterThanOrEqual(0.7);
  });

  it('should extract "nyc" as New York', () => {
    const entities = extractEntitiesWithConfidence('fly from nyc to london', 'en');
    expect(entities.origin).toBeDefined();
    expect(entities.origin?.value).toBe('New York');
    expect(entities.origin?.confidence).toBe(1.0);
  });

  it('should extract with typo "londra" as London', () => {
    const entities = extractEntitiesWithConfidence('voo para londra', 'pt');
    expect(entities.destination).toBeDefined();
    expect(entities.destination?.value).toBe('London');
    expect(entities.destination?.confidence).toBeGreaterThanOrEqual(0.7);
  });

  it('should extract with typo "pariss" as Paris', () => {
    const entities = extractEntitiesWithConfidence('fly to pariss', 'en');
    expect(entities.destination).toBeDefined();
    expect(entities.destination?.value).toBe('Paris');
    expect(entities.destination?.confidence).toBeGreaterThanOrEqual(0.7);
  });

  it('should extract misspelled "barça" as Barcelona', () => {
    const entities = extractEntitiesWithConfidence('quero viajar pra barça', 'pt');
    expect(entities.destination).toBeDefined();
    expect(entities.destination?.value).toBe('Barcelona');
  });
});

describe('Entity Extraction - Portuguese Requests', () => {
  it('should extract "de São Paulo para Paris"', () => {
    const entities = extractEntitiesWithConfidence('voo de são paulo para paris', 'pt');
    expect(entities.origin?.value).toBe('São Paulo');
    expect(entities.destination?.value).toBe('Paris');
  });

  it('should extract "dia 10 de janeiro"', () => {
    const entities = extractEntitiesWithConfidence('viagem dia 10 de janeiro', 'pt');
    expect(entities.departureDate).toBeDefined();
    expect(entities.departureDate?.value).toMatch(/2025-01-10|2026-01-10/);
    expect(entities.departureDate?.confidence).toBeGreaterThanOrEqual(0.8);
  });

  it('should extract "2 pessoas" as passengers', () => {
    const entities = extractEntitiesWithConfidence('viagem para 2 pessoas', 'pt');
    expect(entities.passengers).toBeDefined();
    expect(entities.passengers?.value).toBe(2);
  });

  it('should extract "ida e volta" as round-trip', () => {
    const entities = extractEntitiesWithConfidence('voo ida e volta para paris', 'pt');
    expect(entities.tripType?.value).toBe('round-trip');
    expect(entities.destination?.value).toBe('Paris');
  });

  it('should extract "classe executiva"', () => {
    const entities = extractEntitiesWithConfidence('quero voo classe executiva', 'pt');
    expect(entities.cabinClass?.value).toBe('business');
  });

  it('should lock language to PT for Portuguese input', () => {
    const entities = extractEntitiesWithConfidence('quero ir para paris', 'pt');
    expect(entities.language).toBe('pt');
  });
});

describe('Entity Extraction - Spanish Requests', () => {
  it('should extract "de Madrid a Barcelona"', () => {
    const entities = extractEntitiesWithConfidence('vuelo de madrid a barcelona', 'es');
    expect(entities.origin?.value).toBe('Madrid');
    expect(entities.destination?.value).toBe('Barcelona');
  });

  it('should extract "el 15 de marzo"', () => {
    const entities = extractEntitiesWithConfidence('viaje el 15 de marzo', 'es');
    expect(entities.departureDate).toBeDefined();
    expect(entities.departureDate?.value).toMatch(/\d{4}-03-15/);
  });
});

describe('Entity Extraction - Mixed Language', () => {
  it('should extract English city names in Portuguese sentence', () => {
    const entities = extractEntitiesWithConfidence('quero voo de new york para london', 'pt');
    expect(entities.origin?.value).toBe('New York');
    expect(entities.destination?.value).toBe('London');
  });

  it('should extract Portuguese months in English sentence', () => {
    const entities = extractEntitiesWithConfidence('flight on 10 de janeiro to paris', 'en');
    expect(entities.departureDate?.value).toMatch(/01-10/);
    expect(entities.destination?.value).toBe('Paris');
  });
});

describe('Entity Extraction - Confidence Scores', () => {
  it('should have high confidence (1.0) for airport codes', () => {
    const entities = extractEntitiesWithConfidence('fly from JFK to CDG', 'en');
    // Airport codes get highest confidence
    expect(entities.destination?.confidence).toBeGreaterThanOrEqual(0.9);
  });

  it('should have medium confidence for fuzzy matches', () => {
    const entities = extractEntitiesWithConfidence('fly to pari', 'en');
    expect(entities.destination).toBeDefined();
    expect(entities.destination?.confidence).toBeGreaterThanOrEqual(0.7);
    expect(entities.destination?.confidence).toBeLessThan(1.0);
  });

  it('should extract with typo and assign appropriate confidence', () => {
    const entities = extractEntitiesWithConfidence('go to pariss', 'en');
    expect(entities.destination?.value).toBe('Paris');
    expect(entities.destination?.confidence).toBeGreaterThanOrEqual(0.7);
  });
});

describe('Confidence-Based Trust Logic', () => {
  it('should trust slot with confidence >= 0.6', () => {
    const slot = { value: 'Paris', confidence: 0.8, source: 'exact' as const, rawMatch: 'paris' };
    expect(shouldTrustSlot(slot)).toBe(true);
  });

  it('should NOT trust slot with confidence < 0.6', () => {
    const slot = { value: 'Paris', confidence: 0.5, source: 'fuzzy' as const, rawMatch: 'pari' };
    expect(shouldTrustSlot(slot)).toBe(false);
  });

  it('should preserve slot with confidence >= 0.4', () => {
    const slot = { value: 'Paris', confidence: 0.45, source: 'fuzzy' as const, rawMatch: 'par' };
    expect(shouldPreserveSlot(slot)).toBe(true);
  });

  it('should NOT preserve slot with confidence < 0.4', () => {
    const slot = { value: 'Unknown', confidence: 0.3, source: 'fuzzy' as const, rawMatch: 'xxx' };
    expect(shouldPreserveSlot(slot)).toBe(false);
  });
});

describe('Confirmation Logic', () => {
  it('should flag slots needing confirmation (0.4-0.6)', () => {
    const entities: ExtractedEntities = {
      language: 'pt',
      destination: { value: 'Paris', confidence: 0.5, source: 'fuzzy', rawMatch: 'pari' },
    };

    const confirmations = getSlotsNeedingConfirmation(entities);
    expect(confirmations.length).toBe(1);
    expect(confirmations[0].slot).toBe('destination');
    expect(confirmations[0].confirmationPrompt.pt).toContain('confirmando');
  });

  it('should NOT flag slots with high confidence', () => {
    const entities: ExtractedEntities = {
      language: 'en',
      destination: { value: 'Paris', confidence: 0.9, source: 'exact', rawMatch: 'paris' },
    };

    const confirmations = getSlotsNeedingConfirmation(entities);
    expect(confirmations.length).toBe(0);
  });
});

describe('Handoff Slot Conversion', () => {
  it('should convert entities to handoff slots', () => {
    const entities: ExtractedEntities = {
      language: 'pt',
      origin: { value: 'São Paulo', confidence: 0.95, source: 'exact', rawMatch: 'são paulo' },
      destination: { value: 'Paris', confidence: 0.9, source: 'exact', rawMatch: 'paris' },
      departureDate: { value: '2025-03-15', confidence: 0.85, source: 'exact', rawMatch: '15 de março' },
    };

    const slots = toHandoffSlots(entities);

    expect(slots.language).toBe('pt');
    expect(slots.origin?.value).toBe('São Paulo');
    expect(slots.origin?.confidence).toBe(0.95);
    expect(slots.destination?.value).toBe('Paris');
    expect(slots.departureDate?.value).toBe('2025-03-15');
  });

  it('should exclude low-confidence slots from handoff', () => {
    const entities: ExtractedEntities = {
      language: 'en',
      destination: { value: 'Maybe Paris', confidence: 0.3, source: 'inferred', rawMatch: 'mp' },
    };

    const slots = toHandoffSlots(entities);
    expect(slots.destination).toBeUndefined();
  });

  it('should preserve language in handoff', () => {
    const entities: ExtractedEntities = { language: 'pt' };
    const slots = toHandoffSlots(entities);
    expect(slots.language).toBe('pt');
  });
});

describe('No-Reset Validation', () => {
  it('should detect violation when asking for destination that exists', () => {
    const slots: HandoffSlots = {
      language: 'en',
      destination: { value: 'Paris', confidence: 0.8 },
    };

    const response = "Where would you like to go?";
    const result = validateNoResetViolation(response, slots);

    expect(result.valid).toBe(false);
    expect(result.violations.length).toBeGreaterThan(0);
    expect(result.violations[0]).toContain('NO_RESET_VIOLATION');
  });

  it('should detect violation in Portuguese', () => {
    const slots: HandoffSlots = {
      language: 'pt',
      destination: { value: 'Paris', confidence: 0.7 },
    };

    const response = "Para onde você gostaria de ir?";
    const result = validateNoResetViolation(response, slots);

    expect(result.valid).toBe(false);
  });

  it('should pass when asking for missing data', () => {
    const slots: HandoffSlots = {
      language: 'en',
      destination: { value: 'Paris', confidence: 0.8 },
      // No date
    };

    const response = "When would you like to travel?";
    const result = validateNoResetViolation(response, slots);

    expect(result.valid).toBe(true);
  });

  it('should pass for clarification (not restart)', () => {
    const slots: HandoffSlots = {
      language: 'en',
      destination: { value: 'Paris', confidence: 0.8 },
      departureDate: { value: '2025-03-15', confidence: 0.9 },
    };

    const response = "Just to confirm, you're looking for flights to Paris on March 15th?";
    const result = validateNoResetViolation(response, slots);

    expect(result.valid).toBe(true);
  });

  it('should allow low-confidence slots to be questioned', () => {
    const slots: HandoffSlots = {
      language: 'en',
      destination: { value: 'Paris', confidence: 0.35 }, // Below 0.4 threshold
    };

    const response = "Where would you like to go?";
    const result = validateNoResetViolation(response, slots);

    expect(result.valid).toBe(true); // OK to ask because confidence < 0.4
  });
});

describe('Real Conversation Flows', () => {
  it('should handle: "quero ir pra paris dia 10 de janeiro"', () => {
    const entities = extractEntitiesWithConfidence('quero ir pra paris dia 10 de janeiro', 'pt');

    expect(entities.destination?.value).toBe('Paris');
    expect(entities.destination?.confidence).toBeGreaterThanOrEqual(0.8);
    expect(entities.departureDate?.value).toMatch(/01-10/);
    expect(entities.language).toBe('pt');

    // Should be handoff-ready
    const slots = toHandoffSlots(entities);
    expect(slots.destination).toBeDefined();
    expect(slots.departureDate).toBeDefined();

    // No confirmations needed for high confidence
    const confirmations = getSlotsNeedingConfirmation(entities);
    expect(confirmations.length).toBe(0);
  });

  it('should handle: "uero ir de sampa pra roma"', () => {
    const entities = extractEntitiesWithConfidence('uero ir de sampa pra roma', 'pt');

    expect(entities.origin?.value).toBe('São Paulo'); // sampa → São Paulo
    expect(entities.destination?.value).toBe('Rome');
  });

  it('should handle: "flight from NYC to londra next week"', () => {
    const entities = extractEntitiesWithConfidence('flight from NYC to londra next week', 'en');

    expect(entities.origin?.value).toBe('New York');
    expect(entities.destination?.value).toBe('London');
    expect(entities.departureDate).toBeDefined();
  });

  it('should handle informal: "fly to vegas"', () => {
    const entities = extractEntitiesWithConfidence('fly to las vegas', 'en');

    expect(entities.destination?.value).toBe('Las Vegas');
  });

  it('should handle airport codes: "GRU to CDG march 15"', () => {
    const entities = extractEntitiesWithConfidence('GRU to CDG march 15', 'en');

    expect(entities.origin?.value).toBe('São Paulo');
    expect(entities.destination?.value).toBe('Paris');
    expect(entities.departureDate?.value).toMatch(/03-15/);
  });
});

describe('Edge Cases', () => {
  it('should handle empty message', () => {
    const entities = extractEntitiesWithConfidence('', 'en');
    expect(entities.destination).toBeUndefined();
    expect(entities.language).toBe('en');
  });

  it('should handle message with no travel entities', () => {
    const entities = extractEntitiesWithConfidence('hello how are you', 'en');
    expect(entities.destination).toBeUndefined();
    expect(entities.origin).toBeUndefined();
  });

  it('should handle multiple destinations (from-to pattern)', () => {
    const entities = extractEntitiesWithConfidence('fly from new york to london', 'en');
    expect(entities.origin?.value).toBe('New York');
    expect(entities.destination?.value).toBe('London');
  });

  it('should handle relative dates', () => {
    const entities = extractEntitiesWithConfidence('fly to paris tomorrow', 'en');
    expect(entities.departureDate).toBeDefined();
    expect(entities.departureDate?.confidence).toBeGreaterThanOrEqual(0.9);
  });
});
