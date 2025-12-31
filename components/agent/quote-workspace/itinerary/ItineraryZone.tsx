"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useQuoteWorkspace, useQuoteItems } from "../QuoteWorkspaceProvider";
import EmptyItinerary from "./EmptyItinerary";
import ItineraryTimeline from "./ItineraryTimeline";

export default function ItineraryZone() {
  const items = useQuoteItems();
  const isEmpty = items.length === 0;

  return (
    <div className="h-full">
      {isEmpty ? (
        <EmptyItinerary />
      ) : (
        <ItineraryTimeline />
      )}
    </div>
  );
}
