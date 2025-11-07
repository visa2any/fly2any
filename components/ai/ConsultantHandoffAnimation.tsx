'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

export interface ConsultantHandoffProps {
  fromConsultant: {
    name: string;
    avatar: string; // emoji
    message: string;
  };
  toConsultant: {
    name: string;
    avatar: string; // emoji
    title: string;
    greeting: string;
  };
  onComplete?: () => void;
}

type AnimationStage = 'fadeOut' | 'connecting' | 'fadeIn' | 'complete';

/**
 * Consultant Handoff Animation Component
 *
 * Provides a smooth, delightful transition when one consultant hands off to another.
 *
 * Animation Sequence:
 * 1. Current consultant message with fade out (0.8s)
 * 2. "Connecting..." transition state with pulse effect (0.5s)
 * 3. New consultant greeting with fade in + bounce (0.8s)
 * 4. Calls onComplete callback
 *
 * Features:
 * - Smooth fade/slide transitions
 * - Avatar pulse effect during "connecting"
 * - Respects user's motion preferences
 * - Accessible animations
 */
export function ConsultantHandoffAnimation({
  fromConsultant,
  toConsultant,
  onComplete,
}: ConsultantHandoffProps) {
  const [stage, setStage] = useState<AnimationStage>('fadeOut');
  const shouldReduceMotion = useReducedMotion();

  // Animation durations (in milliseconds)
  const FADE_OUT_DURATION = shouldReduceMotion ? 300 : 800;
  const CONNECTING_DURATION = shouldReduceMotion ? 200 : 500;
  const FADE_IN_DURATION = shouldReduceMotion ? 300 : 800;

  useEffect(() => {
    // Stage 1: Fade out current consultant
    const fadeOutTimer = setTimeout(() => {
      setStage('connecting');
    }, FADE_OUT_DURATION);

    // Stage 2: Connecting state
    const connectingTimer = setTimeout(() => {
      setStage('fadeIn');
    }, FADE_OUT_DURATION + CONNECTING_DURATION);

    // Stage 3: Fade in new consultant
    const fadeInTimer = setTimeout(() => {
      setStage('complete');
      onComplete?.();
    }, FADE_OUT_DURATION + CONNECTING_DURATION + FADE_IN_DURATION);

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(connectingTimer);
      clearTimeout(fadeInTimer);
    };
  }, [FADE_OUT_DURATION, CONNECTING_DURATION, FADE_IN_DURATION, onComplete]);

  // Simple animation config (without variants to avoid TypeScript issues)
  const fadeOutAnimation = shouldReduceMotion ? {
    initial: { opacity: 1 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  } : {
    initial: { opacity: 1, y: 0 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20, transition: { duration: 0.8 } },
  };

  const connectingAnimation = shouldReduceMotion ? {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  } : {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.3 } },
  };

  const fadeInAnimation = shouldReduceMotion ? {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  } : {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8 } },
    exit: { opacity: 0 },
  };

  return (
    <div className="relative w-full min-h-[200px] flex items-center justify-center p-6">
      <AnimatePresence mode="wait">
        {/* Stage 1: Fade Out - Current Consultant */}
        {stage === 'fadeOut' && (
          <motion.div
            key="fadeOut"
            className="absolute inset-0 flex flex-col items-center justify-center text-center"
            {...fadeOutAnimation}
          >
            {/* From Consultant Avatar */}
            <motion.div
              className="text-7xl mb-4"
              animate={shouldReduceMotion ? {} : {
                scale: [1, 1.1, 1],
                transition: { duration: 0.6, ease: [0.42, 0, 0.58, 1] } // easeInOut
              }}
            >
              {fromConsultant.avatar}
            </motion.div>

            {/* From Consultant Message */}
            <div className="space-y-2">
              <p className="text-lg font-medium text-gray-700">
                {fromConsultant.name}
              </p>
              <p className="text-base text-gray-600 max-w-md">
                {fromConsultant.message}
              </p>
            </div>
          </motion.div>
        )}

        {/* Stage 2: Connecting State */}
        {stage === 'connecting' && (
          <motion.div
            key="connecting"
            className="absolute inset-0 flex flex-col items-center justify-center text-center"
            {...connectingAnimation}
          >
            {/* Pulse Animation */}
            <div className="relative">
              <motion.div
                className="text-6xl"
                animate={shouldReduceMotion ? {} : {
                  scale: [1, 1.2, 1],
                  transition: {
                    duration: 0.5,
                    repeat: Infinity,
                    ease: [0.42, 0, 0.58, 1], // easeInOut
                  }
                }}
              >
                {toConsultant.avatar}
              </motion.div>

              {/* Pulse ring effect */}
              {!shouldReduceMotion && (
                <motion.div
                  className="absolute inset-0 rounded-full border-4 border-primary-400"
                  animate={{
                    scale: [1, 1.5],
                    opacity: [0.6, 0],
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    ease: [0, 0, 0.58, 1], // easeOut
                  }}
                />
              )}
            </div>

            {/* Connecting Text */}
            <motion.p
              className="text-lg font-medium text-primary-600 mt-6"
              animate={shouldReduceMotion ? {} : {
                opacity: [0.5, 1, 0.5],
                transition: {
                  duration: 1,
                  repeat: Infinity,
                  ease: [0.42, 0, 0.58, 1], // easeInOut
                }
              }}
            >
              Connecting you with {toConsultant.name}...
            </motion.p>
          </motion.div>
        )}

        {/* Stage 3: Fade In - New Consultant */}
        {(stage === 'fadeIn' || stage === 'complete') && (
          <motion.div
            key="fadeIn"
            className="absolute inset-0 flex flex-col items-center justify-center text-center"
            {...fadeInAnimation}
          >
            {/* To Consultant Avatar with bounce */}
            <motion.div
              className="text-7xl mb-4"
              animate={shouldReduceMotion ? {} : {
                rotate: [0, -10, 10, -5, 5, 0],
                transition: {
                  duration: 0.6,
                  delay: 0.2,
                  ease: [0.42, 0, 0.58, 1] // easeInOut
                }
              }}
            >
              {toConsultant.avatar}
            </motion.div>

            {/* To Consultant Info */}
            <motion.div
              className="space-y-3"
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
              animate={{
                opacity: 1,
                y: 0,
                transition: { delay: 0.3, duration: 0.5 }
              }}
            >
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {toConsultant.name}
                </h3>
                <p className="text-sm font-medium text-primary-600 mt-1">
                  {toConsultant.title}
                </p>
              </div>

              <p className="text-base text-gray-700 max-w-md leading-relaxed">
                {toConsultant.greeting}
              </p>
            </motion.div>

            {/* Decorative sparkles */}
            {!shouldReduceMotion && (
              <>
                <motion.div
                  className="absolute top-1/4 left-1/4 text-2xl"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1.2, 0],
                    rotate: [0, 180]
                  }}
                  transition={{ duration: 1, delay: 0.4 }}
                >
                  ✨
                </motion.div>
                <motion.div
                  className="absolute top-1/3 right-1/4 text-2xl"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1.2, 0],
                    rotate: [0, -180]
                  }}
                  transition={{ duration: 1, delay: 0.5 }}
                >
                  ✨
                </motion.div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Example Usage:
 *
 * <ConsultantHandoffAnimation
 *   fromConsultant={{
 *     name: "Lisa",
 *     avatar: "💕",
 *     message: "Let me connect you with Sarah..."
 *   }}
 *   toConsultant={{
 *     name: "Sarah",
 *     avatar: "✈️",
 *     title: "Flight Specialist",
 *     greeting: "Hey! I'm Sarah 👋 I love helping people find great flights!"
 *   }}
 *   onComplete={() => console.log('Handoff complete')}
 * />
 */
