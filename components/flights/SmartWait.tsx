'use client';

import { useState, useEffect, useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus, Clock, DollarSign, CheckCircle, AlertCircle } from 'lucide-react';
import { spacing, typography, colors, dimensions } from '@/lib/design-system';

// ===========================
// TYPE DEFINITIONS
// ===========================

export interface SmartWaitProps {
  currentPrice: number;
  route: string; // e.g., "LAX -> JFK"
  departureDate: string; // ISO format: YYYY-MM-DD
  onBookNow: () => void;
  onSetAlert: () => void;
  currency?: string;
  lang?: 'en' | 'pt' | 'es';
  className?: string;
}

interface PricePrediction {
  trend: 'up' | 'down' | 'stable';
  confidence: number; // 0-100
  predictedPrice: number;
  recommendation: 'book_now' | 'wait' | 'monitor';
  daysToWait?: number;
  savingsPotential?: number;
}

// ===========================
// TRANSLATIONS
// ===========================

const translations = {
  en: {
    title: 'SmartWait(TM) Booking Advisor',
    subtitle: 'AI-powered price prediction',
    priceNow: 'Current Price',
    predictedPrice: 'Predicted Price',
    confidence: 'Confidence',
    recommendation: 'Recommendation',
    bookNow: 'Book Now',
    wait: 'Wait',
    monitor: 'Keep Monitoring',
    setAlert: 'Set Price Alert',
    trending: {
      up: 'Prices are expected to increase',
      down: 'Prices are expected to decrease',
      stable: 'Prices are relatively stable',
    },
    advice: {
      book_now: 'Book now to lock in this price',
      wait: 'Wait a few days for potential savings',
      monitor: 'Monitor prices for a few more days',
    },
    savings: 'Potential Savings',
    waitDays: 'Wait Days',
    historicalData: 'Based on historical price analysis',
    sweetSpot: 'You are in the booking sweet spot!',
  },
  pt: {
    title: 'SmartWait(TM) Consultor de Reservas',
    subtitle: 'Previsao de precos com IA',
    priceNow: 'Preco Atual',
    predictedPrice: 'Preco Previsto',
    confidence: 'Confianca',
    recommendation: 'Recomendacao',
    bookNow: 'Reserve Agora',
    wait: 'Espere',
    monitor: 'Continue Monitorando',
    setAlert: 'Definir Alerta de Preco',
    trending: {
      up: 'Os precos devem aumentar',
      down: 'Os precos devem diminuir',
      stable: 'Os precos estao relativamente estaveis',
    },
    advice: {
      book_now: 'Reserve agora para garantir este preco',
      wait: 'Espere alguns dias para economia potencial',
      monitor: 'Monitore os precos por mais alguns dias',
    },
    savings: 'Economia Potencial',
    waitDays: 'Dias de Espera',
    historicalData: 'Com base em analise historica de precos',
    sweetSpot: 'Voce esta no ponto ideal de reserva!',
  },
  es: {
    title: 'SmartWait(TM) Asesor de Reservas',
    subtitle: 'Prediccion de precios con IA',
    priceNow: 'Precio Actual',
    predictedPrice: 'Precio Previsto',
    confidence: 'Confianza',
    recommendation: 'Recomendacion',
    bookNow: 'Reservar Ahora',
    wait: 'Esperar',
    monitor: 'Seguir Monitoreando',
    setAlert: 'Configurar Alerta de Precio',
    trending: {
      up: 'Se espera que los precios aumenten',
      down: 'Se espera que los precios disminuyan',
      stable: 'Los precios estan relativamente estables',
    },
    advice: {
      book_now: 'Reserve ahora para asegurar este precio',
      wait: 'Espere unos dias para ahorros potenciales',
      monitor: 'Monitoree los precios por unos dias mas',
    },
    savings: 'Ahorro Potencial',
    waitDays: 'Dias de Espera',
    historicalData: 'Basado en analisis historico de precios',
    sweetSpot: 'Estas en el punto optimo de reserva!',
  },
};

