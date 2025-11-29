'use client';

import { useEffect, useState } from 'react';
import { GuestLoyaltyPoints } from '@/lib/api/liteapi-types';

interface LoyaltyPointsDisplayProps {
  guestId: string;
  showDetails?: boolean;
}

export default function LoyaltyPointsDisplay({ guestId, showDetails = false }: LoyaltyPointsDisplayProps) {
  const [points, setPoints] = useState<GuestLoyaltyPoints | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPoints = async () => {
      try {
        const response = await fetch(`/api/loyalty/points?guestId=${guestId}`);
        const data = await response.json();
        
        if (data.success) {
          setPoints(data.data);
        } else {
          setError(data.error);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load points');
      } finally {
        setLoading(false);
      }
    };

    if (guestId) {
      fetchPoints();
    }
  }, [guestId]);

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white animate-pulse">
        <div className="h-8 bg-white/20 rounded w-1/2 mb-2"></div>
        <div className="h-12 bg-white/30 rounded w-3/4"></div>
      </div>
    );
  }

  if (error || !points) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error || 'Unable to load loyalty points'}
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm opacity-90">Your Points</p>
          <h2 className="text-4xl font-bold">{points.currentPoints.toLocaleString()}</h2>
        </div>
        <div className="bg-white/20 rounded-full px-4 py-2">
          <span className="text-sm font-semibold">{points.tier}</span>
        </div>
      </div>

      {showDetails && (
        <div className="mt-6 space-y-3 border-t border-white/20 pt-4">
          <div className="flex justify-between text-sm">
            <span className="opacity-90">Lifetime Points</span>
            <span className="font-semibold">{points.lifetimePoints.toLocaleString()}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="opacity-90">Points to Next Tier</span>
            <span className="font-semibold">{points.pointsToNextTier.toLocaleString()}</span>
          </div>

          {points.pointsExpiringSoon && (
            <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-lg p-3 mt-4">
              <p className="text-xs font-medium">⚠️ Expiring Soon</p>
              <p className="text-sm">
                {points.pointsExpiringSoon.points.toLocaleString()} points expire on{' '}
                {new Date(points.pointsExpiringSoon.expiryDate).toLocaleDateString()}
              </p>
            </div>
          )}

          <div className="mt-4">
            <p className="text-xs opacity-75 mb-2">Your Benefits</p>
            <ul className="space-y-1">
              {points.tierBenefits.map((benefit, idx) => (
                <li key={idx} className="text-sm flex items-start">
                  <span className="mr-2">✓</span>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
