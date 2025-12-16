'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Camera,
  CheckCircle2,
  X,
  RotateCcw,
  Loader2,
  CreditCard,
  IdCard,
  Scan,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

// Luhn algorithm for card validation
export const validateCardNumber = (number: string): boolean => {
  const digits = number.replace(/\D/g, '');
  if (digits.length < 13 || digits.length > 19) return false;

  let sum = 0;
  let isEven = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10);
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
};

// Card type detection
export const detectCardType = (number: string): string => {
  const digits = number.replace(/\D/g, '');
  if (/^4/.test(digits)) return 'Visa';
  if (/^5[1-5]/.test(digits)) return 'MasterCard';
  if (/^3[47]/.test(digits)) return 'American Express';
  if (/^6(?:011|5)/.test(digits)) return 'Discover';
  if (/^35/.test(digits)) return 'JCB';
  if (/^3(?:0[0-5]|[68])/.test(digits)) return 'Diners Club';
  return 'Unknown';
};

interface CapturedData {
  cardNumber?: string;
  expiryDate?: string;
  cardHolder?: string;
  cardType?: string;
  isValidCard?: boolean;
  // ID fields
  documentType?: string;
  documentNumber?: string;
  fullName?: string;
  dateOfBirth?: string;
  expiryDateId?: string;
  country?: string;
}

interface DocumentCaptureProps {
  docType: 'cardFront' | 'cardBack' | 'photoId';
  onCapture: (imageData: string, extractedData?: CapturedData) => void;
  onCancel: () => void;
}

type AlignmentStatus = 'none' | 'poor' | 'good' | 'perfect';

