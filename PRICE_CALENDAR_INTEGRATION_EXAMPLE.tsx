/**
 * PRICE CALENDAR INTEGRATION EXAMPLE
 *
 * This file demonstrates how to integrate the Visual Price Calendar
 * into Fly2Any's flight search page.
 *
 * Implementation options:
 * 1. Replace existing date picker
 * 2. Add "View Price Calendar" button
 * 3. Show calendar inline (always visible)
 */

'use client';

import { useState } from 'react';
import { PriceDatePickerEnhanced } from '@/components/search/PriceDatePickerEnhanced';
import { PriceCalendar } from '@/components/calendar/PriceCalendar';
import { FlexibleDatesSelector } from '@/components/calendar/FlexibleDatesSelector';

// ============================================
// OPTION 1: Replace Existing Date Picker
// ============================================

/**
 * Replace the standard date input with enhanced picker
 * Benefits:
 * - Seamless integration
 * - Modal popup calendar
 * - Automatic price loading
 */
function FlightSearchFormOption1() {
  const [formData, setFormData] = useState({
    origin: ['JFK'],
    destination: ['LAX'],
    departureDate: '',
    returnDate: '',
    passengers: { adults: 1, children: 0, infants: 0 },
    travelClass: 'economy',
  });

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {/* Departure Date - ENHANCED WITH PRICE CALENDAR */}
      <PriceDatePickerEnhanced
        label="Departure Date"
        value={formData.departureDate}
        onChange={(date) => setFormData({ ...formData, departureDate: date })}
        origin={formData.origin[0]}
        destination={formData.destination[0]}
        adults={formData.passengers.adults}
        cabinClass={formData.travelClass}
      />

      {/* Return Date - ENHANCED WITH PRICE CALENDAR */}
      <PriceDatePickerEnhanced
        label="Return Date"
        value={formData.returnDate}
        onChange={(date) => setFormData({ ...formData, returnDate: date })}
        origin={formData.destination[0]} // Reverse for return
        destination={formData.origin[0]}
        adults={formData.passengers.adults}
        cabinClass={formData.travelClass}
        minDate={formData.departureDate} // Can't return before departure
      />
    </div>
  );
}

// ============================================
// OPTION 2: Add "View Price Calendar" Button
// ============================================

/**
 * Keep existing date input, add button to open calendar
 * Benefits:
 * - Minimal changes to existing UI
 * - Optional feature
 * - Progressive enhancement
 */
function FlightSearchFormOption2() {
  const [formData, setFormData] = useState({
    origin: ['JFK'],
    destination: ['LAX'],
    departureDate: '',
    returnDate: '',
    passengers: { adults: 1, children: 0, infants: 0 },
    travelClass: 'economy',
  });

  const [showCalendar, setShowCalendar] = useState(false);

  return (
    <>
      <div className="grid md:grid-cols-2 gap-4">
        {/* Keep existing date inputs */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Departure Date
          </label>
          <input
            type="date"
            value={formData.departureDate}
            onChange={(e) => setFormData({ ...formData, departureDate: e.target.value })}
            className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Return Date
          </label>
          <input
            type="date"
            value={formData.returnDate}
            onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
            className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl"
          />
        </div>
      </div>

      {/* Add button to show calendar */}
      <button
        type="button"
        onClick={() => setShowCalendar(true)}
        className="mt-2 flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
        </svg>
        View Price Calendar
      </button>

      {/* Calendar Modal */}
      {showCalendar && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowCalendar(false)}
          />
          <div className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl z-50">
            <PriceCalendar
              origin={formData.origin[0]}
              destination={formData.destination[0]}
              selectedDate={formData.departureDate}
              onDateSelect={(date) => {
                setFormData({ ...formData, departureDate: date });
                setShowCalendar(false);
              }}
              adults={formData.passengers.adults}
              cabinClass={formData.travelClass}
            />
          </div>
        </>
      )}
    </>
  );
}

// ============================================
// OPTION 3: Inline Calendar (Always Visible)
// ============================================

/**
 * Display calendar inline below search form
 * Benefits:
 * - Always visible
 * - No modal interactions
 * - Best for dedicated search pages
 */
