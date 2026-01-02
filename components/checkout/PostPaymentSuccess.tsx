"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Download, Calendar, Share2, ArrowRight } from "lucide-react";
import SuccessMoment from "./SuccessMoment";
import ReassuranceBlock from "./ReassuranceBlock";
import PostPaymentTimeline from "./PostPaymentTimeline";
import AgentPresence from "./AgentPresence";
import TripGlance from "./TripGlance";
import { scheduleBookingLifecycle, type BookingData } from "./RetentionTriggers";
import type { CheckoutItem, TravelerInfo } from "./types";

// ═══════════════════════════════════════════════════════════════════════════════
// POST-PAYMENT SUCCESS - Transforms relief into excitement
// "Everything is taken care of."
// ═══════════════════════════════════════════════════════════════════════════════

interface PostPaymentSuccessProps {
  bookingId: string;
  items: CheckoutItem[];
  travelers: TravelerInfo;
  destination: string;
  startDate: string;
  endDate: string;
  total: number;
  currency?: string;
  clientName: string;
  clientEmail: string;
  agentName?: string;
  agentEmail?: string;
  agentPhone?: string;
  agentPhotoUrl?: string;
}

export default function PostPaymentSuccess({
  bookingId,
  items,
  travelers,
  destination,
  startDate,
  endDate,
  total,
  currency = "USD",
  clientName,
  clientEmail,
  agentName,
  agentEmail,
  agentPhone,
  agentPhotoUrl,
}: PostPaymentSuccessProps) {
  const [showContent, setShowContent] = useState(false);
  const [lifecycleScheduled, setLifecycleScheduled] = useState(false);

  // Schedule retention lifecycle on mount
  useEffect(() => {
    if (!lifecycleScheduled) {
      const bookingData: BookingData = {
        bookingId,
        clientEmail,
        clientName,
        destination,
        startDate,
        endDate,
        agentName,
        agentEmail,
        total,
        currency,
      };

      scheduleBookingLifecycle(bookingData).then(() => {
        setLifecycleScheduled(true);
      });
    }
  }, [bookingId, lifecycleScheduled]);

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(n);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Booking Reference</p>
              <p className="text-sm font-bold text-gray-900 font-mono">{bookingId}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Total Paid</p>
              <p className="text-sm font-bold text-gray-900">{formatCurrency(total)}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Success Moment - First 3 seconds */}
        <SuccessMoment
          destination={destination}
          onAnimationComplete={() => setShowContent(true)}
        />

        {/* Content appears after success animation */}
        {showContent && (
          <>
            {/* Reassurance Block */}
            <ReassuranceBlock agentName={agentName} />

            {/* Trip at a Glance */}
            <TripGlance
              destination={destination}
              startDate={startDate}
              endDate={endDate}
              travelers={travelers}
              items={items}
            />

            {/* What's Next Timeline */}
            <PostPaymentTimeline agentName={agentName} />

            {/* Agent Presence */}
            {agentName && (
              <AgentPresence
                name={agentName}
                email={agentEmail}
                phone={agentPhone}
                photoUrl={agentPhotoUrl}
              />
            )}

            {/* Secondary Actions - Calm, no pressure */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="bg-white rounded-xl border border-gray-100 p-4"
            >
              <h3 className="text-sm font-bold text-gray-900 mb-3">Quick Actions</h3>

              <div className="grid grid-cols-2 gap-2">
                <button className="flex items-center justify-center gap-2 py-2.5 px-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
                  <Download className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Receipt</span>
                </button>

                <button className="flex items-center justify-center gap-2 py-2.5 px-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
                  <Calendar className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Add to Calendar</span>
                </button>

                <button className="flex items-center justify-center gap-2 py-2.5 px-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
                  <Share2 className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Share Itinerary</span>
                </button>

                <a
                  href={`/bookings/${bookingId}`}
                  className="flex items-center justify-center gap-2 py-2.5 px-4 bg-gray-900 hover:bg-gray-800 rounded-xl transition-colors"
                >
                  <span className="text-sm font-medium text-white">View Details</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </a>
              </div>
            </motion.div>

            {/* Confirmation Email Notice */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3 }}
              className="text-xs text-center text-gray-500"
            >
              A confirmation email has been sent to <span className="font-medium">{clientEmail}</span>
            </motion.p>
          </>
        )}
      </main>
    </div>
  );
}
