'use client';

import { useState, useRef, useCallback } from 'react';
import { Camera, Upload, X, Check, RotateCcw, AlertCircle } from 'lucide-react';

interface DocumentCaptureProps {
  label: string;
  hint?: string;
  type: 'card-front' | 'card-back' | 'id';
  onCapture: (imageData: string | null) => void;
  required?: boolean;
  error?: string;
}

export function DocumentCapture({
  label,
  hint,
  type,
  onCapture,
  required = false,
  error,
}: DocumentCaptureProps) {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Get guidance based on type
  const getGuidance = () => {
    switch (type) {
      case 'card-front':
        return {
          title: 'Credit Card Front',
          tips: ['Show cardholder name', 'Last 4 digits visible', 'Cover middle digits'],
        };
      case 'card-back':
        return {
          title: 'Credit Card Back',
          tips: ['Show signature panel', 'Cover CVV with finger'],
        };
      case 'id':
        return {
          title: 'Photo ID',
          tips: ['Full ID visible', 'Clear photo', 'Not expired'],
        };
      default:
        return { title: 'Document', tips: [] };
    }
  };

  const guidance = getGuidance();

  // Handle file upload
  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target?.result as string;
        setCapturedImage(imageData);
        onCapture(imageData);
      };
      reader.readAsDataURL(file);
    },
    [onCapture]
  );

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsCapturing(true);
    } catch (err) {
      console.error('Camera access denied:', err);
      // Fallback to file upload
      fileInputRef.current?.click();
    }
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCapturing(false);
  }, []);

  // Capture photo from camera
  const capturePhoto = useCallback(() => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0);
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(imageData);
    onCapture(imageData);
    stopCamera();
  }, [onCapture, stopCamera]);

  // Clear captured image
  const clearImage = useCallback(() => {
    setCapturedImage(null);
    onCapture(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onCapture]);

  // Retake photo
  const retake = useCallback(() => {
    clearImage();
    startCamera();
  }, [clearImage, startCamera]);

  return (
    <div>
      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Camera capturing mode */}
      {isCapturing && (
        <div className="relative rounded-lg overflow-hidden bg-black">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-40 object-cover"
          />

          {/* Overlay guide */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-4 border-2 border-white/50 rounded-lg" />
          </div>

          {/* Capture controls */}
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-3">
            <button
              type="button"
              onClick={stopCamera}
              className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>
            <button
              type="button"
              onClick={capturePhoto}
              className="p-3 bg-primary-600 rounded-full hover:bg-primary-700 transition-colors"
            >
              <Camera className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
      )}

      {/* Captured image preview */}
      {capturedImage && !isCapturing && (
        <div className="relative rounded-lg overflow-hidden border-2 border-green-500 bg-green-50">
          <img
            src={capturedImage}
            alt="Captured document"
            className="w-full h-32 object-cover"
          />
          <div className="absolute top-2 right-2 flex gap-1.5">
            <button
              type="button"
              onClick={retake}
              className="p-1.5 bg-white/90 rounded-md hover:bg-white transition-colors shadow-sm"
              title="Retake"
            >
              <RotateCcw className="w-4 h-4 text-gray-700" />
            </button>
            <button
              type="button"
              onClick={clearImage}
              className="p-1.5 bg-white/90 rounded-md hover:bg-white transition-colors shadow-sm"
              title="Remove"
            >
              <X className="w-4 h-4 text-gray-700" />
            </button>
          </div>
          <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-1 bg-green-600 rounded-md">
            <Check className="w-3.5 h-3.5 text-white" />
            <span className="text-xs font-medium text-white">Captured</span>
          </div>
        </div>
      )}

      {/* Upload buttons (when not capturing and no image) */}
      {!capturedImage && !isCapturing && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 bg-gray-50 hover:bg-gray-100 transition-colors">
          <div className="flex flex-col items-center gap-2">
            {/* Tips */}
            {hint && (
              <p className="text-xs text-gray-500 text-center">{hint}</p>
            )}
            <ul className="text-xs text-gray-500 space-y-0.5">
              {guidance.tips.map((tip, i) => (
                <li key={i} className="flex items-center gap-1">
                  <span className="w-1 h-1 bg-gray-400 rounded-full" />
                  {tip}
                </li>
              ))}
            </ul>

            {/* Action buttons */}
            <div className="flex gap-2 mt-1">
              <button
                type="button"
                onClick={startCamera}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 text-white text-xs font-medium rounded-md hover:bg-primary-700 transition-colors"
              >
                <Camera className="w-3.5 h-3.5" />
                Camera
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-xs font-medium rounded-md hover:bg-gray-50 transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" />
          {error}
        </p>
      )}
    </div>
  );
}
