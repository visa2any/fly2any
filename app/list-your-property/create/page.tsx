'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { MaxWidthContainer } from '@/components/layout/MaxWidthContainer';
import {
  MapPin, ChevronRight, ChevronLeft, Camera, DollarSign, Save, Eye, Loader2,
  Check, ArrowRight, Home, Info, Shield, Layers, Calendar
} from 'lucide-react';
import {
  PropertyType, PROPERTY_TYPES_INFO,
  type WizardStep
} from '@/lib/properties/types';

// Components
import { ImportWizard } from './components/ImportWizard'; // New
// Dynamic import for LocationPicker to avoid Leaflet SSR window error
import dynamic from 'next/dynamic';
const LocationPicker = dynamic(
  () => import('./components/LocationPicker').then((mod) => mod.LocationPicker),
  { 
    ssr: false,
    loading: () => <div className="h-[400px] w-full bg-white/5 rounded-2xl animate-pulse flex items-center justify-center text-white/20">Loading Map...</div>
  }
);
import { RoomBuilder, type RoomData } from './components/RoomBuilder';
import { AmenitySelector } from './components/AmenitySelector';
import { PhotoUploader } from './components/PhotoUploader';
import { PoliciesEditor } from './components/PoliciesEditor';

// ------------------------------------------------------------------
// WIZARD STEPS CONFIGURATION
// ------------------------------------------------------------------
const STEPS = [
  { step: 1, label: 'Basics', icon: Home },
  { step: 2, label: 'Location', icon: MapPin },
  { step: 3, label: 'Spaces', icon: Layers },
  { step: 4, label: 'Amenities', icon: Info },
  { step: 5, label: 'Photos', icon: Camera },
  { step: 6, label: 'Policies', icon: Shield },
  { step: 7, label: 'Pricing', icon: DollarSign },
  { step: 8, label: 'Review', icon: Eye },
];

