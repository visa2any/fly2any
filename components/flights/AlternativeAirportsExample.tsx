'use client';

/**
 * EXAMPLE INTEGRATION
 *
 * This file demonstrates how to integrate the AlternativeAirports component
 * into your flight search results page.
 */

import React, { useState } from 'react';
import AlternativeAirports from './AlternativeAirports';

// Example: Flight Search Results Page
const FlightSearchResultsPage: React.FC = () => {
  // Your existing flight search state
  const [searchParams, setSearchParams] = useState({
    origin: 'JFK',
    destination: 'LAX',
    departureDate: '2025-03-15',
    returnDate: '2025-03-22',
    passengers: 2,
    class: 'economy'
  });

  // Example flight results (this would come from your API)
  const flightResults = [
    {
      id: '1',
      airline: 'United Airlines',
      price: 450,
      duration: '6h 15m',
      // ... other flight details
    },
    // ... more results
  ];

  // Get the cheapest flight price for comparison
  const cheapestPrice = flightResults.length > 0
    ? Math.min(...flightResults.map(f => f.price))
    : 0;

  // Handle airport switch from the AlternativeAirports widget
  const handleAirportSwitch = (newOrigin: string, newDestination: string) => {
    // Update search parameters
    setSearchParams(prev => ({
      ...prev,
      origin: newOrigin,
      destination: newDestination
    }));

    // Trigger new flight search
    searchFlights(newOrigin, newDestination);
  };

  const searchFlights = (origin: string, destination: string) => {
    // Your existing flight search logic
    console.log(`Searching flights from ${origin} to ${destination}`);

    // Example API call:
    // const results = await fetch('/api/flights/search', {
    //   method: 'POST',
    //   body: JSON.stringify({
    //     origin,
    //     destination,
    //     departureDate: searchParams.departureDate,
    //     returnDate: searchParams.returnDate,
    //     passengers: searchParams.passengers,
    //     class: searchParams.class
    //   })
    // });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Search Summary */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">
          Flights from {searchParams.origin} to {searchParams.destination}
        </h1>
        <p className="text-gray-600">
          {searchParams.departureDate} - {searchParams.returnDate} • {searchParams.passengers} passenger(s)
        </p>
      </div>

      {/*
        ALTERNATIVE AIRPORTS WIDGET
        Place this before or after your flight results
      */}
      {flightResults.length > 0 && (
        <AlternativeAirports
          originAirport={searchParams.origin}
          destinationAirport={searchParams.destination}
          currentPrice={cheapestPrice}
          onAirportSelect={handleAirportSwitch}
          currency="USD"
          lang="en" // or get from user preferences
        />
      )}

      {/* Your existing flight results */}
      <div className="space-y-4">
        {flightResults.map(flight => (
          <div key={flight.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold">{flight.airline}</h3>
                <p className="text-sm text-gray-600">{flight.duration}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">${flight.price}</div>
                <button className="mt-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Select
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Example: Flight Booking Flow Integration
const FlightBookingFlow: React.FC = () => {
  const [step, setStep] = useState<'search' | 'alternatives' | 'results'>('search');
  const [selectedFlight, setSelectedFlight] = useState<any>(null);

  return (
    <div className="max-w-4xl mx-auto p-6">
      {step === 'search' && (
        <div>
          {/* Your flight search form */}
          <h2>Search for Flights</h2>
          {/* ... search form ... */}
        </div>
      )}

      {step === 'alternatives' && (
        <div>
          <h2>Consider Nearby Airports</h2>
          <AlternativeAirports
            originAirport="JFK"
            destinationAirport="LAX"
            currentPrice={450}
            onAirportSelect={(origin, destination) => {
              // User selected alternative airport
              console.log(`Switching to ${origin} - ${destination}`);
              setStep('results');
            }}
            lang="en"
          />
          <button
            onClick={() => setStep('results')}
            className="mt-4 px-6 py-2 bg-gray-200 rounded-lg"
          >
            Continue with current airports
          </button>
        </div>
      )}

      {step === 'results' && (
        <div>
          {/* Show flight results */}
          <h2>Flight Results</h2>
        </div>
      )}
    </div>
  );
};

// Example: Mobile-Optimized Integration
const MobileFlightSearch: React.FC = () => {
  const [showAlternatives, setShowAlternatives] = useState(false);

  return (
    <div className="mobile-container">
      {/* Flight results list */}
      <div className="results">
        {/* ... flight cards ... */}
      </div>

      {/* Sticky bottom prompt */}
      {!showAlternatives && (
        <div className="fixed bottom-0 left-0 right-0 bg-green-600 text-white p-4">
          <button
            onClick={() => setShowAlternatives(true)}
            className="w-full text-center font-semibold"
          >
            💡 Save up to $150 with nearby airports
          </button>
        </div>
      )}

      {/* Full-screen modal on mobile */}
      {showAlternatives && (
        <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
          <div className="p-4">
            <button
              onClick={() => setShowAlternatives(false)}
              className="mb-4 text-blue-600"
            >
              ← Back to results
            </button>

            <AlternativeAirports
              originAirport="JFK"
              destinationAirport="LAX"
              currentPrice={450}
              onAirportSelect={(origin, destination) => {
                setShowAlternatives(false);
                // Trigger new search
              }}
              lang="en"
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Example: API Integration
async function fetchAlternativeFlightPrices(
  mainOrigin: string,
  mainDestination: string,
  alternativeOrigin?: string,
  alternativeDestination?: string
) {
  // This is how you would fetch real prices from your API
  const response = await fetch('/api/flights/compare-alternatives', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mainRoute: { origin: mainOrigin, destination: mainDestination },
      alternativeRoute: {
        origin: alternativeOrigin || mainOrigin,
        destination: alternativeDestination || mainDestination
      },
      departureDate: '2025-03-15',
      returnDate: '2025-03-22',
      passengers: 1
    })
  });

  const data = await response.json();
  return {
    mainPrice: data.mainPrice,
    alternativePrice: data.alternativePrice,
    savings: data.mainPrice - data.alternativePrice
  };
}

// Export the main example
export default FlightSearchResultsPage;

/**
 * INTEGRATION CHECKLIST:
 *
 * 1. Import the component:
 *    import AlternativeAirports from '@/components/flights/AlternativeAirports';
 *
 * 2. Add it to your flight results page:
 *    - Place it before or after your flight list
 *    - Pass current search parameters (origin, destination, price)
 *
 * 3. Implement onAirportSelect handler:
 *    - Update search state
 *    - Trigger new flight search
 *    - Optionally show loading state
 *
 * 4. Set language based on user preference:
 *    - Pass lang prop ('en' | 'pt' | 'es')
 *
 * 5. Optional enhancements:
 *    - Fetch real prices for alternative airports
 *    - Track analytics when users switch airports
 *    - Show conversion success rate
 *    - A/B test placement on page
 *
 * 6. Mobile optimization:
 *    - Consider full-screen modal on mobile
 *    - Add sticky CTA to show alternatives
 *    - Test collapsible behavior
 */
