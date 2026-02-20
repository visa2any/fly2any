'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedFadeInProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
}

export function AnimatedFadeIn({ children, delay = 0, className = "", direction = 'up' }: AnimatedFadeInProps) {
  const getInitialY = () => {
    if (direction === 'up') return 20;
    if (direction === 'down') return -20;
    return 0;
  };

  const getInitialX = () => {
    if (direction === 'left') return 20;
    if (direction === 'right') return -20;
    return 0;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: getInitialY(), x: getInitialX() }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
