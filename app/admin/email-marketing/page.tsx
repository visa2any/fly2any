/**
 * Email Marketing Dashboard — Admin
 */
import { MailPlus, Send, Eye, MousePointer, TrendingUp } from 'lucide-react';

export const metadata = {
  title: 'Email Marketing | Admin | Fly2Any',
};

export default function EmailMarketingPage() {
  const stats = [
    { label: 'Total Subscribers', value: '24,892', change: '+1,247', icon: MailPlus },
    { label: 'Emails Sent (30d)', value: '156K', change: '+23%', icon: Send },
    { label: 'Avg Open Rate', value: '42.3%', change: '+2.1%', icon: Eye },
    { label: 'Avg Click Rate', value: '8.7%', change: '+0.9%', icon: MousePointer },
  ];

  const campaigns = [
    { name: 'Weekly Deals Newsletter', status: 'scheduled', date: 'Tomorrow 9AM', recipients: 18500 },
    { name: 'Flash Sale - Europe', status: 'draft', date: '-', recipients: 8200 },
    { name: 'VIP Early Access', status: 'sent', date: 'Dec 14', recipients: 1240 },
    { name: 'Holiday Travel Guide', status: 'sent', date: 'Dec 12', recipients: 22100 },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Marketing</h1>
          <p className="text-sm text-gray-500">Campaign management and analytics</p>
        </div>
        <button className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800">
          New Campaign
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="bg-white rounded-xl p-5 border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <s.icon className="h-5 w-5 text-gray-400" />
              <span className="text-xs font-medium text-green-600">{s.change}</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Campaigns</h2>
          <div className="flex gap-2">
            {['All', 'Scheduled', 'Draft', 'Sent'].map(f => (
              <button key={f} className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg">
                {f}
              </button>
            ))}
          </div>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">Campaign</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">Status</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">Date</th>
              <th className="px-5 py-3 text-right text-xs font-medium text-gray-500">Recipients</th>
              <th className="px-5 py-3 text-right text-xs font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {campaigns.map((c, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-5 py-4 text-sm font-medium text-gray-900">{c.name}</td>
                <td className="px-5 py-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    c.status === 'sent' ? 'bg-green-100 text-green-700' :
                    c.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {c.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-sm text-gray-600">{c.date}</td>
                <td className="px-5 py-4 text-sm text-gray-600 text-right">{c.recipients.toLocaleString()}</td>
                <td className="px-5 py-4 text-right">
                  <button className="text-xs text-gray-500 hover:text-gray-900">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
