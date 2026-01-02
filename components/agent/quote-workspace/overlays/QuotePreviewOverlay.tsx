"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Users, MapPin, Plane, Building2, Car, Compass, Bus, Shield, Package, Send, Heart, Sparkles, Moon, Lightbulb, CheckCircle2 } from "lucide-react";
import { format, parseISO, differenceInDays } from "date-fns";
import { useQuoteWorkspace, useQuoteItems, useQuotePricing } from "../QuoteWorkspaceProvider";
import type { QuoteItem, ProductType } from "../types/quote-workspace.types";
import Image from "next/image";

// Emotional one-liners for days (rotate dynamically)
const dayOneLiners = [
  "A smooth start to your adventure.",
  "A day designed to flow effortlessly.",
  "Where memories begin.",
  "Everything is taken care of today.",
  "Your journey unfolds beautifully.",
  "Crafted for comfort and discovery.",
  "A perfect balance of rest and exploration.",
  "Adventures await around every corner.",
];

// Product-specific premium copy
const productCopy: Record<ProductType, { title: string; copy: string; highlights?: string[] }> = {
  flight: {
    title: "Your flight to {{destination}}",
    copy: "Your journey begins with a carefully selected flight, optimized for comfort, timing, and convenience — so you arrive relaxed and ready to enjoy what's ahead.",
    highlights: ["Smooth departure and arrival", "Comfortable travel duration", "Smart routing and timing"],
  },
  hotel: {
    title: "Where you'll be staying",
    copy: "This hotel was selected for its comfort, location, and convenience. A welcoming space to rest, recharge, and feel at home after each day of exploration.",
    highlights: ["Comfortable accommodations", "Strategic location", "Ideal balance between rest and discovery"],
  },
  car: {
    title: "Your transportation",
    copy: "Your mobility is fully arranged so you can move with ease and confidence. No waiting, no uncertainty — just freedom to enjoy your trip at your own pace.",
  },
  activity: {
    title: "Today's experience",
    copy: "This experience was chosen to make your day truly special. Enjoy it at the right time, at the right pace — with everything already planned for you.",
    highlights: ["Must-see", "Flexible timing"],
  },
  transfer: {
    title: "Your transportation",
    copy: "Your mobility is fully arranged so you can move with ease and confidence. No waiting, no uncertainty — just freedom to enjoy your trip at your own pace.",
  },
  insurance: {
    title: "Travel protection",
    copy: "Peace of mind for your journey. Comprehensive coverage so you can travel with confidence knowing you're protected.",
  },
  custom: {
    title: "Special addition",
    copy: "A personalized touch to make your trip even more memorable.",
  },
};

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

  // Get dynamic one-liner for a day
  const getDayOneLiner = (dayIndex: number) => dayOneLiners[dayIndex % dayOneLiners.length];

  // Get city from items for a specific date
  const getDayCity = (dayItems: QuoteItem[]): string => {
    const hotel = dayItems.find(i => i.type === "hotel");
    if (hotel?.details?.location) return hotel.details.location;
    const flight = dayItems.find(i => i.type === "flight");
    if (flight?.details?.destination) return flight.details.destination;
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
                {state.travelers && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
                      <Users className="w-4 h-4 text-violet-600" />
                    </div>
                    <span>{state.travelers} {state.travelers === 1 ? "Traveler" : "Travelers"}</span>
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
                            {isFirstDay ? "A smooth start to your adventure." :
                             isLastDay ? "The perfect way to wrap up your journey." :
                             getDayOneLiner(dayIndex)}
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
                        <ClientPreviewCard key={item.id} item={item} isFirst={itemIndex === 0} />
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

            {/* EMOTIONAL CLOSING */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-8 mb-8"
            >
              <div className="inline-flex items-center gap-2 text-primary-600 mb-4">
                <Heart className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Travel with confidence.
              </h2>
              <p className="text-gray-600 max-w-lg mx-auto">
                From planning to every experience along the way, your trip was designed with care so you can focus on enjoying each moment — stress-free and fully present.
              </p>
            </motion.div>

            {/* FINAL CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-primary-600 via-primary-700 to-rose-600 rounded-2xl p-8 text-center text-white"
            >
              <h3 className="text-xl font-bold mb-2">Ready to make it official?</h3>
              <p className="text-white/80 mb-6">
                Want to personalize anything? We're here to make it perfect.
              </p>
              <div className="flex items-center justify-center gap-4">
                <button className="px-8 py-3 bg-white text-primary-700 rounded-xl font-bold hover:bg-gray-100 transition-all shadow-lg">
                  Review & Confirm Your Trip
                </button>
                <button className="px-6 py-3 border-2 border-white/30 text-white rounded-xl font-medium hover:bg-white/10 transition-all">
                  Request Adjustments
                </button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Individual item card with premium copy
function ClientPreviewCard({ item, isFirst }: { item: QuoteItem; isFirst: boolean }) {
  const Icon = productIcons[item.type];
  const colorClass = productColors[item.type];
  const copy = productCopy[item.type];

  // Get image from item details
  const imageUrl = item.details?.pictures?.[0] || item.details?.image || item.details?.photo;

  return (
    <div className="p-6">
      <div className="flex gap-5">
        {/* Icon or Image */}
        {imageUrl ? (
          <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
            <Image
              src={imageUrl}
              alt={item.details?.name || ""}
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
                {getProductEmoji(item.type)} {getItemDisplayTitle(item, copy)}
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

function getItemDisplayTitle(item: QuoteItem, copy: { title: string }): string {
  if (item.type === "flight") {
    const dest = item.details?.destinationCity || item.details?.destination || "your destination";
    return `Your flight to ${dest}`;
  }
  if (item.type === "hotel") {
    return item.details?.name || copy.title;
  }
  if (item.type === "activity") {
    return item.details?.name || "Today's experience";
  }
  return item.details?.name || copy.title;
}

function getItemDetails(item: QuoteItem): React.ReactNode {
  switch (item.type) {
    case "flight": {
      const d = item.details;
      if (!d) return null;
      return (
        <div className="flex items-center gap-4">
          <span>{d.originCity || d.origin} → {d.destinationCity || d.destination}</span>
          {d.duration && <span>• {d.duration}</span>}
          {d.airline && <span>• {d.airline}</span>}
        </div>
      );
    }
    case "hotel": {
      const d = item.details;
      if (!d) return null;
      return (
        <div className="flex items-center gap-4">
          {d.nights && <span>{d.nights} {d.nights > 1 ? "nights" : "night"}</span>}
          {d.roomType && <span>• {d.roomType}</span>}
          {d.rating && <span>• ⭐ {d.rating}</span>}
        </div>
      );
    }
    case "activity": {
      const d = item.details;
      if (!d) return null;
      return (
        <div className="flex items-center gap-4">
          {d.duration && <span>{d.duration}</span>}
          {d.location && <span>• {d.location}</span>}
        </div>
      );
    }
    case "car": {
      const d = item.details;
      if (!d) return null;
      return (
        <div className="flex items-center gap-4">
          {d.name && <span>{d.name}</span>}
          {d.days && <span>• {d.days} {d.days > 1 ? "days" : "day"}</span>}
        </div>
      );
    }
    default:
      return null;
  }
}
