'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  CheckCircle2,
  Shield,
  CreditCard,
  IdCard,
  Upload,
  Camera,
  X,
  Loader2,
  Smartphone,
  QrCode,
  ArrowRight,
  Sparkles,
  Clock,
  ChevronRight,
} from 'lucide-react';
import QRCode from 'qrcode';

interface BookingInfo {
  bookingReference: string;
  amount: number;
  currency: string;
  route: string;
  passengerName: string;
}

interface PostPaymentVerificationProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  onSkip?: () => void;
  booking: BookingInfo;
  uploadToken: string; // Token for QR code mobile upload
}

interface UploadedDoc {
  file: File | null;
  preview: string | null;
  uploading: boolean;
  uploaded: boolean;
}

const DOCUMENTS = [
  {
    id: 'cardFront',
    label: 'Card Front',
    icon: CreditCard,
    hint: 'Show last 4 digits, cover the middle',
    color: 'blue',
  },
  {
    id: 'cardBack',
    label: 'Card Back',
    icon: CreditCard,
    hint: 'Show signature, cover CVV',
    color: 'indigo',
  },
  {
    id: 'photoId',
    label: 'Photo ID',
    icon: IdCard,
    hint: 'Driver license or passport',
    color: 'purple',
  },
] as const;

export function PostPaymentVerification({
  isOpen,
  onClose,
  onComplete,
  onSkip,
  booking,
  uploadToken,
}: PostPaymentVerificationProps) {
  const [documents, setDocuments] = useState<Record<string, UploadedDoc>>({
    cardFront: { file: null, preview: null, uploading: false, uploaded: false },
    cardBack: { file: null, preview: null, uploading: false, uploaded: false },
    photoId: { file: null, preview: null, uploading: false, uploaded: false },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [step, setStep] = useState<'intro' | 'upload' | 'success'>('intro');

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Generate QR code for mobile upload
  useEffect(() => {
    if (showQRCode && uploadToken) {
      const mobileUrl = `${window.location.origin}/verify-upload/${uploadToken}`;
      QRCode.toDataURL(mobileUrl, {
        width: 200,
        margin: 2,
        color: { dark: '#1e40af', light: '#ffffff' },
      }).then(setQrCodeUrl);
    }
  }, [showQRCode, uploadToken]);

  // Calculate progress
  const uploadedCount = Object.values(documents).filter(d => d.uploaded || d.preview).length;
  const progressPercent = (uploadedCount / 3) * 100;
  const isComplete = uploadedCount === 3;

  // Handle file selection
  const handleFileSelect = useCallback(async (docId: string, file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setDocuments(prev => ({
        ...prev,
        [docId]: {
          file,
          preview: e.target?.result as string,
          uploading: false,
          uploaded: false,
        },
      }));
    };
    reader.readAsDataURL(file);
  }, []);

  // Handle drag and drop
  const handleDrop = useCallback((docId: string, e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(docId, file);
  }, [handleFileSelect]);

  // Handle file input change
  const handleInputChange = useCallback((docId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(docId, file);
  }, [handleFileSelect]);

  // Submit all documents
  const handleSubmit = async () => {
    if (!isComplete) return;

    setIsSubmitting(true);
    try {
      // Create FormData with all images
      const formData = new FormData();
      formData.append('bookingReference', booking.bookingReference);
      formData.append('token', uploadToken);

      Object.entries(documents).forEach(([key, doc]) => {
        if (doc.file) {
          formData.append(key, doc.file);
        }
      });

      const response = await fetch('/api/booking-flow/verify-documents', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      setStep('success');
      setTimeout(() => {
        onComplete();
      }, 2000);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload documents. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 px-6 py-5 text-white">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          </div>

          <div className="relative">
            {step === 'intro' && (
              <>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Payment Successful!</h2>
                    <p className="text-sm text-white/90">Your flight is secured</p>
                  </div>
                </div>
                <div className="mt-3 p-2 bg-white/10 rounded-lg">
                  <p className="text-sm font-medium">{booking.route}</p>
                  <p className="text-xs text-white/80">Ref: {booking.bookingReference} - {booking.passengerName}</p>
                </div>
              </>
            )}

            {step === 'upload' && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="w-8 h-8" />
                  <div>
                    <h2 className="text-lg font-bold">Quick Verification</h2>
                    <p className="text-sm text-white/90">Almost there! Just 3 photos</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{uploadedCount}/3</div>
                  <div className="text-xs text-white/80">uploaded</div>
                </div>
              </div>
            )}

            {step === 'success' && (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center animate-bounce">
                  <Sparkles className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">All Done!</h2>
                  <p className="text-sm text-white/90">Verification submitted successfully</p>
                </div>
              </div>
            )}
          </div>

          {/* Close button */}
          {step !== 'success' && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'intro' && (
            <div className="space-y-5">
              {/* Why we need this */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  For Your Protection
                </h3>
                <p className="text-sm text-blue-800">
                  A quick verification protects your purchase from unauthorized use.
                  This is required for first-time bookings only.
                </p>
              </div>

              {/* What you'll need */}
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900 text-sm">What you'll need:</h4>
                <div className="grid grid-cols-3 gap-3">
                  {DOCUMENTS.map((doc) => (
                    <div key={doc.id} className="text-center p-3 bg-gray-50 rounded-lg">
                      <doc.icon className={`w-6 h-6 mx-auto mb-1 text-${doc.color}-500`} />
                      <p className="text-xs font-medium text-gray-700">{doc.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Time estimate */}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>Takes less than 2 minutes</span>
              </div>

              {/* CTA */}
              <button
                onClick={() => setStep('upload')}
                className="w-full py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                Continue to Verification
                <ArrowRight className="w-5 h-5" />
              </button>

              {/* Skip option */}
              {onSkip && (
                <button
                  onClick={onSkip}
                  className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  I'll do this later (within 24 hours)
                </button>
              )}
            </div>
          )}

          {step === 'upload' && (
            <div className="space-y-4">
              {/* Progress bar */}
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Upload cards */}
              <div className="space-y-3">
                {DOCUMENTS.map((doc, index) => {
                  const docState = documents[doc.id];
                  const isUploaded = docState.preview || docState.uploaded;

                  return (
                    <div
                      key={doc.id}
                      className={`relative border-2 rounded-xl p-4 transition-all ${
                        isUploaded
                          ? 'border-green-300 bg-green-50'
                          : 'border-dashed border-gray-300 hover:border-primary-300 hover:bg-primary-50/50'
                      }`}
                      onDrop={(e) => handleDrop(doc.id, e)}
                      onDragOver={(e) => e.preventDefault()}
                    >
                      <input
                        ref={(el) => { fileInputRefs.current[doc.id] = el; }}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={(e) => handleInputChange(doc.id, e)}
                      />

                      <div className="flex items-center gap-4">
                        {/* Preview or Icon */}
                        <div className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 ${
                          isUploaded ? 'bg-white' : `bg-${doc.color}-100`
                        }`}>
                          {docState.preview ? (
                            <img
                              src={docState.preview}
                              alt={doc.label}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <doc.icon className={`w-8 h-8 text-${doc.color}-500`} />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-400">
                              {index + 1}/3
                            </span>
                            <h4 className="font-semibold text-gray-900">{doc.label}</h4>
                            {isUploaded && (
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">{doc.hint}</p>
                        </div>

                        {/* Action button */}
                        {!isUploaded ? (
                          <button
                            onClick={() => fileInputRefs.current[doc.id]?.click()}
                            className="px-4 py-2 bg-primary-100 text-primary-700 text-sm font-semibold rounded-lg hover:bg-primary-200 transition-colors flex items-center gap-1.5"
                          >
                            <Camera className="w-4 h-4" />
                            <span className="hidden sm:inline">Upload</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setDocuments(prev => ({
                                ...prev,
                                [doc.id]: { file: null, preview: null, uploading: false, uploaded: false },
                              }));
                            }}
                            className="px-3 py-2 text-gray-500 text-sm hover:text-red-500 transition-colors"
                          >
                            Change
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* QR Code for mobile */}
              <div className="border border-gray-200 rounded-xl p-4">
                <button
                  onClick={() => setShowQRCode(!showQRCode)}
                  className="w-full flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2 text-gray-700">
                    <Smartphone className="w-5 h-5 text-primary-500" />
                    <span className="font-medium">On a computer? Upload from phone</span>
                  </div>
                  <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${showQRCode ? 'rotate-90' : ''}`} />
                </button>

                {showQRCode && (
                  <div className="mt-4 text-center">
                    <p className="text-xs text-gray-500 mb-3">
                      Scan this QR code with your phone camera
                    </p>
                    {qrCodeUrl ? (
                      <div className="inline-block p-3 bg-white border border-gray-200 rounded-xl">
                        <img src={qrCodeUrl} alt="QR Code for mobile upload" className="w-32 h-32" />
                      </div>
                    ) : (
                      <div className="w-32 h-32 mx-auto bg-gray-100 rounded-xl flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                      </div>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      Opens secure upload page
                    </p>
                  </div>
                )}
              </div>

              {/* Submit button */}
              <button
                onClick={handleSubmit}
                disabled={!isComplete || isSubmitting}
                className={`w-full py-3.5 font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                  isComplete
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 shadow-lg hover:shadow-xl'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    Complete Verification
                  </>
                )}
              </button>

              {/* Security note */}
              <p className="text-xs text-center text-gray-500">
                Your documents are encrypted and stored securely.
                Only used for fraud prevention.
              </p>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-6">
              <div className="w-20 h-20 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Verification Complete!
              </h3>
              <p className="text-gray-600 mb-4">
                Your ticket will be issued within 1-2 hours.
                We'll send your e-ticket via email.
              </p>
              <div className="bg-gray-50 rounded-lg p-3 text-sm">
                <span className="text-gray-500">Booking Reference: </span>
                <span className="font-mono font-bold text-primary-600">
                  {booking.bookingReference}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
