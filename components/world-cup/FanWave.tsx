"use client";

import { motion } from 'framer-motion';

interface FanWaveProps {
  color?: string;
  count?: number;
}

export default function FanWave({ color = '#FFD700', count = 30 }: FanWaveProps) {
  return (
    <div className="relative w-full h-24 overflow-hidden">
      <div className="flex items-end justify-center gap-1 h-full">
        {Array.from({ length: count }).map((_, i) => (
          <motion.div
            key={i}
            className="w-3 rounded-t-full"
            style={{
              background: `linear-gradient(to top, ${color}, transparent)`,
            }}
            animate={{
              height: ['20%', '80%', '20%'],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 1.5,
              delay: i * 0.05,
              repeat: Infinity,
              repeatDelay: 0.5,
            }}
          />
        ))}
      </div>
    </div>
  );
}

// Crowd silhouette with wave animation
export function CrowdSilhouette() {
  return (
    <div className="relative w-full h-32 overflow-hidden bg-gradient-to-t from-black/20 to-transparent">
      <div className="absolute bottom-0 w-full flex items-end justify-center">
        {Array.from({ length: 50 }).map((_, i) => (
          <motion.div
            key={i}
            className="relative"
            animate={{
              y: [0, -20, 0],
            }}
            transition={{
              duration: 2,
              delay: i * 0.03,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          >
            {/* Fan silhouette */}
            <div
              className="w-4 h-12 rounded-t-full"
              style={{
                background: `linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.3))`,
              }}
            />
            {/* Head */}
            <div
              className="absolute -top-3 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-black/60"
            />
          </motion.div>
        ))}
      </div>

      {/* Cheer particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={`cheer-${i}`}
          className="absolute bottom-0 text-xs"
          style={{
            left: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -80],
            opacity: [1, 0],
            rotate: [0, Math.random() * 360],
          }}
          transition={{
            duration: 2 + Math.random(),
            delay: Math.random() * 3,
            repeat: Infinity,
          }}
        >
          {['⚽', '🎉', '❤️', '⭐', '🔥'][Math.floor(Math.random() * 5)]}
        </motion.div>
      ))}
    </div>
  );
}
