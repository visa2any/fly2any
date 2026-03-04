'use client';

/**
 * Admin Host Verification Queue
 * Review and approve/reject host identity verification requests
 */

import { useState, useEffect, useCallback } from 'react';
import {
  Shield, Search, CheckCircle2, XCircle, Clock,
  FileText, Camera, Video, User, Mail, Phone,
  RefreshCw, ChevronRight, X, ExternalLink,
  AlertTriangle, Eye,
} from 'lucide-react';

interface Host {
  id: string;
  userId: string;
  businessName: string | null;
  businessType: string;
  phone: string | null;
  verificationStatus: string;
  verificationMethod: string | null;
  verificationDocs: any;
  documentUrl: string | null;
  videoUrl: string | null;
  identityVerified: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  trustScore: number;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    createdAt: string;
  };
  _count: { properties: number };
}

export default function HostVerificationPage() {
  const [hosts, setHosts] = useState<Host[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHost, setSelectedHost] = useState<Host | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [actionLoading, setActionLoading] = useState('');

  const fetchHosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/hosts?verification=PENDING&limit=50');
      const data = await res.json();
      if (data.success) {
        setHosts(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch hosts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchHosts(); }, [fetchHosts]);

  const handleVerify = async (hostId: string, status: string) => {
    setActionLoading(hostId);
    try {
      const body: any = { verificationStatus: status };
      if (status === 'VERIFIED') {
        body.identityVerified = true;
        body.trustScore = 80;
      }

      const res = await fetch(`/api/admin/hosts/${hostId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        await fetchHosts();
        setSelectedHost(null);
        setShowRejectForm(false);
        setRejectReason('');
      }
    } catch (error) {
      console.error('Verification action failed:', error);
    } finally {
      setActionLoading('');
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            Host Verification Queue
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Review identity documents and approve or reject host verification requests
          </p>
        </div>
        <button
          onClick={fetchHosts}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Queue Count */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-xl">
            <Clock className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-lg font-bold text-blue-900">{hosts.length} Pending</p>
            <p className="text-sm text-blue-600">Verification requests awaiting review</p>
          </div>
        </div>
      </div>

      {/* Host Cards */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto" />
          <p className="mt-3 text-sm text-gray-500">Loading verification queue...</p>
        </div>
      ) : hosts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto mb-3" />
          <p className="text-lg font-semibold text-gray-700">All caught up!</p>
          <p className="text-sm text-gray-400 mt-1">No pending verification requests</p>
        </div>
      ) : (
        <div className="space-y-3">
          {hosts.map((host) => (
            <div
              key={host.id}
              className="bg-white rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all p-5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg">
                    {(host.user?.name || host.user?.email || '?')[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">{host.user?.name || 'No name'}</h3>
                    <p className="text-sm text-gray-500">{host.user?.email}</p>
                    <div className="flex items-center gap-3 mt-1">
                      {host.businessName && (
                        <span className="text-xs text-indigo-600 font-medium">{host.businessName}</span>
                      )}
                      <span className="text-xs text-gray-400">
                        {host._count?.properties || 0} properties
                      </span>
                      <span className="text-xs text-gray-400">
                        Joined {new Date(host.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedHost(host)}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition flex items-center gap-1.5"
                  >
                    <Eye className="h-4 w-4" /> Review
                  </button>
                  <button
                    onClick={() => handleVerify(host.id, 'VERIFIED')}
                    disabled={actionLoading === host.id}
                    className="px-3 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition disabled:opacity-50 flex items-center gap-1"
                  >
                    <CheckCircle2 className="h-4 w-4" /> Approve
                  </button>
                  <button
                    onClick={() => handleVerify(host.id, 'REJECTED')}
                    disabled={actionLoading === host.id}
                    className="px-3 py-2 bg-red-100 text-red-700 rounded-xl text-sm font-semibold hover:bg-red-200 transition disabled:opacity-50 flex items-center gap-1"
                  >
                    <XCircle className="h-4 w-4" /> Reject
                  </button>
                </div>
              </div>

              {/* Verification Status Indicators */}
              <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-50">
                <div className={`flex items-center gap-1.5 text-xs ${host.emailVerified ? 'text-emerald-600' : 'text-gray-400'}`}>
                  <Mail className="h-3.5 w-3.5" />
                  {host.emailVerified ? 'Email verified' : 'Email unverified'}
                </div>
                <div className={`flex items-center gap-1.5 text-xs ${host.phoneVerified ? 'text-emerald-600' : 'text-gray-400'}`}>
                  <Phone className="h-3.5 w-3.5" />
                  {host.phoneVerified ? 'Phone verified' : 'Phone unverified'}
                </div>
                {host.documentUrl && (
                  <div className="flex items-center gap-1.5 text-xs text-blue-600">
                    <FileText className="h-3.5 w-3.5" />
                    Document uploaded
                  </div>
                )}
                {host.videoUrl && (
                  <div className="flex items-center gap-1.5 text-xs text-blue-600">
                    <Video className="h-3.5 w-3.5" />
                    Video uploaded
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Drawer */}
      {selectedHost && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setSelectedHost(null)} />
          <div className="relative w-full max-w-lg bg-white shadow-2xl overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-lg font-bold text-gray-900">Verification Review</h2>
              <button onClick={() => setSelectedHost(null)} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Profile */}
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-2xl">
                  {(selectedHost.user?.name || '?')[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedHost.user?.name}</h3>
                  <p className="text-sm text-gray-500">{selectedHost.user?.email}</p>
                </div>
              </div>

              {/* Verification Checklist */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-700">Verification Checklist</h4>
                {[
                  { label: 'Email Verified', done: selectedHost.emailVerified, icon: Mail },
                  { label: 'Phone Verified', done: selectedHost.phoneVerified, icon: Phone },
                  { label: 'Identity Document', done: !!selectedHost.documentUrl, icon: FileText },
                  { label: 'Video Verification', done: !!selectedHost.videoUrl, icon: Video },
                ].map(({ label, done, icon: Icon }) => (
                  <div key={label} className={`flex items-center gap-3 p-3 rounded-xl ${done ? 'bg-emerald-50' : 'bg-gray-50'}`}>
                    <Icon className={`h-4 w-4 ${done ? 'text-emerald-600' : 'text-gray-400'}`} />
                    <span className={`text-sm font-medium ${done ? 'text-emerald-700' : 'text-gray-500'}`}>{label}</span>
                    {done ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 ml-auto" />
                    ) : (
                      <XCircle className="h-4 w-4 text-gray-300 ml-auto" />
                    )}
                  </div>
                ))}
              </div>

              {/* Documents */}
              {selectedHost.documentUrl && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Identity Document</h4>
                  <a
                    href={selectedHost.documentUrl}
                    target="_blank"
                    className="flex items-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition"
                  >
                    <FileText className="h-5 w-5" />
                    <span className="text-sm font-medium">View Document</span>
                    <ExternalLink className="h-4 w-4 ml-auto" />
                  </a>
                </div>
              )}

              {selectedHost.videoUrl && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Video Verification</h4>
                  <a
                    href={selectedHost.videoUrl}
                    target="_blank"
                    className="flex items-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition"
                  >
                    <Video className="h-5 w-5" />
                    <span className="text-sm font-medium">Watch Video</span>
                    <ExternalLink className="h-4 w-4 ml-auto" />
                  </a>
                </div>
              )}

              {/* Trust Score */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Trust Score</h4>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        selectedHost.trustScore >= 70 ? 'bg-emerald-500' :
                        selectedHost.trustScore >= 40 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${selectedHost.trustScore}%` }}
                    />
                  </div>
                  <span className="text-lg font-bold text-gray-900">{selectedHost.trustScore}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={() => handleVerify(selectedHost.id, 'VERIFIED')}
                  disabled={actionLoading === selectedHost.id}
                  className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="h-4 w-4" /> Approve Verification
                </button>
                <button
                  onClick={() => handleVerify(selectedHost.id, 'REJECTED')}
                  disabled={actionLoading === selectedHost.id}
                  className="flex-1 px-4 py-3 bg-red-100 text-red-700 rounded-xl text-sm font-semibold hover:bg-red-200 transition disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <XCircle className="h-4 w-4" /> Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
