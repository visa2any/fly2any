'use client';

import { useState, useEffect } from 'react';
import { spacing, typography, colors, dimensions } from '@/lib/design-system';

// ===========================
// TYPE DEFINITIONS
// ===========================

export type PriceTrend = 'rising' | 'stable' | 'falling';
export type BookingRecommendation = 'book_now' | 'wait' | 'monitor';

export interface PriceStatistics {
  currentPrice: number;
  averagePrice: number;
  lowestPrice: number;
  highestPrice: number;
  priceHistory: PriceHistoryPoint[];
  trendPercentage: number;
  trend: PriceTrend;
}

export interface PriceHistoryPoint {
  date: string;
  price: number;
}

export interface FlightRoute {
  from: string;
  to: string;
  departureDate: string;
}

export interface PriceInsightsProps {
  route: FlightRoute;
  statistics: PriceStatistics;
  currency?: string;
  lang?: 'en' | 'pt' | 'es';
  className?: string;
}

// ===========================
// TRANSLATIONS
// ===========================

const translations = {
  en: {
    title: 'AI Price Insights',
    priceTrend: 'Price Trend',
    aiPrediction: 'AI Prediction',
    recommendation: 'Recommendation',
    averagePrice: 'Average Price',
    priceComparison: 'Price Comparison',
    priceHistory: 'Price History (30 days)',
    bestTimeToBook: 'Best Time to Book',
    trends: {
      rising: 'Rising',
      stable: 'Stable',
      falling: 'Falling',
    },
    predictions: {
      rising: 'Prices likely to RISE {percentage}% in next 48h',
      stable: 'Prices expected to remain STABLE for next 2-3 days',
      falling: 'Prices predicted to DROP {percentage}% within 72h',
    },
    recommendations: {
      book_now: 'Book Now - Best Time!',
      wait: 'Wait & Monitor',
      monitor: 'Track Prices',
    },
    recommendationDetails: {
      book_now: 'Current price is excellent. Book before it increases!',
      wait: 'Prices may drop soon. Wait a few days and check back.',
      monitor: 'Prices are stable. Track for better deals.',
    },
    priceComparisonText: {
      below: '{percentage}% below average',
      above: '{percentage}% above average',
      equal: 'Equal to average',
    },
    urgencyMessages: {
      high: 'Act Fast! Prices rising rapidly',
      medium: 'Good deal available now',
      low: 'No rush, prices stable',
    },
    bestTimeTips: {
      rising: 'Book within 24-48 hours for best price',
      stable: 'Book within 3-5 days to secure current rate',
      falling: 'Wait 2-3 days for potential price drop',
    },
    lowestPrice: 'Lowest: {currency}{price}',
    highestPrice: 'Highest: {currency}{price}',
  },
  pt: {
    title: 'Insights de Preço IA',
    priceTrend: 'Tendência de Preço',
    aiPrediction: 'Previsão IA',
    recommendation: 'Recomendação',
    averagePrice: 'Preço Médio',
    priceComparison: 'Comparação de Preço',
    priceHistory: 'Histórico de Preços (30 dias)',
    bestTimeToBook: 'Melhor Hora para Reservar',
    trends: {
      rising: 'Subindo',
      stable: 'Estável',
      falling: 'Caindo',
    },
    predictions: {
      rising: 'Preços provavelmente SUBIRÃO {percentage}% nas próximas 48h',
      stable: 'Preços devem permanecer ESTÁVEIS pelos próximos 2-3 dias',
      falling: 'Preços previstos para CAIR {percentage}% em 72h',
    },
    recommendations: {
      book_now: 'Reserve Agora - Melhor Momento!',
      wait: 'Aguarde & Monitore',
      monitor: 'Rastreie Preços',
    },
    recommendationDetails: {
      book_now: 'Preço atual está excelente. Reserve antes que aumente!',
      wait: 'Preços podem cair em breve. Aguarde alguns dias.',
      monitor: 'Preços estão estáveis. Rastreie para melhores ofertas.',
    },
    priceComparisonText: {
      below: '{percentage}% abaixo da média',
      above: '{percentage}% acima da média',
      equal: 'Igual à média',
    },
    urgencyMessages: {
      high: 'Aja Rápido! Preços subindo rapidamente',
      medium: 'Boa oferta disponível agora',
      low: 'Sem pressa, preços estáveis',
    },
    bestTimeTips: {
      rising: 'Reserve em 24-48 horas para melhor preço',
      stable: 'Reserve em 3-5 dias para garantir taxa atual',
      falling: 'Aguarde 2-3 dias para possível queda de preço',
    },
    lowestPrice: 'Mais Baixo: {currency}{price}',
    highestPrice: 'Mais Alto: {currency}{price}',
  },
  es: {
    title: 'Insights de Precio IA',
    priceTrend: 'Tendencia de Precio',
    aiPrediction: 'Predicción IA',
    recommendation: 'Recomendación',
    averagePrice: 'Precio Promedio',
    priceComparison: 'Comparación de Precio',
    priceHistory: 'Historial de Precios (30 días)',
    bestTimeToBook: 'Mejor Momento para Reservar',
    trends: {
      rising: 'Subiendo',
      stable: 'Estable',
      falling: 'Bajando',
    },
    predictions: {
      rising: 'Los precios probablemente SUBIRÁN {percentage}% en las próximas 48h',
      stable: 'Se espera que los precios permanezcan ESTABLES durante 2-3 días',
      falling: 'Se prevé que los precios BAJEN {percentage}% en 72h',
    },
    recommendations: {
      book_now: 'Reserve Ahora - ¡Mejor Momento!',
      wait: 'Espere y Monitoree',
      monitor: 'Rastree Precios',
    },
    recommendationDetails: {
      book_now: '¡El precio actual es excelente. Reserve antes de que aumente!',
      wait: 'Los precios pueden bajar pronto. Espere unos días.',
      monitor: 'Los precios están estables. Rastree para mejores ofertas.',
    },
    priceComparisonText: {
      below: '{percentage}% por debajo del promedio',
      above: '{percentage}% por encima del promedio',
      equal: 'Igual al promedio',
    },
    urgencyMessages: {
      high: '¡Actúe Rápido! Precios subiendo rápidamente',
      medium: 'Buena oferta disponible ahora',
      low: 'Sin prisa, precios estables',
    },
    bestTimeTips: {
      rising: 'Reserve en 24-48 horas para mejor precio',
      stable: 'Reserve en 3-5 días para asegurar tarifa actual',
      falling: 'Espere 2-3 días para posible caída de precio',
    },
    lowestPrice: 'Más Bajo: {currency}{price}',
    highestPrice: 'Más Alto: {currency}{price}',
  },
};

