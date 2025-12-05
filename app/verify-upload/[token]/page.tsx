'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  CheckCircle2,
  Shield,
  CreditCard,
  IdCard,
  Camera,
  Loader2,
  ArrowRight,
  Sparkles,
  X,
  RotateCcw,
} from 'lucide-react';

/**
 * Mobile-Optimized Verification Upload Page
 *
 * This page is accessed via QR code from desktop.
 * Designed for easy photo capture on mobile devices.
 *
 * URL: /verify-upload/[token]
 */

const DOCUMENTS = [
  {
    id: 'cardFront',
    label: 'Card Front',
    icon: CreditCard,
    instruction: 'Show last 4 digits clearly',
    tip: 'Cover middle numbers for security',
  },
  {
    id: 'cardBack',
    label: 'Card Back',
    icon: CreditCard,
    instruction: 'Show your signature',
    tip: 'You can cover the CVV',
  },
  {
    id: 'photoId',
    label: 'Photo ID',
    icon: IdCard,
    instruction: 'Driver license or passport',
    tip: 'Make sure photo is clear',
  },
] as const;

interface DocumentState {
  file: File | null;
  preview: string | null;
}

export default function MobileUploadPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [currentStep, setCurrentStep] = useState(0);
  const [documents, setDocuments] = useState<Record<string, DocumentState>>({
    cardFront: { file: null, preview: null },
    cardBack: { file: null, preview: null },
    photoId: { file: null, preview: null },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingInfo, setBookingInfo] = useState<{ ref: string; route: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse token to get booking info
  useEffect(() => {
    if (token) {
      // Token format: bookingRef-randomHash
      const parts = token.split('-');
      if (parts.length >= 2) {
        setBookingInfo({
          ref: parts.slice(0, 2).join('-'), // FLY-XXXXXX
          route: 'Your Flight',
        });
      }
    }
  }, [token]);

  const currentDoc = DOCUMENTS[currentStep];
  const allUploaded = Object.values(documents).every(d => d.file !== null);

  // Handle camera capture
  const handleCapture = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onload = (ev) => {
      setDocuments(prev => ({
        ...prev,
        [currentDoc.id]: {
          file,
          preview: ev.target?.result as string,
        },
      }));
    };
    reader.readAsDataURL(file);
  }, [currentDoc]);

  // Move to next step
  const handleNext = () => {
    if (currentStep < DOCUMENTS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  // Retake current photo
  const handleRetake = () => {
    setDocuments(prev => ({
      ...prev,
      [currentDoc.id]: { file: null, preview: null },
    }));
  };

  // Submit all documents
  const handleSubmit = async () => {
    if (!allUploaded || !bookingInfo) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('bookingReference', bookingInfo.ref);
      formData.append('token', token);

      Object.entries(documents).forEach(([key, doc]) => {
        if (doc.file) {
          formData.append(key, doc.file);
        }
      });

      const response = await fetch('/api/booking-flow/verify-documents', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      setIsComplete(true);
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success screen
  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-500 to-emerald-600 flex flex-col items-center justify-center p-6 text-white">
        <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <Sparkles className="w-12 h-12" />
        </div>
        <h1 className="text-2xl font-bold mb-2">All Done!</h1>
        <p className="text-center text-white/90 mb-4">
          Your verification documents have been uploaded successfully.
        </p>
        <div className="bg-white/20 rounded-lg px-4 py-2 text-sm">
          You can close this page now.
        </div>
        <p className="text-xs text-white/70 mt-6">
          Check your email for ticket confirmation.
        </p>
      </div>
    );
  }

  const currentPreview = documents[currentDoc?.id]?.preview;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6" />
            <div>
              <h1 className="font-bold text-lg">Verify Your Booking</h1>
              {bookingInfo && (
                <p className="text-xs text-white/80">Ref: {bookingInfo.ref}</p>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold">{currentStep + 1}/3</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-1.5 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-500"
            style={{ width: `${((currentStep + (currentPreview ? 1 : 0)) / 3) * 100}%` }}
          />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col p-4">
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Current document card */}
        <div className="flex-1 flex flex-col">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex-1 flex flex-col">
            {/* Document info */}
            <div className="p-4 bg-gray-50 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                  <currentDoc.icon className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">{currentDoc.label}</h2>
                  <p className="text-sm text-gray-600">{currentDoc.instruction}</p>
                </div>
              </div>
            </div>

            {/* Preview or Camera */}
            <div className="flex-1 flex items-center justify-center p-4 min-h-[300px]">
              {currentPreview ? (
                <div className="relative w-full max-w-sm">
                  <img
                    src={currentPreview}
                    alt={currentDoc.label}
                    className="w-full rounded-xl shadow-lg border-4 border-green-500"
                  />
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full max-w-sm aspect-[4/3] border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-primary-400 hover:bg-primary-50/50 transition-colors"
                >
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                    <Camera className="w-8 h-8 text-primary-600" />
                  </div>
                  <p className="font-semibold text-gray-700">Tap to take photo</p>
                  <p className="text-xs text-gray-500 mt-1">{currentDoc.tip}</p>
                </div>
              )}
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleCapture}
            />

            {/* Actions */}
            <div className="p-4 border-t border-gray-100 bg-gray-50">
              {currentPreview ? (
                <div className="flex gap-3">
                  <button
                    onClick={handleRetake}
                    className="flex-1 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-5 h-5" />
                    Retake
                  </button>
                  {currentStep < DOCUMENTS.length - 1 ? (
                    <button
                      onClick={handleNext}
                      className="flex-1 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2"
                    >
                      Next
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      disabled={!allUploaded || isSubmitting}
                      className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-5 h-5" />
                          Submit
                        </>
                      )}
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg"
                >
                  <Camera className="w-6 h-6" />
                  Take Photo
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Document indicators */}
        <div className="flex justify-center gap-3 mt-4 pb-4">
          {DOCUMENTS.map((doc, index) => {
            const hasPhoto = documents[doc.id]?.file !== null;
            const isCurrent = index === currentStep;

            return (
              <button
                key={doc.id}
                onClick={() => setCurrentStep(index)}
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                  hasPhoto
                    ? 'bg-green-500 text-white'
                    : isCurrent
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-200 text-gray-400'
                }`}
              >
                {hasPhoto ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  <doc.icon className="w-6 h-6" />
                )}
              </button>
            );
          })}
        </div>
      </main>

      {/* Security note */}
      <footer className="px-4 py-3 bg-white border-t border-gray-200">
        <p className="text-xs text-center text-gray-500">
          Your documents are encrypted and stored securely.
          Only used for fraud prevention.
        </p>
      </footer>
    </div>
  );
}
