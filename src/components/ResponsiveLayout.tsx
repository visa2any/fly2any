'use client';

import React, { useState, useEffect } from 'react';

interface ResponsiveLayoutProps {
  mobileComponent: React.ComponentType;
  desktopComponent: React.ComponentType;
}

export default function ResponsiveLayout({ 
  mobileComponent: MobileComponent, 
  desktopComponent: DesktopComponent 
}: ResponsiveLayoutProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkIsMobile = () => {
      const userAgent = navigator.userAgent;
      const mobileKeywords = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      const screenWidth = window.innerWidth;
      
      // Check both user agent and screen width
      const isMobileDevice = mobileKeywords.test(userAgent) || screenWidth < 768;
      
      setIsMobile(isMobileDevice);
      setIsLoading(false);
    };

    checkIsMobile();
    
    // Listen for resize events
    window.addEventListener('resize', checkIsMobile);
    
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #1e40af 0%, #a21caf 50%, #713f12 100%)'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid rgba(255, 255, 255, 0.3)',
          borderTop: '4px solid white',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      </div>
    );
  }

  return isMobile ? <MobileComponent /> : <DesktopComponent />;
}