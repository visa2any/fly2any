"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { WorldCupStadiumData } from '@/lib/data/world-cup-2026';
import { getStadiumImages } from '@/lib/utils/stadium-images';
import { MapPinIcon, UsersIcon } from '@heroicons/react/24/outline';

interface StadiumCard3DProps {
  stadium: WorldCupStadiumData;
  index: number;
}

export default function StadiumCard3D({ stadium, index }: StadiumCard3DProps) {
  const [isHovered, setIsHovered] = useState(false);
  const images = getStadiumImages(stadium.slug);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Link href={`/world-cup-2026/stadiums/${stadium.slug}`}>
        <motion.div
          className="relative rounded-3xl overflow-hidden shadow-2xl cursor-pointer h-96"
          whileHover={{ y: -10, scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {/* Stadium Image Background */}
          <div className="absolute inset-0">
            <Image
              src={images.card}
              alt={stadium.name}
              fill
              className="object-cover"
              unoptimized
            />
            {/* Gradient overlay */}
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(to bottom, transparent 0%, ${stadium.cityPrimaryColor || '#000000'}90 100%)`,
              }}
            />
          </div>

          {/* Content */}
          <div className="relative h-full p-8 flex flex-col justify-between text-white">
            {/* Top badges */}
            <div className="flex items-start justify-between">
              {/* Country flag */}
              <motion.div
                className="text-5xl"
                animate={isHovered ? {
                  rotate: [0, 10, -10, 10, 0],
                  scale: [1, 1.2, 1],
                } : {}}
                transition={{ duration: 0.5 }}
              >
                {stadium.country === 'USA' && '🇺🇸'}
                {stadium.country === 'Mexico' && '🇲🇽'}
                {stadium.country === 'Canada' && '🇨🇦'}
              </motion.div>

              {/* Capacity badge */}
              <motion.div
                className="bg-white/20 backdrop-blur-md rounded-full px-4 py-2 flex items-center gap-2"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.2 }}
              >
                <UsersIcon className="w-4 h-4" />
                <span className="text-sm font-bold">{stadium.capacity.toLocaleString()}</span>
              </motion.div>
            </div>

            {/* Bottom info */}
            <div>
              {/* Stadium icon */}
              <motion.div
                className="text-6xl mb-4"
                animate={isHovered ? {
                  y: [-5, 5, -5],
                } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🏟️
              </motion.div>

              {/* Stadium name */}
              <h3 className="text-3xl font-black mb-2 drop-shadow-2xl">
                {stadium.name}
              </h3>

              {/* Location */}
              <div className="flex items-center gap-2 text-white/90 mb-4">
                <MapPinIcon className="w-5 h-5" />
                <span className="text-lg font-semibold">{stadium.city}, {stadium.country}</span>
              </div>

              {/* Match count badge */}
              <motion.div
                className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-full px-4 py-2"
                animate={isHovered ? {
                  scale: [1, 1.1, 1],
                  boxShadow: [
                    '0 0 0 0px rgba(255,255,255,0.4)',
                    '0 0 0 10px rgba(255,255,255,0)',
                  ],
                } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <span className="text-2xl">⚽</span>
                <span className="font-bold">{stadium.matchCount} Matches</span>
              </motion.div>

              {/* Hover CTA */}
              <motion.div
                className="mt-4"
                initial={{ opacity: 0, y: 20 }}
                animate={isHovered ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-2 text-sm font-bold">
                  <span>Explore Stadium</span>
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    →
                  </motion.span>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Glow effect on hover */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={isHovered ? {
              boxShadow: `inset 0 0 100px ${stadium.cityPrimaryColor || '#FFD700'}40`,
            } : {}}
            transition={{ duration: 0.3 }}
          />
        </motion.div>
      </Link>
    </motion.div>
  );
}
