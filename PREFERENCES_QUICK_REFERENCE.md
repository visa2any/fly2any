# User Preferences - Quick Reference

## File Tree
```
fly2any-fresh/
├── app/
│   ├── api/
│   │   └── preferences/
│   │       └── route.ts              # API endpoints (GET, POST, PUT)
│   └── account/
│       └── preferences/
│           └── page.tsx               # Main preferences UI
├── lib/
│   └── services/
│       └── preferences.ts             # Service layer
└── components/
    ├── account/
    │   └── PreferenceSection.tsx      # Section wrapper
    └── ui/
        ├── Switch.tsx                 # Toggle component
        └── Select.tsx                 # Dropdown component
```

## API Quick Reference

### GET /api/preferences
Fetch user preferences (auto-creates if missing)
```javascript
const response = await fetch('/api/preferences');
const { data } = await response.json();
// Returns: UserPreferences object
```

### PUT /api/preferences
Update user preferences
```javascript
const response = await fetch('/api/preferences', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    preferredCabinClass: 'business',
    emailNotifications: true,
    currency: 'EUR'
  })
});
```

### POST /api/preferences
Create initial preferences (rarely needed - GET auto-creates)
```javascript
const response = await fetch('/api/preferences', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    currency: 'USD',
    language: 'en',
    theme: 'light'
  })
});
```

## Service Layer Quick Reference

```typescript
import { preferencesService } from '@/lib/services/preferences';

// Get preferences
const prefs = await preferencesService.getPreferences(userId);

// Update preferences
const updated = await preferencesService.updatePreferences(userId, {
  preferredCabinClass: 'economy',
  dealAlerts: true
});

// Create with defaults
const created = await preferencesService.createDefaultPreferences(userId);

// Check if exists
const exists = await preferencesService.hasPreferences(userId);
```

## Component Quick Reference

### PreferenceSection
```tsx
<PreferenceSection
  title="Section Title"
  description="Section description"
>
  {/* Your form fields */}
</PreferenceSection>
```

### Switch
```tsx
<Switch
  checked={value}
  onCheckedChange={setValue}
  label="Setting Name"
  description="What this setting does"
  id="settingId"
/>
```

### Select
```tsx
<Select
  label="Choose Option"
  options={[
    { value: 'opt1', label: 'Option 1' },
    { value: 'opt2', label: 'Option 2' }
  ]}
  value={selected}
  onChange={setSelected}
  placeholder="Select..."
  hint="Helper text"
  fullWidth
/>
```

## Data Structure

```typescript
interface UserPreferences {
  // Travel
  preferredCabinClass: 'economy' | 'premium' | 'business' | 'first' | null;
  preferredAirlines: string[];  // ['AA', 'UA']
  homeAirport: string | null;   // 'JFK'

  // Notifications
  emailNotifications: boolean;  // default: true
  priceAlertEmails: boolean;    // default: true
  dealAlerts: boolean;          // default: true
  newsletterOptIn: boolean;     // default: false

  // Display
  currency: string;             // default: 'USD'
  language: string;             // default: 'en'
  theme: 'light' | 'dark' | 'auto';  // default: 'light'
}
```

## Common Tasks

### Add Preference Page Link to Navigation
```tsx
<Link href="/account/preferences">
  <Settings className="w-5 h-5" />
  Preferences
</Link>
```

### Use Preferences in Search Form
```tsx
const session = await auth();
const prefs = await preferencesService.getPreferences(session.user.id);

const defaultSearch = {
  cabinClass: prefs?.preferredCabinClass || 'economy',
  origin: prefs?.homeAirport || '',
};
```

### Check User's Notification Settings
```tsx
const prefs = await preferencesService.getPreferences(userId);
if (prefs?.emailNotifications && prefs?.dealAlerts) {
  await sendDealEmail(userEmail, dealInfo);
}
```

## Error Codes

| Code | Meaning | HTTP |
|------|---------|------|
| UNAUTHORIZED | Not logged in | 401 |
| VALIDATION_ERROR | Invalid data | 400 |
| NOT_FOUND | Prefs don't exist | 404 |
| DUPLICATE_PREFERENCES | Already exists | 409 |
| FETCH_ERROR | Failed to get | 500 |
| CREATE_ERROR | Failed to create | 500 |
| UPDATE_ERROR | Failed to update | 500 |

## Testing Commands

```bash
# Start dev server
npm run dev

# Access preferences page
# http://localhost:3000/account/preferences

# Test API (requires auth cookie)
curl -X GET http://localhost:3000/api/preferences \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"

# Test update
curl -X PUT http://localhost:3000/api/preferences \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -d '{"currency":"EUR","theme":"dark"}'
```

## Validation Rules

| Field | Rules |
|-------|-------|
| preferredCabinClass | enum: economy, premium, business, first |
| preferredAirlines | array of 2-char uppercase strings |
| homeAirport | 3-char uppercase string or null |
| emailNotifications | boolean |
| priceAlertEmails | boolean |
| dealAlerts | boolean |
| newsletterOptIn | boolean |
| currency | string (USD, EUR, GBP, etc.) |
| language | string (en, es, fr, etc.) |
| theme | enum: light, dark, auto |

## Common Issues

### "Preferences not found"
- Use GET endpoint which auto-creates
- Or call POST to create explicitly

### "Unauthorized"
- User not logged in
- Session expired
- Check NextAuth configuration

### "Validation failed"
- Check data types match schema
- Ensure required fields present
- Verify enum values are exact match

### Database not available
- Check DATABASE_URL is set
- Run Prisma migrations
- Service gracefully handles missing DB

## Next Steps

1. Test the preferences page at `/account/preferences`
2. Integrate preferences into flight search
3. Use notification preferences in email system
4. Apply theme preference to UI
5. Use currency preference for price display

## URLs

- Preferences Page: `/account/preferences`
- Account Dashboard: `/account`
- API Base: `/api/preferences`

## Dependencies

All already installed:
- zod
- react-hot-toast
- @prisma/client
- next-auth

No additional packages needed!
