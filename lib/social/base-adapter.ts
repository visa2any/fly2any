/**
 * Base Social Adapter - Fly2Any Marketing OS
 * Abstract base class for all social platform adapters
 */

import { SocialAdapter, SocialPlatform, SocialPostContent, SocialPostResult, PLATFORM_CONFIGS } from './types';

export abstract class BaseSocialAdapter implements SocialAdapter {
  abstract platform: SocialPlatform;

  abstract post(content: SocialPostContent): Promise<SocialPostResult>;

  isConfigured(): boolean {
    return PLATFORM_CONFIGS[this.platform].enabled;
  }

  formatContent(content: SocialPostContent): string {
    const config = PLATFORM_CONFIGS[this.platform];
    let text = content.text;

    // Add hashtags if space allows
    if (content.hashtags?.length) {
      const hashtags = content.hashtags
        .slice(0, config.hashtagLimit)
        .map(h => h.startsWith('#') ? h : `#${h}`)
        .join(' ');

      if (text.length + hashtags.length + 2 <= config.charLimit) {
        text = `${text}\n\n${hashtags}`;
      }
    }

    // Add link if space allows (Twitter auto-shortens)
    if (content.link && this.platform !== 'twitter') {
      if (text.length + content.link.length + 2 <= config.charLimit) {
        text = `${text}\n\n${content.link}`;
      }
    }

    // Truncate if too long
    if (text.length > config.charLimit) {
      text = text.slice(0, config.charLimit - 3) + '...';
    }

    return text;
  }

  validateContent(content: SocialPostContent): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const config = PLATFORM_CONFIGS[this.platform];

    if (!content.text || content.text.trim().length === 0) {
      errors.push('Content text is required');
    }

    if (content.text && content.text.length > config.charLimit) {
      errors.push(`Text exceeds ${config.charLimit} character limit`);
    }

    if (content.hashtags && content.hashtags.length > config.hashtagLimit) {
      errors.push(`Too many hashtags (max ${config.hashtagLimit})`);
    }

    return { valid: errors.length === 0, errors };
  }

  protected createSuccessResult(postId: string, url?: string, metadata?: Record<string, any>): SocialPostResult {
    return {
      platform: this.platform,
      success: true,
      postId,
      url,
      metadata,
    };
  }

  protected createErrorResult(error: string): SocialPostResult {
    return {
      platform: this.platform,
      success: false,
      error,
    };
  }

  protected async withRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    delayMs: number = 1000
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (i < maxRetries - 1) {
          await new Promise(r => setTimeout(r, delayMs * (i + 1)));
        }
      }
    }

    throw lastError;
  }
}
