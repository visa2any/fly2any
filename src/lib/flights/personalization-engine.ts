/**
 * 🧠 ENHANCED PERSONALIZATION ENGINE 2.0
 * AI-powered user behavior tracking and preference learning
 */

import { ProcessedFlightOffer } from '@/types/flights';

// User Behavior Tracking
export interface UserBehavior {
  userId?: string;
  sessionId: string;
  searches: SearchBehavior[];
  bookings: BookingBehavior[];
  preferences: UserPreferences;
  demographics: UserDemographics;
  travelProfile: TravelProfile;
  interactionHistory: InteractionEvent[];
  personalityProfile: PersonalityProfile;
  lastActive: Date;
  created: Date;
}

export interface SearchBehavior {
  timestamp: Date;
  origin: string;
  destination: string;
  departureDate: Date;
  returnDate?: Date;
  passengers: number;
  travelClass: string;
  filters: any;
  sortPreference: string;
  resultsViewed: number;
  timeSpent: number; // seconds
  clickedFlights: string[];
  comparedFlights: string[];
  abandonedAt?: 'search' | 'results' | 'details' | 'booking';
  conversionRate: number;
}

export interface BookingBehavior {
  timestamp: Date;
  flightId: string;
  route: string;
  price: number;
  travelClass: string;
  services: string[];
  paymentMethod: string;
  bookingTime: number; // seconds from search to booking
  satisfaction?: number; // 1-5 rating if provided
}

export interface UserPreferences {
  preferredAirlines: string[];
  avoidedAirlines: string[];
  seatPreferences: {
    position: 'window' | 'aisle' | 'middle' | 'any';
    location: 'front' | 'middle' | 'rear' | 'any';
    extraLegroom: boolean;
  };
  timePreferences: {
    departure: 'early' | 'morning' | 'afternoon' | 'evening' | 'night' | 'any';
    arrival: 'early' | 'morning' | 'afternoon' | 'evening' | 'night' | 'any';
  };
  pricePreferences: {
    maxPrice?: number;
    priceRange: 'budget' | 'economy' | 'premium' | 'luxury';
    flexibleDates: boolean;
    flexibleAirports: boolean;
  };
  servicePreferences: {
    meals: boolean;
    wifi: boolean;
    entertainment: boolean;
    lounge: boolean;
    fastTrack: boolean;
  };
  travelStyle: 'business' | 'leisure' | 'mixed';
  frequentRoutes: Array<{
    route: string;
    frequency: number;
    lastTraveled: Date;
  }>;
}

export interface UserDemographics {
  ageGroup: '18-24' | '25-34' | '35-44' | '45-54' | '55-64' | '65+';
  income: 'low' | 'medium' | 'high' | 'premium';
  location: {
    country: string;
    city: string;
    timezone: string;
  };
  travelFrequency: 'occasional' | 'regular' | 'frequent' | 'heavy';
  deviceType: 'mobile' | 'tablet' | 'desktop';
  language: string;
}

export interface TravelProfile {
  type: 'budget_traveler' | 'comfort_seeker' | 'time_optimizer' | 'luxury_traveler' | 'eco_conscious' | 'frequent_flyer';
  characteristics: string[];
  confidence: number; // 0-1
  lastUpdated: Date;
}

export interface InteractionEvent {
  timestamp: Date;
  type: 'search' | 'filter' | 'sort' | 'click' | 'compare' | 'bookmark' | 'share' | 'book' | 'abandon';
  target: string;
  duration?: number;
  metadata?: any;
}

export interface PersonalityProfile {
  decisionStyle: 'quick' | 'thorough' | 'analytical' | 'impulsive';
  riskTolerance: 'low' | 'medium' | 'high';
  pricesensitivity: 'low' | 'medium' | 'high';
  brandLoyalty: 'low' | 'medium' | 'high';
  innovationAdoption: 'early' | 'mainstream' | 'late';
  socialInfluence: 'low' | 'medium' | 'high';
}

