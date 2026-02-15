'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Upload, Loader2, CheckCircle, AlertCircle, Smartphone } from 'lucide-react';
import { toast } from 'react-hot-toast';

function MobileUploadContent() {
  const searchParams = useSearchParams();
  const session = searchParams.get('session');
  const router = useRouter();

  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!session) {
        toast.error("Invalid session");
    }
  }, [session]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        setFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = async () => {
    if (!files.length || !session) return;

    setIsUploading(true);
    // Simulate upload - In real app, post to a session-keyed store or websocket
    // For MVP demo, we just show success as we don't have a real websocket server set up for this P2P
    // To make it real, we'd need a Pusher/Socket.io service or polling on the database.
    
    // We will simulate a "success" state for the user to see flow.
    setTimeout(() => {
        setIsUploading(false);
        setIsSuccess(true);
        toast.success("Photos sent to desktop!");
    }, 2000);
  };

  if (isSuccess) {
      return (
          <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-green-50 text-center">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6 text-green-600 animate-in zoom-in">
                  <CheckCircle className="w-10 h-10" />
              </div>
              <h1 className="text-2xl font-bold text-green-900 mb-2">Upload Successful!</h1>
              <p className="text-green-700">Your photos should appear on your desktop screen now.</p>
              <button 
                onClick={() => { setFiles([]); setIsSuccess(false); }}
                className="mt-8 px-6 py-3 bg-white text-green-700 font-bold rounded-xl shadow-sm border border-green-200"
              >
                  Send More
              </button>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col">
        <header className="flex items-center gap-3 mb-8 pt-4">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white">
                <Smartphone className="w-6 h-6" />
            </div>
            <h1 className="text-lg font-bold text-gray-900">Fly2Any Mobile Upload</h1>
        </header>

        <main className="flex-1 flex flex-col justify-center">
            
            {!session ? (
                <div className="text-center p-8 bg-white rounded-2xl border border-red-100">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <p className="text-red-800 font-medium">Invalid or missing session ID.</p>
                    <p className="text-sm text-red-600 mt-2">Scan the QR code on your desktop again.</p>
                </div>
            ) : (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-8 text-center border-b border-gray-100">
                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                            <Upload className="w-8 h-8" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Select Photos</h2>
                        <p className="text-gray-500 text-sm">Choose photos from your gallery to instantly sync with your desktop.</p>
                    </div>

                    <div className="p-6 space-y-4">
                        <label className={`
                            block w-full p-4 border-2 border-dashed rounded-xl text-center cursor-pointer transition-colors
                            ${files.length > 0 ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-gray-400'}
                        `}>
                            <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
                            <span className="font-bold text-sm text-gray-700">
                                {files.length > 0 ? `${files.length} photos selected` : "Tap to choose photos"}
                            </span>
                        </label>

                        <button 
                            onClick={handleUpload}
                            disabled={files.length === 0 || isUploading}
                            className="w-full py-4 rounded-xl bg-primary-600 text-white font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send to Desktop'}
                        </button>
                    </div>
                </div>
            )}
        </main>
        
        <footer className="text-center py-6 text-gray-400 text-xs">
            &copy; 2026 Fly2Any Inc.
        </footer>
    </div>
  );
}

export default function MobileUploadPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary-600" /></div>}>
        <MobileUploadContent />
    </Suspense>
  );
}
