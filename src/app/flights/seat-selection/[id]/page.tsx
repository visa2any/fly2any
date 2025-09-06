'use client';
export const dynamic = 'force-dynamic';

/**
 * Seat Selection Page - Interactive seat map
 */

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  PaperAirplaneIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { ProcessedFlightOffer } from '@/types/flights';

interface Seat {
  id: string;
  row: number;
  letter: string;
  type: 'economy' | 'premium' | 'business' | 'first';
  status: 'available' | 'occupied' | 'selected';
  price: number;
}

export default function SeatSelectionPage() {
  const params = useParams();
  const router = useRouter();
  const [flight, setFlight] = useState<ProcessedFlightOffer | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Generate mock seat data
  const generateSeats = (): Seat[] => {
    const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
    const seats: Seat[] = [];

    // Economy (rows 1-30)
    for (let row = 1; row <= 30; row++) {
      for (let i = 0; i < 6; i++) {
        seats.push({
          id: `${row}${letters[i]}`,
          row,
          letter: letters[i],
          type: 'economy',
          status: Math.random() > 0.7 ? 'occupied' : 'available',
          price: 0
        });
      }
    }

    return seats;
  };

  useEffect(() => {
    // Mock data
    const mockFlight: ProcessedFlightOffer = {
      id: params.id as string,
      totalPrice: '$1,407.48',
      currency: 'USD',
      outbound: {
        departure: {
          iataCode: 'NYC',
          airportName: 'JFK International',
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
    setSeats(generateSeats());
    setIsLoading(false);
  }, [params.id]);

  const handleSeatSelect = (seat: Seat) => {
    if (seat.status === 'occupied') return;

    const isSelected = selectedSeats.find(s => s.id === seat.id);
    
    if (isSelected) {
      // Deselect seat
      setSelectedSeats((prev: any) => prev.filter((s: any) => s.id !== seat.id));
      setSeats((prev: any) => prev.map((s: any) => 
        s.id === seat.id ? { ...s, status: 'available' } : s
      ));
    } else {
      // Select seat (limit to 1 for now)
      setSelectedSeats([seat]);
      setSeats((prev: any) => prev.map((s: any) => ({
        ...s,
        status: s.id === seat.id ? 'selected' : s.status === 'selected' ? 'available' : s.status
      })));
    }
  };

  const getSeatColor = (seat: Seat) => {
    switch (seat.status) {
      case 'occupied':
        return 'bg-red-200 border-red-300 cursor-not-allowed';
      case 'selected':
        return 'bg-blue-500 border-blue-600 text-white cursor-pointer';
      case 'available':
        return 'bg-gray-100 border-gray-300 hover:bg-gray-200 cursor-pointer';
      default:
        return 'bg-gray-100 border-gray-300';
    }
  };

  const handleContinue = () => {
    if (selectedSeats.length > 0 && flight) {
      const seatInfo = selectedSeats.map(s => s.id).join(',');
      router.push(`/flights/booking/${flight.id}?seats=${seatInfo}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <h2 className="text-xl font-bold text-slate-800">Loading seat map...</h2>
        </div>
      </div>
    );
  }

  // Group seats by row
  const seatsByRow = seats.reduce((acc, seat) => {
    if (!acc[seat.row]) acc[seat.row] = [];
    acc[seat.row].push(seat);
    return acc;
  }, {} as Record<number, Seat[]>);

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
                  <UserIcon className="w-6 h-6" />
                  Select Your Seats
                </h1>
                <p className="text-slate-600 text-sm">
                  Choose your preferred seats for the flight
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-lg font-black text-slate-800">
                {selectedSeats.length} seat{selectedSeats.length !== 1 ? 's' : ''} selected
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Seat Map */}
          <div className="lg:col-span-3">
            <div className="bg-white/70 backdrop-blur-sm border border-white/60 rounded-3xl p-8 shadow-lg">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-black text-slate-800 mb-2">Aircraft Seat Map</h2>
                <p className="text-slate-600">Click on available seats to select them</p>
              </div>

              {/* Legend */}
              <div className="flex justify-center gap-6 mb-8 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 border border-blue-600 rounded"></div>
                  <span>Selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-200 border border-red-300 rounded"></div>
                  <span>Occupied</span>
                </div>
              </div>

              {/* Seat Map */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {Object.entries(seatsByRow).slice(0, 30).map(([row, rowSeats]) => (
                  <div key={row} className="flex items-center justify-center gap-1">
                    <div className="w-8 text-center text-sm font-bold text-slate-600">
                      {row}
                    </div>
                    
                    {rowSeats.map((seat, index) => (
                      <React.Fragment key={seat.id}>
                        <motion.button
                          whileHover={{ scale: seat.status !== 'occupied' ? 1.1 : 1 }}
                          whileTap={{ scale: seat.status !== 'occupied' ? 0.95 : 1 }}
                          onClick={() => handleSeatSelect(seat)}
                          className={`w-8 h-8 rounded border text-xs font-bold transition-all duration-200 ${getSeatColor(seat)}`}
                          disabled={seat.status === 'occupied'}
                        >
                          {seat.status === 'occupied' ? '✗' : seat.status === 'selected' ? '✓' : seat.letter}
                        </motion.button>
                        
                        {/* Aisle gap */}
                        {index === 2 && <div className="w-4"></div>}
                      </React.Fragment>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/70 backdrop-blur-sm border border-white/60 rounded-3xl p-6 shadow-lg sticky top-24">
              <h3 className="text-lg font-black text-slate-800 mb-4">
                Selected Seats
              </h3>
              
              {selectedSeats.length === 0 ? (
                <p className="text-slate-600 text-sm">No seats selected</p>
              ) : (
                <div className="space-y-3 mb-6">
                  {selectedSeats.map((seat) => (
                    <div key={seat.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                      <div>
                        <div className="font-bold text-slate-800">{seat.id}</div>
                        <div className="text-xs text-slate-600 capitalize">{seat.type}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={handleContinue}
                disabled={selectedSeats.length === 0}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue to Booking
              </button>

              <button
                onClick={() => router.push(`/flights/booking/${params.id}`)}
                className="w-full mt-3 px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
              >
                Skip Seat Selection
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}