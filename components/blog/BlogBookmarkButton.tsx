'use client';

import React, { useEffect, useState } from 'react';
import { Bookmark } from 'lucide-react';
import { BlogStats } from '@/lib/services/blog-stats';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useToast } from '@/components/common/Toast';

interface BlogBookmarkButtonProps {
  postId: string;
}

export function BlogBookmarkButton({ postId }: BlogBookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const { data: session } = useSession();
  const { info } = useToast();

  useEffect(() => {
    const stats = BlogStats.getStats(postId);
    setIsBookmarked(stats.isBookmarked);
  }, [postId]);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session) {
      info('Please sign in to save articles for later', 'Action Required');
      return;
    }

    const newState = BlogStats.toggleBookmark(postId);
    setIsBookmarked(newState);
  };

  return (
    <button
      onClick={handleToggle}
      className={`relative group/bookmark p-2.5 rounded-full backdrop-blur-md transition-all duration-300 ${
        isBookmarked 
          ? 'bg-blue-600 text-white shadow-lg' 
          : 'bg-black/20 text-white/80 hover:bg-black/40 hover:text-white border border-white/10'
      }`}
    >
      <motion.div
        whileTap={{ scale: 0.8 }}
        whileHover={{ scale: 1.1 }}
      >
        <Bookmark 
          className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} 
        />
      </motion.div>
      
      {/* Tooltip */}
      <div className="absolute top-full right-0 mt-2 opacity-0 group-hover/bookmark:opacity-100 transition-opacity pointer-events-none">
        <div className="bg-black/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded whitespace-nowrap">
          {isBookmarked ? 'Saved' : 'Save for later'}
        </div>
      </div>
    </button>
  );
}
