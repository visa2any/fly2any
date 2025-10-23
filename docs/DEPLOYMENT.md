# Fly2Any Deployment Guide

Complete deployment guide for the Fly2Any travel platform built with Next.js 14, TypeScript, and Tailwind CSS.

---

## Table of Contents
1. [Prerequisites](#1-prerequisites)
2. [Environment Variables](#2-environment-variables)
3. [Local Development](#3-local-development)
4. [Build Process](#4-build-process)
5. [Deployment Platforms](#5-deployment-platforms)
6. [Performance Optimization](#6-performance-optimization)
7. [Monitoring & Analytics](#7-monitoring--analytics)
8. [Security](#8-security)
9. [CI/CD Pipeline](#9-cicd-pipeline)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Prerequisites

### Required Software
- **Node.js**: v20.x or higher (LTS recommended)
- **npm**: v9.x or higher (comes with Node.js)
- **Git**: Latest version for version control

### Check Your Versions
```bash
node --version  # Should be v20.x or higher
npm --version   # Should be v9.x or higher
git --version   # Any recent version
```

### System Requirements
- **RAM**: Minimum 4GB (8GB recommended for development)
- **Disk Space**: At least 500MB free space
- **OS**: Windows 10/11, macOS 10.15+, or Linux (Ubuntu 20.04+)

### Required Accounts
- **Amadeus API Account** - For flight search functionality
- **LiteAPI Account** - For hotel search functionality
- **Neon Database** - PostgreSQL database (serverless)
- **Email Service** - MailerSend, Mailgun, or Gmail SMTP
- **N8N Instance** (Optional) - For automation workflows
- **Vercel/Netlify/AWS Account** - For deployment

---

## 2. Environment Variables

Create a `.env.local` file in the project root with the following variables:

### Database Configuration
```bash
# Neon PostgreSQL Database
POSTGRES_URL="postgres://username:password@host/database?sslmode=require"
```

**Description**: Serverless PostgreSQL connection string from Neon.tech
- Get it from: https://neon.tech (Database > Connection Details)
- Format: `postgres://[user]:[password]@[host]/[database]?sslmode=require`
- Supports edge runtime and connection pooling

### Amadeus API (Flight Search)
```bash
# Amadeus API Credentials
AMADEUS_API_KEY=your_api_key_here
AMADEUS_API_SECRET=your_api_secret_here
AMADEUS_ENVIRONMENT=test  # or 'production'
```

**Description**: Amadeus Self-Service API credentials for flight search
- Get it from: https://developers.amadeus.com
- `test` environment: Free tier with limited data
- `production` environment: Requires approval and billing setup
- API endpoints change based on environment

### LiteAPI (Hotel Search)
```bash
# LiteAPI Hotel Service (Sandbox)
LITEAPI_SANDBOX_PUBLIC_KEY=your_public_key_here
LITEAPI_SANDBOX_PRIVATE_KEY=your_private_key_here
```

**Description**: LiteAPI credentials for hotel search and booking
- Get it from: https://www.liteapi.travel/
- Use sandbox keys for development/testing
- Switch to production keys for live deployment

### Email Services
```bash
# MailerSend (Recommended)
MAILERSEND_API_KEY=mlsn.your_api_key_here

# Mailgun (Alternative)
MAILGUN_API_KEY=your_mailgun_api_key

# Gmail SMTP (Alternative)
GMAIL_EMAIL=your-email@gmail.com
GMAIL_APP_PASSWORD=your_16_char_app_password
```

**Description**: Email service for booking confirmations and notifications
- **MailerSend**: Modern transactional email service (recommended)
- **Mailgun**: Robust email API with good deliverability
- **Gmail**: Use App Passwords (not your regular password)
  - Enable 2FA first: https://myaccount.google.com/security
  - Generate App Password: https://myaccount.google.com/apppasswords

### N8N Automation (Optional)
```bash
# N8N Workflow Automation
N8N_API_TOKEN=your_jwt_token_here
N8N_BASE_URL=https://your-n8n-instance.com
```

**Description**: Workflow automation for booking processing
- Optional: Only needed if using N8N for automation
- Get it from your N8N instance settings
- Used for complex booking workflows and integrations

### Vercel Configuration (If deploying to Vercel)
```bash
# Vercel Project Settings
VERCEL_PROJECT_ID=prj_your_project_id
VERCEL_ORG_ID=team_your_org_id
```

**Description**: Vercel project identifiers
- Automatically set by Vercel during deployment
- Can be found in project settings dashboard
- Not required for manual deployments

### Application Settings
```bash
# Public Application URLs
NEXT_PUBLIC_APP_URL=https://www.fly2any.com
NEXT_PUBLIC_APP_NAME=Fly2Any Travel
```

**Description**: Public environment variables (exposed to browser)
- `NEXT_PUBLIC_APP_URL`: Your production domain
- `NEXT_PUBLIC_APP_NAME`: Display name for the application
- These are accessible in client-side code

### Complete .env.local Template
```bash
# Database
POSTGRES_URL="postgres://username:password@host/database?sslmode=require"

# Amadeus API (Flight Search)
AMADEUS_API_KEY=your_api_key
AMADEUS_API_SECRET=your_api_secret
AMADEUS_ENVIRONMENT=test

# LiteAPI (Hotels)
LITEAPI_SANDBOX_PUBLIC_KEY=your_public_key
LITEAPI_SANDBOX_PRIVATE_KEY=your_private_key

# Email Services (Choose one)
MAILERSEND_API_KEY=mlsn.your_api_key
# OR
MAILGUN_API_KEY=your_mailgun_key
# OR
GMAIL_EMAIL=your-email@gmail.com
GMAIL_APP_PASSWORD=your_app_password

# N8N Automation (Optional)
N8N_API_TOKEN=your_token
N8N_BASE_URL=https://your-n8n-instance.com

# Application
NEXT_PUBLIC_APP_URL=https://www.fly2any.com
NEXT_PUBLIC_APP_NAME=Fly2Any Travel

# Vercel (Auto-populated on Vercel)
VERCEL_PROJECT_ID=prj_your_project_id
VERCEL_ORG_ID=team_your_org_id
```

### Security Notes
- **NEVER commit `.env.local` to version control**
- Add `.env.local` to `.gitignore`
- Use different credentials for development, staging, and production
- Rotate API keys regularly
- Use environment-specific values (test vs production)

---

## 3. Local Development

### Initial Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/fly2any-fresh.git
cd fly2any-fresh
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
# Copy the template and fill in your values
cp .env.example .env.local
# Edit .env.local with your credentials
```

4. **Initialize the database** (if needed)
```bash
# Run database initialization
npm run dev
# Visit http://localhost:3000/api/admin/init-db in browser
```

### Running the Development Server

```bash
# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

### Development Features

**Hot Module Replacement (HMR)**
- Automatic page reload on file changes
- Preserves component state during updates
- Instant feedback during development

**Fast Refresh**
- React Fast Refresh enabled by default
- Maintains component state across edits
- Provides error overlay for quick debugging

**TypeScript Type Checking**
```bash
# Run type checking without compilation
npx tsc --noEmit

# Watch mode for continuous type checking
npx tsc --noEmit --watch
```

**Linting**
```bash
# Run ESLint
npm run lint

# Auto-fix issues
npm run lint -- --fix
```

### Debugging

**VS Code Debug Configuration** (`.vscode/launch.json`)
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev"
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    },
    {
      "name": "Next.js: debug full stack",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev",
      "serverReadyAction": {
        "pattern": "started server on .+, url: (https?://.+)",
        "uriFormat": "%s",
        "action": "debugWithChrome"
      }
    }
  ]
}
```

**Browser DevTools**
- Chrome DevTools for React components
- Network tab for API request debugging
- Console for application logs

**Server-Side Debugging**
```bash
# Run with Node.js inspector
NODE_OPTIONS='--inspect' npm run dev
```

Then connect Chrome DevTools to `chrome://inspect`

### Common Development Tasks

**Clear Next.js cache**
```bash
rm -rf .next
npm run dev
```

**Reinstall dependencies**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Check for outdated packages**
```bash
npm outdated
```

**Update dependencies**
```bash
npm update
```

---

## 4. Build Process

### Production Build

```bash
# Create optimized production build
npm run build
```

### Build Output Structure
```
.next/
├── cache/              # Build cache for incremental builds
├── server/             # Server-side code
│   ├── app/           # App router pages
│   ├── chunks/        # Shared code chunks
│   └── pages/         # API routes
├── static/            # Static assets
│   ├── chunks/        # JavaScript chunks
│   ├── css/          # Compiled CSS
│   └── media/        # Images and fonts
└── BUILD_ID          # Unique build identifier
```

### Build Optimization Features

**Automatic Code Splitting**
- Each page is automatically code-split
- Shared dependencies bundled separately
- Dynamic imports for on-demand loading

**Tree Shaking**
- Removes unused code from bundles
- Reduces bundle size significantly
- Works with ES6 modules

**Minification**
- JavaScript minified with Terser
- CSS minified automatically
- HTML whitespace removed

**Image Optimization**
- Automatic image optimization via Next.js Image component
- WebP format with fallbacks
- Responsive images with srcset
- Lazy loading by default

### Bundle Analysis

**Install bundle analyzer**
```bash
npm install --save-dev @next/bundle-analyzer
```

**Configure in `next.config.mjs`**
```javascript
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... your existing config
};

export default withBundleAnalyzer(nextConfig);
```

**Analyze bundles**
```bash
ANALYZE=true npm run build
```

This opens an interactive visualization showing:
- Bundle sizes
- Dependency breakdown
- Optimization opportunities

### Build Performance Tips

**Incremental Builds**
```bash
# Subsequent builds are faster due to caching
npm run build
```

**Parallel Builds** (for multiple apps)
```bash
# Use npm workspaces or turbo for monorepos
npm install -g turbo
turbo run build
```

**Build Metrics**
After building, you'll see:
- Page sizes (First Load JS)
- Route types (λ server, ○ static, ● SSG)
- Build time and cache status

### Testing the Production Build Locally

```bash
# Build the application
npm run build

# Start production server
npm run start
```

Visit `http://localhost:3000` to test the production build.

### Build Verification Checklist
- [ ] No build errors or warnings
- [ ] All pages render correctly
- [ ] API routes respond properly
- [ ] Environment variables are loaded
- [ ] Images optimize correctly
- [ ] Bundle sizes are acceptable
- [ ] No console errors in browser

---

## 5. Deployment Platforms

### Option 1: Vercel (Recommended)

Vercel is the platform from the creators of Next.js and offers the best integration.

**Deploy via Vercel CLI**

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Login to Vercel**
```bash
vercel login
```

3. **Deploy**
```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

**Deploy via Vercel Dashboard**

1. Visit https://vercel.com/new
2. Import your Git repository
3. Configure environment variables in dashboard
4. Click "Deploy"

**Environment Variables in Vercel**
- Go to Project Settings > Environment Variables
- Add all variables from `.env.local`
- Set appropriate environments (Production, Preview, Development)
- Click "Save"

**Custom Domain Setup**
1. Go to Project Settings > Domains
2. Add your domain (e.g., `www.fly2any.com`)
3. Configure DNS records as shown:
   - Type: `CNAME`
   - Name: `www`
   - Value: `cname.vercel-dns.com`
4. Wait for SSL certificate provisioning (automatic)

**Vercel Configuration** (`vercel.json`)
```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "AMADEUS_ENVIRONMENT": "production"
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "s-maxage=60, stale-while-revalidate"
        }
      ]
    }
  ]
}
```

---

### Option 2: Netlify

**Deploy via Netlify CLI**

1. **Install Netlify CLI**
```bash
npm install -g netlify-cli
```

2. **Login to Netlify**
```bash
netlify login
```

3. **Initialize and deploy**
```bash
# Initialize site
netlify init

# Deploy
netlify deploy --prod
```

**Deploy via Netlify Dashboard**

1. Visit https://app.netlify.com/start
2. Connect your Git repository
3. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Functions directory: `netlify/functions` (if using)

**Netlify Configuration** (`netlify.toml`)
```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "20"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[headers]]
  for = "/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.css"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

