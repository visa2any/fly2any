'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Gift,
  Users,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Share2,
  Zap,
  Award,
  Clock,
  Shield,
  Network,
  Coins,
  Plane,
  Heart,
  ChevronDown,
  Copy,
  Twitter,
  Facebook,
  Mail,
  MessageCircle,
} from 'lucide-react';

// 3-Level Network Data
const LEVELS = [
  { level: 1, icon: '🥇', title: 'Direct Referrals', rate: '5%', color: 'from-emerald-500 to-green-600', points: 50, desc: 'People you refer directly' },
  { level: 2, icon: '🥈', title: 'Friends of Friends', rate: '2%', color: 'from-blue-500 to-cyan-600', points: 20, desc: 'Their referrals' },
  { level: 3, icon: '🥉', title: 'Extended Network', rate: '1%', color: 'from-purple-500 to-pink-600', points: 10, desc: 'Third level down' },
];

// FAQ Data
const FAQ_ITEMS = [
  { q: 'How do I get my referral link?', a: 'Sign up and get your unique link instantly in your dashboard. Share via social media, email, or messaging.' },
  { q: 'When do I earn points?', a: 'Points are earned when your network completes trips. Points are locked until trip completion to prevent fraud.' },
  { q: 'Do points expire?', a: 'Never! Your points stay forever. No rush, no expiration dates.' },
  { q: 'How do I redeem points?', a: 'Apply points at checkout for instant discounts. 10 points = $1. Minimum redemption is $10.' },
  { q: 'Is there a limit?', a: 'No limits! Build a network of 100+ people and earn thousands of points monthly.' },
];

export default function ReferPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGetStarted = () => {
    router.push(session ? '/account/referrals' : '/auth/signin?callbackUrl=/account/referrals');
  };

  const copyCode = () => {
    navigator.clipboard.writeText('FLY2ANY');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">
      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#F7C928]/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80')] bg-cover bg-center opacity-10" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8"
          >
            <Gift className="w-4 h-4 text-[#F7C928]" />
            <span className="text-sm font-medium">3-Level Rewards Network</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight"
          >
            Refer Friends,{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-[#F7C928] bg-clip-text text-transparent">
              Earn Forever
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto"
          >
            Share Fly2Any and earn points on every booking in your 3-level network. Points never expire!
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <button
              onClick={handleGetStarted}
              className="group px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl font-bold text-lg hover:scale-105 transition-all shadow-2xl shadow-emerald-500/30 flex items-center justify-center gap-2"
            >
              <span>{session ? 'View My Rewards' : 'Start Earning Free'}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/30 rounded-2xl font-bold text-lg hover:bg-white/20 transition-all"
            >
              How It Works
            </button>
          </motion.div>

          {/* Hero Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
          >
            {[
              { value: '5%', label: 'Level 1 Earnings', icon: TrendingUp },
              { value: '3', label: 'Levels Deep', icon: Network },
              { value: '∞', label: 'Points Never Expire', icon: Clock },
              { value: '$0', label: 'Free to Join', icon: Shield },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <stat.icon className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                <div className="text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2"
          >
            <div className="w-1.5 h-3 bg-white/50 rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* 3-LEVEL NETWORK SECTION */}
      <section id="how-it-works" className="py-24 bg-gradient-to-b from-black to-gray-900 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-400 text-sm font-bold mb-4">
              <Network className="w-4 h-4" />
              3-LEVEL NETWORK
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Earn From <span className="text-emerald-400">3 Levels</span> Deep
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Not just your referrals - earn when their referrals book too!
            </p>
          </motion.div>

          {/* Level Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {LEVELS.map((level, i) => (
              <motion.div
                key={level.level}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className={`bg-gradient-to-br ${level.color} rounded-3xl p-8 text-center text-white shadow-2xl relative overflow-hidden`}
              >
                {level.level === 1 && (
                  <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold">
                    BEST
                  </div>
                )}
                <div className="text-6xl mb-4">{level.icon}</div>
                <h3 className="text-2xl font-bold mb-1">Level {level.level}</h3>
                <p className="text-white/80 text-sm mb-4">{level.title}</p>
                <div className="bg-black/20 rounded-2xl p-4 mb-4">
                  <div className="text-4xl font-black">{level.rate}</div>
                  <div className="text-sm text-white/70">of Fly2Any earnings</div>
                </div>
                <p className="text-sm text-white/70">{level.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-5" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F7C928]/10 text-[#F7C928] text-sm font-bold mb-4">
              <Zap className="w-4 h-4" />
              HOW IT WORKS
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Start in <span className="text-[#F7C928]">3 Simple Steps</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', icon: Share2, title: 'Share Your Link', desc: 'Get your unique referral link and share via social media, email, or messaging.' },
              { step: '2', icon: Users, title: 'Friends Sign Up', desc: 'When they join using your link, they become part of your network.' },
              { step: '3', icon: Sparkles, title: 'Earn Forever', desc: 'Earn points every time anyone in your 3-level network books. Points never expire!' },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10"
              >
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {item.step}
                </div>
                <div className="pt-4">
                  <item.icon className="w-10 h-10 text-emerald-400 mb-4" />
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-gray-400">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* BENEFITS SECTION */}
      <section className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 text-purple-400 text-sm font-bold mb-4">
              <Award className="w-4 h-4" />
              BENEFITS
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Why <span className="text-purple-400">Join</span> Fly2Any Rewards?
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Coins, title: 'Points Never Expire', desc: 'Use them whenever you want', color: 'text-yellow-400' },
              { icon: Plane, title: 'Easy Redemption', desc: '10 points = $1 on any booking', color: 'text-blue-400' },
              { icon: Network, title: '3-Level Network', desc: 'Passive income keeps growing', color: 'text-purple-400' },
              { icon: Shield, title: 'Secure & Transparent', desc: 'Real-time tracking dashboard', color: 'text-green-400' },
              { icon: Zap, title: 'Instant Tracking', desc: 'See earnings in real-time', color: 'text-orange-400' },
              { icon: Heart, title: 'Help Friends Save', desc: 'Share great travel deals', color: 'text-pink-400' },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all"
              >
                <item.icon className={`w-8 h-8 ${item.color} mb-4`} />
                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-24 bg-gray-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Frequently Asked <span className="text-emerald-400">Questions</span>
            </h2>
          </motion.div>

          <div className="space-y-4">
            {FAQ_ITEMS.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                >
                  <span className="font-semibold text-lg">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-6 pb-5"
                    >
                      <p className="text-gray-400">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 bg-gradient-to-r from-emerald-500 to-green-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-10" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Gift className="w-16 h-16 text-white mx-auto mb-6" />
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
              Ready to Start Earning?
            </h2>
            <p className="text-xl text-white/90 mb-10">
              Join thousands already earning rewards with Fly2Any
            </p>
            <button
              onClick={handleGetStarted}
              className="px-12 py-6 bg-white text-gray-900 rounded-2xl font-bold text-xl hover:scale-105 transition-all shadow-2xl inline-flex items-center gap-3"
            >
              <span>{session ? 'Go to Dashboard' : 'Create Free Account'}</span>
              <ArrowRight className="w-6 h-6" />
            </button>
            <p className="text-white/80 mt-6 text-sm">
              No credit card • Free forever • Start in 2 minutes
            </p>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
