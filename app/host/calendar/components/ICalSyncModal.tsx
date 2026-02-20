'use client';

import { useState } from 'react';
import { X, Link as LinkIcon, Download, Upload, AlertCircle, Check, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ICalSyncModalProps {
  propertyId: string;
  propertyName: string;
  onClose: () => void;
  onSyncComplete: () => void;
}

export function ICalSyncModal({ propertyId, propertyName, onClose, onSyncComplete }: ICalSyncModalProps) {
  const [importUrl, setImportUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  // Hardcoded for demo - in reality this comes from the DB
  const exportUrl = `${window.location.origin}/api/ical/export/${propertyId}`;
  
  const [importedFeeds, setImportedFeeds] = useState([
    { id: '1', name: 'Airbnb Calendar', url: 'https://www.airbnb.com/calendar/ical/1234.ics', lastSync: '10 mins ago' }
  ]);

  const handleImport = async () => {
    if (!importUrl) {
      toast.error('Please enter an iCal URL');
      return;
    }
    
    setIsImporting(true);
    
    // Simulate network request for importing
    setTimeout(() => {
      setImportedFeeds([
        ...importedFeeds, 
        { id: Date.now().toString(), name: 'New Sync Feed', url: importUrl, lastSync: 'Just now' }
      ]);
      setImportUrl('');
      setIsImporting(false);
      toast.success('Calendar linked successfully!');
      onSyncComplete();
    }, 1500);
  };

  const handleCopyExport = async () => {
    try {
      await navigator.clipboard.writeText(exportUrl);
      toast.success('Export URL copied to clipboard');
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  const forceSync = (id: string) => {
    toast.success('Sync triggered. Updating calendar tags.');
    onSyncComplete();
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-md z-10">
          <div>
            <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-indigo-600" />
              Calendar Sync
            </h2>
            <p className="text-sm font-medium text-gray-500 mt-1">Cross-platform integration for {propertyName}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-neutral-100 text-gray-400 hover:text-gray-900 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-8 flex-1">
          
          {/* Info Banner */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex gap-3 text-indigo-800 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 text-indigo-500 mt-0.5" />
            <p className="font-medium leading-relaxed">
              <strong>Keep availability accurate across platforms.</strong> Import your Airbnb or VRBO calendars to automatically block dates here, and export your Fly2Any calendar to block dates there. <br/>
              <span className="text-indigo-600 font-bold block mt-1">AI Smart Yield uses this aggregated availability to price optimization.</span>
            </p>
          </div>

          {/* Export Section */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Download className="w-4 h-4 text-emerald-500" /> Export from Fly2Any
            </h3>
            
            <div className="bg-neutral-50 rounded-2xl p-5 border border-neutral-200">
               <p className="text-sm font-medium text-gray-600 mb-3 block">
                 Paste this link into Airbnb, VRBO, or Booking.com to export your Fly2Any reservations.
               </p>
               <div className="flex items-center gap-2">
                 <div className="flex-1 bg-white border border-neutral-200 rounded-xl px-4 py-3 flex items-center gap-3">
                   <LinkIcon className="w-4 h-4 text-gray-400 shrink-0" />
                   <code className="text-sm text-gray-800 font-mono flex-1 truncate select-all">
                     {exportUrl}
                   </code>
                 </div>
                 <button 
                  onClick={handleCopyExport}
                  className="px-5 py-3 rounded-xl bg-gray-900 hover:bg-black text-white text-sm font-bold shadow-sm transition-all whitespace-nowrap"
                 >
                   Copy Link
                 </button>
               </div>
            </div>
          </div>

          {/* Import Section */}
          <div>
             <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Upload className="w-4 h-4 text-amber-500" /> Import External Calendars
            </h3>
            
            <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm space-y-6">
              
              {/* Active Feeds List */}
              {importedFeeds.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Feeds</p>
                  {importedFeeds.map(feed => (
                    <div key={feed.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Check className="w-4 h-4 text-emerald-500" />
                          <h4 className="text-sm font-bold text-gray-900">{feed.name}</h4>
                        </div>
                        <p className="text-xs text-gray-500 truncate mb-1">{feed.url}</p>
                        <p className="text-[10px] font-medium text-gray-400">Last synced: {feed.lastSync}</p>
                      </div>
                      
                      <button 
                        onClick={() => forceSync(feed.id)}
                        className="px-3 py-1.5 rounded-lg border border-neutral-200 hover:bg-white text-xs font-bold text-gray-600 transition-colors w-max"
                      >
                        Force Sync
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Feed Input */}
              <div className="pt-2 border-t border-neutral-100">
                <p className="text-xs font-bold text-gray-600 mb-2">Link another calendar</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="url"
                      value={importUrl}
                      onChange={(e) => setImportUrl(e.target.value)}
                      placeholder="https://www.airbnb.com/calendar/ical/..."
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl py-3 pl-10 pr-4 text-sm text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400"
                    />
                  </div>
                  <button 
                    onClick={handleImport}
                    disabled={!importUrl || isImporting}
                    className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-sm transition-all disabled:opacity-50 min-w-[100px] flex items-center justify-center"
                  >
                    {isImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Import'}
                  </button>
                </div>
              </div>

            </div>
          </div>
          
        </div>
        
      </div>
    </div>
  );
}