// ===========================
// UTILITY FUNCTIONS
// ===========================

const calculatePriceComparison = (currentPrice: number, averagePrice: number): number => {
  const difference = ((currentPrice - averagePrice) / averagePrice) * 100;
  return Math.round(difference);
};

const getRecommendation = (trend: PriceTrend, priceComparison: number): BookingRecommendation => {
  if (trend === 'rising' || priceComparison < -10) {
    return 'book_now';
  } else if (trend === 'falling') {
    return 'wait';
  }
  return 'monitor';
};

const getUrgencyLevel = (trend: PriceTrend, trendPercentage: number): 'high' | 'medium' | 'low' => {
  if (trend === 'rising' && trendPercentage > 15) return 'high';
  if (trend === 'rising' || trend === 'falling') return 'medium';
  return 'low';
};

// ===========================
// SUB-COMPONENTS
// ===========================

const TrendIndicator: React.FC<{
  trend: PriceTrend;
  percentage: number;
  lang: 'en' | 'pt' | 'es';
}> = ({ trend, percentage, lang }) => {
  const t = translations[lang];

  const trendConfig = {
    rising: {
      icon: '📈',
      arrow: '↗',
      color: 'text-error',
      bgColor: 'bg-error/10',
      borderColor: 'border-error/30',
      gradient: 'from-error/20 to-error/5',
    },
    stable: {
      icon: '━',
      arrow: '→',
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      borderColor: 'border-warning/30',
      gradient: 'from-warning/20 to-warning/5',
    },
    falling: {
      icon: '📉',
      arrow: '↘',
      color: 'text-success',
      bgColor: 'bg-success/10',
      borderColor: 'border-success/30',
      gradient: 'from-success/20 to-success/5',
    },
  };

  const config = trendConfig[trend];

  return (
    <div className={`flex items-center rounded-lg border ${config.borderColor} bg-gradient-to-br ${config.gradient}`} style={{ padding: spacing.sm, gap: spacing.sm }}>
      <span style={{ fontSize: '22px' }}>{config.icon}</span>
      <div className="flex-1">
        <div className={`font-semibold ${config.color}`} style={{ fontSize: typography.card.meta.size }}>
          {t.trends[trend]}
        </div>
        <div className={`font-bold ${config.color} flex items-center`} style={{ fontSize: typography.card.price.size, gap: spacing.xs }}>
          <span style={{ fontSize: typography.card.title.size }}>{config.arrow}</span>
          {percentage}%
        </div>
      </div>
    </div>
  );
};

