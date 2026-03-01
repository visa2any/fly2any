'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { 
  User, CheckCircle2, ShieldCheck, Mail, Globe, 
  MapPin, Phone, Building2, CreditCard, Award, 
  MessageSquare, Star, Clock, Loader2, Save 
} from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface HostProfile {
  id: string;
  businessName: string | null;
  businessType: string;
  bio: string | null;
  phone: string | null;
  whatsapp: string | null;
  website: string | null;
  profileImageUrl: string | null;
  identityVerified: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  payoutMethod: string | null;
  currency: string;
  taxId: string | null;
  languagesSpoken: string[];
  
  // Reputation
  superHost: boolean;
  rating: number;
  reviewCount: number;
  responseRate: number;
  avgResponseTime: number;
  hostSince: string;
}

export default function HostProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<HostProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [bio, setBio] = useState('');
  const [languages, setLanguages] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [website, setWebsite] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('individual');
  const [taxId, setTaxId] = useState('');
  const [payoutMethod, setPayoutMethod] = useState('');
  const [currency, setCurrency] = useState('USD');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/host/profile');
      if (!res.ok) throw new Error('Failed to fetch profile');
      const data = await res.json();
      setProfile(data);
      
      // Populate form
      setBio(data.bio || '');
      setLanguages(data.languagesSpoken?.join(', ') || '');
      setPhone(data.phone || '');
      setWhatsapp(data.whatsapp || '');
      setWebsite(data.website || '');
      setBusinessName(data.businessName || '');
      setBusinessType(data.businessType || 'individual');
      setTaxId(data.taxId || '');
      setPayoutMethod(data.payoutMethod || '');
      setCurrency(data.currency || 'USD');
      
    } catch (err) {
      toast.error('Could not load host profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const langsArray = languages.split(',').map(l => l.trim()).filter(Boolean);
      
      const payload = {
        bio,
        languagesSpoken: langsArray,
        phone,
        whatsapp,
        website,
        businessName,
        businessType,
        taxId,
        payoutMethod,
        currency
      };

      const res = await fetch('/api/host/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to update profile');
      toast.success('Host Profile updated successfully!');
      fetchProfile();
      
    } catch (err) {
      toast.error('Error saving profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8 pb-32">
      
      {/* 1. IDENTITY HEADER */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-primary-600 to-indigo-600 relative">
           {profile?.superHost && (
              <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md border border-white/40 text-white px-4 py-1.5 rounded-full flex items-center gap-2 font-bold text-sm shadow-sm hover:bg-white/30 transition-colors cursor-default">
                 <Award className="w-4 h-4 text-yellow-300" />
                 Superhost™
              </div>
           )}
        </div>
        <div className="px-6 md:px-10 pb-8 relative">
           <div className="flex flex-col md:flex-row gap-6 items-start md:items-end -mt-12 mb-6">
              <div className="relative">
                 {session?.user?.image || profile?.profileImageUrl ? (
                    <Image 
                      src={session?.user?.image || profile?.profileImageUrl || ''} 
                      alt="Host" 
                      width={100} height={100} 
                      className="rounded-2xl border-4 border-white shadow-md object-cover bg-white" 
                    />
                 ) : (
                    <div className="w-[100px] h-[100px] rounded-2xl border-4 border-white shadow-md bg-primary-100 flex items-center justify-center text-primary-600 text-3xl font-bold">
                       {session?.user?.name?.[0] || 'H'}
                    </div>
                 )}
                 {profile?.identityVerified && (
                    <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-1.5 rounded-full border-2 border-white shadow-sm" title="Identity Verified">
                       <ShieldCheck className="w-4 h-4" />
                    </div>
                 )}
              </div>
              <div className="flex-1">
                 <h1 className="text-3xl font-bold text-[#0A0A0A] tracking-tight">{session?.user?.name || 'Host Profile'}</h1>
                 <p className="text-neutral-500 font-medium flex items-center gap-2 mt-1">
                    Joined {profile?.hostSince ? format(new Date(profile.hostSince), 'MMMM yyyy') : 'Recently'}
                 </p>
              </div>
              <Button 
                onClick={handleSave} 
                className="w-full md:w-auto flex items-center gap-2 shadow-sm"
                loading={isSaving}
              >
                <Save className="w-4 h-4" /> Save Changes
              </Button>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* LEFT COLUMN: FORMS */}
         <div className="lg:col-span-2 space-y-8">
            
            {/* PUBLIC PROFILE */}
            <section className="bg-white rounded-2xl border border-neutral-200 p-6 md:p-8 shadow-sm space-y-6">
               <div className="flex items-center gap-3 border-b border-neutral-100 pb-4">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><User className="w-5 h-5" /></div>
                  <h2 className="text-lg font-bold text-[#0A0A0A]">Public Profile</h2>
               </div>
               
               <div className="space-y-4">
                  <div className="space-y-2">
                     <label className="text-sm font-semibold text-neutral-700 block">About Me (Bio)</label>
                     <textarea 
                        value={bio}
                        onChange={e => setBio(e.target.value)}
                        placeholder="Tell guests a little about yourself, your hosting style, or why you love your city..."
                        className="w-full h-32 p-4 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-[#0A0A0A] text-sm outline-none resize-none transition-all"
                     />
                  </div>
                  
                  <Input 
                     label="Languages Spoken"
                     placeholder="e.g. English, Spanish, French"
                     value={languages}
                     onChange={e => setLanguages(e.target.value)}
                     hint="Separate languages with commas"
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <Input 
                        label="Public Website"
                        icon={<Globe className="w-4 h-4 text-neutral-400" />}
                        placeholder="https://"
                        value={website}
                        onChange={e => setWebsite(e.target.value)}
                     />
                     <Input 
                        label="WhatsApp Public Contact"
                        icon={<MessageSquare className="w-4 h-4 text-green-500" />}
                        placeholder="+1 (555) 000-0000"
                        value={whatsapp}
                        onChange={e => setWhatsapp(e.target.value)}
                     />
                  </div>
               </div>
            </section>

            {/* BUSINESS & TAX */}
            <section className="bg-white rounded-2xl border border-neutral-200 p-6 md:p-8 shadow-sm space-y-6">
               <div className="flex items-center gap-3 border-b border-neutral-100 pb-4">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Building2 className="w-5 h-5" /></div>
                  <h2 className="text-lg font-bold text-[#0A0A0A]">Business & Tax Details</h2>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Select 
                     label="Business Type"
                     value={businessType}
                     onChange={setBusinessType}
                     options={[
                        { value: 'individual', label: 'Individual / Sole Proprietor' },
                        { value: 'company', label: 'Registered Company (LLC/Corp)' }
                     ]}
                  />
                  <Input 
                     label={businessType === 'company' ? 'Company Name' : 'Trading Name (Optional)'}
                     placeholder="e.g. Acme Hosting LLC"
                     value={businessName}
                     onChange={e => setBusinessName(e.target.value)}
                  />
                  <Input 
                     label="Tax ID / VAT Number"
                     type="password"
                     placeholder="Required for payouts in some regions"
                     value={taxId}
                     onChange={e => setTaxId(e.target.value)}
                  />
                  <Input 
                     label="Private Phone (Billing)"
                     icon={<Phone className="w-4 h-4 text-neutral-400" />}
                     placeholder="+1 (555) 000-0000"
                     value={phone}
                     onChange={e => setPhone(e.target.value)}
                  />
               </div>
            </section>

            {/* PAYOUT CONFIG */}
            <section className="bg-white rounded-2xl border border-neutral-200 p-6 md:p-8 shadow-sm space-y-6">
               <div className="flex items-center gap-3 border-b border-neutral-100 pb-4">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><CreditCard className="w-5 h-5" /></div>
                  <h2 className="text-lg font-bold text-[#0A0A0A]">Payout Configuration</h2>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Select 
                     label="Payout Currency"
                     value={currency}
                     onChange={setCurrency}
                     options={[
                        { value: 'USD', label: 'US Dollar (USD)' },
                        { value: 'EUR', label: 'Euro (EUR)' },
                        { value: 'GBP', label: 'British Pound (GBP)' },
                        { value: 'CAD', label: 'Canadian Dollar (CAD)' }
                     ]}
                  />
                  <Select 
                     label="Payout Method"
                     value={payoutMethod}
                     onChange={setPayoutMethod}
                     options={[
                        { value: '', label: 'None setup yet' },
                        { value: 'bank_transfer', label: 'Direct Bank Transfer' },
                        { value: 'paypal', label: 'PayPal' },
                        { value: 'stripe_connect', label: 'Stripe Connect' }
                     ]}
                  />
               </div>
               <div className="p-4 bg-neutral-50 border border-neutral-100 rounded-xl text-sm font-medium text-neutral-500 flex gap-3">
                  <Globe className="w-5 h-5 shrink-0 text-neutral-400" />
                  <p>Depending on your region, payouts take 2-5 business days to process after your guest checks in. Additional banking details are managed securely via our financial provider.</p>
               </div>
            </section>
            
         </div>

         {/* RIGHT COLUMN: REPUTATION & VERIFICATION (READ ONLY) */}
         <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 space-y-6">
               <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Host Reputation</h3>
               
               <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100 text-center">
                     <p className="text-2xl font-black text-[#0A0A0A] flex items-center justify-center gap-1">
                        {profile?.rating?.toFixed(1) || '0.0'} <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                     </p>
                     <p className="text-[10px] font-bold text-neutral-500 uppercase mt-1">Global Rating</p>
                  </div>
                  <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100 text-center">
                     <p className="text-2xl font-black text-[#0A0A0A]">{profile?.reviewCount || 0}</p>
                     <p className="text-[10px] font-bold text-neutral-500 uppercase mt-1">Total Reviews</p>
                  </div>
                  <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100 text-center">
                     <p className="text-2xl font-black text-[#0A0A0A]">{profile?.responseRate || 100}%</p>
                     <p className="text-[10px] font-bold text-neutral-500 uppercase mt-1">Response Rate</p>
                  </div>
                  <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100 text-center">
                     <p className="text-2xl font-black text-[#0A0A0A]">{profile?.avgResponseTime || '< 1'}h</p>
                     <p className="text-[10px] font-bold text-neutral-500 uppercase mt-1">Response Time</p>
                  </div>
               </div>
            </div>

            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 space-y-4">
               <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Trust & Identity</h3>
               <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm font-semibold text-neutral-700">
                     {profile?.emailVerified ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <div className="w-5 h-5 rounded-full border-2 border-dashed border-neutral-300" />}
                     Email Address
                  </div>
                  <div className="flex items-center gap-3 text-sm font-semibold text-neutral-700">
                     {profile?.phoneVerified ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <div className="w-5 h-5 rounded-full border-2 border-dashed border-neutral-300" />}
                     Phone Number
                  </div>
                  <div className="flex items-center gap-3 text-sm font-semibold text-neutral-700">
                     {profile?.identityVerified ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <div className="w-5 h-5 rounded-full border-2 border-dashed border-neutral-300" />}
                     Government ID
                  </div>
               </div>
               
               {!profile?.identityVerified && (
                  <Button variant="outline" className="w-full mt-4 text-xs font-bold shadow-sm" onClick={() => toast.success('Redirecting to ID verification portal...')}>
                     Complete Verification
                  </Button>
               )}
            </div>
         </div>
      </div>
    </div>
  );
}
