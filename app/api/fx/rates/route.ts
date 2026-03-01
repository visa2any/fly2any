// app/api/fx/rates/route.ts
// Live FX rates with 1-hour server-side cache — free tier, no auth required
import { NextResponse } from "next/server";

const CACHE_TTL = 60 * 60 * 1000; // 1 hour
let cachedRates: Record<string, number> | null = null;
let cacheTimestamp = 0;

// Reliable fallback (Dec 2024 approximate rates)
const FALLBACK_RATES: Record<string, number> = {
  USD: 1, EUR: 0.92, GBP: 0.79, CAD: 1.36, AUD: 1.53,
  MXN: 17.15, BRL: 4.97, JPY: 149.5, CHF: 0.88, INR: 83.1,
  NZD: 1.63, SGD: 1.34, HKD: 7.82, AED: 3.67, THB: 35.1,
  ILS: 3.71, COP: 3900, CLP: 870, ARS: 350, DKK: 6.88,
  NOK: 10.55, SEK: 10.42, PLN: 3.97, CZK: 22.6, ZAR: 18.7, TRY: 30.5,
};

export const dynamic = "force-dynamic";

export async function GET() {
  const now = Date.now();

  // Return cached if still fresh
  if (cachedRates && now - cacheTimestamp < CACHE_TTL) {
    return NextResponse.json({ rates: cachedRates, cached: true });
  }

  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", {
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error(`FX API ${res.status}`);
    const data = await res.json();
    if (data?.rates && typeof data.rates === "object") {
      cachedRates = data.rates;
      cacheTimestamp = now;
      return NextResponse.json({ rates: data.rates, cached: false });
    }
    throw new Error("Invalid response");
  } catch {
    // Return stale cache if available, otherwise fallback
    return NextResponse.json({
      rates: cachedRates ?? FALLBACK_RATES,
      cached: true,
      fallback: !cachedRates,
    });
  }
}
