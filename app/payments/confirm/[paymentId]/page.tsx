import { Suspense } from 'react';
import ClientPage from './ClientPage';

// Required for static export (mobile builds)
// Generate a placeholder path for static export
// Real data will be fetched client-side via API
export async function generateStaticParams() {
  return [{ paymentId: 'placeholder' }];
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 border-8 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-2">Loading...</h1>
          <p className="text-gray-600">Please wait</p>
        </div>
      </div>
    }>
      <ClientPage />
    </Suspense>
  );
}
