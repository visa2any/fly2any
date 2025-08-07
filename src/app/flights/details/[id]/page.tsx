'use client';

/**
 * Flight Details Page - Complete flight information
 */

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  PaperAirplaneIcon,
  ClockIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  StarIcon,
  ShieldCheckIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import FlightDetailsPage from '@/components/flights/FlightDetailsPage';
import { ProcessedFlightOffer } from '@/types/flights';

export default function FlightDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [flight, setFlight] = useState<ProcessedFlightOffer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Mock flight data - in real app would fetch from API
    const mockFlight: ProcessedFlightOffer = {
      id: params.id as string,
      totalPrice: '$1,407.48',
      currency: 'USD',
      outbound: {
        departure: {
          iataCode: 'NYC',
          airportName: 'John F. Kennedy International',
          cityName: 'New York',
          countryName: 'United States',
          dateTime: '2025-08-01T10:45:00',
          date: '08/01/2025',
          time: '10:45 AM',
          timeZone: 'America/New_York',
          city: 'New York',
          terminal: 'Terminal 4'
        },
        arrival: {
          iataCode: 'LAX',
          airportName: 'Los Angeles International',
          cityName: 'Los Angeles',
          countryName: 'United States',
          dateTime: '2025-08-01T16:30:00',
          date: '08/01/2025',
          time: '4:30 PM',
          timeZone: 'America/Los_Angeles',
          city: 'Los Angeles',
          terminal: 'Terminal 7'
        },
        duration: '5h 45min',
        durationMinutes: 345,
        stops: 0,
        segments: []
      },
      numberOfBookableSeats: 5,
      validatingAirlines: ['American Airlines'],
      lastTicketingDate: '2025-07-29T23:59:59',
      instantTicketingRequired: false,
      cabinAnalysis: {
        detectedClass: 'ECONOMY',
        confidence: 0.8,
        definition: null,
        sources: ['amadeus']
      },
      baggageAnalysis: {
        carryOn: {
          included: true,
          quantity: 1,
          weight: '22lbs',
          hasRealData: true
        },
        checked: {
          included: false,
          quantity: 0,
          weight: null,
          hasRealData: true
        }
      },
      rawOffer: {} as any
    };

    setFlight(mockFlight);
    setIsLoading(false);
  }, [params.id]);

  const handleBookFlight = () => {
    if (flight) {
      router.push(`/flights/booking/${flight.id}`);
    }
  };

  const handleCompareFlight = () => {
    if (flight) {
      router.push(`/flights/compare?ids=${flight.id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <h2 className="text-xl font-bold text-slate-800">Loading flight details...</h2>
        </div>
      </div>
    );
  }

  if (error || !flight) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <InformationCircleIcon className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Flight Not Found</h2>
          <p className="text-slate-600 mb-6">{error || 'The requested flight could not be found.'}</p>
          <button
            onClick={() => router.push('/flights')}
            className="px-6 py-3 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-colors"
          >
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                ←
              </button>
              <div>
                <h1 className="text-xl font-black text-slate-800 flex items-center gap-2">
                  <PaperAirplaneIcon className="w-6 h-6" />
                  Flight Details
                </h1>
                <p className="text-slate-600 text-sm">
                  {flight.outbound.departure.iataCode} → {flight.outbound.arrival.iataCode}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleCompareFlight}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
              >
                Compare
              </button>
              <button
                onClick={handleBookFlight}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-xl hover:shadow-lg transition-all duration-300"
              >
                Book Flight
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Flight Details Component */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <FlightDetailsPage 
          flight={flight}
          onBooking={handleBookFlight}
          onBack={() => router.back()}
        />
      </div>

      {/* Quick Actions */}
      <div className="fixed bottom-6 right-6">
        <div className="flex flex-col gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleBookFlight}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Book Now
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push(`/flights/seat-selection/${flight.id}`)}
            className="px-6 py-3 bg-white/90 backdrop-blur-sm text-slate-800 font-bold rounded-xl shadow-lg border border-white/60 hover:bg-white transition-all duration-300"
          >
            Select Seats
          </motion.button>
        </div>
      </div>
    </div>
  );
}