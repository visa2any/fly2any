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
    <>
      {/* Sticky Share Bar - Desktop */}
      <div className="hidden xl:block fixed left-8 top-1/2 -translate-y-1/2 z-20">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-2xl p-4 space-y-4 border border-gray-200"
        >
          <button
            onClick={handleCopyLink}
            className="w-14 h-14 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-all duration-200 group"
            title="Copy link"
          >
            {copied ? (
              <span className="text-green-600 text-sm font-bold">✓</span>
            ) : (
              <LinkIcon className="w-6 h-6 text-gray-600 group-hover:text-blue-600" />
            )}
          </button>
          <a
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-14 h-14 flex items-center justify-center rounded-xl hover:bg-blue-50 transition-all duration-200 group"
          >
            <Twitter className="w-6 h-6 text-gray-600 group-hover:text-blue-500" />
          </a>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-14 h-14 flex items-center justify-center rounded-xl hover:bg-blue-50 transition-all duration-200 group"
          >
            <Facebook className="w-6 h-6 text-gray-600 group-hover:text-blue-600" />
          </a>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-14 h-14 flex items-center justify-center rounded-xl hover:bg-blue-50 transition-all duration-200 group"
          >
            <Linkedin className="w-6 h-6 text-gray-600 group-hover:text-blue-700" />
          </a>
        </motion.div>
      </div>

      {/* Article Content - FULL WIDTH WITH BREAKOUT SECTIONS */}
      <article className="w-full bg-white">
        <div className="w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="article-content-wrapper"
            style={{
              '--content-width': 'min(90vw, 1400px)',
              '--narrow-width': 'min(85vw, 900px)',
            } as any}
          >
            {typeof content === 'string' ? (
              <div dangerouslySetInnerHTML={{ __html: content }} />
            ) : (
              content
            )}
            {children}
          </motion.div>
        </div>
      </article>

      {/* Mobile Share Bar */}
      <div className="xl:hidden sticky bottom-0 bg-white border-t border-gray-200 py-4 px-6 shadow-2xl z-30">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
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

      <style jsx global>{`
        .article-content-wrapper {
          width: 100%;
        }

        .article-content-wrapper > div,
        .article-content-wrapper h2,
        .article-content-wrapper h3,
        .article-content-wrapper p,
        .article-content-wrapper ul,
        .article-content-wrapper ol,
        .article-content-wrapper blockquote {
          max-width: var(--narrow-width);
          margin-left: auto;
          margin-right: auto;
          padding-left: 2rem;
          padding-right: 2rem;
        }

        .article-content-wrapper h2 {
          font-size: clamp(2rem, 5vw, 3.5rem);
          font-weight: 900;
          color: #111827;
          margin-top: 4rem;
          margin-bottom: 2rem;
          line-height: 1.2;
          letter-spacing: -0.02em;
        }

        .article-content-wrapper h3 {
          font-size: clamp(1.5rem, 3.5vw, 2.25rem);
          font-weight: 800;
          color: #1f2937;
          margin-top: 3rem;
          margin-bottom: 1.5rem;
          line-height: 1.3;
        }

        .article-content-wrapper p {
          font-size: clamp(1.125rem, 2vw, 1.25rem);
          line-height: 1.8;
          color: #374151;
          margin-bottom: 1.5rem;
        }

        .article-content-wrapper ul,
        .article-content-wrapper ol {
          font-size: clamp(1.125rem, 2vw, 1.25rem);
          line-height: 1.8;
          color: #374151;
          margin-top: 2rem;
          margin-bottom: 2rem;
          padding-left: 3rem;
        }

        .article-content-wrapper li {
          margin-bottom: 1rem;
        }

        .article-content-wrapper strong {
          font-weight: 700;
          color: #111827;
        }

        .article-content-wrapper a {
          color: #2563eb;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s;
        }

        .article-content-wrapper a:hover {
          color: #1d4ed8;
          text-decoration: underline;
        }

        .article-content-wrapper blockquote {
          border-left: 4px solid #2563eb;
          background: #eff6ff;
          padding: 1.5rem 2rem;
          border-radius: 0 1rem 1rem 0;
          margin: 2.5rem auto;
        }

        @media (max-width: 768px) {
          .article-content-wrapper > div,
          .article-content-wrapper h2,
          .article-content-wrapper h3,
          .article-content-wrapper p,
          .article-content-wrapper ul,
          .article-content-wrapper ol,
          .article-content-wrapper blockquote {
            padding-left: 1.5rem;
            padding-right: 1.5rem;
          }

          .article-content-wrapper ul,
          .article-content-wrapper ol {
            padding-left: 3rem;
          }
        }
      `}</style>
    </>
  );
}