const PriceHistoryChart: React.FC<{
  history: PriceHistoryPoint[];
  currentPrice: number;
  averagePrice: number;
  currency: string;
}> = ({ history, currentPrice, averagePrice, currency }) => {
  if (history.length === 0) return null;

  const maxPrice = Math.max(...history.map(p => p.price), currentPrice);
  const minPrice = Math.min(...history.map(p => p.price), currentPrice);
  const range = maxPrice - minPrice;

  return (
    <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg" style={{ height: '100px', padding: spacing.sm }}>
      {/* Average Price Line */}
      <div
        className="absolute border-t-2 border-dashed border-primary-300"
        style={{
          left: spacing.sm,
          right: spacing.sm,
          bottom: `${((averagePrice - minPrice) / range) * 80 + 10}%`,
        }}
      >
        <span className="absolute right-0 font-semibold text-primary-600" style={{ top: '-18px', fontSize: typography.card.meta.size }}>
          Avg: {currency}{averagePrice.toFixed(0)}
        </span>
      </div>

      {/* Price Line Chart */}
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="priceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0087FF" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#0087FF" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* Area under the line */}
        <path
          d={`
            M 0,${100 - ((history[0].price - minPrice) / range) * 100}
            ${history.map((point, idx) => {
              const x = (idx / (history.length - 1)) * 100;
              const y = 100 - ((point.price - minPrice) / range) * 100;
              return `L ${x},${y}`;
            }).join(' ')}
            L 100,100
            L 0,100
            Z
          `}
          fill="url(#priceGradient)"
        />

        {/* Price line */}
        <polyline
          points={history.map((point, idx) => {
            const x = (idx / (history.length - 1)) * 100;
            const y = 100 - ((point.price - minPrice) / range) * 100;
            return `${x},${y}`;
          }).join(' ')}
          fill="none"
          stroke="#0087FF"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />

        {/* Data points */}
        {history.map((point, idx) => {
          const x = (idx / (history.length - 1)) * 100;
          const y = 100 - ((point.price - minPrice) / range) * 100;
          return (
            <circle
              key={idx}
              cx={x}
              cy={y}
              r="1.5"
              fill="#0057B7"
              vectorEffect="non-scaling-stroke"
            />
          );
        })}
      </svg>
    </div>
  );
};

const AIPredictionBanner: React.FC<{
  trend: PriceTrend;
  percentage: number;
  urgencyLevel: 'high' | 'medium' | 'low';
  lang: 'en' | 'pt' | 'es';
}> = ({ trend, percentage, urgencyLevel, lang }) => {
  const t = translations[lang];
  const [isPulsing, setIsPulsing] = useState(false);

  useEffect(() => {
    if (urgencyLevel === 'high') {
      setIsPulsing(true);
    }
  }, [urgencyLevel]);

  const predictionText = t.predictions[trend].replace('{percentage}', percentage.toString());

  const urgencyConfig = {
    high: {
      bgGradient: 'from-error via-error/90 to-error',
      textColor: 'text-white',
      icon: '🔥',
      animate: 'animate-pulse',
    },
    medium: {
      bgGradient: 'from-primary-500 via-primary-600 to-primary-700',
      textColor: 'text-white',
      icon: '💡',
      animate: '',
    },
    low: {
      bgGradient: 'from-gray-500 via-gray-600 to-gray-700',
      textColor: 'text-white',
      icon: '📊',
      animate: '',
    },
  };

  const config = urgencyConfig[urgencyLevel];

  return (
    <div
      className={`
        relative overflow-hidden
        rounded-lg
        bg-gradient-to-r ${config.bgGradient}
        shadow-md
        ${isPulsing ? config.animate : ''}
      `}
      style={{ padding: spacing.sm }}
    >
      {/* Animated background shimmer for high urgency */}
      {urgencyLevel === 'high' && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
      )}

      <div className="relative flex items-center" style={{ gap: spacing.sm }}>
        <span style={{ fontSize: '22px' }}>{config.icon}</span>
        <div className="flex-1">
          <div className={`font-semibold ${config.textColor} opacity-90`} style={{ fontSize: typography.card.meta.size, marginBottom: spacing.xs }}>
            {t.aiPrediction}
          </div>
          <div className={`font-bold ${config.textColor}`} style={{ fontSize: typography.card.body.size }}>
            {predictionText}
          </div>
        </div>
      </div>
    </div>
  );
};

