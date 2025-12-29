'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import WishlistCard from '@/components/wishlist/WishlistCard';
import Link from 'next/link';

interface WishlistItem {
  id: string;
  flightData: any;
  notes?: string | null;
  targetPrice?: number | null;
  notifyOnDrop: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function WishlistPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'date' | 'price' | 'destination'>('date');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/account/wishlist');
    } else if (status === 'authenticated') {
      fetchWishlist();
    }
  }, [status, router]);

  const fetchWishlist = async () => {
    try {
      const response = await fetch('/api/wishlist');
      if (response.ok) {
        const data = await response.json();
        setWishlistItems(data.items);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSortedItems = () => {
    const items = [...wishlistItems];
    switch (sortBy) {
      case 'price':
        return items.sort((a, b) => a.flightData.price - b.flightData.price);
      case 'destination':
        return items.sort((a, b) =>
          a.flightData.destination.localeCompare(b.flightData.destination)
        );
      case 'date':
      default:
        return items.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }
  };

  const priceDropItems = wishlistItems.filter(
    (item) => item.targetPrice && item.flightData.price <= item.targetPrice
  );

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">✈️</div>
          <p className="text-gray-600">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                My Travel Wishlist ❤️
              </h1>
              <p className="text-gray-600">
                Save your favorite flights and get notified when prices drop
              </p>
            </div>
            <Link
              href="/flights"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Search Flights
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="text-3xl">💙</div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {wishlistItems.length}
                  </div>
                  <div className="text-sm text-gray-600">Saved Flights</div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="text-3xl">🔔</div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {wishlistItems.filter((item) => item.notifyOnDrop).length}
                  </div>
                  <div className="text-sm text-gray-600">Price Alerts Active</div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg shadow-sm p-4 text-white">
              <div className="flex items-center gap-3">
                <div className="text-3xl">🎉</div>
                <div>
                  <div className="text-2xl font-bold">{priceDropItems.length}</div>
                  <div className="text-sm">Price Drops Detected!</div>
                </div>
              </div>
            </div>
          </div>

          {/* Sort Options */}
          {wishlistItems.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <div className="flex gap-2">
                {[
                  { value: 'date', label: 'Date Added' },
                  { value: 'price', label: 'Price' },
                  { value: 'destination', label: 'Destination' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSortBy(option.value as any)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      sortBy === option.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Price Drop Alerts */}
        {priceDropItems.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>🎯</span>
              Price Drop Alerts
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {priceDropItems.map((item) => (
                <WishlistCard
                  key={item.id}
                  item={item}
                  onUpdate={fetchWishlist}
                  onDelete={fetchWishlist}
                />
              ))}
            </div>
          </div>
        )}

        {/* Wishlist Items */}
        {wishlistItems.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">✈️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-gray-600 mb-6">
              Start saving your favorite flights and we'll help you track prices!
            </p>
            <Link
              href="/flights"
              className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-lg font-semibold transition-all transform hover:scale-105"
            >
              Search Flights
            </Link>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-2xl mb-2">❤️</div>
                <h3 className="font-semibold text-gray-900 mb-1">Save Flights</h3>
                <p className="text-sm text-gray-600">
                  Click the heart icon on any flight to save it
                </p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-2xl mb-2">🔔</div>
                <h3 className="font-semibold text-gray-900 mb-1">Get Alerts</h3>
                <p className="text-sm text-gray-600">
                  Set target prices and receive notifications
                </p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-2xl mb-2">📝</div>
                <h3 className="font-semibold text-gray-900 mb-1">Add Notes</h3>
                <p className="text-sm text-gray-600">
                  Keep track of travel plans and preferences
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              All Saved Flights ({wishlistItems.length})
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {getSortedItems().map((item) => (
                <WishlistCard
                  key={item.id}
                  item={item}
                  onUpdate={fetchWishlist}
                  onDelete={fetchWishlist}
                />
              ))}
            </div>
          </div>
        )}

        {/* Share Wishlist Feature (Coming Soon) */}
        {wishlistItems.length > 0 && (
          <div className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
            <div className="flex items-start gap-4">
              <div className="text-4xl">🔗</div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Share Your Wishlist
                </h3>
                <p className="text-gray-600 mb-3">
                  Planning a trip with friends or family? Share your wishlist and plan together!
                </p>
                <button
                  disabled
                  className="bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold opacity-50 cursor-not-allowed"
                >
                  Coming Soon
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
