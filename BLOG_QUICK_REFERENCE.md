# Blog Infrastructure - Quick Reference Guide

## For UI Component Team

### Available Routes

```
/blog                              → Main blog homepage
/blog/news                         → News feed page
/blog/[slug]                       → Individual article page
/blog/category/[category]          → Category filter pages
```

### Category Options
- `blog` - Travel Blog
- `news` - Travel News
- `deal` - Flash Deals
- `guide` - Travel Guides
- `tip` - Travel Tips
- `story` - Travel Stories

---

## Import Paths

### Types
```typescript
import type {
  BlogPost,
  Author,
  CategoryType,
  ContentType,
  DealMetadata,
  NewsMetadata
} from '@/lib/types/blog';
```

### Data
```typescript
import {
  sampleBlogPosts,
  authors,
  getPostsByCategory,
  getFeaturedPosts,
  getActiveDeals,
  getLatestNews,
  getPostBySlug,
  getRelatedPosts
} from '@/lib/data/blog-posts';
```

### Helper Functions
```typescript
import {
  formatDate,
  getTimeAgo,
  calculateReadTime,
  generateExcerpt,
  formatNumber,
  getCategoryDisplayName,
  getCategoryIcon,
  getCategoryColor,
  isDealExpired,
  getDaysUntilExpiry,
  formatCountdown,
  truncateText,
  generateSlug,
  sortPostsByDate,
  sortPostsByPopularity,
  filterPostsBySearch,
  getPostsByTag,
  getAllTags,
  getPostsByAuthor,
  paginatePosts,
  generateMetaDescription,
  generateMetaKeywords
} from '@/lib/utils/blog-helpers';
```

---

## Sample Usage

### Get All Blog Posts
```typescript
import { sampleBlogPosts } from '@/lib/data/blog-posts';

// All posts
const posts = sampleBlogPosts;
```

### Get Posts by Category
```typescript
import { getPostsByCategory } from '@/lib/data/blog-posts';

// Get all deals
const deals = getPostsByCategory('deal');

// Get all guides
const guides = getPostsByCategory('guide');
```

### Get Active Deals (Non-Expired)
```typescript
import { getActiveDeals } from '@/lib/data/blog-posts';

const activeDeals = getActiveDeals();
```

### Get Featured Posts
```typescript
import { getFeaturedPosts } from '@/lib/data/blog-posts';

const featured = getFeaturedPosts();
```

### Get Single Post
```typescript
import { getPostBySlug } from '@/lib/data/blog-posts';

const post = getPostBySlug('ultimate-guide-santorini-2025');
```

### Get Related Posts
```typescript
import { getRelatedPosts } from '@/lib/data/blog-posts';

// Get 3 related posts for a given post ID
const related = getRelatedPosts('1', 3);
```

### Format Dates
```typescript
import { formatDate, getTimeAgo } from '@/lib/utils/blog-helpers';

const date = new Date('2025-10-10');

formatDate(date, 'long');  // "October 10, 2025"
formatDate(date, 'short'); // "Oct 10, 2025"
getTimeAgo(date);          // "2 hours ago" / "Yesterday" / etc.
```

### Deal Countdown
```typescript
import { formatCountdown, getDaysUntilExpiry } from '@/lib/utils/blog-helpers';

const expiryDate = new Date('2025-10-15');

formatCountdown(expiryDate);    // "5d 12h 30m"
getDaysUntilExpiry(expiryDate); // 5
```

### Category Utilities
```typescript
import {
  getCategoryDisplayName,
  getCategoryIcon,
  getCategoryColor
} from '@/lib/utils/blog-helpers';

getCategoryDisplayName('deal'); // "Flash Deals"
getCategoryIcon('deal');        // "💰"
getCategoryColor('deal');       // "from-green-600 to-emerald-600"
```

---

## Data Structure Examples

### BlogPost Interface
```typescript
{
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  featuredImage: {
    url: string;
    alt: string;
    credit?: string;
  };
  category: 'blog' | 'news' | 'deal' | 'guide' | 'tip' | 'story';
  tags: string[];
  author: {
    id: string;
    name: string;
    avatar?: string;
    bio?: string;
    role?: string;
  };
  publishedAt: Date;
  readTime: number;
  isFeatured: boolean;
  views?: number;
  likes?: number;
  dealMetadata?: {
    originalPrice: number;
    discountedPrice: number;
    discount: number;
    validUntil: Date;
    destinations?: string[];
    restrictions?: string[];
    bookingUrl?: string;
  };
  newsMetadata?: {
    urgency: 'low' | 'medium' | 'high' | 'critical';
    source?: string;
    relatedDestinations?: string[];
  };
}
```

---

## Component Structure

### Page Component Pattern
```typescript
'use client';

import { useState, useMemo } from 'react';
import { sampleBlogPosts } from '@/lib/data/blog-posts';
import type { BlogPost } from '@/lib/types/blog';

export default function BlogPage() {
  const [filter, setFilter] = useState('all');

  const posts = useMemo(() => {
    // Filter logic here
    return sampleBlogPosts;
  }, [filter]);

  return (
    <div>
      {/* Your JSX here */}
    </div>
  );
}
```

---

## Available Sample Data

### 12 Sample Posts:

