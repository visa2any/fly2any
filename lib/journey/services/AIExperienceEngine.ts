/**
 * AI Experience Engine Service
 * Generates intelligent experience suggestions for journeys
 * Phase 1: Mock data | Phase 3: Production API
 */

import { nanoid } from 'nanoid';
import {
  JourneyExperience,
  JourneyDay,
  JourneyPreferences,
  InterestType,
  ExperienceType,
  TimeSlot,
  AIExperienceSuggestion,
  AIDayOptimization,
  JourneyWarning,
} from '../types';

// ============================================================================
// MOCK DATA (Phase 1 - Top Destinations)
// ============================================================================

interface MockExperience {
  name: string;
  type: ExperienceType;
  duration: number;
  timeSlot: TimeSlot;
  price: number;
  interests: InterestType[];
  rating: number;
  description: string;
}

const MOCK_EXPERIENCES: Record<string, MockExperience[]> = {
  NYC: [
    { name: 'Statue of Liberty Tour', type: 'tour', duration: 240, timeSlot: 'morning', price: 45, interests: ['culture'], rating: 4.8, description: 'Iconic landmark with ferry ride and crown access' },
    { name: 'Central Park Walking Tour', type: 'activity', duration: 120, timeSlot: 'morning', price: 30, interests: ['nature'], rating: 4.7, description: 'Guided walk through the iconic park' },
    { name: 'Broadway Show', type: 'show', duration: 180, timeSlot: 'evening', price: 150, interests: ['culture', 'nightlife'], rating: 4.9, description: 'World-class theater experience' },
    { name: 'Times Square Food Tour', type: 'restaurant', duration: 180, timeSlot: 'afternoon', price: 80, interests: ['food'], rating: 4.6, description: 'Taste NYC\'s diverse cuisine' },
    { name: 'Met Museum Visit', type: 'attraction', duration: 180, timeSlot: 'afternoon', price: 30, interests: ['culture'], rating: 4.9, description: 'World-renowned art collection' },
    { name: 'SoHo Shopping', type: 'shopping', duration: 180, timeSlot: 'afternoon', price: 0, interests: ['shopping'], rating: 4.5, description: 'Trendy boutiques and designer stores' },
    { name: 'Rooftop Bar Experience', type: 'restaurant', duration: 120, timeSlot: 'evening', price: 60, interests: ['nightlife', 'food'], rating: 4.7, description: 'Cocktails with skyline views' },
  ],
  LAX: [
    { name: 'Hollywood Sign Hike', type: 'activity', duration: 180, timeSlot: 'morning', price: 0, interests: ['nature', 'culture'], rating: 4.7, description: 'Scenic hike to iconic landmark' },
    { name: 'Santa Monica Pier', type: 'attraction', duration: 180, timeSlot: 'afternoon', price: 0, interests: ['family', 'nature'], rating: 4.6, description: 'Beach boardwalk and amusements' },
    { name: 'Universal Studios', type: 'attraction', duration: 480, timeSlot: 'morning', price: 120, interests: ['family', 'culture'], rating: 4.8, description: 'Theme park and studio tour' },
    { name: 'Beverly Hills Food Tour', type: 'restaurant', duration: 180, timeSlot: 'afternoon', price: 90, interests: ['food'], rating: 4.7, description: 'Upscale dining experiences' },
    { name: 'Sunset Strip Nightlife', type: 'activity', duration: 180, timeSlot: 'night', price: 50, interests: ['nightlife'], rating: 4.5, description: 'Famous clubs and bars' },
    { name: 'Getty Center', type: 'attraction', duration: 180, timeSlot: 'afternoon', price: 0, interests: ['culture'], rating: 4.9, description: 'Art museum with gardens' },
    { name: 'Venice Beach', type: 'activity', duration: 180, timeSlot: 'morning', price: 0, interests: ['nature', 'culture'], rating: 4.6, description: 'Iconic boardwalk culture' },
  ],
  MIA: [
    { name: 'South Beach Morning', type: 'activity', duration: 180, timeSlot: 'morning', price: 0, interests: ['nature', 'wellness'], rating: 4.8, description: 'Sun, sand, and Art Deco' },
    { name: 'Little Havana Food Tour', type: 'restaurant', duration: 180, timeSlot: 'afternoon', price: 75, interests: ['food', 'culture'], rating: 4.8, description: 'Cuban cuisine and culture' },
    { name: 'Everglades Airboat Tour', type: 'tour', duration: 240, timeSlot: 'morning', price: 55, interests: ['nature', 'adventure'], rating: 4.7, description: 'Wildlife and wetlands adventure' },
    { name: 'Wynwood Walls', type: 'attraction', duration: 120, timeSlot: 'afternoon', price: 0, interests: ['culture'], rating: 4.6, description: 'Street art outdoor museum' },
    { name: 'Ocean Drive Nightlife', type: 'activity', duration: 180, timeSlot: 'night', price: 80, interests: ['nightlife'], rating: 4.5, description: 'Famous nightclub scene' },
    { name: 'Spa Day', type: 'wellness', duration: 240, timeSlot: 'morning', price: 150, interests: ['wellness'], rating: 4.9, description: 'Luxury beachfront spa' },
    { name: 'Airport Express Shuttle', type: 'transport', duration: 45, timeSlot: 'morning', price: 25, interests: ['family'], rating: 4.4, description: 'Convenient airport transfer' },
    { name: 'Live Jazz at Blue Note', type: 'show', duration: 150, timeSlot: 'evening', price: 65, interests: ['nightlife', 'culture'], rating: 4.7, description: 'Premium jazz experience' },
  ],
  CDG: [
    { name: 'Eiffel Tower Visit', type: 'attraction', duration: 180, timeSlot: 'morning', price: 35, interests: ['culture', 'family'], rating: 4.9, description: 'Iconic landmark with city views' },
    { name: 'Louvre Museum', type: 'attraction', duration: 240, timeSlot: 'afternoon', price: 22, interests: ['culture'], rating: 4.9, description: 'World\'s largest art museum' },
    { name: 'Seine River Cruise', type: 'tour', duration: 90, timeSlot: 'evening', price: 25, interests: ['culture', 'romantic'], rating: 4.8, description: 'Romantic cruise past monuments' },
    { name: 'French Cooking Class', type: 'activity', duration: 180, timeSlot: 'morning', price: 95, interests: ['food', 'culture'], rating: 4.7, description: 'Learn classic French cuisine' },
    { name: 'Moulin Rouge Show', type: 'show', duration: 150, timeSlot: 'night', price: 120, interests: ['nightlife', 'culture'], rating: 4.8, description: 'Famous cabaret experience' },
    { name: 'Montmartre Walking Tour', type: 'tour', duration: 150, timeSlot: 'afternoon', price: 30, interests: ['culture'], rating: 4.6, description: 'Artistic neighborhood exploration' },
    { name: 'Paris Metro Day Pass', type: 'transport', duration: 0, timeSlot: 'morning', price: 14, interests: ['family'], rating: 4.5, description: 'Unlimited city transport' },
    { name: 'Versailles Day Trip', type: 'tour', duration: 480, timeSlot: 'morning', price: 85, interests: ['culture'], rating: 4.8, description: 'Royal palace and gardens' },
  ],
  LHR: [
    { name: 'Tower of London', type: 'attraction', duration: 180, timeSlot: 'morning', price: 35, interests: ['culture', 'family'], rating: 4.8, description: 'Historic fortress and crown jewels' },
    { name: 'West End Musical', type: 'show', duration: 180, timeSlot: 'evening', price: 95, interests: ['culture', 'nightlife'], rating: 4.9, description: 'World-class theater experience' },
    { name: 'British Museum', type: 'attraction', duration: 180, timeSlot: 'afternoon', price: 0, interests: ['culture'], rating: 4.8, description: 'Free world-class museum' },
    { name: 'Afternoon Tea', type: 'restaurant', duration: 120, timeSlot: 'afternoon', price: 65, interests: ['food', 'culture'], rating: 4.7, description: 'Traditional English tea experience' },
    { name: 'London Eye', type: 'attraction', duration: 60, timeSlot: 'evening', price: 32, interests: ['family', 'culture'], rating: 4.6, description: 'Panoramic city views' },
    { name: 'Oyster Card', type: 'transport', duration: 0, timeSlot: 'morning', price: 20, interests: ['family'], rating: 4.7, description: 'London transport card with credit' },
    { name: 'Harry Potter Studio Tour', type: 'tour', duration: 300, timeSlot: 'morning', price: 55, interests: ['family', 'culture'], rating: 4.9, description: 'Behind the scenes magic' },
    { name: 'Camden Market', type: 'shopping', duration: 180, timeSlot: 'afternoon', price: 0, interests: ['shopping', 'food'], rating: 4.5, description: 'Eclectic market experience' },
  ],
  NRT: [
    { name: 'Senso-ji Temple', type: 'attraction', duration: 120, timeSlot: 'morning', price: 0, interests: ['culture'], rating: 4.8, description: 'Ancient Buddhist temple' },
    { name: 'Tsukiji Food Tour', type: 'restaurant', duration: 180, timeSlot: 'morning', price: 90, interests: ['food', 'culture'], rating: 4.9, description: 'Fresh sushi and market tour' },
    { name: 'Robot Restaurant Show', type: 'show', duration: 120, timeSlot: 'evening', price: 85, interests: ['nightlife', 'culture'], rating: 4.4, description: 'Unique Tokyo entertainment' },
    { name: 'Shibuya & Harajuku Tour', type: 'tour', duration: 180, timeSlot: 'afternoon', price: 45, interests: ['culture', 'shopping'], rating: 4.6, description: 'Youth culture experience' },
    { name: 'Sumo Tournament', type: 'activity', duration: 240, timeSlot: 'afternoon', price: 120, interests: ['culture', 'adventure'], rating: 4.8, description: 'Traditional wrestling' },
    { name: 'JR Pass Day', type: 'transport', duration: 0, timeSlot: 'morning', price: 65, interests: ['family'], rating: 4.8, description: 'Unlimited train travel' },
    { name: 'Ginza Shopping', type: 'shopping', duration: 180, timeSlot: 'afternoon', price: 0, interests: ['shopping'], rating: 4.6, description: 'Luxury shopping district' },
    { name: 'Onsen Spa Experience', type: 'wellness', duration: 180, timeSlot: 'evening', price: 45, interests: ['wellness'], rating: 4.9, description: 'Traditional hot spring bath' },
  ],
  DXB: [
    { name: 'Burj Khalifa', type: 'attraction', duration: 120, timeSlot: 'evening', price: 45, interests: ['culture', 'family'], rating: 4.9, description: 'World\'s tallest building' },
    { name: 'Desert Safari', type: 'tour', duration: 360, timeSlot: 'afternoon', price: 85, interests: ['adventure', 'nature'], rating: 4.8, description: 'Dune bashing and BBQ dinner' },
    { name: 'Dubai Mall Shopping', type: 'shopping', duration: 240, timeSlot: 'afternoon', price: 0, interests: ['shopping', 'family'], rating: 4.7, description: 'World\'s largest mall' },
    { name: 'Yacht Marina Cruise', type: 'tour', duration: 120, timeSlot: 'evening', price: 95, interests: ['romantic', 'nightlife'], rating: 4.7, description: 'Luxury dinner cruise' },
    { name: 'Gold Souk Visit', type: 'shopping', duration: 120, timeSlot: 'morning', price: 0, interests: ['shopping', 'culture'], rating: 4.5, description: 'Traditional gold market' },
    { name: 'Private Airport Transfer', type: 'transport', duration: 45, timeSlot: 'morning', price: 55, interests: ['family'], rating: 4.6, description: 'Luxury car service' },
    { name: 'Spa at Atlantis', type: 'wellness', duration: 180, timeSlot: 'morning', price: 180, interests: ['wellness'], rating: 4.9, description: 'World-class spa treatment' },
    { name: 'La Perle Show', type: 'show', duration: 90, timeSlot: 'evening', price: 120, interests: ['culture', 'nightlife'], rating: 4.8, description: 'Aquatic theater spectacle' },
  ],
  BCN: [
    { name: 'Sagrada Familia', type: 'attraction', duration: 120, timeSlot: 'morning', price: 26, interests: ['culture'], rating: 4.9, description: 'Gaudí\'s masterpiece basilica' },
    { name: 'Park Güell', type: 'attraction', duration: 120, timeSlot: 'afternoon', price: 10, interests: ['culture', 'nature'], rating: 4.8, description: 'Artistic park with views' },
    { name: 'Flamenco Show', type: 'show', duration: 90, timeSlot: 'evening', price: 45, interests: ['culture', 'nightlife'], rating: 4.7, description: 'Traditional Spanish dance' },
    { name: 'La Boqueria Market', type: 'restaurant', duration: 120, timeSlot: 'morning', price: 0, interests: ['food', 'culture'], rating: 4.8, description: 'Famous food market' },
    { name: 'Gothic Quarter Walk', type: 'tour', duration: 150, timeSlot: 'afternoon', price: 25, interests: ['culture'], rating: 4.6, description: 'Medieval neighborhood tour' },
    { name: 'Metro T-Casual Card', type: 'transport', duration: 0, timeSlot: 'morning', price: 12, interests: ['family'], rating: 4.5, description: '10-trip metro card' },
    { name: 'Beach Day', type: 'activity', duration: 240, timeSlot: 'morning', price: 0, interests: ['nature', 'wellness'], rating: 4.6, description: 'Barceloneta beach relaxation' },
    { name: 'FC Barcelona Stadium', type: 'tour', duration: 120, timeSlot: 'afternoon', price: 28, interests: ['adventure', 'culture'], rating: 4.7, description: 'Camp Nou experience' },
  ],
  // Default for any destination
  DEFAULT: [
    { name: 'City Walking Tour', type: 'tour', duration: 180, timeSlot: 'morning', price: 35, interests: ['culture'], rating: 4.5, description: 'Discover the city highlights' },
    { name: 'Local Food Experience', type: 'restaurant', duration: 120, timeSlot: 'afternoon', price: 50, interests: ['food'], rating: 4.6, description: 'Taste local specialties' },
    { name: 'Museum Visit', type: 'attraction', duration: 180, timeSlot: 'afternoon', price: 20, interests: ['culture'], rating: 4.7, description: 'Cultural and historical exhibits' },
    { name: 'Evening Dining', type: 'restaurant', duration: 120, timeSlot: 'evening', price: 60, interests: ['food'], rating: 4.6, description: 'Fine dining experience' },
    { name: 'Nature Excursion', type: 'activity', duration: 240, timeSlot: 'morning', price: 45, interests: ['nature', 'adventure'], rating: 4.5, description: 'Outdoor exploration' },
    { name: 'Local Concert/Show', type: 'show', duration: 150, timeSlot: 'evening', price: 55, interests: ['nightlife', 'culture'], rating: 4.4, description: 'Live entertainment' },
    { name: 'Airport Transfer', type: 'transport', duration: 60, timeSlot: 'morning', price: 35, interests: ['family'], rating: 4.3, description: 'Convenient transfer service' },
    { name: 'City Transit Pass', type: 'transport', duration: 0, timeSlot: 'morning', price: 15, interests: ['family'], rating: 4.5, description: 'Public transport day pass' },
    { name: 'Wellness Spa', type: 'wellness', duration: 180, timeSlot: 'afternoon', price: 80, interests: ['wellness'], rating: 4.6, description: 'Relaxation treatment' },
    { name: 'Shopping District', type: 'shopping', duration: 180, timeSlot: 'afternoon', price: 0, interests: ['shopping'], rating: 4.4, description: 'Local shopping experience' },
  ],
};

