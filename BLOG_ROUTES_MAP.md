# Blog Routes Map - Visual Guide

## Route Structure

```
📁 app/blog/
│
├── 📄 layout.tsx                          → Blog-wide layout + SEO metadata
│
├── 📄 page.tsx                            → /blog
│   └── Blog Homepage
│       ├── Hero with featured posts
│       ├── Flash deals section
│       ├── News ticker
│       ├── Category filters
│       ├── Content grid
│       └── Newsletter signup
│
├── 📁 [slug]/
│   └── 📄 page.tsx                        → /blog/[slug]
│       └── Individual Article Page
│           ├── Breadcrumb navigation
│           ├── Article header
│           ├── Featured image
│           ├── Deal metadata (if deal)
│           ├── Full content
│           ├── Tags
│           ├── Share buttons
│           ├── Author bio
│           ├── Related posts
│           └── Comments section
│
├── 📁 news/
│   └── 📄 page.tsx                        → /blog/news
│       └── News Feed Page
│           ├── Live feed header
│           ├── Stats dashboard
│           ├── Urgency indicators
│           ├── Chronological feed
│           └── Newsletter signup
│
└── 📁 category/
    └── 📁 [category]/
        └── 📄 page.tsx                    → /blog/category/[category]
            └── Category Filter Page
                ├── Category header
                ├── Filter/sort bar
                ├── Articles grid
                └── Cross-category CTAs
```

---

## URL Examples

### Static Routes

| URL | File | Description |
|-----|------|-------------|
| `/blog` | `app/blog/page.tsx` | Main blog homepage |
| `/blog/news` | `app/blog/news/page.tsx` | Breaking news feed |

### Dynamic Routes - Articles

| URL Pattern | File | Example URL |
|-------------|------|-------------|
| `/blog/[slug]` | `app/blog/[slug]/page.tsx` | `/blog/ultimate-guide-santorini-2025` |
| | | `/blog/flash-deal-paris-thanksgiving-70-off` |
| | | `/blog/backpacking-southeast-asia-complete-guide` |

### Dynamic Routes - Categories

| URL Pattern | File | Example URL |
|-------------|------|-------------|
| `/blog/category/[category]` | `app/blog/category/[category]/page.tsx` | `/blog/category/blog` |
| | | `/blog/category/deal` |
| | | `/blog/category/guide` |
| | | `/blog/category/tip` |
| | | `/blog/category/news` |
| | | `/blog/category/story` |

---

## Sample Article Slugs

### Featured Blog Posts
- `ultimate-guide-santorini-2025`
- `kyoto-cherry-blossom-season-guide`

### Flash Deals
- `flash-deal-paris-thanksgiving-70-off`
- `caribbean-winter-escape-all-inclusive-deal`
- `hawaii-flash-sale-west-coast-399`

### Travel Guides
- `backpacking-southeast-asia-complete-guide`
- `first-time-europe-trip-planning-guide`
- `digital-nomad-guide-best-cities-2025`

### News/Alerts
- `new-visa-free-travel-thailand-extended-2025`
- `airlines-drop-fuel-surcharges-flights-cheaper`

### Travel Tips
- `10-airport-hacks-save-time-money`
- `packing-light-carry-on-only-guide`

---

## Data Flow

```
User Request
    ↓
Next.js App Router
    ↓
Blog Page Component (app/blog/*/page.tsx)
    ↓
Import Blog Data (lib/data/blog-posts.ts)
    ↓
Use TypeScript Types (lib/types/blog.ts)
    ↓
Apply Helper Functions (lib/utils/blog-helpers.ts)
    ↓
Render with Tailwind CSS
    ↓
Return HTML to User
```

---

## Component Hierarchy

```
RootLayout (app/layout.tsx)
├── GlobalLayout (components/layout/GlobalLayout.tsx)
│   ├── Header
│   ├── Main Content
│   │   └── BlogLayout (app/blog/layout.tsx)
│   │       └── Blog Pages
│   │           ├── BlogPage (/blog)
│   │           ├── BlogPostPage (/blog/[slug])
│   │           ├── NewsPage (/blog/news)
│   │           └── CategoryPage (/blog/category/[category])
│   └── Footer
```

