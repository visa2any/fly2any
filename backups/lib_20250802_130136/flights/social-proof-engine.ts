/**
 * Advanced Social Proof and Trust Building Engine
 * Creates dynamic trust signals and social validation for flight bookings
 */

import { ProcessedFlightOffer } from '@/types/flights';

interface SocialProofData {
  bookingActivity: BookingActivity[];
  reviews: Review[];
  trustSignals: TrustSignal[];
  userStats: UserStatistics;
  realTimeActivity: RealTimeActivity[];
}

interface BookingActivity {
  location: string;
  timeAgo: string;
  route: string;
  airline: string;
  savings?: number;
  anonymous: boolean;
}

interface Review {
  id: string;
  rating: number;
  title: string;
  content: string;
  author: string;
  date: Date;
  verified: boolean;
  route?: string;
  airline?: string;
  helpful: number;
  tags: string[];
}

interface TrustSignal {
  type: 'security' | 'guarantee' | 'certification' | 'partnership' | 'awards';
  title: string;
  description: string;
  icon: string;
  prominence: 'high' | 'medium' | 'low';
  verificationUrl?: string;
}

interface UserStatistics {
  totalBookings: number;
  activeTravelers: number;
  countriesServed: number;
  averageSavings: number;
  satisfactionRate: number;
  repeatCustomers: number;
}

interface RealTimeActivity {
  type: 'booking' | 'search' | 'view' | 'comparison';
  description: string;
  timestamp: Date;
  urgency: 'low' | 'medium' | 'high';
  location?: string;
}

interface SocialProofConfig {
  enabled: boolean;
  updateInterval: number; // milliseconds
  maxActivities: number;
  showLocation: boolean;
  anonymizeUsers: boolean;
}

export class SocialProofEngine {
  private config: SocialProofConfig = {
    enabled: true,
    updateInterval: 30000, // 30 seconds
    maxActivities: 50,
    showLocation: true,
    anonymizeUsers: true
  };

  private bookingActivities: BookingActivity[] = [];
  private realTimeActivities: RealTimeActivity[] = [];
  private reviews: Review[] = [];
  private trustSignals: TrustSignal[] = [];
  private userStats: UserStatistics;

  constructor() {
    this.initializeSocialProof();
    this.userStats = this.initializeUserStats();
  }

  /**
   * Generate comprehensive social proof for flight offers
   */
  generateSocialProof(flight: ProcessedFlightOffer): SocialProofData {
    return {
      bookingActivity: this.getRelevantBookingActivity(flight),
      reviews: this.getRelevantReviews(flight),
      trustSignals: this.trustSignals,
      userStats: this.userStats,
      realTimeActivity: this.getRealTimeActivity(flight)
    };
  }

  /**
   * Get booking activity relevant to the flight
   */
  private getRelevantBookingActivity(flight: ProcessedFlightOffer): BookingActivity[] {
    const route = `${flight.outbound.departure.iataCode}-${flight.outbound.arrival.iataCode}`;
    const airline = flight.validatingAirlines[0];

    // Filter activities for same route or airline
    return this.bookingActivities
      .filter(activity => 
        activity.route === route || 
        activity.airline === airline ||
        this.isSimilarRoute(activity.route, route)
      )
      .slice(0, 5);
  }

  /**
   * Get reviews relevant to the flight
   */
  private getRelevantReviews(flight: ProcessedFlightOffer): Review[] {
    const airline = flight.validatingAirlines[0];
    const route = `${flight.outbound.departure.iataCode}-${flight.outbound.arrival.iataCode}`;

    return this.reviews
      .filter(review => 
        review.airline === airline ||
        review.route === route ||
        review.tags.some(tag => this.isRelevantTag(tag, flight))
      )
      .sort((a, b) => b.helpful - a.helpful)
      .slice(0, 3);
  }

  /**
   * Get real-time activity for urgency
   */
  private getRealTimeActivity(flight: ProcessedFlightOffer): RealTimeActivity[] {
    const route = `${flight.outbound.departure.iataCode}-${flight.outbound.arrival.iataCode}`;
    
    return this.realTimeActivities
      .filter(activity => 
        activity.description.includes(route) ||
        activity.description.includes(flight.validatingAirlines[0])
      )
      .slice(0, 3);
  }

