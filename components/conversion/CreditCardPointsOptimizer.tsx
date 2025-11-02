'use client';

import { useState } from 'react';
import { CreditCard, TrendingDown, Star, X, Check, ExternalLink, Sparkles } from 'lucide-react';

interface CreditCardRecommendation {
  name: string;
  issuer: string;
  signupBonus: number; // Points
  signupBonusValue: number; // USD
  annualFee: number;
  pointsNeeded: number; // For this flight
  pointsPerDollar: number;
  bestFor: string;
  affiliateUrl: string;
  commission: number; // USD per approved application
  highlight: boolean;
}

interface CreditCardPointsOptimizerProps {
  flightPrice: number;
  origin: string;
  destination: string;
  onClose?: () => void;
  compact?: boolean;
}

/**
 * 💳 CREDIT CARD POINTS OPTIMIZER
 *
 * Revenue Model: $100-300 per approved credit card application
 * User Value: Shows how to book flights with points instead of cash
 * Strategic: Serves budget travelers AND generates high-margin revenue
 */
export default function CreditCardPointsOptimizer({
  flightPrice,
  origin,
  destination,
  onClose,
  compact = false,
}: CreditCardPointsOptimizerProps) {
  const [isExpanded, setIsExpanded] = useState(!compact);

  // Calculate points needed (typical redemption rate: 1 cent per point for flights)
  const pointsNeeded = Math.round(flightPrice * 100);

  // Top credit cards for flight bookings (updated for 2025)
  const recommendedCards: CreditCardRecommendation[] = [
    {
      name: 'Chase Sapphire Preferred',
      issuer: 'Chase',
      signupBonus: 60000,
      signupBonusValue: 750, // 1.25 cents/point through Chase Travel
      annualFee: 95,
      pointsNeeded: pointsNeeded,
      pointsPerDollar: 2,
      bestFor: 'Travel & Dining',
      affiliateUrl: '#', // Replace with actual affiliate link
      commission: 250,
      highlight: flightPrice > 300,
    },
    {
      name: 'Capital One Venture',
      issuer: 'Capital One',
      signupBonus: 75000,
      signupBonusValue: 750,
      annualFee: 95,
      pointsNeeded: pointsNeeded,
      pointsPerDollar: 2,
      bestFor: 'General Travel',
      affiliateUrl: '#',
      commission: 200,
      highlight: flightPrice > 500,
    },
    {
      name: 'American Express Gold',
      issuer: 'American Express',
      signupBonus: 60000,
      signupBonusValue: 600,
      annualFee: 250,
      pointsNeeded: pointsNeeded,
      pointsPerDollar: 4, // On dining/groceries
      bestFor: 'High Spenders',
      affiliateUrl: '#',
      commission: 300,
      highlight: flightPrice > 800,
    },
  ];

  // Calculate value metrics
  const topCard = recommendedCards[0];
  const canBookWithSignupBonus = topCard.signupBonus >= pointsNeeded;
  const signupBonusCovers = Math.min(100, (topCard.signupBonusValue / flightPrice) * 100);

  if (compact && !isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="w-full bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-4 hover:shadow-lg transition-all duration-200"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <div className="font-bold text-gray-900 flex items-center gap-2">
                Book with Points Instead
                {canBookWithSignupBonus && (
                  <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full">
                    Free with signup bonus!
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-600">
                ${flightPrice} flight = {Math.round(pointsNeeded / 1000)}k points
              </div>
            </div>
          </div>
          <div className="text-sm font-semibold text-indigo-600">
            See Options →
          </div>
        </div>
      </button>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-full">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">Pay with Points, Not Cash</h3>
              <p className="text-white/90 text-sm">
                This ${flightPrice} flight could be FREE with the right credit card
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Value Proposition */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
            <div className="text-white/70 text-xs mb-1">Points Needed</div>
            <div className="text-2xl font-bold">{Math.round(pointsNeeded / 1000)}k</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
            <div className="text-white/70 text-xs mb-1">Signup Bonus Value</div>
            <div className="text-2xl font-bold">${topCard.signupBonusValue}</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
            <div className="text-white/70 text-xs mb-1">Potential Savings</div>
            <div className="text-2xl font-bold text-green-300">
              {Math.round(signupBonusCovers)}%
            </div>
          </div>
        </div>
      </div>

      {/* Card Recommendations */}
      <div className="p-6">
        <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500" />
          Recommended Cards for This Trip
        </h4>

        <div className="space-y-4">
          {recommendedCards.map((card, idx) => (
            <div
              key={card.name}
              className={`border rounded-xl p-4 transition-all duration-200 hover:shadow-md ${
                card.highlight
                  ? 'border-indigo-300 bg-indigo-50/50'
                  : 'border-gray-200 hover:border-indigo-200'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-bold text-lg text-gray-900 flex items-center gap-2">
                    {card.name}
                    {idx === 0 && (
                      <span className="text-xs bg-indigo-600 text-white px-2 py-1 rounded-full">
                        Best Match
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">{card.issuer}</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-indigo-600">
                    {Math.round(card.signupBonus / 1000)}k
                  </div>
                  <div className="text-xs text-gray-500">bonus points</div>
                </div>
              </div>

              {/* Card Benefits */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white rounded-lg p-3 border border-gray-100">
                  <div className="text-xs text-gray-500 mb-1">Bonus Value</div>
                  <div className="font-bold text-green-600">
                    ${card.signupBonusValue}
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-gray-100">
                  <div className="text-xs text-gray-500 mb-1">Annual Fee</div>
                  <div className="font-bold text-gray-900">${card.annualFee}</div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-gray-100">
                  <div className="text-xs text-gray-500 mb-1">Earn Rate</div>
                  <div className="font-bold text-gray-900">
                    {card.pointsPerDollar}x points
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-gray-100">
                  <div className="text-xs text-gray-500 mb-1">Best For</div>
                  <div className="font-bold text-gray-900 text-xs">
                    {card.bestFor}
                  </div>
                </div>
              </div>

              {/* Value Calculation */}
              {card.signupBonus >= pointsNeeded ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                  <div className="flex items-center gap-2 text-green-700 font-semibold">
                    <Check className="w-5 h-5" />
                    <span>Signup bonus covers this entire flight!</span>
                  </div>
                  <div className="text-xs text-green-600 mt-1">
                    You'll have {Math.round((card.signupBonus - pointsNeeded) / 1000)}k points
                    left for future trips
                  </div>
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                  <div className="flex items-center gap-2 text-blue-700 font-semibold text-sm">
                    <TrendingDown className="w-4 h-4" />
                    <span>
                      Covers {Math.round((card.signupBonus / pointsNeeded) * 100)}% of this flight
                    </span>
                  </div>
                </div>
              )}

              {/* CTA */}
              <a
                href={card.affiliateUrl}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="block w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 text-center flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Apply Now (Secure)
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-xs text-gray-600 space-y-1">
            <p className="font-semibold text-gray-700">Important Information:</p>
            <p>• Credit card approval subject to issuer requirements</p>
            <p>• Signup bonuses require minimum spending within timeframe</p>
            <p>• Point values are estimates and may vary by redemption method</p>
            <p>
              • Affiliate Disclosure: We may earn a commission if you're approved, at no cost to
              you
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
