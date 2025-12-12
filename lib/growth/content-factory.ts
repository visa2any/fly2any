/**
 * Content Factory - Automated Content Generation
 *
 * Generates SEO-optimized content using AI:
 * - Deal posts
 * - Destination guides
 * - Social media posts
 * - Blog articles
 */

// Dynamic import to avoid build errors when API key is not set
let groqClient: any = null;

async function getGroqClient() {
  if (!groqClient) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY environment variable is not set');
    }
    const { default: Groq } = await import('groq-sdk');
    groqClient = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }
  return groqClient;
}

export interface ContentPiece {
  type: 'deal' | 'guide' | 'blog' | 'social';
  title: string;
  content: string;
  metadata: {
    keywords: string[];
    description: string;
    readTime?: number;
  };
  channels: string[];
  scheduledAt?: Date;
}

export interface DealData {
  origin: string;
  destination: string;
  price: number;
  previousPrice: number;
  airline?: string;
  travelDates?: string;
}

/**
 * Generate deal post content
 */
export async function generateDealPost(deal: DealData): Promise<ContentPiece> {
  const savingsPercent = Math.round(
    ((deal.previousPrice - deal.price) / deal.previousPrice) * 100
  );

  const prompt = `Write a compelling 280-character tweet about this flight deal:
- Route: ${deal.origin} to ${deal.destination}
- Price: $${deal.price} (was $${deal.previousPrice})
- Savings: ${savingsPercent}% off
${deal.airline ? `- Airline: ${deal.airline}` : ''}
${deal.travelDates ? `- Travel dates: ${deal.travelDates}` : ''}

Include relevant emojis, create urgency, and add a call to action. Make it viral-worthy.`;

  const groq = await getGroqClient();
  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 100,
    temperature: 0.8,
  });

  const content = response.choices[0]?.message?.content || '';

  return {
    type: 'deal',
    title: `${deal.origin} → ${deal.destination} $${deal.price}`,
    content,
    metadata: {
      keywords: ['cheap flights', deal.origin, deal.destination, 'travel deals'],
      description: `Flight deal: ${deal.origin} to ${deal.destination} from $${deal.price}`,
    },
    channels: ['twitter', 'telegram', 'instagram'],
  };
}

/**
 * Generate destination guide content
 */
export async function generateDestinationGuide(city: string): Promise<ContentPiece> {
  const prompt = `Write a comprehensive 1500-word SEO-optimized travel guide for ${city}.

Structure:
1. Introduction (why visit ${city}) - 150 words
2. Best Time to Visit - 100 words
3. Top 10 Attractions with specific names - 300 words
4. Local Food & Must-Try Restaurants - 200 words
5. Getting Around (transportation tips) - 150 words
6. Budget Tips & Money Saving - 150 words
7. Where to Stay (neighborhoods) - 150 words
8. Day Trip Ideas - 150 words
9. Practical Information (visa, currency, safety) - 100 words
10. FAQ (5 common questions with answers) - 150 words

Requirements:
- Include specific place names, not generic descriptions
- Add practical tips locals would know
- Include price estimates in USD
- Mention best photo spots
- Tone: Helpful, exciting, authoritative

Output in Markdown format.`;

  const groq = await getGroqClient();
  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 3000,
    temperature: 0.7,
  });

  const content = response.choices[0]?.message?.content || '';

  return {
    type: 'guide',
    title: `${city} Travel Guide 2025: Everything You Need to Know`,
    content,
    metadata: {
      keywords: [
        `${city} travel guide`,
        `things to do in ${city}`,
        `${city} vacation`,
        'travel tips',
      ],
      description: `Complete ${city} travel guide with top attractions, best restaurants, budget tips, and insider advice for 2025.`,
      readTime: 8,
    },
    channels: ['blog'],
  };
}

/**
 * Generate social media posts batch
 */
export async function generateSocialPosts(count: number = 5): Promise<ContentPiece[]> {
  const topics = [
    'travel tip',
    'packing hack',
    'airport tip',
    'budget travel',
    'destination spotlight',
  ];

  const prompt = `Generate ${count} engaging social media posts about travel.
Each post should be:
- Under 280 characters
- Include 1-2 relevant emojis
- Have a travel tip, fact, or inspiration
- End with engagement (question or call to action)

Topics to cover: ${topics.join(', ')}

Format as JSON array: [{"topic": "...", "content": "..."}]`;

  const groq = await getGroqClient();
  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 1000,
    temperature: 0.9,
  });

  try {
    const rawContent = response.choices[0]?.message?.content || '[]';
    const jsonMatch = rawContent.match(/\[[\s\S]*\]/);
    const posts = JSON.parse(jsonMatch?.[0] || '[]');

    return posts.map((post: { topic: string; content: string }) => ({
      type: 'social' as const,
      title: post.topic,
      content: post.content,
      metadata: {
        keywords: ['travel', post.topic],
        description: post.content.slice(0, 100),
      },
      channels: ['twitter', 'instagram', 'facebook'],
    }));
  } catch {
    return [];
  }
}

/**
 * Generate blog post outline
 */
export async function generateBlogOutline(topic: string): Promise<{
  title: string;
  outline: string[];
  keywords: string[];
}> {
  const prompt = `Create an SEO-optimized blog post outline about: "${topic}"

Requirements:
- Catchy title with keyword
- 8-10 sections with H2 headings
- Each section should have 2-3 sub-points
- Include FAQ section ideas
- Target 2000+ words

Output format:
Title: [title]
Keywords: [comma-separated keywords]
Outline:
1. [Section name]
   - [sub-point]
   - [sub-point]
2. ...`;

  const groq = await getGroqClient();
  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 800,
    temperature: 0.7,
  });

  const content = response.choices[0]?.message?.content || '';

  // Parse response
  const titleMatch = content.match(/Title:\s*(.+)/);
  const keywordsMatch = content.match(/Keywords:\s*(.+)/);
  const outlineMatch = content.match(/Outline:\n([\s\S]+)/);

  return {
    title: titleMatch?.[1]?.trim() || topic,
    outline: outlineMatch?.[1]?.split('\n').filter(Boolean) || [],
    keywords: keywordsMatch?.[1]?.split(',').map(k => k.trim()) || [topic],
  };
}

/**
 * Content calendar - what to publish when
 */
export const CONTENT_SCHEDULE = {
  daily: [
    { time: '08:00', type: 'deal', channel: 'twitter' },
    { time: '12:00', type: 'deal', channel: 'instagram' },
    { time: '17:00', type: 'social', channel: 'twitter' },
    { time: '20:00', type: 'deal', channel: 'telegram' },
  ],
  weekly: [
    { day: 'monday', type: 'guide', channel: 'blog' },
    { day: 'wednesday', type: 'blog', channel: 'blog' },
    { day: 'friday', type: 'deals-roundup', channel: 'email' },
  ],
};

/**
 * Get content to generate for today
 */
export function getTodayContentPlan(): {
  type: string;
  channel: string;
  scheduledTime: string;
}[] {
  const today = new Date();
  const dayName = today.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

  const dailyContent = CONTENT_SCHEDULE.daily.map(item => ({
    ...item,
    scheduledTime: item.time,
  }));

  const weeklyContent = CONTENT_SCHEDULE.weekly
    .filter(item => item.day === dayName)
    .map(item => ({
      ...item,
      scheduledTime: '10:00',
    }));

  return [...dailyContent, ...weeklyContent];
}
