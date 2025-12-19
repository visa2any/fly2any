/**
 * TikTok Adapter - Fly2Any Marketing OS
 * Posts content via TikTok Content Posting API
 */

import { BaseSocialAdapter } from './base-adapter';
import { SocialPlatform, SocialPostContent, SocialPostResult } from './types';

export class TikTokAdapter extends BaseSocialAdapter {
  platform: SocialPlatform = 'tiktok';

  private getCredentials() {
    return {
      accessToken: process.env.TIKTOK_ACCESS_TOKEN,
      openId: process.env.TIKTOK_OPEN_ID,
      clientKey: process.env.TIKTOK_CLIENT_KEY,
      clientSecret: process.env.TIKTOK_CLIENT_SECRET,
    };
  }

  isConfigured(): boolean {
    const creds = this.getCredentials();
    return !!(creds.accessToken && creds.openId);
  }

  async post(content: SocialPostContent): Promise<SocialPostResult> {
    if (!this.isConfigured()) {
      return this.createErrorResult('TikTok API credentials not configured');
    }

    // TikTok requires video content for direct posting
    if (!content.videoUrl) {
      // For image-only content, we queue for manual posting or use photo mode
      return this.createErrorResult('TikTok requires video content for API posting. Image queued for manual posting.');
    }

    const validation = this.validateContent(content);
    if (!validation.valid) {
      return this.createErrorResult(validation.errors.join(', '));
    }

    try {
      const creds = this.getCredentials();
      const caption = this.formatContent(content);

      // TikTok Content Posting API
      // Note: Requires approved app access
      const initResponse = await this.withRetry(async () => {
        const res = await fetch('https://open.tiktokapis.com/v2/post/publish/video/init/', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${creds.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            post_info: {
              title: caption,
              privacy_level: 'PUBLIC_TO_EVERYONE',
              disable_duet: false,
              disable_stitch: false,
              disable_comment: false,
            },
            source_info: {
              source: 'PULL_FROM_URL',
              video_url: content.videoUrl,
            },
          }),
        });

        if (!res.ok) {
          const error = await res.json().catch(() => ({}));
          throw new Error(`TikTok API error: ${res.status} - ${JSON.stringify(error)}`);
        }

        return res.json();
      });

      const publishId = initResponse.data?.publish_id;
      console.log(`[TikTok] Video upload initiated: ${publishId}`);

      return this.createSuccessResult(publishId, undefined, {
        status: 'processing',
        publishId,
      });

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[TikTok] Post failed: ${message}`);
      return this.createErrorResult(message);
    }
  }

  override formatContent(content: SocialPostContent): string {
    let text = content.text;

    // TikTok-specific formatting (short, punchy)
    if (content.productType === 'flight' && content.productData) {
      const { origin, destination, price } = content.productData;
      text = `${origin} ➡️ ${destination} ONLY $${price}! ${text}`;
    }

    // Add hashtags (TikTok loves them)
    if (content.hashtags?.length) {
      const hashtags = content.hashtags
        .slice(0, 5)
        .map(h => h.startsWith('#') ? h : `#${h}`)
        .join(' ');
      text = `${text} ${hashtags}`;
    }

    // Add travel hashtags
    text = `${text} #TravelTikTok #Fly2Any #TravelDeals`;

    return text.slice(0, 2200);
  }
}

export const tiktokAdapter = new TikTokAdapter();
