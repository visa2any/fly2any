'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { trackFormSubmit, trackQuoteRequest } from '@/lib/analytics-safe';

// Analytics types
export interface ConversionEvent {
  id: string;
  timestamp: number;
  eventType: 'form_view' | 'field_focus' | 'field_complete' | 'form_submit' | 'form_abandon' | 'insight_click' | 'cta_click';
  userId?: string;
  sessionId: string;
  formId: string;
  fieldId?: string;
  value?: any;
  metadata: {
    device: 'mobile' | 'desktop' | 'tablet';
    browser: string;
    os: string;
    screenSize: { width: number; height: number };
    userAgent: string;
    referrer?: string;
    abVariant?: string;
    conversionValue?: number;
    timeSpent?: number;
    scrollDepth?: number;
  };
}

export interface ConversionMetrics {
  totalViews: number;
  formStarts: number;
  formCompletions: number;
  abandonmentRate: number;
  conversionRate: number;
  averageTimeToComplete: number;
  topAbandonmentFields: Array<{ fieldId: string; count: number; rate: number }>;
  deviceBreakdown: Record<string, { views: number; conversions: number; rate: number }>;
  abTestResults: Record<string, { views: number; conversions: number; rate: number; confidence: number }>;
  heatmapData: Array<{ fieldId: string; interactions: number; timeSpent: number }>;
  conversionFunnel: Array<{ step: string; users: number; dropOff: number }>;
}

export interface RealTimeAnalytics {
  activeUsers: number;
  currentConversions: number;
  hourlyTrends: Array<{ hour: number; views: number; conversions: number }>;
  topPerformingVariants: Array<{ variant: string; performance: number }>;
  liveInsights: string[];
}

interface ConversionAnalyticsProps {
  formId: string;
  userId?: string;
  abVariant?: string;
  onMetricsUpdate?: (metrics: ConversionMetrics) => void;
  className?: string;
}

