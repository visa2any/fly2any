# 🚀 Travel Agent Program - Quick Start Guide

## ✅ What's Already Done

**Foundation (40% Complete):**

### 1. Database Schema ✅ 100%
- 11 new models created
- Prisma client generated
- All relations configured
- Ready for use

### 2. Core APIs ✅ 40%
- ✅ Agent registration
- ✅ Agent profile (get/update)
- ✅ Agent dashboard with full stats
- ✅ Client list & create
- ✅ Quote list & create

**Files Created:**
```
✅ prisma/schema.prisma (updated)
✅ app/api/agents/register/route.ts
✅ app/api/agents/me/route.ts
✅ app/api/agents/me/dashboard/route.ts
✅ app/api/agents/clients/route.ts
✅ app/api/agents/quotes/route.ts
✅ TRAVEL_AGENT_IMPLEMENTATION.md (full guide)
✅ AGENT_PROGRAM_QUICKSTART.md (this file)
```

---

## 🎯 Next Steps - Choose Your Path

### Path A: Complete APIs First (Recommended)
**Best for:** Ensuring solid backend before UI work

**Steps:**
1. Complete Client APIs (4-6 hours)
2. Complete Quote APIs (6-8 hours)
3. Build Booking & Commission APIs (8-10 hours)
4. Then start UI

### Path B: Build UI with Existing APIs
**Best for:** Seeing results quickly

**Steps:**
1. Build agent dashboard UI (use existing dashboard API)
2. Build client list UI (use existing client APIs)
3. Build basic quote builder (use existing quote create API)
4. Add remaining APIs as needed

---

## 🏗️ How to Continue (Step-by-Step)

### Step 1: Set Up Development Environment

```bash
# 1. Make sure database is migrated
npx prisma db push

# 2. Start development server
npm run dev

# 3. Test existing APIs
# Try: http://localhost:3000/api/agents/register
```

### Step 2: Test Existing APIs

Use this test file to verify everything works:

```typescript
// test-agent-apis.ts
async function testAgentAPIs() {
  const baseUrl = 'http://localhost:3000';

  // 1. Register as agent (requires authenticated user)
  const registerResponse = await fetch(`${baseUrl}/api/agents/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      agencyName: 'Test Travel Agency',
      website: 'https://testagency.com',
      phoneNumber: '+1-555-0100',
    }),
  });

  console.log('Register:', await registerResponse.json());

  // 2. Get agent profile
  const profileResponse = await fetch(`${baseUrl}/api/agents/me`);
  console.log('Profile:', await profileResponse.json());

  // 3. Get dashboard
  const dashboardResponse = await fetch(`${baseUrl}/api/agents/me/dashboard`);
  console.log('Dashboard:', await dashboardResponse.json());

  // 4. Create client
  const clientResponse = await fetch(`${baseUrl}/api/agents/clients`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      firstName: 'John',
      lastName: 'Smith',
      email: 'john@example.com',
      phone: '+1-555-0123',
      segment: 'STANDARD',
    }),
  });

  console.log('Client:', await clientResponse.json());
}
```

### Step 3: Choose Next Feature to Build

**Option A - Complete Quote APIs (Recommended First)**

Create these files:

```bash
# 1. Quote Detail
app/api/agents/quotes/[id]/route.ts

# 2. Send Quote
app/api/agents/quotes/[id]/send/route.ts

# 3. Accept/Decline
app/api/agents/quotes/[id]/accept/route.ts
app/api/agents/quotes/[id]/decline/route.ts
```

**Option B - Build Agent Dashboard UI**

Create these files:

```bash
# 1. Agent layout
app/agent/layout.tsx

# 2. Dashboard page
app/agent/dashboard/page.tsx

# 3. Dashboard components
components/agent/dashboard/StatsCards.tsx
components/agent/dashboard/QuickActions.tsx
components/agent/dashboard/RecentActivity.tsx
```

**Option C - Build Quote Builder UI (The Killer Feature!)**

Create these files:

```bash
# 1. Quote builder page
app/agent/quotes/new/page.tsx

# 2. Quote builder component
components/agent/quotes/QuoteBuilder.tsx

