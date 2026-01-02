"use client";

import { motion } from "framer-motion";
import { Clock, Mail, Ticket, MessageCircle, CalendarCheck } from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════════
// POST-PAYMENT TIMELINE - Visual clarity, plain English, no jargon
// ═══════════════════════════════════════════════════════════════════════════════

const TIMELINE_STEPS = [
  {
    timing: "Within minutes",
    title: "Booking confirmation email",
    description: "With your receipt and booking reference",
    icon: Mail,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    timing: "Within 24 hours",
    title: "Tickets & vouchers issued",
    description: "Sent directly to your email",
    icon: Ticket,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
  },
  {
    timing: "7 days before",
    title: "Pre-trip check-in",
    description: "We'll confirm everything is ready",
    icon: CalendarCheck,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    timing: "Anytime",
    title: "Contact your travel expert",
    description: "For changes, questions, or assistance",
    icon: MessageCircle,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
];

interface PostPaymentTimelineProps {
  agentName?: string;
  variant?: "full" | "compact";
}

export default function PostPaymentTimeline({ agentName, variant = "full" }: PostPaymentTimelineProps) {
  const steps = agentName
    ? TIMELINE_STEPS.map((s) =>
        s.icon === MessageCircle ? { ...s, title: `Contact ${agentName}` } : s
      )
    : TIMELINE_STEPS;

  if (variant === "compact") {
    return (
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl overflow-x-auto">
        {steps.slice(0, 3).map((step, i) => (
          <div key={step.timing} className="flex items-center">
            <div className="flex flex-col items-center text-center min-w-[80px]">
              <div className={`w-8 h-8 rounded-full ${step.bgColor} flex items-center justify-center`}>
                <step.icon className={`w-4 h-4 ${step.color}`} />
              </div>
              <span className="text-[10px] text-gray-500 mt-1">{step.timing}</span>
            </div>
            {i < 2 && <div className="w-8 h-0.5 bg-gray-200 mx-1" />}
          </div>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="bg-white rounded-xl border border-gray-100 overflow-hidden"
    >
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="text-sm font-bold text-gray-900">What's next</h3>
      </div>

      <div className="p-4">
        {steps.map((step, index) => (
          <motion.div
            key={step.timing}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 + index * 0.1 }}
            className="flex gap-3"
          >
            {/* Timeline connector */}
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-xl ${step.bgColor} flex items-center justify-center`}>
                <step.icon className={`w-5 h-5 ${step.color}`} />
              </div>
              {index < steps.length - 1 && (
                <div className="w-0.5 h-8 bg-gray-100 my-1" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3 text-gray-400" />
                <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                  {step.timing}
                </span>
              </div>
              <p className="text-sm font-semibold text-gray-900 mt-0.5">{step.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{step.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
