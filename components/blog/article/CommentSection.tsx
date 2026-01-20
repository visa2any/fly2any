'use client';

import { motion } from 'framer-motion';
import { MessageSquare, AlertCircle } from 'lucide-react';
import Giscus from '@giscus/react';
import { useState } from 'react';
import { GlobalErrorBoundary } from '@/components/error/GlobalErrorBoundary';

export function CommentSection() {
  const [giscusError, setGiscusError] = useState(false);

  // Check if Giscus is properly configured
  const isConfigured = !!(
    process.env.NEXT_PUBLIC_GISCUS_REPO_ID &&
    process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID
  );

  // If not configured or error occurred, show fallback message
  if (!isConfigured || giscusError) {
    return (
      <section className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-12 lg:px-20 xl:px-24 py-10 sm:py-12 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 border border-gray-200"
        >
          <div className="flex items-center gap-2.5 sm:gap-3 mb-6 sm:mb-8">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
              <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900">Join Discussion</h2>
              <p className="text-sm sm:text-base text-gray-600">Share your travel tips and experiences</p>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-900 mb-2">Comments Temporarily Unavailable</h3>
                <p className="text-sm text-amber-800 mb-3">
                  We're working on setting up our comment system. In the meantime, we'd love to hear from you directly!
                </p>
                <a
                  href="mailto:support@fly2any.com?subject=Blog Comment: Flight Prices"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors text-sm"
                >
                  <MessageSquare className="w-4 h-4" />
                  Email Your Thoughts
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    );
  }

  return (
    <section className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-12 lg:px-20 xl:px-24 py-10 sm:py-12 md:py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 border border-gray-200"
      >
        <div className="flex items-center gap-2.5 sm:gap-3 mb-6 sm:mb-8">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
            <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900">Join the Discussion</h2>
            <p className="text-sm sm:text-base text-gray-600">Share your travel tips and experiences</p>
          </div>
        </div>

        <div className="giscus-wrapper">
          {giscusError ? (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-amber-900 mb-2">Comments Failed to Load</h3>
                  <p className="text-sm text-amber-800 mb-3">
                    We encountered an issue loading the comment system. Please try refreshing the page.
                  </p>
                  <a
                    href="mailto:support@fly2any.com?subject=Blog Comment Error"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors text-sm"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Email Support
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <GlobalErrorBoundary fallback={null}>
              <Giscus
                id="comments"
                repo="visa2any/fly2any"
                repoId={process.env.NEXT_PUBLIC_GISCUS_REPO_ID || ''}
                category="Blog"
                categoryId={process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID || ''}
                mapping="pathname"
                strict="0"
                reactionsEnabled="1"
                emitMetadata="1"
                inputPosition="bottom"
                theme="preferred_color_scheme"
                lang="en"
                loading="lazy"
              />
            </GlobalErrorBoundary>
          )}
        </div>
      </motion.div>

      <style jsx global>{`
        .giscus-wrapper {
          background: white;
          border-radius: 1rem;
          padding: 1.5rem;
        }

        .giscus-frame {
          border-radius: 1rem !important;
        }

        /* Custom styling for Giscus to match Level 6 design */
        .gsc-comment-box-tabs {
          border-radius: 0.75rem !important;
        }

        .gsc-comment-box-textarea {
          border-radius: 0.75rem !important;
          border: 2px solid #E5E7EB !important;
          transition: all 0.2s !important;
        }

        .gsc-comment-box-textarea:focus {
          border-color: #3B82F6 !important;
          ring: 2px solid #3B82F640 !important;
        }

        .gsc-comment-box-button {
          background: linear-gradient(to right, #2563EB, #7C3AED) !important;
          border-radius: 0.75rem !important;
          font-weight: 700 !important;
          padding: 0.75rem 2rem !important;
          transition: all 0.2s !important;
        }

        .gsc-comment-box-button:hover {
          transform: scale(1.05) !important;
          box-shadow: 0 10px 25px rgba(37, 99, 235, 0.3) !important;
        }

        .gsc-comment {
          border-radius: 0.75rem !important;
          border: 1px solid #E5E7EB !important;
        }

        .gsc-reply-box-textarea {
          border-radius: 0.5rem !important;
        }

        @media (max-width: 768px) {
          .giscus-wrapper {
            padding: 1rem;
          }
        }
      `}</style>
    </section>
  );
}
