/**
 * Blog Adapter - Fly2Any Marketing OS
 * Publishes content to the internal blog/CMS system
 */

import { BaseSocialAdapter } from './base-adapter';
import { SocialPlatform, SocialPostContent, SocialPostResult } from './types';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class BlogAdapter extends BaseSocialAdapter {
  platform: SocialPlatform = 'blog';

  isConfigured(): boolean {
    // Blog is always available (internal system)
    return true;
  }

  async post(content: SocialPostContent): Promise<SocialPostResult> {
    const validation = this.validateContent(content);
    if (!validation.valid) {
      return this.createErrorResult(validation.errors.join(', '));
    }

    try {
      // Generate slug from title
      const slug = this.generateSlug(content.title || content.text.slice(0, 50));

      // Create blog post in database
      // Using raw query since BlogPost model may not exist yet
      const postId = `blog_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

      // Store in SocialPostLog as the blog entry
      await prisma.socialPostLog.create({
        data: {
          platform: 'blog',
          platformPostId: postId,
          platformUrl: `/blog/${slug}`,
          status: 'posted',
          content: this.formatContent(content),
          imageUrl: content.imageUrl,
          link: content.link,
          postedAt: new Date(),
          metadata: {
            title: content.title,
            slug,
            excerpt: content.text.slice(0, 160),
            tags: content.hashtags,
            productType: content.productType,
            productData: content.productData,
            seoTitle: `${content.title} | Fly2Any Travel Blog`,
            seoDescription: content.text.slice(0, 155),
          },
        },
      });

      const url = `${process.env.NEXT_PUBLIC_APP_URL || 'https://fly2any.com'}/blog/${slug}`;

      console.log(`[Blog] Published successfully: ${slug}`);

      return this.createSuccessResult(postId, url, { slug });

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[Blog] Publish failed: ${message}`);
      return this.createErrorResult(message);
    }
  }

  override formatContent(content: SocialPostContent): string {
    // Blog posts use markdown format
    let markdown = '';

    // Add featured image
    if (content.imageUrl) {
      markdown += `![${content.title || 'Featured Image'}](${content.imageUrl})\n\n`;
    }

    // Add main content
    markdown += content.text;

    // Add product details section
    if (content.productType && content.productData) {
      markdown += '\n\n---\n\n';
      markdown += '## Deal Details\n\n';

      if (content.productType === 'flight') {
        const { origin, destination, price, airline, dates } = content.productData;
        markdown += `- **Route:** ${origin} → ${destination}\n`;
        markdown += `- **Price:** From $${price}\n`;
        if (airline) markdown += `- **Airline:** ${airline}\n`;
        if (dates) markdown += `- **Travel Dates:** ${dates}\n`;
      } else if (content.productType === 'hotel') {
        const { name, city, price, rating } = content.productData;
        markdown += `- **Hotel:** ${name}\n`;
        markdown += `- **Location:** ${city}\n`;
        markdown += `- **Price:** From $${price}/night\n`;
        if (rating) markdown += `- **Rating:** ${'⭐'.repeat(Math.floor(rating))}\n`;
      }

      if (content.link) {
        markdown += `\n[Book Now](${content.link})\n`;
      }
    }

    // Add tags
    if (content.hashtags?.length) {
      markdown += '\n\n---\n\n';
      markdown += '**Tags:** ' + content.hashtags.map(t => `[${t}](/blog/tag/${t.toLowerCase()})`).join(', ');
    }

    return markdown;
  }

  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 60)
      + '-' + Date.now().toString(36);
  }
}

export const blogAdapter = new BlogAdapter();
