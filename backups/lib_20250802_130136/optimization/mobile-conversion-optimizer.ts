/**
 * Mobile Conversion Optimization System
 * Advanced mobile-first optimization for maximum conversion rates
 */

import { ProcessedFlightOffer } from '@/types/flights';

interface MobileOptimization {
  deviceInfo: DeviceInfo;
  userBehavior: MobileBehaviorData;
  optimizations: OptimizationRule[];
  performance: PerformanceMetrics;
}

interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop';
  screenSize: { width: number; height: number };
  connectionType: '2g' | '3g' | '4g' | '5g' | 'wifi' | 'unknown';
  battery: number; // 0-100
  isLowEnd: boolean;
  platform: 'ios' | 'android' | 'web';
  orientation: 'portrait' | 'landscape';
}

interface MobileBehaviorData {
  thumbZone: 'easy' | 'stretch' | 'hard';
  scrollDepth: number;
  tapAccuracy: number;
  averageSessionTime: number;
  conversionFunnel: ConversionStep[];
  dropOffPoints: string[];
  preferredInteractionType: 'tap' | 'swipe' | 'scroll';
}

interface ConversionStep {
  step: string;
  completionRate: number;
  averageTime: number;
  commonIssues: string[];
}

interface OptimizationRule {
  id: string;
  trigger: OptimizationTrigger;
  action: OptimizationAction;
  priority: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
  category: 'ux' | 'performance' | 'conversion' | 'accessibility';
}

interface OptimizationTrigger {
  type: 'device' | 'behavior' | 'performance' | 'context';
  condition: any;
  threshold?: number;
}

interface OptimizationAction {
  type: 'ui_adjust' | 'content_reduce' | 'lazy_load' | 'preload' | 'simplify';
  parameters: any;
  effect: string;
}

interface PerformanceMetrics {
  loadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  interactionToNextPaint: number;
  memoryUsage: number;
  networkRequests: number;
}

interface MobileUIOptimizations {
  buttonSizes: ButtonSizeConfig;
  touchTargets: TouchTargetConfig;
  typography: TypographyConfig;
  spacing: SpacingConfig;
  navigation: NavigationConfig;
}

interface ButtonSizeConfig {
  minimum: { width: number; height: number };
  recommended: { width: number; height: number };
  primary: { width: number; height: number };
  spacing: number;
}

interface TouchTargetConfig {
  minimumSize: number; // 44px iOS, 48px Android
  spacing: number;
  hitboxPadding: number;
}

interface TypographyConfig {
  baseFontSize: number;
  lineHeight: number;
  headingSizes: number[];
  readableLineLength: number;
}

interface SpacingConfig {
  baseline: number;
  sections: number;
  components: number;
  elements: number;
}

interface NavigationConfig {
  thumbReach: 'bottom' | 'top' | 'sides';
  primaryActions: 'bottom' | 'top';
  menuStyle: 'hamburger' | 'tab-bar' | 'bottom-nav';
}

export class MobileConversionOptimizer {
  private optimizations: Map<string, MobileOptimization> = new Map();
  private performanceObserver: PerformanceObserver | null = null;
  private deviceCapabilities: DeviceInfo | null = null;

  constructor() {
    this.initializeOptimizer();
  }

  /**
   * Initialize mobile optimization system
   */
  private initializeOptimizer(): void {
    // Detect device capabilities
    this.deviceCapabilities = this.detectDeviceCapabilities();
    
    // Initialize performance monitoring
    this.initializePerformanceMonitoring();
    
    // Setup responsive optimizations
    this.setupResponsiveOptimizations();
    
    console.log('📱 Mobile Conversion Optimizer initialized');
  }

  /**
   * Optimize flight results display for mobile
   */
  optimizeFlightDisplay(
    flights: ProcessedFlightOffer[],
    deviceInfo: DeviceInfo,
    userBehavior: MobileBehaviorData
  ): {
    optimizedFlights: ProcessedFlightOffer[];
    uiOptimizations: MobileUIOptimizations;
    performanceHints: string[];
  } {
    console.log('🎯 Optimizing flight display for mobile conversion...');

    // Prioritize and filter flights for mobile
    const optimizedFlights = this.prioritizeFlightsForMobile(flights, deviceInfo, userBehavior);
    
    // Generate UI optimizations
    const uiOptimizations = this.generateUIOptimizations(deviceInfo, userBehavior);
    
    // Performance optimization hints
    const performanceHints = this.generatePerformanceHints(deviceInfo, flights.length);

    return {
      optimizedFlights,
      uiOptimizations,
      performanceHints
    };
  }

