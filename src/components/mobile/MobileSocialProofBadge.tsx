'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MobileSocialProofBadgeProps {
  className?: string;
}

// Realistic booking data for Brazil-USA routes
const SOCIAL_PROOF_DATA = [
  { name: 'Ana P.', city: 'São Paulo', route: 'Miami', price: '$487', timeAgo: '8 min' },
  { name: 'Carlos M.', city: 'Rio de Janeiro', route: 'New York', price: '$523', timeAgo: '12 min' },
  { name: 'Maria S.', city: 'Brasília', route: 'Orlando', price: '$445', timeAgo: '15 min' },
  { name: 'João R.', city: 'Belo Horizonte', route: 'Los Angeles', price: '$612', timeAgo: '18 min' },
  { name: 'Patricia L.', city: 'Salvador', route: 'Boston', price: '$556', timeAgo: '22 min' },
  { name: 'Roberto C.', city: 'Fortaleza', route: 'Chicago', price: '$499', timeAgo: '25 min' },
  { name: 'Fernanda A.', city: 'Porto Alegre', route: 'Atlanta', price: '$478', timeAgo: '28 min' },
  { name: 'Lucas T.', city: 'Curitiba', route: 'Denver', price: '$634', timeAgo: '31 min' },
];

export default function MobileSocialProofBadge({ className = '' }: MobileSocialProofBadgeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);
  const [liveCount, setLiveCount] = useState(8);

  // Cycle through social proof data
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % SOCIAL_PROOF_DATA.length);
      
      // Simulate live counter changes
      setLiveCount((prev) => {
        const change = Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : -1) : 0;
        return Math.max(3, Math.min(15, prev + change));
      });
    }, 12000); // Change every 12 seconds

    return () => clearInterval(interval);
  }, []);

  // Auto-hide tooltip after showing
  useEffect(() => {
    if (showTooltip) {
      const timeout = setTimeout(() => setShowTooltip(false), 3000);
      return () => clearTimeout(timeout);
    }
  }, [showTooltip]);

  // Show tooltip occasionally
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance every cycle
        setShowTooltip(true);
      }
    }, 20000); // Check every 20 seconds

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  const currentData = SOCIAL_PROOF_DATA[currentIndex];

  return (
    <>
      {/* STRATEGICALLY POSITIONED MICRO-BADGE */}
      <motion.div
        className={`
          fixed right-3 top-32 z-30 w-8 h-8 
          bg-gradient-to-br from-emerald-500 via-green-500 to-emerald-600
          rounded-full shadow-lg border-2 border-white
          flex flex-col items-center justify-center
          cursor-pointer select-none
          ${className}
        `}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          scale: isVisible ? 1 : 0, 
          opacity: isVisible ? 1 : 0 
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowTooltip(!showTooltip)}
        style={{ touchAction: 'manipulation' }}
      >
        {/* Live indicator pulse */}
        <motion.div
          className="absolute inset-0 rounded-full bg-green-400 opacity-30"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
        
        {/* Content */}
        <div className="text-white text-center relative z-10">
          <div className="text-[8px] font-bold leading-none">🔥</div>
          <div className="text-[7px] font-semibold leading-none">{liveCount}</div>
        </div>
      </motion.div>

      {/* SMART TOOLTIP - Appears on interaction or periodically */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            className="
              fixed right-12 top-28 z-40 
              bg-white rounded-xl shadow-xl border border-gray-200
              px-3 py-2 w-48
              text-xs
            "
            initial={{ opacity: 0, scale: 0.8, x: 10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 10 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
          >
            {/* Tooltip Arrow */}
            <div className="absolute left-[-6px] top-4 w-0 h-0 border-r-6 border-r-white border-t-4 border-t-transparent border-b-4 border-b-transparent" />
            
            {/* Content */}
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                {currentData.name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900 leading-tight">
                  {currentData.name} de {currentData.city}
                </div>
                <div className="text-gray-600 leading-tight">
                  Reservou {currentData.route} • {currentData.price}
                </div>
                <div className="text-green-600 font-medium leading-tight">
                  há {currentData.timeAgo} atrás
                </div>
              </div>
            </div>

            {/* Live counter at bottom */}
            <div className="mt-2 pt-2 border-t border-gray-100 text-center">
              <div className="text-[10px] text-gray-500">
                <span className="inline-flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  {liveCount} pessoas reservando agora
                </span>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowTooltip(false);
              }}
              className="absolute -top-2 -right-2 w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors"
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dismiss badge permanently (long press on mobile) */}
      <motion.div
        className="fixed right-3 top-40 z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: showTooltip ? 0.6 : 0 }}
        transition={{ duration: 0.2 }}
      >
        {showTooltip && (
          <button
            onClick={() => setIsVisible(false)}
            className="w-6 h-6 bg-red-500 rounded-full text-white text-xs font-bold shadow-lg opacity-60 hover:opacity-90 transition-opacity"
            onTouchStart={(e) => {
              // Long press to dismiss
              const timeout = setTimeout(() => setIsVisible(false), 1000);
              e.currentTarget.dataset.timeout = timeout.toString();
            }}
            onTouchEnd={(e) => {
              const timeout = e.currentTarget.dataset.timeout;
              if (timeout) clearTimeout(parseInt(timeout));
            }}
          >
            ×
          </button>
        )}
      </motion.div>
    </>
  );
}