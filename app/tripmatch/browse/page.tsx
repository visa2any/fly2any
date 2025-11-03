'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  MapPin,
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  Star,
  Crown,
  Award,
  ArrowRight,
  X,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';

interface Trip {
  id: string;
  title: string;
  destination: string;
  destinationCode: string;
  destinationCountry: string;
  startDate: string;
  endDate: string;
  category: string;
  currentMembers: number;
  maxMembers: number;
  estimatedPricePerPerson: number;
  status: string;
  featured: boolean;
  trending: boolean;
  coverImageUrl: string;
  tags: string[];
}

const CATEGORIES = [
  { value: 'all', label: 'All Trips', emoji: '🌍' },
  { value: 'party', label: 'Party', emoji: '🎉' },
  { value: 'adventure', label: 'Adventure', emoji: '🏔️' },
  { value: 'girls_trip', label: 'Girls Trip', emoji: '💃' },
  { value: 'guys_trip', label: 'Guys Trip', emoji: '🏀' },
  { value: 'cultural', label: 'Cultural', emoji: '🎭' },
  { value: 'wellness', label: 'Wellness', emoji: '🧘' },
  { value: 'luxury', label: 'Luxury', emoji: '👑' },
  { value: 'budget', label: 'Budget', emoji: '💰' },
];

const PRICE_RANGES = [
  { label: 'All Prices', min: 0, max: 999999 },
  { label: 'Under $1,000', min: 0, max: 1000 },
  { label: '$1,000 - $2,000', min: 1000, max: 2000 },
  { label: '$2,000 - $3,000', min: 2000, max: 3000 },
  { label: '$3,000+', min: 3000, max: 999999 },
];

