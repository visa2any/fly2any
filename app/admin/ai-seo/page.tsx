/**
 * AI SEO Dashboard Admin Page
 */

import AISEODashboard from '@/components/admin/AISEODashboard';

export const metadata = {
  title: 'AI SEO Engine | Admin | Fly2Any',
  description: 'Autonomous SEO optimization dashboard',
};

export default function AISEOPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <AISEODashboard />
    </div>
  );
}
