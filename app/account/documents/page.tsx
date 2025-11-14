'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Shield,
  Calendar,
  AlertTriangle,
  Check,
  X,
  Loader2,
  Upload,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface TravelDocument {
  id: string;
  type: string;
  documentNumber: string;
  issuingCountry: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  expirationDate: string;
  issuedDate?: string;
  isVerified: boolean;
  visaType?: string;
  destinationCountry?: string;
  notes?: string;
  createdAt: string;
}

export default function DocumentsPage() {
  const { data: session, status } = useSession();
  const [documents, setDocuments] = useState<TravelDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDoc, setEditingDoc] = useState<TravelDocument | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    type: 'passport',
    documentNumber: '',
    issuingCountry: '',
    firstName: '',
    middleName: '',
    lastName: '',
    expirationDate: '',
    issuedDate: '',
    visaType: '',
    destinationCountry: '',
    notes: '',
  });

  useEffect(() => {
    if (status === 'authenticated') {
      fetchDocuments();
    }
  }, [status]);

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/documents');
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents || []);
      }
    } catch (error) {
      toast.error('Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (doc?: TravelDocument) => {
    if (doc) {
      setEditingDoc(doc);
      setFormData({
        type: doc.type,
        documentNumber: doc.documentNumber,
        issuingCountry: doc.issuingCountry,
        firstName: doc.firstName,
        middleName: doc.middleName || '',
        lastName: doc.lastName,
        expirationDate: doc.expirationDate.split('T')[0],
        issuedDate: doc.issuedDate ? doc.issuedDate.split('T')[0] : '',
        visaType: doc.visaType || '',
        destinationCountry: doc.destinationCountry || '',
        notes: doc.notes || '',
      });
    } else {
      setEditingDoc(null);
      resetForm();
    }
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      type: 'passport',
      documentNumber: '',
      issuingCountry: '',
      firstName: '',
      middleName: '',
      lastName: '',
      expirationDate: '',
      issuedDate: '',
      visaType: '',
      destinationCountry: '',
      notes: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = editingDoc ? `/api/documents/${editingDoc.id}` : '/api/documents';
      const method = editingDoc ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save document');
      }

      toast.success(editingDoc ? 'Document updated!' : 'Document added!');
      setShowModal(false);
      fetchDocuments();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save document');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      const response = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete');

      toast.success('Document deleted');
      fetchDocuments();
    } catch (error) {
      toast.error('Failed to delete document');
    }
  };

  const isExpiringSoon = (expirationDate: string) => {
    const expiry = new Date(expirationDate);
    const today = new Date();
    const daysUntilExpiry = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry >= 0 && daysUntilExpiry <= 180; // 6 months
  };

  const isExpired = (expirationDate: string) => {
    return new Date(expirationDate) < new Date();
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'passport': return '🛂';
      case 'visa': return '📑';
      case 'national_id': return '🪪';
      case 'driver_license': return '🚗';
      case 'known_traveler': return '✈️';
      default: return '📄';
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-7 h-7 text-primary-500" />
            Travel Documents
          </h1>
          <p className="text-gray-600 mt-1">Manage passports, visas, and travel documents</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all shadow-md hover:shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Add Document
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Documents</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{documents.length}</p>
            </div>
            <div className="p-3 bg-primary-50 rounded-lg">
              <FileText className="w-6 h-6 text-primary-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Passports</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {documents.filter(d => d.type === 'passport').length}
              </p>
            </div>
            <div className="p-3 bg-success-50 rounded-lg">
              <Shield className="w-6 h-6 text-success-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Active Visas</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {documents.filter(d => d.type === 'visa' && !isExpired(d.expirationDate)).length}
              </p>
            </div>
            <div className="p-3 bg-info-50 rounded-lg">
              <Calendar className="w-6 h-6 text-info-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Expiring Soon</p>
              <p className="text-2xl font-bold text-warning-600 mt-1">
                {documents.filter(d => isExpiringSoon(d.expirationDate)).length}
              </p>
            </div>
            <div className="p-3 bg-warning-50 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-warning-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Expiration Warnings */}
      {documents.some(d => isExpiringSoon(d.expirationDate) || isExpired(d.expirationDate)) && (
        <div className="bg-warning-50 border-l-4 border-warning-500 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-warning-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-warning-900 mb-1">Document Expiration Alert</h3>
              <p className="text-sm text-warning-700">
                You have documents that are expired or expiring within 6 months. Please renew them before your next trip.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Documents List */}
      {documents.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border-2 border-dashed border-gray-300">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No documents yet</h3>
          <p className="text-gray-600 mb-6">Add your travel documents to keep track of expiration dates</p>
          <button
            onClick={() => handleOpenModal()}
            className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all shadow-md"
          >
            Add Your First Document
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documents.map((doc) => {
            const expired = isExpired(doc.expirationDate);
            const expiringSoon = !expired && isExpiringSoon(doc.expirationDate);

            return (
              <div
                key={doc.id}
                className={`bg-white rounded-xl p-5 border-2 transition-all ${
                  expired
                    ? 'border-red-300 bg-red-50'
                    : expiringSoon
                    ? 'border-warning-300 bg-warning-50'
                    : 'border-gray-200 hover:border-primary-300'
                }`}
              >
                {/* Document Type */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-2xl mb-1">{getDocumentIcon(doc.type)}</p>
                    <h3 className="text-lg font-bold text-gray-900 capitalize">
                      {doc.type.replace('_', ' ')}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {doc.firstName} {doc.lastName}
                    </p>
                  </div>
                  {doc.isVerified && (
                    <span className="flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                      <Check className="w-3 h-3" />
                      VERIFIED
                    </span>
                  )}
                </div>

                {/* Document Details */}
                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Document Number:</span>
                    <span className="font-mono font-semibold">{doc.documentNumber}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Issuing Country:</span>
                    <span className="font-semibold">{doc.issuingCountry}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Expiration:</span>
                    <span className={`font-semibold ${expired ? 'text-red-600' : expiringSoon ? 'text-warning-600' : ''}`}>
                      {new Date(doc.expirationDate).toLocaleDateString()}
                    </span>
                  </div>
                  {doc.visaType && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Visa Type:</span>
                      <span className="font-semibold capitalize">{doc.visaType}</span>
                    </div>
                  )}
                </div>

                {/* Expiration Warning */}
                {(expired || expiringSoon) && (
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg mb-3 ${
                    expired ? 'bg-red-100 text-red-700' : 'bg-warning-100 text-warning-700'
                  }`}>
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span className="text-xs font-semibold">
                      {expired ? 'EXPIRED - Renew immediately' : 'Expires soon - Renew before travel'}
                    </span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
                  <button
                    onClick={() => handleOpenModal(doc)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="flex items-center justify-center px-3 py-2 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-4 text-white rounded-t-xl flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {editingDoc ? 'Edit Document' : 'Add Travel Document'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Document Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Document Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  required
                >
                  <option value="passport">Passport</option>
                  <option value="visa">Visa</option>
                  <option value="national_id">National ID</option>
                  <option value="driver_license">Driver's License</option>
                  <option value="known_traveler">Known Traveler Number</option>
                </select>
              </div>

              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Middle Name
                  </label>
                  <input
                    type="text"
                    value={formData.middleName}
                    onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                    className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Document Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Document Number *
                  </label>
                  <input
                    type="text"
                    value={formData.documentNumber}
                    onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
                    className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Issuing Country *
                  </label>
                  <input
                    type="text"
                    value={formData.issuingCountry}
                    onChange={(e) => setFormData({ ...formData, issuingCountry: e.target.value })}
                    placeholder="US, GB, BR, etc."
                    className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Issue Date
                  </label>
                  <input
                    type="date"
                    value={formData.issuedDate}
                    onChange={(e) => setFormData({ ...formData, issuedDate: e.target.value })}
                    className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Expiration Date *
                  </label>
                  <input
                    type="date"
                    value={formData.expirationDate}
                    onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                    className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Visa-specific fields */}
              {formData.type === 'visa' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Visa Type
                    </label>
                    <select
                      value={formData.visaType}
                      onChange={(e) => setFormData({ ...formData, visaType: e.target.value })}
                      className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                    >
                      <option value="">Select Type</option>
                      <option value="tourist">Tourist</option>
                      <option value="business">Business</option>
                      <option value="student">Student</option>
                      <option value="work">Work</option>
                      <option value="transit">Transit</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Destination Country
                    </label>
                    <input
                      type="text"
                      value={formData.destinationCountry}
                      onChange={(e) => setFormData({ ...formData, destinationCountry: e.target.value })}
                      placeholder="US, GB, BR, etc."
                      className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  placeholder="Additional information..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 px-4 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors border border-gray-300"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-4 rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold hover:from-primary-600 hover:to-primary-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      {editingDoc ? 'Update Document' : 'Add Document'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
