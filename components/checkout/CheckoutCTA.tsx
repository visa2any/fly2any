"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Lock, Loader2, CheckCircle, ArrowRight } from "lucide-react";
import { SecurityBadges } from "./ConfidenceLayer";

// ═══════════════════════════════════════════════════════════════════════════════
// CHECKOUT CTA - Singular, clear, prevents double submission
// "Confirm & Pay Securely" or "Complete Booking"
// ═══════════════════════════════════════════════════════════════════════════════

type CTAState = "idle" | "processing" | "success" | "error";

interface CheckoutCTAProps {
  total: number;
  currency?: string;
  onPayment: () => Promise<boolean>;
  disabled?: boolean;
  variant?: "primary" | "minimal";
}

export default function CheckoutCTA({
  total,
  currency = "USD",
  onPayment,
  disabled = false,
  variant = "primary",
}: CheckoutCTAProps) {
  const [state, setState] = useState<CTAState>("idle");
  const [error, setError] = useState<string | null>(null);

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(n);

  const handleClick = useCallback(async () => {
    if (state === "processing" || disabled) return;

    setState("processing");
    setError(null);

    try {
      const success = await onPayment();
      setState(success ? "success" : "error");
      if (!success) {
        setError("Payment could not be processed. Please try again.");
        // Reset to idle after showing error
        setTimeout(() => setState("idle"), 3000);
      }
    } catch (err) {
      setState("error");
      setError("An unexpected error occurred. Please try again.");
      setTimeout(() => setState("idle"), 3000);
    }
  }, [state, disabled, onPayment]);

  const isDisabled = disabled || state === "processing" || state === "success";

  if (variant === "minimal") {
    return (
      <motion.button
        onClick={handleClick}
        disabled={isDisabled}
        whileHover={!isDisabled ? { scale: 1.02 } : {}}
        whileTap={!isDisabled ? { scale: 0.98 } : {}}
        className={`w-full py-3 px-6 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
          state === "success"
            ? "bg-emerald-600 text-white"
            : state === "error"
            ? "bg-red-600 text-white"
            : isDisabled
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-gray-900 text-white hover:bg-gray-800"
        }`}
      >
        {state === "processing" && <Loader2 className="w-4 h-4 animate-spin" />}
        {state === "success" && <CheckCircle className="w-4 h-4" />}
        {state === "idle" && <Lock className="w-4 h-4" />}

        <span>
          {state === "processing"
            ? "Processing..."
            : state === "success"
            ? "Payment Complete"
            : state === "error"
            ? "Try Again"
            : "Pay Securely"}
        </span>
      </motion.button>
    );
  }

  return (
    <div className="space-y-3">
      {/* Main CTA Button */}
      <motion.button
        onClick={handleClick}
        disabled={isDisabled}
        whileHover={!isDisabled ? { scale: 1.01, y: -2 } : {}}
        whileTap={!isDisabled ? { scale: 0.99 } : {}}
        className={`relative w-full py-4 px-6 rounded-2xl font-bold text-base transition-all shadow-lg ${
          state === "success"
            ? "bg-emerald-600 text-white shadow-emerald-500/30"
            : state === "error"
            ? "bg-red-600 text-white shadow-red-500/30"
            : isDisabled
            ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
            : "bg-gray-900 text-white hover:bg-gray-800 shadow-gray-900/30"
        }`}
      >
        {/* Subtle gradient overlay */}
        {state === "idle" && !disabled && (
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        )}

        <div className="relative flex items-center justify-center gap-3">
          {state === "processing" && (
            <Loader2 className="w-5 h-5 animate-spin" />
          )}
          {state === "success" && <CheckCircle className="w-5 h-5" />}
          {state === "idle" && <Lock className="w-5 h-5" />}
          {state === "error" && <Lock className="w-5 h-5" />}

          <span>
            {state === "processing"
              ? "Processing Payment..."
              : state === "success"
              ? "Payment Complete!"
              : state === "error"
              ? "Try Again"
              : `Confirm & Pay ${formatCurrency(total)}`}
          </span>

          {state === "idle" && !disabled && (
            <ArrowRight className="w-5 h-5 ml-1" />
          )}
        </div>
      </motion.button>

      {/* Error Message */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-center text-red-600"
        >
          {error}
        </motion.p>
      )}

      {/* Security Badges */}
      <SecurityBadges />

      {/* Legal micro-copy */}
      <p className="text-[10px] text-center text-gray-400">
        By completing this payment, you agree to our{" "}
        <a href="/terms" className="underline hover:text-gray-600">Terms of Service</a>
        {" "}and{" "}
        <a href="/privacy" className="underline hover:text-gray-600">Privacy Policy</a>
      </p>
    </div>
  );
}