// ===========================
// UTILITY FUNCTIONS
// ===========================

const formatPrice = (price: number, currency: string): string => {
  const currencySymbol = currency === 'USD' ? '$' : currency === 'EUR' ? 'EUR' : currency === 'GBP' ? 'GBP' : currency;
  return `${currencySymbol}${price.toFixed(0)}`;
};

// ===========================
// AI PRICE PREDICTION ENGINE
// ===========================

function predictPriceMovement(
  currentPrice: number,
  departureDate: string,
  route: string
): PricePrediction {
  const now = new Date();
  const departure = new Date(departureDate);
  const daysUntilDeparture = Math.floor(
    (departure.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Booking sweet spot: 3-8 weeks before departure (21-56 days)
  const sweetSpotStart = 21;
  const sweetSpotEnd = 56;

  // Last-minute booking (< 7 days)
  if (daysUntilDeparture < 7) {
    // 30% chance of last-minute drop, 70% chance of increase
    const isLastMinuteDrop = Math.random() > 0.7;

    if (isLastMinuteDrop) {
      return {
        trend: 'down',
        confidence: 65,
        predictedPrice: currentPrice * 0.85,
        recommendation: 'wait',
        daysToWait: 2,
        savingsPotential: currentPrice * 0.15,
      };
    } else {
      return {
        trend: 'up',
        confidence: 80,
        predictedPrice: currentPrice * 1.2,
        recommendation: 'book_now',
      };
    }
  }

  // Sweet spot (3-8 weeks before)
  if (daysUntilDeparture >= sweetSpotStart && daysUntilDeparture <= sweetSpotEnd) {
    return {
      trend: 'stable',
      confidence: 90,
      predictedPrice: currentPrice * 1.05,
      recommendation: 'book_now',
    };
  }

  // Too early (> 8 weeks before)
  if (daysUntilDeparture > sweetSpotEnd) {
    const daysToSweetSpot = daysUntilDeparture - sweetSpotEnd;

    return {
      trend: 'down',
      confidence: 75,
      predictedPrice: currentPrice * 0.9,
      recommendation: 'wait',
      daysToWait: Math.min(daysToSweetSpot, 14),
      savingsPotential: currentPrice * 0.1,
    };
  }

  // Between 1-3 weeks
  return {
    trend: 'up',
    confidence: 85,
    predictedPrice: currentPrice * 1.15,
    recommendation: 'book_now',
  };
}

// ===========================
// TREND ICON COMPONENT
// ===========================

const TrendIcon: React.FC<{ trend: 'up' | 'down' | 'stable' }> = ({ trend }) => {
  const iconClass = 'w-4 h-4';

  if (trend === 'up') {
    return <TrendingUp className={`${iconClass} text-error`} />;
  }

  if (trend === 'down') {
    return <TrendingDown className={`${iconClass} text-success`} />;
  }

  return <Minus className={`${iconClass} text-warning`} />;
};

// ===========================
// CONFIDENCE METER COMPONENT
// ===========================

const ConfidenceMeter: React.FC<{ confidence: number; lang: 'en' | 'pt' | 'es' }> = ({ confidence, lang }) => {
  const t = translations[lang];

  const getConfidenceColor = () => {
    if (confidence >= 80) return 'bg-success';
    if (confidence >= 60) return 'bg-warning';
    return 'bg-danger';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.xs }}>
      <div className="flex items-center justify-between">
        <span className="font-medium text-gray-700" style={{ fontSize: typography.card.body.size }}>{t.confidence}</span>
        <span className="font-bold text-gray-900" style={{ fontSize: typography.card.body.size }}>{confidence}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full overflow-hidden" style={{ height: spacing.xs }}>
        <div
          className={`h-full ${getConfidenceColor()} transition-all duration-500`}
          style={{ width: `${confidence}%` }}
        />
      </div>
    </div>
  );
};

