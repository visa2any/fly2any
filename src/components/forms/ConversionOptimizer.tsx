'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// Conversion optimization types
export interface PsychologicalTrigger {
  type: 'scarcity' | 'urgency' | 'social_proof' | 'authority' | 'reciprocity' | 'consistency';
  enabled: boolean;
  intensity: 'low' | 'medium' | 'high';
  timing: 'immediate' | 'delayed' | 'on_exit';
  content: {
    message: string;
    visual?: string;
    action?: string;
  };
}

export interface ABTestVariant {
  id: string;
  name: string;
  weight: number;
  elements: {
    ctaText?: string;
    ctaColor?: string;
    ctaPosition?: 'top' | 'bottom' | 'sticky';
    headerMessage?: string;
    priceDisplay?: 'standard' | 'savings' | 'comparison';
    trustBadges?: boolean;
    urgencyBanner?: boolean;
  };
  metrics: {
    views: number;
    conversions: number;
    conversionRate: number;
  };
}

export interface ConversionMetrics {
  pageViews: number;
  formStarted: number;
  formCompleted: number;
  abandonmentPoints: Record<string, number>;
  timeToComplete: number[];
  deviceBreakdown: Record<string, number>;
  trafficSources: Record<string, number>;
}

interface ConversionOptimizerProps {
  triggers: PsychologicalTrigger[];
  abTests: ABTestVariant[];
  onConversion: (eventType: string, data: any) => void;
  className?: string;
  children?: React.ReactNode;
}