// Personalization Recommendations
export interface PersonalizationRecommendation {
  type: 'flight' | 'filter' | 'sort' | 'service' | 'timing' | 'route' | 'price';
  priority: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  reasoning: string;
  action: string;
  metadata: any;
}

export interface PersonalizedExperience {
  userId: string;
  recommendations: PersonalizationRecommendation[];
  dynamicUI: {
    primaryCTA: string;
    featuredServices: string[];
    hiddenFeatures: string[];
    colorScheme?: 'blue' | 'green' | 'purple' | 'premium';
  };
  messaging: {
    welcomeMessage: string;
    urgencyMessages: string[];
    valuePropositions: string[];
  };
  searchDefaults: {
    sortBy: string;
    filters: any;
    resultsPerPage: number;
  };
}

class PersonalizationEngine {
  private static instance: PersonalizationEngine;
  private userBehaviors: Map<string, UserBehavior> = new Map();

  static getInstance(): PersonalizationEngine {
    if (!PersonalizationEngine.instance) {
      PersonalizationEngine.instance = new PersonalizationEngine();
    }
    return PersonalizationEngine.instance;
  }

  // Track user behavior
  trackSearchBehavior(sessionId: string, behavior: Omit<SearchBehavior, 'timestamp'>) {
    const user = this.getUserBehavior(sessionId);
    const searchBehavior: SearchBehavior = {
      ...behavior,
      timestamp: new Date()
    };
    
    user.searches.push(searchBehavior);
    user.lastActive = new Date();
    
    // Update preferences based on search behavior
    this.updatePreferencesFromSearch(user, searchBehavior);
    
    // Update travel profile
    this.updateTravelProfile(user);
    
    this.saveUserBehavior(sessionId, user);
  }

  trackBookingBehavior(sessionId: string, behavior: Omit<BookingBehavior, 'timestamp'>) {
    const user = this.getUserBehavior(sessionId);
    const bookingBehavior: BookingBehavior = {
      ...behavior,
      timestamp: new Date()
    };
    
    user.bookings.push(bookingBehavior);
    user.lastActive = new Date();
    
    // Update preferences based on booking behavior
    this.updatePreferencesFromBooking(user, bookingBehavior);
    
    this.saveUserBehavior(sessionId, user);
  }

  trackInteraction(sessionId: string, event: Omit<InteractionEvent, 'timestamp'>) {
    const user = this.getUserBehavior(sessionId);
    const interactionEvent: InteractionEvent = {
      ...event,
      timestamp: new Date()
    };
    
    user.interactionHistory.push(interactionEvent);
    user.lastActive = new Date();
    
    // Keep only last 100 interactions to prevent memory bloat
    if (user.interactionHistory.length > 100) {
      user.interactionHistory = user.interactionHistory.slice(-100);
    }
    
    this.saveUserBehavior(sessionId, user);
  }

  // Generate personalized recommendations
  generateRecommendations(sessionId: string, flights: ProcessedFlightOffer[]): PersonalizationRecommendation[] {
    const user = this.getUserBehavior(sessionId);
    const recommendations: PersonalizationRecommendation[] = [];

    // Flight recommendations based on user preferences
    recommendations.push(...this.generateFlightRecommendations(user, flights));
    
    // Filter recommendations
    recommendations.push(...this.generateFilterRecommendations(user));
    
    // Service recommendations
    recommendations.push(...this.generateServiceRecommendations(user));
    
    // Timing recommendations
    recommendations.push(...this.generateTimingRecommendations(user));
    
    // Price recommendations
    recommendations.push(...this.generatePriceRecommendations(user));

    return recommendations.sort((a, b) => {
      // Sort by priority and confidence
      const priorityWeight = { critical: 4, high: 3, medium: 2, low: 1 };
      const scoreA = priorityWeight[a.priority] * a.confidence;
      const scoreB = priorityWeight[b.priority] * b.confidence;
      return scoreB - scoreA;
    });
  }