// Conversion tracking hook
export const useConversionTracking = (formId: string, userId?: string, abVariant?: string) => {
  const [events, setEvents] = useState<ConversionEvent[]>([]);
  const [metrics, setMetrics] = useState<ConversionMetrics | null>(null);
  const [sessionId] = useState(() => generateSessionId());
  const [isTracking, setIsTracking] = useState(true);
  
  const timeSpentRef = useRef<Record<string, number>>({});
  const sessionStartRef = useRef(Date.now());

  // Generate unique session ID
  function generateSessionId(): string {
    return `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  // Device detection
  const getDeviceInfo = useCallback(() => {
    const userAgent = navigator.userAgent;
    const screenSize = { width: window.innerWidth, height: window.innerHeight };
    
    let device: 'mobile' | 'desktop' | 'tablet' = 'desktop';
    if (/iPhone|Android.*Mobile|webOS|BlackBerry|IEMobile/i.test(userAgent)) {
      device = 'mobile';
    } else if (/iPad|Android(?!.*Mobile)|Tablet/i.test(userAgent)) {
      device = 'tablet';
    }

    const browser = getBrowserName(userAgent);
    const os = getOSName(userAgent);

    return { device, browser, os, screenSize, userAgent };
  }, []);

  // Track conversion event
  const trackEvent = useCallback((
    eventType: ConversionEvent['eventType'],
    fieldId?: string,
    value?: any,
    additionalMetadata?: Partial<ConversionEvent['metadata']>
  ) => {
    if (!isTracking) return;

    const deviceInfo = getDeviceInfo();
    const scrollDepth = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);

    const event: ConversionEvent = {
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      timestamp: Date.now(),
      eventType,
      userId,
      sessionId,
      formId,
      fieldId,
      value,
      metadata: {
        ...deviceInfo,
        referrer: document.referrer,
        abVariant,
        timeSpent: fieldId ? timeSpentRef.current[fieldId] : undefined,
        scrollDepth,
        ...additionalMetadata
      }
    };

    setEvents((prev: any) => [...prev, event]);

    // Send to analytics service
    sendAnalyticsEvent(event);
  }, [isTracking, formId, userId, sessionId, abVariant, getDeviceInfo]);

  // Track field focus
  const trackFieldFocus = useCallback((fieldId: string) => {
    timeSpentRef.current[fieldId] = Date.now();
    trackEvent('field_focus', fieldId);
  }, [trackEvent]);

  // Track field completion
  const trackFieldComplete = useCallback((fieldId: string, value: any) => {
    const timeSpent = timeSpentRef.current[fieldId] 
      ? Date.now() - timeSpentRef.current[fieldId] 
      : 0;
    
    trackEvent('field_complete', fieldId, value, { timeSpent });
  }, [trackEvent]);

  // Track form submission
  const trackFormSubmit = useCallback((formData: any, conversionValue?: number) => {
    const totalTimeSpent = Date.now() - sessionStartRef.current;
    trackEvent('form_submit', undefined, formData, { 
      conversionValue,
      timeSpent: totalTimeSpent
    });
  }, [trackEvent]);

  // Track form abandonment
  const trackFormAbandon = useCallback((lastFieldId?: string) => {
    const totalTimeSpent = Date.now() - sessionStartRef.current;
    trackEvent('form_abandon', lastFieldId, undefined, { timeSpent: totalTimeSpent });
  }, [trackEvent]);

  // Calculate metrics from events
  useEffect(() => {
    if (events.length === 0) return;

    const calculatedMetrics = calculateMetrics(events);
    setMetrics(calculatedMetrics);
  }, [events]);

  // Page unload tracking for abandonment
  useEffect(() => {
    const handleBeforeUnload = () => {
      const hasStartedForm = events.some(e => e.eventType === 'field_focus');
      const hasCompletedForm = events.some(e => e.eventType === 'form_submit');
      
      if (hasStartedForm && !hasCompletedForm) {
        const lastFieldEvent = events
          .filter(e => e.eventType === 'field_focus')
          .pop();
        
        trackFormAbandon(lastFieldEvent?.fieldId);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [events, trackFormAbandon]);

  return {
    trackEvent,
    trackFieldFocus,
    trackFieldComplete,
    trackFormSubmit,
    trackFormAbandon,
    metrics,
    events,
    sessionId
  };
};

// Real-time analytics hook
export const useRealTimeAnalytics = (formId: string) => {
  const [analytics, setAnalytics] = useState<RealTimeAnalytics>({
    activeUsers: 0,
    currentConversions: 0,
    hourlyTrends: [],
    topPerformingVariants: [],
    liveInsights: []
  });

  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Simulate real-time connection
    const connectToAnalytics = () => {
      setIsConnected(true);
      
      // Generate mock real-time data
      const interval = setInterval(() => {
        setAnalytics((prev: any) => ({
          ...prev,
          activeUsers: Math.floor(Math.random() * 50) + 10,
          currentConversions: Math.floor(Math.random() * 5) + 1,
          liveInsights: generateLiveInsights()
        }));
      }, 5000);

      return () => clearInterval(interval);
    };

    const cleanup = connectToAnalytics();
    return cleanup;
  }, [formId]);

  return { analytics, isConnected };
};

// A/B test performance tracker
export const useABTestPerformance = (variants: string[]) => {
  const [performance, setPerformance] = useState<Record<string, {
    views: number;
    conversions: number;
    conversionRate: number;
    confidence: number;
    isWinner: boolean;
  }>>({});

  const updateVariantPerformance = useCallback((variant: string, eventType: 'view' | 'conversion') => {
    setPerformance((prev: any) => {
      const current = prev[variant] || { views: 0, conversions: 0, conversionRate: 0, confidence: 0, isWinner: false };
      
      const updated = {
        ...current,
        views: eventType === 'view' ? current.views + 1 : current.views,
        conversions: eventType === 'conversion' ? current.conversions + 1 : current.conversions
      };

      updated.conversionRate = updated.views > 0 ? (updated.conversions / updated.views) * 100 : 0;
      updated.confidence = calculateStatisticalSignificance(updated, Object.values(prev));

      return { ...prev, [variant]: updated };
    });
  }, []);

  // Determine winning variant
  useEffect(() => {
    const entries = Object.entries(performance);
    if (entries.length < 2) return;

    const sorted = entries.sort(([,a], [,b]) => b.conversionRate - a.conversionRate);
    const winner = sorted[0];
    
    setPerformance((prev: any) => {
      const updated = { ...prev };
      Object.keys(updated).forEach(variant => {
        updated[variant].isWinner = variant === winner[0] && winner[1].confidence > 95;
      });
      return updated;
    });
  }, [performance]);

  return { performance, updateVariantPerformance };
};

// Helper functions
function calculateMetrics(events: ConversionEvent[]): ConversionMetrics {
  const totalViews = events.filter(e => e.eventType === 'form_view').length;
  const formStarts = events.filter(e => e.eventType === 'field_focus').length;
  const formCompletions = events.filter(e => e.eventType === 'form_submit').length;
  
  const abandonmentRate = formStarts > 0 ? ((formStarts - formCompletions) / formStarts) * 100 : 0;
  const conversionRate = totalViews > 0 ? (formCompletions / totalViews) * 100 : 0;

  // Calculate average time to complete
  const completedSessions = events
    .filter(e => e.eventType === 'form_submit')
    .map(e => e.metadata.timeSpent || 0)
    .filter(time => time > 0);
  
  const averageTimeToComplete = completedSessions.length > 0 
    ? completedSessions.reduce((sum, time) => sum + time, 0) / completedSessions.length 
    : 0;

  // Top abandonment fields
  const abandonmentFields: Record<string, number> = {};
  events
    .filter(e => e.eventType === 'form_abandon' && e.fieldId)
    .forEach(e => {
      if (e.fieldId) {
        abandonmentFields[e.fieldId] = (abandonmentFields[e.fieldId] || 0) + 1;
      }
    });

  const topAbandonmentFields = Object.entries(abandonmentFields)
    .map(([fieldId, count]) => ({
      fieldId,
      count,
      rate: (count / formStarts) * 100
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Device breakdown
  const deviceBreakdown: Record<string, { views: number; conversions: number; rate: number }> = {};
  events.forEach(e => {
    const device = e.metadata.device;
    if (!deviceBreakdown[device]) {
      deviceBreakdown[device] = { views: 0, conversions: 0, rate: 0 };
    }
    
    if (e.eventType === 'form_view') {
      deviceBreakdown[device].views++;
    } else if (e.eventType === 'form_submit') {
      deviceBreakdown[device].conversions++;
    }
  });

  Object.keys(deviceBreakdown).forEach(device => {
    const data = deviceBreakdown[device];
    data.rate = data.views > 0 ? (data.conversions / data.views) * 100 : 0;
  });

  return {
    totalViews,
    formStarts,
    formCompletions,
    abandonmentRate,
    conversionRate,
    averageTimeToComplete,
    topAbandonmentFields,
    deviceBreakdown,
    abTestResults: {}, // Would be calculated from A/B test events
    heatmapData: [], // Would be calculated from interaction events
    conversionFunnel: [] // Would be calculated from step progression
  };
}

function sendAnalyticsEvent(event: ConversionEvent) {
  // Send to analytics service (Google Analytics, Mixpanel, etc.)
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', event.eventType, {
      custom_parameter_1: event.formId,
      custom_parameter_2: event.fieldId,
      custom_parameter_3: event.metadata.abVariant
    });
  }

  // Send to internal analytics
  fetch('/api/analytics/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event)
  }).catch(error => {
    console.warn('Failed to send analytics event:', error);
  });
}

function getBrowserName(userAgent: string): string {
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  return 'Unknown';
}

function getOSName(userAgent: string): string {
  if (userAgent.includes('Windows')) return 'Windows';
  if (userAgent.includes('Mac')) return 'macOS';
  if (userAgent.includes('Linux')) return 'Linux';
  if (userAgent.includes('Android')) return 'Android';
  if (userAgent.includes('iOS')) return 'iOS';
  return 'Unknown';
}

function calculateStatisticalSignificance(variant: any, allVariants: any[]): number {
  // Simplified statistical significance calculation
  // In production, use proper statistical tests
  if (variant.views < 100) return 0;
  
  const avgConversionRate = allVariants
    .filter(v => v.views > 0)
    .reduce((sum, v) => sum + v.conversionRate, 0) / allVariants.length;
  
  const difference = Math.abs(variant.conversionRate - avgConversionRate);
  const significance = Math.min((difference / avgConversionRate) * 100, 99);
  
  return Math.round(significance);
}

function generateLiveInsights(): string[] {
  const insights = [
    '📈 Taxa de conversão aumentou 12% na última hora',
    '📱 87% dos usuários estão acessando via mobile',
    '🎯 Campo "Destino" tem maior taxa de abandono',
    '⏰ Usuários levam em média 3min para completar o formulário',
    '🔥 Variante "Urgência" está convertendo 23% melhor',
    '🌍 Maior tráfego vem do sudeste do Brasil',
    '💰 Valor médio de conversão: $542'
  ];
  
  return insights.slice(0, 3);
}

export default function ConversionAnalytics({
  formId,
  userId,
  abVariant,
  onMetricsUpdate,
  className = ''
}: ConversionAnalyticsProps) {
  const { metrics, trackEvent } = useConversionTracking(formId, userId, abVariant);
  const { analytics, isConnected } = useRealTimeAnalytics(formId);

  useEffect(() => {
    if (metrics && onMetricsUpdate) {
      onMetricsUpdate(metrics);
    }
  }, [metrics, onMetricsUpdate]);

  if (!metrics) return null;

  return (
    <div className={`conversion-analytics ${className}`}>
      {/* Real-time stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-blue-600">{metrics.conversionRate.toFixed(1)}%</div>
          <div className="text-sm text-gray-600">Taxa de Conversão</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-green-600">{metrics.formCompletions}</div>
          <div className="text-sm text-gray-600">Conversões</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-orange-600">{metrics.abandonmentRate.toFixed(1)}%</div>
          <div className="text-sm text-gray-600">Taxa de Abandono</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-purple-600">
            {Math.round(metrics.averageTimeToComplete / 1000)}s
          </div>
          <div className="text-sm text-gray-600">Tempo Médio</div>
        </div>
      </div>

      {/* Device breakdown */}
      <div className="bg-white p-4 rounded-lg border mb-6">
        <h3 className="font-semibold mb-3">Performance por Dispositivo</h3>
        <div className="space-y-2">
          {Object.entries(metrics.deviceBreakdown).map(([device, data]) => (
            <div key={device} className="flex justify-between items-center">
              <span className="capitalize">{device}</span>
              <div className="text-right">
                <div className="font-medium">{data.rate.toFixed(1)}%</div>
                <div className="text-xs text-gray-500">
                  {data.conversions}/{data.views}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top abandonment fields */}
      {metrics.topAbandonmentFields.length > 0 && (
        <div className="bg-white p-4 rounded-lg border mb-6">
          <h3 className="font-semibold mb-3">Campos com Maior Abandono</h3>
          <div className="space-y-2">
            {metrics.topAbandonmentFields.map((field, index) => (
              <div key={field.fieldId} className="flex justify-between items-center">
                <span>{field.fieldId}</span>
                <div className="text-right">
                  <div className="font-medium text-red-600">{field.rate.toFixed(1)}%</div>
                  <div className="text-xs text-gray-500">{field.count} abandonos</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live insights */}
      {isConnected && analytics.liveInsights.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border">
          <h3 className="font-semibold mb-3 flex items-center space-x-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span>Insights em Tempo Real</span>
          </h3>
          <div className="space-y-2">
            {analytics.liveInsights.map((insight, index) => (
              <div key={index} className="text-sm text-gray-700">
                {insight}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}