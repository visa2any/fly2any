'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

/**
 * Popup Callback Page
 * Handles OAuth callback in popup window and sends message to parent
 */
export default function PopupCallbackPage() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'loading') return;

    // Send message to parent window
    if (window.opener) {
      if (status === 'authenticated' && session) {
        window.opener.postMessage(
          { type: 'GOOGLE_AUTH_SUCCESS', user: session.user },
          window.location.origin
        );
        // Auto-close after short delay
        setTimeout(() => window.close(), 500);
      } else if (status === 'unauthenticated') {
        // Check if there was an error in URL
        const params = new URLSearchParams(window.location.search);
        const error = params.get('error');

        if (error) {
          window.opener.postMessage(
            { type: 'GOOGLE_AUTH_ERROR', error },
            window.location.origin
          );
          setTimeout(() => window.close(), 1500);
        }
      }
    }
  }, [status, session]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-sm">
        {status === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-800">Signing you in...</h2>
            <p className="text-sm text-gray-500 mt-2">Please wait while we complete authentication.</p>
          </>
        )}

        {status === 'authenticated' && (
          <>
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-800">Success!</h2>
            <p className="text-sm text-gray-500 mt-2">This window will close automatically.</p>
          </>
        )}

        {status === 'unauthenticated' && (
          <>
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-800">Authentication Failed</h2>
            <p className="text-sm text-gray-500 mt-2">Please try again.</p>
            <button
              onClick={() => window.close()}
              className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium"
            >
              Close Window
            </button>
          </>
        )}
      </div>
    </div>
  );
}
