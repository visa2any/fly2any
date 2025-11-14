'use client';


import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Plane,
  Hotel,
  Car,
  Compass,
  Share2,
  Heart,
  Check,
  X,
  Crown,
  Shield,
  Clock,
  TrendingUp,
  Sparkles,
  Copy,
  ExternalLink,
} from 'lucide-react';
import UrgencyIndicators from '@/components/tripmatch/UrgencyIndicators';

interface TripComponent {
  id: string;
  type: 'flight' | 'accommodation' | 'car' | 'tour' | 'activity' | 'dining' | 'insurance' | 'other';
  title: string;
  basePricePerPerson: number;
  totalPrice: number;
  currency: string;
  isRequired: boolean;
  startDatetime?: string;
  endDatetime?: string;
  location?: string;
  provider?: string;
  imageUrl?: string;
}

interface Member {
  id: string;
  userId: string;
  role: 'creator' | 'admin' | 'member';
  status: 'invited' | 'confirmed' | 'declined' | 'paid';
  userName: string;
  userAvatarUrl?: string;
  joinedAt: string;
  confirmedAt?: string;
  profile?: {
    displayName: string;
    bio?: string;
    tripsCompleted?: number;
    avgRating?: number;
  };
}

interface Trip {
  id: string;
  title: string;
  description: string;
  destination: string;
  destinationCode: string;
  destinationCountry: string;
  startDate: string;
  endDate: string;
  category: string;
  currentMembers: number;
  maxMembers: number;
  minMembers: number;
  estimatedPricePerPerson: number;
  totalBookingValue: number;
  status: string;
  featured: boolean;
  trending: boolean;
  coverImageUrl: string;
  tags: string[];
  rules?: string;
  creator: {
    userId: string;
    displayName: string;
    avatarUrl?: string;
  };
  components: TripComponent[];
  members: Member[];
}

const COMPONENT_ICONS: Record<string, any> = {
  flight: Plane,
  accommodation: Hotel,
  car: Car,
  tour: Compass,
  activity: Sparkles,
  dining: Users,
  insurance: Shield,
  other: Clock,
};

const CATEGORY_COLORS: Record<string, string> = {
  party: 'from-purple-500 to-pink-500',
  adventure: 'from-orange-500 to-red-500',
  girls_trip: 'from-pink-500 to-rose-500',
  guys_trip: 'from-blue-500 to-cyan-500',
  cultural: 'from-amber-500 to-yellow-500',
  wellness: 'from-green-500 to-emerald-500',
  luxury: 'from-yellow-500 to-amber-600',
  budget: 'from-teal-500 to-cyan-500',
};

