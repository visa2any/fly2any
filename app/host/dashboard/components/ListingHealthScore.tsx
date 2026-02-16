'use client';

import { Activity, CheckCircle2, AlertTriangle, Camera, DollarSign, FileText, Star } from 'lucide-react';

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

  const scoreColor = avgScore >= 80 ? 'text-emerald-500' : avgScore >= 50 ? 'text-amber-500' : 'text-red-500';
  const scoreBg = avgScore >= 80 ? 'bg-emerald-50' : avgScore >= 50 ? 'bg-amber-50' : 'bg-red-50';
  const scoreRing = avgScore >= 80 ? 'stroke-emerald-500' : avgScore >= 50 ? 'stroke-amber-500' : 'stroke-red-500';

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
    <div className="bg-white border border-neutral-100 rounded-3xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-2.5 rounded-xl ${scoreBg}`}>
          <Activity className={`w-5 h-5 ${scoreColor}`} />
        </div>
        <div>
          <h3 className="font-bold text-gray-900">Listing Health</h3>
          <p className="text-xs text-gray-400">Optimize your listings for more bookings</p>
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
              style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-2xl font-black ${scoreColor}`}>{avgScore}</span>
          </div>
        </div>

        {/* Tips */}
        <div className="flex-1 space-y-2">
          {tips.length === 0 ? (
            <div className="flex items-center gap-2 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-sm font-medium">All listings are well optimized!</span>
            </div>
          ) : (
            tips.slice(0, 3).map((tip, i) => (
              <div key={i} className="flex items-center gap-2 text-gray-500">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="text-xs">{tip.text}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
