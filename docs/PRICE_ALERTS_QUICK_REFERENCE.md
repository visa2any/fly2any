# Price Alerts - Quick Reference Card

## Component Usage

### 1. PriceAlertCard
**File**: `components/account/PriceAlertCard.tsx`

```tsx
import PriceAlertCard from '@/components/account/PriceAlertCard';

<PriceAlertCard
  alert={alert}
  onToggleActive={(id, active) => handleToggle(id, active)}
  onDelete={(id) => handleDelete(id)}
  isUpdating={false}
/>
```

**Props**:
- `alert`: PriceAlert object
- `onToggleActive`: (id: string, active: boolean) => void
- `onDelete`: (id: string) => void
- `isUpdating?`: boolean

---

### 2. CreatePriceAlert
**File**: `components/search/CreatePriceAlert.tsx`

```tsx
import CreatePriceAlert from '@/components/search/CreatePriceAlert';

const [isOpen, setIsOpen] = useState(false);

<CreatePriceAlert
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  flightData={{
    origin: "JFK",
    destination: "LAX",
    departDate: "2025-12-01",
    returnDate: "2025-12-08",
    currentPrice: 450,
    currency: "USD"
  }}
  onSuccess={(alert) => console.log('Created:', alert)}
/>
```

**Props**:
- `isOpen`: boolean
- `onClose`: () => void
- `flightData`: { origin, destination, departDate, returnDate?, currentPrice, currency? }
- `onSuccess?`: (alert: PriceAlert) => void

---

### 3. PriceAlertNotification
**File**: `components/account/PriceAlertNotification.tsx`

```tsx
import PriceAlertNotification from '@/components/account/PriceAlertNotification';

<PriceAlertNotification
  triggeredAlerts={alerts.filter(a => a.triggered)}
  onDismiss={() => setShowNotification(false)}
  onViewAlerts={() => router.push('/account/alerts')}
/>
```

**Props**:
- `triggeredAlerts`: PriceAlert[]
- `onDismiss`: () => void
- `onViewAlerts`: () => void

---

## API Endpoints

### GET /api/price-alerts
Fetch all alerts for user

```tsx
const response = await fetch('/api/price-alerts');
const data = await response.json();
// data.alerts: PriceAlert[]
```

### POST /api/price-alerts
Create new alert

```tsx
const response = await fetch('/api/price-alerts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    origin: "JFK",
    destination: "LAX",
    departDate: "2025-12-01",
    returnDate: "2025-12-08",
    currentPrice: 450,
    targetPrice: 350,
    currency: "USD"
  })
});
const data = await response.json();
// data.alert: PriceAlert
// data.created: boolean
```

### PATCH /api/price-alerts?id={alertId}
Update alert

```tsx
const response = await fetch(`/api/price-alerts?id=${alertId}`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    active: true
  })
});
const data = await response.json();
// data.alert: PriceAlert
```

### DELETE /api/price-alerts?id={alertId}
Delete alert

```tsx
const response = await fetch(`/api/price-alerts?id=${alertId}`, {
  method: 'DELETE'
});
const data = await response.json();
// data.deleted: boolean
```

---

## Type Definitions

```typescript
interface PriceAlert {
  id: string;
  userId: string;
  origin: string;
  destination: string;
  departDate: string;
  returnDate: string | null;
  currentPrice: number;
  targetPrice: number;
  currency: string;
  active: boolean;
  triggered: boolean;
  lastChecked: Date;
  triggeredAt: Date | null;
  lastNotifiedAt: Date | null;
  notificationCount: number;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Integration Example

### Add to Flight Card

```tsx
import { useState } from 'react';
import { Bell } from 'lucide-react';
import CreatePriceAlert from '@/components/search/CreatePriceAlert';

