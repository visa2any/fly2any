'use client';

import Script from 'next/script';

export function TawkChat() {
  return (
    <Script
      id="tawk-to-chat"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
(function(){
var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
s1.async=true;
s1.src='https://embed.tawk.to/69790e11e8a60a197e63995c/1jg0dttmh';
s1.charset='UTF-8';
s1.setAttribute('crossorigin','*');
s0.parentNode.insertBefore(s1,s0);
})();
        `,
      }}
    />
  );
}
