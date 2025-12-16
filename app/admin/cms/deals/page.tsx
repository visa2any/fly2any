/**
 * CMS Deals — Admin
 */
import { Zap, Plus, Calendar, Tag } from 'lucide-react';

export const metadata = {
  title: 'Deals CMS | Admin | Fly2Any',
};

export default function DealsPage() {
  const deals = [
    { id: 1, title: 'Winter Europe Sale', discount: '25%', routes: 'US → Europe', validUntil: 'Jan 31', status: 'active' },
    { id: 2, title: 'Early Bird Asia', discount: '$200 off', routes: 'US → Asia', validUntil: 'Feb 15', status: 'active' },
    { id: 3, title: 'Caribbean Escape', discount: '30%', routes: 'US → Caribbean', validUntil: 'Dec 31', status: 'ending' },
    { id: 4, title: 'Business Class Upgrade', discount: '40%', routes: 'All Routes', validUntil: 'Jan 15', status: 'draft' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Deals</h1>
          <p className="text-sm text-gray-500">Manage promotional deals and offers</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800">
          <Plus className="h-4 w-4" /> New Deal
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {deals.map(deal => (
          <div key={deal.id} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                <h3 className="font-semibold text-gray-900">{deal.title}</h3>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                deal.status === 'active' ? 'bg-green-100 text-green-700' :
                deal.status === 'ending' ? 'bg-orange-100 text-orange-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {deal.status}
              </span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Tag className="h-4 w-4" />
                <span>{deal.discount}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <span className="text-gray-400">Routes:</span>
                <span>{deal.routes}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>Valid until {deal.validUntil}</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 flex gap-3">
              <button className="text-xs text-gray-500 hover:text-gray-900">Edit</button>
              <button className="text-xs text-gray-500 hover:text-gray-900">Preview</button>
              <button className="text-xs text-red-500 hover:text-red-700">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
