# Social Media Production Setup - Fly2Any Marketing OS

## System Overview

Fly2Any has a **complete multi-platform social marketing system** built-in:

| Platform | Adapter | Status | API Required |
|----------|---------|--------|--------------|
| X (Twitter) | `twitter-adapter.ts` | Ready | Twitter API v2 |
| Instagram | `meta-adapter.ts` | Ready | Meta Graph API |
| Facebook | `meta-adapter.ts` | Ready | Meta Graph API |
| TikTok | `tiktok-adapter.ts` | Ready | TikTok Content API |
| Blog | `blog-adapter.ts` | Ready | Internal (no API) |
| LinkedIn | **MISSING** | Needs creation | LinkedIn Marketing API |

---

## 1. Environment Variables Required

Add to `.env.local` or Vercel:

### Twitter/X API
```env
# Get at: https://developer.twitter.com/en/portal
TWITTER_API_KEY="your-api-key"
TWITTER_API_SECRET="your-api-secret"
TWITTER_ACCESS_TOKEN="your-access-token"
TWITTER_ACCESS_SECRET="your-access-secret"
TWITTER_BEARER_TOKEN="your-bearer-token"
```

### Meta (Instagram + Facebook)
```env
# Get at: https://developers.facebook.com/apps
META_APP_ID="your-app-id"
META_APP_SECRET="your-app-secret"
META_ACCESS_TOKEN="your-page-access-token"
INSTAGRAM_ACCOUNT_ID="your-ig-business-account-id"
FACEBOOK_PAGE_ID="your-facebook-page-id"
```

### TikTok
```env
# Get at: https://developers.tiktok.com/
TIKTOK_CLIENT_KEY="your-client-key"
TIKTOK_CLIENT_SECRET="your-client-secret"
TIKTOK_ACCESS_TOKEN="your-access-token"
TIKTOK_OPEN_ID="your-open-id"
```

---

## 2. Platform Setup Instructions

### Twitter/X Setup

1. Go to https://developer.twitter.com/en/portal
2. Create a Project + App (Free tier = 1500 tweets/month)
3. Set App permissions to **Read and Write**
4. Generate Access Token & Secret
5. Copy Bearer Token for v2 API

**Rate Limits:** 50 tweets/hour built-in

### Instagram Setup

1. Create Facebook App at https://developers.facebook.com/apps
2. Add **Instagram Graph API** product
3. Connect Instagram Business Account to Facebook Page
4. Generate Page Access Token (long-lived)
5. Get Instagram Account ID from Graph API Explorer

**Requirements:**
- Instagram Business/Creator account
- Connected to Facebook Page
- Image required for all posts (1:1 aspect ratio optimal)

### Facebook Setup

Same app as Instagram:
1. Add **Pages API** product
2. Get Page ID and Page Access Token
3. Request `pages_manage_posts` permission

### TikTok Setup

1. Register at https://developers.tiktok.com/
2. Create App with **Content Posting API** scope
3. Apply for production access (requires approval)
4. Complete OAuth flow for user tokens

**Note:** TikTok requires video for API posting. Images queue for manual posting.

---

## 3. Optimal Posting Schedule (USA Market)

Built into `lib/social/types.ts`:

| Platform | Best Times (ET) | Built-in |
|----------|-----------------|----------|
| Twitter | 8am, 12pm, 4pm, 8pm | Yes |
| Instagram | 11am, 2pm, 7pm | Yes |
| Facebook | 9am, 1pm, 4pm | Yes |
| TikTok | 7pm, 9pm, 11pm | Yes |
| Blog | 9am | Yes |

---

## 4. How Posting Works

### Automatic Flow (Cron)
```
Cron (every 15 min) → Content Queue → Platform Adapters → Post
```

**Cron endpoint:** `GET /api/cron/social-distribute`

### Manual/n8n Flow
```
n8n Workflow → /api/webhooks/n8n → SocialDistributionService → Adapters
```

