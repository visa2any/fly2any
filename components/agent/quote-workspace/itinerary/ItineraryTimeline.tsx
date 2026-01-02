"use client";

import { useMemo } from "react";
import { format, parseISO, differenceInDays } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Calendar, Users, Globe, MessageCircle, CheckCircle2, Sparkles } from "lucide-react";
import { useQuoteWorkspace, useQuoteItems } from "../QuoteWorkspaceProvider";
import SortableItineraryCard from "./SortableItineraryCard";
import TimelineDayAnchor from "./TimelineDayAnchor";
import FreeTimeBlock, { determineFreeTimeType } from "./FreeTimeBlock";
import { useViewMode } from "./ViewModeContext";
import { detectTone, getClosingMessageSeeded, getTimeBasedGreeting, type ToneProfile } from "./ToneSystem";
import type { QuoteItem } from "../types/quote-workspace.types";

type DayLabel = "arrival" | "departure" | "free" | "park" | "explore" | "celebration";

function groupByDate(items: QuoteItem[]): Map<string, QuoteItem[]> {
  const groups = new Map<string, QuoteItem[]>();
  [...items].sort((a, b) => a.date.localeCompare(b.date) || a.sortOrder - b.sortOrder).forEach((item) => {
    const key = item.date.split("T")[0];
    groups.set(key, [...(groups.get(key) || []), item]);
  });
  return groups;
}

// Group items by time of day
function groupByTimeOfDay(items: QuoteItem[]): Map<string, QuoteItem[]> {
  const segments = new Map<string, QuoteItem[]>();

  items.forEach((item) => {
    // Try to extract time from item details
    const time = extractTime(item);
    const segment = getTimeSegment(time);
    segments.set(segment, [...(segments.get(segment) || []), item]);
  });

  return segments;
}

// Extract time from different item types
function extractTime(item: QuoteItem): string | undefined {
  const details = item.details;
  if (!details) return undefined;

  // Flights: use departure time
  if (item.type === "flight") {
    const segments = details.segments || details.itineraries?.[0]?.segments;
    if (segments?.[0]?.departure?.at) {
      return segments[0].departure.at;
    }
    return details.departureTime;
  }

  // Hotels: usually check-in is afternoon
  if (item.type === "hotel") {
    return details.checkInTime || "14:00"; // Default to 2 PM check-in
  }

  // Activities: use start time
  if (item.type === "activity") {
    return details.time || details.startTime;
  }

  // Transfers: use pickup time
  if (item.type === "transfer") {
    return details.time || details.pickupTime;
  }

  // Cars: usually morning pickup
  if (item.type === "car") {
    return details.pickupTime || "09:00";
  }

  return undefined;
}

// Determine day label based on items
function getDayLabel(items: QuoteItem[], dayIndex: number, totalDays: number): DayLabel | undefined {
  // First day with outbound flight = arrival
  if (dayIndex === 0) {
    const hasFlight = items.some(item => item.type === "flight");
    if (hasFlight) return "arrival";
  }

  // Last day with return flight = departure
  if (dayIndex === totalDays - 1) {
    const hasFlight = items.some(item => item.type === "flight");
    if (hasFlight) return "departure";
  }

  // Day with only hotel = free day
  if (items.length === 1 && items[0].type === "hotel") {
    return "free";
  }

  // Day with activities = explore
  if (items.some(item => item.type === "activity")) {
    return "explore";
  }

  return undefined;
}

// Get primary location for a day
function getDayLocation(items: QuoteItem[]): string | undefined {
  // Try to get from hotel first
  const hotel = items.find(item => item.type === "hotel");
  if (hotel?.details?.location) return hotel.details.location;
  if (hotel?.details?.address) return hotel.details.address;

  // Then from flight arrival
  const flight = items.find(item => item.type === "flight");
  if (flight?.details?.destination) return flight.details.destination;
  if (flight?.details?.segments) {
    const lastSegment = flight.details.segments[flight.details.segments.length - 1];
    if (lastSegment?.arrival?.iataCode) return lastSegment.arrival.iataCode;
  }

  // Then from activity
  const activity = items.find(item => item.type === "activity");
  if (activity?.details?.location) return activity.details.location;

  return undefined;
}

