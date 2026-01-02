"use client";

import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════════
// SUCCESS MOMENT - First 3 seconds, calm premium confirmation
// No confetti overload, subtle animation
// ═══════════════════════════════════════════════════════════════════════════════

interface SuccessMomentProps {
  destination?: string;
  onAnimationComplete?: () => void;
}

export default function SuccessMoment({ destination, onAnimationComplete }: SuccessMomentProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-12 px-6 text-center"
    >
      {/* Animated checkmark */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
        onAnimationComplete={onAnimationComplete}
        className="relative"
      >
        {/* Glow ring */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1.2, opacity: 0 }}
          transition={{ duration: 1.5, repeat: 2, repeatDelay: 0.5 }}
          className="absolute inset-0 w-20 h-20 rounded-full bg-emerald-400"
        />

        {/* Main circle */}
        <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-xl shadow-emerald-500/30">
          <motion.div
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Check className="w-10 h-10 text-white stroke-[3]" />
          </motion.div>
        </div>
      </motion.div>

      {/* Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-6 text-2xl font-bold text-gray-900"
      >
        Payment Confirmed
      </motion.h1>

      {/* Subtext */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-2 text-gray-600"
      >
        Your trip is officially in progress
      </motion.p>

      {/* Destination highlight */}
      {destination && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1 }}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-full"
        >
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-semibold">{destination}</span>
        </motion.div>
      )}
    </motion.div>
  );
}

// Compact inline version
export function SuccessBadge() {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full"
    >
      <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
        <Check className="w-3 h-3 text-white" />
      </div>
      <span className="text-sm font-semibold">Payment Confirmed</span>
    </motion.div>
  );
}