  /**
   * Generate dynamic booking activity
   */
  generateBookingActivity(): void {
    const locations = [
      'São Paulo, SP', 'Rio de Janeiro, RJ', 'Belo Horizonte, MG',
      'Salvador, BA', 'Brasília, DF', 'Fortaleza, CE', 'Recife, PE',
      'Porto Alegre, RS', 'Curitiba, PR', 'Goiânia, GO'
    ];

    const routes = [
      'GRU-MIA', 'GIG-LAX', 'BSB-JFK', 'GRU-LHR', 'GRU-CDG',
      'GRU-FCO', 'GIG-LIS', 'GRU-MAD', 'SSA-LIS', 'FOR-LIS'
    ];

    const airlines = [
      'LATAM Airlines', 'GOL Linhas Aéreas', 'Azul Linhas Aéreas',
      'American Airlines', 'Delta Air Lines', 'Air France'
    ];

    const timeAgoOptions = [
      'há 2 minutos', 'há 5 minutos', 'há 8 minutos', 'há 12 minutos',
      'há 15 minutos', 'há 18 minutos', 'há 25 minutos', 'há 30 minutos'
    ];

    // Generate random activities
    for (let i = 0; i < 20; i++) {
      const activity: BookingActivity = {
        location: locations[Math.floor(Math.random() * locations.length)],
        timeAgo: timeAgoOptions[Math.floor(Math.random() * timeAgoOptions.length)],
        route: routes[Math.floor(Math.random() * routes.length)],
        airline: airlines[Math.floor(Math.random() * airlines.length)],
        savings: Math.random() > 0.6 ? Math.floor(Math.random() * 500) + 100 : undefined,
        anonymous: this.config.anonymizeUsers
      };

      this.bookingActivities.push(activity);
    }

    // Keep only recent activities
    this.bookingActivities = this.bookingActivities.slice(-this.config.maxActivities);
  }

  /**
   * Generate real-time activity notifications
   */
  generateRealTimeActivity(): void {
    const activities = [
      {
        type: 'booking' as const,
        description: '3 pessoas reservaram este voo nas últimas 2 horas',
        urgency: 'high' as const
      },
      {
        type: 'search' as const,
        description: '15 pessoas estão vendo esta rota agora',
        urgency: 'medium' as const
      },
      {
        type: 'view' as const,
        description: 'Visto por 45 pessoas hoje',
        urgency: 'low' as const
      },
      {
        type: 'comparison' as const,
        description: 'Preço 18% menor que concorrentes',
        urgency: 'high' as const
      }
    ];

    activities.forEach(activity => {
      this.realTimeActivities.push({
        ...activity,
        timestamp: new Date(),
        location: this.getRandomLocation()
      });
    });

    // Keep only recent activities
    this.realTimeActivities = this.realTimeActivities
      .filter(activity => 
        Date.now() - activity.timestamp.getTime() < 3600000 // 1 hour
      )
      .slice(-20);
  }

  /**
   * Initialize trust signals
   */
  private initializeTrustSignals(): void {
    this.trustSignals = [
      {
        type: 'security',
        title: 'Pagamento 100% Seguro',
        description: 'Certificação SSL 256-bit e PCI DSS Level 1',
        icon: '🔒',
        prominence: 'high',
        verificationUrl: 'https://ssl.certificado.br'
      },
      {
        type: 'guarantee',
        title: 'Garantia de Melhor Preço',
        description: 'Se encontrar mais barato, devolvemos a diferença + 10%',
        icon: '💰',
        prominence: 'high'
      },
      {
        type: 'certification',
        title: 'Certificado IATA',
        description: 'Membro oficial da International Air Transport Association',
        icon: '✈️',
        prominence: 'medium',
        verificationUrl: 'https://iata.org/verify'
      },
      {
        type: 'partnership',
        title: 'Parceiro Oficial Amadeus',
        description: 'Tecnologia líder mundial em reservas de viagem',
        icon: '🤝',
        prominence: 'medium'
      },
      {
        type: 'awards',
        title: 'Prêmio Melhor Atendimento 2024',
        description: 'Reconhecido pelos usuários como melhor suporte',
        icon: '🏆',
        prominence: 'low'
      },
      {
        type: 'guarantee',
        title: 'Cancelamento Grátis 24h',
        description: 'Cancele sem custo até 24h após a reserva',
        icon: '🔄',
        prominence: 'high'
      }
    ];
  }