**Environment Variables**
- Go to Site Settings > Environment Variables
- Add all variables from `.env.local`
- Deploy will automatically use these values

---

### Option 3: AWS (Amazon Web Services)

**Deploy with AWS Amplify**

1. **Install AWS CLI**
```bash
# macOS
brew install awscli

# Windows
msi installer from https://aws.amazon.com/cli/

# Verify installation
aws --version
```

2. **Configure AWS credentials**
```bash
aws configure
# Enter: Access Key ID, Secret Access Key, Region, Output format
```

3. **Deploy via Amplify Console**
- Visit https://console.aws.amazon.com/amplify
- Click "New app" > "Host web app"
- Connect your Git repository
- Configure build settings:
  ```yaml
  version: 1
  frontend:
    phases:
      preBuild:
        commands:
          - npm ci
      build:
        commands:
          - npm run build
    artifacts:
      baseDirectory: .next
      files:
        - '**/*'
    cache:
      paths:
        - node_modules/**/*
  ```

**Deploy with EC2 + PM2**

1. **Launch EC2 instance** (Ubuntu 22.04 LTS)

2. **SSH into instance**
```bash
ssh -i your-key.pem ubuntu@ec2-xx-xxx-xxx-xxx.compute.amazonaws.com
```

3. **Install Node.js and dependencies**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install git
sudo apt install git -y
```

4. **Clone and setup application**
```bash
# Clone repository
git clone https://github.com/yourusername/fly2any-fresh.git
cd fly2any-fresh

