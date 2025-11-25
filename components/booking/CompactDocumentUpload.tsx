'use client';

import { useState, useRef } from 'react';
import { Camera, X, Check, CreditCard, User, Image } from 'lucide-react';

interface DocumentUploadProps {
  onDocumentsChange: (docs: {
    cardFront: string | null;
    cardBack: string | null;
    photoId: string | null;
  }) => void;
  required?: boolean;
  isReturningCustomer?: boolean;
}

interface DocumentState {
  cardFront: string | null;
  cardBack: string | null;
  photoId: string | null;
}

type DocumentType = 'cardFront' | 'cardBack' | 'photoId';

export function CompactDocumentUpload({
  onDocumentsChange,
  required = true,
  isReturningCustomer = false,
}: DocumentUploadProps) {
  const [documents, setDocuments] = useState<DocumentState>({
    cardFront: null,
    cardBack: null,
    photoId: null,
  });

  const fileInputRefs = {
    cardFront: useRef<HTMLInputElement>(null),
    cardBack: useRef<HTMLInputElement>(null),
    photoId: useRef<HTMLInputElement>(null),
  };

  const handleFileSelect = async (type: DocumentType, file: File) => {
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    // Convert to base64 for preview (in production, upload to secure storage)
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      const newDocs = { ...documents, [type]: base64 };
      setDocuments(newDocs);
      onDocumentsChange(newDocs);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = (type: DocumentType) => {
    const newDocs = { ...documents, [type]: null };
    setDocuments(newDocs);
    onDocumentsChange(newDocs);

    // Reset file input
    if (fileInputRefs[type].current) {
      fileInputRefs[type].current.value = '';
    }
  };

  const handleBoxClick = (type: DocumentType) => {
    fileInputRefs[type].current?.click();
  };

  const documentConfigs = [
    {
      type: 'cardFront' as DocumentType,
      label: 'Card Front',
      icon: CreditCard,
      hint: 'Show card number',
    },
    {
      type: 'cardBack' as DocumentType,
      label: 'Card Back',
      icon: CreditCard,
      hint: 'Show CVV area',
    },
    {
      type: 'photoId' as DocumentType,
      label: 'Photo ID',
      icon: User,
      hint: 'Driver license/Passport',
    },
  ];

  const uploadedCount = Object.values(documents).filter(Boolean).length;
  const allUploaded = uploadedCount === 3;

  // If returning customer, show simplified version
  if (isReturningCustomer) {
    return (
      <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg">
        <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
        <span className="text-xs text-green-800">
          Card verified from previous booking
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
          <Camera className="w-3.5 h-3.5 text-primary-500" />
          Verify your card {required ? '*' : '(optional)'}
        </label>
        {uploadedCount > 0 && (
          <span className={`text-xs font-medium ${allUploaded ? 'text-green-600' : 'text-amber-600'}`}>
            {uploadedCount}/3 uploaded
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {documentConfigs.map(({ type, label, icon: Icon, hint }) => (
          <div key={type} className="relative">
            <input
              ref={fileInputRefs[type]}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(type, file);
              }}
              className="hidden"
            />

            {documents[type] ? (
              // Uploaded state - show thumbnail
              <div className="relative group">
                <div className="w-full aspect-square rounded-lg overflow-hidden border-2 border-green-500 bg-green-50">
                  <img
                    src={documents[type]!}
                    alt={label}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                    <Check className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(type)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
                <p className="text-[10px] text-center text-green-700 mt-1 font-medium truncate">
                  {label} ✓
                </p>
              </div>
            ) : (
              // Empty state - upload box
              <button
                type="button"
                onClick={() => handleBoxClick(type)}
                className={`
                  w-full aspect-square rounded-lg border-2 border-dashed transition-all
                  flex flex-col items-center justify-center gap-0.5 p-1
                  ${required
                    ? 'border-gray-300 hover:border-primary-400 hover:bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }
                `}
              >
                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                  <Icon className="w-3.5 h-3.5 text-gray-500" />
                </div>
                <span className="text-[10px] font-medium text-gray-600 text-center leading-tight">
                  {label}
                </span>
                <span className="text-[8px] text-gray-400 text-center leading-tight hidden sm:block">
                  {hint}
                </span>
              </button>
            )}
          </div>
        ))}
      </div>

      {required && uploadedCount < 3 && (
        <p className="text-[10px] text-amber-600 flex items-center gap-1">
          <span>⚡</span>
          Upload all 3 to speed up booking verification
        </p>
      )}
    </div>
  );
}

export default CompactDocumentUpload;
