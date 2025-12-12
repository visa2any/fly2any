/**
 * Content Factory Base - Unified Content Generation System
 * Fly2Any Growth OS
 */

// Dynamic Groq import
let groqClient: any = null

async function getGroq() {
  if (!groqClient && process.env.GROQ_API_KEY) {
    const { default: Groq } = await import('groq-sdk')
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY })
  }
  return groqClient
}

export interface ContentTemplate<T = any> {
  id: string
  type: 'blog' | 'deal' | 'guide' | 'social' | 'email' | 'landing'
  name: string
  prompt: string
  schema: T
  tokens: number
  temperature: number
}

export interface GeneratedContent {
  id: string
  templateId: string
  title: string
  slug: string
  content: string
  excerpt: string
  metadata: ContentMetadata
  seo: SEOData
  status: 'draft' | 'review' | 'scheduled' | 'published'
  scheduledAt?: Date
  publishedAt?: Date
  createdAt: Date
  performance?: ContentPerformanceMetrics
}

export interface ContentMetadata {
  author: string
  category: string
  tags: string[]
  readTime: number
  wordCount: number
  featured: boolean
  images?: string[]
}

export interface SEOData {
  title: string
  description: string
  keywords: string[]
  canonical?: string
  ogImage?: string
  schema?: object
}

export interface ContentPerformanceMetrics {
  views: number
  uniqueViews: number
  avgTimeOnPage: number
  bounceRate: number
  shares: number
  clicks: number
  conversions: number
  revenue: number
}

// Blog Post Templates
export const BLOG_TEMPLATES: ContentTemplate[] = [
  {
    id: 'travel-tips',
    type: 'blog',
    name: 'Travel Tips Article',
    prompt: `Write a comprehensive travel tips article about {{topic}}.

Structure:
- H1: Catchy title with main keyword
- Introduction: Hook + what reader will learn (150 words)
- 7-10 Tips: Each with H2, 100-150 words, practical advice
- Pro Tips Box: 3 insider secrets
- FAQ: 5 questions with answers
- Conclusion: Summary + CTA to search flights

Requirements:
- Include specific examples and numbers
- Add destination-specific advice
- Mention cost-saving opportunities
- Reference Fly2Any features naturally
- Total: 2000-2500 words
- Tone: Expert, friendly, actionable

Output as markdown with proper headings.`,
    schema: {
      topic: 'string',
      destinations: 'string[]',
      season: 'string',
    },
    tokens: 3500,
    temperature: 0.7,
  },
  {
    id: 'destination-spotlight',
    type: 'blog',
    name: 'Destination Spotlight',
    prompt: `Write an engaging destination spotlight for {{destination}}.

Structure:
- H1: "[Destination] Travel Guide 2025: Insider Tips & Hidden Gems"
- Why Visit: 3 compelling reasons (200 words)
- Best Time: Month-by-month breakdown (150 words)
- Getting There: Flight tips from major hubs (200 words)
- Top Experiences: 10 must-dos with details (400 words)
- Where to Stay: 3 neighborhoods by budget (200 words)
- Food Guide: 5 must-try dishes + where (200 words)
- Budget Breakdown: Daily costs breakdown (150 words)
- Packing Essentials: 10 items specific to destination (100 words)
- Insider Tips: 5 local secrets (150 words)
- FAQ: 6 common questions (200 words)

Requirements:
- Use specific place names, not generic
- Include price estimates in USD
- Add photography tips
- Mention flight deals from Fly2Any
- Total: 2000+ words

Output as markdown.`,
    schema: {
      destination: 'string',
      country: 'string',
      region: 'string',
    },
    tokens: 3500,
    temperature: 0.7,
  },
  {
    id: 'deal-alert',
    type: 'blog',
    name: 'Deal Alert Post',
    prompt: `Write a compelling deal alert blog post.

Deal Details:
- Route: {{origin}} to {{destination}}
- Price: \${{price}} (normally \${{regularPrice}})
- Airline: {{airline}}
- Travel Window: {{travelDates}}
- Booking Deadline: {{deadline}}

Structure:
- H1: "DEAL ALERT: {{origin}} to {{destination}} from \${{price}} ({{savings}}% Off!)"
- Deal Highlights Box: Key details
- Why This Deal is Great: 3 reasons (200 words)
- About {{destination}}: Quick overview (150 words)
- How to Book: Step-by-step with Fly2Any (100 words)
- Fine Print: Terms and conditions
- Similar Deals: Mention related routes
- CTA: Set up price alerts

Keep it urgent but trustworthy. Total: 800-1000 words.`,
    schema: {
      origin: 'string',
      destination: 'string',
      price: 'number',
      regularPrice: 'number',
      airline: 'string',
      travelDates: 'string',
      deadline: 'string',
    },
    tokens: 1500,
    temperature: 0.8,
  },
  {
    id: 'comparison',
    type: 'blog',
    name: 'Comparison Article',
    prompt: `Write a detailed comparison article: {{title}}.

Topics to compare: {{items}}

Structure:
- H1: Comparison title with keywords
- Quick Verdict Box: TL;DR summary
- Overview Table: Side-by-side comparison
- Detailed Analysis: Each item gets H2 with pros/cons (300 words each)
- Use Cases: Which is best for different travelers
- Price Comparison: Cost breakdown
- Our Recommendation: Final verdict with reasoning
- FAQ: 5 comparison questions

Requirements:
- Be objective and fair
- Use data and specifics
- Include booking links through Fly2Any
- Total: 1800-2200 words`,
    schema: {
      title: 'string',
      items: 'string[]',
      category: 'string',
    },
    tokens: 3000,
    temperature: 0.7,
  },
]