// Scarcity timer hook
export const useScarcityTimer = (initialTime: number = 900) => {
  const [timeLeft, setTimeLeft] = useState(initialTime); // 15 minutes default
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  const startTimer = () => setIsActive(true);
  const pauseTimer = () => setIsActive(false);
  const resetTimer = () => {
    setTimeLeft(initialTime);
    setIsActive(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return { timeLeft, isActive, startTimer, pauseTimer, resetTimer, formatTime };
};

// Dynamic pricing hook
export const useDynamicPricing = (basePrice: number, demand: 'low' | 'medium' | 'high') => {
  const [currentPrice, setCurrentPrice] = useState(basePrice);
  const [discount, setDiscount] = useState(0);
  const [showSavings, setShowSavings] = useState(false);

  useEffect(() => {
    // Simulate dynamic pricing based on demand
    let priceMultiplier = 1;
    let discountAmount = 0;

    switch (demand) {
      case 'low':
        priceMultiplier = 0.85; // 15% discount for low demand
        discountAmount = 15;
        break;
      case 'medium':
        priceMultiplier = 0.95; // 5% discount for medium demand
        discountAmount = 5;
        break;
      case 'high':
        priceMultiplier = 1.1; // 10% premium for high demand
        discountAmount = 0;
        break;
    }

    const newPrice = Math.round(basePrice * priceMultiplier);
    setCurrentPrice(newPrice);
    setDiscount(discountAmount);
    setShowSavings(discountAmount > 0);
  }, [basePrice, demand]);

  return {
    currentPrice,
    originalPrice: basePrice,
    discount,
    savings: basePrice - currentPrice,
    showSavings
  };
};

// A/B testing hook
export const useABTest = (tests: ABTestVariant[], userId?: string) => {
  const [activeVariant, setActiveVariant] = useState<ABTestVariant | null>(null);

  useEffect(() => {
    if (tests.length === 0) return;

    // Deterministic variant selection based on user ID or session
    const sessionId = userId || getSessionId();
    const hash = simpleHash(sessionId);
    const totalWeight = tests.reduce((sum, test) => sum + test.weight, 0);
    const randomValue = hash % totalWeight;

    let currentWeight = 0;
    for (const test of tests) {
      currentWeight += test.weight;
      if (randomValue < currentWeight) {
        setActiveVariant(test);
        break;
      }
    }
  }, [tests, userId]);

  const trackView = useCallback(() => {
    if (activeVariant) {
      // Track variant view
      console.log(`A/B Test View: ${activeVariant.name}`);
    }
  }, [activeVariant]);

  const trackConversion = useCallback(() => {
    if (activeVariant) {
      // Track variant conversion
      console.log(`A/B Test Conversion: ${activeVariant.name}`);
    }
  }, [activeVariant]);

  return { activeVariant, trackView, trackConversion };
};

// Social proof hook
export const useSocialProof = () => {
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [currentNotification, setCurrentNotification] = useState<any | null>(null);
  const [showNotification, setShowNotification] = useState(false);

  const brazilianNames = [
    'Maria Silva', 'João Santos', 'Ana Costa', 'Carlos Oliveira', 'Lucia Ferreira',
    'Pedro Almeida', 'Fernanda Lima', 'Ricardo Souza', 'Juliana Rocha', 'Marcos Pereira'
  ];

  const popularDestinations = [
    { city: 'Orlando', savings: 347 },
    { city: 'Miami', savings: 423 },
    { city: 'New York', savings: 567 },
    { city: 'Los Angeles', savings: 612 },
    { city: 'Las Vegas', savings: 489 }
  ];

  useEffect(() => {
    // Generate realistic recent bookings
    const bookings = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      name: brazilianNames[Math.floor(Math.random() * brazilianNames.length)],
      destination: popularDestinations[Math.floor(Math.random() * popularDestinations.length)],
      timeAgo: Math.floor(Math.random() * 30) + 1, // 1-30 minutes ago
      verified: Math.random() > 0.3 // 70% are verified
    }));

    setRecentBookings(bookings);
  }, []);

  useEffect(() => {
    if (recentBookings.length === 0) return;

    const showRandomNotification = () => {
      const randomBooking = recentBookings[Math.floor(Math.random() * recentBookings.length)];
      setCurrentNotification(randomBooking);
      setShowNotification(true);

      // Hide after 5 seconds
      setTimeout(() => {
        setShowNotification(false);
      }, 5000);
    };

    // Show first notification after 3 seconds
    const initialTimer = setTimeout(showRandomNotification, 3000);

    // Then show notifications every 15 seconds
    const interval = setInterval(showRandomNotification, 15000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [recentBookings]);

  return { currentNotification, showNotification, recentBookings };
};

// Exit intent hook
export const useExitIntent = (enabled: boolean = true) => {
  const [showExitIntent, setShowExitIntent] = useState(false);
  const [hasShownExitIntent, setHasShownExitIntent] = useState(false);

  useEffect(() => {
    if (!enabled || hasShownExitIntent) return;

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !showExitIntent) {
        setShowExitIntent(true);
        setHasShownExitIntent(true);
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!hasShownExitIntent) {
        setShowExitIntent(true);
        setHasShownExitIntent(true);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [enabled, hasShownExitIntent, showExitIntent]);

  const closeExitIntent = () => setShowExitIntent(false);

  return { showExitIntent, closeExitIntent };
};

// Helper functions
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('ab_session_id');
  if (!sessionId) {
    sessionId = Math.random().toString(36).substring(2, 15);
    sessionStorage.setItem('ab_session_id', sessionId);
  }
  return sessionId;
};

const simpleHash = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

export default function ConversionOptimizer({
  triggers,
  abTests,
  onConversion,
  className = '',
  children
}: ConversionOptimizerProps) {
  const { activeVariant, trackView, trackConversion } = useABTest(abTests);
  const { timeLeft, formatTime, startTimer } = useScarcityTimer();
  const { currentNotification, showNotification } = useSocialProof();
  const { showExitIntent, closeExitIntent } = useExitIntent();

  const scarcityTrigger = triggers.find(t => t.type === 'scarcity' && t.enabled);
  const urgencyTrigger = triggers.find(t => t.type === 'urgency' && t.enabled);

  useEffect(() => {
    trackView();
    if (scarcityTrigger) {
      startTimer();
    }
  }, [activeVariant, scarcityTrigger]);

  const handleConversion = (eventType: string, data: any) => {
    trackConversion();
    onConversion(eventType, { ...data, abVariant: activeVariant?.name });
  };

  return (
    <div className={`conversion-optimizer relative ${className}`}>
      {/* Urgency Banner */}
      {urgencyTrigger && activeVariant?.elements.urgencyBanner && (
        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white py-2 px-4 text-center relative">
          <div className="flex items-center justify-center space-x-2">
            <span className="animate-pulse">🔥</span>
            <span className="font-semibold">{urgencyTrigger.content.message}</span>
            {scarcityTrigger && (
              <span className="bg-white text-red-600 px-2 py-1 rounded text-sm font-bold">
                {formatTime(timeLeft)}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Social Proof Notification */}
      {showNotification && currentNotification && (
        <div className="fixed bottom-20 left-4 bg-white border border-green-200 rounded-lg shadow-lg p-4 z-50
                      transform transition-all duration-500 ease-out max-w-sm">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-xl">✈️</span>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-900">
                  {currentNotification.name.split(' ')[0]}
                </span>
                {currentNotification.verified && (
                  <span className="text-green-500">✓</span>
                )}
              </div>
              <p className="text-sm text-gray-600">
                Acabou de reservar para{' '}
                <span className="font-medium">{currentNotification.destination.city}</span>
              </p>
              <p className="text-xs text-green-600 font-medium">
                Economizou ${currentNotification.destination.savings}
              </p>
            </div>
            <div className="text-xs text-gray-400">
              {currentNotification.timeAgo}min
            </div>
          </div>
        </div>
      )}

      {/* Trust Badges */}
      {activeVariant?.elements.trustBadges && (
        <div className="bg-gray-50 py-4">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center justify-center space-x-8">
              <div className="flex items-center space-x-2 text-gray-600">
                <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">Certificado SSL</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"/>
                  <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">Pagamento Seguro</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-sm font-medium">4.8/5 - 25.000+ Avaliações</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <span className="text-lg">🏆</span>
                <span className="text-sm font-medium">Melhor Agência 2024</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="relative">
        {children}
      </div>

      {/* Scarcity Footer */}
      {scarcityTrigger && timeLeft > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-red-600 text-white py-3 px-4 z-40">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="animate-pulse">⏰</span>
              <span className="font-semibold">{scarcityTrigger.content.message}</span>
            </div>
            <div className="text-2xl font-bold font-mono">
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>
      )}

      {/* Exit Intent Modal */}
      {showExitIntent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 relative transform transition-all duration-300 scale-100">
            <button
              onClick={closeExitIntent}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="text-center">
              <div className="text-6xl mb-4">✈️</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Espere! Não perca esta oportunidade!
              </h3>
              <p className="text-gray-600 mb-6">
                Deixe seu email e ganhe <span className="font-bold text-green-600">15% de desconto</span> na sua próxima viagem
              </p>
              
              <div className="space-y-4">
                <input
                  type="email"
                  placeholder="Seu melhor email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={() => {
                    handleConversion('exit_intent_email', { timestamp: Date.now() });
                    closeExitIntent();
                  }}
                  className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold
                           hover:bg-green-700 transition-colors duration-200"
                >
                  Garantir Meu Desconto
                </button>
              </div>
              
              <p className="text-xs text-gray-500 mt-4">
                * Válido por 24 horas. Não perca!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Sticky CTA (if variant specifies) */}
      {activeVariant?.elements.ctaPosition === 'sticky' && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-30">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Ofertas limitadas disponíveis</div>
              <div className="font-semibold text-gray-900">Encontre sua viagem dos sonhos</div>
            </div>
            <button
              onClick={() => handleConversion('sticky_cta_click', { position: 'bottom' })}
              className={`px-6 py-3 rounded-lg font-semibold text-white transition-colors duration-200
                        ${activeVariant.elements.ctaColor === 'red' ? 'bg-red-600 hover:bg-red-700' :
                          activeVariant.elements.ctaColor === 'green' ? 'bg-green-600 hover:bg-green-700' :
                          'bg-blue-600 hover:bg-blue-700'}`}
            >
              {activeVariant.elements.ctaText || 'Buscar Voos'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Price comparison component
export function PriceComparison({
  currentPrice,
  originalPrice,
  competitorPrices = [],
  savings
}: {
  currentPrice: number;
  originalPrice: number;
  competitorPrices?: { name: string; price: number }[];
  savings: number;
}) {
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="text-lg font-bold text-gray-900">
          Preço Fly2Any: <span className="text-green-600">${currentPrice}</span>
        </div>
        {savings > 0 && (
          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
            Economize ${savings}!
          </div>
        )}
      </div>
      
      {competitorPrices.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">Compare com outros sites:</div>
          {competitorPrices.map((competitor, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span className="text-gray-600">{competitor.name}</span>
              <span className="text-gray-500 line-through">${competitor.price}</span>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-3 text-xs text-gray-500">
        * Preços podem variar. Comparação baseada em pesquisas recentes.
      </div>
    </div>
  );
}