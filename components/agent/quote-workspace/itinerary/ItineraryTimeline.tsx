"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { format, parseISO } from "date-fns";
import { useQuoteWorkspace, useQuoteItems } from "../QuoteWorkspaceProvider";
import ItineraryCard from "./ItineraryCard";
import DayMarker from "./DayMarker";
import type { QuoteItem } from "../types/quote-workspace.types";

// Group items by date
function groupItemsByDate(items: QuoteItem[]): Map<string, QuoteItem[]> {
  const groups = new Map<string, QuoteItem[]>();

  // Sort items by date first, then by sortOrder
  const sorted = [...items].sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    return a.sortOrder - b.sortOrder;
  });

  sorted.forEach((item) => {
    const dateKey = item.date.split("T")[0]; // Get just the date part
    const existing = groups.get(dateKey) || [];
    groups.set(dateKey, [...existing, item]);
  });

  return groups;
}

export default function ItineraryTimeline() {
  const items = useQuoteItems();
  const { state } = useQuoteWorkspace();

  // Group items by date
  const groupedItems = useMemo(() => groupItemsByDate(items), [items]);
  const dateKeys = useMemo(() => Array.from(groupedItems.keys()).sort(), [groupedItems]);

  return (
    <div className="space-y-4">
      {/* Trip Header */}
      {state.tripName && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center pb-4 border-b border-gray-200"
        >
          <h2 className="text-2xl font-bold text-gray-900">{state.tripName}</h2>
          {state.destination && (
            <p className="text-gray-500 mt-1">{state.destination}</p>
          )}
          {state.startDate && state.endDate && (
            <p className="text-sm text-gray-400 mt-1">
              {format(parseISO(state.startDate), "MMM d")} - {format(parseISO(state.endDate), "MMM d, yyyy")}
            </p>
          )}
        </motion.div>
      )}

      {/* Timeline */}
      <div className="relative">
        {/* Vertical connector line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-gray-200 via-gray-300 to-gray-200" />

        {/* Day groups */}
        {dateKeys.map((dateKey, dayIndex) => {
          const dayItems = groupedItems.get(dateKey) || [];

          return (
            <div key={dateKey} className="relative">
              <DayMarker date={dateKey} dayNumber={dayIndex + 1} />

              <div className="ml-14 space-y-3 pb-6">
                {dayItems.map((item, itemIndex) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: itemIndex * 0.05 }}
                  >
                    <ItineraryCard item={item} />
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