# Install dependencies
npm ci --production

# Create .env.local with production values
nano .env.local

# Build application
npm run build
```

5. **Start with PM2**
```bash
# Start application
pm2 start npm --name "fly2any" -- start

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup systemd
# Run the command shown in output

# Monitor application
pm2 monit

# View logs
pm2 logs fly2any
```

6. **Setup Nginx as reverse proxy**
```bash
# Install Nginx
sudo apt install nginx -y

# Configure Nginx
sudo nano /etc/nginx/sites-available/fly2any
```

Add configuration:
```nginx
server {
    listen 80;
    server_name fly2any.com www.fly2any.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable site and restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/fly2any /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

7. **Setup SSL with Let's Encrypt**
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain SSL certificate
sudo certbot --nginx -d fly2any.com -d www.fly2any.com

# Auto-renewal is configured automatically
```

---

### Option 4: Custom Server (Docker)

**Dockerfile**
```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Set environment to production
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Start application
CMD ["node", "server.js"]
```

**Docker Compose** (`docker-compose.yml`)
```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - POSTGRES_URL=${POSTGRES_URL}
      - AMADEUS_API_KEY=${AMADEUS_API_KEY}
      - AMADEUS_API_SECRET=${AMADEUS_API_SECRET}
      - AMADEUS_ENVIRONMENT=production
    env_file:
      - .env.local
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./certs:/etc/nginx/certs
    depends_on:
      - web
    restart: unless-stopped
```

**Build and run**
```bash
# Build image
docker build -t fly2any:latest .

# Run container
docker run -p 3000:3000 --env-file .env.local fly2any:latest

# Using Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**Update Next.js config for standalone output** (`next.config.mjs`)
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
};

