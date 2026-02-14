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
      houseRules: '',
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


  // ... (Handlers remain same) ...

  const renderStepContent = () => {
      // ... (Content remains same) ...
      switch (currentStep) {
        // ...
        default: return null;
      }
  };
  
  // Need to call renderStepContent inside the return, but I am replacing the return block mostly.
  // Wait, I can't replace the whole file easily. I will target the Sidebar area specifically.
  // Actually, I'll just add the Auth effect first, then the Sidebar change.

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col md:flex-row text-gray-900">
      
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
      <div className="flex-1 md:ml-80 pt-20 md:pt-0 pb-24 md:pb-0 flex flex-col min-h-screen">
          <main className="flex-1 w-full max-w-[1800px] mx-auto p-4 md:p-8 lg:p-12">
             <div className="mb-8 block md:hidden">
                 <h1 className="text-2xl font-bold text-gray-900">{STEPS.find(s => s.id === currentStep)?.label}</h1>
             </div>

             {/* Dynamic Content */}
             {renderStepContent()}
          </main>

          {/* BOTTOM BAR (Desktop & Mobile Sticky) */}
          <div className="sticky bottom-0 bg-white border-t border-neutral-200 p-4 md:px-12 md:py-6 flex items-center justify-between z-40 shadow-[0_-4px_24px_rgba(0,0,0,0.04)]">
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
