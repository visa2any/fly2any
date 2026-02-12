'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { MaxWidthContainer } from '@/components/layout/MaxWidthContainer';
import {
  Building2, Home, Hotel, MapPin, Plus, Minus, ChevronRight, ChevronLeft,
  Camera, Upload, X, Check, Sparkles, DollarSign, Save, Eye, Loader2,
  Wifi, Waves, Car, UtensilsCrossed, Dumbbell, Star, ArrowRight,
  Info, Shield, Leaf, Clock, Users, BedDouble, Bath, Maximize2
} from 'lucide-react';
import {
  PropertyType, RoomType, BedType, CancellationPolicyType,
  PROPERTY_TYPES_INFO, PROPERTY_AMENITY_CATEGORIES,
  type ListingWizardState, type WizardStep
} from '@/lib/properties/types';

// ------------------------------------------------------------------
// STEP LABELS
// ------------------------------------------------------------------
const WIZARD_STEPS = [
  { step: 1 as WizardStep, label: 'Property Basics', icon: Building2 },
  { step: 2 as WizardStep, label: 'Rooms & Capacity', icon: BedDouble },
  { step: 3 as WizardStep, label: 'Photos & Media', icon: Camera },
  { step: 4 as WizardStep, label: 'Amenities & Policies', icon: Shield },
  { step: 5 as WizardStep, label: 'Pricing & Go Live', icon: DollarSign },
];

// Amenity icons for display
const AMENITY_ICONS: Record<string, typeof Wifi> = {
  wifi: Wifi, pool: Waves, free_parking: Car, paid_parking: Car,
  kitchen: UtensilsCrossed, gym: Dumbbell, spa: Sparkles,
  breakfast_included: UtensilsCrossed, air_conditioning: Maximize2,
};

