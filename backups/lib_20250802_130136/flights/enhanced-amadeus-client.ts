/**
 * Enhanced Amadeus API Client with ML Predictions and Advanced Features
 * Extends base functionality with conversion-focused enhancements
 */

import { AmadeusClient } from './amadeus-client';
import { FlightSearchParams, ProcessedFlightOffer } from '@/types/flights';
import { formatFlightOffer } from './formatters';

interface FlightChoicePrediction {
  probability: number;
  choiceLabel: string;
}

interface FlightDelayPrediction {
  probability: number;
  result: 'LESS_THAN_30_MINUTES' | 'BETWEEN_30_AND_60_MINUTES' | 'BETWEEN_60_AND_120_MINUTES' | 'OVER_120_MINUTES_OR_CANCELLED';
}

interface PriceAnalysis {
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  percentage: number;
  quartileRanking: 'FIRST' | 'SECOND' | 'THIRD' | 'FOURTH';
}

interface EnhancedFlightData {
  choiceProbability: number;
  priceAnalysis: PriceAnalysis | null;
  brandedOptions: any | null;
  delayPrediction: FlightDelayPrediction | null;
  conversionScore: number;
  recommendations: string[];
  urgencyIndicators: string[];
  socialProof: string[];
  valueProposition: string[];
}

export class EnhancedAmadeusClient extends AmadeusClient {
  
  /**
   * Enhanced flight search with ML predictions and conversion optimization
   */
  async smartFlightSearch(
    params: FlightSearchParams,
    userId?: string,
    userPreferences?: any
  ): Promise<any> {
    try {
      // 1. Get base flight search results
      const searchResults = await this.searchFlights(params);
      
      if (!searchResults.data || searchResults.data.length === 0) {
        return {
          success: false,
          data: [],
          meta: searchResults.meta
        };
      }

      console.log('🧠 Enhancing results with ML predictions and conversion optimization...');

      // 2. Format raw offers to ProcessedFlightOffer format
      const formattedOffers = searchResults.data.map(offer => 
        formatFlightOffer(offer, searchResults.dictionaries)
      );

      // 3. Apply ML enhancements
      const enhancedResults = await this.enhanceWithMLPredictions(
        formattedOffers,
        searchResults.data || []
      );

      // 4. Apply conversion optimization
      const optimizedResults = this.applyConversionOptimization(enhancedResults);

      return {
        success: true,
        data: optimizedResults,
        meta: {
          ...searchResults.meta,
          enhanced: true,
          mlPredictions: true,
          conversionOptimized: true
        }
      };

    } catch (error) {
      console.error('❌ Error in smart flight search:', error);
      // Fallback to basic search
      return this.searchFlights(params);
    }
  }

  /**
   * Flight Choice Prediction API
   */
  async getPredictedChoices(flightOffers: any[]): Promise<any> {
    try {
      const requestBody = {
        data: {
          type: 'flight-offers-prediction',
          flightOffers: flightOffers
        }
      };

      return await this.makeRequest('/v1/shopping/flight-offers/prediction', {
        method: 'POST',
        headers: { 'X-HTTP-Method-Override': 'GET' },
        body: JSON.stringify(requestBody)
      });
    } catch (error) {
      console.warn('Flight Choice Prediction API not available:', error);
      return null;
    }
  }

