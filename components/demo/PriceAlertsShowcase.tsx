'use client';

/**
 * Price Alerts Feature Showcase
 *
 * This component demonstrates all the price alert components in action.
 * Use this for testing, demonstration, or as a visual reference.
 *
 * To view: Create a page at app/demo/price-alerts/page.tsx and render this component
 */

import { useState } from 'react';
import { Bell, Info } from 'lucide-react';
import PriceAlertCard from '@/components/account/PriceAlertCard';
import CreatePriceAlert from '@/components/search/CreatePriceAlert';
import PriceAlertNotification from '@/components/account/PriceAlertNotification';
import { PriceAlert } from '@/lib/types/price-alerts';

// Mock data for demonstration
const mockAlerts: PriceAlert[] = [
  {
    id: '1',
    userId: 'user1',
    origin: 'JFK',
    destination: 'LAX',
    departDate: '2025-12-15',
    returnDate: '2025-12-22',
    currentPrice: 450,
    targetPrice: 350,
    currency: 'USD',
    active: true,
    triggered: true,
    lastChecked: new Date(Date.now() - 3600000), // 1 hour ago
    triggeredAt: new Date(Date.now() - 1800000), // 30 min ago
    lastNotifiedAt: new Date(Date.now() - 1800000),
    notificationCount: 1,
    createdAt: new Date(Date.now() - 86400000 * 7), // 7 days ago
    updatedAt: new Date(Date.now() - 3600000),
  },
  {
    id: '2',
    userId: 'user1',
    origin: 'SFO',
    destination: 'MIA',
    departDate: '2025-12-20',
    returnDate: null,
    currentPrice: 320,
    targetPrice: 250,
    currency: 'USD',
    active: true,
    triggered: false,
    lastChecked: new Date(Date.now() - 7200000), // 2 hours ago
    triggeredAt: null,
    lastNotifiedAt: null,
    notificationCount: 0,
    createdAt: new Date(Date.now() - 86400000 * 5), // 5 days ago
    updatedAt: new Date(Date.now() - 7200000),
  },
  {
    id: '3',
    userId: 'user1',
    origin: 'ORD',
    destination: 'SEA',
    departDate: '2026-01-10',
    returnDate: '2026-01-17',
    currentPrice: 380,
    targetPrice: 300,
    currency: 'USD',
    active: false,
    triggered: false,
    lastChecked: new Date(Date.now() - 86400000), // 1 day ago
    triggeredAt: null,
    lastNotifiedAt: null,
    notificationCount: 0,
    createdAt: new Date(Date.now() - 86400000 * 3), // 3 days ago
    updatedAt: new Date(Date.now() - 86400000),
  },
];

