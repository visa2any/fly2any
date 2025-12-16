/**
 * UNIFIED ANALYTICS - Single Source of Truth
 * Consolidates GA4 + custom tracking, eliminates duplication
 * @version 1.0.0
 */

import { gtag } from './google-analytics';

// Single session ID for all tracking
const SESSION_KEY = 'fly2any_sid';

export function getSessionId(): string {
  if (typeof window === 'undefined') return 'server';
  let sid = sessionStorage.getItem(SESSION_KEY);
  if (!sid) {
    sid = `s_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    sessionStorage.setItem(SESSION_KEY, sid);
  }
  return sid;
}

// Core tracking functions - sends to GA4 only (single source)
export const analytics = {
  // Search
  search(origin: string, dest: string, date: string, pax: number, cabin?: string) {
    gtag('event', 'search_flights', {
      origin, destination: dest, depart_date: date, passengers: pax, cabin_class: cabin,
      session_id: getSessionId()
    });
  },

  // Results
  results(count: number, origin: string, dest: string) {
    gtag('event', 'view_search_results', {
      search_term: `${origin}-${dest}`, result_count: count, session_id: getSessionId()
    });
  },

  // Flight interactions
  viewFlight(id: string, airline: string, price: number, currency = 'USD') {
    gtag('event', 'view_item', {
      currency, value: price,
      items: [{ item_id: id, item_brand: airline, price }],
      session_id: getSessionId()
    });
  },

  selectFlight(id: string, airline: string, price: number, currency = 'USD') {
    gtag('event', 'select_item', {
      currency, value: price,
      items: [{ item_id: id, item_brand: airline, price }],
      session_id: getSessionId()
    });
  },

  // Booking funnel
  beginCheckout(route: string, price: number, pax: number, currency = 'USD') {
    gtag('event', 'begin_checkout', {
      currency, value: price,
      items: [{ item_id: route, quantity: pax, price }],
      session_id: getSessionId()
    });
  },

  addPaymentInfo(route: string, price: number, currency = 'USD') {
    gtag('event', 'add_payment_info', {
      currency, value: price, session_id: getSessionId()
    });
  },

  purchase(bookingId: string, route: string, price: number, pax: number, currency = 'USD') {
    gtag('event', 'purchase', {
      transaction_id: bookingId, currency, value: price,
      items: [{ item_id: route, quantity: pax, price }],
      session_id: getSessionId()
    });
  },

  // Lead capture
  lead(source: string, value = 5) {
    gtag('event', 'generate_lead', { currency: 'USD', value, source, session_id: getSessionId() });
  },

  priceAlert(origin: string, dest: string, targetPrice: number) {
    gtag('event', 'create_price_alert', {
      origin, destination: dest, target_price: targetPrice, session_id: getSessionId()
    });
  },

  // Auth
  signUp(method = 'email') {
    gtag('event', 'sign_up', { method, session_id: getSessionId() });
  },

  login(method = 'email') {
    gtag('event', 'login', { method, session_id: getSessionId() });
  },

  // Custom event (catch-all)
  track(name: string, params?: Record<string, any>) {
    gtag('event', name, { ...params, session_id: getSessionId() });
  },

  // User properties
  setUser(props: Record<string, any>) {
    gtag('set', 'user_properties', props);
  }
};

export default analytics;
