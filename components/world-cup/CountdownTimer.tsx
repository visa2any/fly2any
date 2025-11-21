"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHasMounted } from '@/lib/hooks/useHasMounted';

export default function CountdownTimer() {
  const hasMounted = useHasMounted();
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [prevTime, setPrevTime] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const worldCupStart = new Date('2026-06-11T00:00:00');

    const updateCountdown = () => {
      const now = new Date();
      const difference = worldCupStart.getTime() - now.getTime();

      if (difference > 0) {
        const newTime = {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };

        setPrevTime(timeLeft);
        setTimeLeft(newTime);
      }
    };

    // Initial update
    updateCountdown();

    // Update every second
    const timer = setInterval(updateCountdown, 1000);

    return () => clearInterval(timer);
  }, []);

  // Premium 3D Flip Number Component
  const FlipNumber = ({ value, label, gradient, prevValue }: {
    value: number;
    label: string;
    gradient: string;
    prevValue: number;
  }) => {
    const [isFlipping, setIsFlipping] = useState(false);

    useEffect(() => {
      if (value !== prevValue && hasMounted) {
        setIsFlipping(true);
        const timer = setTimeout(() => setIsFlipping(false), 600);
        return () => clearTimeout(timer);
      }
    }, [value, prevValue]);

    return (
      <div className="flex flex-col items-center">
        {/* 3D Flip Container - Fully Responsive for 1-3 digit numbers */}
        <div className="relative w-20 h-24 sm:w-24 sm:h-32 md:w-28 md:h-36 lg:w-32 lg:h-40 mb-2 sm:mb-3" style={{ perspective: '1000px' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={value}
              initial={{ rotateX: isFlipping ? 90 : 0 }}
              animate={{ rotateX: 0 }}
              exit={{ rotateX: -90 }}
              transition={{
                duration: 0.6,
                type: "spring",
                stiffness: 200,
                damping: 20
              }}
              className="absolute inset-0"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Main Number Card */}
              <div
                className={`relative w-full h-full rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden ${gradient}`}
                style={{
                  transformStyle: 'preserve-3d',
                  transform: 'translateZ(0)',
                }}
              >
                {/* Glossy reflection overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-black/20" />

                {/* Center line */}
                <div className="absolute left-0 right-0 top-1/2 h-[1px] sm:h-[2px] bg-black/10 -translate-y-1/2" />

                {/* Number - Fully Responsive for variable digit counts */}
                <div className="absolute inset-0 flex items-center justify-center px-2">
                  <span
                    className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white drop-shadow-2xl"
                    style={{
                      textShadow: '0 4px 20px rgba(0,0,0,0.5), 0 0 40px rgba(255,255,255,0.3)',
                      letterSpacing: '-0.02em',
                    }}
                    suppressHydrationWarning
                  >
                    {hasMounted ? value.toString().padStart(2, '0') : '--'}
                  </span>
                </div>

                {/* Bottom shadow for 3D effect */}
                <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/20 to-transparent" />
              </div>

              {/* 3D depth effect */}
              <div
                className={`absolute inset-0 ${gradient} rounded-xl sm:rounded-2xl`}
                style={{
                  transform: 'translateZ(-10px)',
                  opacity: 0.5,
                  filter: 'blur(4px)',
                }}
              />
            </motion.div>
          </AnimatePresence>

          {/* Pulsing glow effect */}
          <motion.div
            className={`absolute inset-0 ${gradient} rounded-xl sm:rounded-2xl blur-2xl opacity-40`}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{ transform: 'translateZ(-20px)' }}
          />
        </div>

        {/* Label - Fully Responsive */}
        <motion.span
          className="text-sm sm:text-base md:text-lg lg:text-xl font-black text-white uppercase tracking-wide sm:tracking-wider text-center"
          style={{
            textShadow: '0 2px 10px rgba(0,0,0,0.5)',
          }}
          animate={{
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        >
          {label}
        </motion.span>
      </div>
    );
  };

  // Don't render until mounted to prevent hydration errors
  if (!hasMounted) {
    return (
      <div className="flex justify-center items-center gap-4 md:gap-8 py-12">
        {/* Static placeholder */}
        <div className="text-white/50 text-xl font-bold">Loading countdown...</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      {/* Animated title - Optimized for dedicated section */}
      <motion.div
        className="text-center mb-8 sm:mb-10 md:mb-12"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, type: "spring" }}
      >
        <motion.h2
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4"
          style={{
            background: 'linear-gradient(135deg, #FFD700 0%, #FFF 25%, #FFD700 50%, #FFF 75%, #FFD700 100%)',
            backgroundSize: '200% 200%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: '0 0 60px rgba(255, 215, 0, 0.8)',
          }}
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          ⏰ COUNTDOWN TO KICKOFF ⏰
        </motion.h2>
        <motion.p
          className="text-base sm:text-lg md:text-xl text-white/90 font-semibold"
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        >
          The biggest football celebration in history begins in...
        </motion.p>
      </motion.div>

      {/* Countdown Grid - Fully Responsive Flex Layout */}
      <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 md:gap-8 lg:gap-10 max-w-6xl mx-auto px-4">
        <FlipNumber
          value={timeLeft.days}
          label="Days"
          gradient="bg-gradient-to-br from-red-500 via-red-600 to-red-700"
          prevValue={prevTime.days}
        />
        <FlipNumber
          value={timeLeft.hours}
          label="Hours"
          gradient="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700"
          prevValue={prevTime.hours}
        />
        <FlipNumber
          value={timeLeft.minutes}
          label="Minutes"
          gradient="bg-gradient-to-br from-green-500 via-green-600 to-green-700"
          prevValue={prevTime.minutes}
        />
        <FlipNumber
          value={timeLeft.seconds}
          label="Seconds"
          gradient="bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700"
          prevValue={prevTime.seconds}
        />
      </div>

      {/* Animated subtitle */}
      <motion.div
        className="text-center mt-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <motion.p
          className="text-2xl md:text-3xl font-black text-transparent"
          style={{
            background: 'linear-gradient(90deg, #FF6B6B, #4ECDC4, #45B7D1, #96CEB4, #FFEAA7, #DFE6E9)',
            backgroundSize: '300% 300%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          🎊 Get Ready for the Ultimate Football Experience! 🎊
        </motion.p>
      </motion.div>
    </div>
  );
}