export default function ItineraryTimeline() {
  const items = useQuoteItems();
  const { state, reorderItems, removeItem } = useQuoteWorkspace();
  const { viewMode } = useViewMode();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  const grouped = useMemo(() => groupByDate(items), [items]);
  const dates = useMemo(() => Array.from(grouped.keys()).sort(), [grouped]);

  // Auto-detect tone based on trip characteristics
  const tone: ToneProfile = useMemo(() => {
    const hotels = items.filter(i => i.type === "hotel");
    const activities = items.filter(i => i.type === "activity");
    const maxStars = hotels.reduce((max, h) => {
      const stars = (h as any).starRating || 0;
      return Math.max(max, stars);
    }, 0);

    return detectTone({
      destination: state.destination,
      travelers: state.travelers,
      hasKids: (state.travelers || 0) >= 4,
      hotelStars: maxStars,
      activities: activities.map(a => (a as any).name || ""),
    });
  }, [items, state.destination, state.travelers]);

  const onDragEnd = (e: DragEndEvent) => {
    if (e.over && e.active.id !== e.over.id) reorderItems(e.active.id as string, e.over.id as string);
  };

  // Calculate trip duration with safe parsing
  const safeParseDays = () => {
    try {
      if (dates.length === 0) return 0;
      const start = parseISO(dates[0]);
      const end = parseISO(dates[dates.length - 1]);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) return dates.length;
      return differenceInDays(end, start) + 1;
    } catch {
      return dates.length;
    }
  };
  const tripDuration = safeParseDays();

  // Calculate total price for client view
  const totalPrice = items.reduce((sum, item) => sum + (item.price || 0), 0);
  const formatTotalPrice = (amount: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(amount);

  // Auto-generate trip name if empty
  const displayTripName = state.tripName ||
    (state.destination ? `Your ${state.destination} ${tone === "family" ? "Family Adventure" : tone === "romantic" ? "Romantic Escape" : tone === "luxury" ? "Luxury Retreat" : tone === "adventure" ? "Adventure" : "Trip"}` : null);

  // Personalized greeting
  const greeting = getTimeBasedGreeting();
  const clientName = state.clientName || "Traveler"; // Use clientName if available
  const closingMessage = getClosingMessageSeeded(tone, tripDuration);

  return (
    <div className="space-y-4">
      {/* Trip Header - Apple-Class */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-5 border border-gray-100 shadow-sm"
      >
        {/* Personalized Greeting - Client View Only */}
        {viewMode === "client" && (
          <p className="text-center text-sm text-gray-500 mb-2">
            {greeting}, {clientName}! ✨
          </p>
        )}

        {/* Trip Name */}
        <div className="text-center mb-4">
          {displayTripName ? (
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">
              {displayTripName}
            </h2>
          ) : (
            <h2 className="text-xl font-medium text-gray-400 italic">
              Your Travel Itinerary
            </h2>
          )}
        </div>

        {/* Trip Stats */}
        <div className="flex items-center justify-center gap-6 flex-wrap text-sm">
          {state.destination && (
            <div className="flex items-center gap-2 text-gray-600">
              <div className="w-8 h-8 rounded-xl bg-primary-50 flex items-center justify-center">
                <Globe className="w-4 h-4 text-primary-600" />
              </div>
              <span className="font-medium">{state.destination}</span>
            </div>
          )}

          {state.startDate && state.endDate && (
            <div className="flex items-center gap-2 text-gray-600">
              <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-blue-600" />
              </div>
              <span>
                {format(parseISO(state.startDate), "MMM d")} – {format(parseISO(state.endDate), "MMM d, yyyy")}
              </span>
            </div>
          )}

          {tripDuration > 0 && (
            <div className="flex items-center gap-2 text-gray-600">
              <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-gray-100">
                {tripDuration} {tripDuration === 1 ? "Day" : "Days"}
              </span>
            </div>
          )}

          {state.travelers && state.travelers > 0 && (
            <div className="flex items-center gap-2 text-gray-600">
              <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center">
                <Users className="w-4 h-4 text-violet-600" />
              </div>
              <span>{state.travelers} {state.travelers === 1 ? "Traveler" : "Travelers"}</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical Timeline Connector */}
        <div className="absolute left-[23px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-blue-200 via-gray-200 to-orange-200 rounded-full" />

        <AnimatePresence>
          {dates.map((date, i) => {
            const dayItems = grouped.get(date) || [];
            const dayLabel = getDayLabel(dayItems, i, dates.length);
            const dayLocation = getDayLocation(dayItems);
            const isFirst = i === 0;
            const isLast = i === dates.length - 1;

            return (
              <motion.div
                key={date}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="relative mb-6 last:mb-0"
              >
                {/* Day Anchor */}
                <TimelineDayAnchor
                  date={date}
                  dayNumber={i + 1}
                  location={dayLocation}
                  label={dayLabel}
                  isFirst={isFirst}
                  isLast={isLast}
                  itemCount={dayItems.length}
                  tone={tone}
                />

                {/* Day Items */}
                <div className={viewMode === "client" ? "mt-3 space-y-3" : "ml-0 sm:ml-16 mt-3 space-y-3"}>
                  {dayItems.length === 0 ? (
                    /* Leisure Day - No items scheduled */
                    <FreeTimeBlock
                      type={determineFreeTimeType(undefined, undefined, false)}
                      dayNumber={i + 1}
                      tone={tone}
                      location={dayLocation}
                      agentNote={viewMode === "agent" ? "No activities planned" : undefined}
                    />
                  ) : (
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                      <SortableContext items={dayItems.map(x => x.id)} strategy={verticalListSortingStrategy}>
                        {dayItems.map((item) => (
                          <SortableItineraryCard
                            key={item.id}
                            item={item}
                            viewMode={viewMode}
                            tone={tone}
                          />
                        ))}
                      </SortableContext>
                    </DndContext>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Empty State */}
        {dates.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No items yet</h3>
            <p className="text-sm text-gray-500">
              Search for flights, hotels, and activities to build your itinerary
            </p>
          </motion.div>
        )}
      </div>

      {/* Client View Footer - Closing Message + Price + CTAs */}
      {viewMode === "client" && dates.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 space-y-4"
        >
          {/* Closing Message */}
          <div className="text-center">
            <p className="text-sm text-gray-500 italic">{closingMessage}</p>
          </div>

          {/* Price Summary */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5 text-center shadow-xl">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Your Trip Investment</p>
            <p className="text-3xl font-black text-white">{formatTotalPrice(totalPrice)}</p>
            <p className="text-xs text-gray-400 mt-1">All inclusive • No hidden fees</p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]">
              <CheckCircle2 className="w-5 h-5" />
              Approve Quote
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-gray-700 font-semibold rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all hover:border-gray-300">
              <MessageCircle className="w-5 h-5" />
              Ask Questions
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
