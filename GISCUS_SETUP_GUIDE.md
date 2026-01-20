# Giscus Setup Guide

## Overview

Giscus is a comments system powered by [GitHub Discussions](https://github.com/visa2any/fly2any/discussions). It's free, spam-free, and requires no database setup.

## Error Message

If you see "An error occurred: giscus is not installed on this repository", it means Giscus hasn't been configured on your GitHub repository yet.

## Setup Instructions

### Step 1: Enable GitHub Discussions

1. Go to your repository: https://github.com/visa2any/fly2any
2. Click **Settings** tab
3. Scroll to **Features** section
4. Find **Discussions**
5. Click **Set up discussions**
6. Choose template or start blank
7. Click **Enable discussions**

### Step 2: Get Giscus Configuration

1. Visit https://giscus.app
2. Click **Visit with GitHub**
3. Authorize Giscus to access your repository
4. Select repository: `visa2any/fly2any`
5. Click **Enable Giscus**
6. You'll see configuration values:
   - **Repository ID** (format: `R_kgDOxxxxxxx`)
   - **Category ID** (format: `DIC_kwDOxxxxxxx`)

### Step 3: Update Environment Variables

Add the values to your environment files:

**For Local Development:**
```bash
# In .env.local
NEXT_PUBLIC_GISCUS_REPO_ID="R_kgDOxxxxxxx"
NEXT_PUBLIC_GISCUS_CATEGORY_ID="DIC_kwDOxxxxxxx"
```

**For Production (Vercel):**
1. Go to Vercel Dashboard → fly2any project
2. Settings → Environment Variables
3. Add:
   - `NEXT_PUBLIC_GISCUS_REPO_ID` = `R_kgDOxxxxxxx`
   - `NEXT_PUBLIC_GISCUS_CATEGORY_ID` = `DIC_kwDOxxxxxxx`

### Step 4: Restart Development Server

After adding environment variables, restart your development server:
```bash
# Stop server (Ctrl+C)
# Start again
npm run dev
```

## How It Works

### User Experience
1. User visits blog post
2. Giscus component loads comment form
3. User signs in with GitHub to comment
4. Comments appear in GitHub Discussions automatically
5. Giscus syncs them back to the blog

### Data Flow
```
Blog Post → Giscus Widget → GitHub Discussions → Giscus Widget → Blog Post
```

## Configuration Options

The `CommentSection.tsx` component uses these Giscus options:

| Option | Value | Description |
|---------|--------|-------------|
| `repo` | `visa2any/fly2any` | GitHub repository |
| `repoId` | `R_kgDOxxxxxxx` | Repository ID from Giscus |
| `category` | `Blog Comments` | Discussion category name |
| `categoryId` | `DIC_kwDOxxxxxxx` | Category ID from Giscus |
| `mapping` | `pathname` | Maps URL path to discussion |
| `theme` | `light` | Light/dark theme |
| `lang` | `en` | Language for UI |
| `loading` | `lazy` | Load comments lazily |
| `reactionsEnabled` | `1` | Enable reactions (👍❤️😆) |

## Troubleshooting

### Error: "giscus is not installed on this repository"

**Cause:** Giscus hasn't been configured on GitHub repository

**Solution:** Follow Step 1-3 above to enable and configure Giscus

### Error: Comments not appearing

**Possible causes:**
1. Environment variables not set correctly
2. Discussions not enabled on repository
3. Category ID doesn't match repository

**Solutions:**
1. Verify environment variables: `echo $NEXT_PUBLIC_GISCUS_REPO_ID`
2. Check Discussions are enabled in GitHub repository
3. Revisit https://giscus.app and verify configuration

### Comments show but are empty

**Cause:** First comment hasn't been posted yet

**Solution:** This is normal. Create first comment via the form to initialize discussion

## Customization

### Change Category Name

Edit `CommentSection.tsx`:
```tsx
<Giscus
  category="Your Custom Category Name"  // Change this
  categoryId={process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID}
  // ... other props
/>
```

Then update category in Giscus:
1. Visit https://giscus.app
2. Select repository
3. Edit category settings

### Enable Dark Mode

```tsx
<Giscus
  theme="preferred-color-scheme"  // Follows system theme
  // or
  theme="dark"  // Always dark
  // ... other props
/>
```

## Moderation

Since comments are stored in GitHub Discussions:
1. Moderation happens in GitHub: https://github.com/visa2any/fly2any/discussions
2. Repository maintainers can hide/delete inappropriate comments
3. Spam protection from GitHub's built-in filters

## Alternative: Email Comments (Fallback)

If Giscus isn't configured, users see an "Email Your Thoughts" button that:
- Opens mailto link
- Pre-fills subject line with article title
- Goes to `support@fly2any.com`

This ensures blog always has a way for users to provide feedback, even if comments system is down.

## Benefits of Giscus

✅ **Free** - No API costs or database needed
✅ **Spam-free** - Protected by GitHub's spam filters
✅ **Familiar** - Users already have GitHub accounts
✅ **Managed** - GitHub handles authentication, storage, moderation
✅ **Fast** - Uses GitHub's CDN for comments
✅ **Versioned** - Comments are part of Git history

## Links

- **Giscus Website:** https://giscus.app
- **Giscus GitHub:** https://github.com/giscus/giscus-component
- **Your Discussions:** https://github.com/visa2any/fly2any/discussions
- **Giscus Documentation:** https://github.com/giscus/giscus-component

## Support

If you encounter issues:
1. Check this guide first
2. Visit https://giscus.app for troubleshooting
3. Check GitHub repository settings
4. Review environment variables

---

**Status:** Configuration pending - Complete Steps 1-3 to enable comments
**Last Updated:** January 20, 2026