export function DocumentCapture({ docType, onCapture, onCancel }: DocumentCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [alignment, setAlignment] = useState<AlignmentStatus>('none');
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<CapturedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [autoCapture, setAutoCapture] = useState(false);

  // Document type config
  const docConfig = {
    cardFront: {
      title: 'Card Front',
      icon: CreditCard,
      hint: 'Position card within frame, show last 4 digits',
      aspectRatio: 1.586, // Standard card ratio
    },
    cardBack: {
      title: 'Card Back',
      icon: CreditCard,
      hint: 'Show signature strip, cover CVV',
      aspectRatio: 1.586,
    },
    photoId: {
      title: 'Photo ID',
      icon: IdCard,
      hint: 'Center ID within the frame',
      aspectRatio: 1.42, // Standard ID ratio
    },
  };

  const config = docConfig[docType];

  // Start camera
  useEffect(() => {
    const startCamera = async () => {
      try {
        const constraints = {
          video: {
            facingMode: 'environment',
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setIsLoading(false);
        }
      } catch (err: any) {
        console.error('Camera error:', err);
        setError('Camera access denied. Please allow camera permissions.');
        setIsLoading(false);
      }
    };

    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Simulated edge detection - in production would use OpenCV.js or TensorFlow.js
  const detectAlignment = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    // Simplified brightness/contrast detection for demo
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    let brightness = 0;
    let contrast = 0;
    const pixels = data.length / 4;

    for (let i = 0; i < data.length; i += 4) {
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      brightness += avg;
    }
    brightness /= pixels;

    // Determine alignment based on image quality
    if (brightness < 30 || brightness > 230) {
      setAlignment('poor');
    } else if (brightness > 80 && brightness < 180) {
      setAlignment('perfect');
    } else {
      setAlignment('good');
    }

    // Auto-capture when alignment is perfect for 1.5 seconds
    if (autoCapture && alignment === 'perfect') {
      captureImage();
    }
  }, [alignment, autoCapture]);

  // Continuous alignment detection
  useEffect(() => {
    if (isLoading || capturedImage) return;

    const interval = setInterval(detectAlignment, 500);
    return () => clearInterval(interval);
  }, [isLoading, capturedImage, detectAlignment]);

  // Capture image
  const captureImage = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set high quality
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    // Apply image enhancement
    ctx.filter = 'contrast(1.1) brightness(1.05)';
    ctx.drawImage(canvas, 0, 0);
    ctx.filter = 'none';

    const imageData = canvas.toDataURL('image/jpeg', 0.95);
    setCapturedImage(imageData);
    setIsProcessing(true);

    // Process with OCR (simplified - in production use Tesseract.js)
    try {
      const extracted = await processImage(imageData, docType);
      setExtractedData(extracted);
    } catch (err) {
      console.error('OCR error:', err);
    } finally {
      setIsProcessing(false);
    }
  }, [docType]);

  // Simplified OCR processing - in production would use Tesseract.js
  const processImage = async (imageData: string, type: string): Promise<CapturedData> => {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // In production, this would use Tesseract.js or Google Vision API
    // For now, return empty data - user can still verify manually
    return {};
  };

  // Confirm and submit
  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage, extractedData || undefined);
    }
  };

  // Retake photo
  const handleRetake = () => {
    setCapturedImage(null);
    setExtractedData(null);
    setIsProcessing(false);
  };

  // Get border color based on alignment
  const getBorderColor = () => {
    switch (alignment) {
      case 'perfect': return 'border-green-500 shadow-green-500/30';
      case 'good': return 'border-yellow-500 shadow-yellow-500/30';
      case 'poor': return 'border-red-500 shadow-red-500/30';
      default: return 'border-white/50';
    }
  };

  const getStatusText = () => {
    switch (alignment) {
      case 'perfect': return 'Perfect! Tap to capture';
      case 'good': return 'Good - Adjust slightly';
      case 'poor': return 'Poor lighting - Move to better light';
      default: return 'Position document in frame';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={onCancel}
            className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <div className="text-center">
            <div className="flex items-center gap-2 text-white">
              <config.icon className="w-5 h-5" />
              <span className="font-semibold">{config.title}</span>
            </div>
          </div>
          <div className="w-10" /> {/* Spacer */}
        </div>
      </div>

      {/* Camera View / Captured Image */}
      <div className="relative w-full h-full flex items-center justify-center">
        {isLoading ? (
          <div className="text-white text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
            <p>Starting camera...</p>
          </div>
        ) : error ? (
          <div className="text-white text-center p-8">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
            <p className="mb-4">{error}</p>
            <button
              onClick={onCancel}
              className="px-6 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
            >
              Close
            </button>
          </div>
        ) : capturedImage ? (
          // Review captured image
          <div className="w-full h-full flex flex-col">
            <div className="flex-1 flex items-center justify-center p-4">
              <img
                src={capturedImage}
                alt="Captured document"
                className="max-w-full max-h-[60vh] rounded-2xl shadow-2xl"
              />
            </div>

            {/* Processing indicator */}
            {isProcessing && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="bg-white rounded-2xl p-6 text-center">
                  <Scan className="w-10 h-10 mx-auto mb-3 text-primary-500 animate-pulse" />
                  <p className="font-semibold text-gray-900">Analyzing document...</p>
                  <p className="text-sm text-gray-500">Extracting information</p>
                </div>
              </div>
            )}

            {/* Extracted data preview */}
            {extractedData && Object.keys(extractedData).length > 0 && (
              <div className="mx-4 mb-4 p-4 bg-green-500/20 rounded-xl border border-green-500/50">
                <div className="flex items-center gap-2 text-green-400 mb-2">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm font-semibold">Data Extracted</span>
                </div>
                <div className="text-white text-sm space-y-1">
                  {extractedData.cardType && (
                    <p>Card Type: <span className="font-semibold">{extractedData.cardType}</span></p>
                  )}
                  {extractedData.isValidCard !== undefined && (
                    <p>Valid: <span className={extractedData.isValidCard ? 'text-green-400' : 'text-red-400'}>
                      {extractedData.isValidCard ? 'Yes' : 'No'}
                    </span></p>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="p-4 flex gap-3">
              <button
                onClick={handleRetake}
                className="flex-1 py-4 bg-white/10 rounded-xl text-white font-semibold flex items-center justify-center gap-2 hover:bg-white/20 transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
                Retake
              </button>
              <button
                onClick={handleConfirm}
                disabled={isProcessing}
                className="flex-1 py-4 bg-green-500 rounded-xl text-white font-semibold flex items-center justify-center gap-2 hover:bg-green-600 transition-colors disabled:opacity-50"
              >
                <CheckCircle2 className="w-5 h-5" />
                Use Photo
              </button>
            </div>
          </div>
        ) : (
          // Live camera view
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            {/* Document frame overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className={`relative border-4 rounded-2xl transition-all duration-300 shadow-lg ${getBorderColor()}`}
                style={{
                  width: '85%',
                  maxWidth: '400px',
                  aspectRatio: config.aspectRatio,
                }}
              >
                {/* Corner markers */}
                <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg" />
                <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg" />
                <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg" />
                <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg" />

                {/* Scanning line animation for perfect alignment */}
                {alignment === 'perfect' && (
                  <div className="absolute inset-0 overflow-hidden rounded-xl">
                    <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent animate-scan" />
                  </div>
                )}
              </div>
            </div>

            {/* Canvas for processing (hidden) */}
            <canvas ref={canvasRef} className="hidden" />
          </>
        )}
      </div>

      {/* Bottom controls */}
      {!capturedImage && !isLoading && !error && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6">
          {/* Status indicator */}
          <div className="text-center mb-6">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
              alignment === 'perfect' ? 'bg-green-500/20 text-green-400' :
              alignment === 'good' ? 'bg-yellow-500/20 text-yellow-400' :
              alignment === 'poor' ? 'bg-red-500/20 text-red-400' :
              'bg-white/10 text-white/70'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                alignment === 'perfect' ? 'bg-green-400 animate-pulse' :
                alignment === 'good' ? 'bg-yellow-400' :
                alignment === 'poor' ? 'bg-red-400' :
                'bg-white/50'
              }`} />
              <span className="text-sm font-medium">{getStatusText()}</span>
            </div>
          </div>

          {/* Hint */}
          <p className="text-center text-white/60 text-sm mb-4">{config.hint}</p>

          {/* Capture button */}
          <div className="flex justify-center">
            <button
              onClick={captureImage}
              className={`w-20 h-20 rounded-full border-4 border-white flex items-center justify-center transition-all ${
                alignment === 'perfect'
                  ? 'bg-green-500 scale-110'
                  : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              <Camera className="w-8 h-8 text-white" />
            </button>
          </div>
        </div>
      )}

      {/* Scan animation styles */}
      <style jsx global>{`
        @keyframes scan {
          0% { top: 0; }
          50% { top: 100%; }
          100% { top: 0; }
        }
        .animate-scan {
          animation: scan 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
