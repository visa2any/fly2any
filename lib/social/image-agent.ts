/**
 * Image Agent - Fly2Any Marketing OS
 * Handles image generation and optimization for social posts
 * Priority: Real product images > AI-generated > Stock fallback
 */

import { SocialPlatform, PLATFORM_CONFIGS } from './types';

export interface ImageRequest {
  productType?: 'flight' | 'hotel' | 'tour' | 'transfer';
  productData?: Record<string, any>;
  prompt?: string;
  platform: SocialPlatform;
  fallbackUrl?: string;
}

export interface ImageResult {
  url: string;
  source: 'product' | 'ai' | 'stock';
  width: number;
  height: number;
  aspectRatio: string;
}

// Stock images by category (Unsplash/Pexels public URLs)
const STOCK_IMAGES: Record<string, string[]> = {
  flight: [
    'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200',
    'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=1200',
    'https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?w=1200',
  ],
  hotel: [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200',
    'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200',
  ],
  tour: [
    'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200',
    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200',
    'https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=1200',
  ],
  transfer: [
    'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1200',
    'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1200',
  ],
  default: [
    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200',
    'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?w=1200',
  ],
};

// Aspect ratio dimensions
const ASPECT_RATIOS: Record<string, { width: number; height: number }> = {
  '1:1': { width: 1080, height: 1080 },
  '4:5': { width: 1080, height: 1350 },
  '9:16': { width: 1080, height: 1920 },
  '16:9': { width: 1200, height: 675 },
};

class ImageAgent {
  /**
   * Get optimal image for social post
   */
  async getImage(request: ImageRequest): Promise<ImageResult> {
    const aspectRatio = PLATFORM_CONFIGS[request.platform].imageAspectRatio;
    const dimensions = ASPECT_RATIOS[aspectRatio];

    // Priority 1: Real product image
    const productImage = this.getProductImage(request);
    if (productImage) {
      return {
        url: this.optimizeImageUrl(productImage, dimensions),
        source: 'product',
        ...dimensions,
        aspectRatio,
      };
    }

    // Priority 2: AI-generated image (if configured)
    if (request.prompt && process.env.OPENAI_API_KEY) {
      try {
        const aiImage = await this.generateAIImage(request.prompt, dimensions);
        if (aiImage) {
          return {
            url: aiImage,
            source: 'ai',
            ...dimensions,
            aspectRatio,
          };
        }
      } catch (error) {
        console.error('[ImageAgent] AI generation failed:', error);
      }
    }

    // Priority 3: Fallback URL
    if (request.fallbackUrl) {
      return {
        url: this.optimizeImageUrl(request.fallbackUrl, dimensions),
        source: 'stock',
        ...dimensions,
        aspectRatio,
      };
    }

    // Priority 4: Stock image
    const stockImage = this.getStockImage(request.productType || 'default');
    return {
      url: stockImage,
      source: 'stock',
      ...dimensions,
      aspectRatio,
    };
  }

  /**
   * Extract image from product data
   */
  private getProductImage(request: ImageRequest): string | null {
    const { productType, productData } = request;

    if (!productData) return null;

    // Try common image field names
    const imageFields = ['imageUrl', 'image', 'photo', 'thumbnail', 'mainImage', 'images'];

    for (const field of imageFields) {
      const value = productData[field];
      if (typeof value === 'string' && value.startsWith('http')) {
        return value;
      }
      if (Array.isArray(value) && value[0]?.startsWith?.('http')) {
        return value[0];
      }
      if (typeof value === 'object' && value?.url) {
        return value.url;
      }
    }

    // Product-specific image extraction
    if (productType === 'hotel' && productData.photos?.[0]) {
      return productData.photos[0];
    }

    if (productType === 'tour' && productData.coverImage) {
      return productData.coverImage;
    }

    return null;
  }

  /**
   * Generate AI image using DALL-E or similar
   */
  private async generateAIImage(
    prompt: string,
    dimensions: { width: number; height: number }
  ): Promise<string | null> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return null;

    try {
      // Determine size based on aspect ratio
      const size = dimensions.width === dimensions.height
        ? '1024x1024'
        : dimensions.width > dimensions.height
          ? '1792x1024'
          : '1024x1792';

      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: `Professional travel marketing photo: ${prompt}. High quality, vibrant colors, no text overlays.`,
          n: 1,
          size,
          quality: 'standard',
        }),
      });

      if (!response.ok) {
        throw new Error(`DALL-E API error: ${response.status}`);
      }

      const data = await response.json();
      return data.data?.[0]?.url || null;

    } catch (error) {
      console.error('[ImageAgent] DALL-E generation failed:', error);
      return null;
    }
  }

  /**
   * Get random stock image by category
   */
  private getStockImage(category: string): string {
    const images = STOCK_IMAGES[category] || STOCK_IMAGES.default;
    return images[Math.floor(Math.random() * images.length)];
  }

  /**
   * Optimize image URL with resize parameters
   */
  private optimizeImageUrl(
    url: string,
    dimensions: { width: number; height: number }
  ): string {
    // Handle Unsplash URLs
    if (url.includes('unsplash.com')) {
      const baseUrl = url.split('?')[0];
      return `${baseUrl}?w=${dimensions.width}&h=${dimensions.height}&fit=crop&auto=format`;
    }

    // Handle Cloudinary URLs
    if (url.includes('cloudinary.com')) {
      return url.replace('/upload/', `/upload/w_${dimensions.width},h_${dimensions.height},c_fill/`);
    }

    // Handle static.cupid.travel (LiteAPI hotel images)
    if (url.includes('static.cupid.travel')) {
      return url; // Already optimized
    }

    // Return original for other URLs
    return url;
  }

  /**
   * Generate image prompt from product data
   */
  generatePrompt(productType: string, productData: Record<string, any>): string {
    if (productType === 'flight') {
      const { origin, destination } = productData;
      return `Beautiful aerial view of ${destination} city skyline at golden hour, travel destination photography`;
    }

    if (productType === 'hotel') {
      const { name, city } = productData;
      return `Luxury hotel exterior in ${city}, modern architecture, welcoming entrance, travel accommodation photography`;
    }

    if (productType === 'tour') {
      const { name, city } = productData;
      return `Exciting tourist attraction in ${city}, people enjoying activities, vibrant travel photography`;
    }

    return 'Beautiful travel destination, scenic landscape, wanderlust photography';
  }
}

export const imageAgent = new ImageAgent();
