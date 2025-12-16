'use client';

/**
 * Booking Extras Card — Fly2Any
 * Level 6 Apple-Class display for add-ons, seats, bundles, fare upgrades
 */

import {
  Luggage, Armchair, Package, Sparkles, Shield,
  UtensilsCrossed, Wifi, Car, ChevronDown, ChevronUp,
  Check, Tag
} from 'lucide-react';
import { useState } from 'react';
import type { AddOn, Bundle, FareUpgrade, SeatSelection, PromoCodeDiscount } from '@/lib/bookings/types';

interface BookingExtrasCardProps {
  fareUpgrade?: FareUpgrade;
  bundle?: Bundle;
  addOns?: AddOn[];
  seats?: SeatSelection[];
  promoCode?: PromoCodeDiscount;
  currency?: string;
  className?: string;
}

const ADDON_ICONS: Record<string, any> = {
  baggage: Luggage,
  seat: Armchair,
  meal: UtensilsCrossed,
  wifi: Wifi,
  insurance: Shield,
  lounge: Sparkles,
  transfer: Car,
  default: Package,
};

export function BookingExtrasCard({
  fareUpgrade,
  bundle,
  addOns,
  seats,
  promoCode,
  currency = 'USD',
  className = '',
}: BookingExtrasCardProps) {
  const [expanded, setExpanded] = useState(true);

  const hasExtras = fareUpgrade || bundle || (addOns && addOns.length > 0) || (seats && seats.length > 0) || promoCode;

  if (!hasExtras) return null;

  return (
    <div className={`bg-white rounded-2xl border border-gray-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div
        className="px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6" />
            <div>
              <h3 className="text-lg font-bold">Extras & Upgrades</h3>
              <p className="text-sm text-white/80">Selected options for this booking</p>
            </div>
          </div>
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </div>

      {expanded && (
        <div className="p-6 space-y-5">
          {/* Fare Upgrade */}
          {fareUpgrade && (
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-purple-900">{fareUpgrade.fareName} Fare</h4>
                    <p className="text-xs text-purple-600">Upgraded fare class</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-purple-700">+{currency} {fareUpgrade.upgradePrice.toFixed(2)}</p>
                </div>
              </div>
              {fareUpgrade.benefits && fareUpgrade.benefits.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {fareUpgrade.benefits.map((benefit, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-full text-xs text-purple-700">
                      <Check className="w-3 h-3" /> {benefit}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Bundle */}
          {bundle && (
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-900">{bundle.bundleName}</h4>
                    {bundle.description && (
                      <p className="text-xs text-emerald-600">{bundle.description}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-emerald-700">+{currency} {bundle.price.toFixed(2)}</p>
                </div>
              </div>
              {bundle.includes && bundle.includes.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {bundle.includes.map((item, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-full text-xs text-emerald-700">
                      <Check className="w-3 h-3" /> {item}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Add-Ons */}
          {addOns && addOns.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Package className="w-4 h-4" /> Add-Ons ({addOns.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {addOns.map((addon, i) => {
                  const Icon = ADDON_ICONS[addon.category] || ADDON_ICONS.default;
                  return (
                    <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">{addon.name}</p>
                        {addon.details && (
                          <p className="text-xs text-gray-500 truncate">{addon.details}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 text-sm">
                          {currency} {(addon.price * (addon.quantity || 1)).toFixed(2)}
                        </p>
                        {addon.quantity && addon.quantity > 1 && (
                          <p className="text-xs text-gray-500">×{addon.quantity}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Seats */}
          {seats && seats.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Armchair className="w-4 h-4" /> Seat Selections ({seats.length})
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {seats.map((seat, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                    <Armchair className="w-4 h-4 text-blue-600" />
                    <div className="flex-1">
                      <p className="font-bold text-blue-900">{seat.seatNumber}</p>
                      <p className="text-xs text-blue-600">{seat.seatClass}</p>
                    </div>
                    {seat.price && seat.price > 0 && (
                      <p className="text-xs font-medium text-blue-700">{currency} {seat.price.toFixed(2)}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Promo Code */}
          {promoCode && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tag className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-bold text-green-900">Promo Code Applied</p>
                    <p className="text-sm text-green-700 font-mono">{promoCode.code}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">
                    -{currency} {promoCode.discountAmount.toFixed(2)}
                  </p>
                  <p className="text-xs text-green-600">
                    {promoCode.type === 'percentage' ? `${promoCode.value}% off` : 'Fixed discount'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default BookingExtrasCard;
