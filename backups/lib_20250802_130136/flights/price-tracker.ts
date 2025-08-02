/**
 * Advanced Price Tracking and Comparison System
 * Uses Amadeus ML APIs for intelligent price analysis and alerts
 */

import { EnhancedAmadeusClient } from './enhanced-amadeus-client';
import { ProcessedFlightOffer, FlightSearchParams, PriceAnalysis } from '@/types/flights';

interface PriceAlert {
  id: string;
  userId: string;
  searchParams: FlightSearchParams;
  targetPrice: number;
  currentPrice: number;
  priceHistory: PricePoint[];
  isActive: boolean;
  createdAt: Date;
  lastChecked: Date;
  notifications: NotificationSettings;
}

interface PricePoint {
  price: number;
  timestamp: Date;
  source: 'amadeus' | 'cache' | 'prediction';
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  priceAnalysis?: PriceAnalysis;
}

interface NotificationSettings {
  email: boolean;
  sms: boolean;
  push: boolean;
  priceDropThreshold: number; // percentage
  priceIncreaseThreshold: number; // percentage
}

interface PriceComparison {
  currentPrice: number;
  averagePrice: number;
  lowestPrice: number;
  highestPrice: number;
  priceChangePercent: number;
  trend: 'rising' | 'falling' | 'stable';
  prediction: PricePrediction;
  recommendation: PriceRecommendation;
}

interface PricePrediction {
  nextWeekPrice: number;
  nextMonthPrice: number;
  confidence: number;
  bestBookingTime: Date;
  reasoning: string[];
}

interface PriceRecommendation {
  action: 'buy_now' | 'wait' | 'set_alert';
  confidence: number;
  reasoning: string[];
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  potentialSavings: number;
}

export class AdvancedPriceTracker {
  private amadeusClient: EnhancedAmadeusClient;
  private priceAlerts: Map<string, PriceAlert> = new Map();
  private priceHistory: Map<string, PricePoint[]> = new Map();

  constructor() {
    this.amadeusClient = new EnhancedAmadeusClient();
    this.initializePriceTracking();
  }

  /**
   * Initialize price tracking system
   */
  private async initializePriceTracking() {
    // Load existing alerts from storage
    await this.loadPriceAlerts();
    
    // Start price monitoring background task
    this.startPriceMonitoring();
  }

  /**
   * Create comprehensive price comparison for flight offers
   */
  async createPriceComparison(
    offers: ProcessedFlightOffer[],
    searchParams: FlightSearchParams
  ): Promise<PriceComparison[]> {
    console.log('🔍 Creating comprehensive price comparison...');

    return Promise.all(offers.map(async (offer) => {
      // Get price analysis from Amadeus ML
      const priceAnalysis = await this.amadeusClient.analyzePricing([offer.rawOffer]);
      
      // Get historical data for this route
      const routeKey = this.getRouteKey(searchParams);
      const priceHistory = this.priceHistory.get(routeKey) || [];
      
      // Calculate price metrics
      const prices = priceHistory.map(p => p.price);
      const currentPrice = parseFloat(offer.totalPrice.replace(/[^\\d,]/g, '').replace(',', '.'));
      
      const averagePrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : currentPrice;
      const lowestPrice = prices.length > 0 ? Math.min(...prices) : currentPrice;
      const highestPrice = prices.length > 0 ? Math.max(...prices) : currentPrice;
      
      const priceChangePercent = averagePrice > 0 ? ((currentPrice - averagePrice) / averagePrice) * 100 : 0;
      const trend = this.calculatePriceTrend(priceHistory);
      
      // Generate ML-powered predictions
      const prediction = await this.generatePricePrediction(offer, priceHistory, priceAnalysis?.data?.[0]);
      
      // Create intelligent recommendations
      const recommendation = this.generatePriceRecommendation(
        currentPrice,
        averagePrice,
        lowestPrice,
        trend,
        prediction,
        priceAnalysis?.data?.[0]
      );

      return {
        currentPrice,
        averagePrice,
        lowestPrice,
        highestPrice,
        priceChangePercent,
        trend,
        prediction,
        recommendation
      };
    }));
  }

