# Profile Management Migration

This migration adds comprehensive user profile management features including:

- User profile fields (name, phone, DOB, location, bio)
- Avatar management
- Session tracking
- Login history

## What Gets Created

### User Model Updates
- firstName, lastName (String?)
- phone (String?)
- dateOfBirth (DateTime?)
- gender (String?)
- country, timezone (String?)
- bio (String?)
- avatarUrl (String?)
- profileCompleted (Boolean)

### New Tables
1. **user_sessions** - Active session tracking
2. **login_history** - Login attempt history

## Running the Migration

```bash
# Generate migration
npx prisma migrate dev --name add_profile_management

# Apply to production
npx prisma migrate deploy
```

## After Migration

1. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

2. Restart your application

3. Access profile at: `/account/profile`

## Rollback (if needed)

To rollback this migration:

```bash
npx prisma migrate resolve --rolled-back <migration_name>
```

Then manually restore the previous schema state.

## Data Safety

- All new fields are nullable (optional)
- No existing data is modified
- Cascade deletes protect data integrity
- Foreign keys ensure referential integrity

## Verification

After migration, verify tables exist:

```sql
-- Check User table has new columns
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'users';

-- Check new tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_name IN ('user_sessions', 'login_history');
```

## Support

See `docs/PROFILE_SETUP.md` for detailed setup instructions.