export default function CreatePropertyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedType = searchParams.get('type') as PropertyType | null;

  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);

  // ---------- Step 1: Basics ----------
  const [propertyName, setPropertyName] = useState('');
  const [propertyType, setPropertyType] = useState<PropertyType>(preselectedType || 'hotel');
  const [starRating, setStarRating] = useState<number>(0);
  const [addressLine1, setAddressLine1] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [description, setDescription] = useState('');

  // ---------- Step 2: Rooms ----------
  const [rooms, setRooms] = useState([{
    name: 'Standard Room', roomType: 'standard' as RoomType, bedType: 'queen' as BedType,
    bedCount: 1, maxOccupancy: 2, basePricePerNight: 100, quantity: 1, amenities: [] as string[],
  }]);
  const [maxGuests, setMaxGuests] = useState(2);
  const [totalBathrooms, setTotalBathrooms] = useState(1);

  // ---------- Step 3: Photos ----------
  const [photos, setPhotos] = useState<{ file?: File; url: string; caption: string; category: string; isPrimary: boolean }[]>([]);
  const [dragOver, setDragOver] = useState(false);

  // ---------- Step 4: Amenities & Policies ----------
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [checkInTime, setCheckInTime] = useState('15:00');
  const [checkOutTime, setCheckOutTime] = useState('11:00');
  const [cancellationPolicy, setCancellationPolicy] = useState<CancellationPolicyType>('flexible');
  const [houseRules, setHouseRules] = useState<string[]>([]);
  const [newRule, setNewRule] = useState('');
  const [ecoFeatures, setEcoFeatures] = useState<string[]>([]);

  // ---------- Step 5: Pricing ----------
  const [basePricePerNight, setBasePricePerNight] = useState(100);
  const [cleaningFee, setCleaningFee] = useState(0);
  const [weeklyDiscount, setWeeklyDiscount] = useState(0);
  const [monthlyDiscount, setMonthlyDiscount] = useState(0);
  const [instantBooking, setInstantBooking] = useState(true);
  const [minStay, setMinStay] = useState(1);

  // Move step
  const nextStep = useCallback(() => {
    setCurrentStep((prev) => Math.min(5, prev + 1) as WizardStep);
  }, []);
  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(1, prev - 1) as WizardStep);
  }, []);

  // Photo handling
  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return;
    const newPhotos = Array.from(files).map((file, idx) => ({
      file,
      url: URL.createObjectURL(file),
      caption: '',
      category: 'general',
      isPrimary: photos.length === 0 && idx === 0,
    }));
    setPhotos((prev) => [...prev, ...newPhotos]);
  }, [photos.length]);

  const removePhoto = useCallback((index: number) => {
    setPhotos((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      if (updated.length > 0 && !updated.some(p => p.isPrimary)) {
        updated[0].isPrimary = true;
      }
      return updated;
    });
  }, []);

  const setPrimaryPhoto = useCallback((index: number) => {
    setPhotos((prev) => prev.map((p, i) => ({ ...p, isPrimary: i === index })));
  }, []);

  // Toggle amenity
  const toggleAmenity = useCallback((amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  }, []);

  // Add room
  const addRoom = useCallback(() => {
    setRooms((prev) => [...prev, {
      name: `Room ${prev.length + 1}`, roomType: 'standard' as RoomType, bedType: 'queen' as BedType,
      bedCount: 1, maxOccupancy: 2, basePricePerNight: 100, quantity: 1, amenities: [],
    }]);
  }, []);

  const removeRoom = useCallback((index: number) => {
    setRooms((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Save draft
  const saveDraft = useCallback(async () => {
    setSaving(true);
    try {
      const data = {
        name: propertyName, propertyType, starRating, addressLine1, city, state, country, postalCode,
        description, latitude: 0, longitude: 0, status: 'draft',
        amenities: selectedAmenities, checkInTime, checkOutTime, cancellationPolicy, houseRules,
        basePricePerNight, cleaningFee, weeklyDiscount, monthlyDiscount, instantBooking, minStay,
        maxGuests, totalBathrooms, totalRooms: rooms.length, totalBedrooms: rooms.length,
        totalBeds: rooms.reduce((sum, r) => sum + r.bedCount, 0),
        ecoFeatures,
      };
      await fetch('/api/properties', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    } catch (err) {}
    setSaving(false);
  }, [propertyName, propertyType, starRating, addressLine1, city, state, country, postalCode, description, selectedAmenities, checkInTime, checkOutTime, cancellationPolicy, houseRules, basePricePerNight, cleaningFee, weeklyDiscount, monthlyDiscount, instantBooking, minStay, maxGuests, totalBathrooms, rooms, ecoFeatures]);

  // Publish
  const handlePublish = useCallback(async () => {
    setPublishing(true);
    try {
      await saveDraft();
      // TODO: navigate to success page or host dashboard
      router.push('/host/dashboard');
    } catch (err) {}
    setPublishing(false);
  }, [saveDraft, router]);

  // Render step progress
  const progressPercent = ((currentStep - 1) / (WIZARD_STEPS.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* ============================================
          TOP BAR — Progress + Save
          ============================================ */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/95 backdrop-blur-md border-b border-white/10">
        {/* Progress Bar */}
        <div className="h-1 bg-white/5">
          <div
            className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <MaxWidthContainer>
          <div className="flex items-center justify-between py-3">
            {/* Step indicators */}
            <div className="flex items-center gap-1 md:gap-3 overflow-x-auto">
              {WIZARD_STEPS.map((ws) => (
                <button
                  key={ws.step}
                  onClick={() => setCurrentStep(ws.step)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
                    ws.step === currentStep
                      ? 'bg-gradient-to-r from-yellow-400/20 to-amber-400/20 text-yellow-300 border border-yellow-500/30'
                      : ws.step < currentStep
                        ? 'text-emerald-400 bg-emerald-500/10'
                        : 'text-white/30 hover:text-white/50'
                  }`}
                >
                  {ws.step < currentStep ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <ws.icon className="w-3.5 h-3.5" />
                  )}
                  <span className="hidden md:inline">{ws.label}</span>
                  <span className="md:hidden">{ws.step}</span>
                </button>
              ))}
            </div>

            {/* Save Draft */}
            <button
              onClick={saveDraft}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white/60 hover:text-white bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span className="hidden md:inline">Save Draft</span>
            </button>
          </div>
        </MaxWidthContainer>
      </div>

      {/* ============================================
          WIZARD CONTENT
          ============================================ */}
      <div className="pt-20 pb-32">
        <MaxWidthContainer>
          <div className="max-w-3xl mx-auto px-4">

            {/* ===== STEP 1: Property Basics ===== */}
            {currentStep === 1 && (
              <div className="animate-fadeIn">
                <div className="mb-8">
                  <h2 className="text-2xl md:text-3xl font-black text-white mb-2">Tell us about your property</h2>
                  <p className="text-white/50">Start with the basics — you can always edit later.</p>
                </div>

                {/* Property Type */}
                <div className="mb-8">
                  <label className="text-white/70 text-sm font-semibold mb-3 block">Property type</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {(Object.entries(PROPERTY_TYPES_INFO) as [PropertyType, typeof PROPERTY_TYPES_INFO[PropertyType]][])
                      .slice(0, 6)
                      .map(([type, info]) => (
                      <button
                        key={type}
                        onClick={() => setPropertyType(type)}
                        className={`flex items-center gap-3 p-4 rounded-xl border transition-all duration-300 text-left ${
                          propertyType === type
                            ? 'border-yellow-500/50 bg-yellow-500/10 ring-1 ring-yellow-500/30'
                            : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]'
                        }`}
                      >
                        <span className="text-2xl">{info.icon}</span>
                        <div>
                          <div className={`font-bold text-sm ${ propertyType === type ? 'text-yellow-300' : 'text-white' }`}>{info.label}</div>
                          <div className="text-white/40 text-xs">{info.description}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name */}
                <div className="mb-6">
                  <label className="text-white/70 text-sm font-semibold mb-2 block">Property name</label>
                  <input
                    type="text"
                    value={propertyName}
                    onChange={(e) => setPropertyName(e.target.value)}
                    placeholder="e.g. Seaside Paradise Villa"
                    className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/30 outline-none transition-all"
                  />
                </div>

                {/* Star Rating */}
                <div className="mb-6">
                  <label className="text-white/70 text-sm font-semibold mb-2 block">Star rating (optional)</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        onClick={() => setStarRating(s === starRating ? 0 : s)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star className={`w-8 h-8 ${s <= starRating ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Address */}
                <div className="mb-6">
                  <label className="text-white/70 text-sm font-semibold mb-2 block">Address</label>
                  <input
                    type="text"
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    placeholder="Street address"
                    className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/30 outline-none transition-all mb-3"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text" value={city} onChange={(e) => setCity(e.target.value)}
                      placeholder="City" className="px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/30 outline-none transition-all"
                    />
                    <input
                      type="text" value={state} onChange={(e) => setState(e.target.value)}
                      placeholder="State/Province" className="px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/30 outline-none transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <input
                      type="text" value={country} onChange={(e) => setCountry(e.target.value)}
                      placeholder="Country" className="px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/30 outline-none transition-all"
                    />
                    <input
                      type="text" value={postalCode} onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="Postal Code" className="px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/30 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <label className="text-white/70 text-sm font-semibold mb-2 block">
                    Description
                    <span className="text-white/30 font-normal ml-2">(AI will enhance this)</span>
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what makes your property special..."
                    rows={4}
                    className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/30 outline-none transition-all resize-none"
                  />
                  <button className="mt-2 flex items-center gap-1.5 text-violet-400 text-sm font-semibold hover:text-violet-300 transition-colors">
                    <Sparkles className="w-4 h-4" />
                    Generate with AI
                  </button>
                </div>
              </div>
            )}

            {/* ===== STEP 2: Rooms & Capacity ===== */}
            {currentStep === 2 && (
              <div className="animate-fadeIn">
                <div className="mb-8">
                  <h2 className="text-2xl md:text-3xl font-black text-white mb-2">Rooms & Capacity</h2>
                  <p className="text-white/50">Add room types and set capacity for your property.</p>
                </div>

                {/* Overall Capacity */}
                <div className="grid grid-cols-2 gap-4 mb-8 p-5 rounded-2xl bg-white/[0.03] border border-white/10">
                  <div>
                    <label className="text-white/60 text-xs font-semibold mb-1 block">Max Guests</label>
                    <div className="flex items-center gap-3">
                      <button onClick={() => setMaxGuests(Math.max(1, maxGuests - 1))} className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 text-white flex items-center justify-center hover:bg-white/10">
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-2xl font-bold text-white w-10 text-center">{maxGuests}</span>
                      <button onClick={() => setMaxGuests(maxGuests + 1)} className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 text-white flex items-center justify-center hover:bg-white/10">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-white/60 text-xs font-semibold mb-1 block">Bathrooms</label>
                    <div className="flex items-center gap-3">
                      <button onClick={() => setTotalBathrooms(Math.max(0.5, totalBathrooms - 0.5))} className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 text-white flex items-center justify-center hover:bg-white/10">
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-2xl font-bold text-white w-10 text-center">{totalBathrooms}</span>
                      <button onClick={() => setTotalBathrooms(totalBathrooms + 0.5)} className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 text-white flex items-center justify-center hover:bg-white/10">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Room Types */}
                {rooms.map((room, idx) => (
                  <div key={idx} className="mb-4 p-5 rounded-2xl bg-white/[0.03] border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white font-bold text-lg flex items-center gap-2">
                        <BedDouble className="w-5 h-5 text-blue-400" />
                        Room {idx + 1}
                      </h3>
                      {rooms.length > 1 && (
                        <button onClick={() => removeRoom(idx)} className="text-red-400/60 hover:text-red-400 text-sm font-semibold flex items-center gap-1">
                          <X className="w-4 h-4" /> Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="text-white/60 text-xs font-semibold mb-1 block">Room Name</label>
                        <input type="text" value={room.name}
                          onChange={(e) => setRooms(prev => prev.map((r, i) => i === idx ? { ...r, name: e.target.value } : r))}
                          className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:border-yellow-500/50 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-white/60 text-xs font-semibold mb-1 block">Room Type</label>
                        <select value={room.roomType}
                          onChange={(e) => setRooms(prev => prev.map((r, i) => i === idx ? { ...r, roomType: e.target.value as RoomType } : r))}
                          className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none"
                        >
                          <option value="standard">Standard</option>
                          <option value="deluxe">Deluxe</option>
                          <option value="suite">Suite</option>
                          <option value="penthouse">Penthouse</option>
                          <option value="studio">Studio</option>
                          <option value="dormitory">Dormitory</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-white/60 text-xs font-semibold mb-1 block">Bed Type</label>
                        <select value={room.bedType}
                          onChange={(e) => setRooms(prev => prev.map((r, i) => i === idx ? { ...r, bedType: e.target.value as BedType } : r))}
                          className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none"
                        >
                          <option value="king">King</option>
                          <option value="queen">Queen</option>
                          <option value="double">Double</option>
                          <option value="twin">Twin</option>
                          <option value="single">Single</option>
                          <option value="bunk">Bunk</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-white/60 text-xs font-semibold mb-1 block">Max Guests</label>
                        <input type="number" value={room.maxOccupancy} min={1}
                          onChange={(e) => setRooms(prev => prev.map((r, i) => i === idx ? { ...r, maxOccupancy: parseInt(e.target.value) || 1 } : r))}
                          className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-white/60 text-xs font-semibold mb-1 block">Price/Night</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm">$</span>
                          <input type="number" value={room.basePricePerNight} min={1}
                            onChange={(e) => setRooms(prev => prev.map((r, i) => i === idx ? { ...r, basePricePerNight: parseInt(e.target.value) || 0 } : r))}
                            className="w-full pl-7 pr-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={addRoom}
                  className="w-full py-3 rounded-xl border border-dashed border-white/20 text-white/50 hover:text-white hover:border-white/40 transition-all flex items-center justify-center gap-2 text-sm font-semibold"
                >
                  <Plus className="w-4 h-4" /> Add Another Room Type
                </button>
              </div>
            )}

            {/* ===== STEP 3: Photos ===== */}
            {currentStep === 3 && (
              <div className="animate-fadeIn">
                <div className="mb-8">
                  <h2 className="text-2xl md:text-3xl font-black text-white mb-2">Photos & Media</h2>
                  <p className="text-white/50">Good photos increase bookings by up to 40%. AI will auto-tag your images.</p>
                </div>

                {/* Drop Zone */}
                <div
                  className={`relative mb-6 p-8 rounded-2xl border-2 border-dashed transition-all duration-300 text-center ${
                    dragOver
                      ? 'border-yellow-500 bg-yellow-500/10'
                      : 'border-white/20 bg-white/[0.02] hover:border-white/30'
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFileSelect(e.dataTransfer.files); }}
                >
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleFileSelect(e.target.files)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Upload className="w-12 h-12 text-white/30 mx-auto mb-3" />
                  <p className="text-white/60 font-semibold mb-1">Drag photos here or click to upload</p>
                  <p className="text-white/30 text-sm">JPG, PNG, WEBP • Max 10MB each • Recommended: at least 5 photos</p>
                </div>

                {/* Photo Grid */}
                {photos.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {photos.map((photo, idx) => (
                      <div key={idx} className={`relative group rounded-xl overflow-hidden border-2 transition-all ${
                        photo.isPrimary ? 'border-yellow-500 ring-2 ring-yellow-500/30' : 'border-white/10'
                      }`}>
                        <div className="relative aspect-[4/3]">
                          <Image src={photo.url} alt={photo.caption || `Photo ${idx + 1}`} fill className="object-cover" sizes="(max-width: 768px) 50vw, 33vw" />
                        </div>
                        {/* Overlay Tools */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button onClick={() => setPrimaryPhoto(idx)}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                              photo.isPrimary ? 'bg-yellow-500 text-black' : 'bg-white/20 text-white hover:bg-white/30'
                            }`}>
                            {photo.isPrimary ? '⭐ Cover' : 'Set Cover'}
                          </button>
                          <button onClick={() => removePhoto(idx)} className="p-1.5 rounded-lg bg-red-500/80 text-white hover:bg-red-500">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        {photo.isPrimary && (
                          <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-yellow-500 text-black text-xs font-bold">COVER</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ===== STEP 4: Amenities & Policies ===== */}
            {currentStep === 4 && (
              <div className="animate-fadeIn">
                <div className="mb-8">
                  <h2 className="text-2xl md:text-3xl font-black text-white mb-2">Amenities & Policies</h2>
                  <p className="text-white/50">Select what you offer and set your house rules.</p>
                </div>

                {/* Amenity Categories */}
                {Object.entries(PROPERTY_AMENITY_CATEGORIES).map(([catKey, category]) => (
                  <div key={catKey} className="mb-6">
                    <h3 className="text-white/80 font-bold text-sm mb-3">{category.label}</h3>
                    <div className="flex flex-wrap gap-2">
                      {category.options.map((amenity) => (
                        <button
                          key={amenity}
                          onClick={() => toggleAmenity(amenity)}
                          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                            selectedAmenities.includes(amenity)
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-white/5 text-white/50 border border-white/10 hover:border-white/20'
                          }`}
                        >
                          {selectedAmenities.includes(amenity) && <Check className="w-3.5 h-3.5" />}
                          {amenity.replace(/_/g, ' ')}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Check-in/out Times */}
                <div className="grid grid-cols-2 gap-4 mb-6 p-5 rounded-2xl bg-white/[0.03] border border-white/10">
                  <div>
                    <label className="text-white/60 text-xs font-semibold mb-1 block flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Check-in
                    </label>
                    <input type="time" value={checkInTime} onChange={(e) => setCheckInTime(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-white/60 text-xs font-semibold mb-1 block flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Check-out
                    </label>
                    <input type="time" value={checkOutTime} onChange={(e) => setCheckOutTime(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none"
                    />
                  </div>
                </div>

                {/* Cancellation Policy */}
                <div className="mb-6">
                  <label className="text-white/70 text-sm font-semibold mb-3 block">Cancellation Policy</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {(['flexible', 'moderate', 'strict', 'super_strict'] as CancellationPolicyType[]).map((policy) => (
                      <button
                        key={policy}
                        onClick={() => setCancellationPolicy(policy)}
                        className={`p-3 rounded-xl border text-sm font-semibold transition-all text-center ${
                          cancellationPolicy === policy
                            ? 'border-yellow-500/50 bg-yellow-500/10 text-yellow-300'
                            : 'border-white/10 bg-white/[0.03] text-white/50 hover:border-white/20'
                        }`}
                      >
                        {policy.replace(/_/g, ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* House Rules */}
                <div className="mb-6">
                  <label className="text-white/70 text-sm font-semibold mb-2 block">House Rules</label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text" value={newRule} onChange={(e) => setNewRule(e.target.value)}
                      placeholder="e.g. No smoking indoors" onKeyDown={(e) => {
                        if (e.key === 'Enter' && newRule.trim()) {
                          setHouseRules(prev => [...prev, newRule.trim()]); setNewRule('');
                        }
                      }}
                      className="flex-1 px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 outline-none"
                    />
                    <button onClick={() => { if (newRule.trim()) { setHouseRules(prev => [...prev, newRule.trim()]); setNewRule(''); } }}
                      className="px-4 py-2.5 rounded-lg bg-white/10 text-white text-sm font-semibold hover:bg-white/20 transition-colors">
                      Add
                    </button>
                  </div>
                  {houseRules.map((rule, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/[0.03] border border-white/5 mb-1.5">
                      <span className="text-white/70 text-sm">{rule}</span>
                      <button onClick={() => setHouseRules(prev => prev.filter((_, i) => i !== idx))} className="text-red-400/50 hover:text-red-400">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ===== STEP 5: Pricing & Publish ===== */}
            {currentStep === 5 && (
              <div className="animate-fadeIn">
                <div className="mb-8">
                  <h2 className="text-2xl md:text-3xl font-black text-white mb-2">Pricing & Go Live</h2>
                  <p className="text-white/50">Set your pricing and publish your listing to the world.</p>
                </div>

                {/* Base Price */}
                <div className="mb-6 p-6 rounded-2xl bg-white/[0.03] border border-white/10">
                  <label className="text-white/70 text-sm font-semibold mb-3 block">Base price per night</label>
                  <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 text-2xl font-bold">$</span>
                      <input type="number" value={basePricePerNight} min={1}
                        onChange={(e) => setBasePricePerNight(parseInt(e.target.value) || 0)}
                        className="w-full pl-10 pr-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white text-3xl font-black outline-none focus:border-yellow-500/50"
                      />
                    </div>
                    <button className="flex items-center gap-1.5 px-4 py-3 rounded-xl bg-violet-500/20 text-violet-300 font-semibold text-sm border border-violet-500/30 hover:bg-violet-500/30 transition-colors">
                      <Sparkles className="w-4 h-4" />
                      AI Suggest
                    </button>
                  </div>
                </div>

                {/* Extra Fees */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="text-white/60 text-xs font-semibold mb-1 block">Cleaning Fee ($)</label>
                    <input type="number" value={cleaningFee} min={0}
                      onChange={(e) => setCleaningFee(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-white/60 text-xs font-semibold mb-1 block">Min Stay (nights)</label>
                    <input type="number" value={minStay} min={1}
                      onChange={(e) => setMinStay(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none"
                    />
                  </div>
                </div>

                {/* Discounts */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="text-white/60 text-xs font-semibold mb-1 block">Weekly Discount (%)</label>
                    <input type="number" value={weeklyDiscount} min={0} max={50}
                      onChange={(e) => setWeeklyDiscount(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-white/60 text-xs font-semibold mb-1 block">Monthly Discount (%)</label>
                    <input type="number" value={monthlyDiscount} min={0} max={70}
                      onChange={(e) => setMonthlyDiscount(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none"
                    />
                  </div>
                </div>

                {/* Instant Booking Toggle */}
                <div className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.03] border border-white/10 mb-6">
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    <div>
                      <div className="text-white font-bold text-sm">Instant Booking</div>
                      <div className="text-white/40 text-xs">Guests can book without host approval</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setInstantBooking(!instantBooking)}
                    className={`relative w-14 h-7 rounded-full transition-all duration-300 ${
                      instantBooking ? 'bg-emerald-500' : 'bg-white/10'
                    }`}
                  >
                    <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform duration-300 ${
                      instantBooking ? 'translate-x-7' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>

                {/* Revenue Preview */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-green-500/5 border border-emerald-500/20 mb-8">
                  <h3 className="text-emerald-300 font-bold text-sm mb-3 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" /> Estimated Revenue
                  </h3>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-white/50 text-xs mb-0.5">Per Night</div>
                      <div className="text-white font-black text-xl">${basePricePerNight}</div>
                    </div>
                    <div>
                      <div className="text-white/50 text-xs mb-0.5">Monthly (80% occ.)</div>
                      <div className="text-emerald-400 font-black text-xl">${Math.round(basePricePerNight * 30 * 0.8).toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-white/50 text-xs mb-0.5">Yearly Est.</div>
                      <div className="text-emerald-400 font-black text-xl">${Math.round(basePricePerNight * 365 * 0.8).toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </MaxWidthContainer>
      </div>

      {/* ============================================
          BOTTOM NAVIGATION BAR
          ============================================ */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0f]/95 backdrop-blur-md border-t border-white/10 py-4">
        <MaxWidthContainer>
          <div className="flex items-center justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                currentStep === 1
                  ? 'text-white/20 cursor-not-allowed'
                  : 'text-white/70 hover:text-white bg-white/5 border border-white/10 hover:bg-white/10'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </button>

            <div className="text-white/40 text-sm font-medium">
              Step {currentStep} of 5
            </div>

            {currentStep < 5 ? (
              <button
                onClick={nextStep}
                className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-bold shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/40 hover:scale-105 transition-all"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handlePublish}
                disabled={publishing}
                className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-105 transition-all"
              >
                {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                <span>Publish & Go Live</span>
              </button>
            )}
          </div>
        </MaxWidthContainer>
      </div>
    </div>
  );
}