1. **Ultimate Guide to Santorini** (Featured Blog)
2. **Kyoto Cherry Blossom Guide** (Featured Blog)
3. **Paris Thanksgiving Deal** (Flash Deal - 70% off)
4. **Caribbean All-Inclusive Deal** (Flash Deal - 60% off)
5. **Hawaii Flash Sale** (Flash Deal - 56% off)
6. **Backpacking Southeast Asia** (Guide)
7. **First-Time Europe Trip** (Guide)
8. **Digital Nomad Cities 2025** (Guide)
9. **Thailand Visa-Free Extension** (Breaking News)
10. **Airlines Drop Fuel Surcharges** (News)
11. **10 Airport Hacks** (Travel Tip)
12. **Packing Light Guide** (Travel Tip)

### 4 Sample Authors:
- Sarah Johnson (Senior Travel Writer)
- Mike Rodriguez (Deals Editor)
- Emily Chen (Travel Guide Writer)
- Alex Turner (News Editor)

---

## Styling Guidelines

### Tailwind Classes Used

**Layout:**
- `container mx-auto px-4` - Main container
- `grid md:grid-cols-2 lg:grid-cols-3 gap-8` - Responsive grid
- `flex items-center justify-between` - Flex layout

**Colors:**
- `bg-blue-600 text-white` - Primary buttons
- `bg-red-600 text-white` - Urgent/Deals
- `bg-gray-50` - Background
- `text-gray-600` - Body text

**Effects:**
- `hover:shadow-xl transition-all` - Card hover
- `rounded-lg` - Rounded corners
- `shadow-md` - Subtle shadow

---

## Metadata for SEO

Each page includes:
```typescript
export const metadata: Metadata = {
  title: 'Page Title - Fly2Any',
  description: 'Page description...',
  keywords: ['keyword1', 'keyword2'],
  openGraph: {
    title: 'OG Title',
    description: 'OG Description',
    type: 'website',
  },
};
```

---

## Testing URLs

**Development:**
```
http://localhost:3000/blog
http://localhost:3000/blog/ultimate-guide-santorini-2025
http://localhost:3000/blog/category/deal
http://localhost:3000/blog/news
```

**Production:**
```
https://fly2any.com/blog
https://fly2any.com/blog/ultimate-guide-santorini-2025
https://fly2any.com/blog/category/deal
https://fly2any.com/blog/news
```

---

## Next Steps for UI Team

### Priority 1: Core Components
1. Create `<ArticleCard>` component
2. Create `<DealCard>` component
3. Create `<NewsCard>` component
4. Create `<CategoryFilter>` component

### Priority 2: Interactive Elements
5. Create `<CountdownTimer>` component for deals
6. Create `<ShareButtons>` component
7. Create `<SearchBar>` component
8. Create `<NewsletterSignup>` component

### Priority 3: Advanced Features
9. Create `<CommentSection>` component
10. Create `<RelatedPosts>` component
11. Create `<AuthorBio>` component
12. Create `<Pagination>` component

---

## Common Patterns

### Display Article List
```typescript
{posts.map((post) => (
  <Link key={post.id} href={`/blog/${post.slug}`}>
    <h3>{post.title}</h3>
    <p>{post.excerpt}</p>
    <span>{post.readTime} min read</span>
  </Link>
))}
```

### Display Deal Info
```typescript
{post.dealMetadata && (
  <div>
    <span>${post.dealMetadata.discountedPrice}</span>
    <span className="line-through">
      ${post.dealMetadata.originalPrice}
    </span>
    <span>{post.dealMetadata.discount}% OFF</span>
  </div>
)}
```

### Display Urgency Badge
```typescript
{post.newsMetadata && (
  <span className={
    post.newsMetadata.urgency === 'critical'
      ? 'bg-red-600'
      : 'bg-orange-600'
  }>
    {post.newsMetadata.urgency.toUpperCase()}
  </span>
)}
```

---

## File Locations

```
lib/
├── types/
│   └── blog.ts                    # All TypeScript types
├── data/
│   └── blog-posts.ts              # Sample data + helpers
└── utils/
    └── blog-helpers.ts            # Utility functions

app/
└── blog/
    ├── layout.tsx                 # Blog layout + metadata
    ├── page.tsx                   # Blog homepage
    ├── [slug]/
    │   └── page.tsx               # Individual article
    ├── news/
    │   └── page.tsx               # News feed
    └── category/
        └── [category]/
            └── page.tsx           # Category pages
```

---

## Tips & Best Practices

1. **Always use TypeScript types** - Import from `@/lib/types/blog`
2. **Use helper functions** - Don't recreate date formatting, use helpers
3. **Check for optional data** - Use `?.` operator for optional fields
4. **Test with sample data** - 12 sample posts cover all scenarios
5. **Follow existing patterns** - Look at how current pages are structured
6. **Use Tailwind classes** - Keep styling consistent
7. **Add loading states** - Show spinners while data loads
8. **Handle empty states** - Show friendly messages when no data

---

## Contact

For questions about the blog infrastructure:
- Check `BLOG_INFRASTRUCTURE_COMPLETE.md` for full documentation
- Review existing page implementations for patterns
- All types are documented in `lib/types/blog.ts`

---

**Last Updated:** October 10, 2025
**Version:** 1.0.0
**Status:** Ready for UI Development
