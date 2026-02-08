'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';

export function TawkChat() {
  const [scriptError, setScriptError] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    // Set a timeout to detect if script fails to load
    const timeout = setTimeout(() => {
      if (!scriptLoaded && !scriptError) {
        console.warn('[TawkChat] Script load timeout - widget may not be available');
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
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