### Direct API
```typescript
import { postToPlatform, postToAll } from '@/lib/social';

// Post to specific platform
await postToPlatform('twitter', {
  text: 'Check out this deal!',
  link: 'https://fly2any.com/deals',
  hashtags: ['TravelDeals', 'Fly2Any']
});

// Post to all configured platforms
await postToAll(content);
```

---

## 5. Content Queue System

All posts go through the content queue (`lib/social/content-queue-manager.ts`):

1. **Queueing** - Content added with scheduled time
2. **Rate Limiting** - Per-platform limits enforced
3. **Duplicate Check** - Prevents spam (24hr window)
4. **Processing** - Cron processes queue every 15 min
5. **Logging** - All posts logged to `SocialPostLog` table

---

## 6. Add LinkedIn (Missing)

LinkedIn adapter needs to be created. Here's the template:

```typescript
// lib/social/linkedin-adapter.ts
import { BaseSocialAdapter } from './base-adapter';
import { SocialPlatform, SocialPostContent, SocialPostResult } from './types';

export class LinkedInAdapter extends BaseSocialAdapter {
  platform: SocialPlatform = 'linkedin';

  private getCredentials() {
    return {
      accessToken: process.env.LINKEDIN_ACCESS_TOKEN,
      organizationId: process.env.LINKEDIN_ORG_ID,
    };
  }

  isConfigured(): boolean {
    const creds = this.getCredentials();
    return !!(creds.accessToken && creds.organizationId);
  }

  async post(content: SocialPostContent): Promise<SocialPostResult> {
    if (!this.isConfigured()) {
      return this.createErrorResult('LinkedIn API not configured');
    }

    try {
      const creds = this.getCredentials();

      const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${creds.accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0',
        },
        body: JSON.stringify({
          author: `urn:li:organization:${creds.organizationId}`,
          lifecycleState: 'PUBLISHED',
          specificContent: {
            'com.linkedin.ugc.ShareContent': {
              shareCommentary: { text: this.formatContent(content) },
              shareMediaCategory: content.imageUrl ? 'IMAGE' : 'NONE',
            },
          },
          visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
        }),
      });

      if (!response.ok) throw new Error(`LinkedIn API error: ${response.status}`);

      const data = await response.json();
      return this.createSuccessResult(data.id, undefined, data);
    } catch (error) {
      return this.createErrorResult(error instanceof Error ? error.message : 'Unknown');
    }
  }
}

export const linkedinAdapter = new LinkedInAdapter();
```

**Environment Variables:**
```env
LINKEDIN_ACCESS_TOKEN="your-access-token"
LINKEDIN_ORG_ID="your-organization-id"
```

---

## 7. Vercel Cron Configuration

Add to `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/social-distribute",
      "schedule": "*/15 * * * *"
    }
  ]
}
```

---

## 8. Database Tables Used

| Table | Purpose |
|-------|---------|
| `SocialPostLog` | All post history + status |
| `ContentQueue` | Pending posts |
| `SocialCredential` | Encrypted API tokens (optional) |

---

## 9. Testing

### Test Twitter
```bash
curl -X POST https://fly2any.com/api/cron/social-distribute \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### Check Post Logs
```sql
SELECT * FROM "SocialPostLog"
ORDER BY "postedAt" DESC
LIMIT 10;
```

---

## 10. Priority Recommendation

For USA travel market, prioritize setup in this order:

| Priority | Platform | Why |
|----------|----------|-----|
| 1 | **Blog** | SEO + Google Discover (already working) |
| 2 | **Twitter/X** | Real-time deals, travel community |
| 3 | **Instagram** | Visual travel content, high engagement |
| 4 | **Facebook** | Older demographic, direct booking |
| 5 | **LinkedIn** | Business travel segment |
| 6 | **TikTok** | Gen-Z, requires video production |

---

## Quick Start Checklist

- [ ] Add Twitter API credentials to Vercel
- [ ] Add Meta (IG/FB) credentials to Vercel
- [ ] Test `postToPlatform('twitter', ...)` locally
- [ ] Enable Vercel cron job
- [ ] Create LinkedIn adapter (optional)
- [ ] Set up TikTok (requires video pipeline)

---

Last updated: 2025-12-27
