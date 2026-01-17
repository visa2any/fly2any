'use client';

import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import Giscus from '@giscus/react';

export function CommentSection() {
  return (
    <section className="w-full max-w-[1600px] mx-auto px-6 md:px-12 lg:px-20 xl:px-24 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl p-8 md:p-12 border border-gray-200"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-gray-900">Join the Discussion</h2>
            <p className="text-gray-600">Share your travel tips and experiences</p>
          </div>
        </div>

        <div className="giscus-wrapper">
          <Giscus
            id="comments"
            repo="visa2any/fly2any"
            repoId={process.env.NEXT_PUBLIC_GISCUS_REPO_ID || ''}
            category="Blog Comments"
            categoryId={process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID || ''}
            mapping="pathname"
            strict="0"
            reactionsEnabled="1"
            emitMetadata="0"
            inputPosition="top"
            theme="light"
            lang="en"
            loading="lazy"
          />
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
