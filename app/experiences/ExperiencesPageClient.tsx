'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Compass, MapPin, Loader2, Star, Sun, Plane, Sparkles, Globe, Heart } from 'lucide-react';
import CategoryCard from '@/components/experiences/CategoryCard';
import { isCategoryAvailable, getSeasonalBadge } from '@/lib/experiences/seasonal';

interface Experience {
  id: string;
  name: string;
  shortDescription?: string;
  pictures?: string[];
  price?: { amount: string; currencyCode?: string };
  rating?: number;
}

interface CategoryData {
  id: string;
  name: string;
  icon: string;
  count: number;
}

// GLOBAL warm destinations
const DESTINATIONS = [
  { name: 'Bali', lat: -8.4095, lng: 115.1889, temp: '28°C', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1400', emoji: '🌴', vibe: 'Paradise awaits' },
  { name: 'Barcelona', lat: 41.3851, lng: 2.1734, temp: '18°C', image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=1400', emoji: '🏖️', vibe: 'Sun & culture' },
  { name: 'Dubai', lat: 25.2048, lng: 55.2708, temp: '25°C', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1400', emoji: '✨', vibe: 'Luxury escape' },
  { name: 'Rio de Janeiro', lat: -22.9068, lng: -43.1729, temp: '30°C', image: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=1400', emoji: '🎉', vibe: 'Feel alive' },
  { name: 'Santorini', lat: 36.3932, lng: 25.4615, temp: '20°C', image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1400', emoji: '🌅', vibe: 'Dream views' },
  { name: 'Maldives', lat: 3.2028, lng: 73.2207, temp: '29°C', image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1400', emoji: '🐚', vibe: 'Pure bliss' },
  { name: 'Tokyo', lat: 35.6762, lng: 139.6503, temp: '15°C', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1400', emoji: '🗼', vibe: 'Adventure' },
  { name: 'Paris', lat: 48.8566, lng: 2.3522, temp: '12°C', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1400', emoji: '💕', vibe: 'Romance' },
];

// High-quality curated images for each category (always use these over API images)
const CATEGORY_IMAGES: Record<string, string> = {
  'cruises': 'https://images.unsplash.com/photo-1548574505-5e239809ee19?w=800&q=80&auto=format',
  'food-wine': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80&auto=format',
  'shows': 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=800&q=80&auto=format',
  'adventure': 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=800&q=80&auto=format',
  'museums': 'https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=800&q=80&auto=format',
  'water-sports': 'https://images.unsplash.com/photo-1530053969600-caed2596d242?w=800&q=80&auto=format',
  'air': 'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=800&q=80&auto=format',
  'wellness': 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=800&q=80&auto=format',
  'nightlife': 'https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=800&q=80&auto=format',
  'walking-tours': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80&auto=format',
  'landmarks': 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&q=80&auto=format',
  'classes': 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80&auto=format',
  'day-trips': 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80&auto=format',
  'photography': 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&q=80&auto=format',
  'private-tours': 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80&auto=format',
};

export default function ExperiencesPageClient() {
  const [selectedDestination, setSelectedDestination] = useState(DESTINATIONS[0]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [experienceData, setExperienceData] = useState<Record<string, Experience[]>>({});
  const [loading, setLoading] = useState(true);
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % DESTINATIONS.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchExperiences();
  }, [selectedDestination]);

  async function fetchExperiences() {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/experiences/categories?latitude=${selectedDestination.lat}&longitude=${selectedDestination.lng}&radius=10`
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
    <main className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-orange-50/30">
      {/* HERO - Full Screen */}
      <section className="relative h-screen min-h-[700px] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={heroIndex}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0"
          >
            <Image
              src={DESTINATIONS[heroIndex].image}
              alt="Destination"
              fill
              className="object-cover"
              priority
            />
          </motion.div>
        </AnimatePresence>

        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-orange-900/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-red-900/30 via-transparent to-yellow-900/30" />

        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[0,1,2,3,4,5].map((i) => (
            <motion.div
              key={i}
              className="absolute text-4xl"
              style={{ left: `${10 + i * 15}%` }}
              initial={{ y: '100vh' }}
              animate={{ y: '-10vh' }}
              transition={{ duration: 15 + i * 3, repeat: Infinity, ease: 'linear', delay: i * 2 }}
            >
              {['✈️', '🌴', '☀️', '🌊', '🏝️', '🎉'][i]}
            </motion.div>
          ))}
        </div>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl"
          >
            <motion.div
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full mb-6"
              style={{ background: 'linear-gradient(135deg, rgba(247,201,40,0.9) 0%, rgba(255,150,50,0.9) 100%)', boxShadow: '0 4px 30px rgba(247,201,40,0.4)' }}
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Sun className="w-5 h-5 text-white" />
              <span className="text-sm font-bold text-white">Escape the Cold • Find Your Sunshine</span>
              <Sparkles className="w-4 h-4 text-white" />
            </motion.div>

            <motion.h1
              className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-black mb-6 whitespace-nowrap"
              style={{ textShadow: '0 4px 30px rgba(0,0,0,0.5)' }}
            >
              Life is Short. <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Travel More.</span>
            </motion.h1>

            <p className="text-xl md:text-2xl text-white/90 mb-4 font-light" style={{ textShadow: '0 2px 20px rgba(0,0,0,0.3)' }}>
              300,000+ experiences in 100+ destinations worldwide
            </p>
            <p className="text-lg text-white/70 mb-10">
              From tropical beaches to vibrant cities — your next adventure awaits
            </p>

            <div className="flex flex-nowrap justify-center gap-2 mb-8">
              {DESTINATIONS.slice(0, 6).map((dest, i) => (
                <motion.button
                  key={dest.name}
                  onClick={() => setSelectedDestination(dest)}
                  className="group relative px-4 py-2.5 rounded-xl font-semibold transition-all"
                  style={{
                    background: selectedDestination.name === dest.name
                      ? 'linear-gradient(135deg, #E74035 0%, #FF6B6B 100%)'
                      : 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: selectedDestination.name === dest.name ? '0 4px 20px rgba(231,64,53,0.4)' : '0 2px 10px rgba(0,0,0,0.1)'
                  }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                >
                  <span className="mr-2">{dest.emoji}</span>
                  {dest.name}
                  <span className="ml-2 text-xs opacity-70">{dest.temp}</span>
                </motion.button>
              ))}
            </div>

            <motion.button
              className="px-8 py-4 rounded-full text-lg font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #E74035 0%, #FF6B6B 100%)', boxShadow: '0 4px 30px rgba(231,64,53,0.4)' }}
              whileHover={{ scale: 1.05, boxShadow: '0 8px 40px rgba(231,64,53,0.5)' }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Explore {selectedDestination.name}
                <Plane className="w-5 h-5" />
              </span>
            </motion.button>
          </motion.div>
        </div>

        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-white/50 flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-white/70 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* Categories Section - Full Width */}
      <section className="py-16 lg:py-24 relative">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-orange-900/10 to-transparent" />
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 text-[#E74035] text-sm font-semibold mb-4">
              <Heart className="w-4 h-4" />
              Handpicked for You
            </div>
            <h2 className="text-3xl lg:text-5xl font-black text-gray-900 mb-4">
              Explore <span className="text-[#E74035]">{selectedDestination.name}</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {selectedDestination.vibe} — {loading ? 'Loading...' : `${availableCategories.reduce((sum, c) => sum + (experienceData[c.id]?.length || 0), 0)}+ experiences await`}
            </p>
          </motion.div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 animate-spin text-[#E74035] mb-4" />
              <p className="text-gray-500 animate-pulse">Finding amazing experiences...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 lg:gap-5">
                {availableCategories.map((cat, index) => {
                  const items = experienceData[cat.id] || [];
                  // Always use curated high-quality images for categories
                  const image = CATEGORY_IMAGES[cat.id] || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80';
                  const prices = items.map(i => parseFloat(i.price?.amount || '0')).filter(p => p > 0);
                  const fromPrice = prices.length > 0 ? Math.min(...prices) : 50;

                  return (
                    <motion.div
                      key={cat.id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
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

              {Object.values(experienceData).flat().filter(exp => exp.pictures?.length).length > 0 && (
                <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mt-20">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-2xl lg:text-3xl font-bold text-gray-900">Top Picks in {selectedDestination.name}</h3>
                      <p className="text-gray-500 mt-1">Most loved by travelers</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.values(experienceData)
                      .flat()
                      .filter(exp => exp.pictures?.length && parseFloat(exp.price?.amount || '0') > 0)
                      .slice(0, 6)
                      .map((exp, index) => (
                        <motion.div
                          key={exp.id}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ y: -8 }}
                          className="group bg-white rounded-3xl overflow-hidden"
                          style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                        >
                          <div className="relative h-52 overflow-hidden">
                            <Image src={exp.pictures?.[0] || '/placeholder.jpg'} alt={exp.name} fill className="object-cover transition-all duration-700 group-hover:scale-110" style={{ filter: 'saturate(1.1)' }} />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                            <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-xs font-bold text-green-600">✓ Free Cancel</div>
                          </div>
                          <div className="p-5">
                            <h4 className="font-bold text-gray-900 line-clamp-2 mb-2 group-hover:text-[#E74035] transition-colors">{exp.name}</h4>
                            <p className="text-sm text-gray-500 line-clamp-2 mb-4">{exp.shortDescription || 'An unforgettable experience'}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                <span className="text-sm font-semibold">4.8</span>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-gray-400">From</p>
                                <p className="text-xl font-black text-[#E74035]">${parseFloat(exp.price?.amount || '0').toFixed(0)}</p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                  </div>
                </motion.div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #E74035 0%, #FF6B6B 50%, #F7C928 100%)' }}>
        <div className="absolute inset-0 bg-black/10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            {[
              { value: '45+', label: 'Trusted Providers', icon: '🤝' },
              { value: '300K+', label: 'Experiences', icon: '🎯' },
              { value: '100+', label: 'Destinations', icon: '🌍' },
              { value: '4.8★', label: 'Avg Rating', icon: '⭐' },
            ].map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-3xl lg:text-4xl font-black">{stat.value}</div>
                <div className="text-sm opacity-90 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 bg-gray-900 text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl lg:text-4xl font-black mb-4">Ready for Your Next Adventure?</h2>
          <p className="text-gray-400 mb-8">Join millions of travelers who found their perfect experience</p>
          <motion.button
            className="px-8 py-4 rounded-full text-lg font-bold"
            style={{ background: 'linear-gradient(135deg, #F7C928 0%, #FF9500 100%)' }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            Start Exploring Now
          </motion.button>
        </div>
      </section>
    </main>
  );
}
