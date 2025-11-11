# Phase 9: Admin Dashboard, CMS & Advanced Features

## Executive Summary
Phase 9 transforms Fly2Any into a fully manageable platform with comprehensive admin tools, real-time dashboards, content management, advanced search, and system monitoring capabilities.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          PHASE 9 SYSTEM ARCHITECTURE                     │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                             Admin Portal                                 │
├──────────────────────┬──────────────────────┬──────────────────────────┤
│  Analytics Dashboard │   User Management    │    Content Management    │
│  - Real-time metrics │   - User list/search │    - Deals editor       │
│  - Charts & graphs   │   - Role assignment  │    - Destination editor │
│  - Performance       │   - Activity logs    │    - Guide editor       │
│  - Error monitoring  │   - Moderation       │    - Media library      │
├──────────────────────┼──────────────────────┼──────────────────────────┤
│  Experiment Console  │  System Monitoring   │   Notification Center    │
│  - A/B test list     │   - Health checks    │    - Template editor    │
│  - Results analysis  │   - DB performance   │    - Send notifications │
│  - Feature flags     │   - API monitoring   │    - Schedule messages  │
└──────────────────────┴──────────────────────┴──────────────────────────┘
                                   ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                          Frontend Features                               │
├──────────────────────┬──────────────────────┬──────────────────────────┤
│  Advanced Search     │   Real-time Updates  │    SEO Optimization      │
│  - Autocomplete      │   - SSE connections  │    - Dynamic meta tags   │
│  - Filters           │   - Live metrics     │    - Sitemap generation  │
│  - Suggestions       │   - Notifications    │    - Schema markup       │
└──────────────────────┴──────────────────────┴──────────────────────────┘
                                   ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                           API Services                                   │
