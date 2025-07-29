/**
 * Hotel Currencies API Endpoint
 * GET /api/hotels/currencies
 * 
 * Returns supported currencies based on LiteAPI structure
 */

import { NextRequest, NextResponse } from 'next/server';

// Currencies based on LiteAPI structure
const currencies = [
  {
    code: 'BRL',
    name: 'Brazilian Real',
    symbol: 'R$',
    countries: ['BR'],
    exchangeRate: 1.0, // Base currency
    popular: true
  },
  {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    countries: ['US'],
    exchangeRate: 0.20,
    popular: true
  },
  {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    countries: ['FR', 'IT', 'ES', 'DE'],
    exchangeRate: 0.18,
    popular: true
  },
  {
    code: 'GBP',
    name: 'British Pound',
    symbol: '£', 
    countries: ['GB'],
    exchangeRate: 0.16,
    popular: true
  },
  {
    code: 'JPY',
    name: 'Japanese Yen',
    symbol: '¥',
    countries: ['JP'],
    exchangeRate: 29.50,
    popular: true
  },
  {
    code: 'AUD',
    name: 'Australian Dollar',
    symbol: 'A$',
    countries: ['AU'],
    exchangeRate: 0.31,
    popular: true
  },
  {
    code: 'CAD',
    name: 'Canadian Dollar',
    symbol: 'C$',
    countries: ['CA'], 
    exchangeRate: 0.27,
    popular: false
  },
  {
    code: 'CHF',
    name: 'Swiss Franc',
    symbol: 'CHF',
    countries: ['CH'],
    exchangeRate: 0.18,
    popular: false
  },
  {
    code: 'CNY',
    name: 'Chinese Yuan',
    symbol: '¥',
    countries: ['CN'],
    exchangeRate: 1.45,
    popular: false
  },
  {
    code: 'MXN',
    name: 'Mexican Peso',
    symbol: '$',
    countries: ['MX'],
    exchangeRate: 3.60,
    popular: false
  },
  {
    code: 'ARS',
    name: 'Argentine Peso',
    symbol: '$',
    countries: ['AR'],
    exchangeRate: 350.00,
    popular: false
  },
  {
    code: 'CLP',
    name: 'Chilean Peso',
    symbol: '$',
    countries: ['CL'],
    exchangeRate: 190.00,
    popular: false
  }
];

/**
 * Convert amount between currencies
 */
function convertCurrency(amount: number, fromCurrency: string, toCurrency: string): number {
  const fromRate = currencies.find(c => c.code === fromCurrency)?.exchangeRate || 1;
  const toRate = currencies.find(c => c.code === toCurrency)?.exchangeRate || 1;
  
  // Convert to BRL first, then to target currency
  const brlAmount = amount / fromRate;
  return brlAmount * toRate;
}

/**
 * GET /api/hotels/currencies
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const url = new URL(request.url);
    const popular = url.searchParams.get('popular') === 'true';
    const country = url.searchParams.get('country');
    const convert = url.searchParams.get('convert');
    const amount = parseFloat(url.searchParams.get('amount') || '0');
    const from = url.searchParams.get('from') || 'BRL';
    const to = url.searchParams.get('to') || 'USD';
    
    let filteredCurrencies = currencies;
    
    // Filter by popularity
    if (popular) {
      filteredCurrencies = currencies.filter(currency => currency.popular);
    }
    
    // Filter by country
    if (country) {
      filteredCurrencies = currencies.filter(currency => 
        currency.countries.includes(country.toUpperCase())
      );
    }
    
    let conversionResult = null;
    
    // Handle currency conversion
    if (convert === 'true' && amount > 0) {
      const convertedAmount = convertCurrency(amount, from, to);
      const fromCurrency = currencies.find(c => c.code === from);
      const toCurrency = currencies.find(c => c.code === to);
      
      conversionResult = {
        originalAmount: amount,
        convertedAmount: Math.round(convertedAmount * 100) / 100,
        fromCurrency: fromCurrency ? {
          code: fromCurrency.code,
          name: fromCurrency.name,
          symbol: fromCurrency.symbol
        } : null,
        toCurrency: toCurrency ? {
          code: toCurrency.code,
          name: toCurrency.name,
          symbol: toCurrency.symbol
        } : null,
        exchangeRate: toCurrency && fromCurrency ? 
          Math.round((toCurrency.exchangeRate / fromCurrency.exchangeRate) * 10000) / 10000 : null
      };
    }

    return NextResponse.json({
      status: 'success',
      data: {
        currencies: filteredCurrencies,
        totalCount: filteredCurrencies.length,
        conversion: conversionResult,
        baseCurrency: 'BRL'
      },
      metadata: {
        timestamp: new Date().toISOString(),
        source: 'LiteAPI-compatible',
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Currencies API error:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Failed to fetch currencies',
      data: null
    }, { status: 500 });
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';