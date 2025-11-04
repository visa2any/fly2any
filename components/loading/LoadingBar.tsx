'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface LoadingBarProps {
  isLoading: boolean;
  color?: 'primary' | 'orange' | 'green';
  height?: number;
}

const colorClasses = {
  primary: 'bg-gradient-to-r from-primary-400 via-primary-600 to-primary-400',
  orange: 'bg-gradient-to-r from-orange-400 via-orange-600 to-orange-400',
  green: 'bg-gradient-to-r from-green-400 via-green-600 to-green-400',
};

export default function LoadingBar({
  isLoading,
  color = 'primary',
  height = 3
}: LoadingBarProps) {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setVisible(true);
      setProgress(0);

      // Simulate progress
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + Math.random() * 10;
        });
      }, 300);

      return () => {
        clearInterval(interval);
      };
    } else {
      // Complete the progress
      setProgress(100);

      // Hide after animation
      setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 400);
    }
  }, [isLoading]);

  if (!visible) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[10000]"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress)}
    >
      <div
        className={cn(
          'transition-all duration-300 ease-out shadow-lg',
          colorClasses[color]
        )}
        style={{
          width: `${progress}%`,
          height: `${height}px`,
        }}
      />
    </div>
  );
}

// Hook for managing loading bar state
export function useLoadingBar(color: 'primary' | 'orange' | 'green' = 'primary') {
  const [isLoading, setIsLoading] = useState(false);

  const start = () => setIsLoading(true);
  const complete = () => setIsLoading(false);

  const bar = <LoadingBar isLoading={isLoading} color={color} />;

  return { start, complete, isLoading, LoadingBar: bar };
}
