'use client';

import { useState } from 'react';
import DestinationCard from '@/components/explore/DestinationCard';

// Mock destinations data
const destinations = [
  {
    id: 'paris',
    city: 'Paris',
    country: 'France',
    region: 'Europe',
    imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800',
    priceFrom: 450,
    currency: 'USD',
    description: 'The City of Light beckons with iconic landmarks, world-class museums, and unparalleled charm.',
    tags: ['Romantic', 'Culture', 'Food'],
    trending: true,
    bestMonths: ['Apr-Jun', 'Sep-Oct'],
    popularActivities: ['Eiffel Tower', 'Louvre Museum', 'Seine River Cruise', 'Cafe Culture'],
  },
  {
    id: 'tokyo',
    city: 'Tokyo',
    country: 'Japan',
    region: 'Asia',
    imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
    priceFrom: 680,
    currency: 'USD',
    description: 'Ancient traditions meet cutting-edge technology in this mesmerizing metropolis.',
    tags: ['Technology', 'Culture', 'Food'],
    trending: true,
    bestMonths: ['Mar-May', 'Sep-Nov'],
    popularActivities: ['Temples', 'Sushi', 'Shopping', 'Cherry Blossoms'],
  },
  {
    id: 'bali',
    city: 'Bali',
    country: 'Indonesia',
    region: 'Asia',
    imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800',
    priceFrom: 520,
    currency: 'USD',
    description: 'Tropical paradise with stunning beaches, ancient temples, and vibrant culture.',
    tags: ['Beach', 'Relaxation', 'Adventure'],
    seasonal: true,
    bestMonths: ['Apr-Oct'],
    popularActivities: ['Beach Clubs', 'Yoga Retreats', 'Rice Terraces', 'Surfing'],
  },
  {
    id: 'dubai',
    city: 'Dubai',
    country: 'UAE',
    region: 'Middle East',
    imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800',
    priceFrom: 590,
    currency: 'USD',
    description: 'Luxury and innovation collide in this desert oasis of towering skyscrapers.',
    tags: ['Luxury', 'Shopping', 'Modern'],
    trending: true,
    bestMonths: ['Nov-Mar'],
    popularActivities: ['Burj Khalifa', 'Desert Safari', 'Shopping Malls', 'Beach Clubs'],
  },
  {
    id: 'newyork',
    city: 'New York',
    country: 'USA',
    region: 'North America',
    imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800',
    priceFrom: 280,
    currency: 'USD',
    description: 'The city that never sleeps offers endless entertainment, culture, and energy.',
    tags: ['Urban', 'Culture', 'Entertainment'],
    trending: true,
    bestMonths: ['Apr-Jun', 'Sep-Nov'],
    popularActivities: ['Broadway', 'Central Park', 'Museums', 'Food Scene'],
  },
  {
    id: 'barcelona',
    city: 'Barcelona',
    country: 'Spain',
    region: 'Europe',
    imageUrl: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800',
    priceFrom: 420,
    currency: 'USD',
    description: "Gaudi's architectural masterpieces dot this vibrant Mediterranean coastal city.",
    tags: ['Architecture', 'Beach', 'Culture'],
    seasonal: true,
    bestMonths: ['May-Jun', 'Sep-Oct'],
    popularActivities: ['Sagrada Familia', 'Park Guell', 'Beach', 'Tapas'],
  },
  {
    id: 'maldives',
    city: 'Maldives',
    country: 'Maldives',
    region: 'Asia',
    imageUrl: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800',
    priceFrom: 890,
    currency: 'USD',
    description: 'Pristine white-sand beaches and crystal-clear waters define this island paradise.',
    tags: ['Beach', 'Luxury', 'Honeymoon'],
    seasonal: true,
    bestMonths: ['Nov-Apr'],
    popularActivities: ['Diving', 'Snorkeling', 'Spa', 'Water Villas'],
  },
  {
    id: 'london',
    city: 'London',
    country: 'UK',
    region: 'Europe',
    imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800',
    priceFrom: 480,
    currency: 'USD',
    description: 'Historic landmarks and modern culture blend seamlessly in this iconic city.',
    tags: ['History', 'Culture', 'Urban'],
    bestMonths: ['May-Sep'],
    popularActivities: ['British Museum', 'Tower of London', 'West End', 'Pubs'],
  },
  {
    id: 'rome',
    city: 'Rome',
    country: 'Italy',
    region: 'Europe',
    imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800',
    priceFrom: 430,
    currency: 'USD',
    description: 'Ancient history comes alive amid stunning architecture and delicious cuisine.',
    tags: ['History', 'Food', 'Culture'],
    trending: true,
    bestMonths: ['Apr-Jun', 'Sep-Oct'],
    popularActivities: ['Colosseum', 'Vatican', 'Pasta', 'Gelato'],
  },
  {
    id: 'santorini',
    city: 'Santorini',
    country: 'Greece',
    region: 'Europe',
    imageUrl: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800',
    priceFrom: 550,
    currency: 'USD',
    description: 'Whitewashed buildings and blue-domed churches overlook the stunning Aegean Sea.',
    tags: ['Romantic', 'Beach', 'Photography'],
    seasonal: true,
    bestMonths: ['Apr-Oct'],
    popularActivities: ['Sunset Views', 'Wine Tasting', 'Beach', 'Villages'],
  },
  {
    id: 'sydney',
    city: 'Sydney',
    country: 'Australia',
    region: 'Oceania',
    imageUrl: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800',
    priceFrom: 820,
    currency: 'USD',
    description: 'Iconic harbor views and world-famous beaches define this vibrant Australian city.',
    tags: ['Beach', 'Urban', 'Adventure'],
    bestMonths: ['Sep-Nov', 'Feb-May'],
    popularActivities: ['Opera House', 'Harbour Bridge', 'Bondi Beach', 'Coastal Walks'],
  },
  {
    id: 'iceland',
    city: 'Reykjavik',
    country: 'Iceland',
    region: 'Europe',
    imageUrl: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=800',
    priceFrom: 620,
    currency: 'USD',
    description: 'Land of fire and ice with stunning natural phenomena and unique landscapes.',
    tags: ['Nature', 'Adventure', 'Northern Lights'],
    seasonal: true,
    bestMonths: ['Jun-Aug', 'Dec-Feb'],
    popularActivities: ['Northern Lights', 'Blue Lagoon', 'Glaciers', 'Waterfalls'],
  },
];

