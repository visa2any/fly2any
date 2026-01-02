"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import TripSummaryCard from "./TripSummaryCard";
import ConfidenceLayer from "./ConfidenceLayer";
import PolicyTransparency from "./PolicyTransparency";
import WhatHappensNext from "./WhatHappensNext";
import CheckoutCTA from "./CheckoutCTA";
import PaymentMethodSelector from "./PaymentMethodSelector";
import type { CheckoutItem, TravelerInfo, PaymentMethod } from "./types";

// ═══════════════════════════════════════════════════════════════════════════════
// CLIENT CHECKOUT - Confidence-Driven, Trust-First Experience
// "Everything is clear. I'm ready."
// ═══════════════════════════════════════════════════════════════════════════════

interface ClientCheckoutProps {
  items: CheckoutItem[];
  travelers: TravelerInfo;
  startDate: string;
  endDate: string;
  currency?: string;
  agentName?: string;
  agentEmail?: string;
  onPaymentComplete?: (paymentId: string) => void;
  onPaymentError?: (error: Error) => void;
}

export default function ClientCheckout({
  items,
  travelers,
  startDate,
  endDate,
  currency = "USD",
  agentName,
  agentEmail,
  onPaymentComplete,
  onPaymentError,
}: ClientCheckoutProps) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("card");

  const total = items.reduce((sum, item) => sum + item.price, 0);

  const handlePayment = useCallback(async (): Promise<boolean> => {
    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // In production: Call payment API here
      // const result = await processPayment({ items, total, method: selectedPaymentMethod });

      const mockPaymentId = `PAY-${Date.now()}`;
      onPaymentComplete?.(mockPaymentId);
      return true;
    } catch (error) {
      onPaymentError?.(error as Error);
      return false;
    }
  }, [items, total, selectedPaymentMethod, onPaymentComplete, onPaymentError]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-gray-900">Complete Your Booking</h1>
            {agentName && (
              <div className="text-right">
                <p className="text-xs text-gray-500">Your travel expert</p>
                <p className="text-sm font-semibold text-gray-900">{agentName}</p>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Left Column - Summary (sticky on desktop) */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <div className="lg:sticky lg:top-24 space-y-4">
              <TripSummaryCard
                items={items}
                travelers={travelers}
                startDate={startDate}
                endDate={endDate}
                currency={currency}
              />

              {/* Policy Summary - Mobile only shows summary */}
              <div className="lg:hidden">
                <PolicyTransparency items={items} variant="summary" />
              </div>
            </div>
          </div>

          {/* Right Column - Checkout Flow */}
          <div className="lg:col-span-3 order-1 lg:order-2 space-y-6">
            {/* Step 1: Policy Transparency */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <PolicyTransparency items={items} />
            </motion.section>

            {/* Step 2: What Happens Next */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <WhatHappensNext agentName={agentName} />
            </motion.section>

            {/* Step 3: Payment Method */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <PaymentMethodSelector
                selected={selectedPaymentMethod}
                onSelect={setSelectedPaymentMethod}
              />
            </motion.section>

            {/* Step 4: Confidence Layer */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <ConfidenceLayer agentName={agentName} />
            </motion.section>

            {/* Step 5: Primary CTA */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="pt-2"
            >
              <CheckoutCTA
                total={total}
                currency={currency}
                onPayment={handlePayment}
              />
            </motion.section>
          </div>
        </div>
      </main>

      {/* Footer - Contact */}
      {agentEmail && (
        <footer className="border-t border-gray-100 bg-white mt-12">
          <div className="max-w-4xl mx-auto px-4 py-4 text-center">
            <p className="text-xs text-gray-500">
              Questions? Contact your agent at{" "}
              <a href={`mailto:${agentEmail}`} className="text-gray-900 font-medium hover:underline">
                {agentEmail}
              </a>
            </p>
          </div>
        </footer>
      )}
    </div>
  );
}