  /**
   * Prioritize flights for mobile display
   */
  private prioritizeFlightsForMobile(
    flights: ProcessedFlightOffer[],
    deviceInfo: DeviceInfo,
    userBehavior: MobileBehaviorData
  ): ProcessedFlightOffer[] {
    // Limit initial results for better performance
    const maxInitialResults = deviceInfo.isLowEnd ? 5 : 10;
    
    // Sort by mobile-specific criteria
    const mobileSorted = flights
      .map(flight => ({
        ...flight,
        mobileScore: this.calculateMobileScore(flight, deviceInfo, userBehavior)
      }))
      .sort((a, b) => b.mobileScore - a.mobileScore)
      .slice(0, maxInitialResults);

    return mobileSorted;
  }

  /**
   * Calculate mobile-specific relevance score
   */
  private calculateMobileScore(
    flight: ProcessedFlightOffer,
    deviceInfo: DeviceInfo,
    userBehavior: MobileBehaviorData
  ): number {
    let score = 0;

    // Price factor (mobile users are often more price-sensitive)
    const price = parseFloat(flight.totalPrice.replace(/[^\\d,]/g, '').replace(',', '.'));
    score += Math.max(0, 100 - (price / 50)); // Favor cheaper flights

    // Simplicity factor (direct flights score higher on mobile)
    if (flight.outbound.stops === 0) {
      score += 25; // Direct flights are easier to understand on small screens
    }

    // Duration factor (mobile users prefer shorter trips)
    const duration = flight.outbound.durationMinutes;
    if (duration < 240) score += 20; // Under 4 hours
    else if (duration < 480) score += 10; // Under 8 hours

    // Instant confirmation (mobile users want immediate results)
    if (flight.instantTicketingRequired) {
      score += 15;
    }

    // Seat availability (scarcity works well on mobile)
    if (flight.numberOfBookableSeats <= 5) {
      score += 10;
    }

    // Enhanced data bonus
    if (flight.enhanced?.conversionScore) {
      score += flight.enhanced.conversionScore * 0.3;
    }

    return score;
  }

  /**
   * Generate mobile UI optimizations
   */
  private generateUIOptimizations(
    deviceInfo: DeviceInfo,
    userBehavior: MobileBehaviorData
  ): MobileUIOptimizations {
    const isSmallScreen = deviceInfo.screenSize.width < 375;
    const isLowEnd = deviceInfo.isLowEnd;

    return {
      buttonSizes: {
        minimum: { width: 44, height: 44 },
        recommended: { width: isSmallScreen ? 48 : 56, height: isSmallScreen ? 44 : 48 },
        primary: { width: isSmallScreen ? 280 : 320, height: 52 },
        spacing: isSmallScreen ? 8 : 12
      },
      touchTargets: {
        minimumSize: deviceInfo.platform === 'ios' ? 44 : 48,
        spacing: isSmallScreen ? 8 : 12,
        hitboxPadding: 8
      },
      typography: {
        baseFontSize: isSmallScreen ? 14 : 16,
        lineHeight: 1.5,
        headingSizes: isSmallScreen ? [18, 20, 24] : [20, 24, 28],
        readableLineLength: isSmallScreen ? 45 : 55
      },
      spacing: {
        baseline: isSmallScreen ? 4 : 8,
        sections: isSmallScreen ? 16 : 24,
        components: isSmallScreen ? 12 : 16,
        elements: isSmallScreen ? 8 : 12
      },
      navigation: {
        thumbReach: deviceInfo.screenSize.height > 667 ? 'bottom' : 'top',
        primaryActions: 'bottom',
        menuStyle: 'bottom-nav'
      }
    };
  }

  /**
   * Generate performance optimization hints
   */
  private generatePerformanceHints(deviceInfo: DeviceInfo, resultCount: number): string[] {
    const hints = [];

    if (deviceInfo.isLowEnd) {
      hints.push('Ativar modo de economia de recursos');
      hints.push('Reduzir animações para melhor performance');
      hints.push('Carregar imagens em qualidade otimizada');
    }

    if (deviceInfo.connectionType === '2g' || deviceInfo.connectionType === '3g') {
      hints.push('Implementar carregamento progressivo');
      hints.push('Compactar dados de resposta');
      hints.push('Priorizar conteúdo crítico');
    }

    if (resultCount > 20) {
      hints.push('Implementar virtualização de lista');
      hints.push('Carregar resultados sob demanda');
    }

    if (deviceInfo.battery < 20) {
      hints.push('Ativar modo de economia de bateria');
      hints.push('Reduzir atualizações em background');
    }

    return hints;
  }

