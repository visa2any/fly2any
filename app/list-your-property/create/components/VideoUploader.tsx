'use client';

import { useState, useEffect } from 'react';
import { Youtube, X, Video, Link2, CheckCircle2 } from 'lucide-react';

export function VideoUploader({ video, onChange, className }: { video?: any, onChange?: (v: any) => void, className?: string }) {
  const [url, setUrl] = useState(video?.url || '');
  const [isValid, setIsValid] = useState(false);

  // Basic validation for video URLs
  useEffect(() => {
      if (!url) {
          setIsValid(false);
          return;
      }
      const isYoutube = url.includes('youtube.com') || url.includes('youtu.be');
      const isVimeo = url.includes('vimeo.com');
      
      const valid = isYoutube || isVimeo;
      setIsValid(valid);

      if (valid && onChange) {
          onChange({ url });
      } else if (!valid && onChange && video?.url) {
          onChange(null); // Clear if user typed an invalid string over a valid one
      }
  }, [url]);

  const handleClear = () => {
      setUrl('');
      setIsValid(false);
      if (onChange) onChange(null);
  };

  return (
    <div className={`bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm ${className || ''}`}>
        <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                <Video className="w-5 h-5" />
            </div>
            <div>
                <h3 className="font-bold text-gray-900">Property Video Tour</h3>
                <p className="text-gray-500 text-xs">Link a YouTube or Vimeo walkthrough</p>
            </div>
        </div>

        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Link2 className="h-5 w-5 text-gray-400" />
            </div>
            <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className={`block w-full pl-10 pr-10 py-3 sm:text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow ${
                    url && !isValid ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500' : 'border-neutral-200 focus:border-primary-500'
                } border`}
            />
            
            {url && isValid && (
                <div className="absolute inset-y-0 right-10 pr-3 flex items-center bg-transparent pointer-events-none">
                     <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                </div>
            )}

            {url && (
                <button
                    onClick={handleClear}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center bg-transparent text-gray-400 hover:text-gray-600 outline-none"
                    type="button"
                >
                    <X className="h-5 w-5" />
                </button>
            )}
        </div>
        
        {url && !isValid && (
            <p className="mt-2 text-xs text-red-600 flex items-center py-1">
                Please enter a valid YouTube or Vimeo URL.
            </p>
        )}

        {/* Minimal Preview Indicator */}
        {isValid && (
            <div className="mt-4 p-3 rounded-xl bg-neutral-50 flex items-center gap-3 border border-neutral-100">
                <Youtube className="w-5 h-5 text-red-600" />
                <span className="text-sm font-semibold text-gray-700 truncate">{url}</span>
            </div>
        )}
    </div>
  );
}
