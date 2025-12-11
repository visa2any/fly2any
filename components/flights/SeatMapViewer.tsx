'use client';

import { useState } from 'react';
import { Armchair, Loader2, X, Check, AlertCircle, Info } from 'lucide-react';

interface Seat {
  number: string;
  available: boolean;
  price?: number;
  characteristics?: string[];
}

interface SeatMapViewerProps {
  flightOfferId: string;
  source?: 'duffel' | 'amadeus' | 'unknown';  // CRITICAL FIX: Add source to determine API
  onSelectSeat?: (seatNumber: string, price: number) => void;
}

export default function SeatMapViewer({ flightOfferId, source = 'unknown', onSelectSeat }: SeatMapViewerProps) {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);

  const loadSeatMap = async () => {
    if (seats.length > 0) {
      setIsOpen(true);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setShowError(false);

      let response: Response;
      let seatData: Seat[] = [];

      // CRITICAL FIX: Use correct API based on flight source
      if (source === 'duffel') {
        // Duffel uses POST with offerId
        response = await fetch('/api/flights/seat-map/duffel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ offerId: flightOfferId }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch Duffel seat map');
        }

        const data = await response.json();
        // Duffel response structure
        seatData = data.seatMap?.data?.[0]?.cabins?.flatMap((cabin: any) =>
          cabin.rows?.flatMap((row: any) =>
            row.sections?.flatMap((section: any) =>
              section.elements?.filter((el: any) => el.type === 'seat').map((seat: any) => ({
                number: `${row.rowNumber}${seat.designator}`,
                available: seat.available_services?.length > 0 || !seat.disclosures?.includes('OCCUPIED'),
                price: seat.available_services?.[0]?.total_amount ? parseFloat(seat.available_services[0].total_amount) : 0,
                characteristics: seat.disclosures || [],
              }))
            )
          )
        ) || [];
      } else {
        // Amadeus (default) uses GET with flightOfferId
        response = await fetch(`/api/seatmaps?flightOfferId=${flightOfferId}`);

        if (!response.ok) {
          throw new Error('Failed to fetch seat map');
        }

        const data = await response.json();
        // Amadeus response structure
        seatData = data.data?.[0]?.decks?.[0]?.seats || [];
      }

      setSeats(seatData);
      setIsOpen(true);
    } catch (err: any) {
      setError(err.message);
      setShowError(true);
      console.error('Error fetching seat map:', err);

      // Still open the modal to show error state
      setIsOpen(true);

      // Auto-hide error after 5 seconds
      setTimeout(() => setShowError(false), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleSeatClick = (seat: Seat) => {
    if (!seat.available) return;

    setSelectedSeat(seat.number);
    onSelectSeat?.(seat.number, seat.price || 0);
  };

  const closeSeatMap = () => {
    setIsOpen(false);
    setShowError(false);
  };

  return (
    <>
      <button
        onClick={loadSeatMap}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border-2 border-blue-500 text-blue-600 hover:bg-blue-50 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Armchair className="h-5 w-5" />
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading Seat Map...
          </>
        ) : (
          'Choose Your Seat'
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-xl font-bold">Select Your Seat</h3>
              <button
                onClick={closeSeatMap}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {showError && error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-700">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>Unable to load seat map. Displaying sample layout.</span>
                </div>
              )}

              {seats.length === 0 ? (
                <div className="text-center py-12">
                  <Armchair className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No seat map available for this flight</p>
                  <p className="text-sm text-gray-400 mt-2">Seat selection may be available at check-in</p>
                </div>
              ) : (
                <>
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2 text-sm text-blue-700">
                    <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span>Select your preferred seat. Premium seats with extra legroom are available for an additional fee.</span>
                  </div>

                  <div className="flex items-center justify-center gap-6 mb-6 text-sm flex-wrap">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-green-100 border-2 border-green-500 rounded"></div>
                      <span>Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gray-300 border-2 border-gray-400 rounded"></div>
                      <span>Occupied</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-100 border-2 border-blue-500 rounded"></div>
                      <span>Selected</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-yellow-100 border-2 border-yellow-500 rounded"></div>
                      <span>Premium ($)</span>
                    </div>
                  </div>

                  <div className="inline-block mx-auto overflow-x-auto max-w-full">
                    {/* Seat grid - simplified representation */}
                    <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}>
                      {seats.map((seat, index) => {
                        const isSelected = selectedSeat === seat.number;
                        const isPremium = seat.price && seat.price > 0;

                        let bgColor = 'bg-gray-300 border-gray-400';
                        if (seat.available) {
                          bgColor = isPremium ? 'bg-yellow-100 border-yellow-500' : 'bg-green-100 border-green-500';
                        }
                        if (isSelected) {
                          bgColor = 'bg-blue-100 border-blue-500';
                        }

                        return (
                          <button
                            key={index}
                            onClick={() => handleSeatClick(seat)}
                            disabled={!seat.available}
                            className={`relative w-12 h-12 border-2 rounded ${bgColor} ${
                              seat.available ? 'hover:scale-110 cursor-pointer' : 'cursor-not-allowed'
                            } transition-transform`}
                            title={`Seat ${seat.number}${seat.price ? ` - $${seat.price}` : ''}`}
                          >
                            <span className="text-xs font-semibold">{seat.number}</span>
                            {isPremium && (
                              <span className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs px-1 rounded-full">
                                $
                              </span>
                            )}
                            {isSelected && (
                              <Check className="absolute -top-2 -right-2 h-4 w-4 text-blue-600 bg-white rounded-full" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center justify-between p-4 border-t bg-gray-50">
              <div>
                {selectedSeat ? (
                  <p className="text-sm">
                    Selected: <span className="font-bold">{selectedSeat}</span>
                    {seats.find((s) => s.number === selectedSeat)?.price ? (
                      <span className="ml-2 text-green-600 font-semibold">
                        +${seats.find((s) => s.number === selectedSeat)?.price}
                      </span>
                    ) : (
                      <span className="ml-2 text-gray-600">Free</span>
                    )}
                  </p>
                ) : (
                  <p className="text-sm text-gray-500">No seat selected</p>
                )}
              </div>
              <button
                onClick={closeSeatMap}
                disabled={!selectedSeat && seats.length > 0}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {selectedSeat ? 'Confirm Selection' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