// Deal Post Templates
export const DEAL_TEMPLATES: ContentTemplate[] = [
  {
    id: 'twitter-deal',
    type: 'deal',
    name: 'Twitter Deal Post',
    prompt: `Create a viral Twitter post for this flight deal:
Route: {{origin}} → {{destination}}
Price: \${{price}} (was \${{originalPrice}})
Savings: {{savings}}%
Airline: {{airline}}

Requirements:
- Max 270 characters (leave room for link)
- Include 2-3 relevant emojis
- Create urgency
- Add call to action
- Make it shareable`,
    schema: {},
    tokens: 100,
    temperature: 0.9,
  },
  {
    id: 'telegram-deal',
    type: 'deal',
    name: 'Telegram Deal Post',
    prompt: `Create a Telegram channel post for this flight deal:
Route: {{origin}} → {{destination}}
Price: \${{price}} (was \${{originalPrice}})
Savings: {{savings}}%
Airline: {{airline}}
Travel Dates: {{dates}}

Format:
✈️ DEAL ALERT
[Route and price highlight]
[Key details with emojis]
[Why it's good]
[How to book CTA]

Keep it scannable, 150-200 words.`,
    schema: {},
    tokens: 300,
    temperature: 0.8,
  },
]

// Content Scheduling System
export interface ScheduleSlot {
  dayOfWeek: number // 0-6
  hour: number // 0-23
  contentType: ContentTemplate['type']
  templateId: string
  channel: string
}

export const DEFAULT_SCHEDULE: ScheduleSlot[] = [
  // Monday
  { dayOfWeek: 1, hour: 8, contentType: 'deal', templateId: 'twitter-deal', channel: 'twitter' },
  { dayOfWeek: 1, hour: 10, contentType: 'blog', templateId: 'destination-spotlight', channel: 'blog' },
  { dayOfWeek: 1, hour: 17, contentType: 'deal', templateId: 'telegram-deal', channel: 'telegram' },
  // Tuesday
  { dayOfWeek: 2, hour: 8, contentType: 'deal', templateId: 'twitter-deal', channel: 'twitter' },
  { dayOfWeek: 2, hour: 12, contentType: 'social', templateId: 'travel-tip', channel: 'instagram' },
  // Wednesday
  { dayOfWeek: 3, hour: 8, contentType: 'deal', templateId: 'twitter-deal', channel: 'twitter' },
  { dayOfWeek: 3, hour: 10, contentType: 'blog', templateId: 'travel-tips', channel: 'blog' },
  { dayOfWeek: 3, hour: 17, contentType: 'deal', templateId: 'telegram-deal', channel: 'telegram' },
  // Thursday
  { dayOfWeek: 4, hour: 8, contentType: 'deal', templateId: 'twitter-deal', channel: 'twitter' },
  { dayOfWeek: 4, hour: 12, contentType: 'social', templateId: 'travel-tip', channel: 'instagram' },
  // Friday
  { dayOfWeek: 5, hour: 8, contentType: 'deal', templateId: 'twitter-deal', channel: 'twitter' },
  { dayOfWeek: 5, hour: 10, contentType: 'blog', templateId: 'deal-alert', channel: 'blog' },
  { dayOfWeek: 5, hour: 15, contentType: 'email', templateId: 'weekly-deals', channel: 'email' },
  // Saturday
  { dayOfWeek: 6, hour: 10, contentType: 'deal', templateId: 'twitter-deal', channel: 'twitter' },
  { dayOfWeek: 6, hour: 14, contentType: 'social', templateId: 'destination-photo', channel: 'instagram' },
  // Sunday
  { dayOfWeek: 0, hour: 11, contentType: 'blog', templateId: 'comparison', channel: 'blog' },
  { dayOfWeek: 0, hour: 18, contentType: 'deal', templateId: 'telegram-deal', channel: 'telegram' },
]

export class ContentFactoryBase {
  private templates: Map<string, ContentTemplate> = new Map()
  private schedule: ScheduleSlot[] = DEFAULT_SCHEDULE

  constructor() {
    // Register default templates
    ;[...BLOG_TEMPLATES, ...DEAL_TEMPLATES].forEach(t => this.templates.set(t.id, t))
  }

  /**
   * Register custom template
   */
  registerTemplate(template: ContentTemplate): void {
    this.templates.set(template.id, template)
  }

