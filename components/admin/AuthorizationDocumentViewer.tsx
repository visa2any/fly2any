'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  X, ZoomIn, ZoomOut, RotateCw, Download, Printer, Mail, Share2,
  ChevronLeft, ChevronRight, Maximize2, Minimize2, FileText,
  CreditCard, User, Camera, CheckCircle, AlertCircle, Copy
} from 'lucide-react';

interface DocumentImage {
  url: string;
  label: string;
  type: 'card-front' | 'card-back' | 'photo-id' | 'signature';
}

interface AuthorizationData {
  id: string;
  bookingReference: string;
  cardholderName: string;
  cardLast4: string;
  cardBrand: string;
  email: string;
  phone: string;
  amount: number;
  currency: string;
  billingCity: string;
  billingCountry: string;
  cardFrontImage: string | null;
  cardBackImage: string | null;
  idDocumentImage: string | null;
  signatureImage: string | null;
  signatureTyped: string;
  status: string;
  createdAt: string;
  verifiedAt: string | null;
}

interface Props {
  authorization: AuthorizationData;
  onClose: () => void;
  isOpen: boolean;
}

export default function AuthorizationDocumentViewer({ authorization, onClose, isOpen }: Props) {
  const [activeTab, setActiveTab] = useState<'documents' | 'pdf'>('documents');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  // Collect all available images
  const images: DocumentImage[] = [
    authorization.cardFrontImage && { url: authorization.cardFrontImage, label: 'Credit Card - Front', type: 'card-front' as const },
    authorization.cardBackImage && { url: authorization.cardBackImage, label: 'Credit Card - Back', type: 'card-back' as const },
    authorization.idDocumentImage && { url: authorization.idDocumentImage, label: 'Photo ID', type: 'photo-id' as const },
    authorization.signatureImage && { url: authorization.signatureImage, label: 'Signature', type: 'signature' as const },
  ].filter(Boolean) as DocumentImage[];

  const currentImage = images[currentImageIndex];

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      switch (e.key) {
        case 'Escape': onClose(); break;
        case 'ArrowLeft': handlePrev(); break;
        case 'ArrowRight': handleNext(); break;
        case '+': case '=': handleZoomIn(); break;
        case '-': handleZoomOut(); break;
        case 'r': handleRotate(); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentImageIndex]);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 4));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  const handlePrev = () => setCurrentImageIndex(prev => prev > 0 ? prev - 1 : images.length - 1);
  const handleNext = () => setCurrentImageIndex(prev => prev < images.length - 1 ? prev + 1 : 0);
  const resetView = () => { setZoom(1); setRotation(0); };

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Generate PDF
  const handleDownloadPdf = async () => {
    setPdfLoading(true);
    try {
      const res = await fetch(`/api/admin/generate-authorization-pdf?id=${authorization.id}`);
      if (!res.ok) throw new Error('Failed to generate PDF');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Authorization_${authorization.bookingReference}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('PDF download error:', error);
    } finally {
      setPdfLoading(false);
    }
  };

  // Print
  const handlePrint = async () => {
    setPdfLoading(true);
    try {
      const res = await fetch(`/api/admin/generate-authorization-pdf?id=${authorization.id}`);
      if (!res.ok) throw new Error('Failed to generate PDF');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const printWindow = window.open(url);
      printWindow?.addEventListener('load', () => printWindow.print());
    } catch (error) {
      console.error('Print error:', error);
    } finally {
      setPdfLoading(false);
    }
  };

  // Email
  const handleEmail = () => {
    const subject = encodeURIComponent(`Card Authorization - ${authorization.bookingReference}`);
    const body = encodeURIComponent(
      `Card Authorization Document\n\n` +
      `Booking Reference: ${authorization.bookingReference}\n` +
      `Cardholder: ${authorization.cardholderName}\n` +
      `Amount: ${authorization.currency} ${authorization.amount.toLocaleString()}\n` +
      `Card: ${authorization.cardBrand.toUpperCase()} ****${authorization.cardLast4}\n` +
      `Status: ${authorization.status}\n\n` +
      `Please download the full authorization document from the admin panel.`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  // Share/Copy link
  const handleShare = async () => {
    const shareData = {
      title: `Authorization - ${authorization.bookingReference}`,
      text: `Card Authorization for ${authorization.cardholderName}`,
      url: `${window.location.origin}/admin/authorizations?id=${authorization.id}`,
    };

    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      await navigator.clipboard.writeText(shareData.url);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div
        ref={containerRef}
        className="relative w-[95vw] h-[90vh] max-w-7xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col transform transition-all duration-300 ease-out"
        style={{ animation: 'modalEnter 0.3s ease-out' }}
      >
        {/* Header */}
        <div className="flex-shrink-0 px-6 py-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Authorization Document</h2>
                <p className="text-sm text-white/70">
                  {authorization.bookingReference} • {authorization.cardholderName}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadPdf}
                disabled={pdfLoading}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200 text-sm font-medium"
              >
                <Download className="w-4 h-4" />
                {pdfLoading ? 'Generating...' : 'Download PDF'}
              </button>
              <button
                onClick={handlePrint}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200"
                title="Print"
              >
                <Printer className="w-4 h-4" />
              </button>
              <button
                onClick={handleEmail}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200"
                title="Email"
              >
                <Mail className="w-4 h-4" />
              </button>
              <button
                onClick={handleShare}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200 relative"
                title="Share"
              >
                {copySuccess ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Share2 className="w-4 h-4" />}
              </button>
              <div className="w-px h-6 bg-white/20 mx-2" />
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-all duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4">
            <button
              onClick={() => setActiveTab('documents')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'documents'
                  ? 'bg-white text-slate-900'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <Camera className="w-4 h-4 inline mr-2" />
              Documents ({images.length})
            </button>
            <button
              onClick={() => setActiveTab('pdf')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'pdf'
                  ? 'bg-white text-slate-900'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Full Document
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {activeTab === 'documents' ? (
            <>
              {/* Image Viewer */}
              <div className="flex-1 relative bg-slate-100 flex items-center justify-center overflow-hidden">
                {images.length > 0 ? (
                  <>
                    {/* Navigation Arrows */}
                    {images.length > 1 && (
                      <>
                        <button
                          onClick={handlePrev}
                          className="absolute left-4 z-10 p-3 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all duration-200 hover:scale-105"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={handleNext}
                          className="absolute right-4 z-10 p-3 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all duration-200 hover:scale-105"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </>
                    )}

                    {/* Image */}
                    <div
                      ref={imageRef}
                      className="max-w-full max-h-full p-8 transition-transform duration-300 ease-out"
                      style={{
                        transform: `scale(${zoom}) rotate(${rotation}deg)`,
                      }}
                    >
                      <img
                        src={currentImage.url}
                        alt={currentImage.label}
                        className="max-h-[60vh] max-w-full object-contain rounded-lg shadow-2xl"
                        draggable={false}
                      />
                    </div>

                    {/* Image Label */}
                    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/70 text-white rounded-full text-sm font-medium">
                      {currentImage.label}
                    </div>

                    {/* Thumbnail Nav */}
                    {images.length > 1 && (
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 p-2 bg-white/90 backdrop-blur rounded-xl shadow-lg">
                        {images.map((img, idx) => (
                          <button
                            key={idx}
                            onClick={() => { setCurrentImageIndex(idx); resetView(); }}
                            className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                              idx === currentImageIndex
                                ? 'border-blue-500 ring-2 ring-blue-200'
                                : 'border-transparent opacity-60 hover:opacity-100'
                            }`}
                          >
                            <img src={img.url} alt="" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Zoom Controls */}
                    <div className="absolute top-4 right-4 flex flex-col gap-1 p-1 bg-white/90 backdrop-blur rounded-xl shadow-lg">
                      <button onClick={handleZoomIn} className="p-2 hover:bg-slate-100 rounded-lg" title="Zoom In (+)">
                        <ZoomIn className="w-4 h-4" />
                      </button>
                      <button onClick={handleZoomOut} className="p-2 hover:bg-slate-100 rounded-lg" title="Zoom Out (-)">
                        <ZoomOut className="w-4 h-4" />
                      </button>
                      <button onClick={handleRotate} className="p-2 hover:bg-slate-100 rounded-lg" title="Rotate (R)">
                        <RotateCw className="w-4 h-4" />
                      </button>
                      <div className="h-px bg-slate-200 my-1" />
                      <button onClick={toggleFullscreen} className="p-2 hover:bg-slate-100 rounded-lg" title="Fullscreen">
                        {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Zoom Level */}
                    <div className="absolute top-4 left-4 px-3 py-1.5 bg-white/90 backdrop-blur rounded-lg text-sm font-medium shadow-lg">
                      {Math.round(zoom * 100)}%
                    </div>
                  </>
                ) : (
                  <div className="text-center text-slate-400">
                    <AlertCircle className="w-12 h-12 mx-auto mb-2" />
                    <p>No documents uploaded</p>
                  </div>
                )}
              </div>

              {/* Sidebar - Authorization Details */}
              <div className="w-80 border-l border-slate-200 bg-white overflow-y-auto">
                <div className="p-4 space-y-4">
                  {/* Status Badge */}
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                    authorization.status === 'VERIFIED' ? 'bg-green-100 text-green-700' :
                    authorization.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                    authorization.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {authorization.status === 'VERIFIED' && <CheckCircle className="w-4 h-4" />}
                    {authorization.status}
                  </div>

                  {/* Transaction */}
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Transaction</h3>
                    <div className="text-2xl font-bold text-slate-900">
                      {authorization.currency} {authorization.amount.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-sm text-slate-600">
                      <CreditCard className="w-4 h-4" />
                      {authorization.cardBrand.toUpperCase()} ****{authorization.cardLast4}
                    </div>
                  </div>

                  {/* Cardholder */}
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Cardholder</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-400" />
                        <span className="font-medium">{authorization.cardholderName}</span>
                      </div>
                      <div className="text-slate-600">{authorization.email}</div>
                      <div className="text-slate-600">{authorization.phone}</div>
                      <div className="text-slate-500">{authorization.billingCity}, {authorization.billingCountry}</div>
                    </div>
                  </div>

                  {/* Signature */}
                  {authorization.signatureTyped && (
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Digital Signature</h3>
                      <div className="font-serif text-xl italic text-slate-800">
                        {authorization.signatureTyped}
                      </div>
                      <div className="text-xs text-slate-500 mt-2">
                        Signed: {new Date(authorization.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  )}

                  {/* Document Checklist */}
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Documents</h3>
                    <div className="space-y-2">
                      {[
                        { label: 'Card Front', ok: !!authorization.cardFrontImage },
                        { label: 'Card Back', ok: !!authorization.cardBackImage },
                        { label: 'Photo ID', ok: !!authorization.idDocumentImage },
                        { label: 'Signature', ok: !!authorization.signatureImage || !!authorization.signatureTyped },
                      ].map((doc, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                            doc.ok ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-400'
                          }`}>
                            {doc.ok ? <CheckCircle className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          </div>
                          <span className={doc.ok ? 'text-slate-700' : 'text-slate-400'}>{doc.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* PDF Preview Tab */
            <div className="flex-1 bg-slate-100 p-4 flex items-center justify-center">
              <div className="text-center max-w-md">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <FileText className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">Authorization Document PDF</h3>
                <p className="text-slate-500 mb-6">
                  ARC-compliant document with transaction details, cardholder info, uploaded documents, and digital signature.
                </p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => window.open(`/api/admin/generate-authorization-pdf?id=${authorization.id}&inline=true`, '_blank')}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all font-medium shadow-lg"
                  >
                    <Maximize2 className="w-4 h-4" />
                    Open PDF in New Tab
                  </button>
                  <button
                    onClick={handleDownloadPdf}
                    disabled={pdfLoading}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all font-medium"
                  >
                    <Download className="w-4 h-4" />
                    {pdfLoading ? 'Generating...' : 'Download PDF'}
                  </button>
                  <button
                    onClick={handlePrint}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all font-medium"
                  >
                    <Printer className="w-4 h-4" />
                    Print Document
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes modalEnter {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
