'use client';

import { useState } from 'react';
import { DollarSign, Percent, Info, TrendingUp, Sparkles, Zap, Minus, Plus, Shield, Calendar, Users, Dog, Clock, ToggleLeft, ToggleRight, Moon, Receipt } from 'lucide-react';
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
    minStay?: number;
    maxStay?: number;
    instantBooking?: boolean;
    taxRate?: number;
  };
  onChange: (updates: any) => void;
}

// ─── Reusable Stepper Input ───
function StepperInput({
  value,
  onChange,
  min = 0,
  max = 99999,
  step = 1,
  prefix,
  suffix,
  size = 'md',
  label,
  icon: Icon,
  tooltip,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  icon?: any;
  tooltip?: string;
}) {
  const clamp = (v: number) => Math.min(max, Math.max(min, v));

  const sizeClasses = {
    sm: 'text-sm py-1.5',
    md: 'text-lg py-2',
    lg: 'text-3xl py-2',
  };

  const btnSize = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
  };

  const iconSize = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-xs font-bold text-gray-600 flex items-center gap-1.5">
          {Icon && <Icon className="w-3.5 h-3.5" />}
          {label}
          {tooltip && <HelpTooltip content={tooltip} />}
        </label>
      )}
      <div className="flex items-center gap-1.5 group/stepper">
        <button
          type="button"
          onClick={() => onChange(clamp(value - step))}
          disabled={value <= min}
          className={`${btnSize[size]} rounded-xl bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300 border border-neutral-200 flex items-center justify-center text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all shrink-0`}
        >
          <Minus className={iconSize[size]} />
        </button>
        <div className="relative flex-1">
          {prefix && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm pointer-events-none">
              {prefix}
            </span>
          )}
          <input
            type="text"
            inputMode="numeric"
            value={value || ''}
            onChange={(e) => {
              const raw = e.target.value.replace(/[^0-9.]/g, '');
              if (raw === '') { onChange(0); return; }
              const parsed = parseFloat(raw);
              if (!isNaN(parsed)) onChange(clamp(parsed));
            }}
            onBlur={() => onChange(clamp(value))}
            className={`w-full ${prefix ? 'pl-7' : 'pl-3'} ${suffix ? 'pr-7' : 'pr-3'} ${sizeClasses[size]} font-bold text-gray-900 bg-neutral-50 border border-neutral-200 rounded-xl text-center focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
            placeholder="0"
          />
          {suffix && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm pointer-events-none">
              {suffix}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => onChange(clamp(value + step))}
          disabled={value >= max}
          className={`${btnSize[size]} rounded-xl bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300 border border-neutral-200 flex items-center justify-center text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all shrink-0`}
        >
          <Plus className={iconSize[size]} />
        </button>
      </div>
    </div>
  );
}

// ─── Toggle Switch ───
function ToggleSwitch({
  enabled,
  onChange,
  label,
  description,
  icon: Icon,
  color = 'primary',
}: {
  enabled: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
  icon?: any;
  color?: 'primary' | 'purple' | 'green';
}) {
  const colors = {
    primary: { bg: 'bg-primary-600', ring: 'focus:ring-primary-500/50' },
    purple: { bg: 'bg-purple-600', ring: 'focus:ring-purple-500/50' },
    green: { bg: 'bg-green-600', ring: 'focus:ring-green-500/50' },
  };

  return (
    <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-neutral-50 border border-neutral-200 hover:border-neutral-300 transition-all">
      <div className="flex items-center gap-2.5">
        {Icon && <Icon className="w-4 h-4 text-gray-500" />}
        <div>
          <span className="text-sm font-bold text-gray-800">{label}</span>
          {description && <p className="text-[11px] text-gray-400 mt-0.5">{description}</p>}
        </div>
      </div>
      <button
        type="button"
        onClick={() => onChange(!enabled)}
        className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none focus:ring-2 ${colors[color].ring} ${enabled ? colors[color].bg : 'bg-gray-300'}`}
      >
        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  );
}

