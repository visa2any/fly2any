/**
 * AI-Powered Flight Recommendation Engine
 * Uses Amadeus ML APIs and advanced algorithms for personalized suggestions
 */

import { EnhancedAmadeusClient } from './enhanced-amadeus-client';
import { ProcessedFlightOffer, FlightSearchParams } from '@/types/flights';

interface UserProfile {
  id: string;
  preferences: UserPreferences;
  bookingHistory: BookingHistoryItem[];
  searchHistory: SearchHistoryItem[];
  demographics: UserDemographics;
  behaviorMetrics: BehaviorMetrics;
}

interface UserPreferences {
  priceRange: { min: number; max: number };
  preferredAirlines: string[];
  preferredCabinClass: string[];
  maxLayovers: number;
  preferredDepartureTime: string[];
  seatPreferences: string[];
  mealPreferences: string[];
  specialNeeds: string[];
}

interface BookingHistoryItem {
  flightOffer: ProcessedFlightOffer;
  bookingDate: Date;
  tripPurpose: 'business' | 'leisure' | 'emergency';
  satisfaction: number; // 1-5 rating
  actualPrice: number;
}

interface SearchHistoryItem {
  searchParams: FlightSearchParams;
  searchDate: Date;
  resultsViewed: number;
  timeSpent: number; // seconds
  converted: boolean;
}

interface UserDemographics {
  ageRange: string;
  location: string;
  travelFrequency: 'occasional' | 'frequent' | 'very_frequent';
  businessTraveler: boolean;
}

interface BehaviorMetrics {
  pricesensitivity: number; // 0-1 scale
  loyaltyToAirlines: number; // 0-1 scale
  planningHorizon: number; // average days between search and travel
  conversionRate: number; // percentage of searches that convert
  averageBookingValue: number;
}

interface RecommendationResult {
  flights: EnhancedFlightRecommendation[];
  insights: PersonalizedInsights;
  alternatives: AlternativeRecommendation[];
  upsells: UpsellRecommendation[];
}

interface EnhancedFlightRecommendation {
  flight: ProcessedFlightOffer;
  score: number;
  reasons: string[];
  personalizedTags: string[];
  confidenceLevel: number;
  potentialSatisfaction: number;
  recommendationType: 'best_value' | 'fastest' | 'most_convenient' | 'premium' | 'eco_friendly';
}

interface PersonalizedInsights {
  priceInsights: string[];
  timingInsights: string[];
  routeInsights: string[];
  serviceInsights: string[];
  behaviorInsights: string[];
}

interface AlternativeRecommendation {
  type: 'dates' | 'airports' | 'routes';
  suggestion: string;
  potentialSavings: number;
  convenience: number;
  description: string;
}

interface UpsellRecommendation {
  service: string;
  description: string;
  price: number;
  value: string;
  likelihood: number;
  reasoning: string[];
}

export class IntelligentRecommendationEngine {
  private amadeusClient: EnhancedAmadeusClient;
  private userProfiles: Map<string, UserProfile> = new Map();

  constructor() {
    this.amadeusClient = new EnhancedAmadeusClient();
  }

  /**
   * Generate personalized flight recommendations
   */
  async generateRecommendations(
    searchParams: FlightSearchParams,
    flights: ProcessedFlightOffer[],
    userId?: string
  ): Promise<RecommendationResult> {
    console.log('🤖 Generating AI-powered flight recommendations...');

    // Get or create user profile
    const userProfile = userId ? await this.getUserProfile(userId) : this.createGuestProfile(searchParams);

    // Apply ML-powered flight scoring
    const scoredFlights = await this.scoreFlights(flights, userProfile, searchParams);

    // Generate personalized insights
    const insights = this.generatePersonalizedInsights(flights, userProfile, searchParams);

    // Find alternative options
    const alternatives = await this.findAlternatives(searchParams, userProfile);

    // Generate upsell recommendations
    const upsells = this.generateUpsellRecommendations(scoredFlights[0], userProfile);

    return {
      flights: scoredFlights,
      insights,
      alternatives,
      upsells
    };
  }