export default function TripDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchTripDetails();
  }, [params.id]);

  const fetchTripDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/tripmatch/trips/${params.id}`);
      const data = await response.json();

      if (data.success) {
        setTrip(data.data);
      } else {
        setError(data.error || 'Failed to load trip');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Error fetching trip:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinTrip = async () => {
    if (!inviteCode.trim()) {
      alert('Please enter an invite code');
      return;
    }

    try {
      setJoining(true);
      const response = await fetch(`/api/tripmatch/trips/${params.id}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode: inviteCode.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        alert(data.message || 'Successfully joined the trip!');
        setShowInviteModal(false);
        setInviteCode('');
        fetchTripDetails(); // Refresh trip data
      } else {
        alert(data.error || 'Failed to join trip');
      }
    } catch (err) {
      alert('Network error. Please try again.');
      console.error('Error joining trip:', err);
    } finally {
      setJoining(false);
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getDurationDays = () => {
    if (!trip) return 0;
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getSpotsLeft = () => {
    if (!trip) return 0;
    return trip.maxMembers - trip.currentMembers;
  };

  const calculateCreatorEarnings = () => {
    if (!trip) return 0;
    const potentialMembers = trip.maxMembers - 1; // Exclude creator
    const baseCredits = 50;
    let multiplier = 1.0;

    if (potentialMembers >= 12) multiplier = 2.0;
    else if (potentialMembers >= 8) multiplier = 1.5;

    return Math.floor(potentialMembers * baseCredits * multiplier);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white/80">Loading trip details...</p>
        </div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <X className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Trip Not Found</h2>
          <p className="text-white/60 mb-6">{error || 'This trip does not exist.'}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const categoryGradient = CATEGORY_COLORS[trip.category] || 'from-purple-500 to-pink-500';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <div className="relative h-[60vh] min-h-[500px]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${trip.coverImageUrl})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
        </div>

        <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-end pb-12">
          {/* Badges */}
          <div className="flex gap-2 mb-4">
            {trip.featured && (
              <span className="px-3 py-1 bg-yellow-500/90 text-white text-xs font-bold rounded-full flex items-center gap-1">
                <Crown className="w-3 h-3" />
                FEATURED
              </span>
            )}
            {trip.trending && (
              <span className="px-3 py-1 bg-purple-500/90 text-white text-xs font-bold rounded-full flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                TRENDING
              </span>
            )}
            <span className={`px-3 py-1 bg-gradient-to-r ${categoryGradient} text-white text-xs font-bold rounded-full uppercase`}>
              {trip.category.replace('_', ' ')}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-6xl font-black text-white mb-4 drop-shadow-lg">
            {trip.title}
          </h1>

          {/* Quick Stats */}
          <div className="flex flex-wrap gap-6 text-white/90">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              <span className="font-medium">{trip.destination}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span className="font-medium">
                {formatDate(trip.startDate)} - {formatDate(trip.endDate)} ({getDurationDays()} days)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span className="font-medium">
                {trip.currentMembers}/{trip.maxMembers} members
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setShowInviteModal(true)}
              className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg"
            >
              Join This Trip
            </button>
            <button
              onClick={handleShare}
              className="px-6 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all backdrop-blur-sm flex items-center gap-2"
            >
              {copied ? <Check className="w-5 h-5" /> : <Share2 className="w-5 h-5" />}
              {copied ? 'Copied!' : 'Share'}
            </button>
            <button className="px-6 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all backdrop-blur-sm">
              <Heart className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
            >
              <h2 className="text-2xl font-bold text-white mb-4">About This Trip</h2>
              <p className="text-white/80 leading-relaxed">{trip.description}</p>

              {trip.tags && trip.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {trip.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-purple-500/20 text-purple-300 text-sm rounded-full border border-purple-500/30"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Components */}
            {trip.components && trip.components.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
              >
                <h2 className="text-2xl font-bold text-white mb-4">Included Components</h2>
                <div className="space-y-3">
                  {trip.components.map((component) => {
                    const Icon = COMPONENT_ICONS[component.type] || Clock;
                    return (
                      <div
                        key={component.id}
                        className="bg-white/5 rounded-xl p-4 flex items-start gap-4 border border-white/10 hover:bg-white/10 transition-colors"
                      >
                        <div className="p-3 bg-purple-500/20 rounded-lg">
                          <Icon className="w-6 h-6 text-purple-300" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-bold text-white">{component.title}</h3>
                              <p className="text-sm text-white/60 capitalize">{component.type}</p>
                              {component.location && (
                                <p className="text-sm text-white/60 flex items-center gap-1 mt-1">
                                  <MapPin className="w-3 h-3" />
                                  {component.location}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-white">
                                ${Math.floor(component.basePricePerPerson)}
                                <span className="text-sm font-normal text-white/60">/person</span>
                              </p>
                              {component.isRequired && (
                                <span className="text-xs text-green-400 flex items-center gap-1 justify-end mt-1">
                                  <Check className="w-3 h-3" />
                                  Required
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Members */}
            {trip.members && trip.members.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
              >
                <h2 className="text-2xl font-bold text-white mb-4">
                  Trip Members ({trip.currentMembers}/{trip.maxMembers})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {trip.members.map((member) => (
                    <div
                      key={member.id}
                      className="bg-white/5 rounded-xl p-4 flex items-center gap-3 border border-white/10"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold">
                        {member.userName?.charAt(0) || '?'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-white">{member.userName || 'Unknown'}</p>
                          {member.role === 'creator' && <Crown className="w-4 h-4 text-yellow-400" />}
                          {member.role === 'admin' && <Shield className="w-4 h-4 text-purple-400" />}
                        </div>
                        <p className="text-xs text-white/60 capitalize">{member.role}</p>
                        {member.profile?.tripsCompleted && (
                          <p className="text-xs text-white/60">
                            {member.profile.tripsCompleted} trips completed
                          </p>
                        )}
                      </div>
                      <div>
                        {member.status === 'confirmed' && (
                          <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                            Confirmed
                          </span>
                        )}
                        {member.status === 'invited' && (
                          <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                            Invited
                          </span>
                        )}
                        {member.status === 'paid' && (
                          <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                            Paid
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Rules */}
            {trip.rules && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
              >
                <h2 className="text-2xl font-bold text-white mb-4">Trip Rules & Guidelines</h2>
                <p className="text-white/80 leading-relaxed">{trip.rules}</p>
              </motion.div>
            )}
          </div>

          {/* Right Column: Pricing & CTA */}
          <div className="space-y-6">
            {/* Price Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-6 text-white sticky top-4"
            >
              <div className="text-center mb-6">
                <p className="text-sm opacity-80 mb-1">Total Price Per Person</p>
                <p className="text-5xl font-black mb-2">
                  ${Math.floor(trip.estimatedPricePerPerson / 100).toLocaleString()}
                </p>
                <p className="text-sm opacity-80">{getDurationDays()} days trip</p>
              </div>

              {/* Urgency Indicators */}
              <div className="mb-4">
                <UrgencyIndicators
                  tripId={trip.id}
                  currentMembers={trip.currentMembers}
                  maxMembers={trip.maxMembers}
                  pricePerPerson={trip.estimatedPricePerPerson}
                  trending={trip.trending}
                  featured={trip.featured}
                />
              </div>

              <div className="bg-white/10 rounded-xl p-4 mb-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Spots Left:</span>
                  <span className="font-bold">{getSpotsLeft()} / {trip.maxMembers}</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div
                    className="bg-white rounded-full h-2 transition-all"
                    style={{ width: `${(trip.currentMembers / trip.maxMembers) * 100}%` }}
                  />
                </div>
              </div>

              <button
                onClick={() => setShowInviteModal(true)}
                className="w-full py-4 bg-white text-purple-600 font-bold rounded-xl hover:bg-gray-100 transition-all transform hover:scale-105 mb-3"
              >
                Join This Trip
              </button>

              <div className="bg-white/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-yellow-300" />
                  <p className="font-bold">Creator Earnings</p>
                </div>
                <p className="text-2xl font-black text-yellow-300">
                  ${Math.floor(calculateCreatorEarnings() / 10)}
                </p>
                <p className="text-xs opacity-80 mt-1">
                  ({calculateCreatorEarnings()} credits) if trip fills up
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Invite Code Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-900 rounded-2xl p-8 max-w-md w-full border border-purple-500/30"
          >
            <h3 className="text-2xl font-bold text-white mb-4">Join {trip.title}</h3>
            <p className="text-white/70 mb-6">
              Enter the invite code you received to join this trip.
            </p>

            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="Enter invite code"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 mb-4 focus:outline-none focus:border-purple-500"
            />

            <div className="flex gap-3">
              <button
                onClick={handleJoinTrip}
                disabled={joining || !inviteCode.trim()}
                className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white font-bold rounded-xl transition-all"
              >
                {joining ? 'Joining...' : 'Join Trip'}
              </button>
              <button
                onClick={() => {
                  setShowInviteModal(false);
                  setInviteCode('');
                }}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all"
              >
                Cancel
              </button>
            </div>

            <p className="text-xs text-white/50 mt-4 text-center">
              Don't have an invite code? Contact the trip creator.
            </p>
          </motion.div>
        </div>
      )}
    </div>
  );
}