---

## Data Structure

```
lib/
├── types/
│   └── blog.ts
│       ├── BlogPost          → Main post interface
│       ├── Author            → Author info
│       ├── CategoryType      → 'blog' | 'news' | 'deal' | etc.
│       ├── DealMetadata      → Deal-specific data
│       └── NewsMetadata      → News-specific data
│
├── data/
│   └── blog-posts.ts
│       ├── authors           → 4 sample authors
│       ├── sampleBlogPosts   → 12 sample posts
│       └── Helper Functions:
│           ├── getPostsByCategory()
│           ├── getFeaturedPosts()
│           ├── getActiveDeals()
│           ├── getLatestNews()
│           ├── getPostBySlug()
│           └── getRelatedPosts()
│
└── utils/
    └── blog-helpers.ts
        ├── Date Functions:
        │   ├── formatDate()
        │   ├── getTimeAgo()
        │   └── calculateReadTime()
        │
        ├── Category Functions:
        │   ├── getCategoryDisplayName()
        │   ├── getCategoryIcon()
        │   └── getCategoryColor()
        │
        ├── Deal Functions:
        │   ├── isDealExpired()
        │   ├── getDaysUntilExpiry()
        │   └── formatCountdown()
        │
        └── Content Functions:
            ├── generateExcerpt()
            ├── truncateText()
            ├── generateSlug()
            ├── sortPostsByDate()
            ├── sortPostsByPopularity()
            ├── filterPostsBySearch()
            └── paginatePosts()
```

---

## Category System

| Category | Display Name | Icon | Color Scheme | Use Case |
|----------|--------------|------|--------------|----------|
| `blog` | Travel Blog | ✈️ | Blue | Destination guides, stories |
| `news` | Travel News | 📰 | Red-Orange | Breaking updates, alerts |
| `deal` | Flash Deals | 💰 | Green-Emerald | Limited-time offers |
| `guide` | Travel Guides | 🗺️ | Purple-Indigo | How-to guides |
| `tip` | Travel Tips | 💡 | Yellow-Amber | Quick tips, hacks |
| `story` | Travel Stories | 📖 | Pink-Rose | Personal experiences |

---

## Page Features Matrix

| Feature | Homepage | Post Page | News Page | Category Page |
|---------|----------|-----------|-----------|---------------|
| Hero Section | ✅ | ❌ | ✅ | ✅ |
| Featured Posts | ✅ | ❌ | ❌ | ❌ |
| Flash Deals | ✅ | ❌ | ❌ | ❌ |
| News Ticker | ✅ | ❌ | ✅ | ❌ |
| Category Filter | ✅ | ❌ | ❌ | ❌ |
| Content Grid | ✅ | ❌ | ✅ | ✅ |
| Full Article | ❌ | ✅ | ❌ | ❌ |
| Author Bio | ❌ | ✅ | ❌ | ❌ |
| Related Posts | ❌ | ✅ | ❌ | ❌ |
| Comments | ❌ | ✅ | ❌ | ❌ |
| Newsletter | ✅ | ✅ | ✅ | ✅ |
| Breadcrumbs | ❌ | ✅ | ✅ | ✅ |
| Share Buttons | ❌ | ✅ | ❌ | ❌ |
| Deal Metadata | ❌ | ✅ | ❌ | ✅ |
| Urgency Badges | ❌ | ❌ | ✅ | ❌ |

---

## SEO Structure

```
Blog Layout (app/blog/layout.tsx)
├── Title: "Travel Blog - Fly2Any | Guides, Deals & Travel Inspiration"
├── Description: "Explore travel guides, exclusive deals..."
├── Keywords: [travel blog, travel guides, flight deals...]
└── OpenGraph:
    ├── Title
    ├── Description
    └── Type: website

Individual Pages inherit this + add specific metadata
```