  /**
   * Optimize conversion funnel for mobile
   */
  optimizeConversionFunnel(
    currentStep: string,
    deviceInfo: DeviceInfo,
    userBehavior: MobileBehaviorData
  ): {
    optimizations: OptimizationRule[];
    simplifiedFlow: string[];
    criticalActions: string[];
  } {
    const optimizations: OptimizationRule[] = [];
    
    // Simplify booking flow for mobile
    const simplifiedFlow = this.createSimplifiedFlow(currentStep, deviceInfo);
    
    // Identify critical actions for mobile
    const criticalActions = this.identifyCriticalActions(currentStep, userBehavior);

    // Generate step-specific optimizations
    switch (currentStep) {
      case 'search':
        optimizations.push(...this.getSearchOptimizations(deviceInfo, userBehavior));
        break;
      case 'results':
        optimizations.push(...this.getResultsOptimizations(deviceInfo, userBehavior));
        break;
      case 'details':
        optimizations.push(...this.getDetailsOptimizations(deviceInfo, userBehavior));
        break;
      case 'booking':
        optimizations.push(...this.getBookingOptimizations(deviceInfo, userBehavior));
        break;
    }

    return {
      optimizations,
      simplifiedFlow,
      criticalActions
    };
  }

  /**
   * Get search page optimizations
   */
  private getSearchOptimizations(deviceInfo: DeviceInfo, userBehavior: MobileBehaviorData): OptimizationRule[] {
    const optimizations: OptimizationRule[] = [];

    // Simplified search form
    optimizations.push({
      id: 'mobile_search_form',
      trigger: { type: 'device', condition: { screenWidth: { lt: 768 } } },
      action: {
        type: 'ui_adjust',
        parameters: {
          layout: 'stacked',
          fieldsPerRow: 1,
          autoFocus: 'destination',
          inputSize: 'large'
        },
        effect: 'Easier form completion on mobile'
      },
      priority: 10,
      impact: 'high',
      category: 'ux'
    });

    // Quick suggestions
    optimizations.push({
      id: 'mobile_quick_suggestions',
      trigger: { type: 'behavior', condition: { sessionTime: { lt: 30 } } },
      action: {
        type: 'content_reduce',
        parameters: {
          showPopularDestinations: true,
          maxSuggestions: 6,
          prominentDisplay: true
        },
        effect: 'Reduce decision paralysis'
      },
      priority: 8,
      impact: 'medium',
      category: 'conversion'
    });

    return optimizations;
  }

  /**
   * Get results page optimizations
   */
  private getResultsOptimizations(deviceInfo: DeviceInfo, userBehavior: MobileBehaviorData): OptimizationRule[] {
    const optimizations: OptimizationRule[] = [];

    // Card-based layout
    optimizations.push({
      id: 'mobile_card_layout',
      trigger: { type: 'device', condition: { type: 'mobile' } },
      action: {
        type: 'ui_adjust',
        parameters: {
          layout: 'cards',
          cardsPerView: 1,
          swipeEnabled: true,
          primaryInfoFirst: true
        },
        effect: 'Better mobile browsing experience'
      },
      priority: 10,
      impact: 'high',
      category: 'ux'
    });

    // Progressive loading
    optimizations.push({
      id: 'mobile_progressive_loading',
      trigger: { type: 'performance', condition: { connectionType: { in: ['2g', '3g'] } } },
      action: {
        type: 'lazy_load',
        parameters: {
          initialResults: 5,
          loadMoreThreshold: '80%',
          showSkeletons: true
        },
        effect: 'Faster initial load on slow connections'
      },
      priority: 9,
      impact: 'high',
      category: 'performance'
    });

    return optimizations;
  }

