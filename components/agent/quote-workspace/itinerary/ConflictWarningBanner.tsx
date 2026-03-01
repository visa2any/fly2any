"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X, ChevronDown, ChevronUp, Clock } from "lucide-react";
import { useQuoteConflicts, useQuoteWorkspace } from "../QuoteWorkspaceProvider";
import type { TimeConflict } from "../utils/conflict-detection";

interface ConflictWarningBannerProps {
  className?: string;
}

const SEVERITY_STYLES = {
  critical: {
    bg: "bg-red-50 border-red-200",
    icon: "text-red-500",
    badge: "bg-red-100 text-red-700",
    text: "text-red-800",
    dot: "bg-red-500",
  },
  warning: {
    bg: "bg-amber-50 border-amber-200",
    icon: "text-amber-500",
    badge: "bg-amber-100 text-amber-700",
    text: "text-amber-800",
    dot: "bg-amber-500",
  },
  info: {
    bg: "bg-blue-50 border-blue-200",
    icon: "text-blue-500",
    badge: "bg-blue-100 text-blue-700",
    text: "text-blue-800",
    dot: "bg-blue-500",
  },
};

function ConflictRow({ conflict, itemName }: { conflict: TimeConflict; itemName: string }) {
  const styles = SEVERITY_STYLES[conflict.severity];
  const isOverlap = conflict.type === "overlap";

  return (
    <div className="flex items-start gap-2 py-1.5">
      <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${styles.dot}`} />
      <div className="flex-1 min-w-0">
        <span className={`text-xs font-semibold ${styles.text}`}>{itemName}</span>
        <span className={`text-xs ${styles.text} opacity-80`}> — {conflict.message}</span>
      </div>
      <span className={`text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded ${styles.badge} flex-shrink-0`}>
        {isOverlap ? "Overlap" : "Tight"}
      </span>
    </div>
  );
}

export default function ConflictWarningBanner({ className = "" }: ConflictWarningBannerProps) {
  const conflicts = useQuoteConflicts();
  const { state } = useQuoteWorkspace();
  const [dismissed, setDismissed] = useState(false);
  const [expanded, setExpanded] = useState(true);

  if (conflicts.size === 0 || dismissed) return null;

  // Group by severity
  const criticalConflicts: TimeConflict[] = [];
  const warningConflicts: TimeConflict[] = [];

  // Deduplicate (each pair appears twice in the map)
  const seen = new Set<string>();
  conflicts.forEach((conflict) => {
    const key = [conflict.itemId, ...conflict.conflictsWith].sort().join("|");
    if (!seen.has(key)) {
      seen.add(key);
      if (conflict.severity === "critical") criticalConflicts.push(conflict);
      else warningConflicts.push(conflict);
    }
  });

  const totalConflicts = criticalConflicts.length + warningConflicts.length;
  const dominantSeverity = criticalConflicts.length > 0 ? "critical" : "warning";
  const styles = SEVERITY_STYLES[dominantSeverity];

  // Get item name from state
  const getItemName = (itemId: string) => {
    const item = state.items.find((i) => i.id === itemId);
    if (!item) return "Item";
    if (item.type === "flight") return `Flight ${(item as any).flightNumber || ""}`.trim();
    if (item.type === "hotel") return (item as any).name || "Hotel";
    if (item.type === "activity") return (item as any).name || "Activity";
    if (item.type === "transfer") return `Transfer`;
    if (item.type === "car") return `Car Rental`;
    return item.type;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className={`rounded-xl border ${styles.bg} overflow-hidden ${className}`}
      >
        {/* Header */}
        <div className="flex items-center gap-2 px-3 py-2">
          <AlertTriangle className={`w-4 h-4 flex-shrink-0 ${styles.icon}`} />
          <div className="flex-1 min-w-0">
            <span className={`text-xs font-bold ${styles.text}`}>
              {totalConflicts} Scheduling {totalConflicts === 1 ? "Conflict" : "Conflicts"} Detected
            </span>
            {criticalConflicts.length > 0 && (
              <span className="ml-2 text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-red-500 text-white">
                Action Required
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setExpanded(!expanded)}
              className={`p-1 rounded hover:bg-black/5 transition-colors ${styles.text}`}
              title={expanded ? "Collapse" : "Expand"}
            >
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => setDismissed(true)}
              className={`p-1 rounded hover:bg-black/5 transition-colors ${styles.text} opacity-60`}
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Conflict List */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-t border-current/10 px-3 pb-2 pt-1 space-y-0 overflow-hidden"
            >
              {criticalConflicts.map((conflict) => (
                <ConflictRow
                  key={conflict.itemId}
                  conflict={conflict}
                  itemName={getItemName(conflict.itemId)}
                />
              ))}
              {warningConflicts.map((conflict) => (
                <ConflictRow
                  key={conflict.itemId}
                  conflict={conflict}
                  itemName={getItemName(conflict.itemId)}
                />
              ))}
              <div className={`flex items-center gap-1 mt-1.5 pt-1.5 border-t border-current/10 text-[10px] ${styles.text} opacity-70`}>
                <Clock className="w-3 h-3" />
                <span>Review your itinerary timing and adjust overlapping items.</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
