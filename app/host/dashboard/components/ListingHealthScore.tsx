'use client';

import { Activity, CheckCircle2, AlertTriangle, Camera, DollarSign, FileText, Star } from 'lucide-react';
import { AnimatedFadeIn } from '@/components/ui/AnimatedFadeIn';

interface PropertyHealth {
  id: string;
  name: string;
  hasPhotos: boolean;
  hasPrice: boolean;
  hasDescription: boolean;
  isPublished: boolean;
  photoCount: number;
}

export function ListingHealthScore({ properties }: { properties: PropertyHealth[] }) {
  if (properties.length === 0) return null;

  const calculateScore = (p: PropertyHealth) => {
    let score = 0;
    if (p.hasDescription) score += 25;
    if (p.hasPrice) score += 25;
    if (p.hasPhotos) score += 25;
    if (p.photoCount >= 5) score += 15;
    if (p.isPublished) score += 10;
    return score;
  };

  const avgScore = Math.round(
    properties.reduce((sum, p) => sum + calculateScore(p), 0) / properties.length
  );

  const scoreColor = avgScore >= 80 ? 'text-success-500' : avgScore >= 50 ? 'text-warning-500' : 'text-primary-500';
  const scoreBg = avgScore >= 80 ? 'bg-success-50' : avgScore >= 50 ? 'bg-warning-50' : 'bg-primary-50';
  const scoreRing = avgScore >= 80 ? 'stroke-success-500' : avgScore >= 50 ? 'stroke-warning-500' : 'stroke-primary-500';

  const tips: { icon: any; text: string }[] = [];
  properties.forEach(p => {
    if (!p.hasDescription && !tips.find(t => t.text.includes('description')))
      tips.push({ icon: FileText, text: 'Add detailed descriptions to boost discovery' });
    if (!p.hasPrice && !tips.find(t => t.text.includes('pricing')))
      tips.push({ icon: DollarSign, text: 'Set competitive pricing for your listings' });
    if (p.photoCount < 5 && !tips.find(t => t.text.includes('photos')))
      tips.push({ icon: Camera, text: 'Add 5+ high-quality photos per listing' });
  });

  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (avgScore / 100) * circumference;

  return (
    <AnimatedFadeIn delay={0.2}>
      <div className="bg-white border border-neutral-100 rounded-[2rem] p-8 shadow-soft hover:shadow-soft-lg hover:-translate-y-1 transition-all duration-300 h-full">
        <div className="flex items-center gap-4 mb-8 border-b border-neutral-100 pb-5">
          <div className={`p-3 rounded-2xl ${scoreBg}`}>
            <Activity className={`w-6 h-6 ${scoreColor}`} />
          </div>
          <div>
            <h3 className="font-extrabold text-xl tracking-tight text-midnight-navy mb-0.5">Listing Health</h3>
            <p className="text-sm text-neutral-400 font-medium">Optimize your listings for more bookings</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Circular Score */}
          <div className="relative w-24 h-24 shrink-0">
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" strokeWidth="8" className="stroke-neutral-100" />
              <circle
                cx="50" cy="50" r="40" fill="none" strokeWidth="8"
                className={scoreRing}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.16, 1, 0.3, 1) 0.5s' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-2xl font-black ${scoreColor}`}>{avgScore}</span>
            </div>
          </div>

          {/* Tips */}
          <div className="flex-1 space-y-3">
            {tips.length === 0 ? (
              <AnimatedFadeIn delay={0.6}>
                <div className="flex items-center gap-2 text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm font-medium">All listings are well optimized!</span>
                </div>
              </AnimatedFadeIn>
            ) : (
              tips.slice(0, 3).map((tip, i) => (
                <AnimatedFadeIn key={i} delay={0.5 + i * 0.15}>
                  <div className="flex items-center gap-2 text-gray-600 bg-neutral-50 px-3 py-2 rounded-xl">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                    <span className="text-xs font-semibold">{tip.text}</span>
                  </div>
                </AnimatedFadeIn>
              ))
            )}
          </div>
        </div>
      </div>
    </AnimatedFadeIn>
  );
}
