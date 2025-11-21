"use client";

import { useHasMounted } from '@/lib/hooks/useHasMounted';
import dynamic from 'next/dynamic';

// Dynamic imports with no SSR
const Confetti = dynamic(() => import('./Confetti'), { ssr: false });
const Fireworks = dynamic(() => import('./Fireworks'), { ssr: false });

interface ClientCelebrationProps {
  showConfetti?: boolean;
  showFireworks?: boolean;
  confettiCount?: number;
  fireworksCount?: number;
  colors?: string[];
}

/**
 * Client-safe celebration component wrapper
 * Prevents hydration errors by only rendering after mount
 */
export default function ClientCelebration({
  showConfetti = false,
  showFireworks = false,
  confettiCount = 50,
  fireworksCount = 5,
  colors = ['#FFD700', '#FF4F00', '#00C8FF', '#FF1744', '#00E676']
}: ClientCelebrationProps) {
  const hasMounted = useHasMounted();

  // Don't render anything until client-side mount
  if (!hasMounted) {
    return null;
  }

  return (
    <>
      {showConfetti && (
        <Confetti active={true} count={confettiCount} colors={colors} />
      )}
      {showFireworks && (
        <Fireworks colors={colors} count={fireworksCount} />
      )}
    </>
  );
}