  // Generate personalized experience
  generatePersonalizedExperience(sessionId: string): PersonalizedExperience {
    const user = this.getUserBehavior(sessionId);
    const recommendations = this.generateRecommendations(sessionId, []);

    return {
      userId: sessionId,
      recommendations,
      dynamicUI: this.generateDynamicUI(user),
      messaging: this.generatePersonalizedMessaging(user),
      searchDefaults: this.generateSearchDefaults(user)
    };
  }

  // Rank flights based on user preferences
  rankFlights(sessionId: string, flights: ProcessedFlightOffer[]): ProcessedFlightOffer[] {
    const user = this.getUserBehavior(sessionId);
    
    return flights.map(flight => ({
      ...flight,
      personalizedScore: this.calculatePersonalizedScore(user, flight)
    })).sort((a, b) => (b.personalizedScore || 0) - (a.personalizedScore || 0));
  }

  // Private helper methods
  private getUserBehavior(sessionId: string): UserBehavior {
    if (!this.userBehaviors.has(sessionId)) {
      const newUser: UserBehavior = {
        sessionId,
        searches: [],
        bookings: [],
        preferences: this.getDefaultPreferences(),
        demographics: this.getDefaultDemographics(),
        travelProfile: {
          type: 'budget_traveler',
          characteristics: [],
          confidence: 0.1,
          lastUpdated: new Date()
        },
        interactionHistory: [],
        personalityProfile: {
          decisionStyle: 'thorough',
          riskTolerance: 'medium',
          pricesensitivity: 'medium',
          brandLoyalty: 'medium',
          innovationAdoption: 'mainstream',
          socialInfluence: 'medium'
        },
        lastActive: new Date(),
        created: new Date()
      };
      this.userBehaviors.set(sessionId, newUser);
    }
    return this.userBehaviors.get(sessionId)!;
  }