export default function CreatePropertyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      const returnUrl = encodeURIComponent('/list-your-property/create');
      router.push(`/auth/signin?callbackUrl=${returnUrl}`);
    }
  }, [status, router]);

  // ------------------------------------------------------------------
  // STATE MANAGEMENT
  // ------------------------------------------------------------------
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showImportWizard, setShowImportWizard] = useState(false); // New State

  // DATA STATE
  // Step 1: Basics
  const [propertyType, setPropertyType] = useState<PropertyType>('hotel');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [starRating, setStarRating] = useState<number>(0);
  
  // Step 2: Location
  const [addressLine1, setAddressLine1] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [neighborhood, setNeighborhood] = useState('');

  // Step 3: Spaces
  const [rooms, setRooms] = useState<RoomData[]>([
    {
      id: '1', name: 'Master Bedroom', roomType: 'standard', bedType: 'king',
      bedCount: 1, maxOccupancy: 2, quantity: 1, basePricePerNight: 0, amenities: []
    }
  ]);
  const [totalBathrooms, setTotalBathrooms] = useState(1);

  // Step 4: Amenities
  const [amenities, setAmenities] = useState<string[]>([]);
  
  // Step 5: Photos
  const [photos, setPhotos] = useState<any[]>([]);
  const [video, setVideo] = useState<any>(null); // New Video State

  // Step 6: Policies
  const [checkInTime, setCheckInTime] = useState('15:00');
  const [checkOutTime, setCheckOutTime] = useState('11:00');
  const [cancellationPolicy, setCancellationPolicy] = useState<any>('flexible');
  const [petPolicy, setPetPolicy] = useState<any>('not_allowed');
  const [smokingPolicy, setSmokingPolicy] = useState<any>('not_allowed');
  const [houseRules, setHouseRules] = useState<string[]>([]);
  const [ecoFeatures, setEcoFeatures] = useState<string[]>([]);

  // Step 7: Pricing
  const [basePrice, setBasePrice] = useState(100);
  const [cleaningFee, setCleaningFee] = useState(0);
  const [minStay, setMinStay] = useState(1);
  const [instantBooking, setInstantBooking] = useState(true);

  // ------------------------------------------------------------------
  // INITIAL DATA LOADING
  // ------------------------------------------------------------------
  useEffect(() => {
    const idParam = searchParams.get('id');
    if (idParam) {
      setEditingId(idParam);
      // Fetch existing property logic here (simplified for brevity, can re-add if needed)
    }
  }, [searchParams]);

  // ------------------------------------------------------------------
  // HELPERS
  // ------------------------------------------------------------------
  const totalBeds = rooms.reduce((acc, r) => acc + (r.bedCount * r.quantity), 0);
  const maxGuests = rooms.reduce((acc, r) => acc + (r.maxOccupancy * r.quantity), 0);

  const handleNext = () => {
    if (currentStep < 8) setCurrentStep(prev => prev + 1);
  };
  
  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  const handleSave = async (isPublish = false) => {
    const loader = isPublish ? setPublishing : setSaving;
    loader(true);
    setError('');

    try {
      const payload = {
        name,
        description,
        propertyType,
        starRating: starRating || null,
        addressLine1,
        city,
        state,
        country,
        postalCode,
        latitude,
        longitude,
        neighborhood,
        amenities,
        checkInTime,
        checkOutTime,
        cancellationPolicy,
        petPolicy,
        smokingPolicy,
        houseRules,
        ecoFeatures,
        basePricePerNight: basePrice,
        cleaningFee,
        minStay,
        instantBooking,
        maxGuests, // calculated
        totalRooms: rooms.reduce((acc, r) => acc + r.quantity, 0),
        totalBathrooms,
        totalBeds, // calculated
        status: isPublish ? 'active' : 'draft', // or typically 'pending_review'
        rooms, // Send rooms array
        images: photos.map(p => ({ 
             url: p.url, // Note: In real app, upload first and get valid URL
             caption: p.caption, 
             category: p.category, 
             isPrimary: p.isPrimary 
        })),
        video: video ? {
            url: video.url,
            thumbnailUrl: video.thumbnailUrl,
            duration: video.duration
        } : null,
      };

      // 1. Create/Update Property
      const url = editingId ? `/api/properties/${editingId}` : '/api/properties';
      const method = editingId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      
      if (!data.success) throw new Error(data.error || 'Failed to save');
      
      const propertyId = data.data.id;
      if (!editingId && propertyId) {
          setEditingId(propertyId);
          // Update URL without refresh
          if (typeof window !== 'undefined') {
             const newUrl = new URL(window.location.href);
             newUrl.searchParams.set('id', propertyId);
             window.history.pushState({}, '', newUrl.toString());
          }
      }

      setSuccessMessage(isPublish ? 'Property published!' : 'Draft saved!');
      if (isPublish) {
          setTimeout(() => router.push('/host/dashboard'), 1500);
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      loader(false);
    }
  };

  const handleImportData = (data: any) => {
    // Populate state from AI data
    if (data.name) setName(data.name);
    if (data.description) setDescription(data.description);
    if (data.propertyType) setPropertyType(data.propertyType);
    if (data.address) {
        if (data.address.city) setCity(data.address.city);
        if (data.address.country) setCountry(data.address.country);
        if (data.address.full_address) setAddressLine1(data.address.full_address);
    }
    if (data.price?.amount) setBasePrice(data.price.amount);
    if (data.amenities && Array.isArray(data.amenities)) setAmenities(data.amenities);
    
    // Room logic (Basic mapping)
    if (data.specs) {
        const newRooms: RoomData[] = [];
        if (data.specs.bedrooms) {
             newRooms.push({
                 id: 'imp-1', 
                 name: 'Master Bedroom', 
                 roomType: 'standard', 
                 bedType: 'king', 
                 bedCount: data.specs.beds || 1, 
                 maxOccupancy: 2, 
                 quantity: data.specs.bedrooms, 
                 basePricePerNight: 0, 
                 amenities: []
             });
        }
        setRooms(newRooms.length > 0 ? newRooms : rooms);
        if (data.specs.bathrooms) setTotalBathrooms(data.specs.bathrooms);
    }

    if (data.images && Array.isArray(data.images) && data.images.length > 0) {
        setPhotos(data.images.map((url: string, i: number) => ({
            url,
            caption: '',
            category: 'general',
            isPrimary: i === 0,
            tags: []
        })));
    }

    setShowImportWizard(false);
    setSuccessMessage('Property details imported via Magic!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // ------------------------------------------------------------------
  // RENDER STEP CONTENT
  // ------------------------------------------------------------------
  const renderStep = () => {
    switch (currentStep) {
      case 1: // BASICS
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
             <div>
                <div className="flex items-center justify-between mb-2">
                    <h1 className="text-3xl font-black text-white">Basic Details</h1>
                    <button 
                        onClick={() => setShowImportWizard(true)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 border border-violet-500/30 text-violet-300 text-xs font-bold hover:bg-violet-500/30 transition-all"
                    >
                        <Sparkles className="w-3 h-3" /> Import from URL
                    </button>
                </div>
                <p className="text-white/60">Let's start with the fundamentals.</p>
             </div>
             
             {/* Type Grid */}
             <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
               {(Object.entries(PROPERTY_TYPES_INFO) as [PropertyType, any][]).map(([type, info]) => (
                  <button
                    key={type}
                    onClick={() => setPropertyType(type)}
                    className={`p-4 rounded-xl border text-left transition-all hover:scale-[1.02] ${
                      propertyType === type 
                        ? 'border-amber-400 bg-amber-400/10 text-white' 
                        : 'border-white/10 bg-white/5 text-white/50 hover:bg-white/10'
                    }`}
                  >
                    <div className="text-2xl mb-2">{info.icon}</div>
                    <div className="font-bold text-sm tracking-wide">{info.label}</div>
                  </button>
               ))}
             </div>

             {/* Name & Desc */}
             <div className="space-y-4">
                <div>
                   <label className="block text-white/70 text-sm font-bold mb-2">Property Name</label>
                   <input value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-amber-400/50 outline-none" placeholder="e.g. Sunset Paradise Villa" />
                </div>
                <div>
                   <label className="block text-white/70 text-sm font-bold mb-2">Description</label>
                   <textarea value={description} onChange={e => setDescription(e.target.value)} rows={5} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-amber-400/50 outline-none resize-none" placeholder="Tell guests what makes your place special..." />
                </div>
             </div>
          </div>
        );

      case 2: // LOCATION
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
             <div>
                <h1 className="text-3xl font-black text-white mb-2">Location</h1>
                <p className="text-white/60">Where can guests find you?</p>
             </div>
             <LocationPicker 
               latitude={latitude}
               longitude={longitude}
               address={addressLine1}
               city={city}
               country={country}
               onChange={(data) => {
                 setLatitude(data.latitude);
                 setLongitude(data.longitude);
                 setAddressLine1(data.address);
                 setCity(data.city);
                 setCountry(data.country);
                 if (data.state) setState(data.state);
                 if (data.postalCode) setPostalCode(data.postalCode);
               }}
             />
             <div className="grid grid-cols-2 gap-4">
                 <input value={addressLine1} onChange={e => setAddressLine1(e.target.value)} className="col-span-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white" placeholder="Address Line 1" />
                 <input value={city} onChange={e => setCity(e.target.value)} className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white" placeholder="City" />
                 <input value={country} onChange={e => setCountry(e.target.value)} className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white" placeholder="Country" />
             </div>
          </div>
        );

      case 3: // SPACES
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
             <div>
                <h1 className="text-3xl font-black text-white mb-2">Spaces</h1>
                <p className="text-white/60">Define the rooms and capacity.</p>
             </div>
             
             <div className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex-1">
                   <div className="text-xs text-white/50 font-bold uppercase mb-1">Total Guests</div>
                   <div className="text-2xl font-bold text-white">{maxGuests}</div>
                </div>
                <div className="flex-1">
                   <div className="text-xs text-white/50 font-bold uppercase mb-1">Total Beds</div>
                   <div className="text-2xl font-bold text-white">{totalBeds}</div>
                </div>
                <div className="flex-1">
                   <div className="text-xs text-white/50 font-bold uppercase mb-1">Bathrooms</div>
                   <div className="flex items-center gap-2">
                      <button onClick={() => setTotalBathrooms(Math.max(1, totalBathrooms - 0.5))} className="w-6 h-6 rounded bg-white/10 hover:bg-white/20">-</button>
                      <span className="text-xl font-bold text-white">{totalBathrooms}</span>
                      <button onClick={() => setTotalBathrooms(totalBathrooms + 0.5)} className="w-6 h-6 rounded bg-white/10 hover:bg-white/20">+</button>
                   </div>
                </div>
             </div>

             <RoomBuilder rooms={rooms} onChange={setRooms} />
          </div>
        );

      case 4: // AMENITIES
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
             <div>
                <h1 className="text-3xl font-black text-white mb-2">Amenities</h1>
                <p className="text-white/60">What do you offer to guests?</p>
             </div>
             <AmenitySelector selectedAmenities={amenities} onChange={setAmenities} />
          </div>
        );
      
      case 5: // PHOTOS
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
             <div>
                <h1 className="text-3xl font-black text-white mb-2">Photos</h1>
                <p className="text-white/60">Showcase your property. First photo is cover.</p>
             </div>
             <PhotoUploader 
                photos={photos} 
                onChange={setPhotos} 
                video={video}
                onVideoChange={setVideo}
             />
          </div>
        );

      case 6: // POLICIES
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
             <div>
                <h1 className="text-3xl font-black text-white mb-2">Policies</h1>
                <p className="text-white/60">Set the rules for your guests.</p>
             </div>
             <PoliciesEditor 
                checkInTime={checkInTime}
                checkOutTime={checkOutTime}
                cancellationPolicy={cancellationPolicy}
                petPolicy={petPolicy}
                smokingPolicy={smokingPolicy}
                houseRules={houseRules}
                ecoFeatures={ecoFeatures}
                onChange={(updates) => {
                   if(updates.checkInTime) setCheckInTime(updates.checkInTime);
                   if(updates.checkOutTime) setCheckOutTime(updates.checkOutTime);
                   if(updates.cancellationPolicy) setCancellationPolicy(updates.cancellationPolicy);
                   if(updates.petPolicy) setPetPolicy(updates.petPolicy);
                   if(updates.smokingPolicy) setSmokingPolicy(updates.smokingPolicy);
                   if(updates.houseRules) setHouseRules(updates.houseRules);
                   if(updates.ecoFeatures) setEcoFeatures(updates.ecoFeatures);
                }}
             />
          </div>
        );

      case 7: // PRICING
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
             <div>
                <h1 className="text-3xl font-black text-white mb-2">Pricing</h1>
                <p className="text-white/60">How much do you want to charge?</p>
             </div>
             
             <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-6">
                <div>
                   <label className="text-sm font-bold text-white mb-2 block">Base Price per Night</label>
                   <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 text-lg">$</span>
                      <input type="number" value={basePrice} onChange={e => setBasePrice(Number(e.target.value))} className="w-full pl-10 pr-4 py-4 rounded-xl bg-black/20 border border-white/10 text-white text-3xl font-bold outline-none" />
                   </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="text-sm font-bold text-white mb-2 block">Cleaning Fee</label>
                      <div className="relative">
                         <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">$</span>
                         <input type="number" value={cleaningFee} onChange={e => setCleaningFee(Number(e.target.value))} className="w-full pl-8 pr-4 py-3 rounded-xl bg-black/20 border border-white/10 text-white outline-none" />
                      </div>
                   </div>
                   <div>
                      <label className="text-sm font-bold text-white mb-2 block">Min Stay (Nights)</label>
                      <input type="number" value={minStay} onChange={e => setMinStay(Number(e.target.value))} className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-white outline-none" />
                   </div>
                </div>
             </div>

             <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                <div>
                   <div className="font-bold text-emerald-300">Instant Booking</div>
                   <div className="text-xs text-emerald-300/60">Guests can book without approval. Highly recommended.</div>
                </div>
                <button onClick={() => setInstantBooking(!instantBooking)} className={`w-12 h-6 rounded-full relative transition-colors ${instantBooking ? 'bg-emerald-500' : 'bg-white/10'}`}>
                   <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${instantBooking ? 'left-7' : 'left-1'}`} />
                </button>
             </div>
          </div>
        );

      case 8: // REVIEW
        return (
           <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
              <div>
                 <h1 className="text-3xl font-black text-white mb-2">Review & Submit</h1>
                 <p className="text-white/60">Check everything before going live.</p>
              </div>

              <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/5">
                 {photos[0] && (
                    <div className="relative h-64 w-full">
                       <Image src={photos[0].url} alt="Cover" fill className="object-cover" />
                       <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                       <div className="absolute bottom-6 left-6 right-6">
                          <h2 className="text-3xl font-bold text-white">{name}</h2>
                          <div className="flex items-center gap-2 text-white/80 mt-1">
                             <MapPin className="w-4 h-4" /> {city}, {country}
                          </div>
                       </div>
                    </div>
                 )}
                 <div className="p-6 grid grid-cols-2 gap-6 text-sm">
                    <div>
                       <div className="text-white/40 font-bold uppercase text-xs mb-1">Type</div>
                       <div className="text-white capitalize">{propertyType.replace('_', ' ')}</div>
                    </div>
                    <div>
                       <div className="text-white/40 font-bold uppercase text-xs mb-1">Price</div>
                       <div className="text-emerald-400 font-bold text-lg">${basePrice} <span className="text-xs font-normal text-white/40">/ night</span></div>
                    </div>
                    <div>
                       <div className="text-white/40 font-bold uppercase text-xs mb-1">Capacity</div>
                       <div className="text-white">{maxGuests} Guests • {totalBeds} Beds</div>
                    </div>
                    <div>
                       <div className="text-white/40 font-bold uppercase text-xs mb-1">Policies</div>
                       <div className="text-white capitalize">{cancellationPolicy} Cancellation</div>
                    </div>
                 </div>
              </div>

              {error && <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">{error}</div>}
              {successMessage && <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-2"><Check className="w-4 h-4"/> {successMessage}</div>}
           </div>
        );
      
      default: return null;
    }
  };

  if (status === 'loading') return <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center"><Loader2 className="w-8 h-8 text-amber-400 animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col md:flex-row">
      
      {/* LEFT SIDEBAR (Steps) */}
      <div className="hidden md:flex flex-col w-64 border-r border-white/5 bg-[#0a0a0f] p-6 pt-24 sticky top-0 h-screen">
         <div className="space-y-1">
            {STEPS.map((s, idx) => (
               <div key={s.step} className="relative">
                  {idx !== STEPS.length - 1 && <div className={`absolute left-[15px] top-8 bottom-0 w-0.5 ${currentStep > s.step ? 'bg-emerald-500' : 'bg-white/5'}`} />}
                  <button 
                    disabled={s.step > currentStep}
                    className={`flex items-center gap-3 w-full p-2 rounded-lg transition-all ${
                       currentStep === s.step ? 'bg-white/10 text-white' : 
                       currentStep > s.step ? 'text-emerald-400' : 'text-white/30'
                    }`}
                  >
                     <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border ${
                        currentStep === s.step ? 'border-amber-400 text-amber-400' :
                        currentStep > s.step ? 'bg-emerald-500 border-emerald-500 text-black' :
                        'border-white/10'
                     }`}>
                        {currentStep > s.step ? <Check className="w-4 h-4" /> : s.step}
                     </div>
                     <span className="font-bold text-sm">{s.label}</span>
                  </button>
               </div>
            ))}
         </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
         <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-[#0a0a0f]/80 backdrop-blur z-10 shrink-0">
            <button onClick={() => router.back()} className="text-white/50 hover:text-white flex items-center gap-2 text-sm font-bold">
               <ChevronLeft className="w-4 h-4" /> Exit
            </button>
            <div className="flex items-center gap-3">
               <button onClick={() => handleSave(false)} disabled={saving} className="px-4 py-2 rounded-lg text-sm font-bold text-white/60 hover:text-white hover:bg-white/5 disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save Draft'}
               </button>
            </div>
         </header>

         <main className="flex-1 overflow-y-auto p-6 md:p-12 pb-32 scrollbar-thin scrollbar-thumb-white/10">
            <MaxWidthContainer className="max-w-2xl mx-auto">
               {renderStep()}
            </MaxWidthContainer>
         </main>

         {/* FOOTER NAV ACTIONS */}
         <footer className="h-20 border-t border-white/5 bg-[#0a0a0f] flex items-center justify-between px-6 md:px-12 shrink-0">
            <button 
               onClick={handleBack} 
               disabled={currentStep === 1}
               className="px-6 py-3 rounded-xl font-bold text-white/50 hover:text-white disabled:opacity-0 transition-all"
            >
               Back
            </button>
            
            {currentStep < 8 ? (
               <button 
                  onClick={handleNext}
                  className="px-8 py-3 rounded-xl bg-amber-400 text-black font-bold hover:bg-amber-300 hover:scale-105 transition-all flex items-center gap-2 shadow-lg shadow-amber-400/20"
               >
                  Continue <ArrowRight className="w-4 h-4" />
               </button>
            ) : (
               <button 
                  onClick={() => handleSave(true)}
                  disabled={publishing}
                  className="px-8 py-3 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-400 hover:scale-105 transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
               >
                  {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                  Publish Listing
               </button>
            )}
         </footer>
      </div>
      
      {showImportWizard && (
          <ImportWizard 
              onImport={handleImportData} 
              onCancel={() => setShowImportWizard(false)} 
          />
      )}
    </div>
  );
}
