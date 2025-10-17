import { Suspense } from 'react';
import BookingConfirmationContent from './BookingConfirmationContent';

// Force dynamic rendering since this page relies on search params
export const dynamic = 'force-dynamic';

export default function BookingConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-full mb-4 animate-pulse">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-700">Loading your confirmation...</h1>
        </div>
      </div>
    }>
      <BookingConfirmationContent />
    </Suspense>
  );
}
