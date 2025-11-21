'use client';

/**
 * Enhanced Sustainability Badge
 *
 * Powered by the carbon-calculator engine with:
 * - ICAO/DEFRA compliant emissions calculations
 * - A-F sustainability grading
 * - Emission equivalents (trees, car miles, etc.)
 * - Carbon offset cost estimates
 * - Actionable improvement suggestions
 * - Detailed modal view
 *
 * @see lib/sustainability/carbon-calculator.ts
 */

import React, { useState, useMemo } from 'react';
import {
  Leaf,
  TreeDeciduous,
  Car,
  Smartphone,
  UtensilsCrossed,
  DollarSign,
  Info,
  X,
  TrendingUp,
  TrendingDown,
  Award,
  AlertCircle
} from 'lucide-react';
import type { Airport } from '@/lib/data/airports-complete';

interface SustainabilityBadgeProps {
  origin: Airport;
  destination: Airport;
  cabinClass?: 'economy' | 'premium_economy' | 'business' | 'first';
  aircraftType?: 'narrowbody' | 'widebody' | 'regional' | 'turboprop';
  isDirectFlight?: boolean;
  showDetails?: boolean; // Show detailed info instead of compact badge
  lang?: 'en' | 'pt' | 'es';
}

const translations = {
  en: {
    co2Emissions: 'CO₂ Emissions',
    perPassenger: 'per passenger',
    sustainability: 'Sustainability',
    grade: 'Grade',
    excellent: 'Excellent',
    good: 'Good',
    average: 'Average',
    poor: 'Poor',
    betterThanAvg: 'better than average',
    worseThanAvg: 'above average',
    onAverage: 'average emissions',
    offsetCost: 'Carbon Offset',
    equivalents: 'Environmental Impact',
    trees: 'trees needed to absorb',
    carMiles: 'equivalent car miles',
    smartphones: 'smartphones charged',
    meatMeals: 'beef meals produced',
    improvements: 'How to Reduce',
    alternatives: 'Better Options',
    details: 'Sustainability Details',
    close: 'Close',
    viewDetails: 'View Details',
    perYear: 'per year',
  },
  pt: {
    co2Emissions: 'Emissões de CO₂',
    perPassenger: 'por passageiro',
    sustainability: 'Sustentabilidade',
    grade: 'Nota',
    excellent: 'Excelente',
    good: 'Bom',
    average: 'Médio',
    poor: 'Ruim',
    betterThanAvg: 'melhor que a média',
    worseThanAvg: 'acima da média',
    onAverage: 'emissões médias',
    offsetCost: 'Compensação de Carbono',
    equivalents: 'Impacto Ambiental',
    trees: 'árvores necessárias para absorver',
    carMiles: 'milhas de carro equivalentes',
    smartphones: 'smartphones carregados',
    meatMeals: 'refeições de carne produzidas',
    improvements: 'Como Reduzir',
    alternatives: 'Melhores Opções',
    details: 'Detalhes de Sustentabilidade',
    close: 'Fechar',
    viewDetails: 'Ver Detalhes',
    perYear: 'por ano',
  },
  es: {
    co2Emissions: 'Emisiones de CO₂',
    perPassenger: 'por pasajero',
    sustainability: 'Sostenibilidad',
    grade: 'Calificación',
    excellent: 'Excelente',
    good: 'Bueno',
    average: 'Promedio',
    poor: 'Malo',
    betterThanAvg: 'mejor que el promedio',
    worseThanAvg: 'por encima del promedio',
    onAverage: 'emisiones promedio',
    offsetCost: 'Compensación de Carbono',
    equivalents: 'Impacto Ambiental',
    trees: 'árboles necesarios para absorber',
    carMiles: 'millas de carro equivalentes',
    smartphones: 'smartphones cargados',
    meatMeals: 'comidas de carne producidas',
    improvements: 'Cómo Reducir',
    alternatives: 'Mejores Opciones',
    details: 'Detalles de Sostenibilidad',
    close: 'Cerrar',
    viewDetails: 'Ver Detalles',
    perYear: 'por año',
  }
};

