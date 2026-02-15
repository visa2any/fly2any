'use client';

import { useState } from 'react';
import { Upload, X, Video, Loader2 } from 'lucide-react';

export function VideoUploader({ video, onChange, className }: { video?: any, onChange?: (v: any) => void, className?: string }) {
  const [loading, setLoading] = useState(false);
  const [localVideo, setLocalVideo] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
      setLoading(true);
      // Mock upload
      setTimeout(() => {
          setLocalVideo(URL.createObjectURL(file));
          setLoading(false);
          if (onChange) onChange({ url: URL.createObjectURL(file) });
      }, 1500);
  };

  return (
    <div className={`bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm ${className || ''}`}>
        <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                <Video className="w-5 h-5" />
            </div>
            <div>
                <h3 className="font-bold text-gray-900">Property Video Tour</h3>
                <p className="text-gray-500 text-xs">Add a video walkthrough (max 60s)</p>
            </div>
        </div>

        {localVideo ? (
            <div className="relative rounded-xl overflow-hidden bg-black aspect-video group">
                <video src={localVideo} controls className="w-full h-full object-cover" />
                <button 
                    onClick={() => { setLocalVideo(null); if(onChange) onChange(null); }}
                    className="absolute top-2 right-2 p-2 bg-white/90 rounded-full text-red-500 hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        ) : (
            <div className="border-2 border-dashed border-neutral-300 rounded-xl p-8 hover:bg-neutral-50 transition-colors text-center cursor-pointer relative">
                <input 
                    type="file" 
                    accept="video/*" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
                />
                
                {loading ? (
                    <div className="flex flex-col items-center">
                        <Loader2 className="w-8 h-8 text-primary-500 animate-spin mb-2" />
                         <span className="text-sm text-gray-500">Processing video...</span>
                    </div>
                ) : (
                    <>
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <span className="text-sm font-semibold text-gray-700">Upload Video</span>
                    </>
                )}
            </div>
        )}
    </div>
  );
}
