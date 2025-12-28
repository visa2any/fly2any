'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Compass, MapPin, Search, Loader2, ChevronRight, Star } from 'lucide-react';
import CategoryCard from '@/components/experiences/CategoryCard';
import { isCategoryAvailable, getSeasonalBadge } from '@/lib/experiences/seasonal';

interface Experience {
  id: string;
  name: string;
  shortDescription?: string;
  pictures?: string[];
  price?: { amount: string; currencyCode?: string };
  rating?: number;
  bookingLink?: string;
}

interface CategoryData {
  id: string;
  name: string;
  icon: string;
  count: number;
}

// Popular destinations for hero
const DESTINATIONS = [
  { name: 'New York', lat: 40.7580, lng: -73.9855, image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1200' },
  { name: 'Paris', lat: 48.8566, lng: 2.3522, image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200' },
  { name: 'London', lat: 51.5074, lng: -0.1278, image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200' },
  { name: 'Tokyo', lat: 35.6762, lng: 139.6503, image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200' },
  { name: 'Barcelona', lat: 41.3851, lng: 2.1734, image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=1200' },
  { name: 'Rome', lat: 41.9028, lng: 12.4964, image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1200' },
];

const CATEGORY_IMAGES: Record<string, string> = {
  'cruises': 'https://images.unsplash.com/photo-1548574505-5e239809ee19?w=600',
  'food-wine': 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600',
  'shows': 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=600',
  'adventure': 'https://images.unsplash.com/photo-1527004013197-933c4bb611b3?w=600',
  'museums': 'https://images.unsplash.com/photo-1565060169194-19fabf63012c?w=600',
  'water-sports': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600',
  'air': 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600',
  'wellness': 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600',
  'nightlife': 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600',
  'walking-tours': 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=600',
  'landmarks': 'https://images.unsplash.com/photo-1492136344046-866c85e0bf04?w=600',
  'classes': 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600',
};

export default function ExperiencesPageClient() {
  const [selectedDestination, setSelectedDestination] = useState(DESTINATIONS[0]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [experienceData, setExperienceData] = useState<Record<string, Experience[]>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchExperiences();
  }, [selectedDestination]);

  async function fetchExperiences() {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/experiences/categories?latitude=${selectedDestination.lat}&longitude=${selectedDestination.lng}&radius=5`
      );
      const json = await res.json();
      if (json.success) {
        setCategories(json.categories || []);
        setExperienceData(json.data || {});
      }
    } catch (err) {
      console.error('Failed to fetch experiences:', err);
    } finally {
      setLoading(false);
    }
  }

  const availableCategories = categories
    .filter(cat => {
      if (!isCategoryAvailable(cat.id, selectedDestination.lat)) return false;
      return (experienceData[cat.id]?.length || 0) > 0;
    })
    .slice(0, 12);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[400px] overflow-hidden">
        <Image
          src={selectedDestination.image}
          alt={selectedDestination.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />

        <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-sm font-medium mb-6">
              <Compass className="w-4 h-4" />
              <span>45+ Trusted Providers Worldwide</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 drop-shadow-lg">
              Unforgettable Experiences
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8">
              Discover curated activities in {selectedDestination.name}
            </p>

            {/* Destination Selector */}
            <div className="flex flex-wrap justify-center gap-2">
              {DESTINATIONS.map(dest => (
                <button
                  key={dest.name}
                  onClick={() => setSelectedDestination(dest)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedDestination.name === dest.name
                      ? 'bg-white text-gray-900'
                      : 'bg-white/20 hover:bg-white/30 backdrop-blur-sm'
                  }`}
                >
                  {dest.name}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
                Explore {selectedDestination.name}
              </h2>
              <p className="mt-1 text-gray-600">
                {loading ? 'Loading...' : `${availableCategories.reduce((sum, c) => sum + (experienceData[c.id]?.length || 0), 0)}+ experiences available`}
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <MapPin className="w-4 h-4" />
              <span>{selectedDestination.name}</span>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-[#E74035]" />
            </div>
          ) : (
            <>
              {/* Category Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
                {availableCategories.map((cat, index) => {
                  const items = experienceData[cat.id] || [];
                  const firstItem = items[0];
                  const image = firstItem?.pictures?.[0] || CATEGORY_IMAGES[cat.id];
                  const prices = items.map(i => parseFloat(i.price?.amount || '0')).filter(p => p > 0);
                  const fromPrice = prices.length > 0 ? Math.min(...prices) : 50;

                  return (
                    <motion.div
                      key={cat.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <CategoryCard
                        id={cat.id}
                        name={cat.name}
                        icon={cat.icon}
                        image={image}
                        count={items.length}
                        fromPrice={fromPrice}
                        seasonalBadge={getSeasonalBadge(cat.id, selectedDestination.lat)}
                        destination={selectedDestination.name}
                      />
                    </motion.div>
                  );
                })}
              </div>

              {/* Featured Experiences */}
              {experienceData['shows']?.length > 0 && (
                <div className="mt-16">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">
                    Featured in {selectedDestination.name}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.values(experienceData)
                      .flat()
                      .filter(exp => exp.pictures?.length && parseFloat(exp.price?.amount || '0') > 0)
                      .slice(0, 6)
                      .map((exp, index) => (
                        <motion.div
                          key={exp.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 + index * 0.05 }}
                          className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow"
                        >
                          <div className="relative h-48 overflow-hidden">
                            <Image
                              src={exp.pictures?.[0] || '/placeholder.jpg'}
                              alt={exp.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                          <div className="p-4">
                            <h4 className="font-semibold text-gray-900 line-clamp-2 mb-2">
                              {exp.name}
                            </h4>
                            <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                              {exp.shortDescription}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                <span className="text-sm font-medium">4.8</span>
                              </div>
                              <p className="text-lg font-bold text-[#E74035]">
                                ${parseFloat(exp.price?.amount || '0').toFixed(0)}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-12 bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '45+', label: 'Trusted Providers' },
              { value: '300K+', label: 'Experiences' },
              { value: '100+', label: 'Destinations' },
              { value: '4.8★', label: 'Avg Rating' },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-2xl lg:text-3xl font-bold text-[#E74035]">{stat.value}</div>
                <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
