/**
 * CMS Email Templates — Admin
 */
import { Mail, Plus, Copy, Eye } from 'lucide-react';

export const metadata = {
  title: 'Email Templates CMS | Admin | Fly2Any',
};

export default function EmailTemplatesPage() {
  const templates = [
    { id: 1, name: 'Booking Confirmation', type: 'transactional', lastModified: '2 days ago', status: 'active' },
    { id: 2, name: 'Welcome Email', type: 'transactional', lastModified: '1 week ago', status: 'active' },
    { id: 3, name: 'Password Reset', type: 'transactional', lastModified: '3 weeks ago', status: 'active' },
    { id: 4, name: 'Weekly Newsletter', type: 'marketing', lastModified: '1 day ago', status: 'active' },
    { id: 5, name: 'Flash Sale Announcement', type: 'marketing', lastModified: '5 days ago', status: 'active' },
    { id: 6, name: 'Abandoned Cart', type: 'automation', lastModified: '2 weeks ago', status: 'active' },
    { id: 7, name: 'Price Drop Alert', type: 'automation', lastModified: '1 month ago', status: 'draft' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Templates</h1>
          <p className="text-sm text-gray-500">Manage email templates and designs</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800">
          <Plus className="h-4 w-4" /> New Template
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        {['All', 'Transactional', 'Marketing', 'Automation'].map(f => (
          <button key={f} className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg">
            {f}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">Template</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">Type</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">Status</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">Last Modified</th>
              <th className="px-5 py-3 text-right text-xs font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {templates.map(t => (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">{t.name}</span>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    t.type === 'transactional' ? 'bg-blue-100 text-blue-700' :
                    t.type === 'marketing' ? 'bg-purple-100 text-purple-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                    {t.type}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    t.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {t.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-sm text-gray-600">{t.lastModified}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded" title="Preview">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded" title="Duplicate">
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
