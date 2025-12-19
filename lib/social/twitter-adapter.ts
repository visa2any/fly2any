/**
 * Twitter/X Adapter - Fly2Any Marketing OS
 * Posts content to Twitter/X using API v2
 */

import { BaseSocialAdapter } from './base-adapter';
import { SocialPlatform, SocialPostContent, SocialPostResult } from './types';

export class TwitterAdapter extends BaseSocialAdapter {
  platform: SocialPlatform = 'twitter';

  private getCredentials() {
    return {
      apiKey: process.env.TWITTER_API_KEY,
      apiSecret: process.env.TWITTER_API_SECRET,
      accessToken: process.env.TWITTER_ACCESS_TOKEN,
      accessSecret: process.env.TWITTER_ACCESS_SECRET,
      bearerToken: process.env.TWITTER_BEARER_TOKEN,
    };
  }

  isConfigured(): boolean {
    const creds = this.getCredentials();
    return !!(creds.bearerToken || (creds.accessToken && creds.accessSecret));
  }

  async post(content: SocialPostContent): Promise<SocialPostResult> {
    if (!this.isConfigured()) {
      return this.createErrorResult('Twitter API credentials not configured');
    }

    const validation = this.validateContent(content);
    if (!validation.valid) {
      return this.createErrorResult(validation.errors.join(', '));
    }

    try {
      const text = this.formatContent(content);
      const creds = this.getCredentials();

      // Twitter API v2 - Post tweet
      const response = await this.withRetry(async () => {
        const res = await fetch('https://api.twitter.com/2/tweets', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${creds.bearerToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text }),
        });

        if (!res.ok) {
          const error = await res.json().catch(() => ({}));
          throw new Error(`Twitter API error: ${res.status} - ${JSON.stringify(error)}`);
        }

        return res.json();
      });

      const postId = response.data?.id;
      const url = postId ? `https://twitter.com/fly2any/status/${postId}` : undefined;

      console.log(`[Twitter] Posted successfully: ${postId}`);

      return this.createSuccessResult(postId, url, {
        tweetData: response.data,
      });

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[Twitter] Post failed: ${message}`);
      return this.createErrorResult(message);
    }
  }

  override formatContent(content: SocialPostContent): string {
    let text = content.text;

    // Twitter-specific formatting for deals
    if (content.productType === 'flight' && content.productData) {
      const { origin, destination, price } = content.productData;
      if (!text.includes(origin)) {
        text = `${origin} → ${destination} from $${price}\n\n${text}`;
      }
    }

    // Add link (Twitter auto-shortens URLs)
    if (content.link && !text.includes(content.link)) {
      text = `${text}\n\n${content.link}`;
    }

    // Add hashtags
    if (content.hashtags?.length) {
      const hashtags = content.hashtags
        .slice(0, 5)
        .map(h => h.startsWith('#') ? h : `#${h}`)
        .join(' ');
      text = `${text}\n\n${hashtags}`;
    }

    // Truncate to 280 chars (accounting for t.co URL shortening)
    if (text.length > 280) {
      text = text.slice(0, 277) + '...';
    }

    return text;
  }
}

export const twitterAdapter = new TwitterAdapter();
