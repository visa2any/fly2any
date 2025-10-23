/**
 * Currency API Endpoint
 *
 * GET /api/currency - Get current exchange rates
 * POST /api/currency/convert - Convert between currencies
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  fetchExchangeRates,
  convertCurrency,
  getCurrencyInfo,
  getSupportedCurrencies,
  getPopularCurrencies,
  formatCurrency,
  clearCurrencyCache,
} from '@/lib/services/currency';

// ===========================
// GET - Fetch Exchange Rates
// ===========================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const base = searchParams.get('base') || 'USD';
    const action = searchParams.get('action');

    // Handle different actions
    if (action === 'info') {
      const currencyCode = searchParams.get('currency');
      if (currencyCode) {
        const info = getCurrencyInfo(currencyCode);
        if (!info) {
          return NextResponse.json(
            { error: 'Currency not supported' },
            { status: 404 }
          );
        }
        return NextResponse.json({ currency: info });
      }
    }

    if (action === 'list') {
      const type = searchParams.get('type') || 'all';
      const currencies =
        type === 'popular' ? getPopularCurrencies() : getSupportedCurrencies();

      return NextResponse.json({
        currencies,
        total: currencies.length,
      });
    }

    if (action === 'clear-cache') {
      clearCurrencyCache();
      return NextResponse.json({
        success: true,
        message: 'Currency cache cleared',
      });
    }

    // Default: fetch exchange rates
    const rates = await fetchExchangeRates(base);

    return NextResponse.json({
      success: true,
      base: rates.base,
      date: rates.date,
      rates: rates.rates,
      cached: !!(rates.lastUpdated && Date.now() - rates.lastUpdated < 60 * 60 * 1000),
      timestamp: rates.lastUpdated,
    });
  } catch (error) {
    console.error('❌ Currency API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch exchange rates',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// ===========================
// POST - Convert Currency
// ===========================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, amount, from, to, format } = body;

    // Validate required fields for conversion
    if (action === 'convert') {
      if (!amount || !from || !to) {
        return NextResponse.json(
          {
            error: 'Missing required fields',
            required: ['amount', 'from', 'to'],
          },
          { status: 400 }
        );
      }

      // Validate amount
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount < 0) {
        return NextResponse.json(
          { error: 'Invalid amount. Must be a positive number.' },
          { status: 400 }
        );
      }

      // Validate currency codes
      const fromInfo = getCurrencyInfo(from);
      const toInfo = getCurrencyInfo(to);

      if (!fromInfo) {
        return NextResponse.json(
          { error: `Source currency "${from}" not supported` },
          { status: 400 }
        );
      }

      if (!toInfo) {
        return NextResponse.json(
          { error: `Target currency "${to}" not supported` },
          { status: 400 }
        );
      }

      // Perform conversion
      const convertedAmount = await convertCurrency(numAmount, from, to);

      // Get exchange rate
      const rates = await fetchExchangeRates(from);
      const rate = rates.rates[to] || 1;

      // Format result
      const formatted = format !== false ? formatCurrency(convertedAmount, to) : undefined;

      return NextResponse.json({
        success: true,
        conversion: {
          original: {
            amount: numAmount,
            currency: from,
            formatted: formatCurrency(numAmount, from),
          },
          converted: {
            amount: convertedAmount,
            currency: to,
            formatted,
          },
          rate,
          timestamp: Date.now(),
        },
      });
    }

    // Batch conversion
    if (action === 'batch') {
      const { conversions } = body;

      if (!Array.isArray(conversions)) {
        return NextResponse.json(
          { error: 'Conversions must be an array' },
          { status: 400 }
        );
      }

      const results = await Promise.all(
        conversions.map(async (conv: { amount: number; from: string; to: string }) => {
          try {
            const converted = await convertCurrency(conv.amount, conv.from, conv.to);
            return {
              success: true,
              original: conv.amount,
              from: conv.from,
              to: conv.to,
              result: converted,
              formatted: formatCurrency(converted, conv.to),
            };
          } catch (error) {
            return {
              success: false,
              error: error instanceof Error ? error.message : 'Conversion failed',
              original: conv.amount,
              from: conv.from,
              to: conv.to,
            };
          }
        })
      );

      return NextResponse.json({
        success: true,
        results,
        total: results.length,
        successful: results.filter((r) => r.success).length,
      });
    }

    return NextResponse.json(
      { error: 'Invalid action. Use "convert" or "batch"' },
      { status: 400 }
    );
  } catch (error) {
    console.error('❌ Currency conversion error:', error);
    return NextResponse.json(
      {
        error: 'Failed to convert currency',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// ===========================
// Example Usage
// ===========================

/*
GET Requests:
  - /api/currency?base=USD - Get all rates for USD
  - /api/currency?action=list&type=popular - List popular currencies
  - /api/currency?action=info&currency=EUR - Get info about EUR
  - /api/currency?action=clear-cache - Clear rate cache

POST Requests:
  - Convert single amount:
    {
      "action": "convert",
      "amount": 100,
      "from": "USD",
      "to": "EUR"
    }

  - Batch conversion:
    {
      "action": "batch",
      "conversions": [
        { "amount": 100, "from": "USD", "to": "EUR" },
        { "amount": 50, "from": "GBP", "to": "JPY" }
      ]
    }
*/
