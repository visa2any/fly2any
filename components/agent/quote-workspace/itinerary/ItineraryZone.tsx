"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, User, Calendar } from "lucide-react";
import { useQuoteWorkspace, useQuoteItems } from "../QuoteWorkspaceProvider";
import EmptyItinerary from "./EmptyItinerary";
import ItineraryTimeline from "./ItineraryTimeline";
import Client360View from "./Client360View";
import ReservationsView from "./ReservationsView";

type TabType = 'quote' | 'client' | 'reservations';

export default function ItineraryZone() {
  const items = useQuoteItems();
  const isEmpty = items.length === 0;
  const [activeTab, setActiveTab] = useState<TabType>('quote');

  const tabs = [
    { id: 'quote' as TabType, label: 'Current Quote', icon: FileText },
    { id: 'client' as TabType, label: 'Client 360', icon: User },
    { id: 'reservations' as TabType, label: 'Reservations', icon: Calendar },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Horizontal Tab Bar - ONE ROW */}
      <div className="flex items-center border-b border-gray-200 bg-white px-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all ${
                isActive
                  ? 'text-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'quote' && (
          <motion.div
            key="quote"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {isEmpty ? <EmptyItinerary /> : <ItineraryTimeline />}
          </motion.div>
        )}
        {activeTab === 'client' && (
          <motion.div
            key="client"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            <Client360View />
          </motion.div>
        )}
        {activeTab === 'reservations' && (
          <motion.div
            key="reservations"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            <ReservationsView />
          </motion.div>
        )}
      </div>
    </div>
  );
}
