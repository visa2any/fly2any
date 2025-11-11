'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { BookmarkIcon, Sparkles, Loader2 } from 'lucide-react';
import SavedSearchCard from '@/components/account/SavedSearchCard';
import Link from 'next/link';

interface SavedSearch {
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
  createdAt: string;
  filters?: any;
}

export default function SavedSearchesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/account/searches');
      return;
    }

    if (status === 'authenticated') {
      fetchSavedSearches();
    }
  }, [status, router]);

  const fetchSavedSearches = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/saved-searches');

      if (!response.ok) {
        throw new Error('Failed to fetch saved searches');
      }

      const data = await response.json();
      setSearches(data.searches || []);
    } catch (err: any) {
      console.error('Error fetching saved searches:', err);
      setError(err.message || 'Failed to load saved searches');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);

      const response = await fetch(`/api/saved-searches?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete saved search');
      }

      // Remove from local state
      setSearches(prev => prev.filter(s => s.id !== id));
    } catch (err: any) {
      console.error('Error deleting saved search:', err);
      alert('Failed to delete saved search. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleUpdateName = async (id: string, newName: string) => {
    try {
      const response = await fetch(`/api/saved-searches?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
      });

      if (!response.ok) {
        throw new Error('Failed to update search name');
      }

      const data = await response.json();

      // Update local state
      setSearches(prev => prev.map(s =>
        s.id === id ? { ...s, name: newName } : s
      ));
    } catch (err: any) {
      console.error('Error updating search name:', err);
      alert('Failed to update search name. Please try again.');
    }
  };

  const handleQuickSearch = (search: SavedSearch) => {
    // Build search URL
    const params = new URLSearchParams({
      from: search.origin,
      to: search.destination,
      departure: search.departDate,
      adults: search.adults.toString(),
      children: search.children.toString(),
      infants: search.infants.toString(),
      class: search.cabinClass,
    });

    if (search.returnDate) {
      params.append('return', search.returnDate);
    }

    router.push(`/flights/results?${params.toString()}`);
  };

  // Loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Saved Searches</h1>
          <p className="text-gray-600">Quick access to your favorite flight searches</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white rounded-xl shadow-md p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-red-900 mb-2">Error Loading Searches</h2>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={fetchSavedSearches}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (searches.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Saved Searches</h1>
          <p className="text-gray-600">Quick access to your favorite flight searches</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-12 text-center">
          <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookmarkIcon className="w-12 h-12 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">No Saved Searches Yet</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Start searching for flights and save your favorite routes for quick access later. You'll see them here!
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Sparkles className="w-5 h-5" />
            Start Searching
          </Link>
        </div>
      </div>
    );
  }

  // Results view
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Saved Searches</h1>
          <p className="text-gray-600">
            {searches.length} saved {searches.length === 1 ? 'search' : 'searches'}
          </p>
        </div>
        <Link
          href="/"
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
        >
          New Search
        </Link>
      </div>

      {/* Search Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {searches.map(search => (
          <SavedSearchCard
            key={search.id}
            search={search}
            onDelete={handleDelete}
            onUpdateName={handleUpdateName}
            onQuickSearch={handleQuickSearch}
            isDeleting={deletingId === search.id}
          />
        ))}
      </div>

      {/* Back to Account Link */}
      <div className="mt-12 text-center">
        <Link
          href="/account"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Account
        </Link>
      </div>
    </div>
  );
}
