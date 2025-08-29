'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMobileUtils } from '@/hooks/useMobileDetection';

interface MobileHeroSectionProps {
  title?: string;
  subtitle?: string;
  backgroundImage?: string;
  onCTAClick?: () => void;
  ctaText?: string;
  children?: React.ReactNode;
}

const HERO_BACKGROUNDS = [
  'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
];

const TRAVEL_MESSAGES = [
  { title: 'Sua próxima aventura', subtitle: 'Encontre voos incríveis para destinos únicos' },
  { title: 'Voe com economia', subtitle: 'Compare preços e economize em suas viagens' },
  { title: 'Descubra o mundo', subtitle: 'Milhares de destinos esperando por você' }
];

export default function MobileHeroSection({
  title,
  subtitle,
  backgroundImage,
  onCTAClick,
  ctaText = 'Buscar Voos',
  children
}: MobileHeroSectionProps) {
  const {
    isMobileDevice,
    isPortraitMobile,
    screenHeight,
    deviceOrientation,
    getTouchTargetSize
  } = useMobileUtils();

  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [currentBackgroundIndex, setCurrentBackgroundIndex] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  // Rotate messages and backgrounds
  useEffect(() => {
    if (!isMobileDevice) return;

    const interval = setInterval(() => {
      setCurrentMessageIndex((prev: any) => (prev + 1) % TRAVEL_MESSAGES.length);
      setCurrentBackgroundIndex((prev: any) => (prev + 1) % HERO_BACKGROUNDS.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isMobileDevice]);

  // Handle scroll effects
  useEffect(() => {
    if (!isMobileDevice) return;

    const handleScroll = () => {
      const scrolled = window.scrollY > 50;
      setIsScrolled(scrolled);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobileDevice]);

  // Don't render on non-mobile devices
  if (!isMobileDevice) {
    return null;
  }

  const currentMessage = TRAVEL_MESSAGES[currentMessageIndex];
  const currentBackground = backgroundImage || HERO_BACKGROUNDS[currentBackgroundIndex];
  const touchTargetSize = getTouchTargetSize();

  // Dynamic height based on device and orientation
  const getHeroHeight = () => {
    if (isPortraitMobile) {
      return screenHeight > 800 ? 'min-h-[85vh]' : 'min-h-[75vh]'; // Use min-height to allow expansion
    } else {
      return 'min-h-[65vh]';
    }
  };

  return (
    <div className={`relative ${getHeroHeight()} overflow-visible w-full`} style={{ margin: 0, padding: 0, width: '100vw', maxWidth: '100vw' }}>
      {/* Background Image with Parallax Effect */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentBackgroundIndex}
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 1, ease: 'easeInOut' }}
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${currentBackground})`,
            transform: `translateY(${isScrolled ? '20px' : '0px'})`,
            transition: 'transform 0.6s ease-out'
          }}
        />
      </AnimatePresence>

      {/* Gradient Overlay - Limited to background only */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/60" style={{ zIndex: 1 }} />
      
      {/* Dynamic Color Overlay for Better Text Readability - Limited to background */}
      <motion.div
        animate={{
          background: isScrolled 
            ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))'
            : 'linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(147, 51, 234, 0.05))'
        }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0"
        style={{ zIndex: 2 }}
      />

      {/* Content Container */}
      <div className="relative h-full flex flex-col justify-center items-center text-center text-white w-full max-w-full box-border" style={{ zIndex: 20, padding: '0' }}>
        
        {/* Animated Travel Icon */}
        <motion.div
          animate={{ 
            rotateY: [0, 360],
            scale: isScrolled ? [1, 1.1, 1] : [1, 1.05, 1] 
          }}
          transition={{ 
            rotateY: { duration: 4, repeat: Infinity, ease: 'linear' },
            scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
          }}
          className="mb-6 text-6xl filter drop-shadow-lg"
        >
          ✈️
        </motion.div>

        {/* Dynamic Title and Subtitle */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentMessageIndex}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg leading-tight">
              {title || currentMessage.title}
            </h1>
            <p className="text-xl md:text-2xl font-light drop-shadow-md opacity-90 leading-relaxed max-w-sm">
              {subtitle || currentMessage.subtitle}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Custom Content (Flight Form) */}
        {children && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mobile-form-container mb-6"
            style={{ 
              width: '90%', 
              maxWidth: '400px', 
              margin: '0 auto',
              position: 'relative',
              zIndex: 50
            }}
          >
            {children}
          </motion.div>
        )}

        {/* CTA Button */}
        {onCTAClick && (
          <motion.button
            onClick={onCTAClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{ minHeight: touchTargetSize, minWidth: touchTargetSize }}
            className={`
              bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold
              px-8 py-4 rounded-full shadow-lg border-2 border-white/20
              active:bg-gradient-to-r active:from-blue-600 active:to-purple-700
              focus:ring-4 focus:ring-white/30 focus:outline-none
              transition-all duration-200 backdrop-blur-sm
              text-lg min-w-[200px]
            `}
          >
            <span className="flex items-center justify-center gap-2">
              {ctaText}
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                →
              </motion.span>
            </span>
          </motion.button>
        )}

        {/* Scroll Indicator */}
        <motion.div
          animate={{
            opacity: isScrolled ? 0 : [1, 0.5, 1],
            y: isScrolled ? 10 : [0, 10, 0]
          }}
          transition={{
            opacity: { duration: 0.3 },
            y: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
          }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/80"
          style={{ zIndex: 10 }}
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-sm font-medium">Deslize para baixo</span>
            <div className="w-6 h-10 border-2 border-white/60 rounded-full relative">
              <motion.div
                animate={{ y: [2, 12, 2] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-3 bg-white/80 rounded-full"
              />
            </div>
          </div>
        </motion.div>

        {/* Floating Particles for Visual Appeal */}
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 5 }}>
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{
                opacity: 0,
                x: Math.random() * window.innerWidth,
                y: Math.random() * screenHeight
              }}
              animate={{
                opacity: [0, 0.6, 0],
                x: Math.random() * window.innerWidth,
                y: Math.random() * screenHeight,
                scale: [0.5, 1, 0.5]
              }}
              transition={{
                duration: Math.random() * 8 + 6,
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: 'linear'
              }}
              className="absolute w-2 h-2 bg-white/40 rounded-full filter blur-sm"
            />
          ))}
        </div>
      </div>

      {/* Bottom Gradient Fade - Removed to prevent form overlap */}
    </div>
  );
}