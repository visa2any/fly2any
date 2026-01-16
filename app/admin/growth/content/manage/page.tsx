'use client';

import { useState, useEffect } from 'react';
import { Calendar, Send, Trash2, RefreshCw, Check, X } from 'lucide-react';

interface ContentItem {
  id: string;
  type: string;
  title: string;
  content: string;
  platforms: string[];
  scheduledAt: string;
  status: string;
  postedAt?: string;
  error?: string;
}

export default function ContentManagePage() {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchContent = async () => {
    try {
      const res = await fetch('/api/admin/content');
      const data = await res.json();
      setContent(data.content || []);
    } catch (error) {
      console.error('Failed to fetch content:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateContent = async (type: string) => {
    setGenerating(true);
    try {
      const res = await fetch('/api/admin/content/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchContent();
      }
    } catch (error) {
      console.error('Failed to generate:', error);
    } finally {
      setGenerating(false);
    }
  };

  const deleteContent = async (id: string) => {
    try {
      await fetch(`/api/admin/content?id=${id}`, { method: 'DELETE' });
      await fetchContent();
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  useEffect(() => { fetchContent(); }, []);

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    posted: 'bg-green-100 text-green-800',
    partial: 'bg-orange-100 text-orange-800',
    failed: 'bg-red-100 text-red-800',
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Content Queue</h1>
        <button onClick={fetchContent} className="p-2 hover:bg-gray-100 rounded-lg">
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {['deal', 'guide', 'twitter', 'blog'].map(type => (
          <button
            key={type}
            onClick={() => generateContent(type)}
            disabled={generating}
            className="px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 font-semibold"
          >
            Generate {type}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : content.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No content in queue</div>
      ) : (
        <div className="space-y-4">
          {content.map(item => (
            <div key={item.id} className="border rounded-lg p-4 bg-white">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold">{item.title}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${statusColors[item.status as keyof typeof statusColors]}`}>
                      {item.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{item.content.slice(0, 200)}...</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(item.scheduledAt).toLocaleString()}
                    </span>
                    <span>Platforms: {item.platforms.join(', ')}</span>
                  </div>
                </div>
                <button onClick={() => deleteContent(item.id)} className="p-2 hover:bg-red-50 rounded text-red-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              {item.error && (
                <div className="mt-2 p-2 bg-red-50 text-red-700 text-sm rounded">
                  Error: {item.error}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
