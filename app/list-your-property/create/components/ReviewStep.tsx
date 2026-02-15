'use client';

import Image from 'next/image';
import { 
  MapPin, Bed, Users, Bath, Check, Star, Edit2, 
  Home, Shield, DollarSign, Calendar, List, AlertCircle 
} from 'lucide-react';
import { WizardStep } from '../page'; // Might need to export this type from page.tsx or define nearby

interface ReviewStepProps {
  data: any;
  onEdit: (step: WizardStep) => void;
}

export function ReviewStep({ data, onEdit }: ReviewStepProps) {
  // Helper to get primary image
  const coverImage = (data.images && data.images.length > 0) 
      ? (data.images.find((i: any) => i && i.isPrimary)?.url || (data.images[0]?.url || data.images[0]))
      : null;

  // Calculate Health Score
  let score = 0;
  let totalScore = 100;
  if (data.title?.length > 10) score += 10;
  if (data.description?.length > 50) score += 10;
  if (data.images?.length >= 5) score += 20;
  if (data.amenities?.length >= 5) score += 10;
  if (data.pricing?.basePrice > 0) score += 10;
  if (data.type) score += 10;
  if (data.location?.city) score += 10;
  if (data.policies?.checkInTime) score += 10;
  if (data.policies?.houseRules?.length > 0) score += 10;

  // Formatting currency
  const formatPrice = (price: number) => {
      if (!price && price !== 0) return '-';
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: data.pricing.currency }).format(price);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
       
       {/* Top Status Bar: Health Score */}
       <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
           <div className="relative z-10 flex items-center justify-between">
               <div>
                   <h2 className="text-2xl font-bold mb-1">Almost there!</h2>
                   <p className="text-indigo-100 text-sm">Your listing is {score}% complete. Ready to publish?</p>
               </div>
               <div className="flex items-center gap-4">
                   <div className="w-16 h-16 rounded-full border-4 border-white/30 flex items-center justify-center text-xl font-bold bg-white/10 backdrop-blur">
                       {score}%
                   </div>
               </div>
           </div>
           {/* Decorative circles */}
           <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
           <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -ml-10 -mb-10" />
       </div>

       <div className="grid xl:grid-cols-3 gap-8">
           
           {/* Left Column: Comprehensive Review (2/3 width) */}
           <div className="xl:col-span-2 space-y-6">
               
               {/* 1. Basic Info */}
               <section className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm group hover:border-primary-300 transition-colors">
                   <div className="flex justify-between items-start mb-4">
                       <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                           <Home className="w-5 h-5 text-gray-500" /> Property Basics
                       </h3>
                       <button onClick={() => onEdit('basics')} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                           <Edit2 className="w-4 h-4" />
                       </button>
                   </div>
                   <div className="space-y-3">
                       <div>
                           <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Title</label>
                           <p className="text-gray-900 font-medium text-lg">{data.title || "Untitled"}</p>
                       </div>
                       <div>
                           <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Description</label>
                           <p className="text-gray-600 text-sm line-clamp-3">{data.description || "No description provided."}</p>
                       </div>
                       <div className="flex gap-4 pt-2">
                           <span className="px-3 py-1 bg-neutral-100 rounded-full text-xs font-semibold text-gray-600 uppercase">{data.type}</span>
                           <span className="flex items-center gap-1 text-sm text-gray-600">
                               <Users className="w-4 h-4" /> {data.specs.guests} Guests
                           </span>
                       </div>
                   </div>
               </section>

               {/* 2. Rooms & Amenities */}
               <section className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm group hover:border-primary-300 transition-colors">
                   <div className="flex justify-between items-start mb-4">
                       <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                           <List className="w-5 h-5 text-gray-500" /> Rooms & Amenities
                       </h3>
                       <button onClick={() => onEdit('amenities')} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                           <Edit2 className="w-4 h-4" />
                       </button>
                   </div>
                   <div className="grid md:grid-cols-2 gap-6">
                       <div>
                           <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Rooms</label>
                           <ul className="space-y-1 text-sm text-gray-700">
                               <li className="flex items-center gap-2"><Bed className="w-4 h-4 text-gray-400" /> {data.specs.bedrooms} Bedrooms</li>
                               <li className="flex items-center gap-2"><Bath className="w-4 h-4 text-gray-400" /> {data.specs.bathrooms} Bathrooms</li>
                               <li className="flex items-center gap-2"><Bed className="w-4 h-4 text-gray-400" /> {data.specs.beds} Beds</li>
                           </ul>
                       </div>
                       <div>
                           <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Amenities ({data.amenities.length})</label>
                           <div className="flex flex-wrap gap-2">
                               {data.amenities.slice(0, 6).map((am: string) => (
                                   <span key={am} className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-md font-medium border border-green-100">
                                       {am.replace(/_/g, ' ')}
                                   </span>
                               ))}
                               {data.amenities.length > 6 && (
                                   <span className="px-2 py-1 bg-neutral-50 text-neutral-500 text-xs rounded-md font-medium">
                                       +{data.amenities.length - 6} more
                                   </span>
                               )}
                           </div>
                       </div>
                   </div>
               </section>

               {/* 3. Policies */}
               <section className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm group hover:border-primary-300 transition-colors">
                   <div className="flex justify-between items-start mb-4">
                       <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                           <Shield className="w-5 h-5 text-gray-500" /> Policies & Rules
                       </h3>
                       <button onClick={() => onEdit('policies')} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                           <Edit2 className="w-4 h-4" />
                       </button>
                   </div>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                       <div className="p-3 bg-neutral-50 rounded-xl">
                           <span className="block text-xs text-gray-500 font-bold uppercase">Check-in</span>
                           <span className="font-semibold text-gray-900">{data.policies.checkInTime}</span>
                       </div>
                       <div className="p-3 bg-neutral-50 rounded-xl">
                           <span className="block text-xs text-gray-500 font-bold uppercase">Check-out</span>
                           <span className="font-semibold text-gray-900">{data.policies.checkOutTime}</span>
                       </div>
                       <div className="col-span-2 p-3 bg-neutral-50 rounded-xl">
                           <span className="block text-xs text-gray-500 font-bold uppercase">Cancellation</span>
                           <span className="font-semibold text-gray-900 capitalize">{data.policies.cancellationPolicy.replace('_', ' ')}</span>
                       </div>
                   </div>
                   {data.policies.houseRules.length > 0 && (
                       <div>
                           <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">House Rules</label>
                           <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                               {data.policies.houseRules.map((rule: string, i: number) => (
                                   <li key={i}>{rule}</li>
                               ))}
                           </ul>
                       </div>
                   )}
               </section>

               {/* 4. Pricing */}
               <section className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm group hover:border-primary-300 transition-colors">
                   <div className="flex justify-between items-start mb-4">
                       <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                           <DollarSign className="w-5 h-5 text-gray-500" /> Pricing
                       </h3>
                       <button onClick={() => onEdit('pricing')} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                           <Edit2 className="w-4 h-4" />
                       </button>
                   </div>
                   <div className="flex items-center gap-6 mb-6">
                       <div>
                           <span className="text-3xl font-bold text-gray-900">{formatPrice(data.pricing.basePrice)}</span>
                           <span className="text-gray-500 text-sm font-medium"> / night</span>
                       </div>
                       {data.pricing.smartPricing && (
                           <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full border border-purple-200 flex items-center gap-1">
                               <SparkleIcon className="w-3 h-3" /> Smart Pricing On
                           </span>
                       )}
                   </div>
                   
                   <div className="grid grid-cols-2 gap-y-2 text-sm">
                       {data.pricing.cleaningFee > 0 && (
                           <div className="flex justify-between border-b border-neutral-100 pb-2">
                               <span className="text-gray-600">Cleaning Fee</span>
                               <span className="font-medium text-gray-900">{formatPrice(data.pricing.cleaningFee)}</span>
                           </div>
                       )}
                       {data.pricing.petFee > 0 && (
                           <div className="flex justify-between border-b border-neutral-100 pb-2">
                               <span className="text-gray-600">Pet Fee</span>
                               <span className="font-medium text-gray-900">{formatPrice(data.pricing.petFee)}</span>
                           </div>
                       )}
                       {/* Add other fees if needed */}
                       <div className="flex justify-between pt-2">
                           <span className="text-gray-600">Weekend Price</span>
                           <span className="font-medium text-gray-900">{data.pricing.weekendPrice ? formatPrice(data.pricing.weekendPrice) : 'Same as base'}</span>
                       </div>
                   </div>
               </section>

           </div>

           {/* Right Column: Live Preview Card (Sticky) */}
           <div className="hidden xl:block">
               <div className="sticky top-24 space-y-6">
                   <h3 className="font-bold text-gray-900">Live Preview</h3>
                   
                   {/* Card */}
                   <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-lg hover:shadow-xl transition-shadow w-full max-w-sm mx-auto">
                       <div className="relative aspect-[4/3] bg-neutral-200">
                           {coverImage ? (
                               <Image src={coverImage} alt="Cover" fill className="object-cover" />
                           ) : (
                               <div className="flex items-center justify-center h-full text-gray-400 flex-col gap-2">
                                   <ImageOffIcon className="w-8 h-8 opacity-50" />
                                   <span className="text-xs font-medium">No Image</span>
                               </div>
                           )}
                           <button className="absolute top-3 right-3 p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white transition-colors">
                               <HeartIcon className="w-5 h-5" />
                           </button>
                           <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold text-gray-900 uppercase tracking-wide">
                               Host Mode
                           </div>
                       </div>
                       <div className="p-4 space-y-2 bg-white">
                           <div className="flex justify-between items-start">
                               <h3 className="font-bold text-gray-900 line-clamp-1 text-lg">{data.title || "Your Title Here"}</h3>
                               <div className="flex items-center gap-1 text-sm font-semibold">
                                   <Star className="w-4 h-4 fill-current text-amber-400" />
                                   <span>New</span>
                               </div>
                           </div>
                           <p className="text-gray-500 text-sm">{data.location.city || "City"}, {data.location.country || "Country"}</p>
                           <p className="text-gray-500 text-sm">
                               {data.specs.guests} guests · {data.specs.bedrooms} bedrooms
                           </p>
                           <div className="pt-2 flex items-baseline gap-1">
                               <span className="font-bold text-gray-900 text-lg">{formatPrice(data.pricing.basePrice)}</span>
                               <span className="text-gray-500 text-sm">night</span>
                           </div>
                       </div>
                   </div>

                   {/* Completion Tips */}
                   <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                       <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                           <AlertCircle className="w-4 h-4" /> Pro Tips
                       </h4>
                       <ul className="text-sm text-blue-800 space-y-2 list-disc list-inside">
                           {score < 100 && <li>Complete all fields to boost visibility.</li>}
                           <li>Add at least 5 high-res photos.</li>
                           <li>Write a description over 50 chars.</li>
                       </ul>
                   </div>
               </div>
           </div>

       </div>
    </div>
  );
}

// Simple Icon Placeholders to avoid import errors if some lucide icons missing
function SparkleIcon(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg> }
function HeartIcon(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg> }
function ImageOffIcon(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="2" x2="22" y1="2" y2="22"/><path d="M10.41 10.41a2 2 0 1 1-2.83-2.83"/><line x1="13.5" x2="6" y1="13.5" y2="21"/><line x1="18" x2="21" y1="12" y2="15"/><path d="M21 15v-2a2 2 0 0 0-2-2 4 4 0 0 0-4 4v5a2 2 0 0 0 2 2h3a2 2 0 0 0 2-2z"/><path d="M1 5a2 2 0 0 1 2-2h1"/><path d="M21 7v1"/></svg> }
