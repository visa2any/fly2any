"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Bold, Italic, List, ListOrdered, Link2, Heading1, Heading2,
  AlignLeft, AlignCenter, AlignJustify, Save, RotateCcw, FileText,
  ChevronDown, Sparkles
} from "lucide-react";

interface TermsConditionsEditorProps {
  isOpen: boolean;
  onClose: () => void;
  initialValue?: string;
  onSave: (content: string) => void;
}

const PRESET_TEMPLATES = [
  {
    name: "Standard Travel Terms",
    content: `<h2>Booking Terms & Conditions</h2>
<p><strong>1. Payment Terms</strong></p>
<p>A deposit of 25% is required at time of booking. Full payment is due 45 days prior to departure. Bookings made within 45 days of departure require full payment at time of booking.</p>
<p><strong>2. Cancellation Policy</strong></p>
<ul>
<li>60+ days before departure: Full refund minus $150 admin fee</li>
<li>30-59 days before departure: 50% refund</li>
<li>15-29 days before departure: 25% refund</li>
<li>Less than 15 days: No refund</li>
</ul>
<p><strong>3. Travel Insurance</strong></p>
<p>Travel insurance is strongly recommended and can be purchased through us or independently. We are not liable for any losses due to trip cancellation, interruption, or medical emergencies.</p>
<p><strong>4. Documentation</strong></p>
<p>Valid passports, visas, and any required travel documents are the sole responsibility of the traveler. Please ensure your passport is valid for at least 6 months beyond your travel dates.</p>
<p><strong>5. Changes & Amendments</strong></p>
<p>Changes to confirmed bookings may incur fees. Amendments are subject to availability and supplier terms.</p>`,
  },
  {
    name: "Flexible Policy",
    content: `<h2>Flexible Booking Terms</h2>
<p><strong>Flexibility Promise</strong></p>
<p>We understand plans change. Our flexible policy allows:</p>
<ul>
<li>Free date changes up to 14 days before departure</li>
<li>Name changes permitted with supplier approval</li>
<li>Full credit for future travel if cancelled 30+ days out</li>
</ul>
<p><strong>Payment Schedule</strong></p>
<p>Pay just 10% deposit now, balance due 30 days before travel.</p>
<p><strong>Our Commitment</strong></p>
<p>24/7 support during your trip. Best price guarantee on comparable packages.</p>`,
  },
  {
    name: "Luxury Package Terms",
    content: `<h2>Premium Travel Terms</h2>
<p><strong>Exclusive Service Guarantee</strong></p>
<p>Your luxury experience includes dedicated concierge support, priority assistance, and exclusive amenities.</p>
<p><strong>Deposit & Payment</strong></p>
<p>A 30% deposit secures your booking. Balance is due 60 days before departure.</p>
<p><strong>Premium Cancellation Protection</strong></p>
<p>Cancel for any reason up to 45 days before departure for full refund. Within 45 days, receive 75% travel credit for future bookings.</p>
<p><strong>VIP Modifications</strong></p>
<p>Complimentary changes to dates, room upgrades, and flight adjustments subject to availability.</p>`,
  },
];

