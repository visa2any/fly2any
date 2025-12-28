'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import CategoryCard from '@/components/experiences/CategoryCard';
import { isCategoryAvailable, getSeasonalBadge } from '@/lib/experiences/seasonal';
import { Compass, ChevronRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface CategoryData {
  id: string;
  name: string;
  icon: string;
  count: number;
}

interface ExperienceData {
  id: string;
  name: string;
  pictures?: string[];
  price?: { amount: string };
}

interface ApiResponse {
  success: boolean;
  categories: CategoryData[];
  data: Record<string, ExperienceData[]>;
}

// Featured categories to display (8 max for grid)
const FEATURED_CATEGORIES = [
  'cruises', 'food-wine', 'shows', 'adventure',
  'museums', 'water-sports', 'air', 'wellness'
];

// Default images per category (fallback)
const CATEGORY_IMAGES: Record<string, string> = {
  'cruises': 'https://images.unsplash.com/photo-1548574505-5e239809ee19?w=600',
  'food-wine': 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600',
  'shows': 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=600',
  'adventure': 'https://images.unsplash.com/photo-1527004013197-933c4bb611b3?w=600',
  'museums': 'https://images.unsplash.com/photo-1565060169194-19fabf63012c?w=600',
  'water-sports': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600',
  'air': 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600',
  'wellness': 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600',
};

interface ExperiencesSectionProps {
  destination?: string;
  latitude?: number;
  longitude?: number;
}

export default function ExperiencesSection({
  destination = 'New York',
  latitude = 40.7580,
  longitude = -73.9855
}: ExperiencesSectionProps) {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchExperiences() {
      try {
        setLoading(true);
        const res = await fetch(
          `/api/experiences/categories?latitude=${latitude}&longitude=${longitude}&radius=5`
        );
        const json = await res.json();
        if (json.success) {
          setData(json);
        } else {
          setError(json.message || 'Failed to load experiences');
        }
      } catch (err) {
        setError('Failed to load experiences');
      } finally {
        setLoading(false);
      }
    }
    fetchExperiences();
  }, [latitude, longitude]);

  // Get category data with images
  const getCategoryCards = () => {
    if (!data) return [];

    return FEATURED_CATEGORIES
      .filter(catId => {
        // Filter out seasonal categories in winter
        if (!isCategoryAvailable(catId, latitude)) {
          return false;
        }
        // Only show categories with data
        const catData = data.data[catId];
        return catData && catData.length > 0;
      })
      .map(catId => {
        const category = data.categories.find(c => c.id === catId);
        const items = data.data[catId] || [];
        const firstItem = items[0];

        // Get real image from API or fallback
        const image = firstItem?.pictures?.[0] || CATEGORY_IMAGES[catId];

        // Get lowest price (already with markup)
        const prices = items
          .map(i => parseFloat(i.price?.amount || '0'))
          .filter(p => p > 0);
        const fromPrice = prices.length > 0 ? Math.min(...prices) : 50;

        return {
          id: catId,
          name: category?.name || catId,
          icon: category?.icon || '🎯',
          image,
          count: items.length,
          fromPrice,
          seasonalBadge: getSeasonalBadge(catId, latitude)
        };
      })
      .slice(0, 8); // Max 8 cards
  };

  const cards = getCategoryCards();

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#E74035]" />
          </div>
        </div>
      </section>
    );
  }

  if (error || cards.length === 0) {
    return null; // Hide section if no data
  }

  return (
    <section className="py-16 lg:py-20 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10"
        >
          <div>
            <div className="flex items-center gap-2 text-[#E74035] mb-2">
              <Compass className="w-5 h-5" />
              <span className="text-sm font-semibold uppercase tracking-wider">
                Experiences
              </span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
              Unforgettable Experiences
            </h2>
            <p className="mt-2 text-gray-600 text-lg">
              Curated activities from 45+ trusted providers worldwide
            </p>
          </div>

          <Link
            href="/experiences"
            className="inline-flex items-center gap-1.5 text-[#E74035] font-semibold hover:gap-2.5 transition-all group"
          >
            View all experiences
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* Category Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {cards.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <CategoryCard
                id={card.id}
                name={card.name}
                icon={card.icon}
                image={card.image}
                count={card.count}
                fromPrice={card.fromPrice}
                seasonalBadge={card.seasonalBadge}
                destination={destination}
              />
            </motion.div>
          ))}
        </div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500"
        >
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Free Cancellation</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Instant Confirmation</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Trusted Providers</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
