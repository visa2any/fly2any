"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Users, MapPin, Plane, Building2, Car, Compass, Bus, Shield, Package, Send, Heart, Sparkles, Moon, Lightbulb, CheckCircle2 } from "lucide-react";
import { format, parseISO, differenceInDays } from "date-fns";
import { useQuoteWorkspace, useQuoteItems, useQuotePricing } from "../QuoteWorkspaceProvider";
import type { QuoteItem, ProductType } from "../types/quote-workspace.types";
import Image from "next/image";
import { getProductCopy, getDayOneLinerSeeded, detectTone, type ToneProfile } from "../itinerary/ToneSystem";
import FinalReassurance from "../client-preview/FinalReassurance";
import ClientPricingPanel from "../client-preview/ClientPricingPanel";
import { QuoteConfidenceSummary } from "../client-preview/ClientConfidenceLayer";

const productIcons: Record<ProductType, typeof Plane> = {
  flight: Plane,
  hotel: Building2,
  car: Car,
  activity: Compass,
  transfer: Bus,
  insurance: Shield,
  custom: Package,
};

const productColors: Record<ProductType, string> = {
  flight: "from-blue-500 to-indigo-600",
  hotel: "from-purple-500 to-pink-600",
  car: "from-cyan-500 to-blue-600",
  activity: "from-emerald-500 to-teal-600",
  transfer: "from-amber-500 to-orange-600",
  insurance: "from-rose-500 to-pink-600",
  custom: "from-gray-500 to-gray-600",
};

