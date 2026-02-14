'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload, X, Film, Play, AlertCircle, Loader2, Video } from 'lucide-react';
import Image from 'next/image';

interface VideoData {
  url: string;
  thumbnailUrl?: string; // We'll generate this
  duration: number;
  size: number;
}

interface VideoUploaderProps {
    video?: VideoData | null;
    onChange: (video: VideoData | null) => void;
}

export function VideoUploader({ video, onChange }: VideoUploaderProps) {
    const [dragOver, setDragOver] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState('');
    const videoRef = useRef<HTMLVideoElement>(null);

    const validateAndUpload = async (file: File) => {
        setError('');
        
        // 1. Size Check (50MB)
        if (file.size > 50 * 1024 * 1024) {
            setError('Video too large. Max 50MB allowed.');
            return;
        }

        // 2. Duration Check (Requires loading metadata)
        const duration = await getVideoDuration(file);
        if (duration > 31) { // Tolerate 1s variance
            setError(`Video too long (${Math.round(duration)}s). Max 30 seconds allowed.`);
            return;
        }

        setUploading(true);
        
        try {
            // 3. Generate Thumbnail
            const thumbnailUrl = await generateThumbnail(file);

            // 4. Upload Video
            const formData = new FormData();
            formData.append('file', file);
            formData.append('bucket', 'property-videos'); // Custom bucket/folder signal

            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            if (!res.ok) throw new Error('Upload failed');
            const data = await res.json();

            // 5. Update State
            onChange({
                url: data.url,
                thumbnailUrl: thumbnailUrl, // In a real app, upload this thumbnail too!
                duration,
                size: file.size
            });

        } catch (e) {
            console.error(e);
            setError('Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const getVideoDuration = (file: File): Promise<number> => {
        return new Promise((resolve, reject) => {
            const video = document.createElement('video');
            video.preload = 'metadata';
            video.onloadedmetadata = () => {
                window.URL.revokeObjectURL(video.src);
                resolve(video.duration);
            };
            video.onerror = () => reject("Invalid video file");
            video.src = URL.createObjectURL(file);
        });
    }

    const generateThumbnail = (file: File): Promise<string> => {
        return new Promise((resolve) => {
            const video = document.createElement('video');
            video.preload = 'metadata';
            video.src = URL.createObjectURL(file);
            video.currentTime = 1; // Capture at 1s mark
            
            video.onseeked = () => {
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
                // Convert to data URL for immediate preview (should upload in prod)
                resolve(canvas.toDataURL('image/jpeg', 0.7)); 
            };
        });
    }

    return (
        <div className="space-y-4">
             {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Film className="w-5 h-5 text-amber-400" /> Cinematic Short
                    </h3>
                    <p className="text-white/50 text-sm">Add a 30s highlight reel. Increases conversion by 20%.</p>
                </div>
                {video && (
                     <button onClick={() => onChange(null)} className="text-red-400 hover:text-red-300 text-xs font-bold">
                        Remove Video
                     </button>
                )}
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> {error}
                </div>
            )}

            {!video && !uploading && (
                 <div 
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => { 
                        e.preventDefault(); 
                        setDragOver(false); 
                        if(e.dataTransfer.files[0]) validateAndUpload(e.dataTransfer.files[0]); 
                    }}
                    className={`relative p-8 rounded-xl border-2 border-dashed transition-all text-center cursor-pointer ${
                        dragOver ? 'border-amber-400 bg-amber-400/10' : 'border-white/10 bg-white/5 hover:bg-white/10'
                    }`}
                >
                    <input 
                        type="file" 
                        accept="video/mp4,video/quicktime,video/webm" 
                        onChange={(e) => { if(e.target.files?.[0]) validateAndUpload(e.target.files[0]); }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                    />
                    <div className="pointer-events-none">
                         <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-3">
                            <Video className="w-6 h-6 text-white/50" />
                         </div>
                         <h4 className="font-bold text-white mb-1">Upload Property Trailer</h4>
                         <p className="text-white/30 text-xs">MP4, MOV up to 50MB. Max 30s.</p>
                    </div>
                </div>
            )}

            {uploading && (
                 <div className="p-8 rounded-xl bg-white/5 border border-white/10 text-center">
                      <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto mb-4" />
                      <div className="text-white font-bold">Processing Video...</div>
                      <div className="text-white/30 text-xs mt-1">Generating thumbnail & optimizing</div>
                 </div>
            )}

            {video && (
                <div className="relative rounded-xl overflow-hidden bg-black aspect-video group">
                    <video 
                        ref={videoRef}
                        src={video.url} 
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                        controls
                    />
                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur px-2 py-1 rounded text-xs font-bold text-white flex items-center gap-1">
                        <Play className="w-3 h-3 text-amber-400" /> {Math.round(video.duration)}s
                    </div>
                </div>
            )}
        </div>
    );
}
