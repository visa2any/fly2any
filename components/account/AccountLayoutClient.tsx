'use client';

import { ReactNode, useEffect, useState } from 'react';
import { AccountSidebar } from './AccountSidebar';

interface AccountLayoutClientProps {
  children: ReactNode;
}

export function AccountLayoutClient({ children }: AccountLayoutClientProps) {
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [activeAlerts, setActiveAlerts] = useState(0);

  // Fetch notification and alert counts
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        // Fetch unread notifications count
        const notificationsRes = await fetch('/api/notifications?unreadOnly=true&limit=1');
        if (notificationsRes.ok) {
          const data = await notificationsRes.json();
          setUnreadNotifications(data.total || 0);
        }

        // Fetch active alerts count
        const alertsRes = await fetch('/api/price-alerts?activeOnly=true');
        if (alertsRes.ok) {
          const data = await alertsRes.json();
          setActiveAlerts(data.alerts?.length || 0);
        }
      } catch (error) {
        console.error('Failed to fetch counts:', error);
      }
    };

    fetchCounts();

    // Refresh counts every 30 seconds
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AccountSidebar
        unreadNotifications={unreadNotifications}
        activeAlerts={activeAlerts}
      />

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
