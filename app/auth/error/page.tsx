'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, ArrowLeft, Mail, RefreshCw } from 'lucide-react';
import { Suspense, useEffect, useState } from 'react';

// Error messages for different NextAuth error codes
const errorMessages: Record<string, { title: string; message: string; action?: string }> = {
  Configuration: {
    title: 'Authentication Not Available',
    message: 'This sign-in method is not configured. Please use email and password to sign in.',
    action: 'signin',
  },
  AccessDenied: {
    title: 'Access Denied',
    message: 'You do not have permission to sign in with this account.',
    action: 'signin',
  },
  Verification: {
    title: 'Verification Failed',
    message: 'The verification link may have expired or already been used.',
    action: 'signin',
  },
  OAuthSignin: {
    title: 'Sign In Error',
    message: 'There was a problem starting the sign-in process. Please try again.',
    action: 'retry',
  },
  OAuthCallback: {
    title: 'Sign In Error',
    message: 'There was a problem completing the sign-in. Please try again.',
    action: 'retry',
  },
  OAuthCreateAccount: {
    title: 'Account Creation Failed',
    message: 'Could not create your account. Please try signing up with email instead.',
    action: 'signup',
  },
  EmailCreateAccount: {
    title: 'Account Creation Failed',
    message: 'Could not create your account. Please try again.',
    action: 'signup',
  },
  Callback: {
    title: 'Sign In Error',
    message: 'There was an error during sign-in. Please try again.',
    action: 'retry',
  },
  OAuthAccountNotLinked: {
    title: 'Account Already Exists',
    message: 'An account with this email already exists. Please sign in with your original method.',
    action: 'signin',
  },
  EmailSignin: {
    title: 'Email Sign In Failed',
    message: 'Could not send the verification email. Please check your email address.',
    action: 'signin',
  },
  CredentialsSignin: {
    title: 'Invalid Credentials',
    message: 'The email or password you entered is incorrect.',
    action: 'signin',
  },
  SessionRequired: {
    title: 'Sign In Required',
    message: 'Please sign in to access this page.',
    action: 'signin',
  },
  Default: {
    title: 'Authentication Error',
    message: 'An unexpected error occurred. Please try again.',
    action: 'retry',
  },
};

function ErrorContent() {
  const searchParams = useSearchParams();
  const errorCode = searchParams.get('error') || 'Default';
  const errorInfo = errorMessages[errorCode] || errorMessages.Default;
  const [isPopup, setIsPopup] = useState(false);

  useEffect(() => {
    // Detect if in popup window
    setIsPopup(window.opener !== null);

    // If in popup, notify parent of error
    if (window.opener) {
      window.opener.postMessage({
        type: 'GOOGLE_AUTH_ERROR',
        error: errorInfo.message
      }, window.location.origin);
    }
  }, [errorInfo.message]);

  // In popup mode, show minimal error and auto-close option
  if (isPopup) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">{errorInfo.title}</h2>
          <p className="text-sm text-gray-600 mb-4">{errorInfo.message}</p>
          <button
            onClick={() => window.close()}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm"
          >
            Close Window
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="text-3xl font-bold text-[#E74035]">Fly2Any</span>
          </Link>
        </div>

        {/* Error Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Error Icon */}
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>

          {/* Error Title */}
          <h1 className="text-2xl font-semibold text-gray-900 text-center mb-3">
            {errorInfo.title}
          </h1>

          {/* Error Message */}
          <p className="text-gray-600 text-center mb-8">
            {errorInfo.message}
          </p>

          {/* Action Buttons */}
          <div className="space-y-3">
            {errorInfo.action === 'signin' && (
              <Link
                href="/auth/signin"
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#E74035] hover:bg-[#D63930] text-white font-medium rounded-xl transition-colors"
              >
                <Mail className="w-5 h-5" />
                Sign In with Email
              </Link>
            )}

            {errorInfo.action === 'signup' && (
              <Link
                href="/auth/signup"
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#E74035] hover:bg-[#D63930] text-white font-medium rounded-xl transition-colors"
              >
                Create Account
              </Link>
            )}

            {errorInfo.action === 'retry' && (
              <button
                onClick={() => window.history.back()}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#E74035] hover:bg-[#D63930] text-white font-medium rounded-xl transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
                Try Again
              </button>
            )}

            <Link
              href="/"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </Link>
          </div>

          {/* Help Text */}
          <p className="text-sm text-gray-500 text-center mt-6">
            Need help?{' '}
            <a href="mailto:support@fly2any.com" className="text-[#E74035] hover:underline">
              Contact Support
            </a>
          </p>
        </div>

        {/* Error Code (for debugging) */}
        {process.env.NODE_ENV === 'development' && (
          <p className="text-xs text-gray-400 text-center mt-4">
            Error Code: {errorCode}
          </p>
        )}
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E74035]"></div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
}
