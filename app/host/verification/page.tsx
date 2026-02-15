'use client';

import { useState, useEffect } from 'react';
import { Shield, Check, MapPin, Video, Smartphone, AlertCircle, Loader2, Lock } from 'lucide-react';
import { GeolocationVerifier } from '@/components/verification/GeolocationVerifier';
import { VideoVerifier } from '@/components/verification/VideoVerifier';
import { IdentityScanner } from '@/components/verification/IdentityScanner';

type VerificationMethod = 'GPS' | 'VIDEO' | 'DOCUMENT' | null;
type VerificationStatus = 'UNVERIFIED' | 'PENDING' | 'VERIFIED';

export default function TrustCenterPage() {
  const [status, setStatus] = useState<VerificationStatus>('UNVERIFIED');
  const [method, setMethod] = useState<VerificationMethod>(null);
  const [trustScore, setTrustScore] = useState(25); // Start with email/phone score

  // Fetch status from API
  useEffect(() => {
    fetch('/api/host/verification')
      .then(res => res.json())
      .then(data => {
        if (data.verificationStatus) {
            setStatus(data.verificationStatus as VerificationStatus);
            setTrustScore(data.trustScore || 25);
            setMethod(data.verificationMethod as VerificationMethod);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const handleUpdateVerification = async (newStatus: string, newMethod: string | null, scoreInc: number) => {
      // Optimistic update
      if (newStatus) setStatus(newStatus as VerificationStatus);
      if (newMethod) setMethod(newMethod as VerificationMethod);
      if (scoreInc) setTrustScore(prev => Math.min(100, prev + scoreInc));

      try {
          await fetch('/api/host/verification', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                  status: newStatus, 
                  method: newMethod, 
                  trustScoreIncrease: scoreInc 
              })
          });
      } catch (e) {
          console.error("Failed to save verification", e);
      }
  };

  if (isLoading) {
    return (
        <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Shield className="w-8 h-8 text-primary-600" />
                Trust & Verification Center
            </h1>
            <p className="text-gray-500 mt-2">
                Verify your identity to unlock instant payouts and the "Trusted Host" badge.
            </p>
        </div>
        
        {/* Trust Score Card */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-neutral-200 flex items-center gap-4">
            <div className="relative w-16 h-16 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                    <circle cx="32" cy="32" r="28" stroke="#E5E7EB" strokeWidth="4" fill="transparent" />
                    <circle cx="32" cy="32" r="28" stroke={trustScore > 80 ? "#10B981" : "#3B82F6"} strokeWidth="4" 
                            fill="transparent" 
                            strokeDasharray={175.9} 
                            strokeDashoffset={175.9 - (175.9 * trustScore) / 100} 
                            className="transition-all duration-1000 ease-out"
                    />
                </svg>
                <span className="absolute text-xl font-bold text-gray-900">{trustScore}</span>
            </div>
            <div>
                <div className="text-xs font-bold text-gray-500 uppercase">Trust Score</div>
                <div className="text-sm font-medium text-gray-900">
                    {trustScore < 50 ? 'Basic Level' : trustScore < 80 ? 'Verified Host' : 'Super Trusted'}
                </div>
            </div>
        </div>
      </div>

      {status === 'VERIFIED' ? (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center animate-in fade-in zoom-in">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                  <Check className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-green-900 mb-2">You are a Verified Host!</h2>
              <p className="text-green-700 mb-6">Your listings now appear with the "Verified" badge and you have access to instant payouts.</p>
          </div>
      ) : (
          <div className="grid lg:grid-cols-3 gap-8">
              
              {/* Main Verification Flow */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Step 1: Identity (Base) */}
                <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
                    <div className="p-6 border-b border-neutral-100 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                <Smartphone className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">Step 1: Digital Identity</h3>
                                <p className="text-sm text-gray-500">Government ID + Selfie Check</p>
                            </div>
                        </div>
                        {trustScore >= 50 ? <Check className="text-green-500 w-6 h-6" /> : <div className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded">REQUIRED</div>}
                    </div>
                    
                    {trustScore < 50 && (
                        <div className="p-6">
                            <IdentityScanner onComplete={() => handleUpdateVerification('PENDING', 'DOCUMENT', 25)} />
                        </div>
                    )}
                </div>

                {/* Step 2: Property Access (The "Multi-Path" Magic) */}
                <div className={`bg-white rounded-2xl border transition-all ${trustScore < 50 ? 'border-neutral-200 opacity-50 grayscale' : 'border-primary-100 shadow-lg shadow-primary-500/5'}`}>
                    <div className="p-6 border-b border-neutral-100 flex justify-between items-center bg-gradient-to-r from-white to-primary-50/30">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                                <Lock className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">Step 2: Authenticate Property</h3>
                                <p className="text-sm text-gray-500">Verify you have access to the listing</p>
                            </div>
                        </div>
                        {trustScore < 50 && <Lock className="text-gray-400 w-5 h-5" />}
                    </div>

                    {trustScore >= 50 && !method && (
                        <div className="p-8">
                            <h4 className="text-lg font-bold text-gray-900 mb-6 text-center">Choose your verification path</h4>
                            
                            <div className="grid md:grid-cols-2 gap-4">
                                {/* Path A: Instant GPS */}
                                <button 
                                    onClick={() => setMethod('GPS')}
                                    className="relative p-6 rounded-xl border-2 border-neutral-200 hover:border-primary-500 hover:bg-primary-50 transition-all text-left flex flex-col gap-4 group"
                                >
                                    <div className="absolute top-4 right-4 bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase">
                                        Fastest (Instant)
                                    </div>
                                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-200 transition-colors">
                                        <MapPin className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h5 className="font-bold text-gray-900">I am at the property</h5>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Instant verification using your device's secure GPS location.
                                        </p>
                                    </div>
                                </button>

                                {/* Path B: Video */}
                                <button 
                                    onClick={() => setMethod('VIDEO')}
                                    className="p-6 rounded-xl border-2 border-neutral-200 hover:border-primary-500 hover:bg-primary-50 transition-all text-left flex flex-col gap-4 group"
                                >
                                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 group-hover:bg-purple-200 transition-colors">
                                        <Video className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h5 className="font-bold text-gray-900">I am remote</h5>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Upload a 30s video walkthrough showing you unlocking the door.
                                        </p>
                                    </div>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Active Verification Interfaces */}
                    {trustScore >= 50 && method === 'GPS' && (
                        <div className="p-6">
                            <button onClick={() => setMethod(null)} className="text-xs text-gray-500 hover:underline mb-4">&larr; Choose another method</button>
                            <GeolocationVerifier 
                                propertyLocation={{ lat: 40.7128, lng: -74.0060 }} // Mock: NYC Coords
                                onVerify={() => {
                                    handleUpdateVerification('VERIFIED', 'GPS', 50);
                                }} 
                            />
                        </div>
                    )}

                    {trustScore >= 50 && method === 'VIDEO' && (
                        <div className="p-6">
                            <button onClick={() => setMethod(null)} className="text-xs text-gray-500 hover:underline mb-4">&larr; Choose another method</button>
                            <VideoVerifier 
                                onVerify={() => {
                                    handleUpdateVerification('PENDING', 'VIDEO', 40);
                                }} 
                            />
                        </div>
                    )}

                </div>

              </div>

              {/* Sidebar Info */}
              <div className="space-y-6">
                  <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                      <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" /> Why verify?
                      </h4>
                      <ul className="space-y-3 text-sm text-blue-800">
                          <li className="flex items-start gap-2">
                              <Check className="w-4 h-4 shrink-0 mt-0.5 opacity-60" />
                              <span>Get the "Verified" badge to boost bookings by up to 20%.</span>
                          </li>
                          <li className="flex items-start gap-2">
                              <Check className="w-4 h-4 shrink-0 mt-0.5 opacity-60" />
                              <span>Unlock instant daily payouts.</span>
                          </li>
                          <li className="flex items-start gap-2">
                              <Check className="w-4 h-4 shrink-0 mt-0.5 opacity-60" />
                              <span>Protect your account from unauthorized access.</span>
                          </li>
                      </ul>
                  </div>
              </div>

          </div>
      )}
    </div>
  );
}