  /**
   * Score flights based on user preferences and ML predictions
   */
  private async scoreFlights(
    flights: ProcessedFlightOffer[],
    userProfile: UserProfile,
    searchParams: FlightSearchParams
  ): Promise<EnhancedFlightRecommendation[]> {
    const recommendations: EnhancedFlightRecommendation[] = [];

    for (const flight of flights) {
      const score = await this.calculateFlightScore(flight, userProfile, searchParams);
      const reasons = this.generateRecommendationReasons(flight, userProfile, score);
      const personalizedTags = this.generatePersonalizedTags(flight, userProfile);
      const recommendationType = this.determineRecommendationType(flight, userProfile, score);
      
      recommendations.push({
        flight,
        score: score.total,
        reasons,
        personalizedTags,
        confidenceLevel: score.confidence,
        potentialSatisfaction: score.satisfaction,
        recommendationType
      });
    }

    // Sort by score and return top recommendations
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }

  /**
   * Calculate comprehensive flight score
   */
  private async calculateFlightScore(
    flight: ProcessedFlightOffer,
    userProfile: UserProfile,
    searchParams: FlightSearchParams
  ): Promise<{ total: number; confidence: number; satisfaction: number; breakdown: any }> {
    const scores = {
      price: 0,
      convenience: 0,
      quality: 0,
      personal: 0,
      ml: 0
    };

    // 1. Price Score (30% weight)
    scores.price = this.calculatePriceScore(flight, userProfile);

    // 2. Convenience Score (25% weight)
    scores.convenience = this.calculateConvenienceScore(flight, userProfile, searchParams);

    // 3. Quality Score (20% weight)
    scores.quality = this.calculateQualityScore(flight, userProfile);

    // 4. Personal Preference Score (15% weight)
    scores.personal = this.calculatePersonalScore(flight, userProfile);

    // 5. ML Prediction Score (10% weight)
    scores.ml = this.calculateMLScore(flight);

    // Calculate weighted total
    const total = (
      scores.price * 0.30 +
      scores.convenience * 0.25 +
      scores.quality * 0.20 +
      scores.personal * 0.15 +
      scores.ml * 0.10
    );

    // Calculate confidence based on data quality
    const confidence = this.calculateConfidence(flight, userProfile);

    // Predict user satisfaction
    const satisfaction = this.predictSatisfaction(flight, userProfile, scores);

    return {
      total: Math.round(total),
      confidence,
      satisfaction,
      breakdown: scores
    };
  }

