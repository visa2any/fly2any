"use client";

import { useMemo } from "react";
import { format, parseISO, differenceInDays } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Calendar, Users, Globe } from "lucide-react";
import { useQuoteWorkspace, useQuoteItems } from "../QuoteWorkspaceProvider";
import SortableItineraryCard from "./SortableItineraryCard";
import TimelineDayAnchor from "./TimelineDayAnchor";
import { useViewMode } from "./ViewModeContext";
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

  const onDragEnd = (e: DragEndEvent) => {
    if (e.over && e.active.id !== e.over.id) reorderItems(e.active.id as string, e.over.id as string);
  };

  // Calculate trip duration
  const tripDuration = dates.length > 0
    ? differenceInDays(parseISO(dates[dates.length - 1]), parseISO(dates[0])) + 1
    : 0;

  return (
    <div className="space-y-4">
      {/* Trip Header - Apple-Class */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-5 border border-gray-100 shadow-sm"
      >
        {/* Trip Name */}
        <div className="text-center mb-4">
          {state.tripName ? (
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">
              {state.tripName}
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
                />

                {/* Day Items */}
                <div className="ml-16 mt-3 space-y-3">
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                    <SortableContext items={dayItems.map(x => x.id)} strategy={verticalListSortingStrategy}>
                      {dayItems.map((item) => (
                        <SortableItineraryCard
                          key={item.id}
                          item={item}
                          viewMode={viewMode}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
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
    </div>
  );
}