// ============================================================================
// AI EXPERIENCE ENGINE
// ============================================================================

export class AIExperienceEngine {
  /**
   * Get experience suggestions for a day
   */
  static getSuggestions(
    day: JourneyDay,
    destinationCode: string,
    preferences: JourneyPreferences,
    existingExperiences: JourneyExperience[] = []
  ): AIExperienceSuggestion {
    // Get mock data for destination
    const code = destinationCode.toUpperCase();
    const mockData = MOCK_EXPERIENCES[code] || MOCK_EXPERIENCES.DEFAULT;

    // Filter by interests and time slot availability
    const availableSlots = this.getAvailableSlots(day, preferences.pace);
    const existingSlots = new Set(existingExperiences.map((e) => e.timeSlot));

    // Filter and score experiences
    const scoredExperiences = mockData
      .filter((exp) => {
        // Time slot available
        if (!availableSlots.includes(exp.timeSlot)) return false;
        if (existingSlots.has(exp.timeSlot)) return false;

        // Budget check (if specified)
        if (preferences.budget) {
          const dailyBudget = preferences.budget.max / 7; // Rough daily budget
          if (exp.price > dailyBudget) return false;
        }

        return true;
      })
      .map((exp) => ({
        ...exp,
        score: this.scoreExperience(exp, preferences),
      }))
      .sort((a, b) => b.score - a.score);

    // Select top experiences (1 per available slot)
    const selectedExperiences: JourneyExperience[] = [];
    const usedSlots = new Set<TimeSlot>();

    for (const exp of scoredExperiences) {
      if (usedSlots.has(exp.timeSlot)) continue;
      if (selectedExperiences.length >= availableSlots.length) break;

      selectedExperiences.push(this.toJourneyExperience(exp, destinationCode));
      usedSlots.add(exp.timeSlot);
    }

    return {
      experiences: selectedExperiences,
      confidence: selectedExperiences.length > 0 ? 85 : 50,
      reasoning: `Selected ${selectedExperiences.length} experiences based on your ${preferences.pace} pace and interests in ${preferences.interests.join(', ')}`,
    };
  }