export default function TermsConditionsEditor({
  isOpen,
  onClose,
  initialValue = "",
  onSave,
}: TermsConditionsEditorProps) {
  const [content, setContent] = useState(initialValue);
  const [showTemplates, setShowTemplates] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  }, []);

  const handleSave = () => {
    if (editorRef.current) {
      onSave(editorRef.current.innerHTML);
    }
    onClose();
  };

  const applyTemplate = (template: typeof PRESET_TEMPLATES[0]) => {
    if (editorRef.current) {
      editorRef.current.innerHTML = template.content;
    }
    setContent(template.content);
    setShowTemplates(false);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-fly2any-red/10 rounded-xl">
                <FileText className="w-5 h-5 text-fly2any-red" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Terms & Conditions</h2>
                <p className="text-xs text-gray-500">Customize legal terms for this quote</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-1 px-4 py-2 border-b border-gray-100 bg-gray-50/50 flex-wrap">
            {/* Text formatting */}
            <div className="flex items-center gap-0.5 mr-2">
              <button onClick={() => execCommand("bold")} className="p-2 hover:bg-white rounded-lg transition-colors" title="Bold">
                <Bold className="w-4 h-4 text-gray-600" />
              </button>
              <button onClick={() => execCommand("italic")} className="p-2 hover:bg-white rounded-lg transition-colors" title="Italic">
                <Italic className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            <div className="w-px h-6 bg-gray-200 mx-1" />

            {/* Headings */}
            <div className="flex items-center gap-0.5 mr-2">
              <button onClick={() => execCommand("formatBlock", "h1")} className="p-2 hover:bg-white rounded-lg transition-colors" title="Heading 1">
                <Heading1 className="w-4 h-4 text-gray-600" />
              </button>
              <button onClick={() => execCommand("formatBlock", "h2")} className="p-2 hover:bg-white rounded-lg transition-colors" title="Heading 2">
                <Heading2 className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            <div className="w-px h-6 bg-gray-200 mx-1" />

            {/* Lists */}
            <div className="flex items-center gap-0.5 mr-2">
              <button onClick={() => execCommand("insertUnorderedList")} className="p-2 hover:bg-white rounded-lg transition-colors" title="Bullet List">
                <List className="w-4 h-4 text-gray-600" />
              </button>
              <button onClick={() => execCommand("insertOrderedList")} className="p-2 hover:bg-white rounded-lg transition-colors" title="Numbered List">
                <ListOrdered className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            <div className="w-px h-6 bg-gray-200 mx-1" />

            {/* Alignment */}
            <div className="flex items-center gap-0.5 mr-2">
              <button onClick={() => execCommand("justifyLeft")} className="p-2 hover:bg-white rounded-lg transition-colors" title="Align Left">
                <AlignLeft className="w-4 h-4 text-gray-600" />
              </button>
              <button onClick={() => execCommand("justifyCenter")} className="p-2 hover:bg-white rounded-lg transition-colors" title="Center">
                <AlignCenter className="w-4 h-4 text-gray-600" />
              </button>
              <button onClick={() => execCommand("justifyFull")} className="p-2 hover:bg-white rounded-lg transition-colors" title="Justify">
                <AlignJustify className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            <div className="w-px h-6 bg-gray-200 mx-1" />

            {/* Link */}
            <button
              onClick={() => {
                const url = prompt("Enter URL:");
                if (url) execCommand("createLink", url);
              }}
              className="p-2 hover:bg-white rounded-lg transition-colors"
              title="Insert Link"
            >
              <Link2 className="w-4 h-4 text-gray-600" />
            </button>

            <div className="flex-1" />

            {/* Templates dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowTemplates(!showTemplates)}
                className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 text-purple-700 text-sm font-medium rounded-lg transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                Templates
                <ChevronDown className={`w-4 h-4 transition-transform ${showTemplates ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {showTemplates && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-10"
                  >
                    {PRESET_TEMPLATES.map((template) => (
                      <button
                        key={template.name}
                        onClick={() => applyTemplate(template)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                      >
                        <p className="text-sm font-medium text-gray-900">{template.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Click to apply</p>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Clear */}
            <button
              onClick={() => {
                if (editorRef.current) editorRef.current.innerHTML = "";
              }}
              className="p-2 hover:bg-red-50 rounded-lg transition-colors ml-1"
              title="Clear All"
            >
              <RotateCcw className="w-4 h-4 text-gray-400 hover:text-red-500" />
            </button>
          </div>

          {/* Editor */}
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onPaste={handlePaste}
            dangerouslySetInnerHTML={{ __html: content }}
            className="min-h-[300px] max-h-[400px] overflow-y-auto p-6 focus:outline-none prose prose-sm max-w-none
              prose-headings:text-gray-900 prose-headings:font-semibold
              prose-h1:text-xl prose-h2:text-lg
              prose-p:text-gray-600 prose-p:leading-relaxed
              prose-li:text-gray-600
              prose-a:text-fly2any-red prose-a:no-underline hover:prose-a:underline
              scrollbar-hide"
          />

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
            <p className="text-xs text-gray-500">
              Tip: Use templates for quick setup, then customize as needed
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-5 py-2 bg-fly2any-red hover:bg-fly2any-red-hover text-white text-sm font-medium rounded-xl shadow-lg shadow-red-500/25 transition-all hover:shadow-xl hover:shadow-red-500/30 active:scale-[0.98]"
              >
                <Save className="w-4 h-4" />
                Save Terms
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
