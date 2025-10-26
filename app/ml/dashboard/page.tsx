import CostSavingsDashboard from '@/components/ml/CostSavingsDashboard';

export const metadata = {
  title: 'ML Cost Savings Dashboard | Fly2Any',
  description: 'Real-time analytics and cost savings from ML-powered flight search optimization',
};

export default function MLDashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
      <CostSavingsDashboard
        period="7d"
        autoRefresh={true}
        refreshInterval={300} // 5 minutes
      />
    </div>
  );
}
