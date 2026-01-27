'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

export function TawkToChat() {
  const pathname = usePathname();
  const { data: session } = useSession();

  // Don't render on Admin or Agent routes
  const isExcluded = pathname?.startsWith('/admin') || pathname?.startsWith('/agent');

  // Set visitor information when user is logged in
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!session?.user) return;

    const setVisitorInfo = () => {
      if (window.Tawk_API?.setAttributes) {
        window.Tawk_API.setAttributes(
          {
            name: session.user.name || 'Guest',
            email: session.user.email || '',
            // hash: '', // TODO: Add secure hash in production
          },
          (error) => {
            if (error) {
              console.error('Tawk.to setAttributes error:', error);
            }
          }
        );

        // Add custom event with user ID
        if (window.Tawk_API.addEvent) {
          window.Tawk_API.addEvent('user_identified', {
            userId: session.user.id,
            // Add more custom fields as needed:
            // loyaltyTier: session.user.loyaltyTier,
            // totalBookings: session.user.totalBookings,
          });
        }
      }
    };

    // Try to set immediately if Tawk already loaded
    if (window.Tawk_API) {
      setVisitorInfo();
    }

    // Also set on load event
    const originalOnLoad = window.Tawk_API?.onLoad;
    if (window.Tawk_API) {
      window.Tawk_API.onLoad = function() {
        if (originalOnLoad) originalOnLoad();
        setVisitorInfo();
      };
    }

    // Fallback: try again after delay
    const timeout = setTimeout(setVisitorInfo, 2000);

    return () => clearTimeout(timeout);
  }, [session]);

  // Listen for chat end events and sync to database
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const setupChatListeners = () => {
      if (window.Tawk_API) {
        // Store original callback if it exists
        const originalOnChatEnded = window.Tawk_API.onChatEnded;

        // Override with our handler
        window.Tawk_API.onChatEnded = function() {
          // Call original callback if it existed
          if (originalOnChatEnded) originalOnChatEnded();

          // Send chat data to our API
          const chatData = {
            event: 'chat:end',
            chatId: `tawk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            time: {
              end: new Date().toISOString(),
            },
            visitor: {
              name: session?.user?.name || 'Anonymous',
              email: session?.user?.email,
              userId: session?.user?.id,
            },
          };

          // Send to our API endpoint
          fetch('/api/webhooks/tawk', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(chatData),
          }).catch((error) => {
            console.error('Failed to sync chat transcript:', error);
          });

          console.log('[Tawk.to] Chat ended, syncing to database');
        };
      }
    };

    // Try to setup immediately
    if (window.Tawk_API) {
      setupChatListeners();
    }

    // Also setup on load
    const originalOnLoad = window.Tawk_API?.onLoad;
    if (window.Tawk_API) {
      const prevOnLoad = originalOnLoad;
      window.Tawk_API.onLoad = function() {
        if (prevOnLoad) prevOnLoad();
        setupChatListeners();
      };
    }

    // Fallback: try again after delay
    const timeout = setTimeout(setupChatListeners, 3000);

    return () => clearTimeout(timeout);
  }, [session]);

  if (isExcluded) return null;

  return (
    <Script
      id="tawk-to-widget"
      strategy="lazyOnload"
    >
      {`
        var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
        (function(){
        var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
        s1.async=true;
        s1.src='https://embed.tawk.to/69790e11e8a60a197e63995c/1jg0dttmh';
        s1.charset='UTF-8';
        s1.setAttribute('crossorigin','*');
        s0.parentNode.insertBefore(s1,s0);
        })();
      `}
    </Script>
  );
}