├─────────────────────────────────────────────────────────────────────────┤
│  /api/admin/*  │  /api/cms/*  │  /api/search/*  │  /api/realtime/*     │
└─────────────────────────────────────────────────────────────────────────┘
                                   ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                      Data & Infrastructure                               │
├─────────────────────────────────────────────────────────────────────────┤
│  PostgreSQL  │  Redis Cache  │  File Storage  │  Search Index           │
└─────────────────────────────────────────────────────────────────────────┘
```

## Core Systems

### 1. Admin Dashboard System

#### Overview Analytics Dashboard
**Purpose:** Real-time business intelligence at a glance

**Sections:**
```typescript
interface DashboardOverview {
  // Key Metrics (Last 24h)
  metrics: {
    activeUsers: number
    totalSearches: number
    conversions: number
    revenue: number
    conversionRate: number
    avgSessionDuration: number
  }

  // Real-time Activity Feed
  recentActivity: Activity[]

  // Performance Summary
  performance: {
    avgLCP: number
    avgFID: number
    avgCLS: number
    errorRate: number
  }

  // Top Performing Routes
  topRoutes: {
    route: string
    searches: number
    conversions: number
    revenue: number
  }[]

  // User Growth Chart (7 days)
  userGrowth: {
    date: string
    newUsers: number
    activeUsers: number
  }[]
}
```

**Features:**
- 📊 Real-time metric cards with trend indicators
- 📈 Interactive charts (line, bar, pie, funnel)
- 🔴 Live activity feed with SSE
- 📅 Date range selector
- 📥 Export to CSV/PDF
- 🔄 Auto-refresh every 30 seconds

#### Analytics Deep Dive
**Tabs:**
1. **User Analytics**
   - Demographics
   - Behavior flow
   - Retention cohorts
   - Lifetime value
   - Segmentation

2. **Search Analytics**
   - Popular routes
   - Search patterns
   - Filter usage
   - Destination trends
   - Seasonal analysis

3. **Conversion Analytics**
   - Funnel visualization
   - Drop-off points
   - Conversion by source
   - Time to conversion
   - Revenue attribution

4. **Performance Analytics**
   - Web Vitals trends
   - Page load times
   - API response times
   - Device/browser breakdown
   - Geographic performance

5. **Error Analytics**
   - Error frequency
   - Error types
   - Affected users
   - Resolution status
   - Error trends

#### Tech Stack
- **Frontend:** React + Recharts/Chart.js
- **Real-time:** Server-Sent Events (SSE)
- **State:** TanStack Query for data fetching
- **Export:** jsPDF + csv-export

### 2. User Management System

#### User List & Search
```typescript
interface UserManagement {
  // User table with filters
  users: {
    id: string
    email: string
    name: string
    role: 'user' | 'admin' | 'moderator'
    status: 'active' | 'suspended' | 'deleted'
    createdAt: Date
    lastLoginAt: Date
    totalSearches: number
    totalBookings: number
    lifetimeValue: number
  }[]

  // Filters
  filters: {
    search: string
    role: string[]
    status: string[]
    dateRange: [Date, Date]
    sortBy: string
    sortOrder: 'asc' | 'desc'
  }

  // Bulk actions
  bulkActions: {
    suspend: (userIds: string[]) => void
    activate: (userIds: string[]) => void
    delete: (userIds: string[]) => void
    export: (userIds: string[]) => void
  }
}
```

**Features:**
- 🔍 Advanced search (email, name, ID)
- 🎯 Multi-filter support
- ✅ Bulk selection & actions
- 📊 User stats in table
- 👤 User detail modal
- 📝 Activity history
- 🚫 Suspend/activate users
- 📧 Send notifications

#### User Detail View
- Profile information
- Login history
- Session management
- Search history
- Booking history
- Wishlist items
- Price alerts
- Notification preferences
- Activity timeline
- Admin notes

#### Role-Based Access Control (RBAC)
```typescript
enum Role {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  USER = 'user'
}

interface Permission {
  resource: string
  actions: ('create' | 'read' | 'update' | 'delete')[]
}

const rolePermissions: Record<Role, Permission[]> = {
  super_admin: [{ resource: '*', actions: ['create', 'read', 'update', 'delete'] }],
  admin: [
    { resource: 'users', actions: ['read', 'update'] },
    { resource: 'content', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'analytics', actions: ['read'] },
  ],
  moderator: [
    { resource: 'content', actions: ['read', 'update'] },
    { resource: 'users', actions: ['read'] },
  ],
  user: [
    { resource: 'own_data', actions: ['read', 'update'] }
  ]
}
```

### 3. Content Management System (CMS)

#### Deal Management
**CRUD Operations for Travel Deals**

```typescript
interface DealEditor {
  // Basic Info
  title: string
  description: string
  destination: {
    city: string
    country: string
    airportCode: string
  }

  // Pricing
  originalPrice: number
  discountedPrice: number
  currency: string
  savings: number
  savingsPercentage: number

  // Flight Details
  origin: string
  departDate: string
  returnDate: string
  airline: string
  flightNumber: string
  duration: string
  stops: number
  cabinClass: string

  // Deal Metadata
  dealScore: number
  featured: boolean
  active: boolean
  expiresAt: Date
  category: 'flash_sale' | 'last_minute' | 'featured' | 'seasonal'
  tags: string[]

  // Images
  images: {
    thumbnail: string
    hero: string
    gallery: string[]
  }

  // Restrictions
  restrictions: string[]
  termsAndConditions: string

  // SEO
  seo: {
    metaTitle: string
    metaDescription: string
    slug: string
    keywords: string[]
  }
}
```

**Features:**
- ✏️ Rich text editor (TipTap or Quill)
- 🖼️ Image upload with preview
- 📅 Date pickers
- 🎨 Live preview
- 💾 Auto-save drafts
- 📱 Mobile preview
- 🔍 SEO preview
- 📊 Analytics integration
- 🗓️ Scheduling
- 🔄 Version history

#### Destination Management
**CRUD for Explore/Destination Pages**

```typescript
interface DestinationEditor {
  // Basic Info
  city: string
  country: string
  region: string
  airportCode: string

  // Content
  description: string
  shortDescription: string
  highlights: string[]

  // Travel Info
  bestTimeToVisit: string
  climate: string
  averageTemperature: { high: number, low: number }
  popularActivities: Activity[]

  // Pricing
  priceRange: 'budget' | 'moderate' | 'luxury'
  avgFlightPrice: number
  avgHotelPrice: number

  // Images & Media
  heroImage: string
  gallery: string[]
  videoUrl: string

  // Categories
  travelStyles: ('beach' | 'adventure' | 'culture' | 'food' | 'romantic')[]

  // SEO
  seo: SEOConfig

  // Status
  published: boolean
  featured: boolean
  trending: boolean
}
```

#### Travel Guide Management
**CRUD for Travel Guides**

```typescript
interface GuideEditor {
  destination: string
  category: 'visa' | 'weather' | 'safety' | 'culture' | 'transport' | 'budget'
  title: string
  content: string // Rich text
  sections: {
    title: string
    content: string
    icon: string
  }[]

  lastUpdated: Date
  author: string
  published: boolean
}
```

#### Media Library
- 📁 File manager
- 📤 Bulk upload
- 🖼️ Image optimization (auto-resize, compress)
- 📊 Storage usage
- 🔍 Search & filter
- 🗂️ Folders & tags
- ♻️ Unused media detection

### 4. Experiment Management Dashboard

#### Experiment List
```typescript
interface ExperimentDashboard {
  experiments: {
    id: string
    name: string
    key: string
    status: 'draft' | 'running' | 'completed' | 'archived'
    startDate: Date
    endDate?: Date

    // Participants
    totalParticipants: number
    participantsByVariant: Record<string, number>

    // Conversions
    conversions: Record<string, number>
    conversionRate: Record<string, number>

    // Statistical Analysis
    statisticalSignificance: boolean
    confidenceLevel: number
    winningVariant?: string

    // Business Impact
    estimatedImpact: {
      revenueChange: number
      conversionChange: number
    }
  }[]
}
```

**Features:**
- 📊 Results visualization
- 📈 Conversion charts by variant
- 🎯 Statistical significance calculator
- 🏆 Winner declaration
- 📥 Export results
- 🔄 Gradual rollout control
- ⏸️ Pause/resume experiments
- 🗑️ Archive completed tests

#### Experiment Detail View
- Variant performance comparison
- User segmentation analysis
- Funnel impact
- Revenue attribution
- Time-series charts
- Confidence intervals
- Sample size calculator
- Recommendations

### 5. Advanced Search System

#### Search Autocomplete
```typescript
interface SearchAutocomplete {
  // Airport/City suggestions
  suggestions: {
    type: 'airport' | 'city' | 'country'
    code: string
    name: string
    country: string
    popularity: number
  }[]

  // Recent searches (personalized)
  recentSearches: SearchQuery[]

  // Popular routes
  popularRoutes: {
    origin: string
    destination: string
    searches: number
    avgPrice: number
  }[]

  // Trending destinations
  trending: {
    destination: string
    reason: string
    dealCount: number
  }[]
}
```

**Features:**
- ⚡ Instant suggestions (<100ms)
- 🎯 Fuzzy matching
- 📍 Geolocation-based sorting
- 🔥 Trending indicators
- 💰 Price hints
- ⭐ Deal badges
- 📱 Mobile-optimized
- ⌨️ Keyboard navigation

#### Advanced Filters
```typescript
interface AdvancedFilters {
  // Price
  priceRange: [number, number]

  // Dates
  dateFlexibility: 'exact' | '±1' | '±3' | '±7'

  // Flight preferences
  stops: 'nonstop' | '1stop' | 'any'
  airlines: string[]
  departTime: 'morning' | 'afternoon' | 'evening' | 'night'
  arrivalTime: 'morning' | 'afternoon' | 'evening' | 'night'
  maxDuration: number

  // Cabin class
  cabinClass: ('economy' | 'premium' | 'business' | 'first')[]

  // Amenities
  amenities: ('wifi' | 'entertainment' | 'power' | 'meals')[]

  // Baggage
  baggageIncluded: boolean

  // Sort options
  sortBy: 'price' | 'duration' | 'best' | 'departure' | 'arrival'
}
```

#### Smart Search Features
- 🤖 Intent recognition (e.g., "cheap flights to Paris" → budget filter)
- 📅 Natural language dates ("next Friday", "Christmas")
- 🔍 Multi-city search support
- 💡 Alternative suggestions
- 🎯 Personalized ranking based on history

### 6. Real-Time Notification System

#### Server-Sent Events (SSE) for Live Updates
```typescript
// Server
app.get('/api/realtime/notifications', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  const sendNotification = (data: any) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`)
  }

  // Send heartbeat every 30s
  const heartbeat = setInterval(() => {
    res.write(':heartbeat\n\n')
  }, 30000)

  // Listen for notifications
  notificationEmitter.on('notification', sendNotification)

  req.on('close', () => {
    clearInterval(heartbeat)
    notificationEmitter.off('notification', sendNotification)
  })
})
```

**Notification Types:**
- 💰 Price drop alerts
- ✈️ New deal alerts
- 📊 System alerts (admin)
- 🎉 Milestone achievements
- 📧 Email verification
- 🔔 Booking confirmations
- ⚠️ Error notifications
- 📈 Analytics updates

#### Email Template System
```typescript
interface EmailTemplate {
  id: string
  name: string
  subject: string
  preheader: string
  body: string // HTML with variables
  variables: {
    name: string
    type: 'string' | 'number' | 'date' | 'boolean'
    default?: any
  }[]

  // Design
  layout: 'default' | 'marketing' | 'transactional'
  brandColor: string
  headerImage?: string
  footerText: string

  // Testing
  testRecipients: string[]
  lastTested?: Date
}
```

**Email Types:**
- 📧 Welcome email
- 🔐 Password reset
- ✅ Email verification
- 💰 Price alert
- 🎫 Booking confirmation
- 📊 Weekly digest
- 🎉 Deal announcements
- 📈 Admin reports

### 7. SEO Optimization System

#### Dynamic Meta Tags
```typescript
interface SEOConfig {
  // Basic
  title: string
  description: string
  keywords: string[]

  // Open Graph
  ogTitle: string
  ogDescription: string
  ogImage: string
  ogType: 'website' | 'article'

  // Twitter Card
  twitterCard: 'summary' | 'summary_large_image'
  twitterTitle: string
  twitterDescription: string
  twitterImage: string

  // Additional
  canonicalUrl: string
  robots: 'index,follow' | 'noindex,nofollow'
  alternateLanguages: { lang: string, url: string }[]
}
```

#### Sitemap Generation
```typescript
interface SitemapGenerator {
  generateSitemap(): Promise<string>

  // Pages to include
  staticPages: string[]
  dynamicPages: {
    deals: Deal[]
    destinations: Destination[]
    guides: Guide[]
  }

  // Priorities
  priorities: Record<string, number>

  // Change frequency
  changeFreq: Record<string, 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly'>
}
```

#### Schema.org Markup
```typescript
interface SchemaMarkup {
  // Organization
  organization: Organization

  // Website
  website: WebSite

  // Flights (per deal/search)
  flight: Flight

  // Breadcrumbs
  breadcrumbList: BreadcrumbList

  // Reviews/Ratings
  aggregateRating?: AggregateRating
}
```

### 8. System Health Monitoring

#### Health Check Dashboard
```typescript
interface SystemHealth {
  // Database
  database: {
    status: 'healthy' | 'degraded' | 'down'
    responseTime: number
    connections: {
      active: number
      idle: number
      total: number
    }
    slowQueries: {
      query: string
      duration: number
      count: number
    }[]
  }

  // API
  api: {
    status: 'healthy' | 'degraded' | 'down'
    endpoints: {
      path: string
      status: number
      avgResponseTime: number
      errorRate: number
    }[]
  }

  // External Services
  externalServices: {
    name: string
    status: 'healthy' | 'degraded' | 'down'
    lastCheck: Date
    responseTime: number
  }[]

  // Resources
  resources: {
    cpu: number
    memory: number
    disk: number
  }

  // Cron Jobs
  cronJobs: {
    name: string
    lastRun: Date
    status: 'success' | 'failed'
    duration: number
  }[]
}
```

### 9. Admin Activity Logging

#### Audit Trail
```typescript
interface AuditLog {
  id: string
  timestamp: Date

  // Who
  userId: string
  userEmail: string
  userRole: string

  // What
  action: string // 'create', 'update', 'delete', 'view'
  resource: string // 'user', 'deal', 'experiment', etc.
  resourceId: string

  // Details
  changes?: {
    field: string
    oldValue: any
    newValue: any
  }[]

  // Context
  ipAddress: string
  userAgent: string
  requestId: string

  // Result
  success: boolean
  errorMessage?: string
}
```

**Features:**
- 🔍 Search & filter logs
- 📊 Activity timeline
- 👤 User activity report
- 📈 Action statistics
- 🚨 Suspicious activity alerts
- 📥 Export logs
- 🔐 Tamper-proof (immutable records)

## Database Schema Extensions

```prisma
// Admin Users
model AdminUser {
  id        String   @id @default(cuid())
  userId    String   @unique
  role      String // 'super_admin', 'admin', 'moderator'

  permissions Json // Custom permissions override

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("admin_users")
}

// Audit Logs
model AuditLog {
  id         String   @id @default(cuid())
  userId     String
  userEmail  String
  userRole   String

  action     String
  resource   String
  resourceId String
  changes    Json?

  ipAddress  String?
  userAgent  String?
  requestId  String?

  success    Boolean  @default(true)
  errorMessage String?

  timestamp  DateTime @default(now())

  @@index([userId, timestamp])
  @@index([resource, resourceId])
  @@index([timestamp])
  @@map("audit_logs")
}

// Content: Deals
model Deal {
  id          String   @id @default(cuid())

  title       String
  description String   @db.Text
  slug        String   @unique

  destination Json // {city, country, airportCode}
  origin      String

  originalPrice   Float
  discountedPrice Float
  currency        String

  flightDetails Json // {airline, flightNumber, duration, stops, etc}

  dealScore   Int
  featured    Boolean  @default(false)
  active      Boolean  @default(true)
  expiresAt   DateTime?

  category    String // flash_sale, last_minute, etc
  tags        String[]

  images      Json // {thumbnail, hero, gallery}
  restrictions String[]

  seo         Json // {metaTitle, metaDescription, slug, keywords}

  views       Int      @default(0)
  clicks      Int      @default(0)
  conversions Int      @default(0)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  createdBy   String

  @@index([slug])
  @@index([active, featured])
  @@index([expiresAt])
  @@map("deals")
}

// Content: Destinations
model Destination {
  id          String   @id @default(cuid())

  city        String
  country     String
  region      String
  airportCode String   @unique

  description String   @db.Text
  shortDescription String
  highlights  String[]

  travelInfo  Json // {bestTimeToVisit, climate, activities, etc}
  priceRange  String

  images      Json // {hero, gallery, video}
  travelStyles String[]

  seo         Json

  published   Boolean  @default(false)
  featured    Boolean  @default(false)
  trending    Boolean  @default(false)

  views       Int      @default(0)
  searches    Int      @default(0)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([airportCode])
  @@index([published, featured])
  @@map("destinations")
}

// Email Templates
model EmailTemplate {
  id          String   @id @default(cuid())

  name        String   @unique
  subject     String
  preheader   String?
  body        String   @db.Text
  variables   Json

  layout      String
  brandColor  String
  headerImage String?
  footerText  String

  active      Boolean  @default(true)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("email_templates")
}

// System Health Checks
model HealthCheck {
  id        String   @id @default(cuid())

  service   String // 'database', 'api', 'external:duffel', etc
  status    String // 'healthy', 'degraded', 'down'

  responseTime Float?
  errorMessage String?
  metadata     Json?

  timestamp DateTime @default(now())

  @@index([service, timestamp])
  @@index([status, timestamp])
  @@map("health_checks")
}
```

## Implementation Plan

### Week 1: Foundation
- [ ] Admin authentication & RBAC
- [ ] Admin layout & navigation
- [ ] Dashboard overview page
- [ ] User management CRUD

### Week 2: Analytics & Monitoring
- [ ] Analytics dashboard with charts
- [ ] Real-time updates with SSE
- [ ] Error monitoring UI
- [ ] Performance monitoring UI

### Week 3: CMS
- [ ] Deal editor
- [ ] Destination editor
- [ ] Guide editor
- [ ] Media library

### Week 4: Advanced Features
- [ ] Experiment management dashboard
- [ ] Advanced search & autocomplete
- [ ] Email template system
- [ ] System health monitoring

### Week 5: Polish & Deploy
- [ ] SEO optimization
- [ ] Audit logging UI
- [ ] Testing & QA
- [ ] Documentation
- [ ] Production deployment

## Success Metrics

- ⚡ Admin dashboard loads <2s
- 📊 Real-time updates <1s latency
- 🔍 Search autocomplete <100ms
- 📝 CMS operations <500ms
- 📧 Email delivery rate >95%
- 🎯 SEO score >90/100
- 🔐 Zero security vulnerabilities

## Tech Stack Summary

**Frontend:**
- Next.js 14 (App Router)
- React 18
- TypeScript
- TailwindCSS
- Recharts/Chart.js
- TipTap (Rich text editor)
- TanStack Query

**Backend:**
- Next.js API Routes
- Prisma ORM
- PostgreSQL
- Server-Sent Events (SSE)

**Infrastructure:**
- Vercel (hosting)
- Vercel Cron (scheduled tasks)
- Image optimization (Vercel)

**Security:**
- NextAuth.js (authentication)
- RBAC (authorization)
- Rate limiting
- Input validation (Zod)

---

**Phase 9 Goal:** Transform Fly2Any into a fully self-managed, enterprise-grade platform with comprehensive admin tools and advanced user features.