const RecommendationCard: React.FC<{
  recommendation: BookingRecommendation;
  urgencyMessage: string;
  lang: 'en' | 'pt' | 'es';
}> = ({ recommendation, urgencyMessage, lang }) => {
  const t = translations[lang];

  const recommendationConfig = {
    book_now: {
      icon: '✅',
      bgColor: 'bg-gradient-to-br from-success/20 to-success/5',
      borderColor: 'border-success',
      textColor: 'text-success',
      iconBg: 'bg-success',
    },
    wait: {
      icon: '⏳',
      bgColor: 'bg-gradient-to-br from-warning/20 to-warning/5',
      borderColor: 'border-warning',
      textColor: 'text-warning',
      iconBg: 'bg-warning',
    },
    monitor: {
      icon: '👀',
      bgColor: 'bg-gradient-to-br from-info/20 to-info/5',
      borderColor: 'border-info',
      textColor: 'text-info',
      iconBg: 'bg-info',
    },
  };

  const config = recommendationConfig[recommendation];

  return (
    <div className={`rounded-lg border ${config.borderColor} ${config.bgColor}`} style={{ padding: spacing.sm }}>
      <div className="flex items-center" style={{ gap: spacing.sm, marginBottom: spacing.xs }}>
        <div className={`rounded-full ${config.iconBg} flex items-center justify-center text-white`} style={{ width: '32px', height: '32px', fontSize: '16px' }}>
          {config.icon}
        </div>
        <div className="flex-1">
          <div className="text-gray-600 font-medium" style={{ fontSize: typography.card.meta.size, marginBottom: spacing.xs }}>
            {t.recommendation}
          </div>
          <div className={`font-bold ${config.textColor}`} style={{ fontSize: typography.card.title.size }}>
            {t.recommendations[recommendation]}
          </div>
        </div>
      </div>
      <div className="text-gray-700" style={{ fontSize: typography.card.body.size, marginTop: spacing.sm }}>
        {t.recommendationDetails[recommendation]}
      </div>
      <div className={`font-semibold ${config.textColor}`} style={{ fontSize: typography.card.meta.size, marginTop: spacing.sm }}>
        {urgencyMessage}
      </div>
    </div>
  );
};

// ===========================
// MAIN COMPONENT
// ===========================

