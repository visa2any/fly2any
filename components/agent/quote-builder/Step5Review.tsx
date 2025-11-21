"use client";

import { useState, useEffect } from "react";
import { QuoteData } from "../QuoteBuilder";

interface Step5ReviewProps {
  quoteData: QuoteData;
  updateQuoteData: (data: Partial<QuoteData>) => void;
  clients: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
  }>;
  onSave: (sendNow: boolean) => void;
  onPrev: () => void;
  loading: boolean;
}

export default function QuoteBuilderStep5Review({
  quoteData,
  updateQuoteData,
  clients,
  onSave,
  onPrev,
  loading,
}: Step5ReviewProps) {
  const [formData, setFormData] = useState({
    notes: quoteData.notes || "",
    agentNotes: quoteData.agentNotes || "",
    expiresInDays: quoteData.expiresInDays || 7,
  });

  const selectedClient = clients.find((c) => c.id === quoteData.clientId);

  // Update parent state when form changes
  useEffect(() => {
    updateQuoteData(formData);
  }, [formData]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const formatCurrency = (amount: number) => {
    return `${quoteData.currency === "USD" ? "$" : quoteData.currency} ${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const calculateExpirationDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + formData.expiresInDays);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Review & Send Quote</h2>
        <p className="text-gray-600">Review all details before sending to your client</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Quote Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client Information */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">👤</span>
              Client Information
            </h3>
            {selectedClient && (
              <div className="space-y-2">
                <p className="text-gray-900 font-medium text-lg">
                  {selectedClient.firstName} {selectedClient.lastName}
                </p>
                <p className="text-gray-600 text-sm">{selectedClient.email}</p>
                {selectedClient.phone && <p className="text-gray-600 text-sm">{selectedClient.phone}</p>}
              </div>
            )}
          </div>

          {/* Trip Details */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">✈️</span>
              Trip Details
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Trip Name</p>
                <p className="text-gray-900 font-medium">{quoteData.tripName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Destination</p>
                <p className="text-gray-900 font-medium">{quoteData.destination}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Departure</p>
                  <p className="text-gray-900 font-medium">{formatDate(quoteData.startDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Return</p>
                  <p className="text-gray-900 font-medium">{formatDate(quoteData.endDate)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="text-gray-900 font-medium">
                    {quoteData.duration} {quoteData.duration === 1 ? "Day" : "Days"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Travelers</p>
                  <p className="text-gray-900 font-medium">
                    {quoteData.travelers} Total ({quoteData.adults} Adults
                    {quoteData.children > 0 && `, ${quoteData.children} Children`}
                    {quoteData.infants > 0 && `, ${quoteData.infants} Infants`})
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Products Included */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">📦</span>
              Products Included
            </h3>
            <div className="space-y-4">
              {/* Flights */}
              {quoteData.flights.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <span className="mr-1">✈️</span>
                    Flights ({quoteData.flights.length})
                  </p>
                  <div className="ml-6 space-y-2">
                    {quoteData.flights.map((flight: any, index: number) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-600">{flight.name}</span>
                        <span className="font-medium text-gray-900">{formatCurrency(flight.price)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hotels */}
              {quoteData.hotels.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <span className="mr-1">🏨</span>
                    Hotels ({quoteData.hotels.length})
                  </p>
                  <div className="ml-6 space-y-2">
                    {quoteData.hotels.map((hotel: any, index: number) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-600">{hotel.name}</span>
                        <span className="font-medium text-gray-900">{formatCurrency(hotel.price)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Activities */}
              {quoteData.activities.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <span className="mr-1">🎯</span>
                    Activities ({quoteData.activities.length})
                  </p>
                  <div className="ml-6 space-y-2">
                    {quoteData.activities.map((activity: any, index: number) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-600">{activity.name}</span>
                        <span className="font-medium text-gray-900">{formatCurrency(activity.price)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Transfers */}
              {quoteData.transfers.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <span className="mr-1">🚗</span>
                    Transfers ({quoteData.transfers.length})
                  </p>
                  <div className="ml-6 space-y-2">
                    {quoteData.transfers.map((transfer: any, index: number) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-600">{transfer.name}</span>
                        <span className="font-medium text-gray-900">{formatCurrency(transfer.price)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Car Rentals */}
              {quoteData.carRentals.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <span className="mr-1">🚙</span>
                    Car Rentals ({quoteData.carRentals.length})
                  </p>
                  <div className="ml-6 space-y-2">
                    {quoteData.carRentals.map((car: any, index: number) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-600">{car.name}</span>
                        <span className="font-medium text-gray-900">{formatCurrency(car.price)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Insurance */}
              {quoteData.insurance.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <span className="mr-1">🛡️</span>
                    Insurance ({quoteData.insurance.length})
                  </p>
                  <div className="ml-6 space-y-2">
                    {quoteData.insurance.map((ins: any, index: number) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-600">{ins.name}</span>
                        <span className="font-medium text-gray-900">{formatCurrency(ins.price)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom Items */}
              {quoteData.customItems.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <span className="mr-1">📝</span>
                    Custom Items ({quoteData.customItems.length})
                  </p>
                  <div className="ml-6 space-y-2">
                    {quoteData.customItems.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-600">{item.name}</span>
                        <span className="font-medium text-gray-900">{formatCurrency(item.price)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {quoteData.subtotal === 0 && (
                <p className="text-center text-gray-500 py-4">No products added</p>
              )}
            </div>
          </div>

          {/* Client Message */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">💬</span>
              Message to Client
            </h3>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Add a personalized message to your client (will be included in the email)..."
            />
            <p className="text-xs text-gray-500 mt-2">
              This message will be visible to the client in their quote email
            </p>
          </div>

          {/* Internal Agent Notes */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">📝</span>
              Internal Notes (Private)
            </h3>
            <textarea
              value={formData.agentNotes}
              onChange={(e) => handleChange("agentNotes", e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Add private notes for yourself (not visible to client)..."
            />
            <p className="text-xs text-gray-500 mt-2">These notes are only visible to you</p>
          </div>
        </div>

        {/* Right Column: Pricing Summary */}
        <div className="lg:col-span-1 space-y-6">
          {/* Pricing Breakdown */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">💰</span>
              Pricing Summary
            </h3>

            <div className="space-y-3">
              {/* Base Costs */}
              {quoteData.flightsCost > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Flights</span>
                  <span className="font-medium text-gray-900">{formatCurrency(quoteData.flightsCost)}</span>
                </div>
              )}
              {quoteData.hotelsCost > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Hotels</span>
                  <span className="font-medium text-gray-900">{formatCurrency(quoteData.hotelsCost)}</span>
                </div>
              )}
              {quoteData.activitiesCost > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Activities</span>
                  <span className="font-medium text-gray-900">{formatCurrency(quoteData.activitiesCost)}</span>
                </div>
              )}
              {quoteData.transfersCost > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Transfers</span>
                  <span className="font-medium text-gray-900">{formatCurrency(quoteData.transfersCost)}</span>
                </div>
              )}
              {quoteData.carRentalsCost > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Car Rentals</span>
                  <span className="font-medium text-gray-900">{formatCurrency(quoteData.carRentalsCost)}</span>
                </div>
              )}
              {quoteData.insuranceCost > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Insurance</span>
                  <span className="font-medium text-gray-900">{formatCurrency(quoteData.insuranceCost)}</span>
                </div>
              )}
              {quoteData.customItemsCost > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Other Items</span>
                  <span className="font-medium text-gray-900">{formatCurrency(quoteData.customItemsCost)}</span>
                </div>
              )}

              {/* Subtotal */}
              {quoteData.subtotal > 0 && (
                <>
                  <div className="border-t border-gray-200 pt-3 mt-3"></div>
                  <div className="flex justify-between">
                    <span className="text-gray-700 font-medium">Subtotal</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(quoteData.subtotal)}</span>
                  </div>
                </>
              )}

              {/* Agent Markup */}
              {quoteData.agentMarkup > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Agent Markup ({quoteData.agentMarkupPercent}%)</span>
                  <span className="font-medium text-green-600">+{formatCurrency(quoteData.agentMarkup)}</span>
                </div>
              )}

              {/* Taxes */}
              {quoteData.taxes > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Taxes & Fees</span>
                  <span className="font-medium text-gray-900">+{formatCurrency(quoteData.taxes)}</span>
                </div>
              )}

              {/* Discount */}
              {quoteData.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Discount</span>
                  <span className="font-medium text-red-600">-{formatCurrency(quoteData.discount)}</span>
                </div>
              )}

              {/* Total */}
              <div className="border-t-2 border-gray-300 pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-primary-600">{formatCurrency(quoteData.total)}</span>
                </div>
              </div>

              {/* Per Person */}
              {quoteData.travelers > 0 && (
                <div className="bg-primary-50 rounded-lg p-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Per Person</span>
                    <span className="text-lg font-bold text-primary-700">
                      {formatCurrency(quoteData.total / quoteData.travelers)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Expiration Settings */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">⏰</span>
              Quote Expiration
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Expires In (Days)</label>
              <select
                value={formData.expiresInDays}
                onChange={(e) => handleChange("expiresInDays", parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value={3}>3 Days</option>
                <option value={7}>7 Days (Recommended)</option>
                <option value={14}>14 Days</option>
                <option value={30}>30 Days</option>
                <option value={60}>60 Days</option>
              </select>
              <p className="text-xs text-gray-500 mt-2">
                Expires on: <strong>{calculateExpirationDate()}</strong>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => onSave(true)}
              disabled={loading || quoteData.subtotal === 0}
              className="w-full px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg font-medium hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              {loading ? "Sending..." : "Send to Client"}
            </button>

            <button
              onClick={() => onSave(false)}
              disabled={loading || quoteData.subtotal === 0}
              className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? "Saving..." : "Save as Draft"}
            </button>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg
                className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="text-xs text-blue-900">
                <p className="font-medium mb-1">What happens next?</p>
                <ul className="space-y-1 text-blue-800">
                  <li>• Client receives email with quote link</li>
                  <li>• They can accept/decline online</li>
                  <li>• You'll be notified of their decision</li>
                  <li>• Accepted quotes convert to bookings</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6 border-t border-gray-200">
        <button
          onClick={onPrev}
          disabled={loading}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          ← Back to Pricing
        </button>
      </div>
    </div>
  );
}
