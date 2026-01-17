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
          className="bg-white rounded-2xl shadow-xl p-3 space-y-3 border border-gray-200"
        >
          <button
            onClick={handleCopyLink}
            className="w-12 h-12 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors group relative"
            title="Copy link"
          >
            {copied ? (
              <span className="text-green-600 text-xs font-bold">✓</span>
            ) : (
              <LinkIcon className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
            )}
          </button>
          <a
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 flex items-center justify-center rounded-xl hover:bg-blue-50 transition-colors group"
            title="Share on Twitter"
          >
            <Twitter className="w-5 h-5 text-gray-600 group-hover:text-blue-500" />
          </a>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 flex items-center justify-center rounded-xl hover:bg-blue-50 transition-colors group"
            title="Share on Facebook"
          >
            <Facebook className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
          </a>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 flex items-center justify-center rounded-xl hover:bg-blue-50 transition-colors group"
            title="Share on LinkedIn"
          >
            <Linkedin className="w-5 h-5 text-gray-600 group-hover:text-blue-700" />
          </a>
        </motion.div>
      </div>

      {/* Article Content Container */}
      <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="prose prose-lg prose-blue max-w-none
            prose-headings:font-extrabold prose-headings:text-gray-900
            prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
            prose-h3:text-2xl prose-h3:mt-10 prose-h3:mb-4
            prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-6
            prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
            prose-strong:text-gray-900 prose-strong:font-bold
            prose-ul:my-6 prose-ol:my-6
            prose-li:text-gray-700 prose-li:my-2
            prose-blockquote:border-l-4 prose-blockquote:border-blue-600 prose-blockquote:bg-blue-50 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-lg
            prose-img:rounded-2xl prose-img:shadow-2xl
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
      <div className="lg:hidden sticky bottom-0 bg-white border-t border-gray-200 py-4 px-4 shadow-2xl">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-semibold text-gray-900">Share</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              {copied ? (
                <span className="text-green-600 text-xs font-bold">✓</span>
              ) : (
                <LinkIcon className="w-5 h-5 text-gray-600" />
              )}
            </button>
            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-blue-50 transition-colors"
            >
              <Twitter className="w-5 h-5 text-gray-600" />
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-blue-50 transition-colors"
            >
              <Facebook className="w-5 h-5 text-gray-600" />
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-blue-50 transition-colors"
            >
              <Linkedin className="w-5 h-5 text-gray-600" />
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