export default nextConfig;
```

---

## 6. Performance Optimization

### Image Optimization

**Use Next.js Image Component**
```tsx
import Image from 'next/image';

export default function Component() {
  return (
    <Image
      src="/images/hero.jpg"
      alt="Hero"
      width={1200}
      height={600}
      priority // For above-fold images
      placeholder="blur" // Blur-up effect
      blurDataURL="data:image/jpeg..." // Base64 blur placeholder
    />
  );
}
```

**Configure Image Optimization** (`next.config.mjs`)
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.fly2any.com',
      },
    ],
  },
};

export default nextConfig;
```

**Image Optimization Best Practices**
- Use WebP/AVIF formats for better compression
- Serve responsive images with srcset
- Lazy load below-the-fold images
- Use blur placeholders for better perceived performance
- Optimize image dimensions before upload
- Use CDN for image delivery

### Code Splitting & Lazy Loading

**Dynamic Imports**
```tsx
import dynamic from 'next/dynamic';

// Component-level code splitting
const DynamicComponent = dynamic(() => import('@/components/HeavyComponent'), {
  loading: () => <p>Loading...</p>,
  ssr: false, // Disable SSR for client-only components
});

// With named exports
const DynamicMap = dynamic(
  () => import('@/components/Map').then(mod => mod.InteractiveMap),
  { ssr: false }
);
```

**Route-based Code Splitting** (Automatic)
- Each page in `app/` is automatically code-split
- Shared dependencies are extracted to separate chunks
- Only required JavaScript is loaded per route

**Lazy Load Heavy Libraries**
```tsx
'use client';

import { useState } from 'react';

export default function SearchComponent() {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleAdvancedClick = async () => {
    setShowAdvanced(true);
    // Load heavy date library only when needed
    const { DateRangePicker } = await import('react-date-range');
    // Use DateRangePicker
  };

  return (
    <div>
      <button onClick={handleAdvancedClick}>Show Advanced</button>
      {/* Advanced component rendered here */}
    </div>
  );
}
```

### CDN Setup

**Vercel CDN** (Automatic)
- All static assets served via global CDN
- Automatic cache invalidation on deployment
- Edge caching for API routes

**Cloudflare CDN**

1. **Add site to Cloudflare**
   - Sign up at https://cloudflare.com
   - Add your domain
   - Update nameservers

2. **Configure caching rules**
   - Cache Level: Standard
   - Browser Cache TTL: Respect Existing Headers
   - Always Online: On

3. **Page Rules**
   ```
   *.fly2any.com/_next/static/*
   - Cache Level: Cache Everything
   - Edge Cache TTL: 1 year

   *.fly2any.com/api/*
   - Cache Level: Bypass
   ```

4. **Enable optimizations**
   - Auto Minify: JavaScript, CSS, HTML
   - Brotli compression
   - HTTP/2 & HTTP/3
   - Early Hints

**AWS CloudFront**

1. **Create CloudFront distribution**
```bash
aws cloudfront create-distribution \
  --origin-domain-name fly2any.vercel.app \
  --default-root-object index.html
```

2. **Configure caching behavior**
   - Default TTL: 86400 (1 day)
   - Maximum TTL: 31536000 (1 year)
   - Compress Objects: Yes
   - Viewer Protocol Policy: Redirect HTTP to HTTPS

### Caching Headers

