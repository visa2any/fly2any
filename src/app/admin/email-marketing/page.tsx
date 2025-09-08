'use client';

// Redirect stub - the main functionality is now in v2
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function EmailMarketingRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the new v2 system
    router.replace('/admin/email-marketing/v2');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to Email Marketing v2...</p>
      </div>
    </div>
  );
}