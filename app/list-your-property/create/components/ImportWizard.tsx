import { useState } from 'react';
import { Loader2, Sparkles, Link as LinkIcon, AlertCircle, Check, ArrowRight } from 'lucide-react';

interface ImportWizardProps {
  onImport: (data: any) => void;
  onCancel: () => void;
}

export function ImportWizard({ onImport, onCancel }: ImportWizardProps) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState(''); // 'fetching', 'analyzing', 'success'

  const handleImport = async () => {
    if (!url) return;
    setLoading(true);
    setError('');
    setStatus('fetching');

    try {
      const res = await fetch('/api/properties/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to import');
      
      setStatus('success');
      // Small delay to show success state
      setTimeout(() => {
          onImport(data.data);
      }, 500);

    } catch (err: any) {
      setError(err.message);
      setStatus('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-[#0a0a0f] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-white/5 bg-white/5">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
                <Sparkles className="w-5 h-5 text-white" />
             </div>
             <div>
                <h2 className="text-xl font-bold text-white">Magic Import</h2>
                <p className="text-white/50 text-sm">Paste a link from Airbnb, Booking, or VRBO</p>
             </div>
          </div>
        </div>

        {/* content */}
        <div className="p-6 space-y-6">
           <div>
              <label className="block text-xs font-bold text-white/40 uppercase mb-2 ml-1">Property URL</label>
              <div className="relative">
                 <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                 <input 
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://airbnb.com/rooms/..." 
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:border-violet-500/50 outline-none transition-all"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleImport()}
                 />
              </div>
           </div>

           {/* Status / Error */}
           {error && (
               <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                   <AlertCircle className="w-4 h-4" /> {error}
               </div>
           )}

           {loading && (
               <div className="py-4 space-y-3">
                   <div className="flex items-center gap-3 text-white/60 text-sm">
                       {status === 'fetching' ? (
                           <Loader2 className="w-4 h-4 animate-spin text-violet-400" /> 
                       ) : (
                           <Check className="w-4 h-4 text-emerald-400" />
                       )}
                       <span>Fetching page content...</span>
                   </div>
                   <div className="flex items-center gap-3 text-white/60 text-sm">
                       {status === 'analyzing' || status === 'success' ? ( // Simplified logic for demo
                           status === 'success' ? <Check className="w-4 h-4 text-emerald-400" /> : <Loader2 className="w-4 h-4 animate-spin text-fuchsia-400" />
                       ) : (
                           <div className="w-4 h-4 rounded-full border border-white/10" />
                       )}
                       <span className={status === 'fetching' ? 'opacity-50' : ''}>AI Analyzing property details...</span>
                   </div>
               </div>
           )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white/5 border-t border-white/5 flex items-center justify-between">
           <button 
              onClick={onCancel}
              className="px-4 py-2 text-white/50 hover:text-white text-sm font-bold transition-colors"
           >
              Cancel
           </button>
           <button 
              onClick={handleImport}
              disabled={loading || !url}
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-bold text-sm shadow-lg shadow-violet-500/20 hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100 flex items-center gap-2"
           >
              {loading ? 'Magic in progress...' : <>Import <ArrowRight className="w-4 h-4" /></>}
           </button>
        </div>

      </div>
    </div>
  );
}
