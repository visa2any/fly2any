'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

/**
 * Ultra-minimal Popup Callback - Level 6 UX
 * Instantly communicates with parent and closes - no visible UI delay
 */
export default function PopupCallbackPage() {
  const { data: session, status } = useSession();
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (sent || status === 'loading') return;

    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');

    if (window.opener) {
      if (error) {
        // Error case - notify parent immediately
        window.opener.postMessage({ type: 'GOOGLE_AUTH_ERROR', error }, window.location.origin);
        setSent(true);
        window.close();
      } else if (status === 'authenticated' && session) {
        // Success - instant close
        window.opener.postMessage({ type: 'GOOGLE_AUTH_SUCCESS', user: session.user }, window.location.origin);
        setSent(true);
        window.close();
      }
    }
  }, [status, session, sent]);

  // Minimal branded loading - only visible briefly during OAuth redirect
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="w-10 h-10 border-3 border-[#E74035] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="mt-4 text-sm text-gray-500 font-medium">Completing sign in...</p>
      </div>
    </div>
  );
}
