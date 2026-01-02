"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Mail,
  Clock,
  MessageCircle,
  Calendar,
  Download,
  Share2,
  MapPin,
  Users,
  Phone,
  Sparkles,
  Heart,
  Shield,
  ArrowRight,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════════
// POST-PAYMENT SUCCESS - Transform relief into excitement
// "I made the right decision."
// ═══════════════════════════════════════════════════════════════════════════════

interface PostPaymentSuccessProps {
  bookingId: string;
  tripName: string;
  destination: string;
  startDate: string;
  endDate: string;
  travelers: number;
  total: number;
  currency?: string;
  agentName?: string;
  agentEmail?: string;
  agentPhone?: string;
  agentPhoto?: string;
  onViewTrip?: () => void;
  onDownloadReceipt?: () => void;
  onAddToCalendar?: () => void;
}

export default function PostPaymentSuccess({
  bookingId,
  tripName,
  destination,
  startDate,
  endDate,
  travelers,
  total,
  currency = "USD",
  agentName = "Your Travel Expert",
  agentEmail,
  agentPhone,
  agentPhoto,
  onViewTrip,
  onDownloadReceipt,
  onAddToCalendar,
}: PostPaymentSuccessProps) {
  const [showContent, setShowContent] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);

  // Staggered reveal for premium feel
  useEffect(() => {
    const t1 = setTimeout(() => setShowContent(true), 800);
    const t2 = setTimeout(() => setShowTimeline(true), 1500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const formatPrice = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);

  const formatDate = (d: string) => {
    try { return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" }); }
    catch { return d; }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* ═══ SUCCESS MOMENT (First 3 seconds) ═══ */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="text-center mb-10"
        >
          {/* Animated Checkmark */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
            className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-xl shadow-emerald-500/30"
          >
            <motion.div
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <CheckCircle2 className="w-10 h-10 text-white" />
            </motion.div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-2xl font-bold text-gray-900 mb-2"
          >
            Payment Confirmed
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-gray-600"
          >
            Your trip is officially in progress
          </motion.p>
        </motion.div>

        {/* ═══ REASSURANCE BLOCK (Critical) ═══ */}
        <AnimatePresence>
          {showContent && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6 mb-6"
            >
              <div className="space-y-3">
                {[
                  { icon: Shield, text: "Payment received securely", color: "text-emerald-500" },
                  { icon: Sparkles, text: "Your booking is being finalized", color: "text-blue-500" },
                  { icon: Mail, text: "You'll receive confirmation by email", color: "text-violet-500" },
                  { icon: MessageCircle, text: "Your agent remains available", color: "text-amber-500" },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * i }}
                    className="flex items-center gap-3"
                  >
                    <div className={`w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center ${item.color}`}>
                      <item.icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm text-gray-700">{item.text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══ WHAT HAPPENS NEXT (Timeline) ═══ */}
        <AnimatePresence>
          {showTimeline && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 p-6 mb-6"
            >
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-400" />
                What's next
              </h3>
              <div className="space-y-4">
                {[
                  { time: "Within minutes", action: "Booking confirmation email", icon: Mail },
                  { time: "Within 24 hours", action: "Tickets & vouchers issued", icon: Download },
                  { time: "Anytime", action: "Contact your travel expert", icon: MessageCircle },
                ].map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 * i }}
                    className="flex items-start gap-4"
                  >
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                        <step.icon className="w-5 h-5 text-blue-600" />
                      </div>
                      {i < 2 && (
                        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-px h-4 bg-gray-200" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">{step.time}</p>
                      <p className="text-sm font-medium text-gray-900">{step.action}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══ YOUR TRIP AT A GLANCE ═══ */}
        <AnimatePresence>
          {showTimeline && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-6 text-white mb-6 shadow-xl"
            >
              <div className="flex items-center gap-2 mb-4">
                <Heart className="w-5 h-5" />
                <span className="text-sm font-medium text-white/80">Your upcoming adventure</span>
              </div>
              <h3 className="text-xl font-bold mb-4">{tripName || destination}</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-white/70" />
                  <span>{destination}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-white/70" />
                  <span>{formatDate(startDate)} – {formatDate(endDate)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-white/70" />
                  <span>{travelers} Traveler{travelers > 1 ? "s" : ""}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-white/70" />
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-white/20 text-xs text-white/60">
                Booking #{bookingId}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══ HUMAN CONNECTION (Differentiator) ═══ */}
        <AnimatePresence>
          {showTimeline && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6 mb-6"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center flex-shrink-0">
                  {agentPhoto ? (
                    <img src={agentPhoto} alt={agentName} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-xl font-bold text-violet-600">{agentName.charAt(0)}</span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Your Travel Expert</p>
                  <p className="font-bold text-gray-900">{agentName}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    "I'll be here if you need anything before your trip."
                  </p>
                </div>
              </div>
              {(agentEmail || agentPhone) && (
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                  {agentEmail && (
                    <a href={`mailto:${agentEmail}`} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-50 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                      <Mail className="w-4 h-4" />
                      Email
                    </a>
                  )}
                  {agentPhone && (
                    <a href={`tel:${agentPhone}`} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-50 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                      <Phone className="w-4 h-4" />
                      Call
                    </a>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══ CALM NEXT ACTIONS (No pressure) ═══ */}
        <AnimatePresence>
          {showTimeline && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-3 gap-3"
            >
              {onViewTrip && (
                <button
                  onClick={onViewTrip}
                  className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all text-center"
                >
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                  <span className="text-xs font-medium text-gray-600">View Trip</span>
                </button>
              )}
              {onDownloadReceipt && (
                <button
                  onClick={onDownloadReceipt}
                  className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all text-center"
                >
                  <Download className="w-5 h-5 text-gray-400" />
                  <span className="text-xs font-medium text-gray-600">Receipt</span>
                </button>
              )}
              {onAddToCalendar && (
                <button
                  onClick={onAddToCalendar}
                  className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all text-center"
                >
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span className="text-xs font-medium text-gray-600">Calendar</span>
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="text-center text-xs text-gray-400 mt-10"
        >
          Thank you for choosing Fly2Any. Have an amazing trip!
        </motion.p>
      </div>
    </div>
  );
}
