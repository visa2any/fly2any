'use client';

import Link from 'next/link';
import { Plane, Star, ArrowRight, Award } from 'lucide-react';

/**
 * Airlines Preview Section for Homepage
 *
 * Showcases featured airlines with links to airline review pages (SEO)
 */

interface Airline {
  slug: string;
  name: string;
  code: string;
  rating: number;
  reviewCount: number;
  description: string;
  logo: string;
  alliance?: string;
}

// Featured airlines (top carriers)
const featuredAirlines: Airline[] = [
  {
    slug: 'delta-air-lines',
    name: 'Delta Air Lines',
    code: 'DL',
    rating: 4.3,
    reviewCount: 15420,
    description: 'Premier US carrier with extensive domestic and international routes',
    logo: '🔺',
    alliance: 'SkyTeam'
  },
  {
    slug: 'american-airlines',
    name: 'American Airlines',
    code: 'AA',
    rating: 4.1,
    reviewCount: 18350,
    description: 'Largest airline in the world with global network coverage',
    logo: '🦅',
    alliance: 'oneworld'
  },
  {
    slug: 'united-airlines',
    name: 'United Airlines',
    code: 'UA',
    rating: 4.2,
    reviewCount: 14200,
    description: 'Major US carrier with strong international presence',
    logo: '🌐',
    alliance: 'Star Alliance'
  },
  {
    slug: 'emirates',
    name: 'Emirates',
    code: 'EK',
    rating: 4.7,
    reviewCount: 22100,
    description: 'Luxury Middle Eastern carrier known for exceptional service',
    logo: '✈️',
    alliance: undefined
  },
  {
    slug: 'lufthansa',
    name: 'Lufthansa',
    code: 'LH',
    rating: 4.4,
    reviewCount: 13800,
    description: 'Premium European airline with extensive route network',
    logo: '🦅',
    alliance: 'Star Alliance'
  },
  {
    slug: 'british-airways',
    name: 'British Airways',
    code: 'BA',
    rating: 4.2,
    reviewCount: 16500,
    description: 'UK flag carrier with worldwide destinations',
    logo: '🇬🇧',
    alliance: 'oneworld'
  }
];

export function AirlinesPreviewSection() {
  return (
    <section className="py-16 bg-white">
      <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: '1600px' }}>
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Plane className="w-8 h-8 text-primary-600" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Top Airlines
            </h2>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Compare airlines, read reviews, and choose the best carrier for your journey
          </p>
        </div>

        {/* Airlines Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {featuredAirlines.map((airline) => (
            <Link
              key={airline.slug}
              href={`/airlines/${airline.slug}`}
              className="group bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border-2 border-gray-200 hover:border-primary-400 hover:shadow-xl transition-all duration-300"
            >
              {/* Airline Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="text-5xl group-hover:scale-110 transition-transform">
                    {airline.logo}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                      {airline.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span className="font-mono font-semibold">{airline.code}</span>
                      {airline.alliance && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Award className="w-3 h-3" />
                            {airline.alliance}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= Math.floor(airline.rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-semibold text-gray-700">
                  {airline.rating}
                </span>
                <span className="text-sm text-gray-500">
                  ({airline.reviewCount.toLocaleString()} reviews)
                </span>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {airline.description}
              </p>

              {/* View Details Link */}
              <div className="flex items-center gap-2 text-primary-600 font-semibold text-sm group-hover:gap-3 transition-all">
                View Airline Details
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>

        {/* View All Airlines Link */}
        <div className="text-center">
          <Link
            href="/airlines/delta-air-lines"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-secondary-700 transition-all shadow-lg hover:shadow-xl hover:scale-105"
          >
            <Plane className="w-5 h-5" />
            Compare All Airlines
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
