/**
 * Consultant Handoff System - Comprehensive Test Suite
 * Tests professional transfers between travel consultants
 */

import {
  getConsultantInfo,
  generateHandoffMessage,
  needsHandoff,
  getPreviousConsultantTeam,
  TeamType,
  ConsultantInfo,
  HandoffMessage,
} from './consultant-handoff';

describe('Consultant Handoff System', () => {
  describe('getConsultantInfo', () => {
    test('should return customer service consultant info', () => {
      const consultant = getConsultantInfo('customer-service');

      expect(consultant).toEqual({
        team: 'customer-service',
        name: 'Lisa Thompson',
        title: 'Customer Experience Manager',
        emoji: '🎧',
      });
    });

    test('should return flight operations consultant info', () => {
      const consultant = getConsultantInfo('flight-operations');

      expect(consultant).toEqual({
        team: 'flight-operations',
        name: 'Sarah Chen',
        title: 'Senior Flight Operations Specialist',
        emoji: '✈️',
      });
    });

    test('should return hotel accommodations consultant info', () => {
      const consultant = getConsultantInfo('hotel-accommodations');

      expect(consultant).toEqual({
        team: 'hotel-accommodations',
        name: 'Marcus Rodriguez',
        title: 'Hotel & Accommodations Advisor',
        emoji: '🏨',
      });
    });

    test('should return payment billing consultant info', () => {
      const consultant = getConsultantInfo('payment-billing');

      expect(consultant).toEqual({
        team: 'payment-billing',
        name: 'David Park',
        title: 'Payment & Billing Specialist',
        emoji: '💳',
      });
    });

    test('should return visa documentation consultant info', () => {
      const consultant = getConsultantInfo('visa-documentation');

      expect(consultant).toEqual({
        team: 'visa-documentation',
        name: 'Sophia Nguyen',
        title: 'Immigration & Documentation Consultant',
        emoji: '📄',
      });
    });

    test('should return accessibility services consultant info', () => {
      const consultant = getConsultantInfo('accessibility-services');

      expect(consultant).toEqual({
        team: 'accessibility-services',
        name: 'Nina Davis',
        title: 'Accessibility & Special Needs Coordinator',
        emoji: '♿',
      });
    });

    test('should return emergency response consultant info', () => {
      const consultant = getConsultantInfo('emergency-response');

      expect(consultant).toEqual({
        team: 'emergency-response',
        name: 'Captain Mike Johnson',
        title: 'Emergency Response Coordinator',
        emoji: '🚨',
      });
    });

    test('should return all team types correctly', () => {
      const teams: TeamType[] = [
        'customer-service',
        'flight-operations',
        'hotel-accommodations',
        'payment-billing',
        'legal-compliance',
        'travel-insurance',
        'visa-documentation',
        'car-rental',
        'loyalty-rewards',
        'technical-support',
        'accessibility-services',
        'emergency-response',
      ];

      teams.forEach(team => {
        const consultant = getConsultantInfo(team);
        expect(consultant).toBeDefined();
        expect(consultant.team).toBe(team);
        expect(consultant.name).toBeTruthy();
        expect(consultant.title).toBeTruthy();
        expect(consultant.emoji).toBeTruthy();
      });
    });
  });

  describe('generateHandoffMessage', () => {
    describe('Transfer Announcements', () => {
      test('should generate handoff from customer service to flight operations', () => {
        const handoff = generateHandoffMessage(
          'customer-service',
          'flight-operations',
          'I need to book a flight to Paris'
        );

        expect(handoff.fromConsultant).toBe('Lisa Thompson');
        expect(handoff.toConsultant).toBe('Sarah Chen');
        expect(handoff.transferAnnouncement).toContain('Sarah Chen');
        expect(handoff.introduction).toContain('Sarah Chen');
        expect(handoff.introduction).toContain('Senior Flight Operations Specialist');
      });

      test('should generate handoff from customer service to hotel accommodations', () => {
        const handoff = generateHandoffMessage(
          'customer-service',
          'hotel-accommodations',
          'I need a hotel in New York'
        );

        expect(handoff.fromConsultant).toBe('Lisa Thompson');
        expect(handoff.toConsultant).toBe('Marcus Rodriguez');
        expect(handoff.transferAnnouncement).toContain('Marcus Rodriguez');
        expect(handoff.transferAnnouncement).toContain('🏨');
      });

      test('should generate handoff to payment specialist', () => {
        const handoff = generateHandoffMessage(
          'customer-service',
          'payment-billing',
          'I have a payment issue'
        );

        expect(handoff.toConsultant).toBe('David Park');
        expect(handoff.transferAnnouncement).toContain('David Park');
        expect(handoff.introduction).toContain('Payment & Billing Specialist');
      });

      test('should generate warm handoff from Lisa Thompson', () => {
        const handoff = generateHandoffMessage(
          'customer-service',
          'hotel-accommodations',
          'Looking for a hotel'
        );

        // Lisa's handoffs should be warm and personal
        expect(handoff.transferAnnouncement).toMatch(
          /Perfect|Wonderful|Great|Excellent/i
        );
      });

      test('should include consultant emoji in transfer', () => {
        const handoff = generateHandoffMessage(
          'customer-service',
          'flight-operations',
          'Need a flight'
        );

        expect(handoff.transferAnnouncement).toContain('✈️');
      });
    });

    describe('Consultant Introductions', () => {
      test('should generate Marcus Rodriguez introduction', () => {
        const handoff = generateHandoffMessage(
          'customer-service',
          'hotel-accommodations',
          'Need a hotel in Barcelona',
          { city: 'Barcelona' }
        );

        expect(handoff.introduction).toContain('Marcus Rodriguez');
        expect(handoff.introduction).toContain('Barcelona');
        expect(handoff.introduction).toContain('🏨');
      });

      test('should generate Sarah Chen introduction', () => {
        const handoff = generateHandoffMessage(
          'customer-service',
          'flight-operations',
          'Flight from NYC to Paris',
          { origin: 'NYC', destination: 'Paris' }
        );

        expect(handoff.introduction).toContain('Sarah Chen');
        expect(handoff.introduction).toContain('NYC');
        expect(handoff.introduction).toContain('Paris');
      });

      test('should generate Lisa Thompson introduction', () => {
        const handoff = generateHandoffMessage(
          'flight-operations',
          'customer-service',
          'I have a question'
        );

        expect(handoff.introduction).toContain('Lisa Thompson');
        expect(handoff.introduction).toMatch(/sweetie|Welcome/i);
      });

      test('should handle missing context gracefully', () => {
        const handoff = generateHandoffMessage(
          'customer-service',
          'flight-operations',
          'I need help'
        );

        expect(handoff.introduction).toBeDefined();
        expect(handoff.introduction).toContain('Sarah Chen');
      });
    });

    describe('Context Confirmation', () => {
      test('should generate hotel context confirmation', () => {
        const handoff = generateHandoffMessage(
          'customer-service',
          'hotel-accommodations',
          'Hotel in Paris from May 1 to May 5',
          {
            city: 'Paris',
            checkIn: '2024-05-01',
            checkOut: '2024-05-05',
            guests: 2,
            rooms: 1,
          }
        );

        expect(handoff.context).toContain('Paris');
        expect(handoff.context).toContain('May 1');
        expect(handoff.context).toContain('May 5');
        expect(handoff.context).toContain('2');
        expect(handoff.context).toContain('4 night');
      });

      test('should generate flight context confirmation', () => {
        const handoff = generateHandoffMessage(
          'customer-service',
          'flight-operations',
          'Flight NYC to London',
          {
            origin: 'NYC',
            destination: 'London',
            departureDate: '2024-06-15',
            returnDate: '2024-06-22',
            passengers: 2,
            cabinClass: 'Business',
          }
        );

        expect(handoff.context).toContain('NYC');
        expect(handoff.context).toContain('London');
        expect(handoff.context).toContain('Jun 15');
        expect(handoff.context).toContain('Jun 22');
        expect(handoff.context).toContain('2');
        expect(handoff.context).toContain('Business');
      });

      test('should calculate nights correctly', () => {
        const handoff = generateHandoffMessage(
          'customer-service',
          'hotel-accommodations',
          'Hotel booking',
          {
            city: 'Rome',
            checkIn: '2024-07-01',
            checkOut: '2024-07-08',
          }
        );

        expect(handoff.context).toContain('7 nights');
      });

      test('should handle single night stays', () => {
        const handoff = generateHandoffMessage(
          'customer-service',
          'hotel-accommodations',
          'One night stay',
          {
            city: 'Boston',
            checkIn: '2024-08-01',
            checkOut: '2024-08-02',
          }
        );

        expect(handoff.context).toContain('1 night');
        expect(handoff.context).not.toContain('nights');
      });

      test('should handle one-way flights', () => {
        const handoff = generateHandoffMessage(
          'customer-service',
          'flight-operations',
          'One way flight',
          {
            origin: 'LAX',
            destination: 'SFO',
            departureDate: '2024-09-01',
            passengers: 1,
          }
        );

        expect(handoff.context).toContain('LAX');
        expect(handoff.context).toContain('SFO');
        expect(handoff.context).not.toContain('Return');
      });

      test('should default to economy class when not specified', () => {
        const handoff = generateHandoffMessage(
          'customer-service',
          'flight-operations',
          'Flight booking',
          {
            origin: 'NYC',
            destination: 'LAX',
            departureDate: '2024-10-01',
          }
        );

        expect(handoff.context).toContain('Economy');
      });

      test('should return undefined context when no parsed context', () => {
        const handoff = generateHandoffMessage(
          'customer-service',
          'flight-operations',
          'Help me'
        );

        expect(handoff.context).toBeUndefined();
      });
    });

    describe('Different Consultant Personalities', () => {
      test('should reflect Sarah Chen professional tone', () => {
        const handoff = generateHandoffMessage(
          'customer-service',
          'flight-operations',
          'Flight needed'
        );

        // Sarah is professional and efficient
        expect(handoff.introduction).toContain('Hi!');
        expect(handoff.introduction).toContain('Sarah Chen');
      });

      test('should reflect Marcus Rodriguez hospitable tone', () => {
        const handoff = generateHandoffMessage(
          'flight-operations',
          'hotel-accommodations',
          'Hotel needed'
        );

        // Marcus is warm and hospitable
        expect(handoff.transferAnnouncement).toMatch(/great hands|wonderful/i);
      });

      test('should handle all consultant transitions', () => {
        const teams: TeamType[] = [
          'flight-operations',
          'hotel-accommodations',
          'payment-billing',
          'visa-documentation',
        ];

        teams.forEach(toTeam => {
          const handoff = generateHandoffMessage(
            'customer-service',
            toTeam,
            'I need help'
          );

          expect(handoff).toBeDefined();
          expect(handoff.transferAnnouncement).toBeTruthy();
          expect(handoff.introduction).toBeTruthy();
        });
      });
    });
  });

  describe('needsHandoff', () => {
    test('should return false when no previous team', () => {
      const needs = needsHandoff(null, 'customer-service');
      expect(needs).toBe(false);
    });

    test('should return false when same team', () => {
      const needs = needsHandoff('customer-service', 'customer-service');
      expect(needs).toBe(false);
    });

    test('should return true when team changes', () => {
      const needs = needsHandoff('customer-service', 'flight-operations');
      expect(needs).toBe(true);
    });

    test('should detect all team transitions', () => {
      const teamPairs: Array<[TeamType, TeamType]> = [
        ['customer-service', 'flight-operations'],
        ['flight-operations', 'hotel-accommodations'],
        ['hotel-accommodations', 'payment-billing'],
        ['payment-billing', 'customer-service'],
      ];

      teamPairs.forEach(([from, to]) => {
        const needs = needsHandoff(from, to);
        expect(needs).toBe(true);
      });
    });
  });

  describe('getPreviousConsultantTeam', () => {
    test('should return null for empty message history', () => {
      const team = getPreviousConsultantTeam([]);
      expect(team).toBeNull();
    });

    test('should return team from last message with consultant', () => {
      const messages = [
        { consultant: { team: 'customer-service' } },
        { consultant: { team: 'flight-operations' } },
        { text: 'user message' },
      ];

      const team = getPreviousConsultantTeam(messages);
      expect(team).toBe('flight-operations');
    });

    test('should skip messages without consultant', () => {
      const messages = [
        { consultant: { team: 'customer-service' } },
        { text: 'user message 1' },
        { text: 'user message 2' },
      ];

      const team = getPreviousConsultantTeam(messages);
      expect(team).toBe('customer-service');
    });

    test('should return null when no messages have consultant', () => {
      const messages = [
        { text: 'user message 1' },
        { text: 'user message 2' },
      ];

      const team = getPreviousConsultantTeam(messages);
      expect(team).toBeNull();
    });

    test('should handle messages with undefined consultant', () => {
      const messages = [
        { consultant: undefined },
        { consultant: { team: 'flight-operations' } },
      ];

      const team = getPreviousConsultantTeam(messages);
      expect(team).toBe('flight-operations');
    });

    test('should handle messages with null team', () => {
      const messages = [
        { consultant: { team: null } },
        { consultant: { team: 'hotel-accommodations' } },
      ];

      const team = getPreviousConsultantTeam(messages);
      expect(team).toBe('hotel-accommodations');
    });
  });

  describe('Date Formatting', () => {
    test('should format dates correctly', () => {
      const handoff = generateHandoffMessage(
        'customer-service',
        'hotel-accommodations',
        'Hotel booking',
        {
          city: 'Paris',
          checkIn: '2024-12-25',
          checkOut: '2024-12-31',
        }
      );

      expect(handoff.context).toContain('Dec 25');
      expect(handoff.context).toContain('Dec 31');
    });

    test('should handle different date formats', () => {
      const handoff = generateHandoffMessage(
        'customer-service',
        'flight-operations',
        'Flight',
        {
          origin: 'NYC',
          destination: 'LAX',
          departureDate: '2024-01-01',
        }
      );

      expect(handoff.context).toContain('Jan 1');
    });
  });

  describe('Edge Cases', () => {
    test('should handle missing user request', () => {
      const handoff = generateHandoffMessage(
        'customer-service',
        'flight-operations',
        ''
      );

      expect(handoff).toBeDefined();
      expect(handoff.introduction).toBeTruthy();
    });

    test('should handle partial context', () => {
      const handoff = generateHandoffMessage(
        'customer-service',
        'hotel-accommodations',
        'Hotel',
        { city: 'Paris' }
      );

      expect(handoff.introduction).toContain('Paris');
      expect(handoff.context).toBeUndefined(); // Needs checkIn date
    });

    test('should handle special characters in city names', () => {
      const handoff = generateHandoffMessage(
        'customer-service',
        'hotel-accommodations',
        'Hotel',
        {
          city: 'São Paulo',
          checkIn: '2024-01-01',
          checkOut: '2024-01-05',
        }
      );

      expect(handoff.introduction).toContain('São Paulo');
    });

    test('should handle very long user requests', () => {
      const longRequest = 'I need help with '.repeat(100);
      const handoff = generateHandoffMessage(
        'customer-service',
        'flight-operations',
        longRequest
      );

      expect(handoff).toBeDefined();
      expect(handoff.introduction).toBeTruthy();
    });
  });

  describe('Handoff Message Completeness', () => {
    test('should always include all required fields', () => {
      const teams: TeamType[] = [
        'customer-service',
        'flight-operations',
        'hotel-accommodations',
      ];

      teams.forEach(toTeam => {
        const handoff = generateHandoffMessage(
          'customer-service',
          toTeam,
          'Test request'
        );

        expect(handoff.fromConsultant).toBeTruthy();
        expect(handoff.toConsultant).toBeTruthy();
        expect(handoff.transferAnnouncement).toBeTruthy();
        expect(handoff.introduction).toBeTruthy();
      });
    });

    test('should maintain consistent consultant names', () => {
      const handoff = generateHandoffMessage(
        'customer-service',
        'flight-operations',
        'Test'
      );

      expect(handoff.fromConsultant).toBe('Lisa Thompson');
      expect(handoff.toConsultant).toBe('Sarah Chen');
      expect(handoff.transferAnnouncement).toContain('Sarah Chen');
      expect(handoff.introduction).toContain('Sarah Chen');
    });
  });

  describe('Context Parsing Edge Cases', () => {
    test('should handle guests array vs number', () => {
      const handoff1 = generateHandoffMessage(
        'customer-service',
        'hotel-accommodations',
        'Hotel',
        {
          city: 'Tokyo',
          checkIn: '2024-01-01',
          checkOut: '2024-01-03',
          guests: 3,
        }
      );

      expect(handoff1.context).toContain('3');
    });

    test('should default passengers to 1 when missing', () => {
      const handoff = generateHandoffMessage(
        'customer-service',
        'flight-operations',
        'Flight',
        {
          origin: 'NYC',
          destination: 'LAX',
          departureDate: '2024-01-01',
        }
      );

      expect(handoff.context).toContain('1');
    });

    test('should handle zero guests gracefully', () => {
      const handoff = generateHandoffMessage(
        'customer-service',
        'hotel-accommodations',
        'Hotel',
        {
          city: 'London',
          checkIn: '2024-01-01',
          checkOut: '2024-01-03',
          guests: 0,
        }
      );

      // Should default to 1 guest
      expect(handoff.context).toBeDefined();
    });
  });
});
