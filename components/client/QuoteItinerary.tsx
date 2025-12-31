'use client';

// components/client/QuoteItinerary.tsx
// Level 6 Ultra-Premium What's Included Section
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plane, Building2, Ticket, Car, ShieldCheck, Plus,
  ChevronDown, FileText, Bus
} from 'lucide-react';

interface QuoteItineraryProps {
  quote: {
    flights: any;
    hotels: any;
    activities: any;
    transfers: any;
    carRentals: any;
    insurance: any;
    customItems: any;
  };
}

export default function QuoteItinerary({ quote }: QuoteItineraryProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const toggleSection = (title: string) => {
    setExpandedSections(prev =>
      prev.includes(title) ? prev.filter(s => s !== title) : [...prev, title]
    );
  };

  const components = [
    {
      title: 'Flights',
      icon: Plane,
      data: quote.flights,
      color: 'from-blue-500 to-blue-600',
      bgLight: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      title: 'Hotels',
      icon: Building2,
      data: quote.hotels,
      color: 'from-purple-500 to-purple-600',
      bgLight: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      title: 'Activities',
      icon: Ticket,
      data: quote.activities,
      color: 'from-emerald-500 to-emerald-600',
      bgLight: 'bg-emerald-50',
      textColor: 'text-emerald-600',
    },
    {
      title: 'Transfers',
      icon: Bus,
      data: quote.transfers,
      color: 'from-amber-500 to-amber-600',
      bgLight: 'bg-amber-50',
      textColor: 'text-amber-600',
    },
    {
      title: 'Car Rentals',
      icon: Car,
      data: quote.carRentals,
      color: 'from-orange-500 to-orange-600',
      bgLight: 'bg-orange-50',
      textColor: 'text-orange-600',
    },
    {
      title: 'Travel Insurance',
      icon: ShieldCheck,
      data: quote.insurance,
      color: 'from-indigo-500 to-indigo-600',
      bgLight: 'bg-indigo-50',
      textColor: 'text-indigo-600',
    },
    {
      title: 'Additional Items',
      icon: Plus,
      data: quote.customItems,
      color: 'from-gray-500 to-gray-600',
      bgLight: 'bg-gray-50',
      textColor: 'text-gray-600',
    },
  ];

  const hasItems = components.some(
    comp =>
      comp.data &&
      (Array.isArray(comp.data) ? comp.data.length > 0 : Object.keys(comp.data).length > 0)
  );

  if (!hasItems) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.05),0_4px_12px_rgba(0,0,0,0.03)] border border-gray-100 p-8 lg:p-12 text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-600">Itinerary details will be added shortly</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.05),0_4px_12px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden"
    >
      <div className="p-6 lg:p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">What's Included</h2>

        <div className="space-y-4">
          {components.map((component, idx) => {
            const hasData =
              component.data &&
              (Array.isArray(component.data)
                ? component.data.length > 0
                : Object.keys(component.data).length > 0);

            if (!hasData) return null;

            const Icon = component.icon;
            const isExpanded = expandedSections.includes(component.title);

            return (
              <motion.div
                key={component.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + idx * 0.05 }}
                className="border border-gray-100 rounded-xl overflow-hidden"
              >
                {/* Header */}
                <button
                  onClick={() => toggleSection(component.title)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-11 h-11 rounded-xl bg-gradient-to-br ${component.color} flex items-center justify-center shadow-sm`}
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900">{component.title}</h3>
                      <p className="text-sm text-gray-500">
                        {Array.isArray(component.data)
                          ? `${component.data.length} item${component.data.length !== 1 ? 's' : ''}`
                          : '1 item'}
                      </p>
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4">
                        <div className="ml-15 space-y-3 pt-2 border-t border-gray-100">
                          {Array.isArray(component.data) ? (
                            component.data.map((item: any, index: number) => (
                              <div
                                key={index}
                                className={`${component.bgLight} rounded-xl p-4 mt-3`}
                              >
                                {item.name && (
                                  <p className={`font-medium ${component.textColor}`}>
                                    {item.name}
                                  </p>
                                )}
                                {item.description && (
                                  <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                                )}
                                {item.details && (
                                  <div className="mt-3 pt-3 border-t border-gray-200/50 space-y-1">
                                    {Object.entries(item.details).map(
                                      ([key, value]: [string, any]) => (
                                        <p key={key} className="text-xs text-gray-500">
                                          <span className="font-medium capitalize">
                                            {key.replace(/_/g, ' ')}:
                                          </span>{' '}
                                          {typeof value === 'object'
                                            ? JSON.stringify(value)
                                            : String(value)}
                                        </p>
                                      )
                                    )}
                                  </div>
                                )}
                              </div>
                            ))
                          ) : (
                            <div className={`${component.bgLight} rounded-xl p-4 mt-3`}>
                              {typeof component.data === 'object' && (
                                <div className="space-y-2">
                                  {Object.entries(component.data).map(
                                    ([key, value]: [string, any]) => {
                                      if (typeof value === 'object' && value !== null) {
                                        return (
                                          <div key={key} className="mb-3">
                                            <p
                                              className={`font-medium ${component.textColor} capitalize mb-1`}
                                            >
                                              {key.replace(/_/g, ' ')}
                                            </p>
                                            <div className="ml-3 space-y-1">
                                              {Object.entries(value).map(
                                                ([subKey, subValue]: [string, any]) => (
                                                  <p key={subKey} className="text-sm text-gray-600">
                                                    <span className="font-medium capitalize">
                                                      {subKey.replace(/_/g, ' ')}:
                                                    </span>{' '}
                                                    {String(subValue)}
                                                  </p>
                                                )
                                              )}
                                            </div>
                                          </div>
                                        );
                                      }
                                      return (
                                        <p key={key} className="text-sm text-gray-600">
                                          <span className="font-medium capitalize">
                                            {key.replace(/_/g, ' ')}:
                                          </span>{' '}
                                          {String(value)}
                                        </p>
                                      );
                                    }
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
