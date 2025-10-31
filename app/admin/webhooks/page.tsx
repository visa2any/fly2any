'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Webhook,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  Filter,
  Search,
  Calendar,
  Activity,
  TrendingUp,
  ArrowLeft,
  Eye,
  RotateCw,
} from 'lucide-react';

interface WebhookEvent {
  id: string;
  event_type: string;
  event_data: any;
  status: 'received' | 'processing' | 'processed' | 'failed';
  error_message?: string;
  retry_count: number;
  received_at: string;
  processed_at?: string;
  created_at: string;
}

interface WebhookStats {
  total: number;
  processed: number;
  failed: number;
  processing: number;
  received: number;
  recentEvents: Array<{ type: string; count: number }>;
}

type StatusFilter = 'all' | 'received' | 'processing' | 'processed' | 'failed';

export default function AdminWebhooksPage() {
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [stats, setStats] = useState<WebhookStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<WebhookEvent | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [retrying, setRetrying] = useState<string | null>(null);

  useEffect(() => {
    fetchWebhooks();
  }, [statusFilter]);

  const fetchWebhooks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await fetch(`/api/admin/webhooks?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch webhooks');
      }

      const data = await response.json();
      setEvents(data.events || []);
      setStats(data.stats || null);
    } catch (error) {
      console.error('Error fetching webhooks:', error);
    } finally {
      setLoading(false);
    }
  };

  const retryEvent = async (eventId: string) => {
    try {
      setRetrying(eventId);
      const response = await fetch('/api/admin/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, action: 'retry' }),
      });

      if (!response.ok) {
        throw new Error('Failed to retry event');
      }

      // Refresh list
      await fetchWebhooks();
      alert('Event processed successfully!');
    } catch (error) {
      console.error('Error retrying event:', error);
      alert('Failed to retry event. Check console for details.');
    } finally {
      setRetrying(null);
    }
  };

  const filteredEvents = events.filter(event => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      event.id.toLowerCase().includes(term) ||
      event.event_type.toLowerCase().includes(term) ||
      event.error_message?.toLowerCase().includes(term)
    );
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      received: 'bg-blue-100 text-blue-800 border-blue-300',
      processing: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      processed: 'bg-green-100 text-green-800 border-green-300',
      failed: 'bg-red-100 text-red-800 border-red-300',
    };

    const icons = {
      received: <Clock className="w-3 h-3" />,
      processing: <RefreshCw className="w-3 h-3 animate-spin" />,
      processed: <CheckCircle2 className="w-3 h-3" />,
      failed: <XCircle className="w-3 h-3" />,
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${styles[status as keyof typeof styles]}`}>
        {icons[status as keyof typeof icons]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getEventTypeColor = (type: string) => {
    if (type.includes('payment')) return 'text-green-600 bg-green-50';
    if (type.includes('order')) return 'text-blue-600 bg-blue-50';
    if (type.includes('cancel')) return 'text-red-600 bg-red-50';
    if (type.includes('change')) return 'text-orange-600 bg-orange-50';
    return 'text-gray-600 bg-gray-50';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 p-2.5 shadow-lg">
                <Webhook className="w-7 h-7 text-white" />
              </div>
              Webhook Events
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Monitor and manage Duffel webhook events
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchWebhooks}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 disabled:bg-gray-100 text-gray-700 font-semibold rounded-lg transition-colors shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>

            <Link
              href="/admin"
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-blue-600" />
                <p className="text-xs font-semibold text-gray-600">Total Events</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>

            <div className="bg-white rounded-lg border border-green-200 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <p className="text-xs font-semibold text-gray-600">Processed</p>
              </div>
              <p className="text-2xl font-bold text-green-700">{stats.processed}</p>
            </div>

            <div className="bg-white rounded-lg border border-red-200 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-4 h-4 text-red-600" />
                <p className="text-xs font-semibold text-gray-600">Failed</p>
              </div>
              <p className="text-2xl font-bold text-red-700">{stats.failed}</p>
            </div>

            <div className="bg-white rounded-lg border border-yellow-200 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-yellow-600" />
                <p className="text-xs font-semibold text-gray-600">Processing</p>
              </div>
              <p className="text-2xl font-bold text-yellow-700">{stats.processing}</p>
            </div>

            <div className="bg-white rounded-lg border border-blue-200 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <p className="text-xs font-semibold text-gray-600">Success Rate</p>
              </div>
              <p className="text-2xl font-bold text-blue-700">
                {stats.total > 0 ? Math.round((stats.processed / stats.total) * 100) : 0}%
              </p>
            </div>
          </div>
        )}

        {/* Recent Event Types */}
        {stats && stats.recentEvents.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-600" />
              Last 24 Hours Activity
            </h3>
            <div className="flex flex-wrap gap-2">
              {stats.recentEvents.map((event) => (
                <div
                  key={event.type}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg"
                >
                  <span className="text-sm font-medium text-gray-700">{event.type}</span>
                  <span className="text-xs font-semibold text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                    {event.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by ID, event type, or error message..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-600" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="all">All Status</option>
                <option value="received">Received</option>
                <option value="processing">Processing</option>
                <option value="processed">Processed</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Events Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Event ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Retries
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Received At
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Processed At
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center">
                      <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
                      <p className="text-gray-600 font-medium">Loading webhook events...</p>
                    </td>
                  </tr>
                ) : filteredEvents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center">
                      <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 font-medium">No webhook events found</p>
                      <p className="text-gray-500 text-sm mt-1">
                        {searchTerm
                          ? 'Try adjusting your search criteria'
                          : 'Webhook events will appear here when received from Duffel'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredEvents.map((event) => (
                    <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-mono text-xs text-gray-600 truncate max-w-[150px]">
                          {event.id}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${getEventTypeColor(event.event_type)}`}>
                          {event.event_type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(event.status)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-700">
                          {event.retry_count > 0 ? (
                            <span className="text-orange-600 font-semibold">{event.retry_count}</span>
                          ) : (
                            <span className="text-gray-400">0</span>
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs text-gray-600">
                          {new Date(event.received_at).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs text-gray-600">
                          {event.processed_at
                            ? new Date(event.processed_at).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : '-'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <button
                          onClick={() => setSelectedEvent(event)}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded transition-colors"
                        >
                          <Eye className="w-3 h-3" />
                          View
                        </button>
                        {event.status === 'failed' && (
                          <button
                            onClick={() => retryEvent(event.id)}
                            disabled={retrying === event.id}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white text-xs font-semibold rounded transition-colors"
                          >
                            <RotateCw className={`w-3 h-3 ${retrying === event.id ? 'animate-spin' : ''}`} />
                            Retry
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Event Details Modal */}
        {selectedEvent && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Event Details</h3>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-1">Event ID</p>
                    <p className="text-sm text-gray-900 font-mono">{selectedEvent.id}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-1">Event Type</p>
                    <p className="text-sm text-gray-900">{selectedEvent.event_type}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-1">Status</p>
                    {getStatusBadge(selectedEvent.status)}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-1">Retry Count</p>
                    <p className="text-sm text-gray-900">{selectedEvent.retry_count}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-1">Received At</p>
                    <p className="text-sm text-gray-900">
                      {new Date(selectedEvent.received_at).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-1">Processed At</p>
                    <p className="text-sm text-gray-900">
                      {selectedEvent.processed_at
                        ? new Date(selectedEvent.processed_at).toLocaleString()
                        : 'Not processed'}
                    </p>
                  </div>
                </div>

                {selectedEvent.error_message && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-xs font-semibold text-red-600 mb-1">Error Message</p>
                    <p className="text-sm text-red-900">{selectedEvent.error_message}</p>
                  </div>
                )}

                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-2">Event Data</p>
                  <pre className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-xs overflow-auto max-h-96">
                    {JSON.stringify(selectedEvent.event_data, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
