"use client";

import { motion } from 'framer-motion';

interface FireworksProps {
  colors?: string[];
  count?: number;
}

export default function Fireworks({
  colors = ['#FFD700', '#FF4F00', '#00C8FF', '#FF1744', '#00E676'],
  count = 5
}: FireworksProps) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: count }).map((_, i) => {
        const x = 20 + (i * 15) + Math.random() * 10;
        const y = 20 + Math.random() * 40;
        const color = colors[i % colors.length];

        return (
          <div
            key={i}
            className="absolute"
            style={{ left: `${x}%`, top: `${y}%` }}
          >
            {/* Burst center */}
            <motion.div
              className="absolute w-4 h-4 rounded-full"
              style={{ backgroundColor: color }}
              animate={{
                scale: [0, 1.5, 0],
                opacity: [1, 1, 0],
              }}
              transition={{
                duration: 1.5,
                delay: i * 0.3,
                repeat: Infinity,
                repeatDelay: 3,
              }}
            />

            {/* Burst particles */}
            {Array.from({ length: 20 }).map((_, j) => {
              const angle = (j / 20) * Math.PI * 2;
              const distance = 50 + Math.random() * 30;
              const endX = Math.cos(angle) * distance;
              const endY = Math.sin(angle) * distance;

              return (
                <motion.div
                  key={j}
                  className="absolute w-2 h-2 rounded-full"
                  style={{ backgroundColor: color }}
                  animate={{
                    x: [0, endX],
                    y: [0, endY],
                    opacity: [1, 1, 0],
                    scale: [1, 0.5],
                  }}
                  transition={{
                    duration: 1.5,
                    delay: i * 0.3,
                    repeat: Infinity,
                    repeatDelay: 3,
                    ease: "easeOut",
                  }}
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
