'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

interface FlightData {
  id: string;
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  price: number;
  currency: string;
  airline?: string;
  duration?: string;
  stops?: number;
  [key: string]: any;
}

interface WishlistItem {
  id: string;
  flightData: FlightData;
  notes?: string | null;
  targetPrice?: number | null;
  notifyOnDrop: boolean;
  createdAt: string;
  updatedAt: string;
}

interface WishlistCardProps {
  item: WishlistItem;
  onUpdate?: () => void;
  onDelete?: () => void;
}

export default function WishlistCard({ item, onUpdate, onDelete }: WishlistCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState(item.notes || '');
  const [targetPrice, setTargetPrice] = useState(item.targetPrice?.toString() || '');
  const [isLoading, setIsLoading] = useState(false);

  const { flightData } = item;
  const isPriceDrop = item.targetPrice && flightData.price <= item.targetPrice;

  const handleUpdate = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/wishlist/${item.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notes: notes || undefined,
          targetPrice: targetPrice ? parseFloat(targetPrice) : undefined,
        }),
      });

      if (response.ok) {
        toast.success('Updated successfully');
        setIsEditing(false);
        onUpdate?.();
      } else {
        throw new Error('Failed to update');
      }
    } catch (error) {
      toast.error('Failed to update wishlist item');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Remove this flight from your wishlist?')) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/wishlist/${item.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Removed from wishlist');
        onDelete?.();
      } else {
        throw new Error('Failed to delete');
      }
    } catch (error) {
      toast.error('Failed to remove from wishlist');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-100">
      {/* Price Drop Alert */}
      {isPriceDrop && (
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 text-sm font-semibold flex items-center gap-2">
          <span className="text-lg">🎉</span>
          Price Alert! Now ${flightData.price} (Target: ${item.targetPrice})
        </div>
      )}

      <div className="p-6">
        {/* Flight Route Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-2xl font-bold text-gray-900">
                {flightData.origin} → {flightData.destination}
              </h3>
              {flightData.airline && (
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {flightData.airline}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <span>📅</span>
                <span>{format(new Date(flightData.departureDate), 'MMM dd, yyyy')}</span>
                {flightData.returnDate && (
                  <>
                    <span>→</span>
                    <span>{format(new Date(flightData.returnDate), 'MMM dd, yyyy')}</span>
                  </>
                )}
              </div>
              {flightData.duration && (
                <div className="flex items-center gap-1">
                  <span>⏱️</span>
                  <span>{flightData.duration}</span>
                </div>
              )}
              {flightData.stops !== undefined && (
                <div className="flex items-center gap-1">
                  <span>🛬</span>
                  <span>{flightData.stops === 0 ? 'Nonstop' : `${flightData.stops} stop${flightData.stops > 1 ? 's' : ''}`}</span>
                </div>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">
              ${flightData.price}
            </div>
            <div className="text-sm text-gray-500">{flightData.currency}</div>
          </div>
        </div>

        {/* Notes Section */}
        {isEditing ? (
          <div className="space-y-3 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this flight..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Price ($)
              </label>
              <input
                type="number"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                placeholder="Set your target price"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                step="0.01"
              />
              <p className="text-xs text-gray-500 mt-1">
                We'll notify you when the price drops to or below this amount
              </p>
            </div>
          </div>
        ) : (
          <>
            {item.notes && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">{item.notes}</p>
              </div>
            )}
            {item.targetPrice && (
              <div className="mb-4 flex items-center gap-2 text-sm">
                <span className="text-gray-600">Target Price:</span>
                <span className="font-semibold text-gray-900">${item.targetPrice}</span>
                {item.notifyOnDrop && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                    🔔 Alerts on
                  </span>
                )}
              </div>
            )}
          </>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
          {isEditing ? (
            <>
              <button
                onClick={handleUpdate}
                disabled={isLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setNotes(item.notes || '');
                  setTargetPrice(item.targetPrice?.toString() || '');
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <Link
                href={`/flights/book?flightId=${flightData.id}`}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg font-semibold text-center transition-all transform hover:scale-105"
              >
                Book Now
              </Link>
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                ✏️ Edit
              </button>
              <button
                onClick={handleDelete}
                disabled={isLoading}
                className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                🗑️ Remove
              </button>
            </>
          )}
        </div>

        {/* Metadata */}
        <div className="mt-3 text-xs text-gray-400">
          Added {format(new Date(item.createdAt), 'MMM dd, yyyy')}
        </div>
      </div>
    </div>
  );
}
