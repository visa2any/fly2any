'use client';

import { useState, useEffect } from 'react';

interface AnimatedTitleProps {
  text: string;
  className?: string;
  animationDelay?: number;
  letterDelay?: number;
}

export function AnimatedTitle({
  text,
  className = '',
  animationDelay = 0,
  letterDelay = 0.038
}: AnimatedTitleProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Server & initial client render: plain text (prevents hydration mismatch)
    return <span className={className} suppressHydrationWarning>{text}</span>;
  }

  // After hydration: animated letter-by-letter
  return (
    <span className={className} suppressHydrationWarning>
      {text.split('').map((char, index) => (
        <span
          key={index}
          className="letter-elastic"
          style={{
            animationDelay: `${animationDelay + (index * letterDelay)}s`,
            display: 'inline-block',
            minWidth: char === ' ' ? '0.3em' : 'auto'
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </span>
  );
}