  /**
   * Score an experience based on preferences
   */
  static scoreExperience(exp: MockExperience, preferences: JourneyPreferences): number {
    let score = exp.rating * 10; // Base score from rating (0-50)

    // Interest match bonus
    const matchedInterests = exp.interests.filter((i) =>
      preferences.interests.includes(i)
    );
    score += matchedInterests.length * 15; // Up to 30 bonus

    // Pace compatibility
    if (preferences.pace === 'relaxed' && exp.duration <= 180) score += 10;
    if (preferences.pace === 'intensive' && exp.duration >= 180) score += 10;

    // Price consideration
    if (exp.price === 0) score += 5; // Free activities bonus

    return Math.min(100, Math.round(score));
  }

  /**
   * Convert mock experience to JourneyExperience
   */
  static toJourneyExperience(exp: MockExperience & { score?: number }, destinationCode: string): JourneyExperience {
    return {
      id: nanoid(10),
      type: exp.type,
      name: exp.name,
      description: exp.description,
      duration: exp.duration,
      timeSlot: exp.timeSlot,
      location: {
        name: destinationCode,
      },
      price: {
        amount: exp.price,
        currency: 'USD',
        isEstimate: true,
      },
      rating: exp.rating,
      reviewCount: Math.floor(Math.random() * 500) + 100,
      source: 'ai',
      aiConfidence: exp.score || 75,
      status: 'suggested',
      tags: exp.interests,
    };
  }

