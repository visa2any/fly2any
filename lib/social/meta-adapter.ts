/**
 * Meta (Instagram/Facebook) Adapter - Fly2Any Marketing OS
 * Posts content via Meta Graph API
 */

import { BaseSocialAdapter } from './base-adapter';
import { SocialPlatform, SocialPostContent, SocialPostResult } from './types';

abstract class BaseMetaAdapter extends BaseSocialAdapter {
  protected getCredentials() {
    return {
      accessToken: process.env.META_ACCESS_TOKEN,
      instagramAccountId: process.env.INSTAGRAM_ACCOUNT_ID,
      facebookPageId: process.env.FACEBOOK_PAGE_ID,
      appId: process.env.META_APP_ID,
      appSecret: process.env.META_APP_SECRET,
    };
  }

  protected async graphApi(endpoint: string, method: string = 'POST', body?: any): Promise<any> {
    const creds = this.getCredentials();
    const url = `https://graph.facebook.com/v18.0/${endpoint}`;

    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${creds.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`Meta API error: ${response.status} - ${JSON.stringify(error)}`);
    }

    return response.json();
  }
}

export class InstagramAdapter extends BaseMetaAdapter {
  platform: SocialPlatform = 'instagram';

  isConfigured(): boolean {
    const creds = this.getCredentials();
    return !!(creds.accessToken && creds.instagramAccountId);
  }

  async post(content: SocialPostContent): Promise<SocialPostResult> {
    if (!this.isConfigured()) {
      return this.createErrorResult('Instagram API credentials not configured');
    }

    const validation = this.validateContent(content);
    if (!validation.valid) {
      return this.createErrorResult(validation.errors.join(', '));
    }

    try {
      const creds = this.getCredentials();
      const caption = this.formatContent(content);

      // Instagram requires an image for feed posts
      if (!content.imageUrl) {
        return this.createErrorResult('Instagram requires an image');
      }

      // Step 1: Create media container
      const containerResponse = await this.withRetry(() =>
        this.graphApi(`${creds.instagramAccountId}/media`, 'POST', {
          image_url: content.imageUrl,
          caption,
        })
      );

      const containerId = containerResponse.id;

      // Step 2: Publish the container
      const publishResponse = await this.withRetry(() =>
        this.graphApi(`${creds.instagramAccountId}/media_publish`, 'POST', {
          creation_id: containerId,
        })
      );

      const postId = publishResponse.id;
      console.log(`[Instagram] Posted successfully: ${postId}`);

      return this.createSuccessResult(postId, undefined, {
        containerId,
        mediaId: postId,
      });

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[Instagram] Post failed: ${message}`);
      return this.createErrorResult(message);
    }
  }

  override formatContent(content: SocialPostContent): string {
    let text = content.text;

    // Instagram supports longer captions
    if (content.productType && content.productData) {
      const { origin, destination, price } = content.productData;
      text = `${origin} → ${destination}\nFrom $${price}\n\n${text}`;
    }

    // Instagram loves hashtags
    if (content.hashtags?.length) {
      const hashtags = content.hashtags
        .slice(0, 30)
        .map(h => h.startsWith('#') ? h : `#${h}`)
        .join(' ');
      text = `${text}\n\n.\n.\n.\n${hashtags}`;
    }

    // Add CTA
    if (content.link) {
      text = `${text}\n\nLink in bio`;
    }

    return text.slice(0, 2200);
  }
}

export class FacebookAdapter extends BaseMetaAdapter {
  platform: SocialPlatform = 'facebook';

  isConfigured(): boolean {
    const creds = this.getCredentials();
    return !!(creds.accessToken && creds.facebookPageId);
  }

  async post(content: SocialPostContent): Promise<SocialPostResult> {
    if (!this.isConfigured()) {
      return this.createErrorResult('Facebook API credentials not configured');
    }

    const validation = this.validateContent(content);
    if (!validation.valid) {
      return this.createErrorResult(validation.errors.join(', '));
    }

    try {
      const creds = this.getCredentials();
      const message = this.formatContent(content);

      const body: any = { message };

      // Add link if provided
      if (content.link) {
        body.link = content.link;
      }

      // Post with or without photo
      let endpoint = `${creds.facebookPageId}/feed`;
      if (content.imageUrl) {
        endpoint = `${creds.facebookPageId}/photos`;
        body.url = content.imageUrl;
      }

      const response = await this.withRetry(() =>
        this.graphApi(endpoint, 'POST', body)
      );

      const postId = response.id || response.post_id;
      const url = `https://facebook.com/${postId}`;

      console.log(`[Facebook] Posted successfully: ${postId}`);

      return this.createSuccessResult(postId, url, response);

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[Facebook] Post failed: ${message}`);
      return this.createErrorResult(message);
    }
  }

  override formatContent(content: SocialPostContent): string {
    let text = content.text;

    // Facebook-specific formatting
    if (content.productType === 'flight' && content.productData) {
      const { origin, destination, price, airline } = content.productData;
      text = `✈️ FLIGHT DEAL: ${origin} → ${destination}\n💰 From $${price}${airline ? ` on ${airline}` : ''}\n\n${text}`;
    }

    // Add hashtags
    if (content.hashtags?.length) {
      const hashtags = content.hashtags
        .slice(0, 10)
        .map(h => h.startsWith('#') ? h : `#${h}`)
        .join(' ');
      text = `${text}\n\n${hashtags}`;
    }

    return text;
  }
}

export const instagramAdapter = new InstagramAdapter();
export const facebookAdapter = new FacebookAdapter();
