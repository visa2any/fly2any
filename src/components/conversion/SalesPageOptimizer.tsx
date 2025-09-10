'use client';

import React, { useState, useEffect } from 'react';
import { CountdownTimer } from './CountdownTimer';
import { SocialProofNotification } from './SocialProofNotification';
import ExitIntentPopup from './ExitIntentPopup';

interface SalesPageOptimizerProps {
  // Conversion tracking
  pageType?: 'homepage' | 'landing' | 'route-specific' | 'diaspora';
  route?: string;
  
  // Feature toggles
  enableCountdown?: boolean;
  enableSocialProof?: boolean;
  enableExitIntent?: boolean;
  enableScarcity?: boolean;
  enableVisitorCounter?: boolean;
  
  // Customization
  urgencyMessage?: string;
  scarcityCount?: number;
  countdownDuration?: number; // in hours
  
  // Callbacks
  onConversion?: (data: any) => void;
  onEngagement?: (event: string, data: any) => void;
}

interface ConversionData {
  timestamp: number;
  pageType: string;
  route?: string;
  conversionType: string;
  value?: string;
  userAgent: string;
}

export default function SalesPageOptimizer({
  pageType = 'landing',
  route,
  enableCountdown = true,
  enableSocialProof = true,
  enableExitIntent = true,
  enableScarcity = true,
  enableVisitorCounter = true,
  urgencyMessage = "Oferta limitada termina em:",
  scarcityCount = 8,
  countdownDuration = 24,
  onConversion,
  onEngagement
}: SalesPageOptimizerProps) {
  
  const [conversionStats, setConversionStats] = useState({
    pageViews: 1,
    timeOnPage: 0,
    scrollDepth: 0,
    engagements: 0
  });

  const [userBehavior, setUserBehavior] = useState({
    hasScrolled: false,
    hasEngaged: false,
    timeSpent: 0,
    interactions: [] as string[],
    engagements: 0
  });

  // Track user engagement
  useEffect(() => {
    const startTime = Date.now();

    const trackEngagement = (event: string, data?: any) => {
      setUserBehavior(prev => ({
        ...prev,
        hasEngaged: true,
        engagements: prev.engagements + 1,
        interactions: [...prev.interactions, event]
      }));

      if (onEngagement) {
        onEngagement(event, { ...data, timeOnPage: Date.now() - startTime });
      }
    };

    // Scroll tracking
    const handleScroll = () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
      );
      
      setConversionStats(prev => ({
        ...prev,
        scrollDepth: Math.max(prev.scrollDepth, scrollPercent)
      }));

      if (!userBehavior.hasScrolled && scrollPercent > 25) {
        setUserBehavior(prev => ({ ...prev, hasScrolled: true }));
        trackEngagement('scroll_25_percent');
      }

      if (scrollPercent > 50) {
        trackEngagement('scroll_50_percent');
      }

      if (scrollPercent > 75) {
        trackEngagement('scroll_75_percent');
      }
    };

    // Click tracking
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      if (target.tagName === 'BUTTON' || target.tagName === 'A') {
        const elementText = target.textContent?.slice(0, 50) || 'unknown';
        trackEngagement('button_click', { elementText, tagName: target.tagName });
      }
    };

    // Time tracking
    const timeInterval = setInterval(() => {
      setUserBehavior(prev => ({ ...prev, timeSpent: Date.now() - startTime }));
      setConversionStats(prev => ({ ...prev, timeOnPage: Date.now() - startTime }));
    }, 1000);

    // Event listeners
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('click', handleClick);
      clearInterval(timeInterval);
    };
  }, [onEngagement]);

  // Track conversions
  const handleConversion = async (conversionType: string, data: any) => {
    const conversionData: ConversionData = {
      timestamp: Date.now(),
      pageType,
      route,
      conversionType,
      value: data.value || data.email || data.phone,
      userAgent: navigator.userAgent
    };

    // Store locally for analytics
    const existingData = JSON.parse(localStorage.getItem('fly2any_conversions') || '[]');
    existingData.push(conversionData);
    localStorage.setItem('fly2any_conversions', JSON.stringify(existingData));

    if (onConversion) {
      await onConversion(conversionData);
    }

    // Track in Google Analytics or other platforms
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'conversion', {
        event_category: 'Sales',
        event_label: conversionType,
        value: 1
      });
    }
  };

  // Generate dynamic social proof data based on route
  const generateSocialProofData = () => {
    const routeSpecificData = {
      'miami-sao-paulo': [
        { name: "Carlos Mendes", location: "Miami, FL", route: "Miami → São Paulo", price: "$675", timeAgo: "2 min" },
        { name: "Maria Santos", location: "Coral Gables, FL", route: "Miami → São Paulo", price: "$675", timeAgo: "5 min" },
        { name: "João Silva", location: "Aventura, FL", route: "Miami → São Paulo", price: "$675", timeAgo: "8 min" }
      ],
      'new-york-rio': [
        { name: "Ana Costa", location: "Manhattan, NY", route: "New York → Rio de Janeiro", price: "$890", timeAgo: "3 min" },
        { name: "Roberto Lima", location: "Queens, NY", route: "New York → Rio de Janeiro", price: "$890", timeAgo: "7 min" },
        { name: "Patricia Oliveira", location: "Brooklyn, NY", route: "New York → Rio de Janeiro", price: "$890", timeAgo: "12 min" }
      ],
      default: [
        { name: "Maria Silva", location: "Orlando, FL", route: "Miami → São Paulo", price: "$675", timeAgo: "2 min" },
        { name: "João Santos", location: "Miami, FL", route: "New York → Rio", price: "$890", timeAgo: "5 min" },
        { name: "Ana Costa", location: "Boston, MA", route: "Los Angeles → Brasília", price: "$1,190", timeAgo: "8 min" }
      ]
    };

    return routeSpecificData[route as keyof typeof routeSpecificData] || routeSpecificData.default;
  };

  // Calculate countdown end time
  const getCountdownEndTime = () => {
    const now = new Date();
    return new Date(now.getTime() + (countdownDuration * 60 * 60 * 1000));
  };

  return (
    <>
      {/* Conversion Components */}
      {enableCountdown && (
        <div className="fixed bottom-4 right-4 z-50">
          <CountdownTimer
            endTime={getCountdownEndTime()}
            theme="urgent"
            onExpire={() => handleConversion('countdown_expired', { duration: countdownDuration })}
          />
        </div>
      )}

      {enableSocialProof && (
        <SocialProofNotification
          position="bottom-left"
          theme="default"
        />
      )}

      {enableVisitorCounter && (
        <div className="fixed top-4 right-4 z-50 bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
          <div className="text-green-800 font-semibold">{Math.floor(Math.random() * 200) + 150} visitantes online</div>
          <div className="text-green-600">{Math.floor(Math.random() * 50) + 25} reservas hoje</div>
        </div>
      )}

      {enableExitIntent && (
        <ExitIntentPopup
          enabled={true}
          delay={30000}
          showOnScroll={true}
          onCapture={(data) => handleConversion('exit_intent', data)}
          onClose={() => handleConversion('exit_intent_close', {})}
        />
      )}

      {/* Analytics & Tracking */}
      <div style={{ display: 'none' }}>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Track page engagement
              window.fly2anyAnalytics = {
                pageType: '${pageType}',
                route: '${route || 'unknown'}',
                startTime: Date.now(),
                conversions: 0
              };
              
              // Enhanced tracking
              function trackEvent(event, data) {
                console.log('Fly2Any Event:', event, data);
                
                // Send to analytics endpoint
                if (typeof fetch !== 'undefined') {
                  fetch('/api/analytics/track', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      event,
                      data,
                      page: window.location.pathname,
                      timestamp: Date.now()
                    })
                  }).catch(console.error);
                }
              }
              
              // Track high-intent actions
              document.addEventListener('click', function(e) {
                const target = e.target;
                
                if (target.href && target.href.includes('wa.me')) {
                  trackEvent('whatsapp_click', { text: target.textContent });
                }
                
                if (target.href && target.href.includes('tel:')) {
                  trackEvent('phone_click', { number: target.href.replace('tel:', '') });
                }
                
                if (target.textContent && target.textContent.toLowerCase().includes('cotação')) {
                  trackEvent('quote_request', { button: target.textContent });
                }
              });
            `
          }}
        />
      </div>

      {/* Performance monitoring */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{
          position: 'fixed',
          top: '10px',
          left: '10px',
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '10px',
          borderRadius: '8px',
          fontSize: '12px',
          zIndex: 10000,
          fontFamily: 'monospace'
        }}>
          <div>Page: {pageType}</div>
          <div>Route: {route || 'N/A'}</div>
          <div>Time: {Math.floor(userBehavior.timeSpent / 1000)}s</div>
          <div>Scroll: {conversionStats.scrollDepth}%</div>
          <div>Engaged: {userBehavior.hasEngaged ? 'Yes' : 'No'}</div>
        </div>
      )}
    </>
  );
}

// Hook for conversion optimization
export function useConversionOptimization(pageType: string, route?: string) {
  const [conversionData, setConversionData] = useState({
    conversions: 0,
    engagements: 0,
    timeOnPage: 0,
    bounceRate: 0
  });

  useEffect(() => {
    // Load existing conversion data
    const existingData = JSON.parse(localStorage.getItem(`fly2any_${pageType}_stats`) || '{}');
    setConversionData(existingData);

    // Track session
    const sessionStart = Date.now();
    
    const updateSession = () => {
      const sessionData = {
        ...conversionData,
        timeOnPage: Date.now() - sessionStart,
        lastVisit: Date.now()
      };
      
      localStorage.setItem(`fly2any_${pageType}_stats`, JSON.stringify(sessionData));
      setConversionData(sessionData);
    };

    const interval = setInterval(updateSession, 5000);
    
    return () => {
      clearInterval(interval);
      updateSession(); // Final update
    };
  }, [pageType]);

  const trackConversion = (type: string, value?: any) => {
    setConversionData(prev => ({
      ...prev,
      conversions: prev.conversions + 1
    }));

    // Send to analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'conversion', {
        event_category: 'Sales',
        event_label: type,
        event_value: 1
      });
    }
  };

  return {
    conversionData,
    trackConversion
  };
}