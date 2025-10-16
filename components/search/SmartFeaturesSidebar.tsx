'use client';

import { useState, useEffect } from 'react';

interface Props {
  route?: string;
  currentPrice?: number;
}

export function SmartFeaturesSidebar({ route, currentPrice = 512 }: Props) {
  const [viewers, setViewers] = useState(47);
  const [prediction, setPrediction] = useState<'rise' | 'fall'>('rise');
  const [percentage, setPercentage] = useState(18);

  useEffect(() => {
    const interval = setInterval(() => {
      setViewers(prev => Math.max(30, prev + Math.floor(Math.random() * 5) - 2));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-3">
      {/* Live Activity - Compact */}
      <div className="bg-gradient-to-br from-error/10 to-warning/10 p-3 rounded-xl border border-error/20">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 bg-error rounded-full animate-pulse"></div>
          <span className="font-bold text-sm text-gray-900">{viewers} people viewing</span>
        </div>
        <div className="text-xs text-gray-600">
          🔥 Only <span className="font-bold text-error">3 seats left</span> at this price!
        </div>
      </div>

      {/* AI Prediction - Compact */}
      <div className={`bg-gradient-to-br ${prediction === 'rise' ? 'from-error to-warning' : 'from-success to-primary-500'} p-3 rounded-xl text-white`}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">{prediction === 'rise' ? '📈' : '📉'}</span>
          <span className="font-bold text-sm">AI Prediction</span>
        </div>
        <div className="text-xs mb-2">
          {prediction === 'rise'
            ? `Prices rising ${percentage}% in 48h`
            : `May drop ${percentage}% in 3-5 days`}
        </div>
        <button className={`w-full py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
          prediction === 'rise'
            ? 'bg-white text-error hover:shadow-lg'
            : 'bg-white/20 hover:bg-white/30'
        }`}>
          {prediction === 'rise' ? 'Book Now!' : 'Wait & Track'}
        </button>
      </div>

      {/* Nearby Airport - Compact */}
      <div className="bg-gradient-to-br from-secondary-50 to-primary-50 p-3 rounded-xl border border-secondary-200">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">💡</span>
          <span className="font-bold text-sm text-gray-900">Save $156</span>
        </div>
        <button className="w-full bg-white p-2 rounded-lg hover:shadow-md transition-all text-left">
          <div className="font-semibold text-xs text-gray-900">EWR - Newark</div>
          <div className="text-xs text-gray-500">15 miles away</div>
        </button>
      </div>

      {/* Bundle Savings - Compact */}
      <div className="bg-gradient-to-br from-primary-50 to-secondary-50 p-3 rounded-xl border border-primary-200">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">📦</span>
          <span className="font-bold text-sm text-gray-900">Bundle & Save</span>
        </div>
        <div className="space-y-1.5">
          <button className="w-full bg-white p-2 rounded-lg hover:shadow-md transition-all flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm">🏨</span>
              <span className="text-xs font-medium">Add Hotel</span>
            </div>
            <span className="text-xs font-bold text-success">+$180</span>
          </button>
          <button className="w-full bg-white p-2 rounded-lg hover:shadow-md transition-all flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm">🚗</span>
              <span className="text-xs font-medium">Add Car</span>
            </div>
            <span className="text-xs font-bold text-success">+$95</span>
          </button>
        </div>
      </div>

      {/* Rewards - Compact */}
      <div className="bg-gradient-to-br from-primary-50 to-secondary-50 p-3 rounded-xl border border-primary-200">
        <div className="flex items-center gap-2">
          <span className="text-lg">🎁</span>
          <div className="flex-1">
            <div className="text-xs text-gray-600">
              Earn <span className="font-bold text-primary-600">2,560 pts</span>
            </div>
            <div className="text-xs text-gray-500">= $25.60 off next trip</div>
          </div>
        </div>
      </div>
    </div>
  );
}
