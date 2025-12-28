'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Compass, MapPin, Loader2, Star, Sun, Plane, Sparkles, Globe, Heart, ChevronRight, Map, Users } from 'lucide-react';
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

// GLOBAL DESTINATIONS for hero
const DESTINATIONS = [
  { name: 'Bali', slug: 'bali', lat: -8.4095, lng: 115.1889, temp: '28°C', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1400', emoji: '🌴', vibe: 'Paradise awaits' },
  { name: 'Barcelona', slug: 'barcelona', lat: 41.3851, lng: 2.1734, temp: '18°C', image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=1400', emoji: '🏖️', vibe: 'Sun & culture' },
  { name: 'Dubai', slug: 'dubai', lat: 25.2048, lng: 55.2708, temp: '25°C', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1400', emoji: '✨', vibe: 'Luxury escape' },
  { name: 'Rio de Janeiro', slug: 'rio-de-janeiro', lat: -22.9068, lng: -43.1729, temp: '30°C', image: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=1400', emoji: '🎉', vibe: 'Feel alive' },
  { name: 'Santorini', slug: 'santorini', lat: 36.3932, lng: 25.4615, temp: '20°C', image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1400', emoji: '🌅', vibe: 'Dream views' },
  { name: 'Maldives', slug: 'maldives', lat: 3.2028, lng: 73.2207, temp: '29°C', image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1400', emoji: '🐚', vibe: 'Pure bliss' },
  { name: 'Tokyo', slug: 'tokyo', lat: 35.6762, lng: 139.6503, temp: '15°C', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1400', emoji: '🗼', vibe: 'Adventure' },
  { name: 'Paris', slug: 'paris', lat: 48.8566, lng: 2.3522, temp: '12°C', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1400', emoji: '💕', vibe: 'Romance' },
];

// ALL CATEGORIES with curated images
const ALL_CATEGORIES = [
  { id: 'cruises', name: 'Cruises & Boats', icon: '🚢', image: 'https://images.unsplash.com/photo-1548574505-5e239809ee19?w=800&q=80', cities: 48 },
  { id: 'food-wine', name: 'Food & Wine', icon: '🍷', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80', cities: 62 },
  { id: 'shows', name: 'Shows & Entertainment', icon: '🎭', image: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=800&q=80', cities: 35 },
  { id: 'adventure', name: 'Adventure', icon: '🏔️', image: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=800&q=80', cities: 71 },
  { id: 'museums', name: 'Museums & Culture', icon: '🏛️', image: 'https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=800&q=80', cities: 54 },
  { id: 'water-sports', name: 'Water Sports', icon: '🤿', image: 'https://images.unsplash.com/photo-1530053969600-caed2596d242?w=800&q=80', cities: 43 },
  { id: 'air', name: 'Air Experiences', icon: '🚁', image: 'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=800&q=80', cities: 28 },
  { id: 'wellness', name: 'Wellness & Spa', icon: '🧘', image: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=800&q=80', cities: 56 },
  { id: 'nightlife', name: 'Nightlife', icon: '🌃', image: 'https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=800&q=80', cities: 40 },
  { id: 'walking-tours', name: 'Walking Tours', icon: '🚶', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80', cities: 67 },
  { id: 'landmarks', name: 'Landmarks', icon: '🗽', image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&q=80', cities: 58 },
  { id: 'classes', name: 'Classes & Workshops', icon: '📚', image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80', cities: 44 },
  { id: 'day-trips', name: 'Day Trips', icon: '🚐', image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80', cities: 72 },
  { id: 'photography', name: 'Photography Tours', icon: '📸', image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&q=80', cities: 31 },
  { id: 'private-tours', name: 'Private Tours', icon: '🎯', image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80', cities: 65 },
];

// REGIONS with countries and cities - EXPANDED with all product destinations
const REGIONS = [
  {
    name: 'Europe',
    emoji: '🇪🇺',
    gradient: 'from-blue-600 to-indigo-600',
    image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400&q=80',
    countries: [
      { name: 'Spain', flag: '🇪🇸', cities: [{ name: 'Barcelona', slug: 'barcelona' }, { name: 'Madrid', slug: 'madrid' }, { name: 'Seville', slug: 'seville' }, { name: 'Valencia', slug: 'valencia' }, { name: 'Ibiza', slug: 'ibiza' }] },
      { name: 'France', flag: '🇫🇷', cities: [{ name: 'Paris', slug: 'paris' }, { name: 'Nice', slug: 'nice' }, { name: 'Lyon', slug: 'lyon' }, { name: 'Marseille', slug: 'marseille' }, { name: 'Bordeaux', slug: 'bordeaux' }] },
      { name: 'Italy', flag: '🇮🇹', cities: [{ name: 'Rome', slug: 'rome' }, { name: 'Florence', slug: 'florence' }, { name: 'Venice', slug: 'venice' }, { name: 'Milan', slug: 'milan' }, { name: 'Amalfi', slug: 'amalfi' }] },
      { name: 'UK', flag: '🇬🇧', cities: [{ name: 'London', slug: 'london' }, { name: 'Edinburgh', slug: 'edinburgh' }, { name: 'Manchester', slug: 'manchester' }, { name: 'Liverpool', slug: 'liverpool' }] },
      { name: 'Greece', flag: '🇬🇷', cities: [{ name: 'Santorini', slug: 'santorini' }, { name: 'Athens', slug: 'athens' }, { name: 'Mykonos', slug: 'mykonos' }, { name: 'Crete', slug: 'crete' }] },
      { name: 'Portugal', flag: '🇵🇹', cities: [{ name: 'Lisbon', slug: 'lisbon' }, { name: 'Porto', slug: 'porto' }, { name: 'Algarve', slug: 'algarve' }] },
      { name: 'Netherlands', flag: '🇳🇱', cities: [{ name: 'Amsterdam', slug: 'amsterdam' }, { name: 'Rotterdam', slug: 'rotterdam' }] },
      { name: 'Germany', flag: '🇩🇪', cities: [{ name: 'Berlin', slug: 'berlin' }, { name: 'Munich', slug: 'munich' }, { name: 'Frankfurt', slug: 'frankfurt' }] },
      { name: 'Switzerland', flag: '🇨🇭', cities: [{ name: 'Zurich', slug: 'zurich' }, { name: 'Geneva', slug: 'geneva' }, { name: 'Interlaken', slug: 'interlaken' }] },
      { name: 'Austria', flag: '🇦🇹', cities: [{ name: 'Vienna', slug: 'vienna' }, { name: 'Salzburg', slug: 'salzburg' }] },
      { name: 'Croatia', flag: '🇭🇷', cities: [{ name: 'Dubrovnik', slug: 'dubrovnik' }, { name: 'Split', slug: 'split' }] },
      { name: 'Czech Republic', flag: '🇨🇿', cities: [{ name: 'Prague', slug: 'prague' }] },
    ]
  },
  {
    name: 'Asia',
    emoji: '🌏',
    gradient: 'from-red-500 to-orange-500',
    image: 'https://images.unsplash.com/photo-1480796927426-f609979314bd?w=400&q=80',
    countries: [
      { name: 'China', flag: '🇨🇳', cities: [{ name: 'Shanghai', slug: 'shanghai' }, { name: 'Beijing', slug: 'beijing' }, { name: 'Hong Kong', slug: 'hong-kong' }, { name: 'Shenzhen', slug: 'shenzhen' }, { name: 'Guangzhou', slug: 'guangzhou' }, { name: 'Xi\'an', slug: 'xian' }, { name: 'Chengdu', slug: 'chengdu' }, { name: 'Hangzhou', slug: 'hangzhou' }] },
      { name: 'Japan', flag: '🇯🇵', cities: [{ name: 'Tokyo', slug: 'tokyo' }, { name: 'Kyoto', slug: 'kyoto' }, { name: 'Osaka', slug: 'osaka' }, { name: 'Hiroshima', slug: 'hiroshima' }, { name: 'Fukuoka', slug: 'fukuoka' }] },
      { name: 'South Korea', flag: '🇰🇷', cities: [{ name: 'Seoul', slug: 'seoul' }, { name: 'Busan', slug: 'busan' }, { name: 'Jeju', slug: 'jeju' }] },
      { name: 'Thailand', flag: '🇹🇭', cities: [{ name: 'Bangkok', slug: 'bangkok' }, { name: 'Phuket', slug: 'phuket' }, { name: 'Chiang Mai', slug: 'chiang-mai' }, { name: 'Krabi', slug: 'krabi' }, { name: 'Koh Samui', slug: 'koh-samui' }] },
      { name: 'Indonesia', flag: '🇮🇩', cities: [{ name: 'Bali', slug: 'bali' }, { name: 'Jakarta', slug: 'jakarta' }, { name: 'Yogyakarta', slug: 'yogyakarta' }, { name: 'Lombok', slug: 'lombok' }] },
      { name: 'Singapore', flag: '🇸🇬', cities: [{ name: 'Singapore', slug: 'singapore' }] },
      { name: 'Malaysia', flag: '🇲🇾', cities: [{ name: 'Kuala Lumpur', slug: 'kuala-lumpur' }, { name: 'Penang', slug: 'penang' }, { name: 'Langkawi', slug: 'langkawi' }] },
      { name: 'Vietnam', flag: '🇻🇳', cities: [{ name: 'Ho Chi Minh', slug: 'ho-chi-minh' }, { name: 'Hanoi', slug: 'hanoi' }, { name: 'Da Nang', slug: 'da-nang' }, { name: 'Hoi An', slug: 'hoi-an' }] },
      { name: 'Philippines', flag: '🇵🇭', cities: [{ name: 'Manila', slug: 'manila' }, { name: 'Cebu', slug: 'cebu' }, { name: 'Boracay', slug: 'boracay' }, { name: 'Palawan', slug: 'palawan' }] },
      { name: 'India', flag: '🇮🇳', cities: [{ name: 'Delhi', slug: 'delhi' }, { name: 'Mumbai', slug: 'mumbai' }, { name: 'Jaipur', slug: 'jaipur' }, { name: 'Goa', slug: 'goa' }, { name: 'Agra', slug: 'agra' }] },
      { name: 'Taiwan', flag: '🇹🇼', cities: [{ name: 'Taipei', slug: 'taipei' }, { name: 'Kaohsiung', slug: 'kaohsiung' }] },
      { name: 'Maldives', flag: '🇲🇻', cities: [{ name: 'Malé', slug: 'male' }] },
      { name: 'Sri Lanka', flag: '🇱🇰', cities: [{ name: 'Colombo', slug: 'colombo' }, { name: 'Kandy', slug: 'kandy' }] },
      { name: 'Nepal', flag: '🇳🇵', cities: [{ name: 'Kathmandu', slug: 'kathmandu' }] },
      { name: 'Cambodia', flag: '🇰🇭', cities: [{ name: 'Siem Reap', slug: 'siem-reap' }, { name: 'Phnom Penh', slug: 'phnom-penh' }] },
    ]
  },
  {
    name: 'Middle East',
    emoji: '🕌',
    gradient: 'from-amber-500 to-yellow-500',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&q=80',
    countries: [
      { name: 'UAE', flag: '🇦🇪', cities: [{ name: 'Dubai', slug: 'dubai' }, { name: 'Abu Dhabi', slug: 'abu-dhabi' }, { name: 'Sharjah', slug: 'sharjah' }] },
      { name: 'Saudi Arabia', flag: '🇸🇦', cities: [{ name: 'Riyadh', slug: 'riyadh' }, { name: 'Jeddah', slug: 'jeddah' }, { name: 'Mecca', slug: 'mecca' }, { name: 'Medina', slug: 'medina' }] },
      { name: 'Qatar', flag: '🇶🇦', cities: [{ name: 'Doha', slug: 'doha' }] },
      { name: 'Oman', flag: '🇴🇲', cities: [{ name: 'Muscat', slug: 'muscat' }] },
      { name: 'Jordan', flag: '🇯🇴', cities: [{ name: 'Amman', slug: 'amman' }, { name: 'Petra', slug: 'petra' }, { name: 'Dead Sea', slug: 'dead-sea' }] },
      { name: 'Israel', flag: '🇮🇱', cities: [{ name: 'Tel Aviv', slug: 'tel-aviv' }, { name: 'Jerusalem', slug: 'jerusalem' }, { name: 'Eilat', slug: 'eilat' }] },
      { name: 'Turkey', flag: '🇹🇷', cities: [{ name: 'Istanbul', slug: 'istanbul' }, { name: 'Cappadocia', slug: 'cappadocia' }, { name: 'Antalya', slug: 'antalya' }, { name: 'Bodrum', slug: 'bodrum' }] },
      { name: 'Bahrain', flag: '🇧🇭', cities: [{ name: 'Manama', slug: 'manama' }] },
      { name: 'Kuwait', flag: '🇰🇼', cities: [{ name: 'Kuwait City', slug: 'kuwait-city' }] },
    ]
  },
  {
    name: 'Americas',
    emoji: '🌎',
    gradient: 'from-green-500 to-teal-500',
    image: 'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=400&q=80',
    countries: [
      { name: 'USA', flag: '🇺🇸', cities: [{ name: 'New York', slug: 'new-york' }, { name: 'Miami', slug: 'miami' }, { name: 'Los Angeles', slug: 'los-angeles' }, { name: 'Las Vegas', slug: 'las-vegas' }, { name: 'San Francisco', slug: 'san-francisco' }, { name: 'Orlando', slug: 'orlando' }, { name: 'Chicago', slug: 'chicago' }, { name: 'Hawaii', slug: 'hawaii' }] },
      { name: 'Canada', flag: '🇨🇦', cities: [{ name: 'Toronto', slug: 'toronto' }, { name: 'Vancouver', slug: 'vancouver' }, { name: 'Montreal', slug: 'montreal' }, { name: 'Banff', slug: 'banff' }] },
      { name: 'Mexico', flag: '🇲🇽', cities: [{ name: 'Cancun', slug: 'cancun' }, { name: 'Mexico City', slug: 'mexico-city' }, { name: 'Playa del Carmen', slug: 'playa-del-carmen' }, { name: 'Los Cabos', slug: 'los-cabos' }, { name: 'Puerto Vallarta', slug: 'puerto-vallarta' }] },
      { name: 'Brazil', flag: '🇧🇷', cities: [{ name: 'Rio de Janeiro', slug: 'rio-de-janeiro' }, { name: 'São Paulo', slug: 'sao-paulo' }, { name: 'Salvador', slug: 'salvador' }, { name: 'Florianópolis', slug: 'florianopolis' }] },
      { name: 'Argentina', flag: '🇦🇷', cities: [{ name: 'Buenos Aires', slug: 'buenos-aires' }, { name: 'Mendoza', slug: 'mendoza' }, { name: 'Patagonia', slug: 'patagonia' }] },
      { name: 'Peru', flag: '🇵🇪', cities: [{ name: 'Lima', slug: 'lima' }, { name: 'Cusco', slug: 'cusco' }, { name: 'Machu Picchu', slug: 'machu-picchu' }] },
      { name: 'Colombia', flag: '🇨🇴', cities: [{ name: 'Bogota', slug: 'bogota' }, { name: 'Cartagena', slug: 'cartagena' }, { name: 'Medellin', slug: 'medellin' }] },
      { name: 'Chile', flag: '🇨🇱', cities: [{ name: 'Santiago', slug: 'santiago' }, { name: 'Valparaiso', slug: 'valparaiso' }] },
      { name: 'Costa Rica', flag: '🇨🇷', cities: [{ name: 'San Jose', slug: 'san-jose' }, { name: 'Guanacaste', slug: 'guanacaste' }] },
      { name: 'Caribbean', flag: '🏝️', cities: [{ name: 'Punta Cana', slug: 'punta-cana' }, { name: 'Jamaica', slug: 'jamaica' }, { name: 'Bahamas', slug: 'bahamas' }, { name: 'Aruba', slug: 'aruba' }] },
    ]
  },
  {
    name: 'Oceania',
    emoji: '🌊',
    gradient: 'from-cyan-500 to-blue-500',
    image: 'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=400&q=80',
    countries: [
      { name: 'Australia', flag: '🇦🇺', cities: [{ name: 'Sydney', slug: 'sydney' }, { name: 'Melbourne', slug: 'melbourne' }, { name: 'Gold Coast', slug: 'gold-coast' }, { name: 'Brisbane', slug: 'brisbane' }, { name: 'Cairns', slug: 'cairns' }, { name: 'Perth', slug: 'perth' }] },
      { name: 'New Zealand', flag: '🇳🇿', cities: [{ name: 'Auckland', slug: 'auckland' }, { name: 'Queenstown', slug: 'queenstown' }, { name: 'Wellington', slug: 'wellington' }, { name: 'Rotorua', slug: 'rotorua' }] },
      { name: 'Fiji', flag: '🇫🇯', cities: [{ name: 'Nadi', slug: 'nadi' }, { name: 'Suva', slug: 'suva' }] },
      { name: 'French Polynesia', flag: '🇵🇫', cities: [{ name: 'Bora Bora', slug: 'bora-bora' }, { name: 'Tahiti', slug: 'tahiti' }] },
    ]
  },
  {
    name: 'Africa',
    emoji: '🌍',
    gradient: 'from-orange-600 to-red-600',
    image: 'https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=400&q=80',
    countries: [
      { name: 'South Africa', flag: '🇿🇦', cities: [{ name: 'Cape Town', slug: 'cape-town' }, { name: 'Johannesburg', slug: 'johannesburg' }, { name: 'Durban', slug: 'durban' }, { name: 'Kruger', slug: 'kruger' }] },
      { name: 'Morocco', flag: '🇲🇦', cities: [{ name: 'Marrakech', slug: 'marrakech' }, { name: 'Casablanca', slug: 'casablanca' }, { name: 'Fes', slug: 'fes' }, { name: 'Chefchaouen', slug: 'chefchaouen' }] },
      { name: 'Egypt', flag: '🇪🇬', cities: [{ name: 'Cairo', slug: 'cairo' }, { name: 'Luxor', slug: 'luxor' }, { name: 'Hurghada', slug: 'hurghada' }, { name: 'Sharm El Sheikh', slug: 'sharm-el-sheikh' }] },
      { name: 'Kenya', flag: '🇰🇪', cities: [{ name: 'Nairobi', slug: 'nairobi' }, { name: 'Mombasa', slug: 'mombasa' }, { name: 'Masai Mara', slug: 'masai-mara' }] },
      { name: 'Tanzania', flag: '🇹🇿', cities: [{ name: 'Zanzibar', slug: 'zanzibar' }, { name: 'Serengeti', slug: 'serengeti' }] },
      { name: 'Mauritius', flag: '🇲🇺', cities: [{ name: 'Port Louis', slug: 'port-louis' }] },
      { name: 'Tunisia', flag: '🇹🇳', cities: [{ name: 'Tunis', slug: 'tunis' }] },
      { name: 'Seychelles', flag: '🇸🇨', cities: [{ name: 'Mahé', slug: 'mahe' }] },
    ]
  },
];

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
  const [activeRegion, setActiveRegion] = useState(0);

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
      {/* HERO */}
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
            <Image src={DESTINATIONS[heroIndex].image} alt="Destination" fill className="object-cover" priority />
          </motion.div>
        </AnimatePresence>

        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-orange-900/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-red-900/30 via-transparent to-yellow-900/30" />

        <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center w-full max-w-6xl mx-auto">
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

            <motion.h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black mb-6" style={{ textShadow: '0 4px 30px rgba(0,0,0,0.5)' }}>
              Life is Short.{' '}
              <motion.span
                className="inline-block"
                style={{ background: 'linear-gradient(135deg, #FFD700 0%, #FFF 25%, #FFD700 50%, #FF6B6B 75%, #FFD700 100%)', backgroundSize: '200% 200%', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              >
                Travel More.
              </motion.span>
            </motion.h1>

            <p className="text-xl md:text-2xl text-white/90 mb-4 font-light" style={{ textShadow: '0 2px 20px rgba(0,0,0,0.3)' }}>300,000+ experiences in 100+ destinations worldwide</p>
            <p className="text-lg text-white/70 mb-10">From tropical beaches to vibrant cities — your next adventure awaits</p>

            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {DESTINATIONS.slice(0, 6).map((dest, i) => (
                <motion.button
                  key={dest.name}
                  onClick={() => setSelectedDestination(dest)}
                  className="group relative px-4 py-2.5 rounded-xl font-semibold transition-all"
                  style={{
                    background: selectedDestination.name === dest.name ? 'linear-gradient(135deg, #E74035 0%, #FF6B6B 100%)' : 'rgba(255,255,255,0.15)',
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

        <motion.div className="absolute bottom-8 left-1/2 transform -translate-x-1/2" animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
          <div className="w-6 h-10 rounded-full border-2 border-white/50 flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-white/70 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* BROWSE ALL CATEGORIES - NEW SECTION */}
      <section className="py-16 lg:py-20 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-orange-100/50 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-red-100/50 to-transparent rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-red-50 to-orange-50 text-[#E74035] text-sm font-bold mb-4">
              <Compass className="w-4 h-4" />
              BROWSE ALL CATEGORIES
            </div>
            <h2 className="text-3xl lg:text-5xl font-black text-gray-900 mb-4">
              What Do You Want to <span className="text-[#E74035]">Experience?</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">15 categories • 100+ destinations • Endless possibilities</p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {ALL_CATEGORIES.map((cat, index) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.03 }}
              >
                <Link
                  href={`/experiences/all/${cat.id}`}
                  className="group relative block h-44 rounded-2xl overflow-hidden"
                  style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                >
                  <Image src={cat.image} alt={cat.name} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent group-hover:from-[#E74035]/80 transition-all duration-300" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-3">
                    <span className="text-3xl mb-2 group-hover:scale-125 transition-transform">{cat.icon}</span>
                    <span className="font-bold text-center text-sm leading-tight">{cat.name}</span>
                    <span className="text-xs text-white/70 mt-1">{cat.cities} cities</span>
                  </div>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight className="w-5 h-5 text-white" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* BROWSE BY REGION - ULTRA PREMIUM SECTION */}
      <section className="py-20 lg:py-28 bg-gradient-to-b from-gray-900 via-gray-900 to-black relative overflow-hidden">
        {/* Animated background particles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-red-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-red-500/5 to-orange-500/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm font-bold mb-6 border border-white/20">
              <Globe className="w-4 h-4 text-[#E74035]" />
              EXPLORE THE WORLD
            </div>
            <h2 className="text-4xl lg:text-6xl font-black text-white mb-4">
              Where Will You <span className="bg-gradient-to-r from-[#E74035] to-[#F7C928] bg-clip-text text-transparent">Go?</span>
            </h2>
            <p className="text-lg text-gray-400">6 continents • 60+ countries • 200+ cities worldwide</p>
          </motion.div>

          {/* Region Tabs - Premium Glass Design */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {REGIONS.map((region, i) => (
              <motion.button
                key={region.name}
                onClick={() => setActiveRegion(i)}
                className={`group relative px-6 py-4 rounded-2xl font-bold transition-all overflow-hidden ${activeRegion === i ? 'text-white shadow-2xl scale-105' : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10 backdrop-blur-sm border border-white/10'}`}
                style={activeRegion === i ? { background: `linear-gradient(135deg, ${region.gradient.split(' ')[0].replace('from-', '')} 0%, ${region.gradient.split(' ')[1].replace('to-', '')} 100%)`.replace(/(\w+)-(\d+)/g, 'var(--$1-$2, #E74035)') } : {}}
                whileHover={{ scale: activeRegion === i ? 1.05 : 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                {activeRegion === i && (
                  <motion.div layoutId="activeRegionBg" className={`absolute inset-0 bg-gradient-to-r ${region.gradient}`} transition={{ type: 'spring', bounce: 0.2 }} />
                )}
                <span className="relative flex items-center gap-2">
                  <span className="text-2xl">{region.emoji}</span>
                  <span>{region.name}</span>
                  <span className="text-xs opacity-60">({region.countries.length})</span>
                </span>
              </motion.button>
            ))}
          </div>

          {/* Region Hero Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`hero-${activeRegion}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="relative h-48 md:h-56 rounded-3xl overflow-hidden mb-8"
            >
              <Image src={REGIONS[activeRegion].image} alt={REGIONS[activeRegion].name} fill className="object-cover" />
              <div className={`absolute inset-0 bg-gradient-to-r ${REGIONS[activeRegion].gradient} opacity-60`} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-center gap-4">
                  <span className="text-5xl">{REGIONS[activeRegion].emoji}</span>
                  <div>
                    <h3 className="text-3xl md:text-4xl font-black text-white">{REGIONS[activeRegion].name}</h3>
                    <p className="text-white/80">{REGIONS[activeRegion].countries.length} countries • {REGIONS[activeRegion].countries.reduce((sum, c) => sum + c.cities.length, 0)} destinations</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Countries Grid - Premium Cards */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeRegion}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            >
              {REGIONS[activeRegion].countries.map((country, index) => (
                <motion.div
                  key={country.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="group bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10 hover:border-white/30 hover:bg-white/10 transition-all"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-4xl drop-shadow-lg">{country.flag}</span>
                    <div>
                      <h3 className="font-bold text-lg text-white">{country.name}</h3>
                      <p className="text-xs text-gray-400">{country.cities.length} destinations</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {country.cities.slice(0, 6).map((city) => (
                      <Link
                        key={city.slug}
                        href={`/experiences/${city.slug}`}
                        className="px-3 py-1.5 rounded-full bg-white/10 text-sm font-medium text-white/80 hover:bg-[#E74035] hover:text-white transition-all border border-white/10 hover:border-transparent"
                      >
                        {city.name}
                      </Link>
                    ))}
                    {country.cities.length > 6 && (
                      <span className="px-3 py-1.5 rounded-full bg-white/5 text-sm text-white/50">+{country.cities.length - 6} more</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Quick Stats */}
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mt-12 flex flex-wrap justify-center gap-8">
            {[
              { value: '200+', label: 'Cities', icon: MapPin },
              { value: '60+', label: 'Countries', icon: Globe },
              { value: '6', label: 'Continents', icon: Map },
              { value: '15K+', label: 'Experiences', icon: Sparkles },
            ].map((stat, i) => (
              <div key={stat.label} className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <stat.icon className="w-5 h-5 text-[#E74035]" />
                  <span className="text-2xl font-black text-white">{stat.value}</span>
                </div>
                <span className="text-sm text-gray-400">{stat.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* SELECTED DESTINATION Categories */}
      <section className="py-16 lg:py-24 relative">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-orange-900/10 to-transparent" />
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
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
                  const image = CATEGORY_IMAGES[cat.id] || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80';
                  const prices = items.map(i => parseFloat(i.price?.amount || '0')).filter(p => p > 0);
                  const fromPrice = prices.length > 0 ? Math.min(...prices) : 50;

                  return (
                    <motion.div key={cat.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.05 }}>
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

              {/* Top Picks */}
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
                <div className="text-3xl lg:text-4xl font-black mb-1">{stat.value}</div>
                <div className="text-sm text-white/80">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
