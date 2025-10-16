'use client';

import { useState } from 'react';

interface QuickReactionsProps {
  postId: string;
  initialLikes?: number;
  initialSaved?: boolean;
  onLike?: (postId: string) => void;
  onSave?: (postId: string) => void;
  onShare?: (postId: string, platform: string) => void;
  showLabels?: boolean;
  language?: 'en' | 'pt' | 'es';
}

export function QuickReactions({
  postId,
  initialLikes = 0,
  initialSaved = false,
  onLike,
  onSave,
  onShare,
  showLabels = false,
  language = 'en',
}: QuickReactionsProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const translations = {
    en: { like: 'Like', save: 'Save', share: 'Share', shareVia: 'Share via' },
    pt: { like: 'Curtir', save: 'Salvar', share: 'Compartilhar', shareVia: 'Compartilhar via' },
    es: { like: 'Me gusta', save: 'Guardar', share: 'Compartir', shareVia: 'Compartir vía' },
  };

  const t = translations[language];

  const handleLike = () => {
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setLikes((prev) => (newIsLiked ? prev + 1 : prev - 1));
    onLike?.(postId);
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    onSave?.(postId);
  };

  const handleShare = (platform: string) => {
    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

    let shareUrl = '';
    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(currentUrl)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`;
        break;
      case 'copy':
        if (typeof window !== 'undefined' && navigator.clipboard) {
          navigator.clipboard.writeText(currentUrl);
          setShowShareMenu(false);
          return;
        }
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
      setShowShareMenu(false);
    }

    onShare?.(postId, platform);
  };

  return (
    <div className="flex items-center gap-3">
      {/* Like Button */}
      <button
        onClick={handleLike}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300
          ${
            isLiked
              ? 'bg-red-50 text-red-600 border-2 border-red-600'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-2 border-transparent'
          }
        `}
      >
        <span className="text-lg">{isLiked ? '❤️' : '🤍'}</span>
        {showLabels && <span className="text-sm font-medium">{t.like}</span>}
        {likes > 0 && <span className="text-sm font-bold">{likes}</span>}
      </button>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300
          ${
            isSaved
              ? 'bg-blue-50 text-blue-600 border-2 border-blue-600'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-2 border-transparent'
          }
        `}
      >
        <span className="text-lg">{isSaved ? '🔖' : '📑'}</span>
        {showLabels && <span className="text-sm font-medium">{t.save}</span>}
      </button>

      {/* Share Button */}
      <div className="relative">
        <button
          onClick={() => setShowShareMenu(!showShareMenu)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 bg-gray-100 text-gray-600 hover:bg-gray-200 border-2 border-transparent"
        >
          <span className="text-lg">🔗</span>
          {showLabels && <span className="text-sm font-medium">{t.share}</span>}
        </button>

        {/* Share Menu */}
        {showShareMenu && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowShareMenu(false)}
            />

            {/* Menu */}
            <div className="absolute left-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-2 z-20 min-w-[180px]">
              <div className="text-xs font-bold text-gray-500 px-3 py-2">
                {t.shareVia}:
              </div>

              <button
                onClick={() => handleShare('whatsapp')}
                className="w-full flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100 transition-colors text-left"
              >
                <span className="text-xl">💬</span>
                <span className="text-sm font-medium">WhatsApp</span>
              </button>

              <button
                onClick={() => handleShare('facebook')}
                className="w-full flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100 transition-colors text-left"
              >
                <span className="text-xl">📘</span>
                <span className="text-sm font-medium">Facebook</span>
              </button>

              <button
                onClick={() => handleShare('twitter')}
                className="w-full flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100 transition-colors text-left"
              >
                <span className="text-xl">🐦</span>
                <span className="text-sm font-medium">Twitter</span>
              </button>

              <button
                onClick={() => handleShare('linkedin')}
                className="w-full flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100 transition-colors text-left"
              >
                <span className="text-xl">💼</span>
                <span className="text-sm font-medium">LinkedIn</span>
              </button>

              <div className="border-t border-gray-200 my-1" />

              <button
                onClick={() => handleShare('copy')}
                className="w-full flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100 transition-colors text-left"
              >
                <span className="text-xl">📋</span>
                <span className="text-sm font-medium">Copy Link</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