  /**
   * Generate ML-powered price predictions
   */
  private async generatePricePrediction(
    offer: ProcessedFlightOffer,
    priceHistory: PricePoint[],
    priceAnalysis: any
  ): Promise<PricePrediction> {
    const currentPrice = parseFloat(offer.totalPrice.replace(/[^\\d,]/g, '').replace(',', '.'));
    
    // Use historical data and ML analysis for predictions
    const basePrice = currentPrice;
    const trend = this.calculatePriceTrend(priceHistory);
    const volatility = this.calculatePriceVolatility(priceHistory);
    
    // Factor in ML confidence and quartile ranking
    let priceFactor = 1.0;
    let confidence = 0.7; // Base confidence
    
    if (priceAnalysis) {
      confidence = priceAnalysis.confidence === 'HIGH' ? 0.9 : 
                   priceAnalysis.confidence === 'MEDIUM' ? 0.75 : 0.6;
      
      // Adjust predictions based on quartile ranking
      switch (priceAnalysis.quartileRanking) {
        case 'FIRST':
          priceFactor = 1.05; // Prices likely to increase
          break;
        case 'SECOND':
          priceFactor = 1.02;
          break;
        case 'THIRD':
          priceFactor = 0.98;
          break;
        case 'FOURTH':
          priceFactor = 0.95; // Prices likely to decrease
          break;
      }
    }

    // Calculate departure-based pricing
    const departureDate = new Date(offer.outbound.departure.dateTime);
    const daysUntilDeparture = Math.ceil((departureDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    
    // Apply time-based pricing curve
    let timeFactor = 1.0;
    if (daysUntilDeparture <= 14) {
      timeFactor = 1.15; // Prices increase closer to departure
    } else if (daysUntilDeparture <= 30) {
      timeFactor = 1.05;
    } else if (daysUntilDeparture >= 60) {
      timeFactor = 0.95; // Better prices further out
    }

    const nextWeekPrice = Math.round(basePrice * priceFactor * timeFactor);
    const nextMonthPrice = Math.round(basePrice * priceFactor * 0.98); // Slight decrease over time
    
    // Determine best booking time
    const bestBookingTime = this.calculateBestBookingTime(departureDate, daysUntilDeparture);
    
    const reasoning = this.generatePredictionReasoning(
      trend,
      volatility,
      priceAnalysis,
      daysUntilDeparture,
      confidence
    );

    return {
      nextWeekPrice,
      nextMonthPrice,
      confidence,
      bestBookingTime,
      reasoning
    };
  }

  /**
   * Generate intelligent price recommendations
   */
  private generatePriceRecommendation(
    currentPrice: number,
    averagePrice: number,
    lowestPrice: number,
    trend: 'rising' | 'falling' | 'stable',
    prediction: PricePrediction,
    priceAnalysis: any
  ): PriceRecommendation {
    let action: 'buy_now' | 'wait' | 'set_alert' = 'set_alert';
    let confidence = 0.5;
    let urgencyLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    let potentialSavings = 0;
    const reasoning: string[] = [];

    // Analyze current price vs historical
    const priceVsAverage = ((currentPrice - averagePrice) / averagePrice) * 100;
    const priceVsLowest = ((currentPrice - lowestPrice) / lowestPrice) * 100;

    // Factor 1: Current price analysis
    if (priceVsAverage <= -15) {
      action = 'buy_now';
      confidence += 0.3;
      urgencyLevel = 'high';
      reasoning.push('Preço 15% abaixo da média histórica');
    } else if (priceVsAverage <= -5) {
      action = 'buy_now';
      confidence += 0.2;
      urgencyLevel = 'medium';
      reasoning.push('Preço abaixo da média histórica');
    } else if (priceVsAverage >= 20) {
      action = 'wait';
      confidence += 0.2;
      reasoning.push('Preço significativamente acima da média');
    }

    // Factor 2: ML price analysis
    if (priceAnalysis) {
      if (priceAnalysis.confidence === 'HIGH' && priceAnalysis.quartileRanking === 'FIRST') {
        action = 'buy_now';
        confidence += 0.3;
        urgencyLevel = urgencyLevel === 'low' ? 'high' : 'critical';
        reasoning.push('IA confirma: entre os 25% melhores preços da rota');
      } else if (priceAnalysis.quartileRanking === 'FOURTH') {
        action = 'wait';
        confidence += 0.2;
        reasoning.push('Preço no quartil mais alto - espere por melhor oportunidade');
      }
    }

    // Factor 3: Price trend analysis
    if (trend === 'falling' && action !== 'buy_now') {
      action = 'wait';
      confidence += 0.1;
      reasoning.push('Tendência de queda de preços detectada');
    } else if (trend === 'rising') {
      if (action === 'wait') action = 'set_alert';
      confidence += 0.1;
      urgencyLevel = urgencyLevel === 'low' ? 'medium' : urgencyLevel;
      reasoning.push('Preços em tendência de alta');
    }

    // Factor 4: Future predictions
    if (prediction.nextWeekPrice > currentPrice * 1.1) {
      action = 'buy_now';
      confidence += 0.2;
      urgencyLevel = 'high';
      potentialSavings = prediction.nextWeekPrice - currentPrice;
      reasoning.push(`Forecast: increase of $${potentialSavings.toFixed(0)} next week`);
    }

    // Factor 5: Booking urgency (time to departure)
    const departureInDays = Math.ceil((new Date(prediction.bestBookingTime).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (departureInDays <= 14) {
      if (action !== 'wait') {
        urgencyLevel = 'critical';
        confidence += 0.1;
        reasoning.push('Reserva próxima da data limite ideal');
      }
    }

    // Calculate potential savings
    if (action === 'wait' && prediction.nextMonthPrice < currentPrice) {
      potentialSavings = currentPrice - prediction.nextMonthPrice;
      reasoning.push(`Potential savings: $${potentialSavings.toFixed(0)}`);
    }

    // Ensure confidence is within bounds
    confidence = Math.min(0.95, Math.max(0.1, confidence));

    return {
      action,
      confidence,
      reasoning,
      urgencyLevel,
      potentialSavings: Math.abs(potentialSavings)
    };
  }

  /**
   * Create or update price alert
   */
  async createPriceAlert(
    userId: string,
    searchParams: FlightSearchParams,
    targetPrice: number,
    notifications: NotificationSettings
  ): Promise<string> {
    const alertId = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Get current price for baseline
    const searchResult = await this.amadeusClient.searchFlights(searchParams);
    const currentPrice = searchResult.data && searchResult.data.length > 0 
      ? parseFloat(searchResult.data[0].price.grandTotal.replace(/[^\\d,]/g, '').replace(',', '.'))
      : targetPrice;

    const alert: PriceAlert = {
      id: alertId,
      userId,
      searchParams,
      targetPrice,
      currentPrice,
      priceHistory: [{
        price: currentPrice,
        timestamp: new Date(),
        source: 'amadeus',
        confidence: 'HIGH'
      }],
      isActive: true,
      createdAt: new Date(),
      lastChecked: new Date(),
      notifications
    };

    this.priceAlerts.set(alertId, alert);
    await this.savePriceAlert(alert);

    console.log(`🔔 Price alert created: ${alertId} for target $${targetPrice}`);
    
    return alertId;
  }

  /**
   * Check all active price alerts
   */
  async checkPriceAlerts(): Promise<void> {
    console.log('🔍 Checking all active price alerts...');

    const activeAlerts = Array.from(this.priceAlerts.values()).filter(alert => alert.isActive);
    
    for (const alert of activeAlerts) {
      try {
        await this.checkSingleAlert(alert);
      } catch (error) {
        console.error(`Error checking alert ${alert.id}:`, error);
      }
    }
  }

  /**
   * Check single price alert
   */
  private async checkSingleAlert(alert: PriceAlert): Promise<void> {
    const searchResult = await this.amadeusClient.searchFlights(alert.searchParams);
    
    if (!searchResult.data || searchResult.data.length === 0) {
      return;
    }

    const currentPrice = parseFloat(searchResult.data[0].price.grandTotal.replace(/[^\\d,]/g, '').replace(',', '.'));
    const priceChange = ((currentPrice - alert.currentPrice) / alert.currentPrice) * 100;

    // Update price history
    alert.priceHistory.push({
      price: currentPrice,
      timestamp: new Date(),
      source: 'amadeus',
      confidence: 'HIGH'
    });

    // Check if alert conditions are met
    const shouldNotify = this.shouldTriggerNotification(alert, currentPrice, priceChange);

    if (shouldNotify) {
      await this.sendPriceNotification(alert, currentPrice, priceChange);
    }

    // Update alert
    alert.currentPrice = currentPrice;
    alert.lastChecked = new Date();
    await this.savePriceAlert(alert);
  }

  /**
   * Determine if notification should be triggered
   */
  private shouldTriggerNotification(alert: PriceAlert, currentPrice: number, priceChange: number): boolean {
    // Target price reached
    if (currentPrice <= alert.targetPrice) {
      return true;
    }

    // Significant price drop
    if (priceChange <= -alert.notifications.priceDropThreshold) {
      return true;
    }

    // Significant price increase (warning)
    if (priceChange >= alert.notifications.priceIncreaseThreshold) {
      return true;
    }

    return false;
  }

  /**
   * Send price notification
   */
  private async sendPriceNotification(alert: PriceAlert, currentPrice: number, priceChange: number): Promise<void> {
    const notification = {
      alertId: alert.id,
      userId: alert.userId,
      currentPrice,
      targetPrice: alert.targetPrice,
      priceChange,
      route: `${alert.searchParams.originLocationCode} → ${alert.searchParams.destinationLocationCode}`,
      timestamp: new Date()
    };

    console.log('📧 Sending price notification:', notification);

    // Here you would integrate with your notification service
    // For now, we'll log the notification
    if (currentPrice <= alert.targetPrice) {
      console.log(`🎯 TARGET PRICE REACHED! ${notification.route}: $${currentPrice} (target: $${alert.targetPrice})`);
    } else if (priceChange < 0) {
      console.log(`📉 PRICE DROP ALERT! ${notification.route}: $${currentPrice} (${priceChange.toFixed(1)}% drop)`);
    } else {
      console.log(`📈 PRICE INCREASE WARNING! ${notification.route}: $${currentPrice} (${priceChange.toFixed(1)}% increase)`);
    }
  }

  /**
   * Helper methods
   */
  private getRouteKey(searchParams: FlightSearchParams): string {
    return `${searchParams.originLocationCode}-${searchParams.destinationLocationCode}-${searchParams.departureDate}`;
  }

  private calculatePriceTrend(priceHistory: PricePoint[]): 'rising' | 'falling' | 'stable' {
    if (priceHistory.length < 3) return 'stable';

    const recent = priceHistory.slice(-5);
    const prices = recent.map(p => p.price);
    
    const firstHalf = prices.slice(0, Math.floor(prices.length / 2));
    const secondHalf = prices.slice(Math.floor(prices.length / 2));
    
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    const change = ((secondAvg - firstAvg) / firstAvg) * 100;
    
    if (change > 5) return 'rising';
    if (change < -5) return 'falling';
    return 'stable';
  }

  private calculatePriceVolatility(priceHistory: PricePoint[]): number {
    if (priceHistory.length < 2) return 0;

    const prices = priceHistory.map(p => p.price);
    const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
    const variance = prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / prices.length;
    
    return Math.sqrt(variance) / mean; // Coefficient of variation
  }

  private calculateBestBookingTime(departureDate: Date, daysUntilDeparture: number): Date {
    // Optimal booking window: 6-8 weeks before departure for domestic, 8-12 weeks for international
    const optimalDaysBefore = daysUntilDeparture > 30 ? 56 : 42; // 8 weeks or 6 weeks
    const bestBookingDate = new Date(departureDate.getTime() - (optimalDaysBefore * 24 * 60 * 60 * 1000));
    
    // If we're past the optimal time, recommend booking soon
    if (bestBookingDate < new Date()) {
      return new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)); // Next week
    }
    
    return bestBookingDate;
  }

  private generatePredictionReasoning(
    trend: 'rising' | 'falling' | 'stable',
    volatility: number,
    priceAnalysis: any,
    daysUntilDeparture: number,
    confidence: number
  ): string[] {
    const reasoning = [];

    if (trend !== 'stable') {
      reasoning.push(`Tendência de preços: ${trend === 'rising' ? 'alta' : 'baixa'}`);
    }

    if (volatility > 0.1) {
      reasoning.push('Alta volatilidade de preços detectada');
    }

    if (priceAnalysis?.confidence) {
      reasoning.push(`Confiança da IA: ${priceAnalysis.confidence}`);
    }

    if (daysUntilDeparture <= 30) {
      reasoning.push('Proximidade da data de viagem influencia preços');
    }

    reasoning.push(`Confiança da previsão: ${(confidence * 100).toFixed(0)}%`);

    return reasoning;
  }

  private startPriceMonitoring(): void {
    // Check alerts every 4 hours
    setInterval(() => {
      this.checkPriceAlerts();
    }, 4 * 60 * 60 * 1000);

    console.log('🚀 Price monitoring started - checking every 4 hours');
  }

  private async loadPriceAlerts(): Promise<void> {
    // In a real implementation, load from database
    console.log('📂 Loading existing price alerts...');
  }

  private async savePriceAlert(alert: PriceAlert): Promise<void> {
    // In a real implementation, save to database
    console.log('💾 Saving price alert:', alert.id);
  }
}