export function PriceAlertsShowcase() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showNotification, setShowNotification] = useState(true);
  const [alerts, setAlerts] = useState(mockAlerts);

  const handleToggleActive = (id: string, active: boolean) => {
    console.log('Toggle active:', id, active);
    setAlerts(prev =>
      prev.map(alert =>
        alert.id === id ? { ...alert, active } : alert
      )
    );
  };

  const handleDelete = (id: string) => {
    console.log('Delete alert:', id);
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const triggeredAlerts = alerts.filter(a => a.triggered);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Bell className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-gray-900">
              Price Alerts Showcase
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Interactive demonstration of all price alert components
          </p>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-blue-900 mb-2">
                Demo Mode
              </h3>
              <p className="text-blue-700 mb-2">
                This showcase uses mock data and simulated interactions. All components are
                fully functional and ready for integration.
              </p>
              <p className="text-sm text-blue-600">
                Click buttons to interact with components. State changes are logged to console.
              </p>
            </div>
          </div>
        </div>

        {/* Component Sections */}
        <div className="space-y-12">
          {/* Section 1: Notification Component */}
          <section>
            <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    1. Price Alert Notification
                  </h2>
                  <p className="text-gray-600">
                    Floating notification that appears when price alerts are triggered
                  </p>
                </div>
                <button
                  onClick={() => setShowNotification(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700"
                >
                  Show Notification
                </button>
              </div>

              <div className="relative h-48 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center">
                <p className="text-gray-500">
                  Click "Show Notification" to see the component in the top-right corner
                </p>
              </div>

              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-mono text-gray-700">
                  File: components/account/PriceAlertNotification.tsx
                </p>
              </div>
            </div>
          </section>

          {/* Section 2: Create Alert Modal */}
          <section>
            <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    2. Create Price Alert Modal
                  </h2>
                  <p className="text-gray-600">
                    Modal dialog for creating new price alerts from flight results
                  </p>
                </div>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 flex items-center gap-2"
                >
                  <Bell className="w-5 h-5" />
                  Open Modal
                </button>
              </div>

              <div className="relative h-48 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center">
                <p className="text-gray-500">
                  Click "Open Modal" to see the create alert dialog
                </p>
              </div>

              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-mono text-gray-700">
                  File: components/search/CreatePriceAlert.tsx
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: Price Alert Cards */}
          <section>
            <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  3. Price Alert Cards
                </h2>
                <p className="text-gray-600">
                  Individual cards showing alert details, status, and actions
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {alerts.map(alert => (
                  <PriceAlertCard
                    key={alert.id}
                    alert={alert}
                    onToggleActive={handleToggleActive}
                    onDelete={handleDelete}
                  />
                ))}
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-mono text-gray-700">
                  File: components/account/PriceAlertCard.tsx
                </p>
              </div>
            </div>
          </section>

          {/* Section 4: Status Examples */}
          <section>
            <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                4. Status Color Guide
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Triggered */}
                <div className="p-6 bg-gradient-to-br from-green-50 to-white rounded-xl border-2 border-green-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                      <Bell className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-green-900">Triggered</h3>
                      <p className="text-sm text-green-700">Price met target</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-gray-700">bg-green-100</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 border-2 border-green-400 rounded-full"></div>
                      <span className="text-gray-700">border-green-300</span>
                    </div>
                  </div>
                </div>

                {/* Active */}
                <div className="p-6 bg-gradient-to-br from-yellow-50 to-white rounded-xl border-2 border-yellow-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
                      <Bell className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-yellow-900">Active</h3>
                      <p className="text-sm text-yellow-700">Monitoring price</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-gray-700">bg-yellow-100</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 border-2 border-yellow-400 rounded-full"></div>
                      <span className="text-gray-700">border-yellow-300</span>
                    </div>
                  </div>
                </div>

                {/* Inactive */}
                <div className="p-6 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-gray-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gray-400 rounded-xl flex items-center justify-center">
                      <Bell className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Inactive</h3>
                      <p className="text-sm text-gray-700">Paused by user</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                      <span className="text-gray-700">bg-gray-100</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 border-2 border-gray-400 rounded-full"></div>
                      <span className="text-gray-700">border-gray-300</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 5: Integration Info */}
          <section>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border-2 border-blue-200 shadow-lg p-8">
              <h2 className="text-2xl font-bold text-blue-900 mb-4">
                Integration & Documentation
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-blue-900 mb-2">Files Created</h3>
                  <ul className="space-y-1 text-sm text-blue-700">
                    <li>✓ app/account/alerts/page.tsx</li>
                    <li>✓ components/account/PriceAlertCard.tsx</li>
                    <li>✓ components/account/PriceAlertNotification.tsx</li>
                    <li>✓ components/search/CreatePriceAlert.tsx</li>
                    <li>✓ lib/types/price-alerts.ts</li>
                    <li>✓ components/flights/FlightCardWithPriceAlert.tsx</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-blue-900 mb-2">Documentation</h3>
                  <ul className="space-y-1 text-sm text-blue-700">
                    <li>✓ docs/PRICE_ALERTS_IMPLEMENTATION.md</li>
                    <li>✓ docs/PRICE_ALERTS_QUICK_REFERENCE.md</li>
                    <li>✓ docs/TEAM2_PRICE_ALERTS_DELIVERY.md</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Modals */}
      {showNotification && triggeredAlerts.length > 0 && (
        <PriceAlertNotification
          triggeredAlerts={triggeredAlerts}
          onDismiss={() => setShowNotification(false)}
          onViewAlerts={() => {
            console.log('Navigate to /account/alerts');
            setShowNotification(false);
          }}
        />
      )}

      <CreatePriceAlert
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        flightData={{
          origin: 'NYC',
          destination: 'LAX',
          departDate: '2025-12-15',
          returnDate: '2025-12-22',
          currentPrice: 450,
          currency: 'USD',
        }}
        onSuccess={(alert) => {
          console.log('Alert created:', alert);
          setShowCreateModal(false);
        }}
      />
    </div>
  );
}

export default PriceAlertsShowcase;
