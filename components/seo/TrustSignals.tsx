/**
 * TRUST & E-E-A-T SIGNALS
 * Sprint 4 - AI Citation & Conversion Architecture
 *
 * Lightweight trust indicators without visual clutter:
 * - Data source disclosure
 * - Update cadence indicator
 * - Why trust Fly2Any block
 * - Price confidence signals
 */

'use client';

import { Shield, Clock, Database, CheckCircle, TrendingUp, RefreshCw } from 'lucide-react';

// ============================================================================
// DATA FRESHNESS INDICATOR
// ============================================================================

interface DataFreshnessProps {
  lastUpdated: Date | string;
  source?: string;
  variant?: 'inline' | 'badge' | 'detailed';
}

export function DataFreshness({ lastUpdated, source, variant = 'inline' }: DataFreshnessProps) {
  const date = typeof lastUpdated === 'string' ? new Date(lastUpdated) : lastUpdated;
  const hoursAgo = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));
  const isRecent = hoursAgo < 24;

  if (variant === 'badge') {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full ${
        isRecent ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-600'
      }`}>
        <RefreshCw className="w-3 h-3" />
        {isRecent ? 'Live prices' : `Updated ${hoursAgo}h ago`}
      </span>
    );
  }

  if (variant === 'detailed') {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <Clock className="w-3.5 h-3.5" />
        <span>Prices updated {isRecent ? 'live' : `${hoursAgo} hours ago`}</span>
        {source && (
          <>
            <span className="text-gray-300">|</span>
            <Database className="w-3.5 h-3.5" />
            <span>Source: {source}</span>
          </>
        )}
      </div>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-xs text-gray-500">
      <Clock className="w-3 h-3" />
      {isRecent ? 'Live' : `${hoursAgo}h ago`}
    </span>
  );
}

// ============================================================================
// PRICE CONFIDENCE INDICATOR
// ============================================================================

interface PriceConfidenceProps {
  confidence: 'high' | 'medium' | 'low';
  dataPoints?: number;
  variant?: 'compact' | 'detailed';
}

export function PriceConfidence({ confidence, dataPoints, variant = 'compact' }: PriceConfidenceProps) {
  const config = {
    high: { color: 'text-green-600', bg: 'bg-green-50', label: 'High confidence', dots: 3 },
    medium: { color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Moderate confidence', dots: 2 },
    low: { color: 'text-gray-500', bg: 'bg-gray-50', label: 'Limited data', dots: 1 },
  }[confidence];

  if (variant === 'detailed') {
    return (
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${config.bg}`}>
        <div className="flex gap-0.5">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full ${i <= config.dots ? config.color.replace('text-', 'bg-') : 'bg-gray-200'}`}
            />
          ))}
        </div>
        <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
        {dataPoints && <span className="text-xs text-gray-400">({dataPoints} prices)</span>}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1" title={config.label}>
      {[1, 2, 3].map(i => (
        <div
          key={i}
          className={`w-1 h-1 rounded-full ${i <= config.dots ? config.color.replace('text-', 'bg-') : 'bg-gray-200'}`}
        />
      ))}
    </div>
  );
}

// ============================================================================
// WHY TRUST FLY2ANY BLOCK
// ============================================================================

interface TrustBlockProps {
  variant?: 'compact' | 'full' | 'footer';
}

const TRUST_POINTS = [
  { icon: Database, text: 'Real-time prices from 500+ airlines', detail: 'No cached or fake pricing' },
  { icon: Shield, text: 'No hidden fees or markups', detail: 'Final price shown upfront' },
  { icon: CheckCircle, text: 'Book directly with airlines', detail: 'We redirect to official sites' },
  { icon: TrendingUp, text: 'Price tracking since 2024', detail: 'Historical data for predictions' },
];

export function TrustBlock({ variant = 'compact' }: TrustBlockProps) {
  if (variant === 'footer') {
    return (
      <div className="border-t border-gray-100 pt-4 mt-4">
        <p className="text-xs text-gray-500 flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-green-600" />
          <span>Fly2Any compares real-time prices from 500+ airlines. No hidden fees.</span>
        </p>
      </div>
    );
  }

  if (variant === 'full') {
    return (
      <section className="bg-gray-50 rounded-xl p-6" aria-labelledby="trust-heading">
        <h3 id="trust-heading" className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-green-600" />
          Why Trust Fly2Any
        </h3>
        <ul className="space-y-3">
          {TRUST_POINTS.map((point, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <point.icon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-900">{point.text}</p>
                <p className="text-xs text-gray-500">{point.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  // Compact variant
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
      {TRUST_POINTS.slice(0, 3).map((point, idx) => (
        <span key={idx} className="flex items-center gap-1">
          <point.icon className="w-3 h-3 text-gray-400" />
          {point.text}
        </span>
      ))}
    </div>
  );
}

// ============================================================================
// DATA SOURCE DISCLOSURE
// ============================================================================

interface DataSourceProps {
  sources: string[];
  lastSync?: Date;
}

export function DataSource({ sources, lastSync }: DataSourceProps) {
  return (
    <details className="text-xs text-gray-500 group">
      <summary className="cursor-pointer hover:text-gray-700 flex items-center gap-1">
        <Database className="w-3 h-3" />
        Data sources
      </summary>
      <div className="mt-2 pl-4 border-l border-gray-200 space-y-1">
        {sources.map((source, idx) => (
          <p key={idx}>{source}</p>
        ))}
        {lastSync && (
          <p className="text-gray-400">Last sync: {lastSync.toLocaleDateString()}</p>
        )}
      </div>
    </details>
  );
}

// ============================================================================
// ROUTE INTELLIGENCE SUMMARY (AI DEFENSIBILITY)
// ============================================================================

interface RouteIntelligenceProps {
  origin: string;
  destination: string;
  avgPrice: number;
  priceChange: number; // % change
  bestDay: string;
  demandLevel: 'high' | 'medium' | 'low';
  dataPoints: number;
}

export function RouteIntelligence({
  origin,
  destination,
  avgPrice,
  priceChange,
  bestDay,
  demandLevel,
  dataPoints,
}: RouteIntelligenceProps) {
  const trendIcon = priceChange > 0 ? '↑' : priceChange < 0 ? '↓' : '→';
  const trendColor = priceChange > 0 ? 'text-red-600' : priceChange < 0 ? 'text-green-600' : 'text-gray-500';

  return (
    <div
      className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100"
      data-aeo="route-intelligence"
    >
      <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-blue-600" />
        Route Intelligence: {origin} → {destination}
      </h4>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <div>
          <p className="text-gray-500 text-xs">Avg Price</p>
          <p className="font-semibold text-gray-900">${avgPrice}</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs">7-Day Trend</p>
          <p className={`font-semibold ${trendColor}`}>
            {trendIcon} {Math.abs(priceChange)}%
          </p>
        </div>
        <div>
          <p className="text-gray-500 text-xs">Best Day</p>
          <p className="font-semibold text-gray-900">{bestDay}</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs">Demand</p>
          <p className="font-semibold text-gray-900 capitalize">{demandLevel}</p>
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
        <Database className="w-3 h-3" />
        Based on {dataPoints.toLocaleString()} price points • Updated hourly
      </p>
    </div>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export const TrustSignals = {
  DataFreshness,
  PriceConfidence,
  TrustBlock,
  DataSource,
  RouteIntelligence,
};

export default TrustSignals;
