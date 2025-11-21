"use client";

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function TrophyAnimation() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);
  }, []);

  return (
    <div className="relative w-full h-96 flex items-center justify-center overflow-hidden">
      {/* Animated rays */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: show ? 1 : 0 }}
        transition={{ duration: 1 }}
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 bg-gradient-to-t from-transparent via-yellow-400 to-transparent"
            style={{
              height: '200%',
              transform: `rotate(${i * 30}deg)`,
              transformOrigin: 'center',
            }}
            animate={{
              opacity: [0.3, 0.8, 0.3],
              height: ['180%', '220%', '180%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.1,
            }}
          />
        ))}
      </motion.div>

      {/* Trophy */}
      <motion.div
        initial={{ scale: 0, rotate: -180, y: 100 }}
        animate={{ scale: show ? 1 : 0, rotate: 0, y: 0 }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 15,
          duration: 1.5,
        }}
        className="relative z-10"
      >
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="text-9xl filter drop-shadow-2xl"
        >
          🏆
        </motion.div>

        {/* Glow effect */}
        <motion.div
          className="absolute inset-0 blur-3xl opacity-60"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
          style={{
            background: 'radial-gradient(circle, rgba(251,191,36,0.8) 0%, transparent 70%)',
          }}
        />
      </motion.div>

      {/* Particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-yellow-400"
          initial={{
            x: 0,
            y: 0,
            opacity: 0,
          }}
          animate={{
            x: Math.random() * 400 - 200,
            y: Math.random() * 400 - 200,
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  );
}
