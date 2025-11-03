import { Metadata } from 'next';
import PerformanceDashboard from '@/components/admin/PerformanceDashboard';

export const metadata: Metadata = {
  title: 'Performance Dashboard | Admin - Fly2Any',
  description: 'Web Vitals performance monitoring dashboard for Fly2Any platform',
};

/**
 * Performance Monitoring Admin Page
 *
 * Displays real-time Web Vitals metrics and historical performance trends.
 * Access this page at: /admin/performance
 *
 * Features:
 * - Real-time Core Web Vitals monitoring
 * - Historical trends with sparklines
 * - Color-coded performance ratings
 * - Auto-refresh capability
 * - Local data persistence
 */
export default function PerformancePage() {
  return <PerformanceDashboard />;
}
