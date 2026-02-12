import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Host Dashboard | Fly2Any',
  description: 'Manage your properties, track bookings, and optimize your revenue with the Fly2Any host dashboard.',
};

export default function HostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
