"use client";

import { WorldCupTeamData } from '@/lib/data/world-cup-2026';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface TeamCardProps {
  team: WorldCupTeamData;
  index?: number;
}

export default function TeamCard({ team, index = 0 }: TeamCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ scale: 1.05, y: -5 }}
      className="group relative"
    >
      <Link href={`/world-cup-2026/teams/${team.slug}`}>
        <div
          className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 h-64"
          style={{
            background: `linear-gradient(135deg, ${team.primaryColor} 0%, ${team.secondaryColor} 100%)`,
          }}
        >
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.3),transparent_50%)]" />
          </div>

          {/* Content */}
          <div className="relative h-full flex flex-col justify-between p-6">
            {/* Flag Emoji - Large and centered */}
            <div className="flex justify-center">
              <motion.div
                className="text-8xl"
                whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.2 }}
                transition={{ duration: 0.5 }}
              >
                {team.flagEmoji}
              </motion.div>
            </div>

            {/* Team Info */}
            <div className="text-center text-white">
              <h3 className="text-2xl font-bold mb-1 drop-shadow-lg">
                {team.name}
              </h3>
              <p className="text-sm opacity-90 mb-2">{team.confederation}</p>

              {/* World Cup Stats */}
              {team.worldCupWins > 0 && (
                <div className="flex items-center justify-center gap-1 text-yellow-300">
                  {Array.from({ length: team.worldCupWins }).map((_, i) => (
                    <motion.span
                      key={i}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.3 + i * 0.1, type: "spring" }}
                      className="text-2xl"
                    >
                      🏆
                    </motion.span>
                  ))}
                </div>
              )}

              {/* FIFA Ranking Badge */}
              {team.fifaRanking && team.fifaRanking <= 10 && (
                <div className="inline-block mt-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold">
                  FIFA Rank #{team.fifaRanking}
                </div>
              )}
            </div>

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileHover={{ opacity: 1, scale: 1 }}
                className="text-white font-bold text-lg opacity-0 group-hover:opacity-100 transition-opacity"
              >
                View Matches →
              </motion.div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
