/**
 * Knowledge Base Tests
 * Tests for the travel knowledge base system
 */

import {
  queryKnowledge,
  getBaggagePolicy,
  getFareClass,
  getCompensationAmount,
  isEligibleEU261,
  getPassportValidityRequirement,
  getHotelChain,
  getAirlineAlliance
} from '../index';

describe('Knowledge Base - Flights', () => {
  describe('Baggage Policies', () => {
    test('should return baggage policy for United Airlines', () => {
      const policy = getBaggagePolicy('United Airlines');
      expect(policy).toBeTruthy();
      expect(policy?.airline).toBe('United Airlines');
      expect(policy?.cabinBaggage).toContain('carry-on');
    });

    test('should return null for unknown airline', () => {
      const policy = getBaggagePolicy('Unknown Airline');
      expect(policy).toBeNull();
    });

    test('should handle case-insensitive airline names', () => {
      const policy = getBaggagePolicy('united airlines');
      expect(policy).toBeTruthy();
    });
  });

  describe('Fare Classes', () => {
    test('should return correct fare class for J (Business)', () => {
      const fareClass = getFareClass('J');
      expect(fareClass).toBeTruthy();
      expect(fareClass?.name).toBe('Business Class');
      expect(fareClass?.cabin).toBe('Business');
    });

    test('should return correct fare class for Y (Economy)', () => {
      const fareClass = getFareClass('Y');
      expect(fareClass).toBeTruthy();
      expect(fareClass?.name).toBe('Economy Class');
      expect(fareClass?.cabin).toBe('Economy');
    });

    test('should handle lowercase fare codes', () => {
      const fareClass = getFareClass('f');
      expect(fareClass).toBeTruthy();
      expect(fareClass?.name).toBe('First Class');
    });
  });

  describe('Airline Alliances', () => {
    test('should find Star Alliance for United', () => {
      const alliance = getAirlineAlliance('United Airlines');
      expect(alliance).toBe('Star Alliance');
    });

    test('should find OneWorld for American', () => {
      const alliance = getAirlineAlliance('American Airlines');
      expect(alliance).toBe('OneWorld');
    });

    test('should find SkyTeam for Delta', () => {
      const alliance = getAirlineAlliance('Delta');
      expect(alliance).toBe('SkyTeam');
    });

    test('should return null for non-alliance airline', () => {
      const alliance = getAirlineAlliance('Southwest');
      expect(alliance).toBeNull();
    });
  });
});

describe('Knowledge Base - Legal', () => {
  describe('EU261 Compensation', () => {
    test('should calculate correct compensation for short flight', () => {
      const amount = getCompensationAmount('EU261', 1000, 3);
      expect(amount).toBe('€250');
    });

    test('should calculate correct compensation for medium flight', () => {
      const amount = getCompensationAmount('EU261', 2000, 3);
      expect(amount).toBe('€400');
    });

    test('should calculate correct compensation for long flight', () => {
      const amount = getCompensationAmount('EU261', 4000, 4);
      expect(amount).toBe('€600');
    });

    test('should return no compensation for delay under 3 hours', () => {
      const amount = getCompensationAmount('EU261', 2000, 2);
      expect(amount).toBe('Not eligible for compensation');
    });
  });

  describe('EU261 Eligibility', () => {
    test('should be eligible for flight from EU', () => {
      const eligible = isEligibleEU261('France', 'United States', 'United States', 3);
      expect(eligible).toBe(true);
    });

    test('should be eligible for flight to EU on EU carrier', () => {
      const eligible = isEligibleEU261('United States', 'Germany', 'Germany', 3);
      expect(eligible).toBe(true);
    });

    test('should not be eligible for non-EU flight on non-EU carrier', () => {
      const eligible = isEligibleEU261('United States', 'Japan', 'Japan', 3);
      expect(eligible).toBe(false);
    });

    test('should not be eligible for delay under 3 hours', () => {
      const eligible = isEligibleEU261('France', 'United States', 'France', 2);
      expect(eligible).toBe(false);
    });
  });

  describe('DOT Compensation', () => {
    test('should calculate compensation for 1-2 hour delay', () => {
      const amount = getCompensationAmount('DOT', 1000, 1.5);
      expect(amount).toBe('200% of one-way fare (max $775)');
    });

    test('should calculate compensation for 2+ hour delay', () => {
      const amount = getCompensationAmount('DOT', 1000, 3);
      expect(amount).toBe('400% of one-way fare (max $1,550)');
    });
  });
});