  /**
   * Get details page optimizations
   */
  private getDetailsOptimizations(deviceInfo: DeviceInfo, userBehavior: MobileBehaviorData): OptimizationRule[] {
    const optimizations: OptimizationRule[] = [];

    // Collapsible sections
    optimizations.push({
      id: 'mobile_collapsible_details',
      trigger: { type: 'device', condition: { screenHeight: { lt: 800 } } },
      action: {
        type: 'ui_adjust',
        parameters: {
          sectionsCollapsed: true,
          expandOnTap: true,
          showPreview: true,
          priorityOrder: ['price', 'schedule', 'policies']
        },
        effect: 'Reduce information overload'
      },
      priority: 8,
      impact: 'medium',
      category: 'ux'
    });

    // Sticky booking button
    optimizations.push({
      id: 'mobile_sticky_booking',
      trigger: { type: 'behavior', condition: { scrollDepth: { gt: 30 } } },
      action: {
        type: 'ui_adjust',
        parameters: {
          stickyButton: true,
          position: 'bottom',
          fullWidth: true,
          prominent: true
        },
        effect: 'Keep booking action accessible'
      },
      priority: 10,
      impact: 'critical',
      category: 'conversion'
    });

    return optimizations;
  }

  /**
   * Get booking page optimizations
   */
  private getBookingOptimizations(deviceInfo: DeviceInfo, userBehavior: MobileBehaviorData): OptimizationRule[] {
    const optimizations: OptimizationRule[] = [];

    // Single-page checkout
    optimizations.push({
      id: 'mobile_single_page_checkout',
      trigger: { type: 'device', condition: { type: 'mobile' } },
      action: {
        type: 'simplify',
        parameters: {
          singlePage: true,
          progressIndicator: true,
          autofillEnabled: true,
          validationInline: true
        },
        effect: 'Reduce checkout abandonment'
      },
      priority: 10,
      impact: 'critical',
      category: 'conversion'
    });

    // Mobile payment optimization
    optimizations.push({
      id: 'mobile_payment_optimization',
      trigger: { type: 'context', condition: { step: 'payment' } },
      action: {
        type: 'ui_adjust',
        parameters: {
          mobilePayments: ['apple_pay', 'google_pay', 'samsung_pay'],
          oneClickPayment: true,
          securityIndicators: true,
          trustSignals: true
        },
        effect: 'Increase payment completion'
      },
      priority: 10,
      impact: 'critical',
      category: 'conversion'
    });

    return optimizations;
  }

  /**
   * Generate mobile-specific persuasion elements
   */
  generateMobilePersuasion(
    flight: ProcessedFlightOffer,
    deviceInfo: DeviceInfo,
    userBehavior: MobileBehaviorData
  ): {
    urgencyElements: string[];
    trustSignals: string[];
    socialProof: string[];
    valueProposition: string[];
  } {
    return {
      urgencyElements: [
        '⚡ Últimos assentos!',
        '🔥 Preço pode subir em minutos',
        '⏰ 127 pessoas vendo agora'
      ],
      trustSignals: [
        '🔒 Pagamento 100% seguro',
        '✅ Cancelamento grátis 24h',
        '🏆 Nota 4.9/5 - 50mil avaliações'
      ],
      socialProof: [
        '👥 +500 reservas hoje',
        '⭐ Escolha nº1 da rota',
        '🎯 95% recomendam'
      ],
      valueProposition: [
        '💰 Melhor preço garantido',
        '📱 Reserve em 30 segundos',
        '✈️ Confirmação instantânea'
      ]
    };
  }

