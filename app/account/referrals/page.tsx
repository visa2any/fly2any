'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import {
  Gift,
  Copy,
  Share2,
  Users,
  DollarSign,
  TrendingUp,
  Twitter,
  Facebook,
  Mail,
  MessageCircle,
  CheckCircle,
  Clock,
  Sparkles
} from 'lucide-react';

interface ReferralData {
  code: string;
  referralUrl: string;
  stats: {
    completedReferrals: number;
    pendingReferrals: number;
    totalCreditsEarned: number;
    recentReferrals: Array<{
      name: string;
      status: string;
      date: string;
    }>;
  };
}

export default function ReferralsPage() {
  const { data: session, status } = useSession();
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchReferralData();
    }
  }, [status]);

  const fetchReferralData = async () => {
    try {
      setLoading(true);

      // Try to get existing referral code
      let response = await fetch('/api/referrals/generate');
      let data = await response.json();

      // If no code exists, generate one
      if (!data.data || !data.data.code) {
        response = await fetch('/api/referrals/generate', { method: 'POST' });
        data = await response.json();
      }

      if (data.success && data.data) {
        setReferralData(data.data);
      } else {
        toast.error('Failed to load referral data');
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

  const shareVia = (platform: string) => {
    if (!referralData) return;

    const { referralUrl, code } = referralData;
    const message = `Join me on Fly2any and get 50 credits! Use my referral code: ${code}`;
    const encodedMessage = encodeURIComponent(message);
    const encodedUrl = encodeURIComponent(referralUrl);

    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodedMessage}&url=${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedMessage}`,
      whatsapp: `https://wa.me/?text=${encodedMessage}%20${encodedUrl}`,
      email: `mailto:?subject=Join%20Fly2any&body=${encodedMessage}%20${encodedUrl}`,
    };

    window.open(urls[platform], '_blank', 'width=600,height=400');
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
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
            <Gift className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Refer & Earn</h1>
            <p className="text-primary-100 mt-1">Share the love and earn travel credits</p>
          </div>
        </div>

        {/* Referral Code Display */}
        {referralData && (
          <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <p className="text-sm text-primary-100 mb-2">Your Referral Code</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-white/20 rounded-lg px-6 py-4 font-mono text-2xl font-bold tracking-wider">
                {referralData.code}
              </div>
              <button
                onClick={() => copyToClipboard(referralData.code, 'Referral code')}
                className="bg-white text-primary-600 hover:bg-primary-50 px-6 py-4 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
              >
                {copied ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            {/* Referral URL */}
            <div className="mt-4">
              <p className="text-sm text-primary-100 mb-2">Shareable Link</p>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={referralData.referralUrl}
                  readOnly
                  className="flex-1 bg-white/20 border border-white/30 rounded-lg px-4 py-2 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-white/50"
                />
                <button
                  onClick={() => copyToClipboard(referralData.referralUrl, 'Referral link')}
                  className="bg-white/20 hover:bg-white/30 border border-white/30 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy Link
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      {referralData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-primary-100 rounded-lg p-3">
                <Users className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Total Referrals</p>
                <p className="text-2xl font-bold text-gray-900">{referralData.stats.completedReferrals}</p>
              </div>
            </div>
            {referralData.stats.pendingReferrals > 0 && (
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {referralData.stats.pendingReferrals} pending
              </p>
            )}
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="bg-success-100 rounded-lg p-3">
                <DollarSign className="w-6 h-6 text-success-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Credits Earned</p>
                <p className="text-2xl font-bold text-gray-900">{referralData.stats.totalCreditsEarned}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="bg-warning-100 rounded-lg p-3">
                <TrendingUp className="w-6 h-6 text-warning-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Potential Earnings</p>
                <p className="text-2xl font-bold text-gray-900">
                  {referralData.stats.pendingReferrals * 100}
                </p>
                <p className="text-xs text-gray-500">({referralData.stats.pendingReferrals} × 100 credits)</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* How It Works */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-primary-600" />
          <h2 className="text-xl font-bold text-gray-900">How It Works</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="bg-primary-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-primary-600 font-bold text-lg">1</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Share Your Code</h3>
            <p className="text-sm text-gray-600">
              Share your unique referral code or link with friends and family
            </p>
          </div>
          <div className="text-center">
            <div className="bg-primary-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-primary-600 font-bold text-lg">2</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">They Sign Up</h3>
            <p className="text-sm text-gray-600">
              Your friend signs up and gets 50 credits instantly
            </p>
          </div>
          <div className="text-center">
            <div className="bg-primary-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-primary-600 font-bold text-lg">3</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">You Earn Credits</h3>
            <p className="text-sm text-gray-600">
              When they make their first booking, you earn 100 credits
            </p>
          </div>
        </div>
      </div>

      {/* Share via Social Media */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Share2 className="w-5 h-5 text-primary-600" />
          <h2 className="text-xl font-bold text-gray-900">Share via Social Media</h2>
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

      {/* Recent Referrals */}
      {referralData && referralData.stats.recentReferrals.length > 0 && (
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Referrals</h2>
          <div className="space-y-3">
            {referralData.stats.recentReferrals.map((referral, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-primary-100 w-10 h-10 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{referral.name}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(referral.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                <div>
                  {referral.status === 'completed' ? (
                    <span className="flex items-center gap-1 px-3 py-1 bg-success-100 text-success-700 text-xs font-bold rounded-full">
                      <CheckCircle className="w-3 h-3" />
                      Completed
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 px-3 py-1 bg-warning-100 text-warning-700 text-xs font-bold rounded-full">
                      <Clock className="w-3 h-3" />
                      Pending
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Terms & Conditions */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">Program Terms</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Referral codes must be used within 7 days of signup</li>
          <li>• You cannot use your own referral code</li>
          <li>• Credits are awarded when referred user makes their first booking</li>
          <li>• Credits do not expire and can be used for TripMatch features</li>
          <li>• Fly2any reserves the right to modify or terminate the program at any time</li>
        </ul>
      </div>
    </div>
  );
}
