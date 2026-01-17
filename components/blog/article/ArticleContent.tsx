'use client';

import { motion } from 'framer-motion';
import { Share2, Twitter, Facebook, Linkedin, Link as LinkIcon } from 'lucide-react';
import { useState } from 'react';

interface ArticleContentProps {
  content: string | React.ReactNode;
  children?: React.ReactNode;
}

export function ArticleContent({ content, children }: ArticleContentProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = typeof document !== 'undefined' ? document.title : '';

  return (
    <article className="w-full bg-white">
      {/* Sticky Share Bar - Desktop */}
      <div className="hidden lg:block fixed left-8 top-1/2 -translate-y-1/2 z-20">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-2xl p-4 space-y-4 border border-gray-200"
        >
          <button
            onClick={handleCopyLink}
            className="w-14 h-14 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-all duration-200 group relative"
            title="Copy link"
          >
            {copied ? (
              <span className="text-green-600 text-sm font-bold">✓</span>
            ) : (
              <LinkIcon className="w-6 h-6 text-gray-600 group-hover:text-blue-600 transition-colors" />
            )}
          </button>
          <a
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-14 h-14 flex items-center justify-center rounded-xl hover:bg-blue-50 transition-all duration-200 group"
            title="Share on Twitter"
          >
            <Twitter className="w-6 h-6 text-gray-600 group-hover:text-blue-500 transition-colors" />
          </a>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-14 h-14 flex items-center justify-center rounded-xl hover:bg-blue-50 transition-all duration-200 group"
            title="Share on Facebook"
          >
            <Facebook className="w-6 h-6 text-gray-600 group-hover:text-blue-600 transition-colors" />
          </a>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-14 h-14 flex items-center justify-center rounded-xl hover:bg-blue-50 transition-all duration-200 group"
            title="Share on LinkedIn"
          >
            <Linkedin className="w-6 h-6 text-gray-600 group-hover:text-blue-700 transition-colors" />
          </a>
        </motion.div>
      </div>

      {/* Article Content Container - WIDER LAYOUT */}
      <div className="max-w-[1200px] mx-auto px-6 md:px-8 py-16 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="
            prose prose-xl max-w-none
            prose-headings:font-extrabold prose-headings:text-gray-900 prose-headings:tracking-tight
            prose-h2:text-4xl md:prose-h2:text-5xl prose-h2:mt-16 prose-h2:mb-8 prose-h2:leading-tight
            prose-h3:text-2xl md:prose-h3:text-3xl prose-h3:mt-12 prose-h3:mb-6
            prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-6 prose-p:text-lg md:prose-p:text-xl
            prose-a:text-blue-600 prose-a:font-semibold prose-a:no-underline hover:prose-a:underline prose-a:transition-all
            prose-strong:text-gray-900 prose-strong:font-bold
            prose-ul:my-8 prose-ul:space-y-3 prose-ol:my-8 prose-ol:space-y-3
            prose-li:text-gray-700 prose-li:text-lg md:prose-li:text-xl prose-li:leading-relaxed
            prose-blockquote:border-l-4 prose-blockquote:border-blue-600 prose-blockquote:bg-blue-50
            prose-blockquote:py-6 prose-blockquote:px-8 prose-blockquote:rounded-r-2xl prose-blockquote:my-10
            prose-img:rounded-3xl prose-img:shadow-2xl prose-img:my-12
            prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-blue-600 prose-code:font-mono
          "
        >
          {typeof content === 'string' ? (
            <div dangerouslySetInnerHTML={{ __html: content }} />
          ) : (
            content
          )}
          {children}
        </motion.div>
      </div>

      {/* Mobile Share Bar */}
      <div className="lg:hidden sticky bottom-0 bg-white border-t border-gray-200 py-4 px-6 shadow-2xl z-30">
        <div className="flex items-center justify-between max-w-[1200px] mx-auto">
          <div className="flex items-center gap-3">
            <Share2 className="w-6 h-6 text-gray-600" />
            <span className="text-base font-bold text-gray-900">Share</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyLink}
              className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all active:scale-95"
            >
              {copied ? (
                <span className="text-green-600 text-sm font-bold">✓</span>
              ) : (
                <LinkIcon className="w-6 h-6 text-gray-600" />
              )}
            </button>
            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-blue-50 transition-all active:scale-95"
            >
              <Twitter className="w-6 h-6 text-gray-600" />
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-blue-50 transition-all active:scale-95"
            >
              <Facebook className="w-6 h-6 text-gray-600" />
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-blue-50 transition-all active:scale-95"
            >
              <Linkedin className="w-6 h-6 text-gray-600" />
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
