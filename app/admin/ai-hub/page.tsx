/**
 * AI Intelligence Hub — Admin Page
 */

import AIAdminDashboard from '@/components/admin/AIAdminDashboard';

export const metadata = {
  title: 'AI Intelligence Hub | Admin | Fly2Any',
  description: 'Real-time AI operations monitoring and control',
};

export default function AIHubPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <AIAdminDashboard />
    </div>
  );
}
