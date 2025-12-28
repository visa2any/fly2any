'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Search, MapPin, Loader2, Star, Clock, Users, ChevronLeft, Calendar, Filter } from 'lucide-react';

interface Experience {
  id: string;
  name: string;
  shortDescription?: string;
  pictures?: string[];
  price?: { amount: string; currencyCode?: string };
  rating?: number;
  duration?: string;
  bookingLink?: string;
}

const DESTINATIONS: Record<string, { lat: number; lng: number; image: string }> = {
  'bali': { lat: -8.4095, lng: 115.1889, image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1400' },
  'barcelona': { lat: 41.3851, lng: 2.1734, image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=1400' },
  'dubai': { lat: 25.2048, lng: 55.2708, image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1400' },
  'rio-de-janeiro': { lat: -22.9068, lng: -43.1729, image: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=1400' },
  'santorini': { lat: 36.3932, lng: 25.4615, image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1400' },
  'maldives': { lat: 3.2028, lng: 73.2207, image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1400' },
  'tokyo': { lat: 35.6762, lng: 139.6503, image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1400' },
  'paris': { lat: 48.8566, lng: 2.3522, image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1400' },
  'new-york': { lat: 40.7580, lng: -73.9855, image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1400' },
  'london': { lat: 51.5074, lng: -0.1278, image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1400' },
  'rome': { lat: 41.9028, lng: 12.4964, image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1400' },
};

const CATEGORY_NAMES: Record<string, { name: string; icon: string }> = {
  'cruises': { name: 'Cruises & Boat Tours', icon: '🚢' },
  'food-wine': { name: 'Food & Wine', icon: '🍷' },
  'shows': { name: 'Shows & Entertainment', icon: '🎭' },
  'adventure': { name: 'Adventure Activities', icon: '🏔️' },
  'museums': { name: 'Museums & Culture', icon: '🏛️' },
  'water-sports': { name: 'Water Sports', icon: '🤿' },
  'air': { name: 'Air Experiences', icon: '🚁' },
  'wellness': { name: 'Wellness & Spa', icon: '🧘' },
  'nightlife': { name: 'Nightlife', icon: '🌃' },
  'walking-tours': { name: 'Walking Tours', icon: '🚶' },
  'landmarks': { name: 'Landmarks & Attractions', icon: '🗽' },
  'classes': { name: 'Classes & Workshops', icon: '📚' },
  'day-trips': { name: 'Day Trips', icon: '🚐' },
  'photography': { name: 'Photography Tours', icon: '📸' },
  'private-tours': { name: 'Private Tours', icon: '🎯' },
};

export default function CategoryPage() {
  const params = useParams();
  const destination = (params.destination as string) || '';
  const category = (params.category as string) || '';

  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [priceFilter, setPriceFilter] = useState('all');

  const destInfo = DESTINATIONS[destination] || DESTINATIONS['bali'];
  const catInfo = CATEGORY_NAMES[category] || { name: category, icon: '🎯' };
  const destName = destination.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  useEffect(() => {
    async function fetchExperiences() {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/experiences/categories?latitude=${destInfo.lat}&longitude=${destInfo.lng}&radius=10`
        );
        const json = await res.json();
        if (json.success && json.data[category]) {
          setExperiences(json.data[category] || []);
        }
      } catch (err) {
        console.error('Failed to fetch:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchExperiences();
  }, [destination, category, destInfo.lat, destInfo.lng]);

  const filteredExperiences = experiences.filter(exp => {
    if (searchQuery && !exp.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (priceFilter !== 'all') {
      const price = parseFloat(exp.price?.amount || '0');
      if (priceFilter === 'budget' && price > 100) return false;
      if (priceFilter === 'mid' && (price < 100 || price > 300)) return false;
      if (priceFilter === 'premium' && price < 300) return false;
    }
    return true;
  });

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="relative h-[40vh] min-h-[320px] overflow-hidden">
        <Image src={destInfo.image} alt={destName} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70" />

        <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-4">
          <Link href="/experiences" className="absolute top-6 left-6 flex items-center gap-2 text-white/80 hover:text-white transition-colors">
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back to Experiences</span>
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="text-5xl mb-4">{catInfo.icon}</div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black mb-2" style={{ textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}>
              {catInfo.name}
            </h1>
            <p className="text-xl text-white/90 flex items-center justify-center gap-2">
              <MapPin className="w-5 h-5" />
              {destName}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="sticky top-0 z-30 bg-white shadow-md py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${catInfo.name.toLowerCase()}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#E74035] focus:ring-2 focus:ring-[#E74035]/20 outline-none transition-all"
              />
            </div>

            {/* Date */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#E74035] focus:ring-2 focus:ring-[#E74035]/20 outline-none transition-all"
              />
            </div>

            {/* Price Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
                className="pl-10 pr-8 py-3 rounded-xl border border-gray-200 focus:border-[#E74035] focus:ring-2 focus:ring-[#E74035]/20 outline-none appearance-none bg-white cursor-pointer"
              >
                <option value="all">All Prices</option>
                <option value="budget">Under $100</option>
                <option value="mid">$100 - $300</option>
                <option value="premium">$300+</option>
              </select>
            </div>

            {/* Search Button */}
            <button
              className="px-6 py-3 rounded-xl font-semibold text-white transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #E74035 0%, #FF6B6B 100%)' }}
            >
              Search
            </button>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-600">
              {loading ? 'Loading...' : `${filteredExperiences.length} experiences found`}
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-[#E74035]" />
            </div>
          ) : filteredExperiences.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">No experiences found for this category.</p>
              <Link href="/experiences" className="text-[#E74035] font-semibold mt-2 inline-block hover:underline">
                Browse all experiences
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredExperiences.map((exp, index) => (
                <motion.div
                  key={exp.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -8 }}
                  className="group bg-white rounded-2xl overflow-hidden"
                  style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                >
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={exp.pictures?.[0] || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800'}
                      alt={exp.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-white/90 text-xs font-bold text-green-600">
                      Free Cancellation
                    </div>
                    <div className="absolute bottom-3 left-3 flex items-center gap-1 text-white">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-semibold">4.8</span>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 line-clamp-2 mb-2 group-hover:text-[#E74035] transition-colors">
                      {exp.name}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                      {exp.shortDescription || 'An unforgettable experience awaits'}
                    </p>

                    <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {exp.duration || '2-3 hours'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        Small group
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-400">From</p>
                        <p className="text-xl font-black text-[#E74035]">
                          ${parseFloat(exp.price?.amount || '0').toFixed(0)}
                        </p>
                      </div>
                      <a
                        href={exp.bookingLink || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105"
                        style={{ background: 'linear-gradient(135deg, #E74035 0%, #FF6B6B 100%)' }}
                      >
                        Book Now
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-12 bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { icon: '✓', label: 'Free Cancellation', desc: 'Up to 24h before' },
              { icon: '⚡', label: 'Instant Confirmation', desc: 'Book with confidence' },
              { icon: '🔒', label: 'Secure Payment', desc: '100% protected' },
              { icon: '💬', label: '24/7 Support', desc: 'Always here to help' },
            ].map((item, i) => (
              <div key={i}>
                <div className="text-2xl mb-2">{item.icon}</div>
                <div className="font-semibold text-gray-900">{item.label}</div>
                <div className="text-sm text-gray-500">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
