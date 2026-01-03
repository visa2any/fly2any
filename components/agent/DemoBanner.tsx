'use client';

// components/agent/DemoBanner.tsx
// Demo mode indicator banner
import { motion } from 'framer-motion';
import { Eye, Clock, Sparkles, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DemoBanner() {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 min in seconds
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/auth/signin?callbackUrl=/agent');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [router]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (dismissed) return null;

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white px-4 py-3 relative overflow-hidden"
    >
      {/* Animated background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"30\" height=\"30\" viewBox=\"0 0 30 30\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Ccircle cx=\"2\" cy=\"2\" r=\"1\" fill=\"white\"/%3E%3C/svg%3E')] animate-pulse" />
      </div>

      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 relative">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full">
            <Eye className="w-4 h-4" />
            <span className="text-sm font-semibold">DEMO MODE</span>
          </div>
          <span className="text-sm text-white/90 hidden sm:inline">
            Explore the agent dashboard with sample data
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-white/70" />
            <span className="font-mono font-medium">{formatTime(timeLeft)}</span>
          </div>

          <a
            href="/agent/register"
            className="hidden sm:flex items-center gap-1.5 px-4 py-1.5 bg-white text-purple-700 rounded-full text-sm font-semibold hover:bg-purple-50 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Become an Agent
          </a>

          <button
            onClick={() => setDismissed(true)}
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
