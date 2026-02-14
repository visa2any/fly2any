import type { Metadata } from 'next';
import HostSidebar from '@/components/host/HostSidebar';

export const metadata: Metadata = {
  title: 'Host Dashboard | Fly2Any',
  description: 'Manage your properties, bookings, and availability on Fly2Any.',
};

export default function HostLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-50">
      <HostSidebar />
      {/* Main content — offset by sidebar width on desktop */}
      <div className="md:ml-64 pb-20 md:pb-0">
        {children}
      </div>
    </div>
  );
}
