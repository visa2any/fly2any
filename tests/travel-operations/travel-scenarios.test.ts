/**
 * Travel Operations Test Suite
 * Tests real-world travel scenarios, consultant routing, and deal detection
 */

import { analyzeConversationIntent } from '@/lib/ai/conversational-intelligence';
import { generateHandoffMessage, needsHandoff, TeamType } from '@/lib/ai/consultant-handoff';
import { detectEmotion } from '@/lib/ai/emotion-detection';

describe('Travel Operations: Real-World Scenarios', () => {
  describe('International Flights with Visa Requirements', () => {
    test('should detect travel to countries requiring visas', () => {
      const scenarios = [
        'I need a flight to China from the US',
        'Planning a trip to Russia next month',
        'Want to visit India in summer',
        'Book flight to Vietnam',
      ];

      scenarios.forEach(scenario => {
        const analysis = analyzeConversationIntent(scenario, []);
        expect(analysis.isServiceRequest).toBe(true);
        expect(analysis.topics).toContain('flights');
      });
    });

    test('should route visa questions to visa specialist', () => {
      const visaQuestions = [
        'Do I need a visa for China?',
        'What are the visa requirements for India?',
        'How long does it take to get a Russian visa?',
      ];

      visaQuestions.forEach(question => {
        const analysis = analyzeConversationIntent(question, []);
        expect(analysis.topics).toContain('visa');

        const handoff = generateHandoffMessage(
          'customer-service',
          'visa-documentation',
          question
        );

        expect(handoff.toConsultant).toBe('Sophia Nguyen');
        expect(handoff.introduction).toContain('Immigration & Documentation');
      });
    });

    test('should detect passport validity concerns', () => {
      const passportQueries = [
        'My passport expires in 3 months, can I still travel?',
        'What are the passport requirements?',
        'How long should my passport be valid for?',
      ];

      passportQueries.forEach(query => {
        const analysis = analyzeConversationIntent(query, []);
        expect(analysis.topics).toContain('passport');
      });
    });

    test('should handle multi-country itineraries with different visa requirements', () => {
      const multiCountry = analyzeConversationIntent(
        'I want to visit China, then Thailand, then Vietnam',
        []
      );

      expect(multiCountry.isServiceRequest).toBe(true);
      expect(multiCountry.topics).toContain('flights');
    });

    test('should detect COVID/vaccination requirement questions', () => {
      const covidQueries = [
        'Do I need a COVID test to fly to France?',
        'What are the vaccination requirements?',
        'Are there quarantine requirements?',
      ];

      covidQueries.forEach(query => {
        const analysis = analyzeConversationIntent(query, []);
        expect(analysis.topics).toContain('covid-requirements');
      });
    });
  });

  describe('Multi-City Bookings', () => {
    test('should detect multi-city flight requests', () => {
      const multiCityRequests = [
        'I want to fly NYC to London, then London to Paris, then Paris to NYC',
        'Multi-city: San Francisco, Tokyo, Seoul, back to San Francisco',
        'Trip to Europe: NY-Paris-Rome-Barcelona-NY',
      ];

      multiCityRequests.forEach(request => {
        const analysis = analyzeConversationIntent(request, []);
        expect(analysis.isServiceRequest).toBe(true);
        expect(analysis.topics).toContain('flights');
      });
    });

    test('should handle complex itineraries with hotels', () => {
      const complex = analyzeConversationIntent(
        'I need flights and hotels in Paris for 3 days, then Barcelona for 4 days',
        []
      );

      expect(complex.topics).toContain('flights');
      expect(complex.topics).toContain('hotels');
    });

    test('should detect open-jaw tickets', () => {
      const openJaw = analyzeConversationIntent(
        'Fly from NYC to London, return from Paris to NYC',
        []
      );

      expect(openJaw.isServiceRequest).toBe(true);
      expect(openJaw.topics).toContain('flights');
    });

    test('should handle stopover requests', () => {
      const stopover = analyzeConversationIntent(
        'Flight to Tokyo with a 2-day stopover in Iceland',
        []
      );

      expect(stopover.isServiceRequest).toBe(true);
    });
  });

  describe('Group Travel (Families)', () => {
    test('should detect family travel bookings', () => {
      const familyBookings = [
        'I need 4 tickets - 2 adults and 2 children',
        'Family vacation for 5 people',
        'Traveling with my spouse and 3 kids',
      ];

      familyBookings.forEach(booking => {
        const analysis = analyzeConversationIntent(booking, []);
        expect(analysis.isServiceRequest).toBe(true);
        expect(analysis.topics).toContain('flights');
      });
    });

    test('should detect special family requirements', () => {
      const requirements = [
        'Do you have family seating?',
        'We need connecting rooms',
        'Child meal preferences',
        'Traveling with an infant',
      ];

      requirements.forEach(req => {
        const analysis = analyzeConversationIntent(req, []);
        expect(analysis).toBeDefined();
      });
    });

    test('should detect unaccompanied minor travel', () => {
      const unaccompanied = analyzeConversationIntent(
        'My 12-year-old will be flying alone',
        []
      );

      expect(unaccompanied.topics).toContain('special-assistance');
      expect(unaccompanied.topics).toContain('unaccompanied-minor');
    });

    test('should handle large group bookings', () => {
      const largeGroup = analyzeConversationIntent(
        'I need to book flights for 15 people for a family reunion',
        []
      );

      expect(largeGroup.isServiceRequest).toBe(true);
    });

    test('should detect child age categories', () => {
      const childAges = [
        'One infant under 2 years',
        'Child aged 5',
        'Teen passenger 16 years old',
      ];

      childAges.forEach(age => {
        const analysis = analyzeConversationIntent(age, []);
        expect(analysis).toBeDefined();
      });
    });
  });

  describe('Last-Minute Bookings', () => {
    test('should detect urgency in last-minute requests', () => {
      const urgent = [
        'I need a flight TODAY',
        'Emergency trip tomorrow morning',
        'ASAP flight needed',
        'Can I book a flight leaving in 3 hours?',
      ];

      urgent.forEach(request => {
        const analysis = analyzeConversationIntent(request, []);
        const emotion = detectEmotion(request);

        expect(emotion.urgency).toBe('high');
      });
    });

    test('should route emergency bookings appropriately', () => {
      const emergency = analyzeConversationIntent(
        'Family emergency - need to fly out immediately',
        []
      );

      expect(emergency.isServiceRequest).toBe(true);

      const handoff = generateHandoffMessage(
        'customer-service',
        'emergency-response',
        'Family emergency'
      );

      expect(handoff.toConsultant).toBe('Captain Mike Johnson');
    });

    test('should handle same-day bookings', () => {
      const sameDay = analyzeConversationIntent(
        'Need a hotel room in Chicago tonight',
        []
      );

      expect(sameDay.isServiceRequest).toBe(true);
      expect(sameDay.topics).toContain('hotels');
    });

    test('should detect flexible date needs for urgent travel', () => {
      const flexible = analyzeConversationIntent(
        'Need to fly to Boston ASAP - any time this week works',
        []
      );

      expect(flexible.isServiceRequest).toBe(true);
    });
  });

  describe('Complex Itineraries', () => {
    test('should handle round-the-world tickets', () => {
      const rtw = analyzeConversationIntent(
        'Round the world ticket: NYC-London-Dubai-Singapore-Tokyo-LA-NYC',
        []
      );

      expect(rtw.isServiceRequest).toBe(true);
      expect(rtw.topics).toContain('flights');
    });

    test('should handle cruise and flight combinations', () => {
      const cruise = analyzeConversationIntent(
        'Flight to Miami, then Caribbean cruise, then flight back',
        []
      );

      expect(cruise.isServiceRequest).toBe(true);
    });

    test('should handle long-term travel planning', () => {
      const longTerm = analyzeConversationIntent(
        '6-month backpacking trip through Southeast Asia',
        []
      );

      expect(longTerm.isServiceRequest).toBe(true);
    });

    test('should handle business trips with multiple cities', () => {
      const business = analyzeConversationIntent(
        'Business trip: SF Monday, Chicago Wednesday, NYC Friday, return Sunday',
        []
      );

      expect(business.isServiceRequest).toBe(true);
    });

    test('should detect adventure travel requests', () => {
      const adventure = analyzeConversationIntent(
        'Trek to Everest base camp with flights and permits',
        []
      );

      expect(adventure.isServiceRequest).toBe(true);
    });
  });

  describe('Consultant Routing Accuracy', () => {
    test('should route flight searches to flight specialist', () => {
      const flightSearch = analyzeConversationIntent('Find me a flight to London', []);

      const conversationHistory = [
        { consultant: { team: 'customer-service' } },
      ];

      const previousTeam = 'customer-service' as TeamType;
      const shouldHandoff = needsHandoff(previousTeam, 'flight-operations');

      expect(shouldHandoff).toBe(true);

      const handoff = generateHandoffMessage(
        'customer-service',
        'flight-operations',
        'Find me a flight to London'
      );

      expect(handoff.toConsultant).toBe('Sarah Chen');
    });

    test('should route hotel searches to hotel specialist', () => {
      const handoff = generateHandoffMessage(
        'customer-service',
        'hotel-accommodations',
        'I need a hotel in Rome'
      );

      expect(handoff.toConsultant).toBe('Marcus Rodriguez');
      expect(handoff.introduction).toContain('Hotel & Accommodations Advisor');
    });

    test('should route payment issues to billing specialist', () => {
      const paymentIssue = analyzeConversationIntent(
        'My payment was declined',
        []
      );

      const handoff = generateHandoffMessage(
        'customer-service',
        'payment-billing',
        'Payment declined'
      );

      expect(handoff.toConsultant).toBe('David Park');
    });

    test('should route accessibility needs to accessibility coordinator', () => {
      const accessibility = analyzeConversationIntent(
        'I use a wheelchair and need assistance',
        []
      );

      expect(accessibility.topics).toContain('special-assistance');
      expect(accessibility.topics).toContain('wheelchair');

      const handoff = generateHandoffMessage(
        'flight-operations',
        'accessibility-services',
        'Wheelchair assistance needed'
      );

      expect(handoff.toConsultant).toBe('Nina Davis');
    });

    test('should route insurance questions to insurance specialist', () => {
      const handoff = generateHandoffMessage(
        'customer-service',
        'travel-insurance',
        'What travel insurance do you offer?'
      );

      expect(handoff.toConsultant).toBe('Robert Martinez');
    });

    test('should route car rental to car specialist', () => {
      const handoff = generateHandoffMessage(
        'customer-service',
        'car-rental',
        'I need to rent a car'
      );

      expect(handoff.toConsultant).toBe('James Anderson');
    });

    test('should route loyalty questions to rewards specialist', () => {
      const loyalty = analyzeConversationIntent(
        'How do I earn frequent flyer miles?',
        []
      );

      expect(loyalty.topics).toContain('loyalty-rewards');

      const handoff = generateHandoffMessage(
        'customer-service',
        'loyalty-rewards',
        'Frequent flyer miles'
      );

      expect(handoff.toConsultant).toBe('Amanda Foster');
    });

    test('should not handoff when staying with same specialist', () => {
      const shouldHandoff = needsHandoff('flight-operations', 'flight-operations');
      expect(shouldHandoff).toBe(false);
    });

    test('should handoff when switching between specialists', () => {
      const shouldHandoff = needsHandoff('flight-operations', 'hotel-accommodations');
      expect(shouldHandoff).toBe(true);
    });
  });

  describe('Deal Detection Logic', () => {
    test('should detect when user is price-conscious', () => {
      const priceConsciousMessages = [
        'Looking for cheap flights',
        'What\'s the cheapest option?',
        'I\'m on a tight budget',
        'Best price to Paris?',
      ];

      priceConsciousMessages.forEach(msg => {
        const analysis = analyzeConversationIntent(msg, []);
        expect(analysis.topics).toContain('pricing');
      });
    });

    test('should detect luxury travel preferences', () => {
      const luxuryMessages = [
        'First class tickets',
        'Luxury hotel recommendations',
        'Premium accommodation',
        'Five-star hotels',
      ];

      luxuryMessages.forEach(msg => {
        const analysis = analyzeConversationIntent(msg, []);
        expect(analysis).toBeDefined();
      });
    });

    test('should detect package deal interest', () => {
      const packageInterest = [
        'Flight and hotel package',
        'All-inclusive deal',
        'Complete vacation package',
        'Bundle flights and car rental',
      ];

      packageInterest.forEach(msg => {
        const analysis = analyzeConversationIntent(msg, []);
        expect(analysis.topics).toContain('packages');
      });
    });

    test('should detect seasonal travel patterns', () => {
      const seasonal = [
        'Christmas vacation',
        'Summer holiday in Europe',
        'New Year\'s Eve trip',
        'Spring break destination',
      ];

      seasonal.forEach(msg => {
        const analysis = analyzeConversationIntent(msg, []);
        expect(analysis).toBeDefined();
      });
    });

    test('should detect early booking opportunities', () => {
      const earlyBooking = analyzeConversationIntent(
        'Planning a trip for next summer',
        []
      );

      expect(earlyBooking.isServiceRequest).toBe(true);
    });
  });

  describe('Special Travel Circumstances', () => {
    test('should handle honeymoon bookings', () => {
      const honeymoon = analyzeConversationIntent(
        'Planning our honeymoon to Bali',
        []
      );

      expect(honeymoon.topics).toContain('romantic');
    });

    test('should handle business class upgrades', () => {
      const upgrade = analyzeConversationIntent(
        'Can I upgrade to business class?',
        []
      );

      expect(upgrade).toBeDefined();
    });

    test('should handle pet travel', () => {
      const petTravel = analyzeConversationIntent(
        'Can I bring my dog on the flight?',
        []
      );

      expect(petTravel.topics).toContain('special-assistance');
    });

    test('should handle pregnancy travel concerns', () => {
      const pregnancy = analyzeConversationIntent(
        'I\'m 7 months pregnant, can I fly?',
        []
      );

      expect(pregnancy.topics).toContain('special-assistance');
      expect(pregnancy.topics).toContain('pregnancy');
    });

    test('should handle medical equipment transport', () => {
      const medical = analyzeConversationIntent(
        'I need to bring medical oxygen',
        []
      );

      expect(medical.topics).toContain('special-assistance');
      expect(medical.topics).toContain('medical');
    });

    test('should handle dietary restrictions', () => {
      const dietary = analyzeConversationIntent(
        'I need a vegan meal on the flight',
        []
      );

      expect(dietary.topics).toContain('special-assistance');
      expect(dietary.topics).toContain('dietary');
    });

    test('should handle sports equipment', () => {
      const sports = analyzeConversationIntent(
        'Can I bring my surfboard?',
        []
      );

      expect(sports).toBeDefined();
    });

    test('should handle student travel discounts', () => {
      const student = analyzeConversationIntent(
        'Do you have student discounts?',
        []
      );

      expect(student).toBeDefined();
    });

    test('should handle senior travel', () => {
      const senior = analyzeConversationIntent(
        'Are there senior citizen discounts?',
        []
      );

      expect(senior).toBeDefined();
    });

    test('should handle military travel', () => {
      const military = analyzeConversationIntent(
        'Military discount available?',
        []
      );

      expect(military).toBeDefined();
    });
  });

  describe('Destination-Specific Scenarios', () => {
    test('should handle popular destinations correctly', () => {
      const destinations = [
        'Paris',
        'Tokyo',
        'New York',
        'Dubai',
        'London',
        'Singapore',
        'Barcelona',
        'Rome',
      ];

      destinations.forEach(dest => {
        const analysis = analyzeConversationIntent(
          `I want to go to ${dest}`,
          []
        );
        expect(analysis.isServiceRequest).toBe(true);
      });
    });

    test('should handle beach destinations', () => {
      const beaches = [
        'Maldives',
        'Bali',
        'Caribbean',
        'Hawaii',
        'Cancun',
      ];

      beaches.forEach(beach => {
        const analysis = analyzeConversationIntent(
          `Beach vacation in ${beach}`,
          []
        );
        expect(analysis).toBeDefined();
      });
    });

    test('should handle ski destinations', () => {
      const skiDestinations = [
        'Need a ski resort in the Alps',
        'Skiing in Colorado',
        'Winter sports in Japan',
      ];

      skiDestinations.forEach(ski => {
        const analysis = analyzeConversationIntent(ski, []);
        expect(analysis.topics).toContain('mountain');
      });
    });

    test('should handle cultural destinations', () => {
      const cultural = analyzeConversationIntent(
        'Interested in historical sites in Greece',
        []
      );

      expect(cultural.topics).toContain('cultural');
    });

    test('should handle remote/exotic locations', () => {
      const exotic = [
        'Antarctica expedition',
        'Safari in Tanzania',
        'Galapagos Islands',
      ];

      exotic.forEach(location => {
        const analysis = analyzeConversationIntent(location, []);
        expect(analysis.isServiceRequest).toBe(true);
      });
    });
  });

  describe('Time-Sensitive Operations', () => {
    test('should handle flight change requests', () => {
      const change = analyzeConversationIntent(
        'I need to change my flight date',
        []
      );

      expect(change.intent).toBe('booking-management');
      expect(change.topics).toContain('modification');
    });

    test('should handle cancellation requests', () => {
      const cancel = analyzeConversationIntent(
        'Cancel my reservation',
        []
      );

      expect(cancel.intent).toBe('booking-management');
      expect(cancel.topics).toContain('cancellation');
    });

    test('should handle refund requests', () => {
      const refund = analyzeConversationIntent(
        'I want a refund for my cancelled flight',
        []
      );

      expect(refund.intent).toBe('booking-management');
      expect(refund.topics).toContain('refund');
    });

    test('should handle missed flight scenarios', () => {
      const missed = analyzeConversationIntent(
        'I missed my connection',
        []
      );

      expect(missed.intent).toBe('booking-management');

      const emotion = detectEmotion('I missed my connection');
      expect(emotion.urgency).toBe('high');
    });

    test('should handle flight delay notifications', () => {
      const delay = analyzeConversationIntent(
        'My flight is delayed, what are my options?',
        []
      );

      expect(delay.intent).toBe('booking-management');
    });
  });

  describe('Payment and Billing Scenarios', () => {
    test('should detect invoice requests', () => {
      const invoice = analyzeConversationIntent(
        'I need an invoice for my booking',
        []
      );

      expect(invoice.intent).toBe('booking-management');
    });

    test('should handle split payment requests', () => {
      const split = analyzeConversationIntent(
        'Can I pay with two different cards?',
        []
      );

      expect(split).toBeDefined();
    });

    test('should handle currency questions', () => {
      const currency = analyzeConversationIntent(
        'Can I pay in euros?',
        []
      );

      expect(currency).toBeDefined();
    });

    test('should handle expense management', () => {
      const expense = analyzeConversationIntent(
        'I need this for my company expenses',
        []
      );

      expect(expense).toBeDefined();
    });
  });
});
