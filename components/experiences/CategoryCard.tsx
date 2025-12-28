'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState } from 'react';

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
  id, name, icon, image, count, fromPrice, currency = 'USD', seasonalBadge, destination
}: CategoryCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const href = destination
    ? `/experiences/${destination.toLowerCase().replace(/s+/g, '-')}/${id}`
    : `/experiences?category=${id}`;

  return (
    <Link href={href}>
      <motion.div
        className="group relative overflow-hidden rounded-2xl bg-white cursor-pointer"
        style={{
          boxShadow: isHovered
            ? '0 8px 30px rgba(231, 64, 53, 0.18), 0 20px 50px rgba(0,0,0,0.12)'
            : '0 2px 8px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)'
        }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{ scale: 1.03, y: -6 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={image || '/images/placeholder-experience.jpg'}
            alt={name}
            fill
            className="object-cover transition-all duration-700 ease-out"
            style={{
              transform: isHovered ? 'scale(1.15)' : 'scale(1)',
              filter: isHovered ? 'brightness(1.1) saturate(1.2)' : 'brightness(1) saturate(1)'
            }}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />

          <div
            className="absolute inset-0 transition-all duration-500"
            style={{
              background: isHovered
                ? 'linear-gradient(to top, rgba(231,64,53,0.85) 0%, rgba(247,201,40,0.25) 45%, transparent 75%)'
                : 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)'
            }}
          />

          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ x: isHovered ? '100%' : '-100%', opacity: isHovered ? 0.35 : 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)', transform: 'skewX(-20deg)' }}
          />

          <motion.div
            className="absolute top-3 left-3 w-11 h-11 rounded-xl bg-white/95 backdrop-blur-md flex items-center justify-center text-xl"
            style={{ boxShadow: isHovered ? '0 4px 20px rgba(231,64,53,0.4), 0 0 30px rgba(247,201,40,0.3)' : '0 2px 10px rgba(0,0,0,0.15)' }}
            animate={{ rotate: isHovered ? [0, -5, 5, 0] : 0 }}
            transition={{ duration: 0.4 }}
          >
            {icon}
          </motion.div>

          <motion.div
            className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md text-xs font-bold"
            style={{ color: isHovered ? '#E74035' : '#374151', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
            animate={{ scale: isHovered ? 1.05 : 1 }}
          >
            {count}+ options
          </motion.div>

          {seasonalBadge && (
            <motion.div
              className="absolute top-14 right-3 px-3 py-1 rounded-full text-xs font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #F7C928 0%, #FF9500 100%)', boxShadow: '0 2px 10px rgba(247,201,40,0.4)' }}
              animate={{ y: isHovered ? -2 : 0 }}
            >
              {seasonalBadge}
            </motion.div>
          )}

          {count > 15 && (
            <motion.div
              className="absolute top-3 left-16 px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #E74035 0%, #FF6B6B 100%)', boxShadow: '0 2px 8px rgba(231,64,53,0.4)' }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              HOT
            </motion.div>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-white font-bold text-lg leading-tight mb-1" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
              {name}
            </h3>
            <div className="flex items-center gap-2">
              <p className="text-white/95 text-sm font-medium">
                From <span className="font-black text-base transition-all duration-300" style={{ color: isHovered ? '#F7C928' : 'white', textShadow: isHovered ? '0 0 20px rgba(247,201,40,0.6)' : 'none' }}>${fromPrice.toFixed(0)}</span>
              </p>
              <motion.span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-green-500/90 text-white"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : -10 }}
              >
                SAVE 20%
              </motion.span>
            </div>
          </div>
        </div>

        <motion.div
          className="absolute bottom-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white"
          style={{ background: 'linear-gradient(135deg, #E74035 0%, #FF6B6B 100%)', boxShadow: '0 4px 15px rgba(231,64,53,0.4)' }}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : 10 }}
          transition={{ duration: 0.2 }}
        >
          Explore
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </motion.div>
      </motion.div>
    </Link>
  );
}
