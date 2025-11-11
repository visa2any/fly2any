'use client';

import { useState, useEffect } from 'react';
import { Monitor, Smartphone, Tablet, MapPin, Clock, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Session {
  id: string;
  device: string | null;
  browser: string | null;
  os: string | null;
  location: string | null;
  ipAddress: string | null;
  lastActive: string;
  isCurrent: boolean;
}

interface ActiveSessionsProps {
  userId: string;
}

export default function ActiveSessions({ userId }: ActiveSessionsProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/account/sessions');
      if (!response.ok) {
        throw new Error('Failed to fetch sessions');
      }
      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast.error('Failed to load sessions');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();

    // Auto-refresh every minute
    const interval = setInterval(fetchSessions, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleRevokeSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to revoke this session?')) {
      return;
    }

    setRevokingId(sessionId);

    try {
      const response = await fetch(`/api/account/sessions/${sessionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to revoke session');
      }

      toast.success('Session revoked successfully');
      await fetchSessions();
    } catch (error) {
      console.error('Error revoking session:', error);
      toast.error('Failed to revoke session');
    } finally {
      setRevokingId(null);
    }
  };

  const handleRevokeAll = async () => {
    if (!confirm('Are you sure you want to revoke all other sessions?')) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/account/sessions/all', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to revoke sessions');
      }

      toast.success('All other sessions revoked successfully');
      await fetchSessions();
    } catch (error) {
      console.error('Error revoking sessions:', error);
      toast.error('Failed to revoke sessions');
    } finally {
      setIsLoading(false);
    }
  };

  const getDeviceIcon = (device: string | null) => {
    if (!device) return <Monitor className="w-5 h-5" />;
    const lower = device.toLowerCase();
    if (lower.includes('mobile') || lower.includes('phone')) {
      return <Smartphone className="w-5 h-5" />;
    }
    if (lower.includes('tablet') || lower.includes('ipad')) {
      return <Tablet className="w-5 h-5" />;
    }
    return <Monitor className="w-5 h-5" />;
  };

  const maskIpAddress = (ip: string | null) => {
    if (!ip) return 'Unknown';
    const parts = ip.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.${parts[2]}.***`;
    }
    return ip;
  };

  const formatLastActive = (lastActive: string) => {
    const date = new Date(lastActive);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Monitor className="w-5 h-5 text-blue-600" />
          Active Sessions
        </h3>
        {sessions.filter((s) => !s.isCurrent).length > 0 && (
          <button
            onClick={handleRevokeAll}
            disabled={isLoading}
            className="text-sm text-red-600 hover:text-red-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Revoke All Other Sessions
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : sessions.length === 0 ? (
        <p className="text-gray-600 text-center py-8">No active sessions found</p>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => (
            <div
              key={session.id}
              className={`p-4 rounded-lg border-2 ${
                session.isCurrent
                  ? 'bg-blue-50 border-blue-300'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="p-2 bg-white rounded-lg border border-gray-200">
                    {getDeviceIcon(session.device)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900">
                        {session.device || 'Desktop'} - {session.browser || 'Unknown Browser'}
                      </h4>
                      {session.isCurrent && (
                        <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full font-semibold">
                          This Device
                        </span>
                      )}
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      {session.os && <p>{session.os}</p>}
                      {session.location && (
                        <p className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {session.location}
                        </p>
                      )}
                      <p className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Last active: {formatLastActive(session.lastActive)}
                      </p>
                      <p className="text-xs text-gray-500">IP: {maskIpAddress(session.ipAddress)}</p>
                    </div>
                  </div>
                </div>

                {!session.isCurrent && (
                  <button
                    onClick={() => handleRevokeSession(session.id)}
                    disabled={revokingId === session.id}
                    className="flex items-center gap-1 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {revokingId === session.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <X className="w-4 h-4" />
                    )}
                    Revoke
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