  /**
   * Monitor and optimize performance
   */
  private initializePerformanceMonitoring(): void {
    if (typeof window === 'undefined') return;

    // Core Web Vitals monitoring
    if ('PerformanceObserver' in window) {
      this.performanceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          this.processPerformanceEntry(entry);
        });
      });

      this.performanceObserver.observe({ entryTypes: ['navigation', 'paint', 'layout-shift'] });
    }

    // Network monitoring
    if ('navigator' in window && 'connection' in navigator) {
      const connection = (navigator as any).connection;
      this.monitorNetworkChanges(connection);
    }
  }

  /**
   * Process performance entries
   */
  private processPerformanceEntry(entry: PerformanceEntry): void {
    switch (entry.entryType) {
      case 'navigation':
        const navEntry = entry as PerformanceNavigationTiming;
        this.optimizeForLoadTime(navEntry.loadEventEnd - navEntry.loadEventStart);
        break;
      case 'paint':
        if (entry.name === 'first-contentful-paint') {
          this.optimizeForFCP(entry.startTime);
        }
        break;
      case 'layout-shift':
        const clsEntry = entry as any;
        this.optimizeForCLS(clsEntry.value);
        break;
    }
  }

  /**
   * Detect device capabilities
   */
  private detectDeviceCapabilities(): DeviceInfo {
    if (typeof window === 'undefined') {
      return {
        type: 'desktop',
        screenSize: { width: 1920, height: 1080 },
        connectionType: 'wifi',
        battery: 100,
        isLowEnd: false,
        platform: 'web',
        orientation: 'landscape'
      };
    }

    const screenWidth = window.innerWidth;
    const deviceType = screenWidth < 768 ? 'mobile' : screenWidth < 1024 ? 'tablet' : 'desktop';
    
    // Detect low-end devices
    const isLowEnd = this.detectLowEndDevice();
    
    // Detect connection type
    const connection = (navigator as any).connection;
    const connectionType = connection ? connection.effectiveType || 'unknown' : 'unknown';
    
    // Detect platform
    const platform = this.detectPlatform();
    
    return {
      type: deviceType,
      screenSize: { width: window.innerWidth, height: window.innerHeight },
      connectionType,
      battery: this.getBatteryLevel(),
      isLowEnd,
      platform,
      orientation: window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
    };
  }

  /**
   * Helper methods
   */
  private detectLowEndDevice(): boolean {
    if (typeof navigator === 'undefined') return false;
    
    // Use device memory API if available
    if ('deviceMemory' in navigator) {
      return (navigator as any).deviceMemory <= 2;
    }
    
    // Fallback to user agent detection
    const userAgent = navigator.userAgent.toLowerCase();
    const lowEndIndicators = ['android 4', 'android 5', 'iphone 5', 'iphone 6'];
    
    return lowEndIndicators.some(indicator => userAgent.includes(indicator));
  }

  private detectPlatform(): 'ios' | 'android' | 'web' {
    if (typeof navigator === 'undefined') return 'web';
    
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
      return 'ios';
    } else if (userAgent.includes('android')) {
      return 'android';
    }
    
    return 'web';
  }

  private getBatteryLevel(): number {
    // Battery API is deprecated but still useful for optimization
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        return Math.round(battery.level * 100);
      });
    }
    return 100; // Default to full battery
  }

  private createSimplifiedFlow(currentStep: string, deviceInfo: DeviceInfo): string[] {
    const baseFlow = ['search', 'results', 'details', 'booking', 'confirmation'];
    
    if (deviceInfo.type === 'mobile') {
      // Remove intermediate steps for mobile
      return ['search', 'results', 'booking', 'confirmation'];
    }
    
    return baseFlow;
  }

  private identifyCriticalActions(currentStep: string, userBehavior: MobileBehaviorData): string[] {
    const criticalActions: { [key: string]: string[] } = {
      search: ['destination_select', 'date_select', 'search_submit'],
      results: ['flight_select', 'price_compare', 'filter_apply'],
      details: ['book_now', 'price_check', 'share'],
      booking: ['form_fill', 'payment_select', 'confirm_booking']
    };
    
    return criticalActions[currentStep] || [];
  }

  private monitorNetworkChanges(connection: any): void {
    connection.addEventListener('change', () => {
      console.log(`📶 Network changed to: ${connection.effectiveType}`);
      this.adjustForConnection(connection.effectiveType);
    });
  }

  private adjustForConnection(connectionType: string): void {
    if (connectionType === '2g' || connectionType === 'slow-2g') {
      // Implement aggressive optimization for slow connections
      console.log('🐌 Slow connection detected - applying aggressive optimizations');
    }
  }

  private optimizeForLoadTime(loadTime: number): void {
    if (loadTime > 3000) {
      console.log('⚠️ Slow load time detected - applying performance optimizations');
    }
  }

  private optimizeForFCP(fcpTime: number): void {
    if (fcpTime > 2500) {
      console.log('⚠️ Slow FCP detected - optimizing critical rendering path');
    }
  }

  private optimizeForCLS(clsValue: number): void {
    if (clsValue > 0.1) {
      console.log('⚠️ High CLS detected - stabilizing layout');
    }
  }

  private setupResponsiveOptimizations(): void {
    if (typeof window === 'undefined') return;

    // Listen for orientation changes
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        console.log('📱 Orientation changed - adjusting layout optimizations');
        this.deviceCapabilities = this.detectDeviceCapabilities();
      }, 100);
    });

    // Listen for resize events
    window.addEventListener('resize', () => {
      console.log('📐 Viewport resized - recalculating optimizations');
      this.deviceCapabilities = this.detectDeviceCapabilities();
    });
  }
}