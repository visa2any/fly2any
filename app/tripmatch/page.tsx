'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Users,
  MapPin,
  Calendar,
  DollarSign,
  TrendingUp,
  Crown,
  Award,
  Zap,
  Heart,
  ArrowRight,
  Search,
  Globe,
  Shield,
  Target,
  Gift,
  Star,
} from 'lucide-react';
import LiveActivityFeed from '@/components/tripmatch/LiveActivityFeed';

interface FeaturedTrip {
  id: string;
  title: string;
  destination: string;
  startDate: string;
  category: string;
  currentMembers: number;
  maxMembers: number;
  estimatedPricePerPerson: number;
  coverImageUrl: string;
  featured: boolean;
  trending: boolean;
}

export default function TripMatchHomePage() {
  const [featuredTrips, setFeaturedTrips] = useState<FeaturedTrip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedTrips();
  }, []);

  const fetchFeaturedTrips = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tripmatch/trips?featured=true&limit=6');
      const data = await response.json();

      if (data.success) {
        setFeaturedTrips(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching featured trips:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute -bottom-32 left-1/2 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }}></div>
        </div>

        <div className="container mx-auto px-4 py-20 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Logo/Brand */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-2xl">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-white">
                Trip<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Match</span>
              </h1>
            </div>

            {/* Tagline */}
            <p className="text-2xl md:text-3xl text-white/90 font-bold mb-4">
              The Social Network for Group Travel
            </p>

            <p className="text-lg md:text-xl text-white/70 mb-8 max-w-2xl mx-auto">
              Create trips, invite friends, and earn travel credits. Turn your dream destinations into reality by building groups and sharing costs.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link href="/tripmatch/browse">
                <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-2xl hover:scale-105 flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Browse Trips
                </button>
              </Link>

              <Link href="/tripmatch/create">
                <button className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white font-bold text-lg rounded-xl hover:bg-white/20 transition-all flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Create a Trip
                </button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-white/60">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span className="text-sm font-medium">10,000+ Travelers</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                <span className="text-sm font-medium">500+ Destinations</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                <span className="text-sm font-medium">4.9 Average Rating</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">How TripMatch Works</h2>
          <p className="text-white/70 text-lg">Simple, social, and rewarding</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Step 1 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-400 flex items-center justify-center mb-6 shadow-xl">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">1. Create Your Trip</h3>
            <p className="text-white/70">
              Set your destination, dates, budget, and group size. Customize your trip with activities, preferences, and rules.
            </p>
          </motion.div>

          {/* Step 2 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-600 to-pink-400 flex items-center justify-center mb-6 shadow-xl">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">2. Build Your Group</h3>
            <p className="text-white/70">
              Invite friends or make your trip public. Chat with members, coordinate details, and build excitement together.
            </p>
          </motion.div>

          {/* Step 3 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-600 to-cyan-400 flex items-center justify-center mb-6 shadow-xl">
              <DollarSign className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">3. Earn Credits</h3>
            <p className="text-white/70">
              Earn up to 100 credits per member who joins. Redeem credits for discounts on flights, hotels, and future trips.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Featured Trips */}
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-2">Featured Trips</h2>
            <p className="text-white/70">Trending adventures waiting for you</p>
          </div>

          <Link href="/tripmatch/browse">
            <button className="hidden md:flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-bold rounded-xl hover:bg-white/20 transition-all">
              View All
              <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredTrips.map((trip, index) => (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={`/tripmatch/trips/${trip.id}`}>
                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:bg-white/10 transition-all group cursor-pointer">
                    {/* Trip Image */}
                    <div className="relative h-48">
                      <div
                        className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                        style={{ backgroundImage: `url(${trip.coverImageUrl})` }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />

                      {/* Badges */}
                      {trip.trending && (
                        <div className="absolute top-3 left-3 bg-orange-500 px-3 py-1 rounded-lg flex items-center gap-1 text-white text-xs font-bold">
                          <TrendingUp className="w-3 h-3" />
                          Trending
                        </div>
                      )}
                      {trip.featured && (
                        <div className="absolute top-3 right-3 bg-yellow-500 px-3 py-1 rounded-lg flex items-center gap-1 text-white text-xs font-bold">
                          <Crown className="w-3 h-3" />
                          Featured
                        </div>
                      )}

                      {/* Price */}
                      <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm px-3 py-2 rounded-lg">
                        <p className="text-white font-bold">
                          ${Math.floor(trip.estimatedPricePerPerson / 100).toLocaleString()}
                        </p>
                        <p className="text-white/70 text-xs">per person</p>
                      </div>
                    </div>

                    {/* Trip Info */}
                    <div className="p-4">
                      <h3 className="font-bold text-white text-lg mb-2 group-hover:text-purple-400 transition-colors line-clamp-1">
                        {trip.title}
                      </h3>

                      <div className="flex items-center gap-1 text-white/60 text-sm mb-3">
                        <MapPin className="w-4 h-4" />
                        <span className="line-clamp-1">{trip.destination}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-sm">
                          <Users className="w-4 h-4 text-white/60" />
                          <span className="font-bold text-white">
                            {trip.currentMembers}/{trip.maxMembers}
                          </span>
                          <span className="text-white/60 ml-1">members</span>
                        </div>

                        <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full border border-purple-500/30 capitalize">
                          {trip.category.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* Mobile View All Button */}
        <div className="md:hidden mt-8 text-center">
          <Link href="/tripmatch/browse">
            <button className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-bold rounded-xl hover:bg-white/20 transition-all flex items-center justify-center gap-2">
              View All Trips
              <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
        </div>
      </div>

      {/* Live Activity Feed - Social Proof */}
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-purple-600/10 to-pink-600/10 backdrop-blur-sm rounded-3xl p-8 border border-white/10"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-white mb-2">
                Live Activity
              </h2>
              <p className="text-white/70">See what travelers are doing right now</p>
            </div>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          </div>
          <LiveActivityFeed limit={10} autoRefresh={true} refreshInterval={10000} />
        </motion.div>
      </div>

      {/* Stats Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
              10K+
            </div>
            <p className="text-white/70 font-medium">Active Travelers</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-center"
          >
            <div className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 mb-2">
              500+
            </div>
            <p className="text-white/70 font-medium">Destinations</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <div className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400 mb-2">
              $2M+
            </div>
            <p className="text-white/70 font-medium">Credits Earned</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <div className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400 mb-2">
              4.9★
            </div>
            <p className="text-white/70 font-medium">Average Rating</p>
          </motion.div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-white/10">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-8 text-center">Why Choose TripMatch?</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-4 shadow-xl">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Save Money</h3>
              <p className="text-white/70 text-sm">Split costs and earn up to 100 credits per member on trips you create</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-4 shadow-xl">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Safe & Secure</h3>
              <p className="text-white/70 text-sm">Verified users, secure payments, trip insurance, and 24/7 support</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mx-auto mb-4 shadow-xl">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Make Friends</h3>
              <p className="text-white/70 text-sm">Connect with like-minded travelers and build lasting friendships worldwide</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4 shadow-xl">
                <Gift className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Rewards</h3>
              <p className="text-white/70 text-sm">Earn credits, unlock perks, level up your tier, and get bonus multipliers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">What Travelers Say</h2>
          <p className="text-white/70 text-lg">Real experiences from our community</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Testimonial 1 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold">
                S
              </div>
              <div>
                <h4 className="text-white font-bold">Sarah M.</h4>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>
            </div>
            <p className="text-white/80 text-sm leading-relaxed">
              "Created a Bali trip and earned 800 credits! Used them for my next booking. TripMatch made group travel so easy and rewarding."
            </p>
          </motion.div>

          {/* Testimonial 2 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full flex items-center justify-center text-white font-bold">
                M
              </div>
              <div>
                <h4 className="text-white font-bold">Marcus K.</h4>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>
            </div>
            <p className="text-white/80 text-sm leading-relaxed">
              "Joined an adventure trip to Iceland and made lifelong friends. The credit system is genius - everyone benefits!"
            </p>
          </motion.div>

          {/* Testimonial 3 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full flex items-center justify-center text-white font-bold">
                J
              </div>
              <div>
                <h4 className="text-white font-bold">Jessica L.</h4>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>
            </div>
            <p className="text-white/80 text-sm leading-relaxed">
              "Best travel platform ever! Saved $600 on our Japan trip by splitting costs. Already planning trip #3!"
            </p>
          </motion.div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-12 text-center"
        >
          <Zap className="w-16 h-16 text-white mx-auto mb-6" />
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Ready to Start Your Adventure?</h2>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of travelers creating unforgettable experiences together. Your next adventure is just a click away.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/tripmatch/create">
              <button className="px-8 py-4 bg-white text-purple-600 font-bold text-lg rounded-xl hover:bg-gray-100 transition-all shadow-xl hover:scale-105 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Create Your First Trip
              </button>
            </Link>

            <Link href="/tripmatch/browse">
              <button className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white font-bold text-lg rounded-xl hover:bg-white/20 transition-all flex items-center gap-2">
                <Search className="w-5 h-5" />
                Explore Trips
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
