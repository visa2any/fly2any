/**
 * Telegram Adapter - Fly2Any Marketing OS
 * Posts content to Telegram channel/groups
 */

import { BaseSocialAdapter } from './base-adapter';
import { SocialPlatform, SocialPostContent, SocialPostResult } from './types';

export class TelegramAdapter extends BaseSocialAdapter {
  platform: SocialPlatform = 'twitter'; // Using twitter slot since telegram isn't a platform type yet

  private getCredentials() {
    return {
      botToken: process.env.TELEGRAM_BOT_TOKEN,
      channelId: process.env.TELEGRAM_CHANNEL_ID || process.env.TELEGRAM_ADMIN_CHAT_IDS?.split(',')[0],
    };
  }

  isConfigured(): boolean {
    const creds = this.getCredentials();
    return !!(creds.botToken && creds.channelId);
  }

  async post(content: SocialPostContent): Promise<SocialPostResult> {
    if (!this.isConfigured()) {
      return {
        platform: 'twitter', // placeholder
        success: false,
        error: 'Telegram credentials not configured',
      };
    }

    try {
      const creds = this.getCredentials();
      const text = this.formatContent(content);

      // Send message with optional image
      let response;

      if (content.imageUrl) {
        // Send photo with caption
        response = await this.withRetry(async () => {
          const res = await fetch(`https://api.telegram.org/bot${creds.botToken}/sendPhoto`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: creds.channelId,
              photo: content.imageUrl,
              caption: text,
              parse_mode: 'HTML',
            }),
          });

          if (!res.ok) {
            const error = await res.json().catch(() => ({}));
            throw new Error(`Telegram API error: ${res.status} - ${JSON.stringify(error)}`);
          }

          return res.json();
        });
      } else {
        // Send text message
        response = await this.withRetry(async () => {
          const res = await fetch(`https://api.telegram.org/bot${creds.botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: creds.channelId,
              text,
              parse_mode: 'HTML',
              disable_web_page_preview: false,
            }),
          });

          if (!res.ok) {
            const error = await res.json().catch(() => ({}));
            throw new Error(`Telegram API error: ${res.status} - ${JSON.stringify(error)}`);
          }

          return res.json();
        });
      }

      const messageId = response.result?.message_id?.toString();
      console.log(`[Telegram] Posted successfully: ${messageId}`);

      return {
        platform: 'twitter', // placeholder
        success: true,
        postId: messageId,
        metadata: { telegram: true, chatId: creds.channelId },
      };

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[Telegram] Post failed: ${message}`);
      return {
        platform: 'twitter',
        success: false,
        error: message,
      };
    }
  }

  override formatContent(content: SocialPostContent): string {
    let text = '';

    // Telegram supports HTML formatting
    if (content.productType === 'flight' && content.productData) {
      const { origin, destination, price, airline } = content.productData;
      text = `✈️ <b>FLIGHT DEAL</b>\n\n`;
      text += `<b>${origin} → ${destination}</b>\n`;
      text += `💰 From <b>$${price}</b>${airline ? ` on ${airline}` : ''}\n\n`;
      text += content.text;
    } else if (content.productType === 'hotel' && content.productData) {
      const { name, city, price } = content.productData;
      text = `🏨 <b>HOTEL DEAL</b>\n\n`;
      text += `<b>${name}</b>\n`;
      text += `📍 ${city}\n`;
      text += `💰 From <b>$${price}</b>/night\n\n`;
      text += content.text;
    } else {
      text = content.text;
    }

    // Add link
    if (content.link) {
      text += `\n\n🔗 <a href="${content.link}">Book Now</a>`;
    }

    // Add hashtags
    if (content.hashtags?.length) {
      const tags = content.hashtags.slice(0, 5).map(h => `#${h.replace(/\s/g, '')}`).join(' ');
      text += `\n\n${tags}`;
    }

    return text.slice(0, 4096);
  }
}

export const telegramAdapter = new TelegramAdapter();

/**
 * Direct Telegram posting function for use with existing distribution engine
 */
export async function postToTelegramDirect(content: {
  text: string;
  imageUrl?: string;
  link?: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHANNEL_ID || process.env.TELEGRAM_ADMIN_CHAT_IDS?.split(',')[0];

  if (!botToken || !chatId) {
    return { success: false, error: 'Telegram not configured' };
  }

  try {
    let text = content.text;
    if (content.link) {
      text += `\n\n🔗 ${content.link}`;
    }

    const endpoint = content.imageUrl ? 'sendPhoto' : 'sendMessage';
    const body: any = { chat_id: chatId, parse_mode: 'HTML' };

    if (content.imageUrl) {
      body.photo = content.imageUrl;
      body.caption = text;
    } else {
      body.text = text;
      body.disable_web_page_preview = false;
    }

    const response = await fetch(`https://api.telegram.org/bot${botToken}/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!data.ok) {
      throw new Error(data.description || 'Telegram error');
    }

    return {
      success: true,
      messageId: data.result?.message_id?.toString(),
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