**Configure in `next.config.mjs`**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, s-maxage=31536000, stale-while-revalidate',
          },
        ],
      },
      {
        source: '/api/flights/search',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=300, stale-while-revalidate=600',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

**API Route Caching**
```typescript
// app/api/flights/search/route.ts
export async function GET(request: Request) {
  const data = await fetchFlights();

  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  });
}
```

### Performance Monitoring

**Web Vitals Tracking**
```tsx
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

**Custom Web Vitals Reporting**
```tsx
// app/web-vitals.tsx
'use client';

import { useReportWebVitals } from 'next/web-vitals';

export function WebVitals() {
  useReportWebVitals((metric) => {
    console.log(metric);

    // Send to analytics
    if (window.gtag) {
      window.gtag('event', metric.name, {
        value: Math.round(metric.value),
        event_label: metric.id,
        non_interaction: true,
      });
    }
  });

  return null;
}
```

### Bundle Size Optimization

**Analyze and reduce bundle size**
```bash
# Install bundle analyzer
npm install --save-dev @next/bundle-analyzer

# Analyze bundles
ANALYZE=true npm run build
```

**Tree-shake unused code**
```javascript
// Import only what you need
import { format } from 'date-fns'; // ✅ Good
import * as dateFns from 'date-fns'; // ❌ Imports everything
```

**Use lightweight alternatives**
- Replace `moment` with `date-fns` or `dayjs`
- Replace `lodash` with `lodash-es` or native methods
- Use native browser APIs when possible

---

## 7. Monitoring & Analytics

### Error Tracking

**Sentry Integration**

1. **Install Sentry**
```bash
npm install @sentry/nextjs
```

2. **Initialize Sentry**
```bash
npx @sentry/wizard@latest -i nextjs
```

3. **Configure Sentry** (`sentry.client.config.ts`)
```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay(),
  ],
});
```

4. **Server-side error tracking** (`sentry.server.config.ts`)
```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

5. **Add environment variable**
```bash
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project-id
```

**Error Boundaries**
```tsx
// components/error-boundary.tsx
'use client';

import { Component, ReactNode } from 'react';
import * as Sentry from '@sentry/nextjs';

export class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    Sentry.captureException(error, { contexts: { react: errorInfo } });
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}
```

### Performance Monitoring

**Vercel Analytics**
```tsx
// Already included in layout
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

**Google Analytics 4**

1. **Add GA4 tracking**
```tsx
// app/layout.tsx
import Script from 'next/script';

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
          `}
        </Script>
      </head>
      <body>{children}</body>
    </html>
  );
}
```

2. **Add environment variable**
```bash
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

3. **Track custom events**
```typescript
// lib/analytics.ts
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number
) => {
  if (window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Usage
trackEvent('search', 'flights', 'JFK-LAX', 350);
```

### User Analytics

**PostHog** (Open-source alternative)

1. **Install PostHog**
```bash
npm install posthog-js
```

2. **Initialize PostHog**
```tsx
// app/providers.tsx
'use client';

import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';
import { useEffect } from 'react';

export function PHProvider({ children }) {
  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      loaded: (posthog) => {
        if (process.env.NODE_ENV === 'development') posthog.debug();
      },
    });
  }, []);

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
```

3. **Track events**
```typescript
import { usePostHog } from 'posthog-js/react';

export function SearchForm() {
  const posthog = usePostHog();

  const handleSearch = () => {
    posthog.capture('flight_search', {
      origin: 'JFK',
      destination: 'LAX',
      date: '2025-01-15',
    });
  };
}
```

### A/B Testing Setup

**Vercel Edge Config + Middleware**

1. **Create Edge Config**
```bash
vercel env pull
vercel edge-config create
```

2. **Setup middleware** (`middleware.ts`)
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { get } from '@vercel/edge-config';

export async function middleware(request: NextRequest) {
  const variant = await get('ab_test_variant');
  const response = NextResponse.next();

  // Assign variant to user
  if (!request.cookies.get('variant')) {
    const userVariant = Math.random() < 0.5 ? 'A' : 'B';
    response.cookies.set('variant', userVariant);
  }

  return response;
}
```

3. **Use variant in component**
```tsx
import { cookies } from 'next/headers';

export default function HomePage() {
  const variant = cookies().get('variant')?.value || 'A';

  return (
    <div>
      {variant === 'A' ? <HeroA /> : <HeroB />}
    </div>
  );
}
```

**Google Optimize**

1. **Add Optimize script**
```tsx
<Script
  src={`https://www.googleoptimize.com/optimize.js?id=${process.env.NEXT_PUBLIC_OPTIMIZE_ID}`}
  strategy="afterInteractive"
/>
```

2. **Create experiments in Google Optimize dashboard**

3. **Track conversion events**
```typescript
if (window.gtag) {
  window.gtag('event', 'conversion', {
    send_to: 'AW-CONVERSION_ID',
  });
}
```

---

## 8. Security

### API Key Protection

**Never expose secrets in client code**
```typescript
// ❌ BAD - Exposed to client
const apiKey = 'sk_live_123456789';