  /**
   * Get available time slots for a day based on pace
   */
  static getAvailableSlots(day: JourneyDay, pace: JourneyPreferences['pace']): TimeSlot[] {
    const slots: TimeSlot[] = [];

    // Arrival day - limited time
    if (day.isArrivalDay) {
      if (pace !== 'relaxed') slots.push('afternoon');
      slots.push('evening');
      return slots;
    }

    // Departure day - limited time
    if (day.isDepartureDay) {
      slots.push('morning');
      if (pace === 'intensive') slots.push('afternoon');
      return slots;
    }

    // Full day
    switch (pace) {
      case 'relaxed':
        return ['morning', 'evening'];
      case 'balanced':
        return ['morning', 'afternoon', 'evening'];
      case 'intensive':
        return ['morning', 'afternoon', 'evening', 'night'];
      default:
        return ['morning', 'afternoon', 'evening'];
    }
  }

  /**
   * Detect fatigue in journey
   */
  static detectFatigue(days: JourneyDay[], pace: JourneyPreferences['pace']): JourneyWarning[] {
    const warnings: JourneyWarning[] = [];
    const maxActivities = pace === 'relaxed' ? 2 : pace === 'balanced' ? 3 : 5;

    days.forEach((day, idx) => {
      const activityCount = day.experiences.filter(
        (e) => e.status === 'added' || e.status === 'booked'
      ).length;

      if (activityCount > maxActivities) {
        warnings.push({
          id: nanoid(8),
          type: 'fatigue',
          severity: 'warning',
          title: 'Busy day detected',
          message: `Day ${day.dayNumber} has ${activityCount} activities. Consider a more relaxed schedule.`,
          dayNumber: day.dayNumber,
          suggestion: 'Remove or reschedule some activities',
        });
      }

      // Check consecutive busy days
      if (idx > 0) {
        const prevDay = days[idx - 1];
        const prevCount = prevDay.experiences.filter(
          (e) => e.status === 'added' || e.status === 'booked'
        ).length;

        if (activityCount >= maxActivities && prevCount >= maxActivities) {
          warnings.push({
            id: nanoid(8),
            type: 'fatigue',
            severity: 'info',
            title: 'Consecutive busy days',
            message: `Days ${day.dayNumber - 1} and ${day.dayNumber} are both packed. Consider adding rest time.`,
            dayNumber: day.dayNumber,
          });
        }
      }
    });

    return warnings;
  }

