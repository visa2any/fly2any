"use client";

import { Shield, Lock, CreditCard, Headphones, BadgeCheck, Building } from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIDENCE LAYER - Subtle trust signals, calm and reassuring
// ═══════════════════════════════════════════════════════════════════════════════

const TRUST_SIGNALS = [
  {
    icon: Lock,
    text: "Secure payment",
    detail: "PCI DSS compliant",
  },
  {
    icon: Building,
    text: "Trusted US-based platform",
    detail: "Licensed travel agency",
  },
  {
    icon: Headphones,
    text: "Your travel expert is available",
    detail: "Dedicated support",
  },
  {
    icon: BadgeCheck,
    text: "Transparent pricing",
    detail: "No hidden fees",
  },
];

interface ConfidenceLayerProps {
  variant?: "inline" | "grid" | "compact";
  agentName?: string;
}

export default function ConfidenceLayer({ variant = "inline", agentName }: ConfidenceLayerProps) {
  const signals = agentName
    ? TRUST_SIGNALS.map((s) =>
        s.icon === Headphones ? { ...s, text: `${agentName} is available if needed` } : s
      )
    : TRUST_SIGNALS;

  if (variant === "compact") {
    return (
      <div className="flex items-center justify-center gap-4 py-3 px-4 bg-gray-50 rounded-xl">
        {[Lock, Shield, BadgeCheck].map((Icon, i) => (
          <div key={i} className="flex items-center gap-1.5 text-gray-500">
            <Icon className="w-3.5 h-3.5" />
            <span className="text-[10px] font-medium">
              {i === 0 ? "Secure" : i === 1 ? "Protected" : "Verified"}
            </span>
          </div>
        ))}
      </div>
    );
  }

  if (variant === "grid") {
    return (
      <div className="grid grid-cols-2 gap-3">
        {signals.map(({ icon: Icon, text, detail }) => (
          <div
            key={text}
            className="flex items-start gap-2.5 p-3 bg-white rounded-xl border border-gray-100"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
              <Icon className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-900">{text}</p>
              <p className="text-[10px] text-gray-500">{detail}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Default: inline
  return (
    <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-100">
      <div className="space-y-2">
        {signals.map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
              <Icon className="w-3 h-3 text-emerald-600" />
            </div>
            <span className="text-sm text-gray-700">{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Security badges for payment section
export function SecurityBadges() {
  return (
    <div className="flex items-center justify-center gap-3 py-2">
      <div className="flex items-center gap-1 text-gray-400">
        <Lock className="w-3 h-3" />
        <span className="text-[10px] font-medium">SSL Encrypted</span>
      </div>
      <div className="w-px h-3 bg-gray-200" />
      <div className="flex items-center gap-1 text-gray-400">
        <Shield className="w-3 h-3" />
        <span className="text-[10px] font-medium">PCI Compliant</span>
      </div>
      <div className="w-px h-3 bg-gray-200" />
      <div className="flex items-center gap-1 text-gray-400">
        <CreditCard className="w-3 h-3" />
        <span className="text-[10px] font-medium">Secure Payment</span>
      </div>
    </div>
  );
}
