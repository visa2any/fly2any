'use client';

/**
 * TripMatch Find Companions Page
 *
 * Main page for discovering and matching with potential travel companions
 */

import TravelerMatchSwipe from '@/components/tripmatch/TravelerMatchSwipe';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { Users, Heart, MessageCircle } from 'lucide-react';

export default function FindCompanionsPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<'discover' | 'matches'>('discover');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Find Travel Companions</h1>
          <p className="text-gray-300">Connect with like-minded travelers around the world</p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setActiveTab('discover')}
            className={`px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2 ${
              activeTab === 'discover'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
            }`}
          >
            <Users className="w-5 h-5" />
            Discover
          </button>
          <button
            onClick={() => setActiveTab('matches')}
            className={`px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2 ${
              activeTab === 'matches'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
            }`}
          >
            <Heart className="w-5 h-5" />
            My Matches
          </button>
        </div>

        {/* Content */}
        <div className="mb-8">
          {activeTab === 'discover' ? (
            <TravelerMatchSwipe />
          ) : (
            <MatchesList />
          )}
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700">
            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Find Your Tribe</h3>
            <p className="text-gray-400 text-sm">
              Discover travelers with similar interests and travel styles
            </p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700">
            <div className="w-12 h-12 bg-pink-600 rounded-full flex items-center justify-center mb-4">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Match & Connect</h3>
            <p className="text-gray-400 text-sm">
              Swipe right on profiles you like and get matched instantly
            </p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Start Chatting</h3>
            <p className="text-gray-400 text-sm">
              Message your matches and plan amazing trips together
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MatchesList() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/tripmatch/matches?status=matched');
      const data = await res.json();

      if (data.success) {
        setMatches(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch matches:', error);
    } finally {
      setLoading(false);
    }
  };

  useState(() => {
    fetchMatches();
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-800 rounded-lg border border-slate-700">
        <Heart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <p className="text-xl text-gray-300 mb-2">No matches yet</p>
        <p className="text-gray-400 mb-4">Start swiping to find your travel companions!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {matches.map((match) => (
        <div
          key={match.id}
          className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden hover:border-purple-500 transition cursor-pointer"
          onClick={() => window.location.href = `/tripmatch/profiles/${match.otherUser.userId}`}
        >
          <div className="relative h-48 bg-gradient-to-r from-purple-600 to-pink-600">
            {match.otherUser.avatarUrl ? (
              <img
                src={match.otherUser.avatarUrl}
                alt={match.otherUser.displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Users className="w-16 h-16 text-white/50" />
              </div>
            )}
          </div>

          <div className="p-4">
            <h3 className="text-lg font-semibold text-white mb-1">
              {match.otherUser.displayName}
            </h3>
            <p className="text-sm text-gray-400 mb-2">
              {match.otherUser.locationCity}, {match.otherUser.locationCountry}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-sm text-gray-400">
                <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
                Matched {new Date(match.matchedAt).toLocaleDateString()}
              </div>
              {match.otherUser.avgRating > 0 && (
                <div className="text-sm text-yellow-400">
                  ⭐ {match.otherUser.avgRating.toFixed(1)}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
