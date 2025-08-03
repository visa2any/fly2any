'use client';

/**
 * ✈️ INNOVATIVE FLIGHT SEARCH TRANSITION SCREEN
 * 
 * Ultra-modern loading experience with:
 * - Glassmorphism design with dynamic gradients
 * - Real-time search status updates
 * - Animated flight path visualization
 * - Premium travel system branding
 * - Auto-redirect to new tab when complete
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MagnifyingGlassIcon, 
  GlobeAltIcon, 
  ClockIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';

interface FlightSearchTransitionProps {
  isVisible: boolean;
  searchData: {
    origin: string;
    destination: string;
    tripType: string;
    passengers: number;
  };
  onComplete: (results: any) => void;
  onClose: () => void;
}

export default function FlightSearchTransition({
  isVisible,
  searchData,
  onComplete,
  onClose
}: FlightSearchTransitionProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const searchSteps = [
    {
      id: 'searching',
      title: 'Searching available flights',
      subtitle: 'Connecting with 500+ airlines worldwide',
      icon: MagnifyingGlassIcon,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'analyzing',
      title: 'Analyzing best prices',
      subtitle: 'Comparing fares and optimal schedules',
      icon: GlobeAltIcon,
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'optimizing',
      title: 'Optimizing results',
      subtitle: 'Sorting by best value for money',
      icon: ClockIcon,
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'complete',
      title: 'Search completed!',
      subtitle: 'Redirecting to results...',
      icon: CheckCircleIcon,
      color: 'from-emerald-500 to-green-500'
    }
  ];

  useEffect(() => {
    if (!isVisible) return;

    const intervals: NodeJS.Timeout[] = [];
    
    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + Math.random() * 3 + 1;
      });
    }, 100);
    intervals.push(progressInterval);

    // Step progression
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= searchSteps.length - 1) {
          clearInterval(stepInterval);
          // Simulate completion and open results in new tab
          setTimeout(() => {
            const newTab = window.open('/voos/resultados', '_blank');
            if (newTab) {
              newTab.focus();
            }
            onComplete({});
            onClose();
          }, 2000);
          return prev;
        }
        return prev + 1;
      });
    }, 2000);
    intervals.push(stepInterval);

    return () => {
      intervals.forEach(interval => clearInterval(interval));
    };
  }, [isVisible, onComplete, onClose]);

  if (!isVisible) return null;

  const currentStepData = searchSteps[currentStep];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100000] bg-gradient-to-br from-slate-900/95 via-blue-900/95 to-purple-900/95 backdrop-blur-xl"
        >
          {/* Background Animation */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-emerald-500/10 to-green-500/10 rounded-full blur-3xl animate-pulse delay-500" />
          </div>

          {/* Main Content */}
          <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
            
            {/* Header */}
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-12"
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                <PaperAirplaneIcon className="w-8 h-8 text-white" />
                <h1 className="text-2xl font-black text-white">
                  Fly2any System
                </h1>
              </div>
              <p className="text-white/70 text-lg font-medium">
                Innovation in intelligent flight search
              </p>
            </motion.div>

            {/* Search Route Visualization */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8 mb-12 min-w-[400px]"
            >
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <div className="text-3xl font-black text-white mb-2">
                    {searchData.origin}
                  </div>
                  <div className="text-white/70 text-sm font-medium">
                    Origin
                  </div>
                </div>
                
                <div className="flex-1 mx-8 relative">
                  <div className="h-px bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 relative">
                    <motion.div
                      className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg"
                      animate={{ x: [0, 200, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </div>
                  <div className="text-center mt-3">
                    <span className="text-white/70 text-xs font-medium">
                      {searchData.passengers} passenger{searchData.passengers > 1 ? 's' : ''} • {searchData.tripType}
                    </span>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-black text-white mb-2">
                    {searchData.destination}
                  </div>
                  <div className="text-white/70 text-sm font-medium">
                    Destination
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Progress Section */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8 min-w-[500px]"
            >
              {/* Current Step */}
              <div className="flex items-center gap-4 mb-6">
                <div className={`p-4 rounded-2xl bg-gradient-to-r ${currentStepData.color} shadow-lg`}>
                  <currentStepData.icon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">
                    {currentStepData.title}
                  </h3>
                  <p className="text-white/70 font-medium">
                    {currentStepData.subtitle}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-white/70 mb-2">
                  <span>Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              {/* Steps Indicator */}
              <div className="flex justify-between">
                {searchSteps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`flex items-center ${index < searchSteps.length - 1 ? 'flex-1' : ''}`}
                  >
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                      ${index <= currentStep 
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' 
                        : 'bg-white/20 text-white/50'
                      }
                    `}>
                      {index < currentStep ? '✓' : index + 1}
                    </div>
                    {index < searchSteps.length - 1 && (
                      <div className={`
                        flex-1 h-px mx-3
                        ${index < currentStep 
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-500' 
                          : 'bg-white/20'
                        }
                      `} />
                    )}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Status Message */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-8 text-center"
            >
              <p className="text-white/70 text-sm font-medium">
                Please wait while we prepare the best results for you
              </p>
              {currentStep === searchSteps.length - 1 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="mt-4 flex items-center justify-center gap-2 text-emerald-400"
                >
                  <CheckCircleIcon className="w-5 h-5" />
                  <span className="font-bold">Opening results in new tab...</span>
                  <ArrowRightIcon className="w-4 h-4 animate-pulse" />
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full hover:bg-white/20 transition-all duration-300 text-white/70 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}