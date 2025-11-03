'use client';

import { useState } from 'react';

interface FlexibleDatesSelectorProps {
  value: number; // Number of days flexibility (0-5)
  onChange: (days: number) => void;
  potentialSavings?: number; // Estimated savings in USD
  className?: string;
}

export function FlexibleDatesSelector({
  value,
  onChange,
  potentialSavings,
  className = '',
}: FlexibleDatesSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const options = [
    { value: 0, label: 'Exact dates', description: 'No flexibility' },
    { value: 1, label: '±1 day', description: '3 day window' },
    { value: 2, label: '±2 days', description: '5 day window' },
    { value: 3, label: '±3 days', description: '7 day window' },
    { value: 4, label: '±4 days', description: '9 day window' },
    { value: 5, label: '±5 days', description: '11 day window' },
  ];

  const selectedOption = options.find(opt => opt.value === value) || options[0];

  return (
    <div className={`relative ${className}`}>
      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-xl border-2 border-blue-200 transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-white rounded-lg shadow-sm">
            <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="text-left">
            <div className="font-semibold text-gray-900 text-sm">
              {selectedOption.label}
            </div>
            <div className="text-xs text-gray-600">
              {potentialSavings && value > 0
                ? `Save up to $${potentialSavings.toFixed(0)}`
                : selectedOption.description
              }
            </div>
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown options */}
      {isExpanded && (
        <div className="absolute z-50 mt-2 w-full bg-white border-2 border-gray-200 rounded-2xl shadow-2xl p-2 max-h-80 overflow-y-auto">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsExpanded(false);
              }}
              className={`
                w-full flex items-center justify-between p-3 rounded-xl transition-all text-left
                ${value === option.value
                  ? 'bg-blue-100 border-2 border-blue-500'
                  : 'hover:bg-gray-50 border-2 border-transparent'
                }
              `}
            >
              <div className="flex-1">
                <div className="font-semibold text-gray-900 text-sm">
                  {option.label}
                </div>
                <div className="text-xs text-gray-600">
                  {option.description}
                </div>
              </div>
              {value === option.value && (
                <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}

          {/* Info message */}
          <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-2">
              <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <p className="text-xs text-blue-800 leading-relaxed">
                Flexible dates search multiple dates around your preferred departure to find the best prices.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
