'use client';

import { TrendingUp, TrendingDown, Minus, AlertCircle, Lightbulb } from 'lucide-react';

export interface PricePrediction {
  currentPrice: number;
  prediction7Days: number;
  prediction14Days: number;
  trend: 'rising' | 'falling' | 'stable';
  confidence: number;
  recommendation: string;
  volatility: number;
}

interface PricePredictionProps {
  prediction: PricePrediction;
  currency?: string;
}

export default function PricePredictionCard({ prediction, currency = 'USD' }: PricePredictionProps) {
  const { currentPrice, prediction7Days, prediction14Days, trend, confidence, recommendation, volatility } = prediction;

  // Calculate price changes
  const change7Days = prediction7Days - currentPrice;
  const change14Days = prediction14Days - currentPrice;
  const changePercent7Days = ((change7Days / currentPrice) * 100);
  const changePercent14Days = ((change14Days / currentPrice) * 100);

  // Determine urgency level
  const urgencyLevel =
    Math.abs(changePercent14Days) > 15 ? 'high' :
    Math.abs(changePercent14Days) > 8 ? 'medium' : 'low';

  // Colors based on trend
  const trendColors = {
    rising: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-700',
      icon: 'text-red-600',
      badge: 'bg-red-100 text-red-800',
    },
    falling: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-700',
      icon: 'text-green-600',
      badge: 'bg-green-100 text-green-800',
    },
    stable: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-700',
      icon: 'text-blue-600',
      badge: 'bg-blue-100 text-blue-800',
    },
  };

  const colors = trendColors[trend];

  // Get icon
  const TrendIcon = trend === 'rising' ? TrendingUp : trend === 'falling' ? TrendingDown : Minus;

  // Format currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatChange = (change: number, percent: number) => {
    const sign = change > 0 ? '+' : '';
    return `${sign}${formatPrice(change)} (${sign}${percent.toFixed(0)}%)`;
  };

  return (
    <div className={`rounded-lg border-2 ${colors.border} ${colors.bg} p-4 shadow-sm`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrendIcon className={`w-5 h-5 ${colors.icon}`} />
          <h3 className={`font-bold text-sm ${colors.text}`}>
            {trend === 'rising' ? 'Price Rising' : trend === 'falling' ? 'Price Falling' : 'Price Stable'}
          </h3>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${colors.badge}`}>
          {(confidence * 100).toFixed(0)}% confidence
        </span>
      </div>

      {/* Price Forecast */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600 font-medium">Current Price</span>
          <span className="font-bold text-gray-900">{formatPrice(currentPrice)}</span>
        </div>

        {change7Days !== 0 && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600 font-medium">In 7 days</span>
            <span className={`font-bold ${change7Days > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {formatPrice(prediction7Days)} ({formatChange(change7Days, changePercent7Days)})
            </span>
          </div>
        )}

        {change14Days !== 0 && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600 font-medium">In 14 days</span>
            <span className={`font-bold ${change14Days > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {formatPrice(prediction14Days)} ({formatChange(change14Days, changePercent14Days)})
            </span>
          </div>
        )}
      </div>

      {/* Recommendation */}
      <div className={`rounded-md p-2.5 ${urgencyLevel === 'high' ? 'bg-yellow-100 border border-yellow-300' : 'bg-white border border-gray-200'}`}>
        <div className="flex items-start gap-2">
          <Lightbulb className={`w-4 h-4 flex-shrink-0 mt-0.5 ${urgencyLevel === 'high' ? 'text-yellow-700' : 'text-blue-600'}`} />
          <div className="flex-1">
            <p className={`text-xs font-semibold ${urgencyLevel === 'high' ? 'text-yellow-900' : 'text-gray-900'}`}>
              {recommendation}
            </p>

            {urgencyLevel === 'high' && changePercent14Days > 10 && (
              <div className="mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-yellow-700" />
                <span className="text-xs text-yellow-800">
                  Book now to save {formatPrice(Math.abs(change14Days))}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Volatility indicator */}
      {volatility > 0.5 && (
        <div className="mt-2 text-xs text-gray-600 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          <span>High price volatility detected on this route</span>
        </div>
      )}
    </div>
  );
}

/**
 * Generate mock price prediction based on route profile
 * In production, this would use actual ML model
 */
export function generatePricePrediction(
  currentPrice: number,
  volatility: number,
  daysUntilDeparture: number,
  popularity: number
): PricePrediction {
  // Price typically rises as departure approaches (last 14 days)
  const urgencyMultiplier = daysUntilDeparture < 14 ? 1.1 : 1.0;

  // High popularity routes see more price increases
  const popularityMultiplier = popularity > 100 ? 1.05 : 1.0;

  // Volatility affects prediction
  const volatilityMultiplier = 1 + (volatility * 0.1);

  // Calculate predictions
  const prediction7Days = currentPrice * urgencyMultiplier * volatilityMultiplier;
  const prediction14Days = currentPrice * urgencyMultiplier * popularityMultiplier * volatilityMultiplier;

  // Determine trend
  const change = prediction14Days - currentPrice;
  const changePercent = (change / currentPrice) * 100;

  const trend: 'rising' | 'falling' | 'stable' =
    changePercent > 5 ? 'rising' :
    changePercent < -5 ? 'falling' : 'stable';

  // Generate recommendation
  let recommendation = '';
  if (trend === 'rising' && changePercent > 10) {
    recommendation = `Book now - prices predicted to rise ${changePercent.toFixed(0)}% by ${new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString()}`;
  } else if (trend === 'rising') {
    recommendation = `Good time to book - slight price increase expected`;
  } else if (trend === 'falling') {
    recommendation = `Prices may drop - consider waiting a few days`;
  } else {
    recommendation = `Stable pricing - book when ready`;
  }

  // Confidence based on volatility (lower volatility = higher confidence)
  const confidence = Math.max(0.5, 1 - volatility);

  return {
    currentPrice,
    prediction7Days: Math.round(prediction7Days),
    prediction14Days: Math.round(prediction14Days),
    trend,
    confidence,
    recommendation,
    volatility,
  };
}
