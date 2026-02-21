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
  PropertyType, PROPERTY_TYPES_INFO, BUILDING_TYPES,
  PROPERTY_AMENITY_CATEGORIES,
  type WizardStep
} from '@/lib/properties/types';

// Components
import { HostHeader } from '@/components/host/HostHeader';
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
import { WizardProgressBar } from './components/WizardProgressBar';
import { PoliciesEditor } from './components/PoliciesEditor';
import { PricingEditor } from './components/PricingEditor';
import { ReviewStep } from './components/ReviewStep';

import { toast } from 'react-hot-toast';
import { validateStep } from './lib/validation';
import confetti from 'canvas-confetti';

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
  const [stepErrors, setStepErrors] = useState<string[]>([]);

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

    // Building & Access
    building: {
      buildingType: '' as string,
      totalFloors: undefined as number | undefined,
      propertyFloor: undefined as number | undefined,
      hasElevator: false,
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
    images: [] as any[],
    
    // Policies
    policies: {
      checkInTime: '15:00',
      checkOutTime: '11:00',
      checkInInstructions: '',
      cancellationPolicy: 'flexible',
      cancellationDetails: undefined as any,
      petPolicy: 'not_allowed',
      smokingPolicy: 'not_allowed',
      childPolicy: 'all_ages',
      minAge: undefined as number | undefined,
      securityDeposit: undefined as number | undefined,
      houseRules: [] as string[],
      ecoFeatures: [] as string[],
      ecoCertifications: [] as string[],
    },

    // Pricing
    pricing: {
      basePrice: 100,
      currency: 'USD',
      cleaningFee: 0,
      petFee: 0,
      extraGuestFee: 0,
      weekendPrice: 0,
      smartPricing: false,
      weeklyDiscount: 0,
      monthlyDiscount: 0,
      minStay: 1,
      maxStay: 0,
      instantBooking: true,
      taxRate: 0,
    },
  });

