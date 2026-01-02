"use client";

import { motion } from "framer-motion";
import { MapPin, Calendar, Users, Plane, Building2, Car, Compass } from "lucide-react";
import type { CheckoutItem, TravelerInfo } from "./types";

// ═══════════════════════════════════════════════════════════════════════════════
// TRIP GLANCE - Mini journey summary to reinforce excitement
// Anchors emotional value
// ═══════════════════════════════════════════════════════════════════════════════

interface TripGlanceProps {
  destination: string;
  startDate: string;
  endDate: string;
  travelers: TravelerInfo;
  items: CheckoutItem[];
  variant?: "card" | "banner";
}

export default function TripGlance({
  destination,
  startDate,
  endDate,
  travelers,
  items,
  variant = "card",
}: TripGlanceProps) {
  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const totalTravelers = travelers.adults + travelers.children + travelers.infants;

  const highlights = [
    items.some((i) => i.type === "flight") && { icon: Plane, label: "Flights" },
    items.some((i) => i.type === "hotel") && { icon: Building2, label: "Hotel" },
    items.some((i) => i.type === "car") && { icon: Car, label: "Car" },
    items.some((i) => i.type === "activity") && { icon: Compass, label: "Activities" },
  ].filter(Boolean) as { icon: typeof Plane; label: string }[];

  if (variant === "banner") {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white"
      >
        <div className="flex items-center gap-3">
          <MapPin className="w-5 h-5" />
          <span className="font-bold">{destination}</span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span>{formatDate(startDate)} – {formatDate(endDate)}</span>
          <span>{totalTravelers} travelers</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.9 }}
      className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-5"
    >
      <h3 className="text-xs font-medium text-blue-600 uppercase tracking-wider mb-3">
        Your Trip at a Glance
      </h3>

      {/* Destination */}
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="w-5 h-5 text-blue-600" />
        <span className="text-xl font-bold text-gray-900">{destination}</span>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2 p-2.5 bg-white/60 rounded-lg">
          <Calendar className="w-4 h-4 text-gray-500" />
          <div>
            <p className="text-[10px] text-gray-500">Dates</p>
            <p className="text-xs font-semibold text-gray-900">
              {formatDate(startDate)} – {formatDate(endDate)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2.5 bg-white/60 rounded-lg">
          <Users className="w-4 h-4 text-gray-500" />
          <div>
            <p className="text-[10px] text-gray-500">Travelers</p>
            <p className="text-xs font-semibold text-gray-900">
              {travelers.adults} Adult{travelers.adults > 1 ? "s" : ""}
              {travelers.children > 0 && `, ${travelers.children} Child${travelers.children > 1 ? "ren" : ""}`}
            </p>
          </div>
        </div>
      </div>

      {/* Highlights */}
      {highlights.length > 0 && (
        <div className="flex gap-2 mt-4 pt-4 border-t border-blue-100">
          {highlights.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/80 rounded-lg"
            >
              <Icon className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-xs font-medium text-gray-700">{label}</span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
