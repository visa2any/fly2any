'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import {
  Gift,
  Copy,
  Share2,
  Users,
  TrendingUp,
  Twitter,
  Facebook,
  Mail,
  MessageCircle,
  CheckCircle,
  Clock,
  Sparkles,
  Lock,
  Unlock,
  Network,
  Award,
  AlertCircle,
  User,
  ArrowRight
} from 'lucide-react';

interface PointsSummary {
  available: number;
  locked: number;
  lifetime: number;
  redeemed: number;
  referralCode: string;
  directReferrals: number;
  totalNetwork: number;
  pendingTransactions: number;
  pendingAmount: number;
}

interface NetworkMember {
  id: string;
  referee: {
    id: string;
    name: string | null;
    email: string;
    createdAt: string;
  };
  level: number;
  status: string;
  signupCompletedAt: string | null;
  firstBookingAt: string | null;
  totalBookings: number;
  totalRevenue: number;
  totalPointsEarned: number;
}

interface NetworkTree {
  total: number;
  byLevel: {
    level1: NetworkMember[];
    level2: NetworkMember[];
    level3: NetworkMember[];
  };
}

export default function ReferralsPage() {
  const { data: session, status } = useSession();
  const [pointsSummary, setPointsSummary] = useState<PointsSummary | null>(null);
  const [networkTree, setNetworkTree] = useState<NetworkTree | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'network'>('overview');

  useEffect(() => {
    if (status === 'authenticated') {
      fetchData();
    }
  }, [status]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch points summary
      const summaryRes = await fetch('/api/referrals/points-summary');
      const summaryData = await summaryRes.json();

      // Fetch network tree
      const networkRes = await fetch('/api/referrals/network-tree');
      const networkData = await networkRes.json();

      if (summaryData.success) {
        setPointsSummary(summaryData.data);
      }

      if (networkData.success) {
        setNetworkTree(networkData.data);
      }
    } catch (error) {
      console.error('Error fetching referral data:', error);
      toast.error('Failed to load referral data');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(`${label} copied to clipboard!`);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const getReferralUrl = () => {
    if (!pointsSummary?.referralCode) return '';
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://fly2any.com';
    return `${baseUrl}?ref=${pointsSummary.referralCode}`;
  };

  const shareVia = (platform: string) => {
    if (!pointsSummary) return;

    const url = getReferralUrl();
    const message = `Join me on Fly2Any and earn travel points! Use my referral code: ${pointsSummary.referralCode}`;
    const encodedMessage = encodeURIComponent(message);
    const encodedUrl = encodeURIComponent(url);

    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodedMessage}&url=${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedMessage}`,
      whatsapp: `https://wa.me/?text=${encodedMessage}%20${encodedUrl}`,
      email: `mailto:?subject=Join%20Fly2Any&body=${encodedMessage}%20${encodedUrl}`,
    };

    window.open(urls[platform], '_blank', 'width=600,height=400');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success-100 text-success-700';
      case 'first_booking':
        return 'bg-primary-100 text-primary-700';
      case 'signed_up':
        return 'bg-warning-100 text-warning-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'first_booking':
        return 'First Booking';
      case 'signed_up':
        return 'Signed Up';
      default:
        return 'Pending';
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Please sign in to view your referral program</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 md:space-y-6">
      {/* Header - Level 6 Mobile */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 md:rounded-2xl p-4 md:p-8 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2 md:p-3">
            <Network className="w-6 h-6 md:w-8 md:h-8" />
          </div>
          <div>
            <h1 className="text-xl md:text-3xl font-bold">Refer & Earn</h1>
            <p className="text-white/80 text-sm mt-0.5">Earn points on every booking</p>
          </div>
        </div>

        {/* Points Summary - Horizontal scroll on mobile */}
        {pointsSummary && (
          <div className="mt-4 md:mt-6 flex md:grid md:grid-cols-4 gap-3 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:overflow-visible scrollbar-hide">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-white/20 min-w-[130px] flex-shrink-0 md:min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                <Unlock className="w-3.5 h-3.5 text-white/80" />
                <p className="text-xs text-white/80">Available</p>
              </div>
              <p className="text-xl md:text-3xl font-bold">{pointsSummary.available.toLocaleString()}</p>
              <p className="text-[10px] md:text-xs text-white/70 mt-1">${pointsSummary.available}</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-white/20 min-w-[130px] flex-shrink-0 md:min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                <Lock className="w-3.5 h-3.5 text-white/80" />
                <p className="text-xs text-white/80">Locked</p>
              </div>
              <p className="text-xl md:text-3xl font-bold">{pointsSummary.locked.toLocaleString()}</p>
              <p className="text-[10px] md:text-xs text-white/70 mt-1">{pointsSummary.pendingTransactions} pending</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-white/20 min-w-[130px] flex-shrink-0 md:min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                <Award className="w-3.5 h-3.5 text-white/80" />
                <p className="text-xs text-white/80">Lifetime</p>
              </div>
              <p className="text-xl md:text-3xl font-bold">{pointsSummary.lifetime.toLocaleString()}</p>
              <p className="text-[10px] md:text-xs text-white/70 mt-1">All-time</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-white/20 min-w-[130px] flex-shrink-0 md:min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                <Users className="w-3.5 h-3.5 text-white/80" />
                <p className="text-xs text-white/80">Network</p>
              </div>
              <p className="text-xl md:text-3xl font-bold">{pointsSummary.totalNetwork.toLocaleString()}</p>
              <p className="text-[10px] md:text-xs text-white/70 mt-1">{pointsSummary.directReferrals} direct</p>
            </div>
          </div>
        )}

        {/* Referral Code */}
        {pointsSummary && (
          <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <p className="text-sm text-white/80 mb-2">Your Referral Code</p>
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 bg-white/20 rounded-lg px-6 py-4 font-mono text-2xl font-bold tracking-wider">
                {pointsSummary.referralCode}
              </div>
              <button
                onClick={() => copyToClipboard(pointsSummary.referralCode, 'Referral code')}
                className="bg-white text-primary-600 hover:bg-primary-50 px-6 py-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                {copied ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                {copied ? 'Copied!' : 'Copy Code'}
              </button>
            </div>

            {/* Referral URL */}
            <div className="mt-4">
              <p className="text-sm text-white/80 mb-2">Shareable Link</p>
              <div className="flex flex-col md:flex-row gap-3">
                <input
                  type="text"
                  value={getReferralUrl()}
                  readOnly
                  className="flex-1 bg-white/20 border border-white/30 rounded-lg px-4 py-2 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-white/50"
                />
                <button
                  onClick={() => copyToClipboard(getReferralUrl(), 'Referral link')}
                  className="bg-white/20 hover:bg-white/30 border border-white/30 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy Link
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs - Content wrapper with padding on mobile */}
      <div className="px-3 md:px-0">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 px-3 md:px-6 py-3 md:py-4 text-sm md:text-base font-semibold transition-colors ${
              activeTab === 'overview'
                ? 'bg-primary-50 text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span className="hidden md:inline">Overview & How It Works</span>
            <span className="md:hidden">Overview</span>
          </button>
          <button
            onClick={() => setActiveTab('network')}
            className={`flex-1 px-3 md:px-6 py-3 md:py-4 text-sm md:text-base font-semibold transition-colors ${
              activeTab === 'network'
                ? 'bg-primary-50 text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span className="hidden md:inline">My Network ({networkTree?.total || 0})</span>
            <span className="md:hidden">Network ({networkTree?.total || 0})</span>
          </button>
        </div>

        <div className="p-4 md:p-6">
          {activeTab === 'overview' && (
            <div className="space-y-4 md:space-y-6">
              {/* How It Works - Travel Rewards */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-primary-600" />
                  <h2 className="text-xl font-bold text-gray-900">How Fly2Any Rewards Works</h2>
                </div>
                <div className="bg-primary-50 border border-primary-200 rounded-xl p-6 mb-6">
                  <p className="text-gray-700 mb-4">
                    <strong>Earn travel rewards from your community!</strong> You earn when your direct referrals book trips (Level 1),
                    when THEIR referrals book trips (Level 2), and even when their referrals book trips (Level 3).
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-4 border-2 border-primary-300">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="bg-primary-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">1</div>
                        <h3 className="font-bold text-gray-900">Level 1</h3>
                      </div>
                      <p className="text-2xl font-bold text-primary-600 mb-1">5%</p>
                      <p className="text-sm text-gray-600">of Fly2Any earnings</p>
                      <p className="text-xs text-gray-500 mt-2">Your direct referrals</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border-2 border-primary-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="bg-primary-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">2</div>
                        <h3 className="font-bold text-gray-900">Level 2</h3>
                      </div>
                      <p className="text-2xl font-bold text-primary-500 mb-1">2%</p>
                      <p className="text-sm text-gray-600">of Fly2Any earnings</p>
                      <p className="text-xs text-gray-500 mt-2">Your referrals' referrals</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border-2 border-primary-100">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="bg-primary-400 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">3</div>
                        <h3 className="font-bold text-gray-900">Level 3</h3>
                      </div>
                      <p className="text-2xl font-bold text-primary-400 mb-1">1%</p>
                      <p className="text-sm text-gray-600">of Fly2Any earnings</p>
                      <p className="text-xs text-gray-500 mt-2">Third level down</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-4 text-center">
                    10 points = $1 USD • Rewards are calculated based on Fly2Any's commission per booking
                  </p>
                </div>

                {/* Product Multipliers */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="font-bold text-gray-900 mb-3">Product Multipliers</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-lg font-bold text-gray-900">1.0x</p>
                      <p className="text-xs text-gray-600">Flights</p>
                    </div>
                    <div className="text-center p-3 bg-info-50 rounded-lg">
                      <p className="text-lg font-bold text-primary-500">1.2x</p>
                      <p className="text-xs text-gray-600">International</p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <p className="text-lg font-bold text-purple-600">1.5x</p>
                      <p className="text-xs text-gray-600">Hotels</p>
                    </div>
                    <div className="text-center p-3 bg-primary-50 rounded-lg">
                      <p className="text-lg font-bold text-primary-600">2.0x</p>
                      <p className="text-xs text-gray-600">Packages</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Points Locking System */}
              <div className="bg-warning-50 border-l-4 border-warning-500 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-warning-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-warning-900 mb-2">Points Locking System (Anti-Fraud)</h3>
                    <p className="text-sm text-warning-800 mb-2">
                      All earned points are <strong>locked</strong> until the trip completes successfully:
                    </p>
                    <ul className="text-sm text-warning-700 space-y-1">
                      <li>• Points are locked when a booking is made</li>
                      <li>• Trip must complete 100% successfully (no cancellations)</li>
                      <li>• 48-hour grace period after trip ends to detect issues</li>
                      <li>• Once verified, points unlock and become available to use</li>
                      <li>• Cancelled or refunded bookings forfeit all locked points</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Share via Social Media */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Share2 className="w-5 h-5 text-primary-600" />
                  <h2 className="text-xl font-bold text-gray-900">Share Your Code</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <button
                    onClick={() => shareVia('twitter')}
                    className="flex items-center justify-center gap-2 bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white px-4 py-3 rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <Twitter className="w-5 h-5" />
                    Twitter
                  </button>
                  <button
                    onClick={() => shareVia('facebook')}
                    className="flex items-center justify-center gap-2 bg-[#1877F2] hover:bg-[#166fe5] text-white px-4 py-3 rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <Facebook className="w-5 h-5" />
                    Facebook
                  </button>
                  <button
                    onClick={() => shareVia('whatsapp')}
                    className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#22c55e] text-white px-4 py-3 rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <MessageCircle className="w-5 h-5" />
                    WhatsApp
                  </button>
                  <button
                    onClick={() => shareVia('email')}
                    className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-800 text-white px-4 py-3 rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <Mail className="w-5 h-5" />
                    Email
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'network' && networkTree && (
            <div className="space-y-6">
              {/* Network Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-primary-50 rounded-lg p-4 border border-primary-200">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-5 h-5 text-primary-600" />
                    <p className="font-semibold text-gray-900">Level 1</p>
                  </div>
                  <p className="text-3xl font-bold text-primary-600">{networkTree.byLevel.level1.length}</p>
                  <p className="text-sm text-gray-600">Direct referrals (5% of earnings)</p>
                </div>
                <div className="bg-info-50 rounded-lg p-4 border border-info-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-primary-500" />
                    <p className="font-semibold text-gray-900">Level 2</p>
                  </div>
                  <p className="text-3xl font-bold text-primary-500">{networkTree.byLevel.level2.length}</p>
                  <p className="text-sm text-gray-600">Second level (2% of earnings)</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Network className="w-5 h-5 text-purple-600" />
                    <p className="font-semibold text-gray-900">Level 3</p>
                  </div>
                  <p className="text-3xl font-bold text-purple-600">{networkTree.byLevel.level3.length}</p>
                  <p className="text-sm text-gray-600">Third level (1% of earnings)</p>
                </div>
              </div>

              {/* Network Members by Level */}
              {[1, 2, 3].map((level) => {
                const members = networkTree.byLevel[`level${level}` as keyof typeof networkTree.byLevel];
                if (members.length === 0) return null;

                return (
                  <div key={level}>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">Level {level} Members ({members.length})</h3>
                    <div className="space-y-2">
                      {members.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-primary-300 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              level === 1 ? 'bg-primary-100' : level === 2 ? 'bg-info-100' : 'bg-purple-100'
                            }`}>
                              <User className={`w-5 h-5 ${
                                level === 1 ? 'text-primary-600' : level === 2 ? 'text-primary-500' : 'text-purple-600'
                              }`} />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{member.referee.name || 'New User'}</p>
                              <p className="text-sm text-gray-500">{member.referee.email}</p>
                              <p className="text-xs text-gray-400">
                                Joined {new Date(member.referee.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(member.status)}`}>
                              {getStatusLabel(member.status)}
                            </span>
                            <div className="mt-2 text-sm text-gray-600">
                              <p>{member.totalBookings} bookings</p>
                              <p className="font-semibold text-primary-600">{member.totalPointsEarned.toLocaleString()} pts earned</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {networkTree.total === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 font-semibold mb-2">No referrals yet</p>
                  <p className="text-sm text-gray-500">Share your referral code to start building your network!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      </div>{/* Close content wrapper */}
    </div>
  );
}
