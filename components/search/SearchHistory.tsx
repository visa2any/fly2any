'use client';

/**
 * SearchHistory Component
 * Team 1 - Enhanced Search & Filters
 *
 * Display and manage search history
 * Features:
 * - Last 10 searches with quick re-search
 * - Clear history button
 * - Store in localStorage
 * - Different icons for search types
 */

import { useState, useEffect } from 'react';
import { SearchHistoryItem } from '@/lib/types/search';
import {
  getSearchHistory,
  clearSearchHistory,
  removeSearchFromHistory,
  formatDate,
} from '@/lib/utils/search-helpers';

interface SearchHistoryProps {
  onSearchSelect: (search: SearchHistoryItem) => void;
  className?: string;
}

export default function SearchHistory({
  onSearchSelect,
  className = '',
}: SearchHistoryProps) {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    const items = getSearchHistory();
    setHistory(items);
  };

  const handleClearAll = () => {
    clearSearchHistory();
    setHistory([]);
    setShowConfirm(false);
  };

  const handleRemoveItem = (id: string) => {
    removeSearchFromHistory(id);
    loadHistory();
  };

  const getSearchTypeIcon = (type: string) => {
    switch (type) {
      case 'one-way':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        );
      case 'round-trip':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        );
      case 'multi-city':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        );
      default:
        return null;
    }
  };

  const formatSearchDescription = (search: SearchHistoryItem): string => {
    if (search.type === 'multi-city' && search.segments) {
      const cities = search.segments.map(s => s.to).join(' → ');
      return `${search.from} → ${cities}`;
    }

    if (search.type === 'round-trip') {
      return `${search.from} ⇄ ${search.to}`;
    }

    return `${search.from} → ${search.to}`;
  };

  const formatDateInfo = (search: SearchHistoryItem): string => {
    if (search.type === 'round-trip' && search.returnDate) {
      return `${formatDate(search.date)} - ${formatDate(search.returnDate)}`;
    }
    return formatDate(search.date);
  };

  if (history.length === 0) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="text-center">
          <svg
            className="w-12 h-12 mx-auto text-gray-400 mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-sm font-semibold text-gray-900 mb-1">
            No search history
          </h3>
          <p className="text-xs text-gray-600">
            Your recent searches will appear here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Recent Searches
        </h3>
        <button
          onClick={() => setShowConfirm(true)}
          className="text-sm text-red-600 hover:text-red-700 font-medium"
          aria-label="Clear all search history"
        >
          Clear All
        </button>
      </div>

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="p-4 bg-red-50 border-b border-red-200">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-900">
                Clear all search history?
              </p>
              <p className="text-xs text-red-700 mt-1">
                This action cannot be undone.
              </p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleClearAll}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                >
                  Clear
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-3 py-1 bg-white text-gray-700 text-sm rounded border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History List */}
      <div className="divide-y divide-gray-200">
        {history.map((search) => (
          <div
            key={search.id}
            className="p-4 hover:bg-gray-50 transition-colors group"
          >
            <div className="flex items-start justify-between gap-4">
              {/* Search Info */}
              <button
                onClick={() => onSearchSelect(search)}
                className="flex-1 text-left"
                aria-label={`Repeat search: ${formatSearchDescription(search)}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-blue-600">
                    {getSearchTypeIcon(search.type)}
                  </div>
                  <span className="text-xs font-semibold text-gray-500 uppercase">
                    {search.type.replace('-', ' ')}
                  </span>
                </div>

                <div className="text-sm font-semibold text-gray-900 mb-1">
                  {formatSearchDescription(search)}
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{formatDateInfo(search)}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>{search.passengers} passenger{search.passengers > 1 ? 's' : ''}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{new Date(search.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="mt-2">
                  <span className="inline-flex items-center text-xs text-blue-600 font-medium group-hover:text-blue-700">
                    Search again
                    <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </button>

              {/* Remove Button */}
              <button
                onClick={() => handleRemoveItem(search.id)}
                className="text-gray-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                aria-label="Remove from history"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-3 bg-gray-50 border-t border-gray-200">
        <p className="text-xs text-gray-600 text-center">
          Showing {history.length} of last 10 searches
        </p>
      </div>
    </div>
  );
}
