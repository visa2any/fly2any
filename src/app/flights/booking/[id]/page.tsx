'use client';
export const dynamic = 'force-dynamic';

/**
 * Flight Booking Page - Complete booking flow
 */

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  CreditCardIcon, 
  UserIcon, 
  PhoneIcon, 
  EnvelopeIcon,
  ShieldCheckIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import FlightBookingForm from '@/components/flights/FlightBookingForm';
import { ProcessedFlightOffer } from '@/types/flights';

export default function FlightBookingPage() {
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
            <ClockIcon className="w-8 h-8 text-red-500" />
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
                <h1 className="text-xl font-black text-slate-800">
                  Complete Your Booking
                </h1>
                <p className="text-slate-600 text-sm">
                  Secure booking process
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <ShieldCheckIcon className="w-5 h-5 text-green-500" />
              SSL Secured
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Booking Form */}
          <div className="lg:col-span-2">
            <div className="bg-white/70 backdrop-blur-sm border border-white/60 rounded-3xl p-8 shadow-lg">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-black text-slate-800 mb-2">
                  Flight Booking
                </h2>
                <p className="text-slate-600">
                  Complete your flight booking with secure payment
                </p>
              </div>

              <FlightBookingForm 
                selectedFlight={flight}
                onBookingComplete={(bookingData) => {
                  router.push(`/flights/booking/confirmation?booking=${bookingData.id}`);
                }}
                onBack={() => router.back()}
              />
            </div>
          </div>

          {/* Flight Summary Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/70 backdrop-blur-sm border border-white/60 rounded-3xl p-6 shadow-lg sticky top-24"
            >
              <h3 className="text-lg font-black text-slate-800 mb-6">
                Flight Summary
              </h3>
              
              {/* Flight Details */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-600">Route</div>
                  <div className="text-sm font-bold text-slate-800">
                    {flight.outbound.departure.iataCode} → {flight.outbound.arrival.iataCode}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-600">Departure</div>
                  <div className="text-sm font-bold text-slate-800">
                    {flight.outbound.departure.date}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-600">Duration</div>
                  <div className="text-sm font-bold text-slate-800">
                    {flight.outbound.duration}
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4">
                <div className="flex items-center justify-between text-lg font-black text-slate-800">
                  <span>Total</span>
                  <span className="text-blue-600">
                    {flight.totalPrice}
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Includes taxes and fees
                </div>
              </div>

              {/* Security Features */}
              <div className="mt-6 p-4 bg-green-50 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-bold text-green-800">
                    Secure Booking
                  </span>
                </div>
                <ul className="text-xs text-green-700 space-y-1">
                  <li>• Free cancellation within 24h</li>
                  <li>• Price protection guarantee</li>
                  <li>• Instant confirmation</li>
                  <li>• 24/7 customer support</li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}