"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import ItineraryCard from "./ItineraryCard";
import type { QuoteItem } from "../types/quote-workspace.types";

interface SortableItineraryCardProps {
  item: QuoteItem;
}

export default function SortableItineraryCard({ item }: SortableItineraryCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : "auto",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <ItineraryCard item={item} dragListeners={listeners} isDragging={isDragging} />
    </div>
  );
}
