'use client';

/**
 * Enhanced Alternative Airports Widget
 *
 * Powered by the new alternative-airports-engine with:
 * - Real historical price data
 * - ML-powered price estimation
 * - Total journey cost analysis
 * - Smart recommendation scoring
 * - Confidence indicators
 *
 * @see lib/airports/alternative-airports-engine.ts
 */

import React, { useState, useEffect } from 'react';
import {
  ChevronDown,
  ChevronUp,
  MapPin,
  TrendingDown,
  Clock,
  DollarSign,
  Train,
  Bus,
  Car,
  Navigation,
  Sparkles,
  AlertCircle,
  CheckCircle,
  Info,
  Zap
} from 'lucide-react';
import type { AlternativeAirportsAnalysis } from '@/lib/airports/alternative-airports-engine';

interface AlternativeAirportsEnhancedProps {
  originCode: string;
  destinationCode: string;
  departureDate?: string;
  currentPrice?: number;
  onAirportSelect?: (origin: string, destination: string) => void;
  currency?: string;
  lang?: 'en' | 'pt' | 'es';
  autoExpand?: boolean; // Auto-expand if high-value alternatives found
}

const translations = {
  en: {
    title: 'Save with Nearby Airports',
    subtitle: 'Smart alternatives with total journey cost analysis',
    loading: 'Analyzing alternative airports...',
    noAlternatives: 'No better alternatives found',
    origin: 'Origin',
    destination: 'Destination',
    savings: 'Save',
    distance: 'km away',
    totalCost: 'Total Cost',
    flightPrice: 'Flight',
    transport: 'Transport',
    netSavings: 'Net Savings',
    recommended: 'Highly Recommended',
    consider: 'Consider',
    worthIt: 'Worth It',
    switchAirport: 'Search this airport',
    viewMore: 'View all alternatives',
    viewLess: 'Hide alternatives',
    basedOn: 'Based on',
    historical: 'historical data',
    estimation: 'price estimation',
    confidence: 'Confidence',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    transportMethods: 'Transport',
    travelTime: 'Travel time',
    includesTransport: 'Includes ground transport costs',
    approximateTime: 'Approximate journey',
  },
  pt: {
    title: 'Economize com Aeroportos Próximos',
    subtitle: 'Alternativas inteligentes com análise de custo total',
    loading: 'Analisando aeroportos alternativos...',
    noAlternatives: 'Nenhuma alternativa melhor encontrada',
    origin: 'Origem',
    destination: 'Destino',
    savings: 'Economize',
    distance: 'km de distância',
    totalCost: 'Custo Total',
    flightPrice: 'Voo',
    transport: 'Transporte',
    netSavings: 'Economia Líquida',
    recommended: 'Altamente Recomendado',
    consider: 'Considerar',
    worthIt: 'Vale a Pena',
    switchAirport: 'Buscar neste aeroporto',
    viewMore: 'Ver todas alternativas',
    viewLess: 'Ocultar alternativas',
    basedOn: 'Baseado em',
    historical: 'dados históricos',
    estimation: 'estimativa de preço',
    confidence: 'Confiança',
    high: 'Alta',
    medium: 'Média',
    low: 'Baixa',
    transportMethods: 'Transporte',
    travelTime: 'Tempo de viagem',
    includesTransport: 'Inclui custos de transporte terrestre',
    approximateTime: 'Jornada aproximada',
  },
  es: {
    title: 'Ahorra con Aeropuertos Cercanos',
    subtitle: 'Alternativas inteligentes con análisis de costo total',
    loading: 'Analizando aeropuertos alternativos...',
    noAlternatives: 'No se encontraron mejores alternativas',
    origin: 'Origen',
    destination: 'Destino',
    savings: 'Ahorra',
    distance: 'km de distancia',
    totalCost: 'Costo Total',
    flightPrice: 'Vuelo',
    transport: 'Transporte',
    netSavings: 'Ahorro Neto',
    recommended: 'Altamente Recomendado',
    consider: 'Considerar',
    worthIt: 'Vale la Pena',
    switchAirport: 'Buscar en este aeropuerto',
    viewMore: 'Ver todas las alternativas',
    viewLess: 'Ocultar alternativas',
    basedOn: 'Basado en',
    historical: 'datos históricos',
    estimation: 'estimación de precio',
    confidence: 'Confianza',
    high: 'Alta',
    medium: 'Media',
    low: 'Baja',
    transportMethods: 'Transporte',
    travelTime: 'Tiempo de viaje',
    includesTransport: 'Incluye costos de transporte terrestre',
    approximateTime: 'Jornada aproximada',
  }
};

const TransportIcon: React.FC<{ methods: string[]; className?: string }> = ({ methods, className = 'w-4 h-4' }) => {
  const method = methods[0]?.toLowerCase() || '';

  if (method.includes('train') || method.includes('metro')) return <Train className={className} />;
  if (method.includes('bus')) return <Bus className={className} />;
  if (method.includes('car') || method.includes('taxi') || method.includes('uber')) return <Car className={className} />;
  return <Navigation className={className} />;
};

