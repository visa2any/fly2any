import type { Metadata } from 'next';
import HostSidebar from '@/components/host/HostSidebar';
import { HostHeader } from '@/components/host/HostHeader';

export const metadata: Metadata = {
  title: 'Host Dashboard | Fly2Any',
  description: 'Manage your properties, bookings, and availability on Fly2Any.',
};

export default function HostLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen bg-[#FDFDFD] flex overflow-hidden">
      <HostSidebar />
      <div className="flex-1 flex flex-col min-w-0 md:pl-20">
        <HostHeader exitHref="/" exitLabel="Back to Fly2Any" />
        <main className="flex-1 overflow-y-auto custom-scrollbar bg-[#FDFDFD] relative pb-24 md:pb-0">
          {children}
        </main>
      </div>
    </div>
  );
}
