/**
 * Advanced Persuasion and Urgency Engine
 * Implements psychological triggers and conversion optimization techniques
 */

import { ProcessedFlightOffer, FlightSearchParams } from '@/types/flights';

interface PersuasionTrigger {
  type: 'scarcity' | 'urgency' | 'social_proof' | 'authority' | 'reciprocity' | 'commitment' | 'liking';
  message: string;
  intensity: 'low' | 'medium' | 'high' | 'critical';
  timing: 'immediate' | 'delayed' | 'contextual';
  visualStyle: 'banner' | 'badge' | 'popup' | 'inline' | 'notification';
  duration?: number; // seconds for timed messages
  conditions?: PersuasionCondition[];
}

interface PersuasionCondition {
  type: 'time_on_page' | 'scroll_depth' | 'mouse_movement' | 'idle_time' | 'page_visits';
  threshold: number;
  comparison: 'greater_than' | 'less_than' | 'equal_to';
}

interface UrgencyContext {
  departureInDays: number;
  bookableSeats: number;
  priceVolatility: 'low' | 'medium' | 'high';
  demandLevel: 'low' | 'medium' | 'high';
  competitivePosition: 'cheapest' | 'competitive' | 'expensive';
  userBehavior: UserBehaviorData;
}

interface UserBehaviorData {
  timeOnPage: number;
  pagesViewed: number;
  previousVisits: number;
  searchHistory: number;
  priceComparisons: number;
  isReturningUser: boolean;
  deviceType: 'mobile' | 'tablet' | 'desktop';
}

interface PersuasionStrategy {
  primary: PersuasionTrigger[];
  secondary: PersuasionTrigger[];
  exitIntent: PersuasionTrigger[];
  retargeting: PersuasionTrigger[];
}

interface CountdownTimer {
  endTime: Date;
  reason: string;
  type: 'price_lock' | 'seat_hold' | 'special_offer' | 'booking_deadline';
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
}

export class AdvancedPersuasionEngine {
  private activeTimers: Map<string, CountdownTimer> = new Map();
  private userSessions: Map<string, UserBehaviorData> = new Map();
  private conversionFunnelData: Map<string, any> = new Map();

  /**
   * Generate comprehensive persuasion strategy for a flight offer
   */
  generatePersuasionStrategy(
    flight: ProcessedFlightOffer,
    searchParams: FlightSearchParams,
    userBehavior: UserBehaviorData,
    userId?: string
  ): PersuasionStrategy {
    console.log('🧠 Generating advanced persuasion strategy...');

    const urgencyContext = this.analyzeUrgencyContext(flight, searchParams, userBehavior);
    
    return {
      primary: this.generatePrimaryTriggers(flight, urgencyContext),
      secondary: this.generateSecondaryTriggers(flight, urgencyContext),
      exitIntent: this.generateExitIntentTriggers(flight, urgencyContext),
      retargeting: this.generateRetargetingTriggers(flight, urgencyContext)
    };
  }

  /**
   * Generate primary persuasion triggers (immediately visible)
   */
  private generatePrimaryTriggers(flight: ProcessedFlightOffer, context: UrgencyContext): PersuasionTrigger[] {
    const triggers: PersuasionTrigger[] = [];

    // 1. Scarcity - Limited seats
    if (context.bookableSeats <= 5) {
      triggers.push({
        type: 'scarcity',
        message: `⚠️ Apenas ${context.bookableSeats} assentos restantes neste voo!`,
        intensity: context.bookableSeats <= 2 ? 'critical' : 'high',
        timing: 'immediate',
        visualStyle: 'banner'
      });
    }

    // 2. Price urgency
    if (flight.enhanced?.priceAnalysis?.quartileRanking === 'FIRST') {
      triggers.push({
        type: 'urgency',
        message: '💎 Preço entre os 25% melhores - pode subir a qualquer momento!',
        intensity: 'high',
        timing: 'immediate',
        visualStyle: 'badge'
      });
    }

    // 3. Time-based urgency
    if (context.departureInDays <= 14) {
      triggers.push({
        type: 'urgency',
        message: `🔥 Partida em ${context.departureInDays} dias - preços sobem próximo à data!`,
        intensity: context.departureInDays <= 7 ? 'critical' : 'high',
        timing: 'immediate',
        visualStyle: 'inline'
      });
    }

    // 4. Social proof - Recent bookings
    const recentBookings = Math.floor(Math.random() * 15) + 5;
    triggers.push({
      type: 'social_proof',
      message: `👥 ${recentBookings} pessoas reservaram este voo nas últimas 24h`,
      intensity: 'medium',
      timing: 'immediate',
      visualStyle: 'inline'
    });

    // 5. Authority - AI recommendation
    if (flight.enhanced?.conversionScore && flight.enhanced.conversionScore > 80) {
      triggers.push({
        type: 'authority',
        message: '🤖 Nossa IA recomenda este voo baseado em dados de milhões de viajantes',
        intensity: 'medium',
        timing: 'immediate',
        visualStyle: 'badge'
      });
    }

    return triggers;
  }

