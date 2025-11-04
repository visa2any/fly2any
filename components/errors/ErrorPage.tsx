'use client';

import React from 'react';
import { AlertCircle, RefreshCcw, Home, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ErrorPageProps {
  title?: string;
  message?: string;
  statusCode?: number;
  showRefresh?: boolean;
  showHome?: boolean;
  showBack?: boolean;
  onRefresh?: () => void;
}

/**
 * ErrorPage - Full page error display
 *
 * Features:
 * - Customizable title and message
 * - Multiple action buttons (refresh, home, back)
 * - Status code display
 * - User-friendly design
 *
 * Usage:
 * <ErrorPage
 *   title="Page Not Found"
 *   message="The page you're looking for doesn't exist."
 *   statusCode={404}
 *   showHome
 *   showBack
 * />
 */
export default function ErrorPage({
  title = 'Something went wrong',
  message = "We're sorry, but something unexpected happened. Please try again.",
  statusCode,
  showRefresh = true,
  showHome = true,
  showBack = false,
  onRefresh,
}: ErrorPageProps) {
  const router = useRouter();

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      window.location.reload();
    }
  };

  const handleHome = () => {
    router.push('/');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border-2 border-gray-200 p-8 md:p-12 text-center">
          {/* Error Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-12 h-12 text-red-600" />
              </div>
              {statusCode && (
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  {statusCode}
                </div>
              )}
            </div>
          </div>

          {/* Error Message */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {title}
            </h1>
            <p className="text-lg text-gray-600 max-w-lg mx-auto">
              {message}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {showRefresh && (
              <button
                onClick={handleRefresh}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <RefreshCcw className="w-5 h-5" />
                Refresh Page
              </button>
            )}
            {showHome && (
              <button
                onClick={handleHome}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-gray-900 font-semibold rounded-xl border-2 border-gray-300 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <Home className="w-5 h-5" />
                Go Home
              </button>
            )}
            {showBack && (
              <button
                onClick={handleBack}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-gray-900 font-semibold rounded-xl border-2 border-gray-300 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <ArrowLeft className="w-5 h-5" />
                Go Back
              </button>
            )}
          </div>

          {/* Support Link */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Need assistance?{' '}
              <a
                href="mailto:support@fly2any.com"
                className="text-blue-600 hover:text-blue-700 underline font-medium"
              >
                Contact our support team
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
