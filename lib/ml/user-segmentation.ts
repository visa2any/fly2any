/**
 * ML-POWERED USER SEGMENTATION
 * ============================
 * Classifies users into behavioral segments based on:
 * - Search patterns (route, dates, flexibility)
 * - Interaction behavior (clicks, filters, sorting)
 * - Price sensitivity indicators
 * - Time-based signals
 */

export type UserSegment = 'business' | 'leisure' | 'family' | 'budget';

interface SearchBehavior {
  // Route signals
  route: string;
  departureDay: 'weekday' | 'weekend';
  tripLength?: number; // days
  destination: string;

  // Search signals
  isFlexibleDates: boolean;
  searchTime: Date;
  advanceBooking: number; // days before departure

  // Passenger composition
  adults: number;
  children: number;
  infants: number;

  // Cabin class preference
  cabinClass: 'economy' | 'premium' | 'business' | 'first';
}

interface InteractionBehavior {
  // Filter usage
  usedPriceFilter: boolean;
  minPriceSet?: number;
  maxPriceSet?: number;

  // Sorting preference
  sortedBy?: 'price' | 'duration' | 'best' | 'earliest' | 'latest';

  // Click patterns
  clickedFlights: Array<{
    price: number;
    fareClass: string;
    airline: string;
  }>;

  // Time on page
  timeSpent: number; // seconds

  // Device
  deviceType: 'mobile' | 'tablet' | 'desktop';
}

interface SegmentationResult {
  segment: UserSegment;
  confidence: number; // 0-1
  signals: {
    [key: string]: number; // Feature scores
  };
  recommendations: {
    fareClass: string;
    addOns: string[];
    bundleType: string;
  };
}

export class UserSegmentationEngine {
  /**
   * Classify user into behavioral segment
   */
  async classifyUser(
    searchBehavior: SearchBehavior,
    interactionBehavior?: InteractionBehavior
  ): Promise<SegmentationResult> {
    // Calculate feature scores
    const features = this.extractFeatures(searchBehavior, interactionBehavior);

    // Run classification model
    const scores = {
      business: this.calculateBusinessScore(features),
      leisure: this.calculateLeisureScore(features),
      family: this.calculateFamilyScore(features),
      budget: this.calculateBudgetScore(features),
    };

    // Get highest scoring segment
    const segment = Object.entries(scores).reduce((a, b) => (b[1] > a[1] ? b : a))[0] as UserSegment;
    const confidence = scores[segment];

    // Generate recommendations
    const recommendations = this.generateRecommendations(segment, features);

    return {
      segment,
      confidence,
      signals: features,
      recommendations,
    };
  }

  /**
   * Extract features from user behavior
   */
  private extractFeatures(
    search: SearchBehavior,
    interaction?: InteractionBehavior
  ): { [key: string]: number } {
    const features: { [key: string]: number } = {};

    // === SEARCH-BASED FEATURES ===

    // Temporal features
    features.is_weekday_departure = search.departureDay === 'weekday' ? 1 : 0;
    features.is_weekend_departure = search.departureDay === 'weekend' ? 1 : 0;

    const hour = search.searchTime.getHours();
    features.is_business_hours = hour >= 9 && hour <= 17 ? 1 : 0;

    // Trip length features
    if (search.tripLength) {
      features.is_short_trip = search.tripLength <= 3 ? 1 : 0; // Business indicator
      features.is_medium_trip = search.tripLength >= 4 && search.tripLength <= 7 ? 1 : 0;
      features.is_long_trip = search.tripLength > 7 ? 1 : 0; // Leisure indicator
      features.is_weekend_trip = search.tripLength === 2 || search.tripLength === 3 ? 1 : 0;
    }

    // Advance booking (last-minute vs planned)
    features.is_last_minute = search.advanceBooking < 7 ? 1 : 0; // Business or urgent
    features.is_advance_booking = search.advanceBooking > 30 ? 1 : 0; // Leisure or family

    // Passenger composition
    features.is_solo_traveler = search.adults === 1 && search.children === 0 ? 1 : 0;
    features.has_children = search.children > 0 || search.infants > 0 ? 1 : 0;
    features.is_group = search.adults + search.children >= 3 ? 1 : 0;

    // Cabin class
    features.economy_class = search.cabinClass === 'economy' ? 1 : 0;
    features.premium_class = search.cabinClass === 'premium' || search.cabinClass === 'business' || search.cabinClass === 'first' ? 1 : 0;

    // Flexibility
    features.is_flexible = search.isFlexibleDates ? 1 : 0;

    // === INTERACTION-BASED FEATURES ===
    if (interaction) {
      // Price sensitivity
      features.used_price_filter = interaction.usedPriceFilter ? 1 : 0;

      if (interaction.sortedBy) {
        features.sorted_by_price = interaction.sortedBy === 'price' ? 1 : 0;
        features.sorted_by_duration = interaction.sortedBy === 'duration' ? 1 : 0;
        features.sorted_by_best = interaction.sortedBy === 'best' ? 1 : 0;
      }

      // Click patterns (average price clicked)
      if (interaction.clickedFlights && interaction.clickedFlights.length > 0) {
        const avgPriceClicked =
          interaction.clickedFlights.reduce((sum, f) => sum + f.price, 0) / interaction.clickedFlights.length;

        // Normalize: < $300 = budget, $300-$600 = mid, > $600 = premium
        features.avg_price_clicked_normalized = Math.min(avgPriceClicked / 600, 1.5);
      }

      // Engagement level
      features.engagement_score = Math.min(interaction.timeSpent / 300, 1); // Normalize to 5 minutes

      // Device
      features.is_mobile = interaction.deviceType === 'mobile' ? 1 : 0;
      features.is_desktop = interaction.deviceType === 'desktop' ? 1 : 0;
    }

    return features;
  }

