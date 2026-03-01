import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import HostSidebar from '@/components/host/HostSidebar';
import { HostHeader } from '@/components/host/HostHeader';
import { GlobalErrorBoundary } from '@/components/error/GlobalErrorBoundary';

export const metadata: Metadata = {
  title: 'Host Dashboard | Fly2Any',
  description: 'Manage your properties, bookings, and availability on Fly2Any.',
};

export default async function HostLayout({ children }: { children: React.ReactNode }) {
  // Defense-in-depth: server-side auth guard (middleware handles edge cases)
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/auth/signin?callbackUrl=/host/dashboard');
  }

  return (
    <GlobalErrorBoundary>
      <div className="h-screen overflow-hidden bg-neutral-50 flex flex-col text-gray-900 relative">
        <HostHeader exitHref="/" exitLabel="Back to Fly2Any" />
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row relative">
          <HostSidebar />
          <main className="flex-1 h-full overflow-y-auto custom-scrollbar relative bg-neutral-50/50 transition-all duration-300">
            {children}
          </main>
        </div>
      </div>
    </GlobalErrorBoundary>
  );
}
