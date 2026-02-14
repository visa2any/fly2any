'use client';

import Image from 'next/image';
import { MapPin, Bed, Users, Bath, Check, Star } from 'lucide-react';

interface ReviewStepProps {
  data: any;
}

export function ReviewStep({ data }: ReviewStepProps) {
  const coverImage = data.images.find((i: any) => i.isPrimary)?.url || data.images[0]?.url;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
       <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
           
           {/* Preview Card (Like search result) */}
           <div className="grid md:grid-cols-2 gap-0 md:gap-8">
               <div className="relative h-64 md:h-auto bg-neutral-100">
                   {coverImage ? (
                       <Image src={coverImage} alt="Cover" fill className="object-cover" />
                   ) : (
                       <div className="flex items-center justify-center h-full text-gray-400 font-medium">No images uploaded</div>
                   )}
                   <div className="absolute top-4 left-4 bg-white px-2 py-1 rounded-md text-xs font-bold shadow-sm uppercase tracking-wide text-gray-900">
                       Live Preview
                   </div>
               </div>

               <div className="p-6 md:p-8 flex flex-col justify-center">
                   <div className="flex items-start justify-between mb-4">
                       <div>
                           <h2 className="text-2xl font-bold text-gray-900 mb-2">{data.title || "Your Property Title"}</h2>
                           <div className="flex items-center gap-2 text-gray-600">
                               <MapPin className="w-4 h-4" />
                               <span>{data.location.city || "City"}, {data.location.country || "Country"}</span>
                           </div>
                       </div>
                   </div>

                   <hr className="border-neutral-100 my-4" />

                   <div className="grid grid-cols-3 gap-4 mb-6">
                       <div className="flex items-center gap-2 text-gray-700">
                           <Users className="w-4 h-4 text-gray-400" />
                           <span className="font-medium">{data.specs.guests} guests</span>
                       </div>
                       <div className="flex items-center gap-2 text-gray-700">
                           <Bed className="w-4 h-4 text-gray-400" />
                           <span className="font-medium">{data.specs.bedrooms} bedrooms</span>
                       </div>
                       <div className="flex items-center gap-2 text-gray-700">
                           <Bath className="w-4 h-4 text-gray-400" />
                           <span className="font-medium">{data.specs.bathrooms} baths</span>
                       </div>
                   </div>

                   <div className="flex items-center justify-between mt-auto pt-4 border-t border-neutral-100">
                       <span className="text-gray-500 text-sm">per night</span>
                       <div className="flex items-baseline gap-1">
                           <span className="text-2xl font-bold text-gray-900">${data.pricing.basePrice}</span>
                           <span className="text-sm font-semibold text-gray-500">{data.pricing.currency}</span>
                       </div>
                   </div>
               </div>
           </div>
       </div>

       {/* Checklist */}
       <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-200">
           <h3 className="font-bold text-gray-900 mb-4">Listing Readiness</h3>
           <div className="grid md:grid-cols-2 gap-4">
               {[
                   { label: 'Title & Description', valid: !!data.title && !!data.description },
                   { label: 'Location set', valid: !!data.location.latitude },
                   { label: 'Photos added', valid: data.images.length >= 5 },
                   { label: 'Price set', valid: data.pricing.basePrice > 0 },
                   { label: 'Amenities selected', valid: data.amenities.length > 0 },
                   { label: 'Policies defined', valid: true },
               ].map((item, i) => (
                   <div key={i} className="flex items-center gap-3">
                       <div className={`w-6 h-6 rounded-full flex items-center justify-center ${item.valid ? 'bg-green-100 text-green-600' : 'bg-neutral-200 text-neutral-400'}`}>
                           <Check className="w-4 h-4" />
                       </div>
                       <span className={`${item.valid ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>{item.label}</span>
                   </div>
               ))}
           </div>
       </div>
    </div>
  );
}
