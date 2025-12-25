'use client';

import { useState, useRef, useCallback, useEffect, Component, ReactNode } from 'react';
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
  Scan,
} from 'lucide-react';
import QRCode from 'qrcode';
import { DocumentCapture } from './DocumentCapture';

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
  const [cameraDoc, setCameraDoc] = useState<'cardFront' | 'cardBack' | 'photoId' | null>(null);

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Handle camera capture
  const handleCameraCapture = useCallback((imageData: string, extractedData?: any) => {
    if (!cameraDoc) return;

    // Convert base64 to File
    const byteString = atob(imageData.split(',')[1]);
    const mimeString = imageData.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: mimeString });
    const file = new File([blob], `${cameraDoc}.jpg`, { type: 'image/jpeg' });

    setDocuments(prev => ({
      ...prev,
      [cameraDoc]: {
        file,
        preview: imageData,
        uploading: false,
        uploaded: false,
      },
    }));

    setCameraDoc(null);
  }, [cameraDoc]);

  // Generate QR code for mobile upload
  useEffect(() => {
    if (showQRCode && uploadToken) {
      const mobileUrl = `${window.location.origin}/verify-upload/${uploadToken}`;
      QRCode.toDataURL(mobileUrl, {
        width: 200,
        margin: 2,
        color: { dark: '#D63A35', light: '#ffffff' },
      }).then(setQrCodeUrl);
    }
  }, [showQRCode, uploadToken]);

  // Calculate progress
  const uploadedCount = Object.values(documents).filter(d => d.uploaded || d.preview).length;
  const progressPercent = (uploadedCount / 3) * 100;
  const isComplete = uploadedCount === 3;

  // Compress and convert image to JPEG (handles HEIC from iPhone)
  const processImage = useCallback((file: File): Promise<{ file: File; preview: string }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) { reject(new Error('Canvas not supported')); return; }

            const MAX_SIZE = 1200;
            let { width, height } = img;
            if (width > MAX_SIZE || height > MAX_SIZE) {
              const ratio = Math.min(MAX_SIZE / width, MAX_SIZE / height);
              width = Math.round(width * ratio);
              height = Math.round(height * ratio);
            }

            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob(
              (blob) => {
                if (!blob) { reject(new Error('Failed to process')); return; }
                const processedFile = new File([blob], file.name.replace(/\.(heic|heif|png|webp)$/i, '.jpg'), { type: 'image/jpeg' });
                resolve({ file: processedFile, preview: canvas.toDataURL('image/jpeg', 0.85) });
              },
              'image/jpeg',
              0.85
            );
          } catch (err) { reject(err); }
        };
        img.onerror = () => reject(new Error('Failed to load'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read'));
      reader.readAsDataURL(file);
    });
  }, []);

  // Handle file selection with compression
  const handleFileSelect = useCallback(async (docId: string, file: File) => {
    if (!file.type.startsWith('image/') && !file.name.match(/\.(heic|heif)$/i)) {
      alert('Please select an image file');
      return;
    }

    // Show loading
    setDocuments(prev => ({ ...prev, [docId]: { file: null, preview: null, uploading: true, uploaded: false } }));

    try {
      const { file: processedFile, preview } = await processImage(file);
      setDocuments(prev => ({
        ...prev,
        [docId]: { file: processedFile, preview, uploading: false, uploaded: false },
      }));
    } catch (err) {
      console.error('Image processing error:', err);
      alert('Could not process image. Please try again.');
      setDocuments(prev => ({ ...prev, [docId]: { file: null, preview: null, uploading: false, uploaded: false } }));
    }
  }, [processImage]);

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

  // Error state for user-friendly display
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Submit all documents with retry logic
  const handleSubmit = async () => {
    if (!isComplete) return;

    setIsSubmitting(true);
    setSubmitError(null);

    const maxRetries = 2;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Create FormData with all images
        const formData = new FormData();
        formData.append('bookingReference', booking.bookingReference);
        formData.append('token', uploadToken);

        // Add files with size check
        let totalSize = 0;
        for (const [key, doc] of Object.entries(documents)) {
          if (doc.file) {
            totalSize += doc.file.size;
            formData.append(key, doc.file);
          }
        }

        // Check total size (max 25MB total)
        if (totalSize > 25 * 1024 * 1024) {
          throw new Error('Total file size too large. Please use smaller images.');
        }

        console.log(`[VERIFICATION] Submitting attempt ${attempt + 1}, total size: ${(totalSize / 1024 / 1024).toFixed(2)}MB`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

        const response = await fetch('/api/booking-flow/verify-documents', {
          method: 'POST',
          body: formData,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Server error' }));
          throw new Error(errorData.error || `Upload failed (${response.status})`);
        }

        // Success!
        setStep('success');
        setTimeout(() => {
          onComplete();
        }, 2000);
        return; // Exit on success

      } catch (error: any) {
        console.error(`[VERIFICATION] Attempt ${attempt + 1} failed:`, error);

        // Check if it's a network/timeout error and we have retries left
        const isRetryable = error.name === 'AbortError' ||
          error.message?.includes('network') ||
          error.message?.includes('timeout') ||
          error.message?.includes('fetch');

        if (isRetryable && attempt < maxRetries) {
          setRetryCount(attempt + 1);
          await new Promise(r => setTimeout(r, 2000)); // Wait 2s before retry
          continue;
        }

        // Final error - show to user
        let userMessage = error?.message || 'Upload failed. Please try again.';

        // Mobile-specific error handling
        if (error.name === 'AbortError') {
          userMessage = 'Upload timed out. Please check your connection and try again.';
        } else if (error.message?.includes('network') || error.message?.includes('Failed to fetch')) {
          userMessage = 'Connection lost. Please check your internet and try again.';
        }

        setSubmitError(userMessage);
        break;
      }
    }

    setIsSubmitting(false);
    setRetryCount(0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
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
              <div className="bg-info-50 border border-info-200 rounded-xl p-4">
                <h3 className="font-semibold text-neutral-800 mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  For Your Protection
                </h3>
                <p className="text-sm text-neutral-700">
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

              {/* Upload cards - ALWAYS HORIZONTAL (3 columns) - Compact design */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {DOCUMENTS.map((doc) => {
                  const docState = documents[doc.id];
                  const isUploaded = docState.preview || docState.uploaded;

                  return (
                    <div
                      key={doc.id}
                      className={`relative border-2 rounded-xl p-2 sm:p-3 transition-all cursor-pointer ${
                        isUploaded
                          ? 'border-green-400 bg-green-50'
                          : 'border-dashed border-gray-300 hover:border-primary-400 hover:bg-primary-50/50'
                      }`}
                      onClick={() => !isUploaded && fileInputRefs.current[doc.id]?.click()}
                      onDrop={(e) => handleDrop(doc.id, e)}
                      onDragOver={(e) => e.preventDefault()}
                    >
                      <input
                        ref={(el) => { fileInputRefs.current[doc.id] = el; }}
                        type="file"
                        accept="image/*,.heic,.heif"
                        capture="environment"
                        className="hidden"
                        onChange={(e) => handleInputChange(doc.id, e)}
                      />

                      {/* Ultra-compact layout */}
                      <div className="flex flex-col items-center text-center">
                        {/* Preview/Icon - smaller on mobile */}
                        <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden mb-1.5 ${
                          isUploaded ? 'ring-2 ring-green-400' : 'bg-gray-100'
                        }`}>
                          {docState.uploading ? (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                              <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary-500 animate-spin" />
                            </div>
                          ) : docState.preview ? (
                            <img src={docState.preview} alt={doc.label} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                              <doc.icon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* Label + Status */}
                        <div className="flex items-center gap-1">
                          <span className="text-[11px] sm:text-xs font-medium text-gray-800">{doc.label}</span>
                          {isUploaded && <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />}
                        </div>

                        {/* Action */}
                        {isUploaded ? (
                          <button
                            onClick={(e) => { e.stopPropagation(); setDocuments(prev => ({...prev, [doc.id]: { file: null, preview: null, uploading: false, uploaded: false }})); }}
                            className="text-[10px] text-gray-400 hover:text-red-500 mt-1"
                          >Change</button>
                        ) : (
                          <div className="flex gap-2 mt-1">
                            <button
                              onClick={(e) => { e.stopPropagation(); setCameraDoc(doc.id as 'cardFront' | 'cardBack' | 'photoId'); }}
                              className="text-[10px] text-primary-500 flex items-center gap-0.5 px-2 py-0.5 bg-primary-50 rounded hover:bg-primary-100 transition-colors"
                            >
                              <Scan className="w-3 h-3" /> Scan
                            </button>
                          </div>
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

              {/* Error display */}
              {submitError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-2">
                  <X className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Upload Failed</p>
                    <p className="text-red-600">{submitError}</p>
                    <button
                      onClick={() => { setSubmitError(null); handleSubmit(); }}
                      className="mt-2 text-xs font-semibold text-red-700 underline"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              )}

              {/* Retry indicator */}
              {retryCount > 0 && isSubmitting && (
                <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-xs text-center">
                  Connection issue. Retrying... (attempt {retryCount + 1}/3)
                </div>
              )}

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
                    {retryCount > 0 ? `Retrying...` : 'Uploading...'}
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

              {/* Finish Later button */}
              <button
                onClick={onClose}
                className="w-full py-2.5 text-sm text-gray-500 hover:text-gray-700 font-medium border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Finish Later (within 24 hours)
              </button>
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

      {/* Camera Capture Modal */}
      {cameraDoc && (
        <DocumentCapture
          docType={cameraDoc}
          onCapture={handleCameraCapture}
          onCancel={() => setCameraDoc(null)}
        />
      )}
    </div>
  );
}

// Error Boundary wrapper for the verification component

interface ErrorState {
  hasError: boolean;
  error?: Error;
}

class VerificationErrorBoundary extends Component<
  { children: ReactNode; onClose: () => void; booking: BookingInfo },
  ErrorState
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('[VERIFICATION_ERROR_BOUNDARY]', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <X className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Something went wrong
            </h3>
            <p className="text-gray-600 mb-4">
              We couldn't load the verification form. Please try again or contact support.
            </p>
            <p className="text-xs text-gray-400 mb-4">
              Ref: {this.props.booking.bookingReference}
            </p>
            <button
              onClick={this.props.onClose}
              className="w-full py-3 bg-primary-500 text-white font-bold rounded-xl hover:bg-primary-600"
            >
              Close & Try Later
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrapped export with error boundary
export function PostPaymentVerificationWithBoundary(props: PostPaymentVerificationProps) {
  return (
    <VerificationErrorBoundary onClose={props.onClose} booking={props.booking}>
      <PostPaymentVerification {...props} />
    </VerificationErrorBoundary>
  );
}
