/**
 * Distribution Engine - Multi-Platform Social Posting
 *
 * Automated posting to:
 * - Twitter/X
 * - Instagram
 * - Facebook
 * - Telegram
 * - LinkedIn
 * - Reddit
 */

export interface PostContent {
  text: string;
  image?: string;
  link?: string;
  hashtags?: string[];
}

export interface PostResult {
  platform: string;
  success: boolean;
  postId?: string;
  url?: string;
  error?: string;
}

// Platform-specific character limits
const CHAR_LIMITS = {
  twitter: 280,
  instagram: 2200,
  facebook: 63206,
  linkedin: 3000,
  telegram: 4096,
  reddit: 40000,
};

// Optimal posting times (EST)
export const OPTIMAL_POSTING_TIMES = {
  twitter: ['08:00', '12:00', '17:00', '20:00'],
  instagram: ['11:00', '14:00', '19:00'],
  telegram: ['09:00', '13:00', '18:00', '21:00'],
  linkedin: ['08:00', '12:00', '17:00'],
  facebook: ['09:00', '13:00', '16:00'],
  reddit: ['06:00', '08:00', '12:00'],
  tiktok: ['19:00', '21:00', '23:00'],
};

/**
 * Format content for specific platform
 */
export function formatForPlatform(
  content: PostContent,
  platform: keyof typeof CHAR_LIMITS
): string {
  const limit = CHAR_LIMITS[platform];
  let text = content.text;

  // Add hashtags if space allows
  if (content.hashtags && content.hashtags.length > 0) {
    const hashtagText = content.hashtags.map(h => `#${h}`).join(' ');
    if (text.length + hashtagText.length + 2 <= limit) {
      text = `${text}\n\n${hashtagText}`;
    }
  }

  // Add link if space allows
  if (content.link && text.length + content.link.length + 2 <= limit) {
    text = `${text}\n\n${content.link}`;
  }

  // Truncate if still too long
  if (text.length > limit) {
    text = text.slice(0, limit - 3) + '...';
  }

  return text;
}

/**
 * Post to Twitter/X
 */
export async function postToTwitter(content: PostContent): Promise<PostResult> {
  const text = formatForPlatform(content, 'twitter');

  try {
    // Twitter API v2 integration
    // Note: Requires OAuth 2.0 setup
    const response = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error(`Twitter API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      platform: 'twitter',
      success: true,
      postId: data.data?.id,
      url: `https://twitter.com/fly2any/status/${data.data?.id}`,
    };
  } catch (error) {
    return {
      platform: 'twitter',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Post to Telegram Channel
 */
export async function postToTelegram(content: PostContent): Promise<PostResult> {
  const text = formatForPlatform(content, 'telegram');
  const channelId = process.env.TELEGRAM_CHANNEL_ID;
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: channelId,
          text,
          parse_mode: 'HTML',
          disable_web_page_preview: false,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Telegram API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      platform: 'telegram',
      success: true,
      postId: data.result?.message_id?.toString(),
    };
  } catch (error) {
    return {
      platform: 'telegram',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Post to multiple platforms
 */
export async function postToAll(
  content: PostContent,
  platforms: string[] = ['twitter', 'telegram']
): Promise<PostResult[]> {
  const results: PostResult[] = [];

  for (const platform of platforms) {
    switch (platform) {
      case 'twitter':
        results.push(await postToTwitter(content));
        break;
      case 'telegram':
        results.push(await postToTelegram(content));
        break;
      // Add more platforms as needed
      default:
        results.push({
          platform,
          success: false,
          error: 'Platform not implemented',
        });
    }

    // Small delay between posts to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  return results;
}

/**
 * Generate deal post for distribution
 */
export function createDealPost(deal: {
  origin: string;
  destination: string;
  price: number;
  savings?: number;
  url: string;
}): PostContent {
  const savingsText = deal.savings ? ` (Save $${deal.savings}!)` : '';

  return {
    text: `✈️ FLIGHT DEAL: ${deal.origin} → ${deal.destination} from $${deal.price}${savingsText}\n\nBook now before prices go up!`,
    link: deal.url,
    hashtags: ['TravelDeals', 'CheapFlights', 'Fly2Any', deal.destination.replace(/\s/g, '')],
  };
}

/**
 * Schedule post for optimal time
 */
export function getNextOptimalTime(platform: keyof typeof OPTIMAL_POSTING_TIMES): Date {
  const times = OPTIMAL_POSTING_TIMES[platform];
  const now = new Date();
  const today = now.toISOString().split('T')[0];

  for (const time of times) {
    const scheduled = new Date(`${today}T${time}:00-05:00`); // EST
    if (scheduled > now) {
      return scheduled;
    }
  }

  // If all times passed today, schedule for tomorrow's first slot
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  return new Date(`${tomorrowStr}T${times[0]}:00-05:00`);
}

/**
 * Posting queue interface
 */
export interface ScheduledPost {
  id: string;
  content: PostContent;
  platforms: string[];
  scheduledAt: Date;
  status: 'pending' | 'posted' | 'failed';
  results?: PostResult[];
}

/**
 * Reddit post templates
 */
export const REDDIT_TEMPLATES = {
  sideProject: (deal: { origin: string; destination: string; price: number }) => ({
    subreddit: 'SideProject',
    title: `I built a flight search engine - found ${deal.origin} to ${deal.destination} for $${deal.price}`,
    text: `Hey everyone! I've been working on fly2any.com, a flight search platform that aggregates prices and uses AI for recommendations.\n\nJust found this deal and wanted to share!\n\nWould love any feedback.`,
  }),

  travelDeals: (deal: { origin: string; destination: string; price: number; url: string }) => ({
    subreddit: 'TravelDeals',
    title: `[Flight Deal] ${deal.origin} to ${deal.destination} - $${deal.price}`,
    text: `Found this deal on Fly2Any:\n\n- Route: ${deal.origin} → ${deal.destination}\n- Price: $${deal.price}\n- Link: ${deal.url}\n\nPrices subject to change.`,
  }),
};
