'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';

export function TawkToChat() {
  const pathname = usePathname();

  // Don't render on Admin or Agent routes (optional refinement, but good practice)
  const isExcluded = pathname?.startsWith('/admin') || pathname?.startsWith('/agent');

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
