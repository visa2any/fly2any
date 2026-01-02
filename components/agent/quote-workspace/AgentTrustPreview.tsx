"use client";

import { Shield, Eye, CheckCircle2, Clock, Headphones, Award, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

// ═══════════════════════════════════════════════════════════════════════════════
// AGENT TRUST PREVIEW - Shows what trust signals client will see
// ═══════════════════════════════════════════════════════════════════════════════

const TRUST_PILLARS = [
  { icon: Shield, label: "Booking Confidence", desc: "Secure payment & confirmation" },
  { icon: Clock, label: "Flexibility", desc: "Free changes up to 48h before" },
  { icon: Headphones, label: "24/7 Support", desc: "Always here when you need us" },
];

const CREDENTIALS = [
  "IATA Accredited",
  "ASTA Member",
  "BBB A+ Rating",
  "SSL Secured",
];

export default function AgentTrustPreview() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100 overflow-hidden">
      {/* Header - Always Visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center">
            <Eye className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-left">
            <p className="text-xs font-semibold text-gray-700">Client Trust Signals</p>
            <p className="text-[10px] text-gray-400">What your client will see</p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>

      {/* Expandable Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-gray-100"
          >
            <div className="p-3 space-y-3">
              {/* Trust Pillars */}
              <div className="space-y-2">
                {TRUST_PILLARS.map(({ icon: Icon, label, desc }) => (
                  <div key={label} className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-100">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold text-gray-700">{label}</p>
                      <p className="text-[9px] text-gray-400 truncate">{desc}</p>
                    </div>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 ml-auto" />
                  </div>
                ))}
              </div>

              {/* Credentials */}
              <div className="flex flex-wrap gap-1">
                {CREDENTIALS.map((cred) => (
                  <span
                    key={cred}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-[9px] font-medium"
                  >
                    <Award className="w-2.5 h-2.5" />
                    {cred}
                  </span>
                ))}
              </div>

              {/* Agent Signature Preview */}
              <div className="p-2 bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg">
                <p className="text-[9px] text-gray-400 mb-1">Your signature will appear:</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold">
                    TA
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">Travel Advisor</p>
                    <p className="text-[9px] text-gray-400">Senior Travel Consultant</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Compact inline badge version
export function TrustPreviewBadge() {
  return (
    <div className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 rounded-full">
      <Shield className="w-3 h-3 text-emerald-600" />
      <span className="text-[9px] font-medium text-emerald-700">Trust signals active</span>
    </div>
  );
}