  /**
   * Initialize sample reviews
   */
  private initializeReviews(): void {
    this.reviews = [
      {
        id: '1',
        rating: 5,
        title: 'Experiência excepcional!',
        content: 'Encontrei o melhor preço e o atendimento foi impecável. Recomendo!',
        author: 'Marina S.',
        date: new Date('2024-01-15'),
        verified: true,
        airline: 'LATAM Airlines',
        helpful: 23,
        tags: ['preco', 'atendimento', 'confianca']
      },
      {
        id: '2',
        rating: 5,
        title: 'Processo super fácil',
        content: 'Reservei em 5 minutos e recebi a confirmação na hora. Muito prático!',
        author: 'Carlos M.',
        date: new Date('2024-01-12'),
        verified: true,
        route: 'GRU-MIA',
        helpful: 18,
        tags: ['facilidade', 'rapidez', 'confirmacao']
      },
      {
        id: '3',
        rating: 4,
        title: 'Boa variedade de opções',
        content: 'Consegui comparar várias companhias e escolher a melhor para minha viagem.',
        author: 'Ana P.',
        date: new Date('2024-01-10'),
        verified: true,
        helpful: 15,
        tags: ['opcoes', 'comparacao', 'escolha']
      },
      {
        id: '4',
        rating: 5,
        title: 'Economizei muito!',
        content: 'Price $300 cheaper than other sites. Excellent!',
        author: 'Roberto F.',
        date: new Date('2024-01-08'),
        verified: true,
        airline: 'GOL Linhas Aéreas',
        helpful: 31,
        tags: ['economia', 'preco', 'vantagem']
      },
      {
        id: '5',
        rating: 5,
        title: 'Suporte excepcional',
        content: 'Tive um problema com horário e resolveram super rápido via WhatsApp.',
        author: 'Juliana L.',
        date: new Date('2024-01-05'),
        verified: true,
        helpful: 12,
        tags: ['suporte', 'whatsapp', 'problema']
      }
    ];
  }

  /**
   * Initialize user statistics
   */
  private initializeUserStats(): UserStatistics {
    return {
      totalBookings: 247856,
      activeTravelers: 15642,
      countriesServed: 89,
      averageSavings: 320,
      satisfactionRate: 97.2,
      repeatCustomers: 68.5
    };
  }

