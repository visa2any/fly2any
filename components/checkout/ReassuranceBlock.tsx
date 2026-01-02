"use client";

import { motion } from "framer-motion";
import { CheckCircle, Lock, Mail, Headphones, FileText } from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════════
// REASSURANCE BLOCK - Prevents panic refreshes and support tickets
// Immediately calms post-payment anxiety
// ═══════════════════════════════════════════════════════════════════════════════

const REASSURANCES = [
  {
    icon: Lock,
    text: "Payment received securely",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
  },
  {
    icon: FileText,
    text: "Your booking is being finalized",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    icon: Mail,
    text: "You'll receive confirmation by email",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    icon: Headphones,
    text: "Your agent remains available",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
];

interface ReassuranceBlockProps {
  agentName?: string;
  variant?: "full" | "compact";
}

export default function ReassuranceBlock({ agentName, variant = "full" }: ReassuranceBlockProps) {
  const items = agentName
    ? REASSURANCES.map((r) =>
        r.icon === Headphones ? { ...r, text: `${agentName} is here if you need anything` } : r
      )
    : REASSURANCES;

  if (variant === "compact") {
    return (
      <div className="flex flex-wrap items-center justify-center gap-3 py-3">
        {items.slice(0, 3).map(({ icon: Icon, text, color }) => (
          <div key={text} className="flex items-center gap-1.5">
            <Icon className={`w-3.5 h-3.5 ${color}`} />
            <span className="text-xs text-gray-600">{text}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white rounded-xl border border-gray-100 p-4"
    >
      <div className="space-y-3">
        {items.map(({ icon: Icon, text, color, bgColor }, index) => (
          <motion.div
            key={text}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            className="flex items-center gap-3"
          >
            <div className={`w-8 h-8 rounded-lg ${bgColor} flex items-center justify-center`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <span className="text-sm text-gray-700">{text}</span>
            <CheckCircle className="w-4 h-4 text-emerald-500 ml-auto" />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
