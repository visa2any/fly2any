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
 * Post to Instagram (via Graph API)
 */
export async function postToInstagram(content: PostContent): Promise<PostResult> {
  const text = formatForPlatform(content, 'instagram');
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  const igUserId = process.env.INSTAGRAM_USER_ID;

  try {
    if (!accessToken || !igUserId) {
      throw new Error('Instagram credentials not configured');
    }

    // Create media container
    const containerRes = await fetch(
      `https://graph.facebook.com/v18.0/${igUserId}/media`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caption: text,
          image_url: content.image,
          access_token: accessToken,
        }),
      }
    );

    if (!containerRes.ok) {
      throw new Error(`Instagram container error: ${containerRes.status}`);
    }

    const containerData = await containerRes.json();
    const creationId = containerData.id;

    // Publish media
    const publishRes = await fetch(
      `https://graph.facebook.com/v18.0/${igUserId}/media_publish`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creation_id: creationId,
          access_token: accessToken,
        }),
      }
    );

    if (!publishRes.ok) {
      throw new Error(`Instagram publish error: ${publishRes.status}`);
    }

    const publishData = await publishRes.json();
    return {
      platform: 'instagram',
      success: true,
      postId: publishData.id,
      url: `https://www.instagram.com/p/${publishData.id}`,
    };
  } catch (error) {
    return {
      platform: 'instagram',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Post to Facebook Page
 */
export async function postToFacebook(content: PostContent): Promise<PostResult> {
  const text = formatForPlatform(content, 'facebook');
  const accessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  const pageId = process.env.FACEBOOK_PAGE_ID;

  try {
    if (!accessToken || !pageId) {
      throw new Error('Facebook credentials not configured');
    }

    const response = await fetch(
      `https://graph.facebook.com/v18.0/${pageId}/feed`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          link: content.link,
          access_token: accessToken,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Facebook API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      platform: 'facebook',
      success: true,
      postId: data.id,
      url: `https://www.facebook.com/${pageId}/posts/${data.id}`,
    };
  } catch (error) {
    return {
      platform: 'facebook',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Post to LinkedIn
 */
export async function postToLinkedIn(content: PostContent): Promise<PostResult> {
  const text = formatForPlatform(content, 'linkedin');
  const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;
  const personId = process.env.LINKEDIN_PERSON_ID; // urn:li:person:xxx

  try {
    if (!accessToken || !personId) {
      throw new Error('LinkedIn credentials not configured');
    }

    const response = await fetch(
      'https://api.linkedin.com/v2/ugcPosts',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0',
        },
        body: JSON.stringify({
          author: personId,
          lifecycleState: 'PUBLISHED',
          specificContent: {
            'com.linkedin.ugc.ShareContent': {
              shareCommentary: {
                text: text,
              },
              shareMediaCategory: 'NONE',
            },
          },
          visibility: {
            'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`LinkedIn API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      platform: 'linkedin',
      success: true,
      postId: data.id,
      url: `https://www.linkedin.com/feed/update/${data.id}`,
    };
  } catch (error) {
    return {
      platform: 'linkedin',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Post to Reddit
 */
export async function postToReddit(
  content: PostContent,
  subreddit: string = 'TravelDeals'
): Promise<PostResult> {
  const text = formatForPlatform(content, 'reddit');
  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;
  const username = process.env.REDDIT_USERNAME;
  const password = process.env.REDDIT_PASSWORD;

  try {
    if (!clientId || !clientSecret || !username || !password) {
      throw new Error('Reddit credentials not configured');
    }

    // Get access token
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const tokenRes = await fetch('https://www.reddit.com/api/v1/access_token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `grant_type=password&username=${username}&password=${password}`,
    });

    if (!tokenRes.ok) {
      throw new Error(`Reddit auth error: ${tokenRes.status}`);
    }

    const { access_token } = await tokenRes.json();

    // Submit post
    const postRes = await fetch('https://oauth.reddit.com/api/submit', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Fly2Any/1.0',
      },
      body: `sr=${subreddit}&kind=self&title=${encodeURIComponent(content.text.slice(0, 300))}&text=${encodeURIComponent(text)}`,
    });

    if (!postRes.ok) {
      throw new Error(`Reddit post error: ${postRes.status}`);
    }

    const data = await postRes.json();
    return {
      platform: 'reddit',
      success: true,
      postId: data.json?.data?.id,
      url: data.json?.data?.url,
    };
  } catch (error) {
    return {
      platform: 'reddit',
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
