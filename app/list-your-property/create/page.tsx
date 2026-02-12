'use client';

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { MaxWidthContainer } from '@/components/layout/MaxWidthContainer';
import {
  Building2, Home, Hotel, MapPin, Plus, Minus, ChevronRight, ChevronLeft,
  Camera, Upload, X, Check, Sparkles, DollarSign, Save, Eye, Loader2,
  Wifi, Waves, Car, UtensilsCrossed, Dumbbell, Star, ArrowRight,
  Info, Shield, Leaf, Clock, Users, BedDouble, Bath, Maximize2, Link as LinkIcon, Download, Zap, BarChart3
} from 'lucide-react';
import {
  PropertyType, RoomType, BedType, CancellationPolicyType,
  PROPERTY_TYPES_INFO, PROPERTY_AMENITY_CATEGORIES,
  type ListingWizardState, type WizardStep
} from '@/lib/properties/types';

// ------------------------------------------------------------------
// REFINED WIZARD LAYOUT
// ------------------------------------------------------------------

const WIZARD_STEPS = [
  { step: 1 as WizardStep, label: 'Start', icon: LinkIcon },
  { step: 2 as WizardStep, label: 'Basics', icon: MapPin },
  { step: 3 as WizardStep, label: 'Spaces', icon: BedDouble },
  { step: 4 as WizardStep, label: 'Photos', icon: Camera },
  { step: 5 as WizardStep, label: 'Finalize', icon: DollarSign },
];

