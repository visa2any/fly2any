'use client';

import { useState } from 'react';

interface AmendmentFormProps {
  bookingId: string;
  currentGuest: {
    firstName: string;
    lastName: string;
    email: string;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function AmendmentForm({ bookingId, currentGuest, onSuccess, onCancel }: AmendmentFormProps) {
  const [formData, setFormData] = useState({
    guestFirstName: currentGuest.firstName,
    guestLastName: currentGuest.lastName,
    guestEmail: currentGuest.email,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('/api/bookings/' + bookingId + '/amend', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          if (onSuccess) onSuccess();
        }, 1500);
      } else {
        setError(data.error || 'Failed to amend booking');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to amend booking');
    } finally {
      setLoading(false);
    }
  };

  const hasChanges = 
    formData.guestFirstName !== currentGuest.firstName ||
    formData.guestLastName !== currentGuest.lastName ||
    formData.guestEmail !== currentGuest.email;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Amend Booking</h2>
      <p className="text-gray-600 mb-6">
        Update guest information for booking <span className="font-mono text-sm">{bookingId}</span>
      </p>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-4">
          <p className="font-semibold">✓ Booking amended successfully!</p>
          <p className="text-sm mt-1">Your changes have been saved.</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          <p className="font-semibold">✗ Amendment failed</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name *
            </label>
            <input
              type="text"
              required
              value={formData.guestFirstName}
              onChange={(e) => setFormData({ ...formData, guestFirstName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-info-500 focus:border-transparent"
              disabled={loading || success}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name *
            </label>
            <input
              type="text"
              required
              value={formData.guestLastName}
              onChange={(e) => setFormData({ ...formData, guestLastName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-info-500 focus:border-transparent"
              disabled={loading || success}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address *
          </label>
          <input
            type="email"
            required
            value={formData.guestEmail}
            onChange={(e) => setFormData({ ...formData, guestEmail: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-info-500 focus:border-transparent"
            disabled={loading || success}
          />
        </div>

        {hasChanges && !success && (
          <div className="bg-info-50 border border-info-200 rounded-lg p-3">
            <p className="text-sm text-neutral-700">
              <strong>Changes detected:</strong> The following fields will be updated:
            </p>
            <ul className="text-sm text-primary-600 mt-2 space-y-1">
              {formData.guestFirstName !== currentGuest.firstName && (
                <li>• First Name: {currentGuest.firstName} → {formData.guestFirstName}</li>
              )}
              {formData.guestLastName !== currentGuest.lastName && (
                <li>• Last Name: {currentGuest.lastName} → {formData.guestLastName}</li>
              )}
              {formData.guestEmail !== currentGuest.email && (
                <li>• Email: {currentGuest.email} → {formData.guestEmail}</li>
              )}
            </ul>
          </div>
        )}

        <div className="flex gap-4 pt-4 border-t">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading || success}
              className="flex-1 px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading || success || !hasChanges}
            className="flex-1 px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? 'Updating...' : success ? 'Updated!' : 'Confirm Amendment'}
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center">
          Note: Some changes may require hotel approval. You will be notified if additional verification is needed.
        </p>
      </form>
    </div>
  );
}
