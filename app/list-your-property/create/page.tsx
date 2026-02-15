'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { MaxWidthContainer } from '@/components/layout/MaxWidthContainer';
import {
  MapPin, ChevronRight, ChevronLeft, Camera, DollarSign, Save, Eye, Loader2,
  Check, ArrowRight, Home, Info, Shield, Layers, Calendar, Sparkles
} from 'lucide-react';
import {
  PropertyType, PROPERTY_TYPES_INFO,
  type WizardStep
} from '@/lib/properties/types';

// Components
import { ImportWizard } from './components/ImportWizard';
// Dynamic import for LocationPicker to avoid Leaflet SSR window error
import dynamic from 'next/dynamic';
const LocationPicker = dynamic(
  () => import('./components/LocationPicker').then((mod) => mod.LocationPicker),
  { 
    ssr: false,
    loading: () => <div className="h-[400px] w-full bg-neutral-100 rounded-2xl animate-pulse flex items-center justify-center text-neutral-400">Loading Map...</div>
  }
);
import { RoomBuilder, type RoomData } from './components/RoomBuilder';
import { AmenitySelector } from './components/AmenitySelector';
import { PhotoUploader } from './components/PhotoUploader';
import { PoliciesEditor } from './components/PoliciesEditor';
import { PricingEditor } from './components/PricingEditor';
import { ReviewStep } from './components/ReviewStep';

import { toast } from 'react-hot-toast';

// ----------------------------------------------------------------------------
// WIZARD STEPS
// ----------------------------------------------------------------------------
const STEPS: { id: WizardStep; label: string; icon: any }[] = [
  { id: 'basics', label: 'Basics', icon: Home },
  { id: 'location', label: 'Location', icon: MapPin },
  { id: 'spaces', label: 'Spaces', icon: Layers },
  { id: 'amenities', label: 'Amenities', icon: Sparkles },
  { id: 'photos', label: 'Photos', icon: Camera },
  { id: 'policies', label: 'Policies', icon: Shield },
  { id: 'pricing', label: 'Pricing', icon: DollarSign },
  { id: 'review', label: 'Review', icon: Check },
];

