import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format currency values with proper locale and currency symbols
 */
export function formatCurrency(
  amount: number, 
  currency: string = 'BRL', 
  locale: string = 'pt-BR'
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    // Fallback if currency/locale is not supported
    console.warn(`Failed to format currency ${currency} with locale ${locale}:`, error);
    
    // Simple fallback formatting
    const symbol = currency === 'BRL' ? 'R$' : 
                  currency === 'USD' ? '$' : 
                  currency === 'EUR' ? '€' : 
                  currency;
    
    return `${symbol} ${amount.toFixed(2).replace('.', ',')}`;
  }
}
