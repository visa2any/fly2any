'use client';

import React, { useState, useEffect } from 'react';

export interface MobileDetectionInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouchDevice: boolean;
  screenWidth: number;
  screenHeight: number;
  deviceOrientation: 'portrait' | 'landscape';
  deviceType: 'mobile' | 'tablet' | 'desktop';
  isIOS: boolean;
  isAndroid: boolean;
  supportsHover: boolean;
  hasPhysicalKeyboard: boolean;
  pixelRatio: number;
}

export const MOBILE_BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1280
} as const;

const useMobileDetection = (): MobileDetectionInfo => {
  const [detectionInfo, setDetectionInfo] = useState<MobileDetectionInfo>(() => ({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isTouchDevice: false,
    screenWidth: 1920,
    screenHeight: 1080,
    deviceOrientation: 'landscape',
    deviceType: 'desktop',
    isIOS: false,
    isAndroid: false,
    supportsHover: true,
    hasPhysicalKeyboard: true,
    pixelRatio: 1
  }));

  useEffect(() => {
    const detectMobileEnvironment = (): MobileDetectionInfo => {
      // Basic measurements
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      const pixelRatio = window.devicePixelRatio || 1;

      // User agent detection
      const userAgent = navigator.userAgent.toLowerCase();
      const isIOS = /iphone|ipad|ipod/.test(userAgent);
      const isAndroid = /android/.test(userAgent);
      
      // Touch capabilities
      const isTouchDevice = (
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        (navigator as any).msMaxTouchPoints > 0
      );

      // Hover capabilities
      const supportsHover = window.matchMedia('(hover: hover)').matches;

      // Physical keyboard detection (heuristic)
      const hasPhysicalKeyboard = (
        !isTouchDevice ||
        (screenWidth >= MOBILE_BREAKPOINTS.tablet && !isIOS && !isAndroid)
      );

      // Screen-based detection
      const isMobile = screenWidth <= MOBILE_BREAKPOINTS.mobile;
      const isTablet = screenWidth > MOBILE_BREAKPOINTS.mobile && screenWidth <= MOBILE_BREAKPOINTS.tablet;
      const isDesktop = screenWidth > MOBILE_BREAKPOINTS.tablet;

      // Device orientation
      const deviceOrientation: 'portrait' | 'landscape' = screenHeight > screenWidth ? 'portrait' : 'landscape';

      // Device type (combining multiple factors)
      let deviceType: 'mobile' | 'tablet' | 'desktop';
      if (isMobile || (isTouchDevice && screenWidth <= MOBILE_BREAKPOINTS.mobile)) {
        deviceType = 'mobile';
      } else if (isTablet || (isTouchDevice && screenWidth <= MOBILE_BREAKPOINTS.tablet)) {
        deviceType = 'tablet';
      } else {
        deviceType = 'desktop';
      }

      return {
        isMobile,
        isTablet,
        isDesktop,
        isTouchDevice,
        screenWidth,
        screenHeight,
        deviceOrientation,
        deviceType,
        isIOS,
        isAndroid,
        supportsHover,
        hasPhysicalKeyboard,
        pixelRatio
      };
    };

    // Initial detection
    setDetectionInfo(detectMobileEnvironment());

    // Listen for resize events
    const handleResize = () => {
      setDetectionInfo(detectMobileEnvironment());
    };

    // Listen for orientation changes
    const handleOrientationChange = () => {
      // Small delay to get accurate measurements after orientation change
      setTimeout(() => {
        setDetectionInfo(detectMobileEnvironment());
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    // Modern browsers support screen.orientation
    if (screen.orientation) {
      screen.orientation.addEventListener('change', handleOrientationChange);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      
      if (screen.orientation) {
        screen.orientation.removeEventListener('change', handleOrientationChange);
      }
    };
  }, []);

  return detectionInfo;
};

export default useMobileDetection;

// Utility functions for common mobile checks
export const useMobileUtils = () => {
  const detection = useMobileDetection();

  return {
    ...detection,
    // Convenience methods
    isMobileDevice: detection.isMobile || detection.deviceType === 'mobile',
    isSmallMobile: detection.isMobile && detection.screenWidth <= 480,
    isLargeMobile: detection.isMobile && detection.screenWidth > 480,
    isPortraitMobile: detection.isMobile && detection.deviceOrientation === 'portrait',
    isLandscapeMobile: detection.isMobile && detection.deviceOrientation === 'landscape',
    shouldUseTouch: detection.isTouchDevice && !detection.hasPhysicalKeyboard,
    shouldUseMobileUI: detection.deviceType === 'mobile' || (detection.isTablet && detection.deviceOrientation === 'portrait'),
    
    // CSS helpers
    getMobileClasses: () => ({
      'is-mobile': detection.isMobile,
      'is-tablet': detection.isTablet,
      'is-desktop': detection.isDesktop,
      'is-touch': detection.isTouchDevice,
      'is-portrait': detection.deviceOrientation === 'portrait',
      'is-landscape': detection.deviceOrientation === 'landscape',
      'supports-hover': detection.supportsHover,
      'is-ios': detection.isIOS,
      'is-android': detection.isAndroid,
    }),

    // Size helpers
    getTouchTargetSize: () => detection.isTouchDevice ? 48 : 32,
    getFontSize: (base: number) => detection.isMobile ? Math.max(base, 16) : base,
    getSpacing: (base: number) => detection.isMobile ? base * 1.2 : base,
  };
};