---

## State Management

```typescript
// Homepage State
const [selectedCategory, setSelectedCategory] = useState<string>('all');
const filteredPosts = useMemo(() => { ... }, [selectedCategory]);

// Post Page State
const [post, setPost] = useState<BlogPost | null>(null);
const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
const [loading, setLoading] = useState(true);

// News Page State
const newsPosts = useMemo(() => { ... }, []);

// Category Page State
const [posts, setPosts] = useState<BlogPost[]>([]);
const [loading, setLoading] = useState(true);
```

---

## Responsive Design

### Breakpoints
- **Mobile:** < 768px (default)
- **Tablet:** ≥ 768px (`md:`)
- **Desktop:** ≥ 1024px (`lg:`)

### Grid Layouts
```css
/* Mobile: 1 column */
grid-cols-1

/* Tablet: 2 columns */
md:grid-cols-2

/* Desktop: 3 columns */
lg:grid-cols-3
```

---

## Quick Access Commands

### Navigate to Blog Files
```bash
cd C:\Users\Power\fly2any-fresh\app\blog
```

### View Blog Types
```bash
cat lib/types/blog.ts
```

### View Sample Data
```bash
cat lib/data/blog-posts.ts
```

### View Helper Functions
```bash
cat lib/utils/blog-helpers.ts
```

### Run Type Check
```bash
npx tsc --noEmit
```

### Start Dev Server
```bash
npm run dev
```

Then visit: `http://localhost:3000/blog`

---

## Testing Checklist

- [ ] `/blog` loads without errors
- [ ] `/blog/news` loads without errors
- [ ] `/blog/ultimate-guide-santorini-2025` loads without errors
- [ ] `/blog/category/deal` loads without errors
- [ ] Category filter buttons work
- [ ] All sample posts display correctly
- [ ] Deal timers show correctly
- [ ] News urgency badges appear
- [ ] Related posts show up
- [ ] Breadcrumbs navigate correctly
- [ ] Mobile responsive layout works
- [ ] TypeScript compiles without errors

---

## File Count Summary

- **Pages Created:** 5 files
  - `app/blog/page.tsx`
  - `app/blog/[slug]/page.tsx`
  - `app/blog/news/page.tsx`
  - `app/blog/category/[category]/page.tsx`
  - `app/blog/layout.tsx`

- **Types Created:** 1 file
  - `lib/types/blog.ts`

- **Data Created:** 1 file
  - `lib/data/blog-posts.ts`

- **Utils Created:** 1 file
  - `lib/utils/blog-helpers.ts`

- **Documentation:** 3 files
  - `BLOG_INFRASTRUCTURE_COMPLETE.md`
  - `BLOG_QUICK_REFERENCE.md`
  - `BLOG_ROUTES_MAP.md` (this file)

**Total:** 11 files created

---

## Visual Route Tree

```
🌐 fly2any.com
    │
    └── /blog ━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
         ├── Homepage                     │
         │   ├── Featured Posts           │
         │   ├── Flash Deals              │
         │   ├── News Ticker              │
         │   └── All Posts Grid           │
         │                                │
         ├── /news ━━━━━━━━━━━━━━━━━━━━━│
         │   └── Breaking News Feed       │
         │                                │
         ├── /[slug] ━━━━━━━━━━━━━━━━━━│
         │   ├── /ultimate-guide...       │
         │   ├── /flash-deal-paris...     │
         │   ├── /backpacking-sea...      │
         │   └── ... (12 articles)        │
         │                                │
         └── /category/[category] ━━━━━━│
             ├── /blog                   │
             ├── /news                   │
             ├── /deal                   │
             ├── /guide                  │
             ├── /tip                    │
             └── /story                  │
                                         │
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

---

**Created by:** Blog Infrastructure Team
**Date:** October 10, 2025
**Status:** ✅ Complete & Ready for UI Development
