'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Copy, Check, MessageCircle, Send, Mail, Image as ImageIcon, Download, Instagram, Share2 } from 'lucide-react';
import { zIndex } from '@/lib/design-system';
import type { FlightOffer } from '@/lib/flights/types';
import {
  extractShareData,
  generateShareUrl,
  shareToWhatsApp,
  shareToTelegram,
  shareToFacebook,
  shareToTwitter,
  shareToTikTok,
  shareToLinkedIn,
  shareViaSMS,
  shareViaEmail,
  copyToClipboard,
  trackShareEvent,
  type SharePlatform,
} from '@/lib/utils/shareUtils';
import { captureElementAsImage, generateQRCode, createSharableFlightImage, downloadBlob } from '@/lib/utils/imageShare';

export interface ShareFlightModalProps {
  flight: FlightOffer;
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
}

export default function ShareFlightModal({
  flight,
  isOpen,
  onClose,
  userId,
}: ShareFlightModalProps) {
  const [copied, setCopied] = useState(false);
  const [sharingImage, setSharingImage] = useState(false);
  const [imageResult, setImageResult] = useState<string | null>(null);
  const [showPlatformPicker, setShowPlatformPicker] = useState(false);
  const [capturedImageBlob, setCapturedImageBlob] = useState<Blob | null>(null);
  const [capturedImageUrl, setCapturedImageUrl] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const shareData = extractShareData(flight);
  const shareUrl = generateShareUrl(flight.id, 'copy', userId);

  const handleShare = async (platform: SharePlatform) => {
    trackShareEvent(platform, flight.id, userId);

    switch (platform) {
      case 'whatsapp':
        shareToWhatsApp(shareData, shareUrl);
        break;
      case 'telegram':
        shareToTelegram(shareData, shareUrl);
        break;
      case 'facebook':
        shareToFacebook(shareUrl);
        break;
      case 'twitter':
        shareToTwitter(shareData, shareUrl);
        break;
      case 'tiktok':
        shareToTikTok(shareUrl);
        // Auto-copy link for TikTok
        await copyToClipboard(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
        break;
      case 'linkedin':
        shareToLinkedIn(shareUrl, `Flight Deal: ${shareData.route}`);
        break;
      case 'sms':
        shareViaSMS(shareData, shareUrl);
        break;
      case 'email':
        shareViaEmail(shareData, shareUrl);
        break;
      case 'copy':
        const success = await copyToClipboard(shareUrl);
        if (success) {
          setCopied(true);
          setTimeout(() => setCopied(false), 3000);
        }
        break;
    }
  };

  const handleShareAsImage = async () => {
    setSharingImage(true);
    setImageResult(null);

    try {
      // SMART DETECTION: Find the full flight card element in the DOM
      // Look for the flight card that matches this flight's ID
      let flightCardElement: HTMLElement | null = null;

      // Strategy 1: Try to find by data attribute or ID
      const allFlightCards = document.querySelectorAll('[data-flight-card]');
      for (const card of Array.from(allFlightCards)) {
        if (card instanceof HTMLElement) {
          // Check if this card matches our flight
          const cardId = card.getAttribute('data-flight-id');
          if (cardId === flight.id) {
            flightCardElement = card;
            break;
          }
        }
      }

      // Strategy 2: If not found, try to find expanded card
      if (!flightCardElement) {
        const expandedCard = document.querySelector('.flight-card-expanded') as HTMLElement;
        if (expandedCard) {
          flightCardElement = expandedCard;
        }
      }

      // Strategy 3: Fallback to any visible flight card with extended details
      if (!flightCardElement) {
        const cardsWithDetails = document.querySelectorAll('.bg-white.rounded-xl.shadow-lg');
        for (const card of Array.from(cardsWithDetails)) {
          if (card instanceof HTMLElement && card.offsetHeight > 300) {
            // Likely an expanded card
            flightCardElement = card;
            break;
          }
        }
      }

      // Fallback: use preview if nothing found
      if (!flightCardElement) {
        flightCardElement = previewRef.current;
      }

      if (!flightCardElement) {
        setImageResult('Could not find flight card. Please try again.');
        setSharingImage(false);
        return;
      }

      // Check if card is expanded (has extended details visible)
      const isExpanded = flightCardElement.querySelector('[class*="extended"]') !== null ||
                         flightCardElement.offsetHeight > 500;

      console.log('Capturing flight card:', {
        found: !!flightCardElement,
        isExpanded,
        height: flightCardElement.offsetHeight,
        width: flightCardElement.offsetWidth
      });

      // Capture the flight card with QR code
      const imageBlob = await createSharableFlightImage(flightCardElement, shareUrl);

      if (!imageBlob) {
        setImageResult('Failed to create image. Please try again.');
        setSharingImage(false);
        return;
      }

      // Create object URL for preview
      const imageUrl = URL.createObjectURL(imageBlob);

      // Store captured image and show platform picker
      setCapturedImageBlob(imageBlob);
      setCapturedImageUrl(imageUrl);
      setShowPlatformPicker(true);

      console.log('✅ Image capture complete:', {
        blobSize: imageBlob.size,
        blobType: imageBlob.type,
        imageUrl: imageUrl.substring(0, 50),
        showPlatformPicker: true
      });

      trackShareEvent('image_captured', flight.id, userId);
    } catch (error) {
      console.error('❌ Error capturing image:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setImageResult(`Error: ${errorMessage}`);
      setTimeout(() => setImageResult(null), 5000);
    } finally {
      setSharingImage(false);
    }
  };

  const handlePlatformShare = async (platform: 'native' | 'whatsapp' | 'instagram' | 'facebook' | 'twitter' | 'download') => {
    if (!capturedImageBlob) return;

    try {
      const file = new File([capturedImageBlob], `fly2any-${shareData.route}-deal.png`, { type: 'image/png' });

      if (platform === 'native') {
        // Try native share API (mobile)
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `Flight Deal: ${shareData.route}`,
            text: `Check out this amazing flight deal! ${shareData.currency} ${shareData.price}`,
            url: shareUrl,
            files: [file],
          });
          trackShareEvent('image_native_share', flight.id, userId);
          setImageResult('Image shared successfully!');
          setShowPlatformPicker(false);
        } else {
          // Fallback to download
          downloadBlob(capturedImageBlob, `fly2any-${shareData.route}-deal.png`);
          await copyToClipboard(shareUrl);
          setImageResult('✅ Image downloaded and link copied! Paste in your favorite app.');
          trackShareEvent('image_download', flight.id, userId);
          setTimeout(() => setShowPlatformPicker(false), 3000);
        }
      } else if (platform === 'download') {
        // Desktop: Download + copy link
        downloadBlob(capturedImageBlob, `fly2any-${shareData.route}-deal.png`);
        await copyToClipboard(shareUrl);
        setImageResult('✅ Image downloaded and link copied! Upload to any platform.');
        trackShareEvent('image_download', flight.id, userId);
        setTimeout(() => setShowPlatformPicker(false), 3000);
      } else {
        // Platform-specific sharing (download + instructions)
        downloadBlob(capturedImageBlob, `fly2any-${shareData.route}-deal.png`);
        await copyToClipboard(shareUrl);

        const platformNames: Record<string, string> = {
          whatsapp: 'WhatsApp Status',
          instagram: 'Instagram Story',
          facebook: 'Facebook',
          twitter: 'Twitter'
        };

        setImageResult(`✅ Image downloaded! Upload to ${platformNames[platform]} and paste the link.`);
        trackShareEvent(`image_${platform}`, flight.id, userId);
        setTimeout(() => setShowPlatformPicker(false), 4000);
      }
    } catch (error) {
      console.error('Error sharing image:', error);
      if ((error as Error).name !== 'AbortError') {
        setImageResult('Error sharing. Please try again.');
      }
    }
  };

  const closePlatformPicker = () => {
    setShowPlatformPicker(false);
    if (capturedImageUrl) {
      URL.revokeObjectURL(capturedImageUrl);
      setCapturedImageUrl(null);
    }
    setCapturedImageBlob(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        {/* Compact Header */}
        <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-t-xl">
          <div>
            <h3 className="font-bold text-sm">Share Flight</h3>
            <p className="text-xs text-white/80">{shareData.route}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/20 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Rich Flight Preview */}
        <div ref={previewRef} className="px-4 py-2 bg-gradient-to-br from-blue-50 to-indigo-50 border-b border-blue-200">
          <div className="text-[10px] text-gray-600 mb-1">✈️ FLY2ANY Deal</div>
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="font-bold text-lg text-gray-900">{shareData.currency} {shareData.price}</div>
              {shareData.savingsPercent && shareData.savingsPercent > 0 && (
                <div className="text-xs text-green-600 font-semibold">🔥 Save {shareData.savingsPercent}%</div>
              )}
            </div>
            {shareData.dealScore && (
              <div className={`text-center px-2 py-1 rounded text-xs font-bold ${
                shareData.dealTier === 'excellent' ? 'bg-amber-100 text-amber-900' :
                shareData.dealTier === 'great' ? 'bg-green-100 text-green-900' :
                'bg-blue-100 text-blue-900'
              }`}>
                {shareData.dealScore}/100
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px]">
            <div><span className="text-gray-600">Airline:</span> <span className="font-semibold">{shareData.airlineName}</span></div>
            <div><span className="text-gray-600">Class:</span> <span className="font-semibold">{shareData.cabinClass}</span></div>
            <div><span className="text-gray-600">Duration:</span> <span className="font-semibold">{shareData.duration}</span></div>
            <div><span className="text-gray-600">Stops:</span> <span className="font-semibold">{shareData.isDirect ? '✅ Direct' : `${shareData.stops}`}</span></div>
            {shareData.amenities && (
              <>
                <div className="col-span-2 text-xs font-semibold text-gray-700 mt-1">Amenities:</div>
                <div>{shareData.amenities.wifi ? '📶 WiFi ✓' : '📶 No WiFi'}</div>
                <div>{shareData.amenities.power ? '🔌 Power ✓' : '🔌 No Power'}</div>
              </>
            )}
          </div>
        </div>

        {/* Compact Share Buttons */}
        <div className="px-4 py-3">
          {/* Share as Image Button - Premium Feature */}
          <button
            onClick={handleShareAsImage}
            disabled={sharingImage}
            className="w-full mb-3 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold text-sm hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sharingImage ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Creating Image...</span>
              </>
            ) : (
              <>
                <ImageIcon className="w-4 h-4" />
                <span>Share as Image</span>
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Best for Instagram/TikTok</span>
              </>
            )}
          </button>

          {imageResult && (
            <div className={`mb-3 p-2 rounded text-xs font-medium text-center ${
              imageResult.includes('Error') || imageResult.includes('Failed')
                ? 'bg-red-50 text-red-700'
                : 'bg-green-50 text-green-700'
            }`}>
              {imageResult}
            </div>
          )}

          <div className="text-center text-xs text-gray-500 mb-2">Or share via:</div>

          <div className="grid grid-cols-4 gap-2 mb-3">
            {/* WhatsApp */}
            <button
              onClick={() => handleShare('whatsapp')}
              className="flex flex-col items-center gap-1 p-2 rounded-lg border border-gray-200 hover:border-green-500 hover:bg-green-50 transition-all group"
              title="Share on WhatsApp"
            >
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-white" />
              </div>
              <span className="text-[10px] font-medium text-gray-600">WhatsApp</span>
            </button>

            {/* Telegram */}
            <button
              onClick={() => handleShare('telegram')}
              className="flex flex-col items-center gap-1 p-2 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
              title="Share on Telegram"
            >
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                <Send className="w-4 h-4 text-white" />
              </div>
              <span className="text-[10px] font-medium text-gray-600">Telegram</span>
            </button>

            {/* Facebook */}
            <button
              onClick={() => handleShare('facebook')}
              className="flex flex-col items-center gap-1 p-2 rounded-lg border border-gray-200 hover:border-blue-600 hover:bg-blue-50 transition-all group"
              title="Share on Facebook"
            >
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </div>
              <span className="text-[10px] font-medium text-gray-600">Facebook</span>
            </button>

            {/* Twitter */}
            <button
              onClick={() => handleShare('twitter')}
              className="flex flex-col items-center gap-1 p-2 rounded-lg border border-gray-200 hover:border-gray-900 hover:bg-gray-50 transition-all group"
              title="Share on Twitter"
            >
              <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </div>
              <span className="text-[10px] font-medium text-gray-600">Twitter</span>
            </button>

            {/* TikTok */}
            <button
              onClick={() => handleShare('tiktok')}
              className="flex flex-col items-center gap-1 p-2 rounded-lg border border-gray-200 hover:border-gray-900 hover:bg-gray-50 transition-all group"
              title="Share on TikTok"
            >
              <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                </svg>
              </div>
              <span className="text-[10px] font-medium text-gray-600">TikTok</span>
            </button>

            {/* LinkedIn */}
            <button
              onClick={() => handleShare('linkedin')}
              className="flex flex-col items-center gap-1 p-2 rounded-lg border border-gray-200 hover:border-blue-700 hover:bg-blue-50 transition-all group"
              title="Share on LinkedIn"
            >
              <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </div>
              <span className="text-[10px] font-medium text-gray-600">LinkedIn</span>
            </button>

            {/* SMS */}
            <button
              onClick={() => handleShare('sms')}
              className="flex flex-col items-center gap-1 p-2 rounded-lg border border-gray-200 hover:border-green-600 hover:bg-green-50 transition-all group"
              title="Share via SMS"
            >
              <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 11H7V9h2v2zm4 0h-2V9h2v2zm4 0h-2V9h2v2z"/>
                </svg>
              </div>
              <span className="text-[10px] font-medium text-gray-600">SMS</span>
            </button>

            {/* Email */}
            <button
              onClick={() => handleShare('email')}
              className="flex flex-col items-center gap-1 p-2 rounded-lg border border-gray-200 hover:border-purple-600 hover:bg-purple-50 transition-all group"
              title="Share via Email"
            >
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                <Mail className="w-4 h-4 text-white" />
              </div>
              <span className="text-[10px] font-medium text-gray-600">Email</span>
            </button>
          </div>

          {/* Copy Link */}
          <div className="flex gap-2">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 px-2 py-1.5 bg-gray-50 border border-gray-300 rounded text-xs text-gray-600 font-mono"
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <button
              onClick={() => handleShare('copy')}
              className={`px-3 py-1.5 rounded font-semibold text-xs transition-all flex items-center gap-1 ${
                copied
                  ? 'bg-green-500 text-white'
                  : 'bg-primary-600 text-white hover:bg-primary-700'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Platform Picker Modal */}
      {showPlatformPicker && (
        <div className="fixed inset-0 z-modal-backdrop flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={closePlatformPicker}>
          <div className="relative bg-white rounded-xl shadow-2xl max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-xl">
              <div>
                <h3 className="font-bold text-sm">Share Image</h3>
                <p className="text-xs text-white/80">Choose how to share</p>
              </div>
              <button
                onClick={closePlatformPicker}
                className="p-1 rounded-full hover:bg-white/20 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Image Preview */}
            {capturedImageUrl && (
              <div className="px-4 py-3 bg-gray-50 border-b">
                <div className="relative rounded-lg overflow-hidden shadow-md">
                  <img
                    src={capturedImageUrl}
                    alt="Flight card preview"
                    className="w-full h-auto"
                  />
                </div>
              </div>
            )}

            {/* Platform Options */}
            <div className="px-4 py-4">
              <div className="text-sm text-gray-600 mb-3 text-center">
                Select where you'd like to share this image:
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                {/* Native Share (Mobile) / Download (Desktop) */}
                <button
                  onClick={() => handlePlatformShare('native')}
                  className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-primary-500 bg-primary-50 hover:bg-primary-100 transition-all"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary-600 to-secondary-600 flex items-center justify-center">
                    <Share2 className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-sm text-gray-900">Quick Share</div>
                    <div className="text-xs text-gray-600">Any app</div>
                  </div>
                </button>

                {/* Download + Copy Link */}
                <button
                  onClick={() => handlePlatformShare('download')}
                  className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all"
                >
                  <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center">
                    <Download className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-sm text-gray-900">Download</div>
                    <div className="text-xs text-gray-600">Save + copy link</div>
                  </div>
                </button>

                {/* WhatsApp Status */}
                <button
                  onClick={() => handlePlatformShare('whatsapp')}
                  className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-gray-300 hover:border-green-500 hover:bg-green-50 transition-all"
                >
                  <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-sm text-gray-900">WhatsApp</div>
                    <div className="text-xs text-gray-600">Status</div>
                  </div>
                </button>

                {/* Instagram Story */}
                <button
                  onClick={() => handlePlatformShare('instagram')}
                  className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-gray-300 hover:border-pink-500 hover:bg-pink-50 transition-all"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                    <Instagram className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-sm text-gray-900">Instagram</div>
                    <div className="text-xs text-gray-600">Story</div>
                  </div>
                </button>

                {/* Facebook */}
                <button
                  onClick={() => handlePlatformShare('facebook')}
                  className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-gray-300 hover:border-blue-600 hover:bg-blue-50 transition-all"
                >
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-sm text-gray-900">Facebook</div>
                    <div className="text-xs text-gray-600">Post</div>
                  </div>
                </button>

                {/* Twitter */}
                <button
                  onClick={() => handlePlatformShare('twitter')}
                  className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-gray-300 hover:border-gray-900 hover:bg-gray-50 transition-all"
                >
                  <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-sm text-gray-900">Twitter</div>
                    <div className="text-xs text-gray-600">Post</div>
                  </div>
                </button>
              </div>

              {/* Result Message */}
              {imageResult && (
                <div className={`p-3 rounded-lg text-sm font-medium text-center ${
                  imageResult.includes('Error') || imageResult.includes('Failed')
                    ? 'bg-red-50 text-red-700'
                    : 'bg-green-50 text-green-700'
                }`}>
                  {imageResult}
                </div>
              )}

              {/* Info */}
              <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-gray-600 text-center">
                💡 The image includes a QR code linking to this flight deal
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