export default function BrowseTripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState(PRICE_RANGES[0]);
  const [showFeatured, setShowFeatured] = useState(false);
  const [showTrending, setShowTrending] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchTrips();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [trips, searchQuery, selectedCategory, selectedPriceRange, showFeatured, showTrending]);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tripmatch/trips?limit=50');
      const data = await response.json();

      if (data.success) {
        setTrips(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching trips:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...trips];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (trip) =>
          trip.title.toLowerCase().includes(query) ||
          trip.destination.toLowerCase().includes(query) ||
          trip.destinationCountry?.toLowerCase().includes(query) ||
          trip.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((trip) => trip.category === selectedCategory);
    }

    // Price range filter
    filtered = filtered.filter(
      (trip) =>
        trip.estimatedPricePerPerson >= selectedPriceRange.min &&
        trip.estimatedPricePerPerson <= selectedPriceRange.max
    );

    // Featured filter
    if (showFeatured) {
      filtered = filtered.filter((trip) => trip.featured);
    }

    // Trending filter
    if (showTrending) {
      filtered = filtered.filter((trip) => trip.trending);
    }

    setFilteredTrips(filtered);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedPriceRange(PRICE_RANGES[0]);
    setShowFeatured(false);
    setShowTrending(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getDurationDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white/80">Loading trips...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-2">Browse Trips</h1>
          <p className="text-white/60">
            Discover amazing group travel experiences around the world
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-4 w-6 h-6 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search destinations, trips, or tags..."
              className="w-full pl-14 pr-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white text-lg placeholder-white/40 focus:outline-none focus:border-purple-500 transition-all"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden w-full mb-4 px-4 py-3 bg-white/10 backdrop-blur-sm rounded-xl text-white font-bold flex items-center justify-center gap-2"
          >
            <SlidersHorizontal className="w-5 h-5" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>

          <div
            className={`${
              showFilters ? 'block' : 'hidden'
            } lg:block bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10`}
          >
            {/* Category Pills */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Category
              </h3>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setSelectedCategory(cat.value)}
                    className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${
                      selectedCategory === cat.value
                        ? 'bg-purple-600 text-white'
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                  >
                    {cat.emoji} {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Price Range
              </h3>
              <div className="flex flex-wrap gap-2">
                {PRICE_RANGES.map((range, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedPriceRange(range)}
                    className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${
                      selectedPriceRange === range
                        ? 'bg-green-600 text-white'
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Filters */}
            <div>
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Quick Filters
              </h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setShowFeatured(!showFeatured)}
                  className={`px-4 py-2 rounded-full font-bold text-sm transition-all flex items-center gap-2 ${
                    showFeatured
                      ? 'bg-yellow-600 text-white'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  <Crown className="w-4 h-4" />
                  Featured
                </button>
                <button
                  onClick={() => setShowTrending(!showTrending)}
                  className={`px-4 py-2 rounded-full font-bold text-sm transition-all flex items-center gap-2 ${
                    showTrending
                      ? 'bg-orange-600 text-white'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  Trending
                </button>
              </div>
            </div>

            {/* Clear Filters */}
            {(searchQuery ||
              selectedCategory !== 'all' ||
              selectedPriceRange !== PRICE_RANGES[0] ||
              showFeatured ||
              showTrending) && (
              <button
                onClick={clearFilters}
                className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl font-bold text-sm transition-all flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Clear All Filters
              </button>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-white/60">
            Showing <span className="font-bold text-white">{filteredTrips.length}</span>{' '}
            {filteredTrips.length === 1 ? 'trip' : 'trips'}
          </p>
        </div>

        {/* Trip Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrips.map((trip, index) => (
            <motion.div
              key={trip.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link href={`/tripmatch/trips/${trip.id}`}>
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:bg-white/10 transition-all group cursor-pointer">
                  {/* Trip Image */}
                  <div className="relative h-48 overflow-hidden">
                    <div
                      className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                      style={{ backgroundImage: `url(${trip.coverImageUrl})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex gap-2">
                      {trip.trending && (
                        <div className="bg-orange-500 px-2 py-1 rounded-lg flex items-center gap-1 text-white text-xs font-bold">
                          <TrendingUp className="w-3 h-3" />
                          Trending
                        </div>
                      )}
                      {trip.featured && (
                        <div className="bg-yellow-500 px-2 py-1 rounded-lg flex items-center gap-1 text-white text-xs font-bold">
                          <Crown className="w-3 h-3" />
                          Featured
                        </div>
                      )}
                    </div>

                    {/* Category */}
                    <div className="absolute top-3 right-3">
                      <span className="px-3 py-1 bg-purple-500/90 backdrop-blur-sm text-white text-xs font-bold rounded-full uppercase">
                        {trip.category.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Price */}
                    <div className="absolute bottom-3 right-3">
                      <div className="bg-black/60 backdrop-blur-sm px-3 py-2 rounded-lg">
                        <p className="text-white font-bold">
                          ${Math.floor(trip.estimatedPricePerPerson)}
                        </p>
                        <p className="text-white/70 text-xs">per person</p>
                      </div>
                    </div>
                  </div>

                  {/* Trip Info */}
                  <div className="p-4">
                    <h3 className="font-bold text-white text-lg mb-2 group-hover:text-purple-400 transition-colors line-clamp-1">
                      {trip.title}
                    </h3>

                    <div className="flex items-center gap-1 text-white/60 text-sm mb-3">
                      <MapPin className="w-4 h-4" />
                      <span className="line-clamp-1">{trip.destination}</span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-white/60 mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm text-white/60">
                        <Users className="w-4 h-4" />
                        <span className="font-bold text-white">
                          {trip.currentMembers}/{trip.maxMembers}
                        </span>
                        <span className="ml-1">members</span>
                      </div>

                      <ArrowRight className="w-5 h-5 text-purple-400 group-hover:translate-x-1 transition-transform" />
                    </div>

                    {trip.tags && trip.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {trip.tags.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs rounded-full"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredTrips.length === 0 && (
          <div className="text-center py-20">
            <Search className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">No trips found</h3>
            <p className="text-white/60 mb-6">
              Try adjusting your filters or search for different destinations
            </p>
            <button
              onClick={clearFilters}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Create Trip CTA */}
        {filteredTrips.length > 0 && (
          <div className="mt-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold text-white mb-2">Don't see your dream trip?</h3>
            <p className="text-white/90 mb-4">Create your own and invite friends to join!</p>
            <Link href="/tripmatch/create">
              <button className="px-8 py-4 bg-white text-purple-600 font-bold rounded-xl hover:bg-gray-100 transition-colors inline-flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Create Your Trip
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
