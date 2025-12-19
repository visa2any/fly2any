'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, RefreshCw, Mail, ArrowRight, Clock, XCircle } from 'lucide-react';

const errorMessages: Record<string, { title: string; message: string; icon: typeof AlertCircle }> = {
  missing_token: {
    title: 'Invalid Link',
    message: 'The verification link is incomplete. Please check your email and try clicking the link again.',
    icon: XCircle,
  },
  invalid_token: {
    title: 'Link Not Found',
    message: 'This verification link is invalid or has already been used. You may already be subscribed.',
    icon: AlertCircle,
  },
  expired: {
    title: 'Link Expired',
    message: 'This verification link has expired. Please subscribe again to receive a new confirmation email.',
    icon: Clock,
  },
  server_error: {
    title: 'Something Went Wrong',
    message: 'We encountered an issue processing your request. Please try again in a few moments.',
    icon: AlertCircle,
  },
};

export default function NewsletterErrorPage() {
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason') || 'server_error';
  const errorInfo = errorMessages[reason] || errorMessages.server_error;
  const ErrorIcon = errorInfo.icon;

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-orange-50 flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-rose-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl" />
      </div>

      <div
        className={`relative max-w-lg w-full transition-all duration-700 ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        {/* Error Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-rose-500/10 border border-white/50 overflow-hidden">

          {/* Error Icon */}
          <div className="pt-12 pb-6 flex justify-center">
            <div className={`relative transition-all duration-500 delay-300 ${
              mounted ? 'scale-100' : 'scale-0'
            }`}>
              <div className="absolute inset-0 bg-rose-400/20 rounded-full blur-xl" />
              <div className="relative w-24 h-24 bg-gradient-to-br from-rose-400 to-rose-600 rounded-full flex items-center justify-center shadow-lg shadow-rose-500/30">
                <ErrorIcon className="w-12 h-12 text-white" strokeWidth={2} />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-8 pb-8 text-center">
            <h1 className={`text-2xl md:text-3xl font-bold text-gray-900 mb-3 transition-all duration-500 delay-500 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              {errorInfo.title}
            </h1>

            <p className={`text-gray-600 mb-8 transition-all duration-500 delay-600 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              {errorInfo.message}
            </p>

            {/* Actions */}
            <div className={`space-y-3 transition-all duration-500 delay-700 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              {reason === 'expired' ? (
                <Link
                  href="/#newsletter"
                  className="inline-flex items-center justify-center gap-2 w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg shadow-primary-500/25 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                >
                  <RefreshCw className="w-5 h-5" />
                  Subscribe Again
                </Link>
              ) : (
                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg shadow-primary-500/25 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                >
                  Go to Homepage
                  <ArrowRight className="w-5 h-5" />
                </Link>
              )}

              <Link
                href="mailto:support@fly2any.com"
                className="inline-flex items-center justify-center gap-2 w-full bg-gray-100 text-gray-700 font-medium py-3 px-6 rounded-xl hover:bg-gray-200 transition-colors"
              >
                <Mail className="w-5 h-5" />
                Contact Support
              </Link>
            </div>
          </div>
        </div>

        {/* Help text */}
        <p className={`text-center text-sm text-gray-500 mt-6 transition-all duration-500 delay-1000 ${
          mounted ? 'opacity-100' : 'opacity-0'
        }`}>
          Need help? We're here 24/7 at <a href="mailto:support@fly2any.com" className="text-primary-600 hover:underline">support@fly2any.com</a>
        </p>
      </div>
    </main>
  );
}
