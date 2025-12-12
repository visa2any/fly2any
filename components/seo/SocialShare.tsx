/**
 * SOCIAL SHARING COMPONENT
 *
 * Optimized social media sharing buttons with:
 * - Facebook, Twitter, LinkedIn, WhatsApp, Email
 * - Open Graph preview
 * - Analytics tracking
 * - Customizable styling
 *
 * @version 1.0.0
 */

'use client';

import { useState, useEffect } from 'react';
import { Facebook, Twitter, Linkedin, Mail, Share2, Check } from 'lucide-react';
import { trackCustomEvent } from '@/lib/analytics/google-analytics';

interface SocialShareProps {
  url?: string;
  title?: string;
  description?: string;
  hashtags?: string[];
  className?: string;
  showLabels?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Social Share Component
 *
 * Usage:
 * <SocialShare
 *   title="Cheap Flights JFK to LAX"
 *   description="Find the best deals..."
 *   hashtags={['travel', 'flights']}
 * />
 */
export function SocialShare({
  url,
  title,
  description,
  hashtags = [],
  className = '',
  showLabels = false,
  size = 'md',
}: SocialShareProps) {
  const [copied, setCopied] = useState(false);

  // Use current page if URL not provided
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const shareTitle = title || (typeof document !== 'undefined' ? document.title : '');
  const shareDescription = description || '';

  // Size classes
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  /**
   * Share on Facebook
   */
  const shareOnFacebook = () => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    openShareWindow(fbUrl, 'Facebook');
    trackShare('Facebook');
  };

  /**
   * Share on Twitter
   */
  const shareOnTwitter = () => {
    let twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`;

    if (hashtags.length > 0) {
      twitterUrl += `&hashtags=${hashtags.join(',')}`;
    }

    openShareWindow(twitterUrl, 'Twitter');
    trackShare('Twitter');
  };

  /**
   * Share on LinkedIn
   */
  const shareOnLinkedIn = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    openShareWindow(linkedInUrl, 'LinkedIn');
    trackShare('LinkedIn');
  };

  /**
   * Share on WhatsApp
   */
  const shareOnWhatsApp = () => {
    const whatsAppUrl = `https://wa.me/?text=${encodeURIComponent(`${shareTitle} - ${shareUrl}`)}`;
    openShareWindow(whatsAppUrl, 'WhatsApp');
    trackShare('WhatsApp');
  };

  /**
   * Share via Email
   */
  const shareViaEmail = () => {
    const subject = encodeURIComponent(shareTitle);
    const body = encodeURIComponent(`${shareDescription}\n\n${shareUrl}`);
    const mailtoUrl = `mailto:?subject=${subject}&body=${body}`;
    window.location.href = mailtoUrl;
    trackShare('Email');
  };

  /**
   * Copy link to clipboard
   */
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      trackShare('Copy Link');
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  /**
   * Native share (mobile)
   */
  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareDescription,
          url: shareUrl,
        });
        trackShare('Native Share');
      } catch (error) {
        console.error('Share failed:', error);
      }
    }
  };

  /**
   * Open share window
   */
  const openShareWindow = (url: string, platform: string) => {
    const width = 600;
    const height = 400;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;

    window.open(
      url,
      `share-${platform}`,
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no`
    );
  };

  /**
   * Track share event
   */
  const trackShare = (platform: string) => {
    trackCustomEvent('share', {
      method: platform,
      content_type: 'page',
      item_id: shareUrl,
    });
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Facebook */}
      <button
        onClick={shareOnFacebook}
        className={`${sizeClasses[size]} flex items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors`}
        aria-label="Share on Facebook"
        title="Share on Facebook"
      >
        <Facebook size={iconSizes[size]} />
      </button>

      {/* Twitter */}
      <button
        onClick={shareOnTwitter}
        className={`${sizeClasses[size]} flex items-center justify-center rounded-full bg-sky-500 text-white hover:bg-sky-600 transition-colors`}
        aria-label="Share on Twitter"
        title="Share on Twitter"
      >
        <Twitter size={iconSizes[size]} />
      </button>

      {/* LinkedIn */}
      <button
        onClick={shareOnLinkedIn}
        className={`${sizeClasses[size]} flex items-center justify-center rounded-full bg-blue-700 text-white hover:bg-blue-800 transition-colors`}
        aria-label="Share on LinkedIn"
        title="Share on LinkedIn"
      >
        <Linkedin size={iconSizes[size]} />
      </button>

      {/* Email */}
      <button
        onClick={shareViaEmail}
        className={`${sizeClasses[size]} flex items-center justify-center rounded-full bg-gray-600 text-white hover:bg-gray-700 transition-colors`}
        aria-label="Share via Email"
        title="Share via Email"
      >
        <Mail size={iconSizes[size]} />
      </button>

      {/* Copy Link */}
      <button
        onClick={copyToClipboard}
        className={`${sizeClasses[size]} flex items-center justify-center rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors relative`}
        aria-label="Copy link"
        title="Copy link"
      >
        {copied ? (
          <Check size={iconSizes[size]} className="text-green-600" />
        ) : (
          <Share2 size={iconSizes[size]} />
        )}
      </button>

      {/* Native Share (mobile) */}
      {typeof navigator !== 'undefined' && 'share' in navigator && (
        <button
          onClick={nativeShare}
          className={`${sizeClasses[size]} flex items-center justify-center rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors md:hidden`}
          aria-label="Share"
          title="Share"
        >
          <Share2 size={iconSizes[size]} />
        </button>
      )}
    </div>
  );
}

/**
 * Social Share with Labels
 */
export function SocialShareWithLabels(props: SocialShareProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
        Share This
      </h3>
      <SocialShare {...props} showLabels={true} />
    </div>
  );
}

/**
 * Floating Social Share Bar
 */
export function FloatingSocialShare(props: SocialShareProps) {
  const [isVisible, setIsVisible] = useState(false);

  // Show after scrolling down - FIX: moved to useEffect with cleanup
  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed left-4 top-1/2 -translate-y-1/2 z-50 hidden lg:block">
      <div className="flex flex-col gap-3 bg-white rounded-full shadow-lg p-3">
        <SocialShare {...props} className="flex-col" size="sm" />
      </div>
    </div>
  );
}

/**
 * Sticky Social Share Bar (mobile)
 */
export function StickySocialShare(props: SocialShareProps) {
  return (
    <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 lg:hidden z-40">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Share:</span>
        <SocialShare {...props} size="sm" />
      </div>
    </div>
  );
}

export default SocialShare;
