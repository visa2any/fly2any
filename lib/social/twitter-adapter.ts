/**
 * Twitter/X Adapter - Fly2Any Marketing OS
 * Posts content to Twitter/X using API v2 with OAuth 1.0a
 */

import { BaseSocialAdapter } from './base-adapter';
import { SocialPlatform, SocialPostContent, SocialPostResult } from './types';
import crypto from 'crypto';

export class TwitterAdapter extends BaseSocialAdapter {
  platform: SocialPlatform = 'twitter';

  private getCredentials() {
    return {
      apiKey: process.env.TWITTER_API_KEY || '',
      apiSecret: process.env.TWITTER_API_SECRET || '',
      accessToken: process.env.TWITTER_ACCESS_TOKEN || '',
      accessSecret: process.env.TWITTER_ACCESS_SECRET || '',
    };
  }

  isConfigured(): boolean {
    const creds = this.getCredentials();
    return !!(creds.apiKey && creds.apiSecret && creds.accessToken && creds.accessSecret);
  }

  /**
   * Generate OAuth 1.0a signature for Twitter API
   */
  private generateOAuthSignature(
    method: string,
    url: string,
    params: Record<string, string>,
    consumerSecret: string,
    tokenSecret: string
  ): string {
    // Create parameter string (sorted alphabetically)
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&');

    // Create signature base string
    const signatureBase = [
      method.toUpperCase(),
      encodeURIComponent(url),
      encodeURIComponent(sortedParams),
    ].join('&');

    // Create signing key
    const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(tokenSecret)}`;

    // Generate HMAC-SHA1 signature
    const signature = crypto
      .createHmac('sha1', signingKey)
      .update(signatureBase)
      .digest('base64');

    return signature;
  }

  /**
   * Build OAuth 1.0a Authorization header
   */
  private buildOAuthHeader(method: string, url: string): string {
    const creds = this.getCredentials();
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const nonce = crypto.randomBytes(16).toString('hex');

    const oauthParams: Record<string, string> = {
      oauth_consumer_key: creds.apiKey,
      oauth_nonce: nonce,
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: timestamp,
      oauth_token: creds.accessToken,
      oauth_version: '1.0',
    };

    // Generate signature
    const signature = this.generateOAuthSignature(
      method,
      url,
      oauthParams,
      creds.apiSecret,
      creds.accessSecret
    );

    oauthParams.oauth_signature = signature;

    // Build header string
    const headerString = Object.keys(oauthParams)
      .sort()
      .map(key => `${encodeURIComponent(key)}="${encodeURIComponent(oauthParams[key])}"`)
      .join(', ');

    return `OAuth ${headerString}`;
  }

  async post(content: SocialPostContent): Promise<SocialPostResult> {
    if (!this.isConfigured()) {
      const creds = this.getCredentials();
      return this.createErrorResult(
        `Twitter not configured. Missing: ${[
          !creds.apiKey && 'TWITTER_API_KEY',
          !creds.apiSecret && 'TWITTER_API_SECRET',
          !creds.accessToken && 'TWITTER_ACCESS_TOKEN',
          !creds.accessSecret && 'TWITTER_ACCESS_SECRET',
        ].filter(Boolean).join(', ')}`
      );
    }

    const validation = this.validateContent(content);
    if (!validation.valid) {
      return this.createErrorResult(validation.errors.join(', '));
    }

    try {
      const text = this.formatContent(content);
      const url = 'https://api.twitter.com/2/tweets';

      // Build OAuth header
      const authHeader = this.buildOAuthHeader('POST', url);

      // Twitter API v2 - Post tweet with OAuth 1.0a
      const response = await this.withRetry(async () => {
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text }),
        });

        const responseText = await res.text();
        let data;
        try {
          data = JSON.parse(responseText);
        } catch {
          throw new Error(`Twitter API error: ${res.status} - ${responseText}`);
        }

        if (!res.ok) {
          const errorDetail = data.detail || data.title || JSON.stringify(data);
          throw new Error(`Twitter API ${res.status}: ${errorDetail}`);
        }

        return data;
      });

      const postId = response.data?.id;
      const twitterHandle = process.env.TWITTER_HANDLE || 'fly2any';
      const postUrl = postId ? `https://twitter.com/${twitterHandle}/status/${postId}` : undefined;

      console.log(`[Twitter] Posted successfully: ${postId}`);

      return this.createSuccessResult(postId, postUrl, {
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
      if (origin && destination && !text.includes(origin)) {
        text = `${origin} → ${destination} from $${price}\n\n${text}`;
      }
    }

    // Add link (Twitter auto-shortens URLs to ~23 chars)
    if (content.link && !text.includes(content.link)) {
      text = `${text}\n\n${content.link}`;
    }

    // Add hashtags (max 5 for engagement)
    if (content.hashtags?.length) {
      const hashtags = content.hashtags
        .slice(0, 5)
        .map(h => h.startsWith('#') ? h : `#${h}`)
        .join(' ');
      text = `${text}\n\n${hashtags}`;
    }

    // Truncate to 280 chars
    if (text.length > 280) {
      text = text.slice(0, 277) + '...';
    }

    return text;
  }
}

export const twitterAdapter = new TwitterAdapter();
