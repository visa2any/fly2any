'use client';

import { signIn } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Suspense } from 'react';

function PopupSignInContent() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const callbackUrl = searchParams.get('callbackUrl') || '/account';

  useEffect(() => {
    // Automatically initiate Google signin when popup opens
    const initiateSignIn = async () => {
      try {
        // Redirect to popup-callback after Google auth completes
        await signIn('google', {
          callbackUrl: `/auth/popup-callback?finalUrl=${encodeURIComponent(callbackUrl)}`,
          redirect: true,
        });
      } catch (err) {
        setError('Failed to start sign-in. Please try again.');
        // Notify parent window of error
        if (window.opener) {
          window.opener.postMessage({ type: 'GOOGLE_AUTH_ERROR', error: 'signin_failed' }, window.location.origin);
          setTimeout(() => window.close(), 2000);
        }
      }
    };

    initiateSignIn();
  }, [callbackUrl]);

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-xl">!</span>
          </div>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.close()}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#E74035] mx-auto mb-4" />
        <p className="text-gray-600 font-medium">Connecting to Google...</p>
        <p className="text-gray-400 text-sm mt-2">Please wait</p>
      </div>
    </div>
  );
}

export default function PopupSignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#E74035]" />
      </div>
    }>
      <PopupSignInContent />
    </Suspense>
  );
}
