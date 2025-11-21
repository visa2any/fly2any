"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { WorldCupTeamData } from '@/lib/data/world-cup-2026';
import { getTeamImage } from '@/lib/utils/world-cup-images';
import Confetti from './Confetti';

interface TeamCard3DProps {
  team: WorldCupTeamData;
  index: number;
}

export default function TeamCard3D({ team, index }: TeamCard3DProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleClick = () => {
    setIsFlipped(!isFlipped);
    if (!isFlipped) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    }
  };

  return (
    <>
      <motion.div
        className="relative w-full h-96 cursor-pointer"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        style={{ perspective: '1000px' }}
        onHoverStart={() => !isFlipped && setIsFlipped(true)}
        onHoverEnd={() => setIsFlipped(false)}
      >
        <motion.div
          className="relative w-full h-full"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: "spring" }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* FRONT SIDE */}
          <div
            className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl"
            style={{
              backfaceVisibility: 'hidden',
            }}
          >
            {/* Background image with overlay */}
            <div className="absolute inset-0">
              <Image
                src={getTeamImage(team.slug, 'fans')}
                alt={`${team.name} fans`}
                fill
                className="object-cover"
                unoptimized
              />
              {/* Gradient overlay for readability */}
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(135deg, ${team.primaryColor}dd 0%, ${team.secondaryColor}dd 100%)`,
                }}
              />
              {/* Dark gradient from bottom for better text visibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40" />
            </div>

            {/* Glow effect */}
            <div className="absolute inset-0 opacity-20">
              <div
                className="absolute inset-0 blur-3xl"
                style={{
                  background: `radial-gradient(circle at 50% 50%, ${team.primaryColor}, transparent 70%)`,
                }}
              />
            </div>

            <div className="relative h-full p-8 flex flex-col items-center justify-center text-white">
              {/* Animated flag */}
              <motion.div
                className="text-9xl mb-6 drop-shadow-2xl"
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{
                  filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.8))',
                }}
              >
                {team.flagEmoji}
              </motion.div>

              {/* Team name with STRONG text shadow for readability */}
              <h3
                className="text-4xl font-black text-center mb-4 text-white"
                style={{
                  textShadow: `
                    0 0 20px rgba(0,0,0,0.9),
                    0 0 40px rgba(0,0,0,0.8),
                    0 4px 8px rgba(0,0,0,1),
                    -2px -2px 0px rgba(0,0,0,0.5),
                    2px -2px 0px rgba(0,0,0,0.5),
                    -2px 2px 0px rgba(0,0,0,0.5),
                    2px 2px 0px rgba(0,0,0,0.5),
                    0 0 60px ${team.primaryColor}
                  `,
                  WebkitTextStroke: '1px rgba(0,0,0,0.3)',
                }}
              >
                {team.name}
              </h3>

              {/* FIFA Code with stroke */}
              <div
                className="text-6xl font-black text-white/50 mb-4"
                style={{
                  textShadow: '0 2px 10px rgba(0,0,0,0.8)',
                  WebkitTextStroke: '2px rgba(0,0,0,0.3)',
                }}
              >
                {team.fifaCode}
              </div>

              {/* Trophies */}
              {team.worldCupWins > 0 && (
                <div className="flex gap-2 mb-4">
                  {Array.from({ length: team.worldCupWins }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="text-4xl drop-shadow-2xl"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{
                        delay: 0.3 + i * 0.1,
                        type: "spring",
                        bounce: 0.6,
                      }}
                      style={{
                        filter: 'drop-shadow(0 4px 10px rgba(255,215,0,0.8))',
                      }}
                    >
                      🏆
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Hover hint */}
              <motion.div
                className="mt-auto text-sm font-bold text-white/90 px-4 py-2 rounded-full bg-black/40 backdrop-blur-sm"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{
                  textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                }}
              >
                Click to see more ✨
              </motion.div>
            </div>
          </div>

          {/* BACK SIDE */}
          <div
            className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            {/* Background image for back */}
            <div className="absolute inset-0">
              <Image
                src={getTeamImage(team.slug, 'celebration')}
                alt={`${team.name} celebration`}
                fill
                className="object-cover"
                unoptimized
              />
              {/* INVERTED gradient overlay - different from front */}
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(225deg, ${team.secondaryColor}ee 0%, ${team.primaryColor}ee 100%)`,
                }}
              />
              {/* Strong dark overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/70" />
            </div>

            <div className="relative h-full p-8 flex flex-col items-center justify-center text-white">
              {/* Stats with better shadows */}
              <div className="w-full space-y-6 mb-8">
                <div
                  className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-center border-2 border-white/30"
                  style={{
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                  }}
                >
                  <div
                    className="text-sm font-bold text-white/90 mb-2 uppercase tracking-wider"
                    style={{
                      textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                    }}
                  >
                    Confederation
                  </div>
                  <div
                    className="text-3xl font-black text-white"
                    style={{
                      textShadow: '0 4px 8px rgba(0,0,0,0.9), 0 0 20px rgba(255,255,255,0.3)',
                      WebkitTextStroke: '0.5px rgba(0,0,0,0.2)',
                    }}
                  >
                    {team.confederation}
                  </div>
                </div>

                {team.fifaRanking && (
                  <div
                    className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-center border-2 border-white/30"
                    style={{
                      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                    }}
                  >
                    <div
                      className="text-sm font-bold text-white/90 mb-2 uppercase tracking-wider"
                      style={{
                        textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                      }}
                    >
                      FIFA Ranking
                    </div>
                    <div
                      className="text-5xl font-black text-white"
                      style={{
                        textShadow: '0 4px 8px rgba(0,0,0,0.9), 0 0 20px rgba(255,255,255,0.3)',
                        WebkitTextStroke: '1px rgba(0,0,0,0.2)',
                      }}
                    >
                      {team.fifaRanking}
                    </div>
                  </div>
                )}

                <div
                  className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-center border-2 border-white/30"
                  style={{
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                  }}
                >
                  <div
                    className="text-sm font-bold text-white/90 mb-2 uppercase tracking-wider"
                    style={{
                      textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                    }}
                  >
                    World Cups Won
                  </div>
                  <div
                    className="text-5xl font-black text-white"
                    style={{
                      textShadow: '0 4px 8px rgba(0,0,0,0.9), 0 0 20px rgba(255,215,0,0.5)',
                      WebkitTextStroke: '1px rgba(0,0,0,0.2)',
                    }}
                  >
                    {team.worldCupWins}
                  </div>
                </div>
              </div>

              {/* CTA with better visibility */}
              <Link href={`/world-cup-2026/teams/${team.slug}`}>
                <motion.button
                  className="px-8 py-4 font-black rounded-full shadow-2xl text-black border-2"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.6), 0 0 20px rgba(255,255,255,0.5)',
                    border: '2px solid rgba(255,255,255,0.8)',
                    textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  }}
                >
                  Explore Team →
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {showConfetti && (
        <Confetti active={showConfetti} colors={[team.primaryColor, team.secondaryColor]} count={30} />
      )}
    </>
  );
}
