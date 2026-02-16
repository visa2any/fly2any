'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  MapPin, Bed, Users, Bath, Check, Star, Edit2,
  Home, Shield, DollarSign, Calendar, List, AlertCircle,
  Camera, Sparkles, Eye, Monitor, Heart, ChevronLeft,
  ChevronRight, Clock, Zap, Percent, Dog, Moon, Receipt
} from 'lucide-react';
import { WizardStep } from '../page';

interface ReviewStepProps {
  data: any;
  onEdit: (step: WizardStep) => void;
}

// ─── Inline Warning Component ───
function MissingWarning({ message, step, onEdit }: { message: string; step: WizardStep; onEdit: (s: WizardStep) => void }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800 font-medium mt-3">
      <AlertCircle className="w-4 h-4 shrink-0" />
      <span className="flex-1">{message}</span>
      <button onClick={() => onEdit(step)} className="px-3 py-1 bg-amber-100 hover:bg-amber-200 rounded-lg text-amber-900 font-bold transition-colors text-sm">Fix</button>
    </div>
  );
}

// ─── Section Card ───
function Section({ title, icon: Icon, step, onEdit, children, className = '' }: {
  title: string; icon: any; step: WizardStep; onEdit: (s: WizardStep) => void; children: React.ReactNode; className?: string;
}) {
  return (
    <section className={`bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm group hover:border-primary-300 transition-colors ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <Icon className="w-5 h-5 text-gray-400" /> {title}
        </h3>
        <button onClick={() => onEdit(step)} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
          <Edit2 className="w-4 h-4" />
        </button>
      </div>
      {children}
    </section>
  );
}

export function ReviewStep({ data, onEdit }: ReviewStepProps) {
  const [viewMode, setViewMode] = useState<'host' | 'client'>('host');
  const [clientPhotoIdx, setClientPhotoIdx] = useState(0);

  // Cover image
  const coverImage = data.images?.length > 0
    ? (data.images.find((i: any) => i?.isPrimary)?.url || data.images[0]?.url || data.images[0])
    : null;

  // Health Score (weighted)
  let score = 0;
  if (data.title?.length > 10) score += 10;
  if (data.description?.length > 50) score += 10;
  if (data.images?.length >= 5) score += 20;
  else if (data.images?.length >= 1) score += 10;
  if (data.amenities?.length >= 5) score += 10;
  if (data.pricing?.basePrice > 0) score += 10;
  if (data.type) score += 10;
  if (data.location?.city) score += 10;
  if (data.policies?.checkInTime) score += 10;
  if (data.policies?.houseRules?.length > 0) score += 5;
  if (data.location?.address) score += 5;

  const formatPrice = (price: number) => {
    if (!price && price !== 0) return '-';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: data.pricing?.currency || 'USD' }).format(price);
  };

  const allImages = (data.images || []).map((img: any) => typeof img === 'string' ? img : img?.url).filter(Boolean);

  // ─────────────────────────────────────────────
  // HOST VIEW
  // ─────────────────────────────────────────────
  const renderHostView = () => (
    <div className="space-y-5">
      {/* Row 1: Basics + Location | Photos */}
      <div className="grid md:grid-cols-2 gap-5">
        {/* Basics + Location combined */}
        <Section title="Property Basics" icon={Home} step="basics" onEdit={onEdit}>
          <div className="space-y-3">
            <p className="text-gray-900 font-bold text-lg">{data.title || 'Untitled'}</p>
            <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed">{data.description || 'No description'}</p>
            <div className="flex flex-wrap gap-3 pt-2">
              <span className="px-3 py-1 bg-neutral-100 rounded-full text-sm font-semibold text-gray-600 capitalize">{data.type}</span>
              <span className="flex items-center gap-1.5 text-sm text-gray-500"><Users className="w-4 h-4" /> {data.specs?.guests || 0} guests</span>
              <span className="flex items-center gap-1.5 text-sm text-gray-500"><Bed className="w-4 h-4" /> {data.specs?.bedrooms || 0} beds</span>
              <span className="flex items-center gap-1.5 text-sm text-gray-500"><Bath className="w-4 h-4" /> {data.specs?.bathrooms || 0} baths</span>
            </div>

            {/* Location inline */}
            <div className="pt-3 border-t border-neutral-100 mt-3 flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span>{[data.location?.address, data.location?.city, data.location?.country].filter(Boolean).join(', ') || 'No location set'}</span>
            </div>
          </div>
          {!data.location?.city && <MissingWarning message="Add your property location" step="location" onEdit={onEdit} />}
        </Section>

        {/* Photos */}
        <Section title={`Photos (${allImages.length})`} icon={Camera} step="photos" onEdit={onEdit}>
          {allImages.length > 0 ? (
            <div className="flex gap-3">
              <div className="relative w-36 h-28 rounded-xl overflow-hidden shrink-0 bg-neutral-200">
                <img src={allImages[0]} alt="Cover" className="w-full h-full object-cover" />
                <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 text-white text-xs font-bold rounded-md">COVER</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 flex-1">
                {allImages.slice(1, 7).map((url: string, i: number) => (
                  <div key={i} className="relative aspect-[4/3] rounded-lg overflow-hidden bg-neutral-200">
                    <img src={url} alt={`Photo ${i + 2}`} className="w-full h-full object-cover" />
                  </div>
                ))}
                {allImages.length > 7 && (
                  <div className="aspect-[4/3] rounded-lg bg-neutral-100 flex items-center justify-center text-sm font-bold text-gray-500">
                    +{allImages.length - 7}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <MissingWarning message="Upload at least 1 photo (5+ recommended)" step="photos" onEdit={onEdit} />
          )}
          {allImages.length > 0 && allImages.length < 5 && (
            <MissingWarning message={`Only ${allImages.length} photos — add more for better visibility`} step="photos" onEdit={onEdit} />
          )}
        </Section>
      </div>

      {/* Row 2: Amenities | Policies */}
      <div className="grid md:grid-cols-2 gap-5">
        <Section title={`Amenities (${data.amenities?.length || 0})`} icon={List} step="amenities" onEdit={onEdit}>
          {data.amenities?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {data.amenities.slice(0, 10).map((am: string) => (
                <span key={am} className="px-3 py-1 bg-green-50 text-green-700 text-sm rounded-lg font-medium border border-green-100">
                  {am.replace(/_/g, ' ')}
                </span>
              ))}
              {data.amenities.length > 10 && (
                <span className="px-3 py-1 bg-neutral-50 text-neutral-500 text-sm rounded-lg font-medium">
                  +{data.amenities.length - 10} more
                </span>
              )}
            </div>
          ) : (
            <MissingWarning message="Select at least 1 amenity" step="amenities" onEdit={onEdit} />
          )}
        </Section>

        <Section title="Policies & Rules" icon={Shield} step="policies" onEdit={onEdit}>
          <div className="flex flex-wrap gap-3 mb-3">
            <div className="px-4 py-2 bg-neutral-50 rounded-xl">
              <span className="text-gray-400 font-bold uppercase text-xs block">Check-in</span>
              <span className="font-semibold text-gray-900 text-sm">{data.policies?.checkInTime || '—'}</span>
            </div>
            <div className="px-4 py-2 bg-neutral-50 rounded-xl">
              <span className="text-gray-400 font-bold uppercase text-xs block">Check-out</span>
              <span className="font-semibold text-gray-900 text-sm">{data.policies?.checkOutTime || '—'}</span>
            </div>
            <div className="px-4 py-2 bg-neutral-50 rounded-xl">
              <span className="text-gray-400 font-bold uppercase text-xs block">Cancellation</span>
              <span className="font-semibold text-gray-900 text-sm capitalize">{data.policies?.cancellationPolicy?.replace('_', ' ') || '—'}</span>
            </div>
            {data.policies?.securityDeposit > 0 && (
              <div className="px-4 py-2 bg-neutral-50 rounded-xl">
                <span className="text-gray-400 font-bold uppercase text-xs block">Deposit</span>
                <span className="font-semibold text-gray-900 text-sm">{formatPrice(data.policies.securityDeposit)}</span>
              </div>
            )}
          </div>
          {data.policies?.houseRules?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {data.policies.houseRules.slice(0, 5).map((rule: string, i: number) => (
                <span key={i} className="px-3 py-1 bg-red-50 text-red-700 text-sm rounded-lg font-medium border border-red-100">{rule}</span>
              ))}
              {data.policies.houseRules.length > 5 && (
                <span className="text-sm text-gray-400">+{data.policies.houseRules.length - 5} more</span>
              )}
            </div>
          )}
        </Section>
      </div>

      {/* Row 3: Pricing + Booking Controls */}
      <div className="grid md:grid-cols-2 gap-5">
        <Section title="Pricing" icon={DollarSign} step="pricing" onEdit={onEdit}>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-3xl font-black text-gray-900">{formatPrice(data.pricing?.basePrice)}</span>
            <span className="text-gray-500 text-sm">/ night</span>
            {data.pricing?.smartPricing && (
              <span className="px-2.5 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">⚡ Smart</span>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            {data.pricing?.weekendPrice > 0 && (
              <div className="flex items-center gap-2 text-gray-600"><Moon className="w-4 h-4 text-gray-400" /> Weekend: {formatPrice(data.pricing.weekendPrice)}</div>
            )}
            {data.pricing?.cleaningFee > 0 && (
              <div className="flex items-center gap-2 text-gray-600"><Sparkles className="w-4 h-4 text-gray-400" /> Cleaning: {formatPrice(data.pricing.cleaningFee)}</div>
            )}
            {data.pricing?.petFee > 0 && (
              <div className="flex items-center gap-2 text-gray-600"><Dog className="w-4 h-4 text-gray-400" /> Pet: {formatPrice(data.pricing.petFee)}</div>
            )}
            {data.pricing?.extraGuestFee > 0 && (
              <div className="flex items-center gap-2 text-gray-600"><Users className="w-4 h-4 text-gray-400" /> Extra guest: {formatPrice(data.pricing.extraGuestFee)}</div>
            )}
            {data.pricing?.weeklyDiscount > 0 && (
              <div className="flex items-center gap-2 text-gray-600"><Percent className="w-4 h-4 text-gray-400" /> Weekly: -{data.pricing.weeklyDiscount}%</div>
            )}
            {data.pricing?.monthlyDiscount > 0 && (
              <div className="flex items-center gap-2 text-gray-600"><Percent className="w-4 h-4 text-gray-400" /> Monthly: -{data.pricing.monthlyDiscount}%</div>
            )}
            {data.pricing?.taxRate > 0 && (
              <div className="flex items-center gap-2 text-gray-600"><Receipt className="w-4 h-4 text-gray-400" /> Tax: {data.pricing.taxRate}%</div>
            )}
          </div>
        </Section>

        <Section title="Booking Controls" icon={Calendar} step="pricing" onEdit={onEdit}>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-3 px-4 py-3 bg-neutral-50 rounded-xl">
              <Clock className="w-5 h-5 text-gray-400" />
              <div>
                <span className="text-gray-400 font-bold uppercase text-xs block">Min Stay</span>
                <span className="font-semibold text-gray-900 text-sm">{data.pricing?.minStay || 1} night{(data.pricing?.minStay || 1) !== 1 ? 's' : ''}</span>
              </div>
            </div>
            {(data.pricing?.maxStay || 0) > 0 && (
              <div className="flex items-center gap-3 px-4 py-3 bg-neutral-50 rounded-xl">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <span className="text-gray-400 font-bold uppercase text-xs block">Max Stay</span>
                  <span className="font-semibold text-gray-900 text-sm">{data.pricing.maxStay} nights</span>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3 px-4 py-3 bg-neutral-50 rounded-xl">
              <Zap className="w-5 h-5 text-gray-400" />
              <div>
                <span className="text-gray-400 font-bold uppercase text-xs block">Instant Book</span>
                <span className={`font-semibold text-sm ${data.pricing?.instantBooking !== false ? 'text-green-700' : 'text-gray-500'}`}>
                  {data.pricing?.instantBooking !== false ? 'On' : 'Off'}
                </span>
              </div>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );

  // ─────────────────────────────────────────────
  // CLIENT VIEW (mini hotel detail page)
  // ─────────────────────────────────────────────
  const renderClientView = () => (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-lg">
      {/* Banner */}
      <div className="bg-indigo-600 px-5 py-2.5 text-center text-white text-sm font-bold flex items-center justify-center gap-2">
        <Eye className="w-4 h-4" /> This is how guests will see your listing
      </div>

      {/* Photo Gallery */}
      <div className="relative">
        {allImages.length > 0 ? (
          <div className="relative aspect-[2.5/1] bg-neutral-200 overflow-hidden">
            <img src={allImages[clientPhotoIdx]} alt="Gallery" className="w-full h-full object-cover" />
            {allImages.length > 1 && (
              <>
                <button
                  onClick={() => setClientPhotoIdx(p => (p - 1 + allImages.length) % allImages.length)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setClientPhotoIdx(p => (p + 1) % allImages.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <span className="absolute bottom-4 right-4 px-3 py-1.5 bg-black/60 text-white text-sm font-bold rounded-lg">
                  {clientPhotoIdx + 1} / {allImages.length}
                </span>
              </>
            )}
            <button className="absolute top-4 right-4 p-2.5 rounded-full bg-white/80 backdrop-blur hover:bg-white text-gray-600 transition-colors">
              <Heart className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="aspect-[2.5/1] bg-neutral-100 flex items-center justify-center text-gray-400 flex-col gap-3">
            <Camera className="w-10 h-10 opacity-50" />
            <span className="text-sm font-medium">No photos uploaded</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Left 2/3 */}
          <div className="md:col-span-2 space-y-6">
            {/* Title + Rating */}
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{data.title || 'Your Title Here'}</h2>
                <p className="text-base text-gray-500 flex items-center gap-1.5 mt-1">
                  <MapPin className="w-4 h-4" />
                  {[data.location?.city, data.location?.country].filter(Boolean).join(', ') || 'City, Country'}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-base font-semibold bg-neutral-50 px-3 py-1.5 rounded-lg">
                <Star className="w-5 h-5 fill-current text-amber-400" />
                <span>New</span>
              </div>
            </div>

            {/* Specs bar */}
            <div className="flex items-center gap-5 text-base text-gray-600 border-y border-neutral-100 py-4">
              <span className="flex items-center gap-2"><Users className="w-5 h-5 text-gray-400" /> {data.specs?.guests || 0} guests</span>
              <span className="text-gray-300">·</span>
              <span className="flex items-center gap-2"><Bed className="w-5 h-5 text-gray-400" /> {data.specs?.bedrooms || 0} bedrooms</span>
              <span className="text-gray-300">·</span>
              <span className="flex items-center gap-2"><Bath className="w-5 h-5 text-gray-400" /> {data.specs?.bathrooms || 0} bathrooms</span>
            </div>

            {/* Description */}
            <div>
              <h3 className="font-bold text-gray-900 mb-2 text-base">About this place</h3>
              <p className="text-gray-600 text-base leading-relaxed">{data.description || 'No description provided.'}</p>
            </div>

            {/* Amenities */}
            {data.amenities?.length > 0 && (
              <div>
                <h3 className="font-bold text-gray-900 mb-3 text-base">What this place offers</h3>
                <div className="grid grid-cols-2 gap-3">
                  {data.amenities.slice(0, 8).map((am: string) => (
                    <div key={am} className="flex items-center gap-2 text-base text-gray-700">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="capitalize">{am.replace(/_/g, ' ')}</span>
                    </div>
                  ))}
                </div>
                {data.amenities.length > 8 && (
                  <button className="mt-3 text-base font-bold text-primary-600 underline underline-offset-2">
                    Show all {data.amenities.length} amenities
                  </button>
                )}
              </div>
            )}

            {/* Policies */}
            <div className="border-t border-neutral-100 pt-5">
              <h3 className="font-bold text-gray-900 mb-3 text-base">Things to know</h3>
              <div className="grid grid-cols-3 gap-6 text-sm text-gray-600">
                <div>
                  <span className="font-bold text-gray-900 block mb-1 text-base">Check-in</span>
                  <span className="text-sm">{data.policies?.checkInTime || 'Flexible'}</span>
                </div>
                <div>
                  <span className="font-bold text-gray-900 block mb-1 text-base">Check-out</span>
                  <span className="text-sm">{data.policies?.checkOutTime || 'Flexible'}</span>
                </div>
                <div>
                  <span className="font-bold text-gray-900 block mb-1 text-base">Cancellation</span>
                  <span className="text-sm capitalize">{data.policies?.cancellationPolicy?.replace('_', ' ') || 'Flexible'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right 1/3: Booking Card */}
          <div className="md:col-span-1">
            <div className="border border-neutral-200 rounded-xl p-6 shadow-md sticky top-4">
              <div className="flex items-baseline gap-1.5 mb-5">
                <span className="text-2xl font-bold text-gray-900">{formatPrice(data.pricing?.basePrice)}</span>
                <span className="text-gray-500 text-base">night</span>
              </div>

              {/* Fake booking form */}
              <div className="border border-neutral-200 rounded-xl overflow-hidden mb-4 text-sm">
                <div className="grid grid-cols-2 border-b">
                  <div className="p-3 border-r border-neutral-200">
                    <span className="font-bold text-gray-900 uppercase text-xs block">Check-in</span>
                    <span className="text-gray-500">Add date</span>
                  </div>
                  <div className="p-3">
                    <span className="font-bold text-gray-900 uppercase text-xs block">Check-out</span>
                    <span className="text-gray-500">Add date</span>
                  </div>
                </div>
                <div className="p-3">
                  <span className="font-bold text-gray-900 uppercase text-xs block">Guests</span>
                  <span className="text-gray-500">1 guest</span>
                </div>
              </div>

              <button className="w-full py-3.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold rounded-xl text-base cursor-default">
                {data.pricing?.instantBooking !== false ? 'Reserve' : 'Request to Book'}
              </button>

              {data.pricing?.cleaningFee > 0 && (
                <div className="mt-4 pt-4 border-t border-neutral-100 space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between"><span>Cleaning fee</span><span>{formatPrice(data.pricing.cleaningFee)}</span></div>
                  <div className="flex justify-between"><span>Service fee</span><span>{formatPrice(Math.round(data.pricing.basePrice * 0.12))}</span></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">

      {/* Top Bar: Health Score + View Toggle */}
      <div className="flex items-center justify-between gap-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex items-center gap-4 flex-1">
          <div className="w-14 h-14 rounded-full border-[3px] border-white/30 flex items-center justify-center text-xl font-black bg-white/10 backdrop-blur shrink-0">
            {score}%
          </div>
          <div>
            <h2 className="text-xl font-bold">Almost there!</h2>
            <p className="text-indigo-100 text-sm">Your listing is {score}% complete</p>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="relative z-10 flex bg-white/10 backdrop-blur rounded-xl p-1">
          <button
            onClick={() => setViewMode('host')}
            className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${viewMode === 'host' ? 'bg-white text-indigo-700 shadow' : 'text-white/70 hover:text-white'}`}
          >
            <Monitor className="w-4 h-4" /> Host View
          </button>
          <button
            onClick={() => setViewMode('client')}
            className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${viewMode === 'client' ? 'bg-white text-indigo-700 shadow' : 'text-white/70 hover:text-white'}`}
          >
            <Eye className="w-4 h-4" /> Guest View
          </button>
        </div>

        {/* Decorative */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
      </div>

      {/* Render based on mode */}
      {viewMode === 'host' ? renderHostView() : renderClientView()}

    </div>
  );
}
