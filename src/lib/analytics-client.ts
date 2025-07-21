'use client';

// Cliente analytics sem tracking pixels
export class AnalyticsClient {
  private initialized = false;

  init() {
    if (this.initialized) return;
    
    // Log sem tracking pixels
    console.log('No tracking pixels configured - skipping initialization');
    this.initialized = true;
  }

  track(event: string, properties?: Record<string, unknown>) {
    // Apenas log local, sem envio para serviços externos
    console.log(`📊 Analytics: ${event}`, properties);
  }

  identify(userId: string, traits?: Record<string, unknown>) {
    console.log(`👤 User identified: ${userId}`, traits);
  }

  page(name: string, properties?: Record<string, unknown>) {
    console.log(`📄 Page view: ${name}`, properties);
  }
}

export const analytics = new AnalyticsClient();