"use client";

import { WorldCupStadiumData } from '@/lib/data/world-cup-2026';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPinIcon, UsersIcon, CalendarIcon } from '@heroicons/react/24/outline';

interface StadiumCardProps {
  stadium: WorldCupStadiumData;
  index?: number;
}

export default function StadiumCard({ stadium, index = 0 }: StadiumCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -10 }}
      className="group"
    >
      <Link href={`/world-cup-2026/stadiums/${stadium.slug}`}>
        <div className="relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 bg-white">
          {/* Stadium Image */}
          <div className="relative h-56 overflow-hidden">
            <div
              className="absolute inset-0 bg-gradient-to-br transition-all duration-500 group-hover:scale-110"
              style={{
                background: `linear-gradient(135deg, ${stadium.cityPrimaryColor} 0%, ${stadium.citySecondaryColor} 100%)`,
              }}
            />
            {/* Placeholder for actual stadium image */}
            <div className="absolute inset-0 flex items-center justify-center text-white">
              <div className="text-center">
                <div className="text-6xl mb-2">🏟️</div>
                <div className="text-sm opacity-80">Stadium Photo</div>
              </div>
            </div>

            {/* City Label */}
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold">
              {stadium.city}, {stadium.country}
            </div>

            {/* Match Count Badge */}
            <div className="absolute top-4 right-4 bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              <CalendarIcon className="w-4 h-4" />
              {stadium.matchCount} Matches
            </div>
          </div>

          {/* Stadium Info */}
          <div className="p-6">
            <h3 className="text-2xl font-bold mb-1 text-gray-900 group-hover:text-blue-600 transition-colors">
              {stadium.name}
            </h3>
            {stadium.nickname && (
              <p className="text-sm text-gray-500 italic mb-3">"{stadium.nickname}"</p>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="flex items-center gap-2 text-gray-600">
                <UsersIcon className="w-5 h-5 text-blue-500" />
                <div>
                  <div className="text-xs text-gray-500">Capacity</div>
                  <div className="font-semibold">{stadium.capacity.toLocaleString()}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-gray-600">
                <MapPinIcon className="w-5 h-5 text-green-500" />
                <div>
                  <div className="text-xs text-gray-500">Airport</div>
                  <div className="font-semibold text-sm">{stadium.airportCode}</div>
                </div>
              </div>
            </div>

            {/* View Details CTA */}
            <motion.div
              className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-blue-600 font-semibold group-hover:text-blue-700"
              whileHover={{ x: 5 }}
            >
              <span>View Matches & Travel Info</span>
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                →
              </motion.span>
            </motion.div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
