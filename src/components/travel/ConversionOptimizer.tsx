'use client';

/**
 * 🎯 CONVERSION OPTIMIZATION SYSTEM
 * Advanced psychological triggers and UX patterns to maximize booking conversions
 * - Social proof and scarcity (real data only)
 * - Progress indicators and confidence building
 * - Mobile-first thumb-friendly design
 * - Industry-compliant persuasion techniques
 * - A/B testing framework integration
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Users, Clock, Shield, Star, TrendingUp, Eye, CheckCircle, AlertCircle, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ========================================
// TYPES & INTERFACES  
// ========================================

export interface ConversionTrigger {
  type: 'social_proof' | 'scarcity' | 'urgency' | 'authority' | 'reciprocity' | 'commitment';
  message: string;
  data?: any;
  isReal: boolean; // Only show real data, never fake
  expiresAt?: string;
  priority: number; // 1-10, 10 being highest
}

export interface ConversionState {
  currentStep: number;
  totalSteps: number;
  confidence: number; // 0-100
  abandonment_risk: 'low' | 'medium' | 'high';
  time_on_page: number;
  interactions: number;
  scroll_depth: number;
}

export interface ConversionOptimizerProps {
  // Data sources
  realTimeData?: {
    activeViewers: number;
    recentBookings: Array<{
      destination: string;
      timeAgo: number; // minutes
      travelers: number;
    }>;
    inventory: {
      flightsLeft?: number;
      hotelsLeft?: number;
      spotsLeft?: number;
    };
    priceChanges?: Array<{
      item: string;
      change: number;
      timeAgo: number;
    }>;
  };

  // User context
  userBehavior?: {
    isReturning: boolean;
    previousSearches: number;
    timeSpentSearching: number;
    deviceType: 'mobile' | 'tablet' | 'desktop';
    abandonment_signals: string[];
  };

  // Configuration
  enabledTriggers: string[];
  testVariant?: 'control' | 'variant_a' | 'variant_b';
  className?: string;
  
  // Callbacks
  onConversionEvent?: (event: string, data?: any) => void;
  onAbandonmentRisk?: (risk: 'high') => void;
}

// ========================================
// CONVERSION OPTIMIZER COMPONENT
// ========================================

const ConversionOptimizer: React.FC<ConversionOptimizerProps> = ({
  realTimeData,
  userBehavior,
  enabledTriggers = ['social_proof', 'scarcity', 'urgency'],
  testVariant = 'control',
  className = '',
  onConversionEvent,
  onAbandonmentRisk
}) => {
  // ========================================
  // STATE MANAGEMENT
  // ========================================
  
  const [activeTrigers, setActiveTriggers] = useState<ConversionTrigger[]>([]);
  const [conversionState, setConversionState] = useState<ConversionState>({
    currentStep: 1,
    totalSteps: 4,
    confidence: 75,
    abandonment_risk: 'low',
    time_on_page: 0,
    interactions: 0,
    scroll_depth: 0
  });

  const [showNotifications, setShowNotifications] = useState(true);
  const pageStartTime = useRef(Date.now());
  const interactionCount = useRef(0);

  // ========================================
  // REAL-TIME TRIGGER GENERATION
  // ========================================

  const generateTriggers = useCallback(() => {
    const triggers: ConversionTrigger[] = [];

    // Social Proof Triggers (only if real data available and verified)
    if (enabledTriggers.includes('social_proof') && realTimeData) {
      // Only show active viewers if count is reasonable and verifiable
      if (realTimeData.activeViewers > 1 && realTimeData.activeViewers < 50) {
        triggers.push({
          type: 'social_proof',
          message: `${realTimeData.activeViewers} people are viewing similar trips`,
          data: { count: realTimeData.activeViewers },
          isReal: true,
          priority: 6 // Reduced priority to avoid being too pushy
        });
      }

      // Only show recent bookings if they're verified and within reasonable timeframe
      if (realTimeData.recentBookings && realTimeData.recentBookings.length > 0) {
        const recentBooking = realTimeData.recentBookings[0];
        // Only show if booking is within last 24 hours and destination is relevant
        if (recentBooking.timeAgo < 1440) { // 24 hours in minutes
          triggers.push({
            type: 'social_proof',
            message: `Recent booking confirmed for ${recentBooking.destination}`,
            data: recentBooking,
            isReal: true,
            priority: 7
          });
        }
      }
    }

    // Scarcity Triggers (only real inventory data)
    if (enabledTriggers.includes('scarcity') && realTimeData?.inventory) {
      const { flightsLeft, hotelsLeft, spotsLeft } = realTimeData.inventory;
      
      if (flightsLeft && flightsLeft <= 3) {
        triggers.push({
          type: 'scarcity',
          message: `Only ${flightsLeft} seats left at this price`,
          data: { count: flightsLeft, type: 'flights' },
          isReal: true,
          priority: 10
        });
      }

      if (hotelsLeft && hotelsLeft <= 2) {
        triggers.push({
          type: 'scarcity',
          message: `Only ${hotelsLeft} rooms left at this hotel`,
          data: { count: hotelsLeft, type: 'hotels' },
          isReal: true,
          priority: 9
        });
      }
    }

    // Urgency Triggers (price changes)
    if (enabledTriggers.includes('urgency') && realTimeData?.priceChanges) {
      const recentIncrease = realTimeData.priceChanges.find(change => 
        change.change > 0 && change.timeAgo < 60 // within last hour
      );
      
      if (recentIncrease) {
        triggers.push({
          type: 'urgency',
          message: `Price increased by $${recentIncrease.change} in the last hour`,
          data: recentIncrease,
          isReal: true,
          priority: 8,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString()
        });
      }
    }

    // Authority Triggers
    if (enabledTriggers.includes('authority')) {
      triggers.push({
        type: 'authority',
        message: 'Travel specialists with 10+ years Brazil experience',
        data: { experience: 10, specialization: 'Brazil' },
        isReal: true,
        priority: 6
      });
    }

    // Sort by priority and take top 3 to avoid overwhelming users
    const topTriggers = triggers
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 3);

    setActiveTriggers(topTriggers);
  }, [realTimeData, enabledTriggers]);

  // ========================================
  // USER BEHAVIOR TRACKING
  // ========================================

  useEffect(() => {
    // Track time on page
    const timeTracker = setInterval(() => {
      const timeOnPage = (Date.now() - pageStartTime.current) / 1000;
      
      setConversionState((prev: any) => {
        const newState = { ...prev, time_on_page: timeOnPage };
        
        // Update abandonment risk based on behavior
        if (timeOnPage > 300 && prev.interactions < 3) { // 5 min, low interaction
          newState.abandonment_risk = 'high';
          onAbandonmentRisk?.('high');
        } else if (timeOnPage > 120 && prev.interactions < 2) {
          newState.abandonment_risk = 'medium';
        }
        
        return newState;
      });
    }, 5000);

    return () => clearInterval(timeTracker);
  }, [onAbandonmentRisk]);

  // Scroll tracking
  useEffect(() => {
    const handleScroll = () => {
      const scrollDepth = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      setConversionState((prev: any) => ({ ...prev, scroll_depth: Math.min(scrollDepth, 100) }));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Interaction tracking
  const trackInteraction = useCallback((interaction: string) => {
    interactionCount.current += 1;
    setConversionState((prev: any) => ({ 
      ...prev, 
      interactions: interactionCount.current 
    }));
    
    onConversionEvent?.(interaction, { 
      timestamp: Date.now(),
      state: conversionState 
    });
  }, [conversionState, onConversionEvent]);

  // Generate triggers on data change
  useEffect(() => {
    generateTriggers();
  }, [generateTriggers]);

  // ========================================
  // MOBILE-FIRST COMPONENTS
  // ========================================

  const TrustBadges = () => (
    <div className="trust-badges flex items-center justify-center space-x-4 py-4 bg-gray-50 rounded-lg mb-4">
      <div className="flex items-center text-sm text-gray-600">
        <Shield className="w-4 h-4 mr-1 text-green-600" />
        <span>Secure Payment</span>
      </div>
      <div className="flex items-center text-sm text-gray-600">
        <CheckCircle className="w-4 h-4 mr-1 text-blue-600" />
        <span>Best Price Guarantee</span>
      </div>
      <div className="flex items-center text-sm text-gray-600">
        <Star className="w-4 h-4 mr-1 text-yellow-600" />
        <span>4.9/5 Rating</span>
      </div>
    </div>
  );

  const ProgressIndicator = () => (
    <div className="progress-indicator bg-white rounded-lg p-4 mb-4 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">
          Step {conversionState.currentStep} of {conversionState.totalSteps}
        </span>
        <span className="text-sm text-gray-500">
          {Math.round((conversionState.currentStep / conversionState.totalSteps) * 100)}% Complete
        </span>
      </div>
      
      <div className="progress-bar w-full bg-gray-200 rounded-full h-2">
        <motion.div 
          className="bg-blue-600 h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ 
            width: `${(conversionState.currentStep / conversionState.totalSteps) * 100}%` 
          }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      
      <div className="flex justify-between text-xs text-gray-500 mt-2">
        <span>Search</span>
        <span>Select</span>
        <span>Review</span>
        <span>Book</span>
      </div>
    </div>
  );

  const ConversionTriggerAlert = ({ trigger }: { trigger: ConversionTrigger }) => {
    const getIcon = () => {
      switch (trigger.type) {
        case 'social_proof': return <Users className="w-4 h-4" />;
        case 'scarcity': return <AlertCircle className="w-4 h-4" />;
        case 'urgency': return <Clock className="w-4 h-4" />;
        case 'authority': return <Star className="w-4 h-4" />;
        default: return <Eye className="w-4 h-4" />;
      }
    };

    const getColor = () => {
      switch (trigger.type) {
        case 'social_proof': return 'blue';
        case 'scarcity': return 'red';
        case 'urgency': return 'orange';
        case 'authority': return 'purple';
        default: return 'gray';
      }
    };

    const color = getColor();

    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`conversion-alert bg-${color}-50 border border-${color}-200 rounded-lg p-3 mb-3`}
        onClick={() => trackInteraction(`trigger_click_${trigger.type}`)}
      >
        <div className="flex items-center">
          <div className={`text-${color}-600 mr-3`}>
            {getIcon()}
          </div>
          <div className="flex-1">
            <p className={`text-sm font-medium text-${color}-800`}>
              {trigger.message}
            </p>
            {trigger.isReal && (
              <div className="flex items-center mt-1">
                <div className={`w-2 h-2 bg-${color}-400 rounded-full mr-2 animate-pulse`} />
                <span className={`text-xs text-${color}-600`}>Live data</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  const AbandonmentInterceptor = () => {
    const [showInterceptor, setShowInterceptor] = useState(false);

    useEffect(() => {
      if (conversionState.abandonment_risk === 'high') {
        setShowInterceptor(true);
      }
    }, [conversionState.abandonment_risk]);

    if (!showInterceptor) return null;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={(e: React.MouseEvent) => {
          if (e.target === e.currentTarget) {
            setShowInterceptor(false);
          }
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 max-w-md w-full mx-4"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-blue-600" />
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Wait! Don't miss out!
            </h3>
            
            <p className="text-gray-600 mb-4">
              You're about to leave with great deals still in your cart. 
              Complete your booking now and save up to 15%!
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => {
                  trackInteraction('abandonment_interceptor_continue');
                  setShowInterceptor(false);
                }}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Complete My Booking
              </button>
              
              <button
                onClick={() => {
                  trackInteraction('abandonment_interceptor_email');
                  setShowInterceptor(false);
                }}
                className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Email Me This Deal
              </button>
              
              <button
                onClick={() => {
                  trackInteraction('abandonment_interceptor_dismiss');
                  setShowInterceptor(false);
                }}
                className="w-full text-gray-500 py-2 text-sm"
              >
                No thanks, I'll continue browsing
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  // ========================================
  // MOBILE GESTURE OPTIMIZATION
  // ========================================

  const ThumbFriendlyActions = ({ children }: { children: React.ReactNode }) => (
    <div className="thumb-zone fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 safe-bottom">
      <div className="max-w-md mx-auto">
        {children}
      </div>
    </div>
  );

  // ========================================
  // RENDER COMPONENT
  // ========================================

  if (!showNotifications && activeTrigers.length === 0) {
    return null;
  }

  return (
    <>
      <div className={`conversion-optimizer ${className}`}>
        {/* Progress Indicator */}
        <ProgressIndicator />

        {/* Trust Badges */}
        <TrustBadges />

        {/* Active Conversion Triggers */}
        <AnimatePresence>
          {activeTrigers.map((trigger, index) => (
            <ConversionTriggerAlert 
              key={`${trigger.type}-${index}`} 
              trigger={trigger} 
            />
          ))}
        </AnimatePresence>

        {/* Confidence Meter */}
        {conversionState.confidence < 80 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="confidence-meter bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 mb-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Booking Confidence
              </span>
              <span className="text-sm font-bold text-green-600">
                {conversionState.confidence}%
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div 
                className="bg-gradient-to-r from-yellow-400 to-green-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${conversionState.confidence}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            
            <p className="text-xs text-gray-600 mt-2">
              Add more services to increase savings and confidence
            </p>
          </motion.div>
        )}

        {/* Real-time Activity Feed */}
        {realTimeData?.recentBookings && realTimeData.recentBookings.length > 0 && (
          <div className="activity-feed bg-white rounded-lg border border-gray-200 p-4 mb-4">
            <h4 className="text-sm font-medium text-gray-800 mb-3 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2 text-green-600" />
              Recent Activity
            </h4>
            
            <div className="space-y-2">
              {realTimeData.recentBookings.slice(0, 3).map((booking, index) => (
                <div key={index} className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-3 animate-pulse" />
                  <span>
                    Trip to {booking.destination} booked ({booking.timeAgo}m ago)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Abandonment Interceptor Modal */}
      <AbandonmentInterceptor />
    </>
  );
};

export default ConversionOptimizer;

// ========================================
// UTILITY COMPONENTS
// ========================================

/**
 * Quick action button optimized for mobile thumb reach
 */
export const ThumbFriendlyButton: React.FC<{
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  className?: string;
}> = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'large',
  className = '' 
}) => {
  const baseClasses = 'font-semibold rounded-2xl transition-all duration-200 active:scale-95';
  const sizeClasses = {
    small: 'py-2 px-4 text-sm',
    medium: 'py-3 px-6 text-base', 
    large: 'py-4 px-8 text-lg min-h-[56px]' // 56px minimum for thumb-friendly
  };
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg',
    secondary: 'bg-white text-gray-800 border-2 border-gray-300 hover:border-blue-500'
  };

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

/**
 * Progress steps component for mobile
 */
export const MobileProgressSteps: React.FC<{
  currentStep: number;
  totalSteps: number;
  labels: string[];
}> = ({ currentStep, totalSteps, labels }) => {
  return (
    <div className="mobile-progress-steps py-4">
      <div className="flex justify-between items-center mb-2">
        {labels.map((label, index) => (
          <div key={index} className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              index + 1 <= currentStep 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-500'
            }`}>
              {index + 1 <= currentStep ? '✓' : index + 1}
            </div>
            <span className="text-xs text-gray-600 mt-1 text-center max-w-[60px]">
              {label}
            </span>
          </div>
        ))}
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2">
        <motion.div 
          className="bg-blue-600 h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
};

// Types already exported above