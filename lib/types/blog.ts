/**
 * Blog Type Definitions
 *
 * Complete TypeScript interfaces for the Fly2Any travel blog system
 */

// Content type enumeration
export enum ContentType {
  BLOG = 'blog',
  NEWS = 'news',
  DEAL = 'deal',
  GUIDE = 'guide',
  TIP = 'tip',
  STORY = 'story'
}

// Category type (union of string literals)
export type CategoryType = 'blog' | 'news' | 'deal' | 'guide' | 'tip' | 'story';

// Urgency levels for news and deals
export enum UrgencyLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Author interface
export interface Author {
  id: string;
  name: string;
  avatar?: string;
  bio?: string;
  role?: string;
  social?: {
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
}

// Featured image interface
export interface FeaturedImage {
  url: string;
  alt: string;
  credit?: string;
  width?: number;
  height?: number;
}

// Deal-specific metadata
export interface DealMetadata {
  originalPrice: number;
  discountedPrice: number;
  discount: number; // percentage
  validUntil: Date;
  destinations?: string[];
  restrictions?: string[];
  bookingUrl?: string;
}

// News-specific metadata
export interface NewsMetadata {
  urgency: UrgencyLevel;
  source?: string;
  relatedDestinations?: string[];
  expiresAt?: Date;
}

// Main BlogPost interface
export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  featuredImage: FeaturedImage;
  category: CategoryType;
  tags: string[];
  author: Author;
  publishedAt: Date;
  updatedAt?: Date;
  readTime: number; // in minutes
  isFeatured: boolean;
  isPremium?: boolean; // Premium article with enhanced components
  views?: number;
  likes?: number;

  // Optional metadata based on content type
  dealMetadata?: DealMetadata;
  newsMetadata?: NewsMetadata;

  // SEO metadata
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
}

// Blog post preview (for lists and grids)
export interface BlogPostPreview extends Omit<BlogPost, 'content'> {
  contentPreview?: string; // First 200 characters
}

// Filter and search interfaces
export interface BlogFilters {
  category?: CategoryType;
  tags?: string[];
  author?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
  isFeatured?: boolean;
  searchQuery?: string;
}

// Pagination interface
export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

// API response interface
export interface BlogPostsResponse {
  posts: BlogPostPreview[];
  pagination: PaginationMeta;
  filters?: BlogFilters;
}

// Category metadata
export interface CategoryMetadata {
  name: CategoryType;
  displayName: string;
  description: string;
  icon?: string;
  color?: string;
}

// Related posts interface
export interface RelatedPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  featuredImage: FeaturedImage;
  category: CategoryType;
  readTime: number;
  publishedAt: Date;
}