export default function ExplorePage() {
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceFilter, setPriceFilter] = useState<'all' | 'budget' | 'moderate' | 'luxury'>('all');

  const regions = ['all', 'Europe', 'Asia', 'North America', 'Middle East', 'Oceania'];
  const allTags = Array.from(new Set(destinations.flatMap(d => d.tags)));

  const filteredDestinations = destinations
    .filter(d => selectedRegion === 'all' || d.region === selectedRegion)
    .filter(d => selectedTag === 'all' || d.tags.includes(selectedTag))
    .filter(d =>
      searchQuery === '' ||
      d.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.country.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(d => {
      if (priceFilter === 'budget') return d.priceFrom < 500;
      if (priceFilter === 'moderate') return d.priceFrom >= 500 && d.priceFrom < 700;
      if (priceFilter === 'luxury') return d.priceFrom >= 700;
      return true;
    });

  const trendingDestinations = destinations.filter(d => d.trending);
  const seasonalDestinations = destinations.filter(d => d.seasonal);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-black text-gray-900 mb-4">
            Explore the World 🌍
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Discover amazing destinations and plan your next adventure
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search destinations..."
                className="w-full px-6 py-4 pl-12 text-lg border-2 border-gray-300 rounded-full focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-2xl">
                🔍
              </span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="space-y-4">
            {/* Region Filter */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Select Region
              </label>
              <div className="flex flex-wrap gap-2">
                {regions.map((region) => (
                  <button
                    key={region}
                    onClick={() => setSelectedRegion(region)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      selectedRegion === region
                        ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {region === 'all' ? 'All Regions' : region}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Budget Range
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'all', label: 'All Prices', icon: '💰' },
                  { value: 'budget', label: 'Budget (<$500)', icon: '💵' },
                  { value: 'moderate', label: 'Moderate ($500-700)', icon: '💳' },
                  { value: 'luxury', label: 'Luxury ($700+)', icon: '💎' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setPriceFilter(option.value as any)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      priceFilter === option.value
                        ? 'bg-green-600 text-white shadow-lg transform scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span className="mr-1">{option.icon}</span>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tag Filter */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Travel Style
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedTag('all')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedTag === 'all'
                      ? 'bg-purple-600 text-white shadow-lg transform scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All Styles
                </button>
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      selectedTag === tag
                        ? 'bg-purple-600 text-white shadow-lg transform scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Trending Destinations */}
        {selectedRegion === 'all' && selectedTag === 'all' && !searchQuery && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span>🔥</span>
              Trending Now
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingDestinations.map((destination) => (
                <DestinationCard key={destination.id} destination={destination} />
              ))}
            </div>
          </div>
        )}

        {/* Seasonal Picks */}
        {selectedRegion === 'all' && selectedTag === 'all' && !searchQuery && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span>🌸</span>
              Seasonal Favorites
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {seasonalDestinations.map((destination) => (
                <DestinationCard key={destination.id} destination={destination} />
              ))}
            </div>
          </div>
        )}

        {/* All Destinations */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            {filteredDestinations.length} Destinations Found
          </h2>
          {filteredDestinations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDestinations.map((destination) => (
                <DestinationCard key={destination.id} destination={destination} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                No destinations match your filters
              </h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your filters or search terms
              </p>
              <button
                onClick={() => {
                  setSelectedRegion('all');
                  setSelectedTag('all');
                  setSearchQuery('');
                  setPriceFilter('all');
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>

        {/* Travel Tips */}
        <div className="mt-12 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-8 border border-indigo-100">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Plan Your Perfect Trip
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl mb-3">📅</div>
              <h3 className="font-bold text-gray-900 mb-2">Best Time to Visit</h3>
              <p className="text-sm text-gray-600">
                Check each destination's best months for ideal weather and experiences
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl mb-3">💡</div>
              <h3 className="font-bold text-gray-900 mb-2">Local Insights</h3>
              <p className="text-sm text-gray-600">
                Discover popular activities and hidden gems in each location
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl mb-3">💰</div>
              <h3 className="font-bold text-gray-900 mb-2">Price Comparison</h3>
              <p className="text-sm text-gray-600">
                Find the best flight deals and save on your dream vacation
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
