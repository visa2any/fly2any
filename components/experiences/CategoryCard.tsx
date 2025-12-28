'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface CategoryCardProps {
  id: string;
  name: string;
  icon: string;
  image: string;
  count: number;
  fromPrice: number;
  currency?: string;
  seasonalBadge?: string | null;
  destination?: string;
}

export default function CategoryCard({
  id,
  name,
  icon,
  image,
  count,
  fromPrice,
  currency = 'USD',
  seasonalBadge,
  destination
}: CategoryCardProps) {
  const href = destination
    ? `/experiences/${destination.toLowerCase().replace(/\s+/g, '-')}/${id}`
    : `/experiences?category=${id}`;

  return (
    <Link href={href}>
      <motion.div
        className="group relative overflow-hidden rounded-2xl bg-white cursor-pointer"
        style={{
          boxShadow: '0 1px 2px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.04), 0 4px 8px rgba(0,0,0,0.03)'
        }}
        whileHover={{
          scale: 1.02,
          boxShadow: '0 4px 6px rgba(0,0,0,0.07), 0 10px 20px rgba(0,0,0,0.06), 0 20px 40px rgba(0,0,0,0.05)'
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={image || '/images/placeholder-experience.jpg'}
            alt={name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Icon Badge */}
          <div className="absolute top-3 left-3 w-10 h-10 rounded-xl bg-white/90 backdrop-blur-sm flex items-center justify-center text-xl shadow-lg">
            {icon}
          </div>

          {/* Count Badge */}
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-700 shadow-sm">
            {count}+ options
          </div>

          {/* Seasonal Badge */}
          {seasonalBadge && (
            <div className="absolute top-14 right-3 px-2.5 py-1 rounded-full bg-amber-500/90 backdrop-blur-sm text-xs font-medium text-white shadow-sm">
              {seasonalBadge}
            </div>
          )}

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-white font-semibold text-lg leading-tight mb-1 drop-shadow-lg">
              {name}
            </h3>
            <p className="text-white/90 text-sm font-medium">
              From <span className="text-white font-bold">${fromPrice.toFixed(0)}</span>
            </p>
          </div>
        </div>

        {/* Hover Arrow */}
        <div className="absolute bottom-4 right-4 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </motion.div>
    </Link>
  );
}
