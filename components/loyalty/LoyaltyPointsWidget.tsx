'use client';

import { useEffect, useState } from 'react';
import { Star, Gift, TrendingUp, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface UnifiedPoints {
  hotel: {
    currentPoints: number;
    pendingPoints: number;
    tier: string;
    tierBenefits: string[];
  };
  general: {
    currentPoints: number;
    lifetimePoints: number;
    redeemedPoints: number;
  };
  totalAvailable: number;
  totalPending?: number;
  conversionRate: {
    pointsPerDollar: number;
    description: string;
  };
}

interface LoyaltyPointsWidgetProps {
  compact?: boolean;
  showRedeemButton?: boolean;
  className?: string;
}

export default function LoyaltyPointsWidget({
  compact = false,
  showRedeemButton = true,
  className = ''
}: LoyaltyPointsWidgetProps) {
  const [points, setPoints] = useState<UnifiedPoints | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPoints = async () => {
      try {
        const response = await fetch('/api/loyalty/points');
        const data = await response.json();

        if (data.success) {
          setPoints(data.data);
        } else {
          setError(data.error || 'Failed to load points');
        }
      } catch (err) {
        console.error('Error fetching points:', err);
        setError('Failed to load points');
      } finally {
        setLoading(false);
      }
    };

    fetchPoints();
  }, []);

  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-md p-6 ${className}`}>
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
        </div>
      </div>
    );
  }

  if (error || !points) {
    return (
      <div className={`bg-white rounded-xl shadow-md p-6 ${className}`}>
        <div className="text-center py-4">
          <Star className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Points unavailable</p>
        </div>
      </div>
    );
  }

  const tierColors: Record<string, string> = {
    bronze: 'from-amber-600 to-orange-700',
    silver: 'from-gray-400 to-gray-600',
    gold: 'from-yellow-500 to-amber-600',
    platinum: 'from-slate-600 to-slate-800',
  };

  const tierGradient = tierColors[points.hotel.tier.toLowerCase()] || tierColors.bronze;
  const dollarValue = (points.totalAvailable / points.conversionRate.pointsPerDollar).toFixed(2);

  if (compact) {
    return (
      <Link
        href="/account/loyalty"
        className={`block bg-gradient-to-r ${tierGradient} rounded-xl p-4 text-white hover:shadow-lg transition-shadow ${className}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Star className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-white/80 uppercase tracking-wide">Your Points</p>
              <p className="text-xl font-bold">{points.totalAvailable.toLocaleString()}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-white/80">${dollarValue} value</p>
            <p className="text-sm font-medium capitalize">{points.hotel.tier} Member</p>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-md overflow-hidden ${className}`}>
      {/* Header with tier gradient */}
      <div className={`bg-gradient-to-r ${tierGradient} p-5 text-white`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-xl">
              <Star className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-white/80">Loyalty Rewards</p>
              <p className="text-lg font-bold capitalize">{points.hotel.tier} Member</p>
            </div>
          </div>
          <Link
            href="/account/loyalty"
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-3xl font-bold">{points.totalAvailable.toLocaleString()}</p>
            <p className="text-sm text-white/80">Available Points</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">${dollarValue}</p>
            <p className="text-sm text-white/80">Reward Value</p>
          </div>
        </div>
      </div>

      {/* Points breakdown */}
      <div className="p-5">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <span className="text-xs text-gray-600">Hotel Rewards</span>
            </div>
            <p className="text-lg font-bold text-gray-900">{points.hotel.currentPoints.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-purple-500 rounded-full" />
              <span className="text-xs text-gray-600">Fly2Any Points</span>
            </div>
            <p className="text-lg font-bold text-gray-900">{points.general.currentPoints.toLocaleString()}</p>
          </div>
        </div>

        {/* Pending points */}
        {(points.totalPending || 0) > 0 && (
          <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg mb-4">
            <TrendingUp className="w-4 h-4 text-amber-600" />
            <span className="text-sm text-amber-800">
              <span className="font-semibold">{points.totalPending?.toLocaleString()}</span> points pending
            </span>
          </div>
        )}

        {/* Benefits preview */}
        {points.hotel.tierBenefits.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Your Benefits</p>
            <div className="flex flex-wrap gap-2">
              {points.hotel.tierBenefits.slice(0, 2).map((benefit, idx) => (
                <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                  {benefit}
                </span>
              ))}
              {points.hotel.tierBenefits.length > 2 && (
                <span className="text-xs text-primary-600 font-medium">
                  +{points.hotel.tierBenefits.length - 2} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        {showRedeemButton && points.totalAvailable >= 10 && (
          <div className="flex gap-2">
            <Link
              href="/account/loyalty"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg font-semibold text-sm hover:from-primary-600 hover:to-primary-700 transition-all"
            >
              <Gift className="w-4 h-4" />
              Redeem Points
            </Link>
            <Link
              href="/account/loyalty"
              className="py-2.5 px-4 border border-gray-200 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              View All
            </Link>
          </div>
        )}

        {/* Earn more prompt for low balance */}
        {points.totalAvailable < 10 && (
          <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg">
            <Sparkles className="w-4 h-4 text-primary-600" />
            <span className="text-sm text-gray-700">
              Book hotels to earn <span className="font-semibold text-primary-600">5% cashback</span> in points!
            </span>
          </div>
        )}

        {/* Conversion rate info */}
        <p className="text-xs text-gray-400 text-center mt-3">
          {points.conversionRate.description}
        </p>
      </div>
    </div>
  );
}
