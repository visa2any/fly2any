'use client';

import { useState } from 'react';
import { Sparkles, Loader2, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ImportWizardProps {
  onImport: (data: any) => void;
}

export function ImportWizard({ onImport }: ImportWizardProps) {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progressMsg, setProgressMsg] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleImport = async () => {
    if (!url) return;
    
    // Basic URL validation
    try {
        new URL(url);
    } catch (e) {
        setError("Please enter a valid URL (e.g. https://...)");
        return;
    }

    setIsLoading(true);
    setError(null);
    setProgressMsg("Connecting to host...");
    const toastId = toast.loading("Starting import...");

    // Simulate progress updates for better UX during the potential 10s wait
    const msgs = ["Connecting to host...", "Downloading page...", "Analyzing structure...", "Extracting amenities...", "Finalizing details..."];
    let msgIdx = 0;
    const progressInterval = setInterval(() => {
        msgIdx = (msgIdx + 1) % msgs.length;
        setProgressMsg(msgs[msgIdx]);
    }, 2000);

    try {
      const res = await fetch('/api/properties/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to import');
      }

      toast.success("Property details extracted!", { id: toastId });
      onImport(data.data);
      setUrl(''); // Clear input on success
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Could not extract data. Try filling manually.");
      toast.error("Import failed: " + (err.message || "Unknown error"), { id: toastId });
    } finally {
      clearInterval(progressInterval);
      setIsLoading(false);
      setProgressMsg("");
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white shadow-lg shadow-primary-500/20">
            <Sparkles className="w-5 h-5" />
        </div>
        <div>
            <h3 className="font-bold text-gray-900">Import from URL</h3>
            <p className="text-xs text-gray-500">Airbnb, Booking.com, VRBO</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors">
                <LinkIcon className="w-4 h-4" />
            </div>
            <input
                type="url"
                value={url}
                onChange={(e) => {
                    setUrl(e.target.value);
                    if (error) setError(null);
                }}
                placeholder="Paste listing URL here..."
                disabled={isLoading}
                className="w-full pl-11 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all text-sm font-medium text-gray-900 placeholder-gray-400"
                onKeyDown={(e) => e.key === 'Enter' && handleImport()}
            />
        </div>

        {error && (
            <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2.5 rounded-lg">
                <AlertCircle className="w-4 h-4" />
                {error}
            </div>
        )}

        <button
            onClick={handleImport}
            disabled={isLoading || !url}
            className="w-full bg-neutral-900 hover:bg-black disabled:bg-neutral-200 disabled:text-neutral-400 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg disabled:shadow-none"
        >
            {isLoading ? (
                <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {progressMsg || "Analyzing..."}
                </>
            ) : (
                <>
                    Auto-Fill Details
                    <Sparkles className="w-4 h-4" />
                </>
            )}
        </button>
      </div>
    </div>
  );
}
