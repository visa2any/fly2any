# Giscus Comments - Setup Guide

## ✅ Step 1: Enable GitHub Discussions

1. Go to: https://github.com/visa2any/fly2any/settings
2. Scroll to "Features" section
3. Check ✅ "Discussions"
4. Click "Set up discussions"
5. GitHub will create a welcome discussion

## ✅ Step 2: Get Giscus Configuration

1. Visit: https://giscus.app
2. Enter repository: `visa2any/fly2any`
3. **Page ↔️ Discussions Mapping:** Select "Discussion title contains page pathname"
4. **Discussion Category:** Select "Announcements" (or create "Blog Comments")
5. **Features:** Enable "Enable reactions"

## ✅ Step 3: Copy Configuration Values

Giscus will generate values like:
- `data-repo="visa2any/fly2any"`
- `data-repo-id="R_kgDOxxxxxxx"` ← Copy this
- `data-category="Blog Comments"`
- `data-category-id="DIC_kwDOxxxxxxx"` ← Copy this

## ✅ Step 4: Add to .env.local

```env
# Giscus Comments Configuration
NEXT_PUBLIC_GISCUS_REPO_ID="R_kgDOxxxxxxx"
NEXT_PUBLIC_GISCUS_CATEGORY_ID="DIC_kwDOxxxxxxx"
```

## ✅ Step 5: Restart Dev Server

```bash
npm run dev
```

## 🎯 Testing

1. Navigate to: http://localhost:3000/blog/cheap-flights-new-york-paris-2026
2. Scroll to comments section
3. Click "Sign in with GitHub"
4. Post a test comment
5. Comment appears in: https://github.com/visa2any/fly2any/discussions

## 🔒 Moderation

**Enable Comment Moderation:**
1. Go to: https://github.com/visa2any/fly2any/discussions/categories
2. Click "Blog Comments" category
3. Enable "Only maintainers can create discussions"
4. Comments require your approval before appearing

## 🎨 Customization

All styling is Level 6 Ultra-Premium:
- Gradient buttons (blue → purple)
- Rounded corners (0.75rem)
- Hover effects (scale 1.05)
- Mobile responsive
- Matches Fly2Any brand

## 📊 Features Enabled

✅ GitHub Authentication (spam-free)
✅ Reactions (👍 ❤️ 🎉 etc.)
✅ Threading (nested replies)
✅ Markdown support
✅ SEO-friendly (indexed by Google)
✅ GDPR compliant (no PII storage)
✅ Mobile responsive
✅ Lazy loading (performance)

## 🚀 Production Deployment

Add environment variables to Vercel:

```bash
vercel env add NEXT_PUBLIC_GISCUS_REPO_ID
vercel env add NEXT_PUBLIC_GISCUS_CATEGORY_ID
```

Or via Vercel Dashboard:
1. Project Settings → Environment Variables
2. Add both variables
3. Redeploy

## ❓ Troubleshooting

**Comments not showing?**
- Check repo is public
- Verify Discussions are enabled
- Confirm env variables are set
- Clear browser cache

**"Error: Discussion not found"?**
- Wait 5 minutes after enabling Discussions
- Check category name matches exactly
- Verify repo ID is correct

---

**Setup Time:** 5-10 minutes
**Maintenance:** Zero
**Cost:** $0 forever
