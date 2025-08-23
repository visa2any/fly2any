// Intelligent Form Optimization and Conversion System for Fly2Any
// Export all form optimization components

// Core intelligent form system
export { default as IntelligentFormSystem } from './IntelligentFormSystem';
export type { 
  IntelligentFormField, 
  FormContext, 
  ConversionTriggers 
} from './IntelligentFormSystem';

// Import types for internal use
import type { IntelligentFormField } from './IntelligentFormSystem';

export {
  useSmartAutocomplete,
  useVoiceInput,
  useRealTimeValidation
} from './IntelligentFormSystem';

// Conversion optimization features
export { default as ConversionOptimizer } from './ConversionOptimizer';
export type {
  PsychologicalTrigger,
  ABTestVariant,
  ConversionMetrics
} from './ConversionOptimizer';

export {
  useScarcityTimer,
  useDynamicPricing,
  useSocialProof,
  useExitIntent,
  useABTest,
  PriceComparison
} from './ConversionOptimizer';

// Mobile-optimized UX components
export { default as MobileOptimizedFormUX } from './MobileOptimizedFormUX';
export type {
  MobileFormConfig,
  MobileFormField,
  TouchInteraction
} from './MobileOptimizedFormUX';

export {
  useOneHandedMode,
  useHapticFeedback,
  useSmartKeyboard,
  useSwipeGestures,
  useBiometricAuth,
  ProgressIndicator
} from './MobileOptimizedFormUX';

// Travel intelligence engine
export { default as TravelIntelligenceEngine } from './TravelIntelligenceEngine';
export type {
  TravelRoute,
  TravelInsight,
  SeasonalTrend,
  AirportSuggestion
} from './TravelIntelligenceEngine';

export {
  useFuzzyAirportSearch,
  useTravelInsights,
  usePriceTrendPredictor
} from './TravelIntelligenceEngine';

// Analytics and conversion tracking
export { default as ConversionAnalytics } from './ConversionAnalytics';
export type {
  ConversionEvent,
  RealTimeAnalytics
} from './ConversionAnalytics';

export {
  useConversionTracking,
  useRealTimeAnalytics,
  useABTestPerformance
} from './ConversionAnalytics';

// Integrated intelligent form (main component)
export { default as IntegratedIntelligentForm } from './IntegratedIntelligentForm';

// Utility functions
export const FormOptimizationUtils = {
  // Generate session ID for tracking
  generateSessionId: () => `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
  
  // Calculate form completion rate
  calculateCompletionRate: (filledFields: number, totalFields: number) => {
    return totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;
  },
  
  // Get optimal field order based on user behavior
  getOptimalFieldOrder: (fields: IntelligentFormField[]) => {
    // Sort by importance and completion rate
    return fields.sort((a, b) => {
      const aRequired = a.required ? 1 : 0;
      const bRequired = b.required ? 1 : 0;
      return bRequired - aRequired;
    });
  },
  
  // Validate form data
  validateFormData: (data: Record<string, any>, fields: IntelligentFormField[]) => {
    const errors: Record<string, string> = {};
    
    fields.forEach(field => {
      const value = data[field.id];
      
      // Required field validation
      if (field.required && (!value || (typeof value === 'string' && !value.trim()))) {
        errors[field.id] = `${field.label} é obrigatório`;
        return;
      }
      
      // Pattern validation
      if (value && field.validation?.pattern && !field.validation.pattern.test(value)) {
        errors[field.id] = field.validation.message || `Formato inválido para ${field.label}`;
        return;
      }
      
      // Length validation
      if (value && typeof value === 'string') {
        if (field.validation?.minLength && value.length < field.validation.minLength) {
          errors[field.id] = `${field.label} deve ter pelo menos ${field.validation.minLength} caracteres`;
          return;
        }
        
        if (field.validation?.maxLength && value.length > field.validation.maxLength) {
          errors[field.id] = `${field.label} deve ter no máximo ${field.validation.maxLength} caracteres`;
          return;
        }
      }
    });
    
    return errors;
  }
};

// Configuration presets
export const FormOptimizationPresets = {
  // High-conversion preset for Brazil-US travel
  brazilUSTravel: {
    psychologicalTriggers: [
      {
        type: 'scarcity' as const,
        enabled: true,
        intensity: 'high' as const,
        timing: 'delayed' as const,
        content: {
          message: '⏰ Apenas 3 assentos restantes neste preço!',
          action: 'reserve_now'
        }
      },
      {
        type: 'social_proof' as const,
        enabled: true,
        intensity: 'high' as const,
        timing: 'immediate' as const,
        content: {
          message: '+ de 50 brasileiros reservaram para os EUA hoje',
          visual: 'notification'
        }
      }
    ],
    mobileConfig: {
      oneHandedMode: true,
      swipeGestures: true,
      hapticFeedback: true,
      biometricAuth: false,
      progressiveDisclosure: true,
      smartKeyboard: true,
      gestureNavigation: true
    },
    conversionTriggers: {
      scarcity: {
        enabled: true,
        message: '⏰ Oferta válida por 15 minutos',
        countdown: 900
      },
      socialProof: {
        enabled: true,
        recentBookings: [],
        popularityScore: 85
      },
      urgency: {
        enabled: true,
        priceAlert: true,
        timeLimit: 1800
      },
      trust: {
        securityBadges: true,
        testimonials: [],
        certifications: ['SSL', 'PCI-DSS', 'ANAC']
      }
    }
  },
  
  // Mobile-first preset
  mobileFirst: {
    mobileConfig: {
      oneHandedMode: true,
      swipeGestures: true,
      hapticFeedback: true,
      biometricAuth: true,
      progressiveDisclosure: true,
      smartKeyboard: true,
      gestureNavigation: true
    },
    psychologicalTriggers: [
      {
        type: 'urgency' as const,
        enabled: true,
        intensity: 'medium' as const,
        timing: 'immediate' as const,
        content: {
          message: 'Preços podem subir a qualquer momento',
          action: 'book_now'
        }
      }
    ]
  },
  
  // Conservative preset (lower intensity)
  conservative: {
    psychologicalTriggers: [
      {
        type: 'social_proof' as const,
        enabled: true,
        intensity: 'low' as const,
        timing: 'delayed' as const,
        content: {
          message: 'Milhares de clientes satisfeitos',
          visual: 'testimonial'
        }
      }
    ],
    mobileConfig: {
      oneHandedMode: false,
      swipeGestures: false,
      hapticFeedback: false,
      biometricAuth: false,
      progressiveDisclosure: false,
      smartKeyboard: true,
      gestureNavigation: false
    }
  }
};

// Performance monitoring utilities
export const PerformanceMonitor = {
  // Track form performance metrics
  trackPerformance: (formId: string, metrics: { loadTime: number; firstInteraction: number; completion: number }) => {
    if ('performance' in window && 'mark' in performance) {
      performance.mark(`form-${formId}-loaded`);
      performance.mark(`form-${formId}-first-interaction`);
      performance.mark(`form-${formId}-completed`);
    }
  },
  
  // Get performance insights
  getPerformanceInsights: (formId: string) => {
    const insights = [];
    
    if ('performance' in window && 'getEntriesByName' in performance) {
      const marks = performance.getEntriesByName(`form-${formId}-loaded`);
      if (marks.length > 0) {
        insights.push(`Form loaded in ${marks[0].startTime.toFixed(0)}ms`);
      }
    }
    
    return insights;
  }
};