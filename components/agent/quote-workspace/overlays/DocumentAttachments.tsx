"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Paperclip,
  Upload,
  FileText,
  Image,
  X,
  Download,
  Eye,
  Trash2,
  Plus,
  File,
} from "lucide-react";

export interface QuoteDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  url?: string;
  /** Base64 data URI for preview (images only) */
  preview?: string;
  addedAt: string;
}

interface DocumentAttachmentsProps {
  documents: QuoteDocument[];
  onAdd: (doc: QuoteDocument) => void;
  onRemove: (id: string) => void;
  maxFiles?: number;
  maxSizeMB?: number;
}

const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const FILE_ICONS: Record<string, typeof FileText> = {
  "application/pdf": FileText,
  "image/jpeg": Image,
  "image/png": Image,
  "image/webp": Image,
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentAttachments({
  documents,
  onAdd,
  onRemove,
  maxFiles = 10,
  maxSizeMB = 10,
}: DocumentAttachmentsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<QuoteDocument | null>(null);

  const handleFiles = useCallback(
    (files: FileList) => {
      Array.from(files).forEach((file) => {
        if (documents.length >= maxFiles) return;
        if (!ALLOWED_TYPES.includes(file.type)) return;
        if (file.size > maxSizeMB * 1024 * 1024) return;

        const reader = new FileReader();
        reader.onload = () => {
          const doc: QuoteDocument = {
            id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
            name: file.name,
            type: file.type,
            size: file.size,
            preview: file.type.startsWith("image/") ? (reader.result as string) : undefined,
            addedAt: new Date().toISOString(),
          };
          onAdd(doc);
        };
        reader.readAsDataURL(file);
      });
    },
    [documents.length, maxFiles, maxSizeMB, onAdd]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  return (
    <div className="space-y-3">
      {/* Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center gap-2 px-4 py-5 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
          dragOver
            ? "border-indigo-400 bg-indigo-50"
            : "border-gray-200 bg-gray-50/50 hover:border-gray-300 hover:bg-gray-50"
        }`}
      >
        <Upload
          className={`w-6 h-6 ${dragOver ? "text-indigo-500" : "text-gray-400"}`}
        />
        <div className="text-center">
          <p className="text-xs font-semibold text-gray-600">
            Drop files here or click to upload
          </p>
          <p className="text-[10px] text-gray-400 mt-0.5">
            PDF, Images, Word · Max {maxSizeMB}MB per file · {maxFiles - documents.length} slots remaining
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ALLOWED_TYPES.join(",")}
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="hidden"
        />
      </div>

      {/* Document List */}
      <AnimatePresence>
        {documents.map((doc) => {
          const Icon = FILE_ICONS[doc.type] || File;
          return (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-3 px-3 py-2 bg-white border border-gray-100 rounded-xl group hover:border-gray-200 transition-colors"
            >
              {/* Thumbnail or Icon */}
              {doc.preview ? (
                <img
                  src={doc.preview}
                  alt={doc.name}
                  className="w-9 h-9 rounded-lg object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-gray-500" />
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-800 truncate">{doc.name}</p>
                <p className="text-[10px] text-gray-400">{formatSize(doc.size)}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {doc.preview && (
                  <button
                    onClick={() => setPreviewDoc(doc)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Preview"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => onRemove(doc.id)}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                  title="Remove"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {previewDoc && previewDoc.preview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-8"
            onClick={() => setPreviewDoc(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-2xl max-h-[80vh]"
            >
              <img
                src={previewDoc.preview}
                alt={previewDoc.name}
                className="rounded-2xl shadow-2xl max-h-[80vh] object-contain"
              />
              <button
                onClick={() => setPreviewDoc(null)}
                className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
              <p className="text-center text-white text-sm font-medium mt-3">{previewDoc.name}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
