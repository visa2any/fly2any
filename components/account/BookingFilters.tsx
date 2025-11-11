'use client';

import { Calendar, DollarSign, Users, X } from 'lucide-react';
import type { BookingStatus } from '@/lib/bookings/types';

interface FilterState {
  status: BookingStatus | 'all';
  searchQuery: string;
  dateFrom: string;
  dateTo: string;
  sortBy: 'newest' | 'oldest';
}

interface BookingFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
}

export default function BookingFilters({
  filters,
  onFilterChange,
}: BookingFiltersProps) {
  const hasActiveFilters = filters.dateFrom || filters.dateTo;

  const clearFilters = () => {
    onFilterChange({
      dateFrom: '',
      dateTo: '',
    });
  };

  return (
    <div className="mt-4 pt-4 border-t border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700">Advanced Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 font-semibold"
          >
            <X className="w-4 h-4" />
            Clear Filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Date Range Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Departure Date From
          </label>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => onFilterChange({ dateFrom: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Departure Date To
          </label>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => onFilterChange({ dateTo: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="lg:col-span-1 flex items-end">
            <div className="w-full p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-xs font-semibold text-blue-700 mb-1">
                Active Filters:
              </div>
              <div className="flex flex-wrap gap-2">
                {filters.dateFrom && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                    From: {new Date(filters.dateFrom).toLocaleDateString()}
                    <button
                      onClick={() => onFilterChange({ dateFrom: '' })}
                      className="hover:text-blue-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {filters.dateTo && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                    To: {new Date(filters.dateTo).toLocaleDateString()}
                    <button
                      onClick={() => onFilterChange({ dateTo: '' })}
                      className="hover:text-blue-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filter Tips */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-xs text-gray-600">
          <strong>Tips:</strong> Use date filters to find bookings for specific travel
          periods. Combine with status and search filters for precise results.
        </div>
      </div>
    </div>
  );
}
