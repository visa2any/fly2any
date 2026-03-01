"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, User, Calendar, LayoutList } from "lucide-react";
import { useQuoteWorkspace, useQuoteItems } from "../QuoteWorkspaceProvider";
import EmptyItinerary from "./EmptyItinerary";
import ItineraryTimeline from "./ItineraryTimeline";
import Client360View from "./Client360View";
import ReservationsView from "./ReservationsView";
import AllQuotesView from "./AllQuotesView";

type TabType = 'quote' | 'all-quotes' | 'client' | 'reservations';

export default function ItineraryZone() {
  const items = useQuoteItems();
  const { state } = useQuoteWorkspace();
  const isEmpty = items.length === 0;
  const [activeTab, setActiveTab] = useState<TabType>('quote');
  const hasClient = !!state.client;

  const tabs = [
    { id: 'quote' as TabType,        label: 'Current Quote', icon: FileText,   count: items.length || null },
    { id: 'all-quotes' as TabType,   label: 'All Quotes',    icon: LayoutList,  count: null },
    { id: 'client' as TabType,       label: 'Client 360',    icon: User,        count: null },
    { id: 'reservations' as TabType, label: 'Reservations',  icon: Calendar,    count: null },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Horizontal Tab Bar */}
      <div className="flex items-center border-b border-gray-200 bg-white overflow-x-auto scrollbar-none flex-shrink-0">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                isActive
                  ? 'text-primary-600'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== null && tab.count > 0 && (
                <span className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold rounded-full ${
                  isActive ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              )}
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
      <div className="flex-1 overflow-y-auto min-h-0">
        {activeTab === 'quote' && (
          isEmpty ? <EmptyItinerary /> : <ItineraryTimeline />
        )}
        {activeTab === 'all-quotes' && <AllQuotesView />}
        {activeTab === 'client' && (
          <div className="px-6 py-4">
            <Client360View />
          </div>
        )}
        {activeTab === 'reservations' && (
          <div className="px-6 py-4">
            <ReservationsView />
          </div>
        )}
      </div>
    </div>
  );
}
