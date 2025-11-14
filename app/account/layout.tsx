import { ReactNode } from 'react';
import { AccountLayoutClient } from '@/components/account/AccountLayoutClient';

export const metadata = {
  title: 'My Account - Fly2Any',
  description: 'Manage your account, saved searches, price alerts, and bookings',
};

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <AccountLayoutClient>
      {children}
    </AccountLayoutClient>
  );
}
