import { useState, useCallback, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Upload, X, Star, Smartphone, Tag, AlertCircle, ScanLine, Loader2, Crop, RotateCcw, Wand2, Sparkles } from 'lucide-react';
import { ImageCategory } from '@/lib/properties/types';
import QRCode from 'qrcode';
import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';
import { useImageProcessor } from '../hooks/useImageProcessor';

// AI Tag to Category Mapping
const TAG_MAP: Record<string, ImageCategory> = {
  'studio couch': 'room', 'pillow': 'room', 'quilt': 'room', 'four-poster': 'room', 'bedroom': 'room',
  'tub': 'bathroom', 'medicine chest': 'bathroom', 'shower': 'bathroom', 'toilet seat': 'bathroom', 'washbasin': 'bathroom', 'soap dispenser': 'bathroom',
  'monitor': 'general', 'screen': 'general', 'television': 'general', 'desk': 'general', 'library': 'general', 'bookcase': 'general',
  'espresso': 'food', 'microwave': 'food', 'refrigerator': 'food', 'stove': 'food', 'washer': 'food', 'toaster': 'food', 'dining table': 'food',
  'swimming pool': 'pool',
  'patio': 'exterior', 'lakeside': 'exterior', 'seashore': 'exterior', 'greenhouse': 'exterior', 'palace': 'exterior', 'castle': 'exterior'
};

const determineCategory = (tags: string[]): ImageCategory => {
    for (const tag of tags) {
        if (TAG_MAP[tag]) return TAG_MAP[tag];
    }
    return 'general';
};

interface PhotoData {
  file?: File;
  url: string;
  caption: string;
  category: ImageCategory;
  isPrimary: boolean;
  tags?: string[];
  rotation?: number;
}

interface PhotoUploaderProps {
  photos: PhotoData[];
  onChange: (photos: PhotoData[]) => void;
}

const CATEGORIES: { value: ImageCategory; label: string }[] = [
  { value: 'general', label: 'General' },
  { value: 'exterior', label: 'Exterior' },
  { value: 'lobby', label: 'Lobby' },
  { value: 'room', label: 'Bedroom' },
  { value: 'bathroom', label: 'Bathroom' },
  { value: 'amenity', label: 'Amenity' },
  { value: 'food', label: 'Dining' },
  { value: 'pool', label: 'Pool' },
  { value: 'view', label: 'View' },
];

