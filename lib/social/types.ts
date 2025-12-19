/**
 * Social Marketing Types - Fly2Any Marketing OS
 * Core type definitions for multi-platform social posting
 */

export type SocialPlatform = 'twitter' | 'instagram' | 'facebook' | 'tiktok' | 'blog';

export interface SocialPostContent {
  text: string;
  title?: string;
  imageUrl?: string;
  videoUrl?: string;
  link?: string;
  hashtags?: string[];
  mentions?: string[];
  productType?: 'flight' | 'hotel' | 'tour' | 'transfer';
  productData?: Record<string, any>;
}

export interface SocialPostResult {
  platform: SocialPlatform;
  success: boolean;
  postId?: string;
  url?: string;
  error?: string;
  metadata?: Record<string, any>;
}

export interface PlatformConfig {
  enabled: boolean;
  charLimit: number;
  hashtagLimit: number;
  imageAspectRatio: '1:1' | '4:5' | '9:16' | '16:9';
  supportsVideo: boolean;
  supportsCarousel: boolean;
  rateLimitPerHour: number;
}

export const PLATFORM_CONFIGS: Record<SocialPlatform, PlatformConfig> = {
  twitter: {
    enabled: true,
    charLimit: 280,
    hashtagLimit: 5,
    imageAspectRatio: '16:9',
    supportsVideo: true,
    supportsCarousel: false,
    rateLimitPerHour: 50,
  },
  instagram: {
    enabled: true,
    charLimit: 2200,
    hashtagLimit: 30,
    imageAspectRatio: '1:1',
    supportsVideo: true,
    supportsCarousel: true,
    rateLimitPerHour: 25,
  },
  facebook: {
    enabled: true,
    charLimit: 63206,
    hashtagLimit: 10,
    imageAspectRatio: '1:1',
    supportsVideo: true,
    supportsCarousel: true,
    rateLimitPerHour: 50,
  },
  tiktok: {
    enabled: true,
    charLimit: 2200,
    hashtagLimit: 5,
    imageAspectRatio: '9:16',
    supportsVideo: true,
    supportsCarousel: false,
    rateLimitPerHour: 10,
  },
  blog: {
    enabled: true,
    charLimit: 100000,
    hashtagLimit: 20,
    imageAspectRatio: '16:9',
    supportsVideo: true,
    supportsCarousel: true,
    rateLimitPerHour: 100,
  },
};

// Optimal posting times by platform (UTC hours)
export const OPTIMAL_POST_TIMES: Record<SocialPlatform, number[]> = {
  twitter: [13, 17, 21, 1],      // 8am, 12pm, 4pm, 8pm EST
  instagram: [16, 19, 0],        // 11am, 2pm, 7pm EST
  facebook: [14, 18, 21],        // 9am, 1pm, 4pm EST
  tiktok: [0, 2, 4],             // 7pm, 9pm, 11pm EST
  blog: [14],                    // 9am EST
};

export interface SocialAdapter {
  platform: SocialPlatform;
  post(content: SocialPostContent): Promise<SocialPostResult>;
  formatContent(content: SocialPostContent): string;
  validateContent(content: SocialPostContent): { valid: boolean; errors: string[] };
  isConfigured(): boolean;
}
