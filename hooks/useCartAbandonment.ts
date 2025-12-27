/**
 * Cart Abandonment Tracking Hook
 * Tracks when users leave checkout without completing booking
 *
 * @version 1.0.0
 */

'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';

interface CartItem {
  type: 'flight' | 'hotel' | 'car' | 'tour' | 'activity' | 'transfer';
  title: string;
  subtitle?: string;
  price: number;
  details: Record<string, any>;
}

interface UseCartAbandonmentProps {
  cartItems: CartItem[];
  cartValue: number;
  currency?: string;
  checkoutStep: number;
  source: 'flights' | 'hotels' | 'journey' | 'cars' | 'tours';
  userEmail?: string;
  userName?: string;
  enabled?: boolean;
}

const N8N_WEBHOOK_URL = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || '/api/webhooks/n8n';

/**
 * Hook to track cart abandonment for recovery workflows
 */
export function useCartAbandonment({
  cartItems,
  cartValue,
  currency = 'USD',
  checkoutStep,
  source,
  userEmail,
  userName,
  enabled = true,
}: UseCartAbandonmentProps) {
  const { data: session } = useSession();
  const hasTracked = useRef(false);
  const lastCartValue = useRef(cartValue);

  // Get session ID for anonymous users
  const getSessionId = useCallback(() => {
    if (typeof window === 'undefined') return '';

    let sessionId = sessionStorage.getItem('fly2any_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      sessionStorage.setItem('fly2any_session_id', sessionId);
    }
    return sessionId;
  }, []);

  // Track abandonment event
  const trackAbandonment = useCallback(async () => {
    if (!enabled || hasTracked.current || cartItems.length === 0) return;

    const email = userEmail || session?.user?.email;
    if (!email) return; // Need email for recovery

    hasTracked.current = true;

    try {
      const payload = {
        type: 'cart_abandoned',
        data: {
          userId: session?.user?.id,
          email,
        },
        metadata: {
          sessionId: getSessionId(),
          firstName: userName || session?.user?.name?.split(' ')[0],
          cartItems,
          cartValue,
          currency,
          checkoutStep,
          source,
          abandonedAt: new Date().toISOString(),
          url: typeof window !== 'undefined' ? window.location.href : '',
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        },
      };

      // Use sendBeacon for reliability on page unload
      if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
        navigator.sendBeacon(N8N_WEBHOOK_URL, JSON.stringify(payload));
      } else {
        await fetch(N8N_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          keepalive: true,
        });
      }

      console.log('[CartAbandonment] Tracked successfully');
    } catch (error) {
      console.error('[CartAbandonment] Failed to track:', error);
    }
  }, [
    enabled,
    cartItems,
    cartValue,
    currency,
    checkoutStep,
    source,
    userEmail,
    userName,
    session,
    getSessionId,
  ]);

  // Reset tracking when cart value changes significantly
  useEffect(() => {
    if (Math.abs(cartValue - lastCartValue.current) > 10) {
      hasTracked.current = false;
      lastCartValue.current = cartValue;
    }
  }, [cartValue]);

  // Track on page unload (beforeunload + visibilitychange)
  useEffect(() => {
    if (!enabled || cartItems.length === 0) return;

    const handleBeforeUnload = () => {
      trackAbandonment();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        trackAbandonment();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, cartItems.length, trackAbandonment]);

  // Mark as completed (call when booking is successful)
  const markCompleted = useCallback(() => {
    hasTracked.current = true; // Prevent abandonment tracking
    sessionStorage.removeItem('fly2any_cart_tracked');
  }, []);

  return {
    trackAbandonment,
    markCompleted,
  };
}

/**
 * Standalone function to track abandonment without hook
 */
export async function trackCartAbandonment(data: {
  email: string;
  userId?: string;
  firstName?: string;
  cartItems: CartItem[];
  cartValue: number;
  currency?: string;
  checkoutStep: number;
  source: 'flights' | 'hotels' | 'journey' | 'cars' | 'tours';
}): Promise<void> {
  try {
    const payload = {
      type: 'cart_abandoned',
      data: {
        userId: data.userId,
        email: data.email,
      },
      metadata: {
        firstName: data.firstName,
        cartItems: data.cartItems,
        cartValue: data.cartValue,
        currency: data.currency || 'USD',
        checkoutStep: data.checkoutStep,
        source: data.source,
        abandonedAt: new Date().toISOString(),
      },
    };

    await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error('[CartAbandonment] Track failed:', error);
  }
}
