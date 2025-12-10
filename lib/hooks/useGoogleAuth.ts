'use client';

import { useEffect, useCallback, useState, useRef } from 'react';
import { signIn } from 'next-auth/react';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: GoogleInitConfig) => void;
          prompt: (callback?: (notification: PromptNotification) => void) => void;
          renderButton: (element: HTMLElement, config: GoogleButtonConfig) => void;
          cancel: () => void;
        };
      };
    };
  }
}

interface GoogleInitConfig {
  client_id: string;
  callback: (response: GoogleCredentialResponse) => void;
  auto_select?: boolean;
  cancel_on_tap_outside?: boolean;
  context?: 'signin' | 'signup' | 'use';
  ux_mode?: 'popup' | 'redirect';
  itp_support?: boolean;
}

interface GoogleButtonConfig {
  type?: 'standard' | 'icon';
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  shape?: 'rectangular' | 'pill' | 'circle' | 'square';
  logo_alignment?: 'left' | 'center';
  width?: number;
  locale?: string;
}

interface GoogleCredentialResponse {
  credential: string;
  select_by: string;
  clientId?: string;
}

interface PromptNotification {
  isDisplayMoment: () => boolean;
  isDisplayed: () => boolean;
  isNotDisplayed: () => boolean;
  getNotDisplayedReason: () => string;
  isSkippedMoment: () => boolean;
  getSkippedReason: () => string;
  isDismissedMoment: () => boolean;
  getDismissedReason: () => string;
  getMomentType: () => string;
}

interface UseGoogleAuthOptions {
  callbackUrl?: string;
  context?: 'signin' | 'signup';
  enableOneTap?: boolean;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export function useGoogleAuth(options: UseGoogleAuthOptions = {}) {
  const {
    callbackUrl = '/account',
    context = 'signin',
    enableOneTap = true,
    onSuccess,
    onError,
  } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const initializedRef = useRef(false);

  // Handle Google credential response
  const handleCredentialResponse = useCallback(async (response: GoogleCredentialResponse) => {
    setIsLoading(true);
    try {
      // Use NextAuth to sign in with the Google credential
      const result = await signIn('google', {
        callbackUrl,
        redirect: false,
      });

      if (result?.error) {
        onError?.(result.error);
        setIsLoading(false);
      } else if (result?.url) {
        onSuccess?.();
        // Redirect to callback URL
        window.location.href = result.url;
      }
    } catch (error) {
      onError?.('Failed to sign in with Google');
      setIsLoading(false);
    }
  }, [callbackUrl, onSuccess, onError]);

  // Load Google Identity Services script
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      console.warn('NEXT_PUBLIC_GOOGLE_CLIENT_ID is not configured');
      return;
    }

    if (document.getElementById('google-identity-services')) {
      setIsScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-identity-services';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => setIsScriptLoaded(true);
    document.head.appendChild(script);

    return () => {
      // Cleanup on unmount
      window.google?.accounts?.id?.cancel();
    };
  }, []);

  // Initialize Google Identity Services
  useEffect(() => {
    if (!isScriptLoaded || !GOOGLE_CLIENT_ID || initializedRef.current) return;

    const initGoogle = () => {
      if (!window.google?.accounts?.id) return;

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
        context: context === 'signup' ? 'signup' : 'signin',
        ux_mode: 'popup',
        itp_support: true,
      });

      // Show One Tap prompt if enabled
      if (enableOneTap) {
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed()) {
            console.log('One Tap not displayed:', notification.getNotDisplayedReason());
          }
        });
      }

      initializedRef.current = true;
    };

    // Small delay to ensure script is fully loaded
    const timer = setTimeout(initGoogle, 100);
    return () => clearTimeout(timer);
  }, [isScriptLoaded, handleCredentialResponse, context, enableOneTap]);

  // Handle sign in with redirect (most reliable for OAuth)
  const signInWithPopup = useCallback(async () => {
    setIsLoading(true);
    try {
      // Use NextAuth's signIn with redirect - most reliable approach
      await signIn('google', { callbackUrl });
    } catch (error) {
      console.error('Google sign-in error:', error);
      onError?.('Failed to sign in with Google');
      setIsLoading(false);
    }
  }, [callbackUrl, onError]);

  // Fallback redirect-based sign in
  const signInWithRedirect = useCallback(async () => {
    setIsLoading(true);
    try {
      await signIn('google', { callbackUrl });
    } catch (error) {
      onError?.('Failed to sign in with Google');
      setIsLoading(false);
    }
  }, [callbackUrl, onError]);

  return {
    isLoading,
    isScriptLoaded,
    signInWithPopup,
    signInWithRedirect,
    isConfigured: !!GOOGLE_CLIENT_ID,
  };
}
