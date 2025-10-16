/**
 * Blog Utility Helper Functions
 *
 * Common utility functions for working with blog data
 */

import type { BlogPost, CategoryType } from '@/lib/types/blog';

/**
 * Format date to readable string
 */
export function formatDate(date: Date | string, format: 'long' | 'short' = 'long'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (format === 'short') {
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Calculate time ago from date
 */
export function getTimeAgo(date: Date | string): string {
  const now = Date.now();
  const published = typeof date === 'string' ? new Date(date).getTime() : date.getTime();
  const diffMs = now - published;

  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  }
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  }

  return formatDate(date, 'short');
}

/**
 * Calculate reading time from word count
 */
export function calculateReadTime(content: string, wordsPerMinute: number = 200): number {
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

/**
 * Generate excerpt from content
 */
export function generateExcerpt(content: string, maxLength: number = 200): string {
  const stripped = content.replace(/[#*_`]/g, '').trim();
  if (stripped.length <= maxLength) return stripped;
  return stripped.substring(0, maxLength).trim() + '...';
}

/**
 * Format number with commas (e.g., 1,234,567)
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('en-US');
}

/**
 * Get category display name
 */
export function getCategoryDisplayName(category: CategoryType): string {
  const names: Record<CategoryType, string> = {
    blog: 'Travel Blog',
    news: 'Travel News',
    deal: 'Flash Deals',
    guide: 'Travel Guides',
    tip: 'Travel Tips',
    story: 'Travel Stories',
  };
  return names[category] || category;
}

/**
 * Get category icon
 */
export function getCategoryIcon(category: CategoryType): string {
  const icons: Record<CategoryType, string> = {
    blog: '✈️',
    news: '📰',
    deal: '💰',
    guide: '🗺️',
    tip: '💡',
    story: '📖',
  };
  return icons[category] || '📚';
}

/**
 * Get category color class
 */
export function getCategoryColor(category: CategoryType): string {
  const colors: Record<CategoryType, string> = {
    blog: 'from-blue-600 to-blue-800',
    news: 'from-red-600 to-orange-600',
    deal: 'from-green-600 to-emerald-600',
    guide: 'from-purple-600 to-indigo-600',
    tip: 'from-yellow-600 to-amber-600',
    story: 'from-pink-600 to-rose-600',
  };
  return colors[category] || 'from-gray-600 to-gray-800';
}

/**
 * Check if deal is expired
 */
export function isDealExpired(validUntil: Date | string): boolean {
  const expiryDate = typeof validUntil === 'string' ? new Date(validUntil) : validUntil;
  return expiryDate.getTime() < Date.now();
}

/**
 * Calculate days until expiry
 */
export function getDaysUntilExpiry(validUntil: Date | string): number {
  const expiryDate = typeof validUntil === 'string' ? new Date(validUntil) : validUntil;
  const diffMs = expiryDate.getTime() - Date.now();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Format countdown timer
 */
export function formatCountdown(validUntil: Date | string): string {
  const expiryDate = typeof validUntil === 'string' ? new Date(validUntil) : validUntil;
  const diffMs = expiryDate.getTime() - Date.now();

  if (diffMs <= 0) return 'Expired';

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

/**
 * Truncate text to specified length
 */
export function truncateText(text: string, maxLength: number, suffix: string = '...'): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length).trim() + suffix;
}

/**
 * Generate slug from title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Sort posts by date
 */
export function sortPostsByDate(posts: BlogPost[], order: 'asc' | 'desc' = 'desc'): BlogPost[] {
  return [...posts].sort((a, b) => {
    const dateA = new Date(a.publishedAt).getTime();
    const dateB = new Date(b.publishedAt).getTime();
    return order === 'desc' ? dateB - dateA : dateA - dateB;
  });
}

/**
 * Sort posts by popularity
 */
export function sortPostsByPopularity(posts: BlogPost[], order: 'asc' | 'desc' = 'desc'): BlogPost[] {
  return [...posts].sort((a, b) => {
    const popularityA = (a.views || 0) + (a.likes || 0) * 10;
    const popularityB = (b.views || 0) + (b.likes || 0) * 10;
    return order === 'desc' ? popularityB - popularityA : popularityA - popularityB;
  });
}

/**
 * Filter posts by search query
 */
export function filterPostsBySearch(posts: BlogPost[], query: string): BlogPost[] {
  if (!query.trim()) return posts;

  const lowerQuery = query.toLowerCase();
  return posts.filter(
    (post) =>
      post.title.toLowerCase().includes(lowerQuery) ||
      post.excerpt.toLowerCase().includes(lowerQuery) ||
      post.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
      post.author.name.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get posts by tag
 */
export function getPostsByTag(posts: BlogPost[], tag: string): BlogPost[] {
  const lowerTag = tag.toLowerCase();
  return posts.filter((post) => post.tags.some((t) => t.toLowerCase() === lowerTag));
}

/**
 * Get unique tags from posts
 */
export function getAllTags(posts: BlogPost[]): string[] {
  const tagSet = new Set<string>();
  posts.forEach((post) => {
    post.tags.forEach((tag) => tagSet.add(tag));
  });
  return Array.from(tagSet).sort();
}

/**
 * Get posts by author
 */
export function getPostsByAuthor(posts: BlogPost[], authorId: string): BlogPost[] {
  return posts.filter((post) => post.author.id === authorId);
}

/**
 * Paginate posts
 */
export function paginatePosts(
  posts: BlogPost[],
  page: number = 1,
  itemsPerPage: number = 10
): {
  posts: BlogPost[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
  hasPrev: boolean;
} {
  const totalItems = posts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const currentPage = Math.max(1, Math.min(page, totalPages));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  return {
    posts: posts.slice(startIndex, endIndex),
    currentPage,
    totalPages,
    totalItems,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1,
  };
}

/**
 * Generate meta description from post
 */
export function generateMetaDescription(post: BlogPost): string {
  return post.metaDescription || truncateText(post.excerpt, 160);
}

/**
 * Generate meta keywords from post
 */
export function generateMetaKeywords(post: BlogPost): string[] {
  return post.keywords || [...post.tags, post.category, post.author.name];
}
