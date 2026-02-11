'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';

export function TawkChat() {
  const [scriptError, setScriptError] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    // Suppress Tawk.to cross-origin script errors from error monitoring
    // CORS-blocked errors have lineno=0, colno=0 - we can't see/fix them anyway
    // Suppress Tawk.to specific errors
    const originalOnError = window.onerror;
    window.onerror = function(message, source, lineno, colno, error) {
      // 1. Suppress CORS-blocked errors (lineno=0, colno=0) from Tawk.to
      if (source?.includes('tawk.to') && lineno === 0 && colno === 0) {
        return true;
      }
      
      // 2. Suppress specific internal Tawk.to runtime errors
      // "TypeError: t.$_Tawk.i18next is not a function"
      if (
        (typeof message === 'string' && message.includes('$_Tawk.i18next')) ||
        (error && error.message && error.message.includes('$_Tawk.i18next'))
      ) {
        console.warn('[TawkChat] Suppressed internal Tawk.to error:', message);
        return true;
      }

      if (originalOnError) {
        return originalOnError.call(window, message, source, lineno, colno, error);
      }
      return false;
    };

    // 3. Catch Promise rejections (common for async Tawk code)
    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
       const reason = event.reason;
       if (
        (reason && typeof reason === 'object' && (reason.stack?.includes('tawk.to') || reason.message?.includes('$_Tawk'))) ||
        (reason && typeof reason === 'string' && (reason.includes('tawk.to') || reason.includes('$_Tawk')))
       ) {
         event.preventDefault(); // Prevent runtime error overlay
         console.warn('[TawkChat] Suppressed unhandled Tawk.to rejection:', reason);
       }
    };
    window.addEventListener('unhandledrejection', onUnhandledRejection);

    // Set a timeout to detect if script fails to load
    const timeout = setTimeout(() => {
      if (!scriptLoaded && !scriptError) {
        console.warn('[TawkChat] Script load timeout - widget may not be available');
      }
    }, 10000); // 10 second timeout

    return () => {
      clearTimeout(timeout);
      window.onerror = originalOnError; // Restore original handler
      window.removeEventListener('unhandledrejection', onUnhandledRejection);
    };
  }, [scriptLoaded, scriptError]);

  if (scriptError) {
    // Fail silently - don't show chat widget if script fails
    return null;
  }

  return (
    <Script
      id="tawk-to-chat"
      strategy="afterInteractive"
      onLoad={() => {
        console.log('[TawkChat] Script loaded successfully');
        setScriptLoaded(true);
      }}
      onError={(e) => {
        console.error('[TawkChat] Script failed to load:', e);
        setScriptError(true);
      }}
      dangerouslySetInnerHTML={{
        __html: `
try {
  var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
  // Force minimize on load to prevent blocking UI
  Tawk_API.onLoad = function(){
    Tawk_API.minimize();
  };
  (function(){
    var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
    s1.async=true;
    s1.src='https://embed.tawk.to/69790e11e8a60a197e63995c/1jg0dttmh';
    s1.charset='UTF-8';
    s1.setAttribute('crossorigin','*');
    s1.onerror = function() {
      console.error('[TawkChat] Failed to load Tawk.to embed script');
    };
    s0.parentNode.insertBefore(s1,s0);
  })();
} catch (error) {
  console.error('[TawkChat] Error initializing Tawk.to:', error);
}
        `,
      }}
    />
  );
}
