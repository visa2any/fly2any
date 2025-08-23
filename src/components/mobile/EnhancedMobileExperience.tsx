'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { mobileOptimizer } from '@/lib/performance/mobile-optimizer';
import { imageOptimizer } from '@/lib/performance/image-optimizer';
import { bundleOptimizer } from '@/lib/performance/bundle-optimizer';
import { haptic } from '@/lib/mobile/haptic-feedback';
import { TouchButton, TouchInput, SwipeableCard, LoadingSpinner, SuccessAnimation } from './MicroInteractions';
import PullToRefresh from './PullToRefresh';
import InfiniteScroll from './InfiniteScroll';
import SmartKeyboard from './SmartKeyboard';
import { usePerformanceMonitoring } from '@/hooks/usePerformanceMonitoring';
import { useScrollAnimation, useOptimizedAnimations } from '@/hooks/useAnimations';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/mobile/animation-utils';

interface EnhancedMobileExperienceProps {
  children: React.ReactNode;
  enablePerformanceMonitoring?: boolean;
  enableHapticFeedback?: boolean;
  enablePullToRefresh?: boolean;
  onRefresh?: () => Promise<void>;
}

export const EnhancedMobileExperience: React.FC<EnhancedMobileExperienceProps> = ({
  children,
  enablePerformanceMonitoring = true,
  enableHapticFeedback = true,
  enablePullToRefresh = false,
  onRefresh,
}) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [showWelcomeAnimation, setShowWelcomeAnimation] = useState(true);
  
  const { metrics, measurePerformance } = usePerformanceMonitoring({
    enabled: enablePerformanceMonitoring,
    reportToAnalytics: true,
  });

  const { shouldAnimate } = useOptimizedAnimations();
  const { ref, controls, isInView } = useScrollAnimation();

  // Initialize enhanced mobile features
  useEffect(() => {
    const initMobileFeatures = async () => {
      // Initialize performance optimizer
      mobileOptimizer.inlineCriticalCSS();
      mobileOptimizer.addResourceHints();

      // Load mobile-specific chunks
      await bundleOptimizer.loadMobileComponents();
      
      // Preload critical images
      await imageOptimizer.preloadImages([
        { src: '/images/hero-mobile.webp', options: { priority: true } },
        { src: '/images/logo-mobile.svg', options: { priority: true } },
      ]);

      // Initialize haptic feedback if supported
      if (enableHapticFeedback && haptic.isAvailable()) {
        haptic.light(); // Initial test
      }

      // Setup service worker caching
      bundleOptimizer.setupServiceWorkerCaching();

      setIsInitialized(true);
      
      // Hide welcome animation after delay
      setTimeout(() => {
        setShowWelcomeAnimation(false);
      }, 2000);
    };

    measurePerformance('mobile-initialization', initMobileFeatures);
  }, [enableHapticFeedback, measurePerformance]);

  // Handle pull to refresh
  const handleRefresh = async () => {
    if (onRefresh) {
      await measurePerformance('pull-to-refresh', onRefresh);
    }
  };

  const welcomeVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        duration: 0.8,
        ease: [0.04, 0.62, 0.23, 0.98] as any,
      }
    },
    exit: { 
      scale: 0.8, 
      opacity: 0,
      transition: { 
        duration: 0.5,
        ease: [0.04, 0.62, 0.23, 0.98] as any,
      }
    },
  };

  return (
    <SmartKeyboard>
      <div className="min-h-screen bg-gray-50 relative overflow-hidden">
        {/* Welcome Animation */}
        <AnimatePresence>
          {showWelcomeAnimation && (
            <motion.div
              className="fixed inset-0 bg-gradient-to-br from-blue-600 to-purple-600 z-50 flex items-center justify-center"
              variants={welcomeVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <div className="text-center text-white">
                <motion.div
                  className="w-20 h-20 mx-auto mb-4"
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 360, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: 1,
                    ease: "easeInOut",
                  }}
                >
                  <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </motion.div>
                <motion.h1
                  className="text-2xl font-bold mb-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                >
                  Fly2Any
                </motion.h1>
                <motion.p
                  className="text-lg opacity-90"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.6 }}
                >
                  Experiência Móvel Premium
                </motion.p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        {isInitialized && (
          <motion.div
            ref={ref as React.RefObject<HTMLDivElement>}
            className="relative z-10"
            variants={shouldAnimate ? fadeInUp : undefined}
            initial="initial"
            animate={controls}
          >
            {enablePullToRefresh && onRefresh ? (
              <PullToRefresh onRefresh={handleRefresh}>
                {children}
              </PullToRefresh>
            ) : (
              children
            )}
          </motion.div>
        )}

        {/* Performance Metrics Display (Development Only) */}
        {process.env.NODE_ENV === 'development' && metrics && (
          <motion.div
            className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-3 rounded-lg text-xs z-50"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 3 }}
          >
            <div className="space-y-1">
              {metrics.lcp && <div>LCP: {Math.round(metrics.lcp)}ms</div>}
              {metrics.fid && <div>FID: {Math.round(metrics.fid)}ms</div>}
              {metrics.cls && <div>CLS: {metrics.cls.toFixed(3)}</div>}
              {metrics.fcp && <div>FCP: {Math.round(metrics.fcp)}ms</div>}
            </div>
          </motion.div>
        )}
      </div>
    </SmartKeyboard>
  );
};

