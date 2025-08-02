declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    fbq: (...args: unknown[]) => void;
  }
}

// Google Analytics 4
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-XXXXXXXXXX';

export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID, {
      page_location: url,
    });
  }
};

export const event = (action: string, parameters?: Record<string, unknown>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, parameters);
  }
};

// Facebook Pixel
export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID || 'XXXXXXXXXX';

export const fbEvent = (eventName: string, parameters?: Record<string, unknown>) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, parameters);
  }
};

// Conversion tracking events
export const trackFormSubmit = (formType: string, data: Record<string, unknown>) => {
  // Google Analytics
  event('form_submit', {
    form_type: formType,
    service_type: data.serviceType,
    destination: data.destino,
    origin: data.origem,
  });

  // Facebook Pixel
  fbEvent('Lead', {
    content_name: formType,
    content_category: data.serviceType,
    value: 1,
    currency: 'USD',
  });
};

export const trackQuoteRequest = (data: Record<string, unknown>) => {
  // Google Analytics
  event('generate_lead', {
    currency: 'USD',
    value: 1,
    service_type: data.serviceType,
    destination: data.destino,
  });

  // Facebook Pixel
  fbEvent('InitiateCheckout', {
    content_name: 'Quote Request',
    content_category: data.serviceType,
    value: 1,
    currency: 'USD',
  });
};

export const trackPageView = (pageName: string) => {
  // Google Analytics
  event('page_view', {
    page_title: pageName,
  });

  // Facebook Pixel
  fbEvent('PageView');
};

export const trackButtonClick = (buttonName: string, location: string) => {
  // Google Analytics
  event('click', {
    event_category: 'engagement',
    event_label: buttonName,
    page_location: location,
  });
};

export const trackWhatsAppClick = () => {
  // Google Analytics
  event('contact', {
    method: 'whatsapp',
  });

  // Facebook Pixel
  fbEvent('Contact', {
    method: 'whatsapp',
  });
};

export const trackPhoneClick = () => {
  // Google Analytics
  event('contact', {
    method: 'phone',
  });

  // Facebook Pixel
  fbEvent('Contact', {
    method: 'phone',
  });
};

// Track conversion events
export const trackConversion = (email: string, eventType: string, services: string[]): Promise<boolean> => {
  return new Promise((resolve) => {
    try {
      // Google Analytics
      event('conversion', {
        event_type: eventType,
        email: email,
        services: services.join(','),
        value: 1,
      });

      // Facebook Pixel
      fbEvent('Purchase', {
        content_type: 'lead',
        content_ids: services,
        value: 1,
        currency: 'USD',
      });

      resolve(true);
    } catch (error) {
      console.error('Error tracking conversion:', error);
      resolve(false);
    }
  });
};