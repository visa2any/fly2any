export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  content?: string;
  image?: string;
  category?: string;
  tags?: string[];
  date?: string;
  author?: string;
  readTime?: number;
}

/**
 * Calculate estimated reading time for content
 * Assumes average reading speed of 200-250 words per minute
 */
export const calculateReadTime = (content: string): number => {
  if (!content) return 0;

  // Remove HTML tags if present
  const textContent = content.replace(/<[^>]*>/g, '');

  // Count words (split by whitespace)
  const words = textContent.trim().split(/\s+/).length;

  // Calculate minutes (assuming 225 words per minute)
  const minutes = Math.ceil(words / 225);

  return Math.max(1, minutes); // Minimum 1 minute
};

/**
 * Format date based on language
 */
export const formatDate = (
  date: Date | string,
  language: 'en' | 'pt' | 'es' = 'en'
): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }

    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };

    const locales = {
      en: 'en-US',
      pt: 'pt-BR',
      es: 'es-ES',
    };

    return dateObj.toLocaleDateString(locales[language], options);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

/**
 * Format relative time (e.g., "2 days ago")
 */
export const formatRelativeTime = (
  date: Date | string,
  language: 'en' | 'pt' | 'es' = 'en'
): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
    };

    const translations = {
      en: {
        year: ['year', 'years'],
        month: ['month', 'months'],
        week: ['week', 'weeks'],
        day: ['day', 'days'],
        hour: ['hour', 'hours'],
        minute: ['minute', 'minutes'],
        ago: 'ago',
        justNow: 'just now',
      },
      pt: {
        year: ['ano', 'anos'],
        month: ['mes', 'meses'],
        week: ['semana', 'semanas'],
        day: ['dia', 'dias'],
        hour: ['hora', 'horas'],
        minute: ['minuto', 'minutos'],
        ago: 'atras',
        justNow: 'agora mesmo',
      },
      es: {
        year: ['ano', 'anos'],
        month: ['mes', 'meses'],
        week: ['semana', 'semanas'],
        day: ['dia', 'dias'],
        hour: ['hora', 'horas'],
        minute: ['minuto', 'minutos'],
        ago: 'hace',
        justNow: 'justo ahora',
      },
    };

    const t = translations[language];

    if (diffInSeconds < 60) {
      return t.justNow;
    }

    for (const [key, seconds] of Object.entries(intervals)) {
      const interval = Math.floor(diffInSeconds / seconds);
      if (interval >= 1) {
        const unit = t[key as keyof typeof t] as string[];
        const unitText = interval === 1 ? unit[0] : unit[1];
        return language === 'es'
          ? `${t.ago} ${interval} ${unitText}`
          : `${interval} ${unitText} ${t.ago}`;
      }
    }

    return t.justNow;
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return '';
  }
};

/**
 * Share to WhatsApp
 */
export const shareToWhatsApp = (url: string, title: string): void => {
  const text = encodeURIComponent(`${title} - ${url}`);
  const whatsappUrl = `https://wa.me/?text=${text}`;

  if (typeof window !== 'undefined') {
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  }
};

/**
 * Share to social media platforms
 */
export const shareToSocial = (
  platform: string,
  url: string,
  title: string,
  description?: string
): void => {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = description ? encodeURIComponent(description) : '';

  const shareUrls: Record<string, string> = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
  };

  const shareUrl = shareUrls[platform.toLowerCase()];

  if (shareUrl && typeof window !== 'undefined') {
    if (platform === 'email') {
      window.location.href = shareUrl;
    } else {
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
    }
  } else {
    console.warn(`Unsupported platform: ${platform}`);
  }
};

/**
 * Native Web Share API (fallback to custom share)
 */
export const shareNative = async (
  url: string,
  title: string,
  text?: string
): Promise<boolean> => {
  if (typeof window === 'undefined') return false;

  if (navigator.share) {
    try {
      await navigator.share({
        title,
        text,
        url,
      });
      return true;
    } catch (error) {
      // User cancelled or error occurred
      console.log('Share cancelled or failed:', error);
      return false;
    }
  }

  return false;
};

/**
 * Calculate similarity score between two posts
 */
const calculateSimilarity = (post1: BlogPost, post2: BlogPost): number => {
  let score = 0;

  // Same category gets high score
  if (post1.category && post2.category && post1.category === post2.category) {
    score += 50;
  }

  // Shared tags
  if (post1.tags && post2.tags) {
    const sharedTags = post1.tags.filter((tag) => post2.tags?.includes(tag));
    score += sharedTags.length * 10;
  }

  // Title similarity (simple word matching)
  if (post1.title && post2.title) {
    const words1 = post1.title.toLowerCase().split(/\s+/);
    const words2 = post2.title.toLowerCase().split(/\s+/);
    const sharedWords = words1.filter((word) =>
      word.length > 3 && words2.includes(word)
    );
    score += sharedWords.length * 5;
  }

  return score;
};

