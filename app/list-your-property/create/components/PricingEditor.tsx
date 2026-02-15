'use client';

import { useState, useEffect } from 'react';
import { DollarSign, Percent, Info, TrendingUp, Sparkles, Zap, ArrowRight, Shield, Calendar, Users, Dog } from 'lucide-react';
import { HelpTooltip } from '@/components/ui/HelpTooltip';

interface PricingEditorProps {
  data: {
    basePrice: number;
    currency: string;
    cleaningFee?: number;
    petFee?: number;
    extraGuestFee?: number;
    weekendPrice?: number;
    securityDeposit?: number;
    smartPricing?: boolean;
    weeklyDiscount?: number;
    monthlyDiscount?: number;
  };
  onChange: (updates: any) => void;
}

export function PricingEditor({ data, onChange }: PricingEditorProps) {
  // Simple estimation logic
  // Ensure we use 0 if undefined to prevent NaN
  const basePrice = data.basePrice || 0;
  const cleaningFee = data.cleaningFee || 0;
  
  // Monthly Revenue = (Base Price * 30 * 0.6) + (Cleaning Fee * 4) approx
  const estimatedEarnings = Math.round((basePrice * 30 * 0.6) + (cleaningFee * 4)); 

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Top Section: Base Price & Strategy (Compact 2-Col on large screens) */}
      <div className="grid md:grid-cols-2 gap-6">
          
          {/* Base Price Card */}
          <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
              
              <div className="flex justify-between items-start mb-4">
                  <div>
                      <h3 className="font-bold text-gray-900 flex items-center gap-2">
                          <DollarSign className="w-5 h-5 text-green-600" /> Base Price
                      </h3>
                      <p className="text-xs text-gray-500">Per night</p>
                  </div>
                  
                  {/* Smart Pricing Toggle - Compact */}
                  <div className="flex items-center gap-2 bg-neutral-50 px-2 py-1 rounded-lg border border-neutral-100">
                      <span className="text-[10px] font-bold text-gray-500 uppercase">Smart Pricing</span>
                      <button 
                          onClick={() => onChange({ smartPricing: !data.smartPricing })}
                          className={`w-8 h-4 rounded-full transition-colors relative ${data.smartPricing ? 'bg-primary-500' : 'bg-gray-300'}`}
                      >
                          <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${data.smartPricing ? 'translate-x-4' : 'translate-x-0'}`} />
                      </button>
                  </div>
              </div>

              <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                      <input 
                          type="number" 
                          value={data.basePrice || ''}
                          onChange={(e) => onChange({ basePrice: parseInt(e.target.value) || 0 })}
                          className="w-full pl-6 pr-3 py-2 text-2xl font-bold text-gray-900 bg-neutral-50 border border-neutral-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all placeholder-gray-300"
                          placeholder="0"
                      />
                  </div>
                  <select 
                      value={data.currency}
                      onChange={(e) => onChange({ currency: e.target.value })}
                      className="h-12 px-3 rounded-lg bg-neutral-50 border border-neutral-200 text-gray-900 font-bold focus:ring-2 focus:ring-green-500 outline-none text-sm"
                  >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                  </select>
              </div>
              
              {/* Range Slider - integrated below input */}
              <div className="mt-4">
                  <input 
                      type="range" 
                      min="10" 
                      max="1000" 
                      step="5"
                      value={data.basePrice || 0}
                      onChange={(e) => onChange({ basePrice: parseInt(e.target.value) || 0 })}
                      className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                  />
              </div>
          </div>

          {/* Discounts */}
          <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm flex flex-col">
               <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-sm">
                   <Percent className="w-4 h-4 text-blue-500" /> Long-stay Discounts
               </h4>
               <div className="grid grid-cols-2 gap-3 h-full">
                   <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100 flex flex-col justify-center items-center text-center">
                       <span className="text-xs font-bold text-blue-900 block mb-1">Weekly (7+)</span>
                       <div className="flex items-center gap-1 justify-center">
                           <input 
                               type="number" 
                               value={data.weeklyDiscount || 0}
                               onChange={(e) => onChange({ weeklyDiscount: parseInt(e.target.value) || 0 })}
                               className="w-12 p-1 text-center bg-white rounded border border-blue-200 font-bold text-blue-900 outline-none focus:border-blue-500 text-sm"
                           />
                           <span className="text-blue-900 font-bold text-sm">%</span>
                       </div>
                   </div>
                   <div className="p-3 rounded-xl bg-purple-50/50 border border-purple-100 flex flex-col justify-center items-center text-center">
                       <span className="text-xs font-bold text-purple-900 block mb-1">Monthly (28+)</span>
                       <div className="flex items-center gap-1 justify-center">
                           <input 
                               type="number" 
                               value={data.monthlyDiscount || 0}
                               onChange={(e) => onChange({ monthlyDiscount: parseInt(e.target.value) || 0 })}
                               className="w-12 p-1 text-center bg-white rounded border border-purple-200 font-bold text-purple-900 outline-none focus:border-purple-500 text-sm"
                           />
                           <span className="text-purple-900 font-bold text-sm">%</span>
                       </div>
                   </div>
               </div>
          </div>

      </div>

      {/* Main Grid: Fees vs Earnings */}
      <div className="grid md:grid-cols-2 gap-6">
          
          {/* Left: Additional Fees Grid */}
          <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm">
               <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm border-b pb-2">
                   <Sparkles className="w-4 h-4 text-amber-500" /> Additional Fees & Charges
               </h4>
               
               <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                   {/* Cleaning Fee */}
                   <div className="space-y-1">
                       <label className="text-xs font-semibold text-gray-600 flex items-center gap-1">Cleaning <HelpTooltip content="One-time fee per stay" /></label>
                       <div className="relative">
                           <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                           <input 
                                type="number" 
                                value={data.cleaningFee || ''}
                                onChange={(e) => onChange({ cleaningFee: parseInt(e.target.value) || 0 })}
                                className="w-full pl-6 pr-2 py-1.5 rounded-lg bg-neutral-50 border border-neutral-200 text-sm focus:border-primary-500 outline-none transition-all"
                                placeholder="0"
                           />
                       </div>
                   </div>

                   {/* Weekend Price */}
                   <div className="space-y-1">
                       <label className="text-xs font-semibold text-gray-600 flex items-center gap-1"><Calendar className="w-3 h-3" /> Weekend</label>
                       <div className="relative">
                           <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                           <input 
                                type="number" 
                                value={data.weekendPrice || ''}
                                onChange={(e) => onChange({ weekendPrice: parseInt(e.target.value) || 0 })}
                                className="w-full pl-6 pr-2 py-1.5 rounded-lg bg-neutral-50 border border-neutral-200 text-sm focus:border-primary-500 outline-none transition-all"
                                placeholder="0"
                           />
                       </div>
                   </div>

                   {/* Pet Fee */}
                   <div className="space-y-1">
                       <label className="text-xs font-semibold text-gray-600 flex items-center gap-1"><Dog className="w-3 h-3" /> Pet Fee</label>
                       <div className="relative">
                           <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                           <input 
                                type="number" 
                                value={data.petFee || ''}
                                onChange={(e) => onChange({ petFee: parseInt(e.target.value) || 0 })}
                                className="w-full pl-6 pr-2 py-1.5 rounded-lg bg-neutral-50 border border-neutral-200 text-sm focus:border-primary-500 outline-none transition-all"
                                placeholder="0"
                           />
                       </div>
                   </div>

                   {/* Extra Guest Fee */}
                   <div className="space-y-1">
                       <label className="text-xs font-semibold text-gray-600 flex items-center gap-1"><Users className="w-3 h-3" /> Extra Guest</label>
                       <div className="relative">
                           <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                           <input 
                                type="number" 
                                value={data.extraGuestFee || ''}
                                onChange={(e) => onChange({ extraGuestFee: parseInt(e.target.value) || 0 })}
                                className="w-full pl-6 pr-2 py-1.5 rounded-lg bg-neutral-50 border border-neutral-200 text-sm focus:border-primary-500 outline-none transition-all"
                                placeholder="0"
                           />
                       </div>
                   </div>

                   {/* Security Deposit (Full Width) */}
                   <div className="col-span-2 space-y-1 pt-2 border-t border-dashed">
                       <label className="text-xs font-semibold text-gray-600 flex items-center gap-1"><Shield className="w-3 h-3" /> Security Deposit</label>
                       <div className="relative">
                           <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                           <input 
                                type="number" 
                                value={data.securityDeposit || ''}
                                onChange={(e) => onChange({ securityDeposit: parseInt(e.target.value) || 0 })}
                                className="w-full pl-6 pr-2 py-1.5 rounded-lg bg-neutral-50 border border-neutral-200 text-sm focus:border-primary-500 outline-none transition-all"
                                placeholder="0"
                           />
                       </div>
                   </div>

               </div>
          </div>

          {/* Right: Potential Earnings */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100 relative overflow-hidden flex flex-col justify-center">
               <div className="relative z-10">
                   <h4 className="font-bold text-green-800 mb-2 flex items-center gap-2">
                       <TrendingUp className="w-5 h-5" /> Potential Earnings
                   </h4>
                   <p className="text-green-700/80 text-xs mb-4">Estimated monthly revenue based on 60% occupancy.</p>
                   
                   <div className="flex items-baseline gap-1 mb-4">
                       <span className="text-4xl font-bold text-green-900">${isNaN(estimatedEarnings) ? 0 : estimatedEarnings.toLocaleString()}</span>
                       <span className="text-green-700 font-medium text-sm">/ month</span>
                   </div>
                   
                   <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 space-y-2 border border-green-100/50">
                       <div className="flex justify-between text-xs text-green-800">
                           <span>Guest pays</span>
                           <span className="font-bold">${basePrice + Math.round(cleaningFee/3) + Math.round(basePrice * 0.12)} <span className="opacity-60 text-[10px] font-normal">/ night (avg)</span></span>
                       </div>
                       <div className="flex justify-between text-xs text-green-800">
                           <span>You earn</span>
                           <span className="font-bold">${basePrice - Math.round(basePrice * 0.03)} <span className="opacity-60 text-[10px] font-normal">/ night</span></span>
                       </div>
                   </div>
               </div>
               <DollarSign className="absolute -right-6 -bottom-6 w-40 h-40 text-green-500/10 rotate-12" />
          </div>
      </div>

      <div className="flex gap-4 p-4 rounded-xl bg-blue-50 border border-blue-100 text-blue-800 text-xs items-start">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <p>We recommend starting with a lower price to get your first few bookings and reviews quickly. Use <strong>Smart Pricing</strong> to automate this.</p>
      </div>

    </div>
  );
}