  /**
   * Generate content from template
   */
  async generate(
    templateId: string,
    variables: Record<string, any>
  ): Promise<GeneratedContent | null> {
    const template = this.templates.get(templateId)
    if (!template) {
      console.error(`[ContentFactory] Template not found: ${templateId}`)
      return null
    }

    const groq = await getGroq()
    if (!groq) {
      console.error('[ContentFactory] Groq client not initialized')
      return null
    }

    // Replace variables in prompt
    let prompt = template.prompt
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
      prompt = prompt.replace(regex, String(value))
    }

    try {
      const response = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: template.tokens,
        temperature: template.temperature,
      })

      const content = response.choices[0]?.message?.content || ''
      const title = this.extractTitle(content) || variables.title || template.name
      const wordCount = content.split(/\s+/).length

      return {
        id: `content_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        templateId,
        title,
        slug: this.generateSlug(title),
        content,
        excerpt: this.generateExcerpt(content),
        metadata: {
          author: 'Fly2Any Team',
          category: template.type,
          tags: this.extractTags(content, variables),
          readTime: Math.ceil(wordCount / 200),
          wordCount,
          featured: false,
        },
        seo: {
          title: `${title} | Fly2Any`,
          description: this.generateExcerpt(content, 155),
          keywords: this.extractTags(content, variables),
        },
        status: 'draft',
        createdAt: new Date(),
      }
    } catch (error) {
      console.error('[ContentFactory] Generation failed:', error)
      return null
    }
  }

  /**
   * Generate blog post
   */
  async generateBlogPost(
    templateId: string,
    variables: Record<string, any>
  ): Promise<GeneratedContent | null> {
    const content = await this.generate(templateId, variables)
    if (!content) return null

    // Add blog-specific SEO schema
    content.seo.schema = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: content.title,
      description: content.seo.description,
      author: {
        '@type': 'Organization',
        name: 'Fly2Any',
      },
      publisher: {
        '@type': 'Organization',
        name: 'Fly2Any',
        logo: {
          '@type': 'ImageObject',
          url: 'https://www.fly2any.com/logo.png',
        },
      },
      datePublished: content.createdAt.toISOString(),
      dateModified: content.createdAt.toISOString(),
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `https://www.fly2any.com/blog/${content.slug}`,
      },
    }

    return content
  }

  /**
   * Generate deal post for multiple channels
   */
  async generateDealPosts(deal: {
    origin: string
    destination: string
    price: number
    originalPrice: number
    airline: string
    dates?: string
  }): Promise<Map<string, string>> {
    const posts = new Map<string, string>()
    const savings = Math.round(((deal.originalPrice - deal.price) / deal.originalPrice) * 100)

    const variables = { ...deal, savings }

    for (const template of DEAL_TEMPLATES) {
      const content = await this.generate(template.id, variables)
      if (content) {
        posts.set(template.id, content.content)
      }
    }

    return posts
  }

  /**
   * Get scheduled content for today
   */
  getScheduledForToday(): ScheduleSlot[] {
    const today = new Date().getDay()
    return this.schedule.filter(slot => slot.dayOfWeek === today)
  }

  /**
   * Get next scheduled content
   */
  getNextScheduled(): ScheduleSlot | null {
    const now = new Date()
    const currentDay = now.getDay()
    const currentHour = now.getHours()

    // Find next slot today
    const todaySlot = this.schedule.find(
      slot => slot.dayOfWeek === currentDay && slot.hour > currentHour
    )
    if (todaySlot) return todaySlot

    // Find first slot tomorrow or later
    for (let i = 1; i <= 7; i++) {
      const checkDay = (currentDay + i) % 7
      const slot = this.schedule.find(s => s.dayOfWeek === checkDay)
      if (slot) return slot
    }

    return null
  }

  /**
   * Update schedule
   */
  updateSchedule(newSchedule: ScheduleSlot[]): void {
    this.schedule = newSchedule
  }

  // Helper methods
  private extractTitle(content: string): string | null {
    const match = content.match(/^#\s+(.+)$/m)
    return match?.[1] || null
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 60)
  }

  private generateExcerpt(content: string, maxLength = 200): string {
    // Remove markdown formatting
    const plain = content
      .replace(/#{1,6}\s+/g, '')
      .replace(/\*{1,2}([^*]+)\*{1,2}/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/\n+/g, ' ')
      .trim()

    if (plain.length <= maxLength) return plain
    return plain.slice(0, maxLength - 3) + '...'
  }

  private extractTags(content: string, variables: Record<string, any>): string[] {
    const tags: Set<string> = new Set()

    // Add variable values as tags
    for (const [key, value] of Object.entries(variables)) {
      if (typeof value === 'string' && value.length < 30) {
        tags.add(value.toLowerCase())
      }
    }

    // Extract hashtags
    const hashtags = content.match(/#\w+/g) || []
    hashtags.forEach(tag => tags.add(tag.slice(1).toLowerCase()))

    // Common travel tags
    const travelKeywords = ['travel', 'flights', 'deals', 'vacation', 'tips']
    travelKeywords.forEach(kw => {
      if (content.toLowerCase().includes(kw)) tags.add(kw)
    })

    return Array.from(tags).slice(0, 10)
  }
}

export const contentFactory = new ContentFactoryBase()
