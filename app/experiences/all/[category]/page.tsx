'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ChevronLeft, Globe, Sparkles, MapPin, Star, Users, ChevronRight, Zap, Shield, CheckCircle, HeadphonesIcon } from 'lucide-react';

// All destinations with coordinates
const ALL_DESTINATIONS = [
  { name: 'Bali', slug: 'bali', country: 'Indonesia', flag: '🇮🇩', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80' },
  { name: 'Barcelona', slug: 'barcelona', country: 'Spain', flag: '🇪🇸', image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&q=80' },
  { name: 'Dubai', slug: 'dubai', country: 'UAE', flag: '🇦🇪', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80' },
  { name: 'Paris', slug: 'paris', country: 'France', flag: '🇫🇷', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80' },
  { name: 'Tokyo', slug: 'tokyo', country: 'Japan', flag: '🇯🇵', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80' },
  { name: 'New York', slug: 'new-york', country: 'USA', flag: '🇺🇸', image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80' },
  { name: 'Rome', slug: 'rome', country: 'Italy', flag: '🇮🇹', image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80' },
  { name: 'London', slug: 'london', country: 'UK', flag: '🇬🇧', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80' },
  { name: 'Santorini', slug: 'santorini', country: 'Greece', flag: '🇬🇷', image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&q=80' },
  { name: 'Maldives', slug: 'maldives', country: 'Maldives', flag: '🇲🇻', image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80' },
  { name: 'Sydney', slug: 'sydney', country: 'Australia', flag: '🇦🇺', image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&q=80' },
  { name: 'Rio de Janeiro', slug: 'rio-de-janeiro', country: 'Brazil', flag: '🇧🇷', image: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&q=80' },
  { name: 'Bangkok', slug: 'bangkok', country: 'Thailand', flag: '🇹🇭', image: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&q=80' },
  { name: 'Miami', slug: 'miami', country: 'USA', flag: '🇺🇸', image: 'https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?w=800&q=80' },
  { name: 'Amsterdam', slug: 'amsterdam', country: 'Netherlands', flag: '🇳🇱', image: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800&q=80' },
  { name: 'Cancun', slug: 'cancun', country: 'Mexico', flag: '🇲🇽', image: 'https://images.unsplash.com/photo-1510097467424-192d713fd8b2?w=800&q=80' },
  { name: 'Singapore', slug: 'singapore', country: 'Singapore', flag: '🇸🇬', image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&q=80' },
  { name: 'Cape Town', slug: 'cape-town', country: 'South Africa', flag: '🇿🇦', image: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800&q=80' },
  { name: 'Phuket', slug: 'phuket', country: 'Thailand', flag: '🇹🇭', image: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=800&q=80' },
  { name: 'Las Vegas', slug: 'las-vegas', country: 'USA', flag: '🇺🇸', image: 'https://images.unsplash.com/photo-1605833556294-ea5c7a74f57d?w=800&q=80' },
];

// Category data
const CATEGORIES: Record<string, { name: string; icon: string; desc: string; heroImage: string; tagline: string }> = {
  'cruises': { name: 'Cruises & Boat Tours', icon: '🚢', desc: 'Sail into unforgettable moments on crystal waters', heroImage: 'https://images.unsplash.com/photo-1548574505-5e239809ee19?w=1600&q=90', tagline: 'Set Sail for Adventure' },
  'food-wine': { name: 'Food & Wine', icon: '🍷', desc: 'Savor authentic flavors and local culinary secrets', heroImage: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&q=90', tagline: 'Taste the World' },
  'shows': { name: 'Shows & Entertainment', icon: '🎭', desc: 'Experience world-class performances and nightlife', heroImage: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=1600&q=90', tagline: 'The Show Must Go On' },
  'adventure': { name: 'Adventure Activities', icon: '🏔️', desc: 'Push your limits with thrilling outdoor experiences', heroImage: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=1600&q=90', tagline: 'Thrill Seekers Welcome' },
  'museums': { name: 'Museums & Culture', icon: '🏛️', desc: 'Discover art, history and cultural treasures', heroImage: 'https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=1600&q=90', tagline: 'Where History Lives' },
  'water-sports': { name: 'Water Sports', icon: '🤿', desc: 'Dive into adventure beneath the waves', heroImage: 'https://images.unsplash.com/photo-1530053969600-caed2596d242?w=1600&q=90', tagline: 'Make a Splash' },
  'air': { name: 'Air Experiences', icon: '🚁', desc: 'See the world from breathtaking new heights', heroImage: 'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=1600&q=90', tagline: 'Take Flight' },
  'wellness': { name: 'Wellness & Spa', icon: '🧘', desc: 'Rejuvenate your body, mind and soul', heroImage: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=1600&q=90', tagline: 'Find Your Zen' },
  'nightlife': { name: 'Nightlife', icon: '🌃', desc: 'Dance until dawn in legendary venues', heroImage: 'https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=1600&q=90', tagline: 'Night Owls Unite' },
  'walking-tours': { name: 'Walking Tours', icon: '🚶', desc: 'Explore hidden gems with expert local guides', heroImage: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1600&q=90', tagline: 'Walk This Way' },
  'landmarks': { name: 'Landmarks & Attractions', icon: '🗽', desc: 'Visit iconic sites that define the destination', heroImage: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1600&q=90', tagline: 'Iconic Moments' },
  'classes': { name: 'Classes & Workshops', icon: '📚', desc: 'Learn new skills from passionate local experts', heroImage: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1600&q=90', tagline: 'Learn Something New' },
  'day-trips': { name: 'Day Trips', icon: '🚐', desc: 'Escape the city and explore surrounding wonders', heroImage: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1600&q=90', tagline: 'Adventure Awaits' },
  'photography': { name: 'Photography Tours', icon: '📸', desc: 'Capture stunning moments at perfect locations', heroImage: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=1600&q=90', tagline: 'Picture Perfect' },
  'private-tours': { name: 'Private Tours', icon: '🎯', desc: 'Exclusive experiences tailored just for you', heroImage: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1600&q=90', tagline: 'VIP Treatment' },
};

export default function AllCategoryPage() {
  const params = useParams();
  const category = (params.category as string) || 'cruises';
  const [selectedRegion, setSelectedRegion] = useState('all');

  const catInfo = CATEGORIES[category] || CATEGORIES['cruises'];

  // Group destinations by region
  const regions = [
    { id: 'all', name: 'All Destinations', emoji: '🌍' },
    { id: 'europe', name: 'Europe', emoji: '🇪🇺' },
    { id: 'asia', name: 'Asia', emoji: '🌏' },
    { id: 'americas', name: 'Americas', emoji: '🌎' },
    { id: 'oceania', name: 'Oceania', emoji: '🌊' },
    { id: 'middleeast', name: 'Middle East', emoji: '🕌' },
    { id: 'africa', name: 'Africa', emoji: '🌍' },
  ];

  const destinationsByRegion: Record<string, typeof ALL_DESTINATIONS> = {
    europe: ALL_DESTINATIONS.filter(d => ['Spain', 'France', 'Italy', 'UK', 'Greece', 'Netherlands'].includes(d.country)),
    asia: ALL_DESTINATIONS.filter(d => ['Japan', 'Thailand', 'Indonesia', 'Singapore'].includes(d.country)),
    americas: ALL_DESTINATIONS.filter(d => ['USA', 'Mexico', 'Brazil'].includes(d.country)),
    oceania: ALL_DESTINATIONS.filter(d => ['Australia'].includes(d.country)),
    middleeast: ALL_DESTINATIONS.filter(d => ['UAE'].includes(d.country)),
    africa: ALL_DESTINATIONS.filter(d => ['South Africa', 'Maldives'].includes(d.country)),
    all: ALL_DESTINATIONS,
  };

  const filteredDestinations = destinationsByRegion[selectedRegion] || ALL_DESTINATIONS;

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-orange-50/30">
      {/* ULTRA-PREMIUM HERO */}
      <section className="relative h-[55vh] min-h-[450px] overflow-hidden">
        <motion.div initial={{ scale: 1.1 }} animate={{ scale: 1 }} transition={{ duration: 1.5 }} className="absolute inset-0">
          <Image src={catInfo.heroImage} alt={catInfo.name} fill className="object-cover" priority quality={90} />
        </motion.div>

        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-red-900/20 via-transparent to-orange-900/20" />

        {/* Navigation */}
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-20">
          <Link href="/experiences" className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md text-white/90 hover:bg-white/20 transition-all">
            <ChevronLeft className="w-4 h-4" />
            <span className="text-sm font-medium">All Experiences</span>
          </Link>
          <div className="px-4 py-2 rounded-full bg-gradient-to-r from-yellow-500/80 to-orange-500/80 text-white text-sm font-bold">
            <Globe className="w-4 h-4 inline mr-2" />
            {filteredDestinations.length} Destinations
          </div>
        </div>

        {/* Hero Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center max-w-4xl">
            <motion.div
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full mb-6"
              style={{ background: 'linear-gradient(135deg, rgba(247,201,40,0.9) 0%, rgba(255,150,50,0.9) 100%)', boxShadow: '0 4px 30px rgba(247,201,40,0.4)' }}
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <span className="text-2xl">{catInfo.icon}</span>
              <span className="text-sm font-bold text-white uppercase tracking-wider">{catInfo.tagline}</span>
              <Sparkles className="w-4 h-4 text-white" />
            </motion.div>

            <motion.h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-4" style={{ textShadow: '0 4px 30px rgba(0,0,0,0.5)' }}>
              {catInfo.name}{' '}
              <motion.span
                className="inline-block"
                style={{ background: 'linear-gradient(135deg, #FFD700 0%, #FFF 25%, #FFD700 50%, #FF6B6B 75%, #FFD700 100%)', backgroundSize: '200% 200%', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              >
                Worldwide
              </motion.span>
            </motion.h1>

            <p className="text-lg md:text-xl text-white/90 mb-2">{catInfo.desc}</p>
            <p className="text-base text-white/70">Available in {filteredDestinations.length}+ destinations across the globe</p>
          </motion.div>
        </div>
      </section>

      {/* Region Filter */}
      <section className="sticky top-0 z-30 bg-white/95 backdrop-blur-lg shadow-lg border-b py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-2">
            {regions.map((region) => (
              <motion.button
                key={region.id}
                onClick={() => setSelectedRegion(region.id)}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${selectedRegion === region.id ? 'text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                style={selectedRegion === region.id ? { background: 'linear-gradient(135deg, #E74035 0%, #FF6B6B 100%)' } : {}}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="mr-1.5">{region.emoji}</span>
                {region.name}
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Destinations Grid */}
      <section className="py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl lg:text-4xl font-black text-gray-900 mb-2">
              Choose Your <span className="text-[#E74035]">Destination</span>
            </h2>
            <p className="text-gray-600">Click on a destination to explore {catInfo.name.toLowerCase()}</p>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={selectedRegion}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
            >
              {filteredDestinations.map((dest, index) => (
                <motion.div
                  key={dest.slug}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <Link
                    href={`/experiences/${dest.slug}/${category}`}
                    className="group relative block h-52 rounded-2xl overflow-hidden"
                    style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                  >
                    <Image src={dest.image} alt={dest.name} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent group-hover:from-[#E74035]/80 transition-all duration-300" />

                    {/* Flag Badge */}
                    <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-white/20 backdrop-blur-sm text-sm">
                      {dest.flag}
                    </div>

                    {/* Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="font-bold text-white text-lg mb-1">{dest.name}</h3>
                      <p className="text-white/70 text-sm">{dest.country}</p>
                      <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-xs text-white/80">Explore {catInfo.name.split(' ')[0]}</span>
                        <ChevronRight className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Other Categories */}
      <section className="py-12 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 text-center mb-8">Explore Other Categories</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {Object.entries(CATEGORIES)
              .filter(([id]) => id !== category)
              .slice(0, 8)
              .map(([id, cat]) => (
                <Link
                  key={id}
                  href={`/experiences/all/${id}`}
                  className="group flex flex-col items-center p-3 rounded-xl bg-white shadow hover:shadow-lg transition-all hover:-translate-y-1"
                >
                  <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">{cat.icon}</span>
                  <span className="text-xs font-medium text-gray-700 text-center">{cat.name.split(' ')[0]}</span>
                </Link>
              ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: <Shield className="w-7 h-7" />, label: 'Best Price Guarantee', color: 'text-green-500' },
              { icon: <Zap className="w-7 h-7" />, label: 'Instant Confirmation', color: 'text-yellow-500' },
              { icon: <CheckCircle className="w-7 h-7" />, label: 'Free Cancellation', color: 'text-blue-500' },
              { icon: <HeadphonesIcon className="w-7 h-7" />, label: '24/7 Support', color: 'text-purple-500' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3 p-4 rounded-xl bg-gray-50"
              >
                <div className={item.color}>{item.icon}</div>
                <span className="font-semibold text-gray-900 text-sm">{item.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