export default function CreatePropertyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [isImporting, setIsImporting] = useState(false);
  const [importUrl, setImportUrl] = useState('');
  const [importError, setImportError] = useState('');
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);

  // Property Data
  const [propertyName, setPropertyName] = useState('');
  const [propertyType, setPropertyType] = useState<PropertyType>('hotel');
  const [description, setDescription] = useState('');
  const [starRating, setStarRating] = useState<number>(0);
  
  // Location
  const [addressLine1, setAddressLine1] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [postalCode, setPostalCode] = useState('');

  // Rooms
  const [rooms, setRooms] = useState([{
    name: 'Standard Room', roomType: 'standard' as RoomType, bedType: 'queen' as BedType,
    bedCount: 1, maxOccupancy: 2, basePricePerNight: 100, quantity: 1, amenities: [] as string[],
  }]);
  const [maxGuests, setMaxGuests] = useState(2);
  const [totalBathrooms, setTotalBathrooms] = useState(1);

  // Photos
  const [photos, setPhotos] = useState<{ file?: File; url: string; caption: string; category: string; isPrimary: boolean }[]>([]);
  const [dragOver, setDragOver] = useState(false);

  // Details
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [checkInTime, setCheckInTime] = useState('15:00');
  const [checkOutTime, setCheckOutTime] = useState('11:00');
  const [cancellationPolicy, setCancellationPolicy] = useState<CancellationPolicyType>('flexible');
  const [houseRules, setHouseRules] = useState<string[]>([]);
  const [newRule, setNewRule] = useState('');

  // Pricing
  const [basePricePerNight, setBasePricePerNight] = useState(100);
  const [cleaningFee, setCleaningFee] = useState(0);
  const [minStay, setMinStay] = useState(1);
  const [instantBooking, setInstantBooking] = useState(true);


  // ------------------------------------------------------------------
  // HANDLERS
  // ------------------------------------------------------------------

  const handleImport = async () => {
    if (!importUrl) return;
    setIsImporting(true);
    setImportError('');
    try {
      const res = await fetch('/api/properties/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: importUrl }),
      });
      const data = await res.json();
      if (data.success) {
        const p = data.data;
        setPropertyName(p.name || '');
        setDescription(p.description || '');
        if (p.propertyType) setPropertyType(p.propertyType);
        if (p.addressLine1) setAddressLine1(p.addressLine1);
        if (p.city) setCity(p.city);
        if (p.country) setCountry(p.country);
        if (p.basePricePerNight) setBasePricePerNight(p.basePricePerNight);
        if (p.images) {
          setPhotos(p.images.map((url: string, i: number) => ({ url, caption: '', category: 'general', isPrimary: i === 0 })));
        }
        setCurrentStep(2);
      } else {
        setImportError(data.message || 'Import failed.');
      }
    } catch { setImportError('Error importing.'); }
    setIsImporting(false);
  };

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return;
    const newPhotos = Array.from(files).map((file, idx) => ({
      file, url: URL.createObjectURL(file), caption: '', category: 'general', isPrimary: photos.length === 0 && idx === 0,
    }));
    setPhotos((prev) => [...prev, ...newPhotos]);
  }, [photos.length]);

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev => prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]);
  };

  const [publishError, setPublishError] = useState('');

  // Build the property payload from current state
  const buildPropertyPayload = () => ({
    name: propertyName,
    propertyType,
    description,
    starRating: starRating || null,
    addressLine1,
    city,
    state: state || null,
    country,
    postalCode: postalCode || null,
    amenities: selectedAmenities,
    checkInTime,
    checkOutTime,
    cancellationPolicy,
    houseRules,
    basePricePerNight,
    cleaningFee: cleaningFee || null,
    minStay,
    maxGuests,
    instantBooking,
    totalRooms: rooms.length,
    totalBathrooms,
    totalBedrooms: rooms.length,
    totalBeds: rooms.reduce((sum, r) => sum + r.bedCount, 0),
    status: 'draft',
  });

  // Save rooms to a property
  const saveRooms = async (propertyId: string) => {
    for (const room of rooms) {
      await fetch(`/api/properties/${propertyId}/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: room.name,
          roomType: room.roomType,
          bedType: room.bedType,
          bedCount: room.bedCount,
          maxOccupancy: room.maxOccupancy,
          basePricePerNight: room.basePricePerNight,
          quantity: room.quantity,
          amenities: room.amenities,
        }),
      });
    }
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    setPublishError('');
    try {
      const res = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPropertyPayload()),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setPublishError(data.error || 'Failed to save draft');
        setSaving(false);
        return;
      }
      // Save rooms
      await saveRooms(data.data.id);
      setSaving(false);
      router.push('/host/dashboard');
    } catch (err) {
      setPublishError('Network error. Please try again.');
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    setPublishError('');
    try {
      // 1. Create property
      const res = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPropertyPayload()),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setPublishError(data.error || 'Failed to create property');
        setPublishing(false);
        return;
      }
      const propertyId = data.data.id;

      // 2. Save rooms
      await saveRooms(propertyId);

      // 3. Publish (validate & go live)
      const pubRes = await fetch(`/api/properties/${propertyId}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const pubData = await pubRes.json();
      if (!pubRes.ok || !pubData.success) {
        // Property saved as draft but publish validation failed
        setPublishError(pubData.validationErrors?.join(', ') || pubData.error || 'Publish validation failed — saved as draft.');
        setPublishing(false);
        return;
      }

      setPublishing(false);
      router.push('/host/dashboard');
    } catch (err) {
      setPublishError('Network error. Please try again.');
      setPublishing(false);
    }
  };

  // ------------------------------------------------------------------
  // RENDER HELPERS
  // ------------------------------------------------------------------
  
  // Navigation Buttons
  const NavButtons = () => (
    <div className="mt-12 border-t border-white/10 pt-6">
      {publishError && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-sm">
          {publishError}
        </div>
      )}
      <div className="flex items-center justify-between">
      {currentStep > 1 && (
        <button onClick={() => setCurrentStep(prev => Math.max(1, prev - 1) as WizardStep)} 
          className="px-6 py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/5 font-bold transition-colors flex items-center gap-2">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
      )}
      <div className="flex-1" />
      {currentStep < 5 ? (
        <button onClick={() => setCurrentStep(prev => Math.min(5, prev + 1) as WizardStep)} 
          className="px-8 py-3 rounded-xl bg-amber-400 text-black font-bold hover:scale-105 transition-transform flex items-center gap-2 shadow-lg shadow-amber-400/20">
          Continue <ArrowRight className="w-4 h-4" />
        </button>
      ) : (
        <button onClick={handlePublish} disabled={publishing}
          className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold hover:scale-105 transition-transform flex items-center gap-2 shadow-lg shadow-emerald-500/20">
          {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
          Publish Listing
        </button>
      )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
      {/* Top Header */}
      <header className="fixed top-0 inset-x-0 h-16 bg-[#0a0a0f]/90 backdrop-blur border-b border-white/10 z-50 flex items-center px-4 md:px-8 justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-white/5 rounded-lg text-white/60 hover:text-white">
            <X className="w-5 h-5" />
          </button>
          <span className="font-bold text-white hidden sm:inline">Add New Property</span>
        </div>
        <div className="flex items-center gap-2">
           <div className="w-32 h-1.5 bg-white/10 rounded-full overflow-hidden hidden md:block">
             <div className="h-full bg-amber-400 transition-all duration-500" style={{ width: `${(currentStep / 5) * 100}%` }} />
           </div>
           <span className="text-white/40 text-sm font-medium">Step {currentStep}</span>
        </div>
        <button onClick={handleSaveDraft} disabled={saving} className="text-sm font-bold text-white/60 hover:text-white px-4 py-2 hover:bg-white/5 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Draft
        </button>
      </header>

      <main className="flex-1 pt-16 flex flex-col md:flex-row h-screen overflow-hidden">
        {/* LEFT: Scrollable Form */}
        <div className="flex-1 overflow-y-auto p-6 md:p-12 pb-32 scrollbar-thin scrollbar-thumb-white/10">
          <MaxWidthContainer className="max-w-xl mx-auto">
            
            {/* STEP 1: IMPORT */}
            {currentStep === 1 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h1 className="text-3xl md:text-4xl font-black text-white mb-4">Let's get started</h1>
                <p className="text-white/60 text-lg mb-8">Import from an existing listing or start fresh.</p>
                <div className="space-y-6">
                  {/* Import Option */}
                  <div className={`p-6 rounded-2xl border-2 transition-all ${importUrl ? 'border-amber-400 bg-amber-400/5' : 'border-white/10 bg-white/[0.02]'}`}>
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-blue-600/20 text-blue-400"><Download className="w-6 h-6" /></div>
                      <div className="flex-1">
                        <h3 className="text-white font-bold text-lg">Import from URL</h3>
                        <p className="text-white/50 text-sm mb-4">Paste a link from Airbnb, Booking.com, or VRBO.</p>
                        <div className="relative">
                          <input type="text" placeholder="https://..." value={importUrl} onChange={(e) => setImportUrl(e.target.value)}
                            className="w-full pl-4 pr-12 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-amber-400/50 outline-none" />
                          <button onClick={handleImport} disabled={!importUrl || isImporting}
                            className="absolute right-2 top-1.5 bottom-1.5 px-4 rounded-lg bg-amber-400 text-black font-bold text-sm hover:bg-amber-300 disabled:opacity-50">
                            {isImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Import'}
                          </button>
                        </div>
                        {importError && <p className="text-red-400 text-sm mt-2">{importError}</p>}
                      </div>
                    </div>
                  </div>
                  {/* Divider */}
                  <div className="flex items-center gap-4"><div className="h-px bg-white/10 flex-1" /><span className="text-white/30 text-sm font-bold">OR</span><div className="h-px bg-white/10 flex-1" /></div>
                  {/* Manual Option */}
                  <button onClick={() => setCurrentStep(2)} className="w-full p-6 rounded-2xl border-2 border-dashed border-white/10 hover:border-white/30 hover:bg-white/[0.02] transition-all text-left flex items-center gap-4 group">
                    <div className="p-3 rounded-xl bg-white/5 text-white/50 group-hover:text-white"><Plus className="w-6 h-6" /></div>
                    <div><h3 className="text-white font-bold text-lg">Create from scratch</h3><p className="text-white/50 text-sm">Manually enter details.</p></div>
                    <ChevronRight className="w-5 h-5 text-white/20 ml-auto" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: BASICS */}
            {currentStep === 2 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h1 className="text-3xl font-black text-white mb-6">Property Basics</h1>
                <div className="space-y-6">
                  <div>
                    <label className="block text-white/70 text-sm font-bold mb-2">Property Type</label>
                    <div className="grid grid-cols-2 gap-3">
                      {(Object.entries(PROPERTY_TYPES_INFO).slice(0, 4) as [PropertyType, any][]).map(([type, info]) => (
                        <button key={type} onClick={() => setPropertyType(type)}
                          className={`p-3 rounded-xl border text-left transition-all ${propertyType === type ? 'border-amber-400 bg-amber-400/10 text-white' : 'border-white/10 bg-white/5 text-white/60'}`}>
                          <div className="text-xl mb-1">{info.icon}</div>
                          <div className="font-bold text-sm">{info.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-white/70 text-sm font-bold mb-2">Property Name</label>
                    <input type="text" value={propertyName} onChange={(e) => setPropertyName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-amber-400/50 outline-none" placeholder="e.g. Sunset Villa" />
                  </div>
                   <div>
                    <label className="block text-white/70 text-sm font-bold mb-2">Description</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-amber-400/50 outline-none resize-none" placeholder="Describe your property..." />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="block text-white/70 text-sm font-bold mb-2">City</label>
                       <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none" />
                     </div>
                     <div>
                       <label className="block text-white/70 text-sm font-bold mb-2">Country</label>
                       <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none" />
                     </div>
                  </div>
                </div>
                <NavButtons />
              </div>
            )}

            {/* STEP 3: SPACES (Rooms) */}
            {currentStep === 3 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h1 className="text-3xl font-black text-white mb-6">Rooms & Capacity</h1>
                
                <div className="grid grid-cols-2 gap-4 mb-8">
                   <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <label className="text-white/60 text-xs font-bold mb-2 block">Max Guests</label>
                      <div className="flex items-center gap-4">
                         <button onClick={() => setMaxGuests(Math.max(1, maxGuests - 1))} className="p-2 rounded-lg bg-white/10 hover:bg-white/20"><Minus className="w-4 h-4 text-white" /></button>
                         <span className="text-xl font-bold text-white">{maxGuests}</span>
                         <button onClick={() => setMaxGuests(maxGuests + 1)} className="p-2 rounded-lg bg-white/10 hover:bg-white/20"><Plus className="w-4 h-4 text-white" /></button>
                      </div>
                   </div>
                   <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <label className="text-white/60 text-xs font-bold mb-2 block">Bathrooms</label>
                      <div className="flex items-center gap-4">
                         <button onClick={() => setTotalBathrooms(Math.max(1, totalBathrooms - 0.5))} className="p-2 rounded-lg bg-white/10 hover:bg-white/20"><Minus className="w-4 h-4 text-white" /></button>
                         <span className="text-xl font-bold text-white">{totalBathrooms}</span>
                         <button onClick={() => setTotalBathrooms(totalBathrooms + 0.5)} className="p-2 rounded-lg bg-white/10 hover:bg-white/20"><Plus className="w-4 h-4 text-white" /></button>
                      </div>
                   </div>
                </div>

                <div className="space-y-4">
                  {rooms.map((room, idx) => (
                    <div key={idx} className="p-5 rounded-xl bg-white/5 border border-white/10">
                       <div className="flex justify-between mb-4">
                          <h3 className="font-bold text-white">Room {idx + 1}</h3>
                          {rooms.length > 1 && <button onClick={() => setRooms(prev => prev.filter((_, i) => i !== idx))} className="text-red-400 text-xs font-bold">Remove</button>}
                       </div>
                       <div className="grid grid-cols-2 gap-3 mb-3">
                          <input type="text" value={room.name} onChange={(e) => setRooms(prev => prev.map((r, i) => i === idx ? { ...r, name: e.target.value } : r))} className="px-3 py-2 rounded-lg bg-black/20 border border-white/10 text-white text-sm" placeholder="Room Name" />
                          <select value={room.bedType} onChange={(e) => setRooms(prev => prev.map((r, i) => i === idx ? { ...r, bedType: e.target.value as BedType } : r))} className="px-3 py-2 rounded-lg bg-black/20 border border-white/10 text-white text-sm">
                             <option value="king">King Bed</option><option value="queen">Queen Bed</option><option value="twin">Twin Beds</option>
                          </select>
                       </div>
                    </div>
                  ))}
                  <button onClick={() => setRooms(prev => [...prev, { name: `Room ${prev.length + 1}`, roomType: 'standard', bedType: 'queen', bedCount: 1, maxOccupancy: 2, basePricePerNight: 100, quantity: 1, amenities: [] }])} 
                    className="w-full py-3 rounded-xl border border-dashed border-white/20 text-white/50 hover:text-white hover:border-white/40 flex items-center justify-center gap-2 font-bold text-sm">
                    <Plus className="w-4 h-4" /> Add Room
                  </button>
                </div>
                <NavButtons />
              </div>
            )}

            {/* STEP 4: PHOTOS */}
            {currentStep === 4 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h1 className="text-3xl font-black text-white mb-6">Property Photos</h1>
                <div 
                   onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                   onDragLeave={() => setDragOver(false)}
                   onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFileSelect(e.dataTransfer.files); }}
                   className={`relative mb-6 p-8 rounded-2xl border-2 border-dashed transition-all text-center ${dragOver ? 'border-amber-400 bg-amber-400/10' : 'border-white/20 bg-white/5'}`}>
                   <input type="file" multiple accept="image/*" onChange={(e) => handleFileSelect(e.target.files)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                   <Upload className="w-10 h-10 text-white/30 mx-auto mb-3" />
                   <p className="text-white font-bold">Click to upload or drag photos</p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                   {photos.map((photo, idx) => (
                      <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-white/5 border border-white/10 group">
                         <Image src={photo.url} alt="Upload" fill className="object-cover" />
                         <button onClick={() => setPhotos(prev => prev.filter((_, i) => i !== idx))} className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
                      </div>
                   ))}
                </div>
                <NavButtons />
              </div>
            )}

            {/* STEP 5: FINALIZE (Pricing & Policies) */}
            {currentStep === 5 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h1 className="text-3xl font-black text-white mb-6">Pricing & Details</h1>
                
                <div className="mb-8">
                   <h3 className="text-white font-bold mb-4 flex items-center gap-2"><DollarSign className="w-4 h-4 text-amber-400"/> Base Price</h3>
                   <div className="flex gap-4">
                      <div className="relative flex-1">
                         <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 text-lg">$</span>
                         <input type="number" value={basePricePerNight} onChange={(e) => setBasePricePerNight(parseInt(e.target.value) || 0)} 
                           className="w-full pl-8 pr-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white text-2xl font-bold outline-none focus:border-amber-400/50" />
                      </div>
                   </div>
                </div>

                <div className="mb-8">
                   <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Shield className="w-4 h-4 text-amber-400"/> Amenities</h3>
                   <div className="flex flex-wrap gap-2">
                      {['wifi', 'kitchen', 'pool', 'gym', 'ac', 'parking'].map(amenity => (
                         <button key={amenity} onClick={() => toggleAmenity(amenity)}
                           className={`px-4 py-2 rounded-xl border text-sm font-bold transition-all ${selectedAmenities.includes(amenity) ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-white/5 border-white/10 text-white/50'}`}>
                           {amenity.toUpperCase()}
                         </button>
                      ))}
                   </div>
                </div>

                <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                   <div>
                      <div className="font-bold text-white">Instant Booking</div>
                      <div className="text-xs text-white/50">Allow guests to book without manual approval</div>
                   </div>
                   <button onClick={() => setInstantBooking(!instantBooking)} className={`w-12 h-6 rounded-full relative transition-colors ${instantBooking ? 'bg-emerald-500' : 'bg-white/20'}`}>
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${instantBooking ? 'left-7' : 'left-1'}`} />
                   </button>
                </div>

                <NavButtons />
              </div>
            )}

          </MaxWidthContainer>
        </div>

        {/* RIGHT: Live Preview Panel */}
        <div className="hidden md:flex flex-1 bg-white/[0.02] border-l border-white/5 relative items-center justify-center p-12 overflow-hidden">
           <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px_32px]" />
           
           <div className="relative w-full max-w-md bg-[#1a1a20] rounded-3xl shadow-2xl overflow-hidden border border-white/10 transform rotate-1 hover:rotate-0 transition-transform duration-500 flex flex-col h-[700px]">
             {/* Header */}
             <div className="h-14 bg-black/40 backdrop-blur flex items-center justify-between px-4 border-b border-white/5">
                <div className="w-20 h-4 bg-white/10 rounded-full" />
                <div className="flex gap-2"><div className="w-8 h-8 rounded-full bg-white/10" /></div>
             </div>
             
             {/* Content */}
             <div className="flex-1 overflow-y-auto bg-[#0a0a0f] scrollbar-hide">
               <div className="h-64 bg-white/5 relative group">
                  {photos.length > 0 ? (
                     <Image src={photos[0].url} alt="Cover" fill className="object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-white/10 flex-col gap-2">
                       <Camera className="w-12 h-12" />
                       <span className="text-xs font-bold uppercase tracking-widest">Cover Image</span>
                    </div>
                  )}
                  <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                     <h2 className="text-2xl font-bold text-white leading-tight">{propertyName || 'Property Name'}</h2>
                     <div className="text-white/70 text-sm flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" /> {city || 'City'}, {country || 'Country'}
                     </div>
                  </div>
               </div>
               
               <div className="p-6 space-y-6">
                  <div className="flex justify-between items-center pb-6 border-b border-white/10">
                     <div>
                        <div className="text-xs text-white/40 font-bold uppercase tracking-wider mb-1">Price per night</div>
                        <div className="text-2xl font-black text-emerald-400">${basePricePerNight}</div>
                     </div>
                     <div className="flex gap-2">
                        {propertyType && <span className="px-3 py-1 rounded-full bg-white/10 text-white/70 text-xs font-bold capitalize">{PROPERTY_TYPES_INFO[propertyType]?.label || propertyType}</span>}
                        {starRating > 0 && <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-300 text-xs font-bold flex items-center gap-1"><Star className="w-3 h-3 fill-yellow-300" /> {starRating}</span>}
                     </div>
                  </div>

                  <div>
                     <h3 className="text-white font-bold mb-2">About this space</h3>
                     <p className="text-white/60 text-sm leading-relaxed">
                       {description || 'Your property description will appear here. Adding a good description helps guests understand what makes your place special.'}
                     </p>
                  </div>

                  <div>
                     <h3 className="text-white font-bold mb-3">Amenities</h3>
                     <div className="grid grid-cols-2 gap-3">
                        {selectedAmenities.length > 0 ? selectedAmenities.slice(0, 4).map(a => (
                           <div key={a} className="flex items-center gap-2 text-white/60 text-sm">
                              <Check className="w-3 h-3 text-emerald-400" /> <span className="capitalize">{a}</span>
                           </div>
                        )) : (
                           <div className="text-white/20 text-sm italic">No amenities selected</div>
                        )}
                     </div>
                  </div>
               </div>
             </div>

             {/* Footer Booking Bar */}
             <div className="p-4 bg-[#1a1a20] border-t border-white/10">
                <button className="w-full py-3 rounded-xl bg-amber-400 text-black font-bold">Reserve</button>
             </div>

             {/* Live Tag */}
             <div className="absolute top-4 right-4 bg-emerald-500 text-white text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider shadow-lg z-10">
               Live Preview
             </div>
           </div>
        </div>
      </main>
    </div>
  );
}
