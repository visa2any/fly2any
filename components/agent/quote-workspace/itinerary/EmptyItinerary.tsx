"use client";

import { motion } from "framer-motion";
import { Plane, Building2, Compass, ArrowRight } from "lucide-react";
import { useQuoteWorkspace } from "../QuoteWorkspaceProvider";

export default function EmptyItinerary() {
  const { setActiveTab } = useQuoteWorkspace();

  const quickActions = [
    { icon: Plane, label: "Search Flights", tab: "flight" as const, gradient: "from-blue-500 to-indigo-600" },
    { icon: Building2, label: "Search Hotels", tab: "hotel" as const, gradient: "from-purple-500 to-pink-600" },
    { icon: Compass, label: "Find Activities", tab: "activity" as const, gradient: "from-emerald-500 to-teal-600" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center h-full min-h-[400px] text-center px-6"
    >
      {/* Icon cluster */}
      <div className="relative w-32 h-32 mb-6">
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          className="absolute top-0 left-2 w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30"
        >
          <Plane className="w-7 h-7 text-white" />
        </motion.div>
        <motion.div
          initial={{ scale: 0, rotate: 10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="absolute top-4 right-2 w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30"
        >
          <Building2 className="w-7 h-7 text-white" />
        </motion.div>
        <motion.div
          initial={{ scale: 0, rotate: -5 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30"
        >
          <Compass className="w-7 h-7 text-white" />
        </motion.div>
      </div>

      <h3 className="text-xl font-bold text-gray-900 mb-2">Start Building Your Quote</h3>
      <p className="text-gray-500 mb-8 max-w-sm">
        Search for flights, hotels, and activities in the panel on the left. Click to add them to your itinerary.
      </p>

      {/* Quick action buttons */}
      <div className="flex flex-wrap justify-center gap-3">
        {quickActions.map(({ icon: Icon, label, tab, gradient }) => (
          <motion.button
            key={tab}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r ${gradient} text-white rounded-xl font-medium shadow-lg transition-shadow hover:shadow-xl`}
          >
            <Icon className="w-4 h-4" />
            {label}
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        ))}
      </div>

      {/* Hint */}
      <p className="mt-8 text-xs text-gray-400 flex items-center gap-1">
        <span className="inline-block w-1.5 h-1.5 bg-primary-500 rounded-full animate-pulse" />
        Live prices from Amadeus, Duffel & more
      </p>
    </motion.div>
  );
}
