'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Shield, ArrowLeft, Home } from 'lucide-react';

function AccessDeniedContent() {
  const searchParams = useSearchParams();
  const message = searchParams.get('message') || 'You do not have permission to access this resource';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
            <Shield className="w-10 h-10 text-red-600" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Access Denied
        </h1>

        {/* Message */}
        <p className="text-gray-600 mb-8">
          {message}
        </p>

        {/* Description */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 text-left">
          <p className="text-sm text-gray-700">
            <strong className="text-red-700">Admin Access Required</strong>
            <br />
            This area is restricted to administrators only. If you believe you should have access, please contact your system administrator.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Link
            href="/account"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go to My Account
          </Link>

          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors"
          >
            <Home className="w-4 h-4" />
            Go to Homepage
          </Link>
        </div>

        {/* Help */}
        <p className="mt-8 text-sm text-gray-500">
          Need help?{' '}
          <a href="mailto:support@fly2any.com" className="text-primary-600 hover:text-primary-700 font-medium">
            Contact Support
          </a>
        </p>
      </div>
    </div>
  );
}

export default function AccessDeniedPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
          <div className="text-gray-600">Loading...</div>
        </div>
      }
    >
      <AccessDeniedContent />
    </Suspense>
  );
}
