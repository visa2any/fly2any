'use client';

/**
 * Admin Pricing Card — Fly2Any
 * Level 6 Apple-Class admin-only pricing breakdown with profit tracking
 */

import {
  DollarSign, TrendingUp, TrendingDown, Calculator,
  Building2, Percent, Info, AlertTriangle
} from 'lucide-react';
import type { Booking } from '@/lib/bookings/types';

interface AdminPricingCardProps {
  booking: Booking;
  className?: string;
}

export function AdminPricingCard({ booking, className = '' }: AdminPricingCardProps) {
  const currency = booking.payment.currency;
  const isAmadeus = booking.sourceApi === 'Amadeus';
  const isDuffel = booking.sourceApi === 'Duffel';

  // Calculate totals
  const customerTotal = booking.customerPrice || booking.payment.amount;
  const netPrice = booking.netPrice || booking.flight.price.total;
  const markupAmount = booking.markupAmount || 0;
  const duffelCost = booking.duffelCost || 0;
  const consolidatorCost = booking.consolidatorCost || 0;
  const netProfit = booking.netProfit || (markupAmount - duffelCost - consolidatorCost);
  const profitMargin = customerTotal > 0 ? ((netProfit / customerTotal) * 100) : 0;

  return (
    <div className={`bg-white rounded-2xl border-2 border-orange-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white">
        <div className="flex items-center gap-3">
          <Calculator className="w-6 h-6" />
          <div>
            <h3 className="text-lg font-bold">Admin Pricing Details</h3>
            <p className="text-sm text-white/80">Internal profit tracking & cost breakdown</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* Source Badge */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
          <span className="text-sm text-gray-600">Flight Source</span>
          <span className={`px-3 py-1 rounded-full text-sm font-bold ${
            isDuffel ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
          }`}>
            {isDuffel ? '🟢 Duffel NDC' : isAmadeus ? '🔵 GDS/Amadeus' : booking.sourceApi || 'Unknown'}
          </span>
        </div>

        {/* Customer Pricing */}
        <div className="bg-gray-50 rounded-xl p-4">
          <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <DollarSign className="w-4 h-4" /> Customer Paid
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Base Flight</span>
              <span>{currency} {netPrice.toFixed(2)}</span>
            </div>
            {markupAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>+ Markup</span>
                <span>+{currency} {markupAmount.toFixed(2)}</span>
              </div>
            )}
            {booking.fareUpgrade && (
              <div className="flex justify-between">
                <span className="text-gray-600">+ Fare Upgrade ({booking.fareUpgrade.fareName})</span>
                <span>{currency} {booking.fareUpgrade.upgradePrice.toFixed(2)}</span>
              </div>
            )}
            {booking.bundle && (
              <div className="flex justify-between">
                <span className="text-gray-600">+ Bundle ({booking.bundle.bundleName})</span>
                <span>{currency} {booking.bundle.price.toFixed(2)}</span>
              </div>
            )}
            {booking.addOns && booking.addOns.length > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">+ Add-ons ({booking.addOns.length})</span>
                <span>{currency} {booking.addOns.reduce((sum, a) => sum + (a.price * (a.quantity || 1)), 0).toFixed(2)}</span>
              </div>
            )}
            {booking.promoCode && (
              <div className="flex justify-between text-red-600">
                <span>- Promo ({booking.promoCode.code})</span>
                <span>-{currency} {booking.promoCode.discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-gray-300 font-bold text-base">
              <span>Total Charged</span>
              <span className="text-gray-900">{currency} {customerTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="bg-red-50 rounded-xl p-4">
          <h4 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
            <TrendingDown className="w-4 h-4" /> Costs
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Net Flight Cost</span>
              <span className="text-red-600">-{currency} {netPrice.toFixed(2)}</span>
            </div>
            {isDuffel && duffelCost > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Duffel Fee ($3/order)</span>
                <span className="text-red-600">-{currency} {duffelCost.toFixed(2)}</span>
              </div>
            )}
            {isAmadeus && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Consolidator Cost</span>
                {consolidatorCost > 0 ? (
                  <span className="text-red-600">-{currency} {consolidatorCost.toFixed(2)}</span>
                ) : (
                  <span className="text-amber-600 text-xs">TBD after ticketing</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Net Profit */}
        <div className={`rounded-xl p-4 ${netProfit >= 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {netProfit >= 0 ? (
                <TrendingUp className="w-5 h-5 text-green-600" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-600" />
              )}
              <span className="font-bold text-gray-900">Net Profit</span>
            </div>
            <div className="text-right">
              {isAmadeus && netProfit === 0 ? (
                <div>
                  <p className="text-amber-600 font-semibold">Commission-based</p>
                  <p className="text-xs text-amber-500">Calculated after ticketing</p>
                </div>
              ) : (
                <>
                  <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {currency} {netProfit.toFixed(2)}
                  </p>
                  <p className={`text-xs ${profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {profitMargin.toFixed(1)}% margin
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Routing Info */}
        {booking.routingChannel && (
          <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
            <span>Routing Channel</span>
            <span className={`px-2 py-1 rounded ${
              booking.routingChannel === 'DUFFEL' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
            }`}>
              {booking.routingChannel}
            </span>
          </div>
        )}
        {booking.routingReason && (
          <p className="text-xs text-gray-400 flex items-center gap-1">
            <Info className="w-3 h-3" /> {booking.routingReason.replace(/_/g, ' ')}
          </p>
        )}
      </div>
    </div>
  );
}

export default AdminPricingCard;
