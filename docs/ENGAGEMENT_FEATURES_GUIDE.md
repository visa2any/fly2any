# Fly2Any Blog Engagement Features - Complete Guide

## Overview

This document provides comprehensive documentation for all engagement features built for the Fly2Any travel blog. These features are designed to increase user engagement, improve content discovery, and create a personalized experience for visitors.

---

## Table of Contents

1. [Core Features](#core-features)
2. [Hooks](#hooks)
3. [Utilities](#utilities)
4. [Components](#components)
5. [Analytics](#analytics)
6. [Usage Examples](#usage-examples)
7. [TypeScript Types](#typescript-types)
8. [Best Practices](#best-practices)

---

## Core Features

### Engagement System
- **Saved Posts**: Users can bookmark posts for later reading
- **Liked Posts**: Users can like posts they find valuable
- **View Tracking**: Automatic tracking of recently viewed posts
- **User Preferences**: Store user settings like home airport and language
- **Smart Recommendations**: AI-powered post recommendations based on user behavior
- **Deal Radar**: Personalized flight deal alerts based on user's home airport

### Data Persistence
- All data stored in localStorage with key: `fly2any_blog_engagement`
- Survives page refreshes and browser sessions
- Works offline (no backend required for MVP)
- Graceful error handling for storage failures

---

## Hooks

### useBlogEngagement

**Location**: `C:\Users\Power\fly2any-fresh\lib\hooks\useBlogEngagement.ts`

The main hook for managing user engagement data.

#### API

```typescript
const {
  // State
  savedPosts,        // string[] - Array of saved post IDs
  likedPosts,        // string[] - Array of liked post IDs
  recentViews,       // RecentView[] - Array of recent views
  preferences,       // UserPreferences object
  isLoaded,          // boolean - Loading state

  // Actions
  savePost,          // (postId: string) => void
  unsavePost,        // (postId: string) => void
  toggleSavePost,    // (postId: string) => void
  likePost,          // (postId: string) => void
  unlikePost,        // (postId: string) => void
  toggleLikePost,    // (postId: string) => void
  trackView,         // (postId: string) => void
  updatePreferences, // (updates: Partial<Preferences>) => void

  // Getters
  getSavedPosts,     // () => string[]
  getLikedPosts,     // () => string[]
  getRecentViews,    // () => RecentView[]
  isPostSaved,       // (postId: string) => boolean
  isPostLiked,       // (postId: string) => boolean

  // Utils
  clearSavedPosts,   // () => void
  clearAllData,      // () => void
} = useBlogEngagement();
```

#### Example Usage

```typescript
'use client';

import { useBlogEngagement } from '@/lib/hooks/useBlogEngagement';

function BlogPost({ post }) {
  const {
    isPostSaved,
    isPostLiked,
    toggleSavePost,
    toggleLikePost,
    trackView
  } = useBlogEngagement();

  // Track view on mount
  useEffect(() => {
    trackView(post.id);
  }, [post.id, trackView]);

  const isSaved = isPostSaved(post.id);
  const isLiked = isPostLiked(post.id);

  return (
    <div>
      <h1>{post.title}</h1>
      <button onClick={() => toggleSavePost(post.id)}>
        {isSaved ? 'Saved' : 'Save for later'}
      </button>
      <button onClick={() => toggleLikePost(post.id)}>
        {isLiked ? 'Liked' : 'Like'}
      </button>
    </div>
  );
}
```

---

## Utilities

### blogHelpers.ts

**Location**: `C:\Users\Power\fly2any-fresh\lib\utils\blogHelpers.ts`

Utility functions for blog operations.

#### Functions

1. **calculateReadTime(content: string): number**
   - Calculates estimated reading time based on word count
   - Assumes 225 words per minute
   - Returns minimum 1 minute

   ```typescript
   const readTime = calculateReadTime(post.content);
   console.log(`${readTime} min read`);
   ```

2. **formatDate(date: Date|string, language: 'en'|'pt'|'es'): string**
   - Formats date based on language
   - Returns localized date string

   ```typescript
   formatDate(new Date(), 'en'); // "January 15, 2025"
   formatDate(new Date(), 'pt'); // "15 de janeiro de 2025"
   formatDate(new Date(), 'es'); // "15 de enero de 2025"
   ```

3. **formatRelativeTime(date: Date|string, language: 'en'|'pt'|'es'): string**
   - Returns relative time (e.g., "2 days ago")
   - Supports multiple languages

   ```typescript
   formatRelativeTime(yesterday, 'en'); // "1 day ago"
   formatRelativeTime(yesterday, 'pt'); // "1 dia atras"
   ```

4. **shareToWhatsApp(url: string, title: string): void**
   - Opens WhatsApp share dialog
   - Works on mobile and desktop

   ```typescript
   shareToWhatsApp(window.location.href, post.title);
   ```

5. **shareToSocial(platform: string, url: string, title: string, description?: string): void**
   - Shares to various social platforms
   - Supported platforms: facebook, twitter, linkedin, telegram, email, whatsapp

   ```typescript
   shareToSocial('twitter', postUrl, post.title, post.excerpt);
   shareToSocial('facebook', postUrl, post.title);
   shareToSocial('linkedin', postUrl, post.title);
   ```

6. **shareNative(url: string, title: string, text?: string): Promise<boolean>**
   - Uses native Web Share API if available
   - Returns true if successful

   ```typescript
   const shared = await shareNative(postUrl, post.title, post.excerpt);
   if (!shared) {
     // Fallback to custom share
   }
   ```

7. **getRelatedPosts(currentPost: BlogPost, allPosts: BlogPost[], limit: number): BlogPost[]**
   - Finds related posts based on category, tags, and title similarity
   - Smart scoring algorithm

   ```typescript
   const related = getRelatedPosts(currentPost, allPosts, 3);
   ```

8. **filterPostsByCategory(posts: BlogPost[], category: string): BlogPost[]**
   - Filters posts by category

   ```typescript
   const travelTips = filterPostsByCategory(allPosts, 'Travel Tips');
   ```

9. **searchPosts(posts: BlogPost[], query: string): BlogPost[]**
   - Searches posts by title, excerpt, content, category, and tags
   - Case-insensitive

   ```typescript
   const results = searchPosts(allPosts, 'paris vacation');
   ```

10. **sortPostsByDate(posts: BlogPost[], order: 'asc'|'desc'): BlogPost[]**
    - Sorts posts by date

11. **paginatePosts(posts: BlogPost[], page: number, perPage: number): PaginationResult**
    - Paginate posts with metadata

    ```typescript
    const { posts, totalPages, hasNextPage } = paginatePosts(allPosts, 1, 9);
    ```

12. **copyToClipboard(text: string): Promise<boolean>**
    - Copies text to clipboard
    - Fallback for older browsers

13. **truncateText(text: string, maxLength: number, ellipsis?: string): string**
    - Truncates text to specified length

14. **slugify(text: string): string**
    - Converts text to URL-friendly slug

---

### dealCountdown.ts

**Location**: `C:\Users\Power\fly2any-fresh\lib\utils\dealCountdown.ts`

Utilities for deal countdown and urgency management.

#### Functions

1. **getTimeRemaining(targetDate: Date|string): TimeRemaining**
   - Returns time remaining object with days, hours, minutes, seconds

   ```typescript
   const remaining = getTimeRemaining(deal.expiryDate);
   console.log(remaining); // { days: 2, hours: 5, minutes: 30, seconds: 45, total: 190845000 }
   ```

2. **formatCountdown(timeRemaining: TimeRemaining, language: 'en'|'pt'|'es', compact: boolean): string**
   - Formats countdown for display
   - Compact: "2d 5h 30m"
   - Full: "2 days 5 hours 30 minutes"

   ```typescript
   const countdown = formatCountdown(remaining, 'en', true); // "2d 5h 30m"
   ```

3. **isDealActive(expiryDate: Date|string): boolean**
   - Checks if deal is still active

4. **getUrgencyLevel(timeRemaining: TimeRemaining): 'critical'|'high'|'medium'|'low'**
   - Returns urgency level based on time remaining
   - critical: < 6 hours
   - high: < 24 hours
   - medium: < 3 days
   - low: > 3 days

5. **getUrgencyColor(urgency): string**
   - Returns Tailwind CSS color classes

6. **sortDealsByUrgency(deals: Deal[]): Deal[]**
   - Sorts deals by urgency (most urgent first)

7. **filterActiveDeals(deals: Deal[]): Deal[]**
   - Filters only active deals

8. **calculateDiscount(originalPrice: number, currentPrice: number): number**
   - Calculates discount percentage

9. **formatPrice(price: number, currency: string, language): string**
   - Formats price with currency symbol

---

## Components

### SavedPostsWidget

**Location**: `C:\Users\Power\fly2any-fresh\components\blog\SavedPostsWidget.tsx`

Displays user's saved posts in a compact widget.

#### Props

```typescript
interface SavedPostsWidgetProps {
  allPosts: BlogPost[];        // All available posts
  language?: 'en'|'pt'|'es';   // Display language
  maxDisplay?: number;          // Max posts to show (default: 5)
  className?: string;           // Additional CSS classes
}
```

#### Usage

```typescript
import SavedPostsWidget from '@/components/blog/SavedPostsWidget';

function Sidebar({ posts }) {
  return (
    <SavedPostsWidget
      allPosts={posts}
      language="en"
      maxDisplay={5}
      className="mb-6"
    />
  );
}
```

#### Features
- Shows thumbnails and titles
- Click to navigate to post
- Remove button on hover
- Empty state when no saved posts
- "View all" link when more than maxDisplay

---

### RecommendedPosts

**Location**: `C:\Users\Power\fly2any-fresh\components\blog\RecommendedPosts.tsx`

Smart recommendations based on user behavior.

#### Props

```typescript
interface RecommendedPostsProps {
  currentPostId?: string;       // Current post ID (for related posts)
  allPosts: BlogPost[];         // All available posts
  language?: 'en'|'pt'|'es';    // Display language
  limit?: number;               // Number of recommendations (default: 3)
  className?: string;           // Additional CSS classes
  variant?: 'grid'|'list';      // Display variant (default: 'grid')
}
```

#### Usage

```typescript
import RecommendedPosts from '@/components/blog/RecommendedPosts';

// Grid variant (for content pages)
<RecommendedPosts
  currentPostId={post.id}
  allPosts={allPosts}
  language="en"
  limit={3}
  variant="grid"
/>

// List variant (for sidebar)
<RecommendedPosts
  allPosts={allPosts}
  language="en"
  limit={5}
  variant="list"
  className="mb-6"
/>
```

#### Recommendation Algorithm

1. **Related to current post** (if viewing a post)
   - Based on category, tags, and title similarity

2. **Based on saved posts**
   - Finds posts similar to user's saved posts

3. **Based on recent views**
   - Analyzes recently viewed posts

4. **Popular/Recent posts** (fallback)
   - Shows newest posts if no user data

---

### DealRadar

**Location**: `C:\Users\Power\fly2any-fresh\components\blog\DealRadar.tsx`

Personalized flight deal alerts based on user's home airport.

#### Props

```typescript
interface DealRadarProps {
  deals: Deal[];                // Available deals
  language?: 'en'|'pt'|'es';    // Display language
  className?: string;           // Additional CSS classes
  maxDisplay?: number;          // Max deals to show (default: 5)
}
```

#### Usage

```typescript
import DealRadar from '@/components/blog/DealRadar';

const deals = [
  {
    id: '1',
    title: 'Amazing Paris Deal',
    expiryDate: '2025-01-20',
    fromAirport: 'GRU',
    toDestination: 'Paris',
    price: 599,
    originalPrice: 899,
    discount: 33,
  },
];

<DealRadar
  deals={deals}
  language="en"
  maxDisplay={5}
/>
```

#### Features
- Airport selection dropdown
- Filters deals by home airport
- Real-time countdown
- Urgency indicators (color-coded)
- Auto-sorts by urgency
- Analytics tracking on click
- Animated radar icon

---

## Analytics

### blogAnalytics.ts

**Location**: `C:\Users\Power\fly2any-fresh\lib\analytics\blogAnalytics.ts`

Analytics tracking for user interactions.

#### Functions

All analytics functions log to console in development and integrate with:
- Google Analytics (gtag)
- Facebook Pixel (fbq)
- Can be extended for other providers

1. **trackPostView(postId: string, postTitle: string, postCategory?: string)**
   ```typescript
   trackPostView(post.id, post.title, post.category);
   ```

2. **trackPostLike(postId: string, postTitle: string, isLiked: boolean)**
   ```typescript
   trackPostLike(post.id, post.title, true);
   ```

3. **trackPostSave(postId: string, postTitle: string, isSaved: boolean)**
   ```typescript
   trackPostSave(post.id, post.title, true);
   ```

4. **trackPostShare(postId: string, postTitle: string, platform: string)**
   ```typescript
   trackPostShare(post.id, post.title, 'twitter');
   ```

5. **trackDealClick(dealId: string, dealTitle: string, dealPrice?: number, dealDestination?: string)**
   ```typescript
   trackDealClick(deal.id, deal.title, deal.price, deal.toDestination);
   ```

6. **trackSearch(query: string, resultsCount: number)**
   ```typescript
   trackSearch('paris hotels', results.length);
   ```

7. **trackCategoryFilter(category: string)**
   ```typescript
   trackCategoryFilter('Travel Tips');
   ```

8. **trackPageView(pagePath: string, pageTitle: string)**
   ```typescript
   trackPageView('/blog/paris-guide', 'Ultimate Paris Travel Guide');
   ```

9. **getAnalyticsSummary(): AnalyticsSummary**
   - Returns analytics summary from localStorage

10. **clearAnalyticsData(): void**
    - Clears all analytics data

---

## Usage Examples

### Complete Blog Post Page

```typescript
'use client';

import { useEffect } from 'react';
import { useBlogEngagement } from '@/lib/hooks/useBlogEngagement';
import { calculateReadTime, formatDate, shareToSocial } from '@/lib/utils/blogHelpers';
import { trackPostView, trackPostLike, trackPostShare } from '@/lib/analytics/blogAnalytics';
import RecommendedPosts from '@/components/blog/RecommendedPosts';
import { Heart, Bookmark, Share2 } from 'lucide-react';

export default function BlogPostPage({ post, allPosts }) {
  const {
    isPostSaved,
    isPostLiked,
    toggleSavePost,
    toggleLikePost,
    trackView,
  } = useBlogEngagement();

  const isSaved = isPostSaved(post.id);
  const isLiked = isPostLiked(post.id);
  const readTime = calculateReadTime(post.content);

  useEffect(() => {
    trackView(post.id);
    trackPostView(post.id, post.title, post.category);
  }, [post.id]);

  const handleLike = () => {
    toggleLikePost(post.id);
    trackPostLike(post.id, post.title, !isLiked);
  };

  const handleSave = () => {
    toggleSavePost(post.id);
    trackPostSave(post.id, post.title, !isSaved);
  };

  const handleShare = (platform: string) => {
    shareToSocial(platform, window.location.href, post.title);
    trackPostShare(post.id, post.title, platform);
  };

  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>{formatDate(post.date, 'en')}</span>
          <span>{readTime} min read</span>
          <span>{post.category}</span>
        </div>
      </header>

      <div className="flex gap-2 mb-8">
        <button
          onClick={handleLike}
          className={`flex items-center gap-2 px-4 py-2 rounded ${
            isLiked ? 'bg-red-100 text-red-600' : 'bg-gray-100'
          }`}
        >
          <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
          {isLiked ? 'Liked' : 'Like'}
        </button>

        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-4 py-2 rounded ${
            isSaved ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'
          }`}
        >
          <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
          {isSaved ? 'Saved' : 'Save'}
        </button>

        <button
          onClick={() => handleShare('twitter')}
          className="flex items-center gap-2 px-4 py-2 rounded bg-gray-100"
        >
          <Share2 className="w-5 h-5" />
          Share
        </button>
      </div>

      <div className="prose max-w-none mb-12">
        {post.content}
      </div>

      <RecommendedPosts
        currentPostId={post.id}
        allPosts={allPosts}
        language="en"
        limit={3}
        variant="grid"
      />
    </article>
  );
}
```

### Blog Sidebar with Widgets

```typescript
import SavedPostsWidget from '@/components/blog/SavedPostsWidget';
import RecommendedPosts from '@/components/blog/RecommendedPosts';
import DealRadar from '@/components/blog/DealRadar';

export default function BlogSidebar({ posts, deals }) {
  return (
    <aside className="space-y-6">
      <SavedPostsWidget
        allPosts={posts}
        language="en"
        maxDisplay={5}
      />

      <RecommendedPosts
        allPosts={posts}
        language="en"
        limit={5}
        variant="list"
      />

      <DealRadar
        deals={deals}
        language="en"
        maxDisplay={5}
      />
    </aside>
  );
}
```

### Search and Filter Page

```typescript
'use client';

import { useState, useMemo } from 'react';
import { searchPosts, filterPostsByCategory, sortPostsByDate } from '@/lib/utils/blogHelpers';
import { trackSearch, trackCategoryFilter } from '@/lib/analytics/blogAnalytics';

export default function BlogSearchPage({ allPosts }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const filteredPosts = useMemo(() => {
    let posts = allPosts;

    if (searchQuery) {
      posts = searchPosts(posts, searchQuery);
    }

    if (selectedCategory) {
      posts = filterPostsByCategory(posts, selectedCategory);
    }

    return sortPostsByDate(posts, 'desc');
  }, [allPosts, searchQuery, selectedCategory]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    trackSearch(query, filteredPosts.length);
  };

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category);
    trackCategoryFilter(category);
  };

  return (
    <div>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search posts..."
        className="w-full px-4 py-2 border rounded"
      />

      <div className="mt-4">
        {/* Category filters */}
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredPosts.map((post) => (
          <BlogCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
```

---

## TypeScript Types

### BlogPost

```typescript
interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  content?: string;
  image?: string;
  category?: string;
  tags?: string[];
  date?: string;
  author?: string;
  readTime?: number;
}
```

### Deal

```typescript
interface Deal {
  id: string;
  title: string;
  expiryDate: string | Date;
  fromAirport?: string;
  toDestination?: string;
  price?: number;
  originalPrice?: number;
  discount?: number;
}
```

### EngagementData

```typescript
interface EngagementData {
  savedPosts: string[];
  likedPosts: string[];
  recentViews: {
    postId: string;
    timestamp: number;
  }[];
  preferences: {
    homeAirport?: string;
    language?: 'en' | 'pt' | 'es';
    interests?: string[];
  };
}
```

---

## Best Practices

### Performance

1. **Use useMemo for expensive calculations**
   ```typescript
   const filteredPosts = useMemo(() => {
     return searchPosts(allPosts, query);
   }, [allPosts, query]);
   ```

2. **Use useCallback for event handlers**
   ```typescript
   const handleSave = useCallback(() => {
     toggleSavePost(post.id);
   }, [post.id, toggleSavePost]);
   ```

3. **Lazy load components**
   ```typescript
   const DealRadar = dynamic(() => import('@/components/blog/DealRadar'), {
     loading: () => <Skeleton />,
   });
   ```

### Error Handling

1. **Always handle localStorage errors gracefully**
   ```typescript
   try {
     localStorage.setItem(key, value);
   } catch (error) {
     console.error('Storage failed:', error);
     // Show user notification
   }
   ```

2. **Validate data before using**
   ```typescript
   if (!post || !post.id) {
     console.error('Invalid post data');
     return null;
   }
   ```

### Accessibility

1. **Add ARIA labels to interactive elements**
   ```typescript
   <button
     aria-label="Save post for later"
     onClick={handleSave}
   >
     <Bookmark />
   </button>
   ```

2. **Use semantic HTML**
   ```typescript
   <article>
     <header>
       <h1>{post.title}</h1>
     </header>
     <main>{post.content}</main>
   </article>
   ```

### Analytics

1. **Track all user interactions**
   - Post views
   - Likes/saves
   - Shares
   - Deal clicks
   - Search queries

2. **Use descriptive event names**
   ```typescript
   trackEvent({
     category: 'Blog',
     action: 'post_share',
     label: post.title,
   });
   ```

---

## Integration Checklist

- [ ] Import hooks and utilities in your components
- [ ] Add SavedPostsWidget to sidebar
- [ ] Add RecommendedPosts to blog post pages
- [ ] Add DealRadar to homepage/sidebar
- [ ] Implement analytics tracking on all interactions
- [ ] Add like/save buttons to blog cards
- [ ] Implement search and filter functionality
- [ ] Add share buttons with analytics
- [ ] Test localStorage persistence
- [ ] Test on mobile devices
- [ ] Add loading states
- [ ] Handle edge cases (no posts, no deals, etc.)

---

## Support

For questions or issues, refer to:
- TypeScript IntelliSense for type information
- Console logs in development mode for debugging
- Browser DevTools > Application > Local Storage for data inspection

---

**Built by: Engagement Features Team**
**Date: January 2025**
**Version: 1.0.0**