  /**
   * Calculate business traveler score
   */
  private calculateBusinessScore(features: { [key: string]: number }): number {
    let score = 0;

    // Strong business signals
    score += features.is_weekday_departure * 0.15;
    score += features.is_short_trip * 0.2;
    score += features.is_last_minute * 0.15;
    score += features.is_solo_traveler * 0.1;
    score += features.premium_class * 0.2;
    score += features.is_business_hours * 0.1;

    // Negative signals
    score -= features.has_children * 0.3;
    score -= features.is_long_trip * 0.1;
    score -= features.sorted_by_price * 0.15;

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Calculate leisure traveler score
   */
  private calculateLeisureScore(features: { [key: string]: number }): number {
    let score = 0;

    // Strong leisure signals
    score += features.is_weekend_departure * 0.15;
    score += features.is_long_trip * 0.2;
    score += features.is_advance_booking * 0.2;
    score += features.is_weekend_trip * 0.1;
    score += features.is_flexible * 0.15;
    score += features.economy_class * 0.1;

    // Negative signals
    score -= features.is_last_minute * 0.1;
    score -= features.is_short_trip * 0.15;
    score -= features.is_business_hours * 0.05;

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Calculate family traveler score
   */
  private calculateFamilyScore(features: { [key: string]: number }): number {
    let score = 0;

    // Strong family signals
    score += features.has_children * 0.4; // Strongest indicator
    score += features.is_group * 0.2;
    score += features.is_advance_booking * 0.15;
    score += features.is_weekend_departure * 0.1;
    score += features.is_medium_trip * 0.1;

    // Negative signals
    score -= features.is_solo_traveler * 0.5;
    score -= features.is_business_hours * 0.1;

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Calculate budget traveler score
   */
  private calculateBudgetScore(features: { [key: string]: number }): number {
    let score = 0;

    // Strong budget signals
    score += features.used_price_filter * 0.2;
    score += features.sorted_by_price * 0.25;
    score += features.is_flexible * 0.15;
    score += features.economy_class * 0.15;

    // Price-clicked behavior
    if (features.avg_price_clicked_normalized && features.avg_price_clicked_normalized < 0.5) {
      score += 0.2; // Clicking cheap flights
    }

    // Negative signals
    score -= features.premium_class * 0.3;
    score -= features.is_last_minute * 0.1;

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Generate personalized recommendations based on segment
   */
  private generateRecommendations(
    segment: UserSegment,
    features: { [key: string]: number }
  ): { fareClass: string; addOns: string[]; bundleType: string } {
    const recommendations = {
      fareClass: 'standard',
      addOns: [] as string[],
      bundleType: 'traveler',
    };

    switch (segment) {
      case 'business':
        recommendations.fareClass = features.premium_class > 0.5 ? 'flex' : 'standard';
        recommendations.addOns = ['extra-legroom', 'priority-boarding', 'lounge-access', 'wifi'];
        recommendations.bundleType = 'business-plus';
        break;

      case 'leisure':
        recommendations.fareClass = 'standard';
        recommendations.addOns = ['seat-selection', 'checked-bag', 'insurance'];
        recommendations.bundleType = 'vacation-pkg';
        break;

      case 'family':
        recommendations.fareClass = 'standard';
        recommendations.addOns = ['seats-together', 'checked-bags', 'insurance', 'priority-boarding'];
        recommendations.bundleType = 'family-pkg';
        break;

      case 'budget':
        recommendations.fareClass = features.sorted_by_price > 0.5 ? 'basic' : 'standard';
        recommendations.addOns = ['aisle-seat', 'checked-bag'];
        recommendations.bundleType = 'traveler';
        break;
    }

    return recommendations;
  }

  /**
   * Quick classification based on search params only (for immediate use)
   */
  async quickClassify(searchBehavior: SearchBehavior): Promise<UserSegment> {
    const result = await this.classifyUser(searchBehavior);
    return result.segment;
  }
}

// Singleton instance
export const userSegmentationEngine = new UserSegmentationEngine();
