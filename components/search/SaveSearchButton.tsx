'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { BookmarkIcon, Check, Loader2, X } from 'lucide-react';
import { showSuccess, showError } from '@/lib/toast';

interface SaveSearchButtonProps {
  searchParams: {
    origin: string;
    destination: string;
    departDate: string;
    returnDate?: string;
    adults: number;
    children: number;
    infants: number;
    cabinClass: string;
  };
  variant?: 'default' | 'compact' | 'icon';
  className?: string;
  onSaveSuccess?: () => void;
}

export default function SaveSearchButton({
  searchParams,
  variant = 'default',
  className = '',
  onSaveSuccess,
}: SaveSearchButtonProps) {
  const { data: session, status } = useSession();
  const [showDialog, setShowDialog] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Generate default search name
  const getDefaultName = () => {
    const tripType = searchParams.returnDate ? 'Round-trip' : 'One-way';
    return `${searchParams.origin} to ${searchParams.destination} - ${tripType}`;
  };

  const handleOpenDialog = () => {
    if (status === 'unauthenticated') {
      window.location.href = `/auth/signin?callbackUrl=${encodeURIComponent(window.location.pathname + window.location.search)}`;
      return;
    }

    setSearchName(getDefaultName());
    setShowDialog(true);
  };

  const handleSaveSearch = async () => {
    if (!searchName.trim()) {
      showError('Please enter a name for this search');
      return;
    }

    try {
      setIsSaving(true);

      const response = await fetch('/api/saved-searches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: searchName.trim(),
          origin: searchParams.origin,
          destination: searchParams.destination,
          departDate: searchParams.departDate,
          returnDate: searchParams.returnDate || undefined,
          adults: searchParams.adults,
          children: searchParams.children,
          infants: searchParams.infants,
          cabinClass: searchParams.cabinClass,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save search');
      }

      setIsSaved(true);
      setShowDialog(false);

      if (data.updated) {
        showSuccess('Search updated successfully!');
      } else {
        showSuccess('Search saved successfully!');
      }

      if (onSaveSuccess) {
        onSaveSuccess();
      }

      // Reset after 2 seconds
      setTimeout(() => {
        setIsSaved(false);
      }, 2000);
    } catch (error: any) {
      console.error('Failed to save search:', error);
      showError(error.message || 'Failed to save search. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setSearchName('');
  };

  // Icon variant (minimal)
  if (variant === 'icon') {
    return (
      <>
        <button
          onClick={handleOpenDialog}
          className={`p-2 hover:bg-blue-50 rounded-lg transition-colors group ${className}`}
          title="Save this search"
          aria-label="Save this search"
        >
          {isSaved ? (
            <Check className="w-5 h-5 text-green-600" />
          ) : (
            <BookmarkIcon className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
          )}
        </button>

        {/* Dialog */}
        {showDialog && (
          <SaveSearchDialog
            searchName={searchName}
            setSearchName={setSearchName}
            onSave={handleSaveSearch}
            onClose={handleCloseDialog}
            isSaving={isSaving}
          />
        )}
      </>
    );
  }

  // Compact variant
  if (variant === 'compact') {
    return (
      <>
        <button
          onClick={handleOpenDialog}
          className={`inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all shadow-sm hover:shadow ${className}`}
          disabled={isSaved}
        >
          {isSaved ? (
            <>
              <Check className="w-4 h-4" />
              Saved
            </>
          ) : (
            <>
              <BookmarkIcon className="w-4 h-4" />
              Save
            </>
          )}
        </button>

        {/* Dialog */}
        {showDialog && (
          <SaveSearchDialog
            searchName={searchName}
            setSearchName={setSearchName}
            onSave={handleSaveSearch}
            onClose={handleCloseDialog}
            isSaving={isSaving}
          />
        )}
      </>
    );
  }

  // Default variant (full button)
  return (
    <>
      <button
        onClick={handleOpenDialog}
        className={`inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 ${className}`}
        disabled={isSaved}
      >
        {isSaved ? (
          <>
            <Check className="w-5 h-5" />
            Search Saved
          </>
        ) : (
          <>
            <BookmarkIcon className="w-5 h-5" />
            Save This Search
          </>
        )}
      </button>

      {/* Dialog */}
      {showDialog && (
        <SaveSearchDialog
          searchName={searchName}
          setSearchName={setSearchName}
          onSave={handleSaveSearch}
          onClose={handleCloseDialog}
          isSaving={isSaving}
        />
      )}
    </>
  );
}

// Separate Dialog Component
interface SaveSearchDialogProps {
  searchName: string;
  setSearchName: (name: string) => void;
  onSave: () => void;
  onClose: () => void;
  isSaving: boolean;
}

function SaveSearchDialog({
  searchName,
  setSearchName,
  onSave,
  onClose,
  isSaving,
}: SaveSearchDialogProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSaving) {
      e.preventDefault();
      onSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Save This Search</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isSaving}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="mb-6">
          <label
            htmlFor="search-name"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Search Name
          </label>
          <input
            id="search-name"
            type="text"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
            placeholder="e.g., Weekend getaway to Paris"
            maxLength={100}
            autoFocus
            disabled={isSaving}
          />
          <p className="mt-2 text-xs text-gray-500">
            Give this search a memorable name so you can find it easily later
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSaving || !searchName.trim()}
          >
            {isSaving ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </span>
            ) : (
              'Save Search'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
