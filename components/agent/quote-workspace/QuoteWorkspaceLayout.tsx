"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

interface QuoteWorkspaceLayoutProps {
  header: ReactNode;
  discovery: ReactNode;
  itinerary: ReactNode;
  pricing: ReactNode;
  footer: ReactNode;
  overlays?: ReactNode;
}

export default function QuoteWorkspaceLayout({
  header,
  discovery,
  itinerary,
  pricing,
  footer,
  overlays,
}: QuoteWorkspaceLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm"
      >
        {header}
      </motion.header>

      {/* Main 3-Column Layout */}
      <main className="flex-1 overflow-hidden">
        <div className="h-full grid grid-cols-1 lg:grid-cols-[340px_1fr_320px] xl:grid-cols-[380px_1fr_340px]">
          {/* Left: Discovery Zone */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="hidden lg:flex flex-col bg-white border-r border-gray-200 overflow-hidden"
          >
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
              {discovery}
            </div>
          </motion.aside>

          {/* Center: Itinerary Zone */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex flex-col overflow-hidden bg-gradient-to-b from-gray-50 to-white"
          >
            <div className="flex-1 overflow-y-auto px-4 lg:px-6 py-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
              {itinerary}
            </div>
          </motion.section>

          {/* Right: Pricing Zone */}
          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="hidden lg:flex flex-col bg-white border-l border-gray-200 overflow-hidden"
          >
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
              {pricing}
            </div>
          </motion.aside>
        </div>
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="sticky bottom-0 z-40 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]"
      >
        {footer}
      </motion.footer>

      {/* Overlays (modals, previews) */}
      {overlays}
    </div>
  );
}
