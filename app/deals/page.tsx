'use client';

import { useState } from 'react';
import DealCard from '@/components/deals/DealCard';

// Mock deals data - In production, this would come from API
const generateMockDeals = () => {
  const destinations = [
    { city: 'Paris', country: 'France', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34' },
    { city: 'Tokyo', country: 'Japan', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf' },
    { city: 'Bali', country: 'Indonesia', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4' },
    { city: 'Dubai', country: 'UAE', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c' },
    { city: 'New York', country: 'USA', image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9' },
    { city: 'Barcelona', country: 'Spain', image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded' },
    { city: 'Maldives', country: 'Maldives', image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8' },
    { city: 'London', country: 'UK', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad' },
  ];

  const dealTypes: Array<'flash' | 'lastMinute' | 'seasonal' | 'featured'> = ['flash', 'lastMinute', 'seasonal', 'featured'];

  return destinations.map((dest, i) => {
    const originalPrice = 800 + Math.floor(Math.random() * 1200);
    const savingsPercent = 20 + Math.floor(Math.random() * 50);
    const price = Math.floor(originalPrice * (1 - savingsPercent / 100));
    const dealScore = 65 + Math.floor(Math.random() * 35);

    return {
      id: `deal-${i + 1}`,
      origin: 'LAX',
      destination: dest.city,
      departureDate: new Date(Date.now() + Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
      returnDate: new Date(Date.now() + Math.random() * 60 * 24 * 60 * 60 * 1000 + 7 * 24 * 60 * 60 * 1000).toISOString(),
      price,
      originalPrice,
      currency: 'USD',
      airline: ['Delta', 'United', 'American', 'Emirates', 'British Airways'][Math.floor(Math.random() * 5)],
      duration: `${8 + Math.floor(Math.random() * 10)}h ${Math.floor(Math.random() * 60)}m`,
      stops: Math.floor(Math.random() * 3),
      dealType: dealTypes[i % 4],
      expiresAt: new Date(Date.now() + (2 + Math.random() * 48) * 60 * 60 * 1000).toISOString(),
      savingsPercent,
      dealScore,
      imageUrl: dest.image,
      seatsLeft: Math.random() > 0.5 ? Math.floor(Math.random() * 15) + 1 : undefined,
    };
  });
};

export default function DealsPage() {
  const [deals] = useState(generateMockDeals());
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'savings' | 'price' | 'score'>('score');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [emailAlert, setEmailAlert] = useState('');

  const filteredDeals = deals
    .filter((deal) => filterType === 'all' || deal.dealType === filterType)
    .filter((deal) => deal.price >= priceRange[0] && deal.price <= priceRange[1])
    .sort((a, b) => {
      switch (sortBy) {
        case 'savings':
          return b.savingsPercent - a.savingsPercent;
        case 'price':
          return a.price - b.price;
        case 'score':
        default:
          return b.dealScore - a.dealScore;
      }
    });

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Thank you! We'll send deal alerts to ${emailAlert}`);
    setEmailAlert('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-2xl p-8 mb-8 text-white shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-black mb-3 drop-shadow-lg">
                🔥 Hot Travel Deals
              </h1>
              <p className="text-xl opacity-90 mb-4">
                Save up to 70% on amazing destinations worldwide
              </p>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⚡</span>
                  <span>{deals.filter(d => d.dealType === 'flash').length} Flash Sales</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🔥</span>
                  <span>{deals.filter(d => d.dealType === 'lastMinute').length} Last Minute</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⭐</span>
                  <span>{deals.filter(d => d.dealType === 'featured').length} Featured</span>
                </div>
              </div>
            </div>
            <div className="text-8xl animate-bounce">
              ✈️
            </div>
          </div>
        </div>

        {/* Deal Alert Subscription */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Never Miss a Deal!
              </h3>
              <p className="text-gray-600">
                Subscribe to get exclusive deals and flash sales sent directly to your inbox
              </p>
            </div>
            <form onSubmit={handleSubscribe} className="flex gap-2 ml-4">
              <input
                type="email"
                value={emailAlert}
                onChange={(e) => setEmailAlert(e.target.value)}
                placeholder="Enter your email"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent w-64"
                required
              />
              <button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Filters and Sort */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-100">
          <div className="flex flex-wrap items-center gap-4">
            {/* Filter by Type */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deal Type
              </label>
              <div className="flex gap-2 flex-wrap">
                {[
                  { value: 'all', label: 'All Deals', icon: '🌟' },
                  { value: 'flash', label: 'Flash', icon: '⚡' },
                  { value: 'lastMinute', label: 'Last Minute', icon: '🔥' },
                  { value: 'seasonal', label: 'Seasonal', icon: '🌸' },
                  { value: 'featured', label: 'Featured', icon: '⭐' },
                ].map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setFilterType(type.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      filterType === type.value
                        ? 'bg-orange-500 text-white shadow-lg transform scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span className="mr-1">{type.icon}</span>
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="score">Best Deal Score</option>
                <option value="savings">Highest Savings</option>
                <option value="price">Lowest Price</option>
              </select>
            </div>

            {/* Price Range */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Range: ${priceRange[0]} - ${priceRange[1]}
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="range"
                  min="0"
                  max="2000"
                  step="50"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                  className="flex-1"
                />
                <input
                  type="range"
                  min="0"
                  max="2000"
                  step="50"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {filteredDeals.length} Amazing Deals Found
          </h2>
          <p className="text-gray-600">
            Limited time offers - Book now before they expire!
          </p>
        </div>

        {/* Deals Grid */}
        {filteredDeals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDeals.map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">😢</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              No deals match your filters
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your filters to see more deals
            </p>
            <button
              onClick={() => {
                setFilterType('all');
                setPriceRange([0, 2000]);
              }}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* How It Works */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            How Our Deals Work
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-5xl mb-3">🔍</div>
              <h3 className="font-bold text-gray-900 mb-2">We Find</h3>
              <p className="text-sm text-gray-600">
                Our AI scans millions of flights daily to find the best deals
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-3">📊</div>
              <h3 className="font-bold text-gray-900 mb-2">We Score</h3>
              <p className="text-sm text-gray-600">
                Each deal gets a score based on savings, route, and timing
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-3">⚡</div>
              <h3 className="font-bold text-gray-900 mb-2">You Save</h3>
              <p className="text-sm text-gray-600">
                Book incredible deals at up to 70% off regular prices
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-3">✈️</div>
              <h3 className="font-bold text-gray-900 mb-2">You Travel</h3>
              <p className="text-sm text-gray-600">
                Enjoy your dream vacation without breaking the bank
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
