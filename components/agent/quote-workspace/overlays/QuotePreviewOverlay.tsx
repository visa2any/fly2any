"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Users, MapPin, Plane, Building2, Car, Compass, Bus, Shield, Package, Send, Download } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useQuoteWorkspace, useQuoteItems, useQuotePricing } from "../QuoteWorkspaceProvider";
import type { QuoteItem, FlightItem, HotelItem, ProductType } from "../types/quote-workspace.types";

const productIcons: Record<ProductType, typeof Plane> = {
  flight: Plane,
  hotel: Building2,
  car: Car,
  activity: Compass,
  transfer: Bus,
  insurance: Shield,
  custom: Package,
};

export default function QuotePreviewOverlay() {
  const { state, closePreview, openSendModal } = useQuoteWorkspace();
  const items = useQuoteItems();
  const pricing = useQuotePricing();
  const isOpen = state.ui.previewOpen;

  // Format price
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: pricing.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Group items by date
  const groupedItems = items.reduce((acc, item) => {
    const dateKey = item.date?.split("T")[0] || "undated";
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(item);
    return acc;
  }, {} as Record<string, QuoteItem[]>);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-gray-100 overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                  Preview Mode
                </span>
                <span className="text-sm text-gray-500">
                  This is how your client will see the quote
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { closePreview(); openSendModal(); }}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-medium hover:from-primary-700 hover:to-primary-800 transition-all"
                >
                  <Send className="w-4 h-4" />
                  Send Quote
                </button>
                <button
                  onClick={closePreview}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Preview Content */}
          <div className="max-w-4xl mx-auto p-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-xl overflow-hidden"
            >
              {/* Hero */}
              <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-rose-600 text-white p-8 text-center">
                <h1 className="text-3xl font-bold mb-2">
                  {state.tripName || "Your Travel Quote"}
                </h1>
                {state.client && (
                  <p className="text-white/80 mb-4">
                    Prepared for {state.client.firstName} {state.client.lastName}
                  </p>
                )}
                <div className="flex items-center justify-center gap-6 text-sm">
                  {state.destination && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {state.destination}
                    </span>
                  )}
                  {state.startDate && state.endDate && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {format(parseISO(state.startDate), "MMM d")} - {format(parseISO(state.endDate), "MMM d, yyyy")}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {state.travelers.total} travelers
                  </span>
                </div>
              </div>

              {/* Itinerary */}
              <div className="p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Your Itinerary</h2>

                <div className="space-y-6">
                  {Object.entries(groupedItems)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([dateKey, dayItems]) => (
                      <div key={dateKey}>
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                          {dateKey !== "undated"
                            ? format(parseISO(dateKey), "EEEE, MMMM d, yyyy")
                            : "Unscheduled"}
                        </h3>
                        <div className="space-y-3">
                          {dayItems.map((item) => {
                            const Icon = productIcons[item.type];
                            return (
                              <div
                                key={item.id}
                                className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl"
                              >
                                <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                                  <Icon className="w-5 h-5 text-primary-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-gray-900">
                                    {getItemTitle(item)}
                                  </h4>
                                  <p className="text-sm text-gray-500">
                                    {getItemSubtitle(item)}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-gray-900">
                                    {formatPrice(item.price)}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Pricing Summary */}
              <div className="border-t border-gray-200 p-8 bg-gray-50">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Investment Summary</h2>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">{formatPrice(pricing.subtotal)}</span>
                    </div>
                    {pricing.taxes > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Taxes & Fees</span>
                        <span className="font-medium">{formatPrice(pricing.taxes)}</span>
                      </div>
                    )}
                    {pricing.discount > 0 && (
                      <div className="flex justify-between text-sm text-emerald-600">
                        <span>Discount</span>
                        <span className="font-medium">-{formatPrice(pricing.discount)}</span>
                      </div>
                    )}
                    <div className="border-t border-gray-200 pt-3 mt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-gray-900">Total</span>
                        <span className="text-2xl font-bold text-primary-600">
                          {formatPrice(pricing.total)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 text-right mt-1">
                        {formatPrice(pricing.perPerson)} per person
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="p-8 text-center border-t border-gray-200">
                <p className="text-gray-600 mb-4">
                  Ready to book this incredible journey?
                </p>
                <div className="flex items-center justify-center gap-4">
                  <button className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg">
                    Accept Quote
                  </button>
                  <button className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all">
                    Request Changes
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Helper functions
function getItemTitle(item: QuoteItem): string {
  switch (item.type) {
    case "flight":
      return `${(item as FlightItem).airline} ${(item as FlightItem).flightNumber}`;
    case "hotel":
      return (item as HotelItem).name;
    default:
      return (item as any).name || (item as any).provider || "Item";
  }
}

function getItemSubtitle(item: QuoteItem): string {
  switch (item.type) {
    case "flight": {
      const f = item as FlightItem;
      return `${f.originCity} → ${f.destinationCity} • ${f.duration}`;
    }
    case "hotel": {
      const h = item as HotelItem;
      return `${h.nights} night${h.nights > 1 ? "s" : ""} • ${h.roomType}`;
    }
    default:
      return (item as any).description || (item as any).location || "";
  }
}
