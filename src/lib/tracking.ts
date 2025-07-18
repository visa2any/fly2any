// Comprehensive Tracking System for Paid Ads
declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    fbq: (...args: unknown[]) => void;
    uetq: any; // Bing UET
    dataLayer: any[];
  }
}

export interface ConversionEvent {
  event_name: string;
  value?: number;
  currency?: string;
  campaign_source?: string;
  campaign_medium?: string;
  campaign_name?: string;
  page_path?: string;
  user_agent?: string;
  timestamp?: string;
  lead_data?: {
    name?: string;
    email?: string;
    phone?: string;
    route?: string;
    message?: string;
  };
}

export class TrackingManager {
  private static instance: TrackingManager;
  private isInitialized = false;
  
  public static getInstance(): TrackingManager {
    if (!TrackingManager.instance) {
      TrackingManager.instance = new TrackingManager();
    }
    return TrackingManager.instance;
  }

  private constructor() {}

  // Initialize all tracking pixels
  public initialize() {
    if (this.isInitialized) return;
    
    try {
      this.initializeGoogleAds();
      this.initializeMetaPixel();
      this.initializeBingUET();
      this.initializeCustomTracking();
      
      this.isInitialized = true;
      console.log('🎯 Tracking Manager initialized successfully');
    } catch (error) {
      console.warn('🚨 Tracking Manager initialization failed:', error);
    }
  }