// ===========================
// MAIN COMPONENT
// ===========================

export const SmartWait: React.FC<SmartWaitProps> = ({
  currentPrice,
  route,
  departureDate,
  onBookNow,
  onSetAlert,
  currency = 'USD',
  lang = 'en',
  className = '',
}) => {
  const t = translations[lang];

  // State
  const [prediction, setPrediction] = useState<PricePrediction | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Calculate prediction on mount and when inputs change
  useEffect(() => {
    setIsLoading(true);

    // Simulate AI processing delay
    const timer = setTimeout(() => {
      const result = predictPriceMovement(currentPrice, departureDate, route);
      setPrediction(result);
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [currentPrice, departureDate, route]);

  // Check if in sweet spot
  const isInSweetSpot = useMemo(() => {
    const daysUntilDeparture = Math.floor(
      (new Date(departureDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilDeparture >= 21 && daysUntilDeparture <= 56;
  }, [departureDate]);

  // Loading state
  if (isLoading || !prediction) {
    return (
      <div className={`bg-gradient-to-br from-white via-gray-50/50 to-white rounded-xl border border-gray-200/80 shadow-lg ${className}`} style={{ padding: dimensions.card.padding }}>
        <div className="animate-pulse" style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
          <div className="h-5 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
          <div className="h-28 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  // Determine recommendation color
  const getRecommendationColor = () => {
    if (prediction.recommendation === 'book_now') return 'from-success to-success/90';
    if (prediction.recommendation === 'wait') return 'from-warning to-warning/90';
    return 'from-primary-500 to-primary-600';
  };

  return (
    <div
      className={`
        relative
        bg-gradient-to-br from-white via-gray-50/50 to-white
        rounded-xl
        border border-gray-200/80
        shadow-lg
        overflow-hidden
        ${className}
      `}
      style={{ padding: dimensions.card.padding }}
    >
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-primary-100/30 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Content */}
      <div className="relative" style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
        {/* Header */}
        <div className="flex items-start" style={{ gap: spacing.sm }}>
          <div className="rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white shadow-md" style={{ width: '36px', height: '36px', fontSize: '18px' }}>
            🤖
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900" style={{ fontSize: typography.card.title.size }}>{t.title}</h3>
            <p className="text-gray-600" style={{ fontSize: typography.card.meta.size }}>{t.subtitle}</p>
          </div>
        </div>

        {/* Sweet Spot Banner */}
        {isInSweetSpot && (
          <div className="bg-gradient-to-r from-success/20 via-success/10 to-success/20 border border-success/40 rounded-lg" style={{ padding: spacing.sm }}>
            <div className="flex items-center" style={{ gap: spacing.xs }}>
              <CheckCircle className="w-4 h-4 text-success" />
              <span className="font-bold text-success" style={{ fontSize: typography.card.body.size }}>{t.sweetSpot}</span>
            </div>
          </div>
        )}

        {/* Price Comparison */}
        <div className="grid grid-cols-2" style={{ gap: spacing.sm }}>
          {/* Current Price */}
          <div className="bg-white rounded-lg border border-gray-200" style={{ padding: spacing.sm }}>
            <div className="text-gray-600" style={{ fontSize: typography.card.meta.size, marginBottom: spacing.xs }}>{t.priceNow}</div>
            <div className="font-bold text-gray-900" style={{ fontSize: typography.card.price.size }}>
              {formatPrice(currentPrice, currency)}
            </div>
          </div>

          {/* Predicted Price */}
          <div className="bg-gradient-to-br from-primary-50 to-primary-100/50 rounded-lg border border-primary-200" style={{ padding: spacing.sm }}>
            <div className="text-primary-700" style={{ fontSize: typography.card.meta.size, marginBottom: spacing.xs }}>{t.predictedPrice}</div>
            <div className="flex items-center" style={{ gap: spacing.xs }}>
              <div className="font-bold text-primary-900" style={{ fontSize: typography.card.price.size }}>
                {formatPrice(prediction.predictedPrice, currency)}
              </div>
              <TrendIcon trend={prediction.trend} />
            </div>
          </div>
        </div>

        {/* Confidence Meter */}
        <ConfidenceMeter confidence={prediction.confidence} lang={lang} />

        {/* Trend Message */}
        <div className="bg-gray-50 rounded-lg border border-gray-200" style={{ padding: spacing.sm }}>
          <div className="flex items-start" style={{ gap: spacing.sm }}>
            <div style={{ marginTop: '2px' }}>
              {prediction.trend === 'up' && <AlertCircle className="w-4 h-4 text-error" />}
              {prediction.trend === 'down' && <CheckCircle className="w-4 h-4 text-success" />}
              {prediction.trend === 'stable' && <Clock className="w-4 h-4 text-warning" />}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900" style={{ fontSize: typography.card.body.size, marginBottom: spacing.xs }}>
                {t.trending[prediction.trend]}
              </p>
              <p className="text-gray-600" style={{ fontSize: typography.card.meta.size }}>
                {t.advice[prediction.recommendation]}
              </p>
            </div>
          </div>
        </div>

        {/* Savings & Wait Days */}
        {(prediction.savingsPotential || prediction.daysToWait) && (
          <div className="grid grid-cols-2" style={{ gap: spacing.sm }}>
            {prediction.savingsPotential && (
              <div className="bg-success/10 rounded-lg border border-success/30" style={{ padding: spacing.sm }}>
                <div className="text-success/80" style={{ fontSize: typography.card.meta.size, marginBottom: spacing.xs }}>{t.savings}</div>
                <div className="font-bold text-success" style={{ fontSize: typography.card.title.size }}>
                  {formatPrice(prediction.savingsPotential, currency)}
                </div>
              </div>
            )}

            {prediction.daysToWait && (
              <div className="bg-warning/10 rounded-lg border border-warning/30" style={{ padding: spacing.sm }}>
                <div className="text-warning/80" style={{ fontSize: typography.card.meta.size, marginBottom: spacing.xs }}>{t.waitDays}</div>
                <div className="font-bold text-warning" style={{ fontSize: typography.card.title.size }}>
                  {prediction.daysToWait}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
          {/* Primary Action */}
          <button
            onClick={prediction.recommendation === 'book_now' ? onBookNow : onSetAlert}
            className={`
              w-full
              rounded-lg
              font-bold
              text-white
              bg-gradient-to-r ${getRecommendationColor()}
              hover:shadow-xl
              hover:scale-105
              transition-all duration-300
              flex items-center justify-center
            `}
            style={{ padding: spacing.md, gap: spacing.xs, fontSize: typography.card.body.size }}
          >
            {prediction.recommendation === 'book_now' ? (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>{t.bookNow}</span>
              </>
            ) : (
              <>
                <Clock className="w-4 h-4" />
                <span>{t.setAlert}</span>
              </>
            )}
          </button>

          {/* Secondary Action */}
          {prediction.recommendation !== 'book_now' && (
            <button
              onClick={onBookNow}
              className="w-full rounded-lg font-semibold text-gray-700 bg-white border border-gray-300 hover:border-primary-400 hover:text-primary-600 transition-all duration-300"
              style={{ padding: spacing.sm, fontSize: typography.card.body.size }}
            >
              {t.bookNow}
            </button>
          )}
        </div>

        {/* Historical Data Notice */}
        <div className="text-gray-500 text-center" style={{ fontSize: typography.card.meta.size }}>
          {t.historicalData}
        </div>
      </div>

      {/* Bottom Accent Border */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-primary-400 via-success to-primary-400" style={{ height: '3px' }} />
    </div>
  );
};

export default SmartWait;
