"use client";

import { useMemo } from "react";
import { format, parseISO } from "date-fns";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useQuoteWorkspace, useQuoteItems } from "../QuoteWorkspaceProvider";
import SortableItineraryCard from "./SortableItineraryCard";
import DayMarker from "./DayMarker";
import type { QuoteItem } from "../types/quote-workspace.types";

function groupByDate(items: QuoteItem[]): Map<string, QuoteItem[]> {
  const groups = new Map<string, QuoteItem[]>();
  [...items].sort((a, b) => a.date.localeCompare(b.date) || a.sortOrder - b.sortOrder).forEach((item) => {
    const key = item.date.split("T")[0];
    groups.set(key, [...(groups.get(key) || []), item]);
  });
  return groups;
}

export default function ItineraryTimeline() {
  const items = useQuoteItems();
  const { state, reorderItems } = useQuoteWorkspace();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  const grouped = useMemo(() => groupByDate(items), [items]);
  const dates = useMemo(() => Array.from(grouped.keys()).sort(), [grouped]);

  const onDragEnd = (e: DragEndEvent) => {
    if (e.over && e.active.id !== e.over.id) reorderItems(e.active.id as string, e.over.id as string);
  };

  return (
    <div className="space-y-3">
      {/* Trip Header - Compact */}
      {state.tripName && (
        <div className="text-center pb-3 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">{state.tripName}</h2>
          {state.destination && <p className="text-xs text-gray-500">{state.destination}</p>}
          {state.startDate && state.endDate && (
            <p className="text-[10px] text-gray-400 mt-0.5">
              {format(parseISO(state.startDate), "MMM d")} – {format(parseISO(state.endDate), "MMM d, yyyy")}
            </p>
          )}
        </div>
      )}

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-5 top-0 bottom-0 w-px bg-gray-200" />
        {dates.map((date, i) => {
          const dayItems = grouped.get(date) || [];
          return (
            <div key={date} className="relative">
              <DayMarker date={date} dayNumber={i + 1} />
              <div className="ml-12 space-y-2 pb-4">
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                  <SortableContext items={dayItems.map(x => x.id)} strategy={verticalListSortingStrategy}>
                    {dayItems.map((item) => <SortableItineraryCard key={item.id} item={item} />)}
                  </SortableContext>
                </DndContext>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