export function FlightCard({ flight }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="flight-card">
        {/* Existing content */}

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-600 rounded-xl hover:bg-orange-100"
        >
          <Bell className="w-5 h-5" />
          Set Alert
        </button>
      </div>

      <CreatePriceAlert
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        flightData={{
          origin: flight.origin,
          destination: flight.destination,
          departDate: flight.departDate,
          returnDate: flight.returnDate,
          currentPrice: flight.price,
          currency: flight.currency,
        }}
      />
    </>
  );
}
```

---

## Pages

### /account/alerts
Main price alerts management page
- View all alerts
- Filter by status
- Create new alerts
- Manage existing alerts

---

## Styling Guide

### Status Colors
- **Active**: `bg-yellow-100 text-yellow-800 border-yellow-300`
- **Triggered**: `bg-green-100 text-green-800 border-green-300`
- **Inactive**: `bg-gray-100 text-gray-600 border-gray-300`

### Button Styles
```tsx
// Primary Action
className="bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl"

// Secondary Action
className="bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300"

// Set Alert Button
className="bg-orange-50 text-orange-600 border-2 border-orange-200 rounded-xl"

// Delete Button
className="bg-red-50 text-red-600 rounded-xl hover:bg-red-100"
```

---

## Common Patterns

### Fetch and Display Alerts
```tsx
const [alerts, setAlerts] = useState([]);

useEffect(() => {
  fetch('/api/price-alerts')
    .then(res => res.json())
    .then(data => setAlerts(data.alerts));
}, []);

return (
  <div>
    {alerts.map(alert => (
      <PriceAlertCard
        key={alert.id}
        alert={alert}
        onToggleActive={handleToggle}
        onDelete={handleDelete}
      />
    ))}
  </div>
);
```

### Create Alert with Toast
```tsx
import { toast } from 'react-hot-toast';

const handleCreateAlert = async (data) => {
  try {
    const response = await fetch('/api/price-alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) throw new Error('Failed');

    const result = await response.json();
    toast.success('Alert created!');
    return result.alert;
  } catch (error) {
    toast.error('Failed to create alert');
  }
};
```

### Filter Alerts
```tsx
const activeAlerts = alerts.filter(a => a.active);
const triggeredAlerts = alerts.filter(a => a.triggered);
const inactiveAlerts = alerts.filter(a => !a.active);
```

---

## Utilities

### Format Date
```tsx
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};
```

### Calculate Savings
```tsx
const savings = currentPrice - targetPrice;
const savingsPercent = Math.round((savings / currentPrice) * 100);
```

### Format Time Ago
```tsx
const formatTimeAgo = (date: Date) => {
  const diff = Date.now() - new Date(date).getTime();
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  return 'Just now';
};
```

---

## Checklist

### Before Launch
- [ ] Test create alert flow
- [ ] Test toggle active/inactive
- [ ] Test delete with confirmation
- [ ] Verify responsive design
- [ ] Test with no alerts (empty state)
- [ ] Test with triggered alerts
- [ ] Verify toast notifications
- [ ] Check accessibility (keyboard nav)
- [ ] Test API error handling
- [ ] Verify loading states

### Integration Points
- [ ] Add "Set Alert" button to FlightCard.tsx
- [ ] Add "Set Alert" button to FlightCardCompact.tsx
- [ ] Add "Set Alert" button to FlightCardEnhanced.tsx
- [ ] Add navigation link in account menu
- [ ] Add triggered alerts notification to dashboard
- [ ] Update account page stats to include alerts

---

## Need Help?

1. **Check Examples**: See `components/flights/FlightCardWithPriceAlert.tsx`
2. **Read Full Guide**: See `docs/PRICE_ALERTS_IMPLEMENTATION.md`
3. **Test API**: Use browser DevTools Network tab
4. **Check Console**: Look for error messages
5. **Verify Auth**: Ensure user is logged in

---

## File Locations

```
✓ app/account/alerts/page.tsx
✓ components/account/PriceAlertCard.tsx
✓ components/account/PriceAlertNotification.tsx
✓ components/search/CreatePriceAlert.tsx
✓ lib/types/price-alerts.ts
✓ components/flights/FlightCardWithPriceAlert.tsx (example)
✓ docs/PRICE_ALERTS_IMPLEMENTATION.md
✓ docs/PRICE_ALERTS_QUICK_REFERENCE.md
```
