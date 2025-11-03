'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  DollarSign,
  TrendingUp,
  Users,
  Calendar,
  MapPin,
  Plus,
  Crown,
  Mail,
  Check,
  X,
  Clock,
  Award,
  Sparkles,
  History,
  ArrowRight,
  ExternalLink,
  Gift,
  Target,
  Zap,
} from 'lucide-react';

interface CreditBalance {
  balance: number;
  lifetimeEarned: number;
  lifetimeSpent: number;
  pendingBalance: number;
  tier?: string;
  bonusMultiplier?: number;
}

interface Trip {
  id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  category: string;
  currentMembers: number;
  maxMembers: number;
  estimatedPricePerPerson: number;
  status: string;
  featured: boolean;
  trending: boolean;
  coverImageUrl: string;
  role?: string; // creator, admin, member
}

interface Transaction {
  id: string;
  amount: number;
  type: 'reward' | 'redemption' | 'bonus' | 'refund';
  source: string;
  description: string;
  status: string;
  createdAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [credits, setCredits] = useState<CreditBalance | null>(null);
  const [myTrips, setMyTrips] = useState<Trip[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'created' | 'joined'>('created');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch credit balance
      const creditsResponse = await fetch('/api/tripmatch/credits');
      const creditsData = await creditsResponse.json();
      if (creditsData.success) {
        setCredits(creditsData.data);
      }

      // Fetch transaction history
      const historyResponse = await fetch('/api/tripmatch/credits/history?limit=5');
      const historyData = await historyResponse.json();
      if (historyData.success) {
        setRecentTransactions(historyData.data || []);
      }

      // Fetch trips (for now, get all trips - in production, filter by user)
      const tripsResponse = await fetch('/api/tripmatch/trips?limit=50');
      const tripsData = await tripsResponse.json();
      if (tripsData.success) {
        setMyTrips(tripsData.data || []);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'reward':
        return <Award className="w-4 h-4 text-green-500" />;
      case 'redemption':
        return <DollarSign className="w-4 h-4 text-blue-500" />;
      case 'bonus':
        return <Gift className="w-4 h-4 text-purple-500" />;
      case 'refund':
        return <ArrowRight className="w-4 h-4 text-orange-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'reward':
      case 'bonus':
      case 'refund':
        return 'text-green-500';
      case 'redemption':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white/80">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const createdTrips = myTrips.filter((t) => t.status !== 'completed');
  const joinedTrips = myTrips.filter((t) => t.status !== 'completed');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-2">Dashboard</h1>
          <p className="text-white/60">Manage your trips, credits, and rewards</p>
        </div>

        {/* Credit Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Main Balance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-6 text-white"
          >
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8" />
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Available</span>
            </div>
            <p className="text-sm opacity-80 mb-1">Credit Balance</p>
            <p className="text-4xl font-black mb-1">{credits?.balance || 0}</p>
            <p className="text-sm opacity-80">${((credits?.balance || 0) * 0.1).toFixed(2)} USD value</p>
          </motion.div>

          {/* Lifetime Earned */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-white"
          >
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
            <p className="text-sm opacity-80 mb-1">Lifetime Earned</p>
            <p className="text-4xl font-black text-green-400 mb-1">{credits?.lifetimeEarned || 0}</p>
            <p className="text-sm opacity-80">Total credits earned</p>
          </motion.div>

          {/* Lifetime Spent */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-white"
          >
            <div className="flex items-center justify-between mb-4">
              <Award className="w-8 h-8 text-blue-400" />
            </div>
            <p className="text-sm opacity-80 mb-1">Lifetime Spent</p>
            <p className="text-4xl font-black text-blue-400 mb-1">{credits?.lifetimeSpent || 0}</p>
            <p className="text-sm opacity-80">Credits redeemed</p>
          </motion.div>

          {/* Pending */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-white"
          >
            <div className="flex items-center justify-between mb-4">
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
            <p className="text-sm opacity-80 mb-1">Pending Credits</p>
            <p className="text-4xl font-black text-yellow-400 mb-1">{credits?.pendingBalance || 0}</p>
            <p className="text-sm opacity-80">Being processed</p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: My Trips */}
          <div className="lg:col-span-2 space-y-6">
            {/* My Trips Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">My Trips</h2>
                <Link href="/tripmatch/create">
                  <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl flex items-center gap-2 transition-colors font-bold">
                    <Plus className="w-5 h-5" />
                    Create Trip
                  </button>
                </Link>
              </div>

              {/* Tabs */}
              <div className="flex gap-4 mb-6 border-b border-white/10">
                <button
                  onClick={() => setActiveTab('created')}
                  className={`pb-3 px-1 font-bold transition-all ${
                    activeTab === 'created'
                      ? 'text-purple-400 border-b-2 border-purple-400'
                      : 'text-white/60 hover:text-white/80'
                  }`}
                >
                  Created ({createdTrips.length})
                </button>
                <button
                  onClick={() => setActiveTab('joined')}
                  className={`pb-3 px-1 font-bold transition-all ${
                    activeTab === 'joined'
                      ? 'text-purple-400 border-b-2 border-purple-400'
                      : 'text-white/60 hover:text-white/80'
                  }`}
                >
                  Joined ({joinedTrips.length})
                </button>
              </div>

              {/* Trip Grid */}
              <div className="space-y-4">
                {(activeTab === 'created' ? createdTrips : joinedTrips).slice(0, 6).map((trip) => (
                  <Link key={trip.id} href={`/tripmatch/trips/${trip.id}`}>
                    <div className="bg-white/5 rounded-xl overflow-hidden hover:bg-white/10 transition-all border border-white/10 cursor-pointer group">
                      <div className="flex gap-4">
                        {/* Trip Image */}
                        <div
                          className="w-32 h-32 bg-cover bg-center flex-shrink-0 relative"
                          style={{ backgroundImage: `url(${trip.coverImageUrl})` }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-slate-900/50" />
                          {trip.trending && (
                            <div className="absolute top-2 left-2 bg-orange-500 px-2 py-1 rounded-lg text-white text-xs font-bold">
                              🔥 Trending
                            </div>
                          )}
                        </div>

                        {/* Trip Info */}
                        <div className="flex-1 py-3 pr-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-bold text-white text-lg group-hover:text-purple-400 transition-colors">
                                {trip.title}
                              </h3>
                              <p className="text-sm text-white/60 flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {trip.destination}
                              </p>
                            </div>
                            <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full border border-purple-500/30 capitalize">
                              {trip.category.replace('_', ' ')}
                            </span>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-white/60 mb-2">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(trip.startDate)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              <span>
                                {trip.currentMembers}/{trip.maxMembers} members
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <p className="text-lg font-bold text-white">
                              ${Math.floor(trip.estimatedPricePerPerson)}
                              <span className="text-sm font-normal text-white/60">/person</span>
                            </p>
                            <ArrowRight className="w-5 h-5 text-purple-400 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}

                {(activeTab === 'created' ? createdTrips : joinedTrips).length === 0 && (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-white/20 mx-auto mb-4" />
                    <p className="text-white/60 mb-4">
                      {activeTab === 'created'
                        ? "You haven't created any trips yet"
                        : "You haven't joined any trips yet"}
                    </p>
                    <Link href="/tripmatch/create">
                      <button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition-colors">
                        Create Your First Trip
                      </button>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right Column: Stats & Activity */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
            >
              <h3 className="text-lg font-bold text-white mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <Crown className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm text-white/60">Trips Created</p>
                      <p className="text-xl font-bold text-white">{createdTrips.length}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <Users className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-white/60">Trips Joined</p>
                      <p className="text-xl font-bold text-white">{joinedTrips.length}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      <Target className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-white/60">Completion Rate</p>
                      <p className="text-xl font-bold text-white">92%</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Recent Transactions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Recent Activity</h3>
                <Link href="/tripmatch/credits/history">
                  <button className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1">
                    View All
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>

              <div className="space-y-3">
                {recentTransactions.slice(0, 5).map((txn) => (
                  <div
                    key={txn.id}
                    className="flex items-start justify-between bg-white/5 rounded-lg p-3 border border-white/10"
                  >
                    <div className="flex items-start gap-3">
                      {getTransactionIcon(txn.type)}
                      <div>
                        <p className="text-sm font-medium text-white">{txn.description}</p>
                        <p className="text-xs text-white/60">
                          {new Date(txn.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <p className={`font-bold text-sm ${getTransactionColor(txn.type)}`}>
                      {txn.type === 'redemption' ? '-' : '+'}
                      {txn.amount}
                    </p>
                  </div>
                ))}

                {recentTransactions.length === 0 && (
                  <div className="text-center py-8">
                    <History className="w-12 h-12 text-white/20 mx-auto mb-3" />
                    <p className="text-sm text-white/60">No recent activity</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Earn More Credits CTA */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl p-6 text-white"
            >
              <Zap className="w-10 h-10 mb-3" />
              <h3 className="text-xl font-bold mb-2">Earn More Credits!</h3>
              <p className="text-sm opacity-90 mb-4">
                Create trips and invite friends to earn up to 100 credits per member.
              </p>
              <Link href="/tripmatch/create">
                <button className="w-full py-3 bg-white text-orange-600 font-bold rounded-xl hover:bg-gray-100 transition-colors">
                  Start Earning
                </button>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