# 3. Sub-components
components/agent/quotes/FlightSearchWidget.tsx
components/agent/quotes/HotelSearchWidget.tsx
components/agent/quotes/QuoteComponents.tsx
components/agent/quotes/QuotePricing.tsx
```

---

## 📝 Implementation Templates

### Template 1: Complete Quote Detail API

```typescript
// app/api/agents/quotes/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const agent = await prisma.travelAgent.findUnique({
      where: { userId: session.user.id },
    });

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const quote = await prisma.agentQuote.findUnique({
      where: { id: params.id },
      include: {
        client: true,
      },
    });

    if (!quote || quote.agentId !== agent.id) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    return NextResponse.json({ quote });
  } catch (error) {
    console.error("[QUOTE_GET_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Add PATCH for update and DELETE for delete
```

### Template 2: Agent Dashboard Page

```typescript
// app/agent/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AgentDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      fetchDashboard();
    }
  }, [status]);

  const fetchDashboard = async () => {
    try {
      const response = await fetch('/api/agents/me/dashboard');
      const data = await response.json();
      setDashboard(data);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!dashboard) {
    return <div>No data available</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Quotes This Month"
          value={dashboard.thisMonth.quotes.sent}
          change={`${dashboard.thisMonth.quotes.conversionRate}% conversion`}
        />
        <StatsCard
          title="Bookings This Month"
          value={dashboard.thisMonth.bookings.total}
          change={`${dashboard.thisMonth.bookings.growth}% growth`}
        />
        <StatsCard
          title="Revenue This Month"
          value={`$${dashboard.thisMonth.revenue.toLocaleString()}`}
          change={`$${dashboard.thisMonth.commissions.earned.toLocaleString()} commissions`}
        />
        <StatsCard
          title="Available Balance"
          value={`$${dashboard.financial.available.toLocaleString()}`}
          change={`$${dashboard.financial.pending.toLocaleString()} pending`}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <QuickAction
          title="Create Quote"
          icon="📝"
          onClick={() => router.push('/agent/quotes/new')}
        />
        <QuickAction
          title="Add Client"
          icon="👥"
          onClick={() => router.push('/agent/clients/new')}
        />
        <QuickAction
          title="Request Payout"
          icon="💰"
          onClick={() => router.push('/agent/payouts')}
          disabled={!dashboard.financial.canRequestPayout}
        />
      </div>

      {/* Upcoming Trips & Expiring Quotes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UpcomingTrips trips={dashboard.actionItems.upcomingTrips} />
        <ExpiringQuotes quotes={dashboard.actionItems.quotesExpiringSoon} />
      </div>
    </div>
  );
}

function StatsCard({ title, value, change }: any) {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="text-sm text-gray-600">{title}</div>
      <div className="text-2xl font-bold mt-2">{value}</div>
      <div className="text-xs text-gray-500 mt-1">{change}</div>
    </div>
  );
}

function QuickAction({ title, icon, onClick, disabled }: any) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white p-4 rounded-lg shadow flex items-center justify-center gap-2"
    >
      <span className="text-2xl">{icon}</span>
      <span className="font-semibold">{title}</span>
    </button>
  );
}
```

### Template 3: Quote Builder Component

```typescript
// components/agent/quotes/QuoteBuilder.tsx
'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface QuoteBuilderProps {
  clientId: string;
}

export function QuoteBuilder({ clientId }: QuoteBuilderProps) {
  const [quote, setQuote] = useState({
    flights: [],
    hotels: [],
    activities: [],
    transfers: [],
    carRentals: [],
    insurance: null,
    customItems: [],
  });

  const addFlight = (flight: any) => {
    setQuote(prev => ({
      ...prev,
      flights: [...prev.flights, flight],
    }));
  };

  const addHotel = (hotel: any) => {
    setQuote(prev => ({
      ...prev,
      hotels: [...prev.hotels, hotel],
    }));
  };

  const calculateTotal = () => {
    // Calculate subtotal, markup, total
    // Return pricing breakdown
  };

  const saveQuote = async () => {
    // POST to /api/agents/quotes
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Side: Add Components */}
      <div className="lg:col-span-2">
        <Tabs defaultValue="flights">
          <TabsList>
            <TabsTrigger value="flights">Flights</TabsTrigger>
            <TabsTrigger value="hotels">Hotels</TabsTrigger>
            <TabsTrigger value="activities">Activities</TabsTrigger>
            <TabsTrigger value="transfers">Transfers</TabsTrigger>
            <TabsTrigger value="cars">Cars</TabsTrigger>
            <TabsTrigger value="insurance">Insurance</TabsTrigger>
            <TabsTrigger value="custom">Custom</TabsTrigger>
          </TabsList>

          <TabsContent value="flights">
            <FlightSearchWidget onAdd={addFlight} />
          </TabsContent>

          <TabsContent value="hotels">
            <HotelSearchWidget onAdd={addHotel} />
          </TabsContent>

          {/* Other tabs... */}
        </Tabs>
      </div>

      {/* Right Side: Quote Summary */}
      <div className="lg:col-span-1">
        <div className="bg-white p-6 rounded-lg shadow sticky top-6">
          <h3 className="text-lg font-bold mb-4">Quote Summary</h3>

          {/* Components List */}
          <QuoteComponents quote={quote} />

          {/* Pricing */}
          <QuotePricing quote={quote} />

          {/* Actions */}
          <div className="mt-6 space-y-2">
            <button
              onClick={saveQuote}
              className="w-full bg-blue-500 text-white py-2 rounded"
            >
              Save Draft
            </button>
            <button className="w-full bg-green-500 text-white py-2 rounded">
              Preview & Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## 🎯 Recommended Implementation Order

### Week 1: Complete APIs
- [ ] Complete Client APIs (detail, update, delete, notes)
- [ ] Complete Quote APIs (detail, update, send, accept/decline)
- [ ] Add Booking creation from quote API

### Week 2: Build Agent Portal
- [ ] Agent layout with sidebar
- [ ] Dashboard page (using existing API)
- [ ] Client list page
- [ ] Client detail page

### Week 3: Build Quote Builder
- [ ] Quote builder page structure
- [ ] Flight search widget (reuse existing)
- [ ] Hotel search widget (reuse existing)
- [ ] Manual entry forms (activities, transfers, etc.)
- [ ] Quote summary and pricing

### Week 4: Client Portal & Polish
- [ ] Client-facing quote view
- [ ] Email notifications
- [ ] PDF generation
- [ ] Testing and polish

---

## 📞 Need Help?

**Documentation:**
- Full Implementation Guide: `TRAVEL_AGENT_IMPLEMENTATION.md`
- This Quick Start: `AGENT_PROGRAM_QUICKSTART.md`

**Key Files:**
- Database Schema: `prisma/schema.prisma`
- Existing APIs: `app/api/agents/`

**Next Steps:**
1. Review the full implementation guide
2. Choose your path (APIs first or UI first)
3. Start with one feature
4. Test as you go
5. Iterate and improve

---

**Good luck building the best Travel Agent Platform ever! 🚀**
