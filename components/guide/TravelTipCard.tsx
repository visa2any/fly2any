'use client';

import { useState } from 'react';

interface TravelTip {
  id: string;
  destination: string;
  category: 'visa' | 'currency' | 'weather' | 'safety' | 'culture' | 'transport';
  title: string;
  description: string;
  icon: string;
  details?: string[];
  urgency?: 'low' | 'medium' | 'high';
}

interface TravelTipCardProps {
  tip: TravelTip;
  expanded?: boolean;
}

export default function TravelTipCard({ tip, expanded = false }: TravelTipCardProps) {
  const [isExpanded, setIsExpanded] = useState(expanded);

  const categoryConfig = {
    visa: { color: 'bg-blue-50 border-blue-200 text-blue-700', label: 'Visa & Entry' },
    currency: { color: 'bg-green-50 border-green-200 text-green-700', label: 'Currency' },
    weather: { color: 'bg-yellow-50 border-yellow-200 text-yellow-700', label: 'Weather' },
    safety: { color: 'bg-red-50 border-red-200 text-red-700', label: 'Safety' },
    culture: { color: 'bg-purple-50 border-purple-200 text-purple-700', label: 'Culture' },
    transport: { color: 'bg-indigo-50 border-indigo-200 text-indigo-700', label: 'Transport' },
  };

  const urgencyConfig = {
    low: { color: 'bg-gray-100 text-gray-700', label: 'Good to Know' },
    medium: { color: 'bg-yellow-100 text-yellow-800', label: 'Important' },
    high: { color: 'bg-red-100 text-red-800', label: 'Essential' },
  };

  const config = categoryConfig[tip.category];
  const urgency = tip.urgency ? urgencyConfig[tip.urgency] : null;

  return (
    <div className={`border-2 rounded-xl p-5 transition-all duration-300 ${config.color} ${
      isExpanded ? 'shadow-lg' : 'shadow-md hover:shadow-lg'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1">
          <div className="text-3xl">{tip.icon}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-white/50">
                {config.label}
              </span>
              {urgency && (
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${urgency.color}`}>
                  {urgency.label}
                </span>
              )}
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {tip.title}
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              {tip.description}
            </p>
          </div>
        </div>
        {tip.details && tip.details.length > 0 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-2 text-gray-600 hover:text-gray-900 transition-colors"
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            <svg
              className={`w-6 h-6 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>

      {/* Expandable Details */}
      {isExpanded && tip.details && tip.details.length > 0 && (
        <div className="mt-4 pt-4 border-t border-current border-opacity-20 animate-fadeIn">
          <ul className="space-y-2">
            {tip.details.map((detail, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-blue-600 mt-1">•</span>
                <span>{detail}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
