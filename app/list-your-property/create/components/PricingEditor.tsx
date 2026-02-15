'use client';

import { useState } from 'react';
import { useState } from 'react';
import { DollarSign, Percent, Info, TrendingUp, Sparkles, Zap, ArrowRight } from 'lucide-react';
import { HelpTooltip } from '@/components/ui/HelpTooltip';

interface PricingEditorProps {
  data: {
    basePrice: number;
    currency: string;
    cleaningFee: number;
    smartPricing?: boolean;
    weeklyDiscount?: number;
    monthlyDiscount?: number;
  };
  onChange: (updates: any) => void;
}

export function PricingEditor({ data, onChange }: PricingEditorProps) {
  // Simple estimation logic
  const estimatedEarnings = Math.round(data.basePrice * 30 * 0.6); // 60% occupancy

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Base Price Card */}
      <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm relative overflow-hidden">
         {/* Smart Pricing Toggle */}
         <div className="absolute top-6 right-6 flex items-center gap-2">
             <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Smart Pricing</span>
             <button 
                onClick={() => onChange({ smartPricing: !data.smartPricing })}
                className={`w-12 h-6 rounded-full transition-colors relative ${data.smartPricing ? 'bg-primary-500' : 'bg-gray-200'}`}
             >
                 <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${data.smartPricing ? 'translate-x-6' : 'translate-x-0'}`} />
             </button>
             <HelpTooltip content="Automatically adjust your nightly rate based on demand, seasonality, and local events to maximize bookings." />
         </div>

         <div className="relative z-10">
             <div className="flex items-center gap-3 mb-6">
                 <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                     <DollarSign className="w-6 h-6" />
                 </div>
                 <div>
                     <h3 className="text-lg font-bold text-gray-900">Base Price</h3>
                     <p className="text-gray-500 text-sm">Your default nightly rate.</p>
                 </div>
                 <div className="ml-auto">
                    {data.basePrice < 120 ? (
                        <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" /> Great Value
                        </span>
                    ) : data.basePrice > 250 ? (
                         <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> Premium
                        </span>
                    ) : (
                        <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                            <Info className="w-3 h-3" /> Market Avg
                        </span>
                    )}
                 </div>
             </div>

             <div className="flex items-center gap-4">
                 <div className="relative flex-1">
                     <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                     <input 
                        type="number" 
                        value={data.basePrice}
                        onChange={(e) => onChange({ basePrice: parseInt(e.target.value) || 0 })}
                        className="w-full pl-8 pr-4 py-4 text-3xl font-bold text-gray-900 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all placeholder-gray-300"
                        placeholder="0"
                     />
                 </div>
                 <select 
                    value={data.currency}
                    onChange={(e) => onChange({ currency: e.target.value })}
                    className="h-[72px] px-6 rounded-xl bg-neutral-50 border border-neutral-200 text-gray-900 font-bold focus:ring-2 focus:ring-green-500 outline-none"
                 >
                     <option value="USD">USD</option>
                     <option value="EUR">EUR</option>
                     <option value="GBP">GBP</option>
                 </select>
             </div>
         </div>
         {/* Price Slider */}
         <div className="px-6 pb-6">
            <input 
                type="range" 
                min="10" 
                max="1000" 
                step="5"
                value={data.basePrice}
                onChange={(e) => onChange({ basePrice: parseInt(e.target.value) || 0 })}
                className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-green-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-2 font-medium">
                <span>$10</span>
                <span>$500</span>
                <span>$1000+</span>
            </div>
         </div>
      </div>

      {/* Length-of-stay discounts */}
      <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
           <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
               <Percent className="w-5 h-5 text-blue-500" /> Discounts
           </h4>
           <div className="grid grid-cols-2 gap-4">
               <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                   <label className="text-sm font-bold text-blue-900 mb-1 block">Weekly</label>
                   <p className="text-xs text-blue-700 mb-3">7+ nights</p>
                   <div className="flex items-center gap-2">
                       <input 
                           type="number" 
                           value={data.weeklyDiscount || 0}
                           onChange={(e) => onChange({ weeklyDiscount: parseInt(e.target.value) || 0 })}
                           className="w-16 p-2 rounded-lg border border-blue-200 text-center font-bold text-blue-900 focus:ring-2 focus:ring-blue-500 outline-none"
                       />
                       <span className="text-blue-900 font-bold">%</span>
                   </div>
               </div>
               <div className="p-4 rounded-xl bg-purple-50 border border-purple-100">
                   <label className="text-sm font-bold text-purple-900 mb-1 block">Monthly</label>
                   <p className="text-xs text-purple-700 mb-3">28+ nights</p>
                   <div className="flex items-center gap-2">
                       <input 
                           type="number" 
                           value={data.monthlyDiscount || 0}
                           onChange={(e) => onChange({ monthlyDiscount: parseInt(e.target.value) || 0 })}
                           className="w-16 p-2 rounded-lg border border-purple-200 text-center font-bold text-purple-900 focus:ring-2 focus:ring-purple-500 outline-none"
                       />
                       <span className="text-purple-900 font-bold">%</span>
                   </div>
               </div>
           </div>
      </div>

      {/* Fees & Discounts */}
      <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
               <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                   <Sparkles className="w-5 h-5 text-amber-500" /> Additional Fees
               </h4>
               <div className="space-y-4">
                   <div>
                       <label className="block text-sm font-semibold text-gray-700 mb-1">Cleaning Fee</label>
                       <div className="relative">
                           <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                           <input 
                                type="number" 
                                value={data.cleaningFee}
                                onChange={(e) => onChange({ cleaningFee: parseInt(e.target.value) || 0 })}
                                className="w-full pl-8 pr-4 py-3 rounded-xl bg-neutral-50 border border-neutral-200 text-gray-900 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                           />
                       </div>
                   </div>
               </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100 relative overflow-hidden flex flex-col justify-between">
               <div className="relative z-10">
                   <h4 className="font-bold text-green-800 mb-2 flex items-center gap-2">
                       <TrendingUp className="w-5 h-5" /> Potential Earnings
                   </h4>
                   <p className="text-green-700/80 text-sm mb-6">Estimated monthly revenue based on 60% occupancy.</p>
                   
                   <div className="flex items-baseline gap-1">
                       <span className="text-3xl font-bold text-green-900">${estimatedEarnings.toLocaleString()}</span>
                       <span className="text-green-700 font-medium">/ month</span>
                   </div>
                   
                   <div className="mt-4 pt-4 border-t border-green-200/50 space-y-2">
                       <div className="flex justify-between text-xs text-green-800">
                           <span>Guest pays</span>
                           <span className="font-bold">${data.basePrice + (data.cleaningFee || 0)/3 + (data.basePrice * 0.12)} <span className="opacity-60 text-[10px] font-normal">/ night (avg)</span></span>
                       </div>
                       <div className="flex justify-between text-xs text-green-800">
                           <span>You earn</span>
                           <span className="font-bold">${data.basePrice - (data.basePrice * 0.03)} <span className="opacity-60 text-[10px] font-normal">/ night</span></span>
                       </div>
                   </div>
               </div>
               <DollarSign className="absolute -right-4 -bottom-4 w-32 h-32 text-green-500/10 rotate-12" />
          </div>
      </div>

      <div className="flex gap-4 p-4 rounded-xl bg-blue-50 border border-blue-100 text-blue-800 text-sm">
          <Info className="w-5 h-5 shrink-0" />
          <p>We recommend starting with a lower price to get your first few bookings and reviews quickly.</p>
      </div>

    </div>
  );
}
