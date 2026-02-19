/**
 * Blog Stats Service
 * 
 * Handles client-side view tracking and like interaction
 * for the Fly2Any travel blog.
 */

export const BlogStats = {
  // Get tracked stats for a specific post
  getStats(postId: string, initialViews: number = 0, initialLikes: number = 0) {
    if (typeof window === 'undefined') return { views: initialViews, likes: initialLikes, isLiked: false };

    const storedLikes = localStorage.getItem(`likes_${postId}`);
    const isLiked = localStorage.getItem(`isLiked_${postId}`) === 'true';
    const isBookmarked = localStorage.getItem(`isBookmarked_${postId}`) === 'true';
    const storedViews = localStorage.getItem(`views_${postId}`);

    return {
      views: storedViews ? parseInt(storedViews, 10) : initialViews,
      likes: storedLikes ? parseInt(storedLikes, 10) : initialLikes,
      isLiked,
      isBookmarked
    };
  },

  // Increment view count (once per session/localstorage)
  incrementView(postId: string, currentViews: number) {
    if (typeof window === 'undefined') return;

    const hasViewed = localStorage.getItem(`viewed_${postId}`);
    if (!hasViewed) {
      const newViews = currentViews + 1;
      localStorage.setItem(`views_${postId}`, newViews.toString());
      localStorage.setItem(`viewed_${postId}`, 'true');
      return newViews;
    }
    return currentViews;
  },

  // Toggle like status
  toggleLike(postId: string, currentLikes: number) {
    if (typeof window === 'undefined') return { likes: currentLikes, isLiked: false };

    const isLiked = localStorage.getItem(`isLiked_${postId}`) === 'true';
    const newIsLiked = !isLiked;
    const newLikes = newIsLiked ? currentLikes + 1 : Math.max(0, currentLikes - 1);

    localStorage.setItem(`isLiked_${postId}`, newIsLiked.toString());
    localStorage.setItem(`likes_${postId}`, newLikes.toString());

    return { likes: newLikes, isLiked: newIsLiked };
  },

  // Toggle bookmark status
  toggleBookmark(postId: string) {
    if (typeof window === 'undefined') return false;

    const isBookmarked = localStorage.getItem(`isBookmarked_${postId}`) === 'true';
    const newIsBookmarked = !isBookmarked;
    localStorage.setItem(`isBookmarked_${postId}`, newIsBookmarked.toString());

    return newIsBookmarked;
  }
};
