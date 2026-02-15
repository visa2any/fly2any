'use client';

import { useState } from 'react';
import { Video, Upload, CheckCircle, Smartphone } from 'lucide-react';

interface VideoVerifierProps {
  onVerify: () => void;
}

export function VideoVerifier({ onVerify }: VideoVerifierProps) {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = () => {
      setIsUploading(true);
      // Simulate upload
      setTimeout(() => {
          setIsUploading(false);
          setStep(3);
          setTimeout(onVerify, 2000);
      }, 2000);
  };

  return (
    <div className="bg-neutral-50 rounded-xl p-6 border border-neutral-200">
        
        {step === 1 && (
            <div className="animate-in fade-in">
                <h3 className="font-bold text-gray-900 mb-4 text-center">Video Walkthrough Instructions</h3>
                
                <div className="grid grid-cols-3 gap-2 mb-6">
                    {['Street', 'Unlock', 'Enter'].map((label, i) => (
                        <div key={i} className="bg-white p-3 rounded-lg border border-neutral-200 text-center">
                            <span className="block text-2xl mb-1">{i===0 ? '🛣️' : i===1 ? '🔑' : '🏠'}</span>
                            <span className="text-xs font-bold text-gray-700">{label}</span>
                        </div>
                    ))}
                </div>

                <div className="space-y-4 text-sm text-gray-600 mb-8 bg-white p-4 rounded-lg border border-neutral-100">
                    <p>1. Start recording <strong>outside</strong> showing the street number.</p>
                    <p>2. Film yourself unlocking the door.</p>
                    <p>3. Walk into the living room.</p>
                    <p className="text-xs text-gray-400 italic">*Max 60 seconds.</p>
                </div>

                <button 
                  onClick={() => setStep(2)}
                  className="w-full bg-neutral-900 text-white font-bold py-3 rounded-xl hover:bg-black transition-all"
                >
                  I'm ready
                </button>
            </div>
        )}

        {step === 2 && (
             <div className="text-center animate-in slide-in-from-right-4">
                 <div className="border-2 border-dashed border-neutral-300 rounded-xl p-12 mb-6 cursor-pointer hover:bg-white hover:border-primary-400 transition-all group">
                     <Upload className="w-12 h-12 mx-auto text-gray-300 group-hover:text-primary-500 mb-4" />
                     <h4 className="font-bold text-gray-700">Upload Video</h4>
                     <p className="text-xs text-gray-400">MP4, MOV up to 100MB</p>
                     
                     {/* Mock Input */}
                     <input 
                        type="file" 
                        accept="video/*" 
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={(e) => {
                            if (e.target.files?.[0]) {
                                setFile(e.target.files[0]);
                            }
                        }}
                     />
                 </div>

                 {file ? (
                     <button 
                        onClick={handleUpload}
                        disabled={isUploading}
                        className="w-full bg-primary-600 text-white font-bold py-3 rounded-xl hover:bg-primary-700"
                     >
                        {isUploading ? 'Uploading...' : 'Submit Video'}
                     </button>
                 ) : (
                     <button className="w-full bg-neutral-200 text-gray-400 font-bold py-3 rounded-xl cursor-not-allowed">
                        Select File
                     </button>
                 )}
             </div>
        )}

        {step === 3 && (
            <div className="text-center py-8 animate-in zoom-in">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                    <CheckCircle className="w-12 h-12" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Upload Complete!</h3>
                <p className="text-gray-500 mt-2">Our team will review your video shortly within 24h.</p>
            </div>
        )}

    </div>
  );
}
