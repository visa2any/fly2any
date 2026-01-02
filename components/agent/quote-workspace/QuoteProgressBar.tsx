"use client";

import { motion } from "framer-motion";
import { Check, AlertCircle, MapPin, Calendar, Users, Plane, Building2, CreditCard, User } from "lucide-react";
import { useQuoteWorkspace } from "./QuoteWorkspaceProvider";

// ═══════════════════════════════════════════════════════════════════════════════
// QUOTE PROGRESS BAR - Shows quote completeness at a glance
// ═══════════════════════════════════════════════════════════════════════════════

interface ProgressStep {
  key: string;
  label: string;
  icon: typeof Check;
  check: (state: any) => boolean;
}

const PROGRESS_STEPS: ProgressStep[] = [
  { key: "dest", label: "Destination", icon: MapPin, check: (s) => !!s.destination },
  { key: "dates", label: "Dates", icon: Calendar, check: (s) => !!s.startDate && !!s.endDate },
  { key: "travelers", label: "Travelers", icon: Users, check: (s) => s.travelers?.total > 0 },
  { key: "flight", label: "Flight", icon: Plane, check: (s) => s.items?.some((i: any) => i.type === "flight") },
  { key: "hotel", label: "Hotel", icon: Building2, check: (s) => s.items?.some((i: any) => i.type === "hotel") },
  { key: "pricing", label: "Pricing", icon: CreditCard, check: (s) => s.pricing?.markupPercent > 0 },
  { key: "client", label: "Client", icon: User, check: (s) => !!s.client },
];

export default function QuoteProgressBar({ variant = "full" }: { variant?: "full" | "compact" }) {
  const { state } = useQuoteWorkspace();

  const completedSteps = PROGRESS_STEPS.filter(step => step.check(state));
  const progress = Math.round((completedSteps.length / PROGRESS_STEPS.length) * 100);
  const isComplete = progress === 100;

  if (variant === "compact") {
    return (
      <div className="flex items-center gap-2">
        <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className={`h-full rounded-full ${isComplete ? "bg-emerald-500" : "bg-primary-500"}`}
          />
        </div>
        <span className={`text-[10px] font-bold ${isComplete ? "text-emerald-600" : "text-gray-500"}`}>
          {progress}%
        </span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
      {/* Progress Bar */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-600">Quote Progress</span>
        <span className={`text-xs font-bold ${isComplete ? "text-emerald-600" : "text-gray-500"}`}>
          {progress}% Complete
        </span>
      </div>

      <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className={`h-full rounded-full ${isComplete ? "bg-gradient-to-r from-emerald-400 to-emerald-500" : "bg-gradient-to-r from-primary-400 to-primary-500"}`}
        />
      </div>

      {/* Step Indicators */}
      <div className="flex justify-between">
        {PROGRESS_STEPS.map((step) => {
          const isChecked = step.check(state);
          const Icon = step.icon;
          return (
            <div key={step.key} className="flex flex-col items-center gap-1 group">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                isChecked
                  ? "bg-emerald-100 text-emerald-600"
                  : "bg-gray-100 text-gray-400"
              }`}>
                {isChecked ? <Check className="w-3 h-3" /> : <Icon className="w-3 h-3" />}
              </div>
              <span className={`text-[8px] font-medium ${isChecked ? "text-emerald-600" : "text-gray-400"}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Missing Items Alert */}
      {!isComplete && (
        <div className="mt-3 flex items-center gap-1.5 text-[10px] text-amber-600 bg-amber-50 px-2 py-1.5 rounded-lg">
          <AlertCircle className="w-3 h-3" />
          <span>Missing: {PROGRESS_STEPS.filter(s => !s.check(state)).map(s => s.label).join(", ")}</span>
        </div>
      )}
    </div>
  );
}

export function QuoteProgressBadge() {
  const { state } = useQuoteWorkspace();
  const completedSteps = PROGRESS_STEPS.filter(step => step.check(state));
  const progress = Math.round((completedSteps.length / PROGRESS_STEPS.length) * 100);

  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold ${
      progress === 100
        ? "bg-emerald-100 text-emerald-700"
        : progress >= 70
          ? "bg-blue-100 text-blue-700"
          : "bg-amber-100 text-amber-700"
    }`}>
      {progress === 100 ? <Check className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
      {progress}%
    </div>
  );
}
