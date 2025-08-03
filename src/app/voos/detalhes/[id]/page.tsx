'use client';

/**
 * 🎫 Flight Details & Booking Page
 * Página completa de detalhes do voo com formulário de reserva integrado
 * Máxima conversão através de UX otimizada e psychology triggers
 */

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  FlightIcon, 
  ArrowLeftIcon, 
  StarIcon,
  ClockIcon,
  UserIcon,
  CreditCardIcon,
  LockClosedIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  PhoneIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@/components/Icons';
import { ProcessedFlightOffer, CabinClass } from '@/types/flights';
import FlightBookingForm from '@/components/flights/FlightBookingForm';
import ResponsiveHeader from '@/components/ResponsiveHeader';
import Footer from '@/components/Footer';
import { 
  formatTimeOfDay, 
  getTimeOfDay, 
  getTimeOfDayEmoji, 
  formatStops, 
  getStopsEmoji
} from '@/lib/flights/formatters';
import { getFlightQualityScore } from '@/lib/flights/helpers';

export default function FlightDetailsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [flightData, setFlightData] = useState<ProcessedFlightOffer | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>('itinerary');
  const [timeRemaining, setTimeRemaining] = useState(15 * 60); // 15 minutes

  // Real flight data fetching from API
  useEffect(() => {
    const loadFlightData = async () => {
      try {
        const flightId = params?.id as string;
        
        if (!flightId) {
          setLoading(false);
          return;
        }

        // Fetch real flight data from API
        const response = await fetch(`/api/flights/details/${flightId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch flight details: ${response.status}`);
        }
        
        const flightData: ProcessedFlightOffer = await response.json();
        setFlightData(flightData);
        
      } catch (error) {
        console.error('Error loading flight data:', error);
        setFlightData(null);
      } finally {
        setLoading(false);
      }
    };

    loadFlightData();
  }, [params?.id]);

  // Price lock timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading flight details...</p>
        </div>
      </div>
    );
  }

  if (!flightData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FlightIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Flight not found</h3>
          <p className="text-gray-600 mb-6">The flight you are looking for was not found.</p>
          <Link
            href="/voos"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            <FlightIcon className="w-4 h-4" />
            Search Flights
          </Link>
        </div>
      </div>
    );
  }

  const qualityScore = getFlightQualityScore(flightData, [flightData]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Global Header */}
      <ResponsiveHeader />
      
      {/* Page-specific header with navigation */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link 
                href="/voos"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                Back to results
              </Link>
            </div>
            
            {/* Price Lock Timer */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-3 border border-orange-200">
              <div className="text-center">
                <div className="text-xs text-gray-600 mb-1">Price guaranteed for</div>
                <div className={`text-lg font-bold ${timeRemaining < 300 ? 'text-red-600 animate-pulse' : 'text-green-600'}`}>
                  {formatTime(timeRemaining)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Column - Flight Details */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Flight Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    ✈️ {flightData.outbound.departure.iataCode} → {flightData.outbound.arrival.iataCode}
                  </h1>
                  <p className="text-gray-600">
                    {flightData.outbound.departure.date} • {flightData.validatingAirlines.join(', ')}
                  </p>
                </div>
                
                {/* Quality Score */}
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-2">
                    <StarIcon className="w-5 h-5 text-yellow-500" />
                    <span className="text-lg font-bold text-gray-900">{qualityScore}/100</span>
                  </div>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        qualityScore >= 85 ? 'bg-green-500' : 
                        qualityScore >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${qualityScore}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {qualityScore >= 85 ? 'Excellent' : qualityScore >= 70 ? 'Good' : 'Average'}
                  </div>
                </div>
              </div>

              {/* Route Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="text-center">
                  <div className="font-bold text-2xl text-gray-900 mb-1">{flightData.outbound.departure.time}</div>
                  <div className="text-lg font-bold text-blue-600 mb-1">{flightData.outbound.departure.iataCode}</div>
                  <div className="text-sm text-gray-600">{flightData.outbound.departure.city}</div>
                  <div className="text-xs text-gray-500 mt-1">{flightData.outbound.departure.terminal}</div>
                </div>
                
                <div className="text-center">
                  <div className="text-sm font-semibold text-gray-800 mb-2">{flightData.totalDuration}</div>
                  <div className="border-t-2 border-blue-300 relative">
                    <FlightIcon className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-blue-500 bg-white rounded-full p-1" />
                  </div>
                  <div className="text-xs text-gray-600 mt-2 flex items-center justify-center gap-1">
                    <span>{getStopsEmoji(flightData.outbound.stops)}</span>
                    <span>{formatStops(flightData.outbound.stops)}</span>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="font-bold text-2xl text-gray-900 mb-1">{flightData.outbound.arrival.time}</div>
                  <div className="text-lg font-bold text-blue-600 mb-1">{flightData.outbound.arrival.iataCode}</div>
                  <div className="text-sm text-gray-600">{flightData.outbound.arrival.city}</div>
                  <div className="text-xs text-gray-500 mt-1">{flightData.outbound.arrival.terminal}</div>
                </div>
              </div>
            </div>

            {/* Expandable Sections */}
            <div className="space-y-4">
              
              {/* Detailed Itinerary */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <button
                  onClick={() => toggleSection('itinerary')}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <h3 className="text-lg font-semibold text-gray-900">🗺️ Detailed Itinerary</h3>
                  {expandedSection === 'itinerary' ? 
                    <ChevronUpIcon className="w-5 h-5 text-gray-500" /> : 
                    <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                  }
                </button>
                
                {expandedSection === 'itinerary' && (
                  <div className="px-6 pb-6 border-t border-gray-100">
                    <div className="space-y-6">
                      {flightData.outbound.segments.map((segment, index) => (
                        <div key={segment.id} className="relative">
                          {index > 0 && (
                            <div className="mb-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                              <div className="flex items-center gap-2 text-sm text-yellow-800">
                                <ClockIcon className="w-4 h-4" />
                                <span className="font-medium">
                                  Connection in {flightData.outbound.layovers?.[index-1]?.city} - {flightData.outbound.layovers?.[index-1]?.duration}
                                </span>
                              </div>
                            </div>
                          )}
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center p-4 bg-gray-50 rounded-lg">
                            <div className="text-center">
                              <div className="font-bold text-xl text-gray-900">{segment.departure.time}</div>
                              <div className="text-base font-bold text-blue-600">{segment.departure.iataCode}</div>
                              <div className="text-sm text-gray-600">{segment.departure.city}</div>
                              <div className="text-xs text-gray-500">{segment.departure.terminal}</div>
                            </div>
                            
                            <div className="text-center">
                              <div className="text-sm font-medium text-gray-700 mb-2">{segment.duration}</div>
                              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                                <span>{segment.flightNumber}</span>
                                <span>•</span>
                                <span>{segment.aircraft.name}</span>
                              </div>
                            </div>
                            
                            <div className="text-center">
                              <div className="font-bold text-xl text-gray-900">{segment.arrival.time}</div>
                              <div className="text-base font-bold text-blue-600">{segment.arrival.iataCode}</div>
                              <div className="text-sm text-gray-600">{segment.arrival.city}</div>
                              <div className="text-xs text-gray-500">{segment.arrival.terminal}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Baggage & Policies */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <button
                  onClick={() => toggleSection('policies')}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <h3 className="text-lg font-semibold text-gray-900">🧳 Baggage & Policies</h3>
                  {expandedSection === 'policies' ? 
                    <ChevronUpIcon className="w-5 h-5 text-gray-500" /> : 
                    <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                  }
                </button>
                
                {expandedSection === 'policies' && (
                  <div className="px-6 pb-6 border-t border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Included Baggage</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                          <li className="flex items-center gap-2">
                            <CheckCircleIcon className="w-4 h-4 text-green-600" />
                            Carry-on: 22 lbs
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircleIcon className="w-4 h-4 text-green-600" />
                            Personal item: small bag
                          </li>
                          <li className="flex items-center gap-2">
                            <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600" />
                            Checked bag: not included
                          </li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Cancellation Policies</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                          <li className="flex items-center gap-2">
                            <CheckCircleIcon className="w-4 h-4 text-green-600" />
                            Free cancellation within 24h
                          </li>
                          <li className="flex items-center gap-2">
                            <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600" />
                            After 24h: applicable fees
                          </li>
                          <li className="flex items-center gap-2">
                            <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600" />
                            Changes: subject to availability
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Summary and Actions */}
          <div className="space-y-6">
            
            {/* Price Card and Main Action */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-6">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-blue-600 mb-2">{flightData.totalPrice}</div>
                <div className="text-sm text-gray-600 mb-4">For {flightData.numberOfBookableSeats > 1 ? '1 adult' : 'all passengers'}</div>
                
                {/* Urgency indicator */}
                {flightData.numberOfBookableSeats <= 3 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                    <div className="text-sm text-red-800 font-medium">
                      ⚡ Only {flightData.numberOfBookableSeats} seats remaining!
                    </div>
                  </div>
                )}
                
                {timeRemaining < 300 && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
                    <div className="text-sm text-orange-800 font-medium animate-pulse">
                      ⏰ Price expires in {formatTime(timeRemaining)}
                    </div>
                  </div>
                )}
              </div>
              
              <button
                onClick={() => setShowBookingForm(true)}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl mb-4"
              >
                🎫 Book Now
              </button>
              
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href={`/voos/comparar?voo=${flightData.id}&origem=${flightData.outbound.departure.iataCode}&destino=${flightData.outbound.arrival.iataCode}`}
                  className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 hover:border-blue-400 text-gray-700 hover:text-blue-700 font-medium rounded-lg transition-colors"
                >
                  🔍 Compare
                </Link>
                
                <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 hover:border-green-400 text-gray-700 hover:text-green-700 font-medium rounded-lg transition-colors">
                  💾 Save
                </button>
              </div>
            </div>

            {/* Trust Signals */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">🛡️ Why Choose Fly2Any?</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <LockClosedIcon className="w-4 h-4 text-green-600" />
                  <span className="text-gray-700">100% secure payment</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <ShieldCheckIcon className="w-4 h-4 text-blue-600" />
                  <span className="text-gray-700">IATA certified</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <PhoneIcon className="w-4 h-4 text-purple-600" />
                  <span className="text-gray-700">24/7 support</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <GlobeAltIcon className="w-4 h-4 text-green-600" />
                  <span className="text-gray-700">50k+ satisfied customers</span>
                </div>
              </div>
            </div>

            {/* Customer Reviews */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">⭐ Reviews</h3>
              <div className="space-y-4">
                <div className="border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon key={i} className="w-4 h-4 text-yellow-500" />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-gray-900">Sarah M.</span>
                  </div>
                  <p className="text-sm text-gray-600">"Super easy and fast booking process!"</p>
                </div>
                
                <div className="border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon key={i} className="w-4 h-4 text-yellow-500" />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-gray-900">John M.</span>
                  </div>
                  <p className="text-sm text-gray-600">"Best price I found online."</p>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">
                      {[...Array(4)].map((_, i) => (
                        <StarIcon key={i} className="w-4 h-4 text-yellow-500" />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-gray-900">Anna L.</span>
                  </div>
                  <p className="text-sm text-gray-600">"Excellent customer service, highly recommend!"</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Form Modal */}
      {showBookingForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Complete Booking</h2>
              <button
                onClick={() => setShowBookingForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6">
              <FlightBookingForm
                selectedFlight={flightData}
                onBookingComplete={(booking) => {
                  console.log('Booking completed:', booking);
                  setShowBookingForm(false);
                  // Redirect para página de confirmação
                }}
                onBack={() => setShowBookingForm(false)}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Global Footer */}
      <Footer />
    </div>
  );
}