  /**
   * Generate secondary triggers (contextual)
   */
  private generateSecondaryTriggers(flight: ProcessedFlightOffer, context: UrgencyContext): PersuasionTrigger[] {
    const triggers: PersuasionTrigger[] = [];

    // 1. Price volatility warning
    if (context.priceVolatility === 'high') {
      triggers.push({
        type: 'urgency',
        message: '📈 Preços desta rota variam frequentemente - garante já o seu!',
        intensity: 'medium',
        timing: 'contextual',
        visualStyle: 'notification',
        conditions: [{ type: 'time_on_page', threshold: 30, comparison: 'greater_than' }]
      });
    }

    // 2. Competitive positioning
    if (context.competitivePosition === 'cheapest') {
      triggers.push({
        type: 'authority',
        message: '🏆 Melhor preço encontrado para esta rota em 30+ sites',
        intensity: 'high',
        timing: 'contextual',
        visualStyle: 'badge',
        conditions: [{ type: 'scroll_depth', threshold: 50, comparison: 'greater_than' }]
      });
    }

    // 3. User behavior based triggers
    if (context.userBehavior.priceComparisons > 3) {
      triggers.push({
        type: 'reciprocity',
        message: '💝 As a thank you for your search, we guarantee the best price + $50 discount',
        intensity: 'high',
        timing: 'delayed',
        visualStyle: 'popup',
        duration: 10,
        conditions: [{ type: 'time_on_page', threshold: 120, comparison: 'greater_than' }]
      });
    }

    // 4. Mobile-specific urgency
    if (context.userBehavior.deviceType === 'mobile') {
      triggers.push({
        type: 'urgency',
        message: '📱 Reserve em 30 segundos direto do seu celular - sem complicação!',
        intensity: 'medium',
        timing: 'contextual',
        visualStyle: 'banner',
        conditions: [{ type: 'idle_time', threshold: 45, comparison: 'greater_than' }]
      });
    }

    return triggers;
  }

  /**
   * Generate exit intent triggers
   */
  private generateExitIntentTriggers(flight: ProcessedFlightOffer, context: UrgencyContext): PersuasionTrigger[] {
    const triggers: PersuasionTrigger[] = [];

    // 1. Last chance offer
    triggers.push({
      type: 'scarcity',
      message: '⏰ Espera! Este preço pode não estar disponível quando você voltar.',
      intensity: 'critical',
      timing: 'immediate',
      visualStyle: 'popup'
    });

    // 2. Price hold offer
    triggers.push({
      type: 'commitment',
      message: '🔒 Segure este preço por 15 minutos grátis enquanto decide!',
      intensity: 'high',
      timing: 'immediate',
      visualStyle: 'popup'
    });

    // 3. Email alert signup
    triggers.push({
      type: 'reciprocity',
      message: '📧 Deixe seu email e te avisamos se o preço baixar ainda mais!',
      intensity: 'medium',
      timing: 'immediate',
      visualStyle: 'popup'
    });

    return triggers;
  }

  /**
   * Generate retargeting triggers
   */
  private generateRetargetingTriggers(flight: ProcessedFlightOffer, context: UrgencyContext): PersuasionTrigger[] {
    return [
      {
        type: 'urgency',
        message: 'The flight you were viewing went up $150 - there is still time to secure the previous price!',
        intensity: 'critical',
        timing: 'immediate',
        visualStyle: 'notification'
      },
      {
        type: 'scarcity',
        message: 'Restam apenas 2 assentos no voo que você pesquisou - não perca!',
        intensity: 'critical',
        timing: 'immediate',
        visualStyle: 'banner'
      }
    ];
  }