export function PricingEditor({ data, onChange }: PricingEditorProps) {
  // Safe defaults
  const basePrice = data.basePrice || 0;
  const cleaningFee = data.cleaningFee || 0;
  const weeklyDiscount = data.weeklyDiscount || 0;
  const monthlyDiscount = data.monthlyDiscount || 0;
  const taxRate = data.taxRate || 0;
  const minStay = data.minStay || 1;
  const maxStay = data.maxStay || 0;

  // PROFIT CALCULATOR
  const occupancyRate = 0.60;
  const nightsBooked = Math.round(30 * occupancyRate);
  const avgBookingLength = Math.max(minStay, 3);
  const numBookings = Math.round(nightsBooked / avgBookingLength);
  const weekendNights = Math.round(nightsBooked * (2 / 7));
  const weekdayNights = nightsBooked - weekendNights;

  const weekdayRevenue = weekdayNights * basePrice;
  const weekendRevenue = weekendNights * (data.weekendPrice || basePrice);
  const cleaningRevenue = cleaningFee * numBookings;
  const monthlyGross = weekdayRevenue + weekendRevenue + cleaningRevenue;

  // Apply approximate discount (weighted by booking length)
  const effectiveDiscount = avgBookingLength >= 28 ? monthlyDiscount
    : avgBookingLength >= 7 ? weeklyDiscount : 0;
  const afterDiscount = monthlyGross * (1 - effectiveDiscount / 100);

  const taxAmount = Math.round(afterDiscount * (taxRate / 100));
  const platformFee = Math.round(afterDiscount * 0.12);
  const estimatedNet = Math.round(afterDiscount - platformFee);

  const handleUpdate = (updates: any) => {
    onChange({ ...data, ...updates });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ━━━━━ ROW 1: Base Price + Discounts ━━━━━ */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* Base Price Card */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm relative overflow-hidden group hover:border-green-300 transition-all">
          <div className="flex justify-between items-start mb-5">
            <div>
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" /> Base Price
              </h3>
              <p className="text-xs text-gray-500">Per night</p>
            </div>
            <select
              value={data.currency}
              onChange={(e) => handleUpdate({ currency: e.target.value })}
              className="h-9 px-3 rounded-xl bg-neutral-50 border border-neutral-200 text-gray-900 font-bold focus:ring-2 focus:ring-green-500 outline-none text-sm cursor-pointer hover:bg-neutral-100 transition-colors"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="BRL">BRL</option>
            </select>
          </div>

          <StepperInput
            value={basePrice}
            onChange={(v) => handleUpdate({ basePrice: v })}
            min={1}
            max={50000}
            step={5}
            prefix="$"
            size="lg"
          />

          {/* Range Slider */}
          <div className="mt-4">
            <input
              type="range"
              min="10"
              max="1000"
              step="5"
              value={Math.min(basePrice, 1000)}
              onChange={(e) => handleUpdate({ basePrice: parseInt(e.target.value) || 0 })}
              className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-green-600 hover:accent-green-500 transition-all"
            />
            <div className="flex justify-between mt-1 text-[10px] text-gray-400 font-medium px-1">
              <span>$10</span>
              <span>$500</span>
              <span>$1000+</span>
            </div>
          </div>
        </div>

        {/* Long-stay Discounts */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm flex flex-col group hover:border-blue-300 transition-all">
          <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm">
            <Percent className="w-4 h-4 text-blue-500" /> Long-stay Discounts
          </h4>
          <div className="grid grid-cols-2 gap-4 flex-1">
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 flex flex-col justify-center items-center relative overflow-hidden hover:border-blue-300 transition-colors">
              <span className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-3">Weekly (7+)</span>
              <StepperInput
                value={weeklyDiscount}
                onChange={(v) => handleUpdate({ weeklyDiscount: v })}
                min={0}
                max={80}
                step={5}
                suffix="%"
                size="sm"
              />
            </div>
            <div className="p-4 rounded-xl bg-purple-50 border border-purple-100 flex flex-col justify-center items-center relative overflow-hidden hover:border-purple-300 transition-colors">
              <span className="text-xs font-bold text-purple-800 uppercase tracking-wider mb-3">Monthly (28+)</span>
              <StepperInput
                value={monthlyDiscount}
                onChange={(v) => handleUpdate({ monthlyDiscount: v })}
                min={0}
                max={80}
                step={5}
                suffix="%"
                size="sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ━━━━━ ROW 2: Fees + Earnings ━━━━━ */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* Additional Fees */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm">
          <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm border-b pb-2">
            <Sparkles className="w-4 h-4 text-amber-500" /> Additional Fees & Charges
          </h4>

          <div className="grid grid-cols-2 gap-4">
            <StepperInput
              value={data.cleaningFee || 0}
              onChange={(v) => handleUpdate({ cleaningFee: v })}
              min={0} max={10000} step={5}
              prefix="$" size="sm"
              label="Cleaning" icon={Sparkles}
              tooltip="One-time fee per stay"
            />
            <StepperInput
              value={data.weekendPrice || 0}
              onChange={(v) => handleUpdate({ weekendPrice: v })}
              min={0} max={50000} step={5}
              prefix="$" size="sm"
              label="Weekend" icon={Moon}
              tooltip="Fri & Sat night rate (overrides base)"
            />
            <StepperInput
              value={data.petFee || 0}
              onChange={(v) => handleUpdate({ petFee: v })}
              min={0} max={10000} step={5}
              prefix="$" size="sm"
              label="Pet Fee" icon={Dog}
            />
            <StepperInput
              value={data.extraGuestFee || 0}
              onChange={(v) => handleUpdate({ extraGuestFee: v })}
              min={0} max={10000} step={5}
              prefix="$" size="sm"
              label="Extra Guest" icon={Users}
              tooltip="Per guest per night after base occupancy"
            />
            <StepperInput
              value={data.taxRate || 0}
              onChange={(v) => handleUpdate({ taxRate: v })}
              min={0} max={50} step={0.5}
              suffix="%" size="sm"
              label="Tax Rate" icon={Receipt}
              tooltip="Local tax rate added to guest total"
            />
          </div>
        </div>

        {/* Profit Calculator */}
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
              {effectiveDiscount > 0 && (
                <div className="flex justify-between text-xs text-green-900/70 font-medium">
                  <span>Long-stay Discount ({effectiveDiscount}%)</span>
                  <span className="font-bold text-amber-600">-${Math.round(monthlyGross - afterDiscount).toLocaleString()}</span>
                </div>
              )}
              {taxRate > 0 && (
                <div className="flex justify-between text-xs text-green-900/70 font-medium">
                  <span>Taxes ({taxRate}%)</span>
                  <span className="font-bold text-gray-500">${taxAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-xs text-green-900/70 font-medium">
                <span>Host Service Fee (12%)</span>
                <span className="font-bold text-red-500">-${platformFee.toLocaleString()}</span>
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

          {/* Decorative */}
          <DollarSign className="absolute -right-6 -bottom-6 w-40 h-40 text-green-500/10 rotate-12" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-200/20 rounded-full blur-3xl -mr-10 -mt-10" />
        </div>
      </div>

      {/* ━━━━━ ROW 3: Booking Controls ━━━━━ */}
      <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm">
        <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm border-b pb-2">
          <Calendar className="w-4 h-4 text-indigo-500" /> Booking Controls
        </h4>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <StepperInput
            value={minStay}
            onChange={(v) => handleUpdate({ minStay: v })}
            min={1} max={365} step={1}
            size="sm"
            label="Minimum Stay" icon={Clock}
            tooltip="Minimum nights per booking"
          />
          <StepperInput
            value={maxStay}
            onChange={(v) => handleUpdate({ maxStay: v })}
            min={0} max={365} step={1}
            size="sm"
            label="Max Stay" icon={Clock}
            tooltip="Maximum nights per booking (0 = no limit)"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-purple-50 p-4 rounded-2xl border border-purple-200 relative overflow-hidden group hover:shadow-md transition-all">
             <div className="flex items-start justify-between z-10 relative">
                 <div>
                     <h4 className="font-bold text-purple-900 mb-1 flex items-center gap-1.5">
                         <Sparkles className="w-4 h-4" /> AI Smart Yield
                     </h4>
                     <p className="text-[11px] text-purple-800/80 mb-3 pr-8 leading-tight">
                         Enable algorithmic pricing. We analyze local demand, competitor saturation, and seasonality to automatically adjust your nightly rate and maximize total revenue.
                     </p>
                     
                     <div className="flex items-center gap-2 mb-4">
                         <span className="bg-white/60 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-purple-100">
                             Est. +18% Yield
                         </span>
                         <span className="bg-white/60 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-purple-100">
                             Set & Forget
                         </span>
                     </div>
                 </div>
                 
                 {/* Custom Toggle */}
                 <button
                    type="button"
                    onClick={() => handleUpdate({ smartPricing: !data.smartPricing })}
                    className={`shrink-0 w-12 h-6 rounded-full transition-colors relative focus:outline-none focus:ring-2 focus:ring-purple-500/50 shadow-inner ${data.smartPricing ? 'bg-purple-600' : 'bg-purple-300'}`}
                 >
                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${data.smartPricing ? 'translate-x-6' : 'translate-x-0'}`} />
                 </button>
             </div>
             
             {/* Decorative */}
             <Sparkles className="absolute -bottom-4 -right-4 w-24 h-24 text-purple-500/10 rotate-12 pointer-events-none" />
          </div>

          <div className="flex flex-col justify-center gap-3">
            <ToggleSwitch
                enabled={data.instantBooking ?? true}
                onChange={(v) => handleUpdate({ instantBooking: v })}
                label="Instant Booking"
                description="Guests can book without host approval"
                icon={Zap}
                color="green"
            />
          </div>
      </div>

      {/* ━━━━━ Pro Tip ━━━━━ */}
      <div className="flex gap-4 p-4 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-800 text-xs items-start">
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        <p>
          <strong>Pro Tip:</strong> Listings with &quot;Smart Pricing&quot; enabled get <strong>2x more views</strong> on average. We automatically adjust your nightly rate based on local demand, holidays, and seasonality to maximize your revenue.
        </p>
      </div>

    </div>
    </div>
  );
}
