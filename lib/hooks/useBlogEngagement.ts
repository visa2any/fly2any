'use client';

import { useState, useEffect, useCallback } from 'react';

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  image?: string;
  category?: string;
  date?: string;
  author?: string;
  readTime?: number;
}

export interface EngagementData {
  savedPosts: string[]; // Array of post IDs
  likedPosts: string[]; // Array of post IDs
  recentViews: {
    postId: string;
    timestamp: number;
  }[];
  preferences: {
    homeAirport?: string;
    language?: 'en' | 'pt' | 'es';
    interests?: string[];
  };
}

const STORAGE_KEY = 'fly2any_blog_engagement';
const MAX_RECENT_VIEWS = 20;

const getInitialData = (): EngagementData => {
  if (typeof window === 'undefined') {
    return {
      savedPosts: [],
      likedPosts: [],
      recentViews: [],
      preferences: {},
    };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading engagement data:', error);
  }

  return {
    savedPosts: [],
    likedPosts: [],
    recentViews: [],
    preferences: {},
  };
};

export const useBlogEngagement = () => {
  const [data, setData] = useState<EngagementData>(getInitialData);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load data on mount
  useEffect(() => {
    setData(getInitialData());
    setIsLoaded(true);
  }, []);

  // Persist data to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (error) {
        console.error('Error saving engagement data:', error);
      }
    }
  }, [data, isLoaded]);

  // Save a post
  const savePost = useCallback((postId: string) => {
    setData((prev) => {
      if (prev.savedPosts.includes(postId)) {
        return prev; // Already saved
      }
      return {
        ...prev,
        savedPosts: [...prev.savedPosts, postId],
      };
    });
  }, []);

  // Unsave a post
  const unsavePost = useCallback((postId: string) => {
    setData((prev) => ({
      ...prev,
      savedPosts: prev.savedPosts.filter((id) => id !== postId),
    }));
  }, []);

  // Toggle save status
  const toggleSavePost = useCallback((postId: string) => {
    setData((prev) => {
      const isSaved = prev.savedPosts.includes(postId);
      return {
        ...prev,
        savedPosts: isSaved
          ? prev.savedPosts.filter((id) => id !== postId)
          : [...prev.savedPosts, postId],
      };
    });
  }, []);

  // Like a post
  const likePost = useCallback((postId: string) => {
    setData((prev) => {
      if (prev.likedPosts.includes(postId)) {
        return prev; // Already liked
      }
      return {
        ...prev,
        likedPosts: [...prev.likedPosts, postId],
      };
    });
  }, []);

  // Unlike a post
  const unlikePost = useCallback((postId: string) => {
    setData((prev) => ({
      ...prev,
      likedPosts: prev.likedPosts.filter((id) => id !== postId),
    }));
  }, []);

  // Toggle like status
  const toggleLikePost = useCallback((postId: string) => {
    setData((prev) => {
      const isLiked = prev.likedPosts.includes(postId);
      return {
        ...prev,
        likedPosts: isLiked
          ? prev.likedPosts.filter((id) => id !== postId)
          : [...prev.likedPosts, postId],
      };
    });
  }, []);

  // Track a post view
  const trackView = useCallback((postId: string) => {
    setData((prev) => {
      const newView = {
        postId,
        timestamp: Date.now(),
      };

      // Remove duplicate views of the same post
      const filteredViews = prev.recentViews.filter(
        (view) => view.postId !== postId
      );

      // Add new view and limit to MAX_RECENT_VIEWS
      const updatedViews = [newView, ...filteredViews].slice(
        0,
        MAX_RECENT_VIEWS
      );

      return {
        ...prev,
        recentViews: updatedViews,
      };
    });
  }, []);

  // Update user preferences
  const updatePreferences = useCallback(
    (updates: Partial<EngagementData['preferences']>) => {
      setData((prev) => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          ...updates,
        },
      }));
    },
    []
  );

  // Get saved posts
  const getSavedPosts = useCallback(() => {
    return data.savedPosts;
  }, [data.savedPosts]);

  // Get liked posts
  const getLikedPosts = useCallback(() => {
    return data.likedPosts;
  }, [data.likedPosts]);

  // Get recent views
  const getRecentViews = useCallback(() => {
    return data.recentViews;
  }, [data.recentViews]);

  // Check if a post is saved
  const isPostSaved = useCallback(
    (postId: string) => {
      return data.savedPosts.includes(postId);
    },
    [data.savedPosts]
  );

  // Check if a post is liked
  const isPostLiked = useCallback(
    (postId: string) => {
      return data.likedPosts.includes(postId);
    },
    [data.likedPosts]
  );

  // Clear all saved posts
  const clearSavedPosts = useCallback(() => {
    setData((prev) => ({
      ...prev,
      savedPosts: [],
    }));
  }, []);

  // Clear all engagement data
  const clearAllData = useCallback(() => {
    setData({
      savedPosts: [],
      likedPosts: [],
      recentViews: [],
      preferences: {},
    });
  }, []);

  return {
    // State
    savedPosts: data.savedPosts,
    likedPosts: data.likedPosts,
    recentViews: data.recentViews,
    preferences: data.preferences,
    isLoaded,

    // Actions
    savePost,
    unsavePost,
    toggleSavePost,
    likePost,
    unlikePost,
    toggleLikePost,
    trackView,
    updatePreferences,

    // Getters
    getSavedPosts,
    getLikedPosts,
    getRecentViews,
    isPostSaved,
    isPostLiked,

    // Utils
    clearSavedPosts,
    clearAllData,
  };
};

export default useBlogEngagement;
