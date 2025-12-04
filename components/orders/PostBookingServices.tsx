'use client';

import { useState, useEffect } from 'react';
import { Luggage, Users, Check, Plus, Minus, AlertCircle, Loader2, Armchair, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BaggageOption {
  id: string;
  name: string;
  weight: { value: number; unit: string };
  customerPrice: number;
  netPrice: number;
  totalCurrency: string;
  displayPrice: string;
  maxQuantity: number;
  segmentIds: string[];
  passengerIds: string[];
}

interface SeatOption {
  id: string;
  designator: string;
  row: number;
  column: string;
  available: boolean;
  customerPrice: number;
  netPrice: number;
  totalCurrency: string;
  displayPrice: string;
  type?: 'standard' | 'extra_legroom' | 'exit_row' | 'premium';
  position?: 'window' | 'middle' | 'aisle';
  passengerIds: string[];
  segmentIds: string[];
}

interface PostBookingServicesProps {
  orderId: string;
  onServicesPurchased?: (services: any) => void;
  className?: string;
}

/**
 * Post-Booking Services Component
 *
 * Allows customers to add bags and other services to their
 * existing booking after checkout.
 *
 * Revenue opportunity: $25-75 per bag with 25% markup
 */
export function PostBookingServices({
  orderId,
  onServicesPurchased,
  className,
}: PostBookingServicesProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [services, setServices] = useState<{
    baggage: BaggageOption[];
    seats: SeatOption[];
    other: any[];
  }>({ baggage: [], seats: [], other: [] });

  const [selectedServices, setSelectedServices] = useState<Map<string, number>>(new Map());
  const [selectedSeats, setSelectedSeats] = useState<Set<string>>(new Set());
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'baggage' | 'seats'>('baggage');
  const [expandedSeatRows, setExpandedSeatRows] = useState<Set<number>>(new Set());

  // Fetch available services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/orders/${orderId}/services`);
        const data = await response.json();

        if (!data.success) {
          setError(data.error || 'Failed to load services');
          return;
        }

        setServices(data.data);
      } catch (err: any) {
        setError(err.message || 'Failed to load available services');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchServices();
    }
  }, [orderId]);

  // Calculate total cost
  const calculateTotal = () => {
    let total = 0;
    let currency = 'USD';

    // Baggage services
    for (const [serviceId, quantity] of selectedServices) {
      const service = [...services.baggage, ...services.other]
        .find(s => s.id === serviceId);

      if (service) {
        total += (service.customerPrice || parseFloat((service as any).totalAmount)) * quantity;
        currency = service.totalCurrency || 'USD';
      }
    }

    // Seat services
    for (const seatId of selectedSeats) {
      const seat = services.seats.find(s => s.id === seatId);
      if (seat) {
        total += seat.customerPrice;
        currency = seat.totalCurrency || 'USD';
      }
    }

    return { total, currency };
  };

  // Toggle seat selection
  const toggleSeat = (seatId: string) => {
    const seat = services.seats.find(s => s.id === seatId);
    if (!seat || !seat.available) return;

    const newSelected = new Set(selectedSeats);
    if (newSelected.has(seatId)) {
      newSelected.delete(seatId);
    } else {
      newSelected.add(seatId);
    }
    setSelectedSeats(newSelected);
  };

  // Group seats by row for display
  const getSeatsByRow = () => {
    const byRow = new Map<number, SeatOption[]>();
    services.seats.forEach(seat => {
      const row = seat.row || parseInt(seat.designator?.match(/\d+/)?.[0] || '1');
      if (!byRow.has(row)) {
        byRow.set(row, []);
      }
      byRow.get(row)!.push(seat);
    });
    // Sort seats within each row by column
    byRow.forEach((seats) => {
      seats.sort((a, b) => (a.column || 'A').localeCompare(b.column || 'B'));
    });
    return byRow;
  };

  // Get seat style based on type and selection
  const getSeatStyle = (seat: SeatOption, isSelected: boolean) => {
    if (!seat.available) {
      return 'bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed';
    }
    if (isSelected) {
      return 'bg-primary-500 border-primary-600 text-white';
    }
    switch (seat.type) {
      case 'premium':
        return 'bg-purple-50 border-purple-300 text-purple-700 hover:bg-purple-100 cursor-pointer';
      case 'extra_legroom':
      case 'exit_row':
        return 'bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100 cursor-pointer';
      default:
        return 'bg-green-50 border-green-300 text-green-700 hover:bg-green-100 cursor-pointer';
    }
  };

  // Update service quantity
  const updateQuantity = (serviceId: string, delta: number) => {
    const service = services.baggage.find(s => s.id === serviceId);
    if (!service) return;

    const currentQty = selectedServices.get(serviceId) || 0;
    const newQty = Math.max(0, Math.min(currentQty + delta, service.maxQuantity));

    const newSelected = new Map(selectedServices);
    if (newQty === 0) {
      newSelected.delete(serviceId);
    } else {
      newSelected.set(serviceId, newQty);
    }
    setSelectedServices(newSelected);
  };

  // Purchase selected services
  const handlePurchase = async () => {
    if (selectedServices.size === 0 && selectedSeats.size === 0) return;

    try {
      setPurchasing(true);
      setError(null);

      // Combine baggage and seat services
      const servicesToAdd = [
        ...Array.from(selectedServices.entries()).map(([id, quantity]) => ({
          id,
          quantity,
        })),
        ...Array.from(selectedSeats).map(id => ({
          id,
          quantity: 1,
        })),
      ];

      const response = await fetch(`/api/orders/${orderId}/services`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ services: servicesToAdd }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || 'Failed to add services');
        return;
      }

      setPurchaseSuccess(true);
      setSelectedServices(new Map());
      setSelectedSeats(new Set());

      if (onServicesPurchased) {
        onServicesPurchased(data.data);
      }

      // Refresh available services
      const refreshResponse = await fetch(`/api/orders/${orderId}/services`);
      const refreshData = await refreshResponse.json();
      if (refreshData.success) {
        setServices(refreshData.data);
      }

    } catch (err: any) {
      setError(err.message || 'Failed to purchase services');
    } finally {
      setPurchasing(false);
    }
  };

  const { total, currency } = calculateTotal();

  // Loading state
  if (loading) {
    return (
      <div className={cn('bg-white rounded-xl border p-6', className)}>
        <div className="flex items-center justify-center gap-2 text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading available services...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !services.baggage.length) {
    return (
      <div className={cn('bg-white rounded-xl border p-6', className)}>
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  // No services available
  if (!services.baggage.length && !services.seats.length) {
    return (
      <div className={cn('bg-white rounded-xl border p-6', className)}>
        <div className="text-center text-gray-500">
          <Luggage className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="font-medium">No Additional Services Available</p>
          <p className="text-sm mt-1">
            Extra bags and services are not available for this booking.
          </p>
        </div>
      </div>
    );
  }

  // Success state
  if (purchaseSuccess) {
    return (
      <div className={cn('bg-white rounded-xl border p-6', className)}>
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Services Added Successfully!
          </h3>
          <p className="text-gray-600 mb-4">
            Your additional services have been added to your booking.
          </p>
          <button
            onClick={() => setPurchaseSuccess(false)}
            className="text-primary-600 hover:text-primary-700 font-medium text-sm"
          >
            Add more services
          </button>
        </div>
      </div>
    );
  }

  const totalSelected = selectedServices.size + selectedSeats.size;
  const seatsByRow = getSeatsByRow();

  return (
    <div className={cn('bg-white rounded-xl border overflow-hidden', className)}>
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-50 to-primary-100 px-6 py-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-500 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Add Services to Your Booking</h3>
              <p className="text-sm text-gray-600">
                Add extra bags or select your seats
              </p>
            </div>
          </div>
          {totalSelected > 0 && (
            <div className="text-right">
              <p className="text-sm text-gray-500">{totalSelected} selected</p>
              <p className="text-lg font-bold text-gray-900">
                {currency} {total.toFixed(2)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('baggage')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-colors',
            activeTab === 'baggage'
              ? 'text-primary-600 border-b-2 border-primary-500 bg-primary-50'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          )}
        >
          <Luggage className="w-4 h-4" />
          Extra Bags
          {services.baggage.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-xs bg-gray-100 rounded-full">
              {services.baggage.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('seats')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-colors',
            activeTab === 'seats'
              ? 'text-primary-600 border-b-2 border-primary-500 bg-primary-50'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          )}
        >
          <Armchair className="w-4 h-4" />
          Seat Selection
          {services.seats.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-xs bg-gray-100 rounded-full">
              {services.seats.filter(s => s.available).length}
            </span>
          )}
        </button>
      </div>

      {/* Content Area */}
      <div className="p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Baggage Tab Content */}
        {activeTab === 'baggage' && (
          <div className="space-y-4">
            {services.baggage.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Luggage className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No extra bags available for this booking</p>
              </div>
            ) : (
              services.baggage.map((bag) => {
                const quantity = selectedServices.get(bag.id) || 0;
                const isSelected = quantity > 0;

                return (
                  <div
                    key={bag.id}
                    className={cn(
                      'border rounded-lg p-4 transition-all',
                      isSelected
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'p-2 rounded-lg',
                          isSelected ? 'bg-primary-500' : 'bg-gray-100'
                        )}>
                          <Luggage className={cn(
                            'w-5 h-5',
                            isSelected ? 'text-white' : 'text-gray-500'
                          )} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{bag.name}</p>
                          <p className="text-sm text-gray-500">
                            Max {bag.weight.value}{bag.weight.unit}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {/* Price */}
                        <div className="text-right">
                          <p className="font-bold text-gray-900">
                            {bag.displayPrice || `${bag.totalCurrency} ${bag.customerPrice?.toFixed(2)}`}
                          </p>
                          <p className="text-xs text-gray-500">per bag</p>
                        </div>

                        {/* Quantity selector */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(bag.id, -1)}
                            disabled={quantity === 0}
                            className={cn(
                              'w-8 h-8 rounded-full flex items-center justify-center transition-colors',
                              quantity === 0
                                ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            )}
                          >
                            <Minus className="w-4 h-4" />
                          </button>

                          <span className="w-8 text-center font-semibold text-gray-900">
                            {quantity}
                          </span>

                          <button
                            onClick={() => updateQuantity(bag.id, 1)}
                            disabled={quantity >= bag.maxQuantity}
                            className={cn(
                              'w-8 h-8 rounded-full flex items-center justify-center transition-colors',
                              quantity >= bag.maxQuantity
                                ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                : 'bg-primary-500 text-white hover:bg-primary-600'
                            )}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Per-passenger note */}
                    {bag.passengerIds?.length > 0 && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                        <Users className="w-3 h-3" />
                        <span>
                          Applies to {bag.passengerIds.length} passenger(s)
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Seats Tab Content */}
        {activeTab === 'seats' && (
          <div>
            {services.seats.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Armchair className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No seat selection available for this booking</p>
              </div>
            ) : (
              <>
                {/* Legend */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs font-medium text-gray-600 mb-2">Seat Legend:</p>
                  <div className="flex flex-wrap gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <div className="w-5 h-5 rounded bg-green-50 border border-green-300" />
                      <span>Available</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-5 h-5 rounded bg-blue-50 border border-blue-300" />
                      <span>Extra Legroom</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-5 h-5 rounded bg-purple-50 border border-purple-300" />
                      <span>Premium</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-5 h-5 rounded bg-gray-200 border border-gray-300" />
                      <span>Unavailable</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-5 h-5 rounded bg-primary-500 border border-primary-600" />
                      <span>Selected</span>
                    </div>
                  </div>
                </div>

                {/* Seat Map */}
                <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
                  <div className="min-w-[280px] space-y-2">
                    {Array.from(seatsByRow.entries())
                      .sort(([a], [b]) => a - b)
                      .map(([rowNum, rowSeats]) => (
                        <div key={rowNum} className="flex items-center gap-2">
                          {/* Row number */}
                          <div className="w-8 text-center text-xs font-bold text-gray-600">
                            {rowNum}
                          </div>

                          {/* Seats in row */}
                          <div className="flex gap-1 flex-1 justify-center">
                            {rowSeats.slice(0, Math.ceil(rowSeats.length / 2)).map((seat) => {
                              const isSelected = selectedSeats.has(seat.id);
                              return (
                                <button
                                  key={seat.id}
                                  onClick={() => toggleSeat(seat.id)}
                                  disabled={!seat.available}
                                  className={cn(
                                    'w-9 h-9 rounded border-2 flex flex-col items-center justify-center text-[10px] font-bold transition-all',
                                    getSeatStyle(seat, isSelected)
                                  )}
                                  title={`${seat.designator} - ${seat.displayPrice}`}
                                >
                                  {isSelected ? <Check className="w-3 h-3" /> : seat.column}
                                  {seat.customerPrice > 0 && !isSelected && (
                                    <span className="text-[8px]">${Math.round(seat.customerPrice)}</span>
                                  )}
                                </button>
                              );
                            })}

                            {/* Aisle indicator */}
                            <div className="w-4 flex items-center justify-center text-gray-300 text-[10px]">↔</div>

                            {rowSeats.slice(Math.ceil(rowSeats.length / 2)).map((seat) => {
                              const isSelected = selectedSeats.has(seat.id);
                              return (
                                <button
                                  key={seat.id}
                                  onClick={() => toggleSeat(seat.id)}
                                  disabled={!seat.available}
                                  className={cn(
                                    'w-9 h-9 rounded border-2 flex flex-col items-center justify-center text-[10px] font-bold transition-all',
                                    getSeatStyle(seat, isSelected)
                                  )}
                                  title={`${seat.designator} - ${seat.displayPrice}`}
                                >
                                  {isSelected ? <Check className="w-3 h-3" /> : seat.column}
                                  {seat.customerPrice > 0 && !isSelected && (
                                    <span className="text-[8px]">${Math.round(seat.customerPrice)}</span>
                                  )}
                                </button>
                              );
                            })}
                          </div>

                          {/* Row number right */}
                          <div className="w-8 text-center text-xs font-bold text-gray-600">
                            {rowNum}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Selected seats summary */}
                {selectedSeats.size > 0 && (
                  <div className="mt-4 p-3 bg-primary-50 border border-primary-200 rounded-lg">
                    <p className="text-sm font-medium text-gray-900 mb-2">Selected Seats:</p>
                    <div className="flex flex-wrap gap-2">
                      {Array.from(selectedSeats).map(seatId => {
                        const seat = services.seats.find(s => s.id === seatId);
                        return seat ? (
                          <span
                            key={seatId}
                            className="px-2 py-1 bg-primary-500 text-white text-xs rounded-full flex items-center gap-1"
                          >
                            {seat.designator}
                            <button
                              onClick={() => toggleSeat(seatId)}
                              className="hover:bg-primary-600 rounded-full p-0.5"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Total and Purchase button */}
        {totalSelected > 0 && (
          <div className="mt-6 pt-4 border-t">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-gray-600">Total for additional services:</span>
                <div className="text-xs text-gray-500 mt-1">
                  {selectedServices.size > 0 && `${selectedServices.size} bag(s)`}
                  {selectedServices.size > 0 && selectedSeats.size > 0 && ' + '}
                  {selectedSeats.size > 0 && `${selectedSeats.size} seat(s)`}
                </div>
              </div>
              <span className="text-xl font-bold text-gray-900">
                {currency} {total.toFixed(2)}
              </span>
            </div>

            <button
              onClick={handlePurchase}
              disabled={purchasing}
              className={cn(
                'w-full py-3 px-4 rounded-lg font-semibold text-white transition-all',
                purchasing
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-primary-500 hover:bg-primary-600 shadow-md hover:shadow-lg'
              )}
            >
              {purchasing ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </span>
              ) : (
                `Add to Booking - ${currency} ${total.toFixed(2)}`
              )}
            </button>

            <p className="mt-2 text-xs text-center text-gray-500">
              Payment will be charged to your original payment method
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PostBookingServices;
