import type { Metadata } from 'next';
import HostSidebar from '@/components/host/HostSidebar';
import { HostHeader } from '@/components/host/HostHeader';

export const metadata: Metadata = {
  title: 'Host Dashboard | Fly2Any',
  description: 'Manage your properties, bookings, and availability on Fly2Any.',
};

export default function HostLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen overflow-hidden bg-neutral-50 flex flex-col text-gray-900 relative">
      <HostHeader exitHref="/" exitLabel="Back to Fly2Any" />
      <div className="flex-1 overflow-hidden flex flex-col md:flex-row relative">
        <HostSidebar />
        <main className="flex-1 h-full overflow-y-auto custom-scrollbar relative bg-neutral-50/50 transition-all duration-300">
          {children}
        </main>
      </div>
    </div>
  );
}