export function PhotoUploader({ photos, onChange }: PhotoUploaderProps) {
  const [dragOver, setDragOver] = useState(false);
  
  // Mobile Upload State
  const [showQR, setShowQR] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [pollInterval, setPollInterval] = useState<NodeJS.Timeout | null>(null);

  // Load MobileNet model
  const [model, setModel] = useState<mobilenet.MobileNet | null>(null);
  useEffect(() => {
    async function loadModel() {
      try {
          await tf.ready();
          const loadedModel = await mobilenet.load();
          setModel(loadedModel);
          console.log('MobileNet model loaded');
      } catch (e) {
          console.error('Failed to load TFJS model', e);
      }
    }
    loadModel();
  }, []);

  const classifyImage = async (imgElement: HTMLImageElement): Promise<string[]> => {
      if (!model) return [];
      try {
          const predictions = await model.classify(imgElement);
          // Filter relevant tags (simple heuristic)
          return predictions.filter(p => p.probability > 0.05).map(p => p.className.split(',')[0]);
      } catch (e) {
          console.error('Classification failed', e);
          return [];
      }
  };

  const uploadFile = async (file: File): Promise<string> => {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data.url;
  };

  const { processImage } = useImageProcessor();

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files);

    // 1. Create local previews first for immediate UI feedback
    const newPhotosInProgress = newFiles.map((file, idx) => ({
      file,
      url: URL.createObjectURL(file),
      caption: '',
      category: 'general' as ImageCategory,
      isPrimary: photos.length === 0 && idx === 0,
      tags: [],
      rotation: 0,
      uploading: true // New flag to track status
    }));

    // Add to state immediately
    const updatedPhotos = [...photos, ...newPhotosInProgress];
    onChange(updatedPhotos);

    // 2. Process each file (Image Opt -> Upload -> AI Classify)
    newPhotosInProgress.forEach(async (photoItem, index) => {
        // Calculate the actual index in the state array
        // We need to be careful with closure staleness here. 
        // Ideally we'd use a functional update for all state changes or IDs.
        
        try {
            // A. Optimize Image (Client-side Resize, Filter, Watermark, WebP)
            console.log('Optimizing image...');
            const processedFile = await processImage(photoItem.file);
            console.log(`Optimized: ${photoItem.file.size} -> ${processedFile.size} bytes`);

            // B. Upload Processed File
            const remoteUrl = await uploadFile(processedFile);
            
            // C. AI Classify (use the processed file or original? Processed is fine if size is decent)
            let tags: string[] = [];
            let detectedCategory: ImageCategory = 'general';

            if (model) {
                const img = document.createElement('img');
                img.crossOrigin = "anonymous";
                img.src = remoteUrl; // Use remote URL to ensure we classify what we stored
                img.width = 224; 
                img.height = 224;
                await new Promise((resolve, reject) => {
                    img.onload = resolve;
                    img.onerror = reject;
                });
                tags = await classifyImage(img);
                detectedCategory = determineCategory(tags);
            }

            // D. Update State
            onChange(prev => {
                const clones = [...prev];
                const targetIdx = clones.findIndex(p => p.url === photoItem.url);
                if (targetIdx !== -1) {
                    clones[targetIdx] = {
                        ...clones[targetIdx],
                        url: remoteUrl,
                        tags: [...(clones[targetIdx].tags || []), ...tags],
                        category: detectedCategory !== 'general' ? detectedCategory : clones[targetIdx].category,
                        // @ts-ignore
                        uploading: false
                    };
                }
                return clones;
            });

        } catch (err) {
            console.error('Processing/Upload failed', err);
             onChange(prev => {
                const clones = [...prev];
                const targetIdx = clones.findIndex(p => p.url === photoItem.url);
                if (targetIdx !== -1) {
                    // @ts-ignore
                    clones[targetIdx].uploading = false; 
                }
                return clones;
            });
        }
    });

  }, [photos, onChange, model, processImage]);

  // Mobile Upload Logic
  const startMobileUpload = async () => {
      setShowQR(true);
      if (sessionId) return; // Already started

      try {
          // 1. Create Session
          const res = await fetch('/api/mobile-upload/session', { method: 'POST' });
          const data = await res.json();
          setSessionId(data.sessionId);
          
          // 2. Generate QR
          const mobileUrl = `${window.location.origin}/list-your-property/upload-mobile?session=${data.sessionId}`;
          const qrUrl = await QRCode.toDataURL(mobileUrl);
          setQrDataUrl(qrUrl);

          // 3. Start Polling
          const interval = setInterval(async () => {
              try {
                  const pollRes = await fetch(`/api/mobile-upload/${data.sessionId}`);
                  if (pollRes.ok) {
                      const pollData = await pollRes.json();
                      if (pollData.photos && pollData.photos.length > 0) {
                          // Filter out photos we already have (by URL)
                          // Note: In a real app we'd track IDs. Here relying on unique URL per upload
                          const newRemotePhotos = pollData.photos.filter((rp: any) => !photosRef.current.some(p => p.url === rp.url));
                          
                          if (newRemotePhotos.length > 0) {
                             const convertedPhotos = newRemotePhotos.map((rp: any, idx: number) => ({
                                 url: rp.url,
                                 caption: '',
                                 category: 'general',
                                 isPrimary: photosRef.current.length === 0 && idx === 0,
                                 tags: mockAIAnalyze(rp.url),
                                 rotation: 0
                             }));
                             
                             onChange([...photosRef.current, ...convertedPhotos]);
                      }
                  }
              } catch (e) {
                  console.error("Polling error", e);
              }
          }
      }, 3000);
          setPollInterval(interval);

      } catch (e) {
          console.error("Failed to start mobile upload", e);
      }
  };
  
  // Clean up polling on unmount
  useEffect(() => {
      return () => {
          if (pollInterval) clearInterval(pollInterval);
      };
  }, [pollInterval]);

  // Ref to access latest photos in polling closure
  const photosRef = useRef(photos);
  useEffect(() => { photosRef.current = photos; }, [photos]);

  // Effective polling effect (Alternative approach if initial set fails)
  // We are relying on the setInterval closure above referencing `photosRef` now
  // keeping this logic here just in case, but cleaned up
  
  const rotatePhoto = (index: number) => {
      const newPhotos = [...photos];
      newPhotos[index].rotation = (newPhotos[index].rotation || 0) + 90;
      onChange(newPhotos);
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    if (photos[index].isPrimary && newPhotos.length > 0) {
      newPhotos[0].isPrimary = true;
    }
    onChange(newPhotos);
  };

  const updatePhoto = (index: number, updates: Partial<PhotoData>) => {
    const newPhotos = [...photos];
    newPhotos[index] = { ...newPhotos[index], ...updates };
    onChange(newPhotos);
  };

  const setPrimary = (index: number) => {
    const newPhotos = photos.map((p, i) => ({ ...p, isPrimary: i === index }));
    onChange(newPhotos);
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        {/* Drag Drop Zone */}
        <div 
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
            className={`flex-1 relative p-12 rounded-2xl border-2 border-dashed transition-all text-center group cursor-pointer ${
                dragOver ? 'border-amber-400 bg-amber-400/10' : 'border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/40'
            }`}
        >
            <input 
                type="file" 
                multiple 
                accept="image/*" 
                onChange={(e) => handleFiles(e.target.files)} 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
            />
            <div className="pointer-events-none">
                <div className={`w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4 transition-transform group-hover:scale-110 ${dragOver ? 'text-amber-400' : 'text-white/50'}`}>
                <Upload className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Upload Files</h3>
                <p className="text-white/30 text-xs">JPG, PNG, WEBP up to 10MB</p>
            </div>
        </div>

        {/* Mobile Connect Button */}
        <div 
             onClick={() => setShowQR(!showQR)}
             className={`w-1/3 rounded-2xl border-2 flex flex-col items-center justify-center cursor-pointer transition-all ${
                 showQR ? 'border-amber-400 bg-amber-400/10' : 'border-white/10 bg-white/5 hover:bg-white/10'
             }`}
        >
           {!showQR ? (
               <div className="text-center" onClick={startMobileUpload}>
                   <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4 text-white/50">
                       <Smartphone className="w-8 h-8" />
                   </div>
                   <h3 className="text-xl font-bold text-white mb-2">Upload from Phone</h3>
                   <p className="text-white/30 text-xs">Scan QR to connect</p>
               </div>
           ) : (
               <div className="text-center p-4">
                   {qrDataUrl ? (
                         <div className="space-y-4 animate-in zoom-in">
                             <div className="bg-white p-2 rounded-xl inline-block">
                                 <Image src={qrDataUrl} width={150} height={150} alt="Scan QR" />
                             </div>
                             <div>
                                 <div className="text-white font-bold text-sm">Scan with your camera</div>
                                 <div className="text-white/50 text-xs mt-1">Listening for photos...</div>
                             </div>
                         </div>
                   ) : (
                        <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
                   )}
               </div>
           )}
        </div>
      </div>

      {photos.length === 0 && (
         <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-500/10 text-blue-300 border border-blue-500/20 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            High quality photos increase bookings by 40%. Add at least 5 photos.
         </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
         {photos.map((photo, idx) => (
            <div key={idx} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden group">
               <div className="relative aspect-video bg-black/50">
                  <Image 
                      src={photo.url} 
                      alt="Property" 
                      fill 
                      className="object-cover transition-transform duration-500 ease-in-out" 
                      style={{ transform: `rotate(${photo.rotation || 0}deg)` }}
                  />
                  
                  {/* AI Tags Overlay */}
                  {photo.tags && photo.tags.length > 0 && (
                      <div className="absolute bottom-2 left-2 flex flex-wrap gap-1 max-w-[90%]">
                          {photo.tags.slice(0, 4).map(tag => (
                              <span key={tag} className="px-1.5 py-0.5 rounded bg-black/60 backdrop-blur text-[9px] text-white font-bold flex items-center gap-1 border border-white/10">
                                  <Wand2 className="w-2 h-2 text-violet-300" /> {tag}
                              </span>
                          ))}
                      </div>
                  )}

                  {/* Actions Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                     <button onClick={() => setPrimary(idx)} className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 ${photo.isPrimary ? 'bg-amber-400 text-black' : 'bg-white/20 text-white hover:bg-white/40'}`}>
                        <Star className={`w-3 h-3 ${photo.isPrimary ? 'fill-black' : ''}`} /> {photo.isPrimary ? 'Cover' : 'Set Cover'}
                     </button>
                     <button onClick={() => rotatePhoto(idx)} className="p-2 rounded-lg bg-white/20 text-white hover:bg-white/40" title="Rotate">
                        <RotateCcw className="w-4 h-4" />
                     </button>
                     <button onClick={() => removePhoto(idx)} className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/40">
                        <X className="w-4 h-4" />
                     </button>
                  </div>
                  
                  {/* Uploading Spinner */}
                  {/* @ts-ignore */}
                  {photo.uploading && (
                      <div className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 backdrop-blur">
                          <Loader2 className="w-3 h-3 text-white animate-spin" />
                      </div>
                  )}

                  {photo.isPrimary && (
                     <div className="absolute top-2 left-2 px-2 py-1 rounded bg-amber-400 text-black text-[10px] font-bold uppercase tracking-wider">
                        Cover Photo
                     </div>
                  )}
               </div>

               <div className="p-3 space-y-2">
                  <select 
                     value={photo.category}
                     onChange={(e) => updatePhoto(idx, { category: e.target.value as ImageCategory })}
                     className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white outline-none [&>option]:text-black"
                  >
                     {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                  <input 
                     type="text" 
                     value={photo.caption}
                     onChange={(e) => updatePhoto(idx, { caption: e.target.value })}
                     placeholder="Add a caption..."
                     className="w-full bg-transparent border-b border-white/10 px-0 py-1 text-sm text-white focus:border-white/50 outline-none"
                  />
               </div>
            </div>
         ))}
      </div>
    </div>
  );
}
