'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  CreditCard,
  ShieldCheck,
  ShieldX,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Eye,
  Download,
  User,
  Mail,
  Phone,
  MapPin,
  FileImage,
  AlertCircle,
  FileText,
} from 'lucide-react';
import AuthorizationDocumentViewer from '@/components/admin/AuthorizationDocumentViewer';

type AuthStatus = 'ALL' | 'PENDING' | 'VERIFIED' | 'REJECTED' | 'EXPIRED';

interface CardAuthorization {
  id: string;
  bookingReference: string;
  cardholderName: string;
  cardLast4: string;
  cardBrand: string;
  expiryMonth: number;
  expiryYear: number;
  billingCity: string;
  billingCountry: string;
  email: string;
  phone: string;
  amount: number;
  currency: string;
  cardFrontImage: string | null;
  cardBackImage: string | null;
  idDocumentImage: string | null;
  signatureImage: string | null;
  riskScore: number | null;
  riskFactors: string[] | null;
  status: string;
  submittedAt: string;
  verifiedAt: string | null;
  verifiedBy: string | null;
  rejectionReason: string | null;
}

export default function AdminAuthorizationsPage() {
  const [authorizations, setAuthorizations] = useState<CardAuthorization[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<AuthStatus>('ALL');
  const [selectedAuth, setSelectedAuth] = useState<CardAuthorization | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showDocViewer, setShowDocViewer] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    verified: 0,
    rejected: 0,
    highRisk: 0,
  });

  const fetchAuthorizations = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.append('status', statusFilter);

      const response = await fetch(`/api/admin/authorizations?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch');

      const data = await response.json();
      setAuthorizations(data.authorizations || []);
      setStats(data.stats || stats);
    } catch (error) {
      console.error('Error fetching authorizations:', error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchAuthorizations();
  }, [fetchAuthorizations]);

  // Filter authorizations
  const filteredAuthorizations = authorizations.filter((auth) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      auth.bookingReference.toLowerCase().includes(term) ||
      auth.cardholderName.toLowerCase().includes(term) ||
      auth.email.toLowerCase().includes(term) ||
      auth.cardLast4.includes(term)
    );
  });

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-800 rounded-full">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
            <CheckCircle2 className="w-3 h-3" />
            Verified
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded-full">
            <XCircle className="w-3 h-3" />
            Rejected
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
            <AlertCircle className="w-3 h-3" />
            Expired
          </span>
        );
      default:
        return null;
    }
  };

  // Get risk badge
  const getRiskBadge = (score: number | null) => {
    if (score === null) return null;
    if (score >= 50) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded-full">
          <AlertTriangle className="w-3 h-3" />
          High Risk ({score})
        </span>
      );
    }
    if (score >= 25) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-800 rounded-full">
          <AlertTriangle className="w-3 h-3" />
          Medium ({score})
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
        <ShieldCheck className="w-3 h-3" />
        Low ({score})
      </span>
    );
  };

  // Handle approve
  const handleApprove = async (authId: string) => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/authorizations/${authId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
      });

      if (!response.ok) throw new Error('Failed to approve');

      fetchAuthorizations();
      setShowModal(false);
      setSelectedAuth(null);
    } catch (error) {
      console.error('Error approving:', error);
      alert('Failed to approve authorization');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle reject
  const handleReject = async (authId: string) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/authorizations/${authId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', reason: rejectionReason }),
      });

      if (!response.ok) throw new Error('Failed to reject');

      fetchAuthorizations();
      setShowModal(false);
      setSelectedAuth(null);
      setRejectionReason('');
    } catch (error) {
      console.error('Error rejecting:', error);
      alert('Failed to reject authorization');
    } finally {
      setActionLoading(false);
    }
  };

  // Card brand display
  const getCardBrandDisplay = (brand: string) => {
    const baseClass = 'inline-flex items-center justify-center px-2 py-0.5 text-[10px] font-bold rounded';
    switch (brand.toLowerCase()) {
      case 'visa':
        return <span className={`${baseClass} bg-blue-600 text-white`}>VISA</span>;
      case 'mastercard':
        return <span className={`${baseClass} bg-red-600 text-white`}>MC</span>;
      case 'amex':
        return <span className={`${baseClass} bg-blue-500 text-white`}>AMEX</span>;
      case 'discover':
        return <span className={`${baseClass} bg-orange-500 text-white`}>DISC</span>;
      default:
        return <span className={`${baseClass} bg-gray-500 text-white`}>{brand.toUpperCase()}</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Card Authorizations</h1>
          <p className="text-sm text-gray-600">Review and verify card authorizations for manual processing</p>
        </div>
        <button
          onClick={() => fetchAuthorizations()}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-3">
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-xs text-gray-500">Total</div>
        </div>
        <div className="bg-amber-50 rounded-lg border border-amber-200 p-3">
          <div className="text-2xl font-bold text-amber-700">{stats.pending}</div>
          <div className="text-xs text-amber-600">Pending Review</div>
        </div>
        <div className="bg-green-50 rounded-lg border border-green-200 p-3">
          <div className="text-2xl font-bold text-green-700">{stats.verified}</div>
          <div className="text-xs text-green-600">Verified</div>
        </div>
        <div className="bg-red-50 rounded-lg border border-red-200 p-3">
          <div className="text-2xl font-bold text-red-700">{stats.rejected}</div>
          <div className="text-xs text-red-600">Rejected</div>
        </div>
        <div className="bg-orange-50 rounded-lg border border-orange-200 p-3">
          <div className="text-2xl font-bold text-orange-700">{stats.highRisk}</div>
          <div className="text-xs text-orange-600">High Risk</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-200">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by booking ref, name, email, or card..."
            className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as AuthStatus)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="VERIFIED">Verified</option>
            <option value="REJECTED">Rejected</option>
            <option value="EXPIRED">Expired</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : filteredAuthorizations.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <CreditCard className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No authorizations found</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-2 text-left font-semibold text-gray-700">Booking</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700">Cardholder</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700">Card</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700">Amount</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700">Docs</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700">Risk</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700">Status</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700">Submitted</th>
                <th className="px-4 py-2 text-center font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAuthorizations.map((auth) => (
                <tr key={auth.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2">
                    <Link
                      href={`/admin/bookings?search=${auth.bookingReference}`}
                      className="font-medium text-primary-600 hover:underline"
                    >
                      {auth.bookingReference}
                    </Link>
                  </td>
                  <td className="px-4 py-2">
                    <div className="font-medium text-gray-900">{auth.cardholderName}</div>
                    <div className="text-xs text-gray-500">{auth.email}</div>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      {getCardBrandDisplay(auth.cardBrand)}
                      <span className="font-mono">****{auth.cardLast4}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Exp: {auth.expiryMonth.toString().padStart(2, '0')}/{auth.expiryYear.toString().slice(-2)}
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <div className="font-semibold text-gray-900">
                      {auth.currency} {auth.amount.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-1">
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] ${
                          auth.cardFrontImage ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                        }`}
                        title="Card Front"
                      >
                        F
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] ${
                          auth.cardBackImage ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                        }`}
                        title="Card Back"
                      >
                        B
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] ${
                          auth.idDocumentImage ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                        }`}
                        title="ID Document"
                      >
                        ID
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2">{getRiskBadge(auth.riskScore)}</td>
                  <td className="px-4 py-2">{getStatusBadge(auth.status)}</td>
                  <td className="px-4 py-2 text-xs text-gray-500">
                    {new Date(auth.submittedAt).toLocaleDateString()}
                    <br />
                    {new Date(auth.submittedAt).toLocaleTimeString()}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => {
                          setSelectedAuth(auth);
                          setShowModal(true);
                        }}
                        className="p-1.5 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {auth.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleApprove(auth.id)}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                            title="Approve"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedAuth(auth);
                              setShowModal(true);
                            }}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail Modal */}
      {showModal && selectedAuth && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                Authorization Details - {selectedAuth.bookingReference}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedAuth(null);
                  setRejectionReason('');
                }}
                className="p-1 hover:bg-gray-100 rounded-md"
              >
                <XCircle className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 space-y-4">
              {/* Status & Risk */}
              <div className="flex items-center gap-3">
                {getStatusBadge(selectedAuth.status)}
                {getRiskBadge(selectedAuth.riskScore)}
              </div>

              {/* Risk Factors */}
              {selectedAuth.riskFactors && selectedAuth.riskFactors.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <h4 className="text-sm font-semibold text-amber-800 mb-2">Risk Factors</h4>
                  <ul className="text-xs text-amber-700 space-y-1">
                    {selectedAuth.riskFactors.map((factor, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <AlertTriangle className="w-3 h-3" />
                        {factor}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Card & Amount */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <CreditCard className="w-4 h-4" />
                    Card Details
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Brand:</span>
                      <span>{getCardBrandDisplay(selectedAuth.cardBrand)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Number:</span>
                      <span className="font-mono">****{selectedAuth.cardLast4}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Expiry:</span>
                      <span>
                        {selectedAuth.expiryMonth.toString().padStart(2, '0')}/
                        {selectedAuth.expiryYear}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Amount:</span>
                      <span className="font-bold text-green-700">
                        {selectedAuth.currency} {selectedAuth.amount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <User className="w-4 h-4" />
                    Cardholder
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="font-medium">{selectedAuth.cardholderName}</div>
                    <div className="flex items-center gap-1 text-gray-500">
                      <Mail className="w-3 h-3" />
                      {selectedAuth.email}
                    </div>
                    <div className="flex items-center gap-1 text-gray-500">
                      <Phone className="w-3 h-3" />
                      {selectedAuth.phone}
                    </div>
                    <div className="flex items-center gap-1 text-gray-500">
                      <MapPin className="w-3 h-3" />
                      {selectedAuth.billingCity}, {selectedAuth.billingCountry}
                    </div>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <FileImage className="w-4 h-4" />
                  Uploaded Documents
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {selectedAuth.cardFrontImage ? (
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <img
                        src={selectedAuth.cardFrontImage}
                        alt="Card Front"
                        className="w-full h-24 object-cover"
                      />
                      <div className="px-2 py-1 bg-gray-50 text-xs text-center">Card Front</div>
                    </div>
                  ) : (
                    <div className="border border-gray-200 rounded-lg p-4 text-center text-xs text-gray-400">
                      No card front image
                    </div>
                  )}
                  {selectedAuth.cardBackImage ? (
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <img
                        src={selectedAuth.cardBackImage}
                        alt="Card Back"
                        className="w-full h-24 object-cover"
                      />
                      <div className="px-2 py-1 bg-gray-50 text-xs text-center">Card Back</div>
                    </div>
                  ) : (
                    <div className="border border-gray-200 rounded-lg p-4 text-center text-xs text-gray-400">
                      No card back image
                    </div>
                  )}
                  {selectedAuth.idDocumentImage ? (
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <img
                        src={selectedAuth.idDocumentImage}
                        alt="ID Document"
                        className="w-full h-24 object-cover"
                      />
                      <div className="px-2 py-1 bg-gray-50 text-xs text-center">Photo ID</div>
                    </div>
                  ) : (
                    <div className="border border-gray-200 rounded-lg p-4 text-center text-xs text-gray-400">
                      No ID document
                    </div>
                  )}
                </div>
                {/* View Full Document Button */}
                <button
                  onClick={() => setShowDocViewer(true)}
                  className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-slate-800 to-slate-900 text-white text-sm font-medium rounded-xl hover:from-slate-700 hover:to-slate-800 transition-all shadow-lg hover:shadow-xl"
                >
                  <FileText className="w-4 h-4" />
                  View Full Authorization Document
                </button>
              </div>

              {/* Signature */}
              {selectedAuth.signatureImage && (
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <ShieldCheck className="w-4 h-4" />
                    Digital Signature
                  </div>
                  <div className="border border-gray-200 rounded-lg p-2 bg-white">
                    <img
                      src={selectedAuth.signatureImage}
                      alt="Signature"
                      className="h-16 mx-auto"
                    />
                  </div>
                </div>
              )}

              {/* Actions for Pending */}
              {selectedAuth.status === 'PENDING' && (
                <div className="border-t border-gray-200 pt-4 space-y-3">
                  <h4 className="text-sm font-semibold text-gray-700">Take Action</h4>

                  {/* Rejection reason input */}
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Rejection Reason (required for rejection)
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="e.g., Card name doesn't match ID, suspicious activity..."
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      rows={2}
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApprove(selectedAuth.id)}
                      disabled={actionLoading}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(selectedAuth.id)}
                      disabled={actionLoading || !rejectionReason.trim()}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:bg-gray-400"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                </div>
              )}

              {/* Rejection reason if already rejected */}
              {selectedAuth.status === 'REJECTED' && selectedAuth.rejectionReason && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <h4 className="text-sm font-semibold text-red-800 mb-1">Rejection Reason</h4>
                  <p className="text-sm text-red-700">{selectedAuth.rejectionReason}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Document Viewer Modal */}
      {selectedAuth && (
        <AuthorizationDocumentViewer
          authorization={selectedAuth}
          isOpen={showDocViewer}
          onClose={() => setShowDocViewer(false)}
        />
      )}
    </div>
  );
}
