/**
 * Campaigns Dashboard — Admin
 */
import { Target, Zap, TrendingUp, DollarSign, Users } from 'lucide-react';

export const metadata = {
  title: 'Campaigns | Admin | Fly2Any',
};

export default function CampaignsPage() {
  const stats = [
    { label: 'Active Campaigns', value: '12', icon: Target },
    { label: 'Total Reach', value: '847K', icon: Users },
    { label: 'Conversion Rate', value: '3.8%', icon: TrendingUp },
    { label: 'Revenue Generated', value: '$124K', icon: DollarSign },
  ];

  const campaigns = [
    { name: 'Winter Sale 2024', type: 'Promo', status: 'active', budget: 5000, spent: 3200, conversions: 847, roi: 4.2 },
    { name: 'New Year Flash', type: 'Flash', status: 'scheduled', budget: 2000, spent: 0, conversions: 0, roi: 0 },
    { name: 'Europe Explorer', type: 'Destination', status: 'active', budget: 3000, spent: 1800, conversions: 234, roi: 3.1 },
    { name: 'VIP Exclusive', type: 'Loyalty', status: 'active', budget: 1000, spent: 890, conversions: 156, roi: 5.8 },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
          <p className="text-sm text-gray-500">Marketing campaigns and promotions</p>
        </div>
        <button className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800">
          Create Campaign
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="bg-white rounded-xl p-5 border border-gray-100">
            <s.icon className="h-5 w-5 text-gray-400 mb-3" />
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">All Campaigns</h2>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">Campaign</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">Type</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">Status</th>
              <th className="px-5 py-3 text-right text-xs font-medium text-gray-500">Budget</th>
              <th className="px-5 py-3 text-right text-xs font-medium text-gray-500">Spent</th>
              <th className="px-5 py-3 text-right text-xs font-medium text-gray-500">Conversions</th>
              <th className="px-5 py-3 text-right text-xs font-medium text-gray-500">ROI</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {campaigns.map((c, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-5 py-4 text-sm font-medium text-gray-900">{c.name}</td>
                <td className="px-5 py-4 text-sm text-gray-600">{c.type}</td>
                <td className="px-5 py-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    c.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {c.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-sm text-gray-600 text-right">${c.budget.toLocaleString()}</td>
                <td className="px-5 py-4 text-sm text-gray-600 text-right">${c.spent.toLocaleString()}</td>
                <td className="px-5 py-4 text-sm text-gray-600 text-right">{c.conversions}</td>
                <td className="px-5 py-4 text-sm font-medium text-gray-900 text-right">{c.roi}x</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
