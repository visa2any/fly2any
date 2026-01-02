"use client";

import { AlertCircle, CheckCircle, Clock, XCircle, Info } from "lucide-react";
import type { CheckoutItem, RefundPolicy } from "./types";

// ═══════════════════════════════════════════════════════════════════════════════
// POLICY TRANSPARENCY - Plain English, no legal jargon
// ═══════════════════════════════════════════════════════════════════════════════

const POLICY_CONFIG: Record<RefundPolicy["type"], {
  icon: typeof CheckCircle;
  color: string;
  bgColor: string;
  label: string;
}> = {
  refundable: {
    icon: CheckCircle,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    label: "Fully refundable",
  },
  "non-refundable": {
    icon: XCircle,
    color: "text-gray-500",
    bgColor: "bg-gray-50",
    label: "Non-refundable",
  },
  partial: {
    icon: AlertCircle,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    label: "Partial refund available",
  },
  conditional: {
    icon: Clock,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    label: "Conditional cancellation",
  },
};

interface PolicyTransparencyProps {
  items: CheckoutItem[];
  variant?: "full" | "summary";
}

export default function PolicyTransparency({ items, variant = "full" }: PolicyTransparencyProps) {
  const formatDeadline = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  if (variant === "summary") {
    const hasNonRefundable = items.some((i) => i.refundPolicy.type === "non-refundable");
    const hasFullyRefundable = items.every((i) => i.refundPolicy.type === "refundable");

    return (
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
        hasFullyRefundable ? "bg-emerald-50" : hasNonRefundable ? "bg-amber-50" : "bg-blue-50"
      }`}>
        <Info className={`w-4 h-4 ${
          hasFullyRefundable ? "text-emerald-600" : hasNonRefundable ? "text-amber-600" : "text-blue-600"
        }`} />
        <span className="text-xs text-gray-700">
          {hasFullyRefundable
            ? "All items are fully refundable"
            : hasNonRefundable
            ? "This booking includes non-refundable items"
            : "Some items have cancellation deadlines"}
        </span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="text-sm font-bold text-gray-900">Cancellation Policies</h3>
        <p className="text-xs text-gray-500 mt-0.5">Review before you pay</p>
      </div>

      <div className="divide-y divide-gray-50">
        {items.map((item) => {
          const config = POLICY_CONFIG[item.refundPolicy.type];
          const Icon = config.icon;

          return (
            <div key={item.id} className="px-4 py-3 flex items-start gap-3">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${config.bgColor}`}>
                <Icon className={`w-3.5 h-3.5 ${config.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900 truncate">{item.title}</span>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${config.bgColor} ${config.color}`}>
                    {config.label}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-0.5">
                  {item.refundPolicy.description}
                  {item.refundPolicy.deadline && (
                    <span className="font-medium"> until {formatDeadline(item.refundPolicy.deadline)}</span>
                  )}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Inline policy badge for individual items
export function PolicyBadge({ policy }: { policy: RefundPolicy }) {
  const config = POLICY_CONFIG[policy.type];
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${config.bgColor}`}>
      <Icon className={`w-3 h-3 ${config.color}`} />
      <span className={`text-[10px] font-medium ${config.color}`}>{config.label}</span>
    </div>
  );
}
