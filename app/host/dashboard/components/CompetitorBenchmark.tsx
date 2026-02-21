'use client';

import { TrendingUp, TrendingDown, Activity, Sparkles, MapPin, Settings2, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { AnimatedFadeIn } from '@/components/ui/AnimatedFadeIn';

export function CompetitorBenchmark() {
  const [activeTab, setActiveTab] = useState<'occupancy' | 'pricing' | 'conversion'>('occupancy');
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState({
    marketOccupancy: 0,
    userOccupancy: 0,
    avgNightlyRate: 0,
    userNightlyRate: 0,
    conversionRate: 0,
    marketConversion: 0,
  });

  useEffect(() => {
    async function fetchInsights() {
      try {
        const res = await fetch('/api/host/insights');
        if (res.ok) {
          const json = await res.json();
          setInsights(json.data);
        }
      } catch (err) {
        console.error('Failed to fetch insights', err);
      } finally {
        setLoading(false);
      }
    }
    fetchInsights();
  }, []);

  return (
    <AnimatedFadeIn delay={0.4} className="h-full">
      <div className="bg-white rounded-[2rem] border border-neutral-100 shadow-soft p-8 overflow-hidden relative group h-full flex flex-col hover:shadow-soft-lg hover:-translate-y-1 transition-all duration-300">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 border-b border-neutral-100 pb-5 relative z-10">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-midnight-navy flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary-50">
              <Activity className="w-5 h-5 text-primary-500" />
            </div>
            Market Insights
          </h2>
          <p className="text-sm text-neutral-400 font-medium mt-1 pr-10">
            AI-driven competitor benchmarking for your local ZIP code.
          </p>
        </div>
        <button className="w-10 h-10 rounded-xl bg-neutral-50 hover:bg-neutral-100 flex items-center justify-center transition-colors border border-transparent hover:border-neutral-200">
          <Settings2 className="w-5 h-5 text-gray-500" />
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
                ? 'bg-white text-midnight-navy shadow-sm'
                : 'text-neutral-500 hover:text-midnight-navy hover:bg-white/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 relative z-10 flex flex-col justify-center min-h-[160px]">
        {loading ? (
           <div className="flex items-center justify-center h-full">
               <Loader2 className="w-8 h-8 animate-spin text-primary-300" />
           </div>
        ) : (
           <>
              {activeTab === 'occupancy' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Your Occupancy</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-gray-900">{insights.userOccupancy}%</span>
                  <span className={`text-xs font-bold flex items-center ${insights.userOccupancy >= insights.marketOccupancy ? 'text-emerald-500' : 'text-red-500'}`}>
                    {insights.userOccupancy >= insights.marketOccupancy ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />} 
                    {Math.abs(insights.userOccupancy - insights.marketOccupancy)}% vs Market
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Market Avg</p>
                <span className="text-xl font-bold text-gray-400">{insights.marketOccupancy}%</span>
              </div>
            </div>
            
            {/* Visual Bar */}
            <div className="relative h-2.5 bg-neutral-100 rounded-full overflow-hidden">
                <div className="absolute top-0 left-0 h-full bg-primary-200 rounded-full" style={{ width: `${insights.marketOccupancy}%` }} />
                <div className="absolute top-0 left-0 h-full bg-primary-500 rounded-full shadow-[0_0_12px_rgba(231,64,53,0.5)]" style={{ width: `${insights.userOccupancy}%` }} />
            </div>

            {/* AI Recommendation */}
            <div className="mt-5 p-4 rounded-2xl bg-secondary-50 border border-secondary-100 flex gap-4 items-start">
              <div className="bg-secondary-100 p-2 rounded-xl shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4 text-secondary-600" />
              </div>
              <p className="text-sm text-secondary-900 font-medium leading-relaxed">
                <strong className="block mb-0.5 font-bold text-secondary-800">AI Suggestion:</strong>
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
                  <span className="text-3xl font-black text-gray-900">${insights.userNightlyRate}</span>
                  <span className={`text-xs font-bold flex items-center ${insights.userNightlyRate >= insights.avgNightlyRate ? 'text-emerald-500' : 'text-red-500'}`}>
                    {insights.userNightlyRate >= insights.avgNightlyRate ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />} 
                    ${Math.abs(insights.userNightlyRate - insights.avgNightlyRate)} vs Market
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Market Avg</p>
                <span className="text-xl font-bold text-gray-400">${insights.avgNightlyRate}</span>
              </div>
            </div>

            {/* AI Recommendation */}
            <div className="mt-5 p-4 rounded-2xl bg-success-50 border border-success-100 flex gap-4 items-start">
              <div className="bg-success-100 p-2 rounded-xl shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4 text-success-600" />
              </div>
              <p className="text-sm text-success-900 font-medium leading-relaxed">
                <strong className="block mb-0.5 font-bold text-success-800">Pricing Strategy:</strong>
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
                  <span className="text-3xl font-black text-gray-900">{insights.conversionRate}%</span>
                  <span className={`text-xs font-bold flex items-center ${insights.conversionRate >= insights.marketConversion ? 'text-emerald-500' : 'text-red-500'}`}>
                    {insights.conversionRate >= insights.marketConversion ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />} 
                    {Math.abs(Number((insights.conversionRate - insights.marketConversion).toFixed(1)))}% Gap
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Top 10% Local</p>
                <span className="text-xl font-bold text-gray-400">{insights.marketConversion}%</span>
              </div>
            </div>

            {/* AI Recommendation */}
            <div className="mt-5 p-4 rounded-2xl bg-info-50 border border-info-100 flex gap-4 items-start">
              <div className="bg-info-100 p-2 rounded-xl shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4 text-info-600" />
              </div>
              <p className="text-sm text-info-900 font-medium leading-relaxed">
                <strong className="block mb-0.5 font-bold text-info-800">Content Optimization:</strong>
                Top properties in your area feature <span className="underline decoration-info-300 decoration-2 font-bold">"Hot Tub"</span> in the title. Try using the AI Description generator to highlight your premium amenities.
              </p>
            </div>
          </div>
        )}
        </>
        )}
      </div>

      {/* Decorative */}
      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary-500/5 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute top-10 right-10 w-20 h-20 bg-secondary-500/5 rounded-full blur-xl pointer-events-none" />
      </div>
    </AnimatedFadeIn>
  );
}
