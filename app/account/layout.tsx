import { ReactNode } from 'react';

export const metadata = {
  title: 'My Account - Fly2Any',
  description: 'Manage your account, saved searches, price alerts, and bookings',
};

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}
