'use client';

import { useEffect, useState, useRef } from 'react';

interface Stat {
  value: number;
  label: string;
  suffix?: string;
  prefix?: string;
}

interface HeroStatsProps {
  stats: Stat[];
  className?: string;
  animated?: boolean;
}

export function HeroStats({ stats, className = '', animated = true }: HeroStatsProps) {
  const [counts, setCounts] = useState<number[]>(stats.map(() => 0));
  const [hasAnimated, setHasAnimated] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!animated || hasAnimated) {
      setCounts(stats.map(stat => stat.value));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setHasAnimated(true);
          animateCounters();
        }
      },
      { threshold: 0.3 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, [animated, hasAnimated]);

  const animateCounters = () => {
    const duration = 2000; // 2 seconds
    const frameDuration = 1000 / 60; // 60fps
    const totalFrames = Math.round(duration / frameDuration);

    stats.forEach((stat, index) => {
      let frame = 0;
      const counter = setInterval(() => {
        frame++;
        const progress = frame / totalFrames;
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentCount = Math.round(easeOutQuart * stat.value);

        setCounts(prev => {
          const newCounts = [...prev];
          newCounts[index] = currentCount;
          return newCounts;
        });

        if (frame === totalFrames) {
          clearInterval(counter);
        }
      }, frameDuration);
    });
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <div ref={statsRef} className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-8 ${className}`}>
      {stats.map((stat, index) => (
        <div
          key={index}
          className="text-center transform hover:scale-105 transition-transform duration-300"
          style={{
            animation: animated ? `fadeInUp 0.6s ease-out ${index * 0.1}s both` : 'none'
          }}
        >
          <div className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-2">
            {stat.prefix}
            {formatNumber(counts[index])}
            {stat.suffix}
          </div>
          <div className="text-sm md:text-base lg:text-lg text-white/80 font-medium">
            {stat.label}
          </div>
        </div>
      ))}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
