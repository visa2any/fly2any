'use client';

/**
 * Email Unsubscribe Page
 *
 * Handles email unsubscription requests from marketing emails.
 * - One-click unsubscribe
 * - Preference management option
 * - GDPR/CAN-SPAM compliant
 */

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Mail, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleUnsubscribe = async () => {
    if (!email) {
      setStatus('error');
      setMessage('Invalid unsubscribe link. Please contact support.');
      return;
    }

    setStatus('loading');

    try {
      const res = await fetch('/api/newsletter/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (data.success) {
        setStatus('success');
        setMessage('You have been successfully unsubscribed from our emails.');
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to unsubscribe. Please try again.');
      }
    } catch (err) {
      setStatus('error');
      setMessage('Something went wrong. Please try again later.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          {/* Logo */}
          <Link href="/" className="inline-block mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Fly2Any</h1>
          </Link>

          {status === 'idle' && (
            <>
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-gray-500" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Unsubscribe from Emails
              </h2>
              <p className="text-gray-600 mb-6">
                {email ? (
                  <>
                    Click below to unsubscribe <strong>{email}</strong> from our marketing emails.
                  </>
                ) : (
                  'No email address provided.'
                )}
              </p>
              {email && (
                <button
                  onClick={handleUnsubscribe}
                  className="w-full py-3 px-4 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Unsubscribe
                </button>
              )}
            </>
          )}

          {status === 'loading' && (
            <>
              <Loader2 className="w-12 h-12 animate-spin text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Processing your request...</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Unsubscribed Successfully
              </h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <p className="text-sm text-gray-500">
                Changed your mind?{' '}
                <Link href="/" className="text-blue-600 hover:underline">
                  Resubscribe anytime
                </Link>
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Something Went Wrong
              </h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <button
                onClick={() => setStatus('idle')}
                className="px-6 py-2 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Try Again
              </button>
            </>
          )}

          <div className="mt-8 pt-6 border-t border-gray-100">
            <Link
              href="/"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Back to Fly2Any
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          Need help? Contact us at{' '}
          <a href="mailto:support@fly2any.com" className="underline">
            support@fly2any.com
          </a>
        </p>
      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      }
    >
      <UnsubscribeContent />
    </Suspense>
  );
}
