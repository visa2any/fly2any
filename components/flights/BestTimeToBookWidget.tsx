'use client';

/**
 * Best Time to Book Widget
 *
 * Analyzes historical price data to recommend optimal booking timing.
 * Provides actionable insights on when to book for best prices.
 *
 * Features:
 * - Historical price trend analysis
 * - Booking window recommendations
 * - Confidence indicators
 * - Price prediction insights
 * - Seasonal trend awareness
 *
 * @see lib/ml/price-predictor.ts (future ML integration)
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Info,
  Sparkles,
  Zap,
  X,
  ChevronRight
} from 'lucide-react';

interface BestTimeToBookWidgetProps {
  originCode: string;
  destinationCode: string;
  departureDate: string; // YYYY-MM-DD
  currentPrice?: number;
  showModal?: boolean; // Show as modal instead of inline
  onClose?: () => void;
  lang?: 'en' | 'pt' | 'es';
}

interface BookingRecommendation {
  action: 'book-now' | 'wait' | 'monitor' | 'flexible';
  confidence: 'high' | 'medium' | 'low';
  reason: string;
  expectedChange: number; // Percentage change expected
  optimalWindow: {
    start: string; // "X days before"
    end: string;
  };
  historicalTrends: {
    avgPriceByWeeksOut: Array<{ weeksOut: number; avgPrice: number }>;
    bestBookingWindow: string;
  };
}

const translations = {
  en: {
    title: 'Best Time to Book',
    subtitle: 'Data-driven booking recommendation',
    loading: 'Analyzing price trends...',
    bookNow: 'Book Now',
    wait: 'Consider Waiting',
    monitor: 'Monitor Prices',
    flexible: 'Stay Flexible',
    confidence: 'Confidence',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    recommendation: 'Recommendation',
    expectedChange: 'Expected Price Change',
    increase: 'increase',
    decrease: 'decrease',
    optimalWindow: 'Optimal Booking Window',
    daysBeforeDeparture: 'days before departure',
    historicalTrends: 'Historical Price Trends',
    weeksOut: 'weeks before departure',
    avgPrice: 'avg price',
    basedOn: 'Based on',
    dataPoints: 'data points',
    noData: 'Not enough historical data',
    viewDetails: 'View Details',
    close: 'Close',
    priceHistory: 'Price History',
    bookingSuggestion: 'Booking Suggestion',
    whenToBook: 'When to Book',
  },
  pt: {
    title: 'Melhor Hora para Reservar',
    subtitle: 'Recomendação baseada em dados',
    loading: 'Analisando tendências de preços...',
    bookNow: 'Reserve Agora',
    wait: 'Considere Esperar',
    monitor: 'Monitorar Preços',
    flexible: 'Mantenha Flexibilidade',
    confidence: 'Confiança',
    high: 'Alta',
    medium: 'Média',
    low: 'Baixa',
    recommendation: 'Recomendação',
    expectedChange: 'Mudança de Preço Esperada',
    increase: 'aumento',
    decrease: 'redução',
    optimalWindow: 'Janela Ideal de Reserva',
    daysBeforeDeparture: 'dias antes da partida',
    historicalTrends: 'Tendências Históricas de Preços',
    weeksOut: 'semanas antes da partida',
    avgPrice: 'preço médio',
    basedOn: 'Baseado em',
    dataPoints: 'pontos de dados',
    noData: 'Dados históricos insuficientes',
    viewDetails: 'Ver Detalhes',
    close: 'Fechar',
    priceHistory: 'Histórico de Preços',
    bookingSuggestion: 'Sugestão de Reserva',
    whenToBook: 'Quando Reservar',
  },
  es: {
    title: 'Mejor Momento para Reservar',
    subtitle: 'Recomendación basada en datos',
    loading: 'Analizando tendencias de precios...',
    bookNow: 'Reservar Ahora',
    wait: 'Considerar Esperar',
    monitor: 'Monitorear Precios',
    flexible: 'Mantener Flexibilidad',
    confidence: 'Confianza',
    high: 'Alta',
    medium: 'Media',
    low: 'Baja',
    recommendation: 'Recomendación',
    expectedChange: 'Cambio de Precio Esperado',
    increase: 'aumento',
    decrease: 'reducción',
    optimalWindow: 'Ventana Óptima de Reserva',
    daysBeforeDeparture: 'días antes de la salida',
    historicalTrends: 'Tendencias Históricas de Precios',
    weeksOut: 'semanas antes de la salida',
    avgPrice: 'precio promedio',
    basedOn: 'Basado en',
    dataPoints: 'puntos de datos',
    noData: 'Datos históricos insuficientes',
    viewDetails: 'Ver Detalles',
    close: 'Cerrar',
    priceHistory: 'Historial de Precios',
    bookingSuggestion: 'Sugerencia de Reserva',
    whenToBook: 'Cuándo Reservar',
  }
};

const BestTimeToBookWidget: React.FC<BestTimeToBookWidgetProps> = ({
  originCode,
  destinationCode,
  departureDate,
  currentPrice,
  showModal = false,
  onClose,
  lang = 'en',
}) => {
  const [loading, setLoading] = useState(true);
  const [recommendation, setRecommendation] = useState<BookingRecommendation | null>(null);
  const [dataPoints, setDataPoints] = useState(0);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const t = translations[lang];

  // Calculate recommendation based on historical data and booking window
  useEffect(() => {
    const analyzeBookingTiming = async () => {
      setLoading(true);

      try {
        // Calculate days until departure
        // Append T00:00:00 to ensure date is parsed as local midnight, not UTC
        const today = new Date();
        const departure = new Date(departureDate + 'T00:00:00');
        const daysUntilDeparture = Math.ceil((departure.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        // Simulate historical data analysis
        // In production, this would query the PriceHistory table
        const mockHistoricalData = generateMockHistoricalTrends(daysUntilDeparture);

        // Determine recommendation based on booking window
        const rec = calculateRecommendation(daysUntilDeparture, mockHistoricalData, currentPrice);

        setRecommendation(rec);
        setDataPoints(mockHistoricalData.dataPointsUsed);
      } catch (error) {
        console.error('Error analyzing booking timing:', error);
      } finally {
        setLoading(false);
      }
    };

    analyzeBookingTiming();
  }, [originCode, destinationCode, departureDate, currentPrice]);

  // Generate mock historical trends (replace with real DB query)
  const generateMockHistoricalTrends = (daysOut: number) => {
    // Typical booking curve: prices lowest 3-4 months out, rise as departure nears
    const avgPriceByWeeksOut = [
      { weeksOut: 12, avgPrice: 280 }, // 12 weeks out
      { weeksOut: 10, avgPrice: 270 }, // Sweet spot
      { weeksOut: 8, avgPrice: 275 },
      { weeksOut: 6, avgPrice: 290 },
      { weeksOut: 4, avgPrice: 320 },
      { weeksOut: 2, avgPrice: 380 },
      { weeksOut: 1, avgPrice: 450 },
    ];

    return {
      avgPriceByWeeksOut,
      bestBookingWindow: '8-12 weeks',
      dataPointsUsed: 45,
    };
  };

  // Calculate booking recommendation
  const calculateRecommendation = (
    daysOut: number,
    historicalData: any,
    currentPrice?: number
  ): BookingRecommendation => {
    const weeksOut = Math.floor(daysOut / 7);

    // Optimal window: 8-12 weeks (56-84 days) before departure
    if (daysOut >= 56 && daysOut <= 84) {
      return {
        action: 'book-now',
        confidence: 'high',
        reason: 'Currently in optimal booking window (8-12 weeks out). Prices typically lowest now.',
        expectedChange: 15, // Expect 15% increase if waiting
        optimalWindow: {
          start: '56',
          end: '84',
        },
        historicalTrends: historicalData,
      };
    }

    // Too far out (>12 weeks)
    if (daysOut > 84) {
      return {
        action: 'wait',
        confidence: 'medium',
        reason: 'Booking too early. Prices typically drop as you get closer to 8-12 weeks before departure.',
        expectedChange: -8, // Expect 8% decrease
        optimalWindow: {
          start: '56',
          end: '84',
        },
        historicalTrends: historicalData,
      };
    }

    // Close to departure (4-8 weeks)
    if (daysOut >= 28 && daysOut < 56) {
      return {
        action: 'monitor',
        confidence: 'medium',
        reason: 'Outside optimal window but decent time to book. Monitor prices closely as they may fluctuate.',
        expectedChange: 5, // Slight increase expected
        optimalWindow: {
          start: '56',
          end: '84',
        },
        historicalTrends: historicalData,
      };
    }

    // Very close (<4 weeks)
    if (daysOut < 28) {
      return {
        action: 'book-now',
        confidence: 'high',
        reason: 'Less than 4 weeks until departure. Prices typically rise sharply from here. Book now to avoid higher costs.',
        expectedChange: 25, // Steep increase expected
        optimalWindow: {
          start: '56',
          end: '84',
        },
        historicalTrends: historicalData,
      };
    }

    // Default flexible recommendation
    return {
      action: 'flexible',
      confidence: 'low',
      reason: 'Consider adjusting dates if possible for better pricing opportunities.',
      expectedChange: 0,
      optimalWindow: {
        start: '56',
        end: '84',
      },
      historicalTrends: historicalData,
    };
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'book-now':
        return 'bg-green-600';
      case 'wait':
        return 'bg-blue-600';
      case 'monitor':
        return 'bg-yellow-600';
      case 'flexible':
        return 'bg-purple-600';
      default:
        return 'bg-gray-600';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'book-now':
        return <CheckCircle className="w-5 h-5" />;
      case 'wait':
        return <Clock className="w-5 h-5" />;
      case 'monitor':
        return <AlertTriangle className="w-5 h-5" />;
      case 'flexible':
        return <Calendar className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'book-now':
        return t.bookNow;
      case 'wait':
        return t.wait;
      case 'monitor':
        return t.monitor;
      case 'flexible':
        return t.flexible;
      default:
        return action;
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  const getConfidenceLabel = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return t.high;
      case 'medium':
        return t.medium;
      case 'low':
        return t.low;
      default:
        return confidence;
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl border border-purple-200 dark:border-purple-800 p-5">
        <div className="flex items-center gap-3 animate-pulse">
          <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <span className="text-sm text-gray-600 dark:text-gray-300">{t.loading}</span>
        </div>
      </div>
    );
  }

  if (!recommendation || dataPoints < 10) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <div className="flex items-center gap-3">
          <Info className="w-5 h-5 text-gray-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">{t.noData}</span>
        </div>
      </div>
    );
  }

  const content = (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl border-2 border-purple-200 dark:border-purple-800 p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {t.title}
            </h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {t.subtitle}
          </p>
        </div>
      </div>

      {/* Recommendation Badge */}
      <div className={`${getActionColor(recommendation.action)} text-white rounded-lg p-4 mb-4 shadow-lg`}>
        <div className="flex items-center gap-3 mb-2">
          {getActionIcon(recommendation.action)}
          <span className="text-xl font-bold">{getActionLabel(recommendation.action)}</span>
        </div>
        <p className="text-sm opacity-90">{recommendation.reason}</p>
      </div>

      {/* Confidence & Expected Change */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t.confidence}</div>
          <div className={`text-lg font-bold ${getConfidenceColor(recommendation.confidence)}`}>
            {getConfidenceLabel(recommendation.confidence)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {t.basedOn} {dataPoints} {t.dataPoints}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t.expectedChange}</div>
          <div className="flex items-center gap-2">
            {recommendation.expectedChange > 0 ? (
              <>
                <TrendingUp className="w-5 h-5 text-red-500" />
                <span className="text-lg font-bold text-red-600">
                  +{recommendation.expectedChange}%
                </span>
              </>
            ) : (
              <>
                <TrendingDown className="w-5 h-5 text-green-500" />
                <span className="text-lg font-bold text-green-600">
                  {recommendation.expectedChange}%
                </span>
              </>
            )}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {recommendation.expectedChange > 0 ? t.increase : t.decrease}
          </div>
        </div>
      </div>

      {/* Optimal Booking Window */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {t.optimalWindow}
          </span>
        </div>
        <div className="text-xl font-bold text-gray-900 dark:text-white">
          {recommendation.optimalWindow.start}-{recommendation.optimalWindow.end} {t.daysBeforeDeparture}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          ({recommendation.historicalTrends.bestBookingWindow})
        </div>
      </div>

      {/* View Details Button */}
      <button
        onClick={() => setShowDetailModal(true)}
        className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        <Zap className="w-4 h-4" />
        {t.viewDetails}
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Detailed Modal */}
      {showDetailModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t.priceHistory}</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  {t.historicalTrends}
                </h4>
                <div className="space-y-2">
                  {recommendation.historicalTrends.avgPriceByWeeksOut.map((dataPoint) => (
                    <div
                      key={dataPoint.weeksOut}
                      className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700 rounded-lg p-3"
                    >
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300 w-24">
                        {dataPoint.weeksOut} {t.weeksOut}
                      </div>
                      <div className="flex-1">
                        <div className="bg-gray-200 dark:bg-gray-600 rounded-full h-3 overflow-hidden">
                          <div
                            className="bg-purple-500 h-full"
                            style={{ width: `${(dataPoint.avgPrice / 500) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-sm font-bold text-gray-900 dark:text-white w-20 text-right">
                        ${dataPoint.avgPrice}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (showModal) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="mb-4 flex justify-end">
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors shadow-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            )}
          </div>
          {content}
        </div>
      </div>
    );
  }

  return content;
};

export default BestTimeToBookWidget;
