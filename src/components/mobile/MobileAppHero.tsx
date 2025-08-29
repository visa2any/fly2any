'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useMobileUtils } from '@/hooks/useMobileDetection';

interface MobileAppHeroProps {
  children?: React.ReactNode;
}

export default function MobileAppHero({ children }: MobileAppHeroProps) {
  const { isMobileDevice } = useMobileUtils();

  if (!isMobileDevice) return null;

  return (
    <div 
      className="relative w-full bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 overflow-hidden"
      style={{ 
        height: 'calc(100vh - 32px)', // Full height minus ultra-compact header
        width: '100vw',
        maxWidth: '100vw'
      }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/20 rounded-full blur-xl"></div>
        <div className="absolute top-32 right-16 w-16 h-16 bg-white/15 rounded-full blur-lg"></div>
        <div className="absolute bottom-40 left-20 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 right-10 w-12 h-12 bg-white/20 rounded-full blur-lg"></div>
      </div>

      {/* Content Container - Full Height */}
      <div className="relative z-10 h-full flex flex-col">
        
        {/* Compact Title Section - Minimal Space */}
        <div className="px-4 pt-3 pb-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-xl font-bold text-white mb-1 leading-tight">
              Sua próxima viagem
            </h1>
            <p className="text-sm text-white/90 font-medium">
              Encontre voos incríveis • USA → Brasil
            </p>
          </motion.div>
        </div>

        {/* Form Section - Takes Remaining Space */}
        <div className="flex-1 px-1">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="h-full"
          >
            {children}
          </motion.div>
        </div>

        {/* Integrated Micro Footer - Minimal Space */}
        <div className="px-4 pb-2">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex items-center justify-center space-x-4 text-xs text-white/70"
          >
            <div className="flex items-center gap-1">
              <span className="text-white/90">🇺🇸</span>
              <span>USA Company</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <span className="text-white/90">🛡️</span>
              <span>Secure</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <span className="text-white/90">⭐</span>
              <span>4.9/5</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Floating Elements for Visual Appeal */}
      <div className="absolute top-1/4 -left-8 w-16 h-16 bg-white/5 rounded-full blur-lg"></div>
      <div className="absolute top-1/2 -right-6 w-12 h-12 bg-white/5 rounded-full blur-md"></div>
      <div className="absolute bottom-1/3 -left-4 w-8 h-8 bg-white/10 rounded-full blur-sm"></div>
      
      {/* Subtle Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '30px 30px'
        }}
      ></div>
    </div>
  );
}