/**
 * Get related posts based on current post
 */
export const getRelatedPosts = (
  currentPost: BlogPost,
  allPosts: BlogPost[],
  limit: number = 3
): BlogPost[] => {
  if (!currentPost || !allPosts || allPosts.length === 0) {
    return [];
  }

  // Filter out current post and calculate similarity scores
  const postsWithScores = allPosts
    .filter((post) => post.id !== currentPost.id)
    .map((post) => ({
      post,
      score: calculateSimilarity(currentPost, post),
    }))
    .sort((a, b) => b.score - a.score);

  // Return top posts
  return postsWithScores.slice(0, limit).map((item) => item.post);
};

/**
 * Filter posts by category
 */
export const filterPostsByCategory = (
  posts: BlogPost[],
  category: string
): BlogPost[] => {
  if (!category || !posts) return posts;

  return posts.filter(
    (post) =>
      post.category &&
      post.category.toLowerCase() === category.toLowerCase()
  );
};

/**
 * Filter posts by tag
 */
export const filterPostsByTag = (
  posts: BlogPost[],
  tag: string
): BlogPost[] => {
  if (!tag || !posts) return posts;

  return posts.filter(
    (post) =>
      post.tags &&
      post.tags.some((t) => t.toLowerCase() === tag.toLowerCase())
  );
};

/**
 * Search posts by query (title, excerpt, content)
 */
export const searchPosts = (
  posts: BlogPost[],
  query: string
): BlogPost[] => {
  if (!query || !posts) return posts;

  const searchTerm = query.toLowerCase().trim();

  return posts.filter((post) => {
    const titleMatch = post.title?.toLowerCase().includes(searchTerm);
    const excerptMatch = post.excerpt?.toLowerCase().includes(searchTerm);
    const contentMatch = post.content?.toLowerCase().includes(searchTerm);
    const categoryMatch = post.category?.toLowerCase().includes(searchTerm);
    const tagsMatch = post.tags?.some((tag) =>
      tag.toLowerCase().includes(searchTerm)
    );

    return (
      titleMatch || excerptMatch || contentMatch || categoryMatch || tagsMatch
    );
  });
};

/**
 * Sort posts by date (newest first)
 */
export const sortPostsByDate = (
  posts: BlogPost[],
  order: 'asc' | 'desc' = 'desc'
): BlogPost[] => {
  return [...posts].sort((a, b) => {
    const dateA = a.date ? new Date(a.date).getTime() : 0;
    const dateB = b.date ? new Date(b.date).getTime() : 0;

    return order === 'desc' ? dateB - dateA : dateA - dateB;
  });
};

/**
 * Get posts by multiple categories
 */
export const filterPostsByCategories = (
  posts: BlogPost[],
  categories: string[]
): BlogPost[] => {
  if (!categories || categories.length === 0 || !posts) return posts;

  const lowerCategories = categories.map((cat) => cat.toLowerCase());

  return posts.filter(
    (post) =>
      post.category &&
      lowerCategories.includes(post.category.toLowerCase())
  );
};

/**
 * Paginate posts
 */
export const paginatePosts = (
  posts: BlogPost[],
  page: number,
  perPage: number = 9
): {
  posts: BlogPost[];
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
} => {
  const totalPages = Math.ceil(posts.length / perPage);
  const currentPage = Math.max(1, Math.min(page, totalPages));
  const startIndex = (currentPage - 1) * perPage;
  const endIndex = startIndex + perPage;

  return {
    posts: posts.slice(startIndex, endIndex),
    totalPages,
    currentPage,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };
};

/**
 * Copy to clipboard
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  if (typeof window === 'undefined') return false;

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        textArea.remove();
        return true;
      } catch (error) {
        console.error('Fallback copy failed:', error);
        textArea.remove();
        return false;
      }
    }
  } catch (error) {
    console.error('Copy to clipboard failed:', error);
    return false;
  }
};

/**
 * Truncate text to specified length
 */
export const truncateText = (
  text: string,
  maxLength: number,
  ellipsis: string = '...'
): string => {
  if (!text || text.length <= maxLength) return text;

  return text.substring(0, maxLength - ellipsis.length).trim() + ellipsis;
};

/**
 * Slugify text (convert to URL-friendly string)
 */
export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-'); // Remove multiple hyphens
};