  private saveUserBehavior(sessionId: string, user: UserBehavior) {
    this.userBehaviors.set(sessionId, user);
    
    // Persist to localStorage for web clients
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`user_behavior_${sessionId}`, JSON.stringify(user));
      } catch (error) {
        console.error('Failed to save user behavior:', error);
      }
    }
  }

  private updatePreferencesFromSearch(user: UserBehavior, search: SearchBehavior) {
    // Update preferred travel class based on searches
    const classSearches = user.searches.filter(s => s.travelClass === search.travelClass).length;
    if (classSearches >= 3) {
      // User consistently searches for this class
      user.preferences.pricePreferences.priceRange = this.mapTravelClassToPriceRange(search.travelClass);
    }

    // Update time preferences
    const hour = search.departureDate.getHours();
    const timeOfDay = this.getTimeOfDay(hour);
    if (!user.preferences.timePreferences.departure || user.preferences.timePreferences.departure === 'any') {
      user.preferences.timePreferences.departure = timeOfDay;
    }

    // Update route frequency
    const route = `${search.origin}-${search.destination}`;
    const existingRoute = user.preferences.frequentRoutes.find(r => r.route === route);
    if (existingRoute) {
      existingRoute.frequency++;
      existingRoute.lastTraveled = new Date();
    } else {
      user.preferences.frequentRoutes.push({
        route,
        frequency: 1,
        lastTraveled: new Date()
      });
    }
  }

  private updatePreferencesFromBooking(user: UserBehavior, booking: BookingBehavior) {
    // Extract airline from booking (simplified)
    const airline = booking.flightId.substring(0, 2); // Assume first 2 chars are airline code
    
    if (!user.preferences.preferredAirlines.includes(airline)) {
      user.preferences.preferredAirlines.push(airline);
    }

    // Update service preferences based on booked services
    booking.services.forEach(service => {
      switch (service) {
        case 'meals':
          user.preferences.servicePreferences.meals = true;
          break;
        case 'wifi':
          user.preferences.servicePreferences.wifi = true;
          break;
        case 'lounge':
          user.preferences.servicePreferences.lounge = true;
          break;
        case 'fastTrack':
          user.preferences.servicePreferences.fastTrack = true;
          break;
      }
    });
  }

  private updateTravelProfile(user: UserBehavior) {
    const searches = user.searches;
    const bookings = user.bookings;
    
    if (searches.length < 3) return; // Need more data

    // Analyze behavior patterns
    const avgPrice = searches.reduce((sum, s) => sum + (s.clickedFlights.length * 300), 0) / searches.length;
    const avgTimeSpent = searches.reduce((sum, s) => sum + s.timeSpent, 0) / searches.length;
    const conversionRate = bookings.length / searches.length;

    let newType: TravelProfile['type'];
    const confidence = 0.7;

    if (avgPrice < 200) {
      newType = 'budget_traveler';
    } else if (avgPrice > 800) {
      newType = 'luxury_traveler';
    } else if (avgTimeSpent > 600) { // More than 10 minutes
      newType = 'comfort_seeker';
    } else if (conversionRate > 0.8) {
      newType = 'time_optimizer';
    } else {
      newType = 'comfort_seeker';
    }

    user.travelProfile = {
      type: newType,
      characteristics: this.getTravelProfileCharacteristics(newType),
      confidence,
      lastUpdated: new Date()
    };
  }

  private generateFlightRecommendations(user: UserBehavior, flights: ProcessedFlightOffer[]): PersonalizationRecommendation[] {
    const recommendations: PersonalizationRecommendation[] = [];

    // Recommend flights based on preferred airlines
    if (user.preferences.preferredAirlines.length > 0) {
      const preferredFlights = flights.filter(f => 
        user.preferences.preferredAirlines.some(airline => 
          f.validatingAirlines?.includes(airline)
        )
      );

      if (preferredFlights.length > 0) {
        recommendations.push({
          type: 'flight',
          priority: 'high',
          confidence: 0.8,
          reasoning: `Based on your previous bookings with ${user.preferences.preferredAirlines.join(', ')}`,
          action: `highlight_preferred_airlines`,
          metadata: { flights: preferredFlights.slice(0, 3) }
        });
      }
    }

    return recommendations;
  }

  private generateFilterRecommendations(user: UserBehavior): PersonalizationRecommendation[] {
    const recommendations: PersonalizationRecommendation[] = [];
    const recentSearches = user.searches.slice(-5);

    // Analyze common filters
    const commonFilters = this.analyzeCommonFilters(recentSearches);
    
    Object.entries(commonFilters).forEach(([filterType, frequency]) => {
      if (frequency >= 0.6) { // Used in 60%+ of searches
        recommendations.push({
          type: 'filter',
          priority: 'medium',
          confidence: frequency,
          reasoning: `You frequently use ${filterType} filters`,
          action: `auto_apply_${filterType}`,
          metadata: { filterType }
        });
      }
    });

    return recommendations;
  }

  private generateServiceRecommendations(user: UserBehavior): PersonalizationRecommendation[] {
    const recommendations: PersonalizationRecommendation[] = [];

    // Recommend services based on travel profile
    switch (user.travelProfile.type) {
      case 'luxury_traveler':
        recommendations.push({
          type: 'service',
          priority: 'high',
          confidence: 0.9,
          reasoning: 'Based on your luxury travel preferences',
          action: 'highlight_premium_services',
          metadata: { services: ['lounge', 'premium_seats', 'wifi'] }
        });
        break;
      case 'time_optimizer':
        recommendations.push({
          type: 'service',
          priority: 'medium',
          confidence: 0.7,
          reasoning: 'Perfect for business travelers',
          action: 'highlight_business_services',
          metadata: { services: ['wifi', 'fast_track', 'premium_seats'] }
        });
        break;
    }

    return recommendations;
  }

  private generateTimingRecommendations(user: UserBehavior): PersonalizationRecommendation[] {
    const recommendations: PersonalizationRecommendation[] = [];
    
    if (user.preferences.timePreferences.departure !== 'any') {
      recommendations.push({
        type: 'timing',
        priority: 'medium',
        confidence: 0.6,
        reasoning: `You prefer ${user.preferences.timePreferences.departure} departures`,
        action: 'filter_by_departure_time',
        metadata: { timePreference: user.preferences.timePreferences.departure }
      });
    }

    return recommendations;
  }

  private generatePriceRecommendations(user: UserBehavior): PersonalizationRecommendation[] {
    const recommendations: PersonalizationRecommendation[] = [];
    
    if (user.travelProfile.type === 'budget_traveler') {
      recommendations.push({
        type: 'price',
        priority: 'high',
        confidence: 0.8,
        reasoning: 'Great deals for budget-conscious travelers',
        action: 'highlight_budget_options',
        metadata: { maxPrice: user.preferences.pricePreferences.maxPrice }
      });
    }

    return recommendations;
  }

  private calculatePersonalizedScore(user: UserBehavior, flight: ProcessedFlightOffer): number {
    let score = 0;
    
    // Base score from price (inverse relationship)
    const priceScore = Math.max(0, 100 - (parseInt(flight.totalPrice.replace(/\D/g, '')) / 10));
    score += priceScore * 0.3;

    // Airline preference bonus
    if (user.preferences.preferredAirlines.some(airline => 
        flight.validatingAirlines?.includes(airline))) {
      score += 30;
    }

    // Time preference bonus
    const departureHour = new Date(flight.outbound.departure.dateTime).getHours();
    const timeOfDay = this.getTimeOfDay(departureHour);
    if (user.preferences.timePreferences.departure === timeOfDay) {
      score += 20;
    }

    // Travel profile bonus
    switch (user.travelProfile.type) {
      case 'budget_traveler':
        score += (priceScore > 70) ? 25 : 0;
        break;
      case 'time_optimizer':
        score += (flight.outbound.stops === 0) ? 25 : 0;
        break;
      case 'comfort_seeker':
        score += (flight.cabinAnalysis.detectedClass !== 'ECONOMY') ? 25 : 0;
        break;
    }

    return Math.min(100, score);
  }

  private generateDynamicUI(user: UserBehavior) {
    const baseUI = {
      primaryCTA: 'Search Flights',
      featuredServices: ['baggage', 'seats'],
      hiddenFeatures: [] as string[],
      colorScheme: 'blue' as const
    };

    switch (user.travelProfile.type) {
      case 'luxury_traveler':
        return {
          ...baseUI,
          primaryCTA: 'Find Premium Flights',
          featuredServices: ['lounge', 'premium_seats', 'concierge'],
          colorScheme: 'premium' as const
        };
      case 'budget_traveler':
        return {
          ...baseUI,
          primaryCTA: 'Find Best Deals',
          featuredServices: ['price_alerts', 'flexible_dates'],
          colorScheme: 'green' as const
        };
      default:
        return baseUI;
    }
  }

  private generatePersonalizedMessaging(user: UserBehavior) {
    const baseMessaging = {
      welcomeMessage: 'Welcome back! Ready to find your perfect flight?',
      urgencyMessages: ['Limited seats available at this price!'],
      valuePropositions: ['Best price guarantee', 'Free cancellation']
    };

    switch (user.travelProfile.type) {
      case 'luxury_traveler':
        return {
          welcomeMessage: 'Welcome to premium travel experiences',
          urgencyMessages: ['Exclusive premium seats selling fast'],
          valuePropositions: ['VIP treatment', 'Luxury amenities', 'Priority everything']
        };
      case 'budget_traveler':
        return {
          welcomeMessage: 'Find amazing deals on flights',
          urgencyMessages: ['This deal expires soon!'],
          valuePropositions: ['Lowest price guarantee', 'No hidden fees', 'Smart savings']
        };
      default:
        return baseMessaging;
    }
  }

  private generateSearchDefaults(user: UserBehavior) {
    return {
      sortBy: user.travelProfile.type === 'budget_traveler' ? 'price' : 'best',
      filters: this.getPersonalizedFilters(user),
      resultsPerPage: user.personalityProfile.decisionStyle === 'quick' ? 5 : 10
    };
  }

  // Utility methods
  private getDefaultPreferences(): UserPreferences {
    return {
      preferredAirlines: [],
      avoidedAirlines: [],
      seatPreferences: {
        position: 'any',
        location: 'any',
        extraLegroom: false
      },
      timePreferences: {
        departure: 'any',
        arrival: 'any'
      },
      pricePreferences: {
        priceRange: 'economy',
        flexibleDates: false,
        flexibleAirports: false
      },
      servicePreferences: {
        meals: false,
        wifi: false,
        entertainment: false,
        lounge: false,
        fastTrack: false
      },
      travelStyle: 'leisure',
      frequentRoutes: []
    };
  }

  private getDefaultDemographics(): UserDemographics {
    return {
      ageGroup: '25-34',
      income: 'medium',
      location: {
        country: 'US',
        city: 'Unknown',
        timezone: 'America/New_York'
      },
      travelFrequency: 'occasional',
      deviceType: 'desktop',
      language: 'en'
    };
  }

  private mapTravelClassToPriceRange(travelClass: string): UserPreferences['pricePreferences']['priceRange'] {
    switch (travelClass) {
      case 'FIRST': return 'luxury';
      case 'BUSINESS': return 'premium';
      case 'PREMIUM_ECONOMY': return 'economy';
      default: return 'budget';
    }
  }

  private getTimeOfDay(hour: number): 'early' | 'morning' | 'afternoon' | 'evening' | 'night' {
    if (hour < 6) return 'early';
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    if (hour < 21) return 'evening';
    return 'night';
  }

  private getTravelProfileCharacteristics(type: TravelProfile['type']): string[] {
    const characteristics = {
      budget_traveler: ['price-conscious', 'flexible', 'value-seeking'],
      comfort_seeker: ['convenience-focused', 'quality-conscious', 'experience-oriented'],
      time_optimizer: ['efficiency-focused', 'direct-flights', 'minimal-layovers'],
      luxury_traveler: ['premium-services', 'comfort-priority', 'exclusive-experiences'],
      eco_conscious: ['sustainability-focused', 'carbon-offset', 'environmental-impact'],
      frequent_flyer: ['loyalty-program', 'status-benefits', 'routine-traveler']
    };
    return characteristics[type] || [];
  }

  private analyzeCommonFilters(searches: SearchBehavior[]): Record<string, number> {
    const filterUsage: Record<string, number> = {};
    
    searches.forEach(search => {
      Object.keys(search.filters || {}).forEach(filterType => {
        filterUsage[filterType] = (filterUsage[filterType] || 0) + 1;
      });
    });

    // Convert to frequencies
    Object.keys(filterUsage).forEach(filterType => {
      filterUsage[filterType] = filterUsage[filterType] / searches.length;
    });

    return filterUsage;
  }

  private getPersonalizedFilters(user: UserBehavior): any {
    const filters: any = {};

    // Apply preferred airlines filter
    if (user.preferences.preferredAirlines.length > 0) {
      filters.airlines = user.preferences.preferredAirlines;
    }

    // Apply time preference filters
    if (user.preferences.timePreferences.departure !== 'any') {
      filters.departureTime = user.preferences.timePreferences.departure;
    }

    return filters;
  }
}

// Export singleton instance
export const personalizationEngine = PersonalizationEngine.getInstance();

// Utility functions for React components
export const usePersonalization = (sessionId: string) => {
  return {
    trackSearch: (behavior: Omit<SearchBehavior, 'timestamp'>) => 
      personalizationEngine.trackSearchBehavior(sessionId, behavior),
    
    trackBooking: (behavior: Omit<BookingBehavior, 'timestamp'>) => 
      personalizationEngine.trackBookingBehavior(sessionId, behavior),
    
    trackInteraction: (event: Omit<InteractionEvent, 'timestamp'>) => 
      personalizationEngine.trackInteraction(sessionId, event),
    
    getRecommendations: (flights: ProcessedFlightOffer[]) => 
      personalizationEngine.generateRecommendations(sessionId, flights),
    
    getPersonalizedExperience: () => 
      personalizationEngine.generatePersonalizedExperience(sessionId),
    
    rankFlights: (flights: ProcessedFlightOffer[]) => 
      personalizationEngine.rankFlights(sessionId, flights)
  };
};