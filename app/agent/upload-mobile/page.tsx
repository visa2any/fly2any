'use client';

import { useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Camera, FileText, CheckCircle2, Upload, Loader2, AlertCircle, X } from 'lucide-react';
import Image from 'next/image';

type DocType = 'idDocument' | 'einLetter';

interface UploadedFile { url: string; name: string; }

function MobileUploadContent() {
  const params = useSearchParams();
  const sessionId = params?.get('session') ?? '';
  const fileRef = useRef<HTMLInputElement>(null);
  const [activeDoc, setActiveDoc] = useState<DocType | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [uploaded, setUploaded] = useState<Partial<Record<DocType, UploadedFile>>>({});

  const DOCS = [
    { key: 'idDocument' as DocType, label: 'Government-Issued ID', sub: "Driver's license, passport or state ID", icon: Camera, required: true },
    { key: 'einLetter' as DocType, label: 'EIN Letter', sub: 'IRS EIN confirmation letter (optional)', icon: FileText, required: false },
  ];

  const handleCapture = (docType: DocType) => {
    setActiveDoc(docType);
    setError('');
    fileRef.current?.click();
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !activeDoc || !sessionId) return;

    if (!['image/jpeg','image/png','image/webp','application/pdf'].includes(file.type)) {
      setError('Please upload a JPG, PNG, WebP or PDF file'); return;
    }
    if (file.size > 10 * 1024 * 1024) { setError('File too large. Max 10MB.'); return; }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('type', activeDoc === 'idDocument' ? 'agent_id_document' : 'agent_ein_letter');

      const uploadRes = await fetch('/api/upload', { method: 'POST', body: fd });
      if (!uploadRes.ok) throw new Error('Upload failed');
      const { url } = await uploadRes.json();

      // Store in session
      const sessionKey = activeDoc === 'idDocument'
        ? { idDocumentUrl: url, idDocumentName: file.name }
        : { einLetterUrl: url, einLetterName: file.name };

      await fetch(`/api/agent/upload-session?id=${sessionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionKey),
      });

      setUploaded(prev => ({ ...prev, [activeDoc]: { url, name: file.name } }));
    } catch {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      setActiveDoc(null);
    }
  };

  const allDone = uploaded.idDocument !== undefined;
  const bothDone = uploaded.idDocument !== undefined && uploaded.einLetter !== undefined;

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#E74035] to-[#c9352a] px-5 pt-safe-top pb-4 pt-6">
        <div className="flex items-center gap-3">
          <Image src="/logo-transparent.png" alt="Fly2Any" width={100} height={30} className="brightness-0 invert" />
        </div>
        <h1 className="text-lg font-black mt-3">Upload Documents</h1>
        <p className="text-white/70 text-sm mt-0.5">Take a photo or choose from your gallery</p>
      </div>

      <div className="flex-1 px-5 py-6 space-y-4">
        {!sessionId && (
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl flex gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <p className="text-yellow-300 text-sm">Invalid session. Please scan the QR code again from your desktop.</p>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <p className="text-red-300 text-sm flex-1">{error}</p>
            <button onClick={() => setError('')}><X className="w-4 h-4 text-red-400" /></button>
          </div>
        )}

        {DOCS.map(({ key, label, sub, icon: Icon, required }) => {
          const done = !!uploaded[key];
          return (
            <div key={key} className={`rounded-2xl border transition-all ${done ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-white/10 bg-white/5'}`}>
              <div className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${done ? 'bg-emerald-500/20' : 'bg-white/10'}`}>
                    {done ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <Icon className="w-5 h-5 text-white/60" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm">
                      {label}
                      {!required && <span className="ml-1.5 text-[10px] text-white/40 font-normal">(optional)</span>}
                    </p>
                    <p className="text-white/50 text-xs mt-0.5">{sub}</p>
                  </div>
                </div>

                {done ? (
                  <div className="space-y-2">
                    <p className="text-xs text-emerald-400 font-semibold truncate">{uploaded[key]!.name}</p>
                    <button
                      onClick={() => handleCapture(key)}
                      disabled={uploading}
                      className="w-full py-2.5 text-xs font-bold text-white/60 border border-white/20 rounded-xl hover:bg-white/5 transition-all"
                    >
                      Replace Photo
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleCapture(key)}
                    disabled={uploading || !sessionId}
                    className="w-full py-4 bg-white/10 hover:bg-white/15 active:bg-white/20 rounded-xl flex flex-col items-center gap-2 transition-all disabled:opacity-40"
                  >
                    {uploading && activeDoc === key ? (
                      <Loader2 className="w-7 h-7 text-white animate-spin" />
                    ) : (
                      <Camera className="w-7 h-7 text-white/70" />
                    )}
                    <span className="text-sm font-semibold text-white/80">
                      {uploading && activeDoc === key ? 'Uploading...' : 'Take Photo / Choose File'}
                    </span>
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {allDone && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <p className="font-black text-emerald-300">
              {bothDone ? 'All documents uploaded!' : 'ID uploaded successfully!'}
            </p>
            <p className="text-emerald-400/70 text-sm mt-1">Return to your desktop to continue the application.</p>
          </div>
        )}

        <div className="pt-2 pb-safe-bottom pb-4">
          <p className="text-center text-white/30 text-xs">Files are encrypted and stored securely.</p>
        </div>
      </div>

      {/* Hidden file input — capture="environment" forces camera on mobile */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*,.pdf"
        capture="environment"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}

export default function MobileUploadPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    }>
      <MobileUploadContent />
    </Suspense>
  );
}