  /**
   * Detect time conflicts
   */
  static detectConflicts(day: JourneyDay): JourneyWarning[] {
    const warnings: JourneyWarning[] = [];
    const experiences = day.experiences.filter(
      (e) => e.status === 'added' || e.status === 'booked'
    );

    // Check for same time slot conflicts
    const slotCounts = new Map<TimeSlot, number>();
    experiences.forEach((exp) => {
      const count = slotCounts.get(exp.timeSlot) || 0;
      slotCounts.set(exp.timeSlot, count + 1);
    });

    slotCounts.forEach((count, slot) => {
      if (count > 1) {
        warnings.push({
          id: nanoid(8),
          type: 'conflict',
          severity: 'error',
          title: 'Time conflict',
          message: `Day ${day.dayNumber} has ${count} activities scheduled for ${slot}`,
          dayNumber: day.dayNumber,
          suggestion: 'Move one activity to a different time slot',
        });
      }
    });

    return warnings;
  }

  /**
   * Optimize day schedule
   */
  static optimizeDay(day: JourneyDay, preferences: JourneyPreferences): AIDayOptimization {
    const experiences = [...day.experiences];
    const changes: AIDayOptimization['changes'] = [];

    // Sort by optimal time slot order
    const slotOrder: TimeSlot[] = ['morning', 'afternoon', 'evening', 'night'];
    experiences.sort((a, b) => {
      return slotOrder.indexOf(a.timeSlot) - slotOrder.indexOf(b.timeSlot);
    });

    // Detect and report changes
    if (JSON.stringify(experiences) !== JSON.stringify(day.experiences)) {
      changes.push({
        type: 'reorder',
        description: 'Reordered activities for optimal flow',
      });
    }

    return {
      optimizedExperiences: experiences,
      changes,
      timeSaved: changes.length > 0 ? 30 : 0, // Estimated 30 min saved
    };
  }
}

export default AIExperienceEngine;
