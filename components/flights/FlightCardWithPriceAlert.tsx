'use client';

/**
 * Example Flight Card with integrated "Set Price Alert" button
 * This demonstrates how to integrate the CreatePriceAlert modal into existing flight cards
 *
 * Usage:
 * 1. Import CreatePriceAlert modal
 * 2. Add state for modal visibility
 * 3. Add "Set Price Alert" button to flight card
 * 4. Pass flight data to the modal
 */

import { useState } from 'react';
import { Bell, Plane, Calendar, Users, Wifi, Clock } from 'lucide-react';
import CreatePriceAlert from '@/components/search/CreatePriceAlert';
import { PriceAlert } from '@/lib/types/price-alerts';

interface FlightCardWithPriceAlertProps {
  flight: {
    id: string;
    origin: string;
    destination: string;
    departDate: string;
    returnDate?: string;
    price: number;
    currency: string;
    airline: string;
    duration: string;
    stops: number;
  };
}

export function FlightCardWithPriceAlert({ flight }: FlightCardWithPriceAlertProps) {
  // State for price alert modal
  const [showPriceAlertModal, setShowPriceAlertModal] = useState(false);

  // Handle successful alert creation
  const handleAlertSuccess = (alert: PriceAlert) => {
    console.log('Price alert created:', alert);
    // Optionally: show a success message, update UI, etc.
  };

  return (
    <>
      {/* Example Flight Card */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-md hover:shadow-xl transition-all p-6">
        {/* Flight Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <Plane className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{flight.airline}</h3>
              <p className="text-sm text-gray-600">
                {flight.stops === 0 ? 'Nonstop' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              {flight.currency}{flight.price}
            </div>
            <div className="text-xs text-gray-600">per person</div>
          </div>
        </div>

        {/* Route Info */}
        <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
          <div>
            <div className="text-xl font-bold text-gray-900">{flight.origin}</div>
            <div className="text-xs text-gray-600">{flight.departDate}</div>
          </div>
          <div className="flex-1 px-4">
            <div className="text-center">
              <Clock className="w-4 h-4 text-gray-400 mx-auto mb-1" />
              <div className="text-xs text-gray-600">{flight.duration}</div>
            </div>
          </div>
          <div>
            <div className="text-xl font-bold text-gray-900">{flight.destination}</div>
            {flight.returnDate && (
              <div className="text-xs text-gray-600">{flight.returnDate}</div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Book Now Button */}
          <button className="flex-1 py-3 px-6 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg hover:shadow-xl">
            Book Now
          </button>

          {/* Set Price Alert Button */}
          <button
            onClick={() => setShowPriceAlertModal(true)}
            className="px-4 py-3 bg-orange-50 text-orange-600 rounded-xl font-semibold hover:bg-orange-100 transition-all border-2 border-orange-200 flex items-center gap-2"
            title="Set Price Alert"
          >
            <Bell className="w-5 h-5" />
            <span className="hidden sm:inline">Set Alert</span>
          </button>
        </div>
      </div>

      {/* Price Alert Modal */}
      <CreatePriceAlert
        isOpen={showPriceAlertModal}
        onClose={() => setShowPriceAlertModal(false)}
        flightData={{
          origin: flight.origin,
          destination: flight.destination,
          departDate: flight.departDate,
          returnDate: flight.returnDate,
          currentPrice: flight.price,
          currency: flight.currency,
        }}
        onSuccess={handleAlertSuccess}
      />
    </>
  );
}

export default FlightCardWithPriceAlert;

/**
 * INTEGRATION GUIDE:
 *
 * To add price alerts to existing flight cards, follow these steps:
 *
 * 1. Import the CreatePriceAlert component:
 *    import CreatePriceAlert from '@/components/search/CreatePriceAlert';
 *
 * 2. Add state for modal visibility:
 *    const [showPriceAlertModal, setShowPriceAlertModal] = useState(false);
 *
 * 3. Add the "Set Price Alert" button to your flight card:
 *    <button
 *      onClick={() => setShowPriceAlertModal(true)}
 *      className="px-4 py-3 bg-orange-50 text-orange-600 rounded-xl font-semibold hover:bg-orange-100"
 *    >
 *      <Bell className="w-5 h-5" />
 *      Set Alert
 *    </button>
 *
 * 4. Add the modal component after your flight card:
 *    <CreatePriceAlert
 *      isOpen={showPriceAlertModal}
 *      onClose={() => setShowPriceAlertModal(false)}
 *      flightData={{
 *        origin: flight.origin,
 *        destination: flight.destination,
 *        departDate: flight.departDate,
 *        returnDate: flight.returnDate,
 *        currentPrice: flight.price,
 *        currency: flight.currency,
 *      }}
 *      onSuccess={(alert) => {
 *        console.log('Alert created:', alert);
 *        // Handle success (optional)
 *      }}
 *    />
 *
 * 5. Ensure you have react-hot-toast configured in your app:
 *    - Already included in this project
 *    - Toasts are automatically shown for success/error states
 *
 * FILES TO INTEGRATE:
 * - components/flights/FlightCard.tsx
 * - components/flights/FlightCardCompact.tsx
 * - components/flights/FlightCardEnhanced.tsx
 * - components/flights/MultiCityFlightCard.tsx
 * - app/flights/results/page.tsx (or wherever flight results are displayed)
 */
