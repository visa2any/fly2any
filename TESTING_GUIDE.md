# Fly2Any - Comprehensive Testing Guide

**Advanced Features Testing Protocol**
**Version: 1.0**
**Last Updated: 2025-11-13**

---

## Table of Contents

1. [Quick Start Testing](#quick-start-testing)
2. [AI Price Prediction API](#ai-price-prediction-api)
3. [Mobile App Testing](#mobile-app-testing)
4. [Web App Testing](#web-app-testing)
5. [Service Worker & PWA](#service-worker--pwa)
6. [Push Notifications](#push-notifications)
7. [Performance Testing](#performance-testing)
8. [Production Deployment Testing](#production-deployment-testing)

---

## Quick Start Testing

### Prerequisites

```bash
# Ensure dependencies are installed
npm install

# Verify environment variables
# Check .env.local exists with required vars
```

### Start Development Server

```bash
# Terminal 1: Start Next.js dev server
npm run dev

# Server will start at http://localhost:3000
```

---

## AI Price Prediction API

### Test 1: GET Endpoint (Demo Mode)

**Purpose**: Quick health check and demo data

```bash
# Basic test
curl http://localhost:3000/api/ai/predict-prices

# With custom parameters
curl "http://localhost:3000/api/ai/predict-prices?origin=JFK&destination=LAX&departureDate=2025-12-15"
```

**Expected Response**:
```json
{
  "success": true,
  "demo": true,
  "predictions": [
    {
      "date": "2025-11-13",
      "predictedPrice": 520,
      "confidence": 0.85,
      "priceRange": { "min": 468, "max": 572 },
      "trend": "increasing",
      "recommendation": "watch",
      "factors": ["Weekend travel"]
    }
  ],
  "message": "Demo prediction - use POST for full functionality"
}
```

### Test 2: POST Endpoint (Full Functionality)

**Purpose**: Test complete AI prediction with insights

```bash
# cURL test
curl -X POST http://localhost:3000/api/ai/predict-prices \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "JFK",
    "destination": "LAX",
    "departureDate": "2025-12-15",
    "passengers": 2,
    "cabinClass": "economy",
    "daysAhead": 30
  }'
```

**Using PowerShell (Windows)**:
```powershell
$body = @{
    origin = "JFK"
    destination = "LAX"
    departureDate = "2025-12-15"
    passengers = 2
    cabinClass = "economy"
    daysAhead = 30
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/ai/predict-prices" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

### Test 3: Browser Testing

Open browser console and run:
```javascript
// Test POST request
fetch('/api/ai/predict-prices', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    origin: 'JFK',
    destination: 'LAX',
    departureDate: '2025-12-15',
    passengers: 2,
    cabinClass: 'economy',
    daysAhead: 30
  })
})
.then(res => res.json())
.then(data => {
  console.log('✅ Predictions:', data.predictions.length);
  console.log('✅ Best day to buy:', data.insights.bestDayToBuy);
  console.log('✅ Potential savings:', data.insights.bestDayToBuy.savings);
})
.catch(err => console.error('❌ Error:', err));
```

---

## Mobile App Testing

### Build Mobile Apps

```bash
# 1. Export Next.js static build
npm run mobile:export

# 2. Copy to Capacitor www folder
npm run mobile:build

# 3. Sync with native projects
npx cap sync
```

### iOS Testing

```bash
# Open Xcode
npm run mobile:ios
```

**Test Checklist**:
- [ ] App launches without crashes
- [ ] Home page loads correctly
- [ ] Navigation works
- [ ] API calls work
- [ ] Push notification permission prompt appears
- [ ] Biometric auth works (Face ID/Touch ID)

### Android Testing

```bash
# Open Android Studio
npm run mobile:android
```

---

## Web App Testing

### Development Server

```bash
# Start dev server
npm run dev

# Open browser at http://localhost:3000
```

### Test Progressive Web App (PWA)

**Chrome DevTools**:
1. Open DevTools (F12)
2. Go to **Application** tab
3. Check **Service Workers** are registered

---

## Push Notifications

### Test Registration Endpoint

```bash
curl -X POST http://localhost:3000/api/push/register \
  -H "Content-Type: application/json" \
  -d '{
    "token": "test-push-token-12345",
    "platform": "ios"
  }'
```

---

## Performance Testing

### Lighthouse Audit

Target Scores:
- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 90+
- PWA: 100

---

## Production Deployment Testing

### Test Deployed API

```bash
# Test production endpoint
curl https://fly2any-fresh.vercel.app/api/ai/predict-prices
```

---

*Testing Guide Version: 1.0*
*Last Updated: 2025-11-13*