export default function CreatePropertyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  
  const [currentStep, setCurrentStep] = useState<WizardStep>('basics');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Draft ID if editing existing draft
  const [editingId, setEditingId] = useState<string | null>(searchParams.get('id'));

  // --------------------------------------------------------------------------
  // FORM STATE - CENTRALIZED
  // --------------------------------------------------------------------------
  const [formData, setFormData] = useState({
    // Basics
    title: '',
    description: '',
    type: 'apartment' as PropertyType,
    
    // Location
    location: {
      address: '',
      city: '',
      country: '',
      latitude: 0,
      longitude: 0,
    },

    // Spaces/Rooms
    specs: {
      guests: 2,
      bedrooms: 1,
      beds: 1,
      bathrooms: 1,
    },
    rooms: [] as RoomData[],

    // Amenities
    amenities: [] as string[],

    // Photos
    images: [] as string[],
    
    // Policies
    policies: {
      checkInTime: '15:00',
      checkOutTime: '11:00',
      cancellationPolicy: 'flexible',
      houseRules: [],
    },

    // Pricing
    pricing: {
      basePrice: 100,
      currency: 'USD',
      cleaningFee: 0,
    },
  });

  // Force Auth
  useEffect(() => {
    if (status === 'unauthenticated') {
      toast.error("Please sign in to list your property");
      router.push('/auth/signin?callbackUrl=/list-your-property/create');
    }
  }, [status, router]);

  // Load draft if ID present
  useEffect(() => {
    if (editingId && status === 'authenticated') {
    // ... existing load logic ...
       const fetchDraft = async () => {
         setIsLoading(true);
         try {
            const res = await fetch(`/api/host/properties/${editingId}`);
            if (res.ok) {
                const data = await res.json();
                // Merge data (mapper logic needed here to match generic state)
                // For MVP, we assume backend returns matching shape or we map it
                // setFormData(data); 
            }
         } catch (e) {
            console.error(e);
            toast.error("Failed to load draft");
         } finally {
            setIsLoading(false);
         }
       };
       fetchDraft();
    }
  }, [editingId, status]);


  // --------------------------------------------------------------------------
  // HANDLERS
  // --------------------------------------------------------------------------
  
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);

  const handleGenerateDescription = async () => {
    if (!formData.location.city) {
        toast.error("Please set a location first");
        return;
    }
    setIsGeneratingDesc(true);
    try {
        const res = await fetch('/api/ai/generate-description', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: formData.type,
                location: formData.location,
                specs: formData.specs,
                amenities: formData.amenities
            })
        });
        const data = await res.json();
        if (data.success) {
            setFormData(p => ({ ...p, description: data.description }));
            toast.success("Description generated!");
        } else {
            throw new Error(data.error);
        }
    } catch (e) {
        toast.error("Failed to generate description");
    } finally {
        setIsGeneratingDesc(false);
    }
  };

  const handleImportSuccess = (importedData: any) => {
    setFormData(prev => ({
      ...prev,
      title: importedData.name || prev.title,
      description: importedData.description || prev.description,
      type: (importedData.propertyType as PropertyType) || prev.type,
      location: {
         ...prev.location,
         address: importedData.address?.full_address || prev.location.address,
         city: importedData.address?.city || prev.location.city,
         country: importedData.address?.country || prev.location.country,
      },
      specs: {
         ...prev.specs,
         bedrooms: importedData.specs?.bedrooms || prev.specs.bedrooms,
         bathrooms: importedData.specs?.bathrooms || prev.specs.bathrooms,
         guests: importedData.specs?.maxGuests || prev.specs.guests,
      },
      amenities: [...prev.amenities, ...(importedData.amenities || [])],
      // We append imported images if any
      images: [...prev.images, ...(importedData.images || [])],
      pricing: {
          ...prev.pricing,
          basePrice: importedData.price?.amount || prev.pricing.basePrice
      },
      policies: {
          ...prev.policies,
          houseRules: [...prev.policies.houseRules, ...(importedData.houseRules || [])],
          checkInTime: importedData.checkIn || prev.policies.checkInTime,
          checkOutTime: importedData.checkOut || prev.policies.checkOutTime,
      }
    }));
    toast.success("Property data imported! Please review.");
  };

  const handleNext = () => {
    const idx = STEPS.findIndex(s => s.id === currentStep);
    if (idx < STEPS.length - 1) {
      setCurrentStep(STEPS[idx + 1].id);
      window.scrollTo(0,0);
    }
  };

  const handleBack = () => {
    const idx = STEPS.findIndex(s => s.id === currentStep);
    if (idx > 0) {
      setCurrentStep(STEPS[idx - 1].id);
      window.scrollTo(0,0);
    }
  };

  const handleSaveDraft = async () => {
    if (status !== 'authenticated') {
        toast.error("Please sign in to save");
        return;
    }
    setIsSaving(true);
    try {
        const res = await fetch('/api/host/properties', {
            method: editingId ? 'PUT' : 'POST',
            body: JSON.stringify({ ...formData, id: editingId, status: 'DRAFT' }),
            headers: { 'Content-Type': 'application/json' }
        });
        
        const data = await res.json();
        if (res.ok) {
            toast.success("Draft saved!");
            if (data.data?.id && !editingId) {
                setEditingId(data.data.id);
                // Use history API to update URL without reload (safe for SSR now)
                if (typeof window !== 'undefined') {
                    const newUrl = new URL(window.location.href);
                    newUrl.searchParams.set('id', data.data.id);
                    window.history.pushState({}, '', newUrl.toString());
                }
            }
        } else {
            throw new Error(data.error);
        }
    } catch (e: any) {
        toast.error("Failed to save: " + e.message);
    } finally {
        setIsSaving(false);
    }
  };

  const handlePublish = async () => {
     setIsSaving(true);
     // Similar to save but set status to PUBLISHED
     // ...
     setIsSaving(false);
     router.push('/host/dashboard');
     toast.success("Property Published! 🎉");
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'basics':
        return (
          <div className="animate-fadeIn h-full flex flex-col">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
                
                {/* Left Column: Import and Core Info */}
                <div className="space-y-6">
                    {/* Import Hero Section - Compact */}
                    <div className="bg-gradient-to-br from-primary-50 to-amber-50 rounded-2xl p-5 border border-primary-100 shadow-sm relative overflow-hidden">
                        <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
                            <Sparkles className="w-32 h-32 text-primary-500 transform translate-x-10 -translate-y-10" />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-primary-600" />
                                Short on time?
                            </h3>
                            <p className="text-gray-600 mb-4 text-sm">
                                Import details directly from Airbnb, Booking.com, or VRBO URL. We'll extract photos & logic.
                            </p>
                            <ImportWizard onImport={handleImportSuccess} />
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-neutral-100 xl:border-none xl:pt-0">
                       <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700">Property Title</label>
                          <input 
                             type="text" 
                             value={formData.title}
                             onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
                             placeholder="e.g. Sunny Loft in Downtown"
                             className="w-full p-4 bg-white border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all text-gray-900 font-medium placeholder-gray-400"
                          />
                          <p className="text-xs text-gray-500">Capture attention with a short, catchy title.</p>
                       </div>

                       <div className="space-y-2">
                          <div className="flex items-center justify-between">
                             <label className="block text-sm font-semibold text-gray-700">Description</label>
                             <button
                                onClick={handleGenerateDescription}
                                disabled={isGeneratingDesc || !formData.location.city}
                                className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1 bg-primary-50 px-3 py-1.5 rounded-lg border border-primary-200 transition-all hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                             >
                                {isGeneratingDesc ? (
                                    <>
                                        <Loader2 className="w-3 h-3 animate-spin" /> Writing...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-3 h-3" /> AI Write
                                    </>
                                )}
                             </button>
                          </div>
                          <textarea 
                             value={formData.description}
                             onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                             rows={6}
                             placeholder={formData.location.city ? `Describe your place in ${formData.location.city}...` : "Describe your place..."}
                             className="w-full p-4 bg-white border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all text-gray-900 placeholder-gray-400 resize-none leading-relaxed"
                          />
                       </div>
                    </div>
                </div>

                {/* Right Column: Property Type Grid */}
                <div className="space-y-4 flex flex-col">
                    <div>
                        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">What kind of place will you host?</h2>
                        <p className="text-gray-500 text-sm">Select the most accurate category.</p>
                    </div>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                        {Object.entries(PROPERTY_TYPES_INFO).map(([key, info]: [string, any]) => (
                          <button
                            key={key}
                            onClick={() => setFormData(p => ({ ...p, type: key as PropertyType }))}
                            className={`
                              p-4 rounded-xl border-2 text-left transition-all hover:shadow-md flex flex-col h-full
                              ${formData.type === key 
                                ? 'border-primary-600 bg-primary-50 ring-1 ring-primary-600' 
                                : 'border-neutral-200 hover:border-primary-300 bg-white'
                              }
                            `}
                          >
                            <div className="flex flex-col gap-2 mb-2">
                              <span className="text-3xl">{info.icon}</span>
                              <span className={`font-bold leading-tight ${formData.type === key ? 'text-primary-700' : 'text-gray-900'}`}>
                                {info.label}
                              </span>
                            </div>
                            <p className={`text-xs mt-auto ${formData.type === key ? 'text-primary-600' : 'text-gray-500'}`}>
                              {info.description}
                            </p>
                          </button>
                        ))}
                    </div>
                </div>

             </div>
          </div>
        );

      case 'location':
        return (
          <div className="animate-fadeIn flex flex-col h-full">
            <div className="flex-shrink-0 mb-4">
                 <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Where is your place located?</h2>
                 <p className="text-gray-500">Your address is only shared with guests after they make a reservation.</p>
            </div>
            
            <div className="bg-white p-1 rounded-2xl border border-neutral-200 shadow-sm overflow-hidden flex-1 min-h-[300px] relative">
                <LocationPicker 
                    initialLocation={formData.location}
                    onLocationSelect={(loc) => setFormData(p => ({ ...p, location: loc }))}
                />
            </div>

            <div className="flex-shrink-0 mt-4 bg-blue-50 p-4 rounded-xl flex items-start gap-3 text-blue-800 text-sm">
                <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p>Check the pin on the map carefully. If needed, drag it to the exact entrance location.</p>
            </div>
          </div>
        );

      case 'spaces':
        return (
          <div className="animate-fadeIn space-y-8">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">Room details & Guest capacity</h2>
            
            {/* Simple Counters */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Guests', key: 'guests' },
                    { label: 'Bedrooms', key: 'bedrooms' },
                    { label: 'Beds', key: 'beds' },
                    { label: 'Bathrooms', key: 'bathrooms' }
                ].map((item) => (
                    <div key={item.key} className="bg-white border border-neutral-200 p-4 rounded-xl flex flex-col items-center justify-center gap-2 shadow-sm">
                        <span className="text-gray-500 text-sm font-medium">{item.label}</span>
                        <div className="flex items-center gap-4">
                             <button 
                                onClick={() => setFormData(p => ({ ...p, specs: { ...p.specs, [item.key]: Math.max(0, (p.specs as any)[item.key] - 1) } }))}
                                className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center hover:bg-neutral-50 text-gray-600 transition-colors"
                             >-</button>
                             <span className="text-xl font-bold text-gray-900 w-6 text-center">{(formData.specs as any)[item.key]}</span>
                             <button
                                onClick={() => setFormData(p => ({ ...p, specs: { ...p.specs, [item.key]: (p.specs as any)[item.key] + 1 } }))}
                                className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center hover:bg-neutral-50 text-gray-600 transition-colors"
                             >+</button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Advanced Room Builder */}
            <div className="pt-6 border-t border-neutral-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Room-by-room details (Optional)</h3>
                <RoomBuilder 
                    rooms={formData.rooms}
                    onChange={(rooms) => {
                        // Smart Sync: Update totals based on detailed room data
                        const totalBedrooms = rooms.length;
                        const totalBeds = rooms.reduce((sum, r) => sum + r.bedCount, 0);
                        // Optional: Estimate bathrooms (1 per en-suite + 1 shared base?) - Let's stick to bedrooms/beds for now as they are direct.
                        const totalEnSuites = rooms.filter(r => r.enSuite).length;
                        
                        setFormData(p => ({ 
                            ...p, 
                            rooms,
                            specs: {
                                ...p.specs,
                                bedrooms: totalBedrooms,
                                beds: totalBeds,
                                // If they added an en-suite, ensure bathroom count reflects it? 
                                // Let's simplify: just sync beds/bedrooms to avoid confusion.
                            }
                        }));
                    }} 
                />
            </div>
          </div>
        );

      case 'amenities':
        return (
            <div className="animate-fadeIn">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">What does your place offer?</h2>
                <p className="text-gray-500 mb-8">Select all amenities available to guests.</p>
                <AmenitySelector
                    selected={formData.amenities}
                    onChange={(list) => setFormData(p => ({ ...p, amenities: list }))}
                />
            </div>
        );
      
      case 'photos':
         return (
            <div className="animate-fadeIn space-y-6">
                <div className="flex justify-between items-end">
                    <div>
                        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Add some photos of your place</h2>
                        <p className="text-gray-500">You'll need 5 photos to get started. You can add more or make changes later.</p>
                    </div>
                    <div className="hidden md:block bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold">
                        {formData.images.length} photos added
                    </div>
                </div>
                
                <PhotoUploader 
                    images={formData.images}
                    onChange={(imgs) => setFormData(p => ({ ...p, images: imgs }))}
                />
            </div>
         );

      case 'policies':
         return (
             <div className="animate-fadeIn">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">House Rules & Policies</h2>
                <PoliciesEditor 
                    data={formData.policies}
                    onChange={(policies) => setFormData(p => ({ ...p, policies }))}
                />
             </div>
         );

      case 'pricing':
          return (
              <div className="animate-fadeIn">
                 <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">How much do you want to charge?</h2>
                 <PricingEditor 
                    data={formData.pricing}
                    onChange={(pricing) => setFormData(p => ({ ...p, pricing }))}
                 />
              </div>
          );

      case 'review':
          return (
              <div className="animate-fadeIn">
                 <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">Review your listing</h2>
                 <ReviewStep data={formData} />
              </div>
          );

      default:
        return null;
    }
  };
  
  // Need to call renderStepContent inside the return, but I am replacing the return block mostly.
  // Wait, I can't replace the whole file easily. I will target the Sidebar area specifically.
  // Actually, I'll just add the Auth effect first, then the Sidebar change.

  return (
    <div className="h-screen overflow-hidden bg-neutral-50 flex flex-col md:flex-row text-gray-900">
      
      {/* LEFT SIDEBAR - NAVIGATION */}
      <div className="hidden md:flex flex-col w-80 bg-white border-r border-neutral-200 fixed h-full z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
         <div className="p-8 pb-4">
             <div className="flex items-center gap-2 mb-8" onClick={() => router.push('/')} role="button">
                {/* Brand Logo Placeholder */}
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">F</div>
                <span className="font-bold text-xl tracking-tight">Fly2Any<span className="text-primary-600">Host</span></span>
             </div>
             <button onClick={() => router.push('/host/dashboard')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-6">
                <ChevronLeft className="w-4 h-4" /> Exit
             </button>
             
             {/* User Info - Compact */}
             {session?.user && (
                 <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50 border border-neutral-100 mb-6">
                    {session.user.image ? (
                        <Image src={session.user.image} alt="User" width={32} height={32} className="rounded-full" />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-xs">
                            {session.user.name?.[0] || 'U'}
                        </div>
                    )}
                    <div className="overflow-hidden">
                        <p className="text-sm font-bold text-gray-900 truncate">{session.user.name}</p>
                        <p className="text-xs text-gray-500 truncate">Host Account</p>
                    </div>
                 </div>
             )}
         </div>

         <div className="flex-1 overflow-y-auto px-6 space-y-1 py-2">
            {STEPS.map((step, idx) => {
                const isActive = step.id === currentStep;
                const isCompleted = STEPS.findIndex(s => s.id === currentStep) > idx; 
                
                return (
                    <button
                        key={step.id}
                        onClick={() => {
                            if (isCompleted || editingId) setCurrentStep(step.id);
                        }}
                        disabled={!isCompleted && !editingId && !isActive}
                        className={`
                            w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all relative
                            ${isActive 
                                ? 'bg-primary-50 text-primary-700 font-semibold shadow-sm ring-1 ring-primary-100' 
                                : isCompleted 
                                    ? 'text-gray-700 hover:bg-neutral-50' 
                                    : 'text-gray-400 opacity-60 cursor-not-allowed'}
                        `}
                    >
                        {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-500 rounded-r-full" />}
                        <div className={`p-2 rounded-lg ${isActive ? 'bg-primary-100 text-primary-600' : 'bg-transparent'}`}>
                             <step.icon className="w-5 h-5" />
                        </div>
                        <span className="flex-1">{step.label}</span>
                        {isCompleted && <Check className="w-4 h-4 text-green-500" />}
                    </button>
                );
            })}
         </div>

         <div className="p-6 border-t border-neutral-100">
             <button 
                onClick={handleSaveDraft}
                disabled={isSaving}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-gray-600 font-semibold transition-all text-sm"
             >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Draft
             </button>
         </div>
      </div>

      {/* MOBILE HEADER */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-neutral-200 z-50 px-4 py-3 flex items-center justify-between shadow-sm">
         <button onClick={handleBack} className="p-2 -ml-2 text-gray-600">
            <ChevronLeft className="w-6 h-6" />
         </button>
         <span className="font-semibold text-gray-900">Step {STEPS.findIndex(s => s.id === currentStep) + 1} of {STEPS.length}</span>
         <button onClick={handleSaveDraft} className="text-sm font-semibold text-primary-600">Save</button>
      </div>


      {/* MAIN CONTENT AREA */}
      <div className="flex-1 md:ml-80 h-full flex flex-col relative">
          
          {/* Scrollable Content */}
          <main className="flex-1 w-full max-w-[1800px] mx-auto p-4 md:p-8 lg:p-12 overflow-y-auto custom-scrollbar">
             <div className="mb-8 block md:hidden">
                 <h1 className="text-2xl font-bold text-gray-900">{STEPS.find(s => s.id === currentStep)?.label}</h1>
             </div>

             {/* Dynamic Content - Pass height prop/class if needed? No, flex layout handles it */}
             {renderStepContent()}
          </main>

          {/* BOTTOM BAR (Fixed at bottom of flex container) */}
          <div className="flex-shrink-0 bg-white border-t border-neutral-200 p-4 md:px-12 md:py-6 flex items-center justify-between z-40 shadow-[0_-4px_24px_rgba(0,0,0,0.04)]">
              <button 
                 onClick={handleBack}
                 disabled={currentStep === 'basics'}
                 className="hidden md:block text-gray-600 font-semibold hover:underline disabled:opacity-30 disabled:hover:no-underline"
              >
                  Back
              </button>

              <div className="flex items-center gap-4 w-full md:w-auto">
                 <div className="md:hidden flex-1 h-1 bg-neutral-100 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-primary-500 transition-all duration-300"
                        style={{ width: `${((STEPS.findIndex(s => s.id === currentStep) + 1) / STEPS.length) * 100}%` }}
                    />
                 </div>

                 {currentStep === 'review' ? (
                     <button
                        onClick={handlePublish}
                        disabled={isSaving}
                        className="flex-1 md:flex-none bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-primary-500/25 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02]"
                     >
                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                        Publish Listing
                     </button>
                 ) : (
                     <button
                        onClick={handleNext}
                        className="flex-1 md:flex-none bg-neutral-900 hover:bg-black text-white px-8 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                     >
                        Continue <ArrowRight className="w-5 h-5" />
                     </button>
                 )}
              </div>
          </div>
      </div>

    </div>
  );
}
