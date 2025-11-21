"use client";

import { useState, useEffect } from "react";
import { QuoteData } from "../QuoteBuilder";

interface Step4PricingProps {
  quoteData: QuoteData;
  updateQuoteData: (data: Partial<QuoteData>) => void;
  agentMarkupDefault: number;
  onNext: () => void;
  onPrev: () => void;
}

export default function QuoteBuilderStep4Pricing({
  quoteData,
  updateQuoteData,
  agentMarkupDefault,
  onNext,
  onPrev,
}: Step4PricingProps) {
  const [pricing, setPricing] = useState({
    agentMarkupPercent: quoteData.agentMarkupPercent || 15,
    taxes: quoteData.taxes || 0,
    fees: quoteData.fees || 0,
    discount: quoteData.discount || 0,
    currency: quoteData.currency || "USD",
  });

  // Calculate product costs
  useEffect(() => {
    const flightsCost = quoteData.flights.reduce((sum, f) => sum + (f.price || 0), 0);
    const hotelsCost = quoteData.hotels.reduce((sum, h) => sum + (h.price || 0), 0);
    const activitiesCost = quoteData.activities.reduce((sum, a) => sum + (a.price || 0), 0);
    const transfersCost = quoteData.transfers.reduce((sum, t) => sum + (t.price || 0), 0);
    const carRentalsCost = quoteData.carRentals.reduce((sum, c) => sum + (c.price || 0), 0);
    const insuranceCost = quoteData.insurance.reduce((sum, i) => sum + (i.price || 0), 0);
    const customItemsCost = quoteData.customItems.reduce((sum, ci) => sum + (ci.price || 0), 0);

    const subtotal = flightsCost + hotelsCost + activitiesCost + transfersCost + carRentalsCost + insuranceCost + customItemsCost;
    const agentMarkup = (subtotal * pricing.agentMarkupPercent) / 100;
    const total = subtotal + agentMarkup + pricing.taxes + pricing.fees - pricing.discount;

    updateQuoteData({
      flightsCost,
      hotelsCost,
      activitiesCost,
      transfersCost,
      carRentalsCost,
      insuranceCost,
      customItemsCost,
      subtotal,
      agentMarkup,
      agentMarkupPercent: pricing.agentMarkupPercent,
      taxes: pricing.taxes,
      fees: pricing.fees,
      discount: pricing.discount,
      total: Math.max(0, total),
      currency: pricing.currency,
    });
  }, [
    quoteData.flights,
    quoteData.hotels,
    quoteData.activities,
    quoteData.transfers,
    quoteData.carRentals,
    quoteData.insurance,
    quoteData.customItems,
    pricing,
  ]);

  const handleChange = (field: string, value: any) => {
    setPricing((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (quoteData.subtotal === 0) {
      alert("Please add at least one product to the quote");
      return;
    }
    onNext();
  };

  const formatCurrency = (amount: number) => {
    return `${pricing.currency === "USD" ? "$" : pricing.currency} ${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Pricing & Markup</h2>
        <p className="text-gray-600">Set your markup and calculate the final price</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Cost Breakdown */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Cost Breakdown</h3>

          <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-3">
            {/* Product Costs */}
            {quoteData.flightsCost > 0 && (
              <div className="flex items-center justify-between text-gray-700">
                <span className="flex items-center">
                  <span className="mr-2">✈️</span>
                  Flights ({quoteData.flights.length})
                </span>
                <span className="font-medium">{formatCurrency(quoteData.flightsCost)}</span>
              </div>
            )}

            {quoteData.hotelsCost > 0 && (
              <div className="flex items-center justify-between text-gray-700">
                <span className="flex items-center">
                  <span className="mr-2">🏨</span>
                  Hotels ({quoteData.hotels.length})
                </span>
                <span className="font-medium">{formatCurrency(quoteData.hotelsCost)}</span>
              </div>
            )}

            {quoteData.activitiesCost > 0 && (
              <div className="flex items-center justify-between text-gray-700">
                <span className="flex items-center">
                  <span className="mr-2">🎯</span>
                  Activities ({quoteData.activities.length})
                </span>
                <span className="font-medium">{formatCurrency(quoteData.activitiesCost)}</span>
              </div>
            )}

            {quoteData.transfersCost > 0 && (
              <div className="flex items-center justify-between text-gray-700">
                <span className="flex items-center">
                  <span className="mr-2">🚗</span>
                  Transfers ({quoteData.transfers.length})
                </span>
                <span className="font-medium">{formatCurrency(quoteData.transfersCost)}</span>
              </div>
            )}

            {quoteData.carRentalsCost > 0 && (
              <div className="flex items-center justify-between text-gray-700">
                <span className="flex items-center">
                  <span className="mr-2">🚙</span>
                  Car Rentals ({quoteData.carRentals.length})
                </span>
                <span className="font-medium">{formatCurrency(quoteData.carRentalsCost)}</span>
              </div>
            )}

            {quoteData.insuranceCost > 0 && (
              <div className="flex items-center justify-between text-gray-700">
                <span className="flex items-center">
                  <span className="mr-2">🛡️</span>
                  Insurance ({quoteData.insurance.length})
                </span>
                <span className="font-medium">{formatCurrency(quoteData.insuranceCost)}</span>
              </div>
            )}

            {quoteData.customItemsCost > 0 && (
              <div className="flex items-center justify-between text-gray-700">
                <span className="flex items-center">
                  <span className="mr-2">📝</span>
                  Custom Items ({quoteData.customItems.length})
                </span>
                <span className="font-medium">{formatCurrency(quoteData.customItemsCost)}</span>
              </div>
            )}

            {quoteData.subtotal === 0 && (
              <div className="text-center py-6 text-gray-500">
                <p className="text-sm">No products added yet</p>
              </div>
            )}

            {/* Subtotal */}
            {quoteData.subtotal > 0 && (
              <>
                <div className="border-t border-gray-200 pt-3 mt-3"></div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900">Base Cost Subtotal</span>
                  <span className="text-xl font-bold text-gray-900">{formatCurrency(quoteData.subtotal)}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Column: Markup & Adjustments */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Markup & Adjustments</h3>

          <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
            {/* Currency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
              <select
                value={pricing.currency}
                onChange={(e) => handleChange("currency", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="CAD">CAD - Canadian Dollar</option>
                <option value="AUD">AUD - Australian Dollar</option>
              </select>
            </div>

            {/* Agent Markup */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Agent Markup ({pricing.agentMarkupPercent}%)
              </label>
              <input
                type="range"
                min="0"
                max="50"
                step="1"
                value={pricing.agentMarkupPercent}
                onChange={(e) => handleChange("agentMarkupPercent", parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>0%</span>
                <span>50%</span>
              </div>
              <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Your markup amount:</span>
                  <span className="text-lg font-bold text-green-600">
                    +{formatCurrency(quoteData.agentMarkup)}
                  </span>
                </div>
              </div>
            </div>

            {/* Taxes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Taxes & Fees</label>
              <input
                type="number"
                value={pricing.taxes}
                onChange={(e) => handleChange("taxes", parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="0.00"
              />
              <p className="text-xs text-gray-500 mt-1">Additional taxes or mandatory fees</p>
            </div>

            {/* Discount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Discount (Optional)</label>
              <input
                type="number"
                value={pricing.discount}
                onChange={(e) => handleChange("discount", parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="0.00"
              />
              <p className="text-xs text-gray-500 mt-1">Special discount for this client</p>
            </div>
          </div>
        </div>
      </div>

      {/* Final Total */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90 mb-1">Total Quote Price</p>
            <p className="text-4xl font-bold">{formatCurrency(quoteData.total)}</p>
            <p className="text-sm opacity-75 mt-2">
              For {quoteData.travelers} {quoteData.travelers === 1 ? "traveler" : "travelers"} •{" "}
              {quoteData.duration} {quoteData.duration === 1 ? "day" : "days"}
            </p>
          </div>
          <div className="text-right">
            <div className="bg-white bg-opacity-20 rounded-lg px-4 py-3">
              <p className="text-xs opacity-75">Per Person</p>
              <p className="text-2xl font-bold">
                {formatCurrency(quoteData.total / quoteData.travelers)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Commission Preview */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-900">Your Estimated Earnings</p>
            <p className="text-xs text-blue-700 mt-1">
              Based on your {pricing.agentMarkupPercent}% markup, you'll earn approximately{" "}
              <strong>${quoteData.agentMarkup.toLocaleString()}</strong> from this quote (before platform fee).
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6 border-t border-gray-200">
        <button
          onClick={onPrev}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
        >
          ← Back
        </button>
        <button
          onClick={handleNext}
          className="px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg font-medium hover:from-primary-700 hover:to-primary-800 transition-all shadow-sm"
        >
          Next: Review & Send →
        </button>
      </div>
    </div>
  );
}
