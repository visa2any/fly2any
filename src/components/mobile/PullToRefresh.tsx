'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, useAnimation, PanInfo } from 'framer-motion';
import { haptic } from '@/lib/mobile/haptic-feedback';

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  threshold?: number;
  maxPullDistance?: number;
  disabled?: boolean;
  refreshingMessage?: string;
  pullMessage?: string;
  releaseMessage?: string;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  children,
  onRefresh,
  threshold = 80,
  maxPullDistance = 120,
  disabled = false,
  refreshingMessage = "Atualizando...",
  pullMessage = "Puxe para atualizar",
  releaseMessage = "Solte para atualizar",
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [canRefresh, setCanRefresh] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();

  const handleDragStart = () => {
    if (disabled || isRefreshing) return;
    
    // Only allow pull to refresh from the top
    const scrollTop = containerRef.current?.scrollTop || 0;
    return scrollTop === 0;
  };

  const handleDrag = (event: any, info: PanInfo) => {
    if (disabled || isRefreshing) return;
    
    const distance = Math.max(0, Math.min(info.point.y, maxPullDistance));
    setPullDistance(distance);
    
    // Trigger haptic feedback when reaching threshold
    if (distance >= threshold && !canRefresh) {
      setCanRefresh(true);
      haptic.success();
    } else if (distance < threshold && canRefresh) {
      setCanRefresh(false);
      haptic.light();
    }
  };

  const handleDragEnd = async (event: any, info: PanInfo) => {
    if (disabled || isRefreshing) return;

    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      haptic.success();
      
      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh failed:', error);
        haptic.error();
      } finally {
        setIsRefreshing(false);
        setCanRefresh(false);
        setPullDistance(0);
      }
    } else {
      // Snap back
      setPullDistance(0);
      setCanRefresh(false);
    }
  };

  // Animation for pull distance
  useEffect(() => {
    controls.start({
      y: isRefreshing ? threshold : pullDistance,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40,
      },
    });
  }, [pullDistance, isRefreshing, threshold, controls]);

  const getIndicatorMessage = () => {
    if (isRefreshing) return refreshingMessage;
    if (canRefresh) return releaseMessage;
    return pullMessage;
  };

  const getIndicatorOpacity = () => {
    if (isRefreshing) return 1;
    return Math.min(pullDistance / threshold, 1);
  };

  const getSpinnerRotation = () => {
    if (isRefreshing) return 360;
    return (pullDistance / threshold) * 180;
  };

  return (
    <div className="relative overflow-hidden" ref={containerRef}>
      {/* Pull to refresh indicator */}
      <motion.div
        className="absolute top-0 left-0 right-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-transparent"
        style={{
          height: maxPullDistance,
          marginTop: -maxPullDistance,
        }}
        animate={controls}
      >
        <div 
          className="flex flex-col items-center justify-center space-y-2 transition-opacity duration-200"
          style={{ opacity: getIndicatorOpacity() }}
        >
          {/* Spinner/Arrow */}
          <div className="relative">
            <motion.div
              className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full"
              animate={{
                rotate: isRefreshing ? 360 : getSpinnerRotation(),
              }}
              transition={{
                duration: isRefreshing ? 1 : 0.3,
                repeat: isRefreshing ? Infinity : 0,
                ease: "linear",
              }}
            />
            {!isRefreshing && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={{
                  rotate: canRefresh ? 180 : 0,
                }}
                transition={{ duration: 0.2 }}
              >
                <svg
                  className="w-4 h-4 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              </motion.div>
            )}
          </div>
          
          {/* Message */}
          <motion.p
            className="text-sm font-medium text-blue-600"
            initial={false}
            animate={{
              scale: canRefresh ? 1.05 : 1,
              color: canRefresh ? "#059669" : "#2563eb",
            }}
          >
            {getIndicatorMessage()}
          </motion.p>
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        animate={controls}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        className="select-none"
      >
        {children}
      </motion.div>
    </div>
  );
};

export default PullToRefresh;