export default function QuotePreviewOverlay() {
  const { state, closePreview, openSendModal } = useQuoteWorkspace();
  const items = useQuoteItems();
  const pricing = useQuotePricing();
  const isOpen = state.ui.previewOpen;

  const formatPrice = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: pricing.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  // Group items by date
  const groupedItems = items.reduce((acc, item) => {
    const dateKey = item.date?.split("T")[0] || "undated";
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(item);
    return acc;
  }, {} as Record<string, QuoteItem[]>);

  const sortedDates = Object.keys(groupedItems).filter(k => k !== "undated").sort();
  const tripDuration = sortedDates.length > 0
    ? differenceInDays(parseISO(sortedDates[sortedDates.length - 1]), parseISO(sortedDates[0])) + 1
    : 0;

  // ═══ DETECT TONE FROM TRIP DATA ═══
  const hasKids = (state.travelers?.children || 0) > 0;
  const hotelStars = items.find(i => i.type === "hotel" && (i as any).stars)?.["stars" as keyof QuoteItem] as number || 3;
  const activityNames = items.filter(i => i.type === "activity").map(i => (i as any).name || "");
  const tripTone: ToneProfile = detectTone({
    destination: state.destination,
    travelers: state.travelers?.total || 1,
    hasKids,
    hotelStars,
    activities: activityNames,
  });

  // Get dynamic one-liner for a day using ToneSystem
  const getDayOneLiner = (dayIndex: number, isFirst: boolean, isLast: boolean) => {
    const mood = isFirst ? "arrival" : isLast ? "departure" : "explore";
    return getDayOneLinerSeeded(tripTone, mood, dayIndex);
  };

  // Get city from items for a specific date
  const getDayCity = (dayItems: QuoteItem[]): string => {
    const hotel = dayItems.find(i => i.type === "hotel") as any;
    if (hotel?.location) return hotel.location;
    const flight = dayItems.find(i => i.type === "flight") as any;
    if (flight?.destinationCity || flight?.destination) return flight.destinationCity || flight.destination;
    return state.destination || "";
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-gradient-to-b from-gray-50 to-white overflow-y-auto"
        >
          {/* Sticky Header */}
          <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
            <div className="max-w-3xl mx-auto px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-violet-100 text-violet-700 text-xs font-semibold rounded-full">
                  Client Preview
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { closePreview(); openSendModal(); }}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all"
                >
                  <Send className="w-4 h-4" />
                  Send Quote
                </button>
                <button onClick={closePreview} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-3xl mx-auto px-6 py-8">
            {/* INTRO — TOP OF QUOTE */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-full text-primary-700 text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                Your Trip. Perfectly Planned.
              </div>

              <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">
                {state.tripName || "Your journey is coming to life."}
              </h1>

              {state.client && (
                <p className="text-lg text-gray-500 mb-2">
                  Prepared especially for {state.client.firstName}
                </p>
              )}

              <p className="text-gray-600 max-w-xl mx-auto leading-relaxed">
                This itinerary was carefully crafted to give you comfort, flexibility, and unforgettable moments — presented exactly in the order your trip will happen.
              </p>

              {/* Trip Stats */}
              <div className="flex items-center justify-center gap-6 mt-8 text-sm">
                {state.destination && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-primary-600" />
                    </div>
                    <span className="font-medium">{state.destination}</span>
                  </div>
                )}
                {state.startDate && state.endDate && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-blue-600" />
                    </div>
                    <span>{format(parseISO(state.startDate), "MMM d")} – {format(parseISO(state.endDate), "MMM d")}</span>
                  </div>
                )}
                {tripDuration > 0 && (
                  <span className="px-3 py-1 bg-gray-100 rounded-full text-gray-700 font-semibold">
                    {tripDuration} {tripDuration === 1 ? "Day" : "Days"}
                  </span>
                )}
                {state.travelers?.total > 0 && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
                      <Users className="w-4 h-4 text-violet-600" />
                    </div>
                    <span>{state.travelers.total} {state.travelers.total === 1 ? "Traveler" : "Travelers"}</span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* TIMELINE — DAY BY DAY */}
            <div className="space-y-8 mb-12">
              {sortedDates.map((dateKey, dayIndex) => {
                const dayItems = groupedItems[dateKey];
                const dayCity = getDayCity(dayItems);
                const isFirstDay = dayIndex === 0;
                const isLastDay = dayIndex === sortedDates.length - 1;

                return (
                  <motion.div
                    key={dateKey}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: dayIndex * 0.1 }}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                  >
                    {/* Day Header */}
                    <div className="px-6 py-5 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-lg font-bold text-gray-900">
                            Day {dayIndex + 1} — {format(parseISO(dateKey), "EEEE, MMMM d")}
                            {dayCity && <span className="text-gray-400 font-normal"> · {dayCity}</span>}
                          </h2>
                          <p className="text-sm text-gray-500 mt-1 italic">
                            {getDayOneLiner(dayIndex, isFirstDay, isLastDay)}
                          </p>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          {dayIndex + 1}
                        </div>
                      </div>
                    </div>

                    {/* Day Items */}
                    <div className="divide-y divide-gray-100">
                      {dayItems.map((item, itemIndex) => (
                        <ClientPreviewCard key={item.id} item={item} isFirst={itemIndex === 0} tone={tripTone} />
                      ))}
                    </div>

                    {/* Evening/Free Time (if last item is not an activity) */}
                    {!dayItems.some(i => i.type === "activity") && !isLastDay && (
                      <div className="px-6 py-5 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 border-t border-gray-100">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <Moon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Your evening</h4>
                            <p className="text-sm text-gray-600 mt-1">
                              The rest of the day is yours. Explore, relax, enjoy a great dinner, or simply unwind — your schedule gives you freedom without pressure.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* AGENT TIP */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-amber-900">Good to know</h4>
                  <p className="text-sm text-amber-800 mt-1">
                    This itinerary balances structure and flexibility, so you can enjoy your trip without worrying about logistics or timing.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* TRIP VALUE — PRICING */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Your complete trip</h3>
                  <p className="text-sm text-gray-500">
                    Everything selected for your journey — thoughtfully planned
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Trip subtotal</span>
                  <span className="font-medium text-gray-900">{formatPrice(pricing.subtotal)}</span>
                </div>
                {pricing.taxes > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Taxes & fees</span>
                    <span className="font-medium text-gray-900">{formatPrice(pricing.taxes)}</span>
                  </div>
                )}
                {pricing.discount > 0 && (
                  <div className="flex justify-between text-sm text-emerald-600">
                    <span>Your discount</span>
                    <span className="font-medium">-{formatPrice(pricing.discount)}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Total investment</span>
                    <span className="text-3xl font-bold text-primary-600">{formatPrice(pricing.total)}</span>
                  </div>
                  <p className="text-sm text-gray-500 text-right mt-1">
                    {formatPrice(pricing.perPerson)} per person
                  </p>
                </div>
              </div>

              <p className="text-sm text-gray-500 text-center mt-4">
                This itinerary includes everything selected for your journey — thoughtfully planned to deliver comfort, memorable experiences, and excellent overall value.
              </p>
            </motion.div>

            {/* ═══ CONFIDENCE-DRIVEN CHECKOUT ═══ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* LEFT: Pricing Panel with Value Framing */}
              <ClientPricingPanel
                total={pricing.total}
                perPerson={pricing.perPerson}
                travelers={state.travelers?.total || 1}
                tripDays={tripDuration}
                currency={pricing.currency}
                inclusions={[
                  "All flights and transfers included",
                  "Accommodation as selected",
                  "Activities and experiences",
                  "24/7 travel support",
                ]}
              />

              {/* RIGHT: Trust & Reassurance */}
              <div className="space-y-4">
                <QuoteConfidenceSummary items={items} agentName={state.client?.name} />
                <FinalReassurance variant="compact" agentName="Your Travel Expert" />
              </div>
            </div>

            {/* WHAT HAPPENS NEXT - Critical for reducing anxiety */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 p-6 mb-8"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                What happens after payment?
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { step: "1", label: "We confirm availability", icon: "✓" },
                  { step: "2", label: "You receive confirmation email", icon: "✉️" },
                  { step: "3", label: "Tickets & vouchers issued", icon: "🎫" },
                  { step: "4", label: "Your agent remains available", icon: "💬" },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * i }}
                    className="text-center p-4 bg-white rounded-xl border border-gray-100 shadow-sm"
                  >
                    <div className="text-2xl mb-2">{item.icon}</div>
                    <p className="text-xs font-medium text-gray-700">{item.label}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* POLICY TRANSPARENCY */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-blue-50 rounded-xl p-4 mb-8 border border-blue-100"
            >
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">Transparent Policies</p>
                  <div className="mt-2 space-y-1 text-xs text-gray-600">
                    {items.slice(0, 3).map((item, i) => (
                      <p key={i} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                        <span className="font-medium capitalize">{item.type}:</span>
                        <span>{(item as any).refundable ? "Refundable" : "Non-refundable"} • {(item as any).cancellationPolicy || "Standard policy"}</span>
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* FINAL CTA - Single, Clear Action */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => openSendModal()}
                className="inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all"
              >
                <CheckCircle2 className="w-6 h-6" />
                Confirm & Pay Securely
              </motion.button>
              <p className="text-xs text-gray-500 mt-3 flex items-center justify-center gap-2">
                <Shield className="w-3 h-3" />
                Secure payment • No hidden fees • 24/7 support
              </p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Individual item card with dynamic tone-aware copy
function ClientPreviewCard({ item, isFirst, tone = "family" }: { item: QuoteItem; isFirst: boolean; tone?: ToneProfile }) {
  const Icon = productIcons[item.type];
  const colorClass = productColors[item.type];
  // ═══ USE TONESYSTEM FOR DYNAMIC COPY ═══
  const toneCopy = getProductCopy(tone, item.type);
  const copy = { copy: toneCopy.description, highlights: toneCopy.highlights };

  // Get image from item (properties are directly on item, not in item.details)
  const itemAny = item as any;
  const imageUrl = itemAny.pictures?.[0] || itemAny.image || itemAny.photo;

  return (
    <div className="p-6">
      <div className="flex gap-5">
        {/* Icon or Image */}
        {imageUrl ? (
          <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
            <Image
              src={imageUrl}
              alt={itemAny.name || ""}
              width={80}
              height={80}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center flex-shrink-0 shadow-md`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h4 className="font-bold text-gray-900 flex items-center gap-2">
                {getProductEmoji(item.type)} {getItemDisplayTitle(item, toneCopy)}
              </h4>
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                {copy.copy}
              </p>

              {/* Soft Highlights */}
              {copy.highlights && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {copy.highlights.map((h, i) => (
                    <span key={i} className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      {h}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Item-specific details */}
          <div className="mt-4 text-sm text-gray-500">
            {getItemDetails(item)}
          </div>
        </div>
      </div>
    </div>
  );
}

function getProductEmoji(type: ProductType): string {
  const emojis: Record<ProductType, string> = {
    flight: "✈️",
    hotel: "🏨",
    car: "🚗",
    activity: "🎟️",
    transfer: "🚐",
    insurance: "🛡️",
    custom: "✨",
  };
  return emojis[type];
}

function getItemDisplayTitle(item: QuoteItem, toneCopy: { title: string; subtitle: string }): string {
  const itemAny = item as any;
  if (item.type === "flight") {
    const dest = itemAny.destinationCity || itemAny.destination || "your destination";
    return toneCopy.title.replace("{{destination}}", dest) || `Your flight to ${dest}`;
  }
  if (item.type === "hotel") {
    return itemAny.name || toneCopy.title;
  }
  if (item.type === "activity") {
    return itemAny.name || toneCopy.title;
  }
  return itemAny.name || toneCopy.title;
}

function getItemDetails(item: QuoteItem): React.ReactNode {
  // Properties are stored directly on item, not in item.details
  const d = item as any;

  switch (item.type) {
    case "flight": {
      return (
        <div className="flex items-center gap-4 flex-wrap">
          <span className="font-medium">{d.originCity || d.origin} → {d.destinationCity || d.destination}</span>
          {d.departureTime && <span>• Departs {d.departureTime}</span>}
          {d.duration && <span>• {d.duration}</span>}
          {d.airlineName && <span>• {d.airlineName}</span>}
          {d.stops !== undefined && <span>• {d.stops === 0 ? 'Nonstop' : `${d.stops} stop${d.stops > 1 ? 's' : ''}`}</span>}
        </div>
      );
    }
    case "hotel": {
      return (
        <div className="flex items-center gap-4 flex-wrap">
          {d.nights && <span className="font-medium">{d.nights} {d.nights > 1 ? "nights" : "night"}</span>}
          {d.roomType && <span>• {d.roomType}</span>}
          {d.stars && <span>• {"⭐".repeat(Math.min(d.stars, 5))}</span>}
          {d.location && <span>• {d.location}</span>}
        </div>
      );
    }
    case "activity": {
      return (
        <div className="flex items-center gap-4 flex-wrap">
          {d.duration && <span className="font-medium">{d.duration}</span>}
          {d.location && <span>• {d.location}</span>}
          {d.participants && <span>• {d.participants} {d.participants > 1 ? 'guests' : 'guest'}</span>}
        </div>
      );
    }
    case "car": {
      return (
        <div className="flex items-center gap-4 flex-wrap">
          {d.carType && <span className="font-medium">{d.carType}</span>}
          {d.company && <span>• {d.company}</span>}
          {d.days && <span>• {d.days} {d.days > 1 ? "days" : "day"}</span>}
          {d.pickupLocation && <span>• Pickup: {d.pickupLocation}</span>}
        </div>
      );
    }
    case "transfer": {
      return (
        <div className="flex items-center gap-4 flex-wrap">
          {d.vehicleType && <span className="font-medium">{d.vehicleType}</span>}
          {d.pickupLocation && d.dropoffLocation && <span>• {d.pickupLocation} → {d.dropoffLocation}</span>}
          {d.pickupTime && <span>• {d.pickupTime}</span>}
        </div>
      );
    }
    case "insurance": {
      return (
        <div className="flex items-center gap-4 flex-wrap">
          {d.planName && <span className="font-medium">{d.planName}</span>}
          {d.provider && <span>• {d.provider}</span>}
          {d.travelers && <span>• {d.travelers} {d.travelers > 1 ? 'travelers' : 'traveler'}</span>}
        </div>
      );
    }
    default:
      return null;
  }
}