  /**
   * Create dynamic countdown timers
   */
  createCountdownTimer(
    flight: ProcessedFlightOffer,
    type: CountdownTimer['type'],
    durationMinutes: number = 15
  ): string {
    const timerId = `timer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const endTime = new Date(Date.now() + durationMinutes * 60 * 1000);
    
    let reason = '';
    let urgencyLevel: CountdownTimer['urgencyLevel'] = 'medium';

    switch (type) {
      case 'price_lock':
        reason = 'Preço garantido até';
        urgencyLevel = 'high';
        break;
      case 'seat_hold':
        reason = 'Assento reservado até';
        urgencyLevel = 'critical';
        break;
      case 'special_offer':
        reason = 'Oferta especial válida até';
        urgencyLevel = 'high';
        break;
      case 'booking_deadline':
        reason = 'Prazo para reserva até';
        urgencyLevel = 'critical';
        break;
    }

    const timer: CountdownTimer = {
      endTime,
      reason,
      type,
      urgencyLevel
    };

    this.activeTimers.set(timerId, timer);

    // Auto-remove timer when expired
    setTimeout(() => {
      this.activeTimers.delete(timerId);
    }, durationMinutes * 60 * 1000);

    console.log(`⏰ Countdown timer created: ${timerId} (${durationMinutes} minutes)`);
    
    return timerId;
  }

  /**
   * Generate progressive persuasion sequence
   */
  generateProgressiveSequence(
    flight: ProcessedFlightOffer,
    userBehavior: UserBehaviorData
  ): PersuasionTrigger[] {
    const sequence: PersuasionTrigger[] = [];

    // Stage 1: Immediate attention (0-10 seconds)
    sequence.push({
      type: 'authority',
      message: '✨ Voo recomendado pela nossa IA para seu perfil',
      intensity: 'medium',
      timing: 'immediate',
      visualStyle: 'badge'
    });

    // Stage 2: Value proposition (10-30 seconds)
    if (flight.enhanced?.priceAnalysis?.quartileRanking === 'FIRST') {
      sequence.push({
        type: 'urgency',
        message: '💰 Preço 25% abaixo da média - excelente oportunidade!',
        intensity: 'high',
        timing: 'delayed',
        visualStyle: 'notification',
        conditions: [{ type: 'time_on_page', threshold: 10, comparison: 'greater_than' }]
      });
    }

    // Stage 3: Social proof (30-60 seconds)
    sequence.push({
      type: 'social_proof',
      message: '👥 Mais de 150 pessoas visualizaram este voo hoje',
      intensity: 'medium',
      timing: 'delayed',
      visualStyle: 'inline',
      conditions: [{ type: 'time_on_page', threshold: 30, comparison: 'greater_than' }]
    });

    // Stage 4: Scarcity escalation (60+ seconds)
    if (flight.numberOfBookableSeats <= 5) {
      sequence.push({
        type: 'scarcity',
        message: `🔥 Atenção: apenas ${flight.numberOfBookableSeats} assentos restantes!`,
        intensity: 'critical',
        timing: 'delayed',
        visualStyle: 'banner',
        conditions: [{ type: 'time_on_page', threshold: 60, comparison: 'greater_than' }]
      });
    }

    // Stage 5: Final push (2+ minutes)
    sequence.push({
      type: 'commitment',
      message: '🎯 Garanta já este voo - você está a 1 clique da sua viagem!',
      intensity: 'high',
      timing: 'delayed',
      visualStyle: 'popup',
      conditions: [{ type: 'time_on_page', threshold: 120, comparison: 'greater_than' }]
    });

    return sequence;
  }

  /**
   * Analyze urgency context
   */
  private analyzeUrgencyContext(
    flight: ProcessedFlightOffer,
    searchParams: FlightSearchParams,
    userBehavior: UserBehaviorData
  ): UrgencyContext {
    const departureDate = new Date(flight.outbound.departure.dateTime);
    const departureInDays = Math.ceil((departureDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    // Simulate price volatility based on route popularity
    const isPopularRoute = this.isPopularRoute(searchParams.originLocationCode, searchParams.destinationLocationCode);
    const priceVolatility: 'low' | 'medium' | 'high' = isPopularRoute ? 'high' : 'medium';

    // Simulate demand level
    const demandLevel: 'low' | 'medium' | 'high' = 
      departureInDays <= 14 ? 'high' :
      departureInDays <= 30 ? 'medium' : 'low';

    // Determine competitive position
    const competitivePosition: 'cheapest' | 'competitive' | 'expensive' =
      flight.enhanced?.priceAnalysis?.quartileRanking === 'FIRST' ? 'cheapest' :
      flight.enhanced?.priceAnalysis?.quartileRanking === 'SECOND' ? 'competitive' : 'expensive';

    return {
      departureInDays,
      bookableSeats: flight.numberOfBookableSeats,
      priceVolatility,
      demandLevel,
      competitivePosition,
      userBehavior
    };
  }

  /**
   * Generate personalized abandonment recovery
   */
  generateAbandonmentRecovery(
    flight: ProcessedFlightOffer,
    userBehavior: UserBehaviorData,
    timeAway: number // minutes since last interaction
  ): PersuasionTrigger[] {
    const triggers: PersuasionTrigger[] = [];

    if (timeAway < 60) {
      // Quick return - gentle reminder
      triggers.push({
        type: 'liking',
        message: 'Que bom que você voltou! Seu voo preferido ainda está disponível.',
        intensity: 'low',
        timing: 'immediate',
        visualStyle: 'notification'
      });
    } else if (timeAway < 1440) { // Less than 24 hours
      // Medium term - urgency escalation
      triggers.push({
        type: 'urgency',
        message: '⚠️ Price went up $50 since your last visit - there is still time to secure it!',
        intensity: 'high',
        timing: 'immediate',
        visualStyle: 'banner'
      });
    } else {
      // Long term - special offer
      triggers.push({
        type: 'reciprocity',
        message: '🎁 Special offer: $100 discount on the flight you were viewing!',
        intensity: 'critical',
        timing: 'immediate',
        visualStyle: 'popup'
      });
    }

    return triggers;
  }

  /**
   * Generate mobile-optimized triggers
   */
  generateMobileTriggers(flight: ProcessedFlightOffer): PersuasionTrigger[] {
    return [
      {
        type: 'urgency',
        message: '📱 Reserve em 30 segundos - processo super rápido!',
        intensity: 'medium',
        timing: 'immediate',
        visualStyle: 'banner'
      },
      {
        type: 'social_proof',
        message: '✨ 95% das reservas mobile são finalizadas com sucesso',
        intensity: 'medium',
        timing: 'contextual',
        visualStyle: 'inline'
      },
      {
        type: 'commitment',
        message: '🔒 Toque aqui para garantir este preço por 15 minutos',
        intensity: 'high',
        timing: 'delayed',
        visualStyle: 'notification'
      }
    ];
  }

  /**
   * Helper methods
   */
  private isPopularRoute(origin: string, destination: string): boolean {
    const popularRoutes = [
      'GRU-MIA', 'GIG-LAX', 'BSB-JFK', 'GRU-LHR', 'GRU-CDG',
      'GRU-FCO', 'GIG-LIS', 'GRU-MAD', 'SSA-LIS', 'FOR-LIS'
    ];
    
    const route = `${origin}-${destination}`;
    return popularRoutes.includes(route);
  }

  /**
   * Get active countdown timer
   */
  getCountdownTimer(timerId: string): CountdownTimer | null {
    return this.activeTimers.get(timerId) || null;
  }

  /**
   * Get all active timers
   */
  getActiveTimers(): CountdownTimer[] {
    return Array.from(this.activeTimers.values());
  }

  /**
   * Format countdown display
   */
  formatCountdown(timerId: string): string | null {
    const timer = this.activeTimers.get(timerId);
    if (!timer) return null;

    const now = new Date();
    const timeLeft = timer.endTime.getTime() - now.getTime();
    
    if (timeLeft <= 0) {
      this.activeTimers.delete(timerId);
      return null;
    }

    const minutes = Math.floor(timeLeft / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    return `${timer.reason}: ${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * Track conversion funnel data
   */
  trackConversionStep(
    userId: string,
    step: 'view' | 'details' | 'booking' | 'payment' | 'confirmation',
    data: any
  ): void {
    if (!this.conversionFunnelData.has(userId)) {
      this.conversionFunnelData.set(userId, []);
    }

    const userFunnel = this.conversionFunnelData.get(userId);
    userFunnel.push({
      step,
      timestamp: new Date(),
      data
    });

    console.log(`📊 Conversion step tracked: ${userId} -> ${step}`);
  }

  /**
   * Get conversion optimization suggestions
   */
  getConversionOptimizations(userId: string): string[] {
    const userFunnel = this.conversionFunnelData.get(userId) || [];
    const suggestions = [];

    // Check for common drop-off points
    if (userFunnel.filter((step: any) => step.step === 'view').length > 3 && 
        userFunnel.filter((step: any) => step.step === 'details').length === 0) {
      suggestions.push('User viewing multiple flights without checking details - show comparison table');
    }

    if (userFunnel.filter((step: any) => step.step === 'details').length > 0 && 
        userFunnel.filter((step: any) => step.step === 'booking').length === 0) {
      suggestions.push('User viewed details but didn\'t book - increase urgency triggers');
    }

    return suggestions;
  }
}