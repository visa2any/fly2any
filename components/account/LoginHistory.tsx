'use client';

import { useState, useEffect } from 'react';
import { History, MapPin, Clock, CheckCircle2, XCircle, AlertTriangle, Loader2, Download } from 'lucide-react';
import toast from 'react-hot-toast';

interface LoginEntry {
  id: string;
  device: string | null;
  browser: string | null;
  os: string | null;
  location: string | null;
  ipAddress: string | null;
  success: boolean;
  timestamp: string;
  suspicious: boolean;
}

interface LoginHistoryProps {
  userId: string;
}

export default function LoginHistory({ userId }: LoginHistoryProps) {
  const [history, setHistory] = useState<LoginEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'success' | 'failed'>('all');

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/account/login-history');
      if (!response.ok) {
        throw new Error('Failed to fetch login history');
      }
      const data = await response.json();
      setHistory(data.history || []);
    } catch (error) {
      console.error('Error fetching login history:', error);
      toast.error('Failed to load login history');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleExport = () => {
    const csv = [
      ['Date', 'Time', 'Status', 'Device', 'Browser', 'OS', 'Location', 'IP Address'].join(','),
      ...history.map((entry) => {
        const date = new Date(entry.timestamp);
        return [
          date.toLocaleDateString(),
          date.toLocaleTimeString(),
          entry.success ? 'Success' : 'Failed',
          entry.device || 'Unknown',
          entry.browser || 'Unknown',
          entry.os || 'Unknown',
          entry.location || 'Unknown',
          entry.ipAddress || 'Unknown',
        ].join(',');
      }),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `login-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Login history exported');
  };

  const maskIpAddress = (ip: string | null) => {
    if (!ip) return 'Unknown';
    const parts = ip.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.${parts[2]}.***`;
    }
    return ip;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const filteredHistory = history.filter((entry) => {
    if (filter === 'all') return true;
    if (filter === 'success') return entry.success;
    if (filter === 'failed') return !entry.success;
    return true;
  });

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <History className="w-5 h-5 text-blue-600" />
          Login History
        </h3>
        <button
          onClick={handleExport}
          disabled={history.length === 0}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      {/* Filter Buttons */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('success')}
          className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
            filter === 'success'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Success
        </button>
        <button
          onClick={() => setFilter('failed')}
          className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
            filter === 'failed'
              ? 'bg-red-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Failed
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : filteredHistory.length === 0 ? (
        <p className="text-gray-600 text-center py-8">No login history found</p>
      ) : (
        <div className="space-y-3">
          {filteredHistory.map((entry) => {
            const { date, time } = formatTimestamp(entry.timestamp);
            return (
              <div
                key={entry.id}
                className={`p-4 rounded-lg border-2 ${
                  entry.suspicious
                    ? 'bg-yellow-50 border-yellow-300'
                    : entry.success
                    ? 'bg-gray-50 border-gray-200'
                    : 'bg-red-50 border-red-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div
                      className={`p-2 rounded-lg ${
                        entry.suspicious
                          ? 'bg-yellow-100'
                          : entry.success
                          ? 'bg-green-100'
                          : 'bg-red-100'
                      }`}
                    >
                      {entry.suspicious ? (
                        <AlertTriangle className="w-5 h-5 text-yellow-600" />
                      ) : entry.success ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">
                          {entry.success ? 'Successful Login' : 'Failed Login'}
                        </h4>
                        {entry.suspicious && (
                          <span className="text-xs bg-yellow-600 text-white px-2 py-1 rounded-full font-semibold">
                            SUSPICIOUS
                          </span>
                        )}
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {date} at {time}
                        </p>
                        {(entry.device || entry.browser) && (
                          <p>
                            {entry.device || 'Desktop'} - {entry.browser || 'Unknown Browser'}
                          </p>
                        )}
                        {entry.os && <p>{entry.os}</p>}
                        {entry.location && (
                          <p className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {entry.location}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">
                          IP: {maskIpAddress(entry.ipAddress)}
                        </p>
                      </div>
                      {entry.suspicious && (
                        <div className="mt-2 p-2 bg-yellow-100 rounded text-xs text-yellow-800">
                          This login was flagged as suspicious due to unusual location or timing.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!isLoading && filteredHistory.length > 0 && (
        <p className="text-xs text-gray-500 text-center mt-4">
          Showing last {filteredHistory.length} login{filteredHistory.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}
