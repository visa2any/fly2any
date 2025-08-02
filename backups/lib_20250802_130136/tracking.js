// Tracking Manager for Client-Side Loading
class TrackingManager {
  constructor() {
    this.isInitialized = false;
  }

  static getInstance() {
    if (!TrackingManager.instance) {
      TrackingManager.instance = new TrackingManager();
    }
    return TrackingManager.instance;
  }

  initialize() {
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

  initializeGoogleAds() {
    try {
      if (typeof window !== 'undefined' && window.gtag) {
        const gaId = document.querySelector('script[src*="googletagmanager"]')?.src.match(/id=([^&]+)/)?.[1];
        if (gaId) {
          window.gtag('config', gaId, {
            allow_enhanced_conversions: true,
            conversion_linker: true,
          });
          console.log('✅ Google Ads tracking initialized');
        }
      }
    } catch (error) {
      console.warn('❌ Google Ads initialization failed:', error);
    }
  }

  initializeMetaPixel() {
    try {
      if (typeof window !== 'undefined' && window.fbq) {
        console.log('✅ Meta Pixel tracking initialized');
      }
    } catch (error) {
      console.warn('❌ Meta Pixel initialization failed:', error);
    }
  }

  initializeBingUET() {
    try {
      if (typeof window !== 'undefined' && window.uetq) {
        window.uetq.push('event', 'page_view', {});
        console.log('✅ Bing UET tracking initialized');
      }
    } catch (error) {
      console.warn('❌ Bing UET initialization failed:', error);
    }
  }

  initializeCustomTracking() {
    try {
      this.captureUTMParameters();
      this.initializeSessionTracking();
      console.log('✅ Custom tracking initialized');
    } catch (error) {
      console.warn('❌ Custom tracking initialization failed:', error);
    }
  }

  captureUTMParameters() {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const utmData = {
        utm_source: urlParams.get('utm_source'),
        utm_medium: urlParams.get('utm_medium'),
        utm_campaign: urlParams.get('utm_campaign'),
        utm_content: urlParams.get('utm_content'),
        utm_term: urlParams.get('utm_term'),
        gclid: urlParams.get('gclid'),
        fbclid: urlParams.get('fbclid'),
        msclkid: urlParams.get('msclkid'),
      };

      const hasUtm = Object.values(utmData).some(value => value !== null);
      if (hasUtm) {
        sessionStorage.setItem('utm_data', JSON.stringify(utmData));
      }
    }
  }

  initializeSessionTracking() {
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

  generateSessionId() {
    return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Track form submissions
  trackFormSubmission(formData, formType = 'contact') {
    const value = this.getConversionValue(formType);
    
    // Google Ads
    if (window.gtag) {
      window.gtag('event', 'conversion', {
        send_to: 'AW-CONVERSION_ID/CONVERSION_LABEL',
        value,
        currency: 'USD',
      });
    }
    
    // Meta Pixel
    if (window.fbq) {
      window.fbq('track', 'Lead', {
        value,
        currency: 'USD',
        content_name: 'Flight Quote Request',
      });
    }
    
    // Bing
    if (window.uetq) {
      window.uetq.push('event', 'conversion', {
        revenue_value: value,
        currency: 'USD',
      });
    }

    console.log('📝 Form submission tracked:', formType, value);
  }

  // Track phone clicks
  trackPhoneClick(phoneNumber) {
    const value = 35;
    
    if (window.gtag) {
      window.gtag('event', 'conversion', {
        send_to: 'AW-CONVERSION_ID/PHONE_CONVERSION_LABEL',
        value,
        currency: 'USD',
      });
    }
    
    if (window.fbq) {
      window.fbq('track', 'Contact', {
        value,
        currency: 'USD',
        content_name: 'Phone Call',
      });
    }

    console.log('📞 Phone click tracked:', phoneNumber);
  }

  // Track WhatsApp clicks
  trackWhatsAppClick() {
    const value = 30;
    
    if (window.gtag) {
      window.gtag('event', 'conversion', {
        send_to: 'AW-CONVERSION_ID/WHATSAPP_CONVERSION_LABEL',
        value,
        currency: 'USD',
      });
    }
    
    if (window.fbq) {
      window.fbq('track', 'Contact', {
        value,
        currency: 'USD',
        content_name: 'WhatsApp',
      });
    }

    console.log('💬 WhatsApp click tracked');
  }

  getConversionValue(actionType) {
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
    
    return values[actionType] || 25;
  }
}

// Export singleton instance
export const tracking = TrackingManager.getInstance();

// Convenience functions
export const trackFormSubmission = (formData, formType) => 
  tracking.trackFormSubmission(formData, formType);

export const trackPhoneClick = (phoneNumber) => 
  tracking.trackPhoneClick(phoneNumber);

export const trackWhatsAppClick = () => 
  tracking.trackWhatsAppClick();