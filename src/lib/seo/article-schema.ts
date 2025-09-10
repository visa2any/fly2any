/**
 * Article Schema Generator for Travel Content
 * Generates structured data for blog posts, travel guides, and editorial content
 */

export interface ArticleData {
  headline: string;
  description: string;
  url: string;
  image: string[];
  datePublished: string;
  dateModified?: string;
  author: {
    name: string;
    url?: string;
    jobTitle?: string;
    worksFor?: string;
  };
  publisher: {
    name: string;
    url: string;
    logo: {
      url: string;
      width: number;
      height: number;
    };
  };
  articleSection?: string;
  keywords?: string[];
  wordCount?: number;
  readingTime?: number;
  about?: {
    name: string;
    description: string;
    sameAs?: string[];
  };
  mentions?: Array<{
    name: string;
    description?: string;
    sameAs?: string;
  }>;
  mainEntityOfPage?: string;
}

export class ArticleSchema {
  /**
   * Generate comprehensive Article schema for travel content
   */
  static generateArticle(data: ArticleData): object {
    return {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": data.headline,
      "description": data.description,
      "url": data.url,
      "image": data.image,
      "datePublished": data.datePublished,
      "dateModified": data.dateModified || data.datePublished,
      "author": {
        "@type": "Person",
        "name": data.author.name,
        ...(data.author.url && { "url": data.author.url }),
        ...(data.author.jobTitle && { "jobTitle": data.author.jobTitle }),
        ...(data.author.worksFor && {
          "worksFor": {
            "@type": "Organization",
            "name": data.author.worksFor
          }
        })
      },
      "publisher": {
        "@type": "Organization",
        "name": data.publisher.name,
        "url": data.publisher.url,
        "logo": {
          "@type": "ImageObject",
          "url": data.publisher.logo.url,
          "width": data.publisher.logo.width,
          "height": data.publisher.logo.height
        }
      },
      ...(data.articleSection && { "articleSection": data.articleSection }),
      ...(data.keywords && { "keywords": data.keywords }),
      ...(data.wordCount && { "wordCount": data.wordCount }),
      ...(data.readingTime && {
        "timeRequired": `PT${data.readingTime}M`
      }),
      ...(data.about && {
        "about": {
          "@type": "Thing",
          "name": data.about.name,
          "description": data.about.description,
          ...(data.about.sameAs && { "sameAs": data.about.sameAs })
        }
      }),
      ...(data.mentions && {
        "mentions": data.mentions.map(mention => ({
          "@type": "Thing",
          "name": mention.name,
          ...(mention.description && { "description": mention.description }),
          ...(mention.sameAs && { "sameAs": mention.sameAs })
        }))
      }),
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": data.mainEntityOfPage || data.url
      },
      "isPartOf": {
        "@type": "WebSite",
        "name": "Fly2Any",
        "url": "https://fly2any.com"
      }
    };
  }

  /**
   * Generate TravelGuide schema (specialized Article)
   */
  static generateTravelGuide(data: ArticleData & {
    destination: {
      name: string;
      addressCountry: string;
      addressRegion?: string;
      description: string;
    };
    touristAttraction?: string[];
    travelSeason?: string;
    currency?: string;
    language?: string[];
  }): object {
    const baseArticle = this.generateArticle(data);
    
    return {
      ...baseArticle,
      "@type": ["Article", "TravelGuide"],
      "about": {
        "@type": "Place",
        "name": data.destination.name,
        "description": data.destination.description,
        "address": {
          "@type": "PostalAddress",
          "addressCountry": data.destination.addressCountry,
          ...(data.destination.addressRegion && {
            "addressRegion": data.destination.addressRegion
          })
        },
        ...(data.touristAttraction && {
          "touristAttraction": data.touristAttraction.map(attraction => ({
            "@type": "TouristAttraction",
            "name": attraction
          }))
        })
      },
      ...(data.travelSeason && { "temporalCoverage": data.travelSeason }),
      ...(data.currency && {
        "spatialCoverage": {
          "@type": "Place",
          "name": data.destination.name,
          "currencyUsed": data.currency
        }
      }),
      ...(data.language && {
        "inLanguage": data.language
      })
    };
  }

  /**
   * Generate pre-configured Brazil travel articles
   */
  static generateBrazilTravelArticles(): object[] {
    const articles: (ArticleData & { 
      destination: { name: string; addressCountry: string; addressRegion?: string; description: string };
      touristAttraction?: string[];
      travelSeason?: string;
      currency?: string;
      language?: string[];
    })[] = [
      {
        headline: "Complete Guide to Rio de Janeiro: Christ the Redeemer, Beaches & Carnival",
        description: "Discover Rio de Janeiro's iconic attractions, pristine beaches, vibrant nightlife, and world-famous Carnival. Your complete travel guide to Brazil's marvelous city.",
        url: "https://fly2any.com/travel-guides/rio-de-janeiro-complete-guide",
        image: [
          "https://fly2any.com/guides/rio-christ-redeemer.jpg",
          "https://fly2any.com/guides/rio-copacabana-beach.jpg",
          "https://fly2any.com/guides/rio-sugarloaf.jpg"
        ],
        datePublished: "2024-08-15T10:00:00-03:00",
        dateModified: "2024-09-01T15:30:00-03:00",
        author: {
          name: "Carlos Mendoza",
          jobTitle: "Brazil Travel Expert",
          worksFor: "Fly2Any"
        },
        publisher: {
          name: "Fly2Any",
          url: "https://fly2any.com",
          logo: {
            url: "https://fly2any.com/og-image.webp",
            width: 1200,
            height: 630
          }
        },
        articleSection: "Travel Guides",
        keywords: [
          "Rio de Janeiro travel guide",
          "Christ the Redeemer",
          "Copacabana beach",
          "Brazil tourism",
          "Rio attractions",
          "Sugarloaf Mountain"
        ],
        wordCount: 3500,
        readingTime: 15,
        destination: {
          name: "Rio de Janeiro",
          addressCountry: "BR",
          addressRegion: "RJ",
          description: "Brazil's former capital city known for its stunning beaches, iconic landmarks, and vibrant culture"
        },
        touristAttraction: [
          "Christ the Redeemer",
          "Sugarloaf Mountain", 
          "Copacabana Beach",
          "Ipanema Beach",
          "Santa Teresa Neighborhood",
          "Tijuca National Park"
        ],
        travelSeason: "Year-round destination, peak season December-March",
        currency: "BRL",
        language: ["pt-BR", "en"]
      },
      {
        headline: "São Paulo Travel Guide: Culture, Food & Business Hub of Brazil",
        description: "Explore São Paulo's world-class museums, incredible gastronomy, bustling business districts, and diverse neighborhoods. The ultimate guide to Brazil's largest city.",
        url: "https://fly2any.com/travel-guides/sao-paulo-complete-guide",
        image: [
          "https://fly2any.com/guides/sao-paulo-skyline.jpg",
          "https://fly2any.com/guides/sao-paulo-food-scene.jpg",
          "https://fly2any.com/guides/sao-paulo-museums.jpg"
        ],
        datePublished: "2024-07-20T12:00:00-03:00",
        dateModified: "2024-08-15T16:45:00-03:00",
        author: {
          name: "Patricia Silva",
          jobTitle: "Cultural Tourism Specialist",
          worksFor: "Fly2Any"
        },
        publisher: {
          name: "Fly2Any",
          url: "https://fly2any.com", 
          logo: {
            url: "https://fly2any.com/og-image.webp",
            width: 1200,
            height: 630
          }
        },
        articleSection: "Travel Guides",
        keywords: [
          "São Paulo travel guide",
          "São Paulo museums",
          "Brazilian food",
          "São Paulo attractions",
          "Brazil business travel",
          "Vila Madalena"
        ],
        wordCount: 4200,
        readingTime: 18,
        destination: {
          name: "São Paulo", 
          addressCountry: "BR",
          addressRegion: "SP",
          description: "Brazil's economic powerhouse and cultural melting pot, offering world-class dining, museums, and nightlife"
        },
        touristAttraction: [
          "São Paulo Museum of Art (MASP)",
          "Pinacoteca do Estado",
          "Vila Madalena",
          "Mercado Municipal",
          "Liberdade District",
          "Ibirapuera Park"
        ],
        travelSeason: "Year-round, mild climate with dry season May-September",
        currency: "BRL",
        language: ["pt-BR", "en"]
      },
      {
        headline: "Amazon Rainforest Adventure: Wildlife, Indigenous Culture & Eco-Tourism",
        description: "Journey into the heart of the Amazon rainforest. Discover incredible biodiversity, indigenous communities, and sustainable eco-tourism opportunities.",
        url: "https://fly2any.com/travel-guides/amazon-rainforest-adventure",
        image: [
          "https://fly2any.com/guides/amazon-wildlife.jpg",
          "https://fly2any.com/guides/amazon-river.jpg",
          "https://fly2any.com/guides/amazon-indigenous.jpg"
        ],
        datePublished: "2024-06-10T09:00:00-04:00",
        dateModified: "2024-08-01T11:20:00-04:00", 
        author: {
          name: "Roberto Amazonas",
          jobTitle: "Eco-Tourism Guide",
          worksFor: "Fly2Any"
        },
        publisher: {
          name: "Fly2Any",
          url: "https://fly2any.com",
          logo: {
            url: "https://fly2any.com/og-image.webp",
            width: 1200,
            height: 630
          }
        },
        articleSection: "Adventure Travel",
        keywords: [
          "Amazon rainforest",
          "Amazon wildlife",
          "Brazil eco-tourism",
          "Indigenous culture Brazil",
          "Amazon River cruise",
          "Sustainable travel"
        ],
        wordCount: 3800,
        readingTime: 16,
        destination: {
          name: "Amazon Rainforest",
          addressCountry: "BR",
          addressRegion: "Amazon Basin",
          description: "The world's largest tropical rainforest, home to incredible biodiversity and indigenous communities"
        },
        touristAttraction: [
          "Meeting of Waters",
          "Amazon River Cruises",
          "Anavilhanas National Park", 
          "Indigenous Community Visits",
          "Jungle Canopy Tours",
          "Pink Dolphin Spotting"
        ],
        travelSeason: "Dry season June-November, wet season December-May", 
        currency: "BRL",
        language: ["pt-BR", "en"]
      }
    ];

    return articles.map(article => this.generateTravelGuide(article));
  }

  /**
   * Generate BlogPosting schema for travel tips and news
   */
  static generateBlogPost(data: ArticleData & {
    blogSection?: string;
    tags?: string[];
  }): object {
    const baseArticle = this.generateArticle(data);
    
    return {
      ...baseArticle,
      "@type": "BlogPosting",
      ...(data.blogSection && { "articleSection": data.blogSection }),
      ...(data.tags && { "keywords": data.tags })
    };
  }

  /**
   * Generate Article schema script tag for HTML injection
   */
  static generateArticleScript(data: ArticleData): string {
    const schema = this.generateArticle(data);
    return `<script type="application/ld+json">${JSON.stringify(schema, null, 2)}</script>`;
  }

  /**
   * Generate TravelGuide script tag for HTML injection
   */
  static generateTravelGuideScript(data: ArticleData & {
    destination: any;
    touristAttraction?: string[];
    travelSeason?: string;
    currency?: string;
    language?: string[];
  }): string {
    const schema = this.generateTravelGuide(data);
    return `<script type="application/ld+json">${JSON.stringify(schema, null, 2)}</script>`;
  }
}

/**
 * Common travel article categories for Fly2Any content
 */
export const TRAVEL_ARTICLE_CATEGORIES = {
  DESTINATION_GUIDES: 'Destination Guides',
  TRAVEL_TIPS: 'Travel Tips',
  CULTURAL_INSIGHTS: 'Cultural Insights', 
  ADVENTURE_TRAVEL: 'Adventure Travel',
  FOOD_AND_CULTURE: 'Food & Culture',
  SEASONAL_TRAVEL: 'Seasonal Travel',
  BUDGET_TRAVEL: 'Budget Travel Tips',
  LUXURY_TRAVEL: 'Luxury Travel'
} as const;