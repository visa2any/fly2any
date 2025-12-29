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
      <div className="w-full space-y-4">
        <div className="bg-gradient-to-r from-rose-500 to-pink-600 md:rounded-2xl p-4 md:p-6 text-white">
          <h1 className="text-2xl md:text-3xl font-bold mb-1">My Wishlist</h1>
          <p className="text-white/80 text-sm">Loading your saved flights...</p>
        </div>
        <div className="px-3 md:px-0 flex justify-center py-8">
          <div className="animate-spin text-4xl">✈️</div>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div className="w-full space-y-4">
      {/* Header - Edge-to-edge on mobile */}
      <div className="bg-gradient-to-r from-rose-500 to-pink-600 md:rounded-2xl p-4 md:p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">My Wishlist</h1>
            <p className="text-white/80 text-sm md:text-base">
              Save flights and get notified when prices drop
            </p>
          </div>
          <Link
            href="/flights"
            className="bg-white/20 hover:bg-white/30 backdrop-blur text-white px-4 py-2 rounded-xl font-semibold transition-colors text-sm md:text-base w-fit"
          >
            Search Flights
          </Link>
        </div>
      </div>

      {/* Content wrapper with padding on mobile */}
      <div className="px-3 md:px-0 space-y-4">
        {/* Stats Cards - Horizontal scroll on mobile */}
        <div className="flex md:grid md:grid-cols-3 gap-3 overflow-x-auto pb-2 -mx-3 px-3 md:mx-0 md:px-0 md:overflow-visible scrollbar-hide">
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 min-w-[140px] flex-shrink-0 md:min-w-0">
            <div className="flex items-center gap-3">
              <div className="text-2xl">💙</div>
              <div>
                <div className="text-xl font-bold text-gray-900">
                  {wishlistItems.length}
                </div>
                <div className="text-xs text-gray-500">Saved</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 min-w-[140px] flex-shrink-0 md:min-w-0">
            <div className="flex items-center gap-3">
              <div className="text-2xl">🔔</div>
              <div>
                <div className="text-xl font-bold text-gray-900">
                  {wishlistItems.filter((item) => item.notifyOnDrop).length}
                </div>
                <div className="text-xs text-gray-500">Alerts</div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow-sm p-4 text-white min-w-[140px] flex-shrink-0 md:min-w-0">
            <div className="flex items-center gap-3">
              <div className="text-2xl">🎉</div>
              <div>
                <div className="text-xl font-bold">{priceDropItems.length}</div>
                <div className="text-xs text-white/80">Price Drops</div>
              </div>
            </div>
          </div>
        </div>

        {/* Sort Options */}
        {wishlistItems.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <span className="text-sm text-gray-600 flex-shrink-0">Sort:</span>
            <div className="flex gap-2">
              {[
                { value: 'date', label: 'Date' },
                { value: 'price', label: 'Price' },
                { value: 'destination', label: 'Destination' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSortBy(option.value as any)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex-shrink-0 ${
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

        {/* Price Drop Alerts */}
        {priceDropItems.length > 0 && (
          <div>
            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span>🎯</span>
              Price Drop Alerts
            </h2>
            <div className="space-y-3">
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
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 text-center">
            <div className="text-5xl md:text-6xl mb-4">✈️</div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-gray-600 text-sm md:text-base mb-6">
              Start saving your favorite flights!
            </p>
            <Link
              href="/flights"
              className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold text-sm md:text-base"
            >
              Search Flights
            </Link>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3 text-left">
              <div className="bg-blue-50 rounded-xl p-4">
                <div className="text-xl mb-2">❤️</div>
                <h3 className="font-semibold text-gray-900 mb-1 text-sm">Save Flights</h3>
                <p className="text-xs text-gray-600">
                  Click the heart icon to save
                </p>
              </div>
              <div className="bg-blue-50 rounded-xl p-4">
                <div className="text-xl mb-2">🔔</div>
                <h3 className="font-semibold text-gray-900 mb-1 text-sm">Get Alerts</h3>
                <p className="text-xs text-gray-600">
                  Set target prices for alerts
                </p>
              </div>
              <div className="bg-blue-50 rounded-xl p-4">
                <div className="text-xl mb-2">📝</div>
                <h3 className="font-semibold text-gray-900 mb-1 text-sm">Add Notes</h3>
                <p className="text-xs text-gray-600">
                  Track your travel plans
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3">
              All Saved Flights ({wishlistItems.length})
            </h2>
            <div className="space-y-3">
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
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 md:p-6 border border-purple-100">
            <div className="flex items-start gap-3 md:gap-4">
              <div className="text-3xl md:text-4xl">🔗</div>
              <div className="flex-1">
                <h3 className="text-base md:text-lg font-bold text-gray-900 mb-1">
                  Share Your Wishlist
                </h3>
                <p className="text-gray-600 text-sm mb-3">
                  Plan trips with friends and family!
                </p>
                <button
                  disabled
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold opacity-50 cursor-not-allowed text-sm"
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