describe('Knowledge Base - Visa', () => {
  describe('Passport Validity', () => {
    test('should return 6-month rule for Thailand', () => {
      const requirement = getPassportValidityRequirement('Thailand');
      expect(requirement).toContain('6 months');
    });

    test('should return 3-month rule for Schengen countries', () => {
      const requirement = getPassportValidityRequirement('France');
      expect(requirement).toContain('3 months');
    });

    test('should return valid for stay for US', () => {
      const requirement = getPassportValidityRequirement('United States');
      expect(requirement).toContain('Valid for duration of stay');
    });
  });
});

describe('Knowledge Base - Hotels', () => {
  describe('Hotel Chains', () => {
    test('should identify Marriott brand', () => {
      const chain = getHotelChain('Courtyard by Marriott');
      expect(chain).toBeTruthy();
      expect(chain?.name).toBe('Marriott International');
      expect(chain?.loyaltyProgram).toBe('Marriott Bonvoy');
    });

    test('should identify Hilton brand', () => {
      const chain = getHotelChain('Hampton Inn');
      expect(chain).toBeTruthy();
      expect(chain?.name).toBe('Hilton Worldwide');
    });

    test('should return null for independent hotel', () => {
      const chain = getHotelChain('Random Hotel Name');
      expect(chain).toBeNull();
    });
  });
});