// ✅ GOOD - Server-side only
const apiKey = process.env.AMADEUS_API_KEY;
```

**Use environment variables correctly**
```bash
# Client-accessible (use sparingly)
NEXT_PUBLIC_API_URL=https://api.fly2any.com

# Server-only (never exposed to client)
AMADEUS_API_SECRET=secret_key_here
DATABASE_URL=postgres://...
```

**Validate environment variables on startup**
```typescript
// lib/env.ts
const requiredEnvVars = [
  'AMADEUS_API_KEY',
  'AMADEUS_API_SECRET',
  'POSTGRES_URL',
];

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});
```

### CORS Configuration

**Configure CORS headers** (`next.config.mjs`)
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.ALLOWED_ORIGIN || 'https://www.fly2any.com',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
          {
            key: 'Access-Control-Max-Age',
            value: '86400',
          },
        ],
      },
    ];
  },
};
```

**Handle preflight requests**
```typescript
// app/api/flights/search/route.ts
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
```

### Rate Limiting

**Install rate limiter**
```bash
npm install @upstash/ratelimit @upstash/redis
```

**Configure Upstash Redis**
```bash
# Get from https://upstash.com
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

**Implement rate limiting**
```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'), // 10 requests per 10 seconds
  analytics: true,
});
```

**Apply to API routes**
```typescript
// app/api/flights/search/route.ts
import { ratelimit } from '@/lib/rate-limit';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const ip = request.ip ?? 'anonymous';
  const { success, limit, reset, remaining } = await ratelimit.limit(ip);

  if (!success) {
    return new Response('Rate limit exceeded', {
      status: 429,
      headers: {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': reset.toString(),
      },
    });
  }

  // Process request
  const data = await searchFlights();
  return Response.json(data);
}
```

**Alternative: Simple in-memory rate limiting**
```typescript
// lib/simple-rate-limit.ts
const requests = new Map<string, number[]>();

export function checkRateLimit(ip: string, limit = 10, window = 60000) {
  const now = Date.now();
  const userRequests = requests.get(ip) || [];

  // Remove old requests outside window
  const recentRequests = userRequests.filter(time => now - time < window);

  if (recentRequests.length >= limit) {
    return false;
  }

  recentRequests.push(now);
  requests.set(ip, recentRequests);
  return true;
}
```

### Input Validation

**Install validation library**
```bash
npm install zod
```

**Validate API inputs**
```typescript
// app/api/flights/search/route.ts
import { z } from 'zod';

const searchSchema = z.object({
  origin: z.string().min(3).max(3),
  destination: z.string().min(3).max(3),
  departureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  adults: z.number().min(1).max(9),
  children: z.number().min(0).max(9).optional(),
  travelClass: z.enum(['ECONOMY', 'BUSINESS', 'FIRST']).optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const params = {
      origin: searchParams.get('origin'),
      destination: searchParams.get('destination'),
      departureDate: searchParams.get('departureDate'),
      adults: Number(searchParams.get('adults')),
      children: Number(searchParams.get('children')),
      travelClass: searchParams.get('travelClass'),
    };

    // Validate input
    const validated = searchSchema.parse(params);

    // Process validated data
    const results = await searchFlights(validated);
    return Response.json(results);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    throw error;
  }
}
```

**Sanitize user input**
```typescript
// lib/sanitize.ts
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .slice(0, 1000); // Limit length
}

export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim();
}
```

### Security Headers

**Configure security headers** (`next.config.mjs`)
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};
```

**Content Security Policy (CSP)**
```javascript
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https:;
  font-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`;

// Add to headers
{
  key: 'Content-Security-Policy',
  value: cspHeader.replace(/\s{2,}/g, ' ').trim(),
}
```

---

## 9. CI/CD Pipeline

### GitHub Actions

**Create workflow file** (`.github/workflows/deploy.yml`)
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '20.x'

jobs:
  # Type checking and linting
  lint:
    name: Lint & Type Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

      - name: Type check
        run: npx tsc --noEmit

  # Run tests
  test:
    name: Run Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm test
        env:
          CI: true

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          token: ${{ secrets.CODECOV_TOKEN }}

  # Build application
  build:
    name: Build Application
    runs-on: ubuntu-latest
    needs: [lint, test]
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
        env:
          AMADEUS_API_KEY: ${{ secrets.AMADEUS_API_KEY }}
          AMADEUS_API_SECRET: ${{ secrets.AMADEUS_API_SECRET }}
          POSTGRES_URL: ${{ secrets.POSTGRES_URL }}

      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build
          path: .next/

  # Deploy to Vercel (Production)
  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: [build]
    if: github.ref == 'refs/heads/main'
    environment:
      name: production
      url: https://www.fly2any.com
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
          working-directory: ./

  # Deploy to Preview (PRs)
  deploy-preview:
    name: Deploy Preview
    runs-on: ubuntu-latest
    needs: [build]
    if: github.event_name == 'pull_request'
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Vercel (Preview)
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./

      - name: Comment PR
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '✅ Preview deployed successfully!'
            })
```

