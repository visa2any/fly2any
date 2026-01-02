"use client";

import { motion } from "framer-motion";
import { Shield, Users, RefreshCw, CheckCircle, Heart, Phone } from "lucide-react";
import { finalReassurance, usTrustSignals } from "./USConversionCopy";

interface FinalReassuranceProps {
  variant?: "compact" | "full";
  agentName?: string;
  agentPhone?: string;
}

/**
 * FINAL REASSURANCE - US Conversion Psychology
 * The critical "We've got you" moment before payment
 * Builds trust without pressure
 */
export default function FinalReassurance({
  variant = "full",
  agentName,
  agentPhone,
}: FinalReassuranceProps) {
  const iconMap = {
    Shield: Shield,
    Users: Users,
    RefreshCw: RefreshCw,
    CheckCircle: CheckCircle,
  };

  if (variant === "compact") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-xl p-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">
              {finalReassurance.weGotYou.medium}
            </p>
            <p className="text-xs text-gray-600 mt-0.5">
              Your trip is in expert hands.
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-5 text-center text-white">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-3"
        >
          <Heart className="w-7 h-7" />
        </motion.div>
        <h3 className="text-xl font-bold">{finalReassurance.prePayment.headline}</h3>
        <p className="text-sm text-white/80 mt-1">{finalReassurance.prePayment.subline}</p>
      </div>

      {/* Trust Points */}
      <div className="p-5 space-y-3">
        {finalReassurance.prePayment.points.map((point, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * i }}
            className="flex items-start gap-3"
          >
            <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-sm text-gray-700">{point}</p>
          </motion.div>
        ))}
      </div>

      {/* Trust Seals */}
      <div className="px-5 pb-5">
        <div className="grid grid-cols-4 gap-2">
          {finalReassurance.trustSeals.seals.map((seal, i) => {
            const Icon = iconMap[seal.icon as keyof typeof iconMap] || Shield;
            return (
              <div
                key={i}
                className="flex flex-col items-center gap-1 p-2 bg-gray-50 rounded-lg"
              >
                <Icon className="w-4 h-4 text-gray-500" />
                <span className="text-[9px] text-gray-500 text-center leading-tight">
                  {seal.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Human Touch - Agent Contact */}
      {agentName && (
        <div className="border-t border-gray-100 px-5 py-4 bg-gray-50/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">{usTrustSignals.humanPresence.headline}</p>
              <p className="text-sm font-medium text-gray-900">
                Questions? {agentName} is here to help.
              </p>
            </div>
            {agentPhone && (
              <a
                href={`tel:${agentPhone}`}
                className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>Call</span>
              </a>
            )}
          </div>
        </div>
      )}

      {/* Final Message */}
      <div className="p-5 bg-gradient-to-r from-emerald-50 to-teal-50 text-center">
        <p className="text-sm font-semibold text-emerald-700">
          {finalReassurance.weGotYou.full}
        </p>
      </div>
    </motion.div>
  );
}
