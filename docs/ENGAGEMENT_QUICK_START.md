# Engagement Features - Quick Start Guide

## Installation (Already Complete)

All files have been created in the correct locations. No installation needed!

## File Structure

```
C:\Users\Power\fly2any-fresh\
├── lib/
│   ├── hooks/
│   │   └── useBlogEngagement.ts          # Main engagement hook
│   ├── utils/
│   │   ├── blogHelpers.ts                # Blog utility functions
│   │   └── dealCountdown.ts              # Deal countdown utilities
│   └── analytics/
│       └── blogAnalytics.ts              # Analytics tracking
└── components/
    └── blog/
        ├── SavedPostsWidget.tsx          # Saved posts sidebar widget
        ├── RecommendedPosts.tsx          # Smart recommendations
        └── DealRadar.tsx                 # Personalized deal alerts
```

---

## 5-Minute Quick Start

### 1. Add Like/Save Buttons to Blog Post

```typescript
'use client';

import { useBlogEngagement } from '@/lib/hooks/useBlogEngagement';
import { Heart, Bookmark } from 'lucide-react';

export default function BlogPostActions({ postId }) {
  const { isPostSaved, isPostLiked, toggleSavePost, toggleLikePost } = useBlogEngagement();

  return (
    <div className="flex gap-2">
      <button
        onClick={() => toggleLikePost(postId)}
        className={`px-4 py-2 rounded ${
          isPostLiked(postId) ? 'bg-red-100 text-red-600' : 'bg-gray-100'
        }`}
      >
        <Heart className={`w-5 h-5 ${isPostLiked(postId) ? 'fill-current' : ''}`} />
      </button>

      <button
        onClick={() => toggleSavePost(postId)}
        className={`px-4 py-2 rounded ${
          isPostSaved(postId) ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'
        }`}
      >
        <Bookmark className={`w-5 h-5 ${isPostSaved(postId) ? 'fill-current' : ''}`} />
      </button>
    </div>
  );
}
```

### 2. Add Saved Posts Widget to Sidebar

```typescript
import SavedPostsWidget from '@/components/blog/SavedPostsWidget';

export default function Sidebar({ allPosts }) {
  return (
    <aside className="w-80">
      <SavedPostsWidget
        allPosts={allPosts}
        language="en"
        maxDisplay={5}
      />
    </aside>
  );
}
```

### 3. Add Smart Recommendations

```typescript
import RecommendedPosts from '@/components/blog/RecommendedPosts';

export default function BlogPost({ post, allPosts }) {
  return (
    <article>
      {/* Post content */}
      <h1>{post.title}</h1>
      <div>{post.content}</div>

      {/* Recommendations at the end */}
      <RecommendedPosts
        currentPostId={post.id}
        allPosts={allPosts}
        limit={3}
        variant="grid"
      />
    </article>
  );
}
```

### 4. Add Deal Radar

```typescript
import DealRadar from '@/components/blog/DealRadar';

const deals = [
  {
    id: '1',
    title: 'Paris from Sao Paulo',
    expiryDate: '2025-01-25T23:59:59',
    fromAirport: 'GRU',
    toDestination: 'Paris',
    price: 599,
    originalPrice: 899,
    discount: 33,
  },
];

export default function Homepage() {
  return (
    <div>
      <DealRadar deals={deals} language="en" />
    </div>
  );
}
```

### 5. Track Analytics

```typescript
'use client';

import { useEffect } from 'react';
import { trackPostView, trackPostShare } from '@/lib/analytics/blogAnalytics';
import { shareToSocial } from '@/lib/utils/blogHelpers';

export default function BlogPost({ post }) {
  // Track view on mount
  useEffect(() => {
    trackPostView(post.id, post.title, post.category);
  }, [post.id]);

  const handleShare = (platform: string) => {
    shareToSocial(platform, window.location.href, post.title);
    trackPostShare(post.id, post.title, platform);
  };

  return (
    <article>
      <h1>{post.title}</h1>
      <button onClick={() => handleShare('twitter')}>Share on Twitter</button>
      <button onClick={() => handleShare('whatsapp')}>Share on WhatsApp</button>
    </article>
  );
}
```

---

## Common Use Cases

### Calculate Read Time

```typescript
import { calculateReadTime } from '@/lib/utils/blogHelpers';

const readTime = calculateReadTime(post.content);
// Returns: 5 (minutes)
```

### Format Date

```typescript
import { formatDate } from '@/lib/utils/blogHelpers';

formatDate(post.date, 'en');  // "January 15, 2025"
formatDate(post.date, 'pt');  // "15 de janeiro de 2025"
formatDate(post.date, 'es');  // "15 de enero de 2025"
```

### Search Posts

```typescript
import { searchPosts } from '@/lib/utils/blogHelpers';

const results = searchPosts(allPosts, 'paris vacation');
```

### Filter by Category

```typescript
import { filterPostsByCategory } from '@/lib/utils/blogHelpers';

const travelTips = filterPostsByCategory(allPosts, 'Travel Tips');
```

### Get Related Posts

```typescript
import { getRelatedPosts } from '@/lib/utils/blogHelpers';

const related = getRelatedPosts(currentPost, allPosts, 3);
```

### Deal Countdown

```typescript
import { getTimeRemaining, formatCountdown } from '@/lib/utils/dealCountdown';

const timeRemaining = getTimeRemaining(deal.expiryDate);
const countdown = formatCountdown(timeRemaining, 'en', true); // "2d 5h 30m"
```

---

## Testing in Browser

1. Open your app in browser
2. Open DevTools (F12)
3. Go to **Application > Local Storage**
4. Look for key: `fly2any_blog_engagement`
5. You'll see:
   ```json
   {
     "savedPosts": ["post-1", "post-2"],
     "likedPosts": ["post-1"],
     "recentViews": [
       { "postId": "post-1", "timestamp": 1705334400000 }
     ],
     "preferences": {
       "homeAirport": "GRU",
       "language": "en"
     }
   }
   ```

---

## Troubleshooting

### Hook not working?
```typescript
// Make sure you're in a client component
'use client';

import { useBlogEngagement } from '@/lib/hooks/useBlogEngagement';
```

### localStorage not persisting?
```typescript
// Check if you're in a browser environment
if (typeof window !== 'undefined') {
  // Safe to use localStorage
}
```

### Analytics not tracking?
```typescript
// Check console in development mode
// You should see: [Analytics Event] { ... }
```

### Component not importing?
```typescript
// Use absolute imports
import SavedPostsWidget from '@/components/blog/SavedPostsWidget';

// NOT relative imports like:
import SavedPostsWidget from '../../components/blog/SavedPostsWidget';
```

---

## Next Steps

1. Read the full guide: `docs/ENGAGEMENT_FEATURES_GUIDE.md`
2. Integrate components into your pages
3. Customize styling to match your design
4. Add Google Analytics tracking ID
5. Test on mobile devices
6. Monitor analytics in console

---

## Support

All code is fully typed with TypeScript. Use IntelliSense (Ctrl+Space) to see available functions and their parameters.

**Happy coding!**