describe('Knowledge Base - Query System', () => {
  describe('Baggage Queries', () => {
    test('should detect and answer baggage questions', () => {
      const result = queryKnowledge('flights', 'How much baggage can I bring?');
      expect(result).toBeTruthy();
      expect(result?.confidence).toBe('high');
      expect(result?.answer).toContain('baggage');
    });

    test('should answer airline-specific baggage questions', () => {
      const result = queryKnowledge(
        'flights',
        'What is United Airlines baggage policy?'
      );
      expect(result).toBeTruthy();
      expect(result?.answer).toContain('United Airlines');
    });
  });

  describe('Compensation Queries', () => {
    test('should detect EU261 questions', () => {
      const result = queryKnowledge('legal', 'What is EU261 compensation?');
      expect(result).toBeTruthy();
      expect(result?.confidence).toBe('high');
      expect(result?.answer).toContain('€');
    });

    test('should detect DOT questions', () => {
      const result = queryKnowledge('legal', 'US DOT denied boarding compensation');
      expect(result).toBeTruthy();
      expect(result?.answer).toContain('DOT');
    });

    test('should provide general compensation info', () => {
      const result = queryKnowledge('legal', 'flight delay compensation');
      expect(result).toBeTruthy();
      expect(result?.answer).toContain('compensation');
    });
  });

  describe('Visa Queries', () => {
    test('should answer visa questions', () => {
      const result = queryKnowledge('visa', 'Do I need a visa for Thailand?');
      expect(result).toBeTruthy();
      expect(result?.confidence).toBe('medium');
      expect(result?.answer).toContain('visa');
    });

    test('should provide passport validity info', () => {
      const result = queryKnowledge('visa', 'passport validity requirements');
      expect(result).toBeTruthy();
      expect(result?.answer).toContain('6 months');
    });
  });

  describe('Cancellation Queries', () => {
    test('should answer flight cancellation questions', () => {
      const result = queryKnowledge('flights', 'Can I cancel my flight?');
      expect(result).toBeTruthy();
      expect(result?.answer).toContain('cancel');
    });

    test('should answer hotel cancellation questions', () => {
      const result = queryKnowledge('hotels', 'hotel cancellation policy');
      expect(result).toBeTruthy();
      expect(result?.answer).toContain('cancel');
    });
  });

  describe('Fare Class Queries', () => {
    test('should explain fare classes', () => {
      const result = queryKnowledge('flights', 'What is business class?');
      expect(result).toBeTruthy();
      expect(result?.answer).toContain('Business');
    });

    test('should explain specific fare codes', () => {
      const result = queryKnowledge('flights', 'What is J class?');
      expect(result).toBeTruthy();
      expect(result?.answer).toContain('Business');
    });
  });

  describe('Hotel Policy Queries', () => {
    test('should answer check-in questions', () => {
      const result = queryKnowledge('hotels', 'What time is check-in?');
      expect(result).toBeTruthy();
      expect(result?.answer).toContain('check-in');
    });

    test('should answer hotel amenity questions', () => {
      const result = queryKnowledge('hotels', 'hotel amenities');
      expect(result).toBeTruthy();
      expect(result?.answer).toContain('amenities');
    });
  });

  describe('Booking Timing Queries', () => {
    test('should answer when to book questions', () => {
      const result = queryKnowledge('tips', 'When should I book my flight?');
      expect(result).toBeTruthy();
      expect(result?.answer).toContain('book');
    });

    test('should provide timing recommendations', () => {
      const result = queryKnowledge('tips', 'best time to book flights');
      expect(result).toBeTruthy();
      expect(result?.answer).toContain('months');
    });
  });

  describe('Travel Tips Queries', () => {
    test('should answer packing questions', () => {
      const result = queryKnowledge('tips', 'What should I pack?');
      expect(result).toBeTruthy();
      expect(result?.answer).toContain('pack');
    });

    test('should answer jet lag questions', () => {
      const result = queryKnowledge('tips', 'How to avoid jet lag?');
      expect(result).toBeTruthy();
      expect(result?.answer).toContain('jet lag');
    });

    test('should answer security questions', () => {
      const result = queryKnowledge('tips', 'airport security tips');
      expect(result).toBeTruthy();
      expect(result?.answer).toContain('security');
    });
  });

  describe('Insurance Queries', () => {
    test('should answer insurance questions', () => {
      const result = queryKnowledge('tips', 'Do I need travel insurance?');
      expect(result).toBeTruthy();
      expect(result?.answer).toContain('insurance');
    });

    test('should provide insurance recommendations', () => {
      const result = queryKnowledge('tips', 'travel insurance');
      expect(result).toBeTruthy();
      expect(result?.confidence).toBe('high');
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty queries', () => {
      const result = queryKnowledge('general', '');
      expect(result).toBeNull();
    });

    test('should handle gibberish queries', () => {
      const result = queryKnowledge('general', 'asdfghjkl zxcvbnm');
      expect(result).toBeNull();
    });

    test('should handle queries with typos', () => {
      const result = queryKnowledge('flights', 'bagage policy');
      expect(result).toBeTruthy(); // Should still match "baggage"
    });
  });

  describe('Query Result Structure', () => {
    test('should return proper QueryResult structure', () => {
      const result = queryKnowledge('flights', 'baggage policy');
      expect(result).toHaveProperty('answer');
      expect(result).toHaveProperty('sources');
      expect(result).toHaveProperty('confidence');
      expect(['high', 'medium', 'low']).toContain(result?.confidence);
    });

    test('should include sources', () => {
      const result = queryKnowledge('legal', 'EU261');
      expect(result?.sources).toBeTruthy();
      expect(Array.isArray(result?.sources)).toBe(true);
      expect(result?.sources.length).toBeGreaterThan(0);
    });

    test('should include related topics when available', () => {
      const result = queryKnowledge('flights', 'baggage');
      if (result?.relatedTopics) {
        expect(Array.isArray(result.relatedTopics)).toBe(true);
      }
    });
  });
});

describe('Knowledge Base - Context Support', () => {
  test('should use airline context for baggage queries', () => {
    const result = queryKnowledge(
      'flights',
      'baggage policy',
      { airline: 'United Airlines' }
    );
    expect(result?.answer).toContain('United Airlines');
  });

  test('should use destination context for visa queries', () => {
    const result = queryKnowledge(
      'visa',
      'visa requirements',
      { destination: 'Thailand' }
    );
    expect(result).toBeTruthy();
  });
});