export const PriceInsights: React.FC<PriceInsightsProps> = ({
  route,
  statistics,
  currency = 'USD',
  lang = 'en',
  className = '',
}) => {
  const t = translations[lang];
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const priceComparison = calculatePriceComparison(statistics.currentPrice, statistics.averagePrice);
  const recommendation = getRecommendation(statistics.trend, priceComparison);
  const urgencyLevel = getUrgencyLevel(statistics.trend, statistics.trendPercentage);

  const getPriceComparisonText = () => {
    const absComparison = Math.abs(priceComparison);
    if (priceComparison < -2) {
      return t.priceComparisonText.below.replace('{percentage}', absComparison.toString());
    } else if (priceComparison > 2) {
      return t.priceComparisonText.above.replace('{percentage}', absComparison.toString());
    }
    return t.priceComparisonText.equal;
  };

  // Import currency service for proper symbol handling
  const { getCurrencySymbol } = require('@/lib/services/currency');
  const currencySymbol = getCurrencySymbol(currency);

  return (
    <div
      className={`
        relative
        bg-white/90 backdrop-blur-md
        rounded-xl
        border border-gray-200/50
        shadow-lg
        overflow-hidden
        transition-all duration-500
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        ${className}
      `}
    >
      {/* Glass Morphism Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-transparent to-primary-50/20 pointer-events-none" />

      {/* Content */}
      <div className="relative" style={{ padding: dimensions.card.padding }}>
        {/* Header */}
        <div className="flex items-center" style={{ gap: spacing.sm, marginBottom: spacing.md }}>
          <div className="rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white shadow-md" style={{ width: '36px', height: '36px', fontSize: '18px' }}>
            🤖
          </div>
          <div>
            <h3 className="font-bold text-gray-900" style={{ fontSize: typography.card.title.size }}>
              {t.title}
            </h3>
            <p className="text-gray-600" style={{ fontSize: typography.card.meta.size }}>
              {route.from} → {route.to}
            </p>
          </div>
        </div>

        {/* AI Prediction Banner */}
        <div style={{ marginBottom: spacing.sm }}>
          <AIPredictionBanner
            trend={statistics.trend}
            percentage={statistics.trendPercentage}
            urgencyLevel={urgencyLevel}
            lang={lang}
          />
        </div>

        {/* Trend and Recommendation Grid */}
        <div className="grid md:grid-cols-2" style={{ gap: spacing.sm, marginBottom: spacing.sm }}>
          <TrendIndicator
            trend={statistics.trend}
            percentage={statistics.trendPercentage}
            lang={lang}
          />

          <RecommendationCard
            recommendation={recommendation}
            urgencyMessage={t.urgencyMessages[urgencyLevel]}
            lang={lang}
          />
        </div>

        {/* Price Comparison */}
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-200" style={{ padding: spacing.sm, marginBottom: spacing.sm }}>
          <div className="flex items-center justify-between flex-wrap" style={{ gap: spacing.xs }}>
            <div>
              <div className="text-gray-600 font-medium" style={{ fontSize: typography.card.meta.size, marginBottom: spacing.xs }}>
                {t.averagePrice}
              </div>
              <div className="font-bold text-gray-900" style={{ fontSize: typography.card.price.size }}>
                {currencySymbol}{statistics.averagePrice.toFixed(2)}
              </div>
            </div>
            <div className="text-center">
              <div className={`
                inline-flex items-center rounded-full font-semibold
                ${priceComparison < 0 ? 'bg-success/10 text-success' : priceComparison > 0 ? 'bg-error/10 text-error' : 'bg-gray-100 text-gray-700'}
              `} style={{ gap: spacing.xs, padding: `${spacing.xs} ${spacing.sm}`, fontSize: typography.card.body.size }}>
                {priceComparison < 0 ? '↓' : priceComparison > 0 ? '↑' : '━'}
                {getPriceComparisonText()}
              </div>
            </div>
            <div className="text-right">
              <div className="text-gray-600 font-medium" style={{ fontSize: typography.card.meta.size, marginBottom: spacing.xs }}>
                {t.priceComparison}
              </div>
              <div className="font-bold text-primary-600" style={{ fontSize: typography.card.price.size }}>
                {currencySymbol}{statistics.currentPrice.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Price Range */}
          <div className="flex items-center justify-between border-t border-gray-200" style={{ marginTop: spacing.sm, paddingTop: spacing.sm }}>
            <span className="text-gray-600" style={{ fontSize: typography.card.meta.size }}>
              {t.lowestPrice
                .replace('{currency}', currencySymbol)
                .replace('{price}', statistics.lowestPrice.toFixed(2))}
            </span>
            <span className="text-gray-600" style={{ fontSize: typography.card.meta.size }}>
              {t.highestPrice
                .replace('{currency}', currencySymbol)
                .replace('{price}', statistics.highestPrice.toFixed(2))}
            </span>
          </div>
        </div>

        {/* Price History Chart */}
        <div style={{ marginBottom: spacing.sm }}>
          <h4 className="font-bold text-gray-900" style={{ fontSize: typography.card.body.size, marginBottom: spacing.xs }}>
            {t.priceHistory}
          </h4>
          <PriceHistoryChart
            history={statistics.priceHistory}
            currentPrice={statistics.currentPrice}
            averagePrice={statistics.averagePrice}
            currency={currencySymbol}
          />
        </div>

        {/* Best Time to Book */}
        <div className="bg-gradient-to-r from-primary-50 to-primary-100/50 rounded-lg border border-primary-200" style={{ padding: spacing.sm }}>
          <div className="flex items-start" style={{ gap: spacing.sm }}>
            <div className="rounded-full bg-primary-500 flex items-center justify-center text-white flex-shrink-0" style={{ width: '32px', height: '32px', fontSize: '16px' }}>
              💡
            </div>
            <div>
              <div className="font-bold text-primary-900" style={{ fontSize: typography.card.body.size, marginBottom: spacing.xs }}>
                {t.bestTimeToBook}
              </div>
              <div className="text-primary-800" style={{ fontSize: typography.card.body.size }}>
                {t.bestTimeTips[statistics.trend]}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Accent Border */}
      <div className="bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600" style={{ height: '3px' }} />
    </div>
  );
};

export default PriceInsights;
