"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Cloud, CloudOff, Check, Loader2 } from "lucide-react";

// ============================================
// AUTOSAVE INDICATOR - Non-Intrusive Status
// ============================================

type SaveStatus = "idle" | "saving" | "saved" | "error" | "offline";

interface AutosaveIndicatorProps {
  status: SaveStatus;
  lastSavedAt?: string | null;
  variant?: "minimal" | "full";
}

export default function AutosaveIndicator({ status, lastSavedAt, variant = "minimal" }: AutosaveIndicatorProps) {
  const formatTime = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  };

  const config = {
    idle: { icon: Cloud, text: "", color: "text-gray-400" },
    saving: { icon: Loader2, text: "Saving...", color: "text-blue-500", animate: true },
    saved: { icon: Check, text: lastSavedAt ? `Saved at ${formatTime(lastSavedAt)}` : "Saved", color: "text-emerald-500" },
    error: { icon: CloudOff, text: "Save failed", color: "text-red-500" },
    offline: { icon: CloudOff, text: "Offline", color: "text-amber-500" },
  };

  // Hide when idle (DRAFT badge already shows status)
  if (status === "idle" && variant === "minimal") return null;

  const { icon: Icon, text, color, animate } = config[status];

  if (variant === "minimal") {
    return (
      <div className={`flex items-center gap-1.5 text-xs ${color}`}>
        <Icon className={`w-3.5 h-3.5 ${animate ? "animate-spin" : ""}`} />
        <AnimatePresence mode="wait">
          <motion.span
            key={status}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
          >
            {text}
          </motion.span>
        </AnimatePresence>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-100 ${color}`}
    >
      <Icon className={`w-4 h-4 ${animate ? "animate-spin" : ""}`} />
      <div className="flex flex-col">
        <span className="text-xs font-medium">{text}</span>
        {lastSavedAt && status === "saved" && (
          <span className="text-[10px] text-gray-400">Auto-saved</span>
        )}
      </div>
    </motion.div>
  );
}

// Toast notification for save events
export function SaveToast({ visible, status }: { visible: boolean; status: SaveStatus }) {
  return (
    <AnimatePresence>
      {visible && status === "saved" && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 right-4 z-50"
        >
          <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-white rounded-xl shadow-lg">
            <Check className="w-4 h-4" />
            <span className="text-sm font-medium">Quote saved</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
