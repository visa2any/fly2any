'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { toast } from 'react-hot-toast';

/**
 * Error Toast Listener Component
 * 
 * Listens for specific error parameters in the URL and shows a user-friendly toast.
 * This ensures that when a user is redirected (e.g., from /admin due to db issues),
 * they understand why they are back on the homepage.
 */
function ErrorToastHandler() {
  const searchParams = useSearchParams()!;
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const error = searchParams.get('error');
    
    if (error === 'database_error') {
      // Show a premium, user-friendly error message
      toast.error(
        'Our database is catching its breath! Please try accessing the admin panel again in a few moments. (Error: DB_WAKEUP)',
        {
          duration: 6000,
          id: 'database-error-toast', // Prevent multiple toasts for same error
        }
      );

      // Clean up the URL after showing the toast to avoid re-triggering on refresh
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.delete('error');
      
      const newUrl = newParams.toString() 
        ? `${pathname}?${newParams.toString()}` 
        : pathname;
        
      router.replace(newUrl, { scroll: false });
    }
  }, [searchParams, router, pathname]);

  return null;
}

export function ErrorToastListener() {
  return (
    <Suspense fallback={null}>
      <ErrorToastHandler />
    </Suspense>
  );
}

export default ErrorToastListener;