  /**
   * Calculate price score based on user's price sensitivity
   */
  private calculatePriceScore(flight: ProcessedFlightOffer, userProfile: UserProfile): number {
    const price = parseFloat(flight.totalPrice.replace(/[^\\d,]/g, '').replace(',', '.'));
    const { min, max } = userProfile.preferences.priceRange;
    
    // Base score on price position within user's range
    let score = 0;
    if (price <= min) {
      score = 100; // Below minimum = great value
    } else if (price >= max) {
      score = 20; // Above maximum = poor value
    } else {
      // Linear scale within range
      score = 100 - ((price - min) / (max - min)) * 80;
    }

    // Adjust for price sensitivity
    const sensitivity = userProfile.behaviorMetrics.pricesensitivity;
    if (sensitivity > 0.7) {
      // High price sensitivity - penalize expensive options more
      score *= (2 - sensitivity);
    }

    // Bonus for ML price analysis
    if (flight.enhanced?.priceAnalysis) {
      if (flight.enhanced.priceAnalysis.quartileRanking === 'FIRST') {
        score += 15;
      } else if (flight.enhanced.priceAnalysis.quartileRanking === 'SECOND') {
        score += 10;
      }
    }

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Calculate convenience score
   */
  private calculateConvenienceScore(
    flight: ProcessedFlightOffer,
    userProfile: UserProfile,
    searchParams: FlightSearchParams
  ): number {
    let score = 50; // Base score

    // Direct flights bonus
    if (flight.outbound.stops === 0) {
      score += 30;
    } else if (flight.outbound.stops === 1) {
      score += 10;
    } else {
      score -= 20;
    }

    // Flight duration
    const duration = flight.outbound.durationMinutes;
    if (duration < 120) score += 20;
    else if (duration < 300) score += 10;
    else if (duration > 600) score -= 15;

    // Departure time preferences
    const depTime = flight.outbound.departure.time;
    const hour = parseInt(depTime.split(':')[0]);
    
    if (userProfile.preferences.preferredDepartureTime.includes('morning') && hour >= 6 && hour < 12) {
      score += 15;
    } else if (userProfile.preferences.preferredDepartureTime.includes('afternoon') && hour >= 12 && hour < 18) {
      score += 15;
    } else if (userProfile.preferences.preferredDepartureTime.includes('evening') && hour >= 18) {
      score += 15;
    }

    // Airline preferences
    if (userProfile.preferences.preferredAirlines.includes(flight.validatingAirlines[0])) {
      score += 20;
    }

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Calculate quality score based on airline ratings and service
   */
  private calculateQualityScore(flight: ProcessedFlightOffer, userProfile: UserProfile): number {
    let score = 60; // Base score

    // Airline reputation (simulated data)
    const airlineRatings: { [key: string]: number } = {
      'LATAM Airlines': 85,
      'GOL Linhas Aéreas': 75,
      'Azul Linhas Aéreas': 80,
      'American Airlines': 78,
      'Delta Air Lines': 82,
      'United Airlines': 76
    };

    const airline = flight.validatingAirlines[0];
    const rating = airlineRatings[airline] || 70;
    score += (rating - 70) * 0.5;

    // Aircraft type (newer is better)
    if (flight.outbound.segments[0].aircraft.name?.includes('A350') || 
        flight.outbound.segments[0].aircraft.name?.includes('787')) {
      score += 15;
    }

    // Instant ticketing
    if (flight.instantTicketingRequired) {
      score += 10;
    }

    // Seat availability
    if (flight.numberOfBookableSeats > 9) {
      score += 5;
    } else if (flight.numberOfBookableSeats <= 3) {
      score -= 10;
    }

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Calculate personal preference score
   */
  private calculatePersonalScore(flight: ProcessedFlightOffer, userProfile: UserProfile): number {
    let score = 50;

    // Cabin class preference
    const preferredClasses = userProfile.preferences.preferredCabinClass;
    if (preferredClasses.includes(flight.outbound.segments[0].cabin)) {
      score += 25;
    }

    // Historical satisfaction with similar flights
    const similarFlights = userProfile.bookingHistory.filter(booking => 
      booking.flightOffer.validatingAirlines[0] === flight.validatingAirlines[0]
    );
    
    if (similarFlights.length > 0) {
      const avgSatisfaction = similarFlights.reduce((sum, booking) => sum + booking.satisfaction, 0) / similarFlights.length;
      score += (avgSatisfaction - 3) * 10; // Adjust based on past satisfaction
    }

    // Business traveler preferences
    if (userProfile.demographics.businessTraveler) {
      // Prefer morning flights and shorter connections
      const hour = parseInt(flight.outbound.departure.time.split(':')[0]);
      if (hour >= 6 && hour <= 9) score += 15;
      if (flight.outbound.stops === 0) score += 20;
    }

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Calculate ML-based score
   */
  private calculateMLScore(flight: ProcessedFlightOffer): number {
    let score = 50;

    if (flight.enhanced) {
      // Choice probability from ML
      if (flight.enhanced.choiceProbability) {
        score += flight.enhanced.choiceProbability * 50;
      }

      // Conversion score
      if (flight.enhanced.conversionScore) {
        score += flight.enhanced.conversionScore * 0.3;
      }
    }

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Generate recommendation reasons
   */
  private generateRecommendationReasons(
    flight: ProcessedFlightOffer,
    userProfile: UserProfile,
    score: any
  ): string[] {
    const reasons = [];

    // Price reasons
    if (score.breakdown.price > 80) {
      reasons.push('Excelente custo-benefício para seu orçamento');
    }

    // Convenience reasons
    if (flight.outbound.stops === 0) {
      reasons.push('Voo direto - economize tempo');
    }

    // Personal reasons
    if (userProfile.preferences.preferredAirlines.includes(flight.validatingAirlines[0])) {
      reasons.push('Sua companhia aérea preferida');
    }

    // ML insights
    if (flight.enhanced?.recommendations) {
      reasons.push(...flight.enhanced.recommendations.slice(0, 2));
    }

    // Historical reasons
    const pastBookings = userProfile.bookingHistory.filter(b => 
      b.flightOffer.validatingAirlines[0] === flight.validatingAirlines[0]
    );
    if (pastBookings.length > 0) {
      const avgSatisfaction = pastBookings.reduce((sum, b) => sum + b.satisfaction, 0) / pastBookings.length;
      if (avgSatisfaction >= 4) {
        reasons.push('Baseado em suas experiências positivas anteriores');
      }
    }

    return reasons.slice(0, 4); // Limit to top 4 reasons
  }

  /**
   * Generate personalized tags
   */
  private generatePersonalizedTags(flight: ProcessedFlightOffer, userProfile: UserProfile): string[] {
    const tags = [];

    if (userProfile.demographics.businessTraveler) {
      if (flight.outbound.stops === 0) tags.push('Ideal para Negócios');
      if (flight.instantTicketingRequired) tags.push('Confirmação Rápida');
    }

    if (userProfile.behaviorMetrics.pricesensitivity > 0.7) {
      if (flight.enhanced?.priceAnalysis?.quartileRanking === 'FIRST') {
        tags.push('Melhor Preço');
      }
    }

    if (userProfile.preferences.maxLayovers === 0 && flight.outbound.stops === 0) {
      tags.push('Sem Conexões');
    }

    return tags;
  }

  /**
   * Determine recommendation type
   */
  private determineRecommendationType(
    flight: ProcessedFlightOffer,
    userProfile: UserProfile,
    score: any
  ): 'best_value' | 'fastest' | 'most_convenient' | 'premium' | 'eco_friendly' {
    if (score.breakdown.price > 85) return 'best_value';
    if (flight.outbound.stops === 0 && flight.outbound.durationMinutes < 180) return 'fastest';
    if (score.breakdown.convenience > 85) return 'most_convenient';
    if (flight.outbound.segments[0].cabin === 'BUSINESS' || flight.outbound.segments[0].cabin === 'FIRST') return 'premium';
    return 'best_value';
  }

  /**
   * Generate personalized insights
   */
  private generatePersonalizedInsights(
    flights: ProcessedFlightOffer[],
    userProfile: UserProfile,
    searchParams: FlightSearchParams
  ): PersonalizedInsights {
    const insights: PersonalizedInsights = {
      priceInsights: [],
      timingInsights: [],
      routeInsights: [],
      serviceInsights: [],
      behaviorInsights: []
    };

    // Price insights
    const prices = flights.map(f => parseFloat(f.totalPrice.replace(/[^\\d,]/g, '').replace(',', '.')));
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    insights.priceInsights.push(`Preços variam de R$ ${minPrice.toLocaleString()} a R$ ${maxPrice.toLocaleString()}`);
    
    if (userProfile.behaviorMetrics.averageBookingValue > avgPrice * 1.2) {
      insights.priceInsights.push('Estes preços estão abaixo do seu orçamento usual');
    }

    // Timing insights
    const departureDate = new Date(searchParams.departureDate);
    const daysAhead = Math.ceil((departureDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    
    if (daysAhead < 14) {
      insights.timingInsights.push('Reserva de última hora - preços podem estar elevados');
    } else if (daysAhead > 60) {
      insights.timingInsights.push('Reserva antecipada - ótima janela para melhores preços');
    }

    // Route insights
    const directFlights = flights.filter(f => f.outbound.stops === 0);
    if (directFlights.length > 0) {
      insights.routeInsights.push(`${directFlights.length} voos diretos disponíveis`);
    }

    // Service insights
    const premiumOptions = flights.filter(f => 
      f.outbound.segments[0].cabin === 'BUSINESS' || f.outbound.segments[0].cabin === 'FIRST'
    );
    if (premiumOptions.length > 0 && userProfile.behaviorMetrics.averageBookingValue > avgPrice * 1.5) {
      insights.serviceInsights.push('Opções premium disponíveis dentro do seu perfil');
    }

    // Behavior insights
    if (userProfile.behaviorMetrics.conversionRate < 0.3) {
      insights.behaviorInsights.push('Considere usar alertas de preço para acompanhar variações');
    }

    return insights;
  }

  /**
   * Find alternative recommendations
   */
  private async findAlternatives(
    searchParams: FlightSearchParams,
    userProfile: UserProfile
  ): Promise<AlternativeRecommendation[]> {
    const alternatives: AlternativeRecommendation[] = [];

    // Date alternatives
    const departureDate = new Date(searchParams.departureDate);
    const dayBefore = new Date(departureDate.getTime() - 24 * 60 * 60 * 1000);
    const dayAfter = new Date(departureDate.getTime() + 24 * 60 * 60 * 1000);

    alternatives.push({
      type: 'dates',
      suggestion: `Considere ${dayBefore.toLocaleDateString()} ou ${dayAfter.toLocaleDateString()}`,
      potentialSavings: 150,
      convenience: 0.8,
      description: 'Datas flexíveis podem economizar até R$ 150'
    });

    // Airport alternatives
    if (searchParams.originLocationCode === 'GRU') {
      alternatives.push({
        type: 'airports',
        suggestion: 'Aeroporto de Congonhas (CGH)',
        potentialSavings: 200,
        convenience: 0.9,
        description: 'Aeroporto mais próximo do centro com possível economia'
      });
    }

    return alternatives;
  }

  /**
   * Generate upsell recommendations
   */
  private generateUpsellRecommendations(
    flight: EnhancedFlightRecommendation,
    userProfile: UserProfile
  ): UpsellRecommendation[] {
    const upsells: UpsellRecommendation[] = [];

    // Seat selection
    if (!userProfile.preferences.seatPreferences.includes('any')) {
      upsells.push({
        service: 'Seleção de Assento Premium',
        description: 'Escolha seu assento preferido com espaço extra',
        price: 45,
        value: 'Conforto garantido',
        likelihood: 0.7,
        reasoning: ['Baseado em suas preferências de conforto']
      });
    }

    // Baggage
    if (userProfile.demographics.travelFrequency !== 'occasional') {
      upsells.push({
        service: 'Bagagem Extra',
        description: 'Adicione 23kg de bagagem despachada',
        price: 120,
        value: 'Economize R$ 30 vs. no aeroporto',
        likelihood: 0.6,
        reasoning: ['Viajantes frequentes geralmente precisam de mais bagagem']
      });
    }

    // Lounge access for business travelers
    if (userProfile.demographics.businessTraveler) {
      upsells.push({
        service: 'Acesso ao Lounge VIP',
        description: 'WiFi grátis, alimentação e área de descanso',
        price: 89,
        value: 'Produtividade em viagens',
        likelihood: 0.8,
        reasoning: ['Ideal para viajantes a negócios', 'WiFi rápido para trabalho']
      });
    }

    return upsells.sort((a, b) => b.likelihood - a.likelihood);
  }

  /**
   * Helper methods
   */
  private calculateConfidence(flight: ProcessedFlightOffer, userProfile: UserProfile): number {
    let confidence = 0.7; // Base confidence

    // More data = higher confidence
    if (userProfile.bookingHistory.length > 5) confidence += 0.1;
    if (userProfile.searchHistory.length > 10) confidence += 0.1;

    // ML data availability
    if (flight.enhanced?.choiceProbability) confidence += 0.1;

    return Math.min(0.95, confidence);
  }

  private predictSatisfaction(flight: ProcessedFlightOffer, userProfile: UserProfile, scores: any): number {
    // Weighted average of scores, adjusted for user behavior
    const satisfaction = (
      scores.price * 0.3 +
      scores.convenience * 0.25 +
      scores.quality * 0.25 +
      scores.personal * 0.2
    ) / 100 * 5; // Convert to 1-5 scale

    return Math.min(5, Math.max(1, satisfaction));
  }

  private async getUserProfile(userId: string): Promise<UserProfile> {
    // In real implementation, load from database
    if (this.userProfiles.has(userId)) {
      return this.userProfiles.get(userId)!;
    }

    // Create default profile
    return this.createDefaultProfile(userId);
  }

  private createGuestProfile(searchParams: FlightSearchParams): UserProfile {
    return this.createDefaultProfile('guest');
  }

  private createDefaultProfile(userId: string): UserProfile {
    return {
      id: userId,
      preferences: {
        priceRange: { min: 300, max: 2000 },
        preferredAirlines: [],
        preferredCabinClass: ['ECONOMY'],
        maxLayovers: 2,
        preferredDepartureTime: ['morning', 'afternoon'],
        seatPreferences: ['window'],
        mealPreferences: [],
        specialNeeds: []
      },
      bookingHistory: [],
      searchHistory: [],
      demographics: {
        ageRange: '25-45',
        location: 'BR',
        travelFrequency: 'occasional',
        businessTraveler: false
      },
      behaviorMetrics: {
        pricesensitivity: 0.7,
        loyaltyToAirlines: 0.3,
        planningHorizon: 30,
        conversionRate: 0.15,
        averageBookingValue: 800
      }
    };
  }
}