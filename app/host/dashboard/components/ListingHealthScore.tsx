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

export function ListingHealthScore() {
  return (
    <div className="bg-[#1B243B] rounded-[2rem] p-8 shadow-soft-lg flex flex-col h-full text-white relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
      
      {/* Badge in top right */}
      <div className="absolute top-8 right-8">
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-yellow-400">
              <Star className="w-6 h-6 fill-yellow-400" />
          </div>
      </div>

      <div className="mb-8">
        <h3 className="text-neutral-400 font-bold text-sm mb-1 uppercase tracking-widest">Listing Health</h3>
        <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black tracking-tighter">98</span>
            <span className="text-neutral-500 font-bold">/100</span>
        </div>
      </div>

      {/* Status Pill */}
      <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#102A3E] border border-[#163B54] text-[#2DD4BF] text-xs font-bold shadow-sm">
            <div className="w-2 h-2 rounded-full bg-[#2DD4BF] animate-pulse" />
            Superhost Status Active
          </div>
      </div>

      {/* Metrics List */}
      <div className="space-y-6 mt-auto">
        <div className="flex items-center justify-between">
            <span className="text-neutral-400 font-medium text-sm">Response Rate</span>
            <span className="font-bold">100%</span>
        </div>
        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 w-[100%]" />
        </div>

        <div className="flex items-center justify-between">
            <span className="text-neutral-400 font-medium text-sm">Review Score</span>
            <span className="font-bold">4.9</span>
        </div>
        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 w-[94%]" />
        </div>
      </div>
    </div>
  );
}
