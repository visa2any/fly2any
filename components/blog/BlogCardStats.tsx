'use client';

import React, { useEffect, useState } from 'react';
import { Eye, Heart, Share2, Check } from 'lucide-react';
import { BlogStats } from '@/lib/services/blog-stats';
import { useToast } from '@/components/common/Toast';
import { useSession } from 'next-auth/react';

interface BlogCardStatsProps {
  postId: string;
  initialViews: number;
  initialLikes: number;
}

export function BlogCardStats({ postId, initialViews, initialLikes }: BlogCardStatsProps) {
  const [stats, setStats] = useState({
    views: initialViews,
    likes: initialLikes,
    isLiked: false
  });
  const [isCopying, setIsCopying] = useState(false);
  const { success, info } = useToast();
  const { data: session } = useSession();

  useEffect(() => {
    // Read current stats from local storage if they exist
    const currentStats = BlogStats.getStats(postId, initialViews, initialLikes);
    setStats(currentStats);
  }, [postId, initialViews, initialLikes]);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session) {
      info('Please sign in to like this article', 'Action Required');
      return;
    }

    const result = BlogStats.toggleLike(postId, stats.likes);
    setStats(prev => ({
      ...prev,
      likes: result.likes,
      isLiked: result.isLiked
    }));
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const shareUrl = `${window.location.origin}/blog/${postId}`; // Fallback or direct slug-based URL
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Fly2Any Blog',
          url: shareUrl
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        setIsCopying(true);
        success('Link copied to clipboard!', 'Ready to Share');
        setTimeout(() => setIsCopying(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    // Prevent any click in the stats container from navigating
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className="flex items-center gap-4" onClick={handleContainerClick}>
      <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium" suppressHydrationWarning>
        <Eye className="w-3.5 h-3.5" />
        {stats.views.toLocaleString()}
      </div>
      
      <button 
        onClick={handleLike}
        className={`flex items-center gap-1.5 text-xs font-semibold transition-all hover:scale-110 ${stats.isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`} 
        suppressHydrationWarning
      >
        <Heart className={`w-3.5 h-3.5 ${stats.isLiked ? 'fill-current' : ''}`} />
        {stats.likes.toLocaleString()}
      </button>

      <div className="w-px h-3 bg-gray-200 mx-0.5" />

      <button 
        onClick={handleShare}
        className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-blue-500 transition-all hover:scale-110 active:scale-95"
      >
        {isCopying ? (
          <Check className="w-3.5 h-3.5 text-green-500" />
        ) : (
          <Share2 className="w-3.5 h-3.5" />
        )}
        <span>{isCopying ? 'Copied' : 'Share'}</span>
      </button>
    </div>
  );
}
