'use client';

import { useState, useEffect } from 'react';
import { Luggage, Users, Check, Plus, Minus, AlertCircle, Loader2 } from 'lucide-react';
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
    seats: any[];
    other: any[];
  }>({ baggage: [], seats: [], other: [] });

  const [selectedServices, setSelectedServices] = useState<Map<string, number>>(new Map());
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

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

    for (const [serviceId, quantity] of selectedServices) {
      const service = [...services.baggage, ...services.seats, ...services.other]
        .find(s => s.id === serviceId);

      if (service) {
        total += (service.customerPrice || parseFloat(service.totalAmount)) * quantity;
        currency = service.totalCurrency || 'USD';
      }
    }

    return { total, currency };
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
    if (selectedServices.size === 0) return;

    try {
      setPurchasing(true);
      setError(null);

      const servicesToAdd = Array.from(selectedServices.entries()).map(([id, quantity]) => ({
        id,
        quantity,
      }));

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

  return (
    <div className={cn('bg-white rounded-xl border overflow-hidden', className)}>
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-50 to-primary-100 px-6 py-4 border-b">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-500 rounded-lg">
            <Luggage className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Add Extra Bags</h3>
            <p className="text-sm text-gray-600">
              Need more luggage space? Add bags to your booking.
            </p>
          </div>
        </div>
      </div>

      {/* Baggage Options */}
      <div className="p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="space-y-4">
          {services.baggage.map((bag) => {
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
          })}
        </div>

        {/* Total and Purchase button */}
        {selectedServices.size > 0 && (
          <div className="mt-6 pt-4 border-t">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-600">Total for additional services:</span>
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
