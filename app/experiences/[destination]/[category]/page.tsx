'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Search, MapPin, Loader2, Star, Clock, Users, ChevronLeft, Calendar, Filter, Shield, Sparkles, Heart, Share2, CheckCircle, Globe, Zap, HeadphonesIcon } from 'lucide-react';

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

// Enhanced destination data with category-specific images
const DESTINATIONS: Record<string, { lat: number; lng: number; image: string; tagline: string; temp: string }> = {
  'bali': { lat: -8.4095, lng: 115.1889, image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1600&q=90', tagline: 'Island of the Gods', temp: '28°C' },
  'barcelona': { lat: 41.3851, lng: 2.1734, image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=1600&q=90', tagline: 'Art, Culture & Mediterranean Vibes', temp: '18°C' },
  'dubai': { lat: 25.2048, lng: 55.2708, image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1600&q=90', tagline: 'Where Dreams Touch the Sky', temp: '25°C' },
  'rio-de-janeiro': { lat: -22.9068, lng: -43.1729, image: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=1600&q=90', tagline: 'Cidade Maravilhosa', temp: '30°C' },
  'santorini': { lat: 36.3932, lng: 25.4615, image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1600&q=90', tagline: 'Sunsets & White-Washed Dreams', temp: '22°C' },
  'maldives': { lat: 3.2028, lng: 73.2207, image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1600&q=90', tagline: 'Paradise on Earth', temp: '29°C' },
  'tokyo': { lat: 35.6762, lng: 139.6503, image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1600&q=90', tagline: 'Where Tradition Meets Future', temp: '15°C' },
  'paris': { lat: 48.8566, lng: 2.3522, image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1600&q=90', tagline: 'The City of Light & Love', temp: '12°C' },
  'new-york': { lat: 40.7580, lng: -73.9855, image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1600&q=90', tagline: 'The City That Never Sleeps', temp: '8°C' },
  'london': { lat: 51.5074, lng: -0.1278, image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1600&q=90', tagline: 'Royal Heritage & Modern Charm', temp: '10°C' },
  'rome': { lat: 41.9028, lng: 12.4964, image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1600&q=90', tagline: 'Eternal City of Wonders', temp: '16°C' },
};

// Enhanced category data with descriptions and hero images
const CATEGORIES: Record<string, { name: string; icon: string; desc: string; heroImage: string }> = {
  'cruises': { name: 'Cruises & Boat Tours', icon: '🚢', desc: 'Sail into unforgettable moments on crystal waters', heroImage: 'https://images.unsplash.com/photo-1548574505-5e239809ee19?w=1600&q=90' },
  'food-wine': { name: 'Food & Wine', icon: '🍷', desc: 'Savor authentic flavors and local culinary secrets', heroImage: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&q=90' },
  'shows': { name: 'Shows & Entertainment', icon: '🎭', desc: 'Experience world-class performances and nightlife', heroImage: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=1600&q=90' },
  'adventure': { name: 'Adventure Activities', icon: '🏔️', desc: 'Push your limits with thrilling outdoor experiences', heroImage: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=1600&q=90' },
  'museums': { name: 'Museums & Culture', icon: '🏛️', desc: 'Discover art, history and cultural treasures', heroImage: 'https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=1600&q=90' },
  'water-sports': { name: 'Water Sports', icon: '🤿', desc: 'Dive into adventure beneath the waves', heroImage: 'https://images.unsplash.com/photo-1530053969600-caed2596d242?w=1600&q=90' },
  'air': { name: 'Air Experiences', icon: '🚁', desc: 'See the world from breathtaking new heights', heroImage: 'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=1600&q=90' },
  'wellness': { name: 'Wellness & Spa', icon: '🧘', desc: 'Rejuvenate your body, mind and soul', heroImage: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=1600&q=90' },
  'nightlife': { name: 'Nightlife', icon: '🌃', desc: 'Dance until dawn in legendary venues', heroImage: 'https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=1600&q=90' },
  'walking-tours': { name: 'Walking Tours', icon: '🚶', desc: 'Explore hidden gems with expert local guides', heroImage: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1600&q=90' },
  'landmarks': { name: 'Landmarks & Attractions', icon: '🗽', desc: 'Visit iconic sites that define the destination', heroImage: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1600&q=90' },
  'classes': { name: 'Classes & Workshops', icon: '📚', desc: 'Learn new skills from passionate local experts', heroImage: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1600&q=90' },
  'day-trips': { name: 'Day Trips', icon: '🚐', desc: 'Escape the city and explore surrounding wonders', heroImage: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1600&q=90' },
  'photography': { name: 'Photography Tours', icon: '📸', desc: 'Capture stunning moments at perfect locations', heroImage: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=1600&q=90' },
  'private-tours': { name: 'Private Tours', icon: '🎯', desc: 'Exclusive experiences tailored just for you', heroImage: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1600&q=90' },
};

export default function CategoryPage() {
  const params = useParams();
  const destination = (params.destination as string) || '';
  const category = (params.category as string) || '';

  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceFilter, setPriceFilter] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const destInfo = DESTINATIONS[destination] || DESTINATIONS['bali'];
  const catInfo = CATEGORIES[category] || { name: category, icon: '🎯', desc: 'Discover amazing experiences', heroImage: destInfo.image };
  const destName = destination.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  useEffect(() => {
    async function fetchExperiences() {
      setLoading(true);
      try {
        const res = await fetch(`/api/experiences/categories?latitude=${destInfo.lat}&longitude=${destInfo.lng}&radius=15`);
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

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredExperiences = experiences
    .filter(exp => {
      if (searchQuery && !exp.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (priceFilter !== 'all') {
        const price = parseFloat(exp.price?.amount || '0');
        if (priceFilter === 'budget' && price > 100) return false;
        if (priceFilter === 'mid' && (price < 100 || price > 300)) return false;
        if (priceFilter === 'premium' && price < 300) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'price-low') return parseFloat(a.price?.amount || '0') - parseFloat(b.price?.amount || '0');
      if (sortBy === 'price-high') return parseFloat(b.price?.amount || '0') - parseFloat(a.price?.amount || '0');
      return 0;
    });

  // Related categories for cross-sell
  const relatedCategories = Object.entries(CATEGORIES)
    .filter(([id]) => id !== category)
    .slice(0, 4);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-orange-50/30">
      {/* ULTRA-PREMIUM HERO */}
      <section className="relative h-[60vh] min-h-[500px] overflow-hidden">
        <motion.div
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0"
        >
          <Image src={catInfo.heroImage} alt={catInfo.name} fill className="object-cover" priority quality={90} />
        </motion.div>

        {/* Premium overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-red-900/20 via-transparent to-orange-900/20" />

        {/* Breadcrumb Navigation */}
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-20">
          <Link href="/experiences" className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md text-white/90 hover:bg-white/20 transition-all">
            <ChevronLeft className="w-4 h-4" />
            <span className="text-sm font-medium">All Experiences</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-white/90 text-sm">
              <span className="mr-2">📍</span>{destName}
            </div>
            <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-yellow-500/80 to-orange-500/80 text-white text-sm font-semibold">
              {destInfo.temp}
            </div>
          </div>
        </div>

        {/* Hero Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl"
          >
            {/* Category Badge */}
            <motion.div
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full mb-6"
              style={{ background: 'linear-gradient(135deg, rgba(247,201,40,0.9) 0%, rgba(255,150,50,0.9) 100%)', boxShadow: '0 4px 30px rgba(247,201,40,0.4)' }}
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <span className="text-2xl">{catInfo.icon}</span>
              <span className="text-sm font-bold text-white uppercase tracking-wider">{catInfo.name}</span>
              <Sparkles className="w-4 h-4 text-white" />
            </motion.div>

            {/* Main Title with Animated Gradient */}
            <motion.h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-4"
              style={{ textShadow: '0 4px 30px rgba(0,0,0,0.5)' }}
            >
              {catInfo.name} in{' '}
              <motion.span
                className="inline-block"
                style={{
                  background: 'linear-gradient(135deg, #FFD700 0%, #FFF 25%, #FFD700 50%, #FF6B6B 75%, #FFD700 100%)',
                  backgroundSize: '200% 200%',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
                animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              >
                {destName}
              </motion.span>
            </motion.h1>

            <p className="text-lg md:text-xl text-white/90 mb-2" style={{ textShadow: '0 2px 20px rgba(0,0,0,0.3)' }}>
              {catInfo.desc}
            </p>
            <p className="text-base text-white/70 mb-8">
              {destInfo.tagline}
            </p>

            {/* Quick Stats */}
            <div className="flex flex-wrap justify-center gap-4">
              {[
                { icon: <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />, text: '4.8+ Rated' },
                { icon: <CheckCircle className="w-4 h-4 text-green-400" />, text: 'Free Cancellation' },
                { icon: <Zap className="w-4 h-4 text-yellow-400" />, text: 'Instant Confirm' },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-sm"
                >
                  {stat.icon}
                  <span>{stat.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-6 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-white/50 flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-white/70 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* PREMIUM SEARCH BAR */}
      <section className="sticky top-0 z-30 bg-white/95 backdrop-blur-lg shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${catInfo.name.toLowerCase()} in ${destName}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-gray-100 focus:border-[#E74035] focus:ring-4 focus:ring-[#E74035]/10 outline-none transition-all bg-gray-50/50"
              />
            </div>

            {/* Price Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
                className="pl-10 pr-8 py-3.5 rounded-2xl border-2 border-gray-100 focus:border-[#E74035] outline-none appearance-none bg-gray-50/50 cursor-pointer font-medium"
              >
                <option value="all">All Prices</option>
                <option value="budget">Under $100</option>
                <option value="mid">$100 - $300</option>
                <option value="premium">$300+</option>
              </select>
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3.5 rounded-2xl border-2 border-gray-100 focus:border-[#E74035] outline-none appearance-none bg-gray-50/50 cursor-pointer font-medium"
            >
              <option value="popular">Most Popular</option>
              <option value="price-low">Price: Low → High</option>
              <option value="price-high">Price: High → Low</option>
            </select>

            {/* Results Count */}
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
              <Globe className="w-4 h-4 text-[#E74035]" />
              <span className="font-semibold text-gray-700">{filteredExperiences.length} experiences</span>
            </div>
          </div>
        </div>
      </section>

      {/* RESULTS GRID */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Loader2 className="w-12 h-12 text-[#E74035]" />
              </motion.div>
              <p className="mt-4 text-gray-500">Loading amazing experiences...</p>
            </div>
          ) : filteredExperiences.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No experiences found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your filters or explore other categories</p>
              <Link
                href="/experiences"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-white transition-all hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #E74035 0%, #FF6B6B 100%)' }}
              >
                <Globe className="w-5 h-5" />
                Browse All Experiences
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence>
                {filteredExperiences.map((exp, index) => (
                  <motion.div
                    key={exp.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -8 }}
                    className="group bg-white rounded-3xl overflow-hidden"
                    style={{ boxShadow: '0 4px 30px rgba(0,0,0,0.08)' }}
                  >
                    {/* Image Container */}
                    <div className="relative h-52 overflow-hidden">
                      <Image
                        src={exp.pictures?.[0] || catInfo.heroImage}
                        alt={exp.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />

                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                        <div className="px-3 py-1.5 rounded-full bg-green-500/90 backdrop-blur-sm text-xs font-bold text-white flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Free Cancel
                        </div>
                        <button
                          onClick={() => toggleFavorite(exp.id)}
                          className={`p-2 rounded-full backdrop-blur-sm transition-all ${
                            favorites.has(exp.id) ? 'bg-red-500 text-white' : 'bg-white/20 text-white hover:bg-white/40'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${favorites.has(exp.id) ? 'fill-current' : ''}`} />
                        </button>
                      </div>

                      {/* Bottom Info */}
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-sm">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-bold text-white">{exp.rating || '4.8'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-sm text-white text-xs">
                          <Clock className="w-3.5 h-3.5" />
                          {exp.duration || '2-3h'}
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3 className="font-bold text-gray-900 line-clamp-2 mb-2 group-hover:text-[#E74035] transition-colors text-lg">
                        {exp.name}
                      </h3>
                      <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                        {exp.shortDescription || `Experience the best ${catInfo.name.toLowerCase()} in ${destName}`}
                      </p>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div>
                          <p className="text-xs text-gray-400 uppercase tracking-wider">From</p>
                          <p className="text-2xl font-black text-[#E74035]">
                            ${parseFloat(exp.price?.amount || '0').toFixed(0)}
                          </p>
                        </div>
                        <a
                          href={exp.bookingLink || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 hover:shadow-lg"
                          style={{ background: 'linear-gradient(135deg, #E74035 0%, #FF6B6B 100%)', boxShadow: '0 4px 15px rgba(231,64,53,0.3)' }}
                        >
                          Book Now
                        </a>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </section>

      {/* RELATED CATEGORIES */}
      {relatedCategories.length > 0 && (
        <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">More in {destName}</h2>
              <p className="text-gray-500">Discover other amazing experiences</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedCategories.map(([id, cat]) => (
                <Link
                  key={id}
                  href={`/experiences/${destination}/${id}`}
                  className="group relative h-40 rounded-2xl overflow-hidden"
                >
                  <Image src={cat.heroImage} alt={cat.name} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
                    <span className="text-3xl mb-2">{cat.icon}</span>
                    <span className="font-bold text-center">{cat.name}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* PREMIUM TRUST SECTION */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: <Shield className="w-8 h-8" />, label: 'Best Price Guarantee', desc: 'Find it cheaper? We refund the difference', color: 'text-green-500' },
              { icon: <Zap className="w-8 h-8" />, label: 'Instant Confirmation', desc: 'Your booking is confirmed immediately', color: 'text-yellow-500' },
              { icon: <CheckCircle className="w-8 h-8" />, label: 'Free Cancellation', desc: 'Change plans? No problem, up to 24h', color: 'text-blue-500' },
              { icon: <HeadphonesIcon className="w-8 h-8" />, label: '24/7 Support', desc: 'Real humans ready to help anytime', color: 'text-purple-500' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-50 ${item.color} mb-4`}>
                  {item.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{item.label}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
