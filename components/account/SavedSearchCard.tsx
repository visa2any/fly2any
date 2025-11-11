'use client';

import { useState } from 'react';
import { MapPin, Calendar, Users, Plane, Edit2, Trash2, Check, X, Loader2 } from 'lucide-react';

interface SavedSearchCardProps {
  search: {
    id: string;
    name: string;
    origin: string;
    destination: string;
    departDate: string;
    returnDate?: string | null;
    adults: number;
    children: number;
    infants: number;
    cabinClass: string;
    searchCount: number;
    lastSearched: string;
  };
  onDelete: (id: string) => Promise<void>;
  onUpdateName: (id: string, newName: string) => Promise<void>;
  onQuickSearch: (search: any) => void;
  isDeleting?: boolean;
}

export default function SavedSearchCard({
  search,
  onDelete,
  onUpdateName,
  onQuickSearch,
  isDeleting = false,
}: SavedSearchCardProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(search.name);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const totalPassengers = search.adults + search.children + search.infants;
  const tripType = search.returnDate ? 'Round-trip' : 'One-way';

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatLastSearched = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return formatDate(dateString);
  };

  const getCabinClassLabel = (cabinClass: string) => {
    const labels: Record<string, string> = {
      economy: 'Economy',
      premium_economy: 'Premium Economy',
      business: 'Business',
      first: 'First Class',
    };
    return labels[cabinClass] || cabinClass;
  };

  const handleSaveName = async () => {
    if (editedName.trim() === '' || editedName === search.name) {
      setIsEditingName(false);
      setEditedName(search.name);
      return;
    }

    try {
      setIsUpdating(true);
      await onUpdateName(search.id, editedName.trim());
      setIsEditingName(false);
    } catch (error) {
      console.error('Failed to update name:', error);
      setEditedName(search.name);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingName(false);
    setEditedName(search.name);
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    await onDelete(search.id);
    setShowDeleteConfirm(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Delete Confirmation Overlay */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-red-600 z-10 flex flex-col items-center justify-center p-6 text-white rounded-xl">
          <Trash2 className="w-12 h-12 mb-3" />
          <h3 className="text-xl font-bold mb-2">Delete this search?</h3>
          <p className="text-sm text-red-100 mb-6 text-center">
            This action cannot be undone
          </p>
          <div className="flex gap-3 w-full">
            <button
              onClick={handleCancelDelete}
              className="flex-1 px-4 py-2 bg-white text-red-600 font-semibold rounded-lg hover:bg-red-50 transition-colors"
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              className="flex-1 px-4 py-2 bg-red-800 text-white font-semibold rounded-lg hover:bg-red-900 transition-colors disabled:opacity-50"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Deleting...
                </span>
              ) : (
                'Delete'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Card Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4">
        <div className="flex items-start justify-between mb-2">
          {/* Editable Name */}
          {isEditingName ? (
            <div className="flex-1 flex items-center gap-2">
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveName();
                  if (e.key === 'Escape') handleCancelEdit();
                }}
                className="flex-1 px-2 py-1 text-sm font-semibold bg-white text-gray-900 rounded border-2 border-white focus:outline-none focus:border-blue-300"
                autoFocus
                maxLength={100}
              />
              <button
                onClick={handleSaveName}
                className="p-1 bg-green-500 rounded hover:bg-green-600 transition-colors"
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                ) : (
                  <Check className="w-4 h-4 text-white" />
                )}
              </button>
              <button
                onClick={handleCancelEdit}
                className="p-1 bg-red-500 rounded hover:bg-red-600 transition-colors"
                disabled={isUpdating}
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          ) : (
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-1">{search.name}</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-blue-100 px-2 py-0.5 bg-white/20 rounded-full">
                  {tripType}
                </span>
                <span className="text-xs text-blue-100 px-2 py-0.5 bg-white/20 rounded-full">
                  {search.searchCount} {search.searchCount === 1 ? 'search' : 'searches'}
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {!isEditingName && (
            <div className="flex gap-1">
              <button
                onClick={() => setIsEditingName(true)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                title="Edit name"
                aria-label="Edit search name"
              >
                <Edit2 className="w-4 h-4 text-white" />
              </button>
              <button
                onClick={handleDeleteClick}
                className="p-2 hover:bg-red-500/80 rounded-lg transition-colors"
                title="Delete search"
                aria-label="Delete saved search"
              >
                <Trash2 className="w-4 h-4 text-white" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 space-y-4">
        {/* Route */}
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <MapPin className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex items-center gap-2 flex-1">
            <span className="text-lg font-bold text-gray-900">{search.origin}</span>
            <Plane className="w-4 h-4 text-gray-400" />
            <span className="text-lg font-bold text-gray-900">{search.destination}</span>
          </div>
        </div>

        {/* Dates */}
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="text-sm">
              <span className="text-gray-600">Depart: </span>
              <span className="font-semibold text-gray-900">{formatDate(search.departDate)}</span>
            </div>
            {search.returnDate && (
              <div className="text-sm">
                <span className="text-gray-600">Return: </span>
                <span className="font-semibold text-gray-900">{formatDate(search.returnDate)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Passengers & Class */}
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1 text-sm">
            <span className="font-semibold text-gray-900">{totalPassengers}</span>
            <span className="text-gray-600"> {totalPassengers === 1 ? 'Passenger' : 'Passengers'}</span>
            <span className="text-gray-400 mx-2">•</span>
            <span className="text-gray-700">{getCabinClassLabel(search.cabinClass)}</span>
          </div>
        </div>

        {/* Last Searched */}
        <div className="pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Last searched {formatLastSearched(search.lastSearched)}</span>
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="p-4 bg-gray-50 border-t border-gray-100">
        <button
          onClick={() => onQuickSearch(search)}
          className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <Plane className="w-4 h-4" />
          Search Again
        </button>
      </div>
    </div>
  );
}