**Configure GitHub Secrets**
1. Go to repository Settings > Secrets and variables > Actions
2. Add the following secrets:
   - `VERCEL_TOKEN` - Get from Vercel account settings
   - `VERCEL_ORG_ID` - From `.vercel/project.json`
   - `VERCEL_PROJECT_ID` - From `.vercel/project.json`
   - `AMADEUS_API_KEY` - Your Amadeus API key
   - `AMADEUS_API_SECRET` - Your Amadeus API secret
   - `POSTGRES_URL` - Database connection string
   - `CODECOV_TOKEN` - For code coverage (optional)

### Automated Testing

**Install testing libraries**
```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom jest jest-environment-jsdom
```

**Configure Jest** (`jest.config.js`)
```javascript
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
};

module.exports = createJestConfig(customJestConfig);
```

**Create test setup** (`jest.setup.js`)
```javascript
import '@testing-library/jest-dom';
```

**Example test** (`__tests__/components/SearchForm.test.tsx`)
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import SearchForm from '@/components/SearchForm';

describe('SearchForm', () => {
  it('renders search form', () => {
    render(<SearchForm />);
    expect(screen.getByText('Search Flights')).toBeInTheDocument();
  });

  it('submits form with valid data', async () => {
    const onSubmit = jest.fn();
    render(<SearchForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText('Origin'), {
      target: { value: 'JFK' },
    });
    fireEvent.click(screen.getByText('Search'));

    expect(onSubmit).toHaveBeenCalled();
  });
});
```

**Add test script to package.json**
```json
{
  "scripts": {
    "test": "jest --watch",
    "test:ci": "jest --ci"
  }
}
```

### Automated Deployment

**Continuous Deployment with Vercel**
- Vercel automatically deploys on every push to `main`
- PRs get preview deployments
- No additional configuration needed

**Deploy with GitHub Actions + Netlify**
```yaml
# .github/workflows/netlify-deploy.yml
name: Deploy to Netlify

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20.x'

      - run: npm ci
      - run: npm run build

      - name: Deploy to Netlify
        uses: nwtgck/actions-netlify@v2.0
        with:
          publish-dir: './.next'
          production-branch: main
          github-token: ${{ secrets.GITHUB_TOKEN }}
          deploy-message: "Deploy from GitHub Actions"
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

---

## 10. Troubleshooting

### Common Deployment Issues

#### Issue: Build fails with "Module not found"

**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json .next
npm install
npm run build
```

#### Issue: Environment variables not loading

**Solution:**
1. Check variable names (must match exactly)
2. Verify `.env.local` exists and is not in `.gitignore`
3. For Vercel: Add variables in dashboard (Project Settings > Environment Variables)
4. Restart development server after adding new variables

```bash
# Verify variables are loaded
npm run dev
# In browser console:
console.log(process.env.NEXT_PUBLIC_APP_URL);
```

#### Issue: API routes return 404 in production

**Solution:**
- Ensure API routes are in `app/api/` directory
- Check file naming: must be `route.ts` or `route.js`
- Verify deployment included all files

```bash
# Check build output
npm run build
# Look for API routes in output
```

#### Issue: Database connection fails

**Solution:**
```typescript
// Test database connection
// app/api/test-db/route.ts
import { sql } from '@/lib/db/connection';

export async function GET() {
  try {
    const result = await sql`SELECT NOW()`;
    return Response.json({ success: true, time: result[0].now });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
```

Visit `/api/test-db` to verify connection.

**Common database issues:**
- Wrong connection string format
- SSL mode not set (`?sslmode=require`)
- IP not whitelisted (check database provider settings)
- Connection pooling limits reached

#### Issue: Images not loading

**Solution:**
1. Check `next.config.mjs` image domains
```javascript
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.fly2any.com',
      },
    ],
  },
};
```

2. Use Next.js Image component
```tsx
import Image from 'next/image';
<Image src="/logo.png" alt="Logo" width={200} height={50} />
```

3. Verify images are in `public/` directory

#### Issue: Slow performance in production

**Solutions:**

1. **Enable caching**
```typescript
// Add cache headers
export async function GET() {
  return new Response(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate',
    },
  });
}
```

2. **Optimize images**
- Use WebP format
- Implement lazy loading
- Use Next.js Image component

3. **Code splitting**
```tsx
import dynamic from 'next/dynamic';
const HeavyComponent = dynamic(() => import('./HeavyComponent'));
```

4. **Bundle analysis**
```bash
ANALYZE=true npm run build
```

#### Issue: CORS errors

**Solution:**
```javascript
// next.config.mjs
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
        ],
      },
    ];
  },
};
```

#### Issue: Vercel deployment timeout

**Solution:**
- Check function execution time (max 10s on Hobby, 60s on Pro)
- Optimize database queries
- Use caching for external API calls
- Consider serverless function limits

```typescript
// Set max duration (Vercel Pro only)
export const maxDuration = 60; // seconds
```

#### Issue: Memory errors during build

**Solution:**
```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

