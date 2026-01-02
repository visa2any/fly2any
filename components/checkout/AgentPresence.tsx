"use client";

import { motion } from "framer-motion";
import { Mail, MessageCircle, Phone, User } from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════════
// AGENT PRESENCE - Human connection, builds trust beyond automation
// "I'll be here if you need anything before your trip."
// ═══════════════════════════════════════════════════════════════════════════════

interface AgentPresenceProps {
  name: string;
  email?: string;
  phone?: string;
  photoUrl?: string;
  message?: string;
  variant?: "card" | "inline" | "minimal";
}

export default function AgentPresence({
  name,
  email,
  phone,
  photoUrl,
  message = "I'll be here if you need anything before your trip.",
  variant = "card",
}: AgentPresenceProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (variant === "minimal") {
    return (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
          {photoUrl ? (
            <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-xs font-bold text-gray-600">{initials}</span>
          )}
        </div>
        <div>
          <p className="text-xs font-medium text-gray-900">{name}</p>
          <p className="text-[10px] text-gray-500">Your Travel Expert</p>
        </div>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
          {photoUrl ? (
            <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-sm font-bold text-gray-600">{initials}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">{name}</p>
          <p className="text-xs text-gray-500">Your Travel Expert</p>
        </div>
        {email && (
          <a
            href={`mailto:${email}`}
            className="p-2 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
          >
            <Mail className="w-4 h-4 text-gray-600" />
          </a>
        )}
      </div>
    );
  }

  // Full card variant
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
      className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5 text-white"
    >
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
        Your Travel Expert
      </p>

      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-xl bg-gray-700 flex items-center justify-center overflow-hidden shadow-lg">
          {photoUrl ? (
            <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
          ) : (
            <User className="w-8 h-8 text-gray-400" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1">
          <h4 className="text-lg font-bold">{name}</h4>
          <p className="text-sm text-gray-300 mt-1">{message}</p>

          {/* Contact buttons */}
          <div className="flex gap-2 mt-4">
            {email && (
              <a
                href={`mailto:${email}`}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">Email</span>
              </a>
            )}
            {phone && (
              <a
                href={`tel:${phone}`}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">Call</span>
              </a>
            )}
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">Message</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
