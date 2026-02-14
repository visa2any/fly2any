'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Upload, Check, Camera, Image as ImageIcon, Loader2 } from 'lucide-react';

export default function MobileUploadPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session');
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Invalid Session</h1>
            <p className="text-white/50">Please scan the QR code again.</p>
        </div>
      </div>
    );
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError('');
    setSuccess(false);

    try {
        const promises = Array.from(files).map(async (file) => {
            const formData = new FormData();
            formData.append('file', file);
            
            const res = await fetch(`/api/mobile-upload/${sessionId}`, {
                method: 'POST',
                body: formData,
            });
            
            if (!res.ok) throw new Error('Upload failed');
        });

        await Promise.all(promises);
        setSuccess(true);
        // Reset success message after 3s so they can add more
        setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
        setError('Failed to upload some photos. Please try again.');
    } finally {
        setUploading(false);
        // Reset input
        e.target.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col">
      <header className="p-6 border-b border-white/10 flex items-center gap-3">
         <div className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center text-black font-bold">
            <Camera className="w-5 h-5" />
         </div>
         <h1 className="font-bold text-lg">Photo Handoff</h1>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-8">
         <div className="relative">
             <div className="w-32 h-32 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
                 {uploading ? (
                     <Loader2 className="w-12 h-12 text-amber-400 animate-spin" />
                 ) : success ? (
                     <Check className="w-12 h-12 text-emerald-400" />
                 ) : (
                     <Upload className="w-12 h-12 text-white/50" />
                 )}
             </div>
             
             {success && (
                 <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-max px-4 py-2 bg-emerald-500 rounded-full text-black font-bold text-sm animate-in fade-in slide-in-from-bottom-2">
                     Photos Sent!
                 </div>
             )}
         </div>

         <div className="space-y-2">
             <h2 className="text-2xl font-bold">Upload to Desktop</h2>
             <p className="text-white/50 max-w-xs mx-auto">
                 Take photos or select from your library to instantly see them on your computer screen.
             </p>
         </div>

         {error && <p className="text-red-400 bg-red-400/10 px-4 py-2 rounded-lg">{error}</p>}
      </main>

      <footer className="p-6 grid grid-cols-2 gap-4 pb-12">
          <label className="flex flex-col items-center gap-2 p-6 rounded-2xl bg-white/10 active:scale-95 transition-all text-center cursor-pointer">
              <Camera className="w-8 h-8 text-amber-400" />
              <span className="font-bold text-sm">Take Photo</span>
              <input type="file" accept="image/*" capture="environment" onChange={handleFileChange} className="hidden" />
          </label>
          
          <label className="flex flex-col items-center gap-2 p-6 rounded-2xl bg-white/10 active:scale-95 transition-all text-center cursor-pointer">
              <ImageIcon className="w-8 h-8 text-blue-400" />
              <span className="font-bold text-sm">Library</span>
              <input type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
          </label>
      </footer>
    </div>
  );
}
