'use client';

import { useState, useEffect, useMemo } from 'react';
import { MaxWidthContainer } from '@/components/layout/MaxWidthContainer';
import { toast } from 'react-hot-toast';
import {
  Star, MessageSquare, TrendingUp, Clock, ThumbsUp, ThumbsDown,
  Reply, Send
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface DemoReview {
  id: string;
  guestName: string;
  guestInitial: string;
  avatarColor: string;
  propertyName: string;
  rating: number;
  text: string;
  date: string; // ISO
}

// ---------------------------------------------------------------------------
// Demo data
// ---------------------------------------------------------------------------
const AVATAR_COLORS = [
  'bg-rose-500', 'bg-indigo-500', 'bg-emerald-500', 'bg-amber-500',
  'bg-sky-500', 'bg-violet-500', 'bg-teal-500', 'bg-pink-500',
  'bg-cyan-500', 'bg-orange-500',
];

const DEMO_REVIEWS: DemoReview[] = [
  {
    id: 'rev-001',
    guestName: 'Sarah Mitchell',
    guestInitial: 'S',
    avatarColor: AVATAR_COLORS[0],
    propertyName: 'Skyline Penthouse Suite',
    rating: 5,
    text: 'Absolutely stunning property! The views from the terrace were breathtaking and the host was incredibly responsive. Everything was spotless and the check-in process was seamless. Would definitely stay here again.',
    date: '2026-03-05T14:30:00Z',
  },
  {
    id: 'rev-002',
    guestName: 'James Rodriguez',
    guestInitial: 'J',
    avatarColor: AVATAR_COLORS[1],
    propertyName: 'Beachfront Villa Malibu',
    rating: 4,
    text: 'Great location right on the beach. The villa was beautiful and well-maintained. Only minor issue was the Wi-Fi being a bit slow in the evenings. Otherwise a fantastic stay for our family vacation.',
    date: '2026-03-03T09:15:00Z',
  },
  {
    id: 'rev-003',
    guestName: 'Emily Chen',
    guestInitial: 'E',
    avatarColor: AVATAR_COLORS[2],
    propertyName: 'Downtown Loft Experience',
    rating: 5,
    text: 'Perfect city getaway! Walking distance to everything we wanted to see. The loft was stylishly decorated and had all the amenities we needed. The host left us a lovely welcome basket with local treats.',
    date: '2026-02-28T18:45:00Z',
  },
  {
    id: 'rev-004',
    guestName: 'Marcus Thompson',
    guestInitial: 'M',
    avatarColor: AVATAR_COLORS[3],
    propertyName: 'Skyline Penthouse Suite',
    rating: 3,
    text: 'The penthouse itself is gorgeous, but during our stay the hot water was inconsistent and we had to contact the host twice about it. The issue was eventually resolved but it took a day. Location and views are top-notch though.',
    date: '2026-02-25T11:20:00Z',
  },
  {
    id: 'rev-005',
    guestName: 'Olivia Patel',
    guestInitial: 'O',
    avatarColor: AVATAR_COLORS[4],
    propertyName: 'Mountain Retreat Cabin',
    rating: 5,
    text: 'This cabin is a dream come true! We spent a week here and didn\'t want to leave. The fireplace, the hot tub, the mountain views... pure magic. The host even arranged a guided hiking tour for us.',
    date: '2026-02-20T16:00:00Z',
  },
  {
    id: 'rev-006',
    guestName: 'David Kim',
    guestInitial: 'D',
    avatarColor: AVATAR_COLORS[5],
    propertyName: 'Beachfront Villa Malibu',
    rating: 2,
    text: 'Disappointed with our stay. The photos were misleading -- the property looked much larger online. The pool area was not as clean as expected and there were maintenance issues with the sliding doors. Expected more for the price point.',
    date: '2026-02-18T08:30:00Z',
  },
  {
    id: 'rev-007',
    guestName: 'Aisha Johnson',
    guestInitial: 'A',
    avatarColor: AVATAR_COLORS[6],
    propertyName: 'Downtown Loft Experience',
    rating: 4,
    text: 'Really enjoyed the loft. Modern, clean, and conveniently located. The only thing I\'d improve is adding blackout curtains -- the street lights made it hard to sleep. But overall a great experience and great value.',
    date: '2026-02-14T20:10:00Z',
  },
  {
    id: 'rev-008',
    guestName: 'Robert Zhang',
    guestInitial: 'R',
    avatarColor: AVATAR_COLORS[7],
    propertyName: 'Mountain Retreat Cabin',
    rating: 1,
    text: 'Unfortunately our stay was very problematic. The heating was broken when we arrived in freezing weather, and it took two days to get fixed. We had to buy space heaters. The host was apologetic but the response was too slow.',
    date: '2026-02-10T13:45:00Z',
  },
  {
    id: 'rev-009',
    guestName: 'Lisa Nakamura',
    guestInitial: 'L',
    avatarColor: AVATAR_COLORS[8],
    propertyName: 'Skyline Penthouse Suite',
    rating: 5,
    text: 'Exceeded all expectations. This is hands-down the best Airbnb-style stay I\'ve ever had. The attention to detail is remarkable -- from the premium linens to the fully stocked kitchen. Five stars all the way.',
    date: '2026-02-05T10:00:00Z',
  },
  {
    id: 'rev-010',
    guestName: 'Carlos Rivera',
    guestInitial: 'C',
    avatarColor: AVATAR_COLORS[9],
    propertyName: 'Beachfront Villa Malibu',
    rating: 4,
    text: 'Beautiful property with an amazing sunset view. The barbecue area was a highlight for our group. A couple of minor cleanliness issues upon arrival but the host sent someone within the hour to fix it. Would recommend.',
    date: '2026-01-30T15:20:00Z',
  },
];

const STORAGE_KEY = 'host-review-replies';

type FilterTab = 'all' | 'positive' | 'neutral' | 'negative' | 'unreplied';

// ---------------------------------------------------------------------------
// Stars component
// ---------------------------------------------------------------------------
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-neutral-200'}`}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Review Card
// ---------------------------------------------------------------------------
function ReviewCard({
  review,
  reply,
  onSaveReply,
}: {
  review: DemoReview;
  reply: string | null;
  onSaveReply: (id: string, text: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSend = () => {
    if (!replyText.trim()) return;
    setSaving(true);
    // Simulate tiny network delay for UX polish
    setTimeout(() => {
      onSaveReply(review.id, replyText.trim());
      setSaving(false);
      setExpanded(false);
      setReplyText('');
      toast.success('Reply saved successfully');
    }, 300);
  };

  const formattedDate = new Date(review.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="bg-white rounded-[2rem] border border-neutral-100 shadow-[0_1px_2px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.04)] p-6 sm:p-8 transition-all duration-300 hover:shadow-[0_1px_2px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.04),0_4px_8px_rgba(0,0,0,0.03)]">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full ${review.avatarColor} flex items-center justify-center text-white font-black text-sm shrink-0`}
          >
            {review.guestInitial}
          </div>
          <div>
            <p className="font-bold text-[#0A0A0A] text-sm">{review.guestName}</p>
            <p className="text-neutral-400 text-xs font-medium">{formattedDate}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {reply && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-wider border border-emerald-100">
              <MessageSquare className="w-3 h-3" />
              Replied
            </span>
          )}
          <StarRating rating={review.rating} />
        </div>
      </div>

      {/* Property badge */}
      <div className="mb-3">
        <span className="inline-flex items-center px-3 py-1 rounded-xl bg-neutral-50 text-neutral-500 text-[10px] font-black uppercase tracking-wider border border-neutral-100">
          {review.propertyName}
        </span>
      </div>

      {/* Review text */}
      <p className="text-[#1C1C1C] text-sm leading-relaxed mb-5">{review.text}</p>

      {/* Existing reply */}
      {reply && (
        <div className="bg-neutral-50 border border-neutral-100 rounded-2xl p-4 mb-4">
          <p className="text-[10px] font-black uppercase tracking-wider text-neutral-400 mb-2 flex items-center gap-1.5">
            <Reply className="w-3 h-3" /> Your Reply
          </p>
          <p className="text-[#1C1C1C] text-sm leading-relaxed">{reply}</p>
        </div>
      )}

      {/* Reply section */}
      {!reply && !expanded && (
        <button
          onClick={() => setExpanded(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-50 text-[#E74035] font-bold text-xs hover:bg-[#E74035] hover:text-white transition-all"
        >
          <Reply className="w-3.5 h-3.5" />
          Reply
        </button>
      )}

      {!reply && expanded && (
        <div className="mt-2">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write your reply to this review..."
            rows={3}
            className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-[#0A0A0A] placeholder-neutral-400 focus:outline-none focus:border-[#E74035] focus:ring-1 focus:ring-[#E74035]/20 resize-none transition-all"
          />
          <div className="flex items-center justify-end gap-2 mt-3">
            <button
              onClick={() => {
                setExpanded(false);
                setReplyText('');
              }}
              className="px-4 py-2 rounded-xl text-neutral-500 font-bold text-xs hover:bg-neutral-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={!replyText.trim() || saving}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#E74035] text-white font-bold text-xs hover:bg-[#D63930] transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_4px_12px_rgba(231,64,53,0.25)]"
            >
              <Send className="w-3.5 h-3.5" />
              {saving ? 'Sending...' : 'Send Reply'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------
export default function HostReviewsPage() {
  const [replies, setReplies] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  // Load replies from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setReplies(JSON.parse(stored));
    } catch {
      // ignore parse errors
    }
  }, []);

  const saveReply = (reviewId: string, text: string) => {
    setReplies((prev) => {
      const next = { ...prev, [reviewId]: text };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  // ---------- Computed stats ----------
  const totalReviews = DEMO_REVIEWS.length;
  const avgRating =
    totalReviews > 0
      ? (DEMO_REVIEWS.reduce((s, r) => s + r.rating, 0) / totalReviews).toFixed(1)
      : '0.0';
  const repliedCount = DEMO_REVIEWS.filter((r) => replies[r.id]).length;
  const responseRate = totalReviews > 0 ? Math.round((repliedCount / totalReviews) * 100) : 0;
  const avgResponseTime = repliedCount > 0 ? '2.4 hrs' : '--';

  // ---------- Filtered reviews ----------
  const filteredReviews = useMemo(() => {
    return DEMO_REVIEWS.filter((r) => {
      switch (activeTab) {
        case 'positive':
          return r.rating >= 4;
        case 'neutral':
          return r.rating === 3;
        case 'negative':
          return r.rating <= 2;
        case 'unreplied':
          return !replies[r.id];
        default:
          return true;
      }
    });
  }, [activeTab, replies]);

  // ---------- Tab config ----------
  const TABS: { key: FilterTab; label: string; icon: any }[] = [
    { key: 'all', label: 'All', icon: MessageSquare },
    { key: 'positive', label: 'Positive', icon: ThumbsUp },
    { key: 'neutral', label: 'Neutral', icon: Clock },
    { key: 'negative', label: 'Negative', icon: ThumbsDown },
    { key: 'unreplied', label: 'Unreplied', icon: Reply },
  ];

  return (
    <div className="min-h-screen bg-[#FDFDFD] pt-4 pb-20">
      <MaxWidthContainer>
        {/* Header */}
        <header className="mb-8 mt-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-primary-50 p-2 rounded-xl border border-primary-100">
              <MessageSquare className="w-6 h-6 text-primary-600" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-600">
              Reputation Center
            </span>
          </div>
          <h1 className="text-3xl font-black text-[#0A0A0A] tracking-tighter">
            Guest Reviews
          </h1>
          <p className="text-neutral-400 font-medium text-sm mt-1">
            Monitor sentiment, respond to feedback, and build trust with future guests.
          </p>
        </header>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Average Rating', value: avgRating, icon: Star, accent: 'text-yellow-500' },
            { label: 'Total Reviews', value: totalReviews, icon: MessageSquare, accent: 'text-indigo-500' },
            { label: 'Response Rate', value: `${responseRate}%`, icon: TrendingUp, accent: 'text-emerald-500' },
            { label: 'Avg Response Time', value: avgResponseTime, icon: Clock, accent: 'text-sky-500' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-[2rem] border border-neutral-100 shadow-[0_1px_2px_rgba(0,0,0,0.06)] p-6 flex flex-col gap-2"
            >
              <div className="flex items-center gap-2">
                <stat.icon className={`w-4 h-4 ${stat.accent}`} />
                <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400">
                  {stat.label}
                </span>
              </div>
              <span className="text-2xl font-black text-[#0A0A0A]">{stat.value}</span>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-8 hide-scrollbar p-1.5 bg-neutral-100/50 rounded-2xl border border-neutral-100 w-fit">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-black capitalize transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-[#0A0A0A] text-white shadow-[0_1px_2px_rgba(0,0,0,0.06)]'
                  : 'text-neutral-500 hover:text-[#0A0A0A] hover:bg-white/60'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Reviews List */}
        {filteredReviews.length > 0 ? (
          <div className="space-y-5">
            {filteredReviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                reply={replies[review.id] || null}
                onSaveReply={saveReply}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-neutral-50 border border-neutral-200 rounded-3xl text-center">
            <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-neutral-300" />
            </div>
            <h3 className="text-[#0A0A0A] font-bold text-lg mb-2">No reviews found</h3>
            <p className="text-neutral-500 text-sm max-w-sm">
              {activeTab !== 'all'
                ? 'No reviews match this filter. Try selecting a different tab.'
                : 'You don\'t have any guest reviews yet. Reviews will appear here once guests submit feedback after their stay.'}
            </p>
            {activeTab !== 'all' && (
              <button
                onClick={() => setActiveTab('all')}
                className="mt-4 text-[#E74035] hover:text-[#D63930] text-sm font-bold transition-colors"
              >
                View All Reviews
              </button>
            )}
          </div>
        )}
      </MaxWidthContainer>
    </div>
  );
}
