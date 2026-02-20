'use client';

import { TrendingUp, TrendingDown, Activity, Sparkles, MapPin, Settings2 } from 'lucide-react';
import { useState } from 'react';
import { AnimatedFadeIn } from '@/components/ui/AnimatedFadeIn';

// Mock data for the MVP AI Insight engine
const MOCK_INSIGHTS = {
  marketOccupancy: 68,
  userOccupancy: 62,
  avgNightlyRate: 145,
  userNightlyRate: 160,
  conversionRate: 2.1,
  marketConversion: 3.4,
};

export function CompetitorBenchmark() {
  const [activeTab, setActiveTab] = useState<'occupancy' | 'pricing' | 'conversion'>('occupancy');

  return (
    <AnimatedFadeIn delay={0.4} className="h-full">
      <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm p-6 overflow-hidden relative group h-full flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 relative z-10">
        <div>
          <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-600" /> Market Insights
          </h2>
          <p className="text-sm text-gray-500 font-medium mt-1 pr-10">
            AI-driven competitor benchmarking for your local ZIP code.
          </p>
        </div>
        <button className="w-10 h-10 rounded-full bg-neutral-50 hover:bg-neutral-100 flex items-center justify-center transition-colors">
          <Settings2 className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-neutral-50 p-1.5 rounded-2xl">
        {[
          { id: 'occupancy', label: 'Occupancy' },
          { id: 'pricing', label: 'Pricing' },
          { id: 'conversion', label: 'Conversion' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 text-xs font-bold py-2 rounded-xl transition-all ${
              activeTab === tab.id
                ? 'bg-white text-indigo-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 relative z-10 flex flex-col justify-center">
        {activeTab === 'occupancy' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Your Occupancy</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-gray-900">{MOCK_INSIGHTS.userOccupancy}%</span>
                  <span className="text-xs font-bold text-red-500 flex items-center">
                    <TrendingDown className="w-3 h-3 mr-0.5" /> 6% vs Market
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Market Avg</p>
                <span className="text-xl font-bold text-gray-400">{MOCK_INSIGHTS.marketOccupancy}%</span>
              </div>
            </div>
            
            {/* Visual Bar */}
            <div className="relative h-2 bg-neutral-100 rounded-full overflow-hidden">
                <div className="absolute top-0 left-0 h-full bg-indigo-200 rounded-full" style={{ width: `${MOCK_INSIGHTS.marketOccupancy}%` }} />
                <div className="absolute top-0 left-0 h-full bg-indigo-600 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.5)]" style={{ width: `${MOCK_INSIGHTS.userOccupancy}%` }} />
            </div>

            {/* AI Recommendation */}
            <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-100 flex gap-3 items-start">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-900 font-medium leading-relaxed">
                <strong className="block mb-0.5">AI Suggestion:</strong>
                Your 3-night minimum stay is blocking weekend trippers. Lowering it to 2 nights on Thursdays could boost occupancy by ~8%.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'pricing' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Your Avg Rate</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-gray-900">${MOCK_INSIGHTS.userNightlyRate}</span>
                  <span className="text-xs font-bold text-emerald-500 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-0.5" /> +$15 vs Market
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Market Avg</p>
                <span className="text-xl font-bold text-gray-400">${MOCK_INSIGHTS.avgNightlyRate}</span>
              </div>
            </div>

            {/* AI Recommendation */}
            <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-100 flex gap-3 items-start">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-xs text-emerald-900 font-medium leading-relaxed">
                <strong className="block mb-0.5">Pricing Strategy:</strong>
                You are out-earning the market nightly, but losing total yield due to lower occupancy. Enable <b>Smart Pricing</b> to auto-balance this curve.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'conversion' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">View-to-Book</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-gray-900">{MOCK_INSIGHTS.conversionRate}%</span>
                  <span className="text-xs font-bold text-red-500 flex items-center">
                    <TrendingDown className="w-3 h-3 mr-0.5" /> -1.3% Gap
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Top 10% Local</p>
                <span className="text-xl font-bold text-gray-400">{MOCK_INSIGHTS.marketConversion}%</span>
              </div>
            </div>

            {/* AI Recommendation */}
            <div className="mt-4 p-3 rounded-xl bg-blue-50 border border-blue-100 flex gap-3 items-start">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-900 font-medium leading-relaxed">
                <strong className="block mb-0.5">Content Optimization:</strong>
                Top properties in your area feature <span className="underline decoration-blue-300 decoration-2">"Hot Tub"</span> in the title. Try using the AI Description generator to highlight your premium amenities.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Decorative */}
      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-600/5 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute top-10 right-10 w-20 h-20 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
      </div>
    </AnimatedFadeIn>
  );
}