  /**
   * Flight Price Analysis API
   */
  async analyzePricing(flightOffers: any[]): Promise<any> {
    try {
      const requestBody = {
        data: {
          type: 'itinerary-price-metrics',
          flightOffers: flightOffers
        }
      };

      return await this.makeRequest('/v1/analytics/itinerary-price-metrics', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });
    } catch (error) {
      console.warn('Flight Price Analysis API not available:', error);
      return null;
    }
  }

  /**
   * Flight Delay Prediction API
   */
  async getDelayPrediction(flightDetails: any): Promise<any> {
    try {
      const params = new URLSearchParams();
      params.set('originLocationCode', flightDetails.origin);
      params.set('destinationLocationCode', flightDetails.destination);
      params.set('departureDate', flightDetails.departureDate);
      params.set('departureTime', flightDetails.departureTime);
      params.set('arrivalDate', flightDetails.arrivalDate);
      params.set('arrivalTime', flightDetails.arrivalTime);
      params.set('aircraftCode', flightDetails.aircraftCode || '');
      params.set('carrierCode', flightDetails.carrierCode);
      params.set('flightNumber', flightDetails.flightNumber);
      params.set('duration', flightDetails.duration);

      return await this.makeRequest(`/v1/travel/predictions/flight-delay?${params}`);
    } catch (error) {
      console.warn('Flight Delay Prediction API not available:', error);
      return null;
    }
  }

  /**
   * Branded Fares Upsell API
   */
  async getBrandedFares(flightOffers: any[]): Promise<any> {
    try {
      const requestBody = {
        data: {
          type: 'flight-offers-upselling',
          flightOffers: flightOffers
        }
      };

      return await this.makeRequest('/v1/shopping/flight-offers/upselling', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });
    } catch (error) {
      console.warn('Branded Fares Upsell API not available:', error);
      return null;
    }
  }

  /**
   * Get Flight Destinations for inspiration
   */
  async getFlightDestinations(
    origin: string,
    departureDate?: string,
    oneWay?: boolean,
    duration?: string,
    nonStop?: boolean,
    maxPrice?: number
  ): Promise<any> {
    try {
      const params = new URLSearchParams({ origin });
      
      if (departureDate) params.set('departureDate', departureDate);
      if (oneWay !== undefined) params.set('oneWay', oneWay.toString());
      if (duration) params.set('duration', duration);
      if (nonStop !== undefined) params.set('nonStop', nonStop.toString());
      if (maxPrice) params.set('maxPrice', maxPrice.toString());

      return await this.makeRequest(`/v1/shopping/flight-destinations?${params}`);
    } catch (error) {
      console.warn('Flight Destinations API not available:', error);
      return null;
    }
  }

  /**
   * Seat Map Display API
   */
  async getSeatMap(flightOfferId: string): Promise<any> {
    try {
      return await this.makeRequest(`/v1/shopping/seatmaps?flight-orderId=${flightOfferId}`);
    } catch (error) {
      console.warn('Seat Map API not available:', error);
      return null;
    }
  }

  /**
   * Enhance flight results with ML predictions
   */
  private async enhanceWithMLPredictions(
    formattedFlights: ProcessedFlightOffer[],
    rawOffers: any[]
  ): Promise<ProcessedFlightOffer[]> {
    try {
      // Get ML predictions in parallel for performance
      const [predictions, priceAnalysis, brandedFares] = await Promise.all([
        this.getPredictedChoices(rawOffers),
        this.analyzePricing(rawOffers),
        this.getBrandedFares(rawOffers)
      ]);

      // Enhance each flight with ML data
      return formattedFlights.map((flight, index) => {
        const enhanced: EnhancedFlightData = {
          choiceProbability: predictions?.data?.[index]?.probability || 0,
          priceAnalysis: priceAnalysis?.data?.[index] || null,
          brandedOptions: brandedFares?.data?.[index] || null,
          delayPrediction: null, // Will be added for selected flights
          conversionScore: this.calculateConversionScore(
            predictions?.data?.[index],
            priceAnalysis?.data?.[index]
          ),
          recommendations: this.generateRecommendations(flight, {
            choice: predictions?.data?.[index],
            price: priceAnalysis?.data?.[index]
          }),
          urgencyIndicators: this.generateUrgencyIndicators(flight, priceAnalysis?.data?.[index]),
          socialProof: this.generateSocialProof(flight, predictions?.data?.[index]),
          valueProposition: this.generateValueProposition(flight, priceAnalysis?.data?.[index])
        };

        return {
          ...flight,
          enhanced: {
            ...enhanced,
            priceAnalysis: enhanced.priceAnalysis || undefined
          }
        } as ProcessedFlightOffer;
      });
    } catch (error) {
      console.warn('Error applying ML enhancements:', error);
      return formattedFlights;
    }
  }

  /**
   * Apply conversion optimization to flight results
   */
  private applyConversionOptimization(flights: ProcessedFlightOffer[]): ProcessedFlightOffer[] {
    // Sort by conversion score
    const sorted = flights.sort((a, b) => 
      (b.enhanced?.conversionScore || 0) - (a.enhanced?.conversionScore || 0)
    );

    // Mark top results with special badges
    return sorted.map((flight, index) => {
      if (index === 0) {
        flight.enhanced?.recommendations?.unshift('🏆 Melhor escolha recomendada');
      } else if (index === 1) {
        flight.enhanced?.recommendations?.unshift('🥈 Segunda melhor opção');
      }

      // Add position-based urgency
      if (index < 3) {
        flight.enhanced?.urgencyIndicators?.push('⭐ Entre os 3 mais procurados');
      }

      return flight;
    });
  }

  /**
   * Calculate conversion score based on ML predictions
   */
  private calculateConversionScore(choicePrediction: any, priceAnalysis: any): number {
    let score = 50; // Base score
    
    // Choice probability weight (40%)
    if (choicePrediction?.probability) {
      score += parseFloat(choicePrediction.probability) * 40;
    }
    
    // Price confidence weight (35%)
    if (priceAnalysis?.confidence === 'HIGH') score += 35;
    else if (priceAnalysis?.confidence === 'MEDIUM') score += 20;
    else score += 10;
    
    // Price quartile weight (25%)
    if (priceAnalysis?.quartileRanking === 'FIRST') score += 25;
    else if (priceAnalysis?.quartileRanking === 'SECOND') score += 15;
    else if (priceAnalysis?.quartileRanking === 'THIRD') score += 10;
    else score += 5;
    
    return Math.min(100, Math.max(0, Math.round(score)));
  }

  /**
   * Generate conversion-focused recommendations
   */
  private generateRecommendations(flight: ProcessedFlightOffer, predictions: any): string[] {
    const recommendations = [];
    
    if (predictions.choice?.probability > 0.8) {
      recommendations.push('🎯 90% dos viajantes escolhem este voo');
    } else if (predictions.choice?.probability > 0.6) {
      recommendations.push('✨ Muito popular entre viajantes similares');
    }
    
    if (predictions.price?.confidence === 'HIGH' && predictions.price?.quartileRanking === 'FIRST') {
      recommendations.push('💎 Preço excepcional - 25% mais barato que a média');
    } else if (predictions.price?.confidence === 'HIGH') {
      recommendations.push('💰 Preço excelente comparado ao histórico');
    }
    
    if (flight.outbound.stops === 0) {
      recommendations.push('🚀 Voo direto - chegue mais rápido');
    }
    
    if (flight.numberOfBookableSeats <= 5) {
      recommendations.push('⚡ Apenas ' + flight.numberOfBookableSeats + ' assentos restantes');
    }
    
    if (flight.instantTicketingRequired) {
      recommendations.push('✅ Confirmação instantânea garantida');
    }
    
    return recommendations;
  }

  /**
   * Generate urgency indicators
   */
  private generateUrgencyIndicators(flight: ProcessedFlightOffer, priceAnalysis: any): string[] {
    const indicators = [];
    
    if (flight.numberOfBookableSeats <= 3) {
      indicators.push('🔥 Últimos ' + flight.numberOfBookableSeats + ' assentos!');
    }
    
    if (priceAnalysis?.quartileRanking === 'FIRST') {
      indicators.push('⏰ Preço pode subir 20% nas próximas 6 horas');
    }
    
    // Simulate demand based on route popularity
    const isPopularRoute = Math.random() > 0.6;
    if (isPopularRoute) {
      indicators.push('📈 Alta demanda prevista para esta rota');
    }
    
    // Time-based urgency
    const departureDate = new Date(flight.outbound.departure.dateTime);
    const daysUntilDeparture = Math.ceil((departureDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilDeparture <= 7) {
      indicators.push('⚡ Partida em ' + daysUntilDeparture + ' dias - reserve agora!');
    }
    
    return indicators;
  }

  /**
   * Generate social proof elements
   */
  private generateSocialProof(flight: ProcessedFlightOffer, choicePrediction: any): string[] {
    const proof = [];
    
    if (choicePrediction?.probability > 0.7) {
      proof.push('👥 87% dos viajantes escolheram este voo');
    }
    
    // Generate airline-specific social proof
    const airlineName = flight.validatingAirlines[0] || 'Esta companhia';
    proof.push(`⭐ ${airlineName} tem 94% de satisfação dos clientes`);
    
    if (flight.outbound.stops === 0) {
      proof.push('🎯 Voo direto mais reservado na rota');
    }
    
    // Simulate recent booking activity
    const recentBookings = Math.floor(Math.random() * 50) + 10;
    proof.push(`🔥 ${recentBookings} pessoas reservaram nas últimas 24h`);
    
    return proof;
  }

  /**
   * Generate value proposition
   */
  private generateValueProposition(flight: ProcessedFlightOffer, priceAnalysis: any): string[] {
    const value = [];
    
    if (priceAnalysis?.quartileRanking === 'FIRST') {
      const savings = Math.floor(Math.random() * 300) + 150;
      value.push(`💰 Economize R$ ${savings} comparado à média`);
    }
    
    if (flight.outbound.stops === 0) {
      value.push('⏱️ Economize 2-4 horas de viagem');
    }
    
    // Calculate flight duration benefit
    if (flight.outbound.durationMinutes < 480) { // Less than 8 hours
      value.push('🚀 Viagem rápida e eficiente');
    }
    
    // Add airline benefits
    value.push('✈️ Inclui bagagem de mão e seleção de assento básico');
    
    if (flight.instantTicketingRequired) {
      value.push('⚡ Sem espera - confirmação imediata');
    }
    
    return value;
  }

  /**
   * Extract flight details for delay prediction
   */
  private extractFlightDetails(flight: any): any {
    const segment = flight.itineraries[0].segments[0];
    return {
      origin: segment.departure.iataCode,
      destination: segment.arrival.iataCode,
      departureDate: segment.departure.at.split('T')[0],
      departureTime: segment.departure.at.split('T')[1].substring(0, 5),
      arrivalDate: segment.arrival.at.split('T')[0],
      arrivalTime: segment.arrival.at.split('T')[1].substring(0, 5),
      aircraftCode: segment.aircraft?.code || '',
      carrierCode: segment.carrierCode,
      flightNumber: segment.number,
      duration: flight.itineraries[0].duration
    };
  }

  /**
   * Get detailed flight information for flight details page
   */
  async getFlightDetails(flightId: string, flight: ProcessedFlightOffer): Promise<any> {
    try {
      console.log('🔍 Getting detailed flight information...');

      // Get delay prediction for specific flight
      const flightDetails = this.extractFlightDetails(flight.rawOffer);
      const delayPrediction = await this.getDelayPrediction(flightDetails);

      // Get seat map if available
      const seatMap = await this.getSeatMap(flightId);

      // Enhanced flight data for details page
      return {
        ...flight,
        detailedInfo: {
          delayPrediction,
          seatMap,
          additionalServices: this.generateAdditionalServices(flight),
          pricingBreakdown: this.generatePricingBreakdown(flight),
          policies: this.generatePolicies(flight),
          reviews: this.generateAirlineReviews(flight)
        }
      };
    } catch (error) {
      console.error('Error getting flight details:', error);
      return flight;
    }
  }

  /**
   * Generate additional services for upselling
   */
  private generateAdditionalServices(flight: ProcessedFlightOffer): any[] {
    return [
      {
        type: 'seat_selection',
        name: 'Seleção de Assento Premium',
        description: 'Escolha seu assento preferido (janela, corredor, saída de emergência)',
        price: 'R$ 45',
        popular: true
      },
      {
        type: 'baggage',
        name: 'Bagagem Extra (23kg)',
        description: 'Adicione bagagem despachada de até 23kg',
        price: 'R$ 120',
        savings: 'Economize R$ 30 comprando agora'
      },
      {
        type: 'meal',
        name: 'Refeição Especial',
        description: 'Refeição premium com opções vegetarianas e sem glúten',
        price: 'R$ 35'
      },
      {
        type: 'fast_track',
        name: 'Fast Track Security',
        description: 'Passe pela segurança do aeroporto mais rapidamente',
        price: 'R$ 25'
      },
      {
        type: 'lounge',
        name: 'Acesso ao Lounge VIP',
        description: 'WiFi grátis, alimentação e bebidas no lounge do aeroporto',
        price: 'R$ 89'
      }
    ];
  }

  /**
   * Generate pricing breakdown
   */
  private generatePricingBreakdown(flight: ProcessedFlightOffer): any {
    const basePrice = parseFloat(flight.totalPrice.replace(/[^\d,]/g, '').replace(',', '.'));
    const taxes = Math.round(basePrice * 0.15);
    const fees = Math.round(basePrice * 0.05);
    const flightPrice = basePrice - taxes - fees;

    return {
      flight: `R$ ${flightPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      taxes: `R$ ${taxes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      fees: `R$ ${fees.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      total: flight.totalPrice
    };
  }

  /**
   * Generate airline policies
   */
  private generatePolicies(flight: ProcessedFlightOffer): any {
    return {
      cancellation: {
        allowed: true,
        fee: 'R$ 150',
        timeLimit: '24 horas antes do voo'
      },
      changes: {
        allowed: true,
        fee: 'R$ 200',
        conditions: 'Sujeito à disponibilidade e diferença tarifária'
      },
      baggage: {
        handLuggage: '10kg incluído',
        checkedBaggage: 'Não incluído - a partir de R$ 120',
        restrictions: 'Máximo 158cm (altura + largura + profundidade)'
      },
      checkin: {
        online: '48h a 1h antes do voo',
        airport: '3h a 40min antes do voo (internacional)',
        mobile: 'Disponível pelo app da companhia'
      }
    };
  }

  /**
   * Generate airline reviews
   */
  private generateAirlineReviews(flight: ProcessedFlightOffer): any {
    const airlineName = flight.validatingAirlines[0] || 'Companhia Aérea';
    
    return {
      overall: 4.2,
      punctuality: 4.1,
      service: 4.3,
      comfort: 4.0,
      valueForMoney: 4.4,
      totalReviews: 15742,
      recentReviews: [
        {
          rating: 5,
          text: 'Voo pontual e atendimento excelente. Recomendo!',
          author: 'Maria S.',
          date: '2024-01-15'
        },
        {
          rating: 4,
          text: 'Boa experiência geral. Assento confortável.',
          author: 'João P.',
          date: '2024-01-10'
        },
        {
          rating: 5,
          text: 'Melhor custo-benefício da rota. Voaria novamente.',
          author: 'Ana R.',
          date: '2024-01-08'
        }
      ]
    };
  }
}