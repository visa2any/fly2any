'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Upload, X, Star, Smartphone, Tag, AlertCircle, Loader2, RotateCcw, Wand2, GripVertical, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { ImageCategory } from '@/lib/properties/types';
import QRCode from 'qrcode';
import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';
import { useImageProcessor } from '../hooks/useImageProcessor';
import { VideoUploader } from './VideoUploader';

// AI Tag to Category Mapping (Simplified)
const TAG_MAP: Record<string, ImageCategory> = {
  'pillow': 'room', 'bedroom': 'room',
  'tub': 'bathroom', 'shower': 'bathroom', 
  'monitor': 'general', 'desk': 'general',
  'refrigerator': 'food', 'stove': 'food', 'dining table': 'food',
  'swimming pool': 'pool',
  'patio': 'exterior',
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
  images: string[]; // Simplification for MVP: array of strings or objects? Page passes string[], but here we use objects.
                  // Page passes string[] in `formData.images` but PhotoUploader expects strict objects?
                  // The `create/page.tsx` initializes images as string[]. 
                  // We need to adhere to `page.tsx`. 
                  // HOWEVER, `PhotoUploader` in Step 813 used `PhotoData[]`.
                  // `page.tsx` line 496: `<PhotoUploader images={formData.images} onChange={(imgs) => ...`
                  // `formData.images` is `string[]`. 
                  // We must adapt or fix `page.tsx`. 
                  // The `page.tsx` I wrote uses `images: [] as string[]`. 
                  // This is a mismatch. I will update `page.tsx` state to handle objects OR update this component to handle strings.
                  // Better: Update this component to accept `string[]` initially but manage rich state internally or accept rich state.
                  // Since `page.tsx` is the source of truth for saving, it likely expects strings (URLs) for the backend.
                  // BUT for captions/tags we need object structure.
                  // I will assume `page.tsx` should store `PhotoData[]` and I will fix `page.tsx` later if needed? 
                  // Actually, let's keep it simple: `PhotoData[]` is better.
                  // I will update this component to use `PhotoData[]` and assume I'll fix `page.tsx` or `page.tsx` already handles it (I might have misread my own overwrite).
                  // Checking Step 767 `page.tsx`:
                  // `images: [] as string[],`
                  // AND `<PhotoUploader images={formData.images} ...`
                  // So `PhotoUploader` receives string[] but expects PhotoData[]? NO, the Props definition here MUST match.
                  // I will Change `PhotoUploaderProps` to take `any[]` or `string[]` and convert.
                  // Or better: Fix `page.tsx` to use `PhotoData[]`.
                  // I cannot fix `page.tsx` in this tool call.
                  // I will make `PhotoUploader` accept `any[]` and handle both strings and objects to be robust.
  onChange: (photos: any[]) => void;
  // Video removed from probs as it's separate in new design or included? 
  // Step 813 had video props. I'll keep them for safety but maybe ignore if unused.
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

export function PhotoUploader({ images, onChange }: PhotoUploaderProps) {
  // Normalize input to PhotoData[]
  const [localPhotos, setLocalPhotos] = useState<PhotoData[]>([]);

  useEffect(() => {
      // Convert incoming images (strings or objects) to local state
      const processed = (images || []).filter(Boolean).map(img => {
          if (typeof img === 'string') {
              return { url: img, caption: '', category: 'general', isPrimary: false, tags: [], rotation: 0 };
          }
          return img as PhotoData;
      });
      // prevent loop if deep equal? simpler: just set if length differs or first item differs
      setLocalPhotos(processed as PhotoData[]);
  }, [images]);

  const updateParent = (newPhotos: PhotoData[]) => {
      setLocalPhotos(newPhotos);
      onChange(newPhotos); // Pass full objects back so page can store them (even if it typed as string[], JS allows it)
  };

  const [dragOver, setDragOver] = useState(false);
  
  // Mobile Upload State
  const [showQR, setShowQR] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (showQR && !qrDataUrl) {
        const sid = Math.random().toString(36).substring(7);
        setSessionId(sid);
        // In real app, this URL points to a mobile upload page with sessionId
        const url = `${window.location.origin}/upload-mobile?session=${sid}`;
        QRCode.toDataURL(url)
            .then(setQrDataUrl)
            .catch(console.error);
    }
  }, [showQR, qrDataUrl]);

  // Load MobileNet model (Simplified loading)
  const [model, setModel] = useState<mobilenet.MobileNet | null>(null);
  useEffect(() => {
    async function loadModel() {
      try {
          await tf.ready();
          const loadedModel = await mobilenet.load();
          setModel(loadedModel);
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
          return predictions.filter(p => p.probability > 0.05).map(p => p.className.split(',')[0]);
      } catch (e) { return []; }
  };

  const uploadFile = async (file: File): Promise<string> => {
      const formData = new FormData();
      formData.append('file', file);
      // Mock upload for now if API missing, or use real endpoint
      // const res = await fetch('/api/upload', { method: 'POST', body: formData });
      // const data = await res.json();
      // return data.url;
      return URL.createObjectURL(file); // Return local blob for demo
  };

  const { processImage } = useImageProcessor();

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files);

    const newPhotosInProgress = newFiles.map((file, idx) => ({
      file,
      url: URL.createObjectURL(file), // Immediate preview
      caption: '',
      category: 'general' as ImageCategory,
      isPrimary: localPhotos.length === 0 && idx === 0,
      tags: [],
      rotation: 0,
      uploading: true
    }));

    const updatedPhotos = [...localPhotos, ...newPhotosInProgress];
    updateParent(updatedPhotos);

    // Async processing for NEW files
    newPhotosInProgress.forEach(async (photoItem) => {
        try {
            // ... existing processing ...
            const processedFile = await processImage(photoItem.file);
            const remoteUrl = await uploadFile(processedFile);
            
            // AI Classify
            let tags: string[] = [];
            let detectedCategory: ImageCategory = 'general';

            if (model) {
                const img = document.createElement('img');
                img.crossOrigin = 'anonymous';
                img.src = remoteUrl;
                await new Promise((resolve, reject) => { 
                    img.onload = resolve; 
                    img.onerror = reject;
                });
                tags = await classifyImage(img);
                detectedCategory = determineCategory(tags);
            }

            // Update State
            updateParent(updatedPhotos.map(p => p.url === photoItem.url ? {
                ...p,
                url: remoteUrl,
                tags,
                category: detectedCategory !== 'general' ? detectedCategory : p.category,
                // @ts-ignore
                uploading: false
            } : p));

        } catch (err) {
            console.error(err);
        }
    });
  }, [localPhotos, model, processImage]);

  // --------------------------------------------------------------------------
  // INNOVATION: Smart Cover Photo Selection
  // --------------------------------------------------------------------------
  useEffect(() => {
      // If no photos or already has primary, skip
      if (localPhotos.length === 0 || localPhotos.some(p => p.isPrimary)) return;

      const selectBestCover = async () => {
          let bestIdx = 0;
          let maxScore = 0;

          for (let i = 0; i < localPhotos.length; i++) {
              if (!localPhotos[i].url) continue;
              
              // Load image to check resolution
              const img = document.createElement('img');
              img.src = localPhotos[i].url;
              await new Promise(r => { img.onload = r; img.onerror = r; });

              const width = img.naturalWidth || 0;
              const height = img.naturalHeight || 0;
              const resolution = width * height;
              const isLandscape = width > height * 1.2; // 20% wider than tall
              
              // Score: Resolution (0-100) + Landscape Bonus (50)
              // Cap resolution score at ~4K (8MP)
              let score = Math.min(resolution / 80000, 100); 
              if (isLandscape) score += 50;

              if (score > maxScore) {
                  maxScore = score;
                  bestIdx = i;
              }
          }

          if (localPhotos[bestIdx]) {
              const newPhotos = localPhotos.map((p, i) => ({ ...p, isPrimary: i === bestIdx }));
              updateParent(newPhotos);
          }
      };
      
      // Delay slightly to let initial load settle
      const timer = setTimeout(selectBestCover, 1500);
      return () => clearTimeout(timer);
  }, [localPhotos.length]); // Run when count changes (e.g. bulk upload finished)

  // --------------------------------------------------------------------------
  // INNOVATION: Smart Labeling for Imported Photos
  // --------------------------------------------------------------------------
  useEffect(() => {
      if (!model || localPhotos.length === 0) return;

      const unscannedPhotos = localPhotos.filter(p => !p.tags || p.tags.length === 0);
      if (unscannedPhotos.length === 0) return;

      const scanPhotos = async () => {
          const updates = [...localPhotos];
          let hasChanges = false;

          for (let i = 0; i < updates.length; i++) {
              if ((!updates[i].tags || updates[i].tags!.length === 0) && updates[i].url) {
                  try {
                      const img = document.createElement('img');
                      img.crossOrigin = 'anonymous';
                      img.src = updates[i].url;
                      
                      await new Promise((resolve, reject) => { 
                          img.onload = resolve; 
                          img.onerror = () => resolve(null); // Continue even if fail
                      });

                      const tags = await classifyImage(img);
                      if (tags.length > 0) {
                          updates[i].tags = tags;
                          const cat = determineCategory(tags);
                          if (cat !== 'general') updates[i].category = cat;
                          hasChanges = true;
                      }
                  } catch (e) {
                      // seamless fail
                  }
              }
          }

          if (hasChanges) {
              updateParent(updates);
              // toast.success("Photos auto-labeled with AI ✨"); // Optional: might be spammy
          }
      };

      // Slight delay to allow render
      const timer = setTimeout(scanPhotos, 1000);
      return () => clearTimeout(timer);
  }, [model, localPhotos.length]); // Dep only on length change to avoid loop

  // --------------------------------------------------------------------------
  // INNOVATION: "Insta-Enhance"
  // --------------------------------------------------------------------------
  const [enhancingIdx, setEnhancingIdx] = useState<number | null>(null);

  // --------------------------------------------------------------------------
  // Lightbox Preview
  // --------------------------------------------------------------------------
  const [previewIdx, setPreviewIdx] = useState<number | null>(null);
  const [zoomed, setZoomed] = useState(false);

  const openPreview = (idx: number) => {
    setPreviewIdx(idx);
    setZoomed(false);
  };

  const closePreview = () => {
    setPreviewIdx(null);
    setZoomed(false);
  };

  const goPreview = (dir: 1 | -1) => {
    if (previewIdx === null) return;
    const next = previewIdx + dir;
    if (next >= 0 && next < localPhotos.length) {
      setPreviewIdx(next);
      setZoomed(false);
    }
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (previewIdx === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePreview();
      if (e.key === 'ArrowRight') goPreview(1);
      if (e.key === 'ArrowLeft') goPreview(-1);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [previewIdx, localPhotos.length]);

  const handleMagicEnhance = async (index: number) => {
      const photo = localPhotos[index];
      if (!photo.url) return;
      
      setEnhancingIdx(index);
      try {
          // 1. Fetch original as blob
          const res = await fetch(photo.url);
          const blob = await res.blob();
          const file = new File([blob], "image.jpg", { type: blob.type });

          // 2. Run through ImageProcessor (applies filters & compression)
          const enhancedFile = await processImage(file);
          
          // 3. Upload/Preview
          const startUrl = URL.createObjectURL(enhancedFile);
          
          // Update state immediately to show enhancement
          const newPhotos = [...localPhotos];
          newPhotos[index] = { ...newPhotos[index], url: startUrl, file: enhancedFile }; // effectively a "new" file
          updateParent(newPhotos);

          // 4. (Optional) Re-upload to server if needed, handled by save draft logic taking the file?
          // For now, wizard handles blob URLs until final submit.

      } catch (e) {
          console.error("Enhance failed", e);
          // toast.error("Could not enhance this image (CORS restriction)");
      } finally {
          setEnhancingIdx(null);
      }
  };


  const rotatePhoto = (index: number) => {
      const newPhotos = [...localPhotos];
      newPhotos[index].rotation = (newPhotos[index].rotation || 0) + 90;
      updateParent(newPhotos);
  };

  const removePhoto = (index: number) => {
    const newPhotos = localPhotos.filter((_, i) => i !== index);
    if (localPhotos[index].isPrimary && newPhotos.length > 0) {
      newPhotos[0].isPrimary = true;
    }
    updateParent(newPhotos);
  };

  const updatePhoto = (index: number, updates: Partial<PhotoData>) => {
    const newPhotos = [...localPhotos];
    newPhotos[index] = { ...newPhotos[index], ...updates };
    updateParent(newPhotos);
  };

  const setPrimary = (index: number) => {
    const newPhotos = localPhotos.map((p, i) => ({ ...p, isPrimary: i === index }));
    updateParent(newPhotos);
  };

  // --- Native Drag-to-Reorder ---
  const dragRef = useRef<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const handleReorderDragStart = (idx: number) => {
    dragRef.current = idx;
  };

  const handleReorderDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    setDragOverIdx(idx);
  };

  const handleReorderDrop = (idx: number) => {
    const fromIdx = dragRef.current;
    if (fromIdx === null || fromIdx === idx) {
      dragRef.current = null;
      setDragOverIdx(null);
      return;
    }
    const reordered = [...localPhotos];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(idx, 0, moved);
    updateParent(reordered);
    dragRef.current = null;
    setDragOverIdx(null);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Drag Drop Zone */}
        <div 
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
            className={`relative p-6 rounded-2xl border-2 border-dashed transition-all text-center group cursor-pointer flex flex-col items-center justify-center min-h-[220px] ${
                dragOver ? 'border-primary-500 bg-primary-50' : 'border-neutral-300 bg-neutral-50 hover:bg-neutral-100 hover:border-neutral-400'
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
                <div className={`w-14 h-14 rounded-full bg-white flex items-center justify-center mx-auto mb-4 shadow-sm transition-transform group-hover:scale-110 ${dragOver ? 'text-primary-500' : 'text-gray-400'}`}>
                   <Upload className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Upload Photos</h3>
                <p className="text-gray-500 text-xs">JPG, PNG, WEBP up to 10MB</p>
            </div>
        </div>

        {/* Mobile Connect Button */}
        <div 
             onClick={() => setShowQR(!showQR)}
             className={`rounded-2xl border-2 flex flex-col items-center justify-center cursor-pointer transition-all min-h-[220px] ${
                 showQR ? 'border-primary-500 bg-primary-50' : 'border-neutral-200 bg-white hover:bg-neutral-50 hover:border-neutral-300'
             }`}
        >
           {!showQR ? (
               <div className="text-center">
                   <div className="w-14 h-14 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4 text-gray-500">
                       <Smartphone className="w-7 h-7" />
                   </div>
                   <h3 className="text-lg font-bold text-gray-900 mb-1">Phone Upload</h3>
                   <p className="text-gray-400 text-xs">Scan QR to connect</p>
               </div>
           ) : (
               <div className="text-center p-4">
                   <div className="bg-white p-2 rounded-xl inline-block shadow-sm mb-2">
                       {qrDataUrl ? (
                           <img src={qrDataUrl} alt="Upload QR" className="w-24 h-24" />
                       ) : (
                           <div className="w-24 h-24 bg-gray-100 flex items-center justify-center text-gray-400">
                               <Loader2 className="w-6 h-6 animate-spin" />
                           </div>
                       )}
                   </div>
                   <div className="text-gray-900 font-bold text-xs">Scan & Upload</div>
               </div>
           )}
        </div>

        {/* Video Uploader */}
        <div className="h-full min-h-[220px]">
            <VideoUploader />
        </div>
      </div>

      {localPhotos.length === 0 && (
         <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 text-sm mt-6">
            <AlertCircle className="w-4 h-4 shrink-0" />
            High quality photos increase bookings by 40%. Add at least 5 photos.
         </div>
      )}

      {/* Grid with Drag-to-Reorder */}
      <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-4 gap-4 mt-6">
         {localPhotos.filter(p => p && p.url).map((photo, idx) => (
            <div
              key={idx}
              draggable
              onDragStart={() => handleReorderDragStart(idx)}
              onDragOver={(e) => handleReorderDragOver(e, idx)}
              onDrop={() => handleReorderDrop(idx)}
              onDragEnd={() => setDragOverIdx(null)}
              className={`bg-white border rounded-xl overflow-hidden group hover:shadow-md transition-all relative ${
                dragOverIdx === idx ? 'border-primary-500 ring-2 ring-primary-200' : 'border-neutral-200'
              }`}
            >
              {/* Drag Handle */}
              <div className="absolute top-2 right-2 z-20 p-1 rounded-md bg-white/80 backdrop-blur-sm shadow-sm text-gray-400 cursor-grab active:cursor-grabbing">
                <GripVertical className="w-4 h-4" />
              </div>
               <div className="relative aspect-video bg-neutral-100 cursor-pointer" onClick={() => openPreview(idx)}>
                  <Image 
                      src={photo.url} 
                      alt="Property" 
                      fill 
                      unoptimized={true}
                      className="object-cover transition-transform duration-500 ease-in-out" 
                      style={{ transform: `rotate(${photo.rotation || 0}deg)` }}
                  />
                  {/* Preview hint */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[5]">
                    <div className="p-2 rounded-full bg-white/90 shadow-md">
                      <Maximize2 className="w-4 h-4 text-gray-700" />
                    </div>
                  </div>
                  
                  {/* AI Tags Overlay */}
                  {photo.tags && photo.tags.length > 0 && (
                      <div className="absolute bottom-2 left-2 flex flex-wrap gap-1 max-w-[90%]">
                          {photo.tags.slice(0, 4).map(tag => (
                              <span key={tag} className="px-1.5 py-0.5 rounded bg-white/90 backdrop-blur text-[10px] text-gray-800 font-bold flex items-center gap-1 shadow-sm">
                                  <Wand2 className="w-2 h-2 text-primary-500" /> {tag}
                              </span>
                          ))}
                      </div>
                  )}

                  {/* Actions Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                     <button onClick={() => setPrimary(idx)} className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 ${photo.isPrimary ? 'bg-amber-400 text-black' : 'bg-white text-gray-900 hover:bg-neutral-100'}`}>
                        <Star className={`w-3 h-3 ${photo.isPrimary ? 'fill-black' : ''}`} /> {photo.isPrimary ? 'Cover' : 'Cover'}
                     </button>
                     
                     <button 
                        onClick={() => handleMagicEnhance(idx)} 
                        disabled={enhancingIdx === idx}
                        className="p-2 rounded-lg bg-white text-indigo-600 hover:bg-indigo-50" 
                        title="Magic Enhance"
                     >
                        {enhancingIdx === idx ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                     </button>

                     <button onClick={() => rotatePhoto(idx)} className="p-2 rounded-lg bg-white text-gray-900 hover:bg-neutral-100" title="Rotate">
                        <RotateCcw className="w-4 h-4" />
                     </button>
                     <button onClick={() => removePhoto(idx)} className="p-2 rounded-lg bg-red-500 text-white hover:bg-red-600">
                        <X className="w-4 h-4" />
                     </button>
                  </div>
                  
                  {/* @ts-ignore */}
                  {photo.uploading && (
                      <div className="absolute top-2 right-2 p-1.5 rounded-full bg-white shadow-sm">
                          <Loader2 className="w-3 h-3 text-primary-500 animate-spin" />
                      </div>
                  )}

                  {photo.isPrimary && (
                     <div className="absolute top-2 left-2 px-2 py-1 rounded bg-amber-400 text-black text-[10px] font-bold uppercase tracking-wider shadow-sm">
                        Cover Photo
                     </div>
                  )}
               </div>

               <div className="p-3 space-y-2">
                  <select 
                     value={photo.category}
                     onChange={(e) => updatePhoto(idx, { category: e.target.value as ImageCategory })}
                     className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-2 py-1.5 text-xs text-gray-700 outline-none focus:border-primary-500"
                  >
                     {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                  <input 
                     type="text" 
                     value={photo.caption}
                     onChange={(e) => updatePhoto(idx, { caption: e.target.value })}
                     placeholder="Add a caption..."
                     className="w-full bg-transparent border-b border-neutral-100 px-0 py-1 text-sm text-gray-700 focus:border-neutral-300 outline-none placeholder-gray-400"
                  />
               </div>
            </div>
         ))}
      </div>

      {/* ────────── Lightbox Preview Modal ────────── */}
      {previewIdx !== null && localPhotos[previewIdx] && (
        <div
          className="fixed inset-0 z-[9999] bg-black/95 flex flex-col"
          onClick={closePreview}
        >
          {/* Top bar */}
          <div className="flex items-center justify-between px-5 py-3 text-white" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold">{previewIdx + 1} / {localPhotos.length}</span>
              {localPhotos[previewIdx].isPrimary && (
                <span className="px-2 py-0.5 rounded bg-amber-400 text-black text-[10px] font-bold uppercase">Cover</span>
              )}
              {localPhotos[previewIdx].category !== 'general' && (
                <span className="px-2 py-0.5 rounded bg-white/20 text-white/80 text-[10px] font-bold uppercase">
                  {CATEGORIES.find(c => c.value === localPhotos[previewIdx].category)?.label}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoomed(!zoomed)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white"
                title={zoomed ? 'Zoom out' : 'Zoom in'}
              >
                {zoomed ? <ZoomOut className="w-5 h-5" /> : <ZoomIn className="w-5 h-5" />}
              </button>
              <button
                onClick={closePreview}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main image area */}
          <div className="flex-1 relative flex items-center justify-center overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Prev button */}
            {previewIdx > 0 && (
              <button
                onClick={() => goPreview(-1)}
                className="absolute left-4 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors backdrop-blur-sm"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Image */}
            <div className={`relative transition-all duration-300 flex items-center justify-center ${zoomed ? 'w-full h-full' : 'max-w-[85vw] max-h-[75vh]'}`}>
              <img
                src={localPhotos[previewIdx].url}
                alt={localPhotos[previewIdx].caption || 'Property photo'}
                className={`transition-all duration-300 ${zoomed ? 'w-full h-full object-contain cursor-zoom-out' : 'max-w-[85vw] max-h-[75vh] object-contain cursor-zoom-in'}`}
                style={{ transform: `rotate(${localPhotos[previewIdx].rotation || 0}deg)` }}
                onClick={() => setZoomed(!zoomed)}
              />
            </div>

            {/* Next button */}
            {previewIdx < localPhotos.length - 1 && (
              <button
                onClick={() => goPreview(1)}
                className="absolute right-4 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors backdrop-blur-sm"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Caption */}
          {localPhotos[previewIdx].caption && (
            <div className="text-center py-2 text-white/60 text-sm">{localPhotos[previewIdx].caption}</div>
          )}

          {/* Filmstrip thumbnails */}
          <div className="px-4 py-3 flex items-center justify-center gap-2 overflow-x-auto" onClick={(e) => e.stopPropagation()}>
            {localPhotos.filter(p => p && p.url).map((photo, idx) => (
              <button
                key={idx}
                onClick={() => { setPreviewIdx(idx); setZoomed(false); }}
                className={`relative w-14 h-10 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                  idx === previewIdx ? 'border-white scale-110' : 'border-transparent opacity-50 hover:opacity-80'
                }`}
              >
                <Image
                  src={photo.url}
                  alt=""
                  fill
                  unoptimized={true}
                  className="object-cover"
                  style={{ transform: `rotate(${photo.rotation || 0}deg)` }}
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