const ConfidenceBadge: React.FC<{ confidence: 'low' | 'medium' | 'high'; lang: 'en' | 'pt' | 'es' }> = ({ confidence, lang }) => {
  const t = translations[lang];
  const colors = {
    high: 'bg-green-100 text-green-700 border-green-300',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    low: 'bg-orange-100 text-orange-700 border-orange-300',
  };

  const labels = {
    high: t.high,
    medium: t.medium,
    low: t.low,
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium border rounded ${colors[confidence]}`}>
      <Info className="w-3 h-3" />
      {labels[confidence]}
    </span>
  );
};

const AlternativeAirportsEnhanced: React.FC<AlternativeAirportsEnhancedProps> = ({
  originCode,
  destinationCode,
  departureDate,
  currentPrice,
  onAirportSelect,
  currency = 'USD',
  lang = 'en',
  autoExpand = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(autoExpand);
  const [analysis, setAnalysis] = useState<AlternativeAirportsAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const t = translations[lang];

  useEffect(() => {
    let mounted = true;

    const fetchAlternatives = async () => {
      setLoading(true);

      try {
        // Dynamically import the engine to avoid server-side execution
        const { analyzeAlternativeAirports } = await import('@/lib/airports/alternative-airports-engine');

        const result = await analyzeAlternativeAirports({
          originCode,
          destinationCode,
          departureDate,
          radiusKm: 150, // 150km radius
          includeGroundTransport: true,
        });

        if (mounted) {
          setAnalysis(result);

          // Auto-expand if we have highly-recommended alternatives
          if (autoExpand && result && result.bestAlternative?.recommendation.verdict === 'highly-recommended') {
            setIsExpanded(true);
          }
        }
      } catch (error) {
        console.error('Error analyzing alternative airports:', error);
        if (mounted) {
          setAnalysis(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchAlternatives();

    return () => {
      mounted = false;
    };
  }, [originCode, destinationCode, departureDate, autoExpand]);

  const formatCurrency = (amount: number): string => {
    const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency;
    return `${symbol}${Math.round(amount)}`;
  };

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-6 mb-6">
        <div className="flex items-center gap-3 animate-pulse">
          <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span className="text-sm text-gray-600 dark:text-gray-300">{t.loading}</span>
        </div>
      </div>
    );
  }

  if (!analysis || analysis.alternatives.length === 0 || !analysis.bestAlternative) {
    return null; // Don't show widget if no alternatives
  }

  const { bestAlternative, alternatives, summary } = analysis;

  // Only show if best alternative is actually worth it
  if (!bestAlternative.totalCostComparison.worthIt) {
    return null;
  }

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'highly-recommended':
        return 'bg-green-600 text-white';
      case 'recommended':
        return 'bg-blue-600 text-white';
      case 'consider':
        return 'bg-yellow-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  const getVerdictLabel = (verdict: string) => {
    switch (verdict) {
      case 'highly-recommended':
        return t.recommended;
      case 'recommended':
        return 'Recommended';
      case 'consider':
        return t.consider;
      default:
        return 'Option';
    }
  };

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border-2 border-green-200 dark:border-green-800 p-6 mb-6 shadow-lg">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-green-600 dark:text-green-400" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {t.title}
            </h3>
            {summary.maxPotentialSavings > 0 && (
              <span className="px-2 py-1 bg-green-600 text-white text-xs font-bold rounded">
                {t.savings} {formatCurrency(summary.maxPotentialSavings)}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {t.subtitle}
          </p>
        </div>

        {alternatives.length > 1 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
          >
            {isExpanded ? (
              <>
                {t.viewLess}
                <ChevronUp className="w-4 h-4" />
              </>
            ) : (
              <>
                {t.viewMore} ({alternatives.length})
                <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>
        )}
      </div>

      {/* Best Alternative Preview */}
      {!isExpanded && bestAlternative && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-5 border-2 border-green-300 dark:border-green-700 shadow-md">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              {/* Header */}
              <div className="flex items-center gap-2 mb-3">
                <span className={`px-2.5 py-1 text-xs font-bold rounded ${getVerdictColor(bestAlternative.recommendation.verdict)}`}>
                  {getVerdictLabel(bestAlternative.recommendation.verdict)}
                </span>
                <ConfidenceBadge confidence={bestAlternative.pricing.confidence} lang={lang} />
              </div>

              {/* Airport Info */}
              <h4 className="font-bold text-gray-900 dark:text-white text-lg mb-1">
                {bestAlternative.airport.emoji} {bestAlternative.airport.code} - {bestAlternative.airport.name}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {bestAlternative.airport.city}, {bestAlternative.airport.country}
              </p>

              {/* Quick Stats */}
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300 mb-4">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  <span>{bestAlternative.distance.km} {t.distance}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>{formatDuration(bestAlternative.distance.travelTimeMinutes)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <TransportIcon methods={bestAlternative.groundTransport.methods} />
                  <span>{bestAlternative.groundTransport.methods[0]}</span>
                </div>
              </div>

              {/* Savings Highlight */}
              <div className="flex items-center gap-2 mb-4">
                <TrendingDown className="w-6 h-6 text-green-600 dark:text-green-400" />
                <span className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(bestAlternative.totalCostComparison.netSavings)}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {t.netSavings} ({bestAlternative.pricing.savingsPercent}%)
                </span>
              </div>

              {/* Cost Breakdown */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300">{t.flightPrice}:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(bestAlternative.totalCostComparison.alternativeTotal - bestAlternative.groundTransport.estimatedCostUSD)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300">{t.transport}:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(bestAlternative.groundTransport.estimatedCostUSD)}
                  </span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-600 pt-2 flex justify-between">
                  <span className="font-bold text-gray-900 dark:text-white">{t.totalCost}:</span>
                  <span className="font-bold text-green-600 dark:text-green-400 text-lg">
                    {formatCurrency(bestAlternative.totalCostComparison.alternativeTotal)}
                  </span>
                </div>
              </div>

              {/* Recommendation Reason */}
              <div className="mt-3 flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <p>{bestAlternative.recommendation.reason}</p>
              </div>
            </div>

            {/* Action Button */}
            {onAirportSelect && (
              <button
                onClick={() => onAirportSelect(bestAlternative.airport.code, destinationCode)}
                className="px-5 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-2 shadow-md hover:shadow-lg"
              >
                <Zap className="w-4 h-4" />
                {t.switchAirport}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Expanded View - All Alternatives */}
      {isExpanded && (
        <div className="space-y-4">
          {alternatives.map((option, index) => {
            const isBest = option === bestAlternative;

            return (
              <div
                key={option.airport.code}
                className={`bg-white dark:bg-gray-800 rounded-lg p-5 border-2 transition-all ${
                  isBest
                    ? 'border-green-300 dark:border-green-700 shadow-lg'
                    : 'border-gray-200 dark:border-gray-700 hover:border-green-200 dark:hover:border-green-800'
                }`}
              >
                {/* Airport Header */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded ${getVerdictColor(option.recommendation.verdict)}`}>
                        {getVerdictLabel(option.recommendation.verdict)}
                      </span>
                      <ConfidenceBadge confidence={option.pricing.confidence} lang={lang} />
                      {option.pricing.basedOnHistoricalData && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                          {t.historical}
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-gray-900 dark:text-white text-lg mb-1">
                      {option.airport.emoji} {option.airport.code} - {option.airport.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {option.airport.city}, {option.airport.country}
                    </p>
                  </div>

                  {/* Savings Badge */}
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-green-600 dark:text-green-400 mb-1">
                      <TrendingDown className="w-5 h-5" />
                      <span className="text-2xl font-bold">
                        {formatCurrency(option.totalCostComparison.netSavings)}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {option.pricing.savingsPercent}% {t.savings.toLowerCase()}
                    </span>
                  </div>
                </div>

                {/* Distance & Transport Info */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="font-medium">{option.distance.km} km</div>
                      <div className="text-xs text-gray-500">{option.distance.miles} mi</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="font-medium">{formatDuration(option.distance.travelTimeMinutes)}</div>
                      <div className="text-xs text-gray-500">{t.travelTime}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <TransportIcon methods={option.groundTransport.methods} className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="font-medium">{option.groundTransport.methods.join(', ')}</div>
                      <div className="text-xs text-gray-500">{formatCurrency(option.groundTransport.estimatedCostUSD)}</div>
                    </div>
                  </div>
                </div>

                {/* Transport Notes */}
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {option.groundTransport.notes}
                  </p>
                </div>

                {/* Cost Breakdown */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-300">{t.flightPrice}:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(option.totalCostComparison.alternativeTotal - option.groundTransport.estimatedCostUSD)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-300">{t.transport}:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(option.groundTransport.estimatedCostUSD)}
                      </span>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-600 pt-2 flex justify-between items-center">
                      <span className="font-bold text-gray-900 dark:text-white">{t.totalCost}:</span>
                      <div className="text-right">
                        <div className="font-bold text-green-600 dark:text-green-400 text-xl">
                          {formatCurrency(option.totalCostComparison.alternativeTotal)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          vs {formatCurrency(option.totalCostComparison.mainAirportTotal)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recommendation Details */}
                <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Score: {option.recommendation.score}/100
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {option.recommendation.reason}
                  </p>
                </div>

                {/* Action Button */}
                {onAirportSelect && (
                  <button
                    onClick={() => onAirportSelect(option.airport.code, destinationCode)}
                    className={`w-full py-3 font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
                      isBest
                        ? 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg'
                        : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
                    }`}
                  >
                    <Zap className="w-4 h-4" />
                    {t.switchAirport}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Info Footer */}
      <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-800">
        <div className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p>
            {t.includesTransport}. {t.basedOn} {bestAlternative?.pricing.basedOnHistoricalData ? t.historical : t.estimation}.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AlternativeAirportsEnhanced;
