/**
 * CMS Destinations — Admin
 */
import { MapPin, Plus, Image, Globe } from 'lucide-react';

export const metadata = {
  title: 'Destinations CMS | Admin | Fly2Any',
};

export default function DestinationsPage() {
  const destinations = [
    { id: 1, name: 'Paris', country: 'France', image: '/destinations/paris.jpg', pages: 5, status: 'published' },
    { id: 2, name: 'Tokyo', country: 'Japan', image: '/destinations/tokyo.jpg', pages: 4, status: 'published' },
    { id: 3, name: 'New York', country: 'USA', image: '/destinations/nyc.jpg', pages: 6, status: 'published' },
    { id: 4, name: 'Dubai', country: 'UAE', image: '/destinations/dubai.jpg', pages: 3, status: 'draft' },
    { id: 5, name: 'London', country: 'UK', image: '/destinations/london.jpg', pages: 5, status: 'published' },
    { id: 6, name: 'Sydney', country: 'Australia', image: '/destinations/sydney.jpg', pages: 2, status: 'draft' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Destinations</h1>
          <p className="text-sm text-gray-500">Manage destination pages and content</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800">
          <Plus className="h-4 w-4" /> Add Destination
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {destinations.map(dest => (
          <div key={dest.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition">
            <div className="h-32 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
              <Image className="h-8 w-8 text-gray-400" />
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{dest.name}</h3>
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                  dest.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {dest.status}
                </span>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
                <Globe className="h-3.5 w-3.5" />
                <span>{dest.country}</span>
              </div>
              <div className="text-xs text-gray-400">{dest.pages} content pages</div>
              <div className="mt-3 pt-3 border-t border-gray-100 flex gap-3">
                <button className="text-xs text-gray-500 hover:text-gray-900">Edit</button>
                <button className="text-xs text-gray-500 hover:text-gray-900">Preview</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
