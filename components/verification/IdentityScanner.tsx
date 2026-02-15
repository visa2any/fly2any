'use client';

import { useState } from 'react';
import { Camera, RefreshCw, CheckCircle, ShieldCheck } from 'lucide-react';
import Image from 'next/image';

interface IdentityScannerProps {
  onComplete: () => void;
}

export function IdentityScanner({ onComplete }: IdentityScannerProps) {
  const [step, setStep] = useState<'START' | 'SCAN_ID' | 'SELFIE' | 'COMPLETE'>('START');
  const [isProcessing, setIsProcessing] = useState(false);

  // Mock processing delay
  const processStep = (nextStep: typeof step) => {
      setIsProcessing(true);
      setTimeout(() => {
          setIsProcessing(false);
          setStep(nextStep);
          if (nextStep === 'COMPLETE') onComplete();
      }, 1500);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[300px]">
        
        {step === 'START' && (
            <div className="text-center max-w-md">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                    <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">Let's verify your identity</h3>
                <p className="text-gray-500 text-sm mb-6">
                    We need a government ID and a quick selfie to make sure it's really you.
                </p>
                <button 
                    onClick={() => setStep('SCAN_ID')}
                    className="bg-neutral-900 text-white font-bold py-3 px-8 rounded-full hover:bg-black transition-all"
                >
                    Start Verification
                </button>
            </div>
        )}

        {(step === 'SCAN_ID' || step === 'SELFIE') && (
            <div className="w-full max-w-sm rounded-2xl bg-black aspect-[3/4] relative overflow-hidden flex flex-col items-center justify-between p-6">
                
                {/* Camera Overlay */}
                <div className="absolute inset-0 opacity-50 bg-[url('https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&q=80')] bg-cover bg-center mix-blend-overlay"></div>
                
                {/* Frame */}
                {step === 'SCAN_ID' ? (
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-48 border-2 border-white/80 rounded-lg flex items-center justify-center">
                        <span className="text-white/50 text-xs font-bold uppercase tracking-widest bg-black/50 px-2 py-1">Position ID Here</span>
                     </div>
                ) : (
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-64 border-2 border-white/80 rounded-full"></div>
                )}

                <div className="relative z-10 w-full flex justify-between items-start">
                    <span className="text-white font-bold bg-black/50 px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                        {step === 'SCAN_ID' ? 'Scan Front of ID' : 'Take a Selfie'}
                    </span>
                    <button onClick={() => processStep(step)} className="p-2 bg-white/20 rounded-full text-white hover:bg-white/30">
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>

                {/* Capture Button */}
                <div className="relative z-10 mb-4">
                     <button 
                        onClick={() => processStep(step === 'SCAN_ID' ? 'SELFIE' : 'COMPLETE')}
                        disabled={isProcessing}
                        className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center hover:scale-105 transition-transform"
                     >
                         <div className={`w-12 h-12 bg-white rounded-full ${isProcessing ? 'animate-pulse bg-red-500' : ''}`} />
                     </button>
                </div>
            </div>
        )}

        {step === 'COMPLETE' && (
            <div className="text-center animate-in zoom-in">
                 <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                    <CheckCircle className="w-12 h-12" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Identity Verified</h3>
                <p className="text-gray-500 mt-2">Your ID matches your selfie.</p>
            </div>
        )}

    </div>
  );
}
