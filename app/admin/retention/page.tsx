/**
 * Retention Dashboard — Admin
 */
import { HeartPulse, TrendingUp, Users, RefreshCw, Mail, Bell } from 'lucide-react';

export const metadata = {
  title: 'Retention | Admin | Fly2Any',
};

export default function RetentionPage() {
  const metrics = [
    { label: 'Retention Rate', value: '68%', change: '+3.2%', icon: HeartPulse },
    { label: 'Churn Rate', value: '4.2%', change: '-0.8%', icon: TrendingUp },
    { label: 'Repeat Customers', value: '2,847', change: '+156', icon: Users },
    { label: 'Win-backs', value: '342', change: '+28', icon: RefreshCw },
  ];

  const campaigns = [
    { name: 'Inactive 30d Re-engagement', status: 'active', sent: 1240, opened: 42, converted: 8 },
    { name: 'Birthday Offer', status: 'active', sent: 89, opened: 67, converted: 23 },
    { name: 'Loyalty Milestone', status: 'active', sent: 456, opened: 51, converted: 12 },
    { name: 'Abandoned Cart Recovery', status: 'active', sent: 2100, opened: 38, converted: 15 },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Retention</h1>
          <p className="text-sm text-gray-500">Customer lifecycle and retention analytics</p>
        </div>
        <button className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800">
          Create Campaign
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <div key={i} className="bg-white rounded-xl p-5 border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <m.icon className="h-5 w-5 text-gray-400" />
              <span className={`text-xs font-medium ${m.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                {m.change}
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{m.value}</div>
            <div className="text-xs text-gray-500 mt-1">{m.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Active Retention Campaigns</h2>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">Campaign</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">Status</th>
              <th className="px-5 py-3 text-right text-xs font-medium text-gray-500">Sent</th>
              <th className="px-5 py-3 text-right text-xs font-medium text-gray-500">Open Rate</th>
              <th className="px-5 py-3 text-right text-xs font-medium text-gray-500">Conversion</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {campaigns.map((c, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-5 py-4 text-sm font-medium text-gray-900">{c.name}</td>
                <td className="px-5 py-4">
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                    {c.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-sm text-gray-600 text-right">{c.sent.toLocaleString()}</td>
                <td className="px-5 py-4 text-sm text-gray-600 text-right">{c.opened}%</td>
                <td className="px-5 py-4 text-sm font-medium text-gray-900 text-right">{c.converted}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
