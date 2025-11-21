"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  color: string;
  rotation: number;
  size: number;
  delay: number;
}

interface ConfettiProps {
  active?: boolean;
  count?: number;
  colors?: string[];
}

export default function Confetti({
  active = true,
  count = 50,
  colors = ['#FFD700', '#FF4F00', '#00C8FF', '#FF1744', '#00E676', '#FFEB3B', '#E040FB']
}: ConfettiProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (active) {
      const newPieces: ConfettiPiece[] = Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: -10,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        size: Math.random() * 8 + 4,
        delay: Math.random() * 2,
      }));
      setPieces(newPieces);
    }
  }, [active, count, colors]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence>
        {pieces.map((piece) => (
          <motion.div
            key={piece.id}
            className="absolute"
            style={{
              left: `${piece.x}%`,
              width: `${piece.size}px`,
              height: `${piece.size}px`,
              backgroundColor: piece.color,
              borderRadius: Math.random() > 0.5 ? '50%' : '0%',
            }}
            initial={{
              y: piece.y,
              rotate: piece.rotation,
              opacity: 1,
            }}
            animate={{
              y: window.innerHeight + 100,
              rotate: piece.rotation + (Math.random() * 720 - 360),
              x: [0, Math.random() * 100 - 50, Math.random() * 100 - 50],
              opacity: [1, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              delay: piece.delay,
              ease: "easeIn",
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

// Confetti burst on click
export function ConfettiButton({
  children,
  className = '',
  teamColors = []
}: {
  children: React.ReactNode;
  className?: string;
  teamColors?: string[];
}) {
  const [showConfetti, setShowConfetti] = useState(false);

  const handleClick = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  return (
    <>
      <button onClick={handleClick} className={className}>
        {children}
      </button>
      {showConfetti && <Confetti active={showConfetti} colors={teamColors.length > 0 ? teamColors : undefined} />}
    </>
  );
}
