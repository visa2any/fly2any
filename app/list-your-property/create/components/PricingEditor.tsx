'use client';

import { useState } from 'react';
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
  // Ensure defaults
  const basePrice = data.basePrice || 0;
  const cleaningFee = data.cleaningFee || 0;
  
  // PROFIT CALCULATOR LOGIC
  // Assumptions: Occupancy 60%, Platform Fee 3%, Tax 0% (host handles)
  const occupancyRate = 0.60;
  const nightsBooked = Math.round(30 * occupancyRate); // 18 nights
  const monthlyBaseRevenue = basePrice * nightsBooked;
  const monthlyCleaningRevenue = cleaningFee * (nightsBooked / 3); // Approx 6 bookings
  const monthlyGross = monthlyBaseRevenue + monthlyCleaningRevenue;
  const platformFee = Math.round(monthlyGross * 0.03); // 3% host fee
  const monthlyGross = monthlyBaseRevenue + monthlyCleaningRevenue;
  const platformFee = Math.round(monthlyGross * 0.03); // 3% host fee
  const estimatedNet = monthlyGross - platformFee;

  const handleUpdate = (updates: any) => {
    onChange({ ...data, ...updates });
  };


  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Top Section: Base Price & Smart Strategy */}
      <div className="grid md:grid-cols-2 gap-6">
          
          {/* Base Price Card */}
          <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm relative overflow-hidden flex flex-col justify-between group hover:border-green-300 transition-all">
              
              <div className="flex justify-between items-start mb-4">
                  <div>
                      <h3 className="font-bold text-gray-900 flex items-center gap-2">
                          <DollarSign className="w-5 h-5 text-green-600" /> Base Price
                      </h3>
                      <p className="text-xs text-gray-500">Per night</p>
                  </div>
                  
                  {/* Smart Pricing Toggle */}
                  <div className={`flex items-center gap-2 px-2 py-1 rounded-lg border transition-all ${data.smartPricing ? 'bg-purple-50 border-purple-100' : 'bg-neutral-50 border-neutral-100'}`}>
                      <span className={`text-[10px] font-bold uppercase ${data.smartPricing ? 'text-purple-600' : 'text-gray-500'}`}>
                          {data.smartPricing ? 'Smart Pricing ON' : 'Smart Pricing'}
                      </span>
                      <button 
                          onClick={() => handleUpdate({ smartPricing: !data.smartPricing })}
                          className={`w-9 h-5 rounded-full transition-colors relative focus:outline-none focus:ring-2 focus:ring-purple-500/50 ${data.smartPricing ? 'bg-purple-600' : 'bg-gray-300'}`}
                      >
                          <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform shadow-sm ${data.smartPricing ? 'translate-x-4' : 'translate-x-0'}`} />
                      </button>
                  </div>
              </div>

              <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                      <input 
                          type="number" 
                          value={data.basePrice || ''}
                          onChange={(e) => handleUpdate({ basePrice: parseInt(e.target.value) || 0 })}
                          className="w-full pl-6 pr-3 py-2 text-3xl font-bold text-gray-900 bg-neutral-50 border border-neutral-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all placeholder-gray-300"
                          placeholder="0"
                      />
                  </div>
                  <select 
                      value={data.currency}
                      onChange={(e) => handleUpdate({ currency: e.target.value })}
                      className="h-12 px-3 rounded-lg bg-neutral-50 border border-neutral-200 text-gray-900 font-bold focus:ring-2 focus:ring-green-500 outline-none text-sm cursor-pointer hover:bg-neutral-100 transition-colors"
                  >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="BRL">BRL</option>
                  </select>
              </div>
              
              {/* Range Slider */}
              <div className="mt-6">
                  <input 
                      type="range" 
                      min="10" 
                      max="1000" 
                      step="5"
                      value={data.basePrice || 0}
                      onChange={(e) => handleUpdate({ basePrice: parseInt(e.target.value) || 0 })}
                      className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-green-600 hover:accent-green-500 transition-all"
                  />
                  <div className="flex justify-between mt-1 text-[10px] text-gray-400 font-medium px-1">
                      <span>$10</span>
                      <span>$500</span>
                      <span>$1000+</span>
                  </div>
              </div>

              {data.smartPricing && (
                  <div className="mt-4 pt-3 border-t border-purple-100 flex items-center gap-2 text-xs text-purple-700 font-medium animate-in fade-in slide-in-from-top-1">
                      <Sparkles className="w-3 h-3" /> 
                      <span>Prices auto-adjust based on local demand.</span>
                  </div>
              )}
          </div>

          {/* Discounts */}
          <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm flex flex-col group hover:border-blue-300 transition-all">
               <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm">
                   <Percent className="w-4 h-4 text-blue-500" /> Long-stay Discounts
               </h4>
               <div className="grid grid-cols-2 gap-4 h-full">
                   <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 flex flex-col justify-center items-center text-center relative overflow-hidden group/item hover:border-blue-300 transition-colors">
                       <span className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-2">Weekly (7+)</span>
                       <div className="flex items-center gap-1 justify-center relative z-10">
                           <input 
                               type="number" 
                               value={data.weeklyDiscount || 0}
                               onChange={(e) => handleUpdate({ weeklyDiscount: parseInt(e.target.value) || 0 })}
                               className="w-14 p-1 text-center bg-white rounded-md border border-blue-200 font-black text-xl text-blue-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                           />
                           <span className="text-blue-900 font-bold text-lg">%</span>
                       </div>
                       <div className="absolute -right-4 -bottom-4 text-blue-200/50">
                           <Calendar className="w-16 h-16" />
                       </div>
                   </div>
                   <div className="p-4 rounded-xl bg-purple-50 border border-purple-100 flex flex-col justify-center items-center text-center relative overflow-hidden group/item hover:border-purple-300 transition-colors">
                       <span className="text-xs font-bold text-purple-800 uppercase tracking-wider mb-2">Monthly (28+)</span>
                       <div className="flex items-center gap-1 justify-center relative z-10">
                           <input 
                               type="number" 
                               value={data.monthlyDiscount || 0}
                               onChange={(e) => handleUpdate({ monthlyDiscount: parseInt(e.target.value) || 0 })}
                               className="w-14 p-1 text-center bg-white rounded-md border border-purple-200 font-black text-xl text-purple-900 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                           />
                           <span className="text-purple-900 font-bold text-lg">%</span>
                       </div>
                       <div className="absolute -right-4 -bottom-4 text-purple-200/50">
                           <Calendar className="w-16 h-16" />
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
                       <label className="text-xs font-bold text-gray-600 flex items-center gap-1">Cleaning <HelpTooltip content="One-time fee per stay" /></label>
                       <div className="relative group/input">
                           <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold group-focus-within/input:text-primary-500 transition-colors">$</span>
                           <input 
                                type="number" 
                                value={data.cleaningFee || ''}
                                onChange={(e) => handleUpdate({ cleaningFee: parseInt(e.target.value) || 0 })}
                                className="w-full pl-6 pr-2 py-2 rounded-lg bg-neutral-50 border border-neutral-200 text-sm font-semibold focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                                placeholder="0"
                           />
                       </div>
                   </div>

                   {/* Weekend Price */}
                   <div className="space-y-1">
                       <label className="text-xs font-bold text-gray-600 flex items-center gap-1"><Calendar className="w-3 h-3" /> Weekend</label>
                       <div className="relative group/input">
                           <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold group-focus-within/input:text-primary-500 transition-colors">$</span>
                           <input 
                                type="number" 
                                value={data.weekendPrice || ''}
                                onChange={(e) => handleUpdate({ weekendPrice: parseInt(e.target.value) || 0 })}
                                className="w-full pl-6 pr-2 py-2 rounded-lg bg-neutral-50 border border-neutral-200 text-sm font-semibold focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                                placeholder="0"
                           />
                       </div>
                   </div>

                   {/* Pet Fee */}
                   <div className="space-y-1">
                       <label className="text-xs font-bold text-gray-600 flex items-center gap-1"><Dog className="w-3 h-3" /> Pet Fee</label>
                       <div className="relative group/input">
                           <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold group-focus-within/input:text-primary-500 transition-colors">$</span>
                           <input 
                                type="number" 
                                value={data.petFee || ''}
                                onChange={(e) => handleUpdate({ petFee: parseInt(e.target.value) || 0 })}
                                className="w-full pl-6 pr-2 py-2 rounded-lg bg-neutral-50 border border-neutral-200 text-sm font-semibold focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                                placeholder="0"
                           />
                       </div>
                   </div>

                   {/* Extra Guest Fee */}
                   <div className="space-y-1">
                       <label className="text-xs font-bold text-gray-600 flex items-center gap-1"><Users className="w-3 h-3" /> Extra Guest</label>
                       <div className="relative group/input">
                           <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold group-focus-within/input:text-primary-500 transition-colors">$</span>
                           <input 
                                type="number" 
                                value={data.extraGuestFee || ''}
                                onChange={(e) => handleUpdate({ extraGuestFee: parseInt(e.target.value) || 0 })}
                                className="w-full pl-6 pr-2 py-2 rounded-lg bg-neutral-50 border border-neutral-200 text-sm font-semibold focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                                placeholder="0"
                           />
                       </div>
                   </div>

                   {/* Security Deposit (Full Width) */}
                   <div className="col-span-2 space-y-1 pt-2 border-t border-dashed border-neutral-200 mt-2">
                       <label className="text-xs font-bold text-gray-600 flex items-center gap-1"><Shield className="w-3 h-3" /> Security Deposit</label>
                       <div className="relative group/input">
                           <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold group-focus-within/input:text-primary-500 transition-colors">$</span>
                           <input 
                                type="number" 
                                value={data.securityDeposit || ''}
                                onChange={(e) => handleUpdate({ securityDeposit: parseInt(e.target.value) || 0 })}
                                className="w-full pl-6 pr-2 py-2 rounded-lg bg-neutral-50 border border-neutral-200 text-sm font-semibold focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                                placeholder="0"
                           />
                       </div>
                   </div>

               </div>
          </div>

          {/* Right: Profit Calculator / Earnings */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100 relative overflow-hidden flex flex-col justify-center group hover:shadow-lg hover:shadow-green-100/50 transition-all">
               <div className="relative z-10">
                   <h4 className="font-bold text-green-800 mb-2 flex items-center gap-2">
                       <TrendingUp className="w-5 h-5" /> Estimated Monthly Profit
                   </h4>
                   <p className="text-green-700/80 text-xs mb-6 font-medium">Based on 60% occupancy ({nightsBooked} nights/mo)</p>
                   
                   <div className="flex items-baseline gap-1 mb-6">
                       <span className="text-5xl font-black text-green-900 tracking-tight">${isNaN(estimatedNet) ? 0 : estimatedNet.toLocaleString()}</span>
                       <span className="text-green-700 font-bold text-sm">/ month</span>
                   </div>
                   
                   <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 space-y-3 border border-green-100/50 shadow-sm">
                       <div className="flex justify-between text-xs text-green-900/70 font-medium">
                           <span>Gross Revenue</span>
                           <span className="font-bold">${monthlyGross.toLocaleString()}</span>
                       </div>
                       <div className="flex justify-between text-xs text-green-900/70 font-medium">
                           <span>Host Service Fee (3%)</span>
                           <span className="font-bold text-red-500">-${platformFee}</span>
                       </div>
                       <div className="h-px bg-green-100 my-1" />
                       <div className="flex justify-between text-sm text-green-900 font-bold">
                           <span>Net Income</span>
                           <span>${estimatedNet.toLocaleString()}</span>
                       </div>
                   </div>

                   {/* Competitor Comparison */}
                   <div className="mt-4 flex gap-2 items-start opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 bg-white/50 p-2 rounded-lg border border-green-100">
                      <Zap className="w-3 h-3 text-amber-500 mt-0.5 shrink-0" />
                      <div className="space-y-1">
                        <p className="text-[10px] text-green-800 font-bold leading-tight uppercase tracking-wider">
                            Why 12%?
                        </p>
                        <p className="text-[10px] text-green-800/80 leading-tight">
                            Most platforms charge <b>15-20%</b>. By listing here, you save an extra <b>3-8%</b> on every booking compared to competitors.
                        </p>
                      </div>
                   </div>
               </div>
               
               {/* Decorative Background */}
               <DollarSign className="absolute -right-6 -bottom-6 w-40 h-40 text-green-500/10 rotate-12" />
               <div className="absolute top-0 right-0 w-32 h-32 bg-green-200/20 rounded-full blur-3xl -mr-10 -mt-10" />
          </div>
      </div>

      <div className="flex gap-4 p-4 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-800 text-xs items-start">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <p>
            <strong>Pro Tip:</strong> Listings with "Smart Pricing" enabled get <strong>2x more views</strong> on average. We automatically adjust your nightly rate based on local demand, holidays, and seasonality to maximize your revenue.
          </p>
      </div>

    </div>
  );
}