  /**
   * Generate urgency messages
   */
  generateUrgencyMessages(flight: ProcessedFlightOffer): string[] {
    const messages = [];

    // Seat availability
    if (flight.numberOfBookableSeats <= 5) {
      messages.push(`⚠️ Apenas ${flight.numberOfBookableSeats} assentos restantes neste voo!`);
    }

    // Time-based urgency
    const departureDate = new Date(flight.outbound.departure.dateTime);
    const daysUntilDeparture = Math.ceil((departureDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilDeparture <= 7) {
      messages.push('🔥 Partida em menos de 1 semana - reserve agora!');
    } else if (daysUntilDeparture <= 14) {
      messages.push('⏰ Últimas duas semanas para garantir este preço');
    }

    // Price-based urgency
    if (flight.enhanced?.priceAnalysis?.quartileRanking === 'FIRST') {
      messages.push('💎 Preço entre os 25% melhores da rota - não perca!');
    }

    // Recent activity
    const recentBookings = Math.floor(Math.random() * 10) + 3;
    messages.push(`🔥 ${recentBookings} pessoas reservaram este voo nas últimas 6 horas`);

    return messages.slice(0, 2); // Limit to 2 messages to avoid overwhelming
  }

  /**
   * Generate trust badges for display
   */
  getTrustBadges(): TrustSignal[] {
    return this.trustSignals
      .filter(signal => signal.prominence === 'high')
      .slice(0, 4);
  }

  /**
   * Generate customer testimonials widget
   */
  getTestimonialWidget(): Review[] {
    return this.reviews
      .filter(review => review.rating >= 4)
      .sort((a, b) => b.helpful - a.helpful)
      .slice(0, 3);
  }

  /**
   * Generate live activity feed
   */
  getLiveActivityFeed(): string[] {
    const activities = [];

    // Recent bookings
    const recentBookings = this.bookingActivities.slice(0, 3);
    recentBookings.forEach(booking => {
      if (booking.savings) {
        activities.push(
          `💰 ${this.anonymizeName()} from ${booking.location} saved $${booking.savings} ${booking.timeAgo}`
        );
      } else {
        activities.push(
          `✈️ ${this.anonymizeName()} de ${booking.location} reservou ${booking.route} ${booking.timeAgo}`
        );
      }
    });

    // Real-time stats
    activities.push(`👥 ${Math.floor(Math.random() * 50) + 20} pessoas vendo voos para este destino agora`);
    
    return activities.slice(0, 4);
  }

  /**
   * Start real-time updates
   */
  startRealTimeUpdates(): void {
    setInterval(() => {
      this.generateBookingActivity();
      this.generateRealTimeActivity();
      this.updateUserStats();
    }, this.config.updateInterval);

    console.log('🔄 Social proof real-time updates started');
  }

  /**
   * Helper methods
   */
  private initializeSocialProof(): void {
    this.generateBookingActivity();
    this.generateRealTimeActivity();
    this.initializeTrustSignals();
    this.initializeReviews();
    this.startRealTimeUpdates();
  }

  private isSimilarRoute(route1: string, route2: string): boolean {
    const [origin1, dest1] = route1.split('-');
    const [origin2, dest2] = route2.split('-');
    
    // Same origin or destination
    return origin1 === origin2 || dest1 === dest2;
  }

  private isRelevantTag(tag: string, flight: ProcessedFlightOffer): boolean {
    const relevantTags = ['preco', 'atendimento', 'facilidade', 'economia', 'confianca'];
    return relevantTags.includes(tag);
  }

  private getRandomLocation(): string {
    const locations = [
      'São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Salvador',
      'Brasília', 'Fortaleza', 'Recife', 'Porto Alegre'
    ];
    return locations[Math.floor(Math.random() * locations.length)];
  }

  private anonymizeName(): string {
    const firstNames = ['Ana', 'Carlos', 'Maria', 'João', 'Juliana', 'Roberto', 'Marina', 'Paulo'];
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastInitial = String.fromCharCode(65 + Math.floor(Math.random() * 26)); // A-Z
    return `${firstName} ${lastInitial}.`;
  }

  private updateUserStats(): void {
    // Simulate real-time stat updates
    this.userStats.activeTravelers = Math.floor(Math.random() * 1000) + 15000;
    this.userStats.totalBookings += Math.floor(Math.random() * 5) + 1;
  }

  /**
   * Generate conversion-focused social proof messages
   */
  generateConversionMessages(flight: ProcessedFlightOffer): string[] {
    const messages = [];

    // Price validation
    if (flight.enhanced?.priceAnalysis?.confidence === 'HIGH') {
      messages.push('✅ Preço validado por nossa IA como excelente oportunidade');
    }

    // Social validation
    const popularity = Math.floor(Math.random() * 40) + 60; // 60-100%
    messages.push(`👥 ${popularity}% dos viajantes escolheram esta opção para a rota`);

    // Urgency with social proof
    const viewersCount = Math.floor(Math.random() * 20) + 10;
    messages.push(`👀 ${viewersCount} pessoas estão vendo este voo agora`);

    // Success stories
    messages.push('🌟 Mais de 15.000 viajantes satisfeitos este mês');

    return messages;
  }

  /**
   * Get social proof metrics for analytics
   */
  getMetrics() {
    return {
      totalActivities: this.bookingActivities.length,
      realTimeActivities: this.realTimeActivities.length,
      reviewsCount: this.reviews.length,
      averageRating: this.reviews.reduce((sum, r) => sum + r.rating, 0) / this.reviews.length,
      trustSignalsCount: this.trustSignals.length,
      userStats: this.userStats
    };
  }
}