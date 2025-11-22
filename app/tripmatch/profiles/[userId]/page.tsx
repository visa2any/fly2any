'use client';

/**
 * TripMatch User Profile Page
 *
 * Shows a user's travel profile with stats, reviews, and trip history
 */

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import {
  MapPin, Star, Calendar, Users, Shield, CheckCircle,
  MessageCircle, UserPlus, Award, Globe, Languages, Heart, Edit
} from 'lucide-react';
import ProfileEditModal from '@/components/tripmatch/ProfileEditModal';

interface Profile {
  id: string;
  userId: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  coverImageUrl: string;
  travelStyle: string[];
  interests: string[];
  languagesSpoken: string[];
  ageRange: string;
  gender: string;
  locationCity: string;
  locationCountry: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  idVerified: boolean;
  safetyScore: number;
  verificationLevel: number;
  tripsCreated: number;
  tripsJoined: number;
  tripsCompleted: number;
  totalCompanionsMet: number;
  avgRating: number;
  totalReviews: number;
  memberSince: string;
  stats: {
    totalPosts: number;
    totalReviews: number;
    totalConnections: number;
    responseRate: number;
    averageResponseTime: string;
  };
  recentReviews: Array<{
    id: string;
    overallRating: number;
    reviewText: string;
    createdAt: string;
    reviewer: {
      displayName: string;
      avatarUrl: string;
    };
  }>;
}

export default function ProfilePage() {
  const params = useParams();
  const userId = params.userId as string;
  const { data: session } = useSession();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Check if viewing own profile
  const isOwnProfile = session?.user?.id === userId;

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/tripmatch/profiles/${userId}`);
      const data = await res.json();

      if (data.success) {
        setProfile(data.data);
      } else {
        setError(data.error || 'Failed to load profile');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <p className="text-xl mb-4">{error || 'Profile not found'}</p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Cover Image */}
      <div className="relative h-64 bg-gradient-to-r from-purple-600 to-pink-600">
        {profile.coverImageUrl && (
          <img
            src={profile.coverImageUrl}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
      </div>

      {/* Profile Header */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10">
        <div className="bg-slate-800/90 backdrop-blur-sm rounded-lg shadow-xl p-6">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
            {/* Avatar */}
            <div className="relative">
              <img
                src={profile.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + profile.displayName}
                alt={profile.displayName}
                className="w-32 h-32 rounded-full border-4 border-purple-500 shadow-lg"
              />
              {profile.verificationLevel >= 3 && (
                <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-2 border-2 border-slate-800">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-2">
                {profile.displayName}
                {profile.idVerified && (
                  <Shield className="inline-block w-6 h-6 text-blue-400 ml-2" />
                )}
              </h1>

              <div className="flex flex-wrap gap-4 text-gray-300 text-sm mb-4">
                {profile.locationCity && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {profile.locationCity}, {profile.locationCountry}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Member since {new Date(profile.memberSince).getFullYear()}
                </div>
                {profile.avgRating > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    {profile.avgRating.toFixed(1)} ({profile.totalReviews} reviews)
                  </div>
                )}
              </div>

              {profile.bio && (
                <p className="text-gray-300 mb-4">{profile.bio}</p>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                {isOwnProfile ? (
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Profile
                  </button>
                ) : (
                  <>
                    <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2">
                      <MessageCircle className="w-4 h-4" />
                      Message
                    </button>
                    <button className="px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition flex items-center gap-2">
                      <UserPlus className="w-4 h-4" />
                      Connect
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{profile.tripsCompleted}</div>
                <div className="text-sm text-gray-400">Trips</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{profile.totalCompanionsMet}</div>
                <div className="text-sm text-gray-400">Companions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{profile.safetyScore}</div>
                <div className="text-sm text-gray-400">Safety Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{profile.stats.responseRate}%</div>
                <div className="text-sm text-gray-400">Response</div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {/* Left Column */}
          <div className="md:col-span-2 space-y-6">
            {/* About */}
            <div className="bg-slate-800/90 backdrop-blur-sm rounded-lg shadow-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">About</h2>

              {/* Travel Style */}
              {profile.travelStyle && profile.travelStyle.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-400 mb-2">Travel Style</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.travelStyle.map((style) => (
                      <span key={style} className="px-3 py-1 bg-purple-600/30 text-purple-300 rounded-full text-sm">
                        {style}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Interests */}
              {profile.interests && profile.interests.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-400 mb-2 flex items-center gap-2">
                    <Heart className="w-4 h-4" />
                    Interests
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.interests.map((interest) => (
                      <span key={interest} className="px-3 py-1 bg-slate-700 text-gray-300 rounded-lg text-sm">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Languages */}
              {profile.languagesSpoken && profile.languagesSpoken.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-2 flex items-center gap-2">
                    <Languages className="w-4 h-4" />
                    Languages
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.languagesSpoken.map((lang) => (
                      <span key={lang} className="px-3 py-1 bg-slate-700 text-gray-300 rounded-lg text-sm">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Reviews */}
            {profile.recentReviews && profile.recentReviews.length > 0 && (
              <div className="bg-slate-800/90 backdrop-blur-sm rounded-lg shadow-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Recent Reviews</h2>
                <div className="space-y-4">
                  {profile.recentReviews.map((review) => (
                    <div key={review.id} className="border-b border-slate-700 last:border-0 pb-4 last:pb-0">
                      <div className="flex items-start gap-3">
                        <img
                          src={review.reviewer.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + review.reviewer.displayName}
                          alt={review.reviewer.displayName}
                          className="w-10 h-10 rounded-full"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-white">{review.reviewer.displayName}</span>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.overallRating
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-600'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          {review.reviewText && (
                            <p className="text-gray-300 text-sm">{review.reviewText}</p>
                          )}
                          <p className="text-gray-500 text-xs mt-1">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Verification & Stats */}
          <div className="space-y-6">
            {/* Verification */}
            <div className="bg-slate-800/90 backdrop-blur-sm rounded-lg shadow-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Verification</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Email
                  </span>
                  {profile.emailVerified ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <span className="text-gray-500 text-sm">Not verified</span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Phone
                  </span>
                  {profile.phoneVerified ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <span className="text-gray-500 text-sm">Not verified</span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    ID
                  </span>
                  {profile.idVerified ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <span className="text-gray-500 text-sm">Not verified</span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-slate-800/90 backdrop-blur-sm rounded-lg shadow-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Quick Stats</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Trips Created</span>
                  <span className="text-white font-semibold">{profile.tripsCreated}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Trips Joined</span>
                  <span className="text-white font-semibold">{profile.tripsJoined}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Response Time</span>
                  <span className="text-white font-semibold">{profile.stats.averageResponseTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Connections</span>
                  <span className="text-white font-semibold">{profile.stats.totalConnections}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Edit Modal */}
      <ProfileEditModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        profile={profile}
        onSave={fetchProfile}
      />
    </div>
  );
}
