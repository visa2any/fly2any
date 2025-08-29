/**
 * 🛡️ SAFE ANALYTICS MODULE - Fixed webpack factory errors
 * ULTRATHINK: Handles empty env vars and webpack module creation issues
 */

// Safe environment variable handling to prevent webpack factory errors
const getGATrackingId = (): string => {
  try {
    if (typeof window === 'undefined') return 'G-DISABLED';
    return process.env.NEXT_PUBLIC_GA_ID || 'G-DISABLED';
  } catch {
    return 'G-DISABLED';
  }
};

const getFBPixelId = (): string => {
  try {
    if (typeof window === 'undefined') return 'FB-DISABLED';
    return process.env.NEXT_PUBLIC_FB_PIXEL_ID || 'FB-DISABLED';
  } catch {
    return 'FB-DISABLED';
  }
};

// Safe window access to prevent RSC conflicts
const safeGtag = (command: 'config' | 'event' | 'js' | 'set', targetId: string | Date, config?: Record<string, any>): void => {
  try {
    if (typeof window !== 'undefined' && 'gtag' in window && typeof window.gtag === 'function') {
      window.gtag(command, targetId, config);
    }
  } catch (error) {
    console.warn('Analytics gtag error:', error);
  }
};

const safeFbq = (...args: unknown[]): void => {
  try {
    if (typeof window !== 'undefined' && 'fbq' in window && typeof window.fbq === 'function') {
      window.fbq(...args);
    }
  } catch (error) {
    console.warn('Analytics fbq error:', error);
  }
};

// Google Analytics 4 - Safe implementation
export const pageview = (url: string): void => {
  const trackingId = getGATrackingId();
  if (trackingId && trackingId !== 'G-DISABLED') {
    safeGtag('config', trackingId, {
      page_location: url,
    });
  }
};

export const event = (action: string, parameters?: Record<string, unknown>): void => {
  safeGtag('event', action, parameters || {});
};

// Facebook Pixel - Safe implementation
export const fbEvent = (eventName: string, parameters?: Record<string, unknown>): void => {
  const pixelId = getFBPixelId();
  if (pixelId && pixelId !== 'FB-DISABLED') {
    safeFbq('track', eventName, parameters || {});
  }
};

// Conversion tracking events - Safe implementation
export const trackFormSubmit = (formType: string, data: Record<string, unknown> = {}): void => {
  try {
    // Google Analytics
    event('form_submit', {
      form_type: formType,
      service_type: data.serviceType || 'unknown',
      destination: data.destino || '',
      origin: data.origem || '',
    });

    // Facebook Pixel
    fbEvent('Lead', {
      content_name: formType,
      content_category: data.serviceType || 'unknown',
      value: 1,
      currency: 'USD',
    });
  } catch (error) {
    console.warn('Analytics trackFormSubmit error:', error);
  }
};

export const trackQuoteRequest = (data: Record<string, unknown> = {}): void => {
  try {
    // Google Analytics
    event('quote_request', {
      service_type: data.serviceType || 'unknown',
      destination: data.destino || '',
      origin: data.origem || '',
      trip_type: data.tipoViagem || '',
    });

    // Facebook Pixel
    fbEvent('InitiateCheckout', {
      content_name: 'Quote Request',
      content_category: data.serviceType || 'unknown',
      value: 1,
      currency: 'USD',
    });
  } catch (error) {
    console.warn('Analytics trackQuoteRequest error:', error);
  }
};

export const trackButtonClick = (buttonName: string, location: string): void => {
  try {
    // Google Analytics
    event('click', {
      event_category: 'engagement',
      event_label: buttonName,
      page_location: location,
    });
  } catch (error) {
    console.warn('Analytics trackButtonClick error:', error);
  }
};

export const trackWhatsAppClick = (): void => {
  try {
    // Google Analytics
    event('contact', {
      method: 'whatsapp',
    });

    // Facebook Pixel
    fbEvent('Contact', {
      method: 'whatsapp',
    });
  } catch (error) {
    console.warn('Analytics trackWhatsAppClick error:', error);
  }
};

// Export constants safely - lazy evaluation to prevent SSR issues
export const GA_TRACKING_ID = typeof window !== 'undefined' ? getGATrackingId() : 'G-DISABLED';
export const FB_PIXEL_ID = typeof window !== 'undefined' ? getFBPixelId() : 'FB-DISABLED';