// Enhanced Flight Search Form with mobile optimizations
export const EnhancedFlightSearchForm: React.FC<{
  onSubmit?: (data: any) => void;
  loading?: boolean;
}> = ({ onSubmit, loading = false }) => {
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    departure: '',
    return: '',
    passengers: '1',
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const { shouldAnimate } = useOptimizedAnimations();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (haptic.isAvailable()) {
      haptic.success();
    }

    onSubmit?.(formData);
    setShowSuccess(true);
  };

  const airportSuggestions = [
    'São Paulo (GRU)',
    'Rio de Janeiro (GIG)',
    'Miami (MIA)',
    'New York (JFK)',
    'Los Angeles (LAX)',
  ];

  return (
    <motion.form
      className="bg-white rounded-2xl shadow-lg p-6 m-4"
      variants={shouldAnimate ? staggerContainer : undefined}
      initial="initial"
      animate="animate"
      onSubmit={handleSubmit}
    >
      <motion.h2
        className="text-2xl font-bold text-gray-900 mb-6 text-center"
        variants={shouldAnimate ? staggerItem : undefined}
      >
        Buscar Voos
      </motion.h2>

      <motion.div className="space-y-4" variants={shouldAnimate ? staggerContainer : undefined}>
        <motion.div variants={shouldAnimate ? staggerItem : undefined}>
          <TouchInput
            label="De onde?"
            value={formData.from}
            onChange={(e) => setFormData({ ...formData, from: e.target.value })}
            placeholder="Cidade ou aeroporto de origem"
            suggestions={airportSuggestions}
            haptic={true}
          />
        </motion.div>

        <motion.div variants={shouldAnimate ? staggerItem : undefined}>
          <TouchInput
            label="Para onde?"
            value={formData.to}
            onChange={(e) => setFormData({ ...formData, to: e.target.value })}
            placeholder="Cidade ou aeroporto de destino"
            suggestions={airportSuggestions}
            haptic={true}
          />
        </motion.div>

        <motion.div 
          className="grid grid-cols-2 gap-4"
          variants={shouldAnimate ? staggerItem : undefined}
        >
          <TouchInput
            label="Ida"
            type="date"
            value={formData.departure}
            onChange={(e) => setFormData({ ...formData, departure: e.target.value })}
            haptic={true}
          />
          <TouchInput
            label="Volta"
            type="date"
            value={formData.return}
            onChange={(e) => setFormData({ ...formData, return: e.target.value })}
            haptic={true}
          />
        </motion.div>

        <motion.div variants={shouldAnimate ? staggerItem : undefined}>
          <TouchInput
            label="Passageiros"
            type="number"
            value={formData.passengers}
            onChange={(e) => setFormData({ ...formData, passengers: e.target.value })}
            inputMode="numeric"
            min="1"
            max="9"
            haptic={true}
          />
        </motion.div>

        <motion.div 
          className="pt-4"
          variants={shouldAnimate ? staggerItem : undefined}
        >
          <TouchButton
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            disabled={!formData.from || !formData.to || !formData.departure}
            haptic={true}
          >
            {loading ? 'Buscando...' : 'Buscar Voos'}
          </TouchButton>
        </motion.div>
      </motion.div>

      <SuccessAnimation
        show={showSuccess}
        message="Busca realizada com sucesso!"
        onComplete={() => setShowSuccess(false)}
      />
    </motion.form>
  );
};

// Enhanced Flight Results with infinite scroll
export const EnhancedFlightResults: React.FC<{
  flights: any[];
  onLoadMore: () => Promise<void>;
  hasMore: boolean;
  loading: boolean;
}> = ({ flights, onLoadMore, hasMore, loading }) => {
  const { shouldAnimate } = useOptimizedAnimations();

  const renderFlightCard = (flight: any, index: number) => (
    <SwipeableCard
      key={`flight-${index}`}
      className="p-4 mb-4"
      onSwipeRight={() => console.log('Favorited flight', flight)}
      onSwipeLeft={() => console.log('Dismissed flight', flight)}
      haptic={true}
    >
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{flight.airline}</h3>
            <p className="text-sm text-gray-600">{flight.route}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">{flight.price}</div>
          <div className="text-sm text-gray-500">{flight.duration}</div>
        </div>
      </div>
      
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-600">{flight.departure}</span>
        <div className="flex-1 mx-4 border-t border-dashed border-gray-300 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
            </svg>
          </div>
        </div>
        <span className="text-gray-600">{flight.arrival}</span>
      </div>

      <TouchButton
        className="w-full mt-4"
        variant="secondary"
        onClick={() => console.log('Select flight', flight)}
        haptic={true}
      >
        Selecionar Voo
      </TouchButton>
    </SwipeableCard>
  );

  if (flights.length === 0 && !loading) {
    return (
      <motion.div
        className="text-center py-12"
        variants={shouldAnimate ? fadeInUp : undefined}
        initial="initial"
        animate="animate"
      >
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum voo encontrado</h3>
        <p className="text-gray-500">Tente ajustar seus filtros de busca.</p>
      </motion.div>
    );
  }

  return (
    <div className="p-4">
      <InfiniteScroll
        items={flights}
        renderItem={renderFlightCard}
        onLoadMore={onLoadMore}
        hasMore={hasMore}
        loading={loading}
        loadingComponent={<LoadingSpinner message="Carregando mais voos..." />}
      />
    </div>
  );
};

export default EnhancedMobileExperience;