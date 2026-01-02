"use client";

import { motion } from "framer-motion";
import { MessageCircle, Phone, Mail, User, Sparkles } from "lucide-react";
import { getAgentSignature } from "./EmotionalCopySystem";
import type { ToneProfile } from "../itinerary/ToneSystem";

interface AgentSignatureProps {
  agentName: string;
  agentTitle?: string;
  agentPhoto?: string;
  agentEmail?: string;
  agentPhone?: string;
  tone: ToneProfile;
  variant?: "full" | "compact";
}

export default function AgentSignature({
  agentName,
  agentTitle = "Travel Advisor",
  agentPhoto,
  agentEmail,
  agentPhone,
  tone,
  variant = "full",
}: AgentSignatureProps) {
  const signature = getAgentSignature(tone, agentName);

  if (variant === "compact") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex items-center gap-3 bg-gradient-to-r from-gray-50 to-white rounded-xl p-3 border border-gray-100"
      >
        {/* Agent Photo */}
        <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center flex-shrink-0">
          {agentPhoto ? (
            <img src={agentPhoto} alt={agentName} className="w-full h-full object-cover" />
          ) : (
            <User className="w-5 h-5 text-white" />
          )}
        </div>

        {/* Agent Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{agentName}</p>
          <p className="text-xs text-gray-500">{agentTitle}</p>
        </div>

        {/* Quick Contact */}
        <div className="flex items-center gap-2">
          {agentEmail && (
            <a
              href={`mailto:${agentEmail}`}
              className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-primary-100 flex items-center justify-center transition-colors"
            >
              <Mail className="w-4 h-4 text-gray-600 hover:text-primary-600" />
            </a>
          )}
          {agentPhone && (
            <a
              href={`tel:${agentPhone}`}
              className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-emerald-100 flex items-center justify-center transition-colors"
            >
              <Phone className="w-4 h-4 text-gray-600 hover:text-emerald-600" />
            </a>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white relative overflow-hidden"
    >
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-500/20 to-transparent rounded-full blur-2xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-500/20 to-transparent rounded-full blur-2xl" />

      <div className="relative">
        {/* Greeting */}
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-yellow-400" />
          <p className="text-sm text-gray-300">{signature.greeting}</p>
        </div>

        <div className="flex items-start gap-4">
          {/* Agent Photo */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
            className="w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center flex-shrink-0 ring-2 ring-white/20"
          >
            {agentPhoto ? (
              <img src={agentPhoto} alt={agentName} className="w-full h-full object-cover" />
            ) : (
              <User className="w-8 h-8 text-white" />
            )}
          </motion.div>

          {/* Agent Message */}
          <div className="flex-1 min-w-0">
            <div className="mb-2">
              <h4 className="font-bold text-white text-lg">{agentName}</h4>
              <p className="text-sm text-gray-400">{agentTitle}</p>
            </div>

            <p className="text-sm text-gray-300 leading-relaxed">
              {signature.message}
            </p>

            <p className="text-sm text-white font-medium mt-3 italic">
              {signature.signoff}
            </p>
          </div>
        </div>

        {/* Contact Options */}
        <div className="flex items-center gap-3 mt-5 pt-4 border-t border-white/10">
          {agentEmail && (
            <motion.a
              href={`mailto:${agentEmail}`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
            >
              <Mail className="w-4 h-4" />
              <span className="text-sm font-medium">Email Me</span>
            </motion.a>
          )}
          {agentPhone && (
            <motion.a
              href={`tel:${agentPhone}`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-xl transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span className="text-sm font-medium">Call Me</span>
            </motion.a>
          )}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-500/20 hover:bg-primary-500/30 text-primary-400 rounded-xl transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Message</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