Or in `package.json`:
```json
{
  "scripts": {
    "build": "NODE_OPTIONS='--max-old-space-size=4096' next build"
  }
}
```

### Platform-Specific Issues

#### Vercel Issues

**Issue: Functions timing out**
- Hobby plan: 10s limit
- Pro plan: 60s limit
- Solution: Optimize queries, use Edge Functions, or upgrade plan

**Issue: Serverless function size limit**
- Limit: 50MB
- Solution: Use dynamic imports, split large dependencies

**Issue: Missing environment variables**
- Add in Vercel dashboard: Project Settings > Environment Variables
- Redeploy after adding variables

#### Netlify Issues

**Issue: Next.js features not working**
- Install Netlify Next.js plugin
```bash
npm install @netlify/plugin-nextjs
```

**Issue: Redirects not working**
- Create `netlify.toml`
```toml
[[redirects]]
  from = "/old-page"
  to = "/new-page"
  status = 301
```

#### AWS Issues

**Issue: Cold starts**
- Use Lambda provisioned concurrency
- Implement connection pooling
- Use CloudFront for caching

**Issue: S3 assets not loading**
- Check bucket policy and CORS
- Verify CloudFront distribution settings
- Check cache invalidation

### Performance Debugging

**Analyze bundle size**
```bash
npm install --save-dev @next/bundle-analyzer
ANALYZE=true npm run build
```

**Check Web Vitals**
```typescript
// app/web-vitals.tsx
'use client';

import { useReportWebVitals } from 'next/web-vitals';

export function WebVitals() {
  useReportWebVitals((metric) => {
    console.log(metric);
  });
  return null;
}
```

**Lighthouse CI**
```bash
npm install -g @lhci/cli
lhci autorun --collect.url=https://www.fly2any.com
```

### Support Resources

**Official Documentation**
- Next.js: https://nextjs.org/docs
- Vercel: https://vercel.com/docs
- Netlify: https://docs.netlify.com
- Amadeus API: https://developers.amadeus.com/docs

**Community Support**
- Next.js Discord: https://nextjs.org/discord
- Stack Overflow: Tag `next.js`
- GitHub Discussions: https://github.com/vercel/next.js/discussions

**Monitoring & Debugging**
- Vercel Dashboard: Real-time logs and analytics
- Sentry: Error tracking and performance monitoring
- LogRocket: Session replay and debugging

**Getting Help**
1. Check the error message carefully
2. Search GitHub issues: https://github.com/vercel/next.js/issues
3. Consult documentation
4. Ask on Discord or Stack Overflow
5. Create detailed bug report with:
   - Next.js version
   - Node.js version
   - Error message
   - Minimal reproduction

---

## Deployment Checklist

Before deploying to production, ensure:

- [ ] All environment variables are configured
- [ ] Database is set up and accessible
- [ ] API credentials are valid (production keys)
- [ ] Build completes without errors
- [ ] All tests pass
- [ ] Performance is optimized (Lighthouse score > 90)
- [ ] Security headers are configured
- [ ] SSL/TLS certificate is active
- [ ] Domain DNS is configured correctly
- [ ] Error tracking is set up (Sentry)
- [ ] Analytics is configured (GA4, Vercel Analytics)
- [ ] Rate limiting is enabled
- [ ] CORS is properly configured
- [ ] Monitoring is active
- [ ] Backup strategy is in place
- [ ] CI/CD pipeline is tested
- [ ] Documentation is updated

---

## Quick Reference

### Essential Commands
```bash
# Development
npm run dev              # Start dev server
npm run build           # Production build
npm run start           # Start production server
npm run lint            # Run ESLint

# Deployment
vercel                  # Deploy to Vercel preview
vercel --prod          # Deploy to Vercel production
netlify deploy         # Deploy to Netlify preview
netlify deploy --prod  # Deploy to Netlify production

# Testing
npm test               # Run tests
npm run test:ci        # Run tests in CI mode

# Debugging
NODE_OPTIONS='--inspect' npm run dev  # Debug mode
```

### Environment Files
- `.env.local` - Local development (not committed)
- `.env.production` - Production values (not committed)
- `.env.example` - Template with dummy values (committed)

### Important URLs
- **Local Development**: http://localhost:3000
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Amadeus Portal**: https://developers.amadeus.com
- **Neon Console**: https://console.neon.tech

---

**Last Updated**: 2025-10-03
**Version**: 1.0.0
**Maintainer**: Fly2Any Development Team

For questions or issues, contact: dev@fly2any.com
