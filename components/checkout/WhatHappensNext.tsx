"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Mail, Ticket, Headphones, ArrowRight } from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════════
// WHAT HAPPENS NEXT - Critical for reducing post-payment anxiety
// ═══════════════════════════════════════════════════════════════════════════════

const STEPS = [
  {
    number: "1",
    icon: CheckCircle2,
    title: "We confirm availability",
    description: "Within minutes of your payment",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    number: "2",
    icon: Mail,
    title: "You receive confirmation email",
    description: "With complete booking details",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    number: "3",
    icon: Ticket,
    title: "Tickets & vouchers are issued",
    description: "Ready for your trip",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
  },
  {
    number: "4",
    icon: Headphones,
    title: "Your agent remains available",
    description: "For any questions or changes",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
];

interface WhatHappensNextProps {
  agentName?: string;
  variant?: "full" | "compact";
}

export default function WhatHappensNext({ agentName, variant = "full" }: WhatHappensNextProps) {
  const steps = agentName
    ? STEPS.map((s) =>
        s.icon === Headphones ? { ...s, title: `${agentName} remains available` } : s
      )
    : STEPS;

  if (variant === "compact") {
    return (
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl">
        {steps.slice(0, 3).map((step, i) => (
          <div key={step.number} className="flex items-center">
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full ${step.bgColor} flex items-center justify-center`}>
                <step.icon className={`w-3.5 h-3.5 ${step.color}`} />
              </div>
              <span className="text-xs text-gray-600 hidden sm:block">{step.title.split(" ").slice(0, 2).join(" ")}</span>
            </div>
            {i < 2 && <ArrowRight className="w-4 h-4 text-gray-300 mx-2" />}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="text-sm font-bold text-gray-900">What happens after payment?</h3>
      </div>

      <div className="p-4 space-y-4">
        {steps.map((step, index) => (
          <motion.div
            key={step.number}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-start gap-3"
          >
            {/* Step number with connector line */}
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full ${step.bgColor} flex items-center justify-center`}>
                <span className={`text-sm font-bold ${step.color}`}>{step.number}</span>
              </div>
              {index < steps.length - 1 && (
                <div className="w-0.5 h-6 bg-gray-100 mt-1" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pb-2">
              <div className="flex items-center gap-2">
                <step.icon className={`w-4 h-4 ${step.color}`} />
                <span className="text-sm font-semibold text-gray-900">{step.title}</span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5 ml-6">{step.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
