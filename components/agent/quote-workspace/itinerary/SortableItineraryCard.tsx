"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import ItineraryCard from "./ItineraryCard";
import type { QuoteItem } from "../types/quote-workspace.types";

interface SortableItineraryCardProps {
  item: QuoteItem;
  viewMode?: "agent" | "client";
}

export default function SortableItineraryCard({ item, viewMode = "agent" }: SortableItineraryCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition || "transform 150ms ease",
      }}
      className={isDragging ? "relative z-50 opacity-90 scale-[1.02] shadow-xl rounded-xl" : ""}
    >
      <ItineraryCard item={item} dragListeners={listeners} isDragging={isDragging} viewMode={viewMode} />
    </div>
  );
}