function FlightSearchFormOption3() {
  const [formData, setFormData] = useState({
    origin: ['JFK'],
    destination: ['LAX'],
    departureDate: '',
    returnDate: '',
    passengers: { adults: 1, children: 0, infants: 0 },
    travelClass: 'economy',
  });

  return (
    <div className="space-y-6">
      {/* Search form fields */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        {/* Origin, destination, passengers, etc. */}
      </div>

      {/* Inline Price Calendar */}
      {formData.origin[0] && formData.destination[0] && (
        <div className="mt-6">
          <h3 className="text-lg font-bold text-gray-900 mb-3">
            Choose Your Travel Dates
          </h3>
          <PriceCalendar
            origin={formData.origin[0]}
            destination={formData.destination[0]}
            selectedDate={formData.departureDate}
            onDateSelect={(date) => setFormData({ ...formData, departureDate: date })}
            adults={formData.passengers.adults}
            cabinClass={formData.travelClass}
          />
        </div>
      )}
    </div>
  );
}

// ============================================
// OPTION 4: With Flexible Dates Selector
// ============================================

/**
 * Combine price calendar with flexible dates
 * Benefits:
 * - Complete feature set
 * - Best user experience
 * - Maximum conversion potential
 */
function FlightSearchFormOption4() {
  const [formData, setFormData] = useState({
    origin: ['JFK'],
    destination: ['LAX'],
    departureDate: '',
    returnDate: '',
    passengers: { adults: 1, children: 0, infants: 0 },
    travelClass: 'economy',
    flexDays: 0,
  });

  return (
    <div className="space-y-6">
      {/* Origin and Destination */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* ... origin/destination inputs ... */}
      </div>

      {/* Flexible Dates Selector */}
      <FlexibleDatesSelector
        value={formData.flexDays}
        onChange={(days) => setFormData({ ...formData, flexDays: days })}
        potentialSavings={87} // Could be calculated from calendar data
      />

      {/* Date Inputs with Price Calendar */}
      <div className="grid md:grid-cols-2 gap-4">
        <PriceDatePickerEnhanced
          label="Departure Date"
          value={formData.departureDate}
          onChange={(date) => setFormData({ ...formData, departureDate: date })}
          origin={formData.origin[0]}
          destination={formData.destination[0]}
          adults={formData.passengers.adults}
          cabinClass={formData.travelClass}
        />

        <PriceDatePickerEnhanced
          label="Return Date"
          value={formData.returnDate}
          onChange={(date) => setFormData({ ...formData, returnDate: date })}
          origin={formData.destination[0]}
          destination={formData.origin[0]}
          adults={formData.passengers.adults}
          cabinClass={formData.travelClass}
          minDate={formData.departureDate}
        />
      </div>

      {/* Info message about flexible dates */}
      {formData.flexDays > 0 && (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            Searching with ±{formData.flexDays} day flexibility.
            We'll show you the best prices within this date range.
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================
// RECOMMENDED: Full Implementation
// ============================================

/**
 * Recommended implementation for app/flights/page.tsx
 *
 * This combines the best features:
 * - Enhanced date picker with price calendar
 * - Flexible dates selector
 * - Mobile responsive
 * - Accessibility features
 */
export function FlightSearchFormRecommended() {
  const [formData, setFormData] = useState({
    origin: ['JFK'],
    destination: ['LAX'],
    departureDate: '',
    returnDate: '',
    passengers: { adults: 1, children: 0, infants: 0 },
    travelClass: 'economy',
    flexDays: 0,
    directFlights: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSearch = () => {
    // Existing search logic
    // Include flexDays in search parameters
    const params = {
      ...formData,
      departureFlex: formData.flexDays,
    };
    // Navigate to results
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-8">
      {/* Trip Type Toggle */}
      <div className="flex gap-4 mb-6">
        {/* ... existing trip type buttons ... */}
      </div>

      {/* Origin and Destination */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {/* ... existing airport inputs ... */}
      </div>

      {/* Flexible Dates Selector */}
      <div className="mb-6">
        <FlexibleDatesSelector
          value={formData.flexDays}
          onChange={(days) => setFormData({ ...formData, flexDays: days })}
          potentialSavings={87}
        />
      </div>

      {/* Date Inputs with Price Calendar */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <PriceDatePickerEnhanced
          label="Departure"
          value={formData.departureDate}
          onChange={(date) => {
            setFormData({ ...formData, departureDate: date });
            if (errors.departureDate) {
              setErrors({ ...errors, departureDate: '' });
            }
          }}
          origin={formData.origin[0]}
          destination={formData.destination[0]}
          adults={formData.passengers.adults}
          cabinClass={formData.travelClass}
        />

        <PriceDatePickerEnhanced
          label="Return"
          value={formData.returnDate}
          onChange={(date) => {
            setFormData({ ...formData, returnDate: date });
            if (errors.returnDate) {
              setErrors({ ...errors, returnDate: '' });
            }
          }}
          origin={formData.destination[0]}
          destination={formData.origin[0]}
          adults={formData.passengers.adults}
          cabinClass={formData.travelClass}
          minDate={formData.departureDate}
        />
      </div>

      {/* Passengers and Class */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {/* ... existing passenger/class inputs ... */}
      </div>

      {/* Direct Flights Checkbox */}
      <div className="mb-6">
        {/* ... existing checkbox ... */}
      </div>

      {/* Search Button */}
      <button
        onClick={handleSearch}
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-8 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
      >
        Search Flights
      </button>
    </div>
  );
}

// ============================================
// USAGE IN EXISTING CODE
// ============================================

/**
 * To integrate into app/flights/page.tsx:
 *
 * 1. Import the enhanced components:
 *    import { PriceDatePickerEnhanced } from '@/components/search/PriceDatePickerEnhanced';
 *    import { FlexibleDatesSelector } from '@/components/calendar/FlexibleDatesSelector';
 *
 * 2. Replace existing date inputs with PriceDatePickerEnhanced
 *
 * 3. Add FlexibleDatesSelector above date inputs
 *
 * 4. Update search handler to include flexDays parameter
 *
 * That's it! The calendar will automatically:
 * - Fetch cached prices from Redis
 * - Display visual heatmap
 * - Show savings recommendations
 * - Handle mobile responsive layout
 * - Provide accessibility features
 */