// ... existing imports ...

  // Helper: Prepare payload for API (Flatten objects → flat schema fields only)
  const preparePayload = (data: typeof formData) => {
      return {
          // Core
          name: data.title || 'Untitled Property',
          propertyType: data.type || 'hotel',
          description: data.description || '',

          // Location (required String fields must not be undefined)
          addressLine1: data.location.address || '',
          city: data.location.city || '',
          country: data.location.country || '',
          latitude: data.location.latitude || 0,
          longitude: data.location.longitude || 0,
          
          // Specs
          maxGuests: data.specs.guests || 2,
          totalBedrooms: data.specs.bedrooms || 1,
          totalBeds: data.specs.beds || 1,
          totalBathrooms: data.specs.bathrooms || 1,
          
          // Amenities
          amenities: data.amenities || [],
          highlights: [] as string[],
          languages: [] as string[],
          accessibilityFeatures: (data.amenities || []).filter(a => 
            PROPERTY_AMENITY_CATEGORIES.accessibility.options.includes(a as any)
          ),

          // Building & Access
          buildingType: data.building.buildingType || null,
          totalFloors: data.building.totalFloors ?? null,
          propertyFloor: data.building.propertyFloor ?? null,
          hasElevator: data.building.hasElevator ?? false,

          // Photos
          images: data.images || [],

          // Rooms
          rooms: data.rooms || [],
          
          // Pricing (use nullish coalescing to preserve 0 values)
          basePricePerNight: data.pricing.basePrice ?? null,
          currency: data.pricing.currency || 'USD',
          cleaningFee: data.pricing.cleaningFee ?? null,
          petFee: data.pricing.petFee ?? null,
          extraGuestFee: data.pricing.extraGuestFee ?? null,
          weekendPrice: data.pricing.weekendPrice ?? null,
          securityDeposit: data.policies.securityDeposit ?? null,
          weeklyDiscount: data.pricing.weeklyDiscount ?? null,
          monthlyDiscount: data.pricing.monthlyDiscount ?? null,
          smartPricing: data.pricing.smartPricing ?? false,
          minStay: data.pricing.minStay ?? 1,
          maxStay: data.pricing.maxStay || null,
          instantBooking: data.pricing.instantBooking ?? true,
          taxRate: data.pricing.taxRate ?? null,
          
          // Policies
          checkInTime: data.policies.checkInTime || '15:00',
          checkOutTime: data.policies.checkOutTime || '11:00',
          checkInInstructions: data.policies.checkInInstructions || null,
          cancellationPolicy: data.policies.cancellationPolicy || 'flexible',
          cancellationDetails: data.policies.cancellationDetails || null,
          houseRules: data.policies.houseRules || [],
          petPolicy: data.policies.petPolicy || null,
          smokingPolicy: data.policies.smokingPolicy || null,
          childPolicy: data.policies.childPolicy || null,
          minAge: data.policies.minAge ?? null,
          ecoFeatures: data.policies.ecoFeatures || [],
          ecoCertifications: data.policies.ecoCertifications || [],
          
          // Status
          status: 'DRAFT'
      };
  };

  // Force Auth
  useEffect(() => {
    if (status === 'unauthenticated') {
      toast.error("Please sign in to list your property");
      router.push('/auth/signin?callbackUrl=/list-your-property/create');
    }
  }, [status, router]);

  // --------------------------------------------------------------------------
  // AUTO-SAVE & PERSISTENCE
  // --------------------------------------------------------------------------
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  // 1. Load from LocalStorage on mount (if no ID)
  useEffect(() => {
    // If we have an ID, we should probably fetch from API instead of local (omitted for now)
    if (!editingId) {
        const saved = localStorage.getItem('fly2any_host_draft');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Basic validation/heuristic
                if (parsed.title || parsed.location?.city) {
                    toast((t) => (
                        <div className="flex flex-col gap-2">
                            <span className="font-semibold">Unfinished listing found</span>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => {
                                        // Merge with defaults to ensure new fields (like petFee) exist
                                        setFormData(prev => ({ 
                                            ...prev, 
                                            ...parsed,
                                            pricing: { ...prev.pricing, ...parsed.pricing }, // Deep merge pricing
                                            location: { ...prev.location, ...parsed.location },
                                            specs: { ...prev.specs, ...parsed.specs },
                                            policies: { ...prev.policies, ...parsed.policies }
                                        }));
                                        if (parsed._step) setCurrentStep(parsed._step);
                                        toast.dismiss(t.id);
                                    }}
                                    className="px-3 py-1 bg-primary-600 text-white rounded-md text-sm"
                                >
                                    Resume
                                </button>
                                <button 
                                    onClick={() => {
                                        localStorage.removeItem('fly2any_host_draft');
                                        toast.dismiss(t.id);
                                    }}
                                    className="px-3 py-1 bg-neutral-200 text-gray-800 rounded-md text-sm"
                                >
                                    Start New
                                </button>
                            </div>
                        </div>
                    ), { duration: 8000, icon: '💾' });
                }
            } catch (e) {
                console.error("Failed to parse draft", e);
            }
        }
    }
  }, [editingId]);

  // 2. Auto-save to LocalStorage AND API
  useEffect(() => {
      // LocalStorage
      if (typeof window !== 'undefined') {
          localStorage.setItem('fly2any_host_draft', JSON.stringify({ ...formData, _step: currentStep }));
      }

      // Backend Save (Debounced)
      if (status === 'authenticated' && (formData.title || formData.location?.city)) {
          const timer = setTimeout(async () => {
              setIsAutoSaving(true);
              try {
                  const method = editingId ? 'PUT' : 'POST';
                  const url = editingId ? `/api/properties/${editingId}` : '/api/properties';
                  
                  // Don't overwrite status if it's already published? For wizard, we assume DRAFT.
                  const res = await fetch(url, {
                      method,
                      body: JSON.stringify(preparePayload(formData)),
                      headers: { 'Content-Type': 'application/json' }
                  });
                  
                  if (res.ok) {
                      const data = await res.json();
                      setLastSaved(new Date());
                      
                      // If created new, update ID in URL and state
                      if (data.data?.id && !editingId) {
                          setEditingId(data.data.id);
                          const newUrl = new URL(window.location.href);
                          newUrl.searchParams.set('id', data.data.id);
                          window.history.replaceState({}, '', newUrl.toString());
                      }
                  }
              } catch (e) {
                  console.error("Auto-save failed", e);
              } finally {
                  setIsAutoSaving(false);
              }
          }, 2000); // 2s debounce

          return () => clearTimeout(timer);
      }
  }, [formData, currentStep, status, editingId]);

  // Load draft if ID present
  useEffect(() => {
    if (editingId && status === 'authenticated') {
       const fetchDraft = async () => {
         setIsLoading(true);
         try {
            const res = await fetch(`/api/properties/${editingId}`);
            if (res.ok) {
                const json = await res.json();
                const p = json.data;
                if (p) {
                  setFormData(prev => ({
                    ...prev,
                    title: p.name || '',
                    description: p.description || '',
                    type: (p.propertyType || 'apartment') as PropertyType,
                    location: {
                      address: p.addressLine1 || '',
                      city: p.city || '',
                      country: p.country || '',
                      latitude: p.latitude || 0,
                      longitude: p.longitude || 0,
                    },
                    specs: {
                      guests: p.maxGuests || 2,
                      bedrooms: p.totalBedrooms || 1,
                      beds: p.totalBeds || 1,
                      bathrooms: p.totalBathrooms || 1,
                    },
                    rooms: (p.rooms || []).map((r: any) => ({
                      id: r.id,
                      name: r.name || 'Room',
                      roomType: r.roomType || 'standard',
                      bedType: r.bedType || 'queen',
                      bedCount: r.bedCount || 1,
                      maxOccupancy: r.maxOccupancy || 2,
                      quantity: r.quantity || 1,
                      basePricePerNight: r.basePricePerNight || 0,
                      amenities: r.amenities || [],
                      bathroomType: r.bathroomType || 'private',
                    })),
                    amenities: p.amenities || [],
                    images: (p.images || []).map((img: any) => ({
                      id: img.id,
                      url: img.url,
                      caption: img.caption || '',
                      category: img.category || 'general',
                      isPrimary: img.isPrimary || false,
                      tags: img.aiTags || [],
                    })),
                    policies: {
                      checkInTime: p.checkInTime || '15:00',
                      checkOutTime: p.checkOutTime || '11:00',
                      checkInInstructions: p.checkInInstructions || '',
                      cancellationPolicy: p.cancellationPolicy || 'flexible',
                      cancellationDetails: p.cancellationDetails || undefined,
                      petPolicy: p.petPolicy || 'not_allowed',
                      smokingPolicy: p.smokingPolicy || 'not_allowed',
                      childPolicy: p.childPolicy || 'all_ages',
                      minAge: p.minAge ?? undefined,
                      securityDeposit: p.securityDeposit ?? undefined,
                      houseRules: p.houseRules || [],
                      ecoFeatures: p.ecoFeatures || [],
                      ecoCertifications: p.ecoCertifications || [],
                    },
                    pricing: {
                      basePrice: p.basePricePerNight ?? 100,
                      currency: p.currency || 'USD',
                      cleaningFee: p.cleaningFee ?? 0,
                      petFee: p.petFee ?? 0,
                      extraGuestFee: p.extraGuestFee ?? 0,
                      weekendPrice: p.weekendPrice ?? 0,
                      smartPricing: p.smartPricing ?? false,
                      weeklyDiscount: p.weeklyDiscount ?? 0,
                      monthlyDiscount: p.monthlyDiscount ?? 0,
                      minStay: p.minStay ?? 1,
                      maxStay: p.maxStay ?? 0,
                      instantBooking: p.instantBooking ?? true,
                      taxRate: p.taxRate ?? 0,
                    },
                  }));
                  toast.success('Draft loaded successfully');
                }
            } else {
              toast.error("Could not find this property");
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
  const [aiTone, setAiTone] = useState('luxury');

  const handleGenerateAI = async (target: 'description' | 'title') => {
    if (!formData.location.city) {
        toast.error("Please set a location first");
        return;
    }
    
    setIsGeneratingDesc(true);
    const loadingToast = target === 'title' ? toast.loading("Thinking of catchy titles...") : null;

    try {
        const res = await fetch('/api/ai/generate-description', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: formData.type,
                location: formData.location,
                specs: formData.specs,
                amenities: formData.amenities,
                style: aiTone,
                target
            })
        });
        const data = await res.json();
        
        if (loadingToast) toast.dismiss(loadingToast);

        if (data.success) {
            if (target === 'title') {
                const titles = data.description.split('\n').filter((t: string) => t.length > 5);
                setFormData(p => ({ ...p, title: titles[0].replace(/^\d+\.\s*/, '').replace(/"/g, '') }));
                toast.success("Title generated!");
                console.log("Alternative titles:", titles);
            } else {
                setFormData(p => ({ ...p, description: data.description }));
                toast.success("Description generated!");
            }
        } else {
            throw new Error(data.error);
        }
    } catch (e: any) {
        if (loadingToast) toast.dismiss(loadingToast);
        toast.error(`Failed to generate ${target}`);
    } finally {
        setIsGeneratingDesc(false);
    }
  };

  const handleGenerateTitle = () => handleGenerateAI('title');
  const handleGenerateDescription = () => handleGenerateAI('description');

  const handleImportSuccess = (importedData: any) => {
    setFormData(prev => ({
      ...prev,
      title: importedData.name || prev.title,
      description: importedData.description || prev.description,
      type: (importedData.propertyType as PropertyType) || prev.type,
         location: {
          ...prev.location,
          address: importedData.address?.full_address || `${importedData.address?.city || ''}, ${importedData.address?.country || ''}`.replace(/^, /, '').trim() || prev.location.address,
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
    // Validate current step before advancing
    const validation = validateStep(currentStep, formData);
    if (!validation.valid) {
      setStepErrors(validation.errors);
      validation.errors.forEach(err => toast.error(err));
      return;
    }
    setStepErrors([]);
    const idx = STEPS.findIndex(s => s.id === currentStep);
    if (idx < STEPS.length - 1) {
      const nextIdx = idx + 1;
      setCurrentStep(STEPS[nextIdx].id);
      window.scrollTo(0,0);

      // Animated progress celebrations
      const celebrations = [
        '🎯 Basics done! Looking great!',
        '📍 Location set! Keep going!',
        '🏠 Rooms configured! Halfway there!',
        '✨ Amenities selected! Almost there!',
        '📸 Photos uploaded! You\'re crushing it!',
        '📋 Policies saved! One more step!',
        '💰 Pricing set! Time to review!',
      ];
      if (celebrations[idx]) {
        toast.success(celebrations[idx], { duration: 2000 });
      }
      // Mini confetti bursts at milestones (halfway + almost done)
      if (nextIdx === 4 || nextIdx === 7) {
        confetti({
          particleCount: nextIdx === 7 ? 60 : 30,
          spread: 50,
          origin: { y: 0.7 },
          colors: ['#6366f1', '#8b5cf6', '#a78bfa'],
        });
      }
    }
  };

  const handleBack = () => {
    setStepErrors([]);
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
        const method = editingId ? 'PUT' : 'POST';
        const url = editingId ? `/api/properties/${editingId}` : '/api/properties';

        const res = await fetch(url, {
            method,
            body: JSON.stringify(preparePayload(formData)),
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
    // Validate ALL steps before publishing
    const stepsToValidate: WizardStep[] = ['basics', 'location', 'spaces', 'amenities', 'photos', 'policies', 'pricing'];
    const allErrors: string[] = [];
    let firstFailingStep: WizardStep | null = null;

    for (const step of stepsToValidate) {
      const result = validateStep(step, formData);
      if (!result.valid) {
        allErrors.push(...result.errors);
        if (!firstFailingStep) firstFailingStep = step;
      }
    }

    if (allErrors.length > 0) {
      // Show first 3 errors
      allErrors.slice(0, 3).forEach(err => toast.error(err));
      if (allErrors.length > 3) {
        toast.error(`...and ${allErrors.length - 3} more issues to fix`);
      }
      if (firstFailingStep) setCurrentStep(firstFailingStep);
      return;
    }

    setIsSaving(true);
    try {
        const payload = preparePayload(formData);
        const publishPayload = { ...payload, status: 'active' };

        const url = editingId ? `/api/properties/${editingId}` : '/api/properties';
        const method = editingId ? 'PUT' : 'POST';
        
        const res = await fetch(url, {
            method,
            body: JSON.stringify(publishPayload),
            headers: { 'Content-Type': 'application/json' }
        });

        if (!res.ok) throw new Error("Failed to publish");
        
        // Clear draft
        if (typeof window !== 'undefined') localStorage.removeItem('fly2any_host_draft');

        toast.success("Property Published! 🎉");
        // 🎊 Celebration confetti!
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
        setTimeout(() => confetti({ particleCount: 80, spread: 100, origin: { y: 0.5 } }), 300);
        const responseData = await res.json().catch(() => ({}));
        const propertyId = responseData?.data?.id || editingId || '';
        setTimeout(() => router.push(`/host/onboarding?propertyId=${propertyId}`), 1500);
    } catch (e: any) {
        console.error(e);
        toast.error("Failed to publish: " + e.message);
    } finally {
        setIsSaving(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'basics':
        return (
          <div className="animate-fadeIn h-full flex flex-col">
             <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_1fr] gap-6 h-full">
                
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
                          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                              <label className="block text-sm font-semibold text-gray-700">Property Title</label>
                              <div className="flex items-center gap-2 self-start sm:self-auto">
                                  {/* Tone Selector moved here */}
                                  <div className="flex items-center gap-1 bg-white border border-neutral-200 rounded-lg px-2 py-1 shadow-sm">
                                      <span className="text-[10px] font-semibold text-gray-400">Tone:</span>
                                      <select 
                                          className="text-[11px] font-bold text-gray-800 bg-transparent border-none focus:ring-0 p-0 cursor-pointer"
                                          value={aiTone}
                                          onChange={(e) => setAiTone(e.target.value)}
                                      >
                                          <option value="luxury">Luxury</option>
                                          <option value="professional">Pro</option>
                                          <option value="cozy">Cozy</option>
                                          <option value="fun">Fun</option>
                                      </select>
                                  </div>
                                  <button
                                     onClick={handleGenerateTitle}
                                     className="text-[11px] font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1 transition-colors bg-primary-50 px-2 py-1 rounded-lg border border-primary-100"
                                  >
                                     <Sparkles className="w-3 h-3" /> Magic Title
                                  </button>
                              </div>
                          </div>
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
                                        <Sparkles className="w-3 h-3" /> Auto-Write
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
                          <div className="flex items-center justify-between">
                             <p className="text-xs text-gray-400">Min 20 characters for best results</p>
                             <span className={`text-xs font-semibold tabular-nums ${
                               formData.description.length >= 20 ? 'text-emerald-500' : 
                               formData.description.length > 0 ? 'text-amber-500' : 'text-gray-300'
                             }`}>
                               {formData.description.length}/20+
                             </span>
                          </div>
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

            {/* Building & Access Section */}
            <div className="flex-shrink-0 mt-6 space-y-4">
                <h3 className="text-lg font-bold text-gray-900">Building & Access Details</h3>
                <p className="text-sm text-gray-500">Help guests understand the physical setup — especially important for accessibility.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Building Type */}
                    <div className="space-y-1">
                        <label className="block text-sm font-semibold text-gray-700">Building Type</label>
                        <select
                            value={formData.building.buildingType}
                            onChange={(e) => setFormData(p => ({ ...p, building: { ...p.building, buildingType: e.target.value } }))}
                            className="w-full p-3 bg-white border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-gray-900"
                        >
                            <option value="">Select...</option>
                            {Object.entries(BUILDING_TYPES).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Property Floor */}
                    <div className="space-y-1">
                        <label className="block text-sm font-semibold text-gray-700">Which Floor?</label>
                        <input
                            type="number"
                            min={0}
                            value={formData.building.propertyFloor ?? ''}
                            onChange={(e) => setFormData(p => ({ ...p, building: { ...p.building, propertyFloor: e.target.value ? parseInt(e.target.value) : undefined } }))}
                            placeholder="e.g. 3"
                            className="w-full p-3 bg-white border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-gray-900"
                        />
                        <p className="text-[11px] text-gray-400">0 = Ground floor</p>
                    </div>

                    {/* Total Floors */}
                    <div className="space-y-1">
                        <label className="block text-sm font-semibold text-gray-700">Total Floors</label>
                        <input
                            type="number"
                            min={1}
                            value={formData.building.totalFloors ?? ''}
                            onChange={(e) => setFormData(p => ({ ...p, building: { ...p.building, totalFloors: e.target.value ? parseInt(e.target.value) : undefined } }))}
                            placeholder="e.g. 5"
                            className="w-full p-3 bg-white border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-gray-900"
                        />
                    </div>

                    {/* Elevator */}
                    <div className="space-y-1">
                        <label className="block text-sm font-semibold text-gray-700">Elevator</label>
                        <button
                            type="button"
                            onClick={() => setFormData(p => ({ ...p, building: { ...p.building, hasElevator: !p.building.hasElevator } }))}
                            className={`w-full p-3 rounded-xl border-2 font-semibold transition-all ${
                                formData.building.hasElevator
                                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                    : 'border-neutral-300 bg-white text-gray-500 hover:border-neutral-400'
                            }`}
                        >
                            {formData.building.hasElevator ? '✅ Yes' : '❌ No'}
                        </button>
                    </div>
                </div>
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
                    selectedAmenities={formData.amenities}
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
             {currentStep === 'review' && (
              <ReviewStep 
                  data={formData} 
                  onEdit={(step) => setCurrentStep(step)} 
              />
            )}
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
    <div className="h-screen overflow-hidden bg-neutral-50 flex flex-col text-gray-900 relative">
      <WizardProgressBar currentStep={currentStep} steps={STEPS} />

      <HostHeader exitHref="/host/dashboard" exitLabel="Exit to Dashboard" />

      <div className="flex-1 overflow-hidden flex flex-col md:flex-row relative">
      
      {/* LEFT SIDEBAR - COLLAPSIBLE NAVIGATION */}
      <div className="hidden md:flex flex-col bg-white border-r border-neutral-200 h-full z-50 shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-all duration-300 w-[72px] hover:w-56 group absolute left-0 top-0 bottom-0 overflow-x-hidden">
         <div className="flex-1 overflow-y-auto px-3 space-y-1.5 py-4 mt-2">
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
                            w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all relative overflow-hidden whitespace-nowrap
                            ${isActive 
                                ? 'bg-primary-50 text-primary-700 font-semibold shadow-sm ring-1 ring-primary-100' 
                                : isCompleted 
                                    ? 'text-gray-700 hover:bg-neutral-50' 
                                    : 'text-gray-400 opacity-50 cursor-not-allowed'}
                        `}
                    >
                        {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-500 rounded-r-full" />}
                        <div className={`p-1.5 shrink-0 rounded-lg mx-auto group-hover:mx-0 ${isActive ? 'bg-primary-100 text-primary-600' : 'bg-transparent'}`}>
                             <step.icon className="w-[18px] h-[18px]" />
                        </div>
                        <span className="flex-1 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300 overflow-hidden">{step.label}</span>
                        {isCompleted && <Check className="w-4 h-4 text-green-500 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />}
                    </button>
                );
            })}
         </div>

         <div className="p-4 border-t border-neutral-100 flex flex-col gap-3 shrink-0">
             <div className="h-4 flex items-center justify-center overflow-hidden">
                {isAutoSaving ? (
                    <Loader2 className="w-4 h-4 text-primary-600 animate-spin shrink-0" />
                ) : lastSaved ? (
                     <Check className="w-4 h-4 text-green-500 shrink-0" title={`Saved ${lastSaved.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`} />
                ) : null}
             </div>
             <button 
                onClick={handleSaveDraft}
                disabled={isSaving || isAutoSaving}
                className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-gray-600 font-bold transition-all text-sm group/btn overflow-hidden whitespace-nowrap"
             >
                <Save className="w-4 h-4 shrink-0 group-hover/btn:text-primary-600 transition-colors" />
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">Save Draft</span>
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
      <div className="flex-1 md:ml-[72px] h-full flex flex-col relative bg-neutral-50/50 transition-all duration-300 min-w-0 overflow-hidden">
          
          <div className="flex-1 overflow-hidden flex flex-col lg:flex-row w-full max-w-[1920px] mx-auto min-w-0">
              {/* Left Column: Form */}
              <div className="flex-1 h-full overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-neutral-200 scrollbar-track-transparent relative px-2 md:px-4 lg:px-6 min-w-0">
                 <main className="w-full mx-auto py-6 pb-24">
                     <div className="mb-6 block lg:hidden">
                         <h1 className="text-2xl font-bold text-gray-900">{STEPS.find(s => s.id === currentStep)?.label}</h1>
                     </div>

                     {/* Validation Errors Banner */}
                     {stepErrors.length > 0 && (
                       <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 animate-in slide-in-from-top-2 duration-300">
                         <p className="text-sm font-bold text-red-700 mb-1">Please fix the following:</p>
                         <ul className="list-disc list-inside space-y-1">
                           {stepErrors.map((err, i) => (
                             <li key={i} className="text-sm text-red-600">{err}</li>
                           ))}
                         </ul>
                       </div>
                     )}

                     {/* Dynamic Content */}
                     {renderStepContent()}
                 </main>
              </div>

              {/* Right Column: Live Guest Preview */}
              <div className="hidden lg:flex w-[320px] xl:w-[380px] border-l border-neutral-200/60 h-full overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-200 scrollbar-track-transparent flex-col items-center justify-start px-4 xl:px-6 py-6 relative bg-transparent">
                 <div className="sticky top-0 w-full mb-6 flex items-center justify-between pb-3 border-b border-neutral-200/60 z-10 backdrop-blur-md bg-transparent">
                     <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <Eye className="w-4 h-4" /> Live Guest Preview
                     </h2>
                 </div>
                 
                 {/* Mock Mobile Device / Post Card */}
                 <div className="w-full max-w-[380px] bg-white rounded-[2rem] border border-neutral-200 shadow-2xl overflow-hidden transition-all duration-300 hover:shadow-3xl hover:-translate-y-1 flex flex-col">
                    {/* Fake Header / Cover Photo */}
                    <div className="relative aspect-[4/3] bg-neutral-100 w-full overflow-hidden">
                        {formData.images.length > 0 && formData.images[0]?.url ? (
                            <Image src={formData.images[0].url} alt="Cover" fill className="object-cover transition-transform duration-700 hover:scale-105" />
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-400 gap-2">
                                <Camera className="w-8 h-8 opacity-30" />
                                <span className="text-xs font-medium opacity-50">Upload photos to see preview</span>
                            </div>
                        )}
                        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold text-gray-900 flex items-center gap-1 shadow-sm">
                            ⭐ New
                        </div>
                    </div>
                    {/* Card Content */}
                    <div className="p-6 space-y-4">
                        <div>
                            <div className="flex justify-between items-start gap-2 mb-1.5">
                                <h3 className="font-bold text-gray-900 text-xl leading-tight line-clamp-2">
                                    {formData.title || "Your amazing space"}
                                </h3>
                            </div>
                            <p className="text-sm text-gray-500 font-medium flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                {formData.location.city ? `${formData.location.city}, ${formData.location.country}` : "Location not set"}
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2 text-sm text-gray-600 font-medium py-1">
                            <span>{formData.specs.guests} guests</span>•
                            <span>{formData.specs.bedrooms} bedrooms</span>•
                            <span>{formData.specs.beds} beds</span>•
                            <span>{formData.specs.bathrooms} baths</span>
                        </div>
                        {formData.description && (
                            <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed bg-neutral-50 px-3 py-2 rounded-lg border border-neutral-100">
                                "{formData.description}"
                            </p>
                        )}
                        <div className="pt-3 border-t border-neutral-100 flex items-end justify-between">
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Price</span>
                                <div className="flex items-baseline gap-1 font-black text-gray-900">
                                    <span className="text-2xl">${formData.pricing.basePrice}</span>
                                    <span className="text-sm font-medium text-gray-500">night</span>
                                </div>
                            </div>
                            {formData.pricing.smartPricing && (
                                <div className="flex items-center gap-1 text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-1 rounded-md border border-purple-100">
                                    <Sparkles className="w-3 h-3" /> Smart Pricing On
                                </div>
                            )}
                        </div>
                    </div>
                 </div>
              </div>
          </div>

          {/* BOTTOM BAR (Fixed at bottom of flex container) */}
          <div className="flex-shrink-0 bg-white border-t border-neutral-200 py-3 px-4 md:px-8 flex items-center justify-between z-40 shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
              <button 
                 onClick={handleBack}
                 disabled={currentStep === 'basics'}
                 className="hidden md:flex text-gray-600 font-bold hover:text-gray-900 transition-colors disabled:opacity-30 disabled:hover:text-gray-600 text-sm items-center gap-1"
              >
                  <ChevronLeft className="w-4 h-4" /> Back
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
                        className="flex-1 md:flex-none bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-6 py-2.5 text-sm rounded-xl font-bold shadow-md shadow-primary-500/25 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02]"
                     >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        Publish Listing
                     </button>
                 ) : (
                     <button
                        onClick={handleNext}
                        className="flex-1 md:flex-none bg-neutral-900 hover:bg-black text-white px-8 py-2.5 text-sm rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                     >
                        Continue <ArrowRight className="w-4 h-4" />
                     </button>
                 )}
              </div>
          </div>
      </div>

    </div>
    </div>
  );
}
