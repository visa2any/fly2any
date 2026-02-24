'use client';

import React from 'react';
import { 
  ShieldCheck, Mail, Phone, Building2, 
  MapPin, CheckCircle2, AlertCircle, 
  CreditCard, ExternalLink, MessageSquare 
} from 'lucide-react';
import Link from 'next/link';

interface HostProfileSummaryProps {
  profile: {
    businessName?: string | null;
    businessType?: string;
    phone?: string | null;
    whatsapp?: string | null;
    verificationStatus: string;
    payoutMethod?: string | null;
    user: {
      email: string;
      name?: string | null;
    }
  } | null;
}

export function HostProfileSummary({ profile }: HostProfileSummaryProps) {
  if (!profile) return null;

  const isVerified = profile.verificationStatus === 'VERIFIED';
  const hasPayout = !!profile.payoutMethod;

  return (
    <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col h-full animate-fadeIn">
      {/* Header */}
      <div className="p-6 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-100 text-primary-600 rounded-xl">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-gray-900 leading-none">Host Profile</h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Identity & Business</p>
          </div>
        </div>
        <Link 
          href="/host/profile" 
          className="p-2 rounded-xl border border-neutral-200 bg-white text-gray-500 hover:text-primary-600 hover:border-primary-100 transition-all shadow-sm group"
        >
          <ExternalLink className="w-4 h-4 group-hover:scale-110 transition-transform" />
        </Link>
      </div>

      {/* Body */}
      <div className="p-6 flex-1 space-y-5">
        {/* Verification Status */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-neutral-50 border border-neutral-100">
          <div className="flex items-center gap-3">
            {isVerified ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-500" />
            )}
            <span className="text-sm font-bold text-gray-700">Identity Status</span>
          </div>
          <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border ${
            isVerified ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
          }`}>
            {profile.verificationStatus}
          </span>
        </div>

        {/* Info Grid */}
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Mail className="w-4 h-4 text-gray-400 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Public Email</p>
              <p className="text-sm font-bold text-gray-900 truncate">{profile.user.email}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Phone className="w-4 h-4 text-gray-400 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Phone Number</p>
              <p className="text-sm font-bold text-gray-900">{profile.phone || 'Not provided'}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Building2 className="w-4 h-4 text-gray-400 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Business Name</p>
              <p className="text-sm font-bold text-gray-900 truncate">{profile.businessName || 'Individual'}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CreditCard className="w-4 h-4 text-gray-400 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Payout Method</p>
              <p className={`text-sm font-bold ${hasPayout ? 'text-gray-900' : 'text-rose-500'}`}>
                {profile.payoutMethod ? profile.payoutMethod.replace(/_/g, ' ') : 'Action Required'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer / CTA */}
      <div className="p-4 bg-neutral-50/80 border-t border-neutral-100">
        <Link 
          href="/host/profile"
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gray-900 text-white font-black text-xs hover:bg-black transition-all active:scale-[0.98]"
        >
          Edit All Info
        </Link>
      </div>
    </div>
  );
}