const SustainabilityBadge: React.FC<SustainabilityBadgeProps> = ({
  origin,
  destination,
  cabinClass = 'economy',
  aircraftType = 'narrowbody',
  isDirectFlight = true,
  showDetails = false,
  lang = 'en',
}) => {
  const [showModal, setShowModal] = useState(false);
  const t = translations[lang];

  // Calculate emissions and sustainability score
  const data = useMemo(() => {
    // Dynamically import to avoid server-side issues
    let emissions = null;
    let sustainabilityScore = null;
    let equivalents = null;

    try {
      const { calculateFlightEmissions, calculateSustainabilityScore, getEmissionEquivalents } =
        require('@/lib/sustainability/carbon-calculator');

      emissions = calculateFlightEmissions(origin, destination, cabinClass, aircraftType, 1);

      if (emissions) {
        sustainabilityScore = calculateSustainabilityScore(
          emissions,
          isDirectFlight,
          emissions.details.distanceKm
        );

        equivalents = getEmissionEquivalents(emissions.perPassengerKg);
      }
    } catch (error) {
      console.error('Error calculating emissions:', error);
    }

    return { emissions, sustainabilityScore, equivalents };
  }, [origin, destination, cabinClass, aircraftType, isDirectFlight]);

  if (!data.emissions) {
    return null;
  }

  const { emissions, sustainabilityScore, equivalents } = data;

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'excellent':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'good':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'average':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'poor':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getRatingLabel = (rating: string) => {
    switch (rating) {
      case 'excellent':
        return t.excellent;
      case 'good':
        return t.good;
      case 'average':
        return t.average;
      case 'poor':
        return t.poor;
      default:
        return rating;
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A':
        return 'text-green-600';
      case 'B':
        return 'text-blue-600';
      case 'C':
        return 'text-yellow-600';
      case 'D':
        return 'text-orange-600';
      case 'F':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getComparisonText = () => {
    const comparison = emissions.comparisonToAverage;
    if (comparison < 0) {
      return `${Math.abs(comparison)}% ${t.betterThanAvg}`;
    } else if (comparison > 0) {
      return `${comparison}% ${t.worseThanAvg}`;
    } else {
      return t.onAverage;
    }
  };

  // Compact Badge View
  if (!showDetails) {
    return (
      <>
        <button
          onClick={() => setShowModal(true)}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all hover:scale-105 ${getRatingColor(emissions.rating)}`}
          title={`${t.co2Emissions}: ${emissions.perPassengerKg} kg - ${getRatingLabel(emissions.rating)}`}
        >
          <span className="text-base">{emissions.badge}</span>
          <Leaf className="h-3.5 w-3.5" />
          <span>{emissions.perPassengerKg} kg</span>
          {sustainabilityScore && (
            <span className={`font-bold ${getGradeColor(sustainabilityScore.rating)}`}>
              {sustainabilityScore.rating}
            </span>
          )}
        </button>

        {/* Detailed Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{emissions.badge}</span>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t.details}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {origin.code} → {destination.code}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Emissions Summary */}
                <div className={`rounded-lg border-2 p-4 ${getRatingColor(emissions.rating)}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold">{t.co2Emissions}</span>
                    {sustainabilityScore && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600">{t.grade}:</span>
                        <span className={`text-2xl font-bold ${getGradeColor(sustainabilityScore.rating)}`}>
                          {sustainabilityScore.rating}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="text-3xl font-bold mb-1">{emissions.perPassengerKg} kg CO₂</div>
                  <div className="text-sm">{t.perPassenger} • {getComparisonText()}</div>
                </div>

                {/* Sustainability Score */}
                {sustainabilityScore && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      {t.sustainability}
                    </h4>
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-full h-3 overflow-hidden mb-2">
                      <div
                        className={`h-full transition-all ${
                          sustainabilityScore.rating === 'A' || sustainabilityScore.rating === 'B'
                            ? 'bg-green-500'
                            : sustainabilityScore.rating === 'C'
                            ? 'bg-yellow-500'
                            : 'bg-orange-500'
                        }`}
                        style={{ width: `${sustainabilityScore.score}%` }}
                      />
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
                      {sustainabilityScore.score}/100 Points
                    </div>
                  </div>
                )}

                {/* Carbon Offset Cost */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                      {t.offsetCost}
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                    ${emissions.offsetCostUSD.toFixed(2)}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Estimated cost to offset this flight's carbon emissions
                  </p>
                </div>

                {/* Environmental Equivalents */}
                {equivalents && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                      <Info className="w-4 h-4" />
                      {t.equivalents}
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
                        <TreeDeciduous className="w-5 h-5 text-green-600 dark:text-green-400 mb-2" />
                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                          {equivalents.trees.toFixed(1)}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {t.trees} ({t.perYear})
                        </div>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                        <Car className="w-5 h-5 text-gray-600 dark:text-gray-400 mb-2" />
                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                          {equivalents.carMiles.toFixed(0)}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {t.carMiles}
                        </div>
                      </div>

                      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 border border-purple-200 dark:border-purple-800">
                        <Smartphone className="w-5 h-5 text-purple-600 dark:text-purple-400 mb-2" />
                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                          {equivalents.smartphones.toFixed(0)}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {t.smartphones}
                        </div>
                      </div>

                      <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 border border-orange-200 dark:border-orange-800">
                        <UtensilsCrossed className="w-5 h-5 text-orange-600 dark:text-orange-400 mb-2" />
                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                          {equivalents.meatMeals.toFixed(1)}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {t.meatMeals}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Improvement Suggestions */}
                {sustainabilityScore && sustainabilityScore.improvements.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                      <TrendingDown className="w-4 h-4 text-green-600" />
                      {t.improvements}
                    </h4>
                    <ul className="space-y-2">
                      {sustainabilityScore.improvements.map((improvement: string, index: number) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
                        >
                          <AlertCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                          <span>{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Alternative Suggestions */}
                {sustainabilityScore &&
                  sustainabilityScore.alternativeSuggestions &&
                  sustainabilityScore.alternativeSuggestions.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        {t.alternatives}
                      </h4>
                      <div className="space-y-2">
                        {sustainabilityScore.alternativeSuggestions.map((suggestion: any, index: number) => (
                          <div
                            key={index}
                            className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                {suggestion.description}
                              </span>
                              <span className="text-green-600 dark:text-green-400 font-bold text-sm">
                                -{suggestion.savingsPercent}%
                              </span>
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              Save {suggestion.savingsKg} kg CO₂
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Flight Details */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Distance:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-white">
                        {emissions.details.distanceKm} km ({emissions.details.distanceMiles} mi)
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Cabin Class:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-white capitalize">
                        {cabinClass.replace('_', ' ')}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Aircraft Type:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-white capitalize">
                        {aircraftType}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Flight Type:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-white">
                        {isDirectFlight ? 'Direct' : 'Connecting'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Detailed Inline View
  return (
    <div className={`rounded-lg border-2 p-4 ${getRatingColor(emissions.rating)}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{emissions.badge}</span>
          <div>
            <div className="font-semibold">{t.co2Emissions}</div>
            <div className="text-xs opacity-75">{getComparisonText()}</div>
          </div>
        </div>
        {sustainabilityScore && (
          <div className={`text-3xl font-bold ${getGradeColor(sustainabilityScore.rating)}`}>
            {sustainabilityScore.rating}
          </div>
        )}
      </div>
      <div className="text-2xl font-bold mb-1">{emissions.perPassengerKg} kg CO₂</div>
      <div className="text-sm opacity-75">{t.perPassenger}</div>
    </div>
  );
};

export default SustainabilityBadge;