  // Google Ads Enhanced Conversions
  private initializeGoogleAds() {
    try {
      // Enhanced conversions setup
      if (typeof window !== 'undefined' && window.gtag && process.env.NEXT_PUBLIC_GA_ID) {
        window.gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
          allow_enhanced_conversions: true,
          conversion_linker: true,
        });
        console.log('✅ Google Ads tracking initialized');
      }
    } catch (error) {
      console.warn('❌ Google Ads initialization failed:', error);
    }
  }

  // Meta Pixel Advanced Events
  private initializeMetaPixel() {
    try {
      if (typeof window !== 'undefined' && window.fbq && process.env.NEXT_PUBLIC_FB_PIXEL_ID) {
        // Advanced Matching for better attribution
        window.fbq('init', process.env.NEXT_PUBLIC_FB_PIXEL_ID, {
          em: 'auto', // Automatic email hashing
          fn: 'auto', // Automatic first name
          ln: 'auto', // Automatic last name
          ph: 'auto', // Automatic phone
        });
        console.log('✅ Meta Pixel tracking initialized');
      }
    } catch (error) {
      console.warn('❌ Meta Pixel initialization failed:', error);
    }
  }

  // Bing UET (Universal Event Tracking)
  private initializeBingUET() {
    try {
      if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_BING_UET_ID) {
        window.uetq = window.uetq || [];
        window.uetq.push('event', 'page_view', {});
        console.log('✅ Bing UET tracking initialized');
      }
    } catch (error) {
      console.warn('❌ Bing UET initialization failed:', error);
    }
  }

  // Custom tracking for internal analytics
  private initializeCustomTracking() {
    try {
      // UTM parameter capture
      this.captureUTMParameters();
      
      // Session tracking
      this.initializeSessionTracking();
      
      console.log('✅ Custom tracking initialized');
    } catch (error) {
      console.warn('❌ Custom tracking initialization failed:', error);
    }
  }

  // Capture UTM parameters for attribution
  private captureUTMParameters() {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const utmData = {
        utm_source: urlParams.get('utm_source'),
        utm_medium: urlParams.get('utm_medium'),
        utm_campaign: urlParams.get('utm_campaign'),
        utm_content: urlParams.get('utm_content'),
        utm_term: urlParams.get('utm_term'),
        gclid: urlParams.get('gclid'), // Google Ads click ID
        fbclid: urlParams.get('fbclid'), // Facebook click ID
        msclkid: urlParams.get('msclkid'), // Bing click ID
      };

      // Store in sessionStorage for attribution
      const hasUtm = Object.values(utmData).some(value => value !== null);
      if (hasUtm) {
        sessionStorage.setItem('utm_data', JSON.stringify(utmData));
      }
    }
  }

  // Session tracking for user journey
  private initializeSessionTracking() {
    if (typeof window !== 'undefined') {
      const sessionData = {
        session_id: this.generateSessionId(),
        start_time: new Date().toISOString(),
        landing_page: window.location.pathname,
        referrer: document.referrer,
        user_agent: navigator.userAgent,
      };
      
      sessionStorage.setItem('session_data', JSON.stringify(sessionData));
    }
  }

  // Generate unique session ID
  private generateSessionId(): string {
    return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Track form submissions (leads)
  public trackFormSubmission(formData: {
    name?: string;
    email?: string;
    phone?: string;
    route?: string;
    message?: string;
  }, formType: string = 'contact') {
    const value = this.getConversionValue(formType);
    
    // Google Ads Conversion
    this.trackGoogleConversion('form_submit', value, formData);
    
    // Meta Pixel Lead Event
    this.trackMetaLead(value, formData);
    
    // Bing Conversion
    this.trackBingConversion('form_submit', value);
    
    // Custom Analytics
    this.trackCustomEvent({
      event_name: 'form_submission',
      value,
      currency: 'USD',
      lead_data: formData,
      ...this.getAttributionData(),
    });

    console.log('📝 Form submission tracked:', formType, value);
  }

  // Track phone clicks
  public trackPhoneClick(phoneNumber: string) {
    const value = 35; // Higher value for phone calls
    
    // Google Ads
    this.trackGoogleConversion('phone_click', value);
    
    // Meta Pixel
    if (window.fbq) {
      window.fbq('track', 'Contact', {
        value,
        currency: 'USD',
        content_name: 'Phone Call',
      });
    }
    
    // Bing
    this.trackBingConversion('phone_click', value);
    
    // Custom
    this.trackCustomEvent({
      event_name: 'phone_click',
      value,
      currency: 'USD',
      ...this.getAttributionData(),
    });

    console.log('📞 Phone click tracked:', phoneNumber);
  }

  // Track WhatsApp clicks
  public trackWhatsAppClick() {
    const value = 30;
    
    // Google Ads
    this.trackGoogleConversion('whatsapp_click', value);
    
    // Meta Pixel
    if (window.fbq) {
      window.fbq('track', 'Contact', {
        value,
        currency: 'USD',
        content_name: 'WhatsApp',
      });
    }
    
    // Bing
    this.trackBingConversion('whatsapp_click', value);
    
    // Custom
    this.trackCustomEvent({
      event_name: 'whatsapp_click',
      value,
      currency: 'USD',
      ...this.getAttributionData(),
    });

    console.log('💬 WhatsApp click tracked');
  }

  // Track page views with enhanced data
  public trackPageView(pagePath?: string) {
    const path = pagePath || (typeof window !== 'undefined' ? window.location.pathname : '');
    
    // Google Analytics enhanced
    if (window.gtag) {
      window.gtag('event', 'page_view', {
        page_title: document.title,
        page_location: window.location.href,
        page_path: path,
        ...this.getAttributionData(),
      });
    }
    
    // Meta Pixel
    if (window.fbq) {
      window.fbq('track', 'PageView');
    }
    
    // Bing UET
    if (window.uetq) {
      window.uetq.push('event', 'page_view', {
        page_path: path,
      });
    }

    // Custom analytics
    this.trackCustomEvent({
      event_name: 'page_view',
      page_path: path,
      ...this.getAttributionData(),
    });
  }

  // Google Ads conversion tracking
  private trackGoogleConversion(action: string, value: number, userData?: any) {
    if (!window.gtag) return;

    const conversionId = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID;
    const conversionLabel = this.getGoogleConversionLabel(action);
    
    if (conversionId && conversionLabel) {
      window.gtag('event', 'conversion', {
        send_to: `${conversionId}/${conversionLabel}`,
        value,
        currency: 'USD',
        user_data: userData ? {
          email_address: userData.email,
          phone_number: userData.phone,
          address: {
            first_name: userData.name?.split(' ')[0],
            last_name: userData.name?.split(' ').slice(1).join(' '),
          }
        } : undefined,
      });
    }
  }

  // Meta Pixel lead tracking
  private trackMetaLead(value: number, userData: any) {
    if (!window.fbq) return;

    window.fbq('track', 'Lead', {
      value,
      currency: 'USD',
      content_name: 'Flight Quote Request',
      content_category: 'Travel',
    }, {
      em: userData.email ? [userData.email] : undefined,
      ph: userData.phone ? [userData.phone] : undefined,
      fn: userData.name ? [userData.name.split(' ')[0]] : undefined,
    });
  }

  // Bing conversion tracking
  private trackBingConversion(action: string, value: number) {
    if (!window.uetq) return;

    const goalId = this.getBingGoalId(action);
    if (goalId) {
      window.uetq.push('event', 'conversion', {
        goal_id: goalId,
        revenue_value: value,
        currency: 'USD',
      });
    }
  }

  // Custom event tracking for internal analytics
  private async trackCustomEvent(event: ConversionEvent) {
    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...event,
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent,
          page_path: window.location.pathname,
        }),
      });
    } catch (error) {
      console.error('Custom tracking failed:', error);
    }
  }

  // Get attribution data from session
  private getAttributionData() {
    if (typeof window === 'undefined') return {};

    const utmData = JSON.parse(sessionStorage.getItem('utm_data') || '{}');
    const sessionData = JSON.parse(sessionStorage.getItem('session_data') || '{}');
    
    return {
      campaign_source: utmData.utm_source,
      campaign_medium: utmData.utm_medium,
      campaign_name: utmData.utm_campaign,
      campaign_content: utmData.utm_content,
      campaign_term: utmData.utm_term,
      gclid: utmData.gclid,
      fbclid: utmData.fbclid,
      msclkid: utmData.msclkid,
      session_id: sessionData.session_id,
      landing_page: sessionData.landing_page,
      referrer: sessionData.referrer,
    };
  }

  // Get conversion value based on action type
  private getConversionValue(actionType: string): number {
    const values = {
      contact: 25,
      flight_quote: 30,
      hotel_quote: 20,
      car_quote: 15,
      insurance_quote: 10,
      phone_call: 35,
      whatsapp: 30,
      email: 20,
    };
    
    return values[actionType as keyof typeof values] || 25;
  }

  // Get Google Ads conversion labels
  private getGoogleConversionLabel(action: string): string | null {
    const labels = {
      form_submit: process.env.NEXT_PUBLIC_GOOGLE_FORM_CONVERSION_LABEL,
      phone_click: process.env.NEXT_PUBLIC_GOOGLE_PHONE_CONVERSION_LABEL,
      whatsapp_click: process.env.NEXT_PUBLIC_GOOGLE_WHATSAPP_CONVERSION_LABEL,
    };
    
    return labels[action as keyof typeof labels] || null;
  }

  // Get Bing goal IDs
  private getBingGoalId(action: string): string | null {
    const goals = {
      form_submit: process.env.NEXT_PUBLIC_BING_FORM_GOAL_ID,
      phone_click: process.env.NEXT_PUBLIC_BING_PHONE_GOAL_ID,
      whatsapp_click: process.env.NEXT_PUBLIC_BING_WHATSAPP_GOAL_ID,
    };
    
    return goals[action as keyof typeof goals] || null;
  }
}

// Export singleton instance
export const tracking = TrackingManager.getInstance();

// Convenience functions
export const trackFormSubmission = (formData: any, formType?: string) => 
  tracking.trackFormSubmission(formData, formType);

export const trackPhoneClick = (phoneNumber: string) => 
  tracking.trackPhoneClick(phoneNumber);

export const trackWhatsAppClick = () => 
  tracking.trackWhatsAppClick();

export const trackPageView = (pagePath?: string) => 
  tracking.trackPageView(pagePath);
