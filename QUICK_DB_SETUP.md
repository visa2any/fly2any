# Quick Database Setup - TripMatch

## The Fastest Way to Fix the 500 Error

You're seeing this error because the database tables don't exist yet:
```
❌ Error: relation "trip_components" does not exist
```

## Option 1: Copy-Paste SQL (Recommended - 30 seconds)

1. **Open your Neon Console**: https://console.neon.tech/
2. **Go to SQL Editor** for your project
3. **Copy the entire SQL below** and paste it into the editor
4. **Click "Run"**

```sql
-- Copy from lib/db/migrations/001_tripmatch_schema.sql
-- Or run this quick create:

-- User Credits
CREATE TABLE IF NOT EXISTS user_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL UNIQUE,
  balance INTEGER NOT NULL DEFAULT 0,
  lifetime_earned INTEGER NOT NULL DEFAULT 0,
  lifetime_spent INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_credits_user_id ON user_credits(user_id);

-- (Full schema in lib/db/migrations/001_tripmatch_schema.sql)
```

**Better:** Just copy the ENTIRE content of `lib/db/migrations/001_tripmatch_schema.sql` and run it!

## Option 2: Using psql Command Line

```bash
# If you have psql installed:
psql "YOUR_DATABASE_URL_HERE" -f lib/db/migrations/001_tripmatch_schema.sql
```

## Option 3: Automated Script

```bash
# Run from project root:
node -e "require('dotenv').config({path:'.env.local'}); const {neon}=require('@neondatabase/serverless'); const fs=require('fs'); const sql=neon(process.env.DATABASE_URL); const schema=fs.readFileSync('lib/db/migrations/001_tripmatch_schema.sql','utf8'); (async()=>{for(const stmt of schema.split(';').filter(s=>s.trim()&&!s.startsWith('--'))){await sql(stmt+';')} console.log('✅ Done!')})();"
```

## After Setup

Once complete, refresh your browser and TripMatch will work! 🎉

- ✅ No more 500 errors
- ✅ Trip details load properly
- ✅ All TripMatch features functional

---

**Tip:** The schema file uses `CREATE TABLE IF NOT EXISTS`, so it's safe to run